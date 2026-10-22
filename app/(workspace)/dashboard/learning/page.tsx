"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  GraduationCap,
  Info,
  LayoutGrid,
  List,
  Lock,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import {
  CATEGORY_TONE,
  daysFromAsOf,
  formatLearningDate,
  LEARNING_MODULES,
  STATUS_STYLE,
  type LearningModule,
  type ModuleCategory,
} from "@/lib/learning/catalog";
import {
  moduleView,
  resetAllRecords,
  setLearningLayout,
  useLearningLayout,
  useLearningRecords,
  type ModuleView,
} from "@/lib/learning/progress";

const STATUS_FILTERS = ["All", "Required", "In Progress", "Completed"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];
const CATEGORIES: ModuleCategory[] = ["Clinical Safety", "Emergency", "Facility Safety", "Governance"];

type Row = { module: LearningModule; view: ModuleView };

function dateInfo(view: ModuleView) {
  const days = daysFromAsOf(view.date);
  const formatted = formatLearningDate(view.date);
  if (view.dateKind === "expires") {
    if (days < 0) return { label: `Expired ${formatted}`, hint: undefined, tone: "text-rose-600", alert: true };
    if (days <= 30) return { label: `Expires ${formatted}`, hint: "Renew soon", tone: "text-amber-600", alert: false };
    return { label: `Valid to ${formatted}`, hint: undefined, tone: "text-slate-500", alert: false };
  }
  if (days < 0) return { label: `Due ${formatted}`, hint: "Overdue", tone: "text-rose-600", alert: true };
  if (days <= 14) return { label: `Due ${formatted}`, hint: `${days}d left`, tone: "text-amber-600", alert: false };
  return { label: `Due ${formatted}`, hint: undefined, tone: "text-slate-500", alert: false };
}

function actionLabel(view: ModuleView) {
  if (view.locked) return "Locked";
  if (view.progress >= 100) return "Review";
  if (view.progress > 0) return "Continue";
  return "Start module";
}

