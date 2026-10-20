import Link from "next/link";
import {
  addCapaAction, cancelAuditAction, completeAuditAction, createQipAction, scheduleAuditAction, updateQipAction,
} from "@/app/(workspace)/dashboard/accreditation-and-audits/actions";
import { Badge, Details, Empty, Meter, Notice, Stat, nameOf, pageParam } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate, formatDate, formatMonth } from "@/lib/governance/clock";
import { canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import { loadAudits, loadCapa, loadDepartments, loadPeople, loadQips, openContext } from "@/lib/governance/repository";
import { daysBetween, isoDate, summariseAuditsAndQips } from "@/lib/governance/scoring";
import type { AuditRow, QipPhase, QipRow } from "@/lib/governance/types";

const BASE = "/dashboard/accreditation-and-audits";
const AUDIT_CATEGORIES = ["Hand hygiene", "Narcotic / controlled drug count", "Medication safety", "Patient identification", "Documentation / consent", "Infection control", "Resuscitation equipment", "Environment of care", "Other"];
const PHASES: { phase: QipPhase; title: string; hint: string }[] = [
  { phase: "plan", title: "Plan", hint: "Aim, measure, prediction" },
  { phase: "do", title: "Do", hint: "Run the test" },
  { phase: "study", title: "Study", hint: "Compare to prediction" },
  { phase: "act", title: "Act", hint: "Adopt, adapt or abandon" },
];
const NEXT: Record<QipPhase, { to: QipPhase; label: string }[]> = {
  plan: [{ to: "do", label: "Start doing →" }],
  do: [{ to: "study", label: "Move to study →" }],
  study: [{ to: "act", label: "Move to act →" }, { to: "do", label: "← Revise and re-test" }],
  act: [{ to: "plan", label: "Start next cycle ↺" }],
};

function progress(qip: QipRow): number | null {
  if (qip.baselineValue === null || qip.targetValue === null || qip.currentValue === null || qip.baselineValue === qip.targetValue) return null;
  return Math.max(0, Math.min(100, Math.round(((qip.currentValue - qip.baselineValue) / (qip.targetValue - qip.baselineValue)) * 100)));
}

export default async function AuditsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const done = pageParam(sp.done), error = pageParam(sp.error);
  const actor = await getGovernanceActor();
  if (!canReadGovernance(actor)) {
    return <><header className="gh-head"><div><div className="gh-eyebrow">Accreditation hub</div><h1>Audits &amp; improvement</h1></div></header>
      <p className="gh-notice gh-notice-bad" role="alert">Audits and improvement projects are visible to governance staff and auditors.</p></>;
  }
  const canWrite = canWriteGovernance(actor);
  const today = currentDate();
  const todayIso = isoDate(today);
  const ctx = await openContext(actor);

  const loaded = await Promise.all([loadAudits(ctx), loadQips(ctx), loadPeople(ctx).catch(() => []), loadDepartments(ctx).catch(() => []), loadCapa(ctx)]).catch(() => null);
  if (!loaded) return <p className="gh-notice gh-notice-bad" role="alert">Audits could not be loaded. Has the accreditation hub migration been applied?</p>;
  const [audits, qips, people, departments, capa] = loaded;
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  const overview = summariseAuditsAndQips(audits, qips, today);

  const upcoming = audits.filter((a) => a.status === "scheduled" || a.status === "in_progress").sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  const finished = audits.filter((a) => a.status === "completed").sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")).slice(0, 12);
  const months = [...new Set(upcoming.map((a) => a.scheduledFor.slice(0, 7)))];
  const activeQips = qips.filter((q) => q.status === "active");
  const closedQips = qips.filter((q) => q.status !== "active");

  return (
    <>
      <header className="gh-head">
        <div><div className="gh-eyebrow">Accreditation hub</div><h1>Audits &amp; improvement</h1>
          <p>Prove continuous improvement: audits on a schedule, results against a target, and improvement projects moving through Plan–Do–Study–Act.</p></div>
      </header>
      <Notice done={done} error={error} />
      <div className="gh-grid">
        <Stat label="Due in 30 days" value={overview.scheduledNext30} href="#calendar" />
        <Stat label="Past their date" value={overview.overdue} tone={overview.overdue > 0 ? "warn" : "ok"} note={overview.overdue > 0 ? "Complete or reschedule" : "None late"} />
        <Stat label="Completed" value={overview.completed} note={overview.belowTarget > 0 ? `${overview.belowTarget} below target` : "None below target"} tone={overview.belowTarget > 0 ? "warn" : "ok"} />
        <Stat label="Active improvement projects" value={overview.activeQips} href="#qip" />
      </div>

      <section className="gh-card" id="calendar" aria-labelledby="calendar-heading">
        <div className="gh-head"><div><h2 id="calendar-heading" style={{ margin: 0 }}>Audit calendar</h2><p className="gh-sub" style={{ margin: 0 }}>Upcoming and late audits, soonest first. Recurring audits reschedule themselves when you record a result.</p></div></div>
        {canWrite ? (
          <div style={{ margin: ".7rem 0" }}>
            <Details title="Schedule an audit" open={audits.length === 0}>
              <form action={scheduleAuditAction} className="gh-form">
                <input type="hidden" name="returnTo" value={`${BASE}/audits`} />
                <label className="gh-field gh-wide">Title<input name="title" required maxLength={240} placeholder="e.g. Hand hygiene — Ward 4B" /></label>
                <label className="gh-field">Category<select name="category" defaultValue="Other">{AUDIT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
                <label className="gh-field">Date<input type="date" name="scheduledFor" required /></label>
                <label className="gh-field">Repeat every (months)<input type="number" name="recurrenceMonths" min={1} max={60} placeholder="Blank = once" /></label>
                <label className="gh-field">Target (% compliant)<input type="number" name="targetPct" min={0} max={100} step="0.1" /></label>
                <label className="gh-field">Department<input name="department" list="gh-audit-depts" maxLength={160} /><datalist id="gh-audit-depts">{departments.map((d) => <option key={d} value={d} />)}</datalist></label>
                <label className="gh-field">Lead auditor<select name="ownerUserId" defaultValue=""><option value="">Unassigned</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                <label className="gh-field">Related standard code<input name="standardCode" maxLength={60} placeholder="Optional" /></label>
                <div><button className="ui-button ui-button-primary" type="submit">Schedule</button></div>
              </form>
            </Details>
          </div>
        ) : null}
        {upcoming.length === 0 ? <Empty title="No audits scheduled">{canWrite ? "Schedule hand hygiene, controlled drug counts and the other audits your standards expect." : "Nothing is scheduled."}</Empty> : (
          <div className="gh-timeline">
            {months.map((month) => (
              <div key={month} className="gh-timeline">
                <div className="gh-month">{formatMonth(`${month}-01`)}</div>
                {upcoming.filter((a) => a.scheduledFor.startsWith(month)).map((audit) => <AuditItem key={audit.id} audit={audit} todayIso={todayIso} owner={nameOf(peopleById, audit.ownerUserId)} canWrite={canWrite} />)}
              </div>
            ))}
          </div>
        )}
      </section>

      {finished.length > 0 ? (
        <section className="gh-card" aria-labelledby="results-heading">
          <h2 id="results-heading">Recent results</h2>
          <div className="gh-table-wrap"><table className="gh-table">
            <thead><tr><th scope="col">Audit</th><th scope="col">Completed</th><th scope="col">Result</th><th scope="col">Sample</th><th scope="col">Actions</th></tr></thead>
            <tbody>{finished.map((a) => {
              const below = a.targetPct !== null && a.resultPct !== null && a.resultPct < a.targetPct;
              const linked = capa.filter((c) => c.auditId === a.id);
              return (
                <tr key={a.id}>
                  <td><strong>{a.title}</strong><div className="gh-meta">{a.category}{a.department ? ` · ${a.department}` : ""}</div>{a.findings ? <div className="gh-meta gh-clamp">{a.findings}</div> : null}</td>
                  <td>{formatDate(a.completedAt)}</td>
                  <td><Badge tone={a.resultPct === null ? "muted" : below ? "bad" : "ok"}>{a.resultPct}%{a.targetPct !== null ? ` of ${a.targetPct}% target` : ""}</Badge></td>
                  <td>{a.sampleSize}</td>
                  <td>{linked.length > 0 ? <Badge tone="info">{linked.length} action{linked.length === 1 ? "" : "s"}</Badge> : below && canWrite ? (
                    <details className="gh-noprint"><summary className="ui-button" style={{ cursor: "pointer" }}>Raise action…</summary>
                      <form action={addCapaAction} className="gh-form" style={{ marginTop: ".5rem", minWidth: "16rem" }}>
                        <input type="hidden" name="auditId" value={a.id} /><input type="hidden" name="returnTo" value={`${BASE}/audits`} />
                        <label className="gh-field gh-wide">Action<textarea name="action" required maxLength={2000} /></label>
                        <input type="hidden" name="kind" value="corrective" />
                        <label className="gh-field">Owner<select name="ownerUserId" required defaultValue=""><option value="" disabled>Choose…</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                        <label className="gh-field">Deadline<input type="date" name="dueDate" required min={todayIso} /></label>
                        <div><button className="ui-button ui-button-primary" type="submit">Add</button></div>
                      </form></details>
                  ) : <span className="gh-meta">{below ? "—" : "Not needed"}</span>}</td>
                </tr>
              );
            })}</tbody>
          </table></div>
        </section>
      ) : null}

      <section className="gh-card" id="qip" aria-labelledby="qip-heading">
        <div className="gh-head"><div><h2 id="qip-heading" style={{ margin: 0 }}>Quality improvement projects</h2><p className="gh-sub" style={{ margin: 0 }}>Plan–Do–Study–Act. Each project records its aim, a measure, and where it started and is heading.</p></div></div>
        {canWrite ? (
          <div style={{ margin: ".7rem 0" }}>
            <Details title="Start an improvement project" open={qips.length === 0}>
              <form action={createQipAction} className="gh-form">
                <input type="hidden" name="returnTo" value={`${BASE}/audits`} />
                <label className="gh-field gh-wide">Title<input name="title" required maxLength={240} /></label>
                <label className="gh-field gh-wide">Aim<textarea name="aim" maxLength={2000} placeholder="By when, how much, for whom?" /></label>
                <label className="gh-field">Measure<input name="measure" maxLength={1000} placeholder="e.g. Door-to-ECG time" /></label>
                <label className="gh-field">Unit<input name="unit" maxLength={40} placeholder="e.g. minutes, %" /></label>
                <label className="gh-field">Baseline<input type="number" name="baselineValue" step="any" /></label>
                <label className="gh-field">Target<input type="number" name="targetValue" step="any" /></label>
                <label className="gh-field">Department<input name="department" list="gh-audit-depts" maxLength={160} /></label>
                <label className="gh-field">Lead<select name="leadUserId" defaultValue=""><option value="">Unassigned</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                <label className="gh-field">Start<input type="date" name="startedOn" /></label>
                <label className="gh-field">Due<input type="date" name="dueOn" /></label>
                <div><button className="ui-button ui-button-primary" type="submit">Create in Plan</button></div>
              </form>
            </Details>
          </div>
        ) : null}
        {activeQips.length === 0 ? <Empty title="No active projects">{qips.length === 0 ? "Start one from a below-target audit or an incident trend." : "All projects are completed or stopped."}</Empty> : (
          <div className="gh-board">
            {PHASES.map(({ phase, title, hint }) => {
              const items = activeQips.filter((q) => q.phase === phase);
              return (
                <div className="gh-col" key={phase} role="group" aria-label={title}>
                  <div className="gh-col-head"><span>{title} <span className="gh-meta">· {hint}</span></span><span className="gh-count">{items.length}</span></div>
                  {items.map((qip) => {
                    const pct = progress(qip);
                    return (
                      <div className="gh-item" key={qip.id}>
                        <h4>{qip.title}</h4>
                        {qip.aim ? <span className="gh-meta gh-clamp">{qip.aim}</span> : null}
                        <span className="gh-meta">{qip.department || "No department"} · lead {nameOf(peopleById, qip.leadUserId)}{qip.dueOn ? ` · due ${formatDate(qip.dueOn)}${qip.dueOn < todayIso ? " (late)" : ""}` : ""}</span>
                        {qip.measure ? <span className="gh-meta">{qip.measure}: {qip.baselineValue ?? "?"} → <strong>{qip.currentValue ?? "?"}</strong> → {qip.targetValue ?? "?"} {qip.unit}</span> : null}
                        {pct !== null ? <><Meter pct={pct} tone="info" label={`${qip.title} progress`} /><span className="gh-meta">{pct}% of the way to target</span></> : null}
                        {canWrite ? (
                          <>
                            <form action={updateQipAction} className="gh-btnrow">
                              <input type="hidden" name="qipId" value={qip.id} /><input type="hidden" name="returnTo" value={`${BASE}/audits`} />
                              <input type="number" name="currentValue" step="any" required placeholder="Latest value" aria-label="Latest measured value" style={{ width: "8rem", padding: ".35rem .5rem", border: "1px solid var(--line-strong)", borderRadius: 8, background: "var(--surface)", color: "inherit" }} />
                              <button className="ui-button" type="submit">Log</button>
                            </form>
                            <div className="gh-btnrow">
                              {NEXT[qip.phase].map((step) => (
                                <form action={updateQipAction} key={step.to}><input type="hidden" name="qipId" value={qip.id} /><input type="hidden" name="phase" value={step.to} /><input type="hidden" name="returnTo" value={`${BASE}/audits`} /><button className="ui-button" type="submit">{step.label}</button></form>
                              ))}
                              {phase === "act" ? <form action={updateQipAction}><input type="hidden" name="qipId" value={qip.id} /><input type="hidden" name="status" value="completed" /><input type="hidden" name="returnTo" value={`${BASE}/audits`} /><button className="ui-button ui-button-primary" type="submit">Complete</button></form> : null}
                              <form action={updateQipAction}><input type="hidden" name="qipId" value={qip.id} /><input type="hidden" name="status" value="stopped" /><input type="hidden" name="returnTo" value={`${BASE}/audits`} /><button className="ui-button ui-button-danger" type="submit">Stop</button></form>
                            </div>
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
        {closedQips.length > 0 ? (
          <div style={{ marginTop: ".8rem" }}><Details title={`Completed and stopped (${closedQips.length})`}>
            <ul className="gh-actions">{closedQips.map((q) => <li className="gh-row" style={{ gridTemplateColumns: "1fr auto" }} key={q.id}><span><strong>{q.title}</strong> <span className="gh-meta">{q.measure ? `${q.baselineValue ?? "?"} → ${q.currentValue ?? "?"} (target ${q.targetValue ?? "?"}) ${q.unit}` : ""}</span></span><Badge tone={q.status === "completed" ? "ok" : "muted"}>{q.status}</Badge></li>)}</ul>
          </Details></div>
        ) : null}
      </section>
      <p className="gh-meta"><Link href={`${BASE}/incidents`}>Incidents &amp; corrective actions</Link> track fixes that come out of audits too.</p>
    </>
  );
}

function AuditItem({ audit, todayIso, owner, canWrite }: { audit: AuditRow; todayIso: string; owner: string; canWrite: boolean }) {
  const late = audit.scheduledFor < todayIso;
  const days = daysBetween(todayIso, audit.scheduledFor);
  return (
    <div className="gh-timeline">
      <div className="gh-row">
        <span className="gh-row-date">{formatDate(audit.scheduledFor).slice(0, 6)}</span>
        <span><strong>{audit.title}</strong><div className="gh-meta">{audit.category}{audit.department ? ` · ${audit.department}` : ""} · {owner}{audit.targetPct !== null ? ` · target ${audit.targetPct}%` : ""}{audit.recurrenceMonths ? ` · every ${audit.recurrenceMonths} mo` : ""}</div></span>
        <Badge tone={late ? "bad" : days <= 14 ? "warn" : "info"}>{late ? `${-days} day${days === -1 ? "" : "s"} late` : days === 0 ? "Today" : `In ${days} days`}</Badge>
      </div>
      <details className="gh-noprint" style={{ marginTop: "-.2rem" }}>
        <summary className="ui-button" style={{ cursor: "pointer", width: "fit-content" }}>Record result…</summary>
        <form action={completeAuditAction} className="gh-form" style={{ marginTop: ".5rem" }}>
          <input type="hidden" name="auditId" value={audit.id} /><input type="hidden" name="returnTo" value={`${BASE}/audits`} />
          <label className="gh-field">Result (% compliant)<input type="number" name="resultPct" min={0} max={100} step="0.1" required /></label>
          <label className="gh-field">Sample size<input type="number" name="sampleSize" min={1} required /></label>
          <label className="gh-field gh-wide">Findings<textarea name="findings" maxLength={8000} /></label>
          <div className="gh-btnrow"><button className="ui-button ui-button-primary" type="submit">Complete audit</button></div>
        </form>
        {canWrite ? (
          <form action={cancelAuditAction} style={{ marginTop: ".4rem" }}><input type="hidden" name="auditId" value={audit.id} /><input type="hidden" name="returnTo" value={`${BASE}/audits`} /><button className="ui-button ui-button-danger" type="submit">Cancel this audit</button></form>
        ) : null}
      </details>
    </div>
  );
}

export type { QipRow };
