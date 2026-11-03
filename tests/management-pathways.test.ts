import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ClinicalManagementStepSchema } from "@/lib/validations/disease";
import { investigationStepNumbers, toManagementSteps } from "@/lib/management-pathways";
import { ActionPathways } from "@/components/action-pathways";

const step = { id: "ecg", title: "Early assessment", timeframe: "First hour", actions: ["Record a 12-lead ECG", "Give oxygen only if saturation is below 94%"] };
const detail = { actionIndex: 0, investigationRefs: ["12-lead ECG"], pathways: [{ trigger: "Abnormal: long QT", response: "Urgent cardiovascular assessment within 24 hours", urgency: "urgent" as const }] };

describe("management action details schema", () => {
  it("keeps legacy steps valid and accepts pathways", () => {
    expect(ClinicalManagementStepSchema.safeParse(step).success).toBe(true);
    expect(ClinicalManagementStepSchema.safeParse({ ...step, actionDetails: [detail] }).success).toBe(true);
  });
  it("rejects an index outside the actions, duplicates and empty pathway lists", () => {
    expect(ClinicalManagementStepSchema.safeParse({ ...step, actionDetails: [{ ...detail, actionIndex: 5 }] }).success).toBe(false);
    expect(ClinicalManagementStepSchema.safeParse({ ...step, actionDetails: [detail, detail] }).success).toBe(false);
    expect(ClinicalManagementStepSchema.safeParse({ ...step, actionDetails: [{ actionIndex: 0, pathways: [] }] }).success).toBe(false);
  });
});

describe("view model", () => {
  it("merges the overlay onto the stored actions without changing their text", () => {
    const [view] = toManagementSteps([{ ...step, actionDetails: [{ actionIndex: 1, pathways: [{ trigger: "t", response: "r" }] }] }]);
    expect(view.actions.map((a) => a.pathways.length)).toEqual([0, 1]);
    expect(view.actions.map((a) => a.action)).toEqual(step.actions);
  });
  it("maps tests to the 1-based steps that use them", () => {
    const map = investigationStepNumbers([{ ...step, id: "a", actionDetails: [detail] }, { ...step, id: "b", actionDetails: [{ actionIndex: 1, investigationRefs: ["12-lead ECG"], pathways: [{ trigger: "t", response: "r" }] }] }]);
    expect(map.get("12-lead ECG")).toEqual([1, 2]);
  });
});

describe("ActionPathways component", () => {
  it("renders trigger and response inline, urgency as text; nothing when empty", () => {
    const [view] = toManagementSteps([{ ...step, actionDetails: [detail] }]);
    const html = renderToStaticMarkup(createElement(ActionPathways, { detail: view.actions[0] }));
    for (const text of ["Abnormal: long QT", "Urgent cardiovascular assessment", ">If<", ">Then<", ">Urgent<"]) expect(html).toContain(text);
    expect(html).not.toContain("Why:");
    expect(renderToStaticMarkup(createElement(ActionPathways, { detail: view.actions[1] }))).toBe("");
  });
});
