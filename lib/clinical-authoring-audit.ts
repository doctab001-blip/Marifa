import { DiseaseDetailSchema, type DiseaseDetail } from "@/lib/validations/disease";
import { medicationPathwayIssues, type MedicationPathwayIssue } from "@/lib/medication-pathway";

/** Minimum authoring-standard score for a topic to appear live (docs/clinical-topic-authoring-standard.md). */
export const CLINICAL_DIRECTORY_MINIMUM_SCORE = 80;
/** Smallest investigation panel a topic can carry (bedside, laboratory, imaging and specialist tests together). */
export const MINIMUM_INVESTIGATIONS = 5;

export type AuthoringAudit = {
  compliant: boolean;
  meetsEightyPercent: boolean;
  /** Score is at least the threshold AND the medicine plan is a valid pathway. Publication paths use this, not the score alone. */
  publishable: boolean;
  /** No medicine-pathway error (flat drug list, unmarked alternatives, two drugs of one exclusive class). */
  pathwayCompliant: boolean;
  pathwayIssues: MedicationPathwayIssue[];
  score: number;
  passedChecks: number;
  totalChecks: number;
  failures: string[];
};

export type AuditOptions = {
  /**
   * Count the medicine-pathway rule in the score. True (default) for new and revised topics.
   * The live directory passes false so topics already published as flat lists stay visible until
   * a branched replacement version is written; they remain listed in the pathway audit queue.
   */
  pathwayScored?: boolean;
};

/**
 * Global authoring instruction shared by topic-generation and review workflows.
 * Keep this in one place so a new authoring surface cannot silently omit it.
 */
export const ABBREVIATION_EXPANSION_RULE =
  "On first occurrence within a topic, write the full medical term, syndrome, drug class, or scoring system followed by its abbreviation in parentheses; use only the abbreviation thereafter and never repeat the expansion.";

const filler = /\b(it is important to note|plays a crucial role|a wide range of|comprehensive|in conclusion)\b/i;
const locator = /\b(p{1,2}\.?\s*\d+|page\s*\d|section\s*[\w.]+|table\s*[\w.]+|figure\s*[\w.]+|recommendation\s*[\w.]+|rec\.?\s*\d|appendix\s*[\w.]+)\b/i;

function text(value: unknown): string {
  return JSON.stringify(value);
}

/** Structural authoring-standard audit of one topic version's content (0–100). */
export function auditTopicContent(content: unknown, options: AuditOptions = {}): AuthoringAudit {
  const parsed = DiseaseDetailSchema.safeParse(content);
  if (!parsed.success) {
    return {
      compliant: false,
      meetsEightyPercent: false,
      publishable: false,
      pathwayCompliant: false,
      pathwayIssues: [],
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
  // Investigation panel completeness: list every relevant test, with a usable normal value and a distinct finding.
  const vagueNormal = /^(within )?(the )?local( adult)?( laboratory)?( reference)?( range)?s?\.?$/i;
  check(investigations.length >= MINIMUM_INVESTIGATIONS);
  if (investigations.length < MINIMUM_INVESTIGATIONS) failures.push(`Investigations list ${investigations.length} tests; list every relevant bedside, laboratory, imaging and specialist test (at least ${MINIMUM_INVESTIGATIONS}).`);
  check(new Set(investigations.map((entry) => entry.tier)).size >= 2);
  if (new Set(investigations.map((entry) => entry.tier)).size < 2) failures.push("Investigations cover only one tier; include laboratory and imaging or bedside tests where relevant.");
  const weakNormal = investigations.filter((entry) => entry.normalValue && vagueNormal.test(entry.normalValue.trim()));
  check(weakNormal.length === 0);
  weakNormal.forEach((entry) => failures.push(`Investigation “${entry.testName}” normal value is only “${entry.normalValue}”; give the typical adult range or the target.`));
  const echoed = investigations.filter((entry) => entry.normalValue && entry.normalValue.trim().toLowerCase() === entry.expectedFinding.trim().toLowerCase());
  check(echoed.length === 0);
  echoed.forEach((entry) => failures.push(`Investigation “${entry.testName}” repeats the normal value as the expected finding.`));
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

  // Medicine pathway: branches, one-of alternatives, no two drugs of one exclusive class given together.
  const pathwayIssues = medicationPathwayIssues(item.medicationPlan);
  const pathwayErrors = pathwayIssues.filter((issue) => issue.severity === "error");
  pathwayErrors.forEach((issue) => failures.push(`Medicine pathway: ${issue.message}`));
  if (options.pathwayScored !== false) check(pathwayErrors.length === 0);

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
  // A publishable topic needs the teaching layer as one coherent safety bundle;
  // passing isolated subchecks must not keep a topic above threshold when the
  // objectives, key points and pitfalls have all been removed.
  check(Boolean(item.teaching?.learningObjectives.length && item.teaching?.keyPoints?.length && item.teaching?.pitfalls?.length));
  check(Boolean(item.teaching?.references?.every((reference) => Boolean(reference.locator))));
  check(!filler.test(text(item)));
  // This is a structural guard for the most common clinical abbreviations. It
  // catches a bare abbreviation when its required first-use expansion is absent.
  // The list is intentionally conservative: unknown abbreviations still require
  // human review, while known terms are enforced consistently across all topics.
  const knownExpansions: Record<string, string[]> = {
    ACS: ["acute coronary syndrome"],
    AKI: ["acute kidney injury"],
    COPD: ["chronic obstructive pulmonary disease"],
    CPR: ["cardiopulmonary resuscitation"],
    CT: ["computed tomography"],
    DKA: ["diabetic ketoacidosis"],
    ECG: ["electrocardiogram"],
    ED: ["emergency department"],
    ICU: ["intensive care unit"],
    MRI: ["magnetic resonance imaging"],
    PCI: ["percutaneous coronary intervention"],
    ROSC: ["return of spontaneous circulation"],
    STEMI: ["ST-elevation myocardial infarction", "ST elevation myocardial infarction"],
  };
  const topicText = text(item).toLowerCase();
  const abbreviationFailures = Object.entries(knownExpansions).filter(([abbreviation, expansions]) => {
    const token = new RegExp(`\\b${abbreviation}\\b`, "i");
    if (!token.test(topicText)) return false;
    return !expansions.some((expansion) => new RegExp(`${expansion}\\s*\\(${abbreviation}\\)`, "i").test(topicText));
  });
  check(abbreviationFailures.length === 0);
  abbreviationFailures.forEach(([abbreviation, expansions]) => failures.push(`Abbreviation ${abbreviation} must first appear as ${expansions[0]} (${abbreviation}).`));
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
    publishable: score >= CLINICAL_DIRECTORY_MINIMUM_SCORE && pathwayErrors.length === 0,
    pathwayCompliant: pathwayErrors.length === 0,
    pathwayIssues,
    score,
    passedChecks,
    totalChecks: checks.length,
    failures,
  };
}

/**
 * Live-directory visibility. Deliberately does not apply the medicine-pathway rule to the score, so already
 * published flat-list topics are not silently withdrawn; new versions are held back by `publishable` instead.
 */
export function meetsDirectoryThreshold(content: unknown) {
  return auditTopicContent(content, { pathwayScored: false }).score >= CLINICAL_DIRECTORY_MINIMUM_SCORE;
}
