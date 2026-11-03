import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ClinicalManagementStepSchema } from "@/lib/validations/disease";
import { attachInvestigationsToSteps, isInvestigationAction, matchInvestigation, toManagementSteps } from "@/lib/management-pathways";
import { ActionPathways } from "@/components/action-pathways";
import type { DiseaseDetail } from "@/lib/validations/disease";

const step = { id: "ecg", title: "Early assessment", timeframe: "First hour", actions: ["Record a 12-lead ECG", "Give oxygen only if saturation is below 94%"] };
const ecg = { tier: "firstLineImaging", testName: "12-lead ECG (electrocardiogram)", modalityTarget: "ECG", targetCondition: "ACS", expectedFinding: "ST change", clinicalRationale: "Detects ischaemia and conduction block.", normalValue: "QTc under 450 ms" };
const xray = { ...ecg, testName: "Chest X-ray", clinicalRationale: "Excludes pneumothorax." };
const content = { investigations: { ruleIn: [ecg, xray], ruleOut: [] }, clinicalManagement: [step] } as unknown as DiseaseDetail;

describe("management action details schema", () => {
  it("keeps legacy steps valid and accepts pathways", () => {
    expect(ClinicalManagementStepSchema.safeParse(step).success).toBe(true);
    const ok = ClinicalManagementStepSchema.safeParse({ ...step, actionDetails: [{ actionIndex: 0, pathways: [{ trigger: "Abnormal: long QT", response: "Urgent cardiovascular assessment within 24 hours", urgency: "urgent" }] }] });
    expect(ok.success).toBe(true);
  });
  it("rejects an index outside the actions and duplicate indexes", () => {
    expect(ClinicalManagementStepSchema.safeParse({ ...step, actionDetails: [{ actionIndex: 5, pathways: [] }] }).success).toBe(false);
    expect(ClinicalManagementStepSchema.safeParse({ ...step, actionDetails: [{ actionIndex: 0, pathways: [] }, { actionIndex: 0, pathways: [] }] }).success).toBe(false);
  });
});

describe("linking actions to investigations", () => {
  it("matches by test name and never confuses similar tests", () => {
    expect(matchInvestigation("Record a 12-lead ECG", [ecg, xray] as never)?.testName).toContain("ECG");
    expect(matchInvestigation("Request a chest X-ray", [ecg, xray] as never)?.testName).toBe("Chest X-ray");
    expect(matchInvestigation("Give oxygen only if saturation is below 94%", [ecg, xray] as never)).toBeNull();
  });
  it("copies existing text, invents no pathways, and is idempotent", () => {
    const once = attachInvestigationsToSteps(content);
    expect(once.report.actionsLinked).toBe(1);
    const detail = once.content.clinicalManagement[0].actionDetails?.[0];
    expect(detail).toMatchObject({ actionIndex: 0, rationale: ecg.clinicalRationale, expected: "QTc under 450 ms", origin: "auto-linked", pathways: [] });
    expect(once.content.clinicalManagement[0].actions).toEqual(step.actions);
    const twice = attachInvestigationsToSteps(once.content);
    expect(twice.report.actionsLinked).toBe(0);
    expect(twice.content).toEqual(once.content);
  });
});

describe("which actions are linked", () => {
  it("links test-ordering actions only", () => {
    expect(isInvestigationAction("Obtain a 12-lead ECG and a capillary glucose")).toBe(true);
    expect(isInvestigationAction("Record a 12-lead ECG")).toBe(true);
    expect(isInvestigationAction("Do not use a bladder scan alone to exclude the syndrome")).toBe(false);
    expect(isInvestigationAction("Stop it if it was given before imaging and monitor glucose")).toBe(false);
    expect(isInvestigationAction("Give [💊 Rasburicase | 0.2 mg/kg | IV | Once | 1 day] and check uric acid")).toBe(false);
  });
});

describe("view model and component", () => {
  it("merges the overlay onto the stored actions", () => {
    const [view] = toManagementSteps([{ ...step, actionDetails: [{ actionIndex: 1, pathways: [{ trigger: "t", response: "r" }] }] }] as never);
    expect(view.actions.map((a) => a.pathways.length)).toEqual([0, 1]);
    expect(view.actions[1].action).toBe(step.actions[1]);
  });
  it("renders trigger and response inline, with urgency as text, and nothing when empty", () => {
    const [view] = toManagementSteps([{ ...step, actionDetails: [{ actionIndex: 0, rationale: "Why text", pathways: [{ trigger: "Bundle branch block", response: "Urgent cardiovascular assessment", urgency: "urgent" }] }] }] as never);
    const html = renderToStaticMarkup(createElement(ActionPathways, { detail: view.actions[0] }));
    expect(html).toContain("Bundle branch block");
    expect(html).toContain("Urgent cardiovascular assessment");
    expect(html).toContain(">If<");
    expect(html).toContain(">Then<");
    expect(html).toContain(">Urgent<");
    expect(html).toContain("Why:");
    expect(renderToStaticMarkup(createElement(ActionPathways, { detail: view.actions[1] }))).toBe("");
  });
});
