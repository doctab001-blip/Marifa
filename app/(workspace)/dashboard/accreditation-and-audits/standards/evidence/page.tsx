import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { linkEvidenceAction, uploadEvidenceV21Action, uploadEvidenceVersionAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions-v21";
import { DropZone } from "@/components/accreditation/drop-zone";
import { Badge, Details, Empty, NeedsV21, Notice, PageHeader, Stat, nameOf, pageParam } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate, formatDate } from "@/lib/governance/clock";
import { evidenceLifecycle, supersededIds, versionHistory, type EvidenceLifecycle } from "@/lib/governance/evidence-requirements";
import { canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import { loadPeople, loadStandards, openContext, signedUrl } from "@/lib/governance/repository";
import { loadElements, loadEvidenceLinks, loadEvidenceVersions, v21 } from "@/lib/governance/repository-v21";
import { EVIDENCE_TYPE_LABEL, type EvidenceType } from "@/lib/governance/types";

const BASE = "/dashboard/accreditation-and-audits";
const PAGE_SIZE = 25;
const LIFE_LABEL: Record<EvidenceLifecycle, string> = { current: "Current", expiring: "Expiring within 60 days", expired: "Expired", withdrawn: "Withdrawn", superseded: "Superseded by a newer version" };
const LIFE_TONE = { current: "ok", expiring: "warn", expired: "bad", withdrawn: "muted", superseded: "muted" } as const;

export default async function EvidenceVaultPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = pageParam(sp.q).trim().toLowerCase();
  const type = pageParam(sp.type);
  const state = pageParam(sp.state);
  const page = Math.max(1, Number.parseInt(pageParam(sp.page), 10) || 1);
  const actor = await getGovernanceActor();
  const header = <PageHeader icon={<FolderOpen size={20} />} eyebrow={<><Link href={`${BASE}/standards`}>Standards &amp; evidence</Link> / Evidence vault</>} title="Evidence vault" subtitle="Every document on file, across standards. One stored file can support several standards and measurable elements; versions keep their history." />;
  if (!canReadGovernance(actor)) return <>{header}<p className="gh-notice gh-notice-bad" role="alert">The evidence vault is visible to governance staff and auditors.</p></>;
  const canWrite = canWriteGovernance(actor);
  const ctx = await openContext(actor);
  const today = currentDate();
  const loaded = await v21(Promise.all([loadEvidenceVersions(ctx), loadEvidenceLinks(ctx), loadElements(ctx)]));
  if (!loaded) return <>{header}<NeedsV21 what="The evidence vault" /></>;
  const [evidence, links, elements] = loaded;
  const [standards, people] = await Promise.all([loadStandards(ctx), loadPeople(ctx).catch(() => [])]);
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  const stdById = new Map(standards.map((s) => [s.id, s]));
  const elById = new Map(elements.map((e) => [e.id, e]));
  const superseded = supersededIds(evidence);
  const rows = evidence.map((e) => ({ e, life: evidenceLifecycle(e, superseded, today), links: links.filter((l) => l.evidenceId === e.id) }));
  const filtered = rows.filter(({ e, life, links: ls }) => {
    if (type && e.evidenceType !== type) return false;
    if (state && life !== state) return false;
    if (q) {
      const hay = `${e.title} ${e.fileName} ${stdById.get(e.standardId)?.code ?? ""} ${ls.map((l) => (l.standardId ? stdById.get(l.standardId)?.code : l.elementId ? elById.get(l.elementId)?.code : "")).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const urls = new Map<string, string | null>();
  for (const { e, life } of visible) if (life !== "withdrawn") urls.set(e.id, await signedUrl(ctx, e.storagePath));
  const link = (over: Record<string, string | number>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q); if (type) p.set("type", type); if (state) p.set("state", state);
    for (const [k, v] of Object.entries(over)) { if (v === "" || v === 0) p.delete(k); else p.set(k, String(v)); }
    const s = p.toString();
    return s ? `${BASE}/standards/evidence?${s}` : `${BASE}/standards/evidence`;
  };
  const count = (l: EvidenceLifecycle) => rows.filter((r) => r.life === l).length;
  const here = link({});

  return (
    <>
      {header}
      <Notice done={pageParam(sp.done)} error={pageParam(sp.error)} />
      <div className="gh-grid">
        <Stat accent="blue" label="Current documents" value={count("current")} href={link({ state: "current", page: 0 })} note={`${links.length} cross-links (no duplicate files)`} />
        <Stat accent="gold" label="Expiring soon" value={count("expiring")} tone={count("expiring") ? "warn" : "ok"} href={link({ state: "expiring", page: 0 })} />
        <Stat accent="coral" label="Expired" value={count("expired")} tone={count("expired") ? "bad" : "ok"} href={link({ state: "expired", page: 0 })} />
        <Stat accent="navy" label="Superseded / withdrawn" value={count("superseded") + count("withdrawn")} note="Kept in the history" href={link({ state: "superseded", page: 0 })} />
      </div>

      {canWrite && standards.length > 0 ? (
        <Details title="Upload a document">
          <form action={uploadEvidenceV21Action} className="gh-form" encType="multipart/form-data">
            <input type="hidden" name="returnTo" value={`${BASE}/standards/evidence`} />
            <div className="gh-wide"><DropZone name="file" required /></div>
            <label className="gh-field">Primary standard<select name="standardId" required defaultValue=""><option value="" disabled>Choose…</option>{standards.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}</select><small>Link it to more standards afterwards.</small></label>
            <label className="gh-field">Title<input name="title" maxLength={240} /></label>
            <label className="gh-field">Type<select name="evidenceType" defaultValue="other">{Object.entries(EVIDENCE_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label className="gh-field">Valid from<input type="date" name="validFrom" /></label>
            <label className="gh-field">Valid until / next review<input type="date" name="validUntil" /></label>
            <div><button className="ui-button ui-button-primary" type="submit">Upload</button></div>
          </form>
        </Details>
      ) : null}

      <form className="gh-filters gh-noprint" method="get">
        <label className="gh-field" style={{ flex: "2 1 220px" }}>Search<input name="q" defaultValue={q} placeholder="Title, file name or standard code" /></label>
        <label className="gh-field" style={{ flex: "1 1 170px" }}>Type<select name="type" defaultValue={type}><option value="">All types</option>{(Object.keys(EVIDENCE_TYPE_LABEL) as EvidenceType[]).map((k) => <option key={k} value={k}>{EVIDENCE_TYPE_LABEL[k]}</option>)}</select></label>
        <label className="gh-field" style={{ flex: "1 1 170px" }}>Status<select name="state" defaultValue={state}><option value="">Any</option>{Object.entries(LIFE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <button className="ui-button" type="submit">Filter</button>
        {q || type || state ? <Link className="ui-button" href={`${BASE}/standards/evidence`}>Clear</Link> : null}
      </form>

      {visible.length === 0 ? <Empty title={evidence.length === 0 ? "No documents yet" : "Nothing matches"}>{evidence.length === 0 ? "Upload evidence here or from a standard's page." : "Try clearing a filter."}</Empty> : (
        <section className="gh-card" style={{ padding: 0 }}>
          <div className="gh-table-wrap"><table className="gh-table">
            <thead><tr><th scope="col">Document</th><th scope="col">Supports</th><th scope="col">Status</th><th scope="col">Added</th>{canWrite ? <th scope="col"><span className="sr-only">Actions</span></th> : null}</tr></thead>
            <tbody>{visible.map(({ e, life, links: ls }) => {
              const versions = versionHistory(e, evidence);
              const url = urls.get(e.id);
              const linkedStd = new Set(ls.map((l) => l.standardId).filter(Boolean));
              return (
                <tr key={e.id}>
                  <td><strong>{url ? <a href={url} target="_blank" rel="noopener noreferrer">{e.title}</a> : e.title}</strong><div className="gh-meta">{EVIDENCE_TYPE_LABEL[e.evidenceType]} · {e.fileName}{versions.length ? ` · v${versions.length + 1}` : ""}</div>
                    {e.withdrawnReason ? <div className="gh-meta">Withdrawn: {e.withdrawnReason}</div> : null}</td>
                  <td><div className="gh-chiplist">
                    {stdById.get(e.standardId) ? <Link className="gh-chip" href={`${BASE}/standards/${e.standardId}`}>{stdById.get(e.standardId)?.code}</Link> : null}
                    {ls.map((l) => l.standardId ? <Link key={l.id} className="gh-chip" href={`${BASE}/standards/${l.standardId}`}>{stdById.get(l.standardId)?.code ?? "?"}</Link>
                      : l.elementId ? <Link key={l.id} className="gh-chip" href={`${BASE}/standards/${elById.get(l.elementId)?.standardId}`}>{stdById.get(elById.get(l.elementId)?.standardId ?? "")?.code ?? "?"} / {elById.get(l.elementId)?.code}</Link> : null)}
                  </div></td>
                  <td><Badge tone={LIFE_TONE[life]}>{life === "current" && e.validUntil ? `Valid to ${formatDate(e.validUntil)}` : LIFE_LABEL[life]}</Badge></td>
                  <td className="gh-meta">{formatDate(e.uploadedAt)}<br />{nameOf(peopleById, e.uploadedBy)}</td>
                  {canWrite ? (
                    <td>{life !== "withdrawn" && life !== "superseded" ? (
                      <div className="gh-btnrow">
                        <details className="gh-noprint"><summary className="ui-button" style={{ cursor: "pointer" }}>Link…</summary>
                          <form action={linkEvidenceAction} className="gh-form" style={{ marginTop: ".4rem", minWidth: "16rem" }}>
                            <input type="hidden" name="evidenceId" value={e.id} /><input type="hidden" name="returnTo" value={here} />
                            <label className="gh-field">Also supports<select name="target" required defaultValue=""><option value="" disabled>Choose…</option>
                              <optgroup label="Standards">{standards.filter((s) => s.id !== e.standardId && !linkedStd.has(s.id)).map((s) => <option key={s.id} value={`standard:${s.id}`}>{s.code}</option>)}</optgroup>
                              <optgroup label="Measurable elements">{elements.filter((el) => !ls.some((l) => l.elementId === el.id)).map((el) => <option key={el.id} value={`element:${el.id}`}>{stdById.get(el.standardId)?.code} / {el.code}</option>)}</optgroup>
                            </select></label>
                            <div><button className="ui-button" type="submit">Link</button></div>
                          </form></details>
                        <details className="gh-noprint"><summary className="ui-button" style={{ cursor: "pointer" }}>New version…</summary>
                          <form action={uploadEvidenceVersionAction} className="gh-form" encType="multipart/form-data" style={{ marginTop: ".4rem", minWidth: "18rem" }}>
                            <input type="hidden" name="evidenceId" value={e.id} /><input type="hidden" name="returnTo" value={here} />
                            <div className="gh-wide"><DropZone name="file" required label="Drop the new version" /></div>
                            <label className="gh-field">Valid until<input type="date" name="validUntil" /></label>
                            <div><button className="ui-button ui-button-primary" type="submit">Save version</button></div>
                          </form></details>
                      </div>
                    ) : null}</td>
                  ) : null}
                </tr>
              );
            })}</tbody>
          </table></div>
        </section>
      )}
      {pages > 1 ? (
        <div className="gh-btnrow gh-noprint">
          {current > 1 ? <Link className="ui-button" href={link({ page: current - 1 })}>Previous</Link> : null}
          <span className="gh-meta">Page {current} of {pages}</span>
          {current < pages ? <Link className="ui-button" href={link({ page: current + 1 })}>Next</Link> : null}
        </div>
      ) : null}
    </>
  );
}
