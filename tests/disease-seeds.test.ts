import saudiCore from "@/data/seeds/batch_01_saudi_core.json";
import niceAdapted from "@/data/seeds/batch_02_nhs_adapted.json";
import { describe, expect, it } from "vitest";
import { DiseaseSeedBatchSchema } from "@/lib/validations/disease";

describe("disease seed batches", () => {
  it("contains eight Saudi core records and two NICE adaptations", () => {
    const core = DiseaseSeedBatchSchema.parse(saudiCore);
    const fallback = DiseaseSeedBatchSchema.parse(niceAdapted);
    expect(core).toHaveLength(8);
    expect(fallback).toHaveLength(2);
    expect(new Set(core.map((item) => item.authority))).toEqual(new Set(["MOH", "SHC", "PHA"]));
    expect(fallback.every((item) => item.authority === "NICE" && item.title.endsWith("[Adapted from NICE]"))).toBe(true);
  });

  it("keeps seed content in draft governance state and rejects UK operational wording", () => {
    const all = [...DiseaseSeedBatchSchema.parse(saudiCore), ...DiseaseSeedBatchSchema.parse(niceAdapted)];
    expect(all.every((item) => item.status === "draft")).toBe(true);
    expect(JSON.stringify(niceAdapted).toLowerCase()).not.toContain("2-week wait");
    expect(JSON.stringify(niceAdapted)).not.toMatch(/\b(?:Eliquis|Xarelto|Pradaxa|Coumadin|Plendil)\b/);
    expect(JSON.stringify(niceAdapted)).toMatch(/dabigatran etexilate|rivaroxaban/);
  });

  it("has substantive clinical detail in every tier", () => {
    const all = [...DiseaseSeedBatchSchema.parse(saudiCore), ...DiseaseSeedBatchSchema.parse(niceAdapted)];
    for (const item of all) {
      expect(item.pathophysiology.keyMechanisms.length).toBeGreaterThanOrEqual(4);
      expect(item.presentation.redFlags.length).toBeGreaterThanOrEqual(4);
      expect(item.differentials.length).toBeGreaterThanOrEqual(4);
      expect(item.clinicalManagement.length).toBeGreaterThanOrEqual(5);
      expect(item.nonClinicalManagement.mdtReferrals.length).toBeGreaterThanOrEqual(3);
    }
  });
});
