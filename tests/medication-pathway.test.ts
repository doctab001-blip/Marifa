import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import acs from "../data/emergency-versions/acs.emergency-2026-10-12-v3.json";
import heartFailure from "../data/emergency-versions/heart-failure.emergency-2026-10-12-v1.json";
import { auditTopicContent, meetsDirectoryThreshold } from "@/lib/clinical-authoring-audit";
import { groupMedicationPlan, isBranchedMedicationPlan, medicationPathwayIssues, type MedicationPlan, type MedicationRegimen } from "@/lib/medication-pathway";
import { parsePastedTopic } from "@/lib/topic-paste";
import { buildGeminiPrompt, PASTE_FORMAT } from "@/lib/topic-paste-prompt";
import { DiseaseDetailSchema } from "@/lib/validations/disease";

const source = { sourceTitle: "Saudi MOH ACS protocol", sourceUrl: "https://example.org/acs", sourceEdition: "Table 3" };
function drug(genericName: string, extra: Partial<MedicationRegimen> = {}): MedicationRegimen {
  return { indication: "ACS", patientGroup: "Adults", genericName, dose: "1 dose", route: "PO", frequency: "Daily", duration: "Long term", adjustments: ["Check renal function"], monitoring: ["Bleeding"], contraindications: ["Active bleeding"], ...source, ...extra };
}
const plan = (regimens: MedicationRegimen[], branches?: MedicationPlan["branches"]): MedicationPlan => ({ status: "source-verified", regimens, ...(branches ? { branches } : {}), note: "Check hospital formulary." });
const rules = (value: MedicationPlan) => medicationPathwayIssues(value).filter((issue) => issue.severity === "error").map((issue) => issue.rule);

const stemi = { label: "STEMI — primary PCI", entryCriteria: "Persistent ST elevation and symptoms under 12 hours" };
const nstemi = { label: "NSTEMI — early invasive", entryCriteria: "No persistent ST elevation, troponin raised" };
const branched = plan([
  drug("Aspirin", { branch: stemi.label, step: "Antiplatelet loading", selection: "all" }),
  drug("Ticagrelor", { branch: stemi.label, step: "P2Y12 inhibitor", selection: "one-of", preferred: true }),
  drug("Clopidogrel", { branch: stemi.label, step: "P2Y12 inhibitor", selection: "one-of", preferred: false, useWhen: "Ticagrelor contraindicated or patient on an oral anticoagulant" }),
  drug("Unfractionated heparin", { branch: stemi.label, step: "Anticoagulant", selection: "one-of", preferred: true }),
  drug("Enoxaparin", { branch: stemi.label, step: "Anticoagulant", selection: "one-of", preferred: false, useWhen: "Unfractionated heparin unavailable" }),
  drug("Aspirin", { branch: nstemi.label, step: "Antiplatelet loading", selection: "all" }),
  drug("Fondaparinux", { branch: nstemi.label, step: "Anticoagulant", selection: "one-of", preferred: true }),
  drug("Enoxaparin", { branch: nstemi.label, step: "Anticoagulant", selection: "one-of", preferred: false, useWhen: "Creatinine clearance above 30 mL/min and fondaparinux unavailable" }),
], [stemi, nstemi]);

