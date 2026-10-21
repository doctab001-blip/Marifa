import { getGovernanceActor } from "@/lib/governance/auth";
import { effectiveEvidence } from "@/lib/governance/repository-v21";
import { currentDate } from "@/lib/governance/clock";
import { toCsv } from "@/lib/governance/csv";
import { canReadGovernance } from "@/lib/governance/policy";
import { buildReportRows } from "@/lib/governance/report";
import { loadEvidence, loadStandards, loadStatuses, openContext } from "@/lib/governance/repository";
import { RATING_LABEL } from "@/lib/governance/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const actor = await getGovernanceActor();
  if (!actor || !canReadGovernance(actor)) return new Response("Not permitted", { status: 403 });
  const ctx = await openContext(actor);
  const [standards, statuses, ownEvidence] = await Promise.all([loadStandards(ctx), loadStatuses(ctx), loadEvidence(ctx)]);
  const evidence = await effectiveEvidence(ctx, ownEvidence);
  const rows = buildReportRows(standards, statuses, evidence, currentDate());
  const body = toCsv([
    ["chapter_code", "chapter_name", "code", "esr", "description", "rating", "evidence_state", "evidence_items", "last_assessed", "next_review_due", "notes"],
    ...rows.map((r) => [r.standard.chapterCode, r.standard.chapterName, r.standard.code, r.standard.isEsr ? "yes" : "no", r.standard.description,
      r.rating ? RATING_LABEL[r.rating] : "Not assessed", r.health, r.evidenceCount, r.assessedAt ?? "", r.nextReviewDue ?? "", r.notes]),
  ]);
  return new Response(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="survey-readiness.csv"', "Cache-Control": "no-store" } });
}
