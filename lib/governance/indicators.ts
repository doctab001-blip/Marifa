/**
 * Clinical quality indicators: definitions the hospital writes, and append-only reporting periods.
 * The maths here mirrors the database guard (gov_indicator_result_guard) so the form can explain a problem before saving.
 * No clinical thresholds or regulatory targets are built in: templates carry definitions to adapt, never a target.
 */

export type MeasureType = "percentage" | "rate" | "count" | "time" | "continuous";
export type Direction = "higher_is_better" | "lower_is_better" | "within_range";
export type Frequency = "weekly" | "monthly" | "quarterly" | "biannual" | "annual" | "ad_hoc";
export type Verification = "unverified" | "verified" | "rejected";

export type IndicatorRow = {
  id: string;
  code: string;
  title: string;
  domain: string;
  department: string;
  description: string;
  numeratorDefinition: string;
  denominatorDefinition: string;
  inclusionCriteria: string;
  exclusionCriteria: string;
  dataSource: string;
  frequency: Frequency;
  measureType: MeasureType;
  rateMultiplier: number | null;
  unit: string;
  targetValue: number | null;
  targetUpper: number | null;
  direction: Direction;
  ownerUserId: string | null;
  templateKey: string | null;
  status: "active" | "retired";
};

export type IndicatorResultRow = {
  id: string;
  indicatorId: string;
  periodStart: string;
  periodEnd: string;
  numerator: number | null;
  denominator: number | null;
  value: number | null;
  sampleSize: number | null;
  evidenceId: string | null;
  notes: string;
  sourceKind: "manual" | "audit";
  auditId: string | null;
  verification: Verification;
  verifiedBy: string | null;
  verifiedAt: string | null;
  verificationNote: string;
  supersedesId: string | null;
  enteredBy: string | null;
  enteredAt: string;
};

export const MEASURE_LABEL: Record<MeasureType, string> = {
  percentage: "Percentage (numerator ÷ denominator × 100)",
  rate: "Rate (numerator ÷ denominator × multiplier)",
  count: "Count",
  time: "Time / duration",
  continuous: "Continuous value",
};
export const FREQUENCY_LABEL: Record<Frequency, string> = {
  weekly: "Weekly", monthly: "Monthly", quarterly: "Quarterly", biannual: "Twice a year", annual: "Annual", ad_hoc: "Ad hoc",
};
export const DIRECTION_LABEL: Record<Direction, string> = {
  higher_is_better: "Higher is better", lower_is_better: "Lower is better", within_range: "Within a range",
};
export const VERIFICATION_LABEL: Record<Verification, string> = { unverified: "Unverified", verified: "Verified", rejected: "Rejected" };

export type ComputedValue = { value: number | null; noEligibleCases: boolean; error: string | null };

/** Same rules as the database: no division by zero, no percentage above 100, counts are whole numbers. */
export function computeResultValue(
  measureType: MeasureType,
  input: { numerator: number | null; denominator: number | null; value: number | null },
  rateMultiplier: number | null = null,
): ComputedValue {
  const bad = (error: string): ComputedValue => ({ value: null, noEligibleCases: false, error });
  if (measureType === "percentage" || measureType === "rate") {
    const { numerator: n, denominator: d } = input;
    if (n === null || d === null || !Number.isFinite(n) || !Number.isFinite(d)) return bad("Enter both the numerator and the denominator.");
    if (n < 0 || d < 0) return bad("The numerator and denominator cannot be negative.");
    if (measureType === "percentage" && n > d) return bad("The numerator cannot be larger than the denominator.");
    if (d === 0) {
      if (n !== 0) return bad("With no eligible cases the numerator must be 0.");
      return { value: null, noEligibleCases: true, error: null };
    }
    if (measureType === "rate" && (rateMultiplier === null || rateMultiplier <= 0)) return bad("This rate indicator has no multiplier (for example per 1,000).");
    const factor = measureType === "percentage" ? 100 : (rateMultiplier as number);
    return { value: Math.round((n / d) * factor * 10_000) / 10_000, noEligibleCases: false, error: null };
  }
  const v = input.value;
  if (v === null || !Number.isFinite(v)) return bad("Enter the measured value.");
  if (measureType === "count" && (v < 0 || !Number.isInteger(v))) return bad("A count must be a whole number of 0 or more.");
  if (measureType === "time" && v < 0) return bad("A duration cannot be negative.");
  return { value: v, noEligibleCases: false, error: null };
}

