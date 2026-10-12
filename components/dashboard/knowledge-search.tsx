"use client";

import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";

const scopes = [
  { id: "diseases", label: "Diseases", action: "/dashboard/diseases", placeholder: "Search a condition, e.g. “DKA”, “asthma” or “sepsis”" },
  { id: "guidelines", label: "Guidelines", action: "/dashboard/clinical-guidelines", placeholder: "Search NICE / NHS-aligned guidelines" },
  { id: "pathways", label: "Pathways", action: "/dashboard/diseases", placeholder: "Search a clinical pathway, e.g. “chest pain” or “AKI”" },
  { id: "formulary", label: "Formulary", action: "/dashboard/medicines-formulary", placeholder: "Search a medicine or formulary entry" },
] as const;

export function KnowledgeSearch() {
  const [scopeId, setScopeId] = useState<(typeof scopes)[number]["id"]>("diseases");
  const scope = scopes.find(({ id }) => id === scopeId) ?? scopes[0];
  return (
    <>
      <form className="ai-search-form" action={scope.action} role="search">
        <Search className="ai-search-icon" size={19} aria-hidden="true" />
        <input name="q" aria-label={`Search ${scope.label.toLowerCase()}`} placeholder={scope.placeholder} autoComplete="off" />
        <button type="submit">Search<ArrowRight size={16} aria-hidden="true" /></button>
      </form>
      <div className="ai-search-suggestions" role="radiogroup" aria-label="Search scope">
        {scopes.map(({ id, label }) => (
          <button key={id} type="button" role="radio" aria-checked={id === scopeId} className={id === scopeId ? "scope-chip scope-chip-active" : "scope-chip"} onClick={() => setScopeId(id)}>{label}</button>
        ))}
      </div>
    </>
  );
}
