"use client";

import Link from "next/link";
import { ArrowRight, Baby, CalendarCheck, HeartHandshake, HeartPulse, Search, ShieldCheck, Siren, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ApprovalStatusBadge } from "@/components/approval-status-badge";
import type { CarePillar, MockDisease, ModelOfCarePillar } from "@/data/mockDiseases";

type PillarFilter = ModelOfCarePillar | "all";

const pillarIcons = {
  siren: Siren,
  "heart-pulse": HeartPulse,
  "shield-check": ShieldCheck,
  "calendar-check": CalendarCheck,
  baby: Baby,
  "heart-handshake": HeartHandshake,
};

export function ModelOfCareDirectory({ pillars, diseases, initialQuery = "" }: { pillars: CarePillar[]; diseases: MockDisease[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery.trim().toLocaleLowerCase());
  const [activePillar, setActivePillar] = useState<PillarFilter>("all");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim().toLocaleLowerCase()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const filteredDiseases = useMemo(() => diseases.filter((disease) => {
    const matchesPillar = activePillar === "all" || disease.pillar === activePillar;
    const searchText = [disease.title, disease.shortTitle, disease.summary, disease.sourceAuthority, ...disease.aliases].join(" ").toLocaleLowerCase();
    return matchesPillar && (!debouncedQuery || searchText.includes(debouncedQuery));
  }), [activePillar, debouncedQuery, diseases]);

  const activePillarName = pillars.find((pillar) => pillar.id === activePillar)?.title;

  return (
    <>
      <section className="directory-search" aria-labelledby="directory-search-title">
        <div>
          <p className="disease-kicker">Find a pathway</p>
          <h2 id="directory-search-title">Search the clinical directory</h2>
        </div>
        <label className="directory-search-control">
          <span className="sr-only">Search by condition, abbreviation or authority</span>
          <Search size={19} strokeWidth={1.5} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search DKA, asthma, screening…" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} strokeWidth={1.5} /></button>}
        </label>
      </section>

      <section aria-labelledby="care-pillars-title">
        <div className="directory-section-heading">
          <div>
            <p className="disease-kicker">Saudi Model of Care</p>
            <h2 id="care-pillars-title">Browse by care pillar</h2>
          </div>
          {activePillar !== "all" && <button className="directory-reset" type="button" onClick={() => setActivePillar("all")}>Show all pillars</button>}
        </div>
        <div className="care-pillar-grid">
          {pillars.map(({ id, title, description, icon }) => {
            const isActive = activePillar === id;
            const count = diseases.filter((disease) => disease.pillar === id).length;
            const Icon = pillarIcons[icon];
            return (
              <button className={`care-pillar-card ${isActive ? "is-active" : ""}`} type="button" key={id} onClick={() => setActivePillar(isActive ? "all" : id)} aria-pressed={isActive}>
                <span className="care-pillar-icon"><Icon size={21} strokeWidth={1.5} /></span>
                <span className="care-pillar-copy"><strong>{title}</strong><small>{description}</small></span>
                <span className="care-pillar-count">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="directory-results" aria-labelledby="directory-results-title" aria-live="polite">
        <div className="directory-section-heading">
          <div>
            <p className="disease-kicker">{activePillarName ?? "All care pillars"}</p>
            <h2 id="directory-results-title">Clinical protocols</h2>
          </div>
          <p>{filteredDiseases.length} {filteredDiseases.length === 1 ? "protocol" : "protocols"}</p>
        </div>
        <div className="disease-card-grid">
          {filteredDiseases.map((disease) => (
            <Link href={`/dashboard/diseases/${disease.id}`} className="disease-card" key={disease.id}>
              <div className="disease-card-top">
                <span>{pillars.find((pillar) => pillar.id === disease.pillar)?.title}</span>
                <ApprovalStatusBadge status={disease.approvalStatus} />
              </div>
              <div>
                <h3>{disease.shortTitle}</h3>
                <p>{disease.summary}</p>
              </div>
              <div className="disease-card-footer">
                <span>{disease.sourceAuthority}</span>
                <span>View protocol <ArrowRight size={14} strokeWidth={1.5} /></span>
              </div>
            </Link>
          ))}
        </div>
        {filteredDiseases.length === 0 && (
          <div className="directory-empty card">
            <Search size={24} strokeWidth={1.5} aria-hidden="true" />
            <h3>No matching protocols</h3>
            <p>Try another condition, abbreviation or care pillar.</p>
            <button type="button" onClick={() => { setQuery(""); setActivePillar("all"); }}>Reset search</button>
          </div>
        )}
      </section>
    </>
  );
}
