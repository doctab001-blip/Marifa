import Link from "next/link";
import { FolderOpen, ShieldCheck, Upload } from "lucide-react";
import { importStandardsAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions";
import { createInternalStandardAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions-v21";
import { Badge, Details, Empty, EvidenceBadge, Notice, PageHeader, RatingBadge, Stat, nameOf, pageParam } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate, formatDate } from "@/lib/governance/clock";
import { canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import { loadEvidence, loadPeople, loadSettings, loadStandards, loadStatuses, openContext } from "@/lib/governance/repository";
import { effectiveEvidence, loadEditions, loadElementStatuses, loadElements, loadStandardHierarchy, v21 } from "@/lib/governance/repository-v21";
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
  const editionFilter = pageParam(sp.edition);
  const page = Math.max(1, Number.parseInt(pageParam(sp.page), 10) || 1);

  const actor = await getGovernanceActor();
  if (!canReadGovernance(actor)) {
    return <><PageHeader icon={<ShieldCheck size={20} />} title="Standards & evidence" />
      <p className="gh-notice gh-notice-bad" role="alert">Standards and evidence are visible to governance staff and auditors. Ask an administrator to assign you the governance lead, quality manager, clinical director or auditor role.</p></>;
  }
  const canWrite = canWriteGovernance(actor);
  const today = currentDate();
  const todayIso = isoDate(today);
  const ctx = await openContext(actor);

  const loaded = await Promise.all([loadStandards(ctx), loadStatuses(ctx), loadEvidence(ctx), loadPeople(ctx).catch(() => []), loadSettings(ctx)]).catch(() => null);
  if (!loaded) {
    return <><PageHeader icon={<ShieldCheck size={20} />} title="Standards & evidence" />
      <p className="gh-notice gh-notice-bad" role="alert">The register could not be loaded. Has the accreditation hub migration (20261020190000) been applied?</p></>;
  }
  const [allStandards, statuses, evidence, people, settings] = loaded;
  // V2.1: hierarchy, measurable elements and linked evidence. Null until the V2.1 migration is applied; the page still works.
  const [hierarchy, editions, elements, elementStatuses] = await Promise.all([
    v21(loadStandardHierarchy(ctx)), v21(loadEditions(ctx)), v21(loadElements(ctx)), v21(loadElementStatuses(ctx)),
  ]);
  const editionLabels = [...new Set(allStandards.map((s) => s.edition))].sort();
  const standards = editionFilter ? allStandards.filter((s) => s.edition === editionFilter) : allStandards;
  const elementsByStandard = new Map<string, number>();
  const elementsAssessed = new Map<string, number>();
  const elementRating = new Map((elementStatuses ?? []).map((x) => [x.elementId, x.rating]));
  for (const el of elements ?? []) {
    elementsByStandard.set(el.standardId, (elementsByStandard.get(el.standardId) ?? 0) + 1);
    if (elementRating.get(el.id)) elementsAssessed.set(el.standardId, (elementsAssessed.get(el.standardId) ?? 0) + 1);
  }
  const internalCount = allStandards.filter((s) => hierarchy?.get(s.id)?.isOfficial === false).length;

  const statusById = new Map(statuses.map((row) => [row.standardId, row]));
  const evidenceById = new Map<string, EvidenceRow[]>();
  // A file linked to another standard counts there too; a replaced version does not (same rule as the database).
  for (const item of await effectiveEvidence(ctx, evidence)) evidenceById.set(item.standardId, [...(evidenceById.get(item.standardId) ?? []), item]);
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
    if (editionFilter) params.set("edition", editionFilter);
    if (chapter) params.set("chapter", chapter);
    if (show) params.set("show", show);
    for (const [key, value] of Object.entries(over)) { if (value === "" || value === 0) params.delete(key); else params.set(key, String(value)); }
    const s = params.toString();
    return s ? `${BASE}/standards?${s}` : `${BASE}/standards`;
  };

  return (
    <>
      <PageHeader icon={<ShieldCheck size={20} />} title="Standards & evidence"
        subtitle={allStandards.length === 0 ? "Load the standards you are surveyed against, then attach evidence and record assessments." : `${allStandards.length} standards${elements ? ` · ${elements.length} measurable elements` : ""}${settings.editionLabel ? ` · ${settings.editionLabel}` : ""}. Open a standard to attach evidence and assess it.`}
        actions={<>
          <Link className="ui-button" href={`${BASE}/standards/evidence`}><FolderOpen size={15} aria-hidden="true" /> Evidence vault</Link>
          {canWrite ? <Link className="ui-button ui-button-primary" href={`${BASE}/standards/import`}><Upload size={15} aria-hidden="true" /> Import wizard</Link> : null}
        </>} />
      <Notice done={done} error={error} />

      {allStandards.length > 0 ? (
        <div className="gh-grid">
          <Stat accent="blue" label="Standards" value={allStandards.length} note={editionLabels.length > 1 ? `${editionLabels.length} editions` : editionLabels[0] ?? ""} />
          <Stat accent="blue" label="Measurable elements" value={elements ? elements.length : "—"} note={elements ? `${[...elementsAssessed.values()].reduce((a, b) => a + b, 0)} assessed` : "Needs the V2.1 update"} />
          <Stat accent="teal" label="Assessed standards" value={statuses.filter((x) => x.rating).length} unit={`of ${allStandards.length}`} progress={allStandards.length ? (statuses.filter((x) => x.rating).length / allStandards.length) * 100 : null} />
          <Stat accent="indigo" label="Internal (non-official)" value={internalCount} note="Written by the hospital, never shown as CBAHI text" />
        </div>
      ) : null}

      {canWrite ? (
        <div className="gh-grid-2">
          <Details title="Quick import (standards only, original importer)" open={false}>
            <p className="gh-meta" style={{ margin: 0 }}>
              For measurable elements, column mapping and a preview, use the <Link href={`${BASE}/standards/import`}><strong>import wizard</strong></Link>. Columns here: <code>code</code> and <code>description</code> are required;
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
          <Details title="Add an internal requirement (non-official)">
            <p className="gh-meta" style={{ margin: 0 }}>For the hospital&apos;s own requirements, drafted locally. They are stored and shown as <strong>internal, non-official</strong> and never presented as CBAHI wording.</p>
            <form action={createInternalStandardAction} className="gh-form">
              <input type="hidden" name="returnTo" value={`${BASE}/standards`} />
              <label className="gh-field">Edition / framework<input name="edition" required maxLength={160} list="gh-std-editions" defaultValue={settings.editionLabel} /><datalist id="gh-std-editions">{editionLabels.map((e) => <option key={e} value={e} />)}</datalist></label>
              <label className="gh-field">Code<input name="code" required maxLength={60} placeholder="e.g. INT-IPC-01" /></label>
              <label className="gh-field">Chapter code<input name="chapterCode" maxLength={40} /></label>
              <label className="gh-field">Chapter name<input name="chapterName" maxLength={200} /></label>
              <label className="gh-field">Department<input name="department" maxLength={160} /></label>
              <label className="gh-field gh-wide">Requirement<textarea name="description" required maxLength={4000} /></label>
              <div><button className="ui-button" type="submit">Add internal requirement</button></div>
            </form>
          </Details>
        </div>
      ) : null}

      {standards.length === 0 ? (
        <Empty title="No standards loaded yet">{canWrite ? <>Start with the <Link href={`${BASE}/standards/import`}><strong>import wizard</strong></Link>.</> : "A governance lead needs to import the standards register."}</Empty>
      ) : (
        <>
          <form className="gh-filters gh-noprint" method="get">
            <label className="gh-field" style={{ flex: "2 1 220px" }}>Search<input name="q" defaultValue={q} placeholder="Code, wording or department" /></label>
            {editionLabels.length > 1 ? (
              <label className="gh-field" style={{ flex: "1 1 180px" }}>Edition
                <select name="edition" defaultValue={editionFilter}><option value="">All editions</option>{editionLabels.map((e) => <option key={e} value={e}>{e}{editions?.find((x) => x.label === e && !x.isOfficial) ? " (internal)" : ""}</option>)}</select></label>
            ) : null}
            <label className="gh-field" style={{ flex: "1 1 160px" }}>Chapter
              <select name="chapter" defaultValue={chapter}><option value="">All chapters</option>{chapters.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
            <label className="gh-field" style={{ flex: "1 1 200px" }}>Show
              <select name="show" defaultValue={show}><option value="">All applicable</option>{Object.entries(SHOW_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <button className="ui-button" type="submit">Filter</button>
            {(q || chapter || show || editionFilter) ? <Link className="ui-button" href={`${BASE}/standards`}>Clear</Link> : null}
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
                  <thead><tr><th scope="col">Standard</th><th scope="col">Requirement</th><th scope="col">Elements</th><th scope="col">Rating</th><th scope="col">Evidence</th><th scope="col">Owner</th><th scope="col">Next review</th></tr></thead>
                  <tbody>
                    {visible.map(({ standard, status, rating, health, count, reviewOverdue }) => (
                      <tr key={standard.id}>
                        <td><Link className="gh-code" href={`${BASE}/standards/${standard.id}`}>{standard.code}</Link>
                          <div className="gh-meta">{standard.chapterCode || standard.chapterName}</div>{standard.isEsr ? <Badge tone="bad">ESR</Badge> : null}
                          {hierarchy?.get(standard.id)?.isOfficial === false ? <span className="gh-badge gh-badge-internal">Internal</span> : null}</td>
                        <td className="gh-desc"><span className="gh-clamp">{standard.description}</span></td>
                        <td className="gh-num">{elementsByStandard.get(standard.id) ? <><strong>{elementsAssessed.get(standard.id) ?? 0}</strong><span className="gh-meta"> / {elementsByStandard.get(standard.id)} assessed</span></> : <span className="gh-meta">—</span>}</td>
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
