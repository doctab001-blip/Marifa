import Link from "next/link";
import {
  capaCompletionAction, capaEffectivenessAction, recordNotificationAction, startQipFromIncidentAction, updateInvestigationAction, uploadIncidentEvidenceAction,
} from "@/app/(workspace)/dashboard/accreditation-and-audits/actions-v21";
import { DropZone } from "@/components/accreditation/drop-zone";
import { Badge, Details, NeedsV21, nameOf, type Tone } from "@/components/accreditation/ui";
import { formatDate, formatStamp } from "@/lib/governance/clock";
import { NOTIFICATION_STATE_LABEL, notificationViews, type NotificationState } from "@/lib/governance/regulatory";
import type { Ctx } from "@/lib/governance/repository";
import { loadIncidentFiles, loadPolicies, loadQips, signedUrl } from "@/lib/governance/repository";
import {
  loadCapaExtras, loadGovernedGuidelines, loadIncidentExtras, loadIncidentFileKinds, loadIncidentHistory, loadNotifications, loadQipSources, loadRegulatoryRules, v21,
} from "@/lib/governance/repository-v21";
import { isCapaOverdue } from "@/lib/governance/scoring";
import type { CapaRow, IncidentRow, Person } from "@/lib/governance/types";

const BASE = "/dashboard/accreditation-and-audits";
const STATUS_LABEL: Record<string, string> = { reported: "Reported", under_investigation: "Under investigation", capa_assigned: "Actions assigned", under_review: "Under review", closed: "Closed" };
const NOTE_TONE: Record<NotificationState, Tone> = { reported: "ok", overdue: "bad", due_soon: "warn", pending: "info" };
const EFFECT_LABEL = { not_assessed: "Not yet assessed", effective: "Effective", partially_effective: "Partially effective", not_effective: "Not effective" } as const;
const EFFECT_TONE: Record<keyof typeof EFFECT_LABEL, Tone> = { not_assessed: "muted", effective: "ok", partially_effective: "warn", not_effective: "bad" };

