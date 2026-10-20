import Link from "next/link";
import {
  addCapaAction, reportIncidentAction, setCapaStatusAction, updateIncidentAction,
} from "@/app/(workspace)/dashboard/accreditation-and-audits/actions";
import { Badge, Details, Empty, Notice, RiskBadge, Stat, nameOf, pageParam, type Tone } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate, formatDate, formatStamp } from "@/lib/governance/clock";
import { canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import { loadCapa, loadDepartments, loadIncidentFiles, loadIncidents, loadPeople, openContext, signedUrl } from "@/lib/governance/repository";
import { IMPACT_LABEL, LIKELIHOOD_LABEL, isCapaOverdue, isoDate, riskBand, summariseSafety } from "@/lib/governance/scoring";
import type { CapaRow, IncidentRow, IncidentStatus } from "@/lib/governance/types";

const BASE = "/dashboard/accreditation-and-audits";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUS_LABEL: Record<IncidentStatus, string> = { reported: "Reported", under_investigation: "Under investigation", capa_assigned: "Actions assigned", under_review: "Under review", closed: "Closed" };
const CATEGORIES = ["Medication", "Patient fall", "Delayed treatment", "Equipment", "Infection control", "Communication / handover", "Documentation / consent", "Patient identification", "Procedure / surgery", "Behaviour / security", "Other"];
const CAPA_STATUS_LABEL = { open: "Open", in_progress: "In progress", done: "Done · awaiting verification", verified: "Verified" } as const;

export default async function IncidentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const done = pageParam(sp.done), error = pageParam(sp.error);
  const status = pageParam(sp.status) || "open";
  const show = pageParam(sp.show);
  const view = pageParam(sp.view);
  const l = Number.parseInt(pageParam(sp.l), 10) || 0;
  const i = Number.parseInt(pageParam(sp.i), 10) || 0;

  const actor = await getGovernanceActor();
  if (!actor) return <p className="gh-notice gh-notice-bad" role="alert">Sign in to report or review incidents.</p>;
  const reader = canReadGovernance(actor);
  const canWrite = canWriteGovernance(actor);
  const today = currentDate();
  const todayIso = isoDate(today);
  const ctx = await openContext(actor);

  const loaded = await Promise.all([loadIncidents(ctx), reader ? loadCapa(ctx) : Promise.resolve([] as CapaRow[]), canWrite ? loadPeople(ctx).catch(() => []) : Promise.resolve([]), loadDepartments(ctx).catch(() => [])]).catch(() => null);
  if (!loaded) return <p className="gh-notice gh-notice-bad" role="alert">Incidents could not be loaded. Has the accreditation hub migration been applied?</p>;
  const [incidents, capa, people, departments] = loaded;
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  const safety = summariseSafety(incidents, capa, today);

  const openIncidents = incidents.filter((x) => x.status !== "closed");
  const cellCount = (likelihood: number, impact: number) => openIncidents.filter((x) => x.likelihood === likelihood && x.impact === impact).length;
  const filtered = incidents.filter((x) => {
    if (status === "open" && x.status === "closed") return false;
    if (status === "closed" && x.status !== "closed") return false;
    if (l && x.likelihood !== l) return false;
    if (i && x.impact !== i) return false;
    if (show === "capa_overdue") return capa.some((c) => c.incidentId === x.id && isCapaOverdue(c, today));
    return true;
  });
  const selected = UUID.test(view) ? incidents.find((x) => x.id === view) ?? null : null;
  const files = selected ? await loadIncidentFiles(ctx, selected.id).catch(() => []) : [];
  const fileUrls = new Map<string, string | null>();
  for (const f of files) fileUrls.set(f.id, await signedUrl(ctx, f.storagePath));
  const selectedCapa = selected ? capa.filter((c) => c.incidentId === selected.id) : [];
  const dueSoon = capa.filter((c) => c.status !== "verified").sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const filterLink = (over: Record<string, string>) => {
    const params = new URLSearchParams();
    if (status !== "open") params.set("status", status);
    for (const [k, v] of Object.entries(over)) { if (v) params.set(k, v); else params.delete(k); }
    const s = params.toString();
    return s ? `${BASE}/incidents?${s}` : `${BASE}/incidents`;
  };
  const sevTone = (x: IncidentRow): Tone => (x.severity === "critical" ? "bad" : x.severity === "high" ? "warn" : x.severity === "medium" ? "info" : "muted");

  return (
    <>
      <header className="gh-head">
        <div><div className="gh-eyebrow">Accreditation hub</div><h1>Incidents &amp; corrective actions</h1>
          <p>{reader ? "Surveyors look for proof that the hospital learns from what goes wrong: every serious incident needs a root cause and an owned, dated, verified fix." : "Report anything that went wrong or nearly did. You can see the incidents you have reported."}</p></div>
      </header>
      <Notice done={done} error={error} />

      {reader ? (
        <div className="gh-grid">
          <Stat label="Open incidents" value={safety.openIncidents} href={filterLink({ status: "open" })} />
          <Stat label="Open sentinel events" value={safety.openSentinel} tone={safety.openSentinel > 0 ? "bad" : "ok"} note={safety.sentinelMissingRca > 0 ? `${safety.sentinelMissingRca} without root cause` : "None awaiting root cause"} />
          <Stat label="High / extreme risk open" value={safety.highRiskOpen} tone={safety.highRiskOpen > 0 ? "warn" : "ok"} note="Risk score 10 or more" />
          <Stat label="Overdue actions" value={safety.capaOverdue} href={filterLink({ show: "capa_overdue" })} tone={safety.capaOverdue > 0 ? "bad" : "ok"} note={safety.capaAwaitingVerification > 0 ? `${safety.capaAwaitingVerification} awaiting verification` : "Nothing awaiting verification"} />
        </div>
      ) : null}

      <Details title="Report an incident or near miss" open={sp.report === "1" || incidents.length === 0}>
        <form action={reportIncidentAction} className="gh-form" encType="multipart/form-data">
          <input type="hidden" name="returnTo" value={`${BASE}/incidents`} />
          <label className="gh-field gh-wide">What happened (title)<input name="title" required maxLength={240} /></label>
          <label className="gh-field">Category<select name="category" defaultValue="Other">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="gh-field">When<input type="datetime-local" name="occurredAt" /></label>
          <label className="gh-field">Department<input name="department" list="gh-departments" maxLength={160} /><datalist id="gh-departments">{departments.map((d) => <option key={d} value={d} />)}</datalist></label>
          <label className="gh-field">Location<input name="location" maxLength={200} placeholder="Ward, bay, room" /></label>
          <label className="gh-field">Severity of harm
            <select name="severity" defaultValue="low"><option value="low">Low: no harm</option><option value="medium">Medium: minor harm</option><option value="high">High: significant harm</option><option value="critical">Critical: death or permanent harm</option></select></label>
          <label className="gh-field">Likelihood of recurrence
            <select name="likelihood" defaultValue="1">{LIKELIHOOD_LABEL.map((label, idx) => <option key={label} value={idx + 1}>{idx + 1} · {label}</option>)}</select></label>
          <label className="gh-field">Potential impact
            <select name="impact" defaultValue="1">{IMPACT_LABEL.map((label, idx) => <option key={label} value={idx + 1}>{idx + 1} · {label}</option>)}</select></label>
          <label className="gh-field">Patient MRN (optional)<input name="patientMrn" maxLength={40} autoComplete="off" /><small>Demonstration data only for now. Do not enter real patient identifiers.</small></label>
          <label className="gh-field gh-wide">Description<textarea name="description" maxLength={8000} /></label>
          <label className="gh-field">Situation<textarea name="sbarS" maxLength={2000} /></label>
          <label className="gh-field">Background<textarea name="sbarB" maxLength={2000} /></label>
          <label className="gh-field">Assessment<textarea name="sbarA" maxLength={2000} /></label>
          <label className="gh-field">Recommendation<textarea name="sbarR" maxLength={2000} /></label>
          <label className="gh-field gh-wide">Attachments (up to 5 · PDF, image, Word, Excel · max 20 MB each)<input type="file" name="files" multiple /></label>
          {canWrite ? <label className="gh-check gh-wide"><input type="checkbox" name="isSentinel" /> This is a sentinel event</label> : null}
          <div><button className="ui-button ui-button-primary" type="submit">Submit report</button></div>
        </form>
      </Details>

      {reader ? (
        <div className="gh-grid-2">
          <section className="gh-card" aria-labelledby="matrix-heading">
            <h2 id="matrix-heading">Risk matrix</h2>
            <p className="gh-sub">Open incidents by likelihood and impact. Select a cell to filter the list below.</p>
            <div className="gh-matrix-wrap">
              <div className="gh-axis-y">Likelihood</div>
              <div>
                <div className="gh-matrix">
                  {[5, 4, 3, 2, 1].map((likelihood) => (
                    <MatrixRow key={likelihood} likelihood={likelihood} selected={{ l, i }} count={cellCount} href={(li, im) => filterLink({ l: String(li), i: String(im) })} />
                  ))}
                  <span />
                  {IMPACT_LABEL.map((label) => <span className="gh-mlabel" key={label}>{label}</span>)}
                </div>
                <div className="gh-axis-y" style={{ writingMode: "horizontal-tb", transform: "none", marginTop: ".3rem" }}>Impact</div>
              </div>
            </div>
            {l || i ? <p><Link className="ui-button" href={filterLink({ l: "", i: "" })}>Clear matrix filter</Link></p> : null}
          </section>

          <section className="gh-card" aria-labelledby="actions-heading">
            <h2 id="actions-heading">Corrective actions</h2>
            <p className="gh-sub">Everything not yet verified, soonest deadline first.</p>
            {dueSoon.length === 0 ? <Empty title="No open actions">Actions appear here when you add them to an incident.</Empty> : (
              <ul className="gh-actions">
                {dueSoon.slice(0, 8).map((c) => {
                  const inc = incidents.find((x) => x.id === c.incidentId);
                  return (
                    <li key={c.id}>
                      <Link className="gh-action" href={inc ? `${BASE}/incidents?view=${inc.id}&status=all#incident` : `${BASE}/audits`} style={{ gridTemplateColumns: "auto 1fr auto" }}>
                        <span className={`gh-dot ${isCapaOverdue(c, today) ? "gh-dot-bad" : c.status === "done" ? "gh-dot-info" : "gh-dot-warn"}`} aria-hidden="true" />
                        <span><strong className="gh-clamp">{c.action}</strong><span className="gh-hint">{inc ? inc.reference : "Audit"} · {nameOf(peopleById, c.ownerUserId)} · due {formatDate(c.dueDate)}</span></span>
                        <Badge tone={isCapaOverdue(c, today) ? "bad" : c.status === "done" ? "info" : "warn"}>{isCapaOverdue(c, today) ? "Overdue" : CAPA_STATUS_LABEL[c.status].split(" ·")[0]}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      <section aria-labelledby="list-heading" className="gh-card">
        <div className="gh-head">
          <h2 id="list-heading" style={{ margin: 0 }}>{reader ? "Incidents" : "Your reports"}</h2>
          <div className="gh-btnrow gh-noprint">
            {(["open", "closed", "all"] as const).map((s) => <Link key={s} className={`ui-button${status === s ? " ui-button-primary" : ""}`} href={filterLink({ status: s === "open" ? "" : s })}>{s === "open" ? "Open" : s === "closed" ? "Closed" : "All"}</Link>)}
          </div>
        </div>
        {filtered.length === 0 ? <Empty title="No incidents to show">{incidents.length === 0 ? "No incidents have been reported." : "Nothing matches the current filter."}</Empty> : (
          <ul className="gh-actions" style={{ marginTop: ".7rem" }}>
            {filtered.map((x) => (
              <li key={x.id}>
                <Link className="gh-action" href={`${BASE}/incidents?view=${x.id}&status=${status}#incident`} style={{ gridTemplateColumns: "auto 1fr auto" }}>
                  <span className={`gh-dot gh-dot-${x.severity === "critical" || x.severity === "high" ? "bad" : x.severity === "medium" ? "warn" : "info"}`} aria-hidden="true" />
                  <span><strong>{x.reference} · {x.title}</strong><span className="gh-hint">{x.category}{x.department ? ` · ${x.department}` : ""} · {formatStamp(x.occurredAt)}</span></span>
                  <span className="gh-btnrow">{x.isSentinel ? <Badge tone="bad">Sentinel</Badge> : null}<Badge tone={sevTone(x)}>{x.severity}</Badge><Badge tone="muted">{STATUS_LABEL[x.status]}</Badge></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected ? (
        <section className="gh-card" id="incident" aria-labelledby="incident-heading">
          <div className="gh-head">
            <div><div className="gh-eyebrow">{selected.reference}</div><h2 id="incident-heading" style={{ margin: 0 }}>{selected.title}</h2>
              <p className="gh-meta" style={{ margin: ".2rem 0 0" }}>{selected.category} · {selected.department || "No department"}{selected.location ? ` · ${selected.location}` : ""} · {formatStamp(selected.occurredAt)} · reported by {reader ? nameOf(peopleById, selected.reportedBy) : "you"}</p></div>
            <div className="gh-btnrow">{selected.isSentinel ? <Badge tone="bad">Sentinel event</Badge> : null}<RiskBadge score={selected.riskScore} /><Badge tone="muted">{STATUS_LABEL[selected.status]}</Badge></div>
          </div>
          {selected.description ? <p>{selected.description}</p> : null}
          {Object.values(selected.sbar).some(Boolean) ? (
            <table className="gh-table"><tbody>
              {([["Situation", selected.sbar.s], ["Background", selected.sbar.b], ["Assessment", selected.sbar.a], ["Recommendation", selected.sbar.r]] as const).filter(([, v]) => v).map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}
            </tbody></table>
          ) : null}
          {selected.patientMrn ? <p className="gh-meta">MRN: {selected.patientMrn}</p> : null}
          {files.length > 0 ? <div className="gh-btnrow">{files.map((f) => fileUrls.get(f.id) ? <a key={f.id} className="ui-button" href={fileUrls.get(f.id) as string} target="_blank" rel="noopener noreferrer">{f.fileName}</a> : <span key={f.id} className="gh-meta">{f.fileName}</span>)}</div> : null}

          {reader ? (
            <>
              <h3 style={{ marginTop: "1rem" }}>Corrective and preventive actions</h3>
              {selectedCapa.length === 0 ? <p className="gh-meta">No actions yet.{selected.isSentinel ? " A sentinel event cannot be closed without at least one." : ""}</p> : (
                <ul className="gh-actions">
                  {selectedCapa.map((c) => (
                    <li className="gh-item" key={c.id}>
                      <div className="gh-btnrow" style={{ justifyContent: "space-between" }}>
                        <h4>{c.action}</h4>
                        <Badge tone={isCapaOverdue(c, today) ? "bad" : c.status === "verified" ? "ok" : c.status === "done" ? "info" : "warn"}>{isCapaOverdue(c, today) ? "Overdue" : CAPA_STATUS_LABEL[c.status]}</Badge>
                      </div>
                      <span className="gh-meta">{c.kind === "corrective" ? "Corrective" : "Preventive"} · owner {nameOf(peopleById, c.ownerUserId)} · due {formatDate(c.dueDate)}{c.doneAt ? ` · done ${formatDate(c.doneAt)}` : ""}</span>
                      {c.status === "verified" ? <span className="gh-meta">Verified by {nameOf(peopleById, c.verifiedBy)} on {formatDate(c.verifiedAt)}: {c.verificationNote}{c.verifiedBy === c.ownerUserId ? " (self-verified)" : ""}</span> : null}
                      <div className="gh-btnrow">
                        {c.status === "open" ? <CapaButton capaId={c.id} status="in_progress" label="Start" /> : null}
                        {c.status === "open" || c.status === "in_progress" ? <CapaButton capaId={c.id} status="done" label="Mark done" primary /> : null}
                        {c.status === "done" && canWrite ? (
                          <form action={setCapaStatusAction} className="gh-btnrow">
                            <input type="hidden" name="capaId" value={c.id} /><input type="hidden" name="status" value="verified" /><input type="hidden" name="returnTo" value={`${BASE}/incidents`} />
                            <input name="note" required maxLength={4000} placeholder="How did you check it worked?" aria-label="Verification note" style={{ minWidth: "16rem", padding: ".4rem .6rem", border: "1px solid var(--line-strong)", borderRadius: 8, background: "var(--surface)", color: "inherit" }} />
                            <button className="ui-button ui-button-primary" type="submit">Verify</button>
                          </form>
                        ) : null}
                        {canWrite && c.status !== "open" && c.status !== "verified" ? <CapaButton capaId={c.id} status="open" label="Reopen" /> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {canWrite ? (
                <Details title="Add a corrective or preventive action">
                  <form action={addCapaAction} className="gh-form">
                    <input type="hidden" name="incidentId" value={selected.id} /><input type="hidden" name="returnTo" value={`${BASE}/incidents`} />
                    <label className="gh-field gh-wide">Action<textarea name="action" required maxLength={2000} placeholder="What will change, specifically?" /></label>
                    <label className="gh-field">Type<select name="kind" defaultValue="corrective"><option value="corrective">Corrective (fix this case)</option><option value="preventive">Preventive (stop it recurring)</option></select></label>
                    <label className="gh-field">Owner<select name="ownerUserId" required defaultValue=""><option value="" disabled>Choose…</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                    <label className="gh-field">Deadline<input type="date" name="dueDate" required min={todayIso} /></label>
                    <div><button className="ui-button ui-button-primary" type="submit">Add action</button></div>
                  </form>
                </Details>
              ) : null}
            </>
          ) : null}

          {canWrite ? (
            <Details title="Manage this incident" open={selected.status !== "closed" && selected.isSentinel}>
              <form action={updateIncidentAction} className="gh-form">
                <input type="hidden" name="incidentId" value={selected.id} /><input type="hidden" name="returnTo" value={`${BASE}/incidents`} />
                <label className="gh-field">Status<select name="status" defaultValue={selected.status}>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                <label className="gh-field">Severity<select name="severity" defaultValue={selected.severity}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
                <label className="gh-field">Likelihood<select name="likelihood" defaultValue={selected.likelihood}>{LIKELIHOOD_LABEL.map((label, idx) => <option key={label} value={idx + 1}>{idx + 1} · {label}</option>)}</select></label>
                <label className="gh-field">Impact<select name="impact" defaultValue={selected.impact}>{IMPACT_LABEL.map((label, idx) => <option key={label} value={idx + 1}>{idx + 1} · {label}</option>)}</select></label>
                <label className="gh-check"><input type="checkbox" name="isSentinel" defaultChecked={selected.isSentinel} /> Sentinel event</label>
                <label className="gh-field gh-wide">Root cause analysis<textarea name="rootCause" defaultValue={selected.rootCause} maxLength={8000} /><small>Required before a sentinel event can be closed.</small></label>
                <label className="gh-field gh-wide">Closure note<textarea name="closureNote" defaultValue={selected.closureNote} maxLength={4000} /><small>Required to close. All actions must be done first.</small></label>
                <div><button className="ui-button ui-button-primary" type="submit">Save</button></div>
              </form>
            </Details>
          ) : null}
        </section>
      ) : null}
    </>
  );
}

function MatrixRow({ likelihood, selected, count, href }: { likelihood: number; selected: { l: number; i: number }; count: (l: number, i: number) => number; href: (l: number, i: number) => string }) {
  return (
    <>
      <span className="gh-mlabel">{LIKELIHOOD_LABEL[likelihood - 1]}</span>
      {[1, 2, 3, 4, 5].map((impact) => {
        const n = count(likelihood, impact);
        const isSel = selected.l === likelihood && selected.i === impact;
        const cls = `gh-mcell gh-m-${riskBand(likelihood * impact)}`;
        const label = `Likelihood ${LIKELIHOOD_LABEL[likelihood - 1]}, impact ${IMPACT_LABEL[impact - 1]}: ${n} open incident${n === 1 ? "" : "s"}`;
        return n > 0
          ? <Link key={impact} className={cls} href={href(likelihood, impact)} aria-label={label} aria-current={isSel ? "true" : undefined}>{n}</Link>
          : <span key={impact} className={cls} aria-label={label}>{""}</span>;
      })}
    </>
  );
}

function CapaButton({ capaId, status, label, primary }: { capaId: string; status: string; label: string; primary?: boolean }) {
  return (
    <form action={setCapaStatusAction}>
      <input type="hidden" name="capaId" value={capaId} /><input type="hidden" name="status" value={status} /><input type="hidden" name="returnTo" value={`${BASE}/incidents`} />
      <button className={`ui-button${primary ? " ui-button-primary" : ""}`} type="submit">{label}</button>
    </form>
  );
}
