"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { groupBySpeciality, specialityStyle } from "@/lib/medical-specialities";
import { Activity, CheckCircle2, ChevronRight, Clock3, Hourglass, Library, Search, X } from "@/components/icons-3d";
import {
  SORT_KEYS,
  SORT_LABELS,
  emptyFilters,
  facet,
  filterTopics,
  relativeAge,
  sortTopics,
  type ExplorerFilters,
  type ExplorerTopic,
  type SortKey,
} from "@/lib/dashboard/topic-explorer";

const PAGE_SIZE = 12;
const numberFormat = new Intl.NumberFormat("en-GB");

export type TopicExplorerProps = {
  topics: ExplorerTopic[];
  /** False when view tracking is not set up; the view-based sorts are then switched off rather than faked. */
  viewsAvailable: boolean;
  initialSort: SortKey;
  initialFilters: ExplorerFilters;
  /** Group the list into one section per speciality (default). Switched off with ?group=none. */
  initialGrouped?: boolean;
};

/** Writes the current view into the address bar so a filtered list can be bookmarked or shared. */
function syncUrl(sort: SortKey, filters: ExplorerFilters, grouped: boolean) {
  const params = new URLSearchParams(window.location.search);
  const set = (key: string, value: string, fallback: string) => (value && value !== fallback ? params.set(key, value) : params.delete(key));
  set("sort", sort, "recent");
  set("q", filters.query.trim(), "");
  set("speciality", filters.speciality, "");
  set("pillar", filters.pillar, "");
  set("authority", filters.authority, "");
  set("review", filters.review, "all");
  set("group", grouped ? "" : "none", "");
  const query = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
}

export function TopicExplorer({ topics, viewsAvailable, initialSort, initialFilters, initialGrouped = true }: TopicExplorerProps) {
  const [sort, setSort] = useState<SortKey>(!viewsAvailable && (initialSort === "viewed" || initialSort === "trending") ? "recent" : initialSort);
  const [filters, setFilters] = useState<ExplorerFilters>(initialFilters);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [grouped, setGrouped] = useState(initialGrouped);

  const specialities = useMemo(() => facet(topics, "speciality"), [topics]);
  const pillars = useMemo(() => facet(topics, "pillar"), [topics]);
  const authorities = useMemo(() => facet(topics, "authority"), [topics]);
  const results = useMemo(() => sortTopics(filterTopics(topics, filters), sort), [topics, filters, sort]);
  const anyViews = topics.some((topic) => topic.totalViews > 0);
  const activeCount = [filters.query.trim(), filters.speciality, filters.pillar, filters.authority, filters.review !== "all" ? filters.review : ""].filter(Boolean).length;

  const update = (next: Partial<ExplorerFilters>) => {
    const merged = { ...filters, ...next };
    setFilters(merged);
    setVisible(PAGE_SIZE);
    syncUrl(sort, merged, grouped);
  };
  const changeSort = (next: SortKey) => {
    setSort(next);
    syncUrl(next, filters, grouped);
  };
  const clear = () => {
    setFilters(emptyFilters);
    setVisible(PAGE_SIZE);
    syncUrl(sort, emptyFilters, grouped);
  };

  const changeGrouped = (next: boolean) => {
    setGrouped(next);
    syncUrl(sort, filters, next);
  };

  const shown = grouped ? results : results.slice(0, visible);
  const sections = useMemo(() => (grouped ? groupBySpeciality(results, (topic) => topic.speciality) : []), [grouped, results]);

  return (
    <section className="card section-card topic-explorer" aria-labelledby="explorer-title">
      <div className="section-head">
        <h2 id="explorer-title">Browse topics</h2>
        <Link className="section-link" href="/dashboard/diseases">Open full directory</Link>
      </div>

      <div className="explorer-toolbar">
        <div className="explorer-sorts" role="radiogroup" aria-label="Sort topics by">
          {SORT_KEYS.map((key) => {
            const needsViews = key === "viewed" || key === "trending";
            const disabled = needsViews && !viewsAvailable;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={sort === key}
                disabled={disabled}
                title={disabled ? "View counts are not being recorded yet" : undefined}
                className={sort === key ? "scope-chip scope-chip-active" : "scope-chip"}
                onClick={() => changeSort(key)}
              >
                {SORT_LABELS[key]}
              </button>
            );
          })}
        </div>
        <button type="button" role="switch" aria-checked={grouped} className={grouped ? "scope-chip scope-chip-active" : "scope-chip"} onClick={() => changeGrouped(!grouped)}>
          Group by speciality
        </button>
        <label className="explorer-search">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => update({ query: event.target.value })}
            placeholder="Filter by title, symptom or drug"
            aria-label="Filter topics by title, symptom or drug"
            autoComplete="off"
          />
        </label>
      </div>

      <div className="explorer-filters">
        <FilterSelect label="Speciality" value={filters.speciality} options={specialities} onChange={(speciality) => update({ speciality })} />
        <FilterSelect label="Care pillar" value={filters.pillar} options={pillars} onChange={(pillar) => update({ pillar })} />
        <FilterSelect label="Authority" value={filters.authority} options={authorities} onChange={(authority) => update({ authority })} />
        <label className="explorer-select">
          <span>Clinical review</span>
          <select value={filters.review} onChange={(event) => update({ review: event.target.value as ExplorerFilters["review"] })}>
            <option value="all">All topics</option>
            <option value="approved">Clinician approved</option>
            <option value="pending">Awaiting clinical approval</option>
          </select>
        </label>
        {activeCount > 0 && <button type="button" className="explorer-clear" onClick={clear}><X size={13} aria-hidden="true" />Clear {activeCount === 1 ? "filter" : `${activeCount} filters`}</button>}
      </div>

      <p className="explorer-count" role="status" aria-live="polite">
        {results.length === topics.length ? `${numberFormat.format(results.length)} live topics` : `${numberFormat.format(results.length)} of ${numberFormat.format(topics.length)} live topics`}
        {viewsAvailable && !anyViews && (sort === "viewed" || sort === "trending") ? " · no views recorded yet, counts start as topics are opened" : ""}
      </p>

      {results.length && grouped ? (
        <div className="explorer-groups">
          {sections.map(({ speciality, items }) => (
            <details key={`${speciality}-${activeCount > 0 ? "filtered" : "all"}`} className="explorer-group" data-spec style={specialityStyle(speciality)} open={activeCount > 0 || sections.length === 1}>
              <summary><span>{speciality}</span><span className="explorer-group-count">{items.length}</span></summary>
              <ol className="explorer-list">
                {items.map((topic, index) => (
                  <TopicRow key={topic.id} topic={topic} index={index} sort={sort} viewsAvailable={viewsAvailable} />
                ))}
              </ol>
            </details>
          ))}
        </div>
      ) : shown.length ? (
        <ol className="explorer-list">
          {shown.map((topic, index) => (
            <TopicRow key={topic.id} topic={topic} index={index} sort={sort} viewsAvailable={viewsAvailable} />
          ))}
        </ol>
      ) : (
        <div className="empty-state">
          <span className="empty-state-icon"><Search size={22} aria-hidden="true" /></span>
          <strong>No topics match these filters</strong>
          <p>Try a different speciality or clear the filters to see every live topic.</p>
          <button type="button" className="button-secondary" onClick={clear}>Clear filters</button>
        </div>
      )}

      {!grouped && results.length > shown.length && (
        <div className="explorer-more">
          <button type="button" className="button-secondary" onClick={() => setVisible((count) => count + PAGE_SIZE)}>Show {Math.min(PAGE_SIZE, results.length - shown.length)} more</button>
          <button type="button" className="explorer-link-button" onClick={() => setVisible(results.length)}>Show all {numberFormat.format(results.length)}</button>
        </div>
      )}
    </section>
  );
}

