import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModelOfCareDirectory } from "@/components/model-of-care-directory";
import { PathwaySequence } from "@/components/pathway-sequence";
import { adultDkaHhsPathway, carePillars, mockDiseases } from "@/data/mockDiseases";

describe("Phase 2 disease management UI", () => {
  it("debounces directory search before updating results", () => {
    vi.useFakeTimers();
    render(<ModelOfCareDirectory pillars={carePillars} diseases={mockDiseases} />);

    fireEvent.change(screen.getByRole("textbox", { name: /search by condition/i }), { target: { value: "asthma" } });
    expect(screen.getByRole("heading", { name: "Adult DKA/HHS" })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(250));
    expect(screen.getByRole("heading", { name: "Adult Asthma" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Adult DKA/HHS" })).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("filters the directory by Saudi Model of Care pillar", () => {
    render(<ModelOfCareDirectory pillars={carePillars} diseases={mockDiseases} />);
    fireEvent.click(screen.getByRole("button", { name: /safe birth/i }));
    expect(screen.getByRole("heading", { name: "Hypertension in Pregnancy" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Adult Asthma" })).not.toBeInTheDocument();
  });

  it("renders pathway actions and conditional branches", () => {
    render(<PathwaySequence pathway={adultDkaHhsPathway} />);
    expect(screen.getByRole("heading", { name: "Adult DKA/HHS Protocol" })).toBeInTheDocument();
    expect(screen.getByText("If K+ < 3.3 mmol/L")).toBeInTheDocument();
    expect(screen.getByText("If targets are not improving")).toBeInTheDocument();
  });
});
