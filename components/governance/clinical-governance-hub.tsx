"use client";

/**
 * Marifa Governance Hub (v3.4 Clinical Standard), dark layout.
 * Needs only React, Tailwind and lucide-react. Tabs, Modal and Progress are local
 * components (Radix/shadcn-shaped) so they can be swapped for @/components/ui/* later.
 * All data is placeholder data.
 */

import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle, Activity, Building2, CalendarCheck, CalendarPlus, CheckCircle2, ClipboardCheck,
  Download, Eye, FileText, Filter, Layers, Pencil, Plus, Search, ShieldCheck, TrendingUp, UserCheck, X, Zap,
  BookOpenCheck, ShieldAlert,
} from "lucide-react";

/* ---------- types & placeholder data ---------- */

type Severity = "Critical" | "High" | "Medium" | "Low";
type Status = "Under Investigation" | "CAPA Assigned" | "Under Review" | "Resolved";
type Incident = {
  id: string; stamp: string; category: string; severity: Severity; description: string;
  dept: string; lead: string; status: Status; likelihood: number; impact: number;
};

const SEVERITIES: Severity[] = ["Critical", "High", "Medium", "Low"];
const STATUSES: Status[] = ["Under Investigation", "CAPA Assigned", "Under Review", "Resolved"];
const DEPTS = ["Pediatrics", "Emergency Dept", "Inpatient Medicine", "Outpatient Clinic", "ICU", "Pharmacy", "Obstetrics"];
const LIKELIHOOD = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];
const IMPACT = ["Negligible", "Minor", "Moderate", "Major", "Catastrophic"];
const SYNC = "Today, 15:55";

const SEED: Incident[] = [
  { id: "INC-2026-089", stamp: "2026-10-19 14:20", category: "Medication Safety", severity: "Critical", description: "Tenfold dosage error near-miss in pediatric IV administration; caught at second check.", dept: "Pediatrics", lead: "Dr. Marcus Vance", status: "Under Investigation", likelihood: 5, impact: 5 },
  { id: "INC-2026-088", stamp: "2026-10-18 09:15", category: "Equipment Failure", severity: "High", description: "Defibrillator battery warning failed during morning check.", dept: "Emergency Dept", lead: "Nurse Sarah Connor", status: "CAPA Assigned", likelihood: 5, impact: 4 },
  { id: "INC-2026-087", stamp: "2026-10-17 22:05", category: "Delayed Treatment", severity: "High", description: "Door-to-antibiotic time 94 min in suspected sepsis.", dept: "Emergency Dept", lead: "Dr. Layla Haddad", status: "CAPA Assigned", likelihood: 3, impact: 4 },
  { id: "INC-2026-085", stamp: "2026-10-16 18:45", category: "Patient Fall", severity: "Medium", description: "Unassisted fall in Ward 4B; minor superficial abrasion.", dept: "Inpatient Medicine", lead: "Dr. Elena Rostova", status: "Under Review", likelihood: 5, impact: 3 },
  { id: "INC-2026-084", stamp: "2026-10-16 11:30", category: "Medication Safety", severity: "Medium", description: "Controlled drug count discrepancy, one ampoule morphine 10 mg.", dept: "Pharmacy", lead: "Pharm. Omar Al-Harbi", status: "Under Investigation", likelihood: 4, impact: 3 },
  { id: "INC-2026-083", stamp: "2026-10-15 03:10", category: "Resuscitation Equipment", severity: "Medium", description: "Resus trolley tamper seal broken and unchecked for 3 days.", dept: "ICU", lead: "Sr. Joyce Thomas", status: "Under Review", likelihood: 3, impact: 3 },
  { id: "INC-2026-081", stamp: "2026-10-14 19:00", category: "Communication", severity: "Low", description: "Handover omitted DNACPR status for transferred patient.", dept: "Inpatient Medicine", lead: "Dr. Faisal Nasser", status: "Under Investigation", likelihood: 2, impact: 2 },
  { id: "INC-2026-080", stamp: "2026-10-13 08:40", category: "Infection Control", severity: "Low", description: "Hand-hygiene lapse observed on ward round.", dept: "Obstetrics", lead: "IPC Team", status: "Under Review", likelihood: 1, impact: 1 },
  { id: "INC-2026-082", stamp: "2026-10-12 10:05", category: "Documentation", severity: "Low", description: "Unsigned consent form detected prior to minor operation.", dept: "Outpatient Clinic", lead: "Admin James Cole", status: "Resolved", likelihood: 2, impact: 1 },
  { id: "INC-2026-079", stamp: "2026-10-10 16:25", category: "Patient ID", severity: "Low", description: "Missing identification band at handover.", dept: "Inpatient Medicine", lead: "Sr. Mona Qahtani", status: "Resolved", likelihood: 1, impact: 1 },
];

const CAPA_PENDING = [
  { t: "Pediatric IV Smart Pump Lockout", s: "Due in 3 days · Assigned to Pharmacy Safety", tag: "In Progress", tone: "amber" },
  { t: "ICU Handover Standardisation Protocol", s: "Root Cause Analysis Done · Sign-off pending", tag: "Review", tone: "indigo" },
];
const CAPA_DONE = [
  { t: "ED Triage O2 Cylinder Recalibration", s: "Closed Oct 14 · Verified by Biomedical Eng." },
  { t: "Ward 3 Fall Prevention Sensor Pads", s: "Closed Oct 11 · Installed across 24 beds" },
];

