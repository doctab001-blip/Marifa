/**
 * Expected-evidence checklists and the evidence workflow:
 *   Missing -> Uploaded -> Under review -> Verified, with Expired and Superseded derived from the evidence file itself.
 * Categories are the hospital's own configuration; they are not a statement of what CBAHI requires.
 */
import { daysBetween, EXPIRING_DAYS, isoDate } from "@/lib/governance/scoring";
import type { EvidenceRow } from "@/lib/governance/types";

export type RequirementCategory =
  | "approved_policy" | "guideline_sop" | "audit_report" | "qi_report" | "committee_minutes"
  | "training_record" | "equipment_checklist" | "incident_investigation" | "capa_report" | "other";

export const REQUIREMENT_CATEGORY_LABEL: Record<RequirementCategory, string> = {
  approved_policy: "Approved hospital policy",
  guideline_sop: "Clinical guideline or SOP",
  audit_report: "Audit report",
  qi_report: "Quality improvement report",
  committee_minutes: "Committee meeting minutes",
  training_record: "Staff training record",
  equipment_checklist: "Equipment inspection checklist",
  incident_investigation: "Incident investigation",
  capa_report: "CAPA completion report",
  other: "Other supporting documentation",
};

export type SubmissionStatus = "uploaded" | "under_review" | "verified" | "rejected";

export type RequirementRow = {
  id: string;
  standardId: string | null;
  elementId: string | null;
  category: RequirementCategory;
  description: string;
  department: string;
  ownerUserId: string | null;
  isRequired: boolean;
  dueDate: string | null;
  isActive: boolean;
};

export type SubmissionRow = {
  id: string;
  requirementId: string;
  evidenceId: string;
  status: SubmissionStatus;
  submittedBy: string | null;
  submittedAt: string;
  reviewerUserId: string | null;
  reviewedAt: string | null;
  reviewNote: string;
};

export type EvidenceLinkRow = {
  id: string;
  evidenceId: string;
  standardId: string | null;
  elementId: string | null;
  linkedAt: string;
  unlinkedAt: string | null;
};

export type RequirementState = "missing" | "uploaded" | "under_review" | "verified" | "rejected" | "expired" | "superseded";

export const REQUIREMENT_STATE_LABEL: Record<RequirementState, string> = {
  missing: "Missing",
  uploaded: "Uploaded",
  under_review: "Under review",
  verified: "Verified",
  rejected: "Rejected — needs new evidence",
  expired: "Expired",
  superseded: "Superseded — review the new version",
};

/** Workflow order shown in the stepper. Expired and superseded are branches off "Verified". */
export const EVIDENCE_STEPS: { key: RequirementState; label: string }[] = [
  { key: "missing", label: "Missing" },
  { key: "uploaded", label: "Uploaded" },
  { key: "under_review", label: "Under review" },
  { key: "verified", label: "Verified" },
];

/** Ids of evidence records that a newer, non-withdrawn version has replaced. */
export function supersededIds(evidence: { supersedesId: string | null; withdrawnAt: string | null }[]): Set<string> {
  const out = new Set<string>();
  for (const item of evidence) if (item.supersedesId && !item.withdrawnAt) out.add(item.supersedesId);
  return out;
}

export type EvidenceWithVersion = EvidenceRow & { supersedesId: string | null };

export type RequirementView = {
  requirement: RequirementRow;
  state: RequirementState;
  submission: SubmissionRow | null;
  evidence: EvidenceWithVersion | null;
  expiringSoon: boolean;
  overdue: boolean;
};

/**
 * The state of ONE requirement. The most advanced submission wins; a verified file that has since expired, been withdrawn
 * or been replaced by a newer version no longer satisfies the requirement.
 */
