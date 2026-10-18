import Link from "next/link";
import type { ReactNode } from "react";
import { summarizeSpecialty } from "@/lib/medical-specialities";

export type TopicTileTone = "published" | "approved" | "draft";

type ManagedTopicTileProps = {
  tone: TopicTileTone;
  statusLabel: string;
  title: string;
  specialty: string;
  version: string;
  source: string;
  /** Omit when the viewer has nowhere to go; the title is then plain text. */
  href?: string;
  /** Accessible name for the whole-tile link. */
  linkLabel: string;
  /** Icon-only controls (links or forms). Shown on hover/focus, always on touch screens. */
  actions?: ReactNode;
};

/**
 * Compact catalogue tile shared by the Draft, Approved and Published tabs of Disease Management.
 * Four short lines (status · title · speciality · source). The whole tile is one link; actions are
 * small icon controls so a topic never shows a row of large buttons.
 */
export function ManagedTopicTile({ tone, statusLabel, title, specialty, version, source, href, linkLabel, actions }: ManagedTopicTileProps) {
  const { primary, extra } = summarizeSpecialty(specialty);
  return (
    <article className={`topic-tile is-${tone}`} title={`${title}\n${specialty}\nSource: ${source}`}>
      <div className="topic-tile-meta">
        <span className="topic-tile-status">{statusLabel}</span>
        <span className="topic-tile-version" title={`Version ${version}`}>{/^\d/.test(version) ? `v${version}` : version}</span>
      </div>
      <h3 className="topic-tile-title">
        {href ? <Link className="topic-tile-link" href={href} aria-label={linkLabel}>{title}</Link> : title}
      </h3>
      <p className="topic-tile-sub">
        <span className="topic-tile-spec">{primary}</span>
        {extra > 0 && <span className="topic-tile-more" aria-label={`${extra} more specialities`}>+{extra}</span>}
        <span className="topic-tile-source">{source}</span>
      </p>
      {actions ? <div className="topic-tile-actions">{actions}</div> : null}
    </article>
  );
}
