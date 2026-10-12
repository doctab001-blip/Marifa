import { describe, expect, it } from "vitest";
import heartFailure from "../data/emergency-versions/heart-failure.emergency-2026-10-12-v1.json";
import { auditTopicContent } from "@/lib/clinical-authoring-audit";
import { CLINICAL_DIRECTORY_MINIMUM_SCORE, isClinicalDirectoryEligible } from "@/lib/data/clinical-directory-eligibility";

describe("clinical directory release boundary", () => {
  it("uses the 80% authoring threshold", () => {
    expect(CLINICAL_DIRECTORY_MINIMUM_SCORE).toBe(80);
  });

  it("makes a topic live automatically when its content passes the threshold", () => {
    expect(auditTopicContent(heartFailure).score).toBeGreaterThanOrEqual(80);
    expect(isClinicalDirectoryEligible(heartFailure)).toBe(true);
  });

  it("withholds a topic whose content falls below the threshold", () => {
    const weakened = structuredClone(heartFailure) as Record<string, unknown> & { presentation: Record<string, unknown>; teaching: Record<string, unknown> };
    delete weakened.diagnosticCriteria;
    delete weakened.medicationPlan;
    delete weakened.presentation.precipitants;
    delete weakened.teaching.keyPoints;
    delete weakened.teaching.pitfalls;
    expect(auditTopicContent(weakened).score).toBeLessThan(80);
    expect(isClinicalDirectoryEligible(weakened)).toBe(false);
  });

  it("withholds content that fails the schema", () => {
    expect(isClinicalDirectoryEligible({ id: "x" })).toBe(false);
  });
});
