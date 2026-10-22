"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ClipboardCopy, FlaskConical, Loader2, Printer, RefreshCw, RotateCcw, ScanLine, ShieldAlert, Sparkles, Stethoscope, Thermometer, Wand2 } from "lucide-react";
import type { CountryCode } from "@/types/clinical";
import type { DiagnosticEngineError, DiagnosticEngineResponse, DiagnosticInputState, DiscriminatingFinding, FindingDomain, VocabularyTerm } from "@/types/diagnosisEngine";
import { clinicalPresets } from "@/lib/diagnosis-engine/presets";
import { getRegionOption } from "@/lib/region";
import { FindingInput } from "./finding-input";
import { DifferentialCard } from "./differential-card";
import { DiscriminatorsPanel } from "./discriminators-panel";
import { ComparePanel } from "./compare-panel";
import { EMPTY_VITALS, VitalsPanel, vitalsCount, vitalsToFindings, type Vitals } from "./vitals-panel";
import { summaryText } from "./summary";

type Findings = Pick<DiagnosticInputState, FindingDomain>;

const EMPTY: Findings = { symptoms: [], examFindings: [], labInvestigations: [], imagingFindings: [] };
const KIND_DOMAIN: Record<VocabularyTerm["kind"], FindingDomain> = { symptom: "symptoms", exam: "examFindings", lab: "labInvestigations", imaging: "imagingFindings" };

const VECTORS: Array<{ domain: FindingDomain; kind: VocabularyTerm["kind"]; label: string; hint: string; icon: typeof Stethoscope; examples: string[] }> = [
  { domain: "symptoms", kind: "symptom", label: "Symptoms", hint: "Start typing, e.g. pleuritic chest pain", icon: Thermometer, examples: ["Pleuritic chest pain", "Sudden onset dyspnoea", "Fever", "Right iliac fossa pain", "Thunderclap headache"] },
  { domain: "examFindings", kind: "exam", label: "Examination findings", hint: "e.g. unilateral reduced breath sounds", icon: Stethoscope, examples: ["Unilateral reduced breath sounds", "Neck stiffness", "Bibasal crackles", "Right iliac fossa tenderness"] },
  { domain: "labInvestigations", kind: "lab", label: "Laboratory & investigations", hint: "e.g. raised D-dimer, K 6.9, lactate 4.2", icon: FlaskConical, examples: ["Elevated D-dimer", "Leukocytosis", "Raised troponin", "ST elevation on ECG"] },
  { domain: "imagingFindings", kind: "imaging", label: "Imaging findings", hint: "e.g. wedge-shaped opacity", icon: ScanLine, examples: ["Wedge-shaped opacity", "Normal chest X-ray", "Consolidation", "Widened mediastinum"] },
];

