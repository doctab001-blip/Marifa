"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "@/components/icons-3d";
import { displayTopicTitle } from "@/lib/topic-title";
import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";
import { useTopicQueue, type QueueKind } from "@/components/topic-queue";

const label = (title: string) => displayTopicTitle(withoutInlineSourceLocators(title));

/**
 * Previous / next arrows for the open topic, following the side-panel order of the list the topic belongs to.
 * Rendered above and below the topic so the reader never has to scroll to move on.
 */
export function TopicQueuePager({ queue, currentId, position, refreshKey }: { queue: QueueKind; currentId: string; position: "top" | "bottom"; refreshKey?: string }) {
  const state = useTopicQueue(queue, refreshKey);
  if (state.status === "error") return null;
  // Reserve the row's height while loading so the topic does not jump when the arrows appear.
  if (state.status === "loading") return <div className={`topic-pager topic-pager-bar is-${position} is-loading`} aria-hidden="true" />;

  const { topics } = state;
  const index = topics.findIndex((topic) => topic.id === currentId);
  if (index < 0 || topics.length < 2) return null;
  const previous = index > 0 ? topics[index - 1] : undefined;
  const next = index < topics.length - 1 ? topics[index + 1] : undefined;

  return (
    <nav className={`topic-pager topic-pager-bar is-${position}`} aria-label={`Topic navigation (${position})`}>
      {previous
        ? <Link href={previous.href} prefetch={false} className="topic-pager-link" title={`Previous: ${label(previous.title)}`}><ChevronLeft size={18} aria-hidden="true" /><span><small>Previous</small><em>{label(previous.title)}</em></span></Link>
        : <span className="topic-pager-link is-disabled" aria-hidden="true"><ChevronLeft size={18} /><span><small>Previous</small><em>Start of list</em></span></span>}
      <span className="topic-pager-position" role="status">{index + 1} of {topics.length}</span>
      {next
        ? <Link href={next.href} prefetch={false} className="topic-pager-link is-next" title={`Next: ${label(next.title)}`}><span><small>Next</small><em>{label(next.title)}</em></span><ChevronRight size={18} aria-hidden="true" /></Link>
        : <span className="topic-pager-link is-next is-disabled" aria-hidden="true"><span><small>Next</small><em>End of list</em></span><ChevronRight size={18} /></span>}
    </nav>
  );
}
