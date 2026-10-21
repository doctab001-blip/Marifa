import { describe, expect, it } from "vitest";
import { auditCompliance, criteriaFromLines, cycleGap, type ObservationRow, type QipCycleRow } from "@/lib/governance/audit-measures";
import { allowedMeetingTransitions, attendanceSummary, transitionProblem } from "@/lib/governance/committees";
import { parseCsv } from "@/lib/governance/csv";
import {
  completeness, evidenceLifecycle, requirementState, supersededIds, versionHistory,
  type EvidenceWithVersion, type RequirementRow, type SubmissionRow,
} from "@/lib/governance/evidence-requirements";
import { governanceView, linksOf, summariseGuidelines, type GovernedGuideline, type LinkRow } from "@/lib/governance/guideline-governance";
import { buildImportPlan, guessMapping, type ExistingRegister } from "@/lib/governance/hierarchy";
import {
  INDICATOR_TEMPLATES, computeResultValue, currentSeries, formatIndicatorValue, judge, summariseIndicator,
  type IndicatorResultRow, type IndicatorRow,
} from "@/lib/governance/indicators";
import { notificationViews, ruleApplies, type RegulatoryRuleRow } from "@/lib/governance/regulatory";
import { DEFAULT_RISK_THRESHOLDS, riskBand, riskBandWith, summariseSafety } from "@/lib/governance/scoring";
import type { IncidentRow } from "@/lib/governance/types";

const TODAY = new Date("2026-10-21T09:00:00Z");
const NONE: ExistingRegister = { standards: [], elements: [] };

/* ================================================================================================================ */
describe("standards import planner", () => {
  const csv = [
    "Chapter,Standard code,Standard text,ME code,ME text,ESR",
    "LD,LD.1,Leadership standard one,LD.1.1,Element one,no",
    "LD,LD.1,,LD.1.2,Element two,yes",
    "LD,LD.2,Leadership standard two,,,",
  ].join("\n");
  const table = parseCsv(csv);
  const mapping = { ...guessMapping(table[0]), elementCode: 3, elementDescription: 4, elementEsr: 5 };

  it("guesses the obvious columns", () => {
    const m = guessMapping(table[0]);
    expect(m.chapterCode).toBe(0);
    expect(m.standardCode).toBe(1);
    expect(m.standardDescription).toBe(2);
  });

  it("imports valid standards and their measurable elements", () => {
    const plan = buildImportPlan({ table, mapping, existing: NONE, mode: "add_only" });
    expect(plan.rejected).toEqual([]);
    expect(plan.summary.standardsToCreate).toBe(2);
    expect(plan.summary.elementsToCreate).toBe(2);
    expect(plan.elements.find((e) => e.code === "LD.1.2")?.isEsr).toBe(true);
    expect(plan.elements.every((e) => e.standardCode === "LD.1")).toBe(true);
  });

  it("rejects an element whose parent standard does not exist", () => {
    const t = parseCsv("Standard code,ME code,ME text\nXX.9,XX.9.1,Orphan element");
    const plan = buildImportPlan({ table: t, mapping: { standardCode: 0, elementCode: 1, elementDescription: 2 }, existing: NONE, mode: "add_only" });
    expect(plan.elements).toHaveLength(0);
    expect(plan.rejected[0].message).toMatch(/no valid parent/);
  });

  it("accepts an element under a standard that is already in the register", () => {
    const existing: ExistingRegister = { standards: [{ id: "s1", code: "XX.9", description: "Existing", chapterCode: "", chapterName: "", isEsr: false, department: "" }], elements: [] };
    const t = parseCsv("Standard code,ME code,ME text\nXX.9,XX.9.1,New element");
    const plan = buildImportPlan({ table: t, mapping: { standardCode: 0, elementCode: 1, elementDescription: 2 }, existing, mode: "add_only" });
    expect(plan.rejected).toEqual([]);
    expect(plan.standards[0].action).toBe("unchanged");
    expect(plan.elements[0].action).toBe("create");
  });

  it("detects duplicate standard codes and duplicate elements in the file", () => {
    const t = parseCsv("Standard code,Standard text,ME code,ME text\nA.1,First,,\nA.1,Different text,,\nA.1,,A.1.1,x\nA.1,,A.1.1,y");
    const plan = buildImportPlan({ table: t, mapping: { standardCode: 0, standardDescription: 1, elementCode: 2, elementDescription: 3 }, existing: NONE, mode: "add_only" });
    expect(plan.rejected.map((r) => r.line)).toEqual([3, 5]);
    expect(plan.rejected[0].message).toMatch(/Duplicate standard code A\.1/);
    expect(plan.rejected[1].message).toMatch(/Duplicate element A\.1 \/ A\.1\.1/);
  });

  it("refuses to run without a standard code column", () => {
    const plan = buildImportPlan({ table, mapping: { standardDescription: 2 }, existing: NONE, mode: "add_only" });
    expect(plan.standards).toHaveLength(0);
    expect(plan.rejected[0].message).toMatch(/Standard code/);
  });

  it("keeps existing records (and so their assessment history) when updating an edition", () => {
    const existing: ExistingRegister = {
      standards: [{ id: "keep-me", code: "LD.1", description: "Old wording", chapterCode: "LD", chapterName: "", isEsr: false, department: "" }],
      elements: [{ id: "el-keep", standardCode: "LD.1", code: "LD.1.1", description: "Old element", officialCode: "", isEsr: false, department: "" }],
    };
    const addOnly = buildImportPlan({ table, mapping, existing, mode: "add_only" });
    expect(addOnly.standards.find((s) => s.code === "LD.1")?.action).toBe("unchanged");
    expect(addOnly.warnings.length).toBeGreaterThan(0);
    const update = buildImportPlan({ table, mapping, existing, mode: "add_and_update" });
    const std = update.standards.find((s) => s.code === "LD.1");
    expect(std?.action).toBe("update");
    expect(std?.existingId).toBe("keep-me");
    expect(update.elements.find((e) => e.code === "LD.1.1")?.existingId).toBe("el-keep");
    // Nothing in the plan ever deletes: records not in the file simply are not mentioned.
    expect(update.standards.every((s) => ["create", "update", "unchanged"].includes(s.action))).toBe(true);
  });
});

