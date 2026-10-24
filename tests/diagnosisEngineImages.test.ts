import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ImageAnalysisRequest } from "@/types/diagnosisEngine";
import { buildDicom } from "./helpers/dicom-fixture";

const viewer = vi.hoisted(() => ({ current: { id: "demo" } as unknown }));
vi.mock("@/lib/supabase/session", () => ({ getCurrentViewer: async () => viewer.current }));
vi.mock("@/lib/diagnosis-engine/pathways", async () => {
  const engine = await vi.importActual<typeof import("@/lib/diagnosis-engine/engine")>("@/lib/diagnosis-engine/engine");
  return { createLivePathwayResolver: async () => engine.catalogueResolver, loadGlobalTopics: () => [] };
});

import { DicomError, readDicom } from "@/lib/diagnosis-engine/dicom";
import { ImageAnalysisError, analyseStudy, toSuggestedFindings } from "@/lib/diagnosis-engine/image-analysis";
import { runDiagnosisEngine } from "@/lib/diagnosis-engine/engine";
import { POST } from "@/app/api/diagnosis-engine/analyse-image/route";
import { StudyAttachments } from "@/components/diagnosis-engine/study-attachments";

const PIXEL = "A".repeat(400);
const request = (overrides: Partial<ImageAnalysisRequest> = {}): ImageAnalysisRequest => ({
  kind: "imaging",
  declaredType: "chest-xray",
  images: [{ mediaType: "image/jpeg", data: PIXEL }],
  clinicalContext: ["Productive cough", "Fever"],
  identifiersConfirmedAbsent: true,
  ...overrides,
});

const modelReply = (input: unknown) => new Response(JSON.stringify({ content: [{ type: "tool_use", name: "report_study_read", input }] }), { status: 200, headers: { "content-type": "application/json" } });
const chestRead = {
  studyDescription: "PA chest radiograph",
  adequacy: "adequate",
  findings: [
    { finding: "Consolidation", location: "right lower zone", confidence: "high", significance: "abnormal" },
    { finding: "Small pleural effusion", location: "right", confidence: "low", significance: "abnormal" },
    { finding: "Normal heart size", confidence: "high", significance: "normal" },
  ],
  impression: "Right lower zone consolidation, in keeping with infection in this context.",
  urgentAlerts: [],
  limitations: ["Single projection"],
  identifiersVisible: false,
};

describe("DICOM reader", () => {
  it("renders 16-bit greyscale with the stored window and reads only non-identifying tags", () => {
    const image = readDicom(buildDicom({ width: 2, height: 2, pixels: [0, 1000, 2000, 4000], windowCenter: 2000, windowWidth: 4000, modality: "CR", bodyPart: "CHEST" }));
    expect([image.width, image.height, image.modality, image.bodyPart, image.frames]).toEqual([2, 2, "CR", "CHEST", 1]);
    expect(Array.from(image.rgba.filter((_, index) => index % 4 === 0))).toEqual([0, 64, 128, 255]);
    expect(JSON.stringify(image)).not.toContain("PATIENT");
  });

  it("inverts MONOCHROME1 and skips undefined-length sequences in implicit VR files", () => {
    const image = readDicom(buildDicom({ width: 2, height: 1, pixels: [0, 4000], explicit: false, photometric: "MONOCHROME1", withSequence: true }));
    expect(Array.from(image.rgba.filter((_, index) => index % 4 === 0))).toEqual([255, 0]);
  });

  it("asks for a JPEG/PNG export when the study is compressed", () => {
    expect(() => readDicom(buildDicom({ width: 1, height: 1, pixels: [1], transferSyntax: "1.2.840.10008.1.2.4.70" }))).toThrow(DicomError);
  });
});

