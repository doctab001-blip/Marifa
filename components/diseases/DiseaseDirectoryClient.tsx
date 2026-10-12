"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Baby, CalendarCheck, FileSearch, HeartHandshake, HeartPulse, LayoutGrid, List, Search, ShieldCheck, Siren, X } from "lucide-react";
import { DiseaseCard } from "@/components/diseases/DiseaseCard";
import type { DiseaseDirectoryResult, DiseaseGuidelineSummary } from "@/lib/data/disease-guidelines";
import type { DiseaseDetail } from "@/lib/validations/disease";
import { hasMedicalSpeciality, medicalSpecialities } from "@/lib/medical-specialities";
import { searchTopics } from "@/lib/topic-search";

type Pillar = DiseaseDetail["pillar"];
type PillarFilter = Pillar | "all";

const pillars: Array<{ id: Pillar; icon: typeof Siren }> = [
  { id: "Urgent Care", icon: Siren },
  { id: "Chronic Care", icon: HeartPulse },
  { id: "Keep Well", icon: ShieldCheck },
  { id: "Planned Care", icon: CalendarCheck },
  { id: "Safe Birth", icon: Baby },
  { id: "Palliative Care", icon: HeartHandshake },
];

export function DiseaseDirectoryClient({
  diseases,
  state,
  rejectedCount = 0,
  withheldCount = 0,
  initialQuery = "",
}: {
  diseases: DiseaseGuidelineSummary[];
  state: DiseaseDirectoryResult["state"];
  rejectedCount?: number;
  withheldCount?: number;
  initialQuery?: string;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery.trim());
  const [activePillar, setActivePillar] = useState<PillarFilter>("all");
  const [activeSpeciality, setActiveSpeciality] = useState("all");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  // Search first (ranked best match first), then narrow by speciality. Pillar counts reflect the search,
  // so the tabs show where the matches are.
  const searchedDiseases = useMemo(() => {
    const matches = searchTopics(diseases, debouncedQuery);
    if (activeSpeciality === "all") return matches;
    return matches.filter((disease) => hasMedicalSpeciality([disease.speciality, disease.specialty, ...(disease.subSpecialities ?? [])].join(" "), activeSpeciality));
  }, [activeSpeciality, debouncedQuery, diseases]);
  const filteredDiseases = useMemo(
    () => (activePillar === "all" ? searchedDiseases : searchedDiseases.filter((disease) => disease.pillar === activePillar)),
    [activePillar, searchedDiseases],
  );
  const searching = debouncedQuery.length > 0;

  const runSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDebouncedQuery(query.trim());
  };
  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  return (
    <>
      <section className="directory-search" aria-labelledby="directory-search-title">
        <div>
          <p className="disease-kicker">Find a pathway</p>
          <h2 id="directory-search-title">Search the clinical directory</h2>
        </div>
        <form className="directory-search-form" role="search" onSubmit={runSearch}>
          <label className="directory-search-control">
            <span className="sr-only">Search diseases and specialties</span>
            <Search size={20} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a disease, abbreviation, symptom or drug (e.g. DKA, chest pain)..."
              type="search"
              autoComplete="off"
              enterKeyHint="search"
            />
            {query && <button type="button" onClick={clearSearch} aria-label="Clear search"><X size={16} /></button>}
          </label>
          <button type="submit" className="button-primary directory-search-submit">Search</button>
        </form>
      </section>

      <section aria-labelledby="care-pillars-title" className="pillar-section">
        <div className="directory-section-heading">
          <div><p className="disease-kicker">Saudi Model of Care</p><h2 id="care-pillars-title">Browse by care pillar</h2></div>
        </div>
        <div className="care-pillar-tabs" role="group" aria-label="Filter by care pillar">
          <button type="button" className={`care-pillar-tab ${activePillar === "all" ? "is-active" : ""}`} onClick={() => setActivePillar("all")} aria-pressed={activePillar === "all"}>
            All Categories <span className="care-pillar-tab-count">{searchedDiseases.length}</span>
          </button>
          {pillars.map(({ id, icon: Icon }) => (
            <button key={id} type="button" className={`care-pillar-tab ${activePillar === id ? "is-active" : ""}`} onClick={() => setActivePillar(activePillar === id ? "all" : id)} aria-pressed={activePillar === id}>
              <Icon size={16} aria-hidden="true" />{id} <span className="care-pillar-tab-count">{searchedDiseases.filter((disease) => disease.pillar === id).length}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="speciality-filter-section" aria-labelledby="specialities-title">
        <div className="directory-section-heading"><div><p className="disease-kicker">Clinical domain</p><h2 id="specialities-title">Browse by medical speciality</h2></div></div>
        <label className="speciality-filter-control"><span>Medical speciality</span><select value={activeSpeciality} onChange={(event) => setActiveSpeciality(event.target.value)} aria-label="Filter by medical speciality"><option value="all">All specialities</option>{medicalSpecialities.map(({ name }) => <option key={name} value={name}>{name}</option>)}</select></label>
      </section>

      <section className="directory-results" aria-labelledby="directory-results-title" aria-live="polite">
        <div className="directory-section-heading">
          <div><p className="disease-kicker">{activePillar === "all" ? "All care pillars" : activePillar}</p><h2 id="directory-results-title">Published clinical topics</h2></div>
          <div className="directory-result-tools">
            <p role="status">{filteredDiseases.length} {filteredDiseases.length === 1 ? "guideline" : "guidelines"}{searching ? ` for “${debouncedQuery}”` : ""}</p>
            <div className="directory-view-toggle" role="group" aria-label="Directory view">
              <button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")}><LayoutGrid size={16} aria-hidden="true" />Grid</button>
              <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}><List size={16} aria-hidden="true" />List</button>
            </div>
          </div>
        </div>
        {filteredDiseases.length > 0 ? (
          <div className={`disease-card-grid${view === "list" ? " disease-card-list" : ""}`}>
            {filteredDiseases.map((disease) => <DiseaseCard key={disease.id} disease={disease} />)}
          </div>
        ) : (
          <div className="directory-empty card">
            <FileSearch size={28} strokeWidth={1.5} aria-hidden="true" />
            <h3>{state === "unavailable" ? "Clinical directory unavailable" : diseases.length === 0 ? "No clinical guidelines published yet." : searching ? `No guidelines match “${debouncedQuery}”` : "No matching guidelines"}</h3>
            <p>{state === "unavailable" ? "The clinical directory could not be loaded. Please try again later." : diseases.length === 0 ? "Published clinical guidelines will appear here when they are available." : searching ? "Check the spelling, try an abbreviation (DKA, AKI, COPD), a symptom or a drug name, or reset the filters." : "Try another disease or specialty, or choose a different care pillar."}</p>
            {diseases.length > 0 && <button type="button" onClick={() => { clearSearch(); setActivePillar("all"); setActiveSpeciality("all"); }}>Reset filters</button>}
          </div>
        )}
        {rejectedCount > 0 && <p className="directory-validation-note" role="status">{rejectedCount} published {rejectedCount === 1 ? "record was" : "records were"} hidden because validation failed.</p>}
        {withheldCount > 0 && <p className="directory-validation-note" role="status">{withheldCount} {withheldCount === 1 ? "topic is" : "topics are"} below the current authoring standard and available in <Link href="/dashboard/diseases/drafts">Draft</Link>.</p>}
      </section>
    </>
  );
}
