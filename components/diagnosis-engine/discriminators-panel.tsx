"use client";

import { Check, Minus, Target } from "lucide-react";
import type { DiscriminatingFinding } from "@/types/diagnosisEngine";

const KIND_LABEL: Record<DiscriminatingFinding["kind"], string> = { symptom: "Symptom", exam: "Exam", lab: "Lab / ECG", imaging: "Imaging" };

type Props = {
  items: DiscriminatingFinding[];
  /** Records the answer as a finding: present adds it, absent adds "No …". */
  onAnswer: (item: DiscriminatingFinding, present: boolean) => void;
  answered: Set<string>;
};

/** Findings not yet entered that would best separate the listed differentials. */
export function DiscriminatorsPanel({ items, onAnswer, answered }: Props) {
  if (!items.length) return null;
  return (
    <section className="dx-discriminators" aria-labelledby="dx-discriminators-title">
      <h3 id="dx-discriminators-title"><Target size={16} strokeWidth={2} aria-hidden="true" />What would separate these</h3>
      <p className="dx-discriminators-intro">Check these next. Record the answer and regenerate to update the ranking.</p>
      <ul>
        {items.map((item) => {
          const done = answered.has(item.finding);
          return (
            <li key={item.finding} className={done ? "is-answered" : undefined}>
              <div className="dx-discriminator-text">
                <p><strong>{item.finding}</strong><span className="dx-kind-badge">{KIND_LABEL[item.kind]}</span></p>
                <p className="dx-discriminator-meta">
                  Supports {item.supports.join(", ")}
                  {item.howToCheck ? <> · <span>check with {item.howToCheck}</span></> : null}
                </p>
              </div>
              <div className="dx-answer dx-no-print" role="group" aria-label={`Record ${item.finding}`}>
                {done ? <span className="dx-answer-done">Recorded</span> : (
                  <>
                    <button type="button" onClick={() => onAnswer(item, true)} aria-label={`${item.finding}: present`}><Check size={13} strokeWidth={2.4} aria-hidden="true" />Present</button>
                    <button type="button" onClick={() => onAnswer(item, false)} aria-label={`${item.finding}: absent`}><Minus size={13} strokeWidth={2.4} aria-hidden="true" />Absent</button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