describe("medicine pathway rules", () => {
  it("accepts a plan that separates STEMI and NSTEMI and offers one preferred drug per step", () => {
    expect(medicationPathwayIssues(branched)).toEqual([]);
    expect(isBranchedMedicationPlan(branched)).toBe(true);
  });

  it("groups a branched plan by branch and step with the preferred option first", () => {
    const view = groupMedicationPlan(branched);
    expect(view.map((branch) => branch.label)).toEqual([stemi.label, nstemi.label]);
    const p2y12 = view[0].steps.find((step) => step.step === "P2Y12 inhibitor")!;
    expect(p2y12.selection).toBe("one-of");
    expect(p2y12.options.map((option) => option.genericName)).toEqual(["Ticagrelor", "Clopidogrel"]);
  });

  it("rejects the flat list that prints every antiplatelet and anticoagulant together", () => {
    const flat = plan([drug("Aspirin"), drug("Ticagrelor"), drug("Clopidogrel"), drug("Unfractionated heparin"), drug("Enoxaparin")]);
    const found = rules(flat);
    expect(found).toContain("unbranched");
    expect(found).toContain("exclusive-class");
  });

  it("rejects two P2Y12 inhibitors that are both marked as given", () => {
    const bad = plan([
      drug("Aspirin", { branch: stemi.label, step: "Antiplatelet", selection: "all" }),
      drug("Ticagrelor", { branch: stemi.label, step: "P2Y12 inhibitor", selection: "all" }),
      drug("Clopidogrel", { branch: stemi.label, step: "P2Y12 inhibitor", selection: "all" }),
    ], [stemi]);
    expect(rules(bad)).toContain("exclusive-class");
  });

  it("requires exactly one preferred option and at least two options in a one-of step", () => {
    const noPreferred = plan([
      drug("Ticagrelor", { branch: stemi.label, step: "P2Y12 inhibitor", selection: "one-of", preferred: false, useWhen: "x" }),
      drug("Clopidogrel", { branch: stemi.label, step: "P2Y12 inhibitor", selection: "one-of", preferred: false, useWhen: "y" }),
    ], [stemi]);
    expect(rules(noPreferred)).toContain("one-of-preferred");
    const single = plan([
      drug("Aspirin", { branch: stemi.label, step: "Antiplatelet", selection: "all" }),
      drug("Ticagrelor", { branch: stemi.label, step: "P2Y12 inhibitor", selection: "one-of", preferred: true }),
    ], [stemi]);
    expect(rules(single)).toContain("one-of-size");
  });

  it("flags an alternative that is hidden inside one row or described only in the indication", () => {
    const inline = plan([
      drug("Flucloxacillin or cloxacillin", { branch: stemi.label, step: "Antibiotic", selection: "all" }),
      drug("Paracetamol", { branch: stemi.label, step: "Analgesia", selection: "all" }),
    ], [stemi]);
    expect(rules(inline)).toContain("embedded-alternative");
    const worded = plan([
      drug("Aspirin", { branch: stemi.label, step: "Antiplatelet", selection: "all" }),
      drug("Clopidogrel", { branch: stemi.label, step: "P2Y12 inhibitor", selection: "all", indication: "P2Y12 inhibitor (alternative)" }),
    ], [stemi]);
    expect(rules(worded)).toContain("embedded-alternative");
  });

  it("requires every branch to be declared with entry criteria", () => {
    const undeclared = plan([
      drug("Aspirin", { branch: stemi.label, step: "Antiplatelet", selection: "all" }),
      drug("Ticagrelor", { branch: stemi.label, step: "P2Y12 inhibitor", selection: "all" }),
    ]);
    expect(rules(undeclared)).toContain("branch-list");
  });

  it("warns, but does not fail, when an alternative has no use-when condition", () => {
    const missing = structuredClone(branched);
    delete missing.regimens[2].useWhen;
    const issues = medicationPathwayIssues(missing);
    expect(issues.filter((issue) => issue.severity === "error")).toEqual([]);
    expect(issues.some((issue) => issue.rule === "use-when")).toBe(true);
  });

  it("ignores plans that say no drug is indicated and single-drug plans", () => {
    expect(medicationPathwayIssues({ status: "no-drug-indicated", regimens: [], note: "None." })).toEqual([]);
    expect(rules(plan([drug("Paracetamol")]))).toEqual([]);
  });
});

describe("authoring audit and publication gate", () => {
  it("holds back the existing flat ACS topic from automatic publication but keeps it visible in the live directory", () => {
    const audit = auditTopicContent(acs);
    expect(audit.pathwayCompliant).toBe(false);
    expect(audit.publishable).toBe(false);
    expect(audit.failures.some((failure) => failure.startsWith("Medicine pathway:"))).toBe(true);
    expect(meetsDirectoryThreshold(acs)).toBe(auditTopicContent(acs, { pathwayScored: false }).score >= 80);
  });

  it("does not penalise a topic whose medicine plan is a single regimen", () => {
    expect(auditTopicContent(heartFailure, { pathwayScored: false }).pathwayCompliant).toBe(auditTopicContent(heartFailure).pathwayCompliant);
  });

  it("lets a branched replacement publish", () => {
    const parsed = DiseaseDetailSchema.parse({ ...(acs as object), medicationPlan: branched });
    const audit = auditTopicContent(parsed);
    expect(audit.pathwayCompliant).toBe(true);
    expect(audit.failures.filter((failure) => failure.startsWith("Medicine pathway:"))).toEqual([]);
  });
});

