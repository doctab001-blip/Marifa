"use client";

import { useState } from "react";
import { Check, CircleAlert, Printer, RotateCcw } from "@/components/icons-3d";
import {
  calculateScore,
  fromCanonicalValue,
  getCalculatorResult,
  getSecondaryResults,
  isCalculatorComplete,
  isQuestionComplete,
  toCanonicalValue,
  type CalculatorAnswers,
  type CalculatorQuestion,
  type ClinicalCalculatorSchema,
  type LegacyResult,
  type NumericAnswer,
} from "@/lib/clinical-calculators";

type Tab = "calculator" | "evidence";

export function ClinicalCalculator({ schema }: { schema: ClinicalCalculatorSchema }) {
  const [calculatorState, setCalculatorState] = useState<{ schemaId: string; answers: CalculatorAnswers }>({ schemaId: schema.id, answers: {} });
  const [tab, setTab] = useState<Tab>("calculator");
  const [copied, setCopied] = useState(false);
  const answers = calculatorState.schemaId === schema.id ? calculatorState.answers : {};

  const score = calculateScore(schema, answers);
  const requiredQuestions = schema.questions.filter((question) => question.required !== false);
  const completedCount = requiredQuestions.filter((question) => isQuestionComplete(question, answers[question.id])).length;
  const isComplete = isCalculatorComplete(schema, answers);
  const result = isComplete ? getCalculatorResult(schema, score, answers) : undefined;
  const secondary = isComplete ? getSecondaryResults(schema, answers) : [];
  // Point-based scores update live like MDCalc; measured values (labs, vitals) show a dash until every input is in.
  const showScore = !schema.unit || isComplete;

  function updateAnswer(questionId: string, value: CalculatorAnswers[string]) {
    setCalculatorState((current) => ({ schemaId: schema.id, answers: { ...(current.schemaId === schema.id ? current.answers : {}), [questionId]: value } }));
  }
  function reset() {
    setCalculatorState({ schemaId: schema.id, answers: {} });
    setCopied(false);
  }
  async function copyResult() {
    if (!result) return;
    const lines = [`${schema.title}: ${formatScore(score)}${schema.unit ? ` ${schema.unit}` : ""}`, result.label, result.summary, ...secondary.map((row) => `${row.label}: ${row.value}`)];
    try { await navigator.clipboard.writeText(lines.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); }
  }

  return (
    <section className="clinical-calculator" aria-labelledby={`${schema.id}-title`}>
      <header className="calculator-heading card">
        <div>
          <p className="eyebrow">{schema.specialty}{schema.isNew && <span className="calculator-new-badge">New</span>}</p>
          <h2 id={`${schema.id}-title`}>{schema.title}</h2>
          <p>{schema.objective}</p>
        </div>
        <div className="calculator-tabs" role="tablist" aria-label={`${schema.shortTitle} sections`}>
          <button type="button" role="tab" id={`${schema.id}-tab-calculator`} aria-selected={tab === "calculator"} aria-controls={`${schema.id}-panel`} onClick={() => setTab("calculator")}>Calculator</button>
          <button type="button" role="tab" id={`${schema.id}-tab-evidence`} aria-selected={tab === "evidence"} aria-controls={`${schema.id}-panel`} onClick={() => setTab("evidence")}>Evidence</button>
        </div>
      </header>

      <div id={`${schema.id}-panel`} role="tabpanel" aria-labelledby={`${schema.id}-tab-${tab}`} className="calculator-panel">
        {tab === "calculator" ? (
          <>
            <div className="calculator-guidance">
              <GuidanceBlock title="When to use" icon>{schema.indication}</GuidanceBlock>
              {schema.pearls.length > 0 && <GuidanceBlock title="Pearls">{<ul>{schema.pearls.map((item) => <li key={item}>{item}</li>)}</ul>}</GuidanceBlock>}
              {(schema.pitfalls ?? schema.evidence.limitations).length > 0 && <GuidanceBlock title="Pitfalls">{<ul>{(schema.pitfalls ?? schema.evidence.limitations).map((item) => <li key={item}>{item}</li>)}</ul>}</GuidanceBlock>}
            </div>

            <div className="calculator-layout">
              <div className="calculator-questions">
                {schema.questions.map((question, index) => (
                  <QuestionField key={question.id} index={index + 1} question={question} answer={answers[question.id]} onChange={(value) => updateAnswer(question.id, value)} />
                ))}
              </div>

              <aside className="calculator-result card" aria-live="polite" aria-atomic="true">
                <div className="calculator-result-top">
                  <span>Result</span>
                  <span className="calculator-result-actions">
                    <button type="button" onClick={reset} disabled={Object.keys(answers).length === 0}><RotateCcw size={14} aria-hidden="true" /> Reset</button>
                  </span>
                </div>
                <div className="calculator-score">{showScore ? formatScore(score) : "—"}<small>{schema.unit ?? "points"}</small></div>
                <div className="calculator-completion" aria-label={`${completedCount} of ${requiredQuestions.length} questions complete`}>
                  <span style={{ width: `${requiredQuestions.length ? (completedCount / requiredQuestions.length) * 100 : 0}%` }} />
                </div>
                <p className="calculator-progress-copy">{completedCount} of {requiredQuestions.length} sections complete</p>

                {result ? (
                  <div className={`calculator-stratification calculator-tone-${result.tone}`}>
                    <span className="calculator-risk-label">{result.label}</span>
                    <p>{result.summary}</p>
                    {secondary.length > 0 && (
                      <dl className="calculator-secondary">
                        {secondary.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}{row.note && <small>{row.note}</small>}</dd></div>)}
                      </dl>
                    )}
                    <div className="calculator-next-steps">
                      <strong>Next steps</strong>
                      <ul>{result.management.map((step) => <li key={step}>{step}</li>)}</ul>
                    </div>
                    <div className="calculator-share">
                      <button type="button" onClick={copyResult}>{copied ? <><Check size={14} aria-hidden="true" /> Copied</> : "Copy result"}</button>
                      <button type="button" onClick={() => window.print()}><Printer size={14} aria-hidden="true" /> Print</button>
                    </div>
                  </div>
                ) : (
                  <div className="calculator-incomplete">
                    <strong>Complete all sections</strong>
                    <p>Risk classification and next steps appear only after every required input is confirmed.</p>
                  </div>
                )}
                <p className="calculator-safety-note">Decision support only. It does not replace clinical judgement; confirm against the full clinical context.</p>
              </aside>
            </div>
          </>
        ) : (
          <EvidencePanel schema={schema} active={result} />
        )}
      </div>
    </section>
  );
}

