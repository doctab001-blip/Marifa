import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DiagnosticEngineResponse, DiagnosticInputState, DifferentialMatch } from "@/types/diagnosisEngine";

// The live-catalogue resolver reads Supabase; tests use the offline catalogue resolver and repository topics.
vi.mock("@/lib/diagnosis-engine/pathways", async () => {
  const engine = await vi.importActual<typeof import("@/lib/diagnosis-engine/engine")>("@/lib/diagnosis-engine/engine");
  const topics = await vi.importActual<typeof import("@/lib/data/global-topics")>("@/lib/data/global-topics");
  return {
    createLivePathwayResolver: async () => engine.catalogueResolver,
    loadGlobalTopics: () => topics.listGlobalDiseaseTopicIds().flatMap((id) => {
      const result = topics.getGlobalDiseaseTopic(id);
      return result.state === "ready" ? [result.topic] : [];
    }),
  };
});

import { fireEvent } from "@testing-library/react";
import { GET, POST } from "@/app/api/diagnosis-engine/route";
import { buildReferenceSet, contextAdjustment, runDiagnosisEngine, type PathwayResolver } from "@/lib/diagnosis-engine/engine";
import { diagnosticProfiles } from "@/lib/diagnosis-engine/knowledge-base";
import { interpretValues } from "@/lib/diagnosis-engine/interpret";
import { referencedCalculatorIds } from "@/lib/diagnosis-engine/calculators";
import { clinicalPresets } from "@/lib/diagnosis-engine/presets";
import { clinicalCalculators } from "@/lib/clinical-calculators";
import { DifferentialCard } from "@/components/diagnosis-engine/differential-card";
import { ComparePanel } from "@/components/diagnosis-engine/compare-panel";
import { FindingInput } from "@/components/diagnosis-engine/finding-input";
import { vitalsToFindings, EMPTY_VITALS } from "@/components/diagnosis-engine/vitals-panel";
import { summaryText } from "@/components/diagnosis-engine/summary";
import { Thermometer } from "lucide-react";

/** Every Marifa disease-module id held in the repository (catalogue versions, seed batches, GlobalDiseaseTopic records). */
function marifaTopicIds() {
  const ids = new Set<string>();
  const walk = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    if (typeof record.id === "string" && "title" in record) ids.add(record.id);
    Object.values(record).forEach(walk);
  };
  for (const folder of ["data/emergency-versions", "data/global-topics", "data/seeds"]) {
    for (const file of readdirSync(path.resolve(folder)).filter((name) => name.endsWith(".json"))) {
      walk(JSON.parse(readFileSync(path.resolve(folder, file), "utf8")));
    }
  }
  return ids;
}

async function diagnose(input: Partial<DiagnosticInputState> | string) {
  const response = await POST(new Request("http://localhost/api/diagnosis-engine", { method: "POST", headers: { "Content-Type": "application/json" }, body: typeof input === "string" ? input : JSON.stringify(input) }));
  return { status: response.status, body: (await response.json()) as DiagnosticEngineResponse & { error?: string; code?: string } };
}

const titles = (items: DifferentialMatch[]) => items.map((item) => item.diseaseTitle);
const PATHWAY_URL = /^\/dashboard\/diseases\/([A-Za-z0-9-]+)(\?region=(SA|IN|UK))?$/;

