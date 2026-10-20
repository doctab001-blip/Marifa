import type {
  AuditRow, CapaRow, EvidenceRow, GovSettings, IncidentRow, PolicyRow, QipRow, StandardRow, StandardStatusRow,
} from "@/lib/governance/types";

/**
 * Readiness maths for the CBAHI Accreditation Hub. Pure functions over plain records: nothing here reads a database
 * or the clock, so every number on the dashboard can be traced to records and reproduced in a test.
 *
 * Scoring model (CBAHI Hospital Accreditation Process Guide, October 2016, 3rd edition standards):
 *   - each applicable sub-standard is rated 0 (insufficient), 1 (partial) or 2 (satisfactory); "not applicable" is excluded;
 *   - the overall score is the arithmetic mean of the applicable sub-standards, shown as a percentage of the maximum (2);
 *   - every ESR (Essential Safety Requirement) must be satisfactory for full accreditation;
 *   - accredited: overall >= 85 and all ESRs satisfactory; denial risk: overall < 75 or more than 25% of ESRs not satisfactory;
 *     anything between is conditional.
 * The thresholds live in settings so a hospital can follow the edition it is actually surveyed under.
 *
 * This is an INDICATION for preparation, never an accreditation decision. It is withheld until every applicable standard has
 * been assessed, so an unfinished self-assessment cannot look like a pass.
 */

const DAY_MS = 86_400_000;
export const EXPIRING_DAYS = 60;

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (negative when `to` is earlier), ignoring time of day. */
export function daysBetween(from: string | Date, to: string | Date): number {
  const f = typeof from === "string" ? from.slice(0, 10) : isoDate(from);
  const t = typeof to === "string" ? to.slice(0, 10) : isoDate(to);
  return Math.round((Date.parse(t) - Date.parse(f)) / DAY_MS);
}

export function addMonths(iso: string, months: number): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return isoDate(d);
}

export type EvidenceHealth = "none" | "valid" | "expiring" | "expired";

/** Health of the evidence attached to ONE standard. Withdrawn records never count. */
export function evidenceHealth(items: Pick<EvidenceRow, "validUntil" | "withdrawnAt">[], today: Date): EvidenceHealth {
  const active = items.filter((item) => !item.withdrawnAt);
  if (active.length === 0) return "none";
  if (active.some((item) => item.validUntil === null)) return "valid";
  const latest = active.map((item) => item.validUntil as string).sort().at(-1) as string;
  const left = daysBetween(today, latest);
  if (left < 0) return "expired";
  return left <= EXPIRING_DAYS ? "expiring" : "valid";
}

/** A satisfactory rating only counts while the evidence behind it is current. */
export function isBackedByEvidence(health: EvidenceHealth): boolean {
  return health === "valid" || health === "expiring";
}

export type Outcome = "accreditation" | "conditional" | "denial_risk";
export const OUTCOME_LABEL: Record<Outcome, string> = {
  accreditation: "On track for accreditation",
  conditional: "Conditional accreditation range",
  denial_risk: "Denial risk",
};

export type ChapterScore = {
  key: string;
  chapterCode: string;
  chapterName: string;
  total: number;
  assessed: number;
  esrTotal: number;
  esrNotSatisfactory: number;
  /** Mean of assessed applicable standards, as % of the maximum. Null when none are assessed yet. */
  pct: number | null;
};

export type Readiness = {
  totalStandards: number;
  notApplicable: number;
  applicable: number;
  assessed: number;
  unassessed: number;
  coveragePct: number | null;
  satisfactory: number;
  partial: number;
  insufficient: number;
  /** Rated satisfactory, but the evidence behind the rating has expired or is gone. Counted as partial in the headline. */
  satisfactoryWithoutCurrentEvidence: number;
  expiringEvidence: number;
  reviewOverdue: number;
  /** Headline: evidence-adjusted, over assessed standards. */
  overallPct: number | null;
  /** The same maths using the ratings exactly as recorded. */
  recordedPct: number | null;
  /** Assuming every unassessed standard scores 0. */
  worstCasePct: number | null;
  esrTotal: number;
  esrSatisfactory: number;
  /** ESRs that are not satisfactory, including unassessed ones. */
  esrNotSatisfactory: number;
  esrNotSatisfactoryPct: number | null;
  outcome: Outcome | null;
  outcomeNote: string;
  chapters: ChapterScore[];
};

