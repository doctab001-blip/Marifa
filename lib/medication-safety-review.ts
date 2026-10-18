import type { DiseaseDetail } from "@/lib/validations/disease";

export const MEDICATION_SAFETY_VERSION = "medication-safety-2026-10-15-v1";

export type MedicationSafetyGap = {
  topic: string;
  medicine: string;
  path: string;
  message: string;
};

const absolute = /^absolute(?: contraindication)?:/i;
const relative = /^relative(?: contraindication| caution)?:/i;
const caution = /^(?:caution|organ adjustment|boxed warning|black box warning):/i;
const parameter = /(?:target|every|before|after|baseline|continuous|daily|hourly|level|function|pressure|rate|count|ecg|spo2|glucose|electrolyte|creatinine|inr|aptt|anti-xa|urine|fluid balance)/i;
const locator = /(?:section|table|figure|recommendation|rec\.?|guideline|chapter|appendix|box|p{1,2}\.?\s*\d|page\s*\d|§)\s*[\w.\-–—]*/i;

export function medicationSafetyGaps(topic: DiseaseDetail): MedicationSafetyGap[] {
  const gaps: MedicationSafetyGap[] = [];
  topic.medicationPlan?.regimens.forEach((medicine, index) => {
    const base = `medicationPlan.regimens.${index}`;
    const add = (path: string, message: string) => gaps.push({ topic: topic.title, medicine: medicine.genericName, path: `${base}.${path}`, message });
    const contraindications = medicine.contraindications ?? [];
    if (!contraindications.some((item) => absolute.test(item))) add("contraindications", "Missing explicitly labelled absolute contraindications (or an exact-source statement that none are listed). ");
    if (!contraindications.some((item) => relative.test(item))) add("contraindications", "Missing explicitly labelled relative contraindications/cautions (or an exact-source statement that none are listed). ");
    if (!medicine.adjustments.some((item) => caution.test(item))) add("adjustments", "Missing a labelled caution, organ adjustment, or boxed-warning statement.");
    if (!medicine.monitoring.some((item) => parameter.test(item))) add("monitoring", "Monitoring is not specific enough to identify a parameter, target, or interval.");
    if (!locator.test(medicine.sourceEdition)) add("sourceEdition", "Safety source has no exact section/table/figure/recommendation/page locator.");
    if (!/^https:\/\//.test(medicine.sourceUrl)) add("sourceUrl", "Safety source must use an exact HTTPS URL.");
  });
  return gaps;
}

export function prepareMedicationSafetyRevision(source: DiseaseDetail): DiseaseDetail {
  const candidate: DiseaseDetail = structuredClone(source);
  candidate.status = "under_review";
  candidate.version = MEDICATION_SAFETY_VERSION;
  candidate.lastReviewed = "2026-10-15";
  candidate.clinicalReviewStatus = "pending";
  candidate.evidenceAudit = {
    checkedOn: "2026-10-15",
    status: "incomplete",
    scope: "Medication-safety correction only. All unrelated current content is preserved from the source version.",
    findings: [
      "Candidate must remain non-current and under review until every medicine safety claim has an exact source locator and clinician review.",
    ],
    unverifiedSections: ["Clinical approval and local formulary adoption remain pending."],
    medscapeStatus: "unavailable",
    originalVersionIds: [source.id],
  };
  return candidate;
}