describe("Diagnosis Engine API — ranked differentials", () => {
  it.each(clinicalPresets.map((preset) => [preset.label, preset] as const))("returns 3 or 4 ranked differentials for the %s scenario", async (_label, preset) => {
    const { status, body } = await diagnose({ ...preset.input, region: "SA" });
    expect(status).toBe(200);
    expect(body.topDifferentials.length).toBeGreaterThanOrEqual(3);
    expect(body.topDifferentials.length).toBeLessThanOrEqual(4);
    const scores = body.topDifferentials.map((item) => item.matchScore);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    expect(new Set(titles(body.topDifferentials)).size).toBe(body.topDifferentials.length);
    expect(body.queryId).toMatch(/^[0-9a-f-]{36}$/);
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
    expect(body.clinicalSafetyNotice).toMatch(/not a diagnosis/i);
  });

  it("ranks the expected condition first for each teaching scenario", async () => {
    const expected: Record<string, string> = {
      "acute-chest-pain": "Acute Pulmonary Embolism",
      "acute-abdomen": "Acute Appendicitis",
      "fever-headache": "Bacterial Meningitis",
      "prolonged-fever": "Enteric Fever (Typhoid)",
      "breathless-older-adult": "Acute Heart Failure / Pulmonary Oedema",
      "drowsy-hyperglycaemia": "Diabetic Ketoacidosis",
    };
    for (const preset of clinicalPresets) {
      const vitals = vitalsToFindings({ ...EMPTY_VITALS, ...preset.vitals });
      const { body } = await diagnose({ ...preset.input, examFindings: [...vitals.examFindings, ...preset.input.examFindings], labInvestigations: [...vitals.labInvestigations, ...preset.input.labInvestigations] });
      expect(body.topDifferentials[0].diseaseTitle, preset.label).toBe(expected[preset.id]);
    }
  });

  it("shows which entered findings matched, in the vector they were entered", async () => {
    const { body } = await diagnose(clinicalPresets[0].input);
    const pe = body.topDifferentials[0];
    expect(pe.matchedFeatures.labsMatched).toContain("Elevated D-dimer");
    expect(pe.matchedFeatures.examMatched).toContain("Unilateral calf swelling");
    expect(pe.matchedFeatures.imagingMatched).toContain("Normal chest X-ray");
    expect(pe.suggestedNextSteps.some((step) => /CTPA|pulmonary angiogram/i.test(step.testName))).toBe(true);
    expect(pe.missingClassicFeatures.join(" ")).toMatch(/CTPA/);
  });

  it("treats negated and contrary findings as evidence against", async () => {
    const { body } = await diagnose({ symptoms: ["Productive cough", "No fever"], examFindings: ["Focal crackles"], imagingFindings: ["Normal chest X-ray"] });
    const pneumonia = body.topDifferentials.find((item) => item.diseaseTitle === "Community-Acquired Pneumonia");
    expect(pneumonia?.contradictingFindings).toEqual(expect.arrayContaining(["No fever", "Normal chest X-ray"]));
    expect(pneumonia?.matchedFeatures.symptomsMatched).not.toContain("No fever");
  });

  it("excludes sex-specific conditions that cannot apply", async () => {
    const input = { symptoms: ["Lower abdominal pain", "Missed period", "Vaginal bleeding"], labInvestigations: ["Positive pregnancy test"] };
    expect(titles((await diagnose({ ...input, gender: "female" })).body.topDifferentials)).toContain("Ectopic Pregnancy");
    const male = await diagnose({ ...input, gender: "male" });
    if (male.status === 200) expect(titles(male.body.topDifferentials)).not.toContain("Ectopic Pregnancy");
  });

  it("rejects empty, malformed and unmatched requests", async () => {
    expect((await diagnose({ symptoms: [], examFindings: [], labInvestigations: [], imagingFindings: [] })).status).toBe(400);
    expect((await diagnose("{not json")).status).toBe(400);
    expect((await diagnose({ symptoms: ["x".repeat(500)] })).body.code).toBe("invalid_input");
    const unmatched = await diagnose({ symptoms: ["Purple elbow freckle"] });
    expect(unmatched.status).toBe(422);
    expect(unmatched.body.code).toBe("no_match");
  });
});

describe("Diagnosis Engine — must-not-miss conditions", () => {
  it("flags pulmonary embolism as CRITICAL_MUST_NOT_MISS", async () => {
    const { body } = await diagnose(clinicalPresets[0].input);
    const pe = body.topDifferentials.find((item) => item.diseaseTitle === "Acute Pulmonary Embolism");
    expect(pe?.urgencyLevel).toBe("CRITICAL_MUST_NOT_MISS");
    expect(pe?.redFlags.length).toBeGreaterThan(0);
  });

  it("flags acute coronary syndrome as CRITICAL_MUST_NOT_MISS", async () => {
    const { body } = await diagnose({
      gender: "male",
      age: 61,
      symptoms: ["Central crushing chest pain", "Radiating to left arm", "Sweating"],
      labInvestigations: ["ST depression in V4-V6", "Raised troponin"],
    });
    expect(body.topDifferentials[0].diseaseTitle).toBe("Acute Coronary Syndrome");
    expect(body.topDifferentials[0].urgencyLevel).toBe("CRITICAL_MUST_NOT_MISS");
  });

  it("keeps a supported life-threatening condition on the list even when a benign one scores higher", async () => {
    const { body } = await diagnose({
      symptoms: ["Burning chest pain", "Worse after meals", "Acid brash", "Relieved by antacids"],
      examFindings: ["Epigastric tenderness", "Tachycardia"],
      labInvestigations: ["H. pylori positive", "Raised D-dimer"],
    });
    expect(body.topDifferentials[0].urgencyLevel).toBe("ROUTINE");
    expect(body.topDifferentials.some((item) => item.urgencyLevel === "CRITICAL_MUST_NOT_MISS")).toBe(true);
  });

  it("renders must-not-miss cards with the gold alert styling and routine cards without it", async () => {
    const { body } = await diagnose(clinicalPresets[0].input);
    const critical = body.topDifferentials.find((item) => item.urgencyLevel === "CRITICAL_MUST_NOT_MISS")!;
    const { container, unmount } = render(createElement(DifferentialCard, { match: critical, rank: 1 }));
    const card = container.querySelector("article")!;
    expect(card).toHaveClass("dx-card--critical");
    expect(card).toHaveAttribute("data-urgency", "CRITICAL_MUST_NOT_MISS");
    expect(screen.getByText("Must-not-miss")).toHaveClass("dx-urgency--critical");
    expect(screen.getByRole("note")).toHaveTextContent(/life-threatening/i);
    unmount();

    const routine: DifferentialMatch = { ...critical, urgencyLevel: "ROUTINE" };
    const { container: routineContainer } = render(createElement(DifferentialCard, { match: routine, rank: 2 }));
    expect(routineContainer.querySelector("article")).not.toHaveClass("dx-card--critical");
    expect(routineContainer.querySelector(".dx-urgency--critical")).toBeNull();
  });
});

