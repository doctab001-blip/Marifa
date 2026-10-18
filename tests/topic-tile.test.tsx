import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ManagedTopicTile } from "@/components/diseases/ManagedTopicTile";
import { summarizeSpecialty } from "@/lib/medical-specialities";

describe("summarizeSpecialty", () => {
  it("collapses composite free-text specialties to a primary chip and a count", () => {
    expect(summarizeSpecialty("Endocrinology / Podiatry / Vascular Surgery")).toEqual({ primary: "Endocrinology", extra: 2 });
    expect(summarizeSpecialty("Emergency Medicine and Cardiology")).toEqual({ primary: "Emergency Medicine", extra: 1 });
  });

  it("falls back to the first segment when the catalogue has no match, and never throws on empty input", () => {
    expect(summarizeSpecialty("Palliative Medicine / Oncology").primary).toBe("Palliative Medicine");
    expect(summarizeSpecialty("Rheumatology")).toEqual({ primary: "Rheumatology", extra: 0 });
    expect(summarizeSpecialty("  ")).toEqual({ primary: "Unassigned", extra: 0 });
  });
});

describe("ManagedTopicTile", () => {
  const base = { tone: "published" as const, statusLabel: "Published", title: "Hypertension Primary Care Titration", specialty: "Cardiology / Primary Care", version: "1.0", source: "NICE NG136", linkLabel: "Edit Hypertension Primary Care Titration, version 1.0" };

  it("renders one whole-tile link, a single speciality chip and the source", () => {
    render(<ManagedTopicTile {...base} href="/dashboard/admin/guidelines/x" />);
    expect(screen.getByRole("link", { name: /edit hypertension/i })).toHaveAttribute("href", "/dashboard/admin/guidelines/x");
    expect(screen.getByText("Cardiology")).toBeInTheDocument();
    expect(screen.getByText("NICE NG136")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("renders plain title text and no controls when the viewer cannot act", () => {
    render(<ManagedTopicTile {...base} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hypertension Primary Care Titration" })).toBeInTheDocument();
  });

  it("exposes icon controls with accessible names", () => {
    render(<ManagedTopicTile {...base} href="/x" actions={<button aria-label="Approve Hypertension Primary Care Titration" title="Approve" />} />);
    expect(screen.getByRole("button", { name: /approve hypertension/i })).toBeInTheDocument();
  });
});
