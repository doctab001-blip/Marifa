/**
 * Replaces one flowchart in one current topic with a new algorithm JSON, as a NEW version (old versions stay).
 *   npx tsx --env-file=.env.india.local scripts/replace-algorithm.ts <id8> <algorithm.json> <tag>            # dry run
 *   npx tsx --env-file=.env.india.local scripts/replace-algorithm.ts <id8> <algorithm.json> <tag> --apply --publish
 * Publishes (-live row becomes current) only if the authoring audit is publishable and, when the old version met the
 * depth standard, the new one still does. clinicalReviewStatus stays "pending".
 */
import fs from "node:fs";
import { auditTopicContent } from "../lib/clinical-authoring-audit";
import { auditTopicDepth } from "../lib/clinical-depth-standard";
import { replaceAlgorithm } from "../lib/algorithm-replace";

const [prefix, file, tag, ...flags] = process.argv.slice(2);
if (!prefix || !file || !tag) throw new Error("Usage: replace-algorithm.ts <id8> <algorithm.json> <tag> [--apply] [--publish]");
const apply = flags.includes("--apply"), publish = flags.includes("--publish");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (use --env-file).");
const india = (process.env.NEXT_PUBLIC_MARIFA_REGION ?? "").toUpperCase() === "IN";
const VERSION = `${india ? "india-" : ""}algo-${tag}-2026-10-26-v1`, DATE = "2026-10-26";
const GAP = "Flowchart items marked ESC 2023 in the node details (high-sensitivity troponin timing, fondaparinux, refractory angina and dynamic ST-T criteria, discharge criteria) come from the ESC 2023 ACS guideline cited by the ICMR STW and were not opened against that guideline; a clinician must confirm them.";

async function rest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(`${url}/rest/v1/${path}`, { method, headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!r.ok) throw new Error(`${method} ${path.split("?")[0]} -> ${r.status} ${(await r.text()).slice(0, 300)}`);
  const text = await r.text(); return (text ? JSON.parse(text) : null) as T;
}
type Row = Record<string, any> & { guideline_id: string; version: string; content: any };
const rows = (await rest<Row[]>("GET", "guideline_versions?select=*&is_current=eq.true&limit=1000")).filter((r) => r.guideline_id.startsWith(prefix));
if (rows.length !== 1) throw new Error(`Expected exactly one current version for ${prefix}, found ${rows.length}.`);
const row = rows[0];
const { content, replaced } = replaceAlgorithm(row.content, JSON.parse(fs.readFileSync(file, "utf8")), VERSION, DATE, GAP, "");
const audit = auditTopicContent(content), srcDepth = auditTopicDepth(row.content).passed, newDepth = auditTopicDepth(content);
const canPublish = audit.publishable && (!srcDepth || newDepth.passed);
console.log(`${apply ? "APPLY" : "DRY RUN"}: ${row.content.title} [${row.guideline_id.slice(0, 8)}] ${row.version} -> ${VERSION}; algorithm ${replaced ? "replaced" : "added"}; audit ${audit.score}%; depth ${newDepth.passed ? "met" : "FAILED: " + newDepth.failures.slice(0, 3).join(" | ")}; ${canPublish ? "can publish" : "HOLD"}`);
if (!apply) { console.log("Dry run only. Add --apply (stage) or --apply --publish (go live)."); process.exit(0); }
if ((await rest<unknown[]>("GET", `guideline_versions?select=id&guideline_id=eq.${row.guideline_id}&version=eq.${encodeURIComponent(VERSION)}`)).length) { console.log(`SKIP: ${VERSION} already exists (use a new tag).`); process.exit(0); }
const common = { guideline_id: row.guideline_id, source_title: row.source_title, source_url: row.source_url, issuing_organization: row.issuing_organization, jurisdiction: row.jurisdiction, last_verified_date: DATE, review_date: row.review_date, created_by: row.created_by };
const summary = `Flowchart replaced (${VERSION}) on ${row.version}: full NSTEMI/unstable angina algorithm with very-high-risk criteria, P2Y12 hierarchy, anticoagulant choice with exclusions, NSTEMI vs UA branching, low-risk testing and discharge. Clinical review pending.`;
await rest("POST", "guideline_versions", { ...common, version: VERSION, version_number: VERSION, status: "under_review", is_current: false, content, approved_by: null, approved_at: null, published_at: null, change_summary: summary });
console.log("Staged under_review.");
if (publish && canPublish) {
  const live = `${VERSION}-live`, now = new Date().toISOString();
  const [ins] = await rest<Array<{ id: string }>>("POST", "guideline_versions", { ...common, version: live, version_number: live, status: "published", is_current: false, content: { ...content, status: "published", version: live, clinicalReviewStatus: "pending" }, published_at: now, approved_by: row.created_by, approved_at: now, change_summary: `Published from ${VERSION}: authoring audit ${audit.score}%. clinicalReviewStatus stays pending.` });
  for (const c of await rest<Array<{ id: string }>>("GET", `guideline_versions?select=id&guideline_id=eq.${row.guideline_id}&is_current=eq.true`)) await rest("PATCH", `guideline_versions?id=eq.${c.id}`, { is_current: false });
  await rest("PATCH", `guideline_versions?id=eq.${ins.id}`, { is_current: true });
  await rest("PATCH", `clinical_guidelines?id=eq.${row.guideline_id}`, { status: "published" });
  console.log(`LIVE -> ${live}`);
} else if (publish) console.log("Not published: audit or depth check failed (see above).");
