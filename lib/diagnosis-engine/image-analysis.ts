/**
 * AI read of an attached investigation or imaging study (Claude vision via the Anthropic Messages API).
 *
 * The model returns structured findings through a forced tool call; the reply is validated and turned into
 * suggested findings phrased in the engine's vocabulary. Nothing is stored or logged. The read is decision
 * support for a clinician, not a radiology report and not a regulated medical device.
 */
import { z } from "zod";
import type { DeclaredStudyType, FindingConfidence, ImageAnalysisRequest, ImageAnalysisResponse, SuggestedFinding } from "@/types/diagnosisEngine";

export const IMAGE_READ_NOTICE =
  "AI-assisted read for decision support — not a radiology or laboratory report and not a regulated diagnostic device. A clinician must review the original images; formal reporting by a radiologist remains required. Only de-identified or teaching images may be used on this platform.";

export const DEFAULT_VISION_MODEL = "claude-opus-5-5";
const MAX_IMAGES = 4;
const MAX_IMAGE_BASE64 = 1_500_000; // ≈1.1 MB per image after client downscaling
const MAX_PDF_BASE64 = 3_000_000; // ≈2.2 MB
const TIMEOUT_MS = 55_000;

const DECLARED: Record<DeclaredStudyType, string> = {
  "chest-xray": "chest X-ray",
  "xray-other": "plain X-ray (non-chest)",
  "ct-head": "CT head",
  "ct-chest": "CT chest / CTPA",
  "ct-abdomen": "CT abdomen and pelvis",
  "ct-other": "CT (other region)",
  mri: "MRI",
  ultrasound: "ultrasound",
  ecg: "12-lead ECG",
  "lab-report": "laboratory report",
  other: "other study",
};

export const imageAnalysisRequestSchema = z.object({
  kind: z.enum(["imaging", "investigation"]),
  declaredType: z.enum(["chest-xray", "xray-other", "ct-head", "ct-chest", "ct-abdomen", "ct-other", "mri", "ultrasound", "ecg", "lab-report", "other"]),
  images: z
    .array(z.object({ mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]), data: z.string().min(100).max(MAX_IMAGE_BASE64).regex(/^[A-Za-z0-9+/=]+$/), label: z.string().max(60).optional() }))
    .max(MAX_IMAGES)
    .default([]),
  pdf: z.object({ data: z.string().min(100).max(MAX_PDF_BASE64).regex(/^[A-Za-z0-9+/=]+$/) }).optional(),
  clinicalContext: z.array(z.string().max(160)).max(40).optional(),
  age: z.number().int().min(0).max(120).optional(),
  identifiersConfirmedAbsent: z.literal(true),
}).refine((value) => value.images.length > 0 || value.pdf, "Attach at least one image or a PDF report.")
  .refine((value) => !value.pdf || value.kind === "investigation", "PDF reports can be attached to investigations only.")
  .refine((value) => value.images.reduce((sum, image) => sum + image.data.length, 0) + (value.pdf?.data.length ?? 0) <= 4_000_000, "Attachments are too large; remove an image.");

// What the model must return (validated before use).
const modelOutputSchema = z.object({
  studyDescription: z.string().min(1).max(200),
  adequacy: z.enum(["adequate", "limited", "non_diagnostic"]),
  adequacyNote: z.string().max(300).optional(),
  findings: z.array(z.object({
    finding: z.string().min(1).max(120),
    location: z.string().max(80).optional(),
    confidence: z.enum(["low", "moderate", "high"]),
    significance: z.enum(["critical", "abnormal", "normal"]),
  })).max(15),
  values: z.array(z.object({
    name: z.string().min(1).max(40),
    value: z.number().nullable(),
    unit: z.string().max(20).optional(),
    flag: z.enum(["critical", "high", "low", "normal"]).nullable().optional(),
    finding: z.string().max(120).optional(),
  })).max(40).default([]),
  impression: z.string().min(1).max(600),
  urgentAlerts: z.array(z.string().max(200)).max(6).default([]),
  limitations: z.array(z.string().max(200)).max(6).default([]),
  identifiersVisible: z.boolean(),
});
type ModelOutput = z.infer<typeof modelOutputSchema>;

