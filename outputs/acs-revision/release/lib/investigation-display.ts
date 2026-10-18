import type { DiseaseDetail } from "@/lib/validations/disease";

export type Investigation = DiseaseDetail["investigations"]["ruleIn"][number];
export type InvestigationReference = { title: string; url: string };

/** Presentation only: saved clinical content and its original categories remain intact. */
export function investigationDisplayTier(test: Investigation) {
  if (/^Repeat standardised readings|^Validated home or ambulatory monitoring$/i.test(test.testName)) return "bedside";
  if (/blood.pressure|pulse oximetry|oxygen saturation|capillary glucose|bedside glucose|physical examination|focused.*examination|symptom assessment|peak expiratory|FEV1|spirometry|cardiotocography|fetal heart monitoring/i.test(test.testName)
    && !/creatinine|blood gas|electrolytes|laboratory/i.test(test.testName)) return "bedside";
  return test.tier;
}

export function investigationNeedsReview(test: Investigation) {
  return /a result that supports the working diagnosis|a result that may identify a precipitating factor|findings that lower the likelihood of the selected alternative|choose this investigation because|focused evaluation for the leading alternative diagnoses|serial clinical reassessment with targeted repeat testing|^Targeted secondary-hypertension investigations/i.test(
    `${test.testName} ${test.expectedFinding} ${test.clinicalRationale}`,
  );
}

export function investigationMethod(test: Investigation) {
  // Older records store “test name — target” here. Both already have clear labels.
  const combined = `${test.testName} — ${test.targetCondition}`;
  return test.modalityTarget === combined || test.modalityTarget === test.testName ? null : test.modalityTarget;
}
