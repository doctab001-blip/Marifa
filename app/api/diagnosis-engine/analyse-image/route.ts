import { getCurrentViewer } from "@/lib/supabase/session";
import { ImageAnalysisError, analyseStudy, imageAnalysisRequestSchema } from "@/lib/diagnosis-engine/image-analysis";
import { loadGlobalTopics } from "@/lib/diagnosis-engine/pathways";
import { buildVocabulary } from "@/lib/diagnosis-engine/vocabulary";
import type { ImageAnalysisRequest } from "@/types/diagnosisEngine";

export const maxDuration = 60;

const noStore = { "Cache-Control": "no-store" };
const fail = (status: number, error: string, issues?: string[]) => Response.json({ error, ...(issues ? { issues } : {}) }, { status, headers: noStore });

/**
 * POST /api/diagnosis-engine/analyse-image — AI read of an attached study for a signed-in clinician.
 * Images are processed in memory and passed to the model; nothing is stored, and the body is never logged.
 */
export async function POST(request: Request) {
  if (!(await getCurrentViewer())) return fail(401, "Sign in to use image reading.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Request body must be JSON.");
  }
  const parsed = imageAnalysisRequestSchema.safeParse(body);
  if (!parsed.success) return fail(400, "Invalid image reading request.", parsed.error.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`));

  const input = parsed.data as ImageAnalysisRequest;
  const kinds = input.kind === "imaging" ? ["imaging"] : ["lab"];
  const vocabulary = buildVocabulary(loadGlobalTopics()).filter((term) => kinds.includes(term.kind)).map((term) => term.term);
  try {
    const result = await analyseStudy(input, { vocabulary });
    return Response.json(result, { headers: noStore });
  } catch (error) {
    if (error instanceof ImageAnalysisError) return fail(error.status, error.message);
    console.error("[diagnosis-engine] image read failed");
    return fail(500, "Image reading is temporarily unavailable.");
  }
}