const POINTS = { insufficient: 0, partial: 1, satisfactory: 2 } as const;

export function computeReadiness(
  standards: StandardRow[],
  statuses: StandardStatusRow[],
  evidence: EvidenceRow[],
  settings: GovSettings,
  today: Date,
): Readiness {
  const statusById = new Map(statuses.map((row) => [row.standardId, row]));
  const evidenceById = new Map<string, EvidenceRow[]>();
  for (const item of evidence) {
    const list = evidenceById.get(item.standardId) ?? [];
    list.push(item);
    evidenceById.set(item.standardId, list);
  }
  const todayIso = isoDate(today);

  let notApplicable = 0, assessed = 0, unassessed = 0, satisfactory = 0, partial = 0, insufficient = 0;
  let sumRecorded = 0, sumAdjusted = 0, noCurrentEvidence = 0, expiring = 0, reviewOverdue = 0;
  let esrTotal = 0, esrSatisfactory = 0, esrNotSatisfactory = 0;
  const chapterMap = new Map<string, ChapterScore & { sum: number }>();

  for (const standard of standards) {
    const key = standard.chapterCode || standard.chapterName || "—";
    const chapter = chapterMap.get(key) ?? { key, chapterCode: standard.chapterCode, chapterName: standard.chapterName, total: 0, assessed: 0, esrTotal: 0, esrNotSatisfactory: 0, pct: null, sum: 0 };
    chapterMap.set(key, chapter);

    const status = statusById.get(standard.id);
    const rating = status?.rating ?? null;
    if (rating === "not_applicable") { notApplicable += 1; continue; }

    chapter.total += 1;
    if (standard.isEsr) { esrTotal += 1; chapter.esrTotal += 1; }

    if (rating === null) {
      unassessed += 1;
      if (standard.isEsr) { esrNotSatisfactory += 1; chapter.esrNotSatisfactory += 1; }
      continue;
    }

    assessed += 1;
    chapter.assessed += 1;
    if (rating === "satisfactory") satisfactory += 1;
    else if (rating === "partial") partial += 1;
    else insufficient += 1;

    let adjusted: number = POINTS[rating];
    if (rating === "satisfactory") {
      const health = evidenceHealth(evidenceById.get(standard.id) ?? [], today);
      if (!isBackedByEvidence(health)) { adjusted = POINTS.partial; noCurrentEvidence += 1; }
      else if (health === "expiring") expiring += 1;
    }
    sumRecorded += POINTS[rating];
    sumAdjusted += adjusted;
    chapter.sum += adjusted;

    if (standard.isEsr) {
      if (adjusted === POINTS.satisfactory) esrSatisfactory += 1;
      else { esrNotSatisfactory += 1; chapter.esrNotSatisfactory += 1; }
    }
    if (status?.nextReviewDue && status.nextReviewDue < todayIso) reviewOverdue += 1;
  }

  const applicable = assessed + unassessed;
  const pct = (sum: number, n: number) => (n === 0 ? null : round1((sum / (n * 2)) * 100));
  const overallPct = pct(sumAdjusted, assessed);
  const esrNotSatisfactoryPct = esrTotal === 0 ? null : round1((esrNotSatisfactory / esrTotal) * 100);

  let outcome: Outcome | null = null;
  let outcomeNote: string;
  if (applicable === 0) {
    outcomeNote = "Import your standards register to begin.";
  } else if (unassessed > 0) {
    outcomeNote = `${unassessed} of ${applicable} applicable standards have not been assessed, so no outcome is indicated yet.`;
  } else {
    const overall = overallPct as number;
    const esrShare = esrNotSatisfactoryPct ?? 0;
    if (overall < settings.conditionalMinOverall || esrShare > settings.esrUnsatisfactoryMaxPct) {
      outcome = "denial_risk";
      outcomeNote = overall < settings.conditionalMinOverall
        ? `Overall ${overall}% is below the ${settings.conditionalMinOverall}% threshold.`
        : `${esrShare}% of ESRs are not satisfactory (limit ${settings.esrUnsatisfactoryMaxPct}%).`;
    } else if (overall >= settings.accreditedMinOverall && esrNotSatisfactory === 0) {
      outcome = "accreditation";
      outcomeNote = `Overall ${overall}% with every ESR satisfactory.`;
    } else {
      outcome = "conditional";
      outcomeNote = esrNotSatisfactory > 0
        ? `${esrNotSatisfactory} ESR${esrNotSatisfactory === 1 ? " is" : "s are"} not satisfactory; every ESR must be satisfactory to be accredited.`
        : `Overall ${overall}% is below the ${settings.accreditedMinOverall}% needed for full accreditation.`;
    }
  }

  const chapters = [...chapterMap.values()]
    .filter((chapter) => chapter.total > 0)
    .map(({ sum, ...chapter }) => ({ ...chapter, pct: pct(sum, chapter.assessed) }))
    .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));

  return {
    totalStandards: standards.length,
    notApplicable,
    applicable,
    assessed,
    unassessed,
    coveragePct: applicable === 0 ? null : round1((assessed / applicable) * 100),
    satisfactory, partial, insufficient,
    satisfactoryWithoutCurrentEvidence: noCurrentEvidence,
    expiringEvidence: expiring,
    reviewOverdue,
    overallPct,
    recordedPct: pct(sumRecorded, assessed),
    worstCasePct: pct(sumAdjusted, applicable),
    esrTotal, esrSatisfactory, esrNotSatisfactory, esrNotSatisfactoryPct,
    outcome, outcomeNote, chapters,
  };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/* ---------------------------------------------------------------------------------------------------------------- */