export function requirementState(
  requirement: RequirementRow,
  submissions: SubmissionRow[],
  evidenceById: Map<string, EvidenceWithVersion>,
  superseded: Set<string>,
  today: Date,
): RequirementView {
  const todayIso = isoDate(today);
  const mine = submissions
    .filter((s) => s.requirementId === requirement.id)
    .map((s) => ({ s, e: evidenceById.get(s.evidenceId) ?? null }))
    .filter((x) => x.e !== null && !x.e.withdrawnAt);
  const rank: Record<SubmissionStatus, number> = { verified: 4, under_review: 3, uploaded: 2, rejected: 1 };
  mine.sort((a, b) => rank[b.s.status] - rank[a.s.status] || b.s.submittedAt.localeCompare(a.s.submittedAt));
  const overdue = Boolean(requirement.dueDate && requirement.dueDate < todayIso);

  // A verified, current, unreplaced file satisfies the requirement.
  const good = mine.find((x) => x.s.status === "verified" && !superseded.has(x.e!.id) && !(x.e!.validUntil && x.e!.validUntil < todayIso));
  if (good) {
    const left = good.e!.validUntil ? daysBetween(todayIso, good.e!.validUntil) : null;
    return { requirement, state: "verified", submission: good.s, evidence: good.e, expiringSoon: left !== null && left <= EXPIRING_DAYS, overdue: false };
  }
  const pending = mine.find((x) => (x.s.status === "under_review" || x.s.status === "uploaded") && !superseded.has(x.e!.id) && !(x.e!.validUntil && x.e!.validUntil < todayIso));
  if (pending) return { requirement, state: pending.s.status, submission: pending.s, evidence: pending.e, expiringSoon: false, overdue };
  const verifiedButStale = mine.find((x) => x.s.status === "verified");
  if (verifiedButStale) {
    const state: RequirementState = superseded.has(verifiedButStale.e!.id) ? "superseded" : "expired";
    return { requirement, state, submission: verifiedButStale.s, evidence: verifiedButStale.e, expiringSoon: false, overdue };
  }
  const rejected = mine.find((x) => x.s.status === "rejected");
  if (rejected) return { requirement, state: "rejected", submission: rejected.s, evidence: rejected.e, expiringSoon: false, overdue };
  return { requirement, state: "missing", submission: null, evidence: null, expiringSoon: false, overdue };
}

export type Completeness = {
  required: number;
  satisfied: number;
  optional: number;
  optionalSatisfied: number;
  /** Required items verified and current, as a percentage. Null when nothing is configured as required. */
  pct: number | null;
  missing: RequirementView[];
  awaitingReview: RequirementView[];
  stale: RequirementView[];
};

export function completeness(views: RequirementView[]): Completeness {
  const active = views.filter((v) => v.requirement.isActive);
  const required = active.filter((v) => v.requirement.isRequired);
  const optional = active.filter((v) => !v.requirement.isRequired);
  const satisfied = required.filter((v) => v.state === "verified").length;
  return {
    required: required.length,
    satisfied,
    optional: optional.length,
    optionalSatisfied: optional.filter((v) => v.state === "verified").length,
    pct: required.length === 0 ? null : Math.round((satisfied / required.length) * 1000) / 10,
    missing: active.filter((v) => v.state === "missing" || v.state === "rejected"),
    awaitingReview: active.filter((v) => v.state === "uploaded" || v.state === "under_review"),
    stale: active.filter((v) => v.state === "expired" || v.state === "superseded"),
  };
}

export type EvidenceLifecycle = "current" | "expiring" | "expired" | "withdrawn" | "superseded";

export function evidenceLifecycle(item: EvidenceWithVersion, superseded: Set<string>, today: Date): EvidenceLifecycle {
  if (item.withdrawnAt) return "withdrawn";
  if (superseded.has(item.id)) return "superseded";
  if (!item.validUntil) return "current";
  const left = daysBetween(isoDate(today), item.validUntil);
  if (left < 0) return "expired";
  return left <= EXPIRING_DAYS ? "expiring" : "current";
}

/** Older versions of a file, newest first, following supersedes_id back through the chain. */
export function versionHistory(item: EvidenceWithVersion, all: EvidenceWithVersion[]): EvidenceWithVersion[] {
  const byId = new Map(all.map((e) => [e.id, e]));
  const out: EvidenceWithVersion[] = [];
  let cursor = item.supersedesId ? byId.get(item.supersedesId) : undefined;
  const seen = new Set<string>([item.id]);
  while (cursor && !seen.has(cursor.id)) {
    out.push(cursor);
    seen.add(cursor.id);
    cursor = cursor.supersedesId ? byId.get(cursor.supersedesId) : undefined;
  }
  return out;
}
