"use client";

import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "@/components/icons-3d";
import { displayTopicTitle } from "@/lib/topic-title";
import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";
import { useTopicQueue, type QueueKind } from "@/components/topic-queue";

const label = (title: string) => displayTopicTitle(withoutInlineSourceLocators(title));

/**
 * Previous / next arrows for the open topic, following the side-panel order of the list the topic belongs to.
 * Top: one slim toolbar row (optional back link on the left, arrows on the right) so it costs a single line.
 * Bottom: larger cards that name the neighbouring topics.
 */
export function TopicQueuePager({ queue, currentId, position, refreshKey, back }: {
  queue: QueueKind;
  currentId: string;
  position: "top" | "bottom";
  refreshKey?: string;
  /** Top only: a back link shown on the same row as the arrows. */
  back?: { href: string; label: string };
}) {
  const state = useTopicQueue(queue, refreshKey);
  const top = position === "top";
  const backLink = top && back ? <Link href={back.href} className="topic-toolbar-back"><ArrowLeft size={15} aria-hidden="true" />{back.label}</Link> : null;

  const topics = state.status === "ready" ? state.topics : [];
  const index = topics.findIndex((topic) => topic.id === currentId);
  const usable = state.status === "ready" && index >= 0 && topics.length >= 2;

  if (!usable) {
    // Keep the back link (and the row's height while loading) so the topic does not jump.
    if (backLink) return <div className="topic-toolbar">{backLink}</div>;
    return state.status === "loading" && top ? <div className="topic-toolbar" aria-hidden="true" /> : null;
  }

  const previous = index > 0 ? topics[index - 1] : undefined;
  const next = index < topics.length - 1 ? topics[index + 1] : undefined;
  const arrows = (
    <nav className={`topic-pager topic-pager-bar is-${position}`} aria-label={`Topic navigation (${position})`}>
      {previous
        ? <Link href={previous.href} prefetch={false} className="topic-pager-link" title={`Previous: ${label(previous.title)}`}><ChevronLeft size={18} aria-hidden="true" /><span><small>Previous</small>{!top && <em>{label(previous.title)}</em>}</span></Link>
        : <span className="topic-pager-link is-disabled" aria-hidden="true"><ChevronLeft size={18} /><span><small>Previous</small>{!top && <em>Start of list</em>}</span></span>}
      <span className="topic-pager-position" role="status">{index + 1} of {topics.length}</span>
      {next
        ? <Link href={next.href} prefetch={false} className="topic-pager-link is-next" title={`Next: ${label(next.title)}`}><span><small>Next</small>{!top && <em>{label(next.title)}</em>}</span><ChevronRight size={18} aria-hidden="true" /></Link>
        : <span className="topic-pager-link is-next is-disabled" aria-hidden="true"><span><small>Next</small>{!top && <em>End of list</em>}</span><ChevronRight size={18} /></span>}
    </nav>
  );
  return top ? <div className="topic-toolbar">{backLink}{arrows}</div> : arrows;
}
