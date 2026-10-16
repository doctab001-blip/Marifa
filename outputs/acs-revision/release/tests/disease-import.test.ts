import { describe, expect, it } from "vitest";
import { newDiseaseRecords } from "@/lib/disease-import";

describe("additive disease imports", () => {
  it("preserves all 71 existing scenarios when their seed content has changed", () => {
    const existing = Array.from({ length: 71 }, (_, index) => ({ id: `scenario-${index}` }));
    const incoming = existing.map(({ id }) => ({ disease: { id, summary: "Changed seed text" } }));
    const addition = { disease: { id: "new-scenario", summary: "New draft" } };
    expect(newDiseaseRecords([...incoming, addition], existing, [])).toEqual([addition]);
  });

  it("preserves version history even if guideline metadata is absent from a partial read", () => {
    expect(newDiseaseRecords([{ disease: { id: "existing" } }], [], [{ guideline_id: "existing" }])).toEqual([]);
  });
});