/** V2.1 additions to an incident: timeline, investigation, RCA files, CAPA completion/effectiveness, regulatory reporting, QIP link. */
export async function IncidentV21({ ctx, incident, capa, people, canWrite, myUserId, now }: {
  ctx: Ctx; incident: IncidentRow; capa: CapaRow[]; people: Person[]; canWrite: boolean; myUserId: string; now: Date;
}) {
  const core = await v21(Promise.all([loadIncidentHistory(ctx, incident.id), loadIncidentExtras(ctx, incident.id), loadIncidentFileKinds(ctx, incident.id), loadCapaExtras(ctx)]));
  if (!core) return <NeedsV21 what="The incident timeline, investigation details and regulatory reporting" />;
  const [history, extras, kinds, capaExtras] = core;
  const [files, rules, notifications, policies, guidelines, qips, qipSources] = await Promise.all([
    loadIncidentFiles(ctx, incident.id).catch(() => []), v21(loadRegulatoryRules(ctx)), v21(loadNotifications(ctx, incident.id)), loadPolicies(ctx).catch(() => []),
    v21(loadGovernedGuidelines(ctx)), loadQips(ctx).catch(() => []), v21(loadQipSources(ctx)),
  ]);
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  const here = `${BASE}/incidents?view=${incident.id}&status=all`;
  const rca = files.filter((f) => kinds.get(f.id) === "rca");
  const capaFiles = files.filter((f) => kinds.get(f.id) === "capa_evidence");
  const urls = new Map<string, string | null>();
  for (const f of [...rca, ...capaFiles]) urls.set(f.id, await signedUrl(ctx, f.storagePath));
  const reporting = notificationViews(incident, rules ?? [], notifications ?? [], now);
  const projects = qips.filter((q) => qipSources?.get(q.id)?.sourceIncidentId === incident.id);
  const corrective = capa.filter((c) => c.kind === "corrective");
  const preventive = capa.filter((c) => c.kind === "preventive");
  const linkedPolicy = policies.find((p) => p.id === extras?.linkedPolicyId);
  const linkedGuideline = (guidelines ?? []).find((g) => g.id === extras?.linkedGuidelineId);
  const deadline = capa.filter((c) => c.status === "open" || c.status === "in_progress").map((c) => c.dueDate).sort()[0];
  const capaStatus = (list: CapaRow[]) => list.length === 0 ? "None" : `${list.filter((c) => c.status === "verified").length} verified · ${list.filter((c) => c.status === "done").length} done · ${list.filter((c) => c.status === "open" || c.status === "in_progress").length} open`;

  return (
    <div style={{ display: "grid", gap: ".9rem", marginTop: ".9rem" }}>
      <div className="gh-grid-2">
        <section className="gh-panel-soft" aria-label="Timeline">
          <h3 className="gh-section-title" style={{ margin: "0 0 .5rem" }}>Lifecycle timeline</h3>
          <ul className="gh-tl">
            {history.map((h) => <li key={h.id}><span><strong>{STATUS_LABEL[h.toStatus] ?? h.toStatus}</strong> · {formatStamp(h.changedAt)}{h.changedBy ? ` · ${nameOf(peopleById, h.changedBy)}` : ""}</span></li>)}
            {extras?.investigationStartedOn ? <li><span>Investigation started · {formatDate(extras.investigationStartedOn)}</span></li> : null}
            {extras?.investigationCompletedOn ? <li><span>Investigation completed · {formatDate(extras.investigationCompletedOn)}</span></li> : null}
            {capa.filter((c) => c.verifiedAt).map((c) => <li key={c.id}><span>Action verified · {formatDate(c.verifiedAt)} · <span className="gh-meta">{c.action.slice(0, 60)}</span></span></li>)}
          </ul>
          {history.length <= 1 && incident.status !== "reported" ? <p className="gh-meta" style={{ margin: ".4rem 0 0" }}>Changes made before the timeline was switched on were not recorded.</p> : null}
        </section>

        <section className="gh-panel-soft" aria-label="Investigation">
          <h3 className="gh-section-title" style={{ margin: "0 0 .5rem" }}>Investigation</h3>
          <dl className="gh-kv">
            <dt>Investigator</dt><dd>{extras?.investigatorUserId ? nameOf(peopleById, extras.investigatorUserId) : "Not assigned"}</dd>
            <dt>Started</dt><dd>{formatDate(extras?.investigationStartedOn ?? null)}</dd>
            <dt>Completed</dt><dd>{formatDate(extras?.investigationCompletedOn ?? null)}</dd>
            <dt>Linked policy</dt><dd>{linkedPolicy ? <Link href={`${BASE}/policies/${linkedPolicy.id}`}>{linkedPolicy.title} v{linkedPolicy.version}</Link> : "—"}</dd>
            <dt>Linked guideline</dt><dd>{linkedGuideline ? <Link href={`${BASE}/policies/guidelines?view=${linkedGuideline.id}`}>{linkedGuideline.title}</Link> : "—"}</dd>
            <dt>Corrective actions</dt><dd>{capaStatus(corrective)}</dd>
            <dt>Preventive actions</dt><dd>{capaStatus(preventive)}</dd>
            <dt>CAPA deadline</dt><dd>{deadline ? <>{formatDate(deadline)} {deadline < now.toISOString().slice(0, 10) ? <Badge tone="bad">Overdue</Badge> : null}</> : "—"}</dd>
          </dl>
          {canWrite ? (
            <Details title="Edit investigation">
              <form action={updateInvestigationAction} className="gh-form">
                <input type="hidden" name="incidentId" value={incident.id} /><input type="hidden" name="returnTo" value={here} />
                <label className="gh-field">Investigator<select name="investigatorUserId" defaultValue={extras?.investigatorUserId ?? ""}><option value="">Not assigned</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                <label className="gh-field">Started<input type="date" name="investigationStartedOn" defaultValue={extras?.investigationStartedOn ?? ""} /></label>
                <label className="gh-field">Completed<input type="date" name="investigationCompletedOn" defaultValue={extras?.investigationCompletedOn ?? ""} /></label>
                <label className="gh-field">Linked policy<select name="linkedPolicyId" defaultValue={extras?.linkedPolicyId ?? ""}><option value="">None</option>{policies.map((p) => <option key={p.id} value={p.id}>{p.title} v{p.version}</option>)}</select></label>
                <label className="gh-field">Linked clinical guideline<select name="linkedGuidelineId" defaultValue={extras?.linkedGuidelineId ?? ""}><option value="">None</option>{(guidelines ?? []).map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}</select></label>
                <div><button className="ui-button" type="submit">Save</button></div>
              </form>
            </Details>
          ) : null}
        </section>
      </div>

      <div className="gh-grid-2">
        <section aria-label="Root cause analysis attachments" style={{ display: "grid", gap: ".5rem", alignContent: "start" }}>
          <h3 className="gh-section-title" style={{ margin: 0 }}>Root cause analysis</h3>
          {rca.length === 0 ? <p className="gh-meta" style={{ margin: 0 }}>No RCA documents attached.{incident.isSentinel ? " A sentinel event needs a root cause before closure." : ""}</p> : (
            <div className="gh-btnrow">{rca.map((f) => urls.get(f.id) ? <a key={f.id} className="ui-button" href={urls.get(f.id) as string} target="_blank" rel="noopener noreferrer">{f.fileName}</a> : <span key={f.id} className="gh-meta">{f.fileName}</span>)}</div>
          )}
          {canWrite ? (
            <form action={uploadIncidentEvidenceAction} className="gh-form" encType="multipart/form-data">
              <input type="hidden" name="incidentId" value={incident.id} /><input type="hidden" name="kind" value="rca" /><input type="hidden" name="returnTo" value={here} />
              <div className="gh-wide"><DropZone name="files" multiple required label="Drop the RCA report, fishbone or timeline" /></div>
              <div><button className="ui-button" type="submit">Attach RCA</button></div>
            </form>
          ) : null}
        </section>

        <section aria-label="Regulatory reporting" style={{ display: "grid", gap: ".5rem", alignContent: "start" }}>
          <h3 className="gh-section-title" style={{ margin: 0 }}>Regulatory reporting</h3>
          {rules === null ? <p className="gh-meta" style={{ margin: 0 }}>Unavailable.</p> : rules.length === 0 ? (
            <p className="gh-meta" style={{ margin: 0 }}>No reporting rules are configured. Marifa does not assume any deadline: {canWrite ? <Link href={`${BASE}/settings#regulatory`}>add the rules your hospital follows in Settings</Link> : "governance staff add them in Settings"}.</p>
          ) : reporting.length === 0 ? <p className="gh-meta" style={{ margin: 0 }}>None of the configured rules applies to this incident.</p> : (
            <ul className="gh-actions">{reporting.map((r) => (
              <li key={r.rule.id} className="gh-item">
                <div className="gh-btnrow" style={{ justifyContent: "space-between" }}><h4>{r.rule.name}</h4><Badge tone={NOTE_TONE[r.state]}>{NOTIFICATION_STATE_LABEL[r.state]}</Badge></div>
                <span className="gh-meta">{r.rule.program} · within {r.rule.reportWithinHours} h of occurrence · due {formatStamp(r.dueAt.toISOString())}{r.rule.recipient ? ` · to ${r.rule.recipient}` : ""}{r.state === "due_soon" || r.state === "pending" ? ` · ${Math.max(0, Math.round(r.hoursLeft))} h left` : ""}</span>
                {r.notification ? <span className="gh-meta">Reported {formatStamp(r.notification.reportedAt)}{r.notification.externalReference ? ` · ref ${r.notification.externalReference}` : ""}{r.reportedLate ? " · after the configured deadline" : ""}</span> : canWrite ? (
                  <form action={recordNotificationAction} className="gh-form">
                    <input type="hidden" name="incidentId" value={incident.id} /><input type="hidden" name="ruleId" value={r.rule.id} /><input type="hidden" name="returnTo" value={here} />
                    <label className="gh-field">Reported at<input type="datetime-local" name="reportedAt" required /></label>
                    <label className="gh-field">Reference<input name="externalReference" maxLength={120} /></label>
                    <div><button className="ui-button ui-button-primary" type="submit">Record as reported</button></div>
                  </form>
                ) : null}
              </li>
            ))}</ul>
          )}
        </section>
      </div>

      {capa.length > 0 ? (
        <section aria-label="Action completion and effectiveness" style={{ display: "grid", gap: ".5rem" }}>
          <h3 className="gh-section-title" style={{ margin: 0 }}>Completion evidence and effectiveness</h3>
          <ul className="gh-actions">{capa.map((c) => {
            const x = capaExtras.get(c.id);
            const eff = x?.effectiveness ?? "not_assessed";
            return (
              <li key={c.id} className="gh-item">
                <div className="gh-btnrow" style={{ justifyContent: "space-between" }}><h4>{c.action}</h4><span className="gh-btnrow"><Badge tone={c.kind === "preventive" ? "info" : "muted"}>{c.kind === "preventive" ? "Preventive" : c.kind === "corrective" ? "Corrective" : "Follow-up"}</Badge><Badge tone={EFFECT_TONE[eff]}>{EFFECT_LABEL[eff]}</Badge>{isCapaOverdue(c, now) ? <Badge tone="bad">Overdue</Badge> : null}</span></div>
                <span className="gh-meta">Due {formatDate(c.dueDate)} · {nameOf(peopleById, c.ownerUserId)}{x?.completionNote ? ` · ${x.completionNote}` : ""}{x?.effectivenessCheckedBy ? ` · effectiveness checked by ${nameOf(peopleById, x.effectivenessCheckedBy)} on ${formatDate(x.effectivenessCheckedAt)}` : ""}</span>
                {x?.completionEvidencePath ? <CompletionLink ctx={ctx} path={x.completionEvidencePath} name={x.completionFileName ?? "Completion evidence"} /> : null}
                {canWrite || c.ownerUserId === myUserId ? (
                  <div className="gh-btnrow">
                    {canWrite ? (
                      <details className="gh-noprint"><summary className="ui-button" style={{ cursor: "pointer" }}>Completion evidence…</summary>
                        <form action={capaCompletionAction} className="gh-form" encType="multipart/form-data" style={{ marginTop: ".5rem", minWidth: "min(80vw, 420px)" }}>
                          <input type="hidden" name="capaId" value={c.id} /><input type="hidden" name="returnTo" value={here} />
                          <label className="gh-field gh-wide">What was done<textarea name="completionNote" maxLength={4000} defaultValue={x?.completionNote ?? ""} /></label>
                          <div className="gh-wide"><DropZone name="file" label="Drop the completion report or proof" /></div>
                          <div><button className="ui-button" type="submit">Save</button></div>
                        </form>
                      </details>
                    ) : null}
                    {canWrite && (c.status === "done" || c.status === "verified") ? (
                      <form action={capaEffectivenessAction} className="gh-btnrow">
                        <input type="hidden" name="capaId" value={c.id} /><input type="hidden" name="returnTo" value={here} />
                        <select name="effectiveness" defaultValue={eff} aria-label="Effectiveness" className="gh-inline-input" style={{ minWidth: "12rem" }}>{Object.entries(EFFECT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                        <button className="ui-button" type="submit">Record effectiveness</button>
                      </form>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}</ul>
          {capaFiles.length > 0 ? <div className="gh-btnrow"><span className="gh-meta">CAPA files:</span>{capaFiles.map((f) => urls.get(f.id) ? <a key={f.id} className="ui-button" href={urls.get(f.id) as string} target="_blank" rel="noopener noreferrer">{f.fileName}</a> : null)}</div> : null}
        </section>
      ) : null}

      <section aria-label="Improvement projects" style={{ display: "grid", gap: ".5rem" }}>
        <h3 className="gh-section-title" style={{ margin: 0 }}>Improvement projects from this incident</h3>
        {projects.length === 0 ? <p className="gh-meta" style={{ margin: 0 }}>None yet.</p> : (
          <div className="gh-btnrow">{projects.map((q) => <Link key={q.id} className="ui-button" href={`${BASE}/audits/qip/${q.id}`}>{q.title} <Badge tone={q.status === "active" ? "info" : "muted"}>{q.status}</Badge></Link>)}</div>
        )}
        {canWrite ? (
          <Details title="Start an improvement project from this incident">
            <form action={startQipFromIncidentAction} className="gh-form">
              <input type="hidden" name="incidentId" value={incident.id} /><input type="hidden" name="returnTo" value={here} />
              <label className="gh-field gh-wide">Project title<input name="title" required maxLength={240} defaultValue={`Prevent recurrence: ${incident.title}`.slice(0, 240)} /></label>
              <label className="gh-field gh-wide">Aim<textarea name="aim" maxLength={2000} placeholder="What will improve, by how much, by when?" /></label>
              <label className="gh-field">Lead<select name="leadUserId" defaultValue=""><option value="">Unassigned</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
              <div><button className="ui-button ui-button-primary" type="submit">Start project (PDSA cycle 1)</button></div>
            </form>
          </Details>
        ) : null}
      </section>
    </div>
  );
}

async function CompletionLink({ ctx, path, name }: { ctx: Ctx; path: string; name: string }) {
  const url = await signedUrl(ctx, path);
  return url ? <a className="gh-meta" href={url} target="_blank" rel="noopener noreferrer">Completion evidence: {name}</a> : <span className="gh-meta">Completion evidence: {name}</span>;
}
