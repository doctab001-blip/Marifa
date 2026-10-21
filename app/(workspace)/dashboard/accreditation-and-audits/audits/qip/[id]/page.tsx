import Link from "next/link";
import { notFound } from "next/navigation";
import { Repeat } from "lucide-react";
import { updateQipAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions";
import { scheduleReauditFromQipAction, startCycleAction, updateCycleAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions-v21";
import { LinkPanel } from "@/components/accreditation/link-panel";
import { Badge, Details, Empty, Meter, NeedsV21, Notice, PageHeader, Stat, Stepper, nameOf, pageParam } from "@/components/accreditation/ui";
import { ACT_DECISION_LABEL, CYCLE_STEPS, cycleGap, type QipCycleRow } from "@/lib/governance/audit-measures";
import { getGovernanceActor } from "@/lib/governance/auth";
import { formatDate, formatStamp } from "@/lib/governance/clock";
import { canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import { loadAudits, loadIncidents, loadPeople, loadQips, openContext } from "@/lib/governance/repository";
import { loadAuditExtras, loadAuditTemplates, loadLinkCatalogue, loadLinks, loadQipCycles, loadQipSources, v21 } from "@/lib/governance/repository-v21";

const BASE = "/dashboard/accreditation-and-audits";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NEXT: Record<string, { to: "do" | "study" | "act" | "closed"; label: string }[]> = {
  plan: [{ to: "do", label: "Start the test (Do) →" }], do: [{ to: "study", label: "Study the results →" }],
  study: [{ to: "act", label: "Decide (Act) →" }, { to: "do", label: "← Re-test" }], act: [{ to: "closed", label: "Close cycle" }], closed: [],
};

export default async function QipPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!UUID.test(id)) notFound();
  const actor = await getGovernanceActor();
  if (!canReadGovernance(actor)) return <p className="gh-notice gh-notice-bad" role="alert">Improvement projects are visible to governance staff and auditors.</p>;
  const canWrite = canWriteGovernance(actor);
  const ctx = await openContext(actor);
  const [qips, people, audits, incidents] = await Promise.all([loadQips(ctx), loadPeople(ctx).catch(() => []), loadAudits(ctx).catch(() => []), loadIncidents(ctx).catch(() => [])]);
  const qip = qips.find((q) => q.id === id);
  if (!qip) notFound();
  const here = `${BASE}/audits/qip/${id}`;
  const header = <PageHeader icon={<Repeat size={20} />} eyebrow={<><Link href={`${BASE}/audits#qip`}>Audits &amp; improvement</Link> / Improvement project</>} title={qip.title} subtitle={qip.aim || "No aim recorded yet."}
    actions={<Badge tone={qip.status === "active" ? "info" : qip.status === "completed" ? "ok" : "muted"}>{qip.status === "active" ? `Active · ${qip.phase}` : qip.status}</Badge>} />;
  const loaded = await v21(Promise.all([loadQipCycles(ctx, id), loadQipSources(ctx), loadAuditExtras(ctx), loadAuditTemplates(ctx)]));
  if (!loaded) return <>{header}<NeedsV21 what="PDSA cycles" /></>;
  const [cycles, sources, auditExtras, templates] = loaded;
  const [links, catalogue] = await Promise.all([v21(loadLinks(ctx, { type: "qip", ids: [id] })), v21(loadLinkCatalogue(ctx, ["indicator", "standard", "element", "guideline", "capa", "audit", "incident"]))]);
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  const source = sources.get(id);
  const sourceAudit = audits.find((a) => a.id === source?.sourceAuditId);
  const sourceIncident = incidents.find((i) => i.id === source?.sourceIncidentId);
  const reaudits = audits.filter((a) => auditExtras.get(a.id)?.sourceQipId === id);
  const open = cycles.find((c) => c.status !== "closed") ?? null;
  const progress = qip.baselineValue !== null && qip.targetValue !== null && qip.currentValue !== null && qip.baselineValue !== qip.targetValue
    ? Math.max(0, Math.min(100, Math.round(((qip.currentValue - qip.baselineValue) / (qip.targetValue - qip.baselineValue)) * 100))) : null;

  return (
    <>
      {header}
      <Notice done={pageParam(sp.done)} error={pageParam(sp.error)} />
      <div className="gh-grid">
        <Stat accent="emerald" label="Measure" value={<span style={{ fontSize: "1.1rem" }}>{qip.measure || "—"}</span>} note={qip.unit ? `Unit: ${qip.unit}` : undefined} />
        <Stat accent="emerald" label="Baseline → current → target" value={`${qip.baselineValue ?? "?"} → ${qip.currentValue ?? "?"}`} unit={`→ ${qip.targetValue ?? "?"}`} progress={progress} note={progress === null ? "Set a baseline and target" : `${progress}% of the way`} />
        <Stat accent="blue" label="PDSA cycles" value={cycles.length} note={open ? `Cycle ${open.cycleNo} in ${open.status}` : cycles.length ? "All cycles closed" : "Start the first cycle"} />
        <Stat accent="navy" label="Lead" value={<span style={{ fontSize: "1.1rem" }}>{nameOf(peopleById, qip.leadUserId)}</span>} note={qip.dueOn ? `Due ${formatDate(qip.dueOn)}` : undefined} />
      </div>

      <div className="gh-split">
        <div style={{ display: "grid", gap: ".9rem", alignContent: "start" }}>
          {open ? <CycleCard cycle={open} canWrite={canWrite} qipId={id} here={here} /> : (
            <section className="gh-card">
              <h2 className="gh-section-title">No open cycle</h2>
              {canWrite && qip.status === "active" ? (
                <form action={startCycleAction} className="gh-form">
                  <input type="hidden" name="qipId" value={id} /><input type="hidden" name="returnTo" value={here} />
                  <label className="gh-field gh-wide">Aim for cycle {cycles.length + 1}<textarea name="planAim" maxLength={2000} defaultValue={cycles.at(-1)?.actDecision === "adapt" ? cycles.at(-1)?.planAim : ""} /></label>
                  <div><button className="ui-button ui-button-primary" type="submit">Start PDSA cycle {cycles.length + 1}</button></div>
                </form>
              ) : <p className="gh-meta">{qip.status === "active" ? "Governance staff start cycles." : "This project is closed."}</p>}
            </section>
          )}
          <section className="gh-card" aria-labelledby="history-heading">
            <h2 id="history-heading" className="gh-section-title">Cycle history</h2>
            {cycles.filter((c) => c.status === "closed").length === 0 ? <Empty title="No closed cycles yet">Each closed cycle is kept here with its evidence and decision.</Empty> : (
              <ul className="gh-tl">{cycles.filter((c) => c.status === "closed").reverse().map((c) => (
                <li key={c.id}><span><strong>Cycle {c.cycleNo}</strong> · {c.actDecision ? ACT_DECISION_LABEL[c.actDecision].split(" —")[0] : "—"} · closed {formatStamp(c.closedAt)}
                  <details><summary className="gh-meta" style={{ cursor: "pointer" }}>Plan, Do, Study, Act</summary>
                    <dl className="gh-kv" style={{ marginTop: ".4rem" }}>
                      <dt>Aim</dt><dd>{c.planAim || "—"}</dd><dt>Prediction</dt><dd>{c.prediction || "—"}</dd><dt>Intervention</dt><dd>{c.intervention || "—"}</dd><dt>Measures</dt><dd>{c.measurementPlan || "—"}</dd>
                      <dt>Done</dt><dd>{c.doNotes || "—"}</dd><dt>Observed</dt><dd>{c.doObservations || "—"}</dd><dt>Results</dt><dd>{c.studyResults || "—"}</dd>
                      <dt>vs prediction</dt><dd>{c.studyComparison || "—"}</dd><dt>Lessons</dt><dd>{c.lessonsLearned || "—"}</dd><dt>Act notes</dt><dd>{c.actNotes || "—"}</dd>
                    </dl>
                  </details></span></li>
              ))}</ul>
            )}
          </section>
        </div>

        <div style={{ display: "grid", gap: ".9rem", alignContent: "start" }}>
          <section className="gh-card" aria-labelledby="source-heading">
            <h2 id="source-heading" className="gh-section-title">Where it came from, where it leads</h2>
            <dl className="gh-kv">
              <dt>From audit</dt><dd>{sourceAudit ? <Link href={`${BASE}/audits?audit=${sourceAudit.id}#audit`}>{sourceAudit.title} ({sourceAudit.resultPct ?? "—"}%)</Link> : "—"}</dd>
              <dt>From incident</dt><dd>{sourceIncident ? <Link href={`${BASE}/incidents?view=${sourceIncident.id}&status=all#incident`}>{sourceIncident.reference}</Link> : "—"}</dd>
              <dt>Re-audits</dt><dd>{reaudits.length === 0 ? "None scheduled" : reaudits.map((a) => <div key={a.id}><Link href={`${BASE}/audits?audit=${a.id}#audit`}>{a.title}</Link> · {formatDate(a.scheduledFor)} · {a.status === "completed" ? `${a.resultPct}%` : a.status}</div>)}</dd>
            </dl>
            {canWrite ? (
              <Details title="Schedule a re-audit for this project">
                <form action={scheduleReauditFromQipAction} className="gh-form">
                  <input type="hidden" name="qipId" value={id} /><input type="hidden" name="returnTo" value={here} />
                  <label className="gh-field gh-wide">Title<input name="title" required maxLength={240} defaultValue={sourceAudit ? `Re-audit: ${sourceAudit.title}` : `Re-audit: ${qip.title}`} /></label>
                  <label className="gh-field">Date<input type="date" name="scheduledFor" required /></label>
                  <label className="gh-field">Template<select name="templateId" defaultValue={sourceAudit ? auditExtras.get(sourceAudit.id)?.templateId ?? "" : ""}><option value="">None (enter result directly)</option>{templates.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
                  <label className="gh-field">Target (%)<input type="number" name="targetPct" min={0} max={100} step="0.1" defaultValue={qip.targetValue ?? ""} /></label>
                  <label className="gh-field">Lead auditor<select name="ownerUserId" defaultValue=""><option value="">Unassigned</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                  <div><button className="ui-button ui-button-primary" type="submit">Schedule re-audit</button></div>
                </form>
              </Details>
            ) : null}
          </section>
          {canWrite && qip.status === "active" ? (
            <section className="gh-card">
              <h2 className="gh-section-title">Log the latest measured value</h2>
              {progress !== null ? <Meter pct={progress} tone="info" label="Progress to target" /> : null}
              <form action={updateQipAction} className="gh-btnrow" style={{ marginTop: ".5rem" }}>
                <input type="hidden" name="qipId" value={id} /><input type="hidden" name="returnTo" value={here} />
                <input type="number" name="currentValue" step="any" required placeholder="Latest value" aria-label="Latest measured value" className="gh-inline-input" style={{ minWidth: "9rem" }} />
                <button className="ui-button" type="submit">Log</button>
              </form>
            </section>
          ) : null}
          {links && catalogue ? <LinkPanel title="Linked indicators, standards and actions" sourceType="qip" sourceId={id} links={links} catalogue={catalogue} allow={["indicator", "standard", "element", "guideline", "capa", "audit", "incident"]} canWrite={canWrite} returnTo={here} /> : null}
        </div>
      </div>
    </>
  );
}

function CycleCard({ cycle, canWrite, qipId, here }: { cycle: QipCycleRow; canWrite: boolean; qipId: string; here: string }) {
  const editable = canWrite && cycle.status !== "closed";
  const field = (name: keyof QipCycleRow & string, label: string, value: string, hint?: string) => (
    <label className="gh-field gh-wide">{label}<textarea name={name} maxLength={4000} defaultValue={value} readOnly={!editable} />{hint ? <small>{hint}</small> : null}</label>
  );
  return (
    <section className="gh-card" aria-labelledby="cycle-heading" style={{ display: "grid", gap: ".7rem" }}>
      <div className="gh-head"><h2 id="cycle-heading" className="gh-section-title" style={{ margin: 0 }}>PDSA cycle {cycle.cycleNo}</h2><span className="gh-meta">Started {formatDate(cycle.startedOn)}</span></div>
      <Stepper label={`PDSA cycle ${cycle.cycleNo}`} steps={CYCLE_STEPS} current={cycle.status} />
      <form action={updateCycleAction} className="gh-form">
        <input type="hidden" name="cycleId" value={cycle.id} /><input type="hidden" name="qipId" value={qipId} /><input type="hidden" name="returnTo" value={here} />
        {cycle.status === "plan" ? <>
          {field("planAim", "Aim", cycle.planAim)}{field("prediction", "Prediction", cycle.prediction, "What do you expect to happen?")}
          {field("intervention", "Intervention (change to test)", cycle.intervention)}{field("measurementPlan", "Measurement plan", cycle.measurementPlan)}
        </> : null}
        {cycle.status === "do" ? <>{field("doNotes", "Implementation — what was done", cycle.doNotes)}{field("doObservations", "Observations, problems, surprises", cycle.doObservations)}</> : null}
        {cycle.status === "study" ? <>{field("studyResults", "Results", cycle.studyResults)}{field("studyComparison", "Comparison with the prediction", cycle.studyComparison)}{field("lessonsLearned", "Lessons learned", cycle.lessonsLearned)}</> : null}
        {cycle.status === "act" ? <>
          <label className="gh-field gh-wide">Decision<select name="actDecision" defaultValue={cycle.actDecision ?? ""} disabled={!editable}><option value="" disabled>Choose…</option>{Object.entries(ACT_DECISION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          {field("actNotes", "Notes", cycle.actNotes)}
          {editable ? <label className="gh-check gh-wide"><input type="checkbox" name="completeProject" /> If adopting, also mark the whole project completed</label> : null}
        </> : null}
        {editable ? (
          <div className="gh-btnrow gh-wide">
            <button className="ui-button" type="submit">Save</button>
            {NEXT[cycle.status].map((n) => {
              const gap = cycleGap(cycle, n.to);
              return <button key={n.to} className={`ui-button${n.to === "closed" || n.to === "do" && cycle.status === "study" ? "" : " ui-button-primary"}`} type="submit" name="advanceTo" value={n.to} title={gap ?? "Saves the fields above, then moves on"}>{n.label}</button>;
            })}
            <span className="gh-meta">Moving on saves what is written above first.</span>
          </div>
        ) : null}
      </form>
      {cycle.status !== "plan" ? (
        <details><summary className="gh-meta" style={{ cursor: "pointer" }}>Earlier stages of this cycle</summary>
          <dl className="gh-kv" style={{ marginTop: ".4rem" }}>
            <dt>Aim</dt><dd>{cycle.planAim || "—"}</dd><dt>Prediction</dt><dd>{cycle.prediction || "—"}</dd><dt>Intervention</dt><dd>{cycle.intervention || "—"}</dd>
            {cycle.status !== "do" ? <><dt>Done</dt><dd>{cycle.doNotes || "—"}</dd><dt>Observed</dt><dd>{cycle.doObservations || "—"}</dd></> : null}
            {cycle.status === "act" ? <><dt>Results</dt><dd>{cycle.studyResults || "—"}</dd><dt>Lessons</dt><dd>{cycle.lessonsLearned || "—"}</dd></> : null}
          </dl>
        </details>
      ) : null}
    </section>
  );
}
