"use client";

import { useRef, useState } from "react";
import { Activity, FlaskConical, Loader2, RotateCcw, ScanLine, ShieldAlert, Sparkles, Stethoscope, Thermometer } from "lucide-react";
import type { CountryCode } from "@/types/clinical";
import type { DiagnosticEngineError, DiagnosticEngineResponse, DiagnosticInputState, FindingDomain } from "@/types/diagnosisEngine";
import { clinicalPresets } from "@/lib/diagnosis-engine/presets";
import { getRegionOption } from "@/lib/region";
import { FindingInput } from "./finding-input";
import { DifferentialCard } from "./differential-card";

type Findings = Pick<DiagnosticInputState, FindingDomain>;

const EMPTY: Findings = { symptoms: [], examFindings: [], labInvestigations: [], imagingFindings: [] };

const VECTORS: Array<{ domain: FindingDomain; label: string; hint: string; icon: typeof Stethoscope; examples: string[] }> = [
  { domain: "symptoms", label: "Symptoms", hint: "e.g. Pleuritic chest pain", icon: Thermometer, examples: ["Pleuritic chest pain", "Sudden onset dyspnoea", "Fever", "Right iliac fossa pain", "Thunderclap headache"] },
  { domain: "examFindings", label: "Examination findings", hint: "e.g. Tachycardia", icon: Stethoscope, examples: ["Tachycardia", "Unilateral reduced breath sounds", "Hypotension", "Neck stiffness", "Bibasal crackles"] },
  { domain: "labInvestigations", label: "Laboratory & investigations", hint: "e.g. Elevated D-dimer", icon: FlaskConical, examples: ["Elevated D-dimer", "Leukocytosis", "Raised troponin", "Raised lactate", "ST elevation on ECG"] },
  { domain: "imagingFindings", label: "Imaging findings", hint: "e.g. Wedge-shaped opacity", icon: ScanLine, examples: ["Wedge-shaped opacity", "Normal chest X-ray", "Consolidation", "Widened mediastinum", "Free fluid"] },
];