/* Policies                                                                                                          */
/* ---------------------------------------------------------------------------------------------------------------- */

export type PolicyHealth = {
  policy: PolicyRow;
  assigned: number;
  acknowledged: number;
  /** Null until anyone is assigned: an unassigned policy has no rate, not 0% and not 100%. */
  ackPct: number | null;
  overdueAssignments: number;
  reviewState: "ok" | "due_soon" | "overdue" | "none";
};

export type PolicyOverview = {
  items: PolicyHealth[];
  approved: number;
  inReview: number;
  drafts: number;
  reviewOverdue: number;
  reviewDueSoon: number;
  assigned: number;
  acknowledged: number;
  ackPct: number | null;
  overdueAssignments: number;
};

export type PolicyAckSummary = { policyId: string; assigned: number; acknowledged: number; overdue: number };

export function summarisePolicies(policies: PolicyRow[], ackSummary: PolicyAckSummary[], today: Date): PolicyOverview {
  const todayIso = isoDate(today);
  const byPolicy = new Map(ackSummary.map((row) => [row.policyId, row]));
  const items = policies.map((policy): PolicyHealth => {
    const row = byPolicy.get(policy.id) ?? { policyId: policy.id, assigned: 0, acknowledged: 0, overdue: 0 };
    let reviewState: PolicyHealth["reviewState"] = "none";
    if (policy.status === "approved" && policy.nextReviewDue) {
      const left = daysBetween(todayIso, policy.nextReviewDue);
      reviewState = left < 0 ? "overdue" : left <= EXPIRING_DAYS ? "due_soon" : "ok";
    }
    return {
      policy, assigned: row.assigned, acknowledged: row.acknowledged,
      ackPct: row.assigned === 0 ? null : round1((row.acknowledged / row.assigned) * 100),
      overdueAssignments: row.overdue, reviewState,
    };
  });
  const approvedItems = items.filter((item) => item.policy.status === "approved");
  const assigned = approvedItems.reduce((n, item) => n + item.assigned, 0);
  const acknowledged = approvedItems.reduce((n, item) => n + item.acknowledged, 0);
  return {
    items,
    approved: approvedItems.length,
    inReview: items.filter((item) => item.policy.status === "under_committee_review").length,
    drafts: items.filter((item) => item.policy.status === "draft").length,
    reviewOverdue: approvedItems.filter((item) => item.reviewState === "overdue").length,
    reviewDueSoon: approvedItems.filter((item) => item.reviewState === "due_soon").length,
    assigned,
    acknowledged,
    ackPct: assigned === 0 ? null : round1((acknowledged / assigned) * 100),
    overdueAssignments: approvedItems.reduce((n, item) => n + item.overdueAssignments, 0),
  };
}

