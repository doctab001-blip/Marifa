import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import { saveGuidelineReviewAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions-v21";
import { LinkPanel } from "@/components/accreditation/link-panel";
import { Badge, Details, Empty, NeedsV21, Notice, PageHeader, Stat, Stepper, SubNav, nameOf, pageParam, type Tone } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate, formatDate, formatStamp } from "@/lib/governance/clock";
import { GUIDELINE_STATUS_LABEL, governanceView, linksOf, summariseGuidelines, type GuidelineGovStatus, type ReviewTiming } from "@/lib/governance/guideline-governance";
import { canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import { loadPeople, openContext } from "@/lib/governance/repository";
import { loadGovernedGuidelines, loadGuidelineReviews, loadGuidelineVersions, loadLinkCatalogue, loadLinks, v21 } from "@/lib/governance/repository-v21";

const BASE = "/dashboard/accreditation-and-audits";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUS_TONE: Record<GuidelineGovStatus, Tone> = { not_reviewed: "muted", under_review: "warn", approved: "ok", changes_requested: "bad", retired: "muted" };
const TIMING: Record<ReviewTiming, { label: string; tone: Tone }> = { overdue: { label: "Review overdue", tone: "bad" }, due_soon: { label: "Review due soon", tone: "warn" }, ok: { label: "In date", tone: "ok" }, none: { label: "No review date", tone: "muted" } };
const originalHref = (id: string, isLocal: boolean) => (isLocal ? `/dashboard/protocols/${id}` : `/dashboard/diseases/${id}`);

/**
 * Governance view of Marifa's clinical guidelines and local protocols. Shows ownership, versions and review dates read
 * from the clinical records, and stores only governance status, links and decisions. The clinical content is not copied.
 */
export default async function GuidelineGovernancePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const view = pageParam(sp.view);
  const show = pageParam(sp.show);
  const actor = await getGovernanceActor();
  const header = <PageHeader icon={<BookOpen size={20} />} title="Clinical guidelines & protocols" subtitle="Governance status, owners and review dates for Marifa's guidelines and local protocols. Clinical content stays in the clinical module and is never copied here." />;
  if (!canReadGovernance(actor)) return <>{header}<p className="gh-notice gh-notice-bad" role="alert">Guideline governance is visible to governance staff and auditors.</p></>;
  const canWrite = canWriteGovernance(actor);
  const ctx = await openContext(actor);
  const today = currentDate();
  const subnav = <SubNav label="Policies and documents" current="guidelines" items={[{ key: "policies", label: "Hospital policies", href: `${BASE}/policies` }, { key: "guidelines", label: "Clinical guidelines & protocols", href: `${BASE}/policies/guidelines` }]} />;
  const loaded = await v21(Promise.all([loadGovernedGuidelines(ctx), loadGuidelineReviews(ctx), loadLinks(ctx)]));
  if (!loaded) return <>{header}{subnav}<NeedsV21 what="Guideline governance" /></>;
  const [guidelines, reviews, links] = loaded;
  const people = await loadPeople(ctx).catch(() => []);
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  const views = guidelines.map((g) => governanceView(g, reviews.find((r) => r.guidelineId === g.id) ?? null, today));
  const summary = summariseGuidelines(views);
  const filtered = views.filter((v) => !show || (show === "overdue" ? v.timing === "overdue" : show === "not_reviewed" ? v.status === "not_reviewed" : show === "outdated" ? v.approvalOutdated : show === "local" ? v.guideline.isLocal : true));
  const selected = UUID.test(view) ? views.find((v) => v.guideline.id === view) ?? null : null;
  const [versions, catalogue] = selected ? await Promise.all([v21(loadGuidelineVersions(ctx, selected.guideline.id)), v21(loadLinkCatalogue(ctx, ["standard", "element", "indicator", "policy", "audit", "qip", "decision", "capa"]))]) : [null, null];
  const here = selected ? `${BASE}/policies/guidelines?view=${selected.guideline.id}` : `${BASE}/policies/guidelines`;
  const count = (id: string, type: "standard" | "element" | "indicator" | "decision") => linksOf(links, "guideline", id).filter((l) => l.type === type).length;

  return (
    <>
      {header}
      {subnav}
      <Notice done={pageParam(sp.done)} error={pageParam(sp.error)} />
      <div className="gh-grid">
        <Stat accent="gold" icon={<BookOpen size={15} />} label="Guidelines & protocols" value={summary.total} note={`${views.filter((v) => v.guideline.isLocal).length} local protocols`} href={`${BASE}/policies/guidelines`} />
        <Stat accent="emerald" label="Governance approved" value={summary.approved} unit={`of ${summary.total}`} progress={summary.total ? (summary.approved / summary.total) * 100 : null} note={summary.outdatedApproval ? `${summary.outdatedApproval} approved on an older version` : "Approvals match the current version"} tone={summary.outdatedApproval ? "warn" : undefined} href={`${BASE}/policies/guidelines?show=outdated`} />
        <Stat accent="coral" label="Reviews overdue" value={summary.overdue} tone={summary.overdue > 0 ? "bad" : "ok"} note={summary.dueSoon ? `${summary.dueSoon} due within 60 days` : "None due soon"} href={`${BASE}/policies/guidelines?show=overdue`} />
        <Stat accent="navy" label="Not yet reviewed" value={summary.notReviewed} href={`${BASE}/policies/guidelines?show=not_reviewed`} />
      </div>

      <section className="gh-card" style={{ padding: 0 }} aria-label="Guidelines and protocols">
        <div style={{ padding: ".8rem 1rem .4rem" }} className="gh-hstack">
          {[["", "All"], ["local", "Local protocols"], ["overdue", "Overdue"], ["not_reviewed", "Not reviewed"], ["outdated", "Approved on older version"]].map(([k, label]) => (
            <Link key={k} href={k ? `${BASE}/policies/guidelines?show=${k}` : `${BASE}/policies/guidelines`} className="gh-chip" aria-current={show === k ? "true" : undefined} style={show === k ? { background: "var(--gh-accent-soft)", borderColor: "var(--gh-accent)" } : undefined}>{label}</Link>
          ))}
        </div>
        {filtered.length === 0 ? <div style={{ padding: "0 1rem 1rem" }}><Empty title={guidelines.length === 0 ? "No guidelines in your organisation yet" : "Nothing matches"}>{guidelines.length === 0 ? "Local protocols created in Marifa appear here automatically." : "Try another filter."}</Empty></div> : (
          <div className="gh-table-wrap"><table className="gh-table">
            <thead><tr><th scope="col">Guideline / protocol</th><th scope="col">Version</th><th scope="col">Owner</th><th scope="col">Last review</th><th scope="col">Next review due</th><th scope="col">Governance</th><th scope="col" className="gh-num">Linked</th></tr></thead>
            <tbody>{filtered.map((v) => (
              <tr key={v.guideline.id}>
                <td><Link href={`${BASE}/policies/guidelines?view=${v.guideline.id}${show ? `&show=${show}` : ""}#guideline`}><strong>{v.guideline.title}</strong></Link><div className="gh-meta">{v.guideline.isLocal ? "Local protocol" : v.guideline.sourceType.replace(/[-_]/g, " ")}</div></td>
                <td>{v.guideline.currentVersion ? `v${v.guideline.currentVersion}` : "—"}<div className="gh-meta">{v.guideline.currentVersionStatus ?? ""}</div></td>
                <td>{nameOf(peopleById, v.ownerUserId)}</td>
                <td>{formatDate(v.guideline.lastReviewed)}</td>
                <td>{formatDate(v.nextReviewDue)}<div><Badge tone={TIMING[v.timing].tone}>{TIMING[v.timing].label}</Badge></div></td>
                <td><Badge tone={STATUS_TONE[v.status]}>{GUIDELINE_STATUS_LABEL[v.status]}</Badge>{v.approvalOutdated ? <div style={{ marginTop: ".2rem" }}><Badge tone="warn">Approved an older version</Badge></div> : null}</td>
                <td className="gh-num gh-meta">{count(v.guideline.id, "standard") + count(v.guideline.id, "element")} req · {count(v.guideline.id, "indicator")} ind</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </section>

      {selected ? (
        <section className="gh-card" id="guideline" aria-labelledby="guideline-heading" style={{ display: "grid", gap: ".9rem" }}>
          <div className="gh-head">
            <div><div className="gh-eyebrow">{selected.guideline.isLocal ? "Local protocol" : "Clinical guideline"}</div><h2 id="guideline-heading" style={{ margin: 0 }}>{selected.guideline.title}</h2></div>
            <Link className="ui-button" href={originalHref(selected.guideline.id, selected.guideline.isLocal)}><ExternalLink size={15} aria-hidden="true" /> View the original{selected.guideline.currentVersion ? ` (v${selected.guideline.currentVersion})` : ""}</Link>
          </div>
          <Stepper label="Governance approval" current={selected.status === "changes_requested" ? "under_review" : selected.status} steps={[
            { key: "not_reviewed", label: "Not reviewed" }, { key: "under_review", label: "Under review" }, { key: "approved", label: "Approved" },
          ]} branch={selected.status === "changes_requested" ? { label: "Changes requested", tone: "bad" } : selected.status === "retired" ? { label: "Retired", tone: "muted" } : selected.approvalOutdated ? { label: "Newer clinical version since approval", tone: "warn" } : null} />
          <div className="gh-split">
            <div style={{ display: "grid", gap: ".7rem", alignContent: "start" }}>
              <dl className="gh-kv">
                <dt>Current version</dt><dd>{selected.guideline.currentVersion ? `v${selected.guideline.currentVersion} (${selected.guideline.currentVersionStatus})` : "No current version"}</dd>
                <dt>Governance approved</dt><dd>{selected.review?.governedVersionId ? `${versions?.find((v) => v.id === selected.review?.governedVersionId)?.version ? `v${versions?.find((v) => v.id === selected.review?.governedVersionId)?.version}` : "A specific version"}${selected.review.approvedAt ? ` on ${formatDate(selected.review.approvedAt)} by ${nameOf(peopleById, selected.review.approvedBy)}` : ""}` : "—"}</dd>
                <dt>Owner</dt><dd>{nameOf(peopleById, selected.ownerUserId)}{selected.review?.ownerUserId ? " (governance owner)" : ""}</dd>
                <dt>Last review</dt><dd>{formatDate(selected.guideline.lastReviewed)}</dd>
                <dt>Next review due</dt><dd>{formatDate(selected.nextReviewDue)} <Badge tone={TIMING[selected.timing].tone}>{TIMING[selected.timing].label}</Badge>{selected.review?.nextReviewDue ? <span className="gh-meta"> (set by governance)</span> : null}</dd>
                {selected.review?.decisionNote ? <><dt>Decision note</dt><dd>{selected.review.decisionNote}</dd></> : null}
                {selected.review ? <><dt>Updated</dt><dd>{formatStamp(selected.review.updatedAt)}</dd></> : null}
              </dl>
              {versions && versions.length > 0 ? (
                <Details title={`Version history (${versions.length})`}>
                  <ul className="gh-tl">{versions.map((v) => <li key={v.id}><span><strong>v{v.version}</strong> · {v.status}{v.isCurrent ? " · current" : ""}{v.id === selected.review?.governedVersionId ? " · governance-approved" : ""}<div className="gh-meta">Review date {formatDate(v.reviewDate)}{v.publishedAt ? ` · published ${formatDate(v.publishedAt)}` : ""}</div></span></li>)}</ul>
                </Details>
              ) : null}
              {canWrite ? (
                <Details title="Record governance decision" open={selected.status === "not_reviewed" || selected.approvalOutdated}>
                  <form action={saveGuidelineReviewAction} className="gh-form">
                    <input type="hidden" name="guidelineId" value={selected.guideline.id} /><input type="hidden" name="returnTo" value={here} />
                    <label className="gh-field">Governance status<select name="status" defaultValue={selected.status}>{Object.entries(GUIDELINE_STATUS_LABEL).map(([k, lab]) => <option key={k} value={k}>{lab}</option>)}</select></label>
                    <label className="gh-field">Version reviewed<select name="governedVersionId" defaultValue={selected.review?.governedVersionId ?? selected.guideline.currentVersionId ?? ""}><option value="">—</option>{(versions ?? []).map((v) => <option key={v.id} value={v.id}>v{v.version} ({v.status}{v.isCurrent ? ", current" : ""})</option>)}</select><small>Approval applies to this version only.</small></label>
                    <label className="gh-field">Governance owner<select name="ownerUserId" defaultValue={selected.review?.ownerUserId ?? ""}><option value="">Clinical owner</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                    <label className="gh-field">Next review due<input type="date" name="nextReviewDue" defaultValue={selected.review?.nextReviewDue ?? ""} /><small>Blank = the version&apos;s own review date</small></label>
                    <label className="gh-field gh-wide">Decision note<textarea name="decisionNote" maxLength={2000} defaultValue={selected.review?.decisionNote ?? ""} placeholder="Required when requesting changes. Record the committee decision reference if there is one." /></label>
                    <div><button className="ui-button ui-button-primary" type="submit">Save decision</button></div>
                  </form>
                  <p className="gh-meta" style={{ margin: 0 }}>This records governance status only. Editing the protocol itself, and clinical approval of its content, stay in the clinical module.</p>
                </Details>
              ) : null}
            </div>
            {catalogue ? (
              <LinkPanel title="Accreditation requirements, indicators and decisions" sourceType="guideline" sourceId={selected.guideline.id} links={links} catalogue={catalogue}
                allow={["standard", "element", "indicator", "policy", "audit", "qip", "decision", "capa"]} canWrite={canWrite} returnTo={here} pinVersionId={selected.guideline.currentVersionId}
                hint="Links point at this guideline's id and record the version current at the time. Committee decisions linked here appear in the meeting record too." />
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}