export function DiagnosisWorkbench({ region }: { region: CountryCode }) {
  const [findings, setFindings] = useState<Findings>(EMPTY);
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<DiagnosticInputState["gender"]>("all");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosticEngineResponse | null>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const total = Object.values(findings).reduce((sum, list) => sum + list.length, 0);
  const regionOption = getRegionOption(region);

  const update = (domain: FindingDomain, values: string[]) => {
    setFindings((current) => ({ ...current, [domain]: values }));
    setActivePreset(null);
  };

  const loadPreset = (id: string) => {
    const preset = clinicalPresets.find((item) => item.id === id);
    if (!preset) return;
    const { age: presetAge, gender: presetGender, ...presetFindings } = preset.input;
    setFindings({ ...EMPTY, ...presetFindings });
    setAge(presetAge ? String(presetAge) : "");
    setGender(presetGender ?? "all");
    setActivePreset(id);
    setResult(null);
    setError(null);
  };

  const reset = () => {
    setFindings(EMPTY);
    setAge("");
    setGender("all");
    setActivePreset(null);
    setResult(null);
    setError(null);
  };

  const generate = async () => {
    if (!total || loading) return;
    setLoading(true);
    setError(null);
    const parsedAge = Number.parseInt(age, 10);
    const payload: DiagnosticInputState = { ...findings, region, gender, ...(Number.isFinite(parsedAge) ? { age: parsedAge } : {}) };
    try {
      const response = await fetch("/api/diagnosis-engine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = (await response.json()) as DiagnosticEngineResponse | DiagnosticEngineError;
      if (!response.ok || !("topDifferentials" in body)) {
        setResult(null);
        setError("error" in body ? body.error : "The diagnosis engine could not process this request.");
        return;
      }
      setResult(body);
      requestAnimationFrame(() => resultsRef.current?.focus({ preventScroll: false }));
    } catch {
      setError("The diagnosis engine could not be reached. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const criticalCount = result?.topDifferentials.filter((item) => item.urgencyLevel === "CRITICAL_MUST_NOT_MISS").length ?? 0;

  return (
    <div className="dx-workbench">
      <section className="dx-panel dx-inputs" aria-labelledby="dx-inputs-title">
        <header className="dx-panel-head">
          <div>
            <p className="dx-kicker">Step 1</p>
            <h2 id="dx-inputs-title" className="dx-heading">Clinical findings</h2>
          </div>
          {total ? <button type="button" className="dx-ghost-button" onClick={reset}><RotateCcw size={14} strokeWidth={2} aria-hidden="true" />Clear</button> : null}
        </header>

        <div className="dx-presets" role="group" aria-label="Quick-preset clinical scenarios">
          <p className="dx-presets-label"><Sparkles size={14} strokeWidth={2} aria-hidden="true" />Test scenarios <span>(fictional)</span></p>
          <div className="dx-preset-list">
            {clinicalPresets.map((preset, index) => (
              <button type="button" key={preset.id} className="dx-preset" aria-pressed={activePreset === preset.id} onClick={() => loadPreset(preset.id)} title={preset.summary}>
                <span className="dx-preset-index">{index + 1}</span>{preset.label}
              </button>
            ))}
          </div>
          {activePreset ? <p className="dx-preset-summary">{clinicalPresets.find((item) => item.id === activePreset)?.summary}</p> : null}
        </div>

        <div className="dx-context">
          <label>
            <span>Age</span>
            <input type="number" inputMode="numeric" min={0} max={120} value={age} onChange={(event) => { setAge(event.target.value); setActivePreset(null); }} placeholder="Years" />
          </label>
          <label>
            <span>Sex</span>
            <select value={gender} onChange={(event) => { setGender(event.target.value as DiagnosticInputState["gender"]); setActivePreset(null); }}>
              <option value="all">Not specified</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </label>
          <p className="dx-region" title="Change the region with the country toggle">
            <span>Region</span>
            <strong><span aria-hidden="true">{regionOption.flag}</span> {regionOption.name}</strong>
          </p>
        </div>

        {VECTORS.map((vector) => (
          <FindingInput key={vector.domain} label={vector.label} hint={vector.hint} icon={vector.icon} examples={vector.examples} values={findings[vector.domain]} onChange={(values) => update(vector.domain, values)} />
        ))}

        <div className="dx-actions">
          <button type="button" className="dx-primary-button" onClick={generate} disabled={!total || loading} aria-busy={loading}>
            {loading ? <Loader2 size={17} strokeWidth={2.2} className="dx-spin" aria-hidden="true" /> : <Activity size={17} strokeWidth={2.2} aria-hidden="true" />}
            {loading ? "Analysing findings…" : "Generate Differentials"}
          </button>
          <p className="dx-actions-note">{total ? `${total} finding${total === 1 ? "" : "s"} entered` : "Add at least one finding"} · no patient identifiers</p>
        </div>
      </section>

      <section className="dx-panel dx-results" aria-labelledby="dx-results-title" aria-live="polite" aria-busy={loading} tabIndex={-1} ref={resultsRef}>
        <header className="dx-panel-head">
          <div>
            <p className="dx-kicker">Step 2</p>
            <h2 id="dx-results-title" className="dx-heading">Ranked differentials</h2>
          </div>
          {result ? <span className="dx-result-count">{result.topDifferentials.length} conditions{criticalCount ? ` · ${criticalCount} must-not-miss` : ""}</span> : null}
        </header>

        {error ? <p className="dx-error" role="alert"><ShieldAlert size={16} strokeWidth={2} aria-hidden="true" />{error}</p> : null}

        {loading && !result ? (
          <div className="dx-skeletons" aria-hidden="true">{[0, 1, 2].map((key) => <div className="dx-skeleton" key={key} />)}</div>
        ) : null}

        {!result && !loading && !error ? (
          <div className="dx-empty">
            <span className="dx-empty-icon" aria-hidden="true"><Stethoscope size={26} strokeWidth={1.6} /></span>
            <h3>No differentials yet</h3>
            <p>Enter findings across the four vectors, or load a test scenario, then select <strong>Generate Differentials</strong>.</p>
            <ol>
              <li>Life-threatening conditions are kept on the list and highlighted in gold.</li>
              <li>Each card shows matched evidence, missing features and the next tests.</li>
              <li>Open the Marifa pathway to manage the condition.</li>
            </ol>
          </div>
        ) : null}

        {result ? (
          <>
            <ol className="dx-card-list">
              {result.topDifferentials.map((match, index) => (
                <li key={match.diseaseId + match.diseaseTitle}><DifferentialCard match={match} rank={index + 1} defaultOpen={index === 0} /></li>
              ))}
            </ol>
            <p className="dx-safety" role="note"><ShieldAlert size={15} strokeWidth={2} aria-hidden="true" />{result.clinicalSafetyNotice}</p>
          </>
        ) : null}
      </section>
    </div>
  );
}