export function DiagnosisWorkbench({ region }: { region: CountryCode }) {
  const [findings, setFindings] = useState<Findings>(EMPTY);
  const [vitals, setVitals] = useState<Vitals>(EMPTY_VITALS);
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<DiagnosticInputState["gender"]>("all");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosticEngineResponse | null>(null);
  const [submitted, setSubmitted] = useState<DiagnosticInputState | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyTerm[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [answered, setAnswered] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const resultsRef = useRef<HTMLElement>(null);
  const regionOption = getRegionOption(region);

  // Type-ahead vocabulary (reference data only). The inputs still work as free text if it fails to load.
  useEffect(() => {
    let active = true;
    fetch("/api/diagnosis-engine")
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { terms?: VocabularyTerm[] } | null) => { if (active && body?.terms) setVocabulary(body.terms); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const payload = useMemo((): DiagnosticInputState => {
    const fromVitals = vitalsToFindings(vitals);
    const parsedAge = Number.parseInt(age, 10);
    return {
      symptoms: findings.symptoms,
      examFindings: [...fromVitals.examFindings, ...findings.examFindings],
      labInvestigations: [...fromVitals.labInvestigations, ...findings.labInvestigations],
      imagingFindings: findings.imagingFindings,
      region,
      gender,
      ...(Number.isFinite(parsedAge) ? { age: parsedAge } : {}),
    };
  }, [findings, vitals, age, gender, region]);

  const total = Object.values(findings).reduce((sum, list) => sum + list.length, 0) + vitalsCount(vitals);
  const stale = Boolean(result && submitted && JSON.stringify(submitted) !== JSON.stringify(payload));

  const touch = () => setActivePreset(null);
  const update = (domain: FindingDomain, values: string[]) => { setFindings((current) => ({ ...current, [domain]: values })); touch(); };

  const loadPreset = (id: string) => {
    const preset = clinicalPresets.find((item) => item.id === id);
    if (!preset) return;
    const { age: presetAge, gender: presetGender, ...presetFindings } = preset.input;
    setFindings({ ...EMPTY, ...presetFindings });
    setVitals({ ...EMPTY_VITALS, ...preset.vitals });
    setAge(presetAge ? String(presetAge) : "");
    setGender(presetGender ?? "all");
    setActivePreset(id);
    setResult(null);
    setSubmitted(null);
    setError(null);
  };

  const reset = () => {
    setFindings(EMPTY);
    setVitals(EMPTY_VITALS);
    setAge("");
    setGender("all");
    setActivePreset(null);
    setResult(null);
    setSubmitted(null);
    setError(null);
  };

  const generate = async () => {
    if (!total || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/diagnosis-engine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = (await response.json()) as DiagnosticEngineResponse | DiagnosticEngineError;
      if (!response.ok || !("topDifferentials" in body)) {
        setResult(null);
        setError("error" in body ? body.error : "The diagnosis engine could not process this request.");
        return;
      }
      setResult(body);
      setSubmitted(payload);
      setCompare([]);
      setAnswered(new Set());
      setCopied("idle");
      requestAnimationFrame(() => resultsRef.current?.focus({ preventScroll: false }));
    } catch {
      setError("The diagnosis engine could not be reached. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const answer = (item: DiscriminatingFinding, present: boolean) => {
    const domain = KIND_DOMAIN[item.kind];
    const text = present ? item.finding : `No ${item.finding.charAt(0).toLowerCase()}${item.finding.slice(1)}`;
    setFindings((current) => (current[domain].some((value) => value.toLowerCase() === text.toLowerCase()) ? current : { ...current, [domain]: [...current[domain], text] }));
    setAnswered((current) => new Set(current).add(item.finding));
    touch();
  };

  const toggleCompare = (title: string) => setCompare((current) => (current.includes(title) ? current.filter((item) => item !== title) : current.length >= 2 ? current : [...current, title]));

  const copySummary = async () => {
    if (!result || !submitted) return;
    try {
      await navigator.clipboard.writeText(summaryText(submitted, result, window.location.origin));
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    window.setTimeout(() => setCopied("idle"), 2500);
  };

  const criticalCount = result?.topDifferentials.filter((item) => item.urgencyLevel === "CRITICAL_MUST_NOT_MISS").length ?? 0;
  const comparePair = result ? (compare.map((title) => result.topDifferentials.find((item) => item.diseaseTitle === title)).filter(Boolean) as DiagnosticEngineResponse["topDifferentials"]) : [];

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
            <input type="number" inputMode="numeric" min={0} max={120} value={age} onChange={(event) => { setAge(event.target.value); touch(); }} placeholder="Years" />
          </label>
          <label>
            <span>Sex</span>
            <select value={gender} onChange={(event) => { setGender(event.target.value as DiagnosticInputState["gender"]); touch(); }}>
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
        <p className="dx-context-help">Age and region adjust the ranking (for example, bronchiolitis is only considered under 2, malaria is weighted higher in India).</p>

        <VitalsPanel vitals={vitals} onChange={(next) => { setVitals(next); touch(); }} />

        {VECTORS.map((vector) => (
          <FindingInput key={vector.domain} label={vector.label} hint={vector.hint} icon={vector.icon} examples={vector.examples} values={findings[vector.domain]} onChange={(values) => update(vector.domain, values)} vocabulary={vocabulary} preferredKind={vector.kind} />
        ))}

        <div className="dx-actions">
          <button type="button" className="dx-primary-button" onClick={generate} disabled={!total || loading} aria-busy={loading}>
            {loading ? <Loader2 size={17} strokeWidth={2.2} className="dx-spin" aria-hidden="true" /> : <Activity size={17} strokeWidth={2.2} aria-hidden="true" />}
            {loading ? "Analysing findings…" : result ? "Regenerate Differentials" : "Generate Differentials"}
          </button>
          <p className="dx-actions-note">{total ? `${total} finding${total === 1 ? "" : "s"} entered` : "Add at least one finding"} · no patient identifiers</p>
        </div>
      </section>

      <section className="dx-panel dx-results" aria-labelledby="dx-results-title" aria-busy={loading} tabIndex={-1} ref={resultsRef}>
        <header className="dx-panel-head">
          <div>
            <p className="dx-kicker">Step 2</p>
            <h2 id="dx-results-title" className="dx-heading">Ranked differentials</h2>
          </div>
          {result ? (
            <div className="dx-result-actions dx-no-print">
              <span className="dx-result-count">{result.topDifferentials.length} conditions{criticalCount ? ` · ${criticalCount} must-not-miss` : ""}</span>
              <button type="button" className="dx-ghost-button" onClick={copySummary} aria-live="polite"><ClipboardCopy size={14} strokeWidth={2} aria-hidden="true" />{copied === "done" ? "Copied" : copied === "failed" ? "Copy failed" : "Copy summary"}</button>
              <button type="button" className="dx-ghost-button" onClick={() => window.print()}><Printer size={14} strokeWidth={2} aria-hidden="true" />Print</button>
            </div>
          ) : null}
        </header>

        <div aria-live="polite">
          {error ? <p className="dx-error" role="alert"><ShieldAlert size={16} strokeWidth={2} aria-hidden="true" />{error}</p> : null}
          {stale ? (
            <p className="dx-stale dx-no-print" role="status">
              <RefreshCw size={15} strokeWidth={2} aria-hidden="true" />Findings have changed since this ranking.
              <button type="button" onClick={generate} disabled={loading}>Regenerate</button>
            </p>
          ) : null}
        </div>

        {loading && !result ? (
          <div className="dx-skeletons" aria-hidden="true">{[0, 1, 2].map((key) => <div className="dx-skeleton" key={key} />)}</div>
        ) : null}

        {!result && !loading && !error ? (
          <div className="dx-empty">
            <span className="dx-empty-icon" aria-hidden="true"><Stethoscope size={26} strokeWidth={1.6} /></span>
            <h3>No differentials yet</h3>
            <p>Enter findings and vital signs, or load a test scenario, then select <strong>Generate Differentials</strong>.</p>
            <ol>
              <li>Life-threatening conditions are kept on the list and highlighted in gold.</li>
              <li>Typed values such as HR 124, SpO₂ 88% or K 6.9 are read as findings.</li>
              <li>Each card shows the evidence, missing features, next tests and the Marifa pathway.</li>
            </ol>
          </div>
        ) : null}

        {result ? (
          <div className={stale ? "dx-results-body is-stale" : "dx-results-body"}>
            <div className="dx-print-only dx-print-header">
              <strong>Marifa Diagnosis Engine</strong> · {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(result.timestamp))} · decision support only
              {submitted ? <p>{[submitted.age !== undefined ? `Age ${submitted.age}` : "", submitted.gender && submitted.gender !== "all" ? submitted.gender : "", ...submitted.symptoms, ...submitted.examFindings, ...submitted.labInvestigations, ...submitted.imagingFindings].filter(Boolean).join(" · ")}</p> : null}
            </div>

            {result.inputInterpretation?.length ? (
              <div className="dx-interpretation">
                <p className="dx-interpretation-title"><Wand2 size={14} strokeWidth={2} aria-hidden="true" />Read from values</p>
                <ul>
                  {result.inputInterpretation.map((item) => (
                    <li key={item.original}><span>{item.original}</span><span aria-hidden="true">→</span><span className="dx-sr-only"> read as </span><strong>{item.interpretedAs.join(", ")}</strong></li>
                  ))}
                </ul>
              </div>
            ) : null}

            <ol className="dx-card-list">
              {result.topDifferentials.map((match, index) => (
                <li key={match.diseaseId + match.diseaseTitle}>
                  <DifferentialCard
                    match={match}
                    rank={index + 1}
                    defaultOpen={index === 0}
                    compareSelected={compare.includes(match.diseaseTitle)}
                    compareDisabled={compare.length >= 2}
                    onToggleCompare={() => toggleCompare(match.diseaseTitle)}
                  />
                </li>
              ))}
            </ol>

            {comparePair.length === 2 ? (
              <ComparePanel pair={[comparePair[0], comparePair[1]]} discriminators={result.discriminatingFindings ?? []} onClose={() => setCompare([])} />
            ) : compare.length === 1 ? (
              <p className="dx-compare-hint dx-no-print">Select one more condition to compare side by side.</p>
            ) : null}

            <DiscriminatorsPanel items={result.discriminatingFindings ?? []} onAnswer={answer} answered={answered} />

            <p className="dx-safety" role="note"><ShieldAlert size={15} strokeWidth={2} aria-hidden="true" />{result.clinicalSafetyNotice}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
