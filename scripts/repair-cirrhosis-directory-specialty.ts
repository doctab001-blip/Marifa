import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { DiseaseDetailSchema } from "../lib/validations/disease";
import { auditTopicContent } from "../lib/clinical-authoring-audit";

const guidelineId = "6e42706e-3191-4243-a26e-715333dbc052";
const sourceVersion = "gemini-synthesis-verified-2026-10-19-v1";
const version = "gemini-synthesis-verified-2026-10-19-v2";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
const { data: source, error: sourceError } = await db.from("guideline_versions").select("content,jurisdiction,created_by").eq("guideline_id", guidelineId).eq("version", sourceVersion).single();
if (sourceError) throw sourceError;
const content = DiseaseDetailSchema.parse({ ...source.content, specialty: "Hepatology / Gastroenterology", version, status: "under_review", lastReviewed: "2026-10-19", clinicalReviewStatus: "pending", evidenceAudit: { ...source.content.evidenceAudit, checkedOn: "2026-10-19", findings: [...source.content.evidenceAudit.findings, "Corrected specialty metadata to match the catalogue; all clinical content is unchanged."], originalVersionIds: [guidelineId] } });
const audit = auditTopicContent(content);
console.log(JSON.stringify({ title: content.title, version, score: audit.score, publishable: audit.publishable, failures: audit.failures }, null, 2));
if (process.argv.includes("--apply")) {
  if (!audit.publishable) throw new Error("Refusing to stage non-publishable content.");
  const { data: existing, error: existingError } = await db.from("guideline_versions").select("id").eq("guideline_id", guidelineId).eq("version", version);
  if (existingError) throw existingError;
  if (existing?.length) throw new Error("Version already exists; refusing to overwrite it.");
  const { error } = await db.from("guideline_versions").insert({ id: randomUUID(), guideline_id: guidelineId, version, version_number: version, status: "under_review", is_current: false, content, source_title: "Cirrhosis in over 16s: assessment and management (NG50)", issuing_organization: "National Institute for Health and Care Excellence", source_url: "https://www.nice.org.uk/guidance/NG50/chapter/Recommendations", jurisdiction: source.jurisdiction, created_by: source.created_by, approved_by: null, approved_at: null, published_at: null, last_verified_date: "2026-10-19", review_date: "2026-10-19", change_summary: "Additive successor correcting only the catalogue-specialty mismatch; clinical content unchanged." });
  if (error) throw error;
  console.log("STAGED", version);
}
