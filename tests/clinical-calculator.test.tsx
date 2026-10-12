import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ClinicalCalculator } from "@/components/clinical-calculator";
import { MedicalCalculators } from "@/components/medical-calculators";
import { calculateScore, clinicalCalculators, questionScore, type NumericQuestion } from "@/lib/clinical-calculators";

const wells = clinicalCalculators.find(({ id }) => id === "wells-pe")!;
const cha2ds2Vasc = clinicalCalculators.find(({ id }) => id === "cha2ds2-vasc")!;

describe("clinical calculator scoring", () => {
  it("calculates the Wells score with the exact fractional weights", () => {
    expect(calculateScore(wells, {
      "dvt-signs": "yes",
      "alternative-less-likely": "no",
      "heart-rate": { value: 101, unit: "bpm" },
      history: ["immobilisation-surgery", "previous-vte", "haemoptysis", "malignancy"],
    })).toBe(9.5);
  });

  it("keeps the Wells two-level boundary at 4 points", () => {
    const answers = { "dvt-signs": "yes", "alternative-less-likely": "no", "heart-rate": { value: 100, unit: "bpm" }, history: ["haemoptysis"] };
    expect(calculateScore(wells, answers)).toBe(4);
    expect(wells.results.find(({ id }) => id === "pe-unlikely")?.match.maxScore).toBe(4);
  });

  it("scores mutually exclusive CHA2DS2-VASc age bands", () => {
    expect(calculateScore(cha2ds2Vasc, { sex: "female", age: { value: 74, unit: "years" }, "risk-factors": ["stroke", "vascular"] })).toBe(5);
    expect(calculateScore(cha2ds2Vasc, { sex: "female", age: { value: 75, unit: "years" }, "risk-factors": ["stroke", "vascular"] })).toBe(6);
  });

  it("normalises alternate numerical units before applying score thresholds", () => {
    const glucoseQuestion: NumericQuestion = {
      id: "glucose",
      type: "number",
      label: "Glucose",
      units: [
        { value: "mmol-l", label: "mmol/L" },
        { value: "mg-dl", label: "mg/dL", canonicalMultiplier: 1 / 18 },
      ],
      scoring: [{ max: 7, points: 0 }, { min: 7, points: 1 }],
    };
    expect(questionScore(glucoseQuestion, { value: 126, unit: "mg-dl" })).toBe(1);
    expect(questionScore(glucoseQuestion, { value: 125, unit: "mg-dl" })).toBe(0);
  });
});

describe("ClinicalCalculator", () => {
  it("withholds risk advice until all inputs are explicitly completed", () => {
    render(<ClinicalCalculator schema={wells} />);
    expect(screen.getByText("Complete all sections")).toBeInTheDocument();
    expect(screen.queryByText("PE unlikely")).not.toBeInTheDocument();
  });

  it("resets state cleanly when switching calculators", async () => {
    const user = userEvent.setup();
    render(<MedicalCalculators />);
    await user.click(screen.getAllByRole("button", { name: /^yes/i })[0]);
    expect(screen.getByText("3", { selector: ".calculator-score" })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /cha₂ds₂-vasc/i }));
    expect(screen.getByText("0", { selector: ".calculator-score" })).toBeInTheDocument();
    expect(screen.getByText(/0 of 3 sections complete/i)).toBeInTheDocument();
  });
});
