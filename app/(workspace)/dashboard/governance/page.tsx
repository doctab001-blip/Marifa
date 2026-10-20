import Link from "next/link";
import "../../../accreditation-hub.css";
import { MyPolicies } from "@/components/accreditation/my-policies";
import { Badge, Empty, OutcomeBadge, Stat } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate } from "@/lib/governance/clock";
import { canReadGovernance } from "@/lib/governance/policy";
import {
  loadAckSummary, loadAudits, loadCapa, loadEvidence, loadIncidents, loadMyPolicyTasks, loadPolicies, loadQips, loadSettings, loadStandards,
  loadStatuses, openContext, signedUrl,
} from "@/lib/governance/repository";
import { computeReadiness, isoDate, summariseAuditsAndQips, summarisePolicies, summariseSafety } from "@/lib/governance/scoring";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";

const HUB = "/dashboard/accreditation-and-audits";

export const metadata = { title: "Clinical Governance — Marifa" };

/**
 * Clinical Governance landing page. Every figure comes from the accreditation database; with no records the page says so
 * rather than showing sample numbers. Counts only: no incident text appears here, so it is safe on a shared screen.
 */
export default async function ClinicalGovernancePage() {
  const actor = await getGovernanceActor();
  const today = currentDate();
  const header = (
    <header className="gh-head">
      <div>
        <div className="gh-eyebrow">Clinical governance</div>
        <h1>Clinical Governance</h1>
        <p>Accreditation readiness, policies, incidents, audits and improvement projects for your hospital, from live records.</p>
      </div>
    </header>
  );

  if (!actor) {
    return <main className="page gh-page">{header}<Empty title="Sign in to see governance">Governance records are tied to your organisation. Sign in with an account that belongs to one.</Empty></main>;
  }

  const ctx = await openContext(actor);
  if (!canReadGovernance(actor)) {
    const tasks = await loadMyPolicyTasks(ctx).catch(() => null);
    const urls: Record<string, string | null> = {};
    for (const task of (tasks ?? []).filter((t) => !t.acknowledgedAt && t.policy.storagePath)) urls[task.policy.id] = await signedUrl(ctx, task.policy.storagePath as string);
    return (
      <main className="page gh-page">
        {header}
        <div className="gh-btnrow"><Link className="ui-button ui-button-primary" href={`${HUB}/incidents`}>Report an incident</Link><Link className="ui-button" href={`${HUB}/policies`}>My policies</Link></div>
        {tasks === null ? <p className="gh-notice gh-notice-bad" role="alert">Your assigned policies could not be loaded.</p> : <MyPolicies tasks={tasks} todayIso={isoDate(today)} signedUrls={urls} returnTo="/dashboard/governance" />}
      </main>
    );
  }

  let loadError = "";
  const data = await Promise.all([
    loadSettings(ctx), loadStandards(ctx), loadStatuses(ctx), loadEvidence(ctx), loadPolicies(ctx), loadAckSummary(ctx),
    loadIncidents(ctx), loadCapa(ctx), loadAudits(ctx), loadQips(ctx),
  ]).catch((error: unknown) => {
    // Shown to governance staff only (this branch is after the role check) so a failed load can be diagnosed.
    console.error("[governance] load failed:", error);
    loadError = error instanceof Error ? error.message : "Unknown error";
    return null;
  });
  if (!data) {
    return <main className="page gh-page">{header}<p className="gh-notice gh-notice-bad" role="alert">Governance data could not be loaded. Check that the accreditation migration has been applied to this database.{loadError ? <><br /><small>Detail: {loadError}</small></> : null}</p></main>;
  }
  const [settings, standards, statuses, evidence, policies, ack, incidents, capa, audits, qips] = data;
  const readiness = computeReadiness(standards, statuses, evidence, settings, today);
  const pol = summarisePolicies(policies, ack, today);
  const safety = summariseSafety(incidents, capa, today);
  const aq = summariseAuditsAndQips(audits, qips, today);
  const empty = standards.length === 0 && policies.length === 0 && incidents.length === 0 && audits.length === 0 && qips.length === 0;

  return (
    <main className="page gh-page">
      {isTemporaryOpenAdminMode() ? <p className="gh-notice gh-notice-bad" role="alert"><strong>Temporary open-admin mode is on.</strong> Everyone who can reach this site acts as a platform administrator. Turn it off before real use.</p> : null}
      {header}
      {empty ? (
        <Empty title="No governance records yet">Start by importing your standards register, then add policies, record incidents and schedule audits. Nothing on this page is sample data.</Empty>
      ) : null}
      <section className="gh-card" aria-labelledby="acc-heading">
        <div className="gh-head"><h2 id="acc-heading">CBAHI accreditation readiness <Badge tone="muted">Internal estimate</Badge></h2><Link className="ui-button ui-button-primary" href={HUB}>Open accreditation hub</Link></div>
        <div className="gh-btnrow"><OutcomeBadge outcome={readiness.outcome} /></div>
        <p className="gh-meta">{readiness.outcomeNote} This is an internal readiness estimate, not an accreditation decision.</p>
        <div className="gh-grid">
          <Stat label="Standards assessed" value={readiness.applicable === 0 ? "—" : `${readiness.assessed} / ${readiness.applicable}`} href={`${HUB}/standards`} />
          <Stat label="Readiness estimate" value={readiness.overallPct === null ? "—" : `${readiness.overallPct}%`} href={HUB} />
          <Stat label="Evidence completeness" value={readiness.evidenceCompletenessPct === null ? "—" : `${readiness.evidenceCompletenessPct}%`} note="Kept separate from the score" href={`${HUB}/standards?show=no_evidence`} />
          <Stat label="ESRs not satisfactory" value={readiness.esrTotal === 0 ? "—" : readiness.esrNotSatisfactory} tone={readiness.esrNotSatisfactory > 0 ? "warn" : "ok"} href={`${HUB}/standards`} />
        </div>
      </section>
      <div className="gh-grid">
        <Stat label="Approved policies" value={pol.approved} note={pol.reviewOverdue > 0 ? `${pol.reviewOverdue} overdue for review` : undefined} tone={pol.reviewOverdue > 0 ? "warn" : undefined} href={`${HUB}/policies`} />
        <Stat label="Policies signed" value={pol.ackPct === null ? "—" : `${pol.ackPct}%`} note={pol.overdueAssignments > 0 ? `${pol.overdueAssignments} overdue` : undefined} href={`${HUB}/policies`} />
        <Stat label="Open incidents" value={safety.openIncidents} note={safety.openSentinel > 0 ? `${safety.openSentinel} sentinel` : undefined} tone={safety.openSentinel > 0 ? "bad" : undefined} href={`${HUB}/incidents`} />
        <Stat label="Corrective actions overdue" value={safety.capaOverdue} tone={safety.capaOverdue > 0 ? "warn" : "ok"} href={`${HUB}/incidents?show=capa_overdue`} />
        <Stat label="Audits late" value={aq.overdue} tone={aq.overdue > 0 ? "warn" : "ok"} note={`${aq.scheduledNext30} due in 30 days`} href={`${HUB}/audits`} />
        <Stat label="Active improvement projects" value={aq.activeQips} href={`${HUB}/audits#qip`} />
      </div>
      <section className="gh-card" aria-labelledby="more-heading">
        <h2 id="more-heading">Related governance tools</h2>
        <ul className="gh-actions">
          <li><Link className="gh-action" href="/dashboard/protocols" style={{ gridTemplateColumns: "1fr" }}><span><strong>Local Protocols &amp; SOPs</strong><span className="gh-hint">Hospital protocols and their review status.</span></span></Link></li>
          <li><Link className="gh-action" href={`${HUB}/report`} style={{ gridTemplateColumns: "1fr" }}><span><strong>Survey readiness report</strong><span className="gh-hint">Printable report by chapter, with CSV export.</span></span></Link></li>
          <li><Link className="gh-action" href="/dashboard/governance/demo" style={{ gridTemplateColumns: "1fr" }}><span><strong>Demonstration workspace</strong><span className="gh-hint">Interactive sample with invented data, for training only. Not your records.</span></span></Link></li>
        </ul>
      </section>
    </main>
  );
}
