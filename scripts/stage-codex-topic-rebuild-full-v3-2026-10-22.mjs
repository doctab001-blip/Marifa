// Stages the 2026-10-22 full-v3 rebuilds of the ten topics written on 2026-10-21 (full-v2)
// as NEW non-current under_review rows. Never updates an existing row, never publishes,
// never marks anything clinically reviewed.
//
// Usage:
//   node scripts/stage-codex-topic-rebuild-full-v3-2026-10-22.mjs            # dry run (validates files, lists what would be staged)
//   node scripts/stage-codex-topic-rebuild-full-v3-2026-10-22.mjs --apply    # insert under_review rows
// Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY (never printed).
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const DATE = "2026-10-22";
const VERSION = "authoring-standard-2026-10-22-full-v3";
const DIR = path.resolve("data/emergency-versions");
const SLUGS = [
  "acute-pyelonephritis-in-pregnancy", "adult-upper-airway-emergency", "antimicrobial-allergy-penicillin-delabelling",
  "adhd-recognition-assessment-shared-care", "autism-early-recognition-referral", "bronchiolitis-infant-distress",
  "child-safeguarding-non-accidental-injury", "diabetic-foot-infection", "fournier-gangrene", "infective-endocarditis",
];

const topics = SLUGS.map((slug) => {
  const content = JSON.parse(fs.readFileSync(path.join(DIR, `${slug}.${VERSION}.json`), "utf8"));
  if (content.version !== VERSION || content.status !== "under_review" || content.clinicalReviewStatus !== "pending") {
    throw new Error(`${slug}: version/status/clinicalReviewStatus not as expected`);
  }
  return content;
});
console.log(`Validated ${topics.length} files for ${VERSION}.`);

if (!process.argv.includes("--apply")) {
  for (const t of topics) console.log(`DRY RUN would stage ${t.id}:${VERSION}  ${t.title}`);
  process.exit(0);
}

const endpoint = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!endpoint || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");
const db = createClient(endpoint, key, { auth: { persistSession: false } });

for (const content of topics) {
  const { data: existing, error: existingError } = await db.from("guideline_versions").select("id").eq("guideline_id", content.id).eq("version", VERSION);
  if (existingError) throw existingError;
  if (existing?.length) { console.log(`SKIP ${content.title}: ${VERSION} already exists`); continue; }
  const { data: source, error: sourceError } = await db.from("guideline_versions").select("jurisdiction,created_by").eq("guideline_id", content.id).order("created_at", { ascending: false }).limit(1).single();
  if (sourceError) throw sourceError;
  const primary = content.teaching.references[0];
  const { error } = await db.from("guideline_versions").insert({
    id: randomUUID(), guideline_id: content.id, version: VERSION, version_number: VERSION,
    status: "under_review", is_current: false, content,
    source_title: primary.title, issuing_organization: "Marifa evidence synthesis",
    source_url: primary.url, jurisdiction: source.jurisdiction ?? "Saudi Arabia",
    last_verified_date: DATE, review_date: DATE, created_by: source.created_by,
    approved_by: null, approved_at: null, published_at: null,
    change_summary: "Additive rebuild of the 21 Oct 2026 full-v2 version: full presentation, diagnostic criteria, six-step management, branched medicines with paediatric, penicillin-allergy, CKD and CLD lines, Saudi sources where available and side-by-side guideline comparisons. Historical versions preserved; clinical review pending.",
  });
  if (error) throw error;
  console.log(`STAGED ${content.id}:${VERSION}  ${content.title}`);
}
