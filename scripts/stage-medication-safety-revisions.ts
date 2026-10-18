/**
 * Validates (default) or inserts the generated medication-safety candidates.
 * This never updates a current row and never publishes or clinically approves a version.
 *
 * Usage: npx tsx scripts/stage-medication-safety-revisions.ts [--apply]
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { DiseaseDetailSchema } from "../lib/validations/disease";
import { medicationSafetyGaps, MEDICATION_SAFETY_VERSION } from "../lib/medication-safety-review";

const payloadPath = path.resolve("outputs/medication-safety-2026-10-15/payload.json");
if (!fs.existsSync(payloadPath)) throw new Error("No eligible payload exists. Run the preparation script and resolve every audit gap first.");
const payload = (JSON.parse(fs.readFileSync(payloadPath, "utf8")) as unknown[]).map((value) => DiseaseDetailSchema.parse(value));
if (payload.length !== 19) throw new Error(`Expected exactly 19 topics; received ${payload.length}.`);
const gaps = payload.flatMap(medicationSafetyGaps);
if (gaps.length) throw new Error(`Refusing to stage: ${gaps.length} medication-safety gaps remain.`);
if (new Set(payload.map((item) => item.id)).size !== payload.length) throw new Error("Duplicate guideline IDs in payload.");

const apply = process.argv.includes("--apply");
if (!apply) {
  console.log(`VALID: ${payload.length} additive ${MEDICATION_SAFETY_VERSION} candidates; rerun with --apply to insert non-current under-review rows.`);
  process.exit(0);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
const db = createClient(url, key, { auth: { persistSession: false } });

for (const content of payload) {
  if (content.status !== "under_review" || content.clinicalReviewStatus !== "pending" || content.version !== MEDICATION_SAFETY_VERSION) {
    throw new Error(`${content.title}: invalid governance state.`);
  }
  const { data: existing, error: existingError } = await db.from("guideline_versions").select("id").eq("guideline_id", content.id).eq("version", content.version);
  if (existingError) throw existingError;
  if (existing?.length) { console.log(`SKIP ${content.title}: version already exists`); continue; }
  const { data: rows, error: sourceError } = await db.from("guideline_versions").select("*").eq("guideline_id", content.id).eq("is_current", true).limit(1);
  if (sourceError) throw sourceError;
  const source = rows?.[0];
  if (!source) throw new Error(`${content.title}: current source version not found.`);
  const row = {
    guideline_id: content.id,
    version: content.version,
    version_number: content.version,
    status: "under_review",
    is_current: false,
    content,
    source_title: source.source_title,
    issuing_organization: source.issuing_organization,
    source_url: source.source_url,
    jurisdiction: source.jurisdiction,
    last_verified_date: "2026-10-15",
    review_date: source.review_date,
    created_by: source.created_by,
    approved_by: null,
    approved_at: null,
    published_at: null,
    change_summary: "Medication-safety correction staged 15 Oct 2026. Current/published content and all history preserved. Clinical review pending; no approval or publication asserted.",
  };
  const { error } = await db.from("guideline_versions").insert(row);
  if (error) throw error;
  console.log(`STAGED ${content.title}: ${content.version} (under_review, non-current, pending)`);
}
