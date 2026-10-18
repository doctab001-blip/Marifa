import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DiseaseDirectory } from "@/components/disease-directory";
import { diseases } from "@/lib/demo-data";

describe("DiseaseDirectory", () => {
  it("filters results as a clinician types", async () => {
    const user = userEvent.setup();
    render(<DiseaseDirectory items={diseases} />);
    await user.type(screen.getByRole("textbox", { name: /search the disease directory/i }), "AKI");
    expect(screen.getByRole("heading", { name: "Acute kidney injury" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Sepsis recognition" })).not.toBeInTheDocument();
  });

  it("renders Arabic names with RTL direction", () => {
    render(<DiseaseDirectory items={diseases} initialQuery="COPD" />);
    expect(screen.getByText("التفاقم الحاد لمرض الانسداد الرئوي المزمن")).toHaveAttribute("dir", "rtl");
  });
});
