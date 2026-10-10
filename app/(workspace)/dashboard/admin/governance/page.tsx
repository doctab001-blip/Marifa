import { getGovernanceQueue } from "@/lib/admin/data";
import { GovernanceQueue } from "@/components/admin/governance-queue";

export default async function AdminGovernancePage() {
  const { items } = await getGovernanceQueue();
  return (
    <section className="admin-content">
      <header className="admin-section-heading"><div><p className="eyebrow">Clinical content moderation</p><h2>Governance &amp; Approvals</h2><p>Review organization-owned guidelines that are drafts or awaiting review.</p></div><span className="admin-queue-count">{items.length} in queue</span></header>
      <GovernanceQueue items={items} />
    </section>
  );
}
