import { z } from "zod";
import type { DiagnosticEngineError, DiagnosticInputState } from "@/types/diagnosisEngine";
import { DiagnosisEngineError, runDiagnosisEngine } from "@/lib/diagnosis-engine/engine";
import { createLivePathwayResolver, loadGlobalTopics } from "@/lib/diagnosis-engine/pathways";
import { buildVocabulary } from "@/lib/diagnosis-engine/vocabulary";

const finding = z.string().trim().min(1).max(160);
const findings = z.array(finding).max(30).default([]);

const requestSchema = z.object({
  age: z.number().int().min(0).max(120).optional(),
  gender: z.enum(["male", "female", "all"]).optional(),
  region: z.enum(["SA", "IN"]).optional(),
  symptoms: findings,
  examFindings: findings,
  labInvestigations: findings,
  imagingFindings: findings,
});

const noStore = { "Cache-Control": "no-store" };

function errorResponse(body: DiagnosticEngineError, status: number) {
  return Response.json(body, { status, headers: noStore });
}

/**
 * POST /api/diagnosis-engine — ranks 3–4 differentials from the four clinical input vectors.
 * Inputs are processed in memory only: nothing is stored or logged.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse({ error: "Request body must be JSON.", code: "invalid_input" }, 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse({ error: "Invalid diagnosis request.", code: "invalid_input", issues: parsed.error.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`) }, 400);
  }

  const input: DiagnosticInputState = parsed.data;
  try {
    const resolvePathway = await createLivePathwayResolver();
    const result = runDiagnosisEngine(input, { globalTopics: loadGlobalTopics(), resolvePathway });
    return Response.json(result, { headers: noStore });
  } catch (error) {
    if (error instanceof DiagnosisEngineError) {
      return errorResponse({ error: error.message, code: error.code }, error.code === "no_findings" ? 400 : 422);
    }
    console.error("[diagnosis-engine] request failed");
    return Response.json({ error: "The diagnosis engine is temporarily unavailable." }, { status: 500, headers: noStore });
  }
}

/** GET /api/diagnosis-engine — the finding vocabulary used for type-ahead suggestions (reference data, no patient data). */
export async function GET() {
  return Response.json({ terms: buildVocabulary(loadGlobalTopics()) }, { headers: { "Cache-Control": "public, max-age=3600" } });
}
