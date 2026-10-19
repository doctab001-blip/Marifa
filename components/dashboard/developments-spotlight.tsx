"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, ExternalLink } from "@/components/icons-3d";
import { CATEGORY_LABELS, type DevelopmentCategory } from "@/lib/recent-developments/types";
import type { SpotlightItem } from "@/lib/data/recent-developments";

const ROTATE_MS = 10_000;
const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Riyadh" });

export function DevelopmentsSpotlight({ items }: { items: SpotlightItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const running = !paused && !hovering && items.length > 1;

  // Restarting on every index change also restarts the progress bar, so each item gets a full 10 seconds.
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % items.length), ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [running, index, items.length]);

  if (!items.length) {
    return (
      <div className="empty-state">
        <strong>No developments to show yet</strong>
        <p>The curated 2016–2026 archive is empty or not set up. Open Recent Developments to check.</p>
        <Link className="button-secondary" href="/dashboard/recent-developments?tab=archive">Open Recent Developments</Link>
      </div>
    );
  }

  const item = items[index];
  const step = (delta: number) => setIndex((current) => (current + delta + items.length) % items.length);
  return (
    <div className="dev-spotlight" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} onFocus={() => setHovering(true)} onBlur={() => setHovering(false)}>
      <article key={item.id} className={`dev-spotlight-card dev-cat-${item.category}`} aria-live="off">
        <div className="dev-item-meta">
          <span className={`pill pill-sm dev-cat dev-cat-${item.category}`}>{CATEGORY_LABELS[item.category as DevelopmentCategory] ?? item.category}</span>
          {item.saudi_relevant && <span className="pill pill-sm pill-emerald">Saudi-relevant</span>}
          {item.specialities.slice(0, 1).map((name) => <span key={name} className="pill pill-sm">{name}</span>)}
        </div>
        <h3 className="dev-spotlight-title">{item.title}</h3>
        {item.summary && <p className="dev-spotlight-summary">{item.summary}</p>}
        {item.why_it_matters && <p className="dev-why"><strong>Why it matters:</strong> {item.why_it_matters}</p>}
        <div className="dev-spotlight-foot">
          <span>{item.source_label ? `${item.source_label} · ` : ""}{dateFormat.format(new Date(`${item.published_at}T12:00:00Z`))}</span>
          <a className="dev-source-link" href={item.source_url} target="_blank" rel="noopener noreferrer">Read at source <ExternalLink size={13} aria-hidden="true" /></a>
        </div>
      </article>
      <div className="dev-spotlight-bar" aria-hidden="true">
        {running && <span key={`${index}-run`} className="dev-spotlight-progress" style={{ animationDuration: `${ROTATE_MS}ms` }} />}
      </div>
      <div className="dev-spotlight-controls">
        <button type="button" className="dev-spotlight-btn" onClick={() => step(-1)} aria-label="Previous development"><ChevronRight size={14} aria-hidden="true" style={{ transform: "rotate(180deg)" }} /></button>
        <button type="button" className="dev-spotlight-btn dev-spotlight-pause" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>{paused ? "Resume" : "Pause"}</button>
        <button type="button" className="dev-spotlight-btn" onClick={() => step(1)} aria-label="Next development"><ChevronRight size={14} aria-hidden="true" /></button>
        <span className="dev-spotlight-count">{index + 1} / {items.length} · changes every 10 s</span>
      </div>
      <small className="dev-summary-note">Automated digest of the curated archive, not clinical guidance. Check the source before changing practice.</small>
    </div>
  );
}
