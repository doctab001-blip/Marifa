import {
  FilePenLine,
  Flame,
  Hand,
  HeartPulse,
  IdCard,
  LockKeyhole,
  MessageSquareWarning,
  Pill,
  ShieldPlus,
  type LucideIcon,
} from "lucide-react";

/* Learning & Audit Portal: module catalogue shared by the directory and the module pages.
   Demonstration data only — statuses and dates below are a seeded example learner. */

export type ModuleStatus = "Completed" | "In Progress" | "Required";
export type ModuleCategory = "Clinical Safety" | "Emergency" | "Facility Safety" | "Governance";

export type LearningModule = {
  id: string;
  title: string;
  category: ModuleCategory;
  description: string;
  duration: string;
  /** How long a pass stays valid before the module must be repeated. */
  validityMonths: number;
  icon: LucideIcon;
  /** Seeded demo state, shown until this browser has its own progress for the module. */
  baseline: { status: ModuleStatus; progress: number; date: string };
};

/** Fixed reference date for the seeded demo learner, so server and client agree on due/overdue. */
export const LEARNING_AS_OF = "2026-10-22";
export const MAX_ATTEMPTS = 3;
export const QUESTIONS_PER_TEST = 20;
export const PASS_PERCENT = 80;
export const PASS_SCORE = Math.ceil((QUESTIONS_PER_TEST * PASS_PERCENT) / 100);

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: "infection-prevention-control",
    title: "Infection Prevention & Control",
    category: "Clinical Safety",
    description: "Standard and transmission-based precautions, PPE, sharps safety and clinical waste.",
    duration: "45 min",
    validityMonths: 12,
    icon: ShieldPlus,
    baseline: { status: "Completed", progress: 100, date: "2027-08-14" },
  },
  {
    id: "hand-hygiene",
    title: "Hand Hygiene Compliance",
    category: "Clinical Safety",
    description: "WHO 5 Moments, hand-rub and hand-wash technique, and compliance audits.",
    duration: "20 min",
    validityMonths: 12,
    icon: Hand,
    baseline: { status: "Required", progress: 0, date: "2026-10-15" },
  },
  {
    id: "basic-life-support",
    title: "Basic Life Support (BLS)",
    category: "Emergency",
    description: "High-quality adult CPR, early defibrillation and the choking adult.",
    duration: "60 min",
    validityMonths: 24,
    icon: HeartPulse,
    baseline: { status: "Completed", progress: 100, date: "2028-03-02" },
  },
  {
    id: "fire-safety",
    title: "Fire Safety & Evacuation",
    category: "Facility Safety",
    description: "RACE and PASS, extinguisher selection and progressive patient evacuation.",
    duration: "40 min",
    validityMonths: 12,
    icon: Flame,
    baseline: { status: "In Progress", progress: 60, date: "2026-11-05" },
  },
  {
    id: "patient-identification",
    title: "Patient Identification",
    category: "Clinical Safety",
    description: "Two identifiers before every medicine, sample, procedure and transfusion.",
    duration: "25 min",
    validityMonths: 12,
    icon: IdCard,
    baseline: { status: "Completed", progress: 100, date: "2027-05-20" },
  },
  {
    id: "medication-safety",
    title: "Medication Safety",
    category: "Clinical Safety",
    description: "High-alert and look-alike, sound-alike medicines and safe administration.",
    duration: "50 min",
    validityMonths: 12,
    icon: Pill,
    baseline: { status: "In Progress", progress: 25, date: "2026-11-12" },
  },
  {
    id: "confidentiality-data-protection",
    title: "Confidentiality & Data Protection",
    category: "Governance",
    description: "Protecting patient information under the Saudi PDPL and hospital policy.",
    duration: "30 min",
    validityMonths: 12,
    icon: LockKeyhole,
    baseline: { status: "Required", progress: 0, date: "2026-11-30" },
  },
  {
    id: "incident-reporting",
    title: "Incident Reporting (Datix/SBAR)",
    category: "Governance",
    description: "Reporting incidents and near misses, just culture and SBAR escalation.",
    duration: "30 min",
    validityMonths: 12,
    icon: MessageSquareWarning,
    baseline: { status: "Completed", progress: 100, date: "2026-11-18" },
  },
  {
    id: "consent-capacity",
    title: "Consent and Capacity",
    category: "Clinical Safety",
    description: "Valid informed consent, assessing capacity and documenting the discussion.",
    duration: "35 min",
    validityMonths: 12,
    icon: FilePenLine,
    baseline: { status: "Required", progress: 0, date: "2026-12-15" },
  },
];

export function getLearningModule(id: string) {
  return LEARNING_MODULES.find((module) => module.id === id);
}

/* ───────────── Shared visual tokens ───────────── */

export const STATUS_STYLE: Record<ModuleStatus, { badge: string; dot: string; bar: string }> = {
  Completed: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  "In Progress": { badge: "bg-amber-50 text-amber-700 ring-amber-600/20", dot: "bg-amber-500", bar: "bg-amber-500" },
  Required: { badge: "bg-rose-50 text-rose-700 ring-rose-600/20", dot: "bg-rose-500", bar: "bg-rose-500" },
};

export const CATEGORY_TONE: Record<ModuleCategory, { tile: string; soft: string; text: string }> = {
  "Clinical Safety": { tile: "bg-sky-50 text-sky-600 ring-sky-100", soft: "bg-sky-50/70 border-sky-200", text: "text-sky-700" },
  Emergency: { tile: "bg-rose-50 text-rose-600 ring-rose-100", soft: "bg-rose-50/70 border-rose-200", text: "text-rose-700" },
  "Facility Safety": { tile: "bg-orange-50 text-orange-600 ring-orange-100", soft: "bg-orange-50/70 border-orange-200", text: "text-orange-700" },
  Governance: { tile: "bg-violet-50 text-violet-600 ring-violet-100", soft: "bg-violet-50/70 border-violet-200", text: "text-violet-700" },
};

/* ───────────── Dates ───────────── */

const DAY_MS = 86_400_000;
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function formatLearningDate(isoDate: string) {
  return dateFormat.format(new Date(isoDate));
}

export function daysFromAsOf(isoDate: string) {
  return Math.round((Date.parse(isoDate.slice(0, 10)) - Date.parse(LEARNING_AS_OF)) / DAY_MS);
}

/** Calendar date (yyyy-mm-dd) of a timestamp in the viewer's own time zone. */
export function localIsoDate(timestamp: string) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addMonths(isoDate: string, months: number) {
  const date = new Date(isoDate);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}
