import fs from "node:fs";
import { DiseaseDetailSchema, type DiseaseDetail } from "../lib/validations/disease";
export const DATE = "2026-10-14";
export const VERSION = "authoring-standard-2026-10-14-v1";
const REPO = new URL("../data/emergency-versions/", import.meta.url).pathname;
export type Ref = { title: string; url: string };
export const SRC = {
  SDCPG: { title: "Saudi Diabetes Clinical Practice Guidelines (Saudi National Diabetes Center / Saudi Health Council)", url: "https://www.moh.gov.sa/Ministry/MediaCenter/Publications/Documents/Saudi-Diabetes-Clinical-Practice-Guidelines.pdf" },
  NG28: { title: "NICE NG28: Type 2 diabetes in adults: management", url: "https://www.nice.org.uk/guidance/ng28" },
  NG136: { title: "NICE NG136: Hypertension in adults: diagnosis and management", url: "https://www.nice.org.uk/guidance/ng136" },
  NG238: { title: "NICE NG238: Cardiovascular disease: risk assessment and reduction, including lipid modification", url: "https://www.nice.org.uk/guidance/ng238" },
  NG128: { title: "NICE NG128: Stroke and transient ischaemic attack in over 16s: diagnosis and initial management", url: "https://www.nice.org.uk/guidance/ng128" },
  NG133: { title: "NICE NG133: Hypertension in pregnancy: diagnosis and management", url: "https://www.nice.org.uk/guidance/ng133" },
  NG3: { title: "NICE NG3: Diabetes in pregnancy: management from preconception to the postnatal period", url: "https://www.nice.org.uk/guidance/ng3" },
  NG106: { title: "NICE NG106: Chronic heart failure in adults: diagnosis and management", url: "https://www.nice.org.uk/guidance/ng106" },
  NG232: { title: "NICE NG232: Head injury: assessment and early management", url: "https://www.nice.org.uk/guidance/ng232" },
  NG185: { title: "NICE NG185: Acute coronary syndromes", url: "https://www.nice.org.uk/guidance/ng185" },
  SFDA: { title: "SFDA Saudi Drug Information System (registration search)", url: "https://sdi.sfda.gov.sa/" },
  SINA2024: { title: "Saudi Initiative for Asthma 2024 update", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10911239/" },
  NG39: { title: "NICE NG39: Major trauma: assessment and initial management", url: "https://www.nice.org.uk/guidance/ng39/chapter/Recommendations" },
  BSG_LGIB: { title: "British Society of Gastroenterology guideline: acute lower gastrointestinal bleeding", url: "https://gut.bmj.com/content/68/5/776" },
  NG185: { title: "NICE NG185: Acute coronary syndromes", url: "https://www.nice.org.uk/guidance/ng185/chapter/Recommendations" },
  NG246: { title: "NICE NG246: Overweight and obesity management", url: "https://www.nice.org.uk/guidance/ng246" },
  CG126: { title: "NICE CG126: Stable angina: management", url: "https://www.nice.org.uk/guidance/cg126/chapter/Recommendations" },
  NG242: { title: "NICE NG242: Diabetic retinopathy: management and monitoring", url: "https://www.nice.org.uk/guidance/ng242/chapter/Recommendations" },
  NG217: { title: "NICE NG217: Epilepsies in children, young people and adults", url: "https://www.nice.org.uk/guidance/ng217/chapter/diagnosis-and-assessment-of-epilepsy" },
  NG17: { title: "NICE NG17: Type 1 diabetes in adults", url: "https://www.nice.org.uk/guidance/ng17/chapter/Recommendations" },
  CG151: { title: "NICE CG151: Neutropenic sepsis", url: "https://www.nice.org.uk/guidance/cg151/chapter/Recommendations" },
} satisfies Record<string, Ref>;
export const cite = (r: Ref, edition: string) => ({ title: r.title, edition, url: r.url });

/** Load a medicine regimen from an already source-checked topic JSON in the repo. */
export function reg(file: string, generic: string, over: Record<string, unknown> = {}, nth = 0) {
  const d = JSON.parse(fs.readFileSync(REPO + file, "utf8")); const c = d.content ?? d;
  const r = c.medicationPlan.regimens.filter((x: any) => x.genericName.toLowerCase().startsWith(generic.toLowerCase()))[nth];
  if (!r) throw new Error(`regimen ${generic} not found in ${file}`);
  return { ...r, ...over };
}

type Inv = { name: string; target: string; condition: string; finding: string; why: string; normal: string; tier?: "laboratory" | "firstLineImaging" | "advancedImaging" | "specializedAdjunctive"; ref: ReturnType<typeof cite> };
export type Spec = {
  key: string; draftTitle: string; pillar: DiseaseDetail["pillar"]; authority: DiseaseDetail["authority"];
  scope: string; unverified: string[]; mech: string[]; symptoms: string[]; signs: string[]; red: string[]; precip: string[];
  diffs: { condition: string; distinguishingFeatures: string }[]; criteria: { criterion: string; threshold: string }[];
  rule_in: Inv[]; rule_out: Inv[];
  steps: { id: string; title: string; timeframe: string; actions: string[] }[];
  meds: NonNullable<DiseaseDetail["medicationPlan"]>;
  comparison?: DiseaseDetail["guidelineComparison"];
  teach: { objectives: string[]; keyPoints: string[]; pitfalls: string[]; refs: { ref: Ref; edition: string; locator: string }[]; patho?: ReturnType<typeof cite>[] };
  edu: string[]; life: string[]; mdt: string[]; discharge: string[]; follow: string;
};
const mapInv = (i: Inv) => ({ tier: i.tier ?? "laboratory", testName: i.name, modalityTarget: i.target, targetCondition: i.condition, expectedFinding: i.finding, clinicalRationale: i.why, normalValue: i.normal, references: [i.ref] });
export function build(s: Spec, cat: { id: string; title: string; specialty: string }): DiseaseDetail {
  return DiseaseDetailSchema.parse({
    id: cat.id, title: cat.title, specialty: cat.specialty, authority: s.authority, status: "under_review", version: VERSION, lastReviewed: DATE, pillar: s.pillar, clinicalReviewStatus: "pending",
    evidenceAudit: { checkedOn: DATE, status: "incomplete", scope: s.scope, findings: ["Every dose, threshold and timing was checked against the cited source section on 14 Oct 2026.", "Normal values are typical adult reference ranges; laboratories differ."], unverifiedSections: s.unverified, medscapeStatus: "unavailable", originalVersionIds: [cat.id] },
    pathophysiology: { summary: s.mech.join(" "), keyMechanisms: s.mech, ...(s.teach.patho ? { references: s.teach.patho } : {}) },
    presentation: { symptoms: s.symptoms, physicalSigns: s.signs, redFlags: s.red, precipitants: s.precip },
    differentials: s.diffs, diagnosticCriteria: s.criteria,
    investigations: { ruleIn: s.rule_in.map(mapInv), ruleOut: s.rule_out.map(mapInv) },
    clinicalManagement: s.steps, medicationPlan: s.meds, ...(s.comparison ? { guidelineComparison: s.comparison } : {}),
    teaching: { scope: s.scope, learningObjectives: s.teach.objectives, keyPoints: s.teach.keyPoints, pitfalls: s.teach.pitfalls, references: s.teach.refs.map((r) => ({ ...cite(r.ref, r.edition), locator: r.locator })) },
    nonClinicalManagement: { patientEducation: s.edu, lifestyleAndDiet: s.life, mdtReferrals: s.mdt, dischargeCriteria: s.discharge, followUpPlan: s.follow },
  });
}

/** Teaching reference built from a regimen's own source fields. */
export function refFromReg(r: any) { return { ref: { title: r.sourceTitle, url: r.sourceUrl } as Ref, edition: r.sourceEdition, locator: /section\s*\d/i.test(r.sourceEdition) ? "Section 2 Dosage and Administration; Section 4 Contraindications" : r.sourceEdition }; }
