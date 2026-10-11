import { describe, expect, it } from "vitest";
import { DiseaseDetailSchema } from "@/lib/validations/disease";

const validDisease = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Test pathway",
  specialty: "Emergency Medicine",
  authority: "MOH",
  status: "draft",
  version: "1.0",
  lastReviewed: "2026-10-10",
  pillar: "Urgent Care",
  pathophysiology: { summary: "A clinically meaningful summary.", keyMechanisms: ["Mechanism"] },
  presentation: { symptoms: ["Symptom"], physicalSigns: ["Sign"], redFlags: ["Red flag"] },
  differentials: [{ condition: "Alternative", distinguishingFeatures: "Feature" }],
  investigations: {
    ruleIn: [{ tier: "laboratory", testName: "Test", modalityTarget: "Test for condition", targetCondition: "Condition", expectedFinding: "Finding", clinicalRationale: "Rationale" }],
    ruleOut: [{ tier: "specializedAdjunctive", testName: "Test", modalityTarget: "Test for alternative", targetCondition: "Alternative", expectedFinding: "Finding", clinicalRationale: "Rationale" }],
  },
  clinicalManagement: [{ id: "assess", title: "Assess", timeframe: "Immediate", actions: ["Act"] }],
  nonClinicalManagement: {
    patientEducation: ["Education"],
    lifestyleAndDiet: ["Lifestyle"],
    mdtReferrals: ["Referral"],
    dischargeCriteria: ["Criterion"],
    followUpPlan: "Follow up.",
  },
};

describe("DiseaseDetailSchema", () => {
  it("accepts a complete six-tier disease record", () => {
    expect(DiseaseDetailSchema.parse(validDisease)).toEqual(validDisease);
  });

  it("keeps an evidence check distinct from clinical approval", () => {
    const audit = { checkedOn: "2026-10-11", status: "incomplete", scope: "NICE management comparison only", findings: ["Original Medscape derivation not established"], unverifiedSections: ["Prescribing"], medscapeStatus: "unavailable", originalVersionIds: [validDisease.id] };
    expect(DiseaseDetailSchema.parse({ ...validDisease, authority: "Other", evidenceAudit: audit }).evidenceAudit?.status).toBe("incomplete");
    expect(() => DiseaseDetailSchema.parse({ ...validDisease, evidenceAudit: { ...audit, status: "clinically-approved" } })).toThrow();
  });

  it("preserves textbook source and pending clinical review on existing published scenarios", () => {
    const existing = { ...validDisease, authority: "Textbook", status: "published", clinicalReviewStatus: "pending" };
    expect(DiseaseDetailSchema.parse(existing)).toEqual(existing);
    expect(() => DiseaseDetailSchema.parse({ ...existing, clinicalReviewStatus: "invented-approval" })).toThrow();
  });

  it("rejects unknown fields and empty clinical arrays", () => {
    expect(() => DiseaseDetailSchema.parse({ ...validDisease, unexpected: true })).toThrow();
    expect(() => DiseaseDetailSchema.parse({ ...validDisease, presentation: { ...validDisease.presentation, redFlags: [] } })).toThrow();
  });

  it("rejects non-ISO review dates and unstable pathway step identifiers", () => {
    expect(() => DiseaseDetailSchema.parse({ ...validDisease, lastReviewed: "10 October 2026" })).toThrow();
    expect(() => DiseaseDetailSchema.parse({ ...validDisease, clinicalManagement: [{ ...validDisease.clinicalManagement[0], id: "Step 1" }] })).toThrow();
  });
});