describe("Diagnosis Engine — Marifa pathway links", () => {
  const knownIds = marifaTopicIds();

  it("links every reference condition to an existing Marifa disease module", () => {
    expect(diagnosticProfiles.length).toBeGreaterThanOrEqual(60);
    for (const profile of diagnosticProfiles) {
      expect(profile.pathway.topicIds.length, profile.title).toBeGreaterThan(0);
      for (const id of profile.pathway.topicIds) expect(knownIds.has(id), `${profile.title} → ${id}`).toBe(true);
    }
  });

  it("returns a valid disease-module link for every differential", async () => {
    for (const preset of clinicalPresets) {
      const { body } = await diagnose({ ...preset.input, region: "IN" });
      for (const item of body.topDifferentials) {
        const match = PATHWAY_URL.exec(item.marifaPathwayUrl);
        expect(match, item.marifaPathwayUrl).not.toBeNull();
        expect(match![1]).toBe(item.diseaseId);
        expect(knownIds.has(item.diseaseId), `${item.diseaseTitle} → ${item.diseaseId}`).toBe(true);
        expect(match![3]).toBe("IN");
      }
    }
  });

  it("labels the pathway button 'Approved' only for clinically approved topics", () => {
    const approvedResolver: PathwayResolver = (pathway) => ({ id: pathway.topicIds[0], title: pathway.title, status: "approved" });
    const pendingResolver: PathwayResolver = (pathway) => ({ id: pathway.topicIds[0], title: pathway.title, status: "pending_review" });
    const input = clinicalPresets[0].input;

    const approved = runDiagnosisEngine(input, { resolvePathway: approvedResolver }).topDifferentials[0];
    const { unmount } = render(createElement(DifferentialCard, { match: approved, rank: 1 }));
    expect(screen.getByRole("link", { name: /Open Approved Pathway/ })).toHaveAttribute("href", approved.marifaPathwayUrl);
    unmount();

    const pending = runDiagnosisEngine(input, { resolvePathway: pendingResolver }).topDifferentials[0];
    render(createElement(DifferentialCard, { match: pending, rank: 1 }));
    expect(screen.getByRole("link", { name: /Open Pathway/ })).toHaveAttribute("href", pending.marifaPathwayUrl);
    expect(screen.queryByRole("link", { name: /Approved/ })).toBeNull();
    expect(screen.getByText(/clinical review pending/i)).toBeInTheDocument();
  });
});

