import Link from "next/link";
import { createPolicyAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions";
import { MyPolicies } from "@/components/accreditation/my-policies";
import { Badge, Details, Empty, Meter, Notice, nameOf, pageParam } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate, formatDate } from "@/lib/governance/clock";
import { canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import { loadAckSummary, loadMyPolicyTasks, loadPeople, loadPolicies, openContext, signedUrl } from "@/lib/governance/repository";
import { isoDate, summarisePolicies } from "@/lib/governance/scoring";
import type { PolicyStatus } from "@/lib/governance/types";

const BASE = "/dashboard/accreditation-and-audits";
const COLUMNS: { status: PolicyStatus; title: string; hint: string }[] = [
  { status: "draft", title: "Draft", hint: "Being written" },
  { status: "under_committee_review", title: "Committee review", hint: "Awaiting decision" },
  { status: "approved", title: "Approved", hint: "In force" },
  { status: "retired", title: "Retired", hint: "No longer in force" },
];

export default async function PoliciesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const done = pageParam(sp.done), error = pageParam(sp.error);
  const actor = await getGovernanceActor();
  if (!actor) return <p className="gh-notice gh-notice-bad" role="alert">Sign in to see your policies.</p>;
  const today = currentDate();
  const ctx = await openContext(actor);
  const reader = canReadGovernance(actor);
  const canWrite = canWriteGovernance(actor);

  let tasks: Awaited<ReturnType<typeof loadMyPolicyTasks>> = [];
  let tasksError = false;
  try { tasks = await loadMyPolicyTasks(ctx); } catch { tasksError = true; }
  const urls: Record<string, string | null> = {};
  for (const task of tasks.filter((t) => !t.acknowledgedAt && t.policy.storagePath)) urls[task.policy.id] = await signedUrl(ctx, task.policy.storagePath as string);

  const mine = (
    <>
      {tasksError ? <p className="gh-notice gh-notice-bad" role="alert">Your assigned policies could not be loaded. The accreditation database may not be set up yet.</p> : null}
      <MyPolicies tasks={tasks} todayIso={isoDate(today)} signedUrls={urls} returnTo={`${BASE}/policies`} />
    </>
  );

  if (!reader) {
    return <><header className="gh-head"><div><div className="gh-eyebrow">Accreditation hub</div><h1>Policies &amp; read-and-sign</h1></div></header><Notice done={done} error={error} />{mine}</>;
  }

  const loaded = await Promise.all([loadPolicies(ctx), loadAckSummary(ctx), loadPeople(ctx).catch(() => [])]).catch(() => null);
  if (!loaded) return <p className="gh-notice gh-notice-bad" role="alert">Policies could not be loaded. Has the accreditation hub migration been applied?</p>;
  const [policies, ack, people] = loaded;
  const overview = summarisePolicies(policies, ack, today);
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));

  return (
    <>
      <header className="gh-head">
        <div><div className="gh-eyebrow">Accreditation hub</div><h1>Policies &amp; read-and-sign</h1>
          <p>Move each policy from draft to committee to approved, then assign it to staff and track who has signed.</p></div>
        <div className="gh-btnrow">
          <Badge tone="info">{overview.approved} approved</Badge>
          {overview.reviewOverdue > 0 ? <Badge tone="bad">{overview.reviewOverdue} overdue for review</Badge> : null}
          {overview.ackPct !== null ? <Badge tone={overview.overdueAssignments > 0 ? "warn" : "ok"}>{overview.ackPct}% signed</Badge> : null}
        </div>
      </header>
      <Notice done={done} error={error} />
      {mine}

      {canWrite ? (
        <Details title="Add a policy" open={policies.length === 0}>
          <form action={createPolicyAction} className="gh-form" encType="multipart/form-data">
            <input type="hidden" name="returnTo" value={`${BASE}/policies`} />
            <label className="gh-field">Title<input name="title" required maxLength={240} /></label>
            <label className="gh-field">Document number<input name="documentNumber" maxLength={60} placeholder="e.g. IPC-001" /></label>
            <label className="gh-field">Version<input name="version" required maxLength={40} placeholder="e.g. 1.0" /></label>
            <label className="gh-field">Department<input name="department" maxLength={160} /></label>
            <label className="gh-field">Owner
              <select name="ownerUserId" defaultValue=""><option value="">Unassigned</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
            <label className="gh-field">Effective from<input type="date" name="effectiveDate" /></label>
            <label className="gh-field">Next review due<input type="date" name="nextReviewDue" /></label>
            <label className="gh-field">Document<input type="file" name="file" /><small>Required before committee review</small></label>
            <label className="gh-field gh-wide">Standards this policy supports (codes, comma-separated)<input name="standardCodes" maxLength={2000} placeholder="Codes must exist in your register" /></label>
            <div><button className="ui-button ui-button-primary" type="submit">Save as draft</button></div>
          </form>
          <p className="gh-meta" style={{ margin: 0 }}>Approved policies are frozen. To change one, add a new version with a new number.</p>
        </Details>
      ) : null}

      {policies.length === 0 ? <Empty title="No policies yet">Add your first policy above. Only approved policies can be assigned for read-and-sign.</Empty> : (
        <div className="gh-board">
          {COLUMNS.map((column) => {
            const items = overview.items.filter((item) => item.policy.status === column.status);
            return (
              <section className="gh-col" key={column.status} aria-label={column.title}>
                <div className="gh-col-head"><span>{column.title} <span className="gh-meta">· {column.hint}</span></span><span className="gh-count">{items.length}</span></div>
                {items.length === 0 ? <p className="gh-meta" style={{ margin: 0, padding: ".2rem" }}>None</p> : items.map(({ policy, assigned, acknowledged, ackPct, overdueAssignments, reviewState }) => (
                  <Link className="gh-item gh-card-link" key={policy.id} href={`${BASE}/policies/${policy.id}`}>
                    <h4>{policy.title}</h4>
                    <span className="gh-meta">v{policy.version}{policy.documentNumber ? ` · ${policy.documentNumber}` : ""}{policy.ownerUserId ? ` · ${nameOf(peopleById, policy.ownerUserId)}` : ""}</span>
                    {column.status === "approved" ? (
                      <>
                        <div className="gh-btnrow">
                          {reviewState === "overdue" ? <Badge tone="bad">Review overdue</Badge> : reviewState === "due_soon" ? <Badge tone="warn">Review {formatDate(policy.nextReviewDue)}</Badge> : policy.nextReviewDue ? <Badge tone="ok">Review {formatDate(policy.nextReviewDue)}</Badge> : <Badge tone="muted">No review date</Badge>}
                        </div>
                        {ackPct === null ? <span className="gh-meta">Not assigned for read-and-sign</span> : (
                          <>
                            <Meter pct={ackPct} label={`${policy.title} signed`} />
                            <span className="gh-meta">{acknowledged} of {assigned} signed ({ackPct}%){overdueAssignments ? ` · ${overdueAssignments} overdue` : ""}</span>
                          </>
                        )}
                      </>
                    ) : !policy.storagePath && !policy.clinicalGuidelineId ? <Badge tone="warn">No document yet</Badge> : null}
                  </Link>
                ))}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