/* ================================================================================================================ */
describe("evidence requirements", () => {
  const req = (over: Partial<RequirementRow> = {}): RequirementRow => ({
    id: "r1", standardId: "s1", elementId: null, category: "audit_report", description: "", department: "", ownerUserId: null,
    isRequired: true, dueDate: null, isActive: true, ...over,
  });
  const ev = (id: string, over: Partial<EvidenceWithVersion> = {}): EvidenceWithVersion => ({
    id, standardId: "s1", title: id, evidenceType: "audit_report", storagePath: `p/${id}`, fileName: `${id}.pdf`, sizeBytes: 1,
    validFrom: null, validUntil: null, uploadedAt: "2026-09-01T00:00:00Z", uploadedBy: "u1", withdrawnAt: null, withdrawnReason: null,
    supersedesId: null, ...over,
  });
  const sub = (evidenceId: string, status: SubmissionRow["status"], over: Partial<SubmissionRow> = {}): SubmissionRow => ({
    id: `sub-${evidenceId}`, requirementId: "r1", evidenceId, status, submittedBy: "u1", submittedAt: "2026-09-02T00:00:00Z",
    reviewerUserId: status === "verified" ? "u2" : null, reviewedAt: null, reviewNote: "", ...over,
  });
  const state = (subs: SubmissionRow[], evidence: EvidenceWithVersion[], r = req()) =>
    requirementState(r, subs, new Map(evidence.map((e) => [e.id, e])), supersededIds(evidence), TODAY);

  it("is missing until a document is linked", () => {
    expect(state([], []).state).toBe("missing");
  });
  it("moves through uploaded, under review and verified", () => {
    expect(state([sub("e1", "uploaded")], [ev("e1")]).state).toBe("uploaded");
    expect(state([sub("e1", "under_review")], [ev("e1")]).state).toBe("under_review");
    expect(state([sub("e1", "verified")], [ev("e1")]).state).toBe("verified");
  });
  it("identifies expired evidence", () => {
    expect(state([sub("e1", "verified")], [ev("e1", { validUntil: "2026-01-01" })]).state).toBe("expired");
  });
  it("identifies superseded evidence when a newer version replaces the verified one", () => {
    const all = [ev("e1"), ev("e2", { supersedesId: "e1" })];
    expect(state([sub("e1", "verified")], all).state).toBe("superseded");
    expect(versionHistory(all[1], all).map((x) => x.id)).toEqual(["e1"]);
    expect(evidenceLifecycle(all[0], supersededIds(all), TODAY)).toBe("superseded");
  });
  it("withdrawn evidence no longer satisfies a requirement", () => {
    expect(state([sub("e1", "verified")], [ev("e1", { withdrawnAt: "2026-10-01", withdrawnReason: "wrong file" })]).state).toBe("missing");
  });
  it("completeness counts only required, verified and current items", () => {
    const views = [
      state([sub("e1", "verified")], [ev("e1")], req({ id: "r1" })),
      state([], [], req({ id: "r2" })),
      state([], [], req({ id: "r3", isRequired: false })),
    ];
    const c = completeness(views);
    expect(c.required).toBe(2);
    expect(c.satisfied).toBe(1);
    expect(c.pct).toBe(50);
    expect(c.missing.map((v) => v.requirement.id)).toEqual(["r2", "r3"]);
  });
  it("shows no completeness percentage when nothing is configured", () => {
    expect(completeness([]).pct).toBeNull();
  });
});

