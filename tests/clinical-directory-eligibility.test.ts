import { describe, expect, it } from "vitest";
import {
  CLINICAL_DIRECTORY_DRAFT_TOPIC_COUNT,
  CLINICAL_DIRECTORY_MINIMUM_SCORE,
  clinicalDirectoryEligibility,
  isClinicalDirectoryEligible,
} from "@/lib/data/clinical-directory-eligibility";

describe("clinical directory release boundary", () => {
  it("contains only the 27 topics that passed the 80% authoring threshold", () => {
    const records = Object.entries(clinicalDirectoryEligibility);
    expect(records).toHaveLength(27);
    expect(records.every(([, record]) => record.score >= CLINICAL_DIRECTORY_MINIMUM_SCORE)).toBe(true);
  });

  it("tracks the complete below-threshold correction queue", () => {
    expect(CLINICAL_DIRECTORY_DRAFT_TOPIC_COUNT).toBe(54);
  });

  it("requires both an eligible topic and its audited live version", () => {
    expect(isClinicalDirectoryEligible("625f0d83-3863-47f9-a64e-55c0355f3240", "emergency-2026-10-12-v1-live")).toBe(true);
    expect(isClinicalDirectoryEligible("625f0d83-3863-47f9-a64e-55c0355f3240", "older-version")).toBe(false);
    expect(isClinicalDirectoryEligible("c36e9014-7d53-4a82-b641-8e05a3c9d627")).toBe(false);
  });
});
