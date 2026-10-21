import Link from "next/link";
import "../../../accreditation-hub.css";
import { MyPolicies } from "@/components/accreditation/my-policies";
import { Activity, AlertTriangle, BookOpen, ClipboardCheck, FileText, Gauge, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Badge, Empty, OutcomeBadge, PageHeader, Stat } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate } from "@/lib/governance/clock";
import { canReadGovernance } from "@/lib/governance/policy";
import {
  loadAckSummary, loadAudits, loadCapa, loadEvidence, loadIncidents, loadMyPolicyTasks, loadPolicies, loadQips, loadSettings, loadStandards,
  loadStatuses, openContext, signedUrl,
} from "@/lib/governance/repository";
import { computeReadiness, isoDate, summariseAuditsAndQips, summarisePolicies, summariseSafety } from "@/lib/governance/scoring";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";
import { governanceView, summariseGuidelines } from "@/lib/governance/guideline-governance";
import { summariseIndicator } from "@/lib/governance/indicators";
import {
  effectiveEvidence, loadCommittees, loadGovernedGuidelines, loadGuidelineReviews, loadIndicatorResults, loadIndicators, loadMeetings, v21,
} from "@/lib/governance/repository-v21";

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
    <PageHeader icon={<ShieldCheck size={20} />} eyebrow="Clinical governance" title="Clinical Governance"
      subtitle="Accreditation readiness, policies, incidents, audits, quality indicators and committees for your hospital, from live records."
      actions={<Link className="ui-button ui-button-primary" href={HUB}>Open governance hub</Link>} />
  );

  if (!actor) {
    return <main className="page gh-page" data-section="readiness">{header}<Empty title="Sign in to see governance">Governance records are tied to your organisation. Sign in with an account that belongs to one.</Empty></main>;
  }

  const ctx = await openContext(actor);
  if (!canReadGovernance(actor)) {
    const tasks = await loadMyPolicyTasks(ctx).catch(() => null);
    const urls: Record<string, string | null> = {};
    for (const task of (tasks ?? []).filter((t) => !t.acknowledgedAt && t.policy.storagePath)) urls[task.policy.id] = await signedUrl(ctx, task.policy.storagePath as string);
    return (
      <main className="page gh-page" data-section="readiness">
        {header}
        <div className="gh-btnrow"><Link className="ui-button ui-button-primary" href={`${HUB}/incidents`}>Report an incident</Link><Link className="ui-button" href={`${HUB}/policies`}>My policies</Link></div>
        {tasks === null ? <p className="gh-notice gh-notice-bad" role="alert">Your assigned policies could not be loaded.</p> : <MyPolicies tasks={tasks} todayIso={isoDate(today)} signedUrls={urls} returnTo="/dashboard/governance" />}
      </main>
    );
  }

  // Shown to governance staff only (this branch is after the role check) so a failed load can be diagnosed.
  const loadResult = await Promise.all([
    loadSettings(ctx), loadStandards(ctx), loadStatuses(ctx), loadEvidence(ctx), loadPolicies(ctx), loadAckSummary(ctx),
    loadIncidents(ctx), loadCapa(ctx), loadAudits(ctx), loadQips(ctx),
  ]).then((rows) => ({ rows, error: "" }), (error: unknown) => {
    console.error("[governance] load failed:", error);
    return { rows: null, error: error instanceof Error ? error.message : "Unknown error" };
  });
  const data = loadResult.rows;
  const loadError = loadResult.error;
  if (!data) {
    return <main className="page gh-page" data-section="readiness">{header}<p className="gh-notice gh-notice-bad" role="alert">Governance data could not be loaded. Check that the accreditation migration has been applied to this database.{loadError ? <><br /><small>Detail: {loadError}</small></> : null}</p></main>;
  }
  const [settings, standards, statuses, ownEvidence, policies, ack, incidents, capa, audits, qips] = data;
  const evidence = await effectiveEvidence(ctx, ownEvidence);
  const readiness = computeReadiness(standards, statuses, evidence, settings, today);
  // V2.1 summaries (counts only). Each is null until the V2.1 migration is applied, and the tile then says so.
  const [indicators, results, committees, meetings, guidelines, reviews] = await Promise.all([
    v21(loadIndicators(ctx)), v21(loadIndicatorResults(ctx)), v21(loadCommittees(ctx)), v21(loadMeetings(ctx)), v21(loadGovernedGuidelines(ctx)), v21(loadGuidelineReviews(ctx)),
  ]);
  const indicatorSummaries = indicators && results ? indicators.filter((i) => i.status === "active").map((i) => summariseIndicator(i, results)) : null;
  const guidelineSummary = guidelines && reviews ? summariseGuidelines(guidelines.map((g) => governanceView(g, reviews.find((r) => r.guidelineId === g.id) ?? null, today))) : null;
  const nowIso = today.toISOString();
  const pol = summarisePolicies(policies, ack, today);
  const safety = summariseSafety(incidents, capa, today);
  const aq = summariseAuditsAndQips(audits, qips, today);
  const empty = standards.length === 0 && policies.length === 0 && incidents.length === 0 && audits.length === 0 && qips.length === 0;

  return (
    <main className="page gh-page" data-section="readiness">
      {isTemporaryOpenAdminMode() ? <p className="gh-notice gh-notice-bad" role="alert"><strong>Temporary open-admin mode is on.</strong> Everyone who can reach this site acts as a platform administrator. Turn it off before real use.</p> : null}
      {header}
      {empty ? (
        <Empty title="No governance records yet">Start by importing your standards register, then add policies, record incidents and schedule audits. Nothing on this page is sample data.</Empty>
      ) : null}
      <section className="gh-card" aria-labelledby="acc-heading">
        <div className="gh-head"><h2 id="acc-heading" className="gh-section-title" style={{ margin: 0 }}>CBAHI accreditation readiness <Badge tone="muted">Internal estimate</Badge></h2><OutcomeBadge outcome={readiness.outcome} /></div>
        <p className="gh-meta">{readiness.outcomeNote} This is an internal readiness estimate, not an accreditation decision.</p>
        <div className="gh-grid">
          <Stat accent="blue" icon={<Gauge size={15} />} label="Readiness estimate" value={readiness.overallPct === null ? "—" : `${readiness.overallPct}%`} progress={readiness.overallPct} href={HUB} note={readiness.applicable === 0 ? "No standards loaded" : `${readiness.assessed} of ${readiness.applicable} assessed`} />
          <Stat accent="teal" icon={<ShieldCheck size={15} />} label="ESRs not satisfactory" value={readiness.esrTotal === 0 ? "—" : readiness.esrNotSatisfactory} tone={readiness.esrTotal === 0 ? undefined : readiness.esrNotSatisfactory > 0 ? "warn" : "ok"} note={readiness.esrTotal === 0 ? "No ESRs flagged" : readiness.esrNotSatisfactory > 0 ? "Need action" : "All satisfactory"} href={`${HUB}/standards?show=esr_gap`} />
          <Stat accent="turquoise" label="Evidence completeness" value={readiness.evidenceCompletenessPct === null ? "—" : `${readiness.evidenceCompletenessPct}%`} progress={readiness.evidenceCompletenessPct} note="Kept separate from the score" href={`${HUB}/standards?show=no_evidence`} />
          <Stat accent="gold" icon={<FileText size={15} />} label="Approved policies" value={pol.approved} progress={pol.ackPct} note={pol.reviewOverdue > 0 ? `${pol.reviewOverdue} overdue for review` : pol.ackPct === null ? "None assigned for signing" : `${pol.ackPct}% signed`} tone={pol.reviewOverdue > 0 ? "warn" : undefined} href={`${HUB}/policies`} />
        </div>
      </section>
      <div className="gh-grid">
        <Stat accent="coral" icon={<AlertTriangle size={15} />} label="Open incidents" value={safety.openIncidents} note={safety.openSentinel > 0 ? `${safety.openSentinel} sentinel` : safety.capaOverdue > 0 ? `${safety.capaOverdue} actions overdue` : "No sentinel events open"} tone={safety.openSentinel > 0 || safety.capaOverdue > 0 ? "bad" : undefined} href={`${HUB}/incidents`} />
        <Stat accent="blue" icon={<ClipboardCheck size={15} />} label="Audits late" value={aq.overdue} tone={aq.overdue > 0 ? "warn" : "ok"} note={`${aq.scheduledNext30} due in 30 days`} href={`${HUB}/audits`} />
        <Stat accent="emerald" icon={<Sparkles size={15} />} label="Active improvement projects" value={aq.activeQips} href={`${HUB}/audits#qip`} note={aq.belowTarget > 0 ? `${aq.belowTarget} audits below target` : "PDSA cycles in progress"} />
        <Stat accent="turquoise" icon={<Activity size={15} />} label="Quality indicators" value={indicatorSummaries ? indicatorSummaries.length : "—"} href={`${HUB}/indicators`}
          note={indicatorSummaries === null ? "Needs the V2.1 update" : `${indicatorSummaries.filter((x) => x.judgement === "off_target").length} outside target · ${indicatorSummaries.reduce((n, x) => n + x.unverifiedCount, 0)} unverified`}
          tone={indicatorSummaries && indicatorSummaries.some((x) => x.judgement === "off_target") ? "warn" : undefined} />
        <Stat accent="indigo" icon={<Users size={15} />} label="Committees" value={committees ? committees.filter((c) => c.status === "active").length : "—"} href={`${HUB}/committees`}
          note={meetings === null ? "Needs the V2.1 update" : `${meetings.filter((m) => m.status === "scheduled" && m.scheduledAt >= nowIso).length} meetings ahead · ${meetings.filter((m) => m.status === "held" || m.status === "minutes_drafted").length} minutes to approve`} />
        <Stat accent="navy" icon={<BookOpen size={15} />} label="Guideline reviews overdue" value={guidelineSummary ? guidelineSummary.overdue : "—"} href={`${HUB}/policies/guidelines`}
          note={guidelineSummary === null ? "Needs the V2.1 update" : `${guidelineSummary.approved} of ${guidelineSummary.total} governance-approved${guidelineSummary.outdatedApproval ? ` · ${guidelineSummary.outdatedApproval} on an older version` : ""}`}
          tone={guidelineSummary && guidelineSummary.overdue > 0 ? "bad" : undefined} />
      </div>
      <section className="gh-card" aria-labelledby="more-heading">
        <h2 id="more-heading" className="gh-section-title">Related governance tools</h2>
        <ul className="gh-actions">
          <li><Link className="gh-action" href={`${HUB}/policies/guidelines`} style={{ gridTemplateColumns: "1fr" }}><span><strong>Guideline governance</strong><span className="gh-hint">Owners, versions, review dates and governance approval for Marifa&apos;s clinical guidelines and local protocols.</span></span></Link></li>
          <li><Link className="gh-action" href="/dashboard/protocols" style={{ gridTemplateColumns: "1fr" }}><span><strong>Local Protocols &amp; SOPs</strong><span className="gh-hint">Hospital protocols and their review status.</span></span></Link></li>
          <li><Link className="gh-action" href={`${HUB}/report`} style={{ gridTemplateColumns: "1fr" }}><span><strong>Survey readiness report</strong><span className="gh-hint">Printable report by chapter, with CSV export.</span></span></Link></li>
          <li><Link className="gh-action" href="/dashboard/governance/demo" style={{ gridTemplateColumns: "1fr" }}><span><strong>Demonstration workspace</strong><span className="gh-hint">Interactive sample with invented data, for training only. Not your records.</span></span></Link></li>
        </ul>
      </section>
    </main>
  );
}
