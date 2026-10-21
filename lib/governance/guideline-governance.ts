/**
 * Governance of Marifa's own clinical guidelines and local protocols. Only ids, versions and dates are read: the clinical
 * content stays where it is (clinical_guidelines / guideline_versions) and is never copied into governance tables.
 */
import { daysBetween, EXPIRING_DAYS, isoDate } from "@/lib/governance/scoring";

export type GuidelineGovStatus = "not_reviewed" | "under_review" | "approved" | "changes_requested" | "retired";

export const GUIDELINE_STATUS_LABEL: Record<GuidelineGovStatus, string> = {
  not_reviewed: "Not reviewed by governance",
  under_review: "Under governance review",
  approved: "Governance approved",
  changes_requested: "Changes requested",
  retired: "Retired",
};

/** One guideline as governance sees it: who owns it, which version is current, when it is due for review. */
export type GovernedGuideline = {
  id: string;
  title: string;
  sourceType: string;
  isLocal: boolean;
  ownerUserId: string | null;
  currentVersionId: string | null;
  currentVersion: string | null;
  currentVersionStatus: string | null;
  lastReviewed: string | null;
  reviewDate: string | null;
};

export type GuidelineReviewRow = {
  id: string;
  guidelineId: string;
  governedVersionId: string | null;
  status: GuidelineGovStatus;
  ownerUserId: string | null;
  nextReviewDue: string | null;
  decisionNote: string;
  approvedBy: string | null;
  approvedAt: string | null;
  updatedAt: string;
};

export type ReviewTiming = "overdue" | "due_soon" | "ok" | "none";

export function reviewTiming(due: string | null, today: Date): ReviewTiming {
  if (!due) return "none";
  const left = daysBetween(isoDate(today), due);
  if (left < 0) return "overdue";
  return left <= EXPIRING_DAYS ? "due_soon" : "ok";
}

export type GuidelineGovernanceView = {
  guideline: GovernedGuideline;
  review: GuidelineReviewRow | null;
  status: GuidelineGovStatus;
  /** The governance review date if one is set, otherwise the clinical version's own review date. */
  nextReviewDue: string | null;
  timing: ReviewTiming;
  /** Approved, but a newer clinical version has been published since; the approval does not carry over. */
  approvalOutdated: boolean;
  ownerUserId: string | null;
};

export function governanceView(guideline: GovernedGuideline, review: GuidelineReviewRow | null, today: Date): GuidelineGovernanceView {
  const status = review?.status ?? "not_reviewed";
  const nextReviewDue = review?.nextReviewDue ?? guideline.reviewDate;
  const approvalOutdated = status === "approved" && Boolean(review?.governedVersionId) && review?.governedVersionId !== guideline.currentVersionId;
  return {
    guideline, review, status, nextReviewDue,
    timing: status === "retired" ? "none" : reviewTiming(nextReviewDue, today),
    approvalOutdated,
    ownerUserId: review?.ownerUserId ?? guideline.ownerUserId,
  };
}

export function summariseGuidelines(views: GuidelineGovernanceView[]) {
  return {
    total: views.length,
    approved: views.filter((v) => v.status === "approved" && !v.approvalOutdated).length,
    outdatedApproval: views.filter((v) => v.approvalOutdated).length,
    notReviewed: views.filter((v) => v.status === "not_reviewed").length,
    overdue: views.filter((v) => v.timing === "overdue").length,
    dueSoon: views.filter((v) => v.timing === "due_soon").length,
  };
}

/* ---- Generic governance links ------------------------------------------------------------------------------------ */

export type LinkType = "standard" | "element" | "policy" | "guideline" | "capa" | "audit" | "audit_template" | "qip" | "incident" | "indicator" | "decision" | "meeting" | "committee";

export type LinkRow = {
  id: string;
  sourceType: LinkType;
  sourceId: string;
  targetType: LinkType;
  targetId: string;
  targetVersionId: string | null;
  note: string;
  createdAt: string;
};

export const LINK_TYPE_LABEL: Record<LinkType, string> = {
  standard: "Standard", element: "Measurable element", policy: "Policy", guideline: "Clinical guideline", capa: "Action",
  audit: "Audit", audit_template: "Audit template", qip: "Improvement project", incident: "Incident", indicator: "Quality indicator",
  decision: "Committee decision", meeting: "Meeting", committee: "Committee",
};

/** Links are stored once but read from either end: returns the "other side" of every link touching one record. */
export function linksOf(links: LinkRow[], type: LinkType, id: string): { type: LinkType; id: string; versionId: string | null; link: LinkRow }[] {
  return links.flatMap((link) => {
    if (link.sourceType === type && link.sourceId === id) return [{ type: link.targetType, id: link.targetId, versionId: link.targetVersionId, link }];
    if (link.targetType === type && link.targetId === id) return [{ type: link.sourceType, id: link.sourceId, versionId: null, link }];
    return [];
  });
}
