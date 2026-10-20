import Link from "next/link";
import { Badge, EvidenceBadge, OutcomeBadge, RatingBadge, Stat } from "@/components/accreditation/ui";
import { PrintButton } from "@/components/accreditation/print-button";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate, formatDate, formatStamp } from "@/lib/governance/clock";
import { canReadGovernance } from "@/lib/governance/policy";
import { buildReportRows } from "@/lib/governance/report";
import { loadEvidence, loadSettings, loadStandards, loadStatuses, openContext } from "@/lib/governance/repository";
import { computeReadiness } from "@/lib/governance/scoring";

const BASE = "/dashboard/accreditation-and-audits";

export default async function ReportPage() {
  const actor = await getGovernanceActor();
  if (!actor || !canReadGovernance(actor)) {
    return <p className="gh-notice gh-notice-bad" role="alert">The survey report is visible to governance staff and auditors.</p>;
  }
  const today = currentDate();
  const ctx = await openContext(actor);
  const loaded = await Promise.all([loadStandards(ctx), loadStatuses(ctx), loadEvidence(ctx), loadSettings(ctx)]).catch(() => null);
  if (!loaded) return <p className="gh-notice gh-notice-bad" role="alert">The report could not be loaded. Has the accreditation hub migration been applied?</p>;
  const [standards, statuses, evidence, settings] = loaded;
  const readiness = computeReadiness(standards, statuses, evidence, settings, today);
  const rows = buildReportRows(standards, statuses, evidence, today);
  const chapters = [...new Set(rows.map((r) => r.standard.chapterCode || r.standard.chapterName || "—"))];

  return (
    <>
      <header className="gh-head">
        <div>
          <div className="gh-eyebrow">Accreditation hub</div>
          <h1>Survey readiness report</h1>
          <p>Generated {formatStamp(today.toISOString())}{settings.editionLabel ? ` · ${settings.editionLabel}` : ""}</p>
        </div>
        <div className="gh-btnrow gh-noprint">
          <a className="ui-button" href={`${BASE}/report/csv`}>Download CSV</a>
          <PrintButton />
        </div>
      </header>

      <section className="gh-card">
        <div className="gh-btnrow"><OutcomeBadge outcome={readiness.outcome} /></div>
        <p>{readiness.outcomeNote}</p>
        <div className="gh-grid">
          <Stat label="Internal readiness estimate" value={readiness.overallPct === null ? "—" : `${readiness.overallPct}%`} note={readiness.recordedPct === null ? undefined : `${readiness.recordedPct}% as recorded`} />
          <Stat label="Assessed" value={`${readiness.assessed} / ${readiness.applicable}`} note={readiness.coveragePct === null ? undefined : `${readiness.coveragePct}% coverage`} />
          <Stat label="ESRs not satisfactory" value={`${readiness.esrNotSatisfactory} / ${readiness.esrTotal}`} tone={readiness.esrNotSatisfactory > 0 ? "warn" : "ok"} />
          <Stat label="Evidence completeness" value={readiness.evidenceCompletenessPct === null ? "—" : `${readiness.evidenceCompletenessPct}%`} note="Separate from the score" />
          <Stat label="Evidence missing or expired" value={readiness.satisfactoryWithoutCurrentEvidence} tone={readiness.satisfactoryWithoutCurrentEvidence > 0 ? "warn" : "ok"} note="Counted as partial" />
        </div>
        <p className="gh-meta">Internal readiness estimate only, not an accreditation decision. Method: {readiness.methodVersion}. Scoring follows the thresholds in <Link href={`${BASE}/settings`}>Settings</Link>: {settings.scoringSourceNote}</p>
      </section>

      {standards.length === 0 ? <p className="gh-notice">No standards imported yet.</p> : chapters.map((chapter) => {
        const items = rows.filter((r) => (r.standard.chapterCode || r.standard.chapterName || "—") === chapter);
        const summary = readiness.chapters.find((c) => c.key === chapter);
        return (
          <section className="gh-card gh-print-section" key={chapter}>
            <div className="gh-head">
              <h2>{chapter}{items[0]?.standard.chapterName && items[0].standard.chapterName !== chapter ? ` · ${items[0].standard.chapterName}` : ""}</h2>
              <Badge tone="info">{summary?.pct === null || summary === undefined ? "Not assessed" : `${summary.pct}%`}</Badge>
            </div>
            <div className="gh-table-wrap">
              <table className="gh-table">
                <thead><tr><th scope="col">Standard</th><th scope="col">Rating</th><th scope="col">Evidence</th><th scope="col">Assessed</th><th scope="col">Next review</th></tr></thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.standard.id}>
                      <td><strong>{r.standard.code}</strong> {r.standard.isEsr ? <Badge tone="bad">ESR</Badge> : null}<div className="gh-meta gh-clamp">{r.standard.description}</div></td>
                      <td><RatingBadge rating={r.rating} /></td>
                      <td><EvidenceBadge health={r.health} count={r.evidenceCount} /></td>
                      <td>{formatDate(r.assessedAt)}</td>
                      <td>{formatDate(r.nextReviewDue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </>
  );
}
