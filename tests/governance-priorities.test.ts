import { describe, expect, it } from "vitest";
import { buildPriorities } from "@/lib/governance/priorities";
import type { AuditOverview, PolicyOverview, Readiness, SafetyOverview } from "@/lib/governance/scoring";

const readiness = (over: Partial<Readiness> = {}): Readiness => ({
  totalStandards: 10, notApplicable: 0, applicable: 10, assessed: 10, unassessed: 0, coveragePct: 100, satisfactory: 10, partial: 0, insufficient: 0,
  satisfactoryWithoutCurrentEvidence: 0, expiringEvidence: 0, reviewOverdue: 0, methodVersion: "test", evidenceCompletenessPct: 100, overallPct: 100, recordedPct: 100, worstCasePct: 100,
  esrTotal: 2, esrSatisfactory: 2, esrNotSatisfactory: 0, esrNotSatisfactoryPct: 0, outcome: "accreditation", outcomeNote: "", chapters: [], ...over,
});
const policies = (over: Partial<PolicyOverview> = {}): PolicyOverview => ({ items: [], approved: 0, inReview: 0, drafts: 0, reviewOverdue: 0, reviewDueSoon: 0, assigned: 0, acknowledged: 0, ackPct: null, overdueAssignments: 0, ...over });
const safety = (over: Partial<SafetyOverview> = {}): SafetyOverview => ({ openIncidents: 0, openSentinel: 0, highRiskOpen: 0, capaOpen: 0, capaOverdue: 0, capaAwaitingVerification: 0, sentinelMissingRca: 0, ...over });
const audits = (over: Partial<AuditOverview> = {}): AuditOverview => ({ scheduledNext30: 0, overdue: 0, completed: 0, belowTarget: 0, activeQips: 0, ...over });
const run = (r = readiness(), p = policies(), s = safety(), a = audits(), m = null) => buildPriorities({ readiness: r, policies: p, safety: s, audits: a, milestones: m });

describe("buildPriorities", () => {
  it("with no standards, only asks for the import", () => {
    const out = run(readiness({ totalStandards: 0, applicable: 0, assessed: 0 }));
    expect(out.map((i) => i.id)).toEqual(["import"]);
  });
  it("returns nothing when everything is in order", () => expect(run()).toEqual([]));
  it("puts unmet ESRs and unsafe incident handling before housekeeping", () => {
    const out = run(readiness({ esrNotSatisfactory: 2, unassessed: 3, expiringEvidence: 1 }), policies({ reviewOverdue: 1 }), safety({ sentinelMissingRca: 1, capaOverdue: 2 }));
    expect(out.map((i) => i.id)).toEqual(["esr", "rca", "capa-overdue", "unassessed", "policy-review", "evidence-expiring"]);
    expect(out[0].tone).toBe("bad");
    expect(out.at(-1)?.tone).toBe("info");
  });
  it("uses correct singular and plural wording", () => {
    expect(run(readiness({ esrNotSatisfactory: 1 }))[0].title).toBe("1 essential safety requirement not satisfactory");
    expect(run(readiness({ esrNotSatisfactory: 3 }))[0].title).toBe("3 essential safety requirements not satisfactory");
    expect(run(readiness(), policies({ reviewOverdue: 2 }))[0].title).toBe("2 approved policies overdue for review");
  });
  it("warns about accreditation expiry within 180 days", () => {
    const m = { awardedOn: "2023-12-01", expiresOn: "2026-12-01", daysToExpiry: 42, midTermSelfAssessmentDue: "2025-06-01", reaccreditationUpdateDue: "2026-09-08" };
    expect(run(readiness(), policies(), safety(), audits(), m as never)[0].title).toBe("Accreditation expires in 42 days");
    expect(run(readiness(), policies(), safety(), audits(), { ...m, daysToExpiry: 400 } as never)).toEqual([]);
  });
  it("links every item to the module", () => {
    const out = run(readiness({ esrNotSatisfactory: 1, unassessed: 1, satisfactoryWithoutCurrentEvidence: 1 }), policies({ inReview: 1 }), safety({ capaAwaitingVerification: 1 }), audits({ overdue: 1, belowTarget: 1 }));
    expect(out.length).toBeGreaterThan(5);
    expect(out.every((i) => i.href.startsWith("/dashboard/accreditation-and-audits"))).toBe(true);
  });
});
