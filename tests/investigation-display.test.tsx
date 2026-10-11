import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InvestigationCards } from "@/components/investigation-cards";
import { investigationDisplayTier, investigationNeedsReview, type Investigation } from "@/lib/investigation-display";
import { DiseaseSeedBatchSchema, InvestigationSchema } from "@/lib/validations/disease";
import originalSeeds from "@/data/seeds/batch_04_textbook_sourced_drafts.json";
import proposals from "@/data/reviews/investigation-proposals.json";

const test: Investigation = {
  tier: "laboratory", testName: "Repeated clinic blood-pressure measurement",
  targetCondition: "Persistent elevated blood pressure",
  modalityTarget: "Repeated clinic blood-pressure measurement — Persistent elevated blood pressure",
  expectedFinding: "Repeated elevated readings with correct technique",
  clinicalRationale: "Avoid misclassification from an isolated reading.",
};

describe("Global investigation display", () => {
  it("pairs the named assessment with the question, rationale and interpretation without repeating its name", () => {
    const before = structuredClone(test);
    render(<InvestigationCards investigations={{ ruleIn: [test], ruleOut: [{ ...test, testName: "Home monitoring", targetCondition: "White-coat effect" }] }} />);
    expect(screen.getByRole("heading", { name: /Bedside assessment/ })).toBeInTheDocument();
    const card = screen.getByRole("heading", { name: test.testName }).closest("li")!;
    expect(within(card).getByText("What are we looking for?")).toBeInTheDocument();
    expect(within(card).getByText(test.targetCondition)).toBeInTheDocument();
    expect(within(card).getByText("Why are we doing it?")).toBeInTheDocument();
    expect(within(card).getByText(test.clinicalRationale)).toBeInTheDocument();
    expect(within(card).getByText(test.expectedFinding)).toBeInTheDocument();
    expect(within(card).queryByText(test.modalityTarget)).not.toBeInTheDocument();
    expect(screen.queryByText(/Rule out complications/)).not.toBeInTheDocument();
    expect(test).toEqual(before);
    expect(investigationDisplayTier(test)).toBe("bedside");
    expect(test.tier).toBe("laboratory");
  });

  it("flags generic clinical content and preserves useful method details", () => {
    const generic = { ...test, modalityTarget: "Measure after rest with the appropriate cuff.", expectedFinding: "A result that supports the working diagnosis or defines its severity." };
    expect(investigationNeedsReview(generic)).toBe(true);
    render(<InvestigationCards investigations={{ ruleIn: [generic], ruleOut: [] }} />);
    expect(screen.getByText("Investigation detail needs clinical review.")).toBeInTheDocument();
    expect(screen.getByText(generic.modalityTarget)).toBeInTheDocument();
    expect(screen.getByText(generic.expectedFinding)).toBeInTheDocument();
  });

  it("supports old textbook records and new per-test citations without unsafe reference URLs", () => {
    expect(DiseaseSeedBatchSchema.safeParse(originalSeeds).success).toBe(true);
    expect(InvestigationSchema.safeParse({ ...test, references: [{ title: "Reference", edition: "2026", url: "javascript:alert(1)" }] }).success).toBe(false);
    render(<InvestigationCards investigations={{ ruleIn: [{ ...test, references: [{ title: "Saudi MOH reference", edition: "Manual", url: "https://www.moh.gov.sa/" }] }], ruleOut: [] }} source={{ title: "Saved source", url: "https://example.com/source" }} />);
    expect(screen.getByRole("link", { name: "Saudi MOH reference (Manual)" })).toHaveAttribute("href", "https://www.moh.gov.sa/");
    expect(screen.getByRole("link", { name: "Saved source" })).toHaveAttribute("href", "https://example.com/source");
  });

  it("covers all 60 generic textbook scenarios and the requested hypertension example with specific proposals", () => {
    expect(Object.keys(proposals)).toHaveLength(61);
    for (const entries of Object.values(proposals)) {
      expect(entries.some((entry) => entry[5] === "ruleIn")).toBe(true);
      expect(entries.some((entry) => entry[5] === "ruleOut")).toBe(true);
      for (const [testName, tier, targetCondition, expectedFinding, clinicalRationale] of entries) {
        const parsed = InvestigationSchema.parse({ testName, tier, targetCondition, expectedFinding, clinicalRationale, modalityTarget: `${testName} — ${targetCondition}` });
        expect(investigationNeedsReview(parsed)).toBe(false);
      }
    }
  });
});
