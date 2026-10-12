import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DiseaseDirectoryClient } from "@/components/diseases/DiseaseDirectoryClient";
import { KnowledgeSearch } from "@/components/dashboard/knowledge-search";
import { hasMedicalSpeciality, inferMedicalSpecialityTags } from "@/lib/medical-specialities";
import type { DiseaseGuidelineSummary } from "@/lib/data/disease-guidelines";

const base = { specialty: "Emergency Medicine", speciality: "Emergency Medicine", subSpecialities: [], authority: "MOH" as const, status: "published" as const, version: "1.0", lastReviewed: "2026-09-01" };
const diseases: DiseaseGuidelineSummary[] = [
  { ...base, id: "a1010000-0000-4000-8000-000000000011", title: "Diabetic Ketoacidosis", pillar: "Urgent Care", summary: "Insulin deficiency with ketosis and acidosis.", keywords: ["Polyuria", "Kussmaul breathing"] },
  { ...base, id: "a1010000-0000-4000-8000-000000000012", title: "Acute Kidney Injury", pillar: "Urgent Care", summary: "Rapid fall in renal function.", keywords: ["Oliguria", "Furosemide"] },
  { ...base, id: "a1010000-0000-4000-8000-000000000013", title: "Antenatal Care for Uncomplicated Pregnancy", pillar: "Safe Birth", specialty: "Obstetrics and Gynecology", speciality: "Obstetrics and Gynecology", summary: "Routine antenatal visits." },
];

const searchBox = () => screen.getByRole("searchbox", { name: /search diseases/i });
const headings = () => screen.queryAllByRole("heading", { level: 3 }).map((node) => node.textContent);

describe("directory search", () => {
  it("finds Diabetic Ketoacidosis from the abbreviation DKA (the reported failure)", () => {
    vi.useFakeTimers();
    render(<DiseaseDirectoryClient diseases={diseases} state="ready" />);
    fireEvent.change(searchBox(), { target: { value: "DKA" } });
    act(() => vi.advanceTimersByTime(250));
    expect(headings()).toEqual(["Diabetic Ketoacidosis"]);
    vi.useRealTimers();
  });

  it("applies the search immediately when the Search button is pressed", () => {
    render(<DiseaseDirectoryClient diseases={diseases} state="ready" />);
    fireEvent.change(searchBox(), { target: { value: "AKI" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(headings()).toEqual(["Acute Kidney Injury"]);
  });

  it("applies the search when Enter submits the form", () => {
    render(<DiseaseDirectoryClient diseases={diseases} state="ready" />);
    fireEvent.change(searchBox(), { target: { value: "antenatal" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(headings()).toEqual(["Antenatal Care for Uncomplicated Pregnancy"]);
  });

  it("searches symptoms and drugs, not just titles", () => {
    render(<DiseaseDirectoryClient diseases={diseases} state="ready" />);
    fireEvent.change(searchBox(), { target: { value: "furosemide" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(headings()).toEqual(["Acute Kidney Injury"]);
  });

  it("starts with the query from the URL (header and hub searches)", () => {
    render(<DiseaseDirectoryClient diseases={diseases} state="ready" initialQuery="dka" />);
    expect(searchBox()).toHaveValue("dka");
    expect(headings()).toEqual(["Diabetic Ketoacidosis"]);
  });

  it("shows pillar counts for the current search and combines search with a pillar filter", () => {
    render(<DiseaseDirectoryClient diseases={diseases} state="ready" initialQuery="pregnancy" />);
    expect(screen.getByRole("button", { name: /safe birth/i })).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: /urgent care/i })).toHaveTextContent("0");
    fireEvent.click(screen.getByRole("button", { name: /urgent care/i }));
    expect(screen.getByRole("heading", { name: /no guidelines match/i })).toBeInTheDocument();
  });

  it("explains an empty search and the reset button restores everything", () => {
    render(<DiseaseDirectoryClient diseases={diseases} state="ready" />);
    fireEvent.change(searchBox(), { target: { value: "zzzzqx" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByRole("heading", { name: "No guidelines match “zzzzqx”" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(searchBox()).toHaveValue("");
    expect(headings()).toHaveLength(3);
  });

  it("clear button empties the box and restores the full list at once", () => {
    render(<DiseaseDirectoryClient diseases={diseases} state="ready" initialQuery="dka" />);
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(searchBox()).toHaveValue("");
    expect(headings()).toHaveLength(3);
  });

  it("narrows search results by speciality", () => {
    render(<DiseaseDirectoryClient diseases={diseases} state="ready" initialQuery="care" />);
    fireEvent.change(screen.getByRole("combobox", { name: /medical speciality/i }), { target: { value: "Obstetrics and Gynecology" } });
    expect(headings()).toEqual(["Antenatal Care for Uncomplicated Pregnancy"]);
  });
});

describe("dashboard hub search", () => {
  it("sends every scope to the searchable clinical directory with the query", () => {
    render(<KnowledgeSearch />);
    for (const scope of ["Diseases", "Guidelines", "Pathways", "Formulary"]) {
      fireEvent.click(screen.getByRole("radio", { name: scope }));
      const form = screen.getByRole("search");
      expect(form).toHaveAttribute("action", "/dashboard/diseases");
      expect(within(form).getByRole("textbox")).toHaveAttribute("name", "q");
      expect(within(form).getByRole("button", { name: /search/i })).toHaveAttribute("type", "submit");
    }
  });
});

describe("speciality matching", () => {
  it("matches whole words only, so ENT does not match Preventive and Neurology is not Urology", () => {
    expect(hasMedicalSpeciality("Preventive Medicine", "Otolaryngology (ENT)")).toBe(false);
    expect(hasMedicalSpeciality("Colorectal Cancer Management", "Otolaryngology (ENT)")).toBe(false);
    expect(hasMedicalSpeciality("Neurology", "Urology")).toBe(false);
    expect(hasMedicalSpeciality("ENT / Head and Neck", "Otolaryngology (ENT)")).toBe(true);
    expect(hasMedicalSpeciality("Respiratory medicine", "Pulmonology")).toBe(true);
    expect(hasMedicalSpeciality("Maternal-Fetal Medicine", "Obstetrics and Gynecology")).toBe(true);
    expect(inferMedicalSpecialityTags("Preventive Medicine")).toEqual([]);
  });
});
