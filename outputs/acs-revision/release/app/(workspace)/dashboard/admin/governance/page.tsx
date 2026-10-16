import { getGovernanceQueue } from "@/lib/admin/data";
import { GovernanceQueue } from "@/components/admin/governance-queue";
import Link from "next/link";

export default async function AdminGovernancePage() {
  const { items, context } = await getGovernanceQueue();
  return (
    <section className="admin-content">
      <header className="admin-section-heading"><div><p className="eyebrow">Clinical content moderation</p><h2>Governance &amp; Approvals</h2><p>Review organization-owned guidelines that are drafts or awaiting review.</p></div><span className="admin-queue-count">{items.length} in queue</span></header>
      <GovernanceQueue items={items} />
      {context.roleCode === "platform_admin" && <p><Link className="disease-back-link" href="/dashboard/admin/investigation-review">Review proposed investigation revisions</Link></p>}
    </section>
  );
}