describe("Diagnosis Engine — refinements", () => {
  it("reads typed values as clinical findings and reports what it read", async () => {
    expect(interpretValues("HR 124")).toEqual(["tachycardia"]);
    expect(interpretValues("SpO2 88%")).toEqual(["hypoxia"]);
    expect(interpretValues("BP 82/50")).toContain("hypotension");
    expect(interpretValues("K 6.9")).toContain("hyperkalaemia");
    expect(interpretValues("HR 80, SpO2 98%")).toEqual([]);
    const { body } = await diagnose({ symptoms: ["Sudden onset dyspnoea", "Pleuritic chest pain"], examFindings: ["HR 124", "SpO2 88%"], labInvestigations: ["Raised D-dimer"] });
    expect(body.topDifferentials[0].diseaseTitle).toBe("Acute Pulmonary Embolism");
    expect(body.topDifferentials[0].matchedFeatures.examMatched).toEqual(expect.arrayContaining(["HR 124", "SpO2 88%"]));
    expect(body.inputInterpretation).toEqual(expect.arrayContaining([{ original: "SpO2 88%", interpretedAs: ["hypoxia"] }]));
  });

  it("turns vital-sign fields into findings and ignores empty ones", () => {
    expect(vitalsToFindings({ ...EMPTY_VITALS, hr: "124", sbp: "84", dbp: "50", spo2: "88", glucose: "2.1" })).toEqual({ examFindings: ["HR 124", "BP 84/50", "SpO2 88%"], labInvestigations: ["Glucose 2.1"] });
    expect(vitalsToFindings(EMPTY_VITALS)).toEqual({ examFindings: [], labInvestigations: [] });
  });

  it("applies age limits and regional epidemiology", () => {
    const bronchiolitis = buildReferenceSet().find((profile) => profile.key === "bronchiolitis");
    expect(bronchiolitis && contextAdjustment(bronchiolitis, { age: 40 }).excluded).toBe(true);
    expect(bronchiolitis && contextAdjustment(bronchiolitis, { age: 1 }).excluded).toBe(false);
    const input = { symptoms: ["Fever with rigors", "Headache", "Myalgia"], examFindings: [], labInvestigations: ["Thrombocytopenia"], imagingFindings: [] };
    const malaria = (region: "IN" | "UK") => runDiagnosisEngine({ ...input, region }).topDifferentials.find((item) => item.diseaseTitle === "Malaria");
    expect(malaria("IN")?.matchScore).toBeGreaterThan(malaria("UK")?.matchScore ?? 0);
    expect(malaria("IN")?.contextNotes.join(" ")).toMatch(/India/);
  });

  it("lists findings that would separate the differentials, never ones already entered", async () => {
    const { body } = await diagnose(clinicalPresets[0].input);
    expect(body.discriminatingFindings.length).toBeGreaterThan(0);
    expect(body.discriminatingFindings.length).toBeLessThanOrEqual(6);
    const listed = new Set(body.topDifferentials.map((item) => item.diseaseTitle));
    for (const item of body.discriminatingFindings) {
      expect(item.supports.every((title) => listed.has(title))).toBe(true);
      expect(clinicalPresets[0].input.symptoms).not.toContain(item.finding);
    }
  });

  it("links conditions to Marifa calculators that exist", async () => {
    const known = new Set(clinicalCalculators.map((calculator) => calculator.id));
    for (const id of referencedCalculatorIds()) expect(known.has(id), id).toBe(true);
    const { body } = await diagnose(clinicalPresets[0].input);
    expect(body.topDifferentials[0].calculators.map((item) => item.id)).toContain("wells-pe");
    expect(body.topDifferentials[0].calculators[0].href).toMatch(/^\/dashboard\/medical-calculators\?calc=/);
  });

  it("serves a type-ahead vocabulary of recognised findings", async () => {
    const response = await GET();
    const { terms } = (await response.json()) as { terms: Array<{ term: string; kind: string }> };
    expect(terms.length).toBeGreaterThan(500);
    expect(terms.some((item) => item.term === "Raised D-dimer" && item.kind === "lab")).toBe(true);
  });

  it("suggests recognised terms while typing and adds the chosen one", () => {
    const onChange = vi.fn();
    render(createElement(FindingInput, { label: "Laboratory", hint: "Type", icon: Thermometer, examples: [], values: [], onChange, preferredKind: "lab", vocabulary: [{ term: "Raised D-dimer", kind: "lab" }, { term: "Raised troponin", kind: "lab" }, { term: "Rash", kind: "symptom" }] }));
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "rais d" } });
    const options = screen.getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["Raised D-dimer"]);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["Raised D-dimer"]);
  });

  it("compares two differentials side by side and builds a copyable summary", async () => {
    const { body } = await diagnose({ ...clinicalPresets[0].input, region: "SA" });
    const [first, second] = body.topDifferentials;
    render(createElement(ComparePanel, { pair: [first, second], discriminators: body.discriminatingFindings, onClose: () => undefined }));
    expect(screen.getByRole("table")).toHaveTextContent(first.diseaseTitle);
    expect(screen.getByRole("table")).toHaveTextContent(second.diseaseTitle);
    expect(screen.getByRole("rowheader", { name: "Would favour this" })).toBeInTheDocument();

    const text = summaryText({ ...clinicalPresets[0].input, region: "SA" }, body, "https://marifa.example");
    expect(text).toMatch(/^Marifa Diagnosis Engine/);
    expect(text).toContain(`1. ${first.diseaseTitle}`);
    expect(text).toContain(`https://marifa.example${first.marifaPathwayUrl}`);
    expect(text).toContain(body.clinicalSafetyNotice);
  });
});
