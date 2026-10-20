"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Search, X } from "@/components/icons-3d";
import {
  MANAGED_SORTS,
  MANAGED_SORT_LABELS,
  filterManaged,
  groupManaged,
  sortManaged,
  specialityOptions,
  type ManagedItem,
  type ManagedSort,
} from "@/lib/dashboard/managed-topics";

export type ManagedBrowserItem = ManagedItem & {
  /** The tile, already rendered on the server so its edit/approve/delete forms keep working. */
  tile: ReactNode;
};

const slug = (value: string) => value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Sort and filter bar plus tile grid shared by the Draft, Approved and Published tabs. */
export function ManagedTopicBrowser({ items, noun, dateNoun }: { items: ManagedBrowserItem[]; noun: string; dateNoun: string }) {
  const [sort, setSort] = useState<ManagedSort>("newest");
  const [query, setQuery] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [grouped, setGrouped] = useState(true);

  const options = useMemo(() => specialityOptions(items), [items]);
  const shown = useMemo(() => sortManaged(filterManaged(items, query, speciality), sort), [items, query, speciality, sort]);
  const sections = useMemo(() => (grouped ? groupManaged(shown) : []), [grouped, shown]);
  const filtered = Boolean(query.trim() || speciality);

  return (
    <>
      <div className="managed-toolbar" role="group" aria-label={`Sort and filter ${noun} topics`}>
        <label className="managed-field">
          <span>Sort by</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as ManagedSort)}>
            {MANAGED_SORTS.map((key) => <option key={key} value={key}>{key === "newest" ? `${dateNoun}: newest first` : key === "oldest" ? `${dateNoun}: oldest first` : MANAGED_SORT_LABELS[key]}</option>)}
          </select>
        </label>
        <label className="managed-field">
          <span>Speciality</span>
          <select value={speciality} onChange={(event) => setSpeciality(event.target.value)}>
            <option value="">All specialities</option>
            {options.map((option) => <option key={option.value} value={option.value}>{option.value} ({option.count})</option>)}
          </select>
        </label>
        <label className="managed-field">
          <span>Group by</span>
          <select value={grouped ? "speciality" : "none"} onChange={(event) => setGrouped(event.target.value === "speciality")}>
            <option value="speciality">Speciality</option>
            <option value="none">No grouping</option>
          </select>
        </label>
        <label className="managed-field managed-field-search">
          <span>Search</span>
          <div><Search size={14} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title or speciality" autoComplete="off" /></div>
        </label>
        {filtered && <button type="button" className="explorer-clear" onClick={() => { setQuery(""); setSpeciality(""); }}><X size={13} aria-hidden="true" />Clear</button>}
        <p className="managed-count" role="status" aria-live="polite">{filtered ? `${shown.length} of ${items.length}` : `${items.length}`} {noun} {items.length === 1 ? "topic" : "topics"}</p>
      </div>

      {shown.length && grouped ? (
        <div className="speciality-sections">
          {sections.map(({ speciality: name, items: list }) => (
            <section className="speciality-section" key={name} aria-labelledby={`speciality-${slug(name)}`}>
              <h3 className="speciality-section-title" id={`speciality-${slug(name)}`}>{name}<span>{list.length}</span></h3>
              <div className="topic-tile-grid">{list.map((item) => <div className="managed-cell" key={item.key}>{item.tile}</div>)}</div>
            </section>
          ))}
        </div>
      ) : shown.length ? (
        <div className="topic-tile-grid">{shown.map((item) => <div className="managed-cell" key={item.key}>{item.tile}</div>)}</div>
      ) : (
        <p className="managed-empty">No {noun} topics match these filters.</p>
      )}
    </>
  );
}