/* ================================================================================================================ */
describe("clinical quality indicators", () => {
  const ind = (over: Partial<IndicatorRow> = {}): IndicatorRow => ({
    id: "i1", code: "HH", title: "Hand hygiene", domain: "", department: "", description: "", numeratorDefinition: "", denominatorDefinition: "",
    inclusionCriteria: "", exclusionCriteria: "", dataSource: "", frequency: "monthly", measureType: "percentage", rateMultiplier: null,
    unit: "", targetValue: null, targetUpper: null, direction: "higher_is_better", ownerUserId: null, templateKey: null, status: "active", ...over,
  });
  const res = (id: string, start: string, value: number | null, over: Partial<IndicatorResultRow> = {}): IndicatorResultRow => ({
    id, indicatorId: "i1", periodStart: start, periodEnd: start, numerator: null, denominator: null, value, sampleSize: null, evidenceId: null,
    notes: "", sourceKind: "manual", auditId: null, verification: "unverified", verifiedBy: null, verifiedAt: null, verificationNote: "",
    supersedesId: null, enteredBy: "u1", enteredAt: `${start}T10:00:00Z`, ...over,
  });

  it("calculates numerator/denominator percentages and rates", () => {
    expect(computeResultValue("percentage", { numerator: 45, denominator: 50, value: null }).value).toBe(90);
    expect(computeResultValue("rate", { numerator: 3, denominator: 1500, value: null }, 1000).value).toBe(2);
  });
  it("handles a zero denominator as 'no eligible cases', never 0% and never division by zero", () => {
    const r = computeResultValue("percentage", { numerator: 0, denominator: 0, value: null });
    expect(r.value).toBeNull();
    expect(r.noEligibleCases).toBe(true);
    expect(r.error).toBeNull();
    expect(computeResultValue("rate", { numerator: 2, denominator: 0, value: null }, 1000).error).toMatch(/must be 0/);
    expect(computeResultValue("percentage", { numerator: 2, denominator: 0, value: null }).error).toMatch(/larger/);
  });
  it("rejects invalid percentages and counts", () => {
    expect(computeResultValue("percentage", { numerator: 51, denominator: 50, value: null }).error).toMatch(/larger/);
    expect(computeResultValue("count", { numerator: null, denominator: null, value: 2.5 }).error).toMatch(/whole number/);
    expect(computeResultValue("time", { numerator: null, denominator: null, value: -1 }).error).toMatch(/negative/);
    expect(computeResultValue("rate", { numerator: 1, denominator: 10, value: null }, null).error).toMatch(/multiplier/);
  });
  it("preserves reporting history: a correction replaces a value without deleting it", () => {
    const all = [res("a", "2026-07-01", 80), res("b", "2026-08-01", 70), res("c", "2026-08-01", 75, { supersedesId: "b" })];
    expect(currentSeries(all).map((r) => r.id)).toEqual(["a", "c"]);
    expect(all).toHaveLength(3);
  });
  it("distinguishes verified and unverified measurements", () => {
    const s = summariseIndicator(ind(), [res("a", "2026-07-01", 80, { verification: "verified", verifiedBy: "u2" }), res("b", "2026-08-01", 85)]);
    expect(s.unverifiedCount).toBe(1);
    expect(s.latest?.verification).toBe("unverified");
    expect(s.previous?.verification).toBe("verified");
  });
  it("judges against the hospital's own target and direction only", () => {
    expect(judge(ind(), res("a", "2026-07-01", 80))).toBe("no_target");
    expect(judge(ind({ targetValue: 90 }), res("a", "2026-07-01", 80))).toBe("off_target");
    expect(judge(ind({ targetValue: 5, direction: "lower_is_better" }), res("a", "2026-07-01", 3))).toBe("on_target");
    expect(judge(ind({ targetValue: 90 }), res("a", "2026-07-01", null))).toBe("no_eligible_cases");
  });
  it("reports change from the previous period in the better direction", () => {
    const s = summariseIndicator(ind({ direction: "lower_is_better" }), [res("a", "2026-07-01", 4), res("b", "2026-08-01", 3)]);
    expect(s.change).toBe(-1);
    expect(s.improving).toBe(true);
  });
  it("templates never ship a target", () => {
    expect(INDICATOR_TEMPLATES).toHaveLength(7);
    for (const t of INDICATOR_TEMPLATES) expect("targetValue" in t).toBe(false);
  });
  it("formats values with their unit", () => {
    expect(formatIndicatorValue({ measureType: "percentage", unit: "", rateMultiplier: null }, 92.456)).toBe("92.46%");
    expect(formatIndicatorValue({ measureType: "rate", unit: "per 1,000 patient-days", rateMultiplier: 1000 }, 2)).toBe("2 per 1,000 patient-days");
    expect(formatIndicatorValue({ measureType: "count", unit: "", rateMultiplier: null }, null)).toBe("—");
  });
});

