import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DiseaseDetailSchema } from "@/lib/validations/disease";
import { cleanText, parsePastedTopic } from "@/lib/topic-paste";
import { buildFixPrompt, buildGeminiPrompt, PASTE_FORMAT } from "@/lib/topic-paste-prompt";

const raw = JSON.parse(readFileSync("data/emergency-versions/acs.emergency-2026-10-12-v3.json", "utf8"));
const parsedBase = DiseaseDetailSchema.parse(raw.content ?? raw);
// Self-contained fixture topic: strip the earlier-version extras that belong to a different clinical topic.
const { granularPathway: dropped, ...withoutPathway } = parsedBase;
void dropped;
const base = DiseaseDetailSchema.parse({
  ...withoutPathway,
  title: "Diabetic Ketoacidosis in Adults",
  clinicalScenario: undefined,
  guidelineComparison: undefined,
  evidenceAudit: { ...withoutPathway.evidenceAudit!, scope: "Adults with diabetic ketoacidosis in the emergency department.", findings: ["Fixture."], unverifiedSections: ["Fixture."] },
  teaching: { learningObjectives: ["Placeholder objective."] },
  nonClinicalManagement: {
    patientEducation: ["Old education."], lifestyleAndDiet: ["Old lifestyle."], mdtReferrals: ["Diabetes specialist team."],
    dischargeCriteria: ["Old discharge."], followUpPlan: "Old follow-up.",
  },
});
const sample = readFileSync("tests/fixtures/gemini-paste-sample.md", "utf8");
const options = { today: "2026-10-18" };

