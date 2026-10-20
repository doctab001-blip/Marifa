"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClipboardList, X } from "@/components/icons-3d";
import { applyProtocolOrdersAction, previewProtocolOrdersAction, selectActiveEncounterAction, type ActionResult } from "@/app/(workspace)/dashboard/patients/actions";
import type { PreviewResult, ProposedOrderView } from "@/lib/clinical-orders/service";
import { ORDER_SECTIONS, SECTION_LABELS, orderSection, type EditableOrder, type OrderPriority, type OrderSection, type OrderType, type ProtocolSourceModule } from "@/lib/clinical-orders/types";

/**
 * "Apply Protocol to Patient": the single review panel used by Disease Management AND Clinical Guidelines/Protocols.
 * Nothing is saved until the doctor presses a save button, and nothing is ever signed, sent, scheduled or completed.
 */

type Ready = Extract<PreviewResult, { state: "ready" }>;
type Row = {
  id: string;
  item: ProposedOrderView | null; // null = added by hand
  orderType: OrderType;
  orderName: string;
  category: string;
  priority: OrderPriority | null;
  indication: string;
  instructions: string;
  parameters: Record<string, string>;
  selected: boolean;
  removed: boolean;
  editing: boolean;
  conditionConfirmed: boolean;
  allowDuplicate: boolean;
};

const MEDICATION_FIELDS = ["dose", "route", "frequency", "duration"] as const;
const SECTION_TYPES: Record<OrderSection, OrderType[]> = { investigations: ["laboratory", "imaging", "investigation"], medications: ["medication"], procedures: ["procedure"], monitoring: ["monitoring"] };
const TYPE_LABELS: Record<OrderType, string> = { laboratory: "Laboratory", imaging: "Imaging", investigation: "Other investigation", medication: "Medication", procedure: "Procedure", monitoring: "Monitoring / follow-up" };
const EMPTY_MESSAGES: Record<OrderSection, string> = {
  investigations: "No configured investigations for this protocol.",
  medications: "No configured medications or treatments for this protocol.",
  procedures: "No configured procedures. Marifa protocols do not carry structured procedure orders yet.",
  monitoring: "No configured monitoring or follow-up orders for this protocol.",
};

function rowsFrom(items: ProposedOrderView[]): Row[] {
  return items.map((item) => ({
    id: item.sourceKey, item, orderType: item.orderType, orderName: item.orderName, category: item.category, priority: item.priority, indication: item.indication,
    instructions: item.instructions, parameters: { ...item.parameters },
    // Preselected items are the protocol's standard items. A possible duplicate is never ticked for the doctor.
    selected: item.preselect && item.duplicates.length === 0, removed: false, editing: false, conditionConfirmed: false, allowDuplicate: false,
  }));
}

const requirementLabel = { required: "Standard", optional: "Optional", conditional: "Conditional" } as const;
const requirementPill = { required: "pill-emerald", optional: "pill-slate", conditional: "pill-amber" } as const;