/* ================================================================================================================ */
describe("committees", () => {
  it("follows Scheduled -> Held -> Minutes drafted -> Approved -> Actions followed up", () => {
    expect(allowedMeetingTransitions("scheduled")).toEqual(["held", "cancelled"]);
    expect(allowedMeetingTransitions("approved")).toEqual(["actions_followed_up"]);
    expect(allowedMeetingTransitions("actions_followed_up")).toEqual([]);
  });
  it("explains why a transition is refused", () => {
    expect(transitionProblem({ status: "held", minutes: "  " }, "minutes_drafted", 0)).toMatch(/Write the minutes/);
    expect(transitionProblem({ status: "approved", minutes: "x" }, "actions_followed_up", 2)).toMatch(/2 actions are still open/);
    expect(transitionProblem({ status: "scheduled", minutes: "" }, "approved", 0)).toMatch(/cannot move/);
    expect(transitionProblem({ status: "approved", minutes: "x" }, "actions_followed_up", 0)).toBeNull();
  });
  it("summarises attendance against the membership", () => {
    const members = [{ id: "m1", committeeId: "c", userId: "u1", memberRole: "chair" as const }, { id: "m2", committeeId: "c", userId: "u2", memberRole: "member" as const }, { id: "m3", committeeId: "c", userId: "u3", memberRole: "member" as const }];
    const s = attendanceSummary(members, [{ id: "a", meetingId: "x", userId: "u1", status: "present" }, { id: "b", meetingId: "x", userId: "u2", status: "apologies" }]);
    expect(s).toMatchObject({ members: 3, present: 1, apologies: 1, unrecorded: 1, pct: 33 });
  });
});

