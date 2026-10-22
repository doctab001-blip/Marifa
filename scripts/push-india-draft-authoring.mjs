// Writes authored India draft topics as NEW guideline_versions rows (status under_review, is_current false).
// Never edits or replaces an existing version. Usage:
//   node scripts/push-india-draft-authoring.mjs data/india-versions/batch10-vector-zoonotic.india-2026-10-22.json [more files]
// Add --dry-run to check without writing.
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";

loadEnvFile(".env.local");
const dryRun = process.argv.includes("--dry-run");
const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!files.length) throw new Error("Pass one or more data/india-versions/*.json files.");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const today = new Date().toISOString().slice(0, 10);
let written = 0, skipped = 0;
const canon = (v) => Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v;

for (const file of files) {
  for (const content of JSON.parse(readFileSync(file, "utf8"))) {
    const { id: guidelineId, version, title } = content;
    if (content.status !== "under_review" || content.clinicalReviewStatus !== "pending") throw new Error(`${title}: must be under_review and pending`);
    const { data: same, error: sameError } = await db.from("guideline_versions").select("id").eq("guideline_id", guidelineId).eq("version", version);
    if (sameError) throw sameError;
    if (same.length) { console.log(`SKIP (version exists) ${title}`); skipped++; continue; }
    const { data: base, error: baseError } = await db.from("guideline_versions").select("jurisdiction,created_by").eq("guideline_id", guidelineId).order("created_at", { ascending: false }).limit(1).single();
    if (baseError) throw new Error(`${title}: no existing draft row for guideline ${guidelineId} (${baseError.message})`);
    const first = content.teaching?.references?.[0];
    const row = {
      id: randomUUID(), guideline_id: guidelineId, version, version_number: version, status: "under_review", is_current: false, content,
      source_title: first?.title ?? title, issuing_organization: content.authority, source_url: first?.url ?? null,
      jurisdiction: base.jurisdiction, created_by: base.created_by, approved_by: null, approved_at: null, published_at: null,
      last_verified_date: content.lastReviewed ?? today, review_date: content.lastReviewed ?? today,
      change_summary: "Full India topic authored from opened Indian (and labelled international) sources onto the existing draft outline. Additive version; earlier versions unchanged. Pending clinical review.",
    };
    if (dryRun) { console.log(`DRY-RUN would insert ${title}`); continue; }
    const { error } = await db.from("guideline_versions").insert(row);
    if (error) throw new Error(`${title}: ${error.message}`);
    const { data: back, error: backError } = await db.from("guideline_versions").select("content").eq("id", row.id).single();
    if (backError || JSON.stringify(canon(back.content)) !== JSON.stringify(canon(content))) console.log(`WARN read-back differs for ${title}`);
    console.log(`INSERTED ${title} -> ${row.id}`); written++;
  }
}
console.log(`Done: ${written} inserted, ${skipped} skipped.`);