const REPORT_TOOL = {
  name: "report_study_read",
  description: "Return the structured read of the attached study.",
  input_schema: {
    type: "object",
    required: ["studyDescription", "adequacy", "findings", "impression", "identifiersVisible"],
    properties: {
      studyDescription: { type: "string", description: "What the study actually is (modality, region, view/phase), e.g. 'PA chest radiograph'. If it is not a medical study, say so." },
      adequacy: { type: "string", enum: ["adequate", "limited", "non_diagnostic"] },
      adequacyNote: { type: "string", description: "Rotation, inspiration, artefact, cropping, single slice of a volume, photo of a screen, etc." },
      findings: {
        type: "array",
        description: "Each distinct observation, most important first. Include pertinent normals when they answer the clinical question.",
        items: {
          type: "object",
          required: ["finding", "confidence", "significance"],
          properties: {
            finding: { type: "string", description: "Short standard term, preferring the reference vocabulary, e.g. 'Consolidation', 'Widened mediastinum', 'Normal chest X-ray', 'ST elevation'." },
            location: { type: "string", description: "Side/lobe/segment/lead, e.g. 'right lower zone', 'leads II, III, aVF'." },
            confidence: { type: "string", enum: ["low", "moderate", "high"] },
            significance: { type: "string", enum: ["critical", "abnormal", "normal"] },
          },
        },
      },
      values: {
        type: "array",
        description: "For laboratory reports or ECG measurements: each result read from the document.",
        items: {
          type: "object",
          required: ["name", "value"],
          properties: {
            name: { type: "string", description: "Short analyte name as commonly written: 'K', 'Na', 'Hb', 'WBC', 'Platelets', 'CRP', 'Lactate', 'pH', 'HCO3', 'Glucose', 'Troponin', 'D-dimer', 'Creatinine', 'QTc', 'HR'." },
            value: { type: ["number", "null"] },
            unit: { type: "string" },
            flag: { type: ["string", "null"], enum: ["critical", "high", "low", "normal", null] },
            finding: { type: "string", description: "For abnormal results, the clinical term, e.g. 'Raised troponin', 'Hyperkalaemia'." },
          },
        },
      },
      impression: { type: "string", description: "One to three sentences. Describe; do not give a definitive diagnosis." },
      urgentAlerts: { type: "array", items: { type: "string" }, description: "Time-critical findings (e.g. tension pneumothorax, free air, intracranial haemorrhage, STEMI pattern)." },
      limitations: { type: "array", items: { type: "string" } },
      identifiersVisible: { type: "boolean", description: "True if any name, MRN/ID number, date of birth, face or other patient identifier is visible." },
    },
  },
} as const;

function systemPrompt(request: ImageAnalysisRequest, vocabulary: string[]) {
  return [
    "You assist clinicians by reading attached medical studies for a decision-support tool. Your read is reviewed by a clinician and is never a final report.",
    "Rules:",
    "- Report only what is visible. Never invent findings, measurements or values. If unsure, lower the confidence or say it in limitations.",
    "- If the image is not a medical study, is unreadable, or is a single slice/photo that cannot answer the question, set adequacy accordingly and explain.",
    "- A CT or MRI attachment is usually a few key slices, not the full volume: state that significant findings may be missed.",
    "- Phrase findings with these reference terms when they fit (the decision engine matches on them): " + vocabulary.slice(0, 220).join("; ") + ".",
    "- For laboratory reports, extract every result with its value, unit and flag as printed; do not interpret beyond the printed reference ranges.",
    "- For ECGs, give rate, rhythm, axis if clear, intervals if measurable, and any ST/T changes with leads.",
    "- Do not repeat any patient name, ID number or date of birth even if visible; only set identifiersVisible.",
    `Clinician says this is: ${DECLARED[request.declaredType]}.` + (request.age !== undefined ? ` Patient age: ${request.age}.` : ""),
    request.clinicalContext?.length ? `Clinical findings already entered: ${request.clinicalContext.join("; ")}.` : "No other clinical findings were entered.",
    "Return the read only by calling report_study_read.",
  ].join("\n");
}

const CONFIDENCE_RANK: Record<FindingConfidence, number> = { low: 0, moderate: 1, high: 2 };

/** Converts the model's read into findings the clinician can accept into the engine's input. */
export function toSuggestedFindings(output: ModelOutput): SuggestedFinding[] {
  const suggestions: SuggestedFinding[] = [];
  const seen = new Set<string>();
  const push = (item: SuggestedFinding) => {
    const key = item.text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    suggestions.push(item);
  };
  for (const item of output.findings) {
    const text = item.location ? `${item.finding} (${item.location})` : item.finding;
    push({
      text,
      confidence: item.confidence,
      significance: item.significance,
      location: item.location,
      suggested: item.significance !== "normal" ? CONFIDENCE_RANK[item.confidence] >= 1 : CONFIDENCE_RANK[item.confidence] === 2,
    });
  }
  for (const value of output.values) {
    if (value.value === null) continue;
    const abnormal = value.flag && value.flag !== "normal";
    // "K 6.9 mmol/L" is read by the engine's value interpreter; an abnormal flag also adds the clinical term.
    push({ text: `${value.name} ${value.value}${value.unit ? ` ${value.unit}` : ""}`, confidence: "high", significance: value.flag === "critical" ? "critical" : abnormal ? "abnormal" : "normal", suggested: Boolean(abnormal) });
    if (abnormal && value.finding) push({ text: value.finding, confidence: "high", significance: value.flag === "critical" ? "critical" : "abnormal", suggested: true });
  }
  return suggestions;
}

