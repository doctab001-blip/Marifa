import Link from "next/link";
import { ArrowRight, Activity, BookOpenCheck, ClipboardCheck, UsersRound } from "lucide-react";
import { getAdminOverview } from "@/lib/admin/data";

const icons = [UsersRound, BookOpenCheck, ClipboardCheck, Activity];

function formatWhen(value: string) {
  return new Intl.DateTimeFormat("en-SA", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh" }).format(new Date(value));
}

export default async function AdminOverviewPage() {
  const { metrics, activities, usingPreview } = await getAdminOverview();

  return (
    <div className="admin-content">
      <section className="admin-metrics" aria-label="Organization overview metrics">
        {metrics.map((metric, index) => {
          const Icon = icons[index];
          return (
            <article className="card admin-metric-card" key={metric.label}>
              <div className="admin-metric-top"><span>{metric.label}</span><span className={`admin-metric-icon tone-${metric.tone}`}><Icon size={17} aria-hidden="true" /></span></div>
              <strong className="admin-metric-value">{metric.value}</strong>
              <span className="admin-metric-detail">{metric.detail}</span>
            </article>
          );
        })}
      </section>
      {usingPreview && <p className="admin-preview-note">Some indicators are illustrative demo values while those database sources are being connected.</p>}

      <section className="card admin-activity-card" aria-labelledby="admin-activity-title">
        <div className="section-head"><div><span className="eyebrow">Governance log</span><h2 id="admin-activity-title">Recent activity</h2></div><Link className="section-link" href="/dashboard/admin/governance">Open governance <ArrowRight size={14} /></Link></div>
        {activities.length ? (
          <ol className="admin-timeline">
            {activities.map((item) => (
              <li key={item.id}>
                <span className="admin-timeline-marker" aria-hidden="true" />
                <div><strong>{item.action}</strong><p>{item.entity}</p><time dateTime={item.occurredAt}>{item.illustrative ? "Demo preview" : formatWhen(item.occurredAt)}</time></div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="admin-empty"><Activity size={20} aria-hidden="true" /><p>No governance actions recorded for this organization yet.</p></div>
        )}
      </section>
    </div>
  );
}
