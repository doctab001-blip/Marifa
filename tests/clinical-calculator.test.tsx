import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClinicalCalculator } from "@/components/clinical-calculator";
import { MedicalCalculators } from "@/components/medical-calculators";
import { calculateScore, clinicalCalculators, questionScore, type NumericQuestion } from "@/lib/clinical-calculators";

let mockCalc: string | null = null;
vi.mock("next/navigation", () => ({ useSearchParams: () => ({ get: (key: string) => (key === "calc" ? mockCalc : null) }) }));

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

  it("shows the searchable home, filters by speciality and opens a calculator", async () => {
    mockCalc = null;
    const user = userEvent.setup();
    render(<MedicalCalculators />);
    expect(screen.getByRole("searchbox", { name: /search calculators/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /NEWS2/ })).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "torsades");
    expect(screen.getByRole("link", { name: /Corrected QT/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Wells' Criteria for Pulmonary/ })).not.toBeInTheDocument();
    await user.clear(screen.getByRole("searchbox"));
    await user.click(screen.getByRole("button", { name: /^Hepatology/ }));
    expect(screen.getByRole("link", { name: /Child-Pugh/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /NEWS2/ })).not.toBeInTheDocument();
  });

  it("calculates live, then shows interpretation tables on the Evidence tab", async () => {
    mockCalc = "cha2ds2-vasc";
    const user = userEvent.setup();
    render(<MedicalCalculators />);
    expect(screen.getByText("0", { selector: ".calculator-score" })).toBeInTheDocument();
    expect(screen.getByText(/0 of 7 sections complete/i)).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: /^yes/i })[0]);
    expect(screen.getByText("1", { selector: ".calculator-score" })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Evidence" }));
    expect(screen.getByRole("heading", { name: "Interpretation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "References" })).toBeInTheDocument();
  });

  it("shows a dash for measured-value calculators until every input is in, then the result with unit", async () => {
    mockCalc = "corrected-calcium";
    const user = userEvent.setup();
    render(<MedicalCalculators />);
    expect(screen.getByText("—", { selector: ".calculator-score" })).toBeInTheDocument();
    const [calcium, albumin] = screen.getAllByRole("spinbutton");
    await user.type(calcium, "8");
    await user.type(albumin, "2");
    expect(screen.getByText("9.6", { selector: ".calculator-score" })).toBeInTheDocument();
    expect(screen.getByText("Normal range")).toBeInTheDocument();
    expect(screen.getByText(/2\.4 mmol\/L|2\.40 mmol\/L/)).toBeInTheDocument();
  });

  it("converts the entered value when the unit changes and still calculates correctly", async () => {
    mockCalc = "corrected-calcium";
    const user = userEvent.setup();
    render(<MedicalCalculators />);
    const [calcium, albumin] = screen.getAllByRole("spinbutton");
    await user.type(calcium, "2");
    await user.type(albumin, "4");
    await user.click(screen.getAllByRole("button", { name: "mmol/L" })[0]);
    await user.click(screen.getAllByRole("button", { name: "g/L" })[0]);
    await user.clear(calcium); await user.type(calcium, "2");
    await user.clear(albumin); await user.type(albumin, "20");
    expect(screen.getByText("9.6", { selector: ".calculator-score" })).toBeInTheDocument();
  });
});