const QIPS = {
  Plan: [{ t: "Door-to-ECG under 10 minutes", o: "Emergency Dept" }, { t: "Falls-prevention bundle, elderly wards", o: "Geriatrics" }],
  Do: [{ t: "Sepsis screening tool at triage", o: "Emergency Dept" }, { t: "VTE risk reassessment at 24 h", o: "Surgery" }],
  Study: [{ t: "Early mobilisation after laparotomy", o: "Surgery" }],
  Act: [{ t: "Discharge summary within 24 h", o: "Inpatient Medicine" }, { t: "Blood cultures before antibiotics", o: "Inpatient Medicine" }],
} as const;
const AUDITS = [
  { n: "Controlled Drug Audit Q3", o: "Pharmacy", due: "31 Oct 2026", p: 78, target: 95, cur: 91 },
  { n: "Prescribing Safety: VTE and antibiotics", o: "Inpatient Medicine", due: "15 Nov 2026", p: 42, target: 90, cur: 84 },
  { n: "Infection Control: hand hygiene", o: "IPC Team", due: "05 Nov 2026", p: 66, target: 95, cur: 97 },
  { n: "Resuscitation Equipment Checks", o: "ICU", due: "28 Oct 2026", p: 90, target: 100, cur: 88 },
  { n: "SBAR Medication Near-Miss Log review", o: "Pharmacy", due: "20 Nov 2026", p: 15, target: 90, cur: 80 },
];
type Protocol = { title: string; version: string; owner: string; due: string; status: "Approved" | "Pending Committee Review" | "Overdue" };
const PROTOCOLS: Protocol[] = [
  { title: "Diabetic Ketoacidosis in Adults", version: "v3.2", owner: "Dr. S. Khan", due: "12 Mar 2027", status: "Approved" },
  { title: "Sepsis: Recognition and First Hour", version: "v4.0", owner: "Dr. A. Rahman", due: "01 Nov 2026", status: "Pending Committee Review" },
  { title: "Hyperkalaemia Emergency Management", version: "v2.1", owner: "Dr. L. Farouk", due: "30 Sep 2026", status: "Overdue" },
  { title: "Massive Transfusion Protocol", version: "v1.8", owner: "Haematology", due: "14 Jan 2027", status: "Approved" },
  { title: "Rapid Sequence Intubation in the ED", version: "v2.0", owner: "Dr. N. Saleh", due: "10 Oct 2026", status: "Overdue" },
];
const SIGN_ALERTS = [
  { id: "s1", t: "Batch #8819 infusion sets recall", read: 388, total: 491 },
  { id: "s2", t: "Look-alike insulin pens: stock alert", read: 421, total: 491 },
];
const DOMAINS = [
  { n: "Safe", s: 88 }, { n: "Effective", s: 92 }, { n: "Caring", s: 96 }, { n: "Responsive", s: 81 }, { n: "Well-led", s: 85 },
];
const CHECK_SEED = [
  { id: "c1", t: "Mock inspection: Medicines management", d: true },
  { id: "c2", t: "Evidence folder: duty of candour letters (Q3)", d: false },
  { id: "c3", t: "Update risk register with top 5 open risks", d: false },
  { id: "c4", t: "Staff interviews: safeguarding and escalation", d: false },
  { id: "c5", t: "Verify resuscitation and fire equipment logs", d: true },
];
const SCHEDULE = [
  { t: "Mortality & Morbidity (M&M) Review", w: "Tomorrow, 08:00 AM", r: "Seminar Room B" },
  { t: "Medicines Governance Committee", w: "Oct 23, 14:00 PM", r: "Virtual / Teams" },
  { t: "Infection Prevention Quality Circle", w: "Oct 27, 10:30 AM", r: "Conference Room 1" },
];
const FEED = [
  { t: "Controlled Drugs Register Approved", w: "Signed off by Chief Pharmacist · 1 h ago", tone: "ok" },
  { t: "INC-2026-082 resolved", w: "Admin James Cole · 3 h ago", tone: "ok" },
  { t: "CAPA-114 progress updated to 60%", w: "Pharmacy Safety · Yesterday", tone: "info" },
  { t: "RSI protocol review became overdue", w: "System · Oct 10", tone: "bad" },
];

/* ---------- style helpers ---------- */

const DARK_TOKENS = `--mgh-bg:#070b17;--mgh-surface:#0d1426;--mgh-surface2:#0a1020;--mgh-header:rgba(10,16,32,.95);
--mgh-strong:#ffffff;--mgh-text:#e2e8f0;--mgh-text2:#cbd5e1;--mgh-muted:#94a3b8;--mgh-faint:#8190a5;
--mgh-line:rgba(255,255,255,.10);--mgh-line2:rgba(255,255,255,.05);--mgh-sub:rgba(255,255,255,.04);--mgh-sub2:rgba(255,255,255,.10);--mgh-hover:rgba(255,255,255,.07);
--mgh-indigo:#a5b4fc;--mgh-emerald:#6ee7b7;--mgh-rose:#fda4af;--mgh-amber:#fcd34d;--mgh-rose-bg:rgba(76,5,25,.35);
--mgh-h-low:rgba(6,78,59,.5);--mgh-h-mod:rgba(69,26,3,.5);--mgh-h-high:rgba(124,45,18,.45);--mgh-h-crit:rgba(159,18,57,.5);--mgh-h-vcrit:rgba(76,5,25,.8);
--mgh-bubble:rgba(0,0,0,.4);--mgh-bubble-text:#ffffff;`;
const LIGHT_TOKENS = `--mgh-bg:#f4f6fb;--mgh-surface:#ffffff;--mgh-surface2:#f8fafc;--mgh-header:rgba(255,255,255,.95);
--mgh-strong:#0f172a;--mgh-text:#1e293b;--mgh-text2:#475569;--mgh-muted:#586579;--mgh-faint:#64748b;
--mgh-line:rgba(15,23,42,.14);--mgh-line2:rgba(15,23,42,.07);--mgh-sub:rgba(15,23,42,.035);--mgh-sub2:rgba(15,23,42,.09);--mgh-hover:rgba(15,23,42,.06);
--mgh-indigo:#4338ca;--mgh-emerald:#047857;--mgh-rose:#be123c;--mgh-amber:#b45309;--mgh-rose-bg:#fff1f2;
--mgh-h-low:#d1fae5;--mgh-h-mod:#fef3c7;--mgh-h-high:#fed7aa;--mgh-h-crit:#fecdd3;--mgh-h-vcrit:#fda4af;
--mgh-bubble:#0f172a;--mgh-bubble-text:#ffffff;`;
/** Light by default; dark when the app sets data-theme="dark" / .dark, or (if no explicit theme) when the OS prefers dark. */
const THEME_CSS = `
.mgh{${LIGHT_TOKENS}color-scheme:light}
html[data-theme="dark"] .mgh,html.dark .mgh,.dark .mgh{${DARK_TOKENS}color-scheme:dark}
@media (prefers-color-scheme: dark){html:not([data-theme="light"]):not(.light) .mgh{${DARK_TOKENS}color-scheme:dark}}
`;