function GuidanceBlock({ title, icon, children }: { title: string; icon?: boolean; children: React.ReactNode }) {
  return (
    <details className="calculator-guidance-block" open={title === "When to use"}>
      <summary>{icon && <CircleAlert size={16} aria-hidden="true" />}<strong>{title}</strong></summary>
      <div>{children}</div>
    </details>
  );
}

function EvidencePanel({ schema, active }: { schema: ClinicalCalculatorSchema; active?: LegacyResult }) {
  // Binary questions show only the scoring answer (the 0-point "No" is implied); choice questions list every answer.
  const scoringRows = schema.questions.flatMap((question) => {
    if (question.type === "number") return [];
    const options = question.options ?? [];
    if (!options.some((option) => option.points !== 0)) return [];
    const shown = options.length === 2 ? options.filter((option) => option.points !== 0) : options;
    return shown.map((option, index) => ({ key: `${question.id}-${option.value}`, label: question.label, option, first: index === 0, span: shown.length }));
  });
  const formula = schema.formula ?? [];
  return (
    <div className="calculator-evidence-stack">
      <section className="card calculator-evidence-card">
        <h3>Formula</h3>
        {formula.length > 0 && <ul>{formula.map((line) => <li key={line}>{line}</li>)}</ul>}
        {scoringRows.length > 0 && (
          <div className="calculator-table-wrap">
            <table className="calculator-table">
              <caption className="sr-only">Scoring points for each answer</caption>
              <thead><tr><th scope="col">Criterion</th><th scope="col">Answer</th><th scope="col">Points</th></tr></thead>
              <tbody>
                {scoringRows.map((row) => (
                  <tr key={row.key}>{row.first ? <th scope="row" rowSpan={row.span}>{row.label}</th> : null}<td>{row.option.label}</td><td>{formatPoints(row.option.points)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {formula.length === 0 && scoringRows.length === 0 && <p>This calculator uses measured values; see the pearls and references for the method.</p>}
      </section>

      <section className="card calculator-evidence-card">
        <h3>Interpretation</h3>
        <div className="calculator-table-wrap">
          <table className="calculator-table">
            <caption className="sr-only">Result categories and recommended action</caption>
            <thead><tr><th scope="col">Result</th><th scope="col">Category</th><th scope="col">Suggested action</th></tr></thead>
            <tbody>
              {schema.results.map((result) => (
                <tr key={result.id} className={`calculator-row-${result.tone}${active?.id === result.id ? " is-current" : ""}`}>
                  <th scope="row">{result.range ?? rangeText(result)}</th>
                  <td><strong>{result.label}</strong><small>{result.summary}</small></td>
                  <td><ul>{result.management.map((step) => <li key={step}>{step}</li>)}</ul></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {(schema.facts?.length ?? 0) > 0 && (
        <section className="card calculator-evidence-card">
          <h3>Facts and figures</h3>
          <dl className="calculator-facts">{schema.facts!.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
        </section>
      )}

      {(schema.pitfalls ?? schema.evidence.limitations).length > 0 && (
        <section className="card calculator-evidence-card">
          <h3>Limitations</h3>
          <ul>{(schema.pitfalls ?? schema.evidence.limitations).map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      )}

      <section className="card calculator-evidence-card calculator-sources">
        <h3>References</h3>
        <ol>{schema.evidence.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ol>
        {schema.lastReviewed && <p className="calculator-reviewed">Reviewed {schema.lastReviewed}</p>}
      </section>
    </div>
  );
}

function rangeText(result: LegacyResult) {
  const { minScore, maxScore } = result.match;
  if (minScore === undefined && maxScore === undefined) return "Any";
  if (minScore === undefined) return `≤${Math.floor(maxScore!)}`;
  if (maxScore === undefined) return `≥${minScore}`;
  return minScore === Math.floor(maxScore) ? `${minScore}` : `${minScore}–${Math.floor(maxScore)}`;
}

function QuestionField({ question, answer, index, onChange }: {
  question: CalculatorQuestion;
  answer: CalculatorAnswers[string];
  index: number;
  onChange: (answer: CalculatorAnswers[string]) => void;
}) {
  return (
    <fieldset className="calculator-question card">
      <legend><span>{index}</span><span>{question.label}{question.required === false && <em className="calculator-optional"> optional</em>}{question.help && <small>{question.help}</small>}</span></legend>
      {question.type === "single-select" && (
        <div className="calculator-option-grid">
          {(question.options ?? []).map((option) => {
            const selected = answer === option.value;
            return <button key={option.value} type="button" className={selected ? "is-selected" : ""} aria-pressed={selected} onClick={() => onChange(option.value)}><span className="calculator-choice-marker">{selected && <Check size={16} />}</span><span><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span><em>{formatPoints(option.points)}</em></button>;
          })}
        </div>
      )}
      {question.type === "multi-select" && (() => {
        const values = Array.isArray(answer) ? answer : undefined;
        return (
          <div className="calculator-option-grid calculator-option-stack">
            {(question.options ?? []).map((option) => {
              const selected = values?.includes(option.value) ?? false;
              return <button key={option.value} type="button" className={selected ? "is-selected" : ""} aria-pressed={selected} onClick={() => onChange(selected ? values!.filter((value) => value !== option.value) : [...(values ?? []), option.value])}><span className="calculator-choice-marker">{selected && <Check size={16} />}</span><span><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span><em>{formatPoints(option.points)}</em></button>;
            })}
            <button type="button" className={values?.length === 0 ? "is-selected calculator-none" : "calculator-none"} aria-pressed={values?.length === 0} onClick={() => onChange([])}><span className="calculator-choice-marker">{values?.length === 0 && <Check size={16} />}</span><span><strong>{question.noneLabel ?? "None"}</strong></span><em>0</em></button>
          </div>
        );
      })()}
      {question.type === "number" && (
        <NumericField question={question} answer={typeof answer === "object" && !Array.isArray(answer) ? answer : undefined} onChange={onChange} />
      )}
    </fieldset>
  );
}

function NumericField({ question, answer, onChange }: {
  question: Extract<CalculatorQuestion, { type: "number" }>;
  answer?: NumericAnswer;
  onChange: (answer: NumericAnswer | undefined) => void;
}) {
  const units = question.units?.length ? question.units : [{ value: "default", label: "" }];
  const activeUnit = units.find(({ value }) => value === answer?.unit) ?? units[0];

  function changeUnit(unitValue: string) {
    const nextUnit = units.find(({ value }) => value === unitValue);
    if (!nextUnit) return;
    if (!answer) return onChange({ value: Number.NaN, unit: nextUnit.value });
    const canonical = toCanonicalValue(answer.value, activeUnit);
    onChange({ value: Number(fromCanonicalValue(canonical, nextUnit).toFixed(4)), unit: nextUnit.value });
  }

  return (
    <div className="calculator-number-row">
      <label>
        <span className="sr-only">{question.label}</span>
        <input
          type="number"
          inputMode="decimal"
          min={question.min}
          max={question.max}
          step={question.step ?? "any"}
          value={Number.isFinite(answer?.value) ? answer?.value : ""}
          // An emptied field keeps the chosen unit (NaN reads as incomplete) so the unit toggle does not jump back.
          onChange={(event) => onChange({ value: event.target.value === "" ? Number.NaN : event.target.valueAsNumber, unit: activeUnit.value })}
          aria-describedby={`${question.id}-unit`}
        />
      </label>
      <div className="calculator-units" id={`${question.id}-unit`} role="group" aria-label={`${question.label} unit`}>
        {units.map((unit) => units.length === 1
          ? <span key={unit.value} className="calculator-fixed-unit">{unit.label}</span>
          : <button key={unit.value} type="button" className={activeUnit.value === unit.value ? "is-active" : ""} aria-pressed={activeUnit.value === unit.value} onClick={() => changeUnit(unit.value)}>{unit.label}</button>)}
      </div>
    </div>
  );
}

function formatPoints(points: number) {
  if (points === 0) return "0";
  return points > 0 ? `+${formatScore(points)}` : `−${formatScore(Math.abs(points))}`;
}

function formatScore(score: number | string) {
  if (typeof score === "string") return score;
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}
