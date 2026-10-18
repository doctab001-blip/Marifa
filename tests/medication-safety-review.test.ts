import { describe, expect, it } from "vitest";
import { medicationSafetyGaps, prepareMedicationSafetyRevision } from "@/lib/medication-safety-review";
import { DiseaseDetailSchema } from "@/lib/validations/disease";
import source from "@/data/emergency-versions/anaphylaxis.emergency-2026-10-12-v1.json";

describe("medication safety review", () => {
  it("preserves content while forcing pending under-review governance", () => {
    const original = DiseaseDetailSchema.parse(source);
    const candidate = prepareMedicationSafetyRevision(original);
    expect(candidate.status).toBe("under_review");
    expect(candidate.clinicalReviewStatus).toBe("pending");
    expect(candidate.medicationPlan).toEqual(original.medicationPlan);
    expect(candidate.pathophysiology).toEqual(original.pathophysiology);
  });

  it("fails closed when absolute/relative contraindications, cautions or locators are absent", () => {
    const original = DiseaseDetailSchema.parse(source);
    const gaps = medicationSafetyGaps(prepareMedicationSafetyRevision(original));
    expect(gaps.some((gap) => gap.path.endsWith("contraindications"))).toBe(true);
    expect(gaps.some((gap) => gap.path.endsWith("sourceEdition"))).toBe(true);
  });

  it("accepts a fully labelled medicine safety object", () => {
    const original = DiseaseDetailSchema.parse(source);
    const candidate = prepareMedicationSafetyRevision(original);
    const medicine = candidate.medicationPlan!.regimens[0];
    medicine.contraindications = ["Absolute contraindication: none listed — label Section 4.", "Relative caution: severe hypertension — guideline Recommendation 2.1."];
    medicine.adjustments = ["Organ adjustment: no adjustment specified; assess hepatic and renal function — label Section 8.6."];
    medicine.monitoring = ["Continuous ECG and blood pressure every 5 minutes; stop/titrate to the stated target."];
    medicine.sourceEdition = "Label Section 4; Section 5; Section 8.6; guideline Recommendation 2.1";
    expect(medicationSafetyGaps({ ...candidate, medicationPlan: { ...candidate.medicationPlan!, regimens: [medicine] } })).toEqual([]);
  });
});