const SEV_PILL: Record<Severity, string> = {
  Critical: "border-rose-500/40 bg-rose-500/15 text-[color:var(--mgh-rose)]",
  High: "border-amber-500/40 bg-amber-500/15 text-[color:var(--mgh-amber)]",
  Medium: "border-indigo-400/40 bg-indigo-500/15 text-[color:var(--mgh-indigo)]",
  Low: "border-slate-500/40 bg-slate-500/15 text-[color:var(--mgh-text2)]",
};
const STATUS_DOT: Record<Status, string> = {
  "Under Investigation": "bg-amber-400", "CAPA Assigned": "bg-amber-400", "Under Review": "bg-indigo-400", Resolved: "bg-emerald-400",
};
const cellTone = (s: number) =>
  s >= 20 ? "bg-[color:var(--mgh-h-vcrit)] border-[color:var(--mgh-line)]" : s >= 15 ? "bg-[color:var(--mgh-h-crit)] border-[color:var(--mgh-line)]" : s >= 10 ? "bg-[color:var(--mgh-h-high)] border-[color:var(--mgh-line)]"
  : s >= 5 ? "bg-[color:var(--mgh-h-mod)] border-[color:var(--mgh-line)]" : "bg-[color:var(--mgh-h-low)] border-[color:var(--mgh-line)]";
const bar = (v: number, t = 90) => (v >= t ? "bg-emerald-400" : v >= t - 10 ? "bg-amber-400" : "bg-rose-400");

const card = "rounded-2xl border border-[color:var(--mgh-line)] bg-[color:var(--mgh-surface)]";
const input = "w-full rounded-lg border border-[color:var(--mgh-line)] bg-[color:var(--mgh-surface2)] px-3 py-2 text-sm text-[color:var(--mgh-text)] placeholder:text-[color:var(--mgh-faint)] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";
const btn = "inline-flex items-center justify-center gap-2 rounded-lg border border-[color:var(--mgh-line)] bg-[color:var(--mgh-sub)] px-3 py-2 text-sm font-medium text-[color:var(--mgh-text)] hover:bg-[color:var(--mgh-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";
const btnRed = "inline-flex items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-900/40 hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300";

/* ---------- primitives ---------- */

function Panel({ title, sub, icon, right, children, className = "" }: { title: string; sub?: string; icon?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`${card} ${className}`}>
      <header className="flex items-start justify-between gap-3 px-5 pt-4">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-[color:var(--mgh-strong)]">{icon}{title}</h3>
          {sub && <p className="mt-0.5 text-xs text-[color:var(--mgh-muted)]">{sub}</p>}
        </div>
        {right}
      </header>
      <div className="p-5 pt-4">{children}</div>
    </section>
  );
}

function Bar({ v, tone, label }: { v: number; tone: string; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--mgh-sub2)]">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, v)}%` }} />
    </div>
  );
}

function Ring({ v }: { v: number }) {
  const r = 30, c = 2 * Math.PI * r;
  return (
    <div className="relative h-[72px] w-[72px]" role="img" aria-label={`Score ${v} percent`}>
      <svg viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} className="[stroke:var(--mgh-sub2)]" strokeWidth="6" fill="none" />
        <circle cx="36" cy="36" r={r} stroke="#34d399" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} />
      </svg>
      <ShieldCheck className="absolute inset-0 m-auto h-6 w-6 text-[color:var(--mgh-emerald)]" />
    </div>
  );
}

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className={`${card} w-full max-w-md p-5 shadow-2xl`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[color:var(--mgh-strong)]">{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded p-1 text-[color:var(--mgh-muted)] hover:bg-[color:var(--mgh-hover)]"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block text-xs font-medium text-[color:var(--mgh-muted)]">{label}<div className="mt-1">{children}</div></label>
);

/* ---------- main ---------- */

