import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImagingTable, imagingTechnique } from "@/components/imaging-table";
import type { Investigation } from "@/lib/investigation-display";

const echo: Investigation = {
  tier: "firstLineImaging",
  testName: "Transthoracic echocardiography",
  targetCondition: "Bradyarrhythmia",
  modalityTarget: "Bedside focused study",
  expectedFinding: "Reduced ejection fraction (guides pacing mode)",
  clinicalRationale: "After stabilisation, to choose the pacing mode.",
};

describe("Imaging table", () => {
  it("puts why/when in the second column and findings in the third, never merged", () => {
    render(<ImagingTable items={[echo]} />);
    expect(screen.getByRole("columnheader", { name: "Why and when to order" })).toBeInTheDocument();
    const row = screen.getByRole("row", { name: /Transthoracic echocardiography/ });
    const cells = within(row).getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("After stabilisation, to choose the pacing mode.");
    expect(cells[1]).toHaveTextContent("Reduced ejection fraction (guides pacing mode)");
    expect(cells[1]).not.toHaveTextContent("After stabilisation");
  });

  it("shows the technique only when the test name does not already say it", () => {
    expect(imagingTechnique(echo)).toBe("Bedside focused study");
    expect(imagingTechnique({ ...echo, modalityTarget: "Echo" })).toBeNull();
    expect(imagingTechnique({ ...echo, testName: "Ultrasound abdomen", modalityTarget: "Ultrasound" })).toBeNull();
    expect(imagingTechnique({ ...echo, modalityTarget: `${echo.testName} — ${echo.targetCondition}` })).toBeNull();
  });

  it("renders nothing when there is no imaging", () => {
    const { container } = render(<ImagingTable items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
