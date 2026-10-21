"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CircleCheck,
  ClipboardList,
  FilePenLine,
  Flame,
  GraduationCap,
  Hand,
  HeartPulse,
  IdCard,
  Info,
  LockKeyhole,
  MessageSquareWarning,
  Pill,
  ShieldCheck,
  ShieldPlus,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";

/* ─────────────────────────── Types ─────────────────────────── */

type ModuleStatus = "Completed" | "In Progress" | "Required";
type ModuleCategory = "Clinical Safety" | "Emergency" | "Facility Safety" | "Governance";

type TrainingModule = {
  id: string;
  title: string;
  category: ModuleCategory;
  status: ModuleStatus;
  progress: number;
  description: string;
  duration: string;
  /** Completed modules: certificate expiry. Others: completion due date. ISO yyyy-mm-dd. */
  date: string;
  icon: LucideIcon;
};

/* ─────────────────────── Demonstration data ─────────────────────── */

/** Fixed reference date so server and client render the same due/overdue state. */
const AS_OF = "2026-10-22";

const MODULES: TrainingModule[] = [
  {
    id: "infection-prevention-control",
    title: "Infection Prevention & Control",
    category: "Clinical Safety",
    status: "Completed",
    progress: 100,
    description: "Standard and transmission-based precautions, PPE selection, and safe handling of sharps and clinical waste.",
    duration: "45 min",
    date: "2027-08-14",
    icon: ShieldPlus,
  },
  {
    id: "hand-hygiene",
    title: "Hand Hygiene Compliance",
    category: "Clinical Safety",
    status: "Required",
    progress: 0,
    description: "The WHO 5 Moments for Hand Hygiene, correct hand-rub and hand-wash technique, and observation audits.",
    duration: "20 min",
    date: "2026-10-15",
    icon: Hand,
  },
  {
    id: "basic-life-support",
    title: "Basic Life Support (BLS)",
    category: "Emergency",
    status: "Completed",
    progress: 100,
    description: "High-quality adult CPR, AED use and choking management, with a practical skills sign-off.",
    duration: "4 hrs",
    date: "2028-03-02",
    icon: HeartPulse,
  },
  {
    id: "fire-safety",
    title: "Fire Safety & Evacuation",
    category: "Facility Safety",
    status: "In Progress",
    progress: 60,
    description: "RACE and PASS principles, extinguisher selection, and horizontal and vertical evacuation of patients.",
    duration: "40 min",
    date: "2026-11-05",
    icon: Flame,
  },
  {
    id: "patient-identification",
    title: "Patient Identification",
    category: "Clinical Safety",
    status: "Completed",
    progress: 100,
    description: "Using two patient identifiers before every medicine, sample, procedure and blood transfusion.",
    duration: "15 min",
    date: "2027-05-20",
    icon: IdCard,
  },
  {
    id: "medication-safety",
    title: "Medication Safety",
    category: "Clinical Safety",
    status: "In Progress",
    progress: 25,
    description: "High-alert and look-alike, sound-alike medicines, and safe prescribing, dispensing and administration checks.",
    duration: "60 min",
    date: "2026-11-12",
    icon: Pill,
  },
  {
    id: "confidentiality-data-protection",
    title: "Confidentiality & Data Protection",
    category: "Governance",
    status: "Required",
    progress: 0,
    description: "Protecting patient information under the Saudi Personal Data Protection Law (PDPL) and hospital policy.",
    duration: "30 min",
    date: "2026-11-30",
    icon: LockKeyhole,
  },
  {
    id: "incident-reporting",
    title: "Incident Reporting (Datix/SBAR)",
    category: "Governance",
    status: "Completed",
    progress: 100,
    description: "Recognising and reporting incidents and near misses, and escalating concerns clearly using SBAR.",
    duration: "25 min",
    date: "2026-11-18",
    icon: MessageSquareWarning,
  },
  {
    id: "consent-capacity",
    title: "Consent and Capacity",
    category: "Clinical Safety",
    status: "Required",
    progress: 0,
    description: "Obtaining valid informed consent, assessing decision-making capacity, and documenting the discussion.",
    duration: "35 min",
    date: "2026-12-15",
    icon: FilePenLine,
  },
];

