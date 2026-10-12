import { readFile, writeFile } from "node:fs/promises";
import { DiseaseDetailSchema, type DiseaseDetail } from "../lib/validations/disease";

type SnapshotTopic = {
  guideline_id: string;
  title: string;
  version_id: string;
  version: string;
  status: string;
  is_current: boolean;
  content: unknown;
};

type Snapshot = {
  captured_at: string;
  project_ref: string;
  topics: SnapshotTopic[];
};

const [inputPath, outputPath = "outputs/authoring-standard-audit/report.json"] = process.argv.slice(2);
if (!inputPath) throw new Error("Usage: tsx scripts/audit-clinical-authoring-standard.ts <snapshot.json> [report.json]");

const snapshot = JSON.parse(await readFile(inputPath, "utf8")) as Snapshot;
const filler = /\b(it is important to note|plays a crucial role|a wide range of|comprehensive|in conclusion)\b/i;
const locator = /\b(p{1,2}\.?\s*\d|page\s*\d|section\s*[\w.]+|table\s*[\w.]+|figure\s*[\w.]+|recommendation\s*[\w.]+|rec\.?\s*\d|appendix\s*[\w.]+)\b/i;

function text(value: unknown): string {
  return JSON.stringify(value);
}

function auditTopic(topic: SnapshotTopic) {
  const parsed = DiseaseDetailSchema.safeParse(topic.content);
  if (!parsed.success) {
    return {
      ...topic,
      content: undefined,
      compliant: false,
      meetsEightyPercent: false,
      score: 0,
      passedChecks: 0,
      totalChecks: 1,
      failures: parsed.error.issues.map((issue) => `Schema: ${issue.path.join(".")} ${issue.message}`),
    };
  }

  const item: DiseaseDetail = parsed.data;
  const failures: string[] = [];
  const checks: boolean[] = [];
  const check = (passed: boolean) => checks.push(passed);
  const mechanisms = item.pathophysiology.keyMechanisms;
  check(mechanisms.length >= 3 && mechanisms.length <= 6);
  if (mechanisms.length < 3 || mechanisms.length > 6) failures.push("Pathophysiology must contain 3–6 mechanism bullets.");
  check(item.presentation.symptoms.length > 0);
  check(item.presentation.physicalSigns.length > 0);
  check(item.presentation.redFlags.length > 0);
  check(Boolean(item.presentation.precipitants?.length));
  if (!item.presentation.precipitants?.length) failures.push("Presentation has no precipitant list.");
  if (!item.presentation.redFlags.length) failures.push("Presentation has no red flags.");
  check(item.differentials.length > 0);
  check(Boolean(item.diagnosticCriteria?.length));

  const investigations = [...item.investigations.ruleIn, ...item.investigations.ruleOut];
  investigations.forEach((investigation, index) => {
    const label = `Investigation ${index + 1} (${investigation.testName})`;
    if (!investigation.normalValue) failures.push(`${label} has no adult normal/reference value.`);
    if (!investigation.expectedFinding) failures.push(`${label} has no expected condition finding.`);
    if (!investigation.clinicalRationale) failures.push(`${label} has no interpretation/next action.`);
    if (!investigation.references?.length) failures.push(`${label} has no claim-level reference.`);
    investigation.references?.forEach((reference) => {
      if (!locator.test(reference.edition)) failures.push(`${label} reference has no exact locator in its edition field.`);
    });
  });
  check(investigations.length > 0);
  check(investigations.every((item) => Boolean(item.normalValue)));
  check(investigations.every((item) => Boolean(item.expectedFinding)));
  check(investigations.every((item) => Boolean(item.clinicalRationale)));
  check(investigations.every((item) => Boolean(item.references?.length)));
  check(investigations.every((item) => item.references?.every((reference) => locator.test(reference.edition))));

  item.clinicalManagement.forEach((step, index) => {
    if (!step.timeframe) failures.push(`Management step ${index + 1} has no timeframe.`);
    if (!step.actions.length) failures.push(`Management step ${index + 1} has no actions.`);
  });
  check(item.clinicalManagement.length > 0);
  check(item.clinicalManagement.every((step) => Boolean(step.timeframe) && step.actions.length > 0));

  item.medicationPlan?.regimens.forEach((regimen) => {
    const label = `Medicine ${regimen.genericName}`;
    if (!regimen.dose || !regimen.route || !regimen.frequency || !regimen.duration) failures.push(`${label} is missing dose, route, frequency or duration.`);
    if (!regimen.adjustments.length) failures.push(`${label} has no renal/hepatic/pregnancy/maximum-dose adjustment note.`);
    if (!regimen.monitoring.length) failures.push(`${label} has no monitoring plan.`);
    if (!regimen.contraindications?.length) failures.push(`${label} has no contraindications/cautions.`);
    if (!locator.test(regimen.sourceEdition)) failures.push(`${label} source has no exact locator.`);
  });
  const regimens = item.medicationPlan?.regimens ?? [];
  const noMedicineNeeded = item.medicationPlan?.status === "no-drug-indicated" && regimens.length === 0;
  check(Boolean(item.medicationPlan));
  check(noMedicineNeeded || regimens.every((regimen) => Boolean(regimen.dose && regimen.route && regimen.frequency && regimen.duration)));
  check(noMedicineNeeded || regimens.every((regimen) => regimen.adjustments.length > 0 && regimen.monitoring.length > 0));
  check(noMedicineNeeded || regimens.every((regimen) => Boolean(regimen.contraindications?.length)));
  check(noMedicineNeeded || regimens.every((regimen) => locator.test(regimen.sourceEdition)));

  if (!item.teaching?.learningObjectives.length) failures.push("Teaching learning objectives are absent.");
  if (!item.teaching?.keyPoints?.length) failures.push("Teaching key points are absent.");
  if (!item.teaching?.pitfalls?.length) failures.push("Teaching pitfalls are absent.");
  if (!item.teaching?.references?.length) failures.push("The final reference list is absent.");
  item.teaching?.references?.forEach((reference) => {
    if (!reference.locator) failures.push(`Reference “${reference.title}” has no exact locator.`);
  });
  if (!item.evidenceAudit) failures.push("Evidence audit is absent.");
  if (filler.test(text(item))) failures.push("Topic contains a prohibited filler phrase.");
  check(Boolean(item.evidenceAudit));
  check(Boolean(item.teaching?.learningObjectives.length));
  check(Boolean(item.teaching?.keyPoints?.length));
  check(Boolean(item.teaching?.pitfalls?.length));
  check(Boolean(item.teaching?.references?.length));
  check(Boolean(item.teaching?.references?.every((reference) => Boolean(reference.locator))));
  check(!filler.test(text(item)));
  check(item.nonClinicalManagement.patientEducation.length > 0);
  check(item.nonClinicalManagement.lifestyleAndDiet.length > 0);
  check(item.nonClinicalManagement.mdtReferrals.length > 0);
  check(item.nonClinicalManagement.dischargeCriteria.length > 0);
  check(Boolean(item.nonClinicalManagement.followUpPlan));

  const passedChecks = checks.filter(Boolean).length;
  const score = Math.round((passedChecks / checks.length) * 100);

  return {
    guideline_id: topic.guideline_id,
    title: topic.title,
    version_id: topic.version_id,
    version: topic.version,
    status: topic.status,
    is_current: topic.is_current,
    compliant: failures.length === 0,
    meetsEightyPercent: score >= 80,
    score,
    passedChecks,
    totalChecks: checks.length,
    failures,
  };
}

const topics = snapshot.topics.map(auditTopic);
const report = {
  standard: "docs/clinical-topic-authoring-standard.md",
  captured_at: snapshot.captured_at,
  project_ref: snapshot.project_ref,
  disclaimer: "This structural audit cannot prove that a source was opened, that each claim is clinically correct, or that SFDA registration was checked. Those checks must be completed during each topic correction.",
  total: topics.length,
  structurally_compliant: topics.filter((topic) => topic.compliant).length,
  preserved_at_or_above_80_percent: topics.filter((topic) => topic.meetsEightyPercent).map((topic) => topic.title),
  correction_queue: topics.filter((topic) => !topic.meetsEightyPercent).map((topic) => topic.title),
  topics,
};

await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ total: report.total, structurallyCompliant: report.structurally_compliant, corrections: report.correction_queue.length }));
