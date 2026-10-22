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
  /** How age, sex or region changed this condition's score (empty when no adjustment applied). */
  contextNotes: string[];
  /** Marifa medical calculators that help rule this condition in or out. */
  calculators: CalculatorLink[];
}

export interface CalculatorLink {
  id: string;
  title: string;
  href: string;
}

/** A term the finding inputs can suggest while typing. */
export interface VocabularyTerm {
  term: string;
  kind: "symptom" | "exam" | "lab" | "imaging";
}

/** A finding not yet entered that would most change the ranking, and which differentials it would support. */
export interface DiscriminatingFinding {
  finding: string;
  kind: "symptom" | "exam" | "lab" | "imaging";
  supports: string[];
  /** The test or examination that answers it, when one is listed. */
  howToCheck?: string;
}

/** A typed value the engine read as a clinical term ("HR 124" → tachycardia). */
export interface InterpretedFinding {
  original: string;
  interpretedAs: string[];
}

export interface DiagnosticEngineResponse {
  queryId: string;
  timestamp: string;
  /** Strictly 3 to 4 items, ranked by matchScore. */
  topDifferentials: DifferentialMatch[];
  clinicalSafetyNotice: string;
  /** Findings that would best separate the listed differentials. */
  discriminatingFindings: DiscriminatingFinding[];
  inputInterpretation: InterpretedFinding[];
}

export interface DiagnosticEngineError {
  error: string;
  code: "invalid_input" | "no_findings" | "no_match";
  issues?: string[];
}
