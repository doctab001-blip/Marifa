import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeachingGuide } from "@/components/teaching-guide";
import { buildTeachingView } from "@/lib/teaching";
import { DiseaseDetailSchema, type DiseaseDetail } from "@/lib/validations/disease";

const base: DiseaseDetail = {
  id: "8b0b6f2a-6a3a-4d7b-9c55-1f3b6a0c9d11",
  title: "Example Condition",
  specialty: "Internal Medicine",
  authority: "Other",
  status: "under_review",
  version: "teaching-test",
  lastReviewed: "2026-10-11",
  pillar: "Urgent Care",
  clinicalReviewStatus: "pending",
  pathophysiology: { summary: "Mechanism A causes finding B. Further detail.", keyMechanisms: ["Mechanism A"] },
  presentation: { symptoms: ["Symptom"], physicalSigns: ["Sign"], redFlags: ["Hypotension", "Confusion"] },
  differentials: [{ condition: "Alternative X", distinguishingFeatures: "Feature that separates X." }],
  investigations: {
    ruleIn: [{ tier: "laboratory", testName: "Test", modalityTarget: "Target", targetCondition: "Example", expectedFinding: "Finding", clinicalRationale: "Reason" }],
    ruleOut: [{ tier: "laboratory", testName: "Test 2", modalityTarget: "Target", targetCondition: "Alt", expectedFinding: "Finding", clinicalRationale: "Reason" }],
  },
  clinicalManagement: [{ id: "stabilise", title: "Stabilise the patient", timeframe: "Immediately", actions: ["Do it"] }],
  nonClinicalManagement: { patientEducation: ["E"], lifestyleAndDiet: ["L"], mdtReferrals: ["M"], dischargeCriteria: ["D"], followUpPlan: "F" },
};

describe("teaching guide", () => {
  it("derives guidance only from existing clinical content when none is authored", () => {
    const view = buildTeachingView(base);
    expect(view.objectivesAuthored).toBe(false);
    expect(view.approach).toHaveLength(6);
    expect(view.approach[0].prompt).toBe("Mechanism A causes finding B.");
    expect(view.approach[4].prompt).toBe("First step: Stabilise the patient.");
    expect(view.checkpoints[0].answer).toBe("Hypotension; Confusion.");
    expect(view.checkpoints[1].answer).toBe("Feature that separates X.");
    render(<TeachingGuide view={view} />);
    expect(screen.getByRole("heading", { name: /What you will learn/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /How to approach it/ })).toBeInTheDocument();
    expect(screen.getByText(/How would you tell example condition apart from alternative x/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sample answer|What you would say|examiner/i)).toBeNull();
  });

  it("prefers authored teaching content and labels vignettes as fictitious", () => {
    const authored = DiseaseDetailSchema.parse({
      ...base,
      teaching: {
        learningObjectives: ["Objective one"],
        vignette: { text: "A fictitious patient.", fictitious: true },
        checkpoints: [{ question: "Q?", answer: "A." }],
        pitfalls: ["Pitfall"],
        keyPoints: ["Point"],
      },
    });
    const view = buildTeachingView(authored);
    render(<TeachingGuide view={view} />);
    expect(screen.getByText("Objective one")).toBeInTheDocument();
    expect(screen.getByText("Fictitious teaching case")).toBeInTheDocument();
    expect(screen.getByText("Pitfall")).toBeInTheDocument();
    expect(view.approachAuthored).toBe(false);
  });

  it("rejects a vignette that is not explicitly fictitious", () => {
    const result = DiseaseDetailSchema.safeParse({ ...base, teaching: { learningObjectives: ["O"], vignette: { text: "Real patient", fictitious: false } } });
    expect(result.success).toBe(false);
  });
});
