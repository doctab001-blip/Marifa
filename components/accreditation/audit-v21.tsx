import Link from "next/link";
import {
  addObservationAction, completeAuditFromObservationsAction, createAuditTemplateAction, createQipFromAuditAction, removeObservationAction, scheduleFromTemplateAction,
} from "@/app/(workspace)/dashboard/accreditation-and-audits/actions-v21";
import { ComplianceBars } from "@/components/accreditation/charts";
import { Badge, Details, Empty, NeedsV21, Stepper, nameOf } from "@/components/accreditation/ui";
import { auditCompliance } from "@/lib/governance/audit-measures";
import { formatDate } from "@/lib/governance/clock";
import type { Ctx } from "@/lib/governance/repository";
import { loadAuditExtras, loadAuditTemplates, loadObservations, loadQipSources, v21 } from "@/lib/governance/repository-v21";
import { isoDate } from "@/lib/governance/scoring";
import type { AuditRow, Person, QipRow } from "@/lib/governance/types";

const BASE = "/dashboard/accreditation-and-audits";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RESULT_LABEL = { met: "Met", not_met: "Not met", na: "N/A" } as const;

/** Selected audit (?audit=): template criteria, per-case observations, calculated compliance, completion, QIP from findings. */
export async function AuditV21({ ctx, auditId, audits, canWrite, actorUserId, people }: {
  ctx: Ctx; auditId: string; audits: AuditRow[]; canWrite: boolean; actorUserId: string; people: Person[];
}) {
  if (!UUID.test(auditId)) return null;
  const audit = audits.find((a) => a.id === auditId);
  if (!audit) return null;
  const loaded = await v21(Promise.all([loadAuditTemplates(ctx), loadAuditExtras(ctx), loadObservations(ctx, auditId), loadQipSources(ctx)]));
  if (!loaded) return <NeedsV21 what="Audit templates and observations" />;
  const [templates, extras, observations, qipSources] = loaded;
  const x = extras.get(audit.id);
  const template = templates.find((t) => t.id === x?.templateId) ?? null;
  const compliance = template ? auditCompliance(template.criteria, observations) : null;
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  const open = audit.status === "scheduled" || audit.status === "in_progress";
  const canRecord = canWrite || audit.ownerUserId === actorUserId;
  const here = `${BASE}/audits?audit=${audit.id}`;
  const below = audit.status === "completed" && audit.targetPct !== null && audit.resultPct !== null && audit.resultPct < audit.targetPct;
  const fromQip = x?.sourceQipId ?? null;
  const projectsFromThis = [...qipSources.entries()].filter(([, v]) => v.sourceAuditId === audit.id).map(([qid]) => qid);

  return (
    <section className="gh-card" id="audit" aria-labelledby="audit-heading" style={{ display: "grid", gap: ".8rem" }}>
      <div className="gh-head">
        <div><div className="gh-eyebrow">Audit</div><h2 id="audit-heading" style={{ margin: 0 }}>{audit.title}</h2>
          <p className="gh-meta" style={{ margin: ".2rem 0 0" }}>{formatDate(audit.scheduledFor)} · {audit.department || "No department"} · lead {nameOf(peopleById, audit.ownerUserId)}{audit.targetPct !== null ? ` · target ${audit.targetPct}%` : ""}{template ? ` · template “${template.title}”` : ""}</p></div>
        <span className="gh-btnrow"><Badge tone={audit.status === "completed" ? (below ? "bad" : "ok") : audit.status === "cancelled" ? "muted" : "info"}>{audit.status === "completed" ? `${audit.resultPct}% compliant` : audit.status}</Badge><Link className="ui-button" href={`${BASE}/audits`}>Close</Link></span>
      </div>
      <Stepper label="Audit cycle" current={audit.status === "completed" ? (projectsFromThis.length ? "improve" : x?.reauditDue ? "reaudit" : "results") : observations.length ? "measure" : "plan"} steps={[
        { key: "plan", label: "Plan", hint: "Criteria, sample" }, { key: "measure", label: "Measure", hint: "Observe cases" }, { key: "results", label: "Results", hint: "Compliance" },
        { key: "reaudit", label: "Re-audit date", hint: "Close the loop" }, { key: "improve", label: "Improve", hint: "QIP if needed" },
      ]} />
      {fromQip ? <p className="gh-meta" style={{ margin: 0 }}>This is a re-audit for an <Link href={`${BASE}/audits/qip/${fromQip}`}>improvement project</Link>.</p> : null}
      {x?.objective || template?.objective ? <p style={{ margin: 0 }}><strong>Objective:</strong> {x?.objective || template?.objective}</p> : null}

      {!template ? (
        <p className="gh-meta" style={{ margin: 0 }}>This audit was scheduled without a template, so the result is entered directly (Record result in the calendar). Schedule audits from a <Link href={`${BASE}/audits?tab=templates`}>template</Link> to record case-by-case observations with automatic compliance.</p>
      ) : (
        <>
          <details className="gh-details"><summary>Audit tool: {template.criteria.length} criteria{template.sampleSize ? ` · sample ${template.sampleSize}` : ""}</summary>
            <div className="gh-details-body">
              <dl className="gh-kv">
                <dt>Clinical standard</dt><dd>{template.clinicalStandard || "—"}</dd>
                <dt>Inclusion</dt><dd>{template.inclusionCriteria || "—"}</dd>
                <dt>Exclusion</dt><dd>{template.exclusionCriteria || "—"}</dd>
                <dt>Measurement period</dt><dd>{template.measurementPeriod || "—"}</dd>
                <dt>Data collection</dt><dd>{template.dataCollectionMethod || "—"}</dd>
                <dt>Numerator</dt><dd>{template.numeratorDefinition || "Cases meeting every applicable criterion"}</dd>
                <dt>Denominator</dt><dd>{template.denominatorDefinition || "Cases where at least one criterion applies"}</dd>
              </dl>
              <ol style={{ margin: 0, paddingLeft: "1.2rem" }}>{template.criteria.map((c) => <li key={c.id}>{c.text}</li>)}</ol>
            </div>
          </details>

          {compliance ? (
            <div className="gh-grid-2">
              <div className="gh-panel-soft">
                <div className="gh-stat-label">Compliance so far</div>
                <div className="gh-stat-value">{compliance.pct === null ? "—" : `${compliance.pct}%`}</div>
                <div className="gh-meta">{compliance.numerator} of {compliance.denominator} applicable cases fully compliant · {compliance.cases} cases recorded{template.sampleSize ? ` of ${template.sampleSize} planned` : ""}</div>
              </div>
              {compliance.byCriterion.some((c) => c.pct !== null) ? <ComplianceBars name="Compliance by criterion" data={compliance.byCriterion.map((c) => ({ label: c.criterion.text, pct: c.pct }))} /> : null}
            </div>
          ) : null}

          {observations.length > 0 ? (
            <div className="gh-table-wrap"><table className="gh-table">
              <thead><tr><th scope="col">Case</th>{template.criteria.map((c, i) => <th key={c.id} scope="col" title={c.text}>C{i + 1}</th>)}<th scope="col">Observed</th>{open && canWrite ? <th scope="col"><span className="sr-only">Remove</span></th> : null}</tr></thead>
              <tbody>{observations.map((o) => (
                <tr key={o.id}><td>{o.caseRef || "—"}{o.note ? <div className="gh-meta">{o.note}</div> : null}</td>
                  {template.criteria.map((c) => { const r = o.results[c.id] ?? "na"; return <td key={c.id}><Badge tone={r === "met" ? "ok" : r === "not_met" ? "bad" : "muted"}>{RESULT_LABEL[r]}</Badge></td>; })}
                  <td className="gh-meta">{formatDate(o.observedOn)}</td>
                  {open && canWrite ? <td><form action={removeObservationAction}><input type="hidden" name="observationId" value={o.id} /><input type="hidden" name="returnTo" value={here} /><button className="ui-button" type="submit" aria-label="Remove observation">Remove</button></form></td> : null}
                </tr>
              ))}</tbody>
            </table></div>
          ) : null}

          {open && canRecord ? (
            <>
              <Details title="Record a case" open={observations.length === 0}>
                <form action={addObservationAction} className="gh-form">
                  <input type="hidden" name="auditId" value={audit.id} /><input type="hidden" name="returnTo" value={here} />
                  <label className="gh-field">Case label<input name="caseRef" maxLength={60} placeholder={`Case ${observations.length + 1}`} /><small>Never a patient name or MRN.</small></label>
                  <label className="gh-field">Observed on<input type="date" name="observedOn" defaultValue={isoDate(new Date())} /></label>
                  {template.criteria.map((c, i) => (
                    <fieldset key={c.id} className="gh-field gh-wide" style={{ border: 0, padding: 0, margin: 0 }}>
                      <legend style={{ fontWeight: 700, fontSize: ".8rem" }}>C{i + 1}. {c.text}</legend>
                      <div className="gh-btnrow">{(["met", "not_met", "na"] as const).map((r) => <label key={r} className="gh-check"><input type="radio" name={`r:${c.id}`} value={r} defaultChecked={r === "na"} /> {RESULT_LABEL[r]}</label>)}</div>
                    </fieldset>
                  ))}
                  <label className="gh-field gh-wide">Note<input name="note" maxLength={1000} /></label>
                  <div><button className="ui-button ui-button-primary" type="submit">Save case</button></div>
                </form>
              </Details>
              {observations.length > 0 ? (
                <Details title="Complete the audit from these observations">
                  <form action={completeAuditFromObservationsAction} className="gh-form">
                    <input type="hidden" name="auditId" value={audit.id} /><input type="hidden" name="returnTo" value={here} />
                    <p className="gh-wide" style={{ margin: 0 }}>Result: <strong>{compliance?.pct ?? "—"}%</strong> ({compliance?.numerator} of {compliance?.denominator}). The figure is calculated, not typed.</p>
                    <label className="gh-field gh-wide">Findings<textarea name="findings" maxLength={8000} /></label>
                    <label className="gh-field gh-wide">Action plan<textarea name="actionPlan" maxLength={4000} defaultValue={template.actionPlanGuidance} /></label>
                    <label className="gh-field">Re-audit date<input type="date" name="reauditDue" /><small>{template.reauditIntervalMonths ? `Blank = ${template.reauditIntervalMonths} months from today` : "Optional"}</small></label>
                    <div><button className="ui-button ui-button-primary" type="submit">Complete audit</button></div>
                  </form>
                </Details>
              ) : null}
            </>
          ) : null}
        </>
      )}

      {audit.status === "completed" ? (
        <div style={{ display: "grid", gap: ".5rem" }}>
          {x?.numerator !== null && x?.denominator ? <p className="gh-meta" style={{ margin: 0 }}>Numerator {x.numerator} / denominator {x.denominator}.</p> : null}
          {x?.actionPlan ? <p style={{ margin: 0 }}><strong>Action plan:</strong> {x.actionPlan}</p> : null}
          {x?.reauditDue ? <p style={{ margin: 0 }}><strong>Re-audit due:</strong> {formatDate(x.reauditDue)}</p> : null}
          {projectsFromThis.length > 0 ? <div className="gh-btnrow"><span className="gh-meta">Improvement projects from this audit:</span>{projectsFromThis.map((q) => <Link key={q} className="ui-button" href={`${BASE}/audits/qip/${q}`}>Open project</Link>)}</div> : null}
          {canWrite ? (
            <Details title="Start an improvement project from this finding" open={below && projectsFromThis.length === 0}>
              <form action={createQipFromAuditAction} className="gh-form">
                <input type="hidden" name="auditId" value={audit.id} /><input type="hidden" name="returnTo" value={here} />
                <label className="gh-field gh-wide">Project title<input name="title" required maxLength={240} defaultValue={`Improve: ${audit.title}`.slice(0, 240)} /></label>
                <label className="gh-field gh-wide">Aim<textarea name="aim" maxLength={2000} /></label>
                <label className="gh-field">Measure<input name="measure" maxLength={1000} defaultValue={`${audit.title} compliance`} /></label>
                <label className="gh-field">Baseline (%)<input type="number" name="baselineValue" min={0} max={100} step="0.1" defaultValue={audit.resultPct ?? ""} /></label>
                <label className="gh-field">Target (%)<input type="number" name="targetValue" min={0} max={100} step="0.1" defaultValue={audit.targetPct ?? ""} /></label>
                <label className="gh-field">Lead<select name="leadUserId" defaultValue=""><option value="">Unassigned</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                <div><button className="ui-button ui-button-primary" type="submit">Start project</button></div>
              </form>
            </Details>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

/** Templates tab: reusable audit tools, and scheduling an audit from one. */
export async function AuditTemplates({ ctx, canWrite, people, departments, qips }: { ctx: Ctx; canWrite: boolean; people: Person[]; departments: string[]; qips: QipRow[] }) {
  const templates = await v21(loadAuditTemplates(ctx));
  if (templates === null) return <NeedsV21 what="Audit templates" />;
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  return (
    <>
      {canWrite ? (
        <Details title="Create an audit template" open={templates.length === 0}>
          <form action={createAuditTemplateAction} className="gh-form">
            <input type="hidden" name="returnTo" value={`${BASE}/audits?tab=templates`} />
            <label className="gh-field gh-wide">Audit title<input name="title" required maxLength={240} placeholder="e.g. Consent documentation audit" /></label>
            <label className="gh-field gh-wide">Objective<textarea name="objective" maxLength={2000} /></label>
            <label className="gh-field">Clinical standard<input name="clinicalStandard" maxLength={500} placeholder="Policy, guideline or standard measured against" /></label>
            <label className="gh-field">Related standard code<input name="standardCode" maxLength={60} placeholder="Optional" /></label>
            <label className="gh-field gh-wide">Audit criteria (one per line)<textarea name="criteria" required rows={5} placeholder={"Consent form signed and dated\nRisks discussed are documented\nInterpreter used where needed"} /></label>
            <label className="gh-field">Inclusion criteria<textarea name="inclusionCriteria" maxLength={2000} /></label>
            <label className="gh-field">Exclusion criteria<textarea name="exclusionCriteria" maxLength={2000} /></label>
            <label className="gh-field">Sample size<input type="number" name="sampleSize" min={1} /></label>
            <label className="gh-field">Measurement period<input name="measurementPeriod" maxLength={200} placeholder="e.g. One calendar month" /></label>
            <label className="gh-field">Data collection method<input name="dataCollectionMethod" maxLength={500} placeholder="e.g. Retrospective record review" /></label>
            <label className="gh-field">Numerator<input name="numeratorDefinition" maxLength={1000} placeholder="Default: cases meeting every applicable criterion" /></label>
            <label className="gh-field">Denominator<input name="denominatorDefinition" maxLength={1000} placeholder="Default: cases where a criterion applies" /></label>
            <label className="gh-field">Responsible audit lead<select name="leadUserId" defaultValue=""><option value="">Unassigned</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
            <label className="gh-field">Re-audit after (months)<input type="number" name="reauditIntervalMonths" min={1} max={60} /></label>
            <label className="gh-field gh-wide">Action plan guidance<textarea name="actionPlanGuidance" maxLength={2000} /></label>
            <div><button className="ui-button ui-button-primary" type="submit">Save template</button></div>
          </form>
        </Details>
      ) : null}
      {templates.length === 0 ? <Empty title="No audit templates yet">{canWrite ? "Create one above. Templates are your hospital's own audit tools." : "None have been created."}</Empty> : (
        <div className="gh-ind-grid">
          {templates.map((t) => (
            <section key={t.id} className="gh-card gh-ind" aria-label={t.title}>
              <div className="gh-ind-head"><h3 style={{ margin: 0 }}>{t.title}</h3><Badge tone="info">{t.criteria.length} criteria</Badge></div>
              {t.objective ? <span className="gh-meta gh-clamp">{t.objective}</span> : null}
              <div className="gh-ind-meta"><span>Lead: {nameOf(peopleById, t.leadUserId)}</span>{t.sampleSize ? <span>Sample {t.sampleSize}</span> : null}{t.reauditIntervalMonths ? <span>Re-audit every {t.reauditIntervalMonths} mo</span> : null}{t.measurementPeriod ? <span>{t.measurementPeriod}</span> : null}</div>
              {canWrite ? (
                <details className="gh-noprint"><summary className="ui-button" style={{ cursor: "pointer", width: "fit-content" }}>Schedule from this template…</summary>
                  <form action={scheduleFromTemplateAction} className="gh-form" style={{ marginTop: ".5rem" }}>
                    <input type="hidden" name="templateId" value={t.id} /><input type="hidden" name="returnTo" value={`${BASE}/audits`} />
                    <label className="gh-field">Date<input type="date" name="scheduledFor" required /></label>
                    <label className="gh-field">Target (% compliant)<input type="number" name="targetPct" min={0} max={100} step="0.1" /></label>
                    <label className="gh-field">Department<input name="department" list="gh-tpl-depts" maxLength={160} /><datalist id="gh-tpl-depts">{departments.map((d) => <option key={d} value={d} />)}</datalist></label>
                    <label className="gh-field">Lead auditor<select name="ownerUserId" defaultValue={t.leadUserId ?? ""}><option value="">Template lead</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                    {qips.length > 0 ? <label className="gh-field">Re-audit for project<select name="sourceQipId" defaultValue=""><option value="">None</option>{qips.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}</select></label> : null}
                    <div><button className="ui-button ui-button-primary" type="submit">Schedule</button></div>
                  </form>
                </details>
              ) : null}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
