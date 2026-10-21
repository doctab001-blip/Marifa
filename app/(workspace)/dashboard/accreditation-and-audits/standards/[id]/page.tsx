import Link from "next/link";
import { notFound } from "next/navigation";
import {
  recordAssessmentAction, updateStandardAction, uploadEvidenceAction, withdrawEvidenceAction,
} from "@/app/(workspace)/dashboard/accreditation-and-audits/actions";
import { ShieldCheck } from "lucide-react";
import { StandardV21 } from "@/components/accreditation/standard-v21";
import { Badge, Details, Empty, EvidenceBadge, Notice, PageHeader, RatingBadge, nameOf, pageParam } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { effectiveEvidence } from "@/lib/governance/repository-v21";
import { currentDate, formatBytes, formatDate, formatStamp } from "@/lib/governance/clock";
import { canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import {
  loadAssessmentHistory, loadEvidence, loadPeople, loadPolicies, loadPolicyStandardLinks, loadStandardById, loadStatuses, openContext, signedUrl,
} from "@/lib/governance/repository";
import { evidenceHealth, isBackedByEvidence } from "@/lib/governance/scoring";
import { EVIDENCE_TYPE_LABEL, type Rating } from "@/lib/governance/types";

const BASE = "/dashboard/accreditation-and-audits";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const METHOD_LABEL: Record<string, string> = { self_assessment: "Self-assessment", mock_survey: "Mock survey", audit: "Audit", external_survey: "External survey" };

export default async function StandardPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const done = pageParam(sp.done), error = pageParam(sp.error);
  if (!UUID.test(id)) notFound();
  const actor = await getGovernanceActor();
  if (!canReadGovernance(actor)) {
    return <p className="gh-notice gh-notice-bad" role="alert">Standards are visible to governance staff and auditors only.</p>;
  }
  const canWrite = canWriteGovernance(actor);
  const today = currentDate();
  const ctx = await openContext(actor);

  const standard = await loadStandardById(ctx, id).catch(() => null);
  if (!standard) notFound();
  const [history, evidence, people, statuses, policies, links] = await Promise.all([
    loadAssessmentHistory(ctx, id), loadEvidence(ctx, id), loadPeople(ctx).catch(() => []), loadStatuses(ctx), loadPolicies(ctx), loadPolicyStandardLinks(ctx),
  ]);
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  const status = statuses.find((row) => row.standardId === id);
  const rating: Rating | null = status?.rating ?? null;
  // Health counts files linked here and ignores replaced versions, matching the database guard.
  const health = evidenceHealth((await effectiveEvidence(ctx, await loadEvidence(ctx))).filter((item) => item.standardId === id), today);
  const linkedPolicies = policies.filter((policy) => links.some((link) => link.standardId === id && link.policyId === policy.id));
  const active = evidence.filter((item) => !item.withdrawnAt);
  const withdrawn = evidence.filter((item) => item.withdrawnAt);
  const urls = new Map<string, string | null>();
  for (const item of evidence) urls.set(item.id, await signedUrl(ctx, item.storagePath));
  const here = `${BASE}/standards/${id}`;

  return (
    <>
      <PageHeader icon={<ShieldCheck size={20} />} eyebrow={<><Link href={`${BASE}/standards`}>Standards &amp; evidence</Link> / {standard.chapterCode || standard.chapterName || "Standard"}</>}
        title={<>{standard.code} {standard.isEsr ? <Badge tone="bad">Essential safety requirement</Badge> : null}</>} subtitle={standard.description}
        actions={<><RatingBadge rating={rating} /><EvidenceBadge health={health} count={active.length} /></>} />
      <Notice done={done} error={error} />
      {rating === "satisfactory" && !isBackedByEvidence(health) ? (
        <p className="gh-notice gh-notice-bad" role="alert">This standard is rated satisfactory but has no current evidence. It is counted as partial in your readiness score until you attach current evidence.</p>
      ) : null}

      <div className="gh-grid-2">
        <section className="gh-card" aria-labelledby="assess-heading">
          <h2 id="assess-heading">Assessment</h2>
          <p className="gh-sub">Ratings follow the CBAHI scale. A satisfactory rating needs current evidence; partial or insufficient needs a note describing the gap.</p>
          {canWrite ? (
            <form action={recordAssessmentAction} className="gh-form">
              <input type="hidden" name="standardId" value={id} />
              <input type="hidden" name="returnTo" value={here} />
              <label className="gh-field">Rating
                <select name="rating" required defaultValue="">
                  <option value="" disabled>Choose…</option>
                  <option value="satisfactory">Satisfactory (80% or more compliant)</option>
                  <option value="partial">Partial (50% to under 80%)</option>
                  <option value="insufficient">Insufficient (under 50%)</option>
                  <option value="not_applicable">Not applicable (excluded from scoring)</option>
                </select></label>
              <label className="gh-field">Method
                <select name="method" defaultValue="self_assessment">{Object.entries(METHOD_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
              <label className="gh-field">Next re-assessment<input type="date" name="nextReviewDue" /><small>Blank = {standard.reviewIntervalMonths} months from today</small></label>
              <label className="gh-field gh-wide">Notes — what you found, or the gap<textarea name="notes" maxLength={4000} /></label>
              <div><button className="ui-button ui-button-primary" type="submit">Record assessment</button></div>
            </form>
          ) : <p className="gh-meta">Read-only access.</p>}
          <h3 style={{ marginTop: "1rem" }}>History</h3>
          {history.length === 0 ? <Empty title="Not assessed yet">No assessment has been recorded for this standard.</Empty> : (
            <ul className="gh-actions">
              {history.map((entry) => (
                <li className="gh-item" key={entry.id}>
                  <div className="gh-btnrow" style={{ justifyContent: "space-between" }}><RatingBadge rating={entry.rating} /><span className="gh-meta">{METHOD_LABEL[entry.method] ?? entry.method} · {formatStamp(entry.assessedAt)}</span></div>
                  {entry.notes ? <p style={{ margin: 0 }}>{entry.notes}</p> : null}
                  <span className="gh-meta">By {nameOf(peopleById, entry.assessedBy)}{entry.nextReviewDue ? ` · re-assess by ${formatDate(entry.nextReviewDue)}` : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="gh-card" aria-labelledby="evidence-heading">
          <h2 id="evidence-heading">Evidence</h2>
          <p className="gh-sub">Files a surveyor can be shown. Records are never deleted: withdrawing one keeps it on file with a reason but stops it counting.</p>
          {canWrite ? (
            <Details title="Attach evidence" open={active.length === 0}>
              <form action={uploadEvidenceAction} className="gh-form" encType="multipart/form-data">
                <input type="hidden" name="standardId" value={id} />
                <input type="hidden" name="returnTo" value={here} />
                <label className="gh-field gh-wide">File (PDF, Word, Excel, CSV, text, PNG or JPEG · max 20 MB)<input type="file" name="file" required /></label>
                <label className="gh-field">Title<input name="title" maxLength={240} placeholder="Defaults to the file name" /></label>
                <label className="gh-field">Type<select name="evidenceType" defaultValue="other">{Object.entries(EVIDENCE_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                <label className="gh-field">Valid from<input type="date" name="validFrom" /></label>
                <label className="gh-field">Valid until<input type="date" name="validUntil" /><small>Leave blank only if it never expires</small></label>
                <div><button className="ui-button ui-button-primary" type="submit">Attach</button></div>
              </form>
            </Details>
          ) : null}
          {active.length === 0 ? <div style={{ marginTop: ".8rem" }}><Empty title="No evidence attached">Attach the policy, audit report, minutes or log that shows this standard is met.</Empty></div> : (
            <ul className="gh-actions" style={{ marginTop: ".8rem" }}>
              {active.map((item) => {
                const expired = item.validUntil !== null && item.validUntil < today.toISOString().slice(0, 10);
                const url = urls.get(item.id);
                return (
                  <li className="gh-item" key={item.id}>
                    <div className="gh-btnrow" style={{ justifyContent: "space-between" }}>
                      <h4>{item.title}</h4>
                      <Badge tone={expired ? "bad" : item.validUntil ? "ok" : "info"}>{expired ? "Expired" : item.validUntil ? `Valid to ${formatDate(item.validUntil)}` : "No expiry"}</Badge>
                    </div>
                    <span className="gh-meta">{EVIDENCE_TYPE_LABEL[item.evidenceType]} · {item.fileName} {formatBytes(item.sizeBytes) && `· ${formatBytes(item.sizeBytes)}`} · added {formatDate(item.uploadedAt)} by {nameOf(peopleById, item.uploadedBy)}</span>
                    <div className="gh-btnrow">
                      {url ? <a className="ui-button" href={url} target="_blank" rel="noopener noreferrer">Open file</a> : <span className="gh-meta">File link unavailable.</span>}
                      {canWrite ? (
                        <details className="gh-noprint"><summary className="ui-button" style={{ cursor: "pointer" }}>Withdraw…</summary>
                          <form action={withdrawEvidenceAction} className="gh-form" style={{ marginTop: ".5rem" }}>
                            <input type="hidden" name="evidenceId" value={item.id} /><input type="hidden" name="standardId" value={id} /><input type="hidden" name="returnTo" value={here} />
                            <label className="gh-field gh-wide">Reason<input name="reason" required maxLength={500} placeholder="e.g. superseded by the 2026 version" /></label>
                            <div><button className="ui-button ui-button-danger" type="submit">Withdraw evidence</button></div>
                          </form></details>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {withdrawn.length > 0 ? (
            <Details title={`Withdrawn (${withdrawn.length})`}>
              <ul className="gh-actions">{withdrawn.map((item) => <li className="gh-row" style={{ gridTemplateColumns: "1fr" }} key={item.id}><span><strong>{item.title}</strong> <span className="gh-meta">withdrawn {formatDate(item.withdrawnAt)} — {item.withdrawnReason}</span></span></li>)}</ul>
            </Details>
          ) : null}
        </section>
      </div>

      <div className="gh-grid-2">
        <section className="gh-card" aria-labelledby="links-heading">
          <h2 id="links-heading">Linked policies</h2>
          {linkedPolicies.length === 0 ? <p className="gh-meta">No policy is linked to this standard. Link policies by standard code when you create them.</p> : (
            <ul className="gh-actions">{linkedPolicies.map((policy) => (
              <li key={policy.id}><Link className="gh-action" href={`${BASE}/policies/${policy.id}`} style={{ gridTemplateColumns: "1fr auto" }}><span><strong>{policy.title}</strong><span className="gh-hint">v{policy.version}</span></span><Badge tone={policy.status === "approved" ? "ok" : "muted"}>{policy.status.replace(/_/g, " ")}</Badge></Link></li>
            ))}</ul>
          )}
        </section>
        <section className="gh-card" aria-labelledby="owner-heading">
          <h2 id="owner-heading">Ownership</h2>
          {canWrite ? (
            <form action={updateStandardAction} className="gh-form">
              <input type="hidden" name="standardId" value={id} /><input type="hidden" name="returnTo" value={here} />
              <label className="gh-field">Responsible person
                <select name="ownerUserId" defaultValue={standard.ownerUserId ?? ""}><option value="">Unassigned</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
              <label className="gh-field">Department<input name="department" defaultValue={standard.department} maxLength={160} /></label>
              <label className="gh-field">Re-assess every (months)<input type="number" name="reviewIntervalMonths" min={1} max={60} defaultValue={standard.reviewIntervalMonths} /></label>
              <label className="gh-check"><input type="checkbox" name="isEsr" defaultChecked={standard.isEsr} /> Essential safety requirement (ESR)</label>
              <div><button className="ui-button" type="submit">Save</button></div>
            </form>
          ) : (
            <p>{standard.ownerUserId ? nameOf(peopleById, standard.ownerUserId) : "Unassigned"}{standard.department ? ` · ${standard.department}` : ""}</p>
          )}
          <p className="gh-meta">Edition: {standard.edition}</p>
        </section>
      </div>
      <StandardV21 ctx={ctx} standardId={id} standardCode={standard.code} canWrite={canWrite} people={people} today={today} here={here} />
    </>
  );
}