function TopicRow({ topic, index, sort, viewsAvailable }: { topic: ExplorerTopic; index: number; sort: SortKey; viewsAvailable: boolean }) {
  return (
    <li>
              <Link href={`/dashboard/diseases/${topic.id}`} className="explorer-row">
                <span className="explorer-rank" aria-hidden="true">{index + 1}</span>
                <span className="explorer-main">
                  <strong>{topic.title}</strong>
                  <span className="explorer-meta">
                    <span className="pill pill-slate pill-sm">{topic.pillar}</span>
                    <span className="spec-chip" data-spec style={specialityStyle(topic.speciality)}>{topic.speciality}</span>
                    <span>{topic.authority}</span>
                  </span>
                </span>
                <span className="explorer-stats">
                  <span className="explorer-stat" title={`Last reviewed ${topic.lastReviewed}`}><Clock3 size={13} aria-hidden="true" />{relativeAge(topic.lastReviewed)}</span>
                  {viewsAvailable && (
                    <span className="explorer-stat" title={`${numberFormat.format(topic.views7d)} views in the last 7 days`}>
                      {sort === "trending" ? <Activity size={13} aria-hidden="true" /> : <Library size={13} aria-hidden="true" />}
                      {sort === "trending" ? `${numberFormat.format(topic.views7d)} this week` : `${numberFormat.format(topic.totalViews)} ${topic.totalViews === 1 ? "view" : "views"}`}
                    </span>
                  )}
                  <span className={topic.clinicallyApproved ? "explorer-review is-approved" : "explorer-review is-pending"}>
                    {topic.clinicallyApproved ? <CheckCircle2 size={13} aria-hidden="true" /> : <Hourglass size={13} aria-hidden="true" />}
                    {topic.clinicallyApproved ? "Approved" : "Review pending"}
                  </span>
                </span>
                <ChevronRight size={15} className="update-chevron" aria-hidden="true" />
              </Link>
            </li>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; count: number }[]; onChange: (value: string) => void }) {
  return (
    <label className="explorer-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">All</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.value} ({option.count})</option>)}
      </select>
    </label>
  );
}
