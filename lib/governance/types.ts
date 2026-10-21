/** Shared types for the CBAHI Accreditation Hub. Plain data only: no framework imports, so scoring stays unit-testable. */

export type Rating = "insufficient" | "partial" | "satisfactory" | "not_applicable";
export type AssessmentMethod = "self_assessment" | "mock_survey" | "audit" | "external_survey";
export type EvidenceType = "policy" | "audit_report" | "meeting_minutes" | "training_record" | "log" | "certificate" | "other";
export type PolicyStatus = "draft" | "under_committee_review" | "approved" | "retired";
export type IncidentStatus = "reported" | "under_investigation" | "capa_assigned" | "under_review" | "closed";
export type Severity = "low" | "medium" | "high" | "critical";
export type CapaStatus = "open" | "in_progress" | "done" | "verified";
export type AuditStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type QipPhase = "plan" | "do" | "study" | "act";

export const RATING_LABEL: Record<Rating, string> = {
  insufficient: "Insufficient",
  partial: "Partial",
  satisfactory: "Satisfactory",
  not_applicable: "Not applicable",
};

export const EVIDENCE_TYPE_LABEL: Record<EvidenceType, string> = {
  policy: "Policy / procedure",
  audit_report: "Audit report",
  meeting_minutes: "Meeting minutes",
  training_record: "Training record",
  log: "Log / register",
  certificate: "Certificate / licence",
  other: "Other",
};

export type GovSettings = {
  editionLabel: string;
  /** Percent compliance at or above which a sub-standard is rated satisfactory (guide default 80). */
  satisfactoryMinPct: number;
  /** Percent compliance at or above which a sub-standard is at least partial (guide default 50). */
  partialMinPct: number;
  /** Overall score needed for "accredited" (guide default 85). */
  accreditedMinOverall: number;
  /** Overall score below which the indication is denial risk (guide default 75). */
  conditionalMinOverall: number;
  /** More than this share of ESRs not satisfactory means denial risk (guide default 25). */
  esrUnsatisfactoryMaxPct: number;
  validityYears: number;
  accreditationAwardedOn: string | null;
  scoringSourceNote: string;
  /** Risk score (likelihood x impact) at which each band starts. Defaults match the bands used since the hub launched. */
  riskModerateMin: number;
  riskHighMin: number;
  riskExtremeMin: number;
  riskMethodologyNote: string;
};

export const DEFAULT_SETTINGS: GovSettings = {
  editionLabel: "",
  satisfactoryMinPct: 80,
  partialMinPct: 50,
  accreditedMinOverall: 85,
  conditionalMinOverall: 75,
  esrUnsatisfactoryMaxPct: 25,
  validityYears: 3,
  accreditationAwardedOn: null,
  scoringSourceNote:
    "CBAHI Hospital Accreditation Process Guide, October 2016 (3rd edition standards). Confirm against the edition your hospital is surveyed under.",
  riskModerateMin: 5,
  riskHighMin: 10,
  riskExtremeMin: 15,
  riskMethodologyNote: "",
};

export type StandardRow = {
  id: string;
  edition: string;
  chapterCode: string;
  chapterName: string;
  code: string;
  description: string;
  isEsr: boolean;
  department: string;
  ownerUserId: string | null;
  reviewIntervalMonths: number;
};

export type StandardStatusRow = {
  standardId: string;
  rating: Rating | null;
  method: AssessmentMethod | null;
  notes: string;
  assessedAt: string | null;
  nextReviewDue: string | null;
};

export type EvidenceRow = {
  id: string;
  standardId: string;
  title: string;
  evidenceType: EvidenceType;
  storagePath: string;
  fileName: string;
  sizeBytes: number | null;
  validFrom: string | null;
  validUntil: string | null;
  uploadedAt: string;
  uploadedBy: string | null;
  withdrawnAt: string | null;
  withdrawnReason: string | null;
};

export type PolicyRow = {
  id: string;
  title: string;
  documentNumber: string;
  version: string;
  status: PolicyStatus;
  department: string;
  ownerUserId: string | null;
  effectiveDate: string | null;
  nextReviewDue: string | null;
  storagePath: string | null;
  fileName: string | null;
  clinicalGuidelineId: string | null;
  approvedAt: string | null;
  createdAt: string;
};

export type IncidentRow = {
  id: string;
  reference: string;
  title: string;
  category: string;
  description: string;
  sbar: { s?: string; b?: string; a?: string; r?: string };
  occurredAt: string;
  department: string;
  location: string;
  patientMrn: string | null;
  severity: Severity;
  likelihood: number;
  impact: number;
  riskScore: number;
  isSentinel: boolean;
  status: IncidentStatus;
  rootCause: string;
  closureNote: string;
  reportedBy: string | null;
  createdAt: string;
  closedAt: string | null;
};

export type CapaRow = {
  id: string;
  incidentId: string | null;
  auditId: string | null;
  action: string;
  kind: "corrective" | "preventive";
  ownerUserId: string;
  dueDate: string;
  status: CapaStatus;
  doneAt: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  verificationNote: string;
};

export type AuditRow = {
  id: string;
  title: string;
  category: string;
  standardId: string | null;
  department: string;
  ownerUserId: string | null;
  scheduledFor: string;
  recurrenceMonths: number | null;
  targetPct: number | null;
  status: AuditStatus;
  sampleSize: number | null;
  resultPct: number | null;
  findings: string;
  completedAt: string | null;
};

export type QipRow = {
  id: string;
  title: string;
  aim: string;
  measure: string;
  unit: string;
  baselineValue: number | null;
  targetValue: number | null;
  currentValue: number | null;
  phase: QipPhase;
  status: "active" | "completed" | "stopped";
  department: string;
  leadUserId: string | null;
  standardId: string | null;
  startedOn: string | null;
  dueOn: string | null;
};

export type Person = { userId: string; displayName: string; roleCodes: string[] };