/** Reporting history without the values that were later corrected, oldest period first. */
export function currentSeries(results: IndicatorResultRow[]): IndicatorResultRow[] {
  const replaced = new Set(results.map((r) => r.supersedesId).filter((id): id is string => Boolean(id)));
  return results
    .filter((r) => !replaced.has(r.id) && r.verification !== "rejected")
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart) || a.enteredAt.localeCompare(b.enteredAt));
}

export type IndicatorJudgement = "on_target" | "off_target" | "no_target" | "no_data" | "no_eligible_cases";

export function judge(indicator: Pick<IndicatorRow, "targetValue" | "targetUpper" | "direction">, result: IndicatorResultRow | undefined): IndicatorJudgement {
  if (!result) return "no_data";
  if (result.value === null) return "no_eligible_cases";
  if (indicator.targetValue === null) return "no_target";
  const v = result.value;
  if (indicator.direction === "higher_is_better") return v >= indicator.targetValue ? "on_target" : "off_target";
  if (indicator.direction === "lower_is_better") return v <= indicator.targetValue ? "on_target" : "off_target";
  const upper = indicator.targetUpper ?? indicator.targetValue;
  return v >= indicator.targetValue && v <= upper ? "on_target" : "off_target";
}

export const JUDGEMENT_LABEL: Record<IndicatorJudgement, string> = {
  on_target: "Meets target",
  off_target: "Outside target",
  no_target: "No target set",
  no_data: "No data yet",
  no_eligible_cases: "No eligible cases",
};

export type IndicatorSummary = {
  latest: IndicatorResultRow | undefined;
  previous: IndicatorResultRow | undefined;
  judgement: IndicatorJudgement;
  /** Change from the previous period, in the indicator's own unit. Null when either value is missing. */
  change: number | null;
  /** Whether the change moved in the indicator's better direction. Null when there is no direction to judge. */
  improving: boolean | null;
  series: IndicatorResultRow[];
  unverifiedCount: number;
};

export function summariseIndicator(indicator: IndicatorRow, results: IndicatorResultRow[]): IndicatorSummary {
  const series = currentSeries(results.filter((r) => r.indicatorId === indicator.id));
  const latest = series.at(-1);
  const previous = series.at(-2);
  const change = latest?.value != null && previous?.value != null ? Math.round((latest.value - previous.value) * 100) / 100 : null;
  let improving: boolean | null = null;
  if (change !== null && change !== 0 && indicator.direction !== "within_range") improving = indicator.direction === "higher_is_better" ? change > 0 : change < 0;
  return { latest, previous, judgement: judge(indicator, latest), change, improving, series, unverifiedCount: series.filter((r) => r.verification === "unverified").length };
}

export function formatIndicatorValue(indicator: Pick<IndicatorRow, "measureType" | "unit" | "rateMultiplier">, value: number | null): string {
  if (value === null) return "—";
  const rounded = Math.abs(value) >= 100 ? Math.round(value * 10) / 10 : Math.round(value * 100) / 100;
  if (indicator.measureType === "percentage") return `${rounded}%`;
  if (indicator.measureType === "rate") return `${rounded} ${indicator.unit || `per ${(indicator.rateMultiplier ?? 1).toLocaleString("en-GB")}`}`.trim();
  return `${rounded}${indicator.unit ? ` ${indicator.unit}` : ""}`;
}

export function periodLabel(start: string, end: string): string {
  const s = new Date(`${start}T00:00:00Z`), e = new Date(`${end}T00:00:00Z`);
  const month = (d: Date) => d.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
  if (start.slice(0, 7) === end.slice(0, 7)) return month(s);
  return `${month(s)} – ${month(e)}`;
}

/**
 * Starting points a quality team can adapt. Definitions are generic descriptions of commonly used measures, not
 * regulatory wording, and NO template sets a target: the hospital decides its own.
 */
export type IndicatorTemplate = {
  key: string;
  title: string;
  domain: string;
  measureType: MeasureType;
  rateMultiplier?: number;
  unit?: string;
  direction: Direction;
  frequency: Frequency;
  description: string;
  numeratorDefinition: string;
  denominatorDefinition: string;
  inclusionCriteria: string;
  exclusionCriteria: string;
  dataSource: string;
};

