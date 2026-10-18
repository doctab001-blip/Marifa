/**
 * Publish an under_review topic version automatically when it passes the authoring threshold.
 *
 * Usage: npx tsx scripts/publish-if-eligible.ts <guideline_id>:<version> [...]
 * Env:   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY (never printed), optional MARIFA_PUBLISHER_ID.
 *
 * For each version that scores >= 80 AND has a valid medicine pathway (lib/medication-pathway.ts) on lib/clinical-authoring-audit.ts this inserts a NEW
 * `<version>-live` row (status published, is_current true), un-flags the previous current row and
 * sets the guideline status to published. Nothing is edited in place and history is kept.
 * clinicalReviewStatus stays "pending", so the page keeps its unreviewed notice; approved_by records
 * publication authorisation only (standing authorisation given by the platform owner, 12 Oct 2026),
 * not clinical approval. Versions below the threshold are left as under_review drafts.
 */
import { CLINICAL_DIRECTORY_MINIMUM_SCORE, auditTopicContent } from "../lib/clinical-authoring-audit";

const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`;
const key = process.env.SUPABASE_SECRET_KEY;
// Platform owner (Tabassum Akhtar). Override with MARIFA_PUBLISHER_ID for another authorised publisher.
const publisher = process.env.MARIFA_PUBLISHER_ID ?? "310a1d7b-646d-4adb-b822-8d79453237cf";
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");
const targets = process.argv.slice(2);
if (!targets.length) throw new Error("Usage: tsx scripts/publish-if-eligible.ts <guideline_id>:<version> [...]");

async function rest<T>(method: string, path: string, body?: unknown, returnRows = false): Promise<T> {
  const response = await fetch(base + path, {
    method,
    headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(returnRows ? { Prefer: "return=representation" } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${method} ${path.split("?")[0]} -> ${response.status} ${(await response.text()).slice(0, 300)}`);
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

type VersionRow = Record<string, unknown> & { id: string; version: string; status: string; content: Record<string, unknown> };
const copied = ["guideline_id", "source_title", "issuing_organization", "source_url", "jurisdiction", "last_verified_date", "review_date"] as const;

for (const target of targets) {
  const [guidelineId, version] = target.split(":");
  const rows = await rest<VersionRow[]>("GET", `guideline_versions?select=*&guideline_id=eq.${guidelineId}&version=eq.${encodeURIComponent(version)}`);
  if (rows.length !== 1) { console.log(`SKIP ${target}: version not found`); continue; }
  const source = rows[0];
  if (source.status !== "under_review") { console.log(`SKIP ${target}: status is ${source.status}, expected under_review`); continue; }
  const audit = auditTopicContent(source.content);
  if (!audit.publishable) {
    const reason = audit.score < CLINICAL_DIRECTORY_MINIMUM_SCORE ? `score ${audit.score}% (< ${CLINICAL_DIRECTORY_MINIMUM_SCORE}%)` : `score ${audit.score}% but the medicine plan is not a valid pathway`;
    console.log(`DRAFT ${target}: ${reason} — left under review. First failures: ${audit.failures.slice(0, 3).join(" | ")}`);
    continue;
  }
  const liveVersion = `${version}-live`;
  if ((await rest<unknown[]>("GET", `guideline_versions?select=id&guideline_id=eq.${guidelineId}&version=eq.${encodeURIComponent(liveVersion)}`)).length) {
    console.log(`SKIP ${target}: ${liveVersion} already exists`);
    continue;
  }
  const now = new Date().toISOString();
  const content: Record<string, unknown> = { ...source.content, status: "published", version: liveVersion, clinicalReviewStatus: "pending" };
  const row: Record<string, unknown> = Object.fromEntries(copied.map((field) => [field, source[field]]));
  Object.assign(row, {
    version: liveVersion, version_number: liveVersion, status: "published", is_current: false, content, published_at: now,
    approved_by: publisher, approved_at: now, created_by: publisher,
    change_summary: `Published automatically from ${version}: authoring-standard score ${audit.score}% (threshold ${CLINICAL_DIRECTORY_MINIMUM_SCORE}%), under the platform owner's standing authorisation (12 Oct 2026). approved_by records publication authorisation only. Clinical review PENDING; unreviewed notice retained. Previous versions preserved.`,
  });
  const [inserted] = await rest<Array<{ id: string }>>("POST", "guideline_versions", row, true);
  const current = await rest<Array<{ id: string; version: string }>>("GET", `guideline_versions?select=id,version&guideline_id=eq.${guidelineId}&is_current=eq.true`);
  for (const previous of current) await rest("PATCH", `guideline_versions?id=eq.${previous.id}`, { is_current: false });
  await rest("PATCH", `guideline_versions?id=eq.${inserted.id}`, { is_current: true });
  const [guideline] = await rest<Array<{ status: string; title: string; specialty: string }>>("GET", `clinical_guidelines?select=status,title,specialty&id=eq.${guidelineId}`);
  if (guideline.status !== "published") await rest("PATCH", `clinical_guidelines?id=eq.${guidelineId}`, { status: "published" });
  if (guideline.title !== content.title || guideline.specialty !== content.specialty) console.log(`WARN ${target}: catalogue title/specialty differ from content — the directory will reject it until they match`);
  console.log(`LIVE ${target} -> ${liveVersion} (score ${audit.score}%; previous current: ${current.map((entry) => entry.version).join(", ") || "none"})`);
}