export class ImageAnalysisError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ImageAnalysisError";
  }
}

type Fetcher = typeof fetch;

/** Turns an Anthropic API error into a message an administrator can act on (no request content is included). */
export async function providerError(response: Response, model: string): Promise<ImageAnalysisError> {
  let type = "";
  let message = "";
  try {
    const body = (await response.json()) as { error?: { type?: string; message?: string } };
    type = body.error?.type ?? "";
    message = body.error?.message ?? "";
  } catch {
    /* non-JSON error body */
  }
  if (/credit balance|billing|purchase credits/i.test(message)) {
    return new ImageAnalysisError(402, "Image reading is paused: the Anthropic API account has no credit. Add credit under Billing at console.anthropic.com, or use the on-device chest X-ray read.");
  }
  if (response.status === 401 || type === "authentication_error") return new ImageAnalysisError(503, "The ANTHROPIC_API_KEY on this deployment is not valid. Replace it in the Vercel project settings.");
  if (response.status === 403 || type === "permission_error") return new ImageAnalysisError(503, "This API key is not allowed to use image reading. Check the key's permissions in the Anthropic console.");
  if (response.status === 404 || type === "not_found_error") return new ImageAnalysisError(503, `The vision model "${model}" is not available to this API key. Set DIAGNOSIS_VISION_MODEL to a model the account can use.`);
  if (response.status === 413 || type === "request_too_large") return new ImageAnalysisError(413, "The attachments are too large for the image reading service. Remove an image.");
  if (response.status === 429 || response.status === 529 || type === "rate_limit_error" || type === "overloaded_error") return new ImageAnalysisError(429, "The image reading service is busy. Try again in a minute.");
  if (response.status === 400) return new ImageAnalysisError(400, `The image reading service could not use these files${message ? `: ${message.slice(0, 160)}` : "."}`);
  return new ImageAnalysisError(502, `The image reading service returned an error (${response.status}).`);
}

export async function analyseStudy(request: ImageAnalysisRequest, options: { vocabulary: string[]; fetcher?: Fetcher; apiKey?: string; model?: string }): Promise<ImageAnalysisResponse> {
  const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new ImageAnalysisError(503, "Image reading is not configured on this deployment (ANTHROPIC_API_KEY is not set).");
  const model = options.model ?? process.env.DIAGNOSIS_VISION_MODEL ?? DEFAULT_VISION_MODEL;
  const content: unknown[] = [];
  request.images.forEach((image, index) => {
    if (request.images.length > 1) content.push({ type: "text", text: `Image ${index + 1}${image.label ? ` — ${image.label}` : ""}:` });
    content.push({ type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data } });
  });
  if (request.pdf) content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: request.pdf.data } });
  content.push({ type: "text", text: "Read this study and call report_study_read." });

  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        system: systemPrompt(request, options.vocabulary),
        tools: [REPORT_TOOL],
        tool_choice: { type: "tool", name: REPORT_TOOL.name },
        messages: [{ role: "user", content }],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ImageAnalysisError(504, "The image reading service did not respond in time. Try again, or attach fewer or smaller images.");
  }
  if (!response.ok) throw await providerError(response, model);
  const body = (await response.json()) as { content?: Array<{ type: string; name?: string; input?: unknown }> };
  const call = body.content?.find((block) => block.type === "tool_use" && block.name === REPORT_TOOL.name);
  const parsed = modelOutputSchema.safeParse(call?.input);
  if (!parsed.success) throw new ImageAnalysisError(502, "The image read could not be validated. Try again.");
  const output = parsed.data;
  return {
    studyDescription: output.studyDescription,
    adequacy: output.adequacy,
    adequacyNote: output.adequacyNote,
    impression: output.impression,
    urgentAlerts: output.urgentAlerts,
    findings: toSuggestedFindings(output),
    limitations: output.limitations,
    identifiersVisible: output.identifiersVisible,
    model,
    notice: IMAGE_READ_NOTICE,
    source: "cloud",
  };
}