describe("topic paste parser", () => {
  it("maps a whole Gemini-style paste into a schema-valid topic that passes the 80% audit", () => {
    const result = parsePastedTopic(sample, base, options);
    expect(result.schemaErrors).toEqual([]);
    expect(result.audit?.failures).toEqual([]);
    expect(result.audit?.score).toBeGreaterThanOrEqual(80);
    const content = result.content!;
    expect(content.pathophysiology.keyMechanisms).toHaveLength(4);
    expect(content.presentation.redFlags).toHaveLength(1);
    expect(content.presentation.precipitants).toHaveLength(1);
    expect(content.diagnosticCriteria).toHaveLength(3);
    const tests = [...content.investigations.ruleIn, ...content.investigations.ruleOut];
    expect(tests).toHaveLength(7);
    expect(new Set(tests.map((entry) => entry.tier)).size).toBeGreaterThanOrEqual(3);
    expect(content.investigations.ruleIn[0].references?.[0].edition).toContain("Table 2");
    expect(content.clinicalManagement.map((step) => step.title)).toEqual(["Immediate", "Ongoing", "Escalation"]);
    expect(content.clinicalManagement[0].timeframe).toBe("0–60 minutes");
    expect(content.medicationPlan?.regimens[0]).toMatchObject({ genericName: "Soluble insulin", route: "IV infusion", sourceEdition: expect.stringContaining("Table 4") });
    expect(content.medicationPlan?.regimens[0].adjustments).toHaveLength(2);
    expect(content.teaching?.references?.[0].locator).toBe("Tables 2 and 4");
    expect(content.nonClinicalManagement.followUpPlan).toBe("Diabetes specialist review within 1 week.");
    expect(content.clinicalReviewStatus).toBe("pending");
    expect(content.evidenceAudit?.checkedOn).toBe("2026-10-18");
    expect(DiseaseDetailSchema.safeParse(content).success).toBe(true);
  });

  it("strips Markdown and numeric citation markers from prose", () => {
    expect(cleanText("Give **aspirin** 300 mg [1] now [2, Table 3] and `monitor`.")).toBe("Give aspirin 300 mg now and monitor.");
  });

  it("keeps the previous content of sections that are not in the paste and says so", () => {
    const managementOnly = sample.slice(sample.indexOf("## Management"));
    const result = parsePastedTopic(managementOnly, base, options);
    const status = Object.fromEntries(result.sections.map((section) => [section.key, section.status]));
    expect(status.pathophysiology).toBe("kept");
    expect(status.management).toBe("parsed");
    expect(result.content?.pathophysiology).toEqual(base.pathophysiology);
    expect(result.parsedCount).toBeGreaterThan(0);
  });

  it("does not attach a reference to a test that does not cite one", () => {
    const uncited = sample.replace("| Below 0.6 mmol/L | 3.0 mmol/L or above | Confirms ketoacidosis; target fall of 0.5 mmol/L per hour | [1] Table 2 |", "| Below 0.6 mmol/L | 3.0 mmol/L or above | Confirms ketoacidosis; target fall of 0.5 mmol/L per hour | |");
    const result = parsePastedTopic(uncited, base, options);
    expect(result.audit?.failures.join(" ")).toMatch(/Capillary β-hydroxybutyrate.*no claim-level reference/);
    expect(result.audit?.score).toBeLessThan(100);
  });

  it("rejects a reference without a web address instead of inventing one", () => {
    const noUrl = sample.replace(" | https://abcd.care/resource/jbds-02-management-diabetic-ketoacidosis-dka-adults", " | ");
    const result = parsePastedTopic(noUrl, base, options);
    expect(result.issues.some((issue) => issue.level === "error" && /Reference 1/.test(issue.message))).toBe(true);
    expect(result.content?.teaching?.references?.map((ref) => ref.title) ?? []).not.toContain("Management of Diabetic Ketoacidosis in Adults");
  });

  it("explains in plain words why a paste cannot be saved", () => {
    const empty = sample.replace("| Venous pH | 7.35–7.45 | Below 7.30 |", "| Venous pH | 7.35–7.45 | |");
    const result = parsePastedTopic(empty, base, options);
    expect(result.content).toBeNull();
    expect(result.schemaErrors.join(" ")).toMatch(/Venous pH/);
  });

  it("reads all-### headings, numbered headings and bold-line headings", () => {
    const variant = sample
      .replace("**Pathophysiology**", "### 1. Pathophysiology")
      .replace("## Signs & Symptoms", "### 2. Signs and Symptoms")
      .replace("## Investigations", "### 3. Investigations")
      .replace("## Management", "#### 4. Management")
      .replace("## References", "### References");
    const result = parsePastedTopic(variant, base, options);
    expect(result.schemaErrors).toEqual([]);
    expect(result.audit?.score).toBeGreaterThanOrEqual(80);
  });

  it("returns nothing to save for text without any recognisable heading", () => {
    const result = parsePastedTopic("Just some words from a chat.", base, options);
    expect(result.parsedCount).toBe(0);
    expect(result.issues.filter((issue) => issue.level === "warning").length).toBeGreaterThan(0);
  });

  it("does not take a title change unless asked", () => {
    const retitled = sample.replace("# Diabetic Ketoacidosis in Adults (TEST FIXTURE — not clinical content)", "# DKA: a different title");
    expect(parsePastedTopic(retitled, base, options).content?.title).toBe("Diabetic Ketoacidosis in Adults");
    expect(parsePastedTopic(retitled, base, { ...options, useTitleFromPaste: true }).content?.title).toBe("DKA: a different title");
  });
});

describe("Gemini prompts", () => {
  it("builds a prompt that names the topic and the exact layout the parser reads", () => {
    const prompt = buildGeminiPrompt({ title: "Acute Asthma in Adults", specialty: "Pulmonology", pillar: "Urgent Care" });
    expect(prompt).toContain("TOPIC: Acute Asthma in Adults");
    expect(prompt).toContain(PASTE_FORMAT);
    expect(prompt).toMatch(/Source column of every test row/);
  });

  it("turns audit findings into a repair prompt, or nothing when the topic is clean", () => {
    const result = parsePastedTopic(sample.replace("[1] Table 2 |\n| Venous pH", "|\n| Venous pH"), base, options);
    const fix = buildFixPrompt(result.audit, result.issues, result.schemaErrors);
    expect(fix).toContain("PROBLEMS TO FIX");
    expect(buildFixPrompt(null, [], [])).toBe("");
  });
});