export const INDICATOR_TEMPLATES: IndicatorTemplate[] = [
  {
    key: "hand_hygiene", title: "Hand hygiene compliance", domain: "Infection prevention and control", measureType: "percentage",
    direction: "higher_is_better", frequency: "monthly",
    description: "Share of observed hand hygiene opportunities where hand hygiene was performed.",
    numeratorDefinition: "Observed opportunities where hand hygiene was performed correctly.",
    denominatorDefinition: "All hand hygiene opportunities observed in the period.",
    inclusionCriteria: "Opportunities observed by trained observers using the hospital's observation tool.",
    exclusionCriteria: "Define locally (for example, opportunities that could not be fully observed).",
    dataSource: "Direct observation audit",
  },
  {
    key: "sepsis_pathway", title: "Sepsis pathway compliance", domain: "Patient safety", measureType: "percentage",
    direction: "higher_is_better", frequency: "monthly",
    description: "Share of eligible patients whose care met every element of the hospital's approved sepsis pathway.",
    numeratorDefinition: "Eligible patients for whom all pathway elements defined in the local protocol were completed within the protocol's timeframes.",
    denominatorDefinition: "Patients meeting the local protocol's sepsis screening criteria in the period.",
    inclusionCriteria: "As defined in the hospital's approved sepsis protocol.",
    exclusionCriteria: "As defined in the hospital's approved sepsis protocol.",
    dataSource: "Clinical record review",
  },
  {
    key: "vte_assessment", title: "VTE risk assessment completion", domain: "Patient safety", measureType: "percentage",
    direction: "higher_is_better", frequency: "monthly",
    description: "Share of admitted patients with a documented VTE risk assessment within the timeframe set by local policy.",
    numeratorDefinition: "Admissions with a completed VTE risk assessment within the locally defined timeframe.",
    denominatorDefinition: "Admissions in scope in the period.",
    inclusionCriteria: "Define the admission types in scope locally.",
    exclusionCriteria: "Define locally.",
    dataSource: "Clinical record review",
  },
  {
    key: "med_reconciliation", title: "Medication reconciliation completion", domain: "Medication safety", measureType: "percentage",
    direction: "higher_is_better", frequency: "monthly",
    description: "Share of patients with medication reconciliation documented within the timeframe set by local policy.",
    numeratorDefinition: "Patients with completed, documented medication reconciliation within the locally defined timeframe.",
    denominatorDefinition: "Patients in scope (for example admissions or transfers, as defined locally).",
    inclusionCriteria: "Define the care transitions in scope locally.",
    exclusionCriteria: "Define locally.",
    dataSource: "Clinical record review",
  },
  {
    key: "documentation", title: "Clinical documentation compliance", domain: "Clinical governance", measureType: "percentage",
    direction: "higher_is_better", frequency: "quarterly",
    description: "Share of audited records meeting every item of the hospital's documentation audit tool.",
    numeratorDefinition: "Audited records meeting all items in the local documentation audit tool.",
    denominatorDefinition: "Records audited in the period.",
    inclusionCriteria: "Records sampled according to the audit plan.",
    exclusionCriteria: "Define locally.",
    dataSource: "Documentation audit",
  },
  {
    key: "falls_reporting", title: "Falls reporting rate", domain: "Patient safety", measureType: "rate", rateMultiplier: 1000,
    unit: "per 1,000 patient-days", direction: "lower_is_better", frequency: "monthly",
    description: "Reported inpatient falls relative to patient-days. Interpret with care: better reporting can raise the rate.",
    numeratorDefinition: "Inpatient falls reported in the incident system in the period.",
    denominatorDefinition: "Inpatient patient-days in the same period.",
    inclusionCriteria: "Define the wards in scope locally.",
    exclusionCriteria: "Define locally.",
    dataSource: "Incident reporting system and bed census",
  },
  {
    key: "incident_closure", title: "Incident closure timeliness", domain: "Clinical governance", measureType: "percentage",
    direction: "higher_is_better", frequency: "monthly",
    description: "Share of incidents closed within the timeframe defined in the hospital's incident management policy.",
    numeratorDefinition: "Incidents closed within the locally defined timeframe.",
    denominatorDefinition: "Incidents due for closure in the period.",
    inclusionCriteria: "Define by incident category or severity locally.",
    exclusionCriteria: "Define locally.",
    dataSource: "Incident register",
  },
];
