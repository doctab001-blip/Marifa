import Link from "next/link";
import { ClipboardList, FilePenLine, Send, Trash2 } from "@/components/icons-3d";
import type { DiseaseDraft } from "@/lib/data/disease-drafts";
import { ManagedTopicTile } from "@/components/diseases/ManagedTopicTile";
import { deleteDraftVersion, transitionGuidelineVersion } from "@/app/(workspace)/dashboard/admin/guidelines/actions";

type TopicCardProps = {
  topic: DiseaseDraft;
  preparedDate: string;
};

/** Draft-tab tile: the shared compact tile plus edit / submit / delete icon controls for editors. */
export function TopicCard({ topic, preparedDate }: TopicCardProps) {
  const href = topic.canEdit
    ? `/dashboard/admin/guidelines/${encodeURIComponent(topic.id)}?version=${encodeURIComponent(topic.versionId)}`
    : `/dashboard/diseases/drafts/${encodeURIComponent(topic.versionId)}`;
  const pasteHref = `/dashboard/admin/guidelines/${encodeURIComponent(topic.id)}/paste?version=${encodeURIComponent(topic.versionId)}`;
  const source = topic.isSharedReference ? "Shared reference" : `${topic.sourceTitle}`;

  return (
    <ManagedTopicTile
      tone="draft"
      statusLabel={topic.versionStatus === "under_review" ? "Under review" : "Draft"}
      title={topic.title}
      specialty={topic.specialty}
      version={topic.version}
      source={source}
      dateLabel={`Prepared ${preparedDate}`}
      href={href}
      linkLabel={`Open ${topic.title}, version ${topic.version}`}
      actions={topic.canEdit ? (
        <>
          <Link className="topic-tile-action" href={href} aria-label={`Edit ${topic.title}`} title="Edit topic"><FilePenLine size={15} aria-hidden="true" /></Link>
          <Link className="topic-tile-action" href={pasteHref} aria-label={`Paste full content into ${topic.title}`} title="Paste full content"><ClipboardList size={15} aria-hidden="true" /></Link>
          {topic.canApprove ? (
            <form action={transitionGuidelineVersion}>
              <input type="hidden" name="id" value={topic.id} />
              <input type="hidden" name="versionId" value={topic.versionId} />
              <input type="hidden" name="target" value="published" />
              <button className="topic-tile-action" type="submit" aria-label={`Submit ${topic.title} to Published`} title="Submit to Published"><Send size={15} aria-hidden="true" /></button>
            </form>
          ) : null}
          <form action={deleteDraftVersion}>
            <input type="hidden" name="id" value={topic.id} />
            <input type="hidden" name="versionId" value={topic.versionId} />
            <button className="topic-tile-action is-delete" type="submit" aria-label={`Delete ${topic.title}`} title="Delete topic"><Trash2 size={15} aria-hidden="true" /></button>
          </form>
        </>
      ) : undefined}
    />
  );
}
