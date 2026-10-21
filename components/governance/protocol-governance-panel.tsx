import Link from "next/link";
import { getGovernanceActor } from "@/lib/governance/auth";
import { formatDate } from "@/lib/governance/clock";
import { GUIDELINE_STATUS_LABEL, reviewTiming, type GuidelineGovStatus } from "@/lib/governance/guideline-governance";
import { canReadGovernance } from "@/lib/governance/policy";
import { openContext } from "@/lib/governance/repository";
import { loadGuidelineSummary } from "@/lib/governance/repository-v21";
import { currentDate } from "@/lib/governance/clock";

/**
 * Compact governance information on a clinical protocol page: version, review dates, governance status, linked quality
 * indicators and accreditation requirements. Collapsed by default so it never gets in the way of clinical use; renders
 * nothing at all if the governance data cannot be read. It only reads; the protocol and its order workflow are untouched.
 */
export async function ProtocolGovernancePanel({ guidelineId, versionId, version, publishedAt }: { guidelineId: string; versionId: string; version: string; publishedAt: string | null }) {
  const data = await loadPanel(guidelineId, versionId);
  if (!data) return null;
  const { summary, reviewDate, canOpenHub } = data;
  const lastReview = data.lastVerified ?? publishedAt?.slice(0, 10) ?? null;
  const nextDue = summary.nextReviewDue ?? reviewDate;
  const timing = reviewTiming(nextDue, currentDate());
  const status = summary.status as GuidelineGovStatus;
  const outdated = status === "approved" && summary.governedVersionId !== null && summary.governedVersionId !== versionId;
  const requirements = [...summary.standardCodes, ...summary.elementCodes];
  return (
    <details className="gov-protocol-panel">
      <summary>
        <span className="gov-protocol-title">Governance</span>
        <span className={`gov-pill gov-pill-${outdated ? "warn" : status === "approved" ? "ok" : status === "changes_requested" ? "bad" : "muted"}`}>{outdated ? "Approved on an earlier version" : GUIDELINE_STATUS_LABEL[status] ?? status}</span>
        <span className={`gov-pill gov-pill-${timing === "overdue" ? "bad" : timing === "due_soon" ? "warn" : "muted"}`}>{nextDue ? `${timing === "overdue" ? "Review overdue" : "Next review"} ${formatDate(nextDue)}` : "No review date"}</span>
      </summary>
      <dl>
        <dt>Protocol version</dt><dd>v{version}</dd>
        <dt>Last review</dt><dd>{formatDate(lastReview)}</dd>
        <dt>Next review due</dt><dd>{formatDate(nextDue)}</dd>
        <dt>Governance approval</dt><dd>{outdated ? "Approved on an earlier version; this version has not been reviewed by governance yet." : GUIDELINE_STATUS_LABEL[status] ?? status}</dd>
        <dt>Quality indicators</dt><dd>{summary.indicatorTitles.length ? summary.indicatorTitles.join(" · ") : "None linked"}</dd>
        <dt>Accreditation requirements</dt><dd>{requirements.length ? requirements.join(" · ") : "None linked"}</dd>
      </dl>
      {canOpenHub ? <Link href={`/dashboard/accreditation-and-audits/policies/guidelines?view=${guidelineId}`}>Open in the governance hub</Link> : null}
    </details>
  );
}

/** Reads everything the panel needs; null (panel hidden) on any failure, e.g. before the V2.1 migration is applied. */
async function loadPanel(guidelineId: string, versionId: string) {
  try {
    const actor = await getGovernanceActor();
    if (!actor) return null;
    const ctx = await openContext(actor);
    const [summary, versionRow] = await Promise.all([
      loadGuidelineSummary(ctx, guidelineId),
      ctx.client.from("guideline_versions").select("review_date, last_verified_date").eq("id", versionId).maybeSingle(),
    ]);
    if (!summary) return null;
    return {
      summary,
      reviewDate: (versionRow.data?.review_date as string | null | undefined) ?? null,
      lastVerified: (versionRow.data?.last_verified_date as string | null | undefined) ?? null,
      canOpenHub: canReadGovernance(actor),
    };
  } catch {
    return null;
  }
}
