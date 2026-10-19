"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Bookmark, Search, X } from "@/components/icons-3d";
import { ClinicalCalculator } from "@/components/clinical-calculator";
import { clinicalCalculators, type ClinicalCalculatorSchema } from "@/lib/clinical-calculators";

const FAVOURITES_KEY = "marifa.calculators.favourites";
const BASE_PATH = "/dashboard/medical-calculators";

// Saved calculators live in this browser only (localStorage). If storage is blocked they last for the visit.
const listeners = new Set<() => void>();
let memoryFavourites = "[]";
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => { listeners.delete(listener); window.removeEventListener("storage", listener); };
}
function getFavouritesSnapshot() {
  try { return window.localStorage.getItem(FAVOURITES_KEY) ?? memoryFavourites; } catch { return memoryFavourites; }
}
function parseFavourites(raw: string): string[] {
  try { const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []; } catch { return []; }
}
function saveFavourites(ids: string[]) {
  memoryFavourites = JSON.stringify(ids);
  try { window.localStorage.setItem(FAVOURITES_KEY, memoryFavourites); } catch { /* storage unavailable */ }
  listeners.forEach((listener) => listener());
}

function matches(item: ClinicalCalculatorSchema, needle: string) {
  if (!needle) return true;
  return [item.title, item.shortTitle, item.specialty, item.description, ...(item.keywords ?? [])].join(" ").toLocaleLowerCase().includes(needle);
}

export function MedicalCalculators() {
  // The selected calculator lives in the URL (?calc=) so the side-panel menu, links and the browser Back button stay in sync.
  const calculatorId = useSearchParams()?.get("calc");
  const calculator = clinicalCalculators.find(({ id }) => id === calculatorId);
  const rawFavourites = useSyncExternalStore(subscribe, getFavouritesSnapshot, () => "[]");
  const favourites = useMemo(() => parseFavourites(rawFavourites), [rawFavourites]);

  function toggleFavourite(id: string) {
    saveFavourites(favourites.includes(id) ? favourites.filter((value) => value !== id) : [...favourites, id]);
  }

  if (calculator) {
    return (
      <>
        <nav className="calculator-crumbs" aria-label="Calculator navigation">
          <Link href={BASE_PATH} scroll={false}><ArrowLeft size={15} aria-hidden="true" /> All calculators</Link>
          <button type="button" className={favourites.includes(calculator.id) ? "calculator-star is-on" : "calculator-star"} aria-pressed={favourites.includes(calculator.id)} onClick={() => toggleFavourite(calculator.id)}>
            <Bookmark size={15} aria-hidden="true" /> {favourites.includes(calculator.id) ? "Saved" : "Save"}
          </button>
        </nav>
        <div key={calculator.id}><ClinicalCalculator schema={calculator} /></div>
      </>
    );
  }
  return <CalculatorHome favourites={favourites} onToggleFavourite={toggleFavourite} />;
}

function CalculatorHome({ favourites, onToggleFavourite }: { favourites: string[]; onToggleFavourite: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [sort, setSort] = useState<"popular" | "az">("popular");
  const needle = query.trim().toLocaleLowerCase();

  const specialties = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of clinicalCalculators) counts.set(item.specialty, (counts.get(item.specialty) ?? 0) + 1);
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, []);

  const visible = useMemo(() => {
    const list = clinicalCalculators.filter((item) => (specialty === "All" || item.specialty === specialty) && matches(item, needle));
    return [...list].sort((a, b) => sort === "az" ? a.title.localeCompare(b.title) : (a.popularity ?? 100) - (b.popularity ?? 100) || a.title.localeCompare(b.title));
  }, [needle, specialty, sort]);
  const saved = visible.filter((item) => favourites.includes(item.id));
  const recentlyAdded = clinicalCalculators.filter((item) => item.isNew).length;

  return (
    <div className="calculator-home">
      <div className="calculator-toolbar">
        <label className="calculator-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search calculators</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, condition or speciality, for example PE, kidney, QT" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}
        </label>
        <label className="calculator-sort"><span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as "popular" | "az")}>
            <option value="popular">Most used</option>
            <option value="az">A to Z</option>
          </select>
        </label>
      </div>

      <div className="calculator-chips" role="group" aria-label="Filter by speciality">
        <button type="button" className={specialty === "All" ? "is-active" : ""} aria-pressed={specialty === "All"} onClick={() => setSpecialty("All")}>All <span>{clinicalCalculators.length}</span></button>
        {specialties.map(([name, count]) => <button key={name} type="button" className={specialty === name ? "is-active" : ""} aria-pressed={specialty === name} onClick={() => setSpecialty(name)}>{name} <span>{count}</span></button>)}
      </div>

      {saved.length > 0 && <CalculatorGrid title="Saved" items={saved} favourites={favourites} onToggleFavourite={onToggleFavourite} />}
      {visible.length > 0
        ? <CalculatorGrid title={needle || specialty !== "All" ? `${visible.length} ${visible.length === 1 ? "calculator" : "calculators"}` : `All calculators (${visible.length}, ${recentlyAdded} new)`} items={visible} favourites={favourites} onToggleFavourite={onToggleFavourite} />
        : <p className="calculator-empty" role="status">No calculators match this search. Try a condition name or clear the speciality filter.</p>}
    </div>
  );
}

function CalculatorGrid({ title, items, favourites, onToggleFavourite }: { title: string; items: ClinicalCalculatorSchema[]; favourites: string[]; onToggleFavourite: (id: string) => void }) {
  return (
    <section className="calculator-grid-section" aria-label={title}>
      <h2 className="calculator-grid-title">{title}</h2>
      <ul className="calculator-grid">
        {items.map((item) => {
          const saved = favourites.includes(item.id);
          return (
            <li key={item.id} className="calculator-card card">
              <Link href={`${BASE_PATH}?calc=${encodeURIComponent(item.id)}`} scroll={false}>
                <span className="calculator-card-meta">{item.specialty}{item.isNew && <span className="calculator-new-badge">New</span>}</span>
                <strong>{item.title}</strong>
                <span className="calculator-card-copy">{item.description}</span>
              </Link>
              <button type="button" className={saved ? "calculator-star is-on" : "calculator-star"} aria-pressed={saved} aria-label={`${saved ? "Remove" : "Save"} ${item.shortTitle}`} onClick={() => onToggleFavourite(item.id)}><Bookmark size={15} aria-hidden="true" /></button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