/* ---------------------------------------------------------------------------------------------------------------- */
/* Incidents, CAPA, audits, QIPs                                                                                     */
/* ---------------------------------------------------------------------------------------------------------------- */

export type RiskBand = "low" | "moderate" | "high" | "extreme";
export const RISK_BAND_LABEL: Record<RiskBand, string> = { low: "Low", moderate: "Moderate", high: "High", extreme: "Extreme" };
export const LIKELIHOOD_LABEL = ["Rare", "Unlikely", "Possible", "Likely", "Almost certain"];
export const IMPACT_LABEL = ["Negligible", "Minor", "Moderate", "Major", "Catastrophic"];

/** Generic 5x5 matrix banding (likelihood x impact). It is the organisation's own matrix, not a CBAHI-defined one. */
export function riskBand(score: number): RiskBand {
  return score >= 15 ? "extreme" : score >= 10 ? "high" : score >= 5 ? "moderate" : "low";
}

export function isCapaOverdue(capa: Pick<CapaRow, "status" | "dueDate">, today: Date): boolean {
  return (capa.status === "open" || capa.status === "in_progress") && capa.dueDate < isoDate(today);
}

export type SafetyOverview = {
  openIncidents: number;
  openSentinel: number;
  highRiskOpen: number;
  capaOpen: number;
  capaOverdue: number;
  capaAwaitingVerification: number;
  sentinelMissingRca: number;
};

export function summariseSafety(incidents: IncidentRow[], capa: CapaRow[], today: Date): SafetyOverview {
  const open = incidents.filter((incident) => incident.status !== "closed");
  return {
    openIncidents: open.length,
    openSentinel: open.filter((incident) => incident.isSentinel).length,
    highRiskOpen: open.filter((incident) => riskBand(incident.riskScore) === "high" || riskBand(incident.riskScore) === "extreme").length,
    capaOpen: capa.filter((item) => item.status === "open" || item.status === "in_progress").length,
    capaOverdue: capa.filter((item) => isCapaOverdue(item, today)).length,
    capaAwaitingVerification: capa.filter((item) => item.status === "done").length,
    sentinelMissingRca: open.filter((incident) => incident.isSentinel && incident.rootCause.trim() === "").length,
  };
}

export type AuditOverview = { scheduledNext30: number; overdue: number; completed: number; belowTarget: number; activeQips: number };

export function summariseAuditsAndQips(audits: AuditRow[], qips: QipRow[], today: Date): AuditOverview {
  const todayIso = isoDate(today);
  const open = audits.filter((audit) => audit.status === "scheduled" || audit.status === "in_progress");
  return {
    scheduledNext30: open.filter((audit) => audit.scheduledFor >= todayIso && daysBetween(todayIso, audit.scheduledFor) <= 30).length,
    overdue: open.filter((audit) => audit.scheduledFor < todayIso).length,
    completed: audits.filter((audit) => audit.status === "completed").length,
    belowTarget: audits.filter((audit) => audit.status === "completed" && audit.targetPct !== null && audit.resultPct !== null && audit.resultPct < audit.targetPct).length,
    activeQips: qips.filter((qip) => qip.status === "active").length,
  };
}

/* ---------------------------------------------------------------------------------------------------------------- */
/* Accreditation calendar                                                                                            */
/* ---------------------------------------------------------------------------------------------------------------- */

export type Milestones = {
  awardedOn: string;
  expiresOn: string;
  daysToExpiry: number;
  /** Mid-term self-assessment, about 18 months after the award. */
  midTermSelfAssessmentDue: string;
  /** Re-accreditation application update, 12 weeks before expiry. */
  reaccreditationUpdateDue: string;
};

export function accreditationMilestones(settings: GovSettings, today: Date): Milestones | null {
  if (!settings.accreditationAwardedOn) return null;
  const expiresOn = addMonths(settings.accreditationAwardedOn, settings.validityYears * 12);
  const expiry = new Date(`${expiresOn}T00:00:00Z`);
  return {
    awardedOn: settings.accreditationAwardedOn,
    expiresOn,
    daysToExpiry: daysBetween(today, expiresOn),
    midTermSelfAssessmentDue: addMonths(settings.accreditationAwardedOn, 18),
    reaccreditationUpdateDue: isoDate(new Date(expiry.getTime() - 12 * 7 * DAY_MS)),
  };
}
