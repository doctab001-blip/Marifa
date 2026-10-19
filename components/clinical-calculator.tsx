"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Printer, RotateCcw } from "@/components/icons-3d";
import {
  calculateScore,
  clinicalCalculators,
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

type GuideTab = "when" | "pearls" | "why";
type LowerTab = "next" | "evidence" | "creator";

export function ClinicalCalculator({ schema }: { schema: ClinicalCalculatorSchema }) {
  const [calculatorState, setCalculatorState] = useState<{ schemaId: string; answers: CalculatorAnswers }>({ schemaId: schema.id, answers: {} });
  const [guide, setGuide] = useState<GuideTab>("when");
  const [lower, setLower] = useState<LowerTab>("next");
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
  const pitfalls = schema.pitfalls ?? schema.evidence.limitations;
  const showWhy = Boolean(schema.whyUseIt) && schema.whyUseIt !== schema.indication;
  const lowerTabs: Array<[LowerTab, string]> = [["next", "Next steps"], ["evidence", "Evidence"], ...(schema.creator ? [["creator", "About the creator"] as [LowerTab, string]] : [])];

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
        <p className="eyebrow">{schema.specialty}{schema.isNew && <span className="calculator-new-badge">New</span>}</p>
        <h2 id={`${schema.id}-title`}>{schema.title}</h2>
        <p>{schema.objective}</p>
        <div className="calculator-tabs" role="tablist" aria-label="About this calculator">
          <TabButton id={`${schema.id}-guide-when`} selected={guide === "when"} panel={`${schema.id}-guide`} onClick={() => setGuide("when")}>When to use</TabButton>
          <TabButton id={`${schema.id}-guide-pearls`} selected={guide === "pearls"} panel={`${schema.id}-guide`} onClick={() => setGuide("pearls")}>Pearls and pitfalls</TabButton>
          {showWhy && <TabButton id={`${schema.id}-guide-why`} selected={guide === "why"} panel={`${schema.id}-guide`} onClick={() => setGuide("why")}>Why use</TabButton>}
        </div>
        <div id={`${schema.id}-guide`} role="tabpanel" aria-labelledby={`${schema.id}-guide-${guide}`} className="calculator-guide-panel">
          {guide === "when" && <p>{schema.indication}</p>}
          {guide === "pearls" && (
            <div className="calculator-pearls">
              {schema.pearls.length > 0 && <section><h3>Pearls</h3><ul>{schema.pearls.map((item) => <li key={item}>{item}</li>)}</ul></section>}
              {pitfalls.length > 0 && <section><h3>Pitfalls</h3><ul>{pitfalls.map((item) => <li key={item}>{item}</li>)}</ul></section>}
            </div>
          )}
          {guide === "why" && showWhy && <p>{schema.whyUseIt}</p>}
        </div>
      </header>

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
                <strong>Suggested action</strong>
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

      <section className="calculator-lower card" aria-label="Next steps, evidence and creator">
        <div className="calculator-tabs calculator-tabs-lower" role="tablist" aria-label="Details">
          {lowerTabs.map(([key, label]) => <TabButton key={key} id={`${schema.id}-lower-${key}`} selected={lower === key} panel={`${schema.id}-lower`} onClick={() => setLower(key)}>{label}</TabButton>)}
        </div>
        <div id={`${schema.id}-lower`} role="tabpanel" aria-labelledby={`${schema.id}-lower-${lower}`} className="calculator-lower-panel">
          {lower === "next" && <NextStepsPanel schema={schema} active={result} />}
          {lower === "evidence" && <EvidencePanel schema={schema} active={result} />}
          {lower === "creator" && schema.creator && <CreatorPanel schema={schema} />}
        </div>
      </section>

      <RelatedCalculators ids={schema.related ?? []} />
    </section>
  );
}

function TabButton({ id, selected, panel, onClick, children }: { id: string; selected: boolean; panel: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" role="tab" id={id} aria-selected={selected} aria-controls={panel} onClick={onClick}>{children}</button>;
}

function NextStepsPanel({ schema, active }: { schema: ClinicalCalculatorSchema; active?: LegacyResult }) {
  const steps = schema.nextSteps;
  if (!steps) {
    return active
      ? <ul className="calculator-plain-list">{active.management.map((step) => <li key={step}>{step}</li>)}</ul>
      : <p className="calculator-muted">Complete the calculator to see suggested next steps.</p>;
  }
  return (
    <div className="calculator-steps">
      {steps.advice.length > 0 && <section><h3>Advice</h3><ul>{steps.advice.map((item) => <li key={item}>{item}</li>)}</ul></section>}
      {steps.management.length > 0 && (
        <section>
          <h3>Management</h3>
          {steps.management.map((group) => <div key={group.title} className="calculator-steps-group"><h4>{group.title}</h4><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></div>)}
        </section>
      )}
      {steps.critical.length > 0 && <section className="calculator-critical"><h3>Critical actions</h3><ul>{steps.critical.map((item) => <li key={item}>{item}</li>)}</ul></section>}
    </div>
  );
}

function CreatorPanel({ schema }: { schema: ClinicalCalculatorSchema }) {
  const creator = schema.creator!;
  return (
    <div className="calculator-creator">
      <h3>{creator.name}</h3>
      {creator.bio.map((line) => <p key={line}>{line}</p>)}
    </div>
  );
}

function RelatedCalculators({ ids }: { ids: string[] }) {
  const items = ids.map((id) => clinicalCalculators.find((item) => item.id === id)).filter((item): item is ClinicalCalculatorSchema => Boolean(item));
  if (items.length === 0) return null;
  return (
    <section className="calculator-related" aria-label="Related calculators">
      <h3>Related calculators</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id} className="card">
            <Link href={`/dashboard/medical-calculators?calc=${encodeURIComponent(item.id)}`} scroll={false}>
              <span className="calculator-card-meta">{item.specialty}</span>
              <strong>{item.title}</strong>
              <span className="calculator-card-copy">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
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
  const pitfalls = schema.pitfalls ?? schema.evidence.limitations;
  return (
    <div className="calculator-evidence-stack">
      <section>
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
        {formula.length === 0 && scoringRows.length === 0 && <p className="calculator-muted">This calculator uses measured values; see the pearls and references for the method.</p>}
      </section>

      <section>
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
        <section>
          <h3>Facts and figures</h3>
          <dl className="calculator-facts">{schema.facts!.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
        </section>
      )}

      {(schema.evidenceAppraisal?.length ?? 0) > 0 && (
        <section>
          <h3>Evidence appraisal</h3>
          {schema.evidenceAppraisal!.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
      )}

      {pitfalls.length > 0 && (
        <section>
          <h3>Limitations</h3>
          <ul>{pitfalls.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      )}

      <section className="calculator-sources">
        <h3>Literature</h3>
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