export default function LearningPortalPage() {
  const records = useLearningRecords();
  const layout = useLearningLayout();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [category, setCategory] = useState<ModuleCategory | "All">("All");

  const rows: Row[] = useMemo(
    () => LEARNING_MODULES.map((module) => ({ module, view: moduleView(module, records[module.id]) })),
    [records],
  );

  const stats = useMemo(() => {
    const completed = rows.filter((r) => r.view.status === "Completed").length;
    return {
      completed,
      pending: rows.length - completed,
      overdue: rows.filter((r) => r.view.status !== "Completed" && daysFromAsOf(r.view.date) < 0).length,
      notStarted: rows.filter((r) => r.view.progress === 0).length,
      rate: Math.round((completed / rows.length) * 100),
    };
  }, [rows]);

  const scoped = rows.filter((r) => category === "All" || r.module.category === category);
  const counts = Object.fromEntries(
    STATUS_FILTERS.map((s) => [s, s === "All" ? scoped.length : scoped.filter((r) => r.view.status === s).length]),
  ) as Record<StatusFilter, number>;
  const visible = scoped.filter((r) => statusFilter === "All" || r.view.status === statusFilter);
  const hasLocalProgress = Object.keys(records).length > 0;

  return (
    <div className="min-h-full rounded-3xl bg-[#F6F8FC] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        {/* ── Header & metrics ── */}
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
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
              {hasLocalProgress && (
                <button
                  type="button"
                  onClick={resetAllRecords}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-white hover:text-slate-800"
                  title="Clear progress saved in this browser"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  Reset demo progress
                </button>
              )}
            </div>
            <h1 className="mt-3 text-2xl! font-semibold! tracking-tight text-slate-900! sm:text-3xl!">Learning &amp; Audit Portal</h1>
            <p className="mt-1.5 text-sm leading-relaxed">Mandatory training and clinical competencies mapped to CBAHI accreditation.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-[420px]">
            <Kpi
              icon={ClipboardList}
              tone="bg-rose-50 text-rose-600 ring-rose-100"
              label="Pending Modules"
              value={String(stats.pending)}
              detail={
                <>
                  {stats.notStarted} not started
                  {stats.overdue > 0 && <span className="font-semibold text-rose-600"> · {stats.overdue} overdue</span>}
                </>
              }
            />
            <Kpi
              icon={GraduationCap}
              tone="bg-emerald-50 text-emerald-600 ring-emerald-100"
              label="Compliance Rate"
              value={`${stats.rate}%`}
              detail={`${stats.completed} of ${rows.length} complete`}
              progress={stats.rate}
            />
          </div>
        </header>

        {/* ── Controls ── */}
        <div className="mt-7 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div role="tablist" aria-label="Filter by status" className="flex min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {STATUS_FILTERS.map((s) => {
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setStatusFilter(s)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                      active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {s !== "All" && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[s].dot}`} aria-hidden="true" />}
                    {s}
                    <span className={`rounded-md px-1.5 text-[11px] tabular-nums ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>{counts[s]}</span>
                  </button>
                );
              })}
            </div>

            <div role="group" aria-label="Layout" className="flex shrink-0 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {([
                ["grid", LayoutGrid, "Grid view"],
                ["list", List, "List view"],
              ] as const).map(([value, Icon, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={layout === value}
                  aria-label={label}
                  title={label}
                  onClick={() => setLearningLayout(value)}
                  className={`grid h-8 w-8 place-items-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                    layout === value ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
            {(["All", ...CATEGORIES] as const).map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                    active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {c === "All" ? "All categories" : c}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Modules ── */}
        {visible.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <CircleCheck className="mx-auto h-7 w-7 text-emerald-500" aria-hidden="true" />
            <div className="mt-2 text-sm font-semibold text-slate-900">No modules match these filters</div>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("All");
                setCategory("All");
              }}
              className="mt-3 text-sm font-semibold text-sky-700 hover:text-sky-800"
            >
              Clear filters
            </button>
          </div>
        ) : layout === "grid" ? (
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {visible.map((row) => <ModuleTile key={row.module.id} {...row} />)}
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            {visible.map((row) => <ModuleRow key={row.module.id} {...row} />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────── Pieces ───────────── */

function Kpi({ icon: Icon, tone, label, value, detail, progress }: {
  icon: typeof ClipboardList;
  tone: string;
  label: string;
  value: string;
  detail: React.ReactNode;
  progress?: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] text-slate-400">{label}</span>
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-1 ${tone}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</div>
      {progress !== undefined && (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="mt-1.5 text-[11px] leading-tight text-slate-500">{detail}</div>
    </div>
  );
}

function StatusBadge({ view }: { view: ModuleView }) {
  const style = STATUS_STYLE[view.status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${style.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {view.status}
    </span>
  );
}

function ProgressBar({ view, title }: { view: ModuleView; title: string }) {
  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-slate-100"
      role="progressbar"
      aria-label={`${title} progress`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={view.progress}
    >
      <div className={`h-full rounded-full ${STATUS_STYLE[view.status].bar}`} style={{ width: `${view.progress}%` }} />
    </div>
  );
}

const tileFocus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500";

function ModuleTile({ module, view }: Row) {
  const Icon = module.icon;
  const due = dateInfo(view);
  return (
    <Link
      href={`/dashboard/learning/${module.id}`}
      className={`group flex flex-col rounded-xl border border-slate-200 bg-white p-3.5 no-underline! shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-4 ${tileFocus}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1 ${CATEGORY_TONE[module.category].tile}`}>
          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </span>
        <StatusBadge view={view} />
      </div>
      <span className="mt-3 text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-slate-400">{module.category}</span>
      <h3 className="mt-1 line-clamp-2 text-[13.5px]! font-semibold! leading-tight! text-slate-900!">{module.title}</h3>
      <p className="mt-1 line-clamp-2 text-xs! leading-snug!">{module.description}</p>

      <div className="mt-auto pt-3">
        <div className="mb-1 flex items-center justify-between text-[11px] leading-none">
          <span className="text-slate-500">{module.duration}</span>
          <span className="font-semibold tabular-nums text-slate-900">{view.progress}%</span>
        </div>
        <ProgressBar view={view} title={module.title} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-slate-100 pt-2.5 text-[11px] leading-tight">
        <span className={`flex min-w-0 items-center gap-1 ${due.tone}`}>
          {due.alert ? <TriangleAlert className="h-3 w-3 shrink-0" aria-hidden="true" /> : <CalendarClock className="h-3 w-3 shrink-0" aria-hidden="true" />}
          <span className="truncate">
            {due.label}
            {due.hint && <span className="font-semibold"> · {due.hint}</span>}
          </span>
        </span>
        <ActionHint view={view} />
      </div>
    </Link>
  );
}

function ActionHint({ view }: { view: ModuleView }) {
  if (view.locked) {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
        <Lock className="h-3 w-3" aria-hidden="true" />
        Locked
      </span>
    );
  }
  const complete = view.progress >= 100;
  return (
    <span className={`inline-flex items-center gap-0.5 font-bold uppercase tracking-[0.06em] ${complete ? "text-emerald-600" : "text-sky-700"}`}>
      {complete && <CircleCheck className="mr-0.5 h-3 w-3" aria-hidden="true" />}
      {actionLabel(view)}
      {!complete && <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
    </span>
  );
}

function ModuleRow({ module, view }: Row) {
  const Icon = module.icon;
  const due = dateInfo(view);
  return (
    <Link
      href={`/dashboard/learning/${module.id}`}
      className={`group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 no-underline! shadow-sm transition hover:border-slate-300 hover:shadow-md sm:gap-4 sm:px-4 ${tileFocus}`}
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ${CATEGORY_TONE[module.category].tile}`}>
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold leading-tight text-slate-900">{module.title}</div>
        <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] leading-tight text-slate-500">
          <span className="uppercase tracking-[0.1em] text-slate-400">{module.category}</span>
          <span aria-hidden="true">·</span>
          <span>{module.duration}</span>
          <span className={`sm:hidden ${due.tone}`}>· {due.hint ?? due.label}</span>
        </div>
      </div>

      <div className="hidden w-36 shrink-0 md:block">
        <div className="mb-1 text-right text-[11px] font-semibold leading-none tabular-nums text-slate-900">{view.progress}%</div>
        <ProgressBar view={view} title={module.title} />
      </div>

      <div className={`hidden w-52 shrink-0 items-center justify-end gap-1 text-[11px] leading-tight sm:flex ${due.tone}`}>
        {due.alert ? <TriangleAlert className="h-3 w-3 shrink-0" aria-hidden="true" /> : <CalendarClock className="h-3 w-3 shrink-0" aria-hidden="true" />}
        <span className="truncate">
          {due.label}
          {due.hint && <span className="font-semibold"> · {due.hint}</span>}
        </span>
      </div>

      <div className="flex w-[92px] shrink-0 justify-end">
        {view.locked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Locked
          </span>
        ) : (
          <StatusBadge view={view} />
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" aria-hidden="true" />
    </Link>
  );
}
