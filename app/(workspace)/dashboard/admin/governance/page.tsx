import { getGovernanceQueue } from "@/lib/admin/data";
import { GovernanceQueue } from "@/components/admin/governance-queue";
import Link from "next/link";

export default async function AdminGovernancePage({ searchParams }: { searchParams: Promise<{ approved?: string; error?: string }> }) {
  const query = await searchParams;
  const { items, context } = await getGovernanceQueue();
  return (
    <section className="admin-content">
      <header className="admin-section-heading"><div><p className="eyebrow">Clinical content moderation</p><h2>Governance &amp; Approvals</h2><p>Review organization-owned guidelines that are drafts or awaiting review.</p></div><span className="admin-queue-count">{items.length} in queue</span></header>
      {query.approved === "1" && <p className="admin-save-message" role="status">Version approved. The reviewer and approval time have been recorded.</p>}
      {query.error === "approval_failed" && <p className="admin-save-error" role="alert">This version could not be approved. It may have changed, or your account may not have approval access. Refresh the queue and try again.</p>}
      {query.error === "not_authorized" && <p className="admin-save-error" role="alert">Only an organization administrator can approve a version.</p>}
      <p className="admin-form-note">Approval records you as the reviewer, dates the review, and changes the current version to Approved. Confirm the source and clinical content before selecting Approve version.</p>
      <GovernanceQueue items={items} />
      {context.roleCode === "platform_admin" && <p><Link className="disease-back-link" href="/dashboard/admin/investigation-review">Review proposed investigation revisions</Link></p>}
    </section>
  );
}
