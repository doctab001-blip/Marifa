"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, FileWarning, Search, ShieldAlert, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import { searchDiseases } from "@/lib/search";
import type { DiseaseTopic } from "@/lib/types";

export function DiseaseDirectory({ items, initialQuery = "" }: { items: DiseaseTopic[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [specialty, setSpecialty] = useState("all");
  const results = useMemo(() => searchDiseases(items, query, specialty), [items, query, specialty]);
  const specialties = Array.from(new Set(items.map((item) => item.specialty))).sort();
  return <>
    <div className="directory-tools"><input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search the disease directory" placeholder="Disease, symptom, abbreviation or Arabic term…" autoFocus={Boolean(initialQuery)} /><select value={specialty} onChange={(e) => setSpecialty(e.target.value)} aria-label="Filter by specialty"><option value="all">All specialties</option>{specialties.map((item) => <option key={item}>{item}</option>)}</select></div>
    <div className="grid" aria-live="polite">
      {results.map((disease) => <Link className="card result-card" href={`/diseases/${disease.slug}`} key={disease.id}>
        <div className="result-icon"><Stethoscope size={21} /></div>
        <div><div style={{ display: "flex", flexWrap: "wrap", gap: 9, alignItems: "center" }}><h2>{disease.name}</h2><span className="status status-demo">Demo — not for clinical use</span></div><div className="arabic-title" lang="ar" dir="rtl">{disease.arabicName}</div><p>{disease.summary}</p><div className="result-meta"><span><ShieldAlert size={13} />{disease.source.status.replace("_", " ")}</span><span><FileWarning size={13} />{disease.source.version}</span><span><CalendarDays size={13} />Reviewed {disease.source.lastVerifiedDate}</span><span>{disease.specialty}</span></div></div>
        <ArrowRight className="result-action" size={19} />
      </Link>)}
      {results.length === 0 && <div className="card empty"><Search size={28} /><strong>No matching demo topics</strong><p>Try COPD, shortness of breath, AKI, sepsis, or an Arabic title.</p></div>}
    </div>
  </>;
}
