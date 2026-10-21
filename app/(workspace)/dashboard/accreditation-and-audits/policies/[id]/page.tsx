import Link from "next/link";
import { notFound } from "next/navigation";
import {
  assignPolicyAction, attachPolicyDocumentAction, setPolicyStatusAction,
} from "@/app/(workspace)/dashboard/accreditation-and-audits/actions";
import { FileText } from "lucide-react";
import { Badge, Empty, Meter, Notice, PageHeader, Stepper, nameOf, pageParam } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate, formatDate, formatStamp } from "@/lib/governance/clock";
import { GOVERNANCE_READ_ROLES, ROLE_LABEL, canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import { loadAckSummary, loadPeople, loadPolicyById, loadPolicyRoster, loadPolicyStandardIds, loadStandards, openContext, signedUrl } from "@/lib/governance/repository";
import { isoDate } from "@/lib/governance/scoring";

const BASE = "/dashboard/accreditation-and-audits";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUS_LABEL = { draft: "Draft", under_committee_review: "Committee review", approved: "Approved", retired: "Retired" } as const;
const ASSIGN_ROLES = ["consultant", "specialist", "mbbs_gp", ...GOVERNANCE_READ_ROLES.filter((r) => r !== "auditor")];

export default async function PolicyPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const done = pageParam(sp.done), error = pageParam(sp.error);
  if (!UUID.test(id)) notFound();
  const actor = await getGovernanceActor();
  if (!canReadGovernance(actor)) return <p className="gh-notice gh-notice-bad" role="alert">Policy management is visible to governance staff and auditors. Your own assigned policies are on the <Link href={`${BASE}/policies`}>Policies page</Link>.</p>;
  const canWrite = canWriteGovernance(actor);
  const today = currentDate();
  const todayIso = isoDate(today);
  const ctx = await openContext(actor);

  const policy = await loadPolicyById(ctx, id).catch(() => null);
  if (!policy) notFound();
  const [roster, people, ack, linkedIds, standards] = await Promise.all([
    loadPolicyRoster(ctx, id), loadPeople(ctx).catch(() => []), loadAckSummary(ctx), loadPolicyStandardIds(ctx, id), loadStandards(ctx),
  ]);
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  const summary = ack.find((row) => row.policyId === id);
  const url = policy.storagePath ? await signedUrl(ctx, policy.storagePath) : null;
  const linked = standards.filter((s) => linkedIds.includes(s.id));
  const signed = roster.filter((r) => r.acknowledgedAt);
  const unsigned = roster.filter((r) => !r.acknowledgedAt).sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));
  const here = `${BASE}/policies/${id}`;
  const pct = roster.length === 0 ? null : Math.round((signed.length / roster.length) * 1000) / 10;
  const roleOptions = [...new Set(people.flatMap((p) => p.roleCodes))].filter((code) => ASSIGN_ROLES.includes(code as never));

  const next: { status: string; label: string; primary?: boolean; danger?: boolean }[] =
    policy.status === "draft" ? [{ status: "under_committee_review", label: "Submit for committee review", primary: true }]
    : policy.status === "under_committee_review" ? [{ status: "approved", label: "Approve", primary: true }, { status: "draft", label: "Return to draft" }]
    : policy.status === "approved" ? [{ status: "retired", label: "Retire policy", danger: true }] : [];

  return (
    <>
      <PageHeader icon={<FileText size={20} />} eyebrow={<><Link href={`${BASE}/policies`}>Policies</Link> / {policy.documentNumber || "No document number"}</>}
        title={<>{policy.title} <span className="gh-meta">v{policy.version}</span></>} subtitle={`${policy.department || "No department"} · Owner: ${nameOf(peopleById, policy.ownerUserId)}`}
        actions={<>
          <Badge tone={policy.status === "approved" ? "ok" : policy.status === "retired" ? "muted" : "info"}>{STATUS_LABEL[policy.status]}</Badge>
          {policy.status === "approved" && policy.nextReviewDue ? <Badge tone={policy.nextReviewDue < todayIso ? "bad" : "ok"}>Review {formatDate(policy.nextReviewDue)}</Badge> : null}
        </>} />
      <Stepper label="Policy approval workflow" current={policy.status} steps={[
        { key: "draft", label: "Draft", hint: "Being written" }, { key: "under_committee_review", label: "Committee review", hint: "Awaiting decision" },
        { key: "approved", label: "Approved", hint: "In force; frozen" }, { key: "retired", label: "Retired", hint: "No longer in force" },
      ]} />
      <Notice done={done} error={error} />

      <div className="gh-grid-2">
        <section className="gh-card">
          <h2>Document &amp; approval</h2>
          <table className="gh-table"><tbody>
            <tr><th scope="row">Document</th><td>{url ? <a className="ui-button" href={url} target="_blank" rel="noopener noreferrer">Open {policy.fileName ?? "document"}</a> : policy.clinicalGuidelineId ? "Linked Marifa guideline" : <Badge tone="warn">No document attached</Badge>}</td></tr>
            <tr><th scope="row">Effective from</th><td>{formatDate(policy.effectiveDate)}</td></tr>
            <tr><th scope="row">Next review due</th><td>{formatDate(policy.nextReviewDue)}</td></tr>
            <tr><th scope="row">Approved</th><td>{policy.approvedAt ? formatStamp(policy.approvedAt) : "—"}</td></tr>
          </tbody></table>
          {canWrite && (policy.status === "draft" || policy.status === "under_committee_review") ? (
            <form action={attachPolicyDocumentAction} className="gh-form" encType="multipart/form-data" style={{ marginTop: ".8rem" }}>
              <input type="hidden" name="policyId" value={id} /><input type="hidden" name="returnTo" value={here} />
              <label className="gh-field">{policy.storagePath ? "Replace document" : "Attach document"}<input type="file" name="file" required /></label>
              <div><button className="ui-button" type="submit">Upload</button></div>
            </form>
          ) : null}
          {canWrite && next.length > 0 ? (
            <div className="gh-btnrow" style={{ marginTop: ".8rem" }}>
              {next.map((step) => (
                <form action={setPolicyStatusAction} key={step.status}>
                  <input type="hidden" name="policyId" value={id} /><input type="hidden" name="status" value={step.status} /><input type="hidden" name="returnTo" value={here} />
                  <button className={`ui-button${step.primary ? " ui-button-primary" : ""}${step.danger ? " ui-button-danger" : ""}`} type="submit">{step.label}</button>
                </form>
              ))}
            </div>
          ) : null}
          {policy.status === "approved" ? <p className="gh-meta">This policy is frozen. To change it, add a new version.</p> : null}
        </section>

        <section className="gh-card">
          <h2>Supports</h2>
          {linked.length === 0 ? <p className="gh-meta">No standards linked.</p> : (
            <ul className="gh-actions">{linked.map((s) => <li key={s.id}><Link className="gh-action" href={`${BASE}/standards/${s.id}`} style={{ gridTemplateColumns: "1fr auto" }}><span><strong>{s.code}</strong><span className="gh-hint gh-clamp">{s.description}</span></span>{s.isEsr ? <Badge tone="bad">ESR</Badge> : null}</Link></li>)}</ul>
          )}
        </section>
      </div>

      <section className="gh-card" aria-labelledby="roster-heading">
        <div className="gh-head"><h2 id="roster-heading">Read-and-sign</h2>
          {pct !== null ? <Badge tone={summary && summary.overdue > 0 ? "warn" : "ok"}>{signed.length} of {roster.length} signed · {pct}%</Badge> : null}</div>
        {policy.status !== "approved" ? <p className="gh-meta">Only an approved policy can be assigned to staff.</p> : null}
        {policy.status === "approved" && canWrite ? (
          <form action={assignPolicyAction} className="gh-form" style={{ marginBottom: ".8rem" }}>
            <input type="hidden" name="policyId" value={id} /><input type="hidden" name="returnTo" value={here} />
            <label className="gh-field">Sign by<input type="date" name="dueDate" /></label>
            <fieldset className="gh-field gh-wide" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend>Assign to (leave all unticked for every active staff member)</legend>
              <div className="gh-btnrow">{roleOptions.map((code) => <label className="gh-check" key={code}><input type="checkbox" name="roleCodes" value={code} /> {ROLE_LABEL[code] ?? code}</label>)}</div>
            </fieldset>
            <div><button className="ui-button ui-button-primary" type="submit">Assign</button></div>
          </form>
        ) : null}
        {pct !== null ? <Meter pct={pct} label="Signed" /> : null}
        {roster.length === 0 ? <div style={{ marginTop: ".7rem" }}><Empty title="Nobody assigned">Assign this policy to the staff who must read it.</Empty></div> : (
          <div className="gh-table-wrap" style={{ marginTop: ".7rem" }}>
            <table className="gh-table">
              <thead><tr><th scope="col">Staff member</th><th scope="col">Status</th><th scope="col">Due</th><th scope="col">Signed</th></tr></thead>
              <tbody>
                {[...unsigned, ...signed].map((row) => (
                  <tr key={row.userId}>
                    <td>{nameOf(peopleById, row.userId)}</td>
                    <td>{row.acknowledgedAt ? <Badge tone="ok">Signed</Badge> : row.dueDate && row.dueDate < todayIso ? <Badge tone="bad">Overdue</Badge> : <Badge tone="warn">Pending</Badge>}</td>
                    <td>{formatDate(row.dueDate)}</td>
                    <td>{row.acknowledgedAt ? formatStamp(row.acknowledgedAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
