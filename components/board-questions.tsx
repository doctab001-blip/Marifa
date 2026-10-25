"use client";

import { useState } from "react";
import type { BoardQuestion, TeachingGuide } from "@/lib/validations/disease";

function QuestionCard({ question, number, total }: { question: BoardQuestion; number: number; total: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const name = `board-question-${question.id}`;
  const correct = selected === question.answer;
  return (
    <article className="board-question" aria-labelledby={`${name}-title`}>
      <header className="board-question-header">
        <span className="disease-kicker" id={`${name}-title`}>Question {number} of {total}</span>
      </header>
      <p className="board-question-vignette">{question.vignette}</p>
      <p className="board-question-stem"><strong>{question.question}</strong></p>
      <fieldset className="board-question-options" disabled={revealed}>
        <legend className="sr-only">Answer options</legend>
        {question.options.map((option) => {
          const state = revealed ? (option.id === question.answer ? " is-correct" : option.id === selected ? " is-wrong" : "") : "";
          return (
            <label key={option.id} className={`board-question-option${selected === option.id ? " is-selected" : ""}${state}`}>
              <input type="radio" name={name} value={option.id} checked={selected === option.id} onChange={() => setSelected(option.id)} />
              <span className="board-question-letter">{option.id}</span>
              <span>{option.text}</span>
            </label>
          );
        })}
      </fieldset>
      {!revealed ? (
        <button type="button" className="board-question-check" disabled={!selected} onClick={() => setRevealed(true)}>Check answer</button>
      ) : (
        <div className="board-question-answer" role="status">
          <p className={`board-question-result${correct ? " is-correct" : " is-wrong"}`}>{correct ? "Correct." : `Not quite. The best answer is ${question.answer}.`}</p>
          <ul className="board-question-explanations">
            {question.options.map((option) => (
              <li key={option.id} className={option.id === question.answer ? "is-correct" : undefined}>
                <strong>{option.id}. {option.text}</strong>
                <p>{option.explanation}</p>
              </li>
            ))}
          </ul>
          <div className="board-question-objective"><strong>Educational objective</strong><p>{question.educationalObjective}</p></div>
          <div className="board-question-keypoint"><strong>Key point</strong><p>{question.keyPoint}</p></div>
          <button type="button" className="board-question-retry" onClick={() => { setSelected(null); setRevealed(false); }}>Try again</button>
        </div>
      )}
    </article>
  );
}

/** ABIM / MKSAP-style self-assessment: case vignette, single best answer, explanation of every option. */
export function BoardQuestions({ teaching }: { teaching?: TeachingGuide }) {
  const questions = teaching?.boardQuestions ?? [];
  if (!questions.length) return null;
  return (
    <section className="board-questions" aria-labelledby="board-questions-title">
      <p className="disease-kicker">Self-assessment</p>
      <h2 id="board-questions-title">Test yourself: board-style questions</h2>
      <p className="board-questions-note">Fictitious cases for learning. Choose the single best answer, then read why each option is right or wrong.</p>
      {questions.map((question, index) => <QuestionCard key={question.id} question={question} number={index + 1} total={questions.length} />)}
    </section>
  );
}

/** Opening case that frames the topic (ABIM method: learn from a patient, not a list). */
export function TeachingVignette({ teaching }: { teaching?: TeachingGuide }) {
  if (!teaching?.vignette && !teaching?.learningObjectives?.length) return null;
  return (
    <section className="teaching-opening" aria-labelledby="teaching-opening-title">
      <p className="disease-kicker">Start with a patient</p>
      <h2 id="teaching-opening-title">Clinical case and learning objectives</h2>
      {teaching.vignette ? <p className="teaching-opening-case">{teaching.vignette.text} <em>(Fictitious case.)</em></p> : null}
      {teaching.learningObjectives?.length ? (
        <div className="teaching-opening-objectives"><strong>By the end of this topic you should be able to:</strong>
          <ol>{teaching.learningObjectives.map((objective) => <li key={objective}>{objective}</li>)}</ol>
        </div>
      ) : null}
    </section>
  );
}
