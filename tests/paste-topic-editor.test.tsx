import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PasteTopicEditor } from "@/components/admin/paste-topic-editor";
import { DiseaseDetailSchema } from "@/lib/validations/disease";

afterEach(cleanup);

const raw = JSON.parse(readFileSync("data/emergency-versions/acs.emergency-2026-10-12-v3.json", "utf8"));
const parsed = DiseaseDetailSchema.parse(raw.content ?? raw);
const { granularPathway: dropped, ...rest } = parsed;
void dropped;
const base = DiseaseDetailSchema.parse({
  ...rest, title: "Diabetic Ketoacidosis in Adults", clinicalScenario: undefined, guidelineComparison: undefined,
  evidenceAudit: { ...rest.evidenceAudit!, scope: "Adults with diabetic ketoacidosis.", findings: ["Fixture."], unverifiedSections: ["Fixture."] },
  teaching: { learningObjectives: ["Placeholder."] },
  nonClinicalManagement: { patientEducation: ["a"], lifestyleAndDiet: ["b"], mdtReferrals: ["c"], dischargeCriteria: ["d"], followUpPlan: "e" },
});
const sample = readFileSync("tests/fixtures/gemini-paste-sample.md", "utf8");
const noop = () => undefined;

function setup() {
  return render(<PasteTopicEditor base={base} guidelineId="a14c7e92-5b31-4d68-9f20-6c83e1b7a405" versionId="b14c7e92-5b31-4d68-9f20-6c83e1b7a405" versionLabel="v1" today="2026-10-18" saveAction={noop} />);
}

describe("PasteTopicEditor", () => {
  it("starts empty with saving disabled", () => {
    setup();
    expect(screen.getByText("Paste the full topic to begin")).toBeTruthy();
    expect((screen.getByRole("button", { name: /Save as draft/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("shows the score and enables Publish once a complete topic is pasted", async () => {
    setup();
    fireEvent.change(screen.getByLabelText("Topic text from Gemini"), { target: { value: sample } });
    expect(await screen.findByText(/ready to publish/)).toBeTruthy();
    expect((screen.getByRole("button", { name: /Publish/ }) as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByText("Management steps")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Management of Diabetic Ketoacidosis/ }).getAttribute("rel")).toContain("noopener");
  });

  it("blocks saving and lists what is wrong when the text is not a valid topic", async () => {
    setup();
    fireEvent.change(screen.getByLabelText("Topic text from Gemini"), { target: { value: sample.replace("| Venous pH | 7.35–7.45 | Below 7.30 |", "| Venous pH | 7.35–7.45 | |") } });
    expect(await screen.findByText("Cannot save yet")).toBeTruthy();
    expect((screen.getByRole("button", { name: /Save as draft/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getAllByText(/Venous pH/).length).toBeGreaterThan(0);
  });
});
