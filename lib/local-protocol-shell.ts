import type { EdProtocolOutline } from "@/data/local-protocols/ed-protocols";
import type { DiseaseDetail } from "@/lib/validations/disease";

export const PROTOCOL_OUTLINE_VERSION = "outline-2026-10-19-v1";
const PENDING = "Content not yet written.";

/**
 * Builds the schema-valid "outline" content stored for a new Local Protocol draft.
 *
 * It states only the topic, its planned scope and candidate sources. Every clinical section is an
 * explicit "Content not yet written." placeholder, and the medicine plan is empty, so the outline can
 * never be mistaken for clinical guidance. The paste editor replaces it with the real content.
 */
export function buildProtocolShell(outline: EdProtocolOutline, id: string, today: string): DiseaseDetail {
  const placeholderInvestigation = {
    tier: "laboratory" as const,
    testName: PENDING,
    modalityTarget: PENDING,
    targetCondition: PENDING,
    expectedFinding: PENDING,
    clinicalRationale: PENDING,
  };
  return {
    id,
    title: outline.title,
    specialty: outline.specialty,
    authority: "Other",
    status: "draft",
    version: PROTOCOL_OUTLINE_VERSION,
    lastReviewed: today,
    pillar: "Urgent Care",
    clinicalScenario: `Outline only. Planned scope: ${outline.scope} Candidate sources to verify: ${outline.sources}`,
    clinicalReviewStatus: "pending",
    pathophysiology: { summary: PENDING, keyMechanisms: [PENDING] },
    presentation: { symptoms: [PENDING], physicalSigns: [PENDING], redFlags: [PENDING] },
    differentials: [{ condition: PENDING, distinguishingFeatures: PENDING }],
    investigations: { ruleIn: [placeholderInvestigation], ruleOut: [placeholderInvestigation] },
    clinicalManagement: [{ id: "protocol-content-pending", title: "Protocol steps pending", timeframe: PENDING, actions: [PENDING] }],
    medicationPlan: {
      status: "local-protocol-required",
      regimens: [],
      note: "No medicines are listed until the protocol content has been written and checked against its sources.",
    },
    nonClinicalManagement: {
      patientEducation: [PENDING],
      lifestyleAndDiet: [PENDING],
      mdtReferrals: [PENDING],
      dischargeCriteria: [PENDING],
      followUpPlan: PENDING,
    },
  };
}
