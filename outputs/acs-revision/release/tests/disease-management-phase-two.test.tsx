import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClinicalWarning } from "@/components/clinical-warning";
import { ModelOfCareDirectory } from "@/components/model-of-care-directory";
import { PathwaySequence } from "@/components/pathway-sequence";
import { DiseaseDirectoryClient } from "@/components/diseases/DiseaseDirectoryClient";
import { CollapsibleShell } from "@/components/collapsible-shell";
import { DiseaseCard } from "@/components/diseases/DiseaseCard";
import type { DiseaseGuidelineSummary } from "@/lib/data/disease-guidelines";

const diseases: DiseaseGuidelineSummary[] = [
  { id: "a1010000-0000-4000-8000-000000000001", title: "Acute Severe Asthma Exacerbation (Adult)", specialty: "Emergency Medicine", speciality: "Emergency Medicine", subSpecialities: [], authority: "MOH", status: "approved", version: "1.0", lastReviewed: "2026-09-01", pillar: "Urgent Care", summary: "Acute airflow obstruction requiring urgent assessment." },
  { id: "a1010000-0000-4000-8000-000000000008", title: "Adult Periodic Health Examination", specialty: "Preventive Medicine", speciality: "Preventive Medicine", subSpecialities: [], authority: "PHA", status: "published", version: "1.0", lastReviewed: "2026-09-01", pillar: "Keep Well", summary: "Risk-based preventive screening for adults." },
];

describe("Disease management UI", () => {
  it("switches directory views without losing filters or pending review notices", () => {
    render(<DiseaseDirectoryClient diseases={[{ ...diseases[0], clinicalReviewStatus: "pending" }, diseases[1]]} state="ready" />);
    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: /urgent care/i }));
    expect(screen.getByText("Clinical review pending")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Adult Periodic Health Examination" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Grid" }));
    expect(screen.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("heading", { name: "Adult Periodic Health Examination" })).not.toBeInTheDocument();
  });

  it("collapses and restores the sidebar without removing navigation", () => {
    render(<CollapsibleShell primaryColor="#1f3c88"><aside id="workspace-sidebar"><a href="/dashboard/diseases">Disease Management</a></aside></CollapsibleShell>);
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("link", { name: "Disease Management" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(screen.getByRole("button", { name: "Collapse sidebar" })).toHaveAttribute("aria-expanded", "true");
  });

  it("deduplicates display tags without altering source data", () => {
    const disease = { ...diseases[0], subSpecialities: ["Emergency medicine", "Respiratory medicine", "Respiratory medicine"] };
    render(<DiseaseCard disease={disease} />);
    expect(screen.getAllByText("Emergency Medicine")).toHaveLength(1);
    expect(screen.getAllByText("Respiratory medicine")).toHaveLength(1);
    expect(disease.subSpecialities).toHaveLength(3);
  });

  it("shows saved textbook scenarios without claiming clinical approval", () => {
    render(<DiseaseCard disease={{ ...diseases[0], authority: "Textbook", status: "published", clinicalReviewStatus: "pending" }} />);
    expect(screen.getByText("Clinical review pending")).toBeInTheDocument();
    expect(screen.getByText("Textbook")).toBeInTheDocument();
    expect(screen.queryByText("Approved")).not.toBeInTheDocument();
  });
  it("debounces directory search before updating results", () => {
    vi.useFakeTimers();
    render(<ModelOfCareDirectory diseases={diseases} state="ready" />);
    fireEvent.change(screen.getByRole("textbox", { name: /search by condition/i }), { target: { value: "asthma" } });
    expect(screen.getByRole("heading", { name: "Adult Periodic Health Examination" })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(250));
    expect(screen.getByRole("heading", { name: "Acute Severe Asthma Exacerbation (Adult)" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Adult Periodic Health Examination" })).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("filters by the Saudi Model of Care pillar", () => {
    render(<ModelOfCareDirectory diseases={diseases} state="ready" />);
    fireEvent.click(screen.getByRole("button", { name: /keep well/i }));
    expect(screen.getByRole("heading", { name: "Adult Periodic Health Examination" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Acute Severe Asthma Exacerbation (Adult)" })).not.toBeInTheDocument();
  });

  it("renders red flags with an alert heading", () => {
    render(<ClinicalWarning items={["Refractory hypoxaemia", "Haemodynamic instability"]} />);
    expect(screen.getByRole("heading", { name: "Emergency red flags" })).toBeInTheDocument();
    expect(screen.getByText("Refractory hypoxaemia")).toBeInTheDocument();
  });

  it("renders pathway actions and conditional branches", () => {
    render(<PathwaySequence steps={[{ id: "initial-assessment", title: "Initial assessment", timeframe: "Within 10 minutes", actions: ["Assess airway and breathing"], branches: [{ condition: "If unstable", actions: ["Escalate immediately", "Activate emergency response"] }] }]} />);
    expect(screen.getByRole("heading", { name: "Management sequence" })).toBeInTheDocument();
    expect(screen.getByText("Within 10 minutes")).toBeInTheDocument();
    expect(screen.getByText("If unstable")).toBeInTheDocument();
    expect(screen.getByText("Activate emergency response")).toBeInTheDocument();
  });
});