/* ================================================================================================================ */
describe("incidents, risk and regulatory reporting", () => {
  const incident = (over: Partial<IncidentRow> = {}): IncidentRow => ({
    id: "i1", reference: "INC-2026-0001", title: "x", category: "Medication", description: "", sbar: {}, occurredAt: "2026-10-20T08:00:00Z",
    department: "", location: "", patientMrn: null, severity: "high", likelihood: 3, impact: 4, riskScore: 12, isSentinel: true,
    status: "reported", rootCause: "", closureNote: "", reportedBy: null, createdAt: "2026-10-20T08:00:00Z", closedAt: null, ...over,
  });
  const rule = (over: Partial<RegulatoryRuleRow> = {}): RegulatoryRuleRow => ({
    id: "r1", program: "CBAHI", editionId: null, name: "Sentinel notification", description: "", appliesToSentinel: true, minSeverity: null,
    categories: [], reportWithinHours: 24, remindBeforeHours: 6, recipient: "", sourceNote: "", isActive: true, ...over,
  });

  it("preserves the existing risk scoring and bands", () => {
    expect([1, 4, 5, 9, 10, 14, 15, 25].map(riskBand)).toEqual(["low", "low", "moderate", "moderate", "high", "high", "extreme", "extreme"]);
    expect(riskBandWith(12, DEFAULT_RISK_THRESHOLDS)).toBe(riskBand(12));
  });
  it("follows the hospital's configured methodology when thresholds change", () => {
    const strict = { moderateMin: 3, highMin: 6, extremeMin: 12 };
    expect(riskBandWith(12, strict)).toBe("extreme");
    expect(summariseSafety([incident({ riskScore: 8 })], [], TODAY, strict).highRiskOpen).toBe(1);
    expect(summariseSafety([incident({ riskScore: 8 })], [], TODAY).highRiskOpen).toBe(0);
  });
  it("applies a rule only when its conditions match, and never with no conditions", () => {
    expect(ruleApplies(rule(), incident())).toBe(true);
    expect(ruleApplies(rule(), incident({ isSentinel: false }))).toBe(false);
    expect(ruleApplies(rule({ appliesToSentinel: false, minSeverity: "critical" }), incident({ isSentinel: false }))).toBe(false);
    expect(ruleApplies(rule({ appliesToSentinel: false, categories: ["medication"] }), incident({ isSentinel: false }))).toBe(true);
    expect(ruleApplies(rule({ appliesToSentinel: false }), incident())).toBe(false);
  });
  it("derives due, reminder and overdue states from the configured hours", () => {
    const base = incident();
    expect(notificationViews(base, [rule()], [], new Date("2026-10-20T10:00:00Z"))[0].state).toBe("pending");
    expect(notificationViews(base, [rule()], [], new Date("2026-10-21T03:00:00Z"))[0].state).toBe("due_soon");
    expect(notificationViews(base, [rule()], [], new Date("2026-10-21T09:00:00Z"))[0].state).toBe("overdue");
    const done = notificationViews(base, [rule()], [{ id: "n", incidentId: "i1", ruleId: "r1", reportedAt: "2026-10-21T10:00:00Z", externalReference: "", note: "" }], TODAY)[0];
    expect(done.state).toBe("reported");
    expect(done.reportedLate).toBe(true);
  });
});