export function ApplyProtocolPanel({ protocolId, protocolTitle, sourceModule, className }: { protocolId: string; protocolTitle: string; sourceModule: ProtocolSourceModule; className?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"idle" | "loading" | "choose" | "review" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [encounters, setEncounters] = useState<Extract<PreviewResult, { state: "needs_encounter" }>["encounters"]>([]);
  const [ready, setReady] = useState<Ready | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<OrderSection>("investigations");
  const [saved, setSaved] = useState<{ draft: number; reviewed: number; forcedDraft: string[]; path: string } | null>(null);
  const [adding, setAdding] = useState({ name: "", type: "laboratory" as OrderType, instructions: "" });
  const manualCounter = useRef(0);

  const load = useCallback(async () => {
    setPhase("loading");
    setError(null);
    const result = await previewProtocolOrdersAction({ protocolId, sourceModule });
    if (!result.ok) { setError(result.message); setPhase("error"); return; }
    if (result.data.state === "needs_encounter") { setEncounters(result.data.encounters); setPhase("choose"); return; }
    const data = result.data;
    setReady(data);
    setRows(rowsFrom(data.items));
    // Open on the first category that actually has orders, so the doctor never lands on an empty tab.
    setTab(ORDER_SECTIONS.find((section) => data.items.some((candidate) => orderSection(candidate.orderType) === section)) ?? "investigations");
    setPhase("review");
  }, [protocolId, sourceModule]);

  const show = () => {
    setOpen(true);
    setSaved(null);
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) { if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", ""); }
    void load();
  };
  const hide = () => {
    const dialog = dialogRef.current;
    if (dialog?.open) { if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open"); }
    setOpen(false);
    setPhase("idle");
  };
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => { setOpen(false); setPhase("idle"); };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  const choose = async (encounterId: string) => {
    setPhase("loading");
    const result = await selectActiveEncounterAction(encounterId);
    if (!result.ok) { setError(result.message); setPhase("error"); return; }
    await load();
  };

  const update = (id: string, patch: Partial<Row>) => setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  const setParameter = (id: string, key: string, value: string) => setRows((current) => current.map((row) => (row.id === id ? { ...row, parameters: { ...row.parameters, [key]: value } } : row)));

  const live = useMemo(() => rows.filter((row) => !row.removed), [rows]);
  const selected = useMemo(() => live.filter((row) => row.selected), [live]);
  const unresolvedDuplicates = selected.filter((row) => (row.item?.duplicates.length ?? 0) > 0 && !row.allowDuplicate);
  const sectionRows = (section: OrderSection) => live.filter((row) => orderSection(row.orderType) === section);

  const addManual = () => {
    const name = adding.name.trim();
    if (!name) return;
    manualCounter.current += 1;
    const type = SECTION_TYPES[tab].includes(adding.type) ? adding.type : SECTION_TYPES[tab][0];
    setRows((current) => [...current, { id: `manual-${manualCounter.current}`, item: null, orderType: type, orderName: name, category: "Added manually", priority: null, indication: "", instructions: adding.instructions, parameters: {}, selected: true, removed: false, editing: false, conditionConfirmed: false, allowDuplicate: false }]);
    setAdding({ name: "", type: SECTION_TYPES[tab][0], instructions: "" });
  };

  const save = async (status: "draft" | "reviewed") => {
    if (!ready || selected.length === 0) return;
    setPhase("saving");
    setError(null);
    const orders: EditableOrder[] = selected.map((row) => ({
      sourceKey: row.item ? row.item.sourceKey : null, orderType: row.orderType, orderName: row.orderName, category: row.category, priority: row.priority,
      indication: row.indication, instructions: row.instructions, parameters: row.parameters, conditionConfirmed: row.conditionConfirmed, allowDuplicate: row.allowDuplicate, status,
    }));
    const result: ActionResult<{ draftCount: number; reviewedCount: number; forcedDraft: string[]; patientPath: string }> = await applyProtocolOrdersAction({ protocolId, sourceModule, encounterId: ready.encounter.encounterId, orders });
    if (!result.ok) { setError(result.message); setPhase("review"); return; }
    setSaved({ draft: result.data.draftCount, reviewed: result.data.reviewedCount, forcedDraft: result.data.forcedDraft, path: result.data.patientPath });
    setPhase("saved");
  };

  const tabRows = sectionRows(tab);
  const removedRows = live.length === rows.length ? [] : rows.filter((row) => row.removed);

  return (
    <>
      <button type="button" className={className ?? "ui-button ui-button-primary co-apply-trigger"} onClick={show} aria-haspopup="dialog">
        <ClipboardList size={16} aria-hidden="true" /> Apply Protocol to Patient
      </button>
      <dialog ref={dialogRef} className="co-dialog" aria-labelledby={`co-title-${protocolId}`}>
        {open ? (
          <>
            <header className="co-dialog-head">
              <div>
                <p className="scenario-eyebrow" style={{ margin: 0 }}>Protocol → patient orders</p>
                <h2 id={`co-title-${protocolId}`}>Apply “{protocolTitle}” to patient</h2>
              </div>
              <button type="button" className="ui-button" onClick={hide} aria-label="Close"><X size={16} aria-hidden="true" /> Close</button>
            </header>

            <div className="co-dialog-body">
              {phase === "loading" || phase === "saving" ? <p role="status">{phase === "saving" ? "Saving draft orders…" : "Loading the protocol's orders…"}</p> : null}
              {error ? <p className="co-notice co-notice-danger" role="alert">{error}</p> : null}
              {phase === "error" ? <div><button type="button" className="ui-button" onClick={() => void load()}>Try again</button></div> : null}

              {phase === "choose" ? (
                <section aria-label="Choose patient encounter" className="co-rows">
                  <p className="co-notice co-notice-info"><strong>Choose the patient encounter first.</strong> Orders are always created inside one active encounter, so no protocol can be applied until you pick one.</p>
                  {encounters.length === 0 ? <div className="co-empty">No active encounters yet. <Link href="/dashboard/patients">Create a patient and start an encounter</Link>, then return here.</div> : encounters.map((encounter) => (
                    <button key={encounter.encounterId} type="button" className="co-row" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => void choose(encounter.encounterId)}>
                      <strong>{encounter.patientName}</strong>
                      <small>MRN {encounter.mrn} · {encounter.encounterLabel}</small>
                    </button>
                  ))}
                </section>
              ) : null}

              {phase === "saved" && saved ? (
                <section className="co-rows" aria-label="Orders saved">
                  <p className="co-notice co-notice-ok" role="status">
                    <strong>{saved.draft} draft order{saved.draft === 1 ? "" : "s"} created{saved.reviewed ? `, ${saved.reviewed} marked reviewed` : ""}.</strong>{" "}
                    These are <strong>not authorised orders</strong>: nothing has been signed, sent, prescribed or scheduled. Review and authorise them in the patient's order workspace.
                  </p>
                  {saved.forcedDraft.length > 0 ? <p className="co-notice">Kept as drafts because information is missing or a condition was not confirmed: {saved.forcedDraft.join("; ")}.</p> : null}
                  <p><Link className="ui-button ui-button-primary" href={saved.path}>Open the patient's orders</Link></p>
                </section>
              ) : null}

              {(phase === "review" || phase === "saving") && ready ? (
                <>
                  <dl className="co-meta">
                    <div><dt>Protocol</dt><dd>{ready.protocol.title}</dd></div>
                    <div><dt>Version</dt><dd>{ready.protocol.protocolVersion}</dd></div>
                    <div><dt>Clinical specialty</dt><dd>{ready.protocol.specialty}</dd></div>
                    <div><dt>Source module</dt><dd>{ready.protocol.sourceModule === "disease_management" ? "Disease Management" : "Clinical Guidelines / Protocols"}</dd></div>
                    <div><dt>Patient</dt><dd>{ready.encounter.patientName} · MRN {ready.encounter.mrn}</dd></div>
                    <div><dt>Active encounter</dt><dd>{ready.encounter.encounterLabel}</dd></div>
                  </dl>
                  <p className="co-notice co-notice-info">Everything here is a <strong>proposal</strong>. Saving creates <strong>draft orders</strong> for your review. Nothing is signed, prescribed, sent or scheduled. Conditional items are never ticked for you because no verified patient findings are recorded in Marifa.</p>
                  {ready.warnings.map((warning) => <p key={warning} className="co-notice" role="note">{warning}</p>)}
                  {!ready.hasConfiguredOrders ? <p className="co-empty" role="status"><strong>No configured orders available</strong> for this protocol. The guideline text is unchanged and no orders were invented. You can still add orders manually below.</p> : null}

                  <div role="tablist" className="co-tabs" aria-label="Order categories">
                    {ORDER_SECTIONS.map((section) => (
                      <button key={section} type="button" role="tab" id={`co-tab-${section}`} aria-selected={tab === section} aria-controls="co-panel" className="co-tab" onClick={() => { setTab(section); setAdding((current) => ({ ...current, type: SECTION_TYPES[section][0] })); }}>
                        {SECTION_LABELS[section]} <span className="co-count">{sectionRows(section).filter((row) => row.selected).length}/{sectionRows(section).length}</span>
                      </button>
                    ))}
                  </div>

                  <div id="co-panel" role="tabpanel" aria-labelledby={`co-tab-${tab}`} className="co-rows">
                    {tabRows.length === 0 ? <p className="co-empty">{EMPTY_MESSAGES[tab]}</p> : tabRows.map((row) => (
                      <OrderRow key={row.id} row={row} onChange={(patch) => update(row.id, patch)} onParameter={(key, value) => setParameter(row.id, key, value)} sourceTitle={ready.protocol.title} />
                    ))}
                    {removedRows.filter((row) => orderSection(row.orderType) === tab).map((row) => (
                      <p key={row.id} className="co-removed"><span>Removed: <s>{row.orderName}</s></span><button type="button" className="ui-button" onClick={() => update(row.id, { removed: false })}>Restore</button></p>
                    ))}
                    <details className="co-add">
                      <summary>Add an order manually to {SECTION_LABELS[tab]}</summary>
                      <div className="co-edit-grid" style={{ marginTop: ".6rem" }}>
                        {SECTION_TYPES[tab].length > 1 ? (
                          <label className="co-field">Type<select value={adding.type} onChange={(event) => setAdding({ ...adding, type: event.target.value as OrderType })}>{SECTION_TYPES[tab].map((type) => <option key={type} value={type}>{TYPE_LABELS[type]}</option>)}</select></label>
                        ) : null}
                        <label className="co-field">Order name<input value={adding.name} onChange={(event) => setAdding({ ...adding, name: event.target.value })} /></label>
                        <label className="co-field">Instructions<input value={adding.instructions} onChange={(event) => setAdding({ ...adding, instructions: event.target.value })} /></label>
                        <div className="co-field"><span aria-hidden="true">&nbsp;</span><button type="button" className="ui-button" onClick={addManual} disabled={!adding.name.trim()}>Add to review</button></div>
                      </div>
                    </details>
                  </div>
                </>
              ) : null}
            </div>

            {(phase === "review" || phase === "saving") && ready ? (
              <footer className="co-dialog-foot">
                <span>
                  <strong>{selected.length}</strong> selected
                  {unresolvedDuplicates.length > 0 ? <> · <span style={{ color: "var(--danger)" }}>{unresolvedDuplicates.length} possible duplicate{unresolvedDuplicates.length === 1 ? "" : "s"} need a decision</span></> : null}
                </span>
                <div className="co-foot-actions">
                  <button type="button" className="ui-button" onClick={hide}>Cancel – save nothing</button>
                  <button type="button" className="ui-button" disabled={selected.length === 0 || unresolvedDuplicates.length > 0 || phase === "saving"} onClick={() => void save("reviewed")} title="Complete orders with confirmed conditions are marked reviewed (still not signed). Everything else stays a draft.">Save &amp; mark reviewed</button>
                  <button type="button" className="ui-button ui-button-primary" disabled={selected.length === 0 || unresolvedDuplicates.length > 0 || phase === "saving"} onClick={() => void save("draft")}>Save as draft orders</button>
                </div>
              </footer>
            ) : null}
          </>
        ) : null}
      </dialog>
    </>
  );
}

function OrderRow({ row, onChange, onParameter, sourceTitle }: { row: Row; onChange: (patch: Partial<Row>) => void; onParameter: (key: string, value: string) => void; sourceTitle: string }) {
  const item = row.item;
  const duplicates = item?.duplicates ?? [];
  const missing = item?.requiredInformation ?? [];
  const requirement = item?.requirement ?? "optional";
  const showMedication = row.orderType === "medication";
  const params = Object.entries(row.parameters).filter(([key, value]) => value && !["linkedSourceKey", "contraindications"].includes(key));
  return (
    <article className="co-row" data-requirement={item ? requirement : "optional"} data-selected={row.selected} aria-label={row.orderName}>
      <div className="co-row-head">
        <input type="checkbox" checked={row.selected} onChange={(event) => onChange({ selected: event.target.checked })} aria-label={`Select ${row.orderName}`} />
        <div className="co-row-title">
          <strong>{row.orderName}</strong>
          <small>{row.category}{item ? ` · from ${sourceTitle}` : ""}</small>
          <div className="co-badges">
            {item ? <span className={`pill pill-sm ${requirementPill[requirement]}`}>{requirementLabel[requirement]}</span> : <span className="pill pill-sm pill-violet">Added manually</span>}
            <span className="pill pill-sm pill-sky">Draft – needs review</span>
            {missing.length > 0 ? <span className="pill pill-sm pill-rose">Incomplete</span> : null}
            {duplicates.length > 0 ? <span className="pill pill-sm pill-rose">Possible duplicate</span> : null}
          </div>
        </div>
        <div className="co-row-actions">
          <button type="button" className="ui-button" onClick={() => onChange({ editing: !row.editing })} aria-expanded={row.editing}>{row.editing ? "Done" : "Edit"}</button>
          <button type="button" className="ui-button" onClick={() => onChange({ removed: true, selected: false })} aria-label={`Remove ${row.orderName}`}>Remove</button>
        </div>
      </div>

      {row.indication ? <p className="co-text"><strong>Indication:</strong> {row.indication}</p> : null}
      {params.length > 0 ? <div className="co-params">{params.map(([key, value]) => <span key={key} className="co-param"><b>{key}</b>{value}</span>)}</div> : null}
      {row.instructions ? <p className="co-text">{row.instructions}</p> : null}

      {item && item.conditionRules.length > 0 ? (
        <div className="co-flag co-flag-warn">
          <strong>Conditional – confirm before relying on this item</strong>
          <ul>{item.conditionRules.map((rule) => <li key={rule.text}>{rule.text}</li>)}</ul>
          <label><input type="checkbox" checked={row.conditionConfirmed} onChange={(event) => onChange({ conditionConfirmed: event.target.checked })} /> I have verified this applies to this patient</label>
        </div>
      ) : null}
      {missing.length > 0 ? (
        <div className="co-flag co-flag-warn"><strong>Information needed from the clinician</strong><ul>{missing.map((entry) => <li key={entry}>{entry}</li>)}</ul></div>
      ) : null}
      {duplicates.length > 0 ? (
        <div className="co-flag co-flag-dup">
          <strong>Possible duplicate on this encounter</strong>
          <ul>{duplicates.map((match) => <li key={match.orderId}>{match.orderName} ({match.status}){match.reason === "same_protocol_item" ? " – already applied from this protocol" : ""}</li>)}</ul>
          <label><input type="checkbox" checked={row.allowDuplicate} onChange={(event) => onChange({ allowDuplicate: event.target.checked, selected: event.target.checked ? true : row.selected })} /> Add it anyway (I intend a second order)</label>
        </div>
      ) : null}

      {row.editing ? (
        <div className="co-edit">
          <div className="co-edit-grid">
            <label className="co-field">Order name<input value={row.orderName} onChange={(event) => onChange({ orderName: event.target.value })} /></label>
            <label className="co-field">Priority<select value={row.priority ?? ""} onChange={(event) => onChange({ priority: (event.target.value || null) as OrderPriority | null })}><option value="">Not set</option><option value="routine">Routine</option><option value="urgent">Urgent</option><option value="stat">STAT</option></select></label>
            {showMedication ? MEDICATION_FIELDS.map((field) => (
              <label className="co-field" key={field} style={{ textTransform: "capitalize" }}>{field}<input value={row.parameters[field] ?? ""} onChange={(event) => onParameter(field, event.target.value)} /></label>
            )) : null}
          </div>
          <label className="co-field">Indication<input value={row.indication} onChange={(event) => onChange({ indication: event.target.value })} /></label>
          <label className="co-field">Instructions<textarea rows={3} value={row.instructions} onChange={(event) => onChange({ instructions: event.target.value })} /></label>
        </div>
      ) : null}
    </article>
  );
}