describe("paste editor", () => {
  const sample = readFileSync("tests/fixtures/gemini-paste-sample.md", "utf8");
  const base = DiseaseDetailSchema.parse({ ...(acs as object), granularPathway: undefined, guidelineComparison: undefined });
  const branchedMedicines = `### Medicines
#### Branch: STEMI — primary PCI | Entry: Persistent ST elevation with symptoms under 12 hours
| Step | Choice | Drug | Indication | Patient group | Dose | Route | Frequency | Duration / maximum | Adjustments | Monitoring | Contraindications / cautions | Use when | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Antiplatelet loading | All | Aspirin | Platelet inhibition | Adults | 300 mg | PO | Once | Single loading dose | Check hospital formulary | Bleeding | Active bleeding | – | [1] Table 4 |
| P2Y12 inhibitor | Preferred | Ticagrelor | Platelet inhibition | Adults | 180 mg | PO | Once | Load | Check hospital formulary | Bleeding | Prior intracranial haemorrhage | – | [1] Table 4 |
| P2Y12 inhibitor | Alternative | Clopidogrel | Platelet inhibition | Adults | 600 mg | PO | Once | Load | Check hospital formulary | Bleeding | Active bleeding | Ticagrelor contraindicated or on oral anticoagulant | [1] Table 4 |
#### Branch: NSTEMI — early invasive | Entry: No persistent ST elevation with raised troponin
| Step | Choice | Drug | Indication | Patient group | Dose | Route | Frequency | Duration / maximum | Adjustments | Monitoring | Contraindications / cautions | Use when | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Antiplatelet loading | All | Aspirin | Platelet inhibition | Adults | 300 mg | PO | Once | Single loading dose | Check hospital formulary | Bleeding | Active bleeding | – | [1] Table 4 |
`;
  const withBranches = sample.replace(/### Medicines[\s\S]*?(?=### Discharge criteria)/, `${branchedMedicines}\n`);

  it("reads Branch headings, Step, Choice and Use-when columns into a branched plan", () => {
    const result = parsePastedTopic(withBranches, base, { today: "2026-10-18" });
    const medicationPlan = result.content?.medicationPlan;
    expect(medicationPlan?.branches?.map((branch) => branch.label)).toEqual(["STEMI — primary PCI", "NSTEMI — early invasive"]);
    expect(medicationPlan?.regimens).toHaveLength(4);
    expect(medicationPlan?.regimens[1]).toMatchObject({ genericName: "Ticagrelor", branch: "STEMI — primary PCI", step: "P2Y12 inhibitor", selection: "one-of", preferred: true });
    expect(medicationPlan?.regimens[2]).toMatchObject({ genericName: "Clopidogrel", selection: "one-of", preferred: false, useWhen: "Ticagrelor contraindicated or on oral anticoagulant" });
    expect(result.audit?.pathwayCompliant).toBe(true);
  });

  it("reports a branch heading without entry criteria", () => {
    const result = parsePastedTopic(withBranches.replace("| Entry: Persistent ST elevation with symptoms under 12 hours", ""), base, { today: "2026-10-18" });
    expect(result.issues.some((issue) => issue.level === "error" && issue.message.includes("entry criteria"))).toBe(true);
  });

  it("tells Gemini to write medicines as a branched pathway", () => {
    expect(PASTE_FORMAT).toContain("#### Branch:");
    expect(PASTE_FORMAT).toContain("| Step | Choice | Drug |");
    const prompt = buildGeminiPrompt({ title: "Acute Coronary Syndrome", specialty: "Cardiology", pillar: "Urgent Care" });
    expect(prompt).toContain("Medicine pathway (mandatory)");
    expect(prompt).toContain("STEMI and NSTEMI are separate branches");
  });
});
