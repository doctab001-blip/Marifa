/**
 * Diagnosis Engine contracts (request + response).
 *
 * The engine ranks 3–4 differential diagnoses from four clinical input vectors and links each one to a
 * Marifa disease-management pathway. Decision support only: demonstration data, pending clinical review.
 */
import type { CountryCode } from "@/types/clinical";

export type FindingDomain = "symptoms" | "examFindings" | "labInvestigations" | "imagingFindings";

export interface DiagnosticInputState {
  age?: number;
  gender?: "male" | "female" | "all";
  /** Defaults to the active country toggle ('IN' | 'SA' | 'UK'). */
  region?: CountryCode;
  symptoms: string[];
  examFindings: string[];
  labInvestigations: string[];
  imagingFindings: string[];
}

export type PathwayStatus = "approved" | "pending_review" | "unverified";

export type UrgencyLevel = "CRITICAL_MUST_NOT_MISS" | "HIGH" | "ROUTINE";

export interface DifferentialMatch {
  /** Marifa topic id: a catalogue guideline id or a GlobalDiseaseTopic id. */
  diseaseId: string;
  diseaseTitle: string;
  icd10Code: string;
  specialty: string;
  /** Percentage, 0–97 (the engine never claims certainty). */
  matchScore: number;
  urgencyLevel: UrgencyLevel;
  matchedFeatures: {
    symptomsMatched: string[];
    examMatched: string[];
    labsMatched: string[];
    imagingMatched: string[];
  };
  /** Key clinical signs expected for this condition but not entered. */
  missingClassicFeatures: string[];
  /** Entered findings that argue against this condition. */
  contradictingFindings: string[];
  /** Escalation triggers for this condition. */
  redFlags: string[];
  suggestedNextSteps: {
    testName: string;
    clinicalRationale: string;
  }[];
  marifaPathwayUrl: string;
  /** Title of the linked pathway (it may be a broader pathway, e.g. Acute Chest Pain for aortic dissection). */
  pathwayTitle: string;
  /**
   * "approved": live and clinically approved. "pending_review": live, clinical sign-off pending (never labelled
   * approved). "unverified": the live catalogue could not be checked for this query.
   */
  pathwayStatus: PathwayStatus;
}

export interface DiagnosticEngineResponse {
  queryId: string;
  timestamp: string;
  /** Strictly 3 to 4 items, ranked by matchScore. */
  topDifferentials: DifferentialMatch[];
  clinicalSafetyNotice: string;
}

export interface DiagnosticEngineError {
  error: string;
  code: "invalid_input" | "no_findings" | "no_match";
  issues?: string[];
}
