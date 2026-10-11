import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GuidelinePathwayForm } from "@/components/admin/guideline-pathway-form";
import { DiseaseDetailSchema } from "@/lib/validations/disease";

const disease = DiseaseDetailSchema.parse({
  id: "11111111-1111-4111-8111-111111111111",
  title: "Test pathway",
  specialty: "Emergency Medicine",
  authority: "MOH",
  status: "draft",
  version: "1.0",
  lastReviewed: "2026-10-10",
  pillar: "Urgent Care",
  pathophysiology: { summary: "Original summary.", keyMechanisms: ["Mechanism"] },
  presentation: { symptoms: ["Original symptom"], physicalSigns: ["Sign"], redFlags: ["Red flag"] },
  differentials: [{ condition: "Alternative", distinguishingFeatures: "Feature" }],
  investigations: {
    ruleIn: [{ tier: "laboratory", testName: "Test", modalityTarget: "Test for condition", targetCondition: "Condition", expectedFinding: "Finding", clinicalRationale: "Rationale" }],
    ruleOut: [{ tier: "specializedAdjunctive", testName: "Test", modalityTarget: "Test for alternative", targetCondition: "Alternative", expectedFinding: "Finding", clinicalRationale: "Rationale" }],
  },
  clinicalManagement: [{ id: "assess", title: "Assess", timeframe: "Immediate", actions: ["Act"] }],
  nonClinicalManagement: { patientEducation: ["Education"], lifestyleAndDiet: ["Lifestyle"], mdtReferrals: ["Referral"], dischargeCriteria: ["Criterion"], followUpPlan: "Follow up." },
});

describe("GuidelinePathwayForm", () => {
  it("edits strings and dynamic lists while compiling a valid hidden payload", async () => {
    const user = userEvent.setup();
    render(<GuidelinePathwayForm disease={disease} guidelineId={disease.id} versionId="22222222-2222-4222-8222-222222222222" saveAction={vi.fn()} />);

    const summary = screen.getByRole("textbox", { name: "Summary" });
    await user.clear(summary);
    await user.type(summary, "Updated clinical summary.");

    const symptoms = screen.getByRole("heading", { name: "Symptoms" }).closest(".pathway-array-field");
    expect(symptoms).not.toBeNull();
    await user.click(within(symptoms as HTMLElement).getByRole("button", { name: "Add item" }));
    await user.type(within(symptoms as HTMLElement).getByRole("textbox", { name: "Symptoms item 2" }), "New symptom");

    const compiled = JSON.parse((document.querySelector('input[name="content"]') as HTMLInputElement).value);
    expect(compiled.pathophysiology.summary).toBe("Updated clinical summary.");
    expect(compiled.presentation.symptoms).toEqual(["Original symptom", "New symptom"]);
    expect(DiseaseDetailSchema.safeParse(compiled).success).toBe(true);
    expect(screen.getByRole("button", { name: "Save draft" })).toBeInTheDocument();
  });

  it("blocks submission and explains schema errors before the server action", async () => {
    const user = userEvent.setup();
    const saveAction = vi.fn();
    const { container } = render(<GuidelinePathwayForm disease={disease} guidelineId={disease.id} versionId="22222222-2222-4222-8222-222222222222" saveAction={saveAction} />);
    const symptoms = screen.getByRole("heading", { name: "Symptoms" }).closest(".pathway-array-field");
    await user.click(within(symptoms as HTMLElement).getByRole("button", { name: "Remove Symptoms item 1" }));
    fireEvent.submit(container.querySelector("form") as HTMLFormElement);

    expect(await screen.findByRole("alert")).toHaveTextContent("presentation → symptoms");
    expect(saveAction).not.toHaveBeenCalled();
  });
});