/* ─────────────────────────── Styling maps ─────────────────────────── */

const STATUS_STYLE: Record<ModuleStatus, { badge: string; dot: string; bar: string }> = {
  Completed: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  "In Progress": { badge: "bg-amber-50 text-amber-700 ring-amber-600/20", dot: "bg-amber-500", bar: "bg-amber-500" },
  Required: { badge: "bg-rose-50 text-rose-700 ring-rose-600/20", dot: "bg-rose-500", bar: "bg-rose-500" },
};

const CATEGORY_TILE: Record<ModuleCategory, string> = {
  "Clinical Safety": "bg-sky-50 text-sky-600 ring-sky-100",
  Emergency: "bg-rose-50 text-rose-600 ring-rose-100",
  "Facility Safety": "bg-orange-50 text-orange-600 ring-orange-100",
  Governance: "bg-violet-50 text-violet-600 ring-violet-100",
};

const STATUS_FILTERS = ["All", "Required", "In Progress", "Completed"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];
const CATEGORIES: ModuleCategory[] = ["Clinical Safety", "Emergency", "Facility Safety", "Governance"];

/* ─────────────────────────── Helpers ─────────────────────────── */

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const DAY_MS = 86_400_000;

function daysFromAsOf(isoDate: string) {
  return Math.round((Date.parse(isoDate) - Date.parse(AS_OF)) / DAY_MS);
}

