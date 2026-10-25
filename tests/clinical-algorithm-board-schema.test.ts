import { describe, expect, it } from "vitest";
import { BoardQuestionSchema, ClinicalAlgorithmSchema } from "@/lib/validations/disease";
import { auditTopicDepth } from "@/lib/clinical-depth-standard";

const source = { title: "Guideline", edition: "2026", url: "https://example.org/guideline", locator: "section 2" };
const algorithm = {
  id: "triage", title: "Triage", placement: "manage", source,
  nodes: [
    { id: "start", kind: "start", text: "Patient arrives", next: [{ to: "shock" }] },
    { id: "shock", kind: "decision", text: "Shock?", next: [{ to: "resus", label: "Yes" }, { to: "ward", label: "No" }] },
    { id: "resus", kind: "outcome", text: "Resuscitate" },
    { id: "ward", kind: "outcome", text: "Ward care" },
  ],
};
const question = {
  id: "q1", fictitious: true, vignette: "A 54-year-old man presents with fever.", question: "What is the next step?",
  options: ["A", "B", "C", "D"].map((id) => ({ id, text: `Option ${id}`, explanation: `Explanation ${id}` })),
  answer: "B", educationalObjective: "Choose the next step.", keyPoint: "Key point.",
};

describe("ClinicalAlgorithmSchema", () => {
  it("accepts a tree flowchart with labelled decision branches", () => {
    expect(ClinicalAlgorithmSchema.parse(algorithm).nodes).toHaveLength(4);
  });
  it("rejects unknown targets, joined branches, unlabelled decisions and dead ends", () => {
    expect(() => ClinicalAlgorithmSchema.parse({ ...algorithm, nodes: algorithm.nodes.map((n) => n.id === "shock" ? { ...n, next: [{ to: "resus", label: "Yes" }, { to: "missing", label: "No" }] } : n) })).toThrow(/Unknown node/);
    expect(() => ClinicalAlgorithmSchema.parse({ ...algorithm, nodes: algorithm.nodes.map((n) => n.id === "shock" ? { ...n, next: [{ to: "resus", label: "Yes" }, { to: "resus", label: "No" }] } : n) })).toThrow(/exactly one parent/);
    expect(() => ClinicalAlgorithmSchema.parse({ ...algorithm, nodes: algorithm.nodes.map((n) => n.id === "shock" ? { ...n, next: [{ to: "resus" }, { to: "ward", label: "No" }] } : n) })).toThrow(/label/);
    expect(() => ClinicalAlgorithmSchema.parse({ ...algorithm, nodes: algorithm.nodes.map((n) => n.id === "resus" ? { ...n, kind: "action" } : n) })).toThrow(/Only outcome/);
  });
});

describe("BoardQuestionSchema", () => {
  it("accepts a single-best-answer question with an explanation for every option", () => {
    expect(BoardQuestionSchema.parse(question).answer).toBe("B");
  });
  it("rejects a missing answer, unordered letters, too few options and non-fictitious cases", () => {
    expect(() => BoardQuestionSchema.parse({ ...question, answer: "E" })).toThrow();
    expect(() => BoardQuestionSchema.parse({ ...question, options: [...question.options].reverse() })).toThrow();
    expect(() => BoardQuestionSchema.parse({ ...question, options: question.options.slice(0, 3) })).toThrow();
    expect(() => BoardQuestionSchema.parse({ ...question, fictitious: false })).toThrow();
  });
});

describe("auditTopicDepth", () => {
  it("fails a schema-valid but thin topic and names the gaps", () => {
    const thin = {
      id: "11111111-1111-4111-8111-111111111111", title: "Thin", specialty: "Medicine", authority: "Other", status: "draft", version: "1", lastReviewed: "2026-10-25", pillar: "Urgent Care",
      pathophysiology: { summary: "Short.", keyMechanisms: ["One"] },
      presentation: { symptoms: ["A"], physicalSigns: ["B"], redFlags: ["C"] },
      differentials: [{ condition: "X", distinguishingFeatures: "Y" }],
      investigations: { ruleIn: [{ tier: "laboratory", testName: "T", modalityTarget: "M", targetCondition: "C", expectedFinding: "F", clinicalRationale: "R" }], ruleOut: [{ tier: "laboratory", testName: "T2", modalityTarget: "M", targetCondition: "C", expectedFinding: "F", clinicalRationale: "R" }] },
      clinicalManagement: [{ id: "a", title: "A", timeframe: "Now", actions: ["Act"] }],
      medicationPlan: { status: "source-verified", note: "n", regimens: [{ indication: "i", patientGroup: "Adults", genericName: "Drug", dose: "Dose per local protocol", route: "Oral", frequency: "Daily", duration: "7 days", adjustments: ["CKD: none"], monitoring: ["m"], sourceTitle: "s", sourceUrl: "https://example.org", sourceEdition: "section 1" }] },
      nonClinicalManagement: { patientEducation: ["e"], lifestyleAndDiet: ["l"], mdtReferrals: ["r"], dischargeCriteria: ["d"], followUpPlan: "f" },
      evidenceAudit: { checkedOn: "2026-10-25", status: "incomplete", scope: "s", findings: ["f"], unverifiedSections: ["Clomipramine doses are not given in the STW and are not included."], medscapeStatus: "unavailable", originalVersionIds: ["11111111-1111-4111-8111-111111111111"] },
    };
    const result = auditTopicDepth(thin);
    expect(result.passed).toBe(false);
    const joined = result.failures.join("\n");
    expect(joined).toMatch(/algorithm/);
    expect(joined).toMatch(/board-style/);
    expect(joined).toMatch(/defers its dose/);
    expect(joined).toMatch(/Paediatric:/);
    expect(joined).toMatch(/without a dose/);
    expect(joined).toMatch(/words/);
  });
});
