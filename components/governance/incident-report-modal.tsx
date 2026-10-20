"use client";

/**
 * Datix / SBAR incident report modal for the Marifa Clinical Governance hub.
 * Self-contained: React + Tailwind + lucide-react. Colours come from the --mgh-* theme
 * variables defined by clinical-governance-hub.tsx, so render it inside that component.
 *
 * Attachments are held in state as { id, name, size, type, url, file }. `file` is the raw
 * File, ready to upload to Supabase Storage / S3 inside the consumer's onSubmit.
 * Mount it conditionally ({open && <IncidentReportModal />}) so every open starts clean.
 */

import { useEffect, useId, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from "react";
import { AlertTriangle, FileText, Image as ImageIcon, Paperclip, UploadCloud, X } from "lucide-react";

/* ---------- types & constants ---------- */

export type Attachment = { id: string; name: string; size: number; type: string; url: string; file: File };
export type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";
export type IncidentReport = {
  title: string; dept: string; occurredAt: string; severity: IncidentSeverity; category: string;
  situation: string; background: string; assessment: string; recommendation: string;
  mrn: string; lead: string; reportedBy: string; attachments: Attachment[];
};

export const INCIDENT_DEPARTMENTS = ["Emergency", "Pediatrics", "ICU", "Inpatient Medicine", "Outpatient", "Pharmacy", "Surgical", "Obstetrics"];
export const INCIDENT_CATEGORIES = ["Medication Safety", "Patient Fall", "Equipment Failure", "Delayed Treatment", "Infection Control", "Communication / Handover", "Documentation", "Patient ID"];

const SEVERITIES: { value: IncidentSeverity; label: string; on: string }[] = [
  { value: "Low", label: "Low", on: "peer-checked:border-[color:var(--mgh-emerald)] peer-checked:text-[color:var(--mgh-emerald)]" },
  { value: "Medium", label: "Medium", on: "peer-checked:border-[color:var(--mgh-indigo)] peer-checked:text-[color:var(--mgh-indigo)]" },
  { value: "High", label: "High", on: "peer-checked:border-[color:var(--mgh-amber)] peer-checked:text-[color:var(--mgh-amber)]" },
  { value: "Critical", label: "Critical / Sentinel Event", on: "peer-checked:border-[color:var(--mgh-rose)] peer-checked:text-[color:var(--mgh-rose)]" },
];

export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "pdf", "docx"];
const ACCEPT = ALLOWED_EXT.map((e) => `.${e}`).join(",");

const inputCls = "w-full rounded-lg border border-[color:var(--mgh-line)] bg-[color:var(--mgh-surface2)] px-3 py-2 text-sm text-[color:var(--mgh-text)] placeholder:text-[color:var(--mgh-faint)] focus:border-[color:var(--mgh-indigo)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 aria-[invalid=true]:border-[color:var(--mgh-rose)]";
const btnCls = "inline-flex items-center justify-center gap-2 rounded-lg border border-[color:var(--mgh-line)] bg-[color:var(--mgh-sub)] px-3 py-2 text-sm font-medium text-[color:var(--mgh-text)] hover:bg-[color:var(--mgh-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";
const btnRedCls = "inline-flex items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300";

/* ---------- helpers ---------- */

export const isImage = (a: { type: string; name: string }) => a.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(a.name);
export const formatSize = (b: number) => (b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);
const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

/* ---------- shared pieces (also used by the incident detail view) ---------- */

