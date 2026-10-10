"use client";

import Link from "next/link";
import { ArrowRight, Baby, CalendarCheck, HeartHandshake, HeartPulse, Search, ShieldCheck, Siren, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ApprovalStatusBadge } from "@/components/approval-status-badge";
import type { DiseaseDirectoryResult, DiseaseGuidelineSummary } from "@/lib/data/disease-guidelines";
import type { DiseaseDetail } from "@/lib/validations/disease";

type Pillar = DiseaseDetail["pillar"];
type PillarFilter = Pillar | "all";

const pillarIcons = {
  siren: Siren,
  "heart-pulse": HeartPulse,
  "shield-check": ShieldCheck,
  "calendar-check": CalendarCheck,
  baby: Baby,
  "heart-handshake": HeartHandshake,
};

export const carePillars: Array<{ id: Pillar; title: Pillar; description: string; icon: keyof typeof pillarIcons }> = [
  { id: "Urgent Care", title: "Urgent Care", description: "Time-critical assessment and escalation", icon: "siren" },
  { id: "Chronic Care", title: "Chronic Care", description: "Long-term condition management", icon: "heart-pulse" },
  { id: "Keep Well", title: "Keep Well", description: "Prevention, screening and wellbeing", icon: "shield-check" },
  { id: "Planned Care", title: "Planned Care", description: "Coordinated elective pathways", icon: "calendar-check" },
  { id: "Safe Birth", title: "Safe Birth", description: "Maternal and newborn care", icon: "baby" },
  { id: "Palliative Care", title: "Palliative Care", description: "Comfort, dignity and support", icon: "heart-handshake" },
];

function statusLabel(status: DiseaseGuidelineSummary["status"]) {
  if (status === "under_review") return "Under review" as const;
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}` as "Approved" | "Published" | "Draft" | "Superseded" | "Archived";
}

export function ModelOfCareDirectory({ diseases, state, rejectedCount = 0, initialQuery = "" }: {
  diseases: DiseaseGuidelineSummary[];
  state: DiseaseDirectoryResult["state"];
  rejectedCount?: number;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery.trim().toLocaleLowerCase());
  const [activePillar, setActivePillar] = useState<PillarFilter>("all");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim().toLocaleLowerCase()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const filteredDiseases = useMemo(() => diseases.filter((disease) => {
    const matchesPillar = activePillar === "all" || disease.pillar === activePillar;
    const searchText = [disease.title, disease.summary, disease.specialty, disease.authority, disease.pillar].join(" ").toLocaleLowerCase();
    return matchesPillar && (!debouncedQuery || searchText.includes(debouncedQuery));
  }), [activePillar, debouncedQuery, diseases]);

  return (
    <>
      <section className="directory-search" aria-labelledby="directory-search-title">
        <div><p className="disease-kicker">Find a pathway</p><h2 id="directory-search-title">Search the clinical directory</h2></div>
        <label className="directory-search-control">
          <span className="sr-only">Search by condition, specialty, care pillar or authority</span>
          <Search size={19} strokeWidth={1.5} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search asthma, cardiology, MOH…" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} strokeWidth={1.5} /></button>}
        </label>
      </section>

      <section aria-labelledby="care-pillars-title">
        <div className="directory-section-heading">
          <div><p className="disease-kicker">Saudi Model of Care</p><h2 id="care-pillars-title">Browse by care pillar</h2></div>
          {activePillar !== "all" && <button className="directory-reset" type="button" onClick={() => setActivePillar("all")}>Show all pillars</button>}
        </div>
        <div className="care-pillar-grid">
          {carePillars.map(({ id, title, description, icon }) => {
            const isActive = activePillar === id;
            const Icon = pillarIcons[icon];
            return (
              <button className={`care-pillar-card ${isActive ? "is-active" : ""}`} type="button" key={id} onClick={() => setActivePillar(isActive ? "all" : id)} aria-pressed={isActive}>
                <span className="care-pillar-icon"><Icon size={21} strokeWidth={1.5} /></span>
                <span className="care-pillar-copy"><strong>{title}</strong><small>{description}</small></span>
                <span className="care-pillar-count">{diseases.filter((disease) => disease.pillar === id).length}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="directory-results" aria-labelledby="directory-results-title" aria-live="polite">
        <div className="directory-section-heading">
          <div><p className="disease-kicker">{activePillar === "all" ? "All care pillars" : activePillar}</p><h2 id="directory-results-title">Approved clinical protocols</h2></div>
          <p>{filteredDiseases.length} {filteredDiseases.length === 1 ? "protocol" : "protocols"}</p>
        </div>
        {filteredDiseases.length > 0 && <div className="disease-card-grid">
          {filteredDiseases.map((disease) => (
            <Link href={`/dashboard/diseases/${disease.id}`} className="disease-card" key={disease.id}>
              <div className="disease-card-top"><span>{disease.pillar}</span><ApprovalStatusBadge status={statusLabel(disease.status)} /></div>
              <div><h3>{disease.title}</h3><p>{disease.summary}</p></div>
              <div className="disease-card-footer"><span>{disease.authority} · {disease.specialty}</span><span>View protocol <ArrowRight size={14} strokeWidth={1.5} /></span></div>
            </Link>
          ))}
        </div>}
        {filteredDiseases.length === 0 && (
          <div className="directory-empty card">
            <Search size={24} strokeWidth={1.5} aria-hidden="true" />
            <h3>{state === "unavailable" ? "Clinical directory unavailable" : diseases.length === 0 ? "No approved protocols yet" : "No matching protocols"}</h3>
            <p>{state === "unavailable" ? "Sign in with an authorised account or try again later." : diseases.length === 0 ? "Draft pathways remain hidden until clinical governance approval is recorded." : "Try another condition, specialty, authority or care pillar."}</p>
            {diseases.length > 0 && <button type="button" onClick={() => { setQuery(""); setActivePillar("all"); }}>Reset search</button>}
          </div>
        )}
        {rejectedCount > 0 && <p className="directory-validation-note" role="status">{rejectedCount} approved {rejectedCount === 1 ? "record was" : "records were"} hidden because validation failed.</p>}
      </section>
    </>
  );
}
