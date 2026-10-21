"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { Plus, X, type LucideIcon } from "lucide-react";

type FindingInputProps = {
  label: string;
  hint: string;
  icon: LucideIcon;
  examples: string[];
  values: string[];
  onChange: (values: string[]) => void;
};

/** Chip generator: type a finding and press Enter (or comma) to add it; suggestions add with one click. */
export function FindingInput({ label, hint, icon: Icon, examples, values, onChange }: FindingInputProps) {
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const hintId = useId();

  const add = (raw: string) => {
    const value = raw.trim().replace(/,$/, "").trim();
    if (!value || value.length > 160) return;
    if (values.some((existing) => existing.toLowerCase() === value.toLowerCase())) return setDraft("");
    onChange([...values, value]);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  const suggestions = examples.filter((example) => !values.some((value) => value.toLowerCase() === example.toLowerCase())).slice(0, 4);

  return (
    <fieldset className="dx-vector">
      <legend className="dx-vector-head">
        <span className="dx-vector-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.8} /></span>
        <span className="dx-vector-title">{label}</span>
        {values.length ? <span className="dx-vector-count" aria-label={`${values.length} entered`}>{values.length}</span> : null}
      </legend>
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
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          placeholder={values.length ? "Add another…" : hint}
          aria-label={`Add ${label.toLowerCase()}`}
          aria-describedby={hintId}
          maxLength={160}
        />
      </div>
      <p id={hintId} className="dx-sr-only">Press Enter to add each finding.</p>
      {suggestions.length ? (
        <div className="dx-suggestions" aria-label={`Suggested ${label.toLowerCase()}`}>
          {suggestions.map((example) => (
            <button type="button" key={example} onClick={() => add(example)} className="dx-suggestion"><Plus size={12} strokeWidth={2.4} aria-hidden="true" />{example}</button>
          ))}
        </div>
      ) : null}
    </fieldset>
  );
}