export default function MarifaGovernanceHub() {
  const [tab, setTab] = useState("incidents");
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All Departments");
  const [sev, setSev] = useState("All Severities");
  const [incidents, setIncidents] = useState<Incident[]>(SEED);
  const [cell, setCell] = useState<{ l: number; i: number } | null>(null);
  const [modal, setModal] = useState<null | "incident" | "audit">(null);
  const [view, setView] = useState<Incident | null>(null);
  const [ack, setAck] = useState(false);
  const [signed, setSigned] = useState<Record<string, boolean>>({});
  const [checks, setChecks] = useState(CHECK_SEED);
  const [toast, setToast] = useState("");
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2800); };

  // Search, department and severity apply to KPIs, matrix and log.
  const base = useMemo(() => {
    const t = q.trim().toLowerCase();
    return incidents.filter((x) =>
      (dept === "All Departments" || x.dept === dept) && (sev === "All Severities" || x.severity === sev) &&
      (!t || [x.id, x.category, x.description, x.dept, x.lead].some((s) => s.toLowerCase().includes(t))));
  }, [incidents, q, dept, sev]);
  const log = cell ? base.filter((x) => x.likelihood === cell.l && x.impact === cell.i) : base;
  const open = base.filter((x) => x.status !== "Resolved");
  const n = (s: Severity) => open.filter((x) => x.severity === s).length;

  const advance = (id: string) =>
    setIncidents((p) => p.map((x) => (x.id === id ? { ...x, status: STATUSES[(STATUSES.indexOf(x.status) + 1) % STATUSES.length] } : x)));

  const exportCsv = () => {
    const rows = [["ID", "Date", "Category", "Severity", "Description", "Department", "Lead", "Status"],
      ...base.map((x) => [x.id, x.stamp, x.category, x.severity, `"${x.description.replace(/"/g, '""')}"`, x.dept, x.lead, x.status])];
    const url = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "governance-incidents.csv"; a.click(); URL.revokeObjectURL(url);
    flash("Report exported (CSV)");
  };

  const overdue = PROTOCOLS.filter((p) => p.status === "Overdue").length;
  const fresh = Math.round((PROTOCOLS.filter((p) => p.status === "Approved").length / PROTOCOLS.length) * 100);

  const TABS = [
    { id: "incidents", label: "Incident & Risk Management", badge: `${open.length} Open`, icon: <AlertTriangle className="h-4 w-4" /> },
    { id: "audits", label: "Clinical Audits & QIPs", badge: `${AUDITS.length} Active`, icon: <Activity className="h-4 w-4" /> },
    { id: "protocols", label: "Guidelines & Lifecycle", badge: `${PROTOCOLS.length - PROTOCOLS.filter((p) => p.status === "Approved").length + 9} Due`, icon: <FileText className="h-4 w-4" /> },
    { id: "regulatory", label: "Regulatory & CQC Readiness", badge: "", icon: <ShieldCheck className="h-4 w-4" /> },
  ];

  return (
    <div className="mgh min-h-screen bg-[color:var(--mgh-bg)] text-[color:var(--mgh-text)]">
      <style>{THEME_CSS}</style>
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-[color:var(--mgh-line)] bg-[color:var(--mgh-surface2)]/95 px-4 py-4 backdrop-blur md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-indigo-400/30 bg-indigo-500/15"><ShieldCheck className="h-6 w-6 text-[color:var(--mgh-indigo)]" /></div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-[color:var(--mgh-strong)]">Marifa Governance Hub</h1>
                <span className="rounded-full border border-indigo-400/30 bg-indigo-500/15 px-2.5 py-0.5 text-xs font-medium text-[color:var(--mgh-indigo)]">v3.4 Clinical Standard</span>
              </div>
              <p className="mt-1 max-w-xl text-sm text-[color:var(--mgh-muted)]">Accountable clinical review, quality oversight, and regulatory compliance tracking across departments.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={btn} onClick={exportCsv}><Download className="h-4 w-4" />Export Report</button>
            <button className={btn} onClick={() => window.print()}><FileText className="h-4 w-4" />PDF</button>
            <button className={btn} onClick={() => setModal("audit")}><CalendarPlus className="h-4 w-4" />Schedule Audit</button>
            <button className={btnRed} onClick={() => setModal("incident")}><Plus className="h-4 w-4" />Log Incident</button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[color:var(--mgh-line)] pt-4" role="search">
          <div className="relative min-w-[220px] flex-1 md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--mgh-faint)]" />
            <input aria-label="Search incidents, guidelines or audits" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search incidents, guidelines, or audits" className={`${input} pl-9`} />
          </div>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--mgh-faint)]" />
            <select aria-label="Department" value={dept} onChange={(e) => setDept(e.target.value)} className={`${input} w-auto pl-9`}>
              <option>All Departments</option>{DEPTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--mgh-faint)]" />
            <select aria-label="Severity" value={sev} onChange={(e) => setSev(e.target.value)} className={`${input} w-auto pl-9`}>
              <option>All Severities</option>{SEVERITIES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <p className="ml-auto flex items-center gap-2 text-sm text-[color:var(--mgh-muted)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />Live Governance Sync: <b className="text-[color:var(--mgh-strong)]">{SYNC}</b>
          </p>
        </div>
      </header>

      <div className="grid gap-5 p-4 md:p-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <main className="min-w-0 space-y-5">
          {/* KPI grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className={`${card} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[color:var(--mgh-text2)]">Overall Compliance Score</p>
                  <p className="mt-2 flex items-baseline gap-2 text-4xl font-bold text-[color:var(--mgh-strong)]">94%<span className="flex items-center gap-1 text-sm font-medium text-[color:var(--mgh-emerald)]"><TrendingUp className="h-3.5 w-3.5" />+2.1%</span></p>
                  <p className="mt-1 text-xs text-[color:var(--mgh-faint)]">Target: &gt;90% | Tier 1 Regulatory Standard</p>
                </div>
                <Ring v={94} />
              </div>
              <div className="mt-3"><Bar v={94} tone="bg-emerald-400" label="Overall compliance" /></div>
            </div>
            <div className={`${card} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[color:var(--mgh-text2)]">Open Incidents & Near-Misses</p>
                  <p className="mt-2 flex items-baseline gap-2 text-4xl font-bold text-[color:var(--mgh-strong)]">{open.length}<span className="text-sm font-medium text-[color:var(--mgh-rose)]">{n("Critical")} Critical</span></p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-rose-500/30 bg-rose-500/10"><AlertTriangle className="h-5 w-5 text-[color:var(--mgh-rose)]" /></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[color:var(--mgh-rose)]">{n("Critical")} Crit</span>
                <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[color:var(--mgh-amber)]">{n("High")} High</span>
                <span className="rounded border border-[color:var(--mgh-line)] bg-[color:var(--mgh-sub)] px-2 py-1 text-[color:var(--mgh-text2)]">{n("Medium") + n("Low")} Med/Low</span>
              </div>
            </div>
            <div className={`${card} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[color:var(--mgh-text2)]">Policy & Guideline Freshness</p>
                  <p className="mt-2 flex items-baseline gap-2 text-4xl font-bold text-[color:var(--mgh-strong)]">88%<span className="text-sm font-medium text-[color:var(--mgh-amber)]">12 Pending Review</span></p>
                  <p className="mt-1 text-xs text-[color:var(--mgh-faint)]">{overdue} Overdue for Annual Sign-Off</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10"><FileText className="h-5 w-5 text-[color:var(--mgh-amber)]" /></div>
              </div>
              <div className="mt-3"><Bar v={88} tone="bg-amber-400" label="Guideline freshness" /></div>
            </div>
            <div className={`${card} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[color:var(--mgh-text2)]">Mandatory Training Compliance</p>
                  <p className="mt-2 flex items-baseline gap-2 text-4xl font-bold text-[color:var(--mgh-strong)]">92%<span className="text-sm font-medium text-[color:var(--mgh-emerald)]">Target Met</span></p>
                  <p className="mt-1 text-xs text-[color:var(--mgh-faint)]">452 / 491 Clinical Staff Verified</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-indigo-400/30 bg-indigo-500/10"><UserCheck className="h-5 w-5 text-[color:var(--mgh-indigo)]" /></div>
              </div>
              <div className="mt-3"><Bar v={92} tone="bg-indigo-400" label="Training compliance" /></div>
            </div>
          </div>

          {/* Tabs */}
          <div role="tablist" aria-label="Governance workspaces" className="flex gap-1 overflow-x-auto border-b border-[color:var(--mgh-line)]">
            {TABS.map((t) => (
              <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => setTab(t.id)}
                className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${tab === t.id ? "border-indigo-400 text-[color:var(--mgh-indigo)]" : "border-transparent text-[color:var(--mgh-muted)] hover:text-[color:var(--mgh-text)]"}`}>
                {t.icon}{t.label}
                {t.badge && <span className="rounded-full bg-[color:var(--mgh-sub2)] px-2 py-0.5 text-[11px] text-[color:var(--mgh-text2)]">{t.badge}</span>}
              </button>
            ))}
          </div>

          {tab === "incidents" && (
            <div role="tabpanel" id="panel-incidents" aria-labelledby="tab-incidents" className="space-y-5">
              <Panel title="Clinical Risk Matrix (5x5 Heatmap)" sub="Likelihood vs. Severity of active clinical risks across the organisation." icon={<Layers className="h-4 w-4 text-[color:var(--mgh-indigo)]" />}
                right={<button className="text-sm font-medium text-[color:var(--mgh-indigo)] hover:underline" onClick={() => setCell(null)}>Reset Matrix Filter</button>}>
                <div className="overflow-x-auto">
                  <div className="grid min-w-[560px] grid-cols-[8rem_repeat(5,1fr)] gap-1.5" role="grid" aria-label="Risk matrix">
                    <div className="grid place-items-center text-xs text-[color:var(--mgh-faint)]">Likelihood \ Impact</div>
                    {IMPACT.map((l, i) => <div key={l} className="grid place-items-center py-2 text-xs font-medium text-[color:var(--mgh-text2)]">{i + 1}. {l}</div>)}
                    {[5, 4, 3, 2, 1].map((l) => (
                      <div key={l} className="contents" role="row">
                        <div className="grid place-items-center rounded-lg bg-[color:var(--mgh-sub)] text-xs font-medium text-[color:var(--mgh-text2)]">{l}. {LIKELIHOOD[l - 1]}</div>
                        {[1, 2, 3, 4, 5].map((i) => {
                          const c = base.filter((x) => x.likelihood === l && x.impact === i).length;
                          const sel = cell?.l === l && cell?.i === i;
                          return (
                            <button key={i} role="gridcell" aria-label={`Likelihood ${l}, impact ${i}, ${c} incidents`} onClick={() => setCell(sel ? null : { l, i })}
                              className={`grid h-16 place-items-center rounded-lg border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${cellTone(l * i)} ${sel ? "ring-2 ring-[color:var(--mgh-strong)]" : ""}`}>
                              {c ? <span className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--mgh-bubble)] text-sm font-bold text-[color:var(--mgh-bubble-text)]">{c}</span> : <span className="text-[color:var(--mgh-faint)]">-</span>}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--mgh-line)] pt-3 text-xs text-[color:var(--mgh-muted)]">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Low Risk</span>
                    <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-orange-500" />Moderate Risk</span>
                    <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-rose-500" />High / Critical Risk</span>
                  </div>
                  <span>Click cell to filter incidents log</span>
                </div>
              </Panel>

              <Panel title="Active Incident Log & SBAR Records" sub="Real-time Datix/SBAR clinical incident notifications." icon={<AlertTriangle className="h-4 w-4 text-[color:var(--mgh-rose)]" />}
                right={<span className="text-sm text-[color:var(--mgh-muted)]">Showing {log.length} Records</span>}>
                <div className="-mx-5 overflow-x-auto">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="border-y border-[color:var(--mgh-line)] bg-[color:var(--mgh-sub)] text-[11px] uppercase tracking-wider text-[color:var(--mgh-muted)]">
                      <tr>{["Incident ID / Date", "Category", "Severity", "Description", "Dept & Lead", "Status", "Action"].map((h) => <th key={h} scope="col" className="px-5 py-3 font-semibold">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--mgh-line2)]">
                      {log.map((x) => (
                        <tr key={x.id} className="hover:bg-[color:var(--mgh-hover)]">
                          <td className="px-5 py-3 font-mono text-xs text-[color:var(--mgh-text)]">{x.id}<div className="text-[color:var(--mgh-faint)]">{x.stamp}</div></td>
                          <td className="px-5 py-3">{x.category}</td>
                          <td className="px-5 py-3"><span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${SEV_PILL[x.severity]}`}>{x.severity}</span></td>
                          <td className="max-w-[260px] px-5 py-3"><p className="truncate" title={x.description}>{x.description}</p></td>
                          <td className="px-5 py-3">{x.dept}<div className="text-xs text-[color:var(--mgh-faint)]">{x.lead}</div></td>
                          <td className="px-5 py-3"><span className="flex items-center gap-2"><i className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[x.status]}`} />{x.status}</span></td>
                          <td className="px-5 py-3">
                            <div className="flex gap-2 text-[color:var(--mgh-muted)]">
                              <button aria-label={`View ${x.id}`} className="rounded p-1 hover:bg-[color:var(--mgh-hover)] hover:text-[color:var(--mgh-strong)]" onClick={() => setView(x)}><Eye className="h-4 w-4" /></button>
                              <button aria-label={`Advance status of ${x.id}`} title="Advance status" className="rounded p-1 hover:bg-[color:var(--mgh-hover)] hover:text-[color:var(--mgh-strong)]" onClick={() => advance(x.id)}><Pencil className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {log.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-[color:var(--mgh-faint)]">No incidents match the current filters.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <div className="grid gap-5 md:grid-cols-2">
                <Panel title="Pending CAPA Investigations" icon={<Zap className="h-4 w-4 text-[color:var(--mgh-indigo)]" />}>
                  <ul className="space-y-3">
                    {CAPA_PENDING.map((c) => (
                      <li key={c.t} className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--mgh-line)] bg-[color:var(--mgh-sub)] p-3">
                        <div><p className="text-sm font-semibold text-[color:var(--mgh-strong)]">{c.t}</p><p className="text-xs text-[color:var(--mgh-faint)]">{c.s}</p></div>
                        <span className={`shrink-0 rounded border px-2 py-1 text-xs ${c.tone === "amber" ? "border-amber-500/40 bg-amber-500/10 text-[color:var(--mgh-amber)]" : "border-indigo-400/40 bg-indigo-500/15 text-[color:var(--mgh-indigo)]"}`}>{c.tag}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
                <Panel title="Completed Remediation Actions" icon={<CheckCircle2 className="h-4 w-4 text-[color:var(--mgh-emerald)]" />}>
                  <ul className="space-y-3">
                    {CAPA_DONE.map((c) => (
                      <li key={c.t} className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--mgh-line)] bg-[color:var(--mgh-sub)] p-3">
                        <div><p className="text-sm font-semibold text-[color:var(--mgh-strong)]">{c.t}</p><p className="text-xs text-[color:var(--mgh-faint)]">{c.s}</p></div>
                        <span className="shrink-0 rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs text-[color:var(--mgh-emerald)]">Verified</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </div>
            </div>
          )}

          {tab === "audits" && (
            <div role="tabpanel" id="panel-audits" aria-labelledby="tab-audits" className="space-y-5">
              <Panel title="Quality Improvement Projects: PDSA Cycle" icon={<Layers className="h-4 w-4 text-[color:var(--mgh-indigo)]" />}>
                <div className="grid gap-3 md:grid-cols-4">
                  {(Object.keys(QIPS) as (keyof typeof QIPS)[]).map((col) => (
                    <div key={col} role="group" aria-label={`${col} column`} className="rounded-xl border border-[color:var(--mgh-line)] bg-[color:var(--mgh-sub)] p-3">
                      <h4 className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[color:var(--mgh-muted)]">{col}<span className="rounded-full bg-[color:var(--mgh-sub2)] px-2 py-0.5 text-[color:var(--mgh-text2)]">{QIPS[col].length}</span></h4>
                      <ul className="space-y-2">{QIPS[col].map((p) => <li key={p.t} className="rounded-lg border border-[color:var(--mgh-line)] bg-[color:var(--mgh-surface2)] p-2.5 text-sm text-[color:var(--mgh-text)]">{p.t}<p className="mt-1 text-xs text-[color:var(--mgh-faint)]">{p.o}</p></li>)}</ul>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="Upcoming & Active Audits" icon={<ClipboardCheck className="h-4 w-4 text-[color:var(--mgh-indigo)]" />}>
                <ul className="divide-y divide-[color:var(--mgh-line)]">
                  {AUDITS.map((a) => (
                    <li key={a.n} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div><p className="text-sm font-semibold text-[color:var(--mgh-strong)]">{a.n}</p><p className="text-xs text-[color:var(--mgh-faint)]">Owner: {a.o} · Target date {a.due}</p></div>
                        <span className={`rounded border px-2 py-1 text-xs ${a.cur >= a.target ? "border-emerald-500/40 bg-emerald-500/10 text-[color:var(--mgh-emerald)]" : "border-amber-500/40 bg-amber-500/10 text-[color:var(--mgh-amber)]"}`}>Compliance {a.cur}% / target {a.target}%</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3"><Bar v={a.p} tone="bg-indigo-400" label={`${a.n} progress`} /><span className="w-10 text-xs text-[color:var(--mgh-muted)]">{a.p}%</span></div>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          )}

          {tab === "protocols" && (
            <div role="tabpanel" id="panel-protocols" aria-labelledby="tab-protocols" className="space-y-5">
              <Panel title="Version-Controlled Protocols" sub={`${fresh}% of listed protocols are approved and in date.`} icon={<BookOpenCheck className="h-4 w-4 text-[color:var(--mgh-indigo)]" />}>
                <div className="-mx-5 overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="border-y border-[color:var(--mgh-line)] bg-[color:var(--mgh-sub)] text-[11px] uppercase tracking-wider text-[color:var(--mgh-muted)]">
                      <tr>{["Protocol", "Version", "Author / Owner", "Review due", "Status"].map((h) => <th key={h} scope="col" className="px-5 py-3 font-semibold">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--mgh-line2)]">
                      {PROTOCOLS.map((p) => (
                        <tr key={p.title} className="hover:bg-[color:var(--mgh-hover)]">
                          <td className="px-5 py-3 font-medium text-[color:var(--mgh-strong)]">{p.title}</td><td className="px-5 py-3 font-mono text-xs">{p.version}</td>
                          <td className="px-5 py-3">{p.owner}</td><td className="px-5 py-3">{p.due}</td>
                          <td className="px-5 py-3"><span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${p.status === "Approved" ? "border-emerald-500/40 bg-emerald-500/10 text-[color:var(--mgh-emerald)]" : p.status === "Overdue" ? "border-rose-500/40 bg-rose-500/15 text-[color:var(--mgh-rose)]" : "border-amber-500/40 bg-amber-500/10 text-[color:var(--mgh-amber)]"}`}>{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <Panel title="Read & Sign: High-Risk Clinical Alerts" icon={<ShieldAlert className="h-4 w-4 text-[color:var(--mgh-rose)]" />}>
                <ul className="space-y-3">
                  {SIGN_ALERTS.map((a) => {
                    const read = a.read + (signed[a.id] ? 1 : 0), pct = Math.round((read / a.total) * 100);
                    return (
                      <li key={a.id} className="rounded-xl border border-[color:var(--mgh-line)] bg-[color:var(--mgh-sub)] p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-[color:var(--mgh-strong)]">{a.t}</p>
                          <button className={signed[a.id] ? btn : btnRed} disabled={signed[a.id]} onClick={() => { setSigned((s) => ({ ...s, [a.id]: true })); flash("Acknowledgement recorded"); }}>
                            <CheckCircle2 className="h-4 w-4" />{signed[a.id] ? "Signed" : "Read & Sign"}
                          </button>
                        </div>
                        <div className="mt-2 flex items-center gap-3"><Bar v={pct} tone={bar(pct, 95)} label="Acknowledgement progress" /><span className="whitespace-nowrap text-xs text-[color:var(--mgh-muted)]">{read}/{a.total} staff</span></div>
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            </div>
          )}

          {tab === "regulatory" && (
            <div role="tabpanel" id="panel-regulatory" aria-labelledby="tab-regulatory" className="space-y-5">
              <Panel title="Readiness by Domain" sub="Safe, Effective, Caring, Responsive, Well-led. Map to your accreditation framework (e.g. CBAHI, JCI) before use." icon={<ShieldCheck className="h-4 w-4 text-[color:var(--mgh-indigo)]" />}>
                <ul className="space-y-3">
                  {DOMAINS.map((d) => (
                    <li key={d.n} className="flex items-center gap-3">
                      <span className="w-24 text-sm font-medium text-[color:var(--mgh-strong)]">{d.n}</span>
                      <Bar v={d.s} tone={bar(d.s)} label={`${d.n} readiness`} />
                      <span className="w-10 text-right text-sm text-[color:var(--mgh-text2)]">{d.s}%</span>
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel title="Mock Inspection Action Items" sub={`${checks.filter((c) => c.d).length} of ${checks.length} complete`} icon={<ClipboardCheck className="h-4 w-4 text-[color:var(--mgh-indigo)]" />}>
                <ul className="space-y-1">
                  {checks.map((c) => (
                    <li key={c.id}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-[color:var(--mgh-hover)]">
                        <input type="checkbox" checked={c.d} onChange={() => setChecks((l) => l.map((x) => (x.id === c.id ? { ...x, d: !x.d } : x)))} className="mt-0.5 h-4 w-4 accent-indigo-500" />
                        <span className={`text-sm ${c.d ? "text-[color:var(--mgh-faint)] line-through" : "text-[color:var(--mgh-text)]"}`}>{c.t}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          )}
        </main>

        {/* Action panel (stacks below main on tablet) */}
        <aside className="space-y-5" aria-label="Action panel">
          <div role="alert" className="rounded-2xl border border-rose-500/30 bg-[color:var(--mgh-rose-bg)] p-5">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[color:var(--mgh-rose)]"><AlertTriangle className="h-4 w-4" />Urgent Patient Safety Notice</h3>
            <p className="mt-3 text-sm text-[color:var(--mgh-text)]">National Patient Safety Alert: Recall notice for Batch #8819 Infusion Sets due to flow regulator calibration variance.</p>
            {overdue > 0 && <p className="mt-2 text-xs text-[color:var(--mgh-rose)]">Also: {overdue} high-risk protocols overdue for sign-off.</p>}
            <div className="mt-4 flex items-center justify-between border-t border-[color:var(--mgh-line)] pt-3 text-xs">
              <span className="text-[color:var(--mgh-muted)]">Issued: 2 hours ago</span>
              <button onClick={() => { setAck(true); flash("Alert acknowledged"); }} disabled={ack} className="font-semibold text-[color:var(--mgh-rose)] hover:underline disabled:text-[color:var(--mgh-emerald)] disabled:no-underline">
                {ack ? "Acknowledged ✓" : "Acknowledge Alert →"}
              </button>
            </div>
          </div>

          <Panel title="Governance Schedule" icon={<CalendarCheck className="h-4 w-4 text-[color:var(--mgh-indigo)]" />}
            right={<button className="text-xs font-medium text-[color:var(--mgh-indigo)] hover:underline" onClick={() => flash("Calendar opened (mock-up)")}>View Calendar</button>}>
            <ul className="space-y-3">
              {SCHEDULE.map((m) => (
                <li key={m.t} className="rounded-xl border border-[color:var(--mgh-line)] bg-[color:var(--mgh-sub)] p-3">
                  <p className="text-sm font-semibold text-[color:var(--mgh-strong)]">{m.t}</p>
                  <div className="mt-1 flex justify-between text-xs text-[color:var(--mgh-faint)]"><span>{m.w}</span><span>{m.r}</span></div>
                  <button className="mt-2 text-xs font-medium text-[color:var(--mgh-indigo)] hover:underline" onClick={() => flash(`Agenda opened: ${m.t}`)}>Open agenda</button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Recent Audit Activity Feed" icon={<Activity className="h-4 w-4 text-[color:var(--mgh-emerald)]" />}>
            <ol className="space-y-4">
              {FEED.map((f) => (
                <li key={f.t} className="flex gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${f.tone === "ok" ? "bg-emerald-400" : f.tone === "bad" ? "bg-rose-400" : "bg-indigo-400"}`} />
                  <div><p className="text-sm font-medium text-[color:var(--mgh-strong)]">{f.t}</p><p className="text-xs text-[color:var(--mgh-faint)]">{f.w}</p></div>
                </li>
              ))}
            </ol>
          </Panel>
        </aside>
      </div>

      {/* Modals */}
      <Modal open={modal === "incident"} title="Log Incident" onClose={() => setModal(null)}>
        <form className="space-y-3" onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const next: Incident = {
            id: `INC-2026-${String(90 + incidents.length - SEED.length).padStart(3, "0")}`, stamp: "2026-10-20 15:55",
            category: String(f.get("category")), severity: f.get("severity") as Severity, description: String(f.get("description")),
            dept: String(f.get("dept")), lead: "Unassigned", status: "Under Investigation",
            likelihood: Number(f.get("l")), impact: Number(f.get("i")),
          };
          setIncidents((p) => [next, ...p]); setModal(null); flash(`${next.id} logged`);
        }}>
          <Field label="Description"><textarea name="description" required rows={3} className={input} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category"><input name="category" required defaultValue="Medication Safety" className={input} /></Field>
            <Field label="Department"><select name="dept" className={input}>{DEPTS.map((d) => <option key={d}>{d}</option>)}</select></Field>
            <Field label="Severity"><select name="severity" className={input}>{SEVERITIES.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <div />
            <Field label="Likelihood (1-5)"><input name="l" type="number" min={1} max={5} defaultValue={3} className={input} /></Field>
            <Field label="Impact (1-5)"><input name="i" type="number" min={1} max={5} defaultValue={3} className={input} /></Field>
          </div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" className={btn} onClick={() => setModal(null)}>Cancel</button><button type="submit" className={btnRed}>Log Incident</button></div>
        </form>
      </Modal>

      <Modal open={modal === "audit"} title="Schedule Audit" onClose={() => setModal(null)}>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setModal(null); flash("Audit scheduled (mock-up)"); }}>
          <Field label="Audit"><select className={input}>{AUDITS.map((a) => <option key={a.n}>{a.n}</option>)}<option>Other…</option></select></Field>
          <Field label="Owner"><input required className={input} placeholder="e.g. Chief Pharmacist" /></Field>
          <Field label="Target date"><input type="date" required className={input} /></Field>
          <div className="flex justify-end gap-2 pt-2"><button type="button" className={btn} onClick={() => setModal(null)}>Cancel</button><button type="submit" className={btnRed}>Schedule</button></div>
        </form>
      </Modal>

      <Modal open={!!view} title={view?.id ?? ""} onClose={() => setView(null)}>
        {view && (
          <dl className="space-y-2 text-sm">
            {([["Category", view.category], ["Severity", view.severity], ["Department", view.dept], ["Lead", view.lead], ["Status", view.status], ["Logged", view.stamp], ["Risk score", `${view.likelihood} × ${view.impact} = ${view.likelihood * view.impact}`]] as const).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-[color:var(--mgh-line2)] pb-1"><dt className="text-[color:var(--mgh-faint)]">{k}</dt><dd className="text-right text-[color:var(--mgh-text)]">{v}</dd></div>
            ))}
            <p className="pt-2 text-[color:var(--mgh-text2)]">{view.description}</p>
          </dl>
        )}
      </Modal>

      {toast && <div role="status" className="fixed bottom-4 right-4 z-50 rounded-lg border border-[color:var(--mgh-line)] bg-[color:var(--mgh-surface2)] px-4 py-2 text-sm text-[color:var(--mgh-strong)] shadow-xl">{toast}</div>}
    </div>
  );
}
