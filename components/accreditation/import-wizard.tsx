"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { runStandardsImportAction, type ImportResult } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions-v21";
import { parseCsv } from "@/lib/governance/csv";
import { IMPORT_FIELDS, MAX_IMPORT_ROWS, buildImportPlan, guessMapping, type ColumnMapping, type ExistingRegister, type ImportField, type ImportMode } from "@/lib/governance/hierarchy";

const BASE = "/dashboard/accreditation-and-audits";
const STEPS = ["Upload file", "Map columns", "Preview", "Validate", "Confirm", "Summary"];

export type EditionChoice = { label: string; program: string; hospitalType: string; isOfficial: boolean };

/**
 * Six-step standards import. Steps 1–4 run in the browser (nothing is sent until you confirm); step 5 sends the parsed
 * rows and the mapping, and the server re-runs the same validation against the live register before writing anything.
 */
export function ImportWizard({ registers, editions, defaultEdition }: { registers: Record<string, ExistingRegister>; editions: EditionChoice[]; defaultEdition: string }) {
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState("");
  const [table, setTable] = useState<string[][]>([]);
  const [readError, setReadError] = useState("");
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [edition, setEdition] = useState(defaultEdition);
  const [mode, setMode] = useState<ImportMode>("add_only");
  const [result, action, pending] = useActionState<ImportResult, FormData>(runStandardsImportAction, { state: "idle" });

  const headers = table[0] ?? [];
  const existing = useMemo(() => registers[edition] ?? { standards: [], elements: [] }, [registers, edition]);
  const known = editions.find((e) => e.label === edition);
  const plan = useMemo(() => (table.length > 1 ? buildImportPlan({ table, mapping, existing, mode }) : null), [table, mapping, existing, mode]);
  const shownStep = result.state === "done" ? 5 : step;

  const readFile = async (file: File | undefined) => {
    setReadError("");
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setReadError("That file is larger than 2 MB. Split it and import in parts."); return; }
    if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") { setReadError("Choose a .csv file (save the spreadsheet as CSV UTF-8 first)."); return; }
    const parsed = parseCsv(await file.text());
    if (parsed.length < 2) { setReadError("The file needs a header row and at least one data row."); return; }
    if (parsed.length - 1 > MAX_IMPORT_ROWS) { setReadError(`The file has ${parsed.length - 1} rows. Import at most ${MAX_IMPORT_ROWS} at a time.`); return; }
    setFileName(file.name);
    setTable(parsed);
    setMapping(guessMapping(parsed[0]));
    setStep(1);
  };

  const mapped = (cells: string[], key: ImportField) => (mapping[key] === undefined ? "" : (cells[mapping[key] as number] ?? "").trim());

  return (
    <section className="gh-card" aria-labelledby="wizard-heading" style={{ display: "grid", gap: ".9rem" }}>
      <h2 id="wizard-heading" className="gh-section-title" style={{ margin: 0 }}>Import standards and measurable elements</h2>
      <ol className="gh-stepper" aria-label="Import steps">
        {STEPS.map((label, i) => {
          const state = i < shownStep ? "done" : i === shownStep ? "current" : "todo";
          return <li key={label} className={`gh-step gh-step-${state}`} aria-current={state === "current" ? "step" : undefined}><span className="gh-step-dot" aria-hidden="true">{state === "done" ? "✓" : i + 1}</span><span className="gh-step-text"><strong>{label}</strong></span></li>;
        })}
      </ol>

      {shownStep === 0 ? (
        <div style={{ display: "grid", gap: ".7rem" }}>
          <p style={{ margin: 0 }}>Use the standards from the manual your hospital is licensed to use. Marifa does not ship or invent CBAHI wording, and a seasonal-hospital manual must not be imported in place of the general-hospital one.</p>
          <label className="gh-drop">
            <strong>Choose the CSV file</strong>
            <small>One row per standard, or one row per measurable element (with its standard code on each row). Max 2 MB, {MAX_IMPORT_ROWS.toLocaleString("en-GB")} rows.</small>
            <input type="file" accept=".csv,text/csv" onChange={(e) => void readFile(e.target.files?.[0])} style={{ position: "static", width: "auto", height: "auto", opacity: 1, pointerEvents: "auto" }} />
          </label>
          {readError ? <p className="gh-notice gh-notice-bad" role="alert">{readError}</p> : null}
          <p className="gh-meta" style={{ margin: 0 }}>Need a starting point? <a href={`${BASE}/standards/template`}><strong>Download the empty template</strong></a>. Adding an internal, non-official requirement instead? Use “Add an internal requirement” on the standards page.</p>
        </div>
      ) : null}

      {shownStep === 1 ? (
        <div style={{ display: "grid", gap: ".7rem" }}>
          <p className="gh-meta" style={{ margin: 0 }}><strong>{fileName}</strong> · {table.length - 1} rows · {headers.length} columns. Check which column holds each field; unmapped fields are left empty.</p>
          <div className="gh-form">
            {IMPORT_FIELDS.map((field) => (
              <label key={field.key} className="gh-field">{field.label}{field.key === "standardCode" ? " *" : ""}
                <select value={mapping[field.key] ?? ""} onChange={(e) => setMapping((m) => { const next = { ...m }; if (e.target.value === "") delete next[field.key]; else next[field.key] = Number(e.target.value); return next; })}>
                  <option value="">— not in this file —</option>
                  {headers.map((h, i) => <option key={i} value={i}>{h || `Column ${i + 1}`}</option>)}
                </select>
                {field.hint ? <small>{field.hint}</small> : null}
              </label>
            ))}
          </div>
          <div className="gh-btnrow"><button className="ui-button" type="button" onClick={() => { setStep(0); setTable([]); }}>Back</button><button className="ui-button ui-button-primary" type="button" disabled={mapping.standardCode === undefined} onClick={() => setStep(2)}>Preview rows</button>{mapping.standardCode === undefined ? <span className="gh-meta">Map the standard code first.</span> : null}</div>
        </div>
      ) : null}

      {shownStep === 2 ? (
        <div style={{ display: "grid", gap: ".7rem" }}>
          <p className="gh-meta" style={{ margin: 0 }}>The first 15 rows as they will be read.</p>
          <div className="gh-table-wrap"><table className="gh-table">
            <thead><tr><th scope="col">Line</th>{IMPORT_FIELDS.filter((f) => mapping[f.key] !== undefined).map((f) => <th key={f.key} scope="col">{f.label}</th>)}</tr></thead>
            <tbody>{table.slice(1, 16).map((cells, i) => (
              <tr key={i}><td className="gh-meta">{i + 2}</td>{IMPORT_FIELDS.filter((f) => mapping[f.key] !== undefined).map((f) => <td key={f.key}><span className="gh-clamp">{mapped(cells, f.key) || <span className="gh-meta">—</span>}</span></td>)}</tr>
            ))}</tbody>
          </table></div>
          <div className="gh-btnrow"><button className="ui-button" type="button" onClick={() => setStep(1)}>Back</button><button className="ui-button ui-button-primary" type="button" onClick={() => setStep(3)}>Validate</button></div>
        </div>
      ) : null}

      {shownStep === 3 && plan ? (
        <div style={{ display: "grid", gap: ".7rem" }}>
          <div className="gh-form">
            <label className="gh-field">Edition these rows belong to
              <input list="gh-editions" value={edition} onChange={(e) => setEdition(e.target.value)} maxLength={160} placeholder="e.g. the edition named on your licence" />
              <datalist id="gh-editions">{editions.map((e) => <option key={e.label} value={e.label} />)}</datalist>
              <small>{known ? `Existing edition: ${known.program}${known.hospitalType ? ` · ${known.hospitalType}` : ""}${known.isOfficial ? "" : " · internal (non-official)"}` : "A new edition record will be created."}</small></label>
            <label className="gh-field">If a code already exists in this edition
              <select value={mode} onChange={(e) => setMode(e.target.value as ImportMode)}><option value="add_only">Leave it unchanged (add new codes only)</option><option value="add_and_update">Update its wording and details</option></select>
              <small>Updating keeps the record, so its assessment history and evidence stay attached.</small></label>
          </div>
          <div className="gh-grid">
            <div className="gh-card gh-kpi gh-accent-blue"><div className="gh-stat-label">New standards</div><div className="gh-stat-value">{plan.summary.standardsToCreate}</div></div>
            <div className="gh-card gh-kpi gh-accent-blue"><div className="gh-stat-label">New measurable elements</div><div className="gh-stat-value">{plan.summary.elementsToCreate}</div></div>
            <div className="gh-card gh-kpi gh-accent-gold"><div className="gh-stat-label">Updates</div><div className="gh-stat-value">{plan.summary.standardsToUpdate + plan.summary.elementsToUpdate}</div></div>
            <div className="gh-card gh-kpi gh-accent-coral"><div className="gh-stat-label">Rejected rows</div><div className="gh-stat-value">{plan.summary.rejectedRows}</div></div>
          </div>
          {plan.rejected.length > 0 ? <IssueList title="Rejected rows (not imported)" tone="bad" issues={plan.rejected} /> : <p className="gh-notice gh-notice-ok" role="status" style={{ margin: 0 }}>No rows are rejected: no duplicate codes, missing identifiers or invalid parent references.</p>}
          {plan.warnings.length > 0 ? <IssueList title="Warnings" tone="warn" issues={plan.warnings} /> : null}
          <div className="gh-btnrow"><button className="ui-button" type="button" onClick={() => setStep(2)}>Back</button><button className="ui-button ui-button-primary" type="button" disabled={!edition.trim() || plan.summary.standardsToCreate + plan.summary.elementsToCreate + plan.summary.standardsToUpdate + plan.summary.elementsToUpdate === 0} onClick={() => setStep(4)}>Continue</button></div>
        </div>
      ) : null}

      {shownStep === 4 && plan ? (
        <form action={action} style={{ display: "grid", gap: ".7rem" }}>
          <input type="hidden" name="table" value={JSON.stringify(table)} />
          <input type="hidden" name="mapping" value={JSON.stringify(mapping)} />
          <input type="hidden" name="edition" value={edition} />
          <input type="hidden" name="mode" value={mode} />
          <input type="hidden" name="fileName" value={fileName} />
          {!known ? (
            <div className="gh-form">
              <label className="gh-field">Programme<input name="program" defaultValue="CBAHI" maxLength={80} /></label>
              <label className="gh-field">Hospital type covered<input name="hospitalType" maxLength={120} placeholder="e.g. General hospital" /><small>Must match the manual you are importing.</small></label>
              <label className="gh-field">Source<select name="isOfficial" defaultValue="yes"><option value="yes">Official, from our licensed manual</option><option value="no">Internal framework written by the hospital (non-official)</option></select></label>
              <label className="gh-field gh-wide">Where the text comes from<input name="sourceNote" maxLength={1000} placeholder="e.g. Licensed manual, edition and year, as named on the licence" /></label>
            </div>
          ) : <input type="hidden" name="isOfficial" value={known.isOfficial ? "yes" : "no"} />}
          <p style={{ margin: 0 }}>Import <strong>{plan.summary.standardsToCreate}</strong> new standard{plan.summary.standardsToCreate === 1 ? "" : "s"} and <strong>{plan.summary.elementsToCreate}</strong> new measurable element{plan.summary.elementsToCreate === 1 ? "" : "s"}{plan.summary.standardsToUpdate + plan.summary.elementsToUpdate > 0 ? <>, and update <strong>{plan.summary.standardsToUpdate + plan.summary.elementsToUpdate}</strong> existing record{plan.summary.standardsToUpdate + plan.summary.elementsToUpdate === 1 ? "" : "s"}</> : null} into <strong>{edition}</strong>? Nothing is deleted; every change is recorded in the audit trail.</p>
          {result.state === "error" ? <p className="gh-notice gh-notice-bad" role="alert" style={{ margin: 0 }}>{result.message}</p> : null}
          <div className="gh-btnrow"><button className="ui-button" type="button" onClick={() => setStep(3)} disabled={pending}>Back</button><button className="ui-button ui-button-primary" type="submit" disabled={pending}>{pending ? "Importing…" : "Confirm import"}</button></div>
        </form>
      ) : null}

      {result.state === "done" ? (
        <div style={{ display: "grid", gap: ".7rem" }}>
          <p className="gh-notice gh-notice-ok" role="status" style={{ margin: 0 }}>Import complete for <strong>{result.edition}</strong>.</p>
          <div className="gh-grid">
            <div className="gh-card gh-kpi gh-accent-emerald"><div className="gh-stat-label">Imported</div><div className="gh-stat-value">{result.created.standards + result.created.elements}</div><div className="gh-stat-note">{result.created.standards} standards · {result.created.elements} elements</div></div>
            <div className="gh-card gh-kpi gh-accent-gold"><div className="gh-stat-label">Updated</div><div className="gh-stat-value">{result.updated.standards + result.updated.elements}</div><div className="gh-stat-note">History and evidence kept</div></div>
            <div className="gh-card gh-kpi gh-accent-blue"><div className="gh-stat-label">Unchanged</div><div className="gh-stat-value">{result.unchanged}</div></div>
            <div className="gh-card gh-kpi gh-accent-coral"><div className="gh-stat-label">Rejected rows</div><div className="gh-stat-value">{new Set(result.rejected.map((r) => r.line)).size}</div></div>
          </div>
          {result.rejected.length > 0 ? <IssueList title="Rejected rows" tone="bad" issues={result.rejected} /> : null}
          {result.warnings.length > 0 ? <IssueList title="Warnings" tone="warn" issues={result.warnings} /> : null}
          <div className="gh-btnrow"><Link className="ui-button ui-button-primary" href={`${BASE}/standards`}>Go to the register</Link><a className="ui-button" href={`${BASE}/standards/import`}>Import another file</a></div>
        </div>
      ) : null}
    </section>
  );
}

function IssueList({ title, tone, issues }: { title: string; tone: "bad" | "warn"; issues: { line: number; message: string }[] }) {
  return (
    <details className="gh-details" open={tone === "bad"}>
      <summary>{title} ({issues.length})</summary>
      <div className="gh-details-body">
        <ul className="gh-actions" style={{ maxHeight: 260, overflow: "auto" }}>
          {issues.slice(0, 200).map((issue, i) => <li key={i} className="gh-row" style={{ gridTemplateColumns: "4.5rem 1fr" }}><span className={`gh-badge gh-${tone}`}>Line {issue.line}</span><span>{issue.message}</span></li>)}
        </ul>
        {issues.length > 200 ? <p className="gh-meta">Showing the first 200.</p> : null}
      </div>
    </details>
  );
}
