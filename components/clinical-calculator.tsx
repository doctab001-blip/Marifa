"use client";

import { useState } from "react";
import { Calculator, Check, ChevronDown, CircleAlert, RotateCcw } from "@/components/icons-3d";
import {
  calculateScore,
  fromCanonicalValue,
  getCalculatorResult,
  isQuestionComplete,
  toCanonicalValue,
  type CalculatorAnswers,
  type CalculatorQuestion,
  type ClinicalCalculatorSchema,
  type NumericAnswer,
} from "@/lib/clinical-calculators";

export function ClinicalCalculator({ schema }: { schema: ClinicalCalculatorSchema }) {
  const [calculatorState, setCalculatorState] = useState<{ schemaId: string; answers: CalculatorAnswers }>({ schemaId: schema.id, answers: {} });
  const answers = calculatorState.schemaId === schema.id ? calculatorState.answers : {};

  const score = calculateScore(schema, answers);
  const completedCount = schema.questions.filter((question) => isQuestionComplete(question, answers[question.id])).length;
  const isComplete = completedCount === schema.questions.length;
  const result = isComplete ? getCalculatorResult(schema, score, answers) : undefined;

  function updateAnswer(questionId: string, value: CalculatorAnswers[string]) {
    setCalculatorState((current) => ({
      schemaId: schema.id,
      answers: { ...(current.schemaId === schema.id ? current.answers : {}), [questionId]: value },
    }));
  }

  function reset() {
    setCalculatorState({ schemaId: schema.id, answers: {} });
  }

  return (
    <section className="clinical-calculator" aria-labelledby={`${schema.id}-title`}>
      <header className="calculator-heading card">
        <span className="calculator-heading-icon" aria-hidden="true"><Calculator size={23} /></span>
        <div>
          <p className="eyebrow">Clinical decision support</p>
          <h2 id={`${schema.id}-title`}>{schema.title}</h2>
          <p>{schema.objective}</p>
        </div>
      </header>

      <div className="calculator-indication" role="note">
        <CircleAlert size={18} aria-hidden="true" />
        <div><strong>When to use</strong><span>{schema.indication}</span></div>
      </div>

      <div className="calculator-layout">
        <div className="calculator-questions">
          {schema.questions.map((question, index) => (
            <QuestionField
              key={question.id}
              index={index + 1}
              question={question}
              answer={answers[question.id]}
              onChange={(value) => updateAnswer(question.id, value)}
            />
          ))}
        </div>

        <aside className="calculator-result card" aria-live="polite" aria-atomic="true">
          <div className="calculator-result-top">
            <span>{schema.scoreLabel}</span>
            <button type="button" onClick={reset} disabled={Object.keys(answers).length === 0}>
              <RotateCcw size={14} aria-hidden="true" /> Reset
            </button>
          </div>
          <div className="calculator-score">{formatScore(score)}<small>points</small></div>
          <div className="calculator-completion" aria-label={`${completedCount} of ${schema.questions.length} questions complete`}>
            <span style={{ width: `${(completedCount / schema.questions.length) * 100}%` }} />
          </div>
          <p className="calculator-progress-copy">{completedCount} of {schema.questions.length} sections complete</p>

          {result ? (
            <div className={`calculator-stratification calculator-tone-${result.tone}`}>
              <span className="calculator-risk-label">{result.label}</span>
              <p>{result.summary}</p>
              <div className="calculator-next-steps">
                <strong>Recommended next steps</strong>
                <ul>{result.management.map((step) => <li key={step}>{step}</li>)}</ul>
              </div>
            </div>
          ) : (
            <div className="calculator-incomplete">
              <strong>Complete all sections</strong>
              <p>Risk classification and next steps appear only after every required input is confirmed.</p>
            </div>
          )}
          <p className="calculator-safety-note">Decision support only. Confirm against current local policy and the full clinical context.</p>
        </aside>
      </div>

      <details className="calculator-evidence card">
        <summary><span><strong>Evidence &amp; formula</strong><small>Scoring parameters, validation and limitations</small></span><ChevronDown size={19} aria-hidden="true" /></summary>
        <div className="calculator-evidence-grid">
          <section><h3>Formula</h3><ul>{schema.evidence.formula.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h3>Clinical evidence</h3><p>{schema.evidence.validation}</p></section>
          <section><h3>Limitations</h3><ul>{schema.evidence.limitations.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section className="calculator-sources"><h3>Sources</h3><ol>{schema.evidence.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a><span>{source.detail}</span></li>)}</ol></section>
        </div>
      </details>
    </section>
  );
}

function QuestionField({ question, answer, index, onChange }: {
  question: CalculatorQuestion;
  answer: CalculatorAnswers[string];
  index: number;
  onChange: (answer: CalculatorAnswers[string]) => void;
}) {
  return (
    <fieldset className="calculator-question card">
      <legend><span>{index}</span><span>{question.label}{question.help && <small>{question.help}</small>}</span></legend>
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
          onChange={(event) => onChange(event.target.value === "" ? undefined : { value: event.target.valueAsNumber, unit: activeUnit.value })}
          aria-describedby={`${question.id}-unit`}
        />
      </label>
      <div className="calculator-units" id={`${question.id}-unit`} aria-label={`${question.label} unit`}>
        {units.map((unit) => units.length === 1
          ? <span key={unit.value} className="calculator-fixed-unit">{unit.label}</span>
          : <button key={unit.value} type="button" className={activeUnit.value === unit.value ? "is-active" : ""} aria-pressed={activeUnit.value === unit.value} onClick={() => changeUnit(unit.value)}>{unit.label}</button>)}
      </div>
    </div>
  );
}

function formatPoints(points: number) {
  return points === 0 ? "0" : `+${formatScore(points)}`;
}

function formatScore(score: number | string) {
  if (typeof score === "string") return score;
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}
