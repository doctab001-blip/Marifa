import Link from "next/link";
import { ArrowRight, FilePenLine, Send, Trash2 } from "@/components/icons-3d";
import type { DiseaseDraft } from "@/lib/data/disease-drafts";
import { deleteDraftVersion, transitionGuidelineVersion } from "@/app/(workspace)/dashboard/admin/guidelines/actions";

type TopicCardProps = {
  topic: DiseaseDraft;
  preparedDate: string;
};

/** A catalogue tile matching the Disease Directory's established visual language. */
export function TopicCard({ topic, preparedDate }: TopicCardProps) {
  const href = topic.canEdit
    ? `/dashboard/admin/guidelines/${encodeURIComponent(topic.id)}?version=${encodeURIComponent(topic.versionId)}`
    : `/dashboard/diseases/drafts/${encodeURIComponent(topic.versionId)}`;

  return (
    <article
      className="disease-card disease-draft-tile group"
      title={`Source: ${topic.sourceTitle}${topic.auditSummary ? ` — Evidence audit incomplete: ${topic.auditSummary}` : ""}`}
    >
      <div className="disease-card-top">
        <span className="disease-pillar-label">Draft topic</span>
        <span className={`disease-status-badge ${topic.versionStatus === "under_review" ? "is-review" : "is-draft"}`}>
          {topic.versionStatus === "under_review" ? "Under review" : "Clinical review pending"}
        </span>
      </div>

      <div className="disease-card-copy">
        <h3><Link href={href} aria-label={`Open ${topic.title}, version ${topic.version}`}>{topic.title}</Link></h3>
        <div className="disease-speciality-badges" aria-label="Medical speciality">
          <span className="disease-speciality-badge">{topic.specialty}</span>
        </div>
        <p className="disease-draft-tile-meta">Prepared {preparedDate} <span aria-hidden="true">·</span> Version {topic.version}</p>
      </div>

      <div className="disease-card-footer">
        <span className="disease-authority-badge">Draft</span>
        <span className="disease-source-type">{topic.isSharedReference ? "Shared reference draft" : topic.sourceTitle}</span>
        <Link className="disease-card-link-label" href={href} aria-label={`View ${topic.title}`}>
          View pathway <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {topic.canEdit ? (
        <div className="disease-draft-tile-actions" aria-label={`Actions for ${topic.title}`}>
          <Link className="disease-draft-tile-action" href={href} aria-label={`Edit ${topic.title}`} title="Edit topic">
            <FilePenLine size={15} aria-hidden="true" />
          </Link>
          {topic.canApprove ? (
            <form action={transitionGuidelineVersion}>
              <input type="hidden" name="id" value={topic.id} />
              <input type="hidden" name="versionId" value={topic.versionId} />
              <input type="hidden" name="target" value="published" />
              <button className="disease-draft-tile-action" type="submit" aria-label={`Submit ${topic.title} to Published`} title="Submit to Published">
                <Send size={15} aria-hidden="true" />
              </button>
            </form>
          ) : null}
          <form action={deleteDraftVersion}>
            <input type="hidden" name="id" value={topic.id} />
            <input type="hidden" name="versionId" value={topic.versionId} />
            <button className="disease-draft-tile-action is-delete" type="submit" aria-label={`Delete ${topic.title}`} title="Delete topic">
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
