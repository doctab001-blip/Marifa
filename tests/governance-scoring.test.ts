import { describe, expect, it } from "vitest";
import {
  accreditationMilestones, addMonths, computeReadiness, daysBetween, evidenceHealth, riskBand, summarisePolicies, summariseSafety,
} from "@/lib/governance/scoring";
import { DEFAULT_SETTINGS, type EvidenceRow, type Rating, type StandardRow, type StandardStatusRow } from "@/lib/governance/types";

const TODAY = new Date("2026-10-20T09:00:00Z");

const std = (n: number, over: Partial<StandardRow> = {}): StandardRow => ({
  id: `s${n}`, edition: "T", chapterCode: n <= 5 ? "AA" : "BB", chapterName: "", code: `T.${n}`, description: `Standard ${n}`,
  isEsr: false, department: "", ownerUserId: null, reviewIntervalMonths: 12, ...over,
});
const status = (n: number, rating: Rating | null, over: Partial<StandardStatusRow> = {}): StandardStatusRow => ({
  standardId: `s${n}`, rating, method: rating ? "self_assessment" : null, notes: "", assessedAt: rating ? "2026-10-01T00:00:00Z" : null, nextReviewDue: null, ...over,
});
const ev = (n: number, over: Partial<EvidenceRow> = {}): EvidenceRow => ({
  id: `e${n}-${Math.random()}`, standardId: `s${n}`, title: "Doc", evidenceType: "other", storagePath: "p", fileName: "f.pdf", sizeBytes: 1,
  validFrom: null, validUntil: null, uploadedAt: "2026-01-01T00:00:00Z", uploadedBy: null, withdrawnAt: null, withdrawnReason: null, ...over,
});
/** Ten standards, all with current evidence, so ratings map straight to points. */
const ten = (over: (n: number) => Partial<StandardRow> = () => ({})) => Array.from({ length: 10 }, (_, i) => std(i + 1, over(i + 1)));
const evidenceForAll = () => Array.from({ length: 10 }, (_, i) => ev(i + 1));
const ratings = (list: (Rating | null)[]) => list.map((rating, i) => status(i + 1, rating));

describe("evidenceHealth", () => {
  it("is none without active evidence, and withdrawn evidence never counts", () => {
    expect(evidenceHealth([], TODAY)).toBe("none");
    expect(evidenceHealth([{ validUntil: null, withdrawnAt: "2026-01-01" }], TODAY)).toBe("none");
  });
  it("treats no expiry date as valid", () => expect(evidenceHealth([{ validUntil: null, withdrawnAt: null }], TODAY)).toBe("valid"));
  it("flags expired and expiring within 60 days using the LATEST expiry", () => {
    expect(evidenceHealth([{ validUntil: "2026-10-19", withdrawnAt: null }], TODAY)).toBe("expired");
    expect(evidenceHealth([{ validUntil: "2026-10-20", withdrawnAt: null }], TODAY)).toBe("expiring");
    expect(evidenceHealth([{ validUntil: "2026-12-19", withdrawnAt: null }], TODAY)).toBe("expiring");
    expect(evidenceHealth([{ validUntil: "2026-12-20", withdrawnAt: null }], TODAY)).toBe("valid");
    expect(evidenceHealth([{ validUntil: "2026-10-01", withdrawnAt: null }, { validUntil: "2027-06-01", withdrawnAt: null }], TODAY)).toBe("valid");
  });
});

