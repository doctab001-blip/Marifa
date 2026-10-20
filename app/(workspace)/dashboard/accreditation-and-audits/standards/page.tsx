import Link from "next/link";
import { importStandardsAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions";
import { Badge, Details, Empty, EvidenceBadge, Notice, RatingBadge, nameOf, pageParam } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate, formatDate } from "@/lib/governance/clock";
import { canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import { loadEvidence, loadPeople, loadSettings, loadStandards, loadStatuses, openContext } from "@/lib/governance/repository";
import { evidenceHealth, isBackedByEvidence, isoDate } from "@/lib/governance/scoring";
import type { EvidenceRow } from "@/lib/governance/types";

const BASE = "/dashboard/accreditation-and-audits";
const PAGE_SIZE = 40;

const SHOW_LABEL: Record<string, string> = {
  esr: "All ESRs", esr_gap: "ESRs needing action", unassessed: "Not assessed", insufficient: "Insufficient", partial: "Partial", satisfactory: "Satisfactory",
  no_evidence: "Rated satisfactory without current evidence", evidence_expiring: "Evidence expiring", review_overdue: "Re-assessment overdue",
};

export default async function StandardsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const done = pageParam(sp.done), error = pageParam(sp.error);
  const q = pageParam(sp.q).trim().toLowerCase();
  const chapter = pageParam(sp.chapter);
  const show = pageParam(sp.show);
  const page = Math.max(1, Number.parseInt(pageParam(sp.page), 10) || 1);

  const actor = await getGovernanceActor();
  if (!canReadGovernance(actor)) {
    return <><header className="gh-head"><div><div className="gh-eyebrow">Accreditation hub</div><h1>Standards &amp; evidence</h1></div></header>
      <p className="gh-notice gh-notice-bad" role="alert">Standards and evidence are visible to governance staff and auditors. Ask an administrator to assign you the governance lead, quality manager, clinical director or auditor role.</p></>;
  }
  const canWrite = canWriteGovernance(actor);
  const today = currentDate();
  const todayIso = isoDate(today);
  const ctx = await openContext(actor);

  const loaded = await Promise.all([loadStandards(ctx), loadStatuses(ctx), loadEvidence(ctx), loadPeople(ctx).catch(() => []), loadSettings(ctx)]).catch(() => null);
  if (!loaded) {
    return <><header className="gh-head"><div><div className="gh-eyebrow">Accreditation hub</div><h1>Standards &amp; evidence</h1></div></header>
      <p className="gh-notice gh-notice-bad" role="alert">The register could not be loaded. Has the accreditation hub migration (20261020190000) been applied?</p></>;
  }
  const [standards, statuses, evidence, people, settings] = loaded;

  const statusById = new Map(statuses.map((row) => [row.standardId, row]));
  const evidenceById = new Map<string, EvidenceRow[]>();
  for (const item of evidence) evidenceById.set(item.standardId, [...(evidenceById.get(item.standardId) ?? []), item]);
  const peopleById = new Map(people.map((person) => [person.userId, person.displayName]));

  const rows = standards.map((standard) => {
    const status = statusById.get(standard.id);
    const items = evidenceById.get(standard.id) ?? [];
    const rating = status?.rating ?? null;
    const health = evidenceHealth(items, today);
    const effectiveOk = rating === "satisfactory" && isBackedByEvidence(health);
    return { standard, status, rating, health, count: items.filter((e) => !e.withdrawnAt).length, effectiveOk, reviewOverdue: Boolean(status?.nextReviewDue && status.nextReviewDue < todayIso) };
  });

  const chapters = [...new Set(standards.map((s) => s.chapterCode || s.chapterName).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const filtered = rows.filter((row) => {
    if (row.rating === "not_applicable") return false;
    if (q && !`${row.standard.code} ${row.standard.description} ${row.standard.department}`.toLowerCase().includes(q)) return false;
    if (chapter && (row.standard.chapterCode || row.standard.chapterName) !== chapter) return false;
    switch (show) {
      case "esr": return row.standard.isEsr;
      case "esr_gap": return row.standard.isEsr && !row.effectiveOk;
      case "unassessed": return row.rating === null;
      case "insufficient": case "partial": case "satisfactory": return row.rating === show;
      case "no_evidence": return row.rating === "satisfactory" && !isBackedByEvidence(row.health);
      case "evidence_expiring": return row.health === "expiring";
      case "review_overdue": return row.reviewOverdue;
      default: return true;
    }
  });
  const hiddenNa = rows.filter((row) => row.rating === "not_applicable").length;
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const link = (over: Record<string, string | number>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (chapter) params.set("chapter", chapter);
    if (show) params.set("show", show);
    for (const [key, value] of Object.entries(over)) { if (value === "" || value === 0) params.delete(key); else params.set(key, String(value)); }
    const s = params.toString();
    return s ? `${BASE}/standards?${s}` : `${BASE}/standards`;
  };

  return (
    <>
      <header className="gh-head">
        <div><div className="gh-eyebrow">Accreditation hub</div><h1>Standards &amp; evidence</h1>
          <p>{standards.length === 0 ? "Load the standards you are surveyed against, then attach evidence and record assessments." : `${standards.length} standards${settings.editionLabel ? ` · ${settings.editionLabel}` : ""}. Open a standard to attach evidence and assess it.`}</p></div>
      </header>
      <Notice done={done} error={error} />

      {canWrite ? (
        <Details title="Import standards from CSV" open={standards.length === 0}>
          <p className="gh-meta" style={{ margin: 0 }}>
            Use the standards from the CBAHI manual your hospital is licensed to use. Columns: <code>code</code> and <code>description</code> are required;
            optional <code>chapter_code</code>, <code>chapter_name</code>, <code>esr</code> (yes/no) and <code>department</code>. Existing codes in the same edition are left unchanged.{" "}
            <a href={`${BASE}/standards/template`}><strong>Download the empty template</strong></a>.
          </p>
          <form action={importStandardsAction} className="gh-form" encType="multipart/form-data">
            <input type="hidden" name="returnTo" value={`${BASE}/standards`} />
            <label className="gh-field">Edition<input name="edition" required maxLength={160} placeholder="e.g. the edition named on your CBAHI licence" defaultValue={settings.editionLabel} /></label>
            <label className="gh-field">CSV file<input type="file" name="file" accept=".csv,text/csv" required /></label>
            <div><button className="ui-button ui-button-primary" type="submit">Import</button></div>
          </form>
        </Details>
      ) : null}

      {standards.length === 0 ? (
        <Empty title="No standards loaded yet">{canWrite ? "Import your register above to begin." : "A governance lead needs to import the standards register."}</Empty>
      ) : (
        <>
          <form className="gh-filters gh-noprint" method="get">
            <label className="gh-field" style={{ flex: "2 1 220px" }}>Search<input name="q" defaultValue={q} placeholder="Code, wording or department" /></label>
            <label className="gh-field" style={{ flex: "1 1 160px" }}>Chapter
              <select name="chapter" defaultValue={chapter}><option value="">All chapters</option>{chapters.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
            <label className="gh-field" style={{ flex: "1 1 200px" }}>Show
              <select name="show" defaultValue={show}><option value="">All applicable</option>{Object.entries(SHOW_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <button className="ui-button" type="submit">Filter</button>
            {(q || chapter || show) ? <Link className="ui-button" href={`${BASE}/standards`}>Clear</Link> : null}
          </form>
          <div className="gh-btnrow">
            <Badge tone="info">{filtered.length} shown</Badge>
            {show ? <Badge tone="warn">{SHOW_LABEL[show] ?? show}</Badge> : null}
            {hiddenNa > 0 ? <Badge tone="muted">{hiddenNa} not applicable hidden</Badge> : null}
          </div>

          {visible.length === 0 ? <Empty title="No standards match">Try clearing a filter.</Empty> : (
            <section className="gh-card" style={{ padding: 0 }}>
              <div className="gh-table-wrap">
                <table className="gh-table">
                  <thead><tr><th scope="col">Standard</th><th scope="col">Requirement</th><th scope="col">Rating</th><th scope="col">Evidence</th><th scope="col">Owner</th><th scope="col">Next review</th></tr></thead>
                  <tbody>
                    {visible.map(({ standard, status, rating, health, count, reviewOverdue }) => (
                      <tr key={standard.id}>
                        <td><Link className="gh-code" href={`${BASE}/standards/${standard.id}`}>{standard.code}</Link>
                          <div className="gh-meta">{standard.chapterCode || standard.chapterName}</div>{standard.isEsr ? <Badge tone="bad">ESR</Badge> : null}</td>
                        <td className="gh-desc"><span className="gh-clamp">{standard.description}</span></td>
                        <td><RatingBadge rating={rating} />{rating === "satisfactory" && !isBackedByEvidence(health) ? <div style={{ marginTop: ".25rem" }}><Badge tone="bad">Counted as partial</Badge></div> : null}</td>
                        <td><EvidenceBadge health={health} count={count} /></td>
                        <td>{standard.ownerUserId ? nameOf(peopleById, standard.ownerUserId) : standard.department || <span className="gh-meta">Unassigned</span>}</td>
                        <td>{status?.nextReviewDue ? <>{formatDate(status.nextReviewDue)}{reviewOverdue ? <div><Badge tone="warn">Overdue</Badge></div> : null}</> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {pages > 1 ? (
            <div className="gh-btnrow gh-noprint" aria-label="Pages">
              {current > 1 ? <Link className="ui-button" href={link({ page: current - 1 })}>Previous</Link> : null}
              <span className="gh-meta">Page {current} of {pages}</span>
              {current < pages ? <Link className="ui-button" href={link({ page: current + 1 })}>Next</Link> : null}
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