/* ================================================================================================================ */
describe("clinical audits and PDSA", () => {
  const criteria = criteriaFromLines("Consent documented\n\nAllergy status recorded\nSite marked");
  const obs = (id: string, results: Record<string, "met" | "not_met" | "na">): ObservationRow => ({ id, auditId: "a", caseRef: id, results, note: "", observedOn: "2026-10-01", recordedBy: null });

  it("turns lines into criteria with stable ids", () => {
    expect(criteria.map((c) => c.id)).toEqual(["c1", "c2", "c3"]);
  });
  it("calculates case-level and criterion-level compliance", () => {
    const r = auditCompliance(criteria, [
      obs("1", { c1: "met", c2: "met", c3: "met" }),
      obs("2", { c1: "met", c2: "not_met", c3: "na" }),
      obs("3", { c1: "met", c2: "met", c3: "na" }),
      obs("4", { c1: "na", c2: "na", c3: "na" }),
    ]);
    expect(r.denominator).toBe(3);
    expect(r.numerator).toBe(2);
    expect(r.pct).toBe(66.7);
    expect(r.byCriterion[1]).toMatchObject({ met: 2, notMet: 1, pct: 66.7 });
    expect(r.byCriterion[2].pct).toBe(100);
  });
  it("has no compliance figure before any applicable case is observed", () => {
    expect(auditCompliance(criteria, []).pct).toBeNull();
  });
  it("blocks PDSA stages until the earlier stage is recorded", () => {
    const cycle: QipCycleRow = {
      id: "c", qipId: "q", cycleNo: 1, status: "plan", planAim: "", prediction: "", intervention: "", measurementPlan: "", doNotes: "",
      doObservations: "", studyResults: "", studyComparison: "", lessonsLearned: "", actDecision: null, actNotes: "", startedOn: "2026-10-01", closedAt: null,
    };
    expect(cycleGap(cycle, "do")).toMatch(/aim and the intervention/);
    expect(cycleGap({ ...cycle, planAim: "a", intervention: "b" }, "do")).toBeNull();
    expect(cycleGap({ ...cycle, status: "study" }, "act")).toMatch(/results/);
    expect(cycleGap({ ...cycle, status: "act" }, "closed")).toMatch(/adopt/);
    expect(cycleGap({ ...cycle, status: "plan" }, "study")).toMatch(/cannot move/);
  });
});

/* ================================================================================================================ */
describe("guideline governance", () => {
  const g = (over: Partial<GovernedGuideline> = {}): GovernedGuideline => ({
    id: "g1", title: "Sepsis protocol", sourceType: "local_protocol", isLocal: true, ownerUserId: "u1", currentVersionId: "v2",
    currentVersion: "2.0", currentVersionStatus: "published", lastReviewed: "2026-01-01", reviewDate: "2026-11-01", ...over,
  });
  const review = { id: "r", guidelineId: "g1", governedVersionId: "v2", status: "approved" as const, ownerUserId: null, nextReviewDue: null, decisionNote: "", approvedBy: "u2", approvedAt: "2026-09-01", updatedAt: "2026-09-01" };

  it("keeps the approved version and flags when a newer clinical version appears", () => {
    expect(governanceView(g(), review, TODAY).approvalOutdated).toBe(false);
    const view = governanceView(g({ currentVersionId: "v3", currentVersion: "3.0" }), review, TODAY);
    expect(view.approvalOutdated).toBe(true);
    expect(view.review?.governedVersionId).toBe("v2");
    expect(summariseGuidelines([view]).outdatedApproval).toBe(1);
  });
  it("identifies overdue reviews from the governance date or the version's own review date", () => {
    expect(governanceView(g({ reviewDate: "2026-10-01" }), null, TODAY).timing).toBe("overdue");
    expect(governanceView(g({ reviewDate: "2026-10-01" }), { ...review, nextReviewDue: "2027-06-01" }, TODAY).timing).toBe("ok");
    expect(governanceView(g(), null, TODAY).status).toBe("not_reviewed");
  });
  it("reads links from either end without copying anything", () => {
    const links: LinkRow[] = [
      { id: "l1", sourceType: "guideline", sourceId: "g1", targetType: "element", targetId: "e1", targetVersionId: null, note: "", createdAt: "" },
      { id: "l2", sourceType: "indicator", sourceId: "k1", targetType: "guideline", targetId: "g1", targetVersionId: "v2", note: "", createdAt: "" },
    ];
    expect(linksOf(links, "guideline", "g1").map((x) => `${x.type}:${x.id}`)).toEqual(["element:e1", "indicator:k1"]);
    expect(linksOf(links, "indicator", "k1")[0].versionId).toBe("v2");
  });
});
