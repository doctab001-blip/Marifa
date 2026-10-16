import { describe, expect, it } from "vitest";
import { diseases } from "@/lib/demo-data";
import { validatePathway } from "@/lib/pathway-validation";

describe("pathway publication validation", () => {
  it("accepts the seeded structured pathways", () => {
    for (const disease of diseases) expect(validatePathway(disease.pathway)).toEqual({ valid: true, errors: [] });
  });

  it("detects invalid transitions and unreachable nodes", () => {
    const pathway = structuredClone(diseases[0].pathway);
    pathway.transitions.push({ from: "missing", to: "start" });
    pathway.nodes.push({ id: "orphan", type: "action", title: "Orphan", detail: "Unreachable", referenceIds: ["src"] });
    const result = validatePathway(pathway);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid transition missing -> start");
    expect(result.errors).toContain("Unreachable node orphan");
  });

  it("detects cycles before publication", () => {
    const pathway = structuredClone(diseases[1].pathway);
    pathway.transitions.push({ from: "end", to: "start" });
    expect(validatePathway(pathway).errors.some((error) => error.includes("Cycle detected"))).toBe(true);
  });
});
