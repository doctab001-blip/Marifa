"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { Plus, X, type LucideIcon } from "lucide-react";
import type { VocabularyTerm } from "@/types/diagnosisEngine";

type FindingInputProps = {
  label: string;
  hint: string;
  icon: LucideIcon;
  examples: string[];
  values: string[];
  onChange: (values: string[]) => void;
  /** Recognised terms for type-ahead; terms of `preferredKind` rank first. */
  vocabulary?: VocabularyTerm[];
  preferredKind: VocabularyTerm["kind"];
};

const MAX_SUGGESTIONS = 7;

/** Suggestions whose words start with every typed word ("rais d d" → "Raised D-dimer"). */
function suggest(vocabulary: VocabularyTerm[], draft: string, preferredKind: VocabularyTerm["kind"], exclude: string[]) {
  const words = draft.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (!words.length || draft.trim().length < 2) return [];
  const taken = new Set(exclude.map((value) => value.toLowerCase()));
  const scored: Array<{ item: VocabularyTerm; score: number }> = [];
  for (const item of vocabulary) {
    if (taken.has(item.term.toLowerCase())) continue;
    const termWords = item.term.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    if (!words.every((word) => termWords.some((termWord) => termWord.startsWith(word)))) continue;
    const startsWith = termWords[0]?.startsWith(words[0]) ? 0 : 1;
    scored.push({ item, score: startsWith * 10 + (item.kind === preferredKind ? 0 : 5) + item.term.length / 100 });
  }
  return scored.sort((a, b) => a.score - b.score).slice(0, MAX_SUGGESTIONS).map(({ item }) => item);
}

/** Chip generator with type-ahead: type a finding, pick a suggestion or press Enter to add your own text. */
export function FindingInput({ label, hint, icon: Icon, examples, values, onChange, vocabulary = [], preferredKind }: FindingInputProps) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputId = useId();
  const hintId = useId();
  const listId = useId();
  const options = useMemo(() => suggest(vocabulary, draft, preferredKind, values), [vocabulary, draft, preferredKind, values]);
  const showList = open && options.length > 0;

  const add = (raw: string) => {
    const value = raw.trim().replace(/,$/, "").trim();
    setOpen(false);
    setActive(-1);
    if (!value || value.length > 160) return;
    if (values.some((existing) => existing.toLowerCase() === value.toLowerCase())) return setDraft("");
    onChange([...values, value]);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && options.length) {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % options.length);
    } else if (event.key === "ArrowUp" && options.length) {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index <= 0 ? options.length - 1 : index - 1));
    } else if (event.key === "Enter" || (event.key === "," && !draft.includes("/"))) {
      event.preventDefault();
      add(showList && active >= 0 ? options[active].term : draft);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (event.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  const examplesLeft = examples.filter((example) => !values.some((value) => value.toLowerCase() === example.toLowerCase())).slice(0, 4);

  return (
    <fieldset className="dx-vector">
      <legend className="dx-vector-head">
        <span className="dx-vector-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.8} /></span>
        <span className="dx-vector-title">{label}</span>
        {values.length ? <span className="dx-vector-count" aria-label={`${values.length} entered`}>{values.length}</span> : null}
      </legend>
      <div className="dx-combo">
        <div className="dx-chip-field" onClick={() => document.getElementById(inputId)?.focus()}>
          {values.map((value) => (
            <span className="dx-chip" key={value}>
              {value}
              <button type="button" onClick={(event) => { event.stopPropagation(); onChange(values.filter((item) => item !== value)); }} aria-label={`Remove ${value}`}>
                <X size={13} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </span>
          ))}
          <input
            id={inputId}
            value={draft}
            onChange={(event) => { setDraft(event.target.value); setOpen(true); setActive(-1); }}
            onKeyDown={onKeyDown}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => { setOpen(false); setActive(-1); }, 120)}
            placeholder={values.length ? "Add another…" : hint}
            aria-label={`Add ${label.toLowerCase()}`}
            aria-describedby={hintId}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={listId}
            aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            maxLength={160}
          />
        </div>
        <ul id={listId} role="listbox" className="dx-combo-list" hidden={!showList} aria-label={`Suggested ${label.toLowerCase()}`}>
          {options.map((option, index) => (
            <li
              key={option.term}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className="dx-combo-option"
              onMouseDown={(event) => { event.preventDefault(); add(option.term); }}
              onMouseEnter={() => setActive(index)}
            >
              <span>{option.term}</span>
              {option.kind !== preferredKind ? <span className="dx-combo-kind">{option.kind}</span> : null}
            </li>
          ))}
        </ul>
      </div>
      <p id={hintId} className="dx-sr-only">Type to see recognised findings. Press Enter to add. Values such as HR 124 or SpO2 88% are read automatically.</p>
      {examplesLeft.length ? (
        <div className="dx-suggestions" aria-label={`Example ${label.toLowerCase()}`}>
          {examplesLeft.map((example) => (
            <button type="button" key={example} onClick={() => add(example)} className="dx-suggestion"><Plus size={12} strokeWidth={2.4} aria-hidden="true" />{example}</button>
          ))}
        </div>
      ) : null}
    </fieldset>
  );
}