export function ImagePreview({ attachment, onClose }: { attachment: Attachment; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Preview of ${attachment.name}`} onClick={(e) => e.stopPropagation()} className="relative max-h-full max-w-4xl">
        <button type="button" autoFocus onClick={onClose} aria-label="Close preview" className="absolute -top-3 -right-3 grid h-8 w-8 place-items-center rounded-full bg-white text-slate-900 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"><X className="h-4 w-4" /></button>
        <img src={attachment.url} alt={attachment.name} className="max-h-[80vh] max-w-full rounded-lg object-contain" />
        <p className="mt-2 text-center text-sm text-white/90">{attachment.name} · {formatSize(attachment.size)}</p>
      </div>
    </div>
  );
}

export function AttachmentList({ items, onRemove, onPreview }: { items: Attachment[]; onRemove?: (id: string) => void; onPreview: (a: Attachment) => void }) {
  return (
    <ul className="space-y-2" aria-label="Attached files">
      {items.map((a) => (
        <li key={a.id} className="flex items-center gap-3 rounded-lg border border-[color:var(--mgh-line)] bg-[color:var(--mgh-sub)] p-2">
          {isImage(a) ? (
            <button type="button" onClick={() => onPreview(a)} aria-label={`Preview ${a.name}`} className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-[color:var(--mgh-line)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                    <img src={a.url} alt="" className="h-full w-full object-cover" />
            </button>
          ) : (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-[color:var(--mgh-line)] bg-[color:var(--mgh-surface2)] text-[color:var(--mgh-indigo)]" aria-hidden="true"><FileText className="h-5 w-5" /></span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[color:var(--mgh-strong)]" title={a.name}>{a.name}</p>
            <p className="text-xs text-[color:var(--mgh-faint)]">{formatSize(a.size)}</p>
          </div>
          {isImage(a) && <button type="button" onClick={() => onPreview(a)} className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-[color:var(--mgh-indigo)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"><ImageIcon className="h-3.5 w-3.5" />Preview</button>}
          {!isImage(a) && !onRemove && (
            <a href={a.url} download={a.name} className="rounded px-2 py-1 text-xs font-medium text-[color:var(--mgh-indigo)] hover:underline">Download</a>
          )}
          {onRemove && <button type="button" onClick={() => onRemove(a.id)} aria-label={`Remove ${a.name}`} className="rounded p-1.5 text-[color:var(--mgh-muted)] hover:bg-[color:var(--mgh-hover)] hover:text-[color:var(--mgh-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"><X className="h-4 w-4" /></button>}
        </li>
      ))}
    </ul>
  );
}

function Field({ id, label, required, hint, error, children }: { id: string; label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-[color:var(--mgh-muted)]">{label}{required && <span className="text-[color:var(--mgh-rose)]" aria-hidden="true"> *</span>}{required && <span className="sr-only"> (required)</span>}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-[color:var(--mgh-faint)]">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 flex items-center gap-1 text-xs font-medium text-[color:var(--mgh-rose)]"><AlertTriangle className="h-3 w-3" aria-hidden="true" />{error}</p>}
    </div>
  );
}

function Section({ letter, title, children }: { letter: string; title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="flex items-center gap-2 border-b border-[color:var(--mgh-line)] pb-2 text-sm font-semibold text-[color:var(--mgh-strong)]">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-[color:var(--mgh-sub2)] text-xs text-[color:var(--mgh-indigo)]">{letter}</span>{title}
      </h3>
      {children}
    </section>
  );
}

/* ---------- main modal ---------- */

type Errors = Partial<Record<"title" | "dept" | "occurredAt" | "severity" | "category" | "situation", string>>;
const ORDER: (keyof Errors)[] = ["title", "dept", "occurredAt", "severity", "category", "situation"];

export function IncidentReportModal({ onClose, onSubmit, reportedByDefault = "", leadSuggestions = [] }: {
  onClose: () => void;
  onSubmit: (report: IncidentReport) => void;
  reportedByDefault?: string;
  leadSuggestions?: string[];
}) {
  const base = useId();
  const id = (k: string) => `${base}-${k}`;
  const [f, setF] = useState({
    title: "", dept: "", occurredAt: nowLocal(), severity: "" as IncidentSeverity | "", category: "",
    situation: "", background: "", assessment: "", recommendation: "", mrn: "", lead: "", reportedBy: reportedByDefault,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [files, setFiles] = useState<Attachment[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<Attachment | null>(null);
  const filesRef = useRef<Attachment[]>([]);
  const submitted = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => { setF((p) => ({ ...p, [k]: v })); if (k in errors) setErrors((e) => ({ ...e, [k]: undefined })); };

  useEffect(() => { filesRef.current = files; }, [files]);

  // Lock page scroll, focus the first field, close on Escape, release object URLs if abandoned.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.getElementById(id("title"))?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      if (!submitted.current) filesRef.current.forEach((a) => URL.revokeObjectURL(a.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep Tab focus inside the dialog.
  const trap = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || preview) return;
    const nodes = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]):not(.sr-only), select, textarea, a[href]");
    if (!nodes || nodes.length === 0) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const addFiles = (list: FileList | File[]) => {
    const problems: string[] = [];
    const next = [...files];
    for (const file of Array.from(list)) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ALLOWED_EXT.includes(ext)) { problems.push(`${file.name}: unsupported type. Use JPG, PNG, WebP, PDF or DOCX.`); continue; }
      if (file.size === 0) { problems.push(`${file.name}: the file is empty.`); continue; }
      if (file.size > MAX_FILE_BYTES) { problems.push(`${file.name}: ${formatSize(file.size)} is over the 10 MB limit.`); continue; }
      if (next.some((a) => a.name === file.name && a.size === file.size)) { problems.push(`${file.name}: already attached.`); continue; }
      if (next.length >= MAX_FILES) { problems.push(`${file.name}: not added. A maximum of ${MAX_FILES} files per incident.`); continue; }
      next.push({ id: uid(), name: file.name, size: file.size, type: file.type || ext, url: URL.createObjectURL(file), file });
    }
    setFiles(next);
    setFileErrors(problems);
  };
  const removeFile = (fid: string) => {
    const hit = files.find((a) => a.id === fid);
    if (hit) URL.revokeObjectURL(hit.url);
    setFiles((p) => p.filter((a) => a.id !== fid));
    setFileErrors([]);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); dragDepth.current = 0; setDragging(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); };
  const onDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); dragDepth.current += 1; setDragging(true); };
  const onDragLeave = () => { dragDepth.current = Math.max(0, dragDepth.current - 1); if (dragDepth.current === 0) setDragging(false); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (!f.title.trim()) errs.title = "Enter a short incident title.";
    if (!f.dept) errs.dept = "Select the department or unit.";
    if (!f.occurredAt) errs.occurredAt = "Enter when the incident occurred.";
    else if (new Date(f.occurredAt).getTime() > Date.now() + 60000) errs.occurredAt = "Date and time cannot be in the future.";
    if (!f.severity) errs.severity = "Select a severity level.";
    if (!f.category) errs.category = "Select an incident category.";
    if (!f.situation.trim()) errs.situation = "Describe what happened (Situation).";
    setErrors(errs);
    const firstBad = ORDER.find((k) => errs[k]);
    if (firstBad) {
      const target = firstBad === "severity" ? document.querySelector<HTMLElement>(`[name="${id("sev")}"]`) : document.getElementById(id(firstBad));
      target?.focus();
      return;
    }
    submitted.current = true; // ownership of the object URLs passes to the consumer
    onSubmit({
      title: f.title.trim(), dept: f.dept, occurredAt: f.occurredAt, severity: f.severity as IncidentSeverity, category: f.category,
      situation: f.situation.trim(), background: f.background.trim(), assessment: f.assessment.trim(), recommendation: f.recommendation.trim(),
      mrn: f.mrn.trim(), lead: f.lead.trim(), reportedBy: f.reportedBy.trim(), attachments: files,
    });
  };

  const errKeys = ORDER.filter((k) => errors[k]);
  const desc = (k: string, hasHint = false, hasErr = false) => (hasErr ? `${id(k)}-err` : hasHint ? `${id(k)}-hint` : undefined);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-3 sm:p-6" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={id("heading")} onKeyDown={trap} onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-3xl flex-col rounded-2xl border border-[color:var(--mgh-line)] bg-[color:var(--mgh-surface)] shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-[color:var(--mgh-line)] px-5 py-4">
          <div>
            <h2 id={id("heading")} className="text-lg font-semibold text-[color:var(--mgh-strong)]">Log incident</h2>
            <p className="text-xs text-[color:var(--mgh-muted)]">Datix / SBAR incident report. Fields marked <span className="text-[color:var(--mgh-rose)]">*</span> are required.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded p-1.5 text-[color:var(--mgh-muted)] hover:bg-[color:var(--mgh-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"><X className="h-4 w-4" /></button>
        </header>

        <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-5">
            {errKeys.length > 0 && (
              <div role="alert" className="rounded-lg border border-[color:var(--mgh-rose)]/40 bg-[color:var(--mgh-rose-bg)] p-3 text-sm text-[color:var(--mgh-rose)]">
                <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" aria-hidden="true" />Please complete {errKeys.length === 1 ? "the highlighted field" : `${errKeys.length} required fields`} before submitting.</p>
              </div>
            )}

            <Section letter="A" title="Incident overview">
              <Field id={id("title")} label="Incident title / headline" required error={errors.title}>
                <input id={id("title")} value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={140} placeholder="e.g. Wrong-strength insulin infusion prescribed"
                  aria-invalid={!!errors.title} aria-describedby={desc("title", false, !!errors.title)} className={inputCls} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id={id("dept")} label="Department / unit" required error={errors.dept}>
                  <select id={id("dept")} value={f.dept} onChange={(e) => set("dept", e.target.value)} aria-invalid={!!errors.dept} aria-describedby={desc("dept", false, !!errors.dept)} className={inputCls}>
                    <option value="">Select department…</option>{INCIDENT_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field id={id("occurredAt")} label="Date & time of occurrence" required error={errors.occurredAt}>
                  <input id={id("occurredAt")} type="datetime-local" value={f.occurredAt} max={nowLocal()} onChange={(e) => set("occurredAt", e.target.value)}
                    aria-invalid={!!errors.occurredAt} aria-describedby={desc("occurredAt", false, !!errors.occurredAt)} className={inputCls} />
                </Field>
                <Field id={id("category")} label="Incident category" required error={errors.category}>
                  <select id={id("category")} value={f.category} onChange={(e) => set("category", e.target.value)} aria-invalid={!!errors.category} aria-describedby={desc("category", false, !!errors.category)} className={inputCls}>
                    <option value="">Select category…</option>{INCIDENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <fieldset aria-describedby={errors.severity ? id("sev-err") : undefined} aria-invalid={!!errors.severity}>
                  <legend className="mb-1 text-xs font-medium text-[color:var(--mgh-muted)]">Severity / risk level<span className="text-[color:var(--mgh-rose)]" aria-hidden="true"> *</span><span className="sr-only"> (required)</span></legend>
                  <div className="grid grid-cols-2 gap-2">
                    {SEVERITIES.map((s) => (
                      <label key={s.value} className="relative cursor-pointer">
                        <input type="radio" name={id("sev")} value={s.value} checked={f.severity === s.value} onChange={() => set("severity", s.value)} className="peer sr-only" />
                        <span className={`block rounded-lg border bg-[color:var(--mgh-surface2)] px-3 py-2 text-center text-sm font-medium text-[color:var(--mgh-text2)] transition peer-checked:bg-[color:var(--mgh-sub2)] peer-checked:font-semibold peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400 hover:bg-[color:var(--mgh-hover)] ${errors.severity ? "border-[color:var(--mgh-rose)]" : "border-[color:var(--mgh-line)]"} ${s.on}`}>{s.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.severity && <p id={id("sev-err")} className="mt-1 flex items-center gap-1 text-xs font-medium text-[color:var(--mgh-rose)]"><AlertTriangle className="h-3 w-3" aria-hidden="true" />{errors.severity}</p>}
                </fieldset>
              </div>
            </Section>

            <Section letter="B" title="SBAR clinical narrative">
              <Field id={id("situation")} label="Situation (S)" required hint="What happened? Describe the event concisely." error={errors.situation}>
                <textarea id={id("situation")} rows={3} value={f.situation} onChange={(e) => set("situation", e.target.value)} aria-invalid={!!errors.situation} aria-describedby={desc("situation", true, !!errors.situation)} className={inputCls} />
              </Field>
              <Field id={id("background")} label="Background (B)" hint="Relevant patient history, ward context or pre-existing factors.">
                <textarea id={id("background")} rows={3} value={f.background} onChange={(e) => set("background", e.target.value)} aria-describedby={desc("background", true)} className={inputCls} />
              </Field>
              <Field id={id("assessment")} label="Assessment (A)" hint="Immediate impact, clinical harm assessment, or near-miss classification.">
                <textarea id={id("assessment")} rows={3} value={f.assessment} onChange={(e) => set("assessment", e.target.value)} aria-describedby={desc("assessment", true)} className={inputCls} />
              </Field>
              <Field id={id("recommendation")} label="Recommendation / immediate action taken (R)" hint="What was done immediately to mitigate risk or treat the patient?">
                <textarea id={id("recommendation")} rows={3} value={f.recommendation} onChange={(e) => set("recommendation", e.target.value)} aria-describedby={desc("recommendation", true)} className={inputCls} />
              </Field>
            </Section>

            <Section letter="C" title="Person(s) involved & reporting details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id={id("mrn")} label="Patient ID / MRN (optional)" hint="Use the MRN or an anonymised reference. Do not enter patient names.">
                  <input id={id("mrn")} value={f.mrn} onChange={(e) => set("mrn", e.target.value)} autoComplete="off" aria-describedby={desc("mrn", true)} className={inputCls} />
                </Field>
                <Field id={id("lead")} label="Assigned lead / investigating officer">
                  <input id={id("lead")} value={f.lead} onChange={(e) => set("lead", e.target.value)} list={id("leads")} placeholder="Name and role" className={inputCls} />
                  <datalist id={id("leads")}>{leadSuggestions.map((l) => <option key={l} value={l} />)}</datalist>
                </Field>
                <div className="sm:col-span-2">
                  <Field id={id("reportedBy")} label="Reported by" hint="Role and name of the person reporting.">
                    <input id={id("reportedBy")} value={f.reportedBy} onChange={(e) => set("reportedBy", e.target.value)} placeholder="e.g. Staff Nurse, A. Haddad" aria-describedby={desc("reportedBy", true)} className={inputCls} />
                  </Field>
                </div>
              </div>
            </Section>

            <Section letter="D" title="Attachments">
              <div
                onDragEnter={onDragEnter} onDragOver={(e) => e.preventDefault()} onDragLeave={onDragLeave} onDrop={onDrop}
                className={`rounded-xl border-2 border-dashed p-5 text-center transition ${dragging ? "border-[color:var(--mgh-indigo)] bg-[color:var(--mgh-sub2)]" : "border-[color:var(--mgh-line)] bg-[color:var(--mgh-sub)]"}`}>
                <UploadCloud className={`mx-auto h-8 w-8 ${dragging ? "text-[color:var(--mgh-indigo)]" : "text-[color:var(--mgh-faint)]"}`} aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-[color:var(--mgh-strong)]">{dragging ? "Drop files to attach" : "Drag and drop files here"}</p>
                <p className="text-xs text-[color:var(--mgh-muted)]">Photos of equipment serial tags, medication packaging or room logs, plus PDFs and DOCX. JPG, PNG, WebP, PDF, DOCX · up to {MAX_FILES} files · 10 MB each.</p>
                <button type="button" onClick={() => inputRef.current?.click()} disabled={files.length >= MAX_FILES} className={`${btnCls} mt-3 disabled:cursor-not-allowed disabled:opacity-50`}><Paperclip className="h-4 w-4" />Browse files</button>
                <input ref={inputRef} type="file" multiple accept={ACCEPT} tabIndex={-1} className="sr-only" aria-label="Attach files"
                  onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
              </div>
              <p className="text-xs text-[color:var(--mgh-muted)]" aria-live="polite">{files.length} of {MAX_FILES} files attached</p>
              {fileErrors.length > 0 && (
                <ul role="alert" className="space-y-1 rounded-lg border border-[color:var(--mgh-rose)]/40 bg-[color:var(--mgh-rose-bg)] p-3 text-xs font-medium text-[color:var(--mgh-rose)]">
                  {fileErrors.map((m) => <li key={m} className="flex items-start gap-1.5"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />{m}</li>)}
                </ul>
              )}
              {files.length > 0 && <AttachmentList items={files} onRemove={removeFile} onPreview={setPreview} />}
            </Section>
          </div>

          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-[color:var(--mgh-line)] px-5 py-3">
            <button type="button" onClick={onClose} className={btnCls}>Cancel</button>
            <button type="submit" className={btnRedCls}>Submit incident report</button>
          </footer>
        </form>
      </div>
      {preview && <ImagePreview attachment={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