function dateInfo(module: TrainingModule) {
  const days = daysFromAsOf(module.date);
  const formatted = dateFormat.format(new Date(module.date));
  if (module.status === "Completed") {
    if (days < 0) return { label: `Expired ${formatted}`, tone: "text-rose-600" };
    if (days <= 30) return { label: `Expires ${formatted}`, hint: "Renew soon", tone: "text-amber-600" };
    return { label: `Valid until ${formatted}`, tone: "text-slate-500" };
  }
  if (days < 0) return { label: `Due ${formatted}`, hint: "Overdue", tone: "text-rose-600" };
  if (days <= 14) return { label: `Due ${formatted}`, hint: `${days} days left`, tone: "text-amber-600" };
  return { label: `Due ${formatted}`, tone: "text-slate-500" };
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function LearningPortalPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [category, setCategory] = useState<ModuleCategory | "All">("All");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const stats = useMemo(() => {
    const completed = MODULES.filter((m) => m.progress === 100).length;
    const pending = MODULES.length - completed;
    const overdue = MODULES.filter((m) => m.progress < 100 && daysFromAsOf(m.date) < 0).length;
    const notStarted = MODULES.filter((m) => m.progress === 0).length;
    return { completed, pending, overdue, notStarted, rate: Math.round((completed / MODULES.length) * 100) };
  }, []);

  const statusCounts = useMemo(() => {
    const scoped = MODULES.filter((m) => category === "All" || m.category === category);
    return Object.fromEntries(
      STATUS_FILTERS.map((s) => [s, s === "All" ? scoped.length : scoped.filter((m) => m.status === s).length]),
    ) as Record<StatusFilter, number>;
  }, [category]);

  const visible = useMemo(
    () =>
      MODULES.filter(
        (m) => (statusFilter === "All" || m.status === statusFilter) && (category === "All" || m.category === category),
      ),
    [statusFilter, category],
  );

  return (
    <div className="min-h-full rounded-3xl bg-[#F6F8FC] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        {/* ── Executive header ── */}
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                CBAHI aligned
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
                Demonstration data
              </span>
            </div>
            <h1 className="mt-3 text-2xl! font-semibold! tracking-tight text-slate-900! sm:text-3xl!">Learning &amp; Audit Portal</h1>
            <p className="mt-2 text-sm leading-relaxed sm:text-base">
              Mandatory training and clinical competencies mapped to CBAHI accreditation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:w-[460px]">
            <KpiCard
              icon={ClipboardList}
              iconTone="bg-rose-50 text-rose-600 ring-rose-100"
              label="Pending Modules"
              value={String(stats.pending)}
              detail={
                <>
                  {stats.notStarted} not started
                  {stats.overdue > 0 && (
                    <>
                      {" · "}
                      <span className="font-semibold text-rose-600">{stats.overdue} overdue</span>
                    </>
                  )}
                </>
              }
            />
            <KpiCard
              icon={GraduationCap}
              iconTone="bg-emerald-50 text-emerald-600 ring-emerald-100"
              label="Compliance Rate"
              value={`${stats.rate}%`}
              detail={`${stats.completed} of ${MODULES.length} modules complete`}
              progress={stats.rate}
            />
          </div>
        </header>

        {/* ── Filters ── */}
        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div role="tablist" aria-label="Filter by status" className="inline-flex w-full overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm md:w-auto">
            {STATUS_FILTERS.map((s) => {
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(s)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                    active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {s !== "All" && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[s].dot}`} aria-hidden="true" />}
                  {s}
                  <span className={`rounded-md px-1.5 text-xs tabular-nums ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {statusCounts[s]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Filter by category">
            {(["All", ...CATEGORIES] as const).map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {c === "All" ? "All categories" : c}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Competency grid ── */}
        {visible.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {visible.map((module) => (
              <ModuleCard key={module.id} module={module} onStart={() => setNotice(module.title)} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <CircleCheck className="mx-auto h-8 w-8 text-emerald-500" aria-hidden="true" />
            <div className="mt-3 text-sm font-semibold text-slate-900">Nothing here</div>
            <div className="mt-1 text-sm text-slate-500">No modules match these filters.</div>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("All");
                setCategory("All");
              }}
              className="mt-4 text-sm font-semibold text-sky-700 hover:text-sky-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-20 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6">
        {notice && (
          <div className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="text-sm">
              <div className="font-semibold text-slate-900">{notice}</div>
              <div className="mt-0.5 text-slate-500">Module content will open here once it is published.</div>
            </div>
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── Components ─────────────────────────── */

function KpiCard({
  icon: Icon,
  iconTone,
  label,
  value,
  detail,
  progress,
}: {
  icon: LucideIcon;
  iconTone: string;
  label: string;
  value: string;
  detail: React.ReactNode;
  progress?: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ring-1 ${iconTone}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</div>
      {progress !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="mt-2 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

function ModuleCard({ module, onStart }: { module: TrainingModule; onStart: () => void }) {
  const Icon = module.icon;
  const style = STATUS_STYLE[module.status];
  const due = dateInfo(module);
  const complete = module.progress >= 100;

  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ${CATEGORY_TILE[module.category]}`}>
          <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
          {module.status}
        </span>
      </div>

      <span className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{module.category}</span>
      <h3 className="mt-1 text-base! font-semibold! leading-snug! text-slate-900!">{module.title}</h3>
      <p className="mt-2 text-sm leading-relaxed">{module.description}</p>

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">{module.duration} · Progress</span>
          <span className="font-semibold tabular-nums text-slate-900">{module.progress}%</span>
        </div>
        <div
          className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label={`${module.title} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={module.progress}
        >
          <div className={`h-full rounded-full transition-[width] duration-500 ${style.bar}`} style={{ width: `${module.progress}%` }} />
        </div>
      </div>

      <footer className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className={`flex min-w-0 items-center gap-1.5 text-xs ${due.tone}`}>
          {due.hint === "Overdue" ? (
            <TriangleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          <span className="truncate">
            {due.label}
            {due.hint && <span className="font-semibold"> · {due.hint}</span>}
          </span>
        </div>
        {complete ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600">
            <CircleCheck className="h-4 w-4" aria-hidden="true" />
            Certified
          </span>
        ) : (
          <button
            type="button"
            onClick={onStart}
            className="inline-flex shrink-0 items-center gap-1 rounded-md text-xs font-bold uppercase tracking-[0.08em] text-sky-700 transition-colors hover:text-sky-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            Start module
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        )}
      </footer>
    </article>
  );
}
