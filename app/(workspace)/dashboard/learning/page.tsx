"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock3,
  GraduationCap,
  Info,
  LayoutGrid,
  List,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
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
  type ModuleStatus,
} from "@/lib/learning/catalog";
import { ALL_LEARNING_IMAGES, getModuleCover, PORTAL_HERO } from "@/lib/learning/images";
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

const PROGRESS_FILL: Record<ModuleStatus, string> = {
  Completed: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  "In Progress": "bg-gradient-to-r from-amber-300 to-amber-500",
  Required: "bg-gradient-to-r from-rose-400 to-rose-500",
};

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
  return "Start";
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

  /** The most urgent unfinished module: overdue first, then the nearest due date. */
  const nextUp = useMemo(
    () =>
      rows
        .filter((r) => r.view.status !== "Completed" && !r.view.locked)
        .sort((a, b) => Date.parse(a.view.date) - Date.parse(b.view.date))[0],
    [rows],
  );

  const scoped = rows.filter((r) => category === "All" || r.module.category === category);
  const counts = Object.fromEntries(
    STATUS_FILTERS.map((s) => [s, s === "All" ? scoped.length : scoped.filter((r) => r.view.status === s).length]),
  ) as Record<StatusFilter, number>;
  const visible = scoped.filter((r) => statusFilter === "All" || r.view.status === statusFilter);
  const hasLocalProgress = Object.keys(records).length > 0;

  return (
    <div className="min-h-full rounded-3xl bg-[#F3F5F9] p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl">
        {/* ── Hero ── */}
        <section className="on-dark relative isolate overflow-hidden rounded-[28px] bg-[#071B23] shadow-[0_30px_60px_-30px_rgba(7,27,35,0.55)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(90%_120%_at_0%_0%,rgba(20,184,166,0.28)_0%,transparent_55%),radial-gradient(70%_90%_at_60%_120%,rgba(14,116,144,0.45)_0%,transparent_60%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(90deg,black,transparent_70%)]"
          />

          <div className="grid lg:grid-cols-[1.25fr_1fr]">
            <div className="relative z-10 p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-100 ring-1 ring-white/15 backdrop-blur">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
                  CBAHI aligned
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-white/70 ring-1 ring-white/10">
                  <Info className="h-3.5 w-3.5" aria-hidden="true" />
                  Demonstration data
                </span>
                {hasLocalProgress && (
                  <button
                    type="button"
                    onClick={resetAllRecords}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                    title="Clear progress saved in this browser"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    Reset demo progress
                  </button>
                )}
              </div>

              <h1 className="mt-5 text-3xl! font-semibold! leading-[1.1]! tracking-tight sm:text-4xl! lg:text-[2.6rem]!">
                Learning &amp; Audit Portal
              </h1>
              <div className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/75">
                Mandatory training and clinical competencies mapped to CBAHI accreditation. Study, pass the assessment and keep your certificates current.
              </div>

              {/* Metrics */}
              <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
                <ComplianceRing rate={stats.rate} completed={stats.completed} total={rows.length} />
                <div className="grid flex-1 grid-cols-3 gap-2.5">
                  <HeroStat label="Pending" value={stats.pending} />
                  <HeroStat label="Overdue" value={stats.overdue} tone={stats.overdue > 0 ? "alert" : undefined} />
                  <HeroStat label="Not started" value={stats.notStarted} />
                </div>
              </div>

              {/* Call to action */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                {nextUp ? (
                  <Link
                    href={`/dashboard/learning/${nextUp.module.id}`}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900! no-underline! shadow-lg shadow-black/20 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
                  >
                    {nextUp.view.progress > 0 ? "Continue" : "Start"}: {nextUp.module.title}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-300/30">
                    <CircleCheck className="h-4 w-4" aria-hidden="true" />
                    All mandatory training is complete
                  </span>
                )}
                {nextUp && (
                  <span className={`inline-flex items-center gap-1.5 text-[13px] ${dateInfo(nextUp.view).alert ? "text-rose-300" : "text-white/70"}`}>
                    <CalendarClock className="h-4 w-4" aria-hidden="true" />
                    {dateInfo(nextUp.view).label}
                    {dateInfo(nextUp.view).hint && <span className="font-semibold">· {dateInfo(nextUp.view).hint}</span>}
                  </span>
                )}
              </div>
            </div>

            {/* Photograph */}
            <div className="relative min-h-[220px] lg:min-h-full">
              <Image
                src={PORTAL_HERO.src}
                alt={PORTAL_HERO.alt}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
                style={{ objectPosition: PORTAL_HERO.position }}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#071B23] via-[#071B23]/20 to-transparent lg:bg-gradient-to-r lg:from-[#071B23] lg:via-[#071B23]/30 lg:to-transparent" />
              <div className="absolute bottom-4 right-4 left-4 flex justify-end lg:bottom-6 lg:right-6">
                <div className="flex max-w-xs items-center gap-3 rounded-2xl bg-slate-950/55 px-3.5 py-3 ring-1 ring-white/15 backdrop-blur-md">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-400/20 text-teal-200 ring-1 ring-teal-300/30">
                    <GraduationCap className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 text-[12px] leading-snug text-white/80">
                    <span className="block font-semibold text-white">{LEARNING_MODULES.length} accredited modules</span>
                    Slides, a 20-question assessment and a printable certificate.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Toolbar ── */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">Your training</div>
            <h2 className="mt-1 text-xl! font-semibold! tracking-tight text-slate-900!">Modules</h2>
          </div>

          <div className="flex items-center gap-2">
            <div role="tablist" aria-label="Filter by status" className="flex min-w-0 overflow-x-auto rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200/80">
              {STATUS_FILTERS.map((s) => {
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setStatusFilter(s)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                      active ? "bg-[#0B2530] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {s !== "All" && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[s].dot}`} aria-hidden="true" />}
                    {s}
                    <span className={`rounded-md px-1.5 text-[11px] tabular-nums ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>{counts[s]}</span>
                  </button>
                );
              })}
            </div>

            <div role="group" aria-label="Layout" className="flex shrink-0 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200/80">
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
                  className={`grid h-8 w-8 place-items-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                    layout === value ? "bg-[#0B2530] text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {(["All", ...CATEGORIES] as const).map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                  active ? "bg-teal-700 text-white ring-teal-700" : "bg-white text-slate-600 ring-slate-200 hover:text-slate-900 hover:ring-slate-300"
                }`}
              >
                {c === "All" ? "All categories" : c}
              </button>
            );
          })}
        </div>

        {/* ── Modules ── */}
        {visible.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <CircleCheck className="mx-auto h-8 w-8 text-emerald-500" aria-hidden="true" />
            <div className="mt-2 text-sm font-semibold text-slate-900">No modules match these filters</div>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("All");
                setCategory("All");
              }}
              className="mt-3 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              Clear filters
            </button>
          </div>
        ) : layout === "grid" ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((row, index) => <ModuleCard key={row.module.id} {...row} eager={index < 3} />)}
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2.5">
            {visible.map((row) => <ModuleRow key={row.module.id} {...row} />)}
          </div>
        )}

        <ImageCredits />
      </div>
    </div>
  );
}

/* ───────────── Hero pieces ───────────── */

function ComplianceRing({ rate, completed, total }: { rate: number; completed: number; total: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="flex items-center gap-3.5 rounded-2xl bg-white/[0.06] py-3 pr-5 pl-3 ring-1 ring-white/10">
      <div className="relative h-[84px] w-[84px] shrink-0">
        <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id="ring-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <circle cx="42" cy="42" r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
          <circle
            cx="42"
            cy="42"
            r={radius}
            fill="none"
            stroke="url(#ring-fill)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - rate / 100)}
            className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-lg font-semibold tabular-nums text-white">{rate}%</span>
      </div>
      <div className="leading-tight">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-200">Compliance</span>
        <span className="mt-1 block text-sm text-white/80">
          {completed} of {total} complete
        </span>
      </div>
    </div>
  );
}

function HeroStat({ label, value, tone }: { label: string; value: number; tone?: "alert" }) {
  return (
    <div className={`rounded-2xl px-3.5 py-3 ring-1 ${tone === "alert" ? "bg-rose-500/15 ring-rose-300/30" : "bg-white/[0.06] ring-white/10"}`}>
      <span className={`block text-2xl font-semibold tabular-nums ${tone === "alert" ? "text-rose-200" : "text-white"}`}>{value}</span>
      <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/60">{label}</span>
    </div>
  );
}

/* ───────────── Module pieces ───────────── */

function StatusBadge({ view, onImage }: { view: ModuleView; onImage?: boolean }) {
  if (view.locked) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10.5px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
        <Lock className="h-3 w-3" aria-hidden="true" />
        Locked
      </span>
    );
  }
  const style = STATUS_STYLE[view.status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1 ring-inset ${style.badge} ${onImage ? "shadow-sm" : ""}`}>
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
      <div className={`h-full rounded-full ${PROGRESS_FILL[view.status]}`} style={{ width: `${view.progress}%` }} />
    </div>
  );
}

function DueLine({ view, className = "" }: { view: ModuleView; className?: string }) {
  const due = dateInfo(view);
  return (
    <span className={`flex min-w-0 items-center gap-1.5 ${due.tone} ${className}`}>
      {due.alert ? <TriangleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      <span className="truncate">
        {due.label}
        {due.hint && <span className="font-semibold"> · {due.hint}</span>}
      </span>
    </span>
  );
}

const cardFocus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500";

function ModuleCard({ module, view, eager }: Row & { eager?: boolean }) {
  const Icon = module.icon;
  const cover = getModuleCover(module.id);
  const complete = view.progress >= 100;
  return (
    <Link
      href={`/dashboard/learning/${module.id}`}
      className={`group flex flex-col overflow-hidden rounded-2xl bg-white no-underline! shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_24px_48px_-20px_rgba(15,23,42,0.35)] hover:ring-slate-300 ${cardFocus}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
        {cover && (
          <Image
            src={cover.src}
            alt=""
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            style={{ objectPosition: cover.position }}
          />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-slate-950/20" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700 shadow-sm backdrop-blur">{module.category}</span>
          <StatusBadge view={view} onImage />
        </div>
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <span className={`grid h-10 w-10 place-items-center rounded-xl bg-white shadow-md ring-1 ring-black/5 ${CATEGORY_TONE[module.category].text}`}>
            <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            {module.duration}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-[15px]! font-semibold! leading-snug! tracking-tight text-slate-900!">{module.title}</h3>
        <div className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-500">{module.description}</div>

        <div className="mt-auto pt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] leading-none">
            <span className="font-medium text-slate-500">Progress</span>
            <span className="font-semibold tabular-nums text-slate-900">{view.progress}%</span>
          </div>
          <ProgressBar view={view} title={module.title} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5 text-xs">
          <DueLine view={view} />
          {view.locked ? (
            <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-rose-600">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Locked
            </span>
          ) : (
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                complete ? "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100" : "bg-[#0B2530] text-white group-hover:bg-teal-700"
              }`}
            >
              {complete ? <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              {actionLabel(view)}
              {!complete && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ModuleRow({ module, view }: Row) {
  const Icon = module.icon;
  const cover = getModuleCover(module.id);
  return (
    <Link
      href={`/dashboard/learning/${module.id}`}
      className={`group flex items-center gap-3 rounded-2xl bg-white p-2.5 pr-4 no-underline! shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md hover:ring-slate-300 sm:gap-4 ${cardFocus}`}
    >
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-200 sm:w-28">
        {cover && (
          <Image src={cover.src} alt="" fill sizes="112px" className="object-cover transition duration-500 group-hover:scale-105" style={{ objectPosition: cover.position }} />
        )}
        <span className={`absolute bottom-1.5 left-1.5 grid h-7 w-7 place-items-center rounded-lg bg-white shadow ${CATEGORY_TONE[module.category].text}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold leading-tight text-slate-900">{module.title}</div>
        <div className="mt-1 flex items-center gap-1.5 truncate text-[11px] leading-tight text-slate-500">
          <span className="font-semibold uppercase tracking-[0.1em] text-slate-400">{module.category}</span>
          <span aria-hidden="true">·</span>
          <span>{module.duration}</span>
        </div>
        <DueLine view={view} className="mt-1 text-[11px] sm:hidden" />
      </div>

      <div className="hidden w-40 shrink-0 md:block">
        <div className="mb-1.5 flex justify-between text-[11px] leading-none">
          <span className="text-slate-500">Progress</span>
          <span className="font-semibold tabular-nums text-slate-900">{view.progress}%</span>
        </div>
        <ProgressBar view={view} title={module.title} />
      </div>

      <DueLine view={view} className="hidden w-52 shrink-0 justify-end text-xs sm:flex" />

      <div className="flex w-[96px] shrink-0 justify-end">
        <StatusBadge view={view} />
      </div>
      <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 sm:block" aria-hidden="true" />
    </Link>
  );
}

/* ───────────── Attribution ───────────── */

function ImageCredits() {
  return (
    <details className="group mt-10 rounded-2xl bg-white/70 ring-1 ring-slate-200/80 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-slate-600 hover:text-slate-900">
        <span className="inline-flex items-center gap-2">
          <BookOpenCheck className="h-4 w-4 text-teal-700" aria-hidden="true" />
          Image credits and licences
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {ALL_LEARNING_IMAGES.length} openly licensed photographs
          </span>
        </span>
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-slate-200/80 px-4 py-3">
        <div className="text-[11px] leading-relaxed text-slate-500">
          Images from Wikimedia Commons, used under the licences shown and hosted with the app. Resized and converted to WebP; otherwise unaltered.
        </div>
        <div className="mt-3 grid gap-x-6 gap-y-1.5 text-[11px] leading-snug sm:grid-cols-2 lg:grid-cols-3">
          {ALL_LEARNING_IMAGES.map((image) => (
            <div key={image.src} className="min-w-0 text-slate-600">
              <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-800 underline-offset-2 hover:underline">
                {image.alt.replace(/\.$/, "")}
              </a>
              <span className="text-slate-500">
                {" "}— {image.credit},{" "}
                <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  {image.license}
                </a>
              </span>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
