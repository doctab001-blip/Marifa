import Link from "next/link";
import { ChapterRadar } from "@/components/accreditation/chapter-radar";
import { MyPolicies } from "@/components/accreditation/my-policies";
import { Badge, Empty, Gauge, Meter, Notice, OutcomeBadge, Stat, pageParam, type Tone } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate, formatDate, formatStamp } from "@/lib/governance/clock";
import { canReadGovernance } from "@/lib/governance/policy";
import { buildPriorities } from "@/lib/governance/priorities";
import {
  loadAckSummary, loadAudits, loadCapa, loadEvidence, loadIncidents, loadMyPolicyTasks, loadPolicies, loadQips, loadSettings, loadStandards,
  loadStatuses, openContext, recentAudit, signedUrl,
} from "@/lib/governance/repository";
import {
  accreditationMilestones, computeReadiness, isoDate, summariseAuditsAndQips, summarisePolicies, summariseSafety,
} from "@/lib/governance/scoring";

const BASE = "/dashboard/accreditation-and-audits";

export default async function ReadinessPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const done = pageParam(sp.done), error = pageParam(sp.error);
  const actor = await getGovernanceActor();

  if (!actor) {
    return (
      <>
        <header className="gh-head"><div><div className="gh-eyebrow">Accreditation hub</div><h1>CBAHI accreditation readiness</h1></div></header>
        <p className="gh-notice gh-notice-bad" role="alert">Sign in with an account that belongs to an organisation to use the accreditation hub.</p>
      </>
    );
  }

  const today = currentDate();
  const ctx = await openContext(actor);

  // Staff without a governance role still get their own tasks: sign policies, report an incident.
  if (!canReadGovernance(actor)) {
    let tasks: Awaited<ReturnType<typeof loadMyPolicyTasks>> = [];
    let loadError: string | null = null;
    try { tasks = await loadMyPolicyTasks(ctx); } catch { loadError = "Your policies could not be loaded. The accreditation database may not be set up yet."; }
    const urls: Record<string, string | null> = {};
    for (const task of tasks.filter((t) => !t.acknowledgedAt && t.policy.storagePath)) urls[task.policy.id] = await signedUrl(ctx, task.policy.storagePath as string);
    return (
      <>
        <header className="gh-head"><div><div className="gh-eyebrow">Accreditation hub</div><h1>Your safety and policy tasks</h1><p>Read the policies assigned to you and report anything that went wrong or nearly did.</p></div>
          <Link className="ui-button ui-button-primary" href={`${BASE}/incidents`}>Report an incident</Link></header>
        <Notice done={done} error={error} />
        {loadError ? <p className="gh-notice gh-notice-bad" role="alert">{loadError}</p> : null}
        <MyPolicies tasks={tasks} todayIso={isoDate(today)} signedUrls={urls} returnTo={BASE} />
      </>
    );
  }

  const data = await Promise.all([
    loadSettings(ctx), loadStandards(ctx), loadStatuses(ctx), loadEvidence(ctx), loadPolicies(ctx), loadAckSummary(ctx),
    loadIncidents(ctx), loadCapa(ctx), loadAudits(ctx), loadQips(ctx), recentAudit(ctx),
  ]).then(([settings, standards, statuses, evidence, policies, ack, incidents, capa, audits, qips, activity]) => (
    { settings, standards, statuses, evidence, policies, ack, incidents, capa, audits, qips, activity }
  )).catch(() => null);
  if (!data) {
    return (
      <>
        <header className="gh-head"><div><div className="gh-eyebrow">Accreditation hub</div><h1>CBAHI accreditation readiness</h1></div></header>
        <p className="gh-notice gh-notice-bad" role="alert">The accreditation data could not be loaded. Has the accreditation hub migration (20261020190000) been applied to this database?</p>
      </>
    );
  }

  const readiness = computeReadiness(data.standards, data.statuses, data.evidence, data.settings, today);
  const policyOverview = summarisePolicies(data.policies, data.ack, today);
  const safety = summariseSafety(data.incidents, data.capa, today);
  const auditOverview = summariseAuditsAndQips(data.audits, data.qips, today);
  const milestones = accreditationMilestones(data.settings, today);
  const priorities = buildPriorities({ readiness, policies: policyOverview, safety, audits: auditOverview, milestones });

  const gaugeTone: Exclude<Tone, "info"> = readiness.outcome === "accreditation" ? "ok" : readiness.outcome === "conditional" ? "warn" : readiness.outcome === "denial_risk" ? "bad" : "muted";
  const hasStandards = readiness.totalStandards > 0;
  const radar = readiness.chapters.filter((c) => c.pct !== null).map((c) => ({ chapter: c.chapterCode || c.chapterName || "—", score: c.pct as number }));

  return (
    <>
      <header className="gh-head">
        <div>
          <div className="gh-eyebrow">Accreditation hub</div>
          <h1>CBAHI accreditation readiness</h1>
          <p>Every figure here is calculated from the records in this hub. Nothing is estimated or pre-filled.</p>
        </div>
        <div className="gh-btnrow gh-noprint">
          <Link className="ui-button" href={`${BASE}/report`}>Survey report</Link>
          <Link className="ui-button ui-button-primary" href={`${BASE}/incidents`}>Report an incident</Link>
        </div>
      </header>
      <Notice done={done} error={error} />

      {!hasStandards ? (
        <Empty title="Start by loading your standards">
          <p>Marifa does not ship CBAHI&apos;s standards text, because it belongs to CBAHI and your hospital is surveyed against a specific edition. Load the edition you are licensed to use, then everything else lights up.</p>
          <ol className="gh-steps">
            <li><Link href={`${BASE}/standards`}><strong>Import your standards register</strong></Link> from a CSV (code, description, chapter, ESR flag).</li>
            <li><Link href={`${BASE}/settings`}><strong>Confirm scoring thresholds</strong></Link> and enter the date accreditation was awarded.</li>
            <li>Attach evidence to each standard, then record an honest assessment.</li>
            <li>Assign policies for read-and-sign, and log incidents with their corrective actions.</li>
          </ol>
        </Empty>
      ) : (
        <section className="gh-card" aria-labelledby="indication-heading">
          <div className="gh-hero">
            <Gauge pct={readiness.overallPct} label="Readiness estimate" tone={gaugeTone} />
            <div style={{ display: "grid", gap: ".6rem" }}>
              <div className="gh-btnrow"><h2 id="indication-heading" style={{ margin: 0 }}>Indicated outcome</h2><OutcomeBadge outcome={readiness.outcome} /></div>
              <p style={{ margin: 0 }}>{readiness.outcomeNote}</p>
              <div className="gh-btnrow">
                <Badge tone="info">{readiness.assessed} of {readiness.applicable} assessed{readiness.coveragePct !== null ? ` · ${readiness.coveragePct}%` : ""}</Badge>
                {readiness.worstCasePct !== null && readiness.unassessed > 0 ? <Badge tone="warn">Worst case {readiness.worstCasePct}% if the rest score 0</Badge> : null}
                {readiness.recordedPct !== null && readiness.recordedPct !== readiness.overallPct ? <Badge tone="warn">As recorded {readiness.recordedPct}% · {readiness.satisfactoryWithoutCurrentEvidence} lack current evidence</Badge> : null}
              </div>
              <Meter pct={readiness.coveragePct} tone="info" label="Assessment coverage" />
              <p className="gh-meta" style={{ margin: 0 }}>
                An indication for preparation only, not a CBAHI decision. Scoring follows: {data.settings.scoringSourceNote}
                {data.settings.editionLabel ? ` Edition in use: ${data.settings.editionLabel}.` : ""} Satisfactory ratings whose evidence has expired are counted as partial in this estimate; evidence completeness is shown separately below. Method: {readiness.methodVersion}.
              </p>
            </div>
          </div>
        </section>
      )}

      {hasStandards ? (
        <div className="gh-grid">
          <Stat label="Essential safety requirements" value={`${readiness.esrSatisfactory}`} unit={`of ${readiness.esrTotal} satisfactory`} href={`${BASE}/standards?show=esr_gap`}
            note={readiness.esrTotal === 0 ? "No ESRs flagged in your register" : readiness.esrNotSatisfactory === 0 ? "All satisfactory" : `${readiness.esrNotSatisfactory} need action`}
            tone={readiness.esrTotal === 0 ? "muted" : readiness.esrNotSatisfactory === 0 ? "ok" : "bad"} />
          <Stat label="Evidence" value={readiness.satisfactory - readiness.satisfactoryWithoutCurrentEvidence} unit={`of ${readiness.satisfactory} satisfactory backed`} href={`${BASE}/standards?show=no_evidence`}
            note={readiness.satisfactoryWithoutCurrentEvidence > 0 ? `${readiness.satisfactoryWithoutCurrentEvidence} without current evidence` : readiness.expiringEvidence > 0 ? `${readiness.expiringEvidence} expiring soon` : "All current"}
            tone={readiness.satisfactoryWithoutCurrentEvidence > 0 ? "bad" : readiness.expiringEvidence > 0 ? "warn" : "ok"} />
          <Stat label="Read-and-sign" value={policyOverview.ackPct === null ? "—" : `${policyOverview.ackPct}`} unit={policyOverview.ackPct === null ? "" : "%"} href={`${BASE}/policies`}
            note={policyOverview.assigned === 0 ? "No policies assigned yet" : `${policyOverview.acknowledged} of ${policyOverview.assigned} signed${policyOverview.overdueAssignments ? ` · ${policyOverview.overdueAssignments} overdue` : ""}`}
            tone={policyOverview.assigned === 0 ? "muted" : policyOverview.overdueAssignments > 0 ? "warn" : "ok"} />
          <Stat label="Open sentinel events" value={safety.openSentinel} href={`${BASE}/incidents?status=open`} note={safety.openIncidents === 0 ? "No open incidents" : `${safety.openIncidents} open incident${safety.openIncidents === 1 ? "" : "s"}`} tone={safety.openSentinel > 0 ? "bad" : "ok"} />
          <Stat label="Corrective actions" value={safety.capaOpen} unit="open" href={`${BASE}/incidents?show=capa_overdue`} note={safety.capaOverdue > 0 ? `${safety.capaOverdue} overdue` : "None overdue"} tone={safety.capaOverdue > 0 ? "bad" : "ok"} />
          <Stat label="Audits" value={auditOverview.scheduledNext30} unit="due in 30 days" href={`${BASE}/audits`} note={auditOverview.overdue > 0 ? `${auditOverview.overdue} past due` : `${auditOverview.activeQips} active improvement project${auditOverview.activeQips === 1 ? "" : "s"}`} tone={auditOverview.overdue > 0 ? "warn" : "muted"} />
        </div>
      ) : null}

      <div className="gh-grid-2">
        <section className="gh-card" aria-labelledby="priorities-heading">
          <h2 id="priorities-heading">Fix this first</h2>
          <p className="gh-sub">Ordered by how likely each item is to cost accreditation.</p>
          {priorities.length === 0 ? (
            <Empty title="Nothing urgent">No gaps were found in the records you have entered. Keep assessments, evidence and reviews current.</Empty>
          ) : (
            <ul className="gh-actions">
              {priorities.map((item) => (
                <li key={item.id}>
                  <Link className="gh-action" href={item.href}>
                    <span className={`gh-dot gh-dot-${item.tone}`} aria-hidden="true" />
                    <span><strong>{item.title}</strong><span className="gh-hint">{item.hint}</span></span>
                    <Badge tone={item.tone === "info" ? "info" : item.tone}>{item.tone === "bad" ? "Urgent" : item.tone === "warn" ? "Soon" : "Planned"}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="gh-card" aria-labelledby="chapters-heading">
          <h2 id="chapters-heading">Readiness by chapter</h2>
          <p className="gh-sub">Mean score of assessed standards in each chapter.</p>
          {readiness.chapters.length === 0 ? <Empty title="No chapters yet">Chapters appear once standards are imported.</Empty> : (
            <>
              {radar.length >= 3 ? <ChapterRadar data={radar} /> : null}
              <div className="gh-chapters">
                {readiness.chapters.map((chapter) => (
                  <div className="gh-chapter" key={chapter.key}>
                    <span className="gh-chapter-name" title={chapter.chapterName || chapter.chapterCode}>{chapter.chapterCode || chapter.chapterName || "—"}</span>
                    <Meter pct={chapter.pct} label={`${chapter.chapterCode || chapter.chapterName} readiness`} />
                    <span className="gh-chapter-pct">{chapter.pct === null ? "—" : `${chapter.pct}%`}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <div className="gh-grid-2">
        <section className="gh-card" aria-labelledby="calendar-heading">
          <h2 id="calendar-heading">Accreditation calendar</h2>
          {milestones ? (
            <table className="gh-table">
              <tbody>
                <tr><th scope="row">Awarded</th><td>{formatDate(milestones.awardedOn)}</td></tr>
                <tr><th scope="row">Mid-term self-assessment due</th><td>{formatDate(milestones.midTermSelfAssessmentDue)}</td></tr>
                <tr><th scope="row">Re-accreditation update due</th><td>{formatDate(milestones.reaccreditationUpdateDue)}</td></tr>
                <tr><th scope="row">Accreditation expires</th><td>{formatDate(milestones.expiresOn)} <Badge tone={milestones.daysToExpiry < 0 ? "bad" : milestones.daysToExpiry <= 180 ? "warn" : "ok"}>{milestones.daysToExpiry < 0 ? "Expired" : `${milestones.daysToExpiry} days left`}</Badge></td></tr>
              </tbody>
            </table>
          ) : <Empty title="No award date set">Enter the date accreditation was awarded in <Link href={`${BASE}/settings`}><strong>Settings</strong></Link> to track the mid-term self-assessment and re-accreditation deadlines.</Empty>}
          <p className="gh-meta">Dates follow the CBAHI process guide: three-year validity, mid-term self-assessment about 18 months in, and the re-accreditation update 12 weeks before expiry. Confirm against your award letter.</p>
        </section>

        <section className="gh-card" aria-labelledby="activity-heading">
          <h2 id="activity-heading">Recent activity</h2>
          <p className="gh-sub">From the audit trail: every change is recorded with who made it.</p>
          {data.activity.length === 0 ? <Empty title="No activity yet">Changes to standards, evidence, policies and incidents appear here.</Empty> : (
            <ul className="gh-actions">
              {data.activity.map((event) => (
                <li key={event.id} className="gh-row" style={{ gridTemplateColumns: "1fr auto" }}>
                  <span><strong>{describeEvent(event.action)}</strong> <span className="gh-meta">{summaryOf(event.metadata)}</span></span>
                  <span className="gh-meta">{formatStamp(event.occurredAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

const ENTITY_LABEL: Record<string, string> = {
  gov_standards: "Standard", gov_assessments: "Assessment", gov_evidence: "Evidence", gov_policies: "Policy", gov_policy_assignments: "Policy assignment",
  gov_acknowledgements: "Acknowledgement", gov_incidents: "Incident", gov_incident_files: "Incident file", gov_audits: "Audit", gov_capa: "Corrective action",
  gov_qips: "Improvement project", gov_settings: "Settings",
};
function describeEvent(action: string): string {
  const [, table, op] = action.split(".");
  const entity = ENTITY_LABEL[table] ?? "Record";
  return `${entity} ${op === "insert" ? "added" : op === "update" ? "updated" : op === "delete" ? "removed" : op}`;
}
function summaryOf(metadata: Record<string, unknown>): string {
  if (typeof metadata.summary === "string" && metadata.summary) return `· ${metadata.summary.slice(0, 80)}`;
  const changes = metadata.changes;
  return changes && typeof changes === "object" ? `· changed ${Object.keys(changes).slice(0, 3).join(", ")}` : "";
}
