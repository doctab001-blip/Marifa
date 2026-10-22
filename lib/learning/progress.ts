"use client";

import { useSyncExternalStore } from "react";
import { addMonths, localIsoDate, MAX_ATTEMPTS, type LearningModule, type ModuleStatus } from "@/lib/learning/catalog";

/* Per-browser learning progress for the demo portal. Nothing here is sent to the server:
   it keeps slide position, attempts and passes across reloads in this browser only.
   Swap these helpers for a Supabase-backed store before real learners use the portal. */

export type ModuleRecord = {
  /** Highest slide index reached (0-based) and the deck length it was measured against. */
  furthestSlide: number;
  slideCount: number;
  attemptsUsed: number;
  lastScore?: number;
  bestScore?: number;
  /** ISO timestamp of the passing attempt. */
  passedAt?: string;
};

type Records = Record<string, ModuleRecord>;

const KEY = "marifa.learning.v1";
const EMPTY: Records = {};
const listeners = new Set<() => void>();

let cacheRaw: string | null = null;
let cacheValue: Records = EMPTY;
/** Set when localStorage is unavailable (private mode, blocked storage): progress then lives for this tab only. */
let memoryOnly = false;

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    memoryOnly = true;
    return null;
  }
}

function getSnapshot(): Records {
  if (memoryOnly) return cacheValue;
  const raw = readStorage();
  if (memoryOnly) return cacheValue;
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cacheValue = raw ? (JSON.parse(raw) as Records) : EMPTY;
    } catch {
      cacheValue = EMPTY;
    }
  }
  return cacheValue;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function save(next: Records) {
  cacheValue = next;
  try {
    const raw = JSON.stringify(next);
    window.localStorage.setItem(KEY, raw);
    cacheRaw = raw;
  } catch {
    memoryOnly = true;
  }
  listeners.forEach((listener) => listener());
}

export function useLearningRecords(): Records {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function emptyRecord(slideCount = 0): ModuleRecord {
  return { furthestSlide: 0, slideCount, attemptsUsed: 0 };
}

export function updateRecord(id: string, update: (record: ModuleRecord) => ModuleRecord) {
  const current = getSnapshot();
  save({ ...current, [id]: update(current[id] ?? emptyRecord()) });
}

export function resetAllRecords() {
  save({});
}

/* ───────────── What the directory shows for a module ───────────── */

export type ModuleView = {
  status: ModuleStatus;
  progress: number;
  /** Due date for unfinished modules, expiry date for completed ones. */
  date: string;
  dateKind: "due" | "expires";
  locked: boolean;
  attemptsUsed: number;
};

export function moduleView(module: LearningModule, record?: ModuleRecord): ModuleView {
  const baseline = module.baseline;
  const baselineView: ModuleView = {
    status: baseline.status,
    progress: baseline.progress,
    date: baseline.date,
    dateKind: baseline.status === "Completed" ? "expires" : "due",
    locked: false,
    attemptsUsed: 0,
  };
  if (!record) return baselineView;

  if (record.passedAt) {
    return { status: "Completed", progress: 100, date: addMonths(localIsoDate(record.passedAt), module.validityMonths), dateKind: "expires", locked: false, attemptsUsed: record.attemptsUsed };
  }
  const locked = record.attemptsUsed >= MAX_ATTEMPTS;
  // A refresher on an already-valid module does not undo the existing certificate.
  if (baseline.status === "Completed") return { ...baselineView, locked, attemptsUsed: record.attemptsUsed };

  const studied = record.slideCount > 0 ? Math.round(((record.furthestSlide + 1) / record.slideCount) * 80) : 0;
  const progress = Math.min(95, Math.max(baseline.progress, studied + (record.attemptsUsed > 0 ? 10 : 0)));
  const started = record.furthestSlide > 0 || record.attemptsUsed > 0;
  return {
    status: started ? "In Progress" : baseline.status,
    progress: started ? progress : baseline.progress,
    date: baseline.date,
    dateKind: "due",
    locked,
    attemptsUsed: record.attemptsUsed,
  };
}

/* ───────────── Remembered directory layout (per browser) ───────────── */

export type LearningLayout = "grid" | "list";
const LAYOUT_KEY = "marifa.learning.layout";
const layoutListeners = new Set<() => void>();
let memoryLayout: LearningLayout | null = null;

function getLayout(): LearningLayout {
  if (memoryLayout) return memoryLayout;
  try {
    return window.localStorage.getItem(LAYOUT_KEY) === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

export function useLearningLayout(): LearningLayout {
  return useSyncExternalStore(
    (listener) => {
      layoutListeners.add(listener);
      return () => layoutListeners.delete(listener);
    },
    getLayout,
    () => "grid",
  );
}

export function setLearningLayout(layout: LearningLayout) {
  try {
    window.localStorage.setItem(LAYOUT_KEY, layout);
  } catch {
    memoryLayout = layout;
  }
  layoutListeners.forEach((listener) => listener());
}
