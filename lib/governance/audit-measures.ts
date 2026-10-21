/**
 * Clinical audit templates, per-case observations and the compliance maths. A case counts as compliant only when every
 * criterion that applies to it was met; criteria marked "not applicable" are left out of that case, and a case where no
 * criterion applies is left out of the denominator. Per-criterion compliance is reported alongside.
 */

export type CriterionResult = "met" | "not_met" | "na";
export type Criterion = { id: string; text: string };

export type AuditTemplateRow = {
  id: string;
  title: string;
  objective: string;
  clinicalStandard: string;
  standardId: string | null;
  criteria: Criterion[];
  inclusionCriteria: string;
  exclusionCriteria: string;
  sampleSize: number | null;
  measurementPeriod: string;
  dataCollectionMethod: string;
  numeratorDefinition: string;
  denominatorDefinition: string;
  leadUserId: string | null;
  actionPlanGuidance: string;
  reauditIntervalMonths: number | null;
  isActive: boolean;
};

export type ObservationRow = {
  id: string;
  auditId: string;
  caseRef: string;
  results: Record<string, CriterionResult>;
  note: string;
  observedOn: string;
  recordedBy: string | null;
};

export type CriterionCompliance = { criterion: Criterion; met: number; notMet: number; na: number; pct: number | null };

export type AuditCompliance = {
  cases: number;
  /** Cases where at least one criterion applied. */
  denominator: number;
  /** Of those, cases where every applicable criterion was met. */
  numerator: number;
  pct: number | null;
  byCriterion: CriterionCompliance[];
};

export function auditCompliance(criteria: Criterion[], observations: ObservationRow[]): AuditCompliance {
  let numerator = 0, denominator = 0;
  for (const obs of observations) {
    const applicable = criteria.filter((c) => obs.results[c.id] === "met" || obs.results[c.id] === "not_met");
    if (applicable.length === 0) continue;
    denominator += 1;
    if (applicable.every((c) => obs.results[c.id] === "met")) numerator += 1;
  }
  const byCriterion = criteria.map((criterion) => {
    const met = observations.filter((o) => o.results[criterion.id] === "met").length;
    const notMet = observations.filter((o) => o.results[criterion.id] === "not_met").length;
    const na = observations.length - met - notMet;
    return { criterion, met, notMet, na, pct: met + notMet === 0 ? null : round1((met / (met + notMet)) * 100) };
  });
  return { cases: observations.length, denominator, numerator, pct: denominator === 0 ? null : round1((numerator / denominator) * 100), byCriterion };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Cleans criteria typed one per line into stable ids (c1, c2…). Blank lines are dropped; at most 40. */
export function criteriaFromLines(text: string): Criterion[] {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 40).map((line, i) => ({ id: `c${i + 1}`, text: line.slice(0, 500) }));
}

export function parseCriteria(value: unknown): Criterion[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((c): c is { id: unknown; text: unknown } => typeof c === "object" && c !== null)
    .map((c) => ({ id: String(c.id ?? ""), text: String(c.text ?? "") }))
    .filter((c) => c.id && c.text);
}

/* ---- PDSA cycles ------------------------------------------------------------------------------------------------ */

export type CycleStatus = "plan" | "do" | "study" | "act" | "closed";
export type ActDecision = "adopt" | "adapt" | "abandon" | "repeat";

export type QipCycleRow = {
  id: string;
  qipId: string;
  cycleNo: number;
  status: CycleStatus;
  planAim: string;
  prediction: string;
  intervention: string;
  measurementPlan: string;
  doNotes: string;
  doObservations: string;
  studyResults: string;
  studyComparison: string;
  lessonsLearned: string;
  actDecision: ActDecision | null;
  actNotes: string;
  startedOn: string;
  closedAt: string | null;
};

export const ACT_DECISION_LABEL: Record<ActDecision, string> = {
  adopt: "Adopt — make the change standard practice",
  adapt: "Adapt — change the idea and test again",
  abandon: "Abandon — stop this change",
  repeat: "Repeat — run the same test again",
};

export const CYCLE_STEPS: { key: CycleStatus; label: string; hint: string }[] = [
  { key: "plan", label: "Plan", hint: "Aim, prediction, intervention, measures" },
  { key: "do", label: "Do", hint: "Carry out the test, record what happened" },
  { key: "study", label: "Study", hint: "Results against the prediction, lessons" },
  { key: "act", label: "Act", hint: "Adopt, adapt, abandon or repeat" },
];

/** What is still needed before a cycle may move on. Mirrors gov_qip_cycle_guard. */
export function cycleGap(cycle: QipCycleRow, to: CycleStatus): string | null {
  const ok: Record<CycleStatus, CycleStatus[]> = { plan: ["do"], do: ["study"], study: ["act", "do"], act: ["closed"], closed: [] };
  if (!ok[cycle.status].includes(to)) return `A cycle in ${cycle.status} cannot move to ${to}.`;
  if (to === "do" && cycle.status === "plan" && (!cycle.planAim.trim() || !cycle.intervention.trim())) return "Record the aim and the intervention first.";
  if (to === "act" && !cycle.studyResults.trim()) return "Record the results first.";
  if (to === "closed" && !cycle.actDecision) return "Choose adopt, adapt, abandon or repeat.";
  return null;
}
