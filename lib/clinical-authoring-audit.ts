import { DiseaseDetailSchema, type DiseaseDetail } from "@/lib/validations/disease";

/** Minimum authoring-standard score for a topic to appear live (docs/clinical-topic-authoring-standard.md). */
export const CLINICAL_DIRECTORY_MINIMUM_SCORE = 80;

export type AuthoringAudit = { compliant: boolean; meetsEightyPercent: boolean; score: number; passedChecks: number; totalChecks: number; failures: string[] };

const filler = /\b(it is important to note|plays a crucial role|a wide range of|comprehensive|in conclusion)\b/i;
const locator = /\b(p{1,2}\.?\s*\d+|page\s*\d|section\s*[\w.]+|table\s*[\w.]+|figure\s*[\w.]+|recommendation\s*[\w.]+|rec\.?\s*\d|appendix\s*[\w.]+)\b/i;

function text(value: unknown): string {
  return JSON.stringify(value);
}

/** Structural authoring-standard audit of one topic version's content (0–100). */
export function auditTopicContent(content: unknown): AuthoringAudit {
  const parsed = DiseaseDetailSchema.safeParse(content);
  if (!parsed.success) {
    return {
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
    compliant: failures.length === 0,
    meetsEightyPercent: score >= CLINICAL_DIRECTORY_MINIMUM_SCORE,
    score,
    passedChecks,
    totalChecks: checks.length,
    failures,
  };
}

export function meetsDirectoryThreshold(content: unknown) {
  return auditTopicContent(content).score >= CLINICAL_DIRECTORY_MINIMUM_SCORE;
}
