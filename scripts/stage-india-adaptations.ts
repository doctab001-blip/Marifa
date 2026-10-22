/**
 * Writes India adaptations into EXISTING India placeholder topics (Marifa India catalogue) as new
 * non-current under_review versions. Refuses any topic whose current version is not still the empty
 * "Content not yet authored" placeholder, so real content from another author is never overwritten.
 * Never touches Saudi topics, never publishes and never asserts clinical approval.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/stage-india-adaptations.ts <payload.json>           # dry run
 *   npx tsx --env-file=.env.local scripts/stage-india-adaptations.ts <payload.json> --apply   # insert
 * Then publish with scripts/publish-if-eligible.ts using the printed <guideline_id>:<version> pairs.
 */
import fs from "node:fs";
import { DiseaseDetailSchema, type DiseaseDetail } from "../lib/validations/disease";
import { auditTopicContent } from "../lib/clinical-authoring-audit";

const [payloadPath, ...flags] = process.argv.slice(2);
if (!payloadPath) throw new Error("Usage: tsx scripts/stage-india-adaptations.ts <payload.json> [--apply]");
const apply = flags.includes("--apply");
const payload = (JSON.parse(fs.readFileSync(payloadPath, "utf8")) as unknown[]).map((item) => DiseaseDetailSchema.parse(item));

const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`;
const key = process.env.SUPABASE_SECRET_KEY;
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
async function rest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(base + path, { method, headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) throw new Error(`${method} ${path.split("?")[0]} -> ${response.status} ${(await response.text()).slice(0, 300)}`);
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

const PLACEHOLDER = /Content not yet authored/i;
type Guideline = { id: string; title: string; specialty: string | null; status: string };
type Version = Record<string, unknown> & { id: string; version: string; status: string; is_current: boolean; content: DiseaseDetail };
const toPublish: string[] = [];
const refused: string[] = [];

for (const content of payload as DiseaseDetail[]) {
  const label = `${content.title} [${content.id}]`;
  if (content.status !== "under_review" || content.clinicalReviewStatus !== "pending") { refused.push(`${label}: content must be under_review with clinicalReviewStatus pending`); continue; }
  const audit = auditTopicContent(content);
  if (!audit.publishable) { refused.push(`${label}: audit ${audit.score}% — ${audit.failures.slice(0, 2).join(" | ")}`); continue; }

  const [guideline] = await rest<Guideline[]>("GET", `clinical_guidelines?select=id,title,specialty,status&id=eq.${content.id}`);
  if (!guideline) { refused.push(`${label}: placeholder topic not found in clinical_guidelines`); continue; }
  if (guideline.title !== content.title || guideline.specialty !== content.specialty) { refused.push(`${label}: catalogue title/specialty differ ("${guideline.title}" / "${guideline.specialty}")`); continue; }

  const versions = await rest<Version[]>("GET", `guideline_versions?select=*&guideline_id=eq.${content.id}`);
  if (versions.some((row) => row.version === content.version)) { console.log(`SKIP ${label}: ${content.version} already exists`); toPublish.push(`${content.id}:${content.version}`); continue; }
  if (versions.some((row) => row.status === "published" || row.status === "approved")) { refused.push(`${label}: topic already has a published/approved version — not a placeholder`); continue; }
  const real = versions.filter((row) => !PLACEHOLDER.test(JSON.stringify(row.content?.pathophysiology ?? "")));
  if (real.length) { refused.push(`${label}: contains authored version(s) ${real.map((row) => row.version).join(", ")} — refusing to overwrite another author's work`); continue; }
  const source = versions.find((row) => row.is_current) ?? versions[0];

  toPublish.push(`${content.id}:${content.version}`);
  if (!apply) { console.log(`VALID ${label}: audit ${audit.score}%, will add ${content.version} on top of placeholder ${source?.version ?? "(none)"}`); continue; }
  const reference = content.teaching?.references?.[0];
  await rest("POST", "guideline_versions", {
    guideline_id: content.id, version: content.version, version_number: content.version, status: "under_review", is_current: false, content,
    source_title: reference?.title ?? source?.source_title ?? null, source_url: reference?.url ?? source?.source_url ?? null,
    issuing_organization: content.authority === "ICMR" ? "Indian Council of Medical Research" : "Ministry of Health and Family Welfare, Government of India",
    jurisdiction: "India", last_verified_date: content.lastReviewed, review_date: content.lastReviewed,
    created_by: source?.created_by ?? null, approved_by: null, approved_at: null, published_at: null,
    change_summary: `India adaptation written into the India placeholder (${content.version}). Saudi topics untouched. Clinical review pending; no approval or publication asserted.`,
  });
  console.log(`STAGED ${label}: ${content.version} (under_review, non-current, pending)`);
}
if (refused.length) console.log(`NOT STAGED (${refused.length}):\n  ${refused.join("\n  ")}`);
console.log(`${apply ? "Done" : "DRY RUN"}: ${toPublish.length} ready. Publish with:\n  npx tsx --env-file=.env.local scripts/publish-if-eligible.ts ${toPublish.join(" ")}`);
