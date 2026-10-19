import { describe, expect, it } from "vitest";
import { ED_PROTOCOL_OUTLINES } from "@/data/local-protocols/ed-protocols";
import { buildProtocolShell, PROTOCOL_OUTLINE_VERSION } from "@/lib/local-protocol-shell";
import { isLocalProtocolSourceType, LOCAL_PROTOCOL_SOURCE_TYPE } from "@/lib/local-protocols";
import { DiseaseDetailSchema } from "@/lib/validations/disease";
import { summarizeSpecialty } from "@/lib/medical-specialities";

const ID = "6f1c2a52-3b0e-4c53-9a53-0d6f3c3a1b11";

describe("Local Protocols: ED outline list", () => {
  it("lists at least 30 protocols with unique titles", () => {
    expect(ED_PROTOCOL_OUTLINES.length).toBeGreaterThanOrEqual(30);
    expect(new Set(ED_PROTOCOL_OUTLINES.map((outline) => outline.title)).size).toBe(ED_PROTOCOL_OUTLINES.length);
  });

  it("states no doses or numeric thresholds (outlines are scope only)", () => {
    const dose = /\b\d+(?:\.\d+)?\s?(?:mg|mcg|µg|g|ml|mL|units?|iu|mmol|mmHg|%|minutes?|hours?)\b/i;
    for (const outline of ED_PROTOCOL_OUTLINES) {
      expect(`${outline.scope} ${outline.sources}`, outline.title).not.toMatch(dose);
    }
  });

  it("builds schema-valid draft content with an empty medicine plan for every outline", () => {
    for (const outline of ED_PROTOCOL_OUTLINES) {
      const content = buildProtocolShell(outline, ID, "2026-10-19");
      const parsed = DiseaseDetailSchema.safeParse(content);
      expect(parsed.success, outline.title).toBe(true);
      expect(content.status).toBe("draft");
      expect(content.version).toBe(PROTOCOL_OUTLINE_VERSION);
      expect(content.medicationPlan?.regimens).toEqual([]);
      expect(content.clinicalReviewStatus).toBe("pending");
    }
  });

  it("gives every protocol a recognised primary speciality so the Speciality filter groups them", () => {
    for (const outline of ED_PROTOCOL_OUTLINES) {
      expect(summarizeSpecialty(outline.specialty).primary, outline.title).not.toBe("Unassigned");
    }
  });
});

describe("Local Protocols: storage marker", () => {
  it("is told apart from disease topics only by source_type", () => {
    expect(isLocalProtocolSourceType(LOCAL_PROTOCOL_SOURCE_TYPE)).toBe(true);
    expect(isLocalProtocolSourceType("curated-textbook-topic")).toBe(false);
    expect(isLocalProtocolSourceType(undefined)).toBe(false);
  });
});