describe("computeReadiness", () => {
  const run = (list: (Rating | null)[], standards = ten(), evidence = evidenceForAll(), settings = DEFAULT_SETTINGS) =>
    computeReadiness(standards, ratings(list), evidence, settings, TODAY);

  it("shows nothing and no outcome for an empty register", () => {
    const r = computeReadiness([], [], [], DEFAULT_SETTINGS, TODAY);
    expect(r.overallPct).toBeNull();
    expect(r.outcome).toBeNull();
    expect(r.outcomeNote).toMatch(/import/i);
  });

  it("withholds the outcome until every applicable standard is assessed", () => {
    const r = run(["satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", null]);
    expect(r.overallPct).toBe(100);
    expect(r.worstCasePct).toBe(90);
    expect(r.coveragePct).toBe(90);
    expect(r.outcome).toBeNull();
    expect(r.outcomeNote).toMatch(/1 of 10/);
  });

  it("scores the mean of applicable standards out of the maximum of 2", () => {
    const r = run(["satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "partial", "insufficient"]);
    expect(r.overallPct).toBe(85); // (16 + 1 + 0) / 20
    expect(r.satisfactory).toBe(8);
    expect(r.partial).toBe(1);
    expect(r.insufficient).toBe(1);
  });

  it("excludes not-applicable standards from the maths", () => {
    const r = run(["satisfactory", "satisfactory", "not_applicable", "not_applicable", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory"]);
    expect(r.notApplicable).toBe(2);
    expect(r.applicable).toBe(8);
    expect(r.overallPct).toBe(100);
  });

  it("indicates accreditation only at >= 85% with every ESR satisfactory", () => {
    const all = Array<Rating>(10).fill("satisfactory");
    expect(run(all).outcome).toBe("accreditation");
    const eightFive = run(["satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "partial", "insufficient"]);
    expect(eightFive.outcome).toBe("accreditation");
    const eightyFour = run(["satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "partial", "partial", "partial"]);
    expect(eightyFour.overallPct).toBe(85); // 14+3 = 17/20
    const lower = run(["satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "partial", "partial", "partial", "partial"]);
    expect(lower.overallPct).toBe(80);
    expect(lower.outcome).toBe("conditional");
  });

  it("one unmet ESR blocks full accreditation even at a high overall score", () => {
    const standards = ten((n) => ({ isEsr: n <= 4 }));
    const r = run(["partial", ...Array<Rating>(9).fill("satisfactory")], standards);
    expect(r.overallPct).toBe(95);
    expect(r.esrNotSatisfactory).toBe(1);
    expect(r.outcome).toBe("conditional");
    expect(r.outcomeNote).toMatch(/ESR/);
  });

  it("flags denial risk below 75% overall or when more than 25% of ESRs are not satisfactory", () => {
    const low = run(["satisfactory", "satisfactory", "satisfactory", "satisfactory", "partial", "partial", "partial", "partial", "partial", "partial"]);
    expect(low.overallPct).toBe(70);
    expect(low.outcome).toBe("denial_risk");
    const standards = ten((n) => ({ isEsr: n <= 4 }));
    const esr = run(["partial", "partial", ...Array<Rating>(8).fill("satisfactory")], standards);
    expect(esr.esrNotSatisfactoryPct).toBe(50);
    expect(esr.outcome).toBe("denial_risk");
    // exactly 25% is within the limit
    const four = run(["partial", ...Array<Rating>(9).fill("satisfactory")], standards);
    expect(four.esrNotSatisfactoryPct).toBe(25);
    expect(four.outcome).toBe("conditional");
  });

  it("counts an unassessed ESR as not satisfactory", () => {
    const standards = ten((n) => ({ isEsr: n === 1 }));
    const r = run([null, ...Array<Rating>(9).fill("satisfactory")], standards);
    expect(r.esrNotSatisfactory).toBe(1);
    expect(r.outcome).toBeNull();
  });

  it("downgrades satisfactory ratings whose evidence has expired or gone, and reports it", () => {
    const evidence = evidenceForAll().filter((e) => e.standardId !== "s1");
    evidence.push(ev(2, { validUntil: "2026-09-01" }));
    const r = run(Array<Rating>(10).fill("satisfactory"), ten(), evidence.filter((e) => e.standardId !== "s2" || e.validUntil));
    // s1: no evidence, s2: only expired evidence -> both treated as partial in the headline
    expect(r.satisfactoryWithoutCurrentEvidence).toBe(2);
    expect(r.recordedPct).toBe(100);
    expect(r.overallPct).toBe(90);
    expect(r.evidenceCompletenessPct).not.toBeNull();
    expect(r.evidenceCompletenessPct).toBeLessThan(100); // kept separate from the score itself
    expect(r.methodVersion).toContain("readiness-v1");
  });

  it("an ESR with expired evidence is not satisfactory", () => {
    const standards = ten((n) => ({ isEsr: n <= 4 }));
    const evidence = evidenceForAll().map((e) => (e.standardId === "s1" ? { ...e, validUntil: "2026-01-01" } : e));
    const r = run(Array<Rating>(10).fill("satisfactory"), standards, evidence);
    expect(r.esrNotSatisfactory).toBe(1);
    expect(r.outcome).toBe("conditional");
  });

  it("counts expiring evidence and overdue reviews without changing the score", () => {
    const evidence = evidenceForAll().map((e) => (e.standardId === "s3" ? { ...e, validUntil: "2026-11-15" } : e));
    const list = ratings(Array<Rating>(10).fill("satisfactory"));
    list[4] = status(5, "satisfactory", { nextReviewDue: "2026-09-30" });
    const r = computeReadiness(ten(), list, evidence, DEFAULT_SETTINGS, TODAY);
    expect(r.expiringEvidence).toBe(1);
    expect(r.reviewOverdue).toBe(1);
    expect(r.overallPct).toBe(100);
  });

  it("honours custom thresholds from settings", () => {
    const strict = { ...DEFAULT_SETTINGS, accreditedMinOverall: 95, conditionalMinOverall: 90 };
    const r = run(["satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "partial", "partial"], ten(), evidenceForAll(), strict);
    expect(r.overallPct).toBe(90);
    expect(r.outcome).toBe("conditional");
  });

  it("scores each chapter separately", () => {
    const r = run(["satisfactory", "satisfactory", "satisfactory", "satisfactory", "satisfactory", "partial", "partial", "partial", "partial", "partial"]);
    expect(r.chapters.map((c) => [c.key, c.total, c.pct])).toEqual([["AA", 5, 100], ["BB", 5, 50]]);
  });
});

describe("summarisePolicies", () => {
  const policy = (id: string, status: "approved" | "draft", nextReviewDue: string | null = null) => ({
    id, title: id, documentNumber: id, version: "1", status, department: "", ownerUserId: null, effectiveDate: null, nextReviewDue,
    storagePath: null, fileName: null, clinicalGuidelineId: null, approvedAt: null, createdAt: "2026-01-01",
  });
  it("computes acknowledgement rate over approved policies only, with no rate for unassigned ones", () => {
    const out = summarisePolicies(
      [policy("a", "approved", "2026-10-01"), policy("b", "approved", "2026-12-01"), policy("c", "approved", "2028-01-01"), policy("d", "draft")],
      [{ policyId: "a", assigned: 2, acknowledged: 1, overdue: 1 }, { policyId: "b", assigned: 1, acknowledged: 0, overdue: 0 }, { policyId: "d", assigned: 1, acknowledged: 0, overdue: 0 }],
      TODAY,
    );
    expect(out.assigned).toBe(3);
    expect(out.acknowledged).toBe(1);
    expect(out.ackPct).toBeCloseTo(33.3, 1);
    expect(out.items.find((i) => i.policy.id === "c")?.ackPct).toBeNull();
    expect(out.overdueAssignments).toBe(1);
    expect(out.reviewOverdue).toBe(1);
    expect(out.reviewDueSoon).toBe(1);
    expect(out.drafts).toBe(1);
  });
  it("has no rate when nothing is assigned", () => expect(summarisePolicies([policy("a", "approved")], [], TODAY).ackPct).toBeNull());
});

describe("risk and safety", () => {
  it("bands the 5x5 matrix", () => {
    expect([1, 4, 5, 9, 10, 14, 15, 25].map(riskBand)).toEqual(["low", "low", "moderate", "moderate", "high", "high", "extreme", "extreme"]);
  });
  it("summarises open incidents, sentinel events and CAPA", () => {
    const incident = (over: object) => ({ id: "i", reference: "r", title: "", category: "", description: "", sbar: {}, occurredAt: "", department: "", location: "", patientMrn: null, severity: "low", likelihood: 1, impact: 1, riskScore: 1, isSentinel: false, status: "reported", rootCause: "", closureNote: "", reportedBy: null, createdAt: "", closedAt: null, ...over }) as never;
    const capa = (status: string, dueDate: string) => ({ id: "c", incidentId: "i", auditId: null, action: "", kind: "corrective", ownerUserId: "u", dueDate, status, doneAt: null, verifiedBy: null, verifiedAt: null, verificationNote: "" }) as never;
    const out = summariseSafety(
      [incident({ isSentinel: true, riskScore: 20 }), incident({ status: "closed", isSentinel: true }), incident({ riskScore: 4 })],
      [capa("open", "2026-10-01"), capa("in_progress", "2026-12-01"), capa("done", "2026-10-01"), capa("verified", "2026-10-01")],
      TODAY,
    );
    expect(out).toMatchObject({ openIncidents: 2, openSentinel: 1, highRiskOpen: 1, capaOpen: 2, capaOverdue: 1, capaAwaitingVerification: 1, sentinelMissingRca: 1 });
  });
});

describe("dates and milestones", () => {
  it("adds months without overflowing short months", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2026-10-20", 18)).toBe("2028-04-20");
  });
  it("counts days between ISO dates", () => expect(daysBetween("2026-10-20", "2026-11-19")).toBe(30));
  it("derives expiry, mid-term self-assessment and the 12-week re-accreditation update", () => {
    const m = accreditationMilestones({ ...DEFAULT_SETTINGS, accreditationAwardedOn: "2025-03-01" }, TODAY);
    expect(m?.expiresOn).toBe("2028-03-01");
    expect(m?.midTermSelfAssessmentDue).toBe("2026-09-01");
    expect(m?.reaccreditationUpdateDue).toBe("2027-12-08");
    expect(accreditationMilestones(DEFAULT_SETTINGS, TODAY)).toBeNull();
  });
});