describe("AI study read", () => {
  it("sends the images with a forced structured tool call and turns the read into suggested findings", async () => {
    const fetcher = vi.fn(async () => modelReply(chestRead));
    const result = await analyseStudy(request(), { vocabulary: ["Consolidation", "Widened mediastinum"], fetcher, apiKey: "test-key", model: "test-model" });
    const [, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    const sent = JSON.parse(String(init.body));
    expect(sent.tool_choice).toEqual({ type: "tool", name: "report_study_read" });
    expect(sent.messages[0].content.some((block: { type: string }) => block.type === "image")).toBe(true);
    expect(sent.system).toContain("Consolidation");
    expect(sent.system).toContain("Productive cough");
    expect(result.findings.map((item) => [item.text, item.suggested])).toEqual([
      ["Consolidation (right lower zone)", true],
      ["Small pleural effusion (right)", false],
      ["Normal heart size", true],
    ]);
    expect(result.notice).toMatch(/not a radiology/);
  });

  it("turns lab report values into findings the engine reads", () => {
    const findings = toSuggestedFindings({ ...chestRead, findings: [], values: [{ name: "K", value: 6.9, unit: "mmol/L", flag: "critical", finding: "Hyperkalaemia" }, { name: "Na", value: 139, unit: "mmol/L", flag: "normal" }] } as never);
    expect(findings.map((item) => [item.text, item.suggested])).toEqual([["K 6.9 mmol/L", true], ["Hyperkalaemia", true], ["Na 139 mmol/L", false]]);
    const engine = runDiagnosisEngine({ symptoms: ["Palpitations", "Muscle weakness"], examFindings: [], labInvestigations: ["K 6.9 mmol/L"], imagingFindings: [] });
    expect(engine.inputInterpretation[0].interpretedAs).toContain("hyperkalaemia");
  });

  it("matches an accepted imaging finding in the engine", () => {
    const engine = runDiagnosisEngine({ symptoms: ["Productive cough", "Fever"], examFindings: ["Focal crackles"], labInvestigations: [], imagingFindings: ["Consolidation (right lower zone)"] });
    expect(engine.topDifferentials[0].diseaseTitle).toBe("Community-Acquired Pneumonia");
  });

  it("fails safely without a key or with an invalid reply", async () => {
    await expect(analyseStudy(request(), { vocabulary: [], apiKey: "" })).rejects.toMatchObject({ status: 503 });
    const fetcher = vi.fn(async () => modelReply({ studyDescription: "x" }));
    await expect(analyseStudy(request(), { vocabulary: [], fetcher, apiKey: "k" })).rejects.toBeInstanceOf(ImageAnalysisError);
  });
});

describe("POST /api/diagnosis-engine/analyse-image", () => {
  const call = (body: unknown) => POST(new Request("http://localhost/api/diagnosis-engine/analyse-image", { method: "POST", body: JSON.stringify(body) }));
  beforeEach(() => { viewer.current = { id: "demo" }; });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it("requires a signed-in user", async () => {
    viewer.current = null;
    expect((await call(request())).status).toBe(401);
  });

  it("requires confirmation that no identifiers are visible, and a supported file", async () => {
    expect((await call({ ...request(), identifiersConfirmedAbsent: false })).status).toBe(400);
    expect((await call({ ...request(), images: [] })).status).toBe(400);
    expect((await call({ ...request(), pdf: { data: PIXEL } })).status).toBe(400);
  });

  it("returns the read and never caches it", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async () => modelReply(chestRead)));
    const response = await call(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await response.json()).findings[0].text).toBe("Consolidation (right lower zone)");
  });
});

describe("Study attachment panel", () => {
  it("opens from the finding box and requires the identifier confirmation before reading", () => {
    render(createElement(StudyAttachments, { kind: "imaging", clinicalContext: [], onAccept: () => undefined }));
    fireEvent.click(screen.getByRole("button", { name: /Attach scan for AI read/ }));
    expect(screen.getByText(/de-identified or teaching images only/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Read scan/ })).toBeNull();
  });
});
