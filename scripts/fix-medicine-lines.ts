/**
 * Cleans the medicine "adjustments" lines of every CURRENT topic and fills real CKD/CLD rules.
 *   - removes placeholder CKD/CLD lines ("Not specified in the cited sources"), placeholder paediatric lines
 *     and "Penicillin allergy: Not an antibiotic" lines (and penicillin lines on any non-antibiotic);
 *   - adds a CKD and a CLD line from lib/medicine-renal-hepatic.ts where one is missing or was a placeholder;
 *   - appends one honest line to evidenceAudit.unverifiedSections and the medicine-plan note.
 * New version "<prefix>medlines-2026-10-26-v1" is inserted under_review and non-current. With --publish the "-live"
 * row also becomes current, but only when the authoring audit is publishable and, if the source topic passed the
 * depth standard, the new one still does. clinicalReviewStatus stays "pending". Nothing is edited in place.
 *
 *   npx tsx --env-file=.env.india.local scripts/fix-medicine-lines.ts                 # dry run
 *   npx tsx --env-file=.env.india.local scripts/fix-medicine-lines.ts --apply         # stage under_review rows
 *   npx tsx --env-file=.env.india.local scripts/fix-medicine-lines.ts --apply --publish
 *   add --tag v2 to write a new version name (a re-run with the same name skips topics already staged)
 *   add --only <id8,id8> to limit to some topics (first 8 characters of the guideline id)
 */
import { auditTopicContent } from "../lib/clinical-authoring-audit";
import { auditTopicDepth } from "../lib/clinical-depth-standard";
import { fixContent, medlinesVersion, MEDLINES_DATE } from "../lib/medicine-line-fix";

const args = process.argv.slice(2);
const apply = args.includes("--apply"), publish = args.includes("--publish");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (use --env-file).");
const india = (process.env.NEXT_PUBLIC_MARIFA_REGION ?? "").toUpperCase() === "IN";
const VERSION = medlinesVersion(india, args.includes("--tag") ? args[args.indexOf("--tag") + 1] : "v1");
const DATE = MEDLINES_DATE;
async function rest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(`${url}/rest/v1/${path}`, { method, headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!r.ok) throw new Error(`${method} ${path.split("?")[0]} -> ${r.status} ${(await r.text()).slice(0, 300)}`);
  const text = await r.text(); return (text ? JSON.parse(text) : null) as T;
}
type Row = Record<string, any> & { guideline_id: string; version: string; content: any };

const rows = await rest<Row[]>("GET", "guideline_versions?select=*&is_current=eq.true&limit=1000");
console.log(`${apply ? "APPLY" : "DRY RUN"}${publish ? " + PUBLISH" : ""} ${new URL(url).host}: ${rows.length} current versions, writing ${VERSION}`);
let touched = 0, staged = 0, live = 0; const skipped: string[] = [];
for (const row of rows) {
  if (only && !only.some((p) => row.guideline_id.startsWith(p))) continue;
  if (!row.content?.medicationPlan?.regimens?.length) continue;
  let fixed; try { fixed = fixContent(row.content, VERSION); } catch (e) { skipped.push(`${row.content.title}: ${(e as Error).message.slice(0, 120)}`); continue; }
  if (!fixed.changed) continue;
  touched++;
  const label = `${row.content.title} [${row.guideline_id.slice(0, 8)}]`;
  if (fixed.unmatched.length) skipped.push(`${label}: no CKD/CLD rule for ${[...new Set(fixed.unmatched)].join(", ")}`);
  const audit = auditTopicContent(fixed.content);
  const sourceDepth = auditTopicDepth(row.content).passed, newDepth = auditTopicDepth(fixed.content);
  const canPublish = audit.publishable && (!sourceDepth || newDepth.passed);
  console.log(`${canPublish ? "OK  " : "HOLD"} ${label}: ${fixed.changed} regimens changed; audit ${audit.score}%${sourceDepth ? `, depth ${newDepth.passed ? "met" : "FAILED: " + newDepth.failures[0]?.slice(0, 90)}` : ""}`);
  if (!apply) continue;
  const dup = await rest<unknown[]>("GET", `guideline_versions?select=id&guideline_id=eq.${row.guideline_id}&version=eq.${encodeURIComponent(VERSION)}`);
  if (dup.length) { console.log(`     SKIP: ${VERSION} already exists`); continue; }
  const common = { guideline_id: row.guideline_id, source_title: row.source_title, source_url: row.source_url, issuing_organization: row.issuing_organization, jurisdiction: row.jurisdiction, last_verified_date: DATE, review_date: row.review_date, created_by: row.created_by };
  await rest("POST", "guideline_versions", { ...common, version: VERSION, version_number: VERSION, status: "under_review", is_current: false, content: fixed.content, approved_by: null, approved_at: null, published_at: null,
    change_summary: `Medicine lines (${VERSION}) built on ${row.version}: placeholder CKD/CLD, paediatric and non-antibiotic penicillin lines removed; real CKD/CLD rules from standard references added. Clinical review pending.` });
  staged++;
  if (!publish || !canPublish) continue;
  const liveVersion = `${VERSION}-live`, now = new Date().toISOString();
  const [ins] = await rest<Array<{ id: string }>>("POST", "guideline_versions", { ...common, version: liveVersion, version_number: liveVersion, status: "published", is_current: false, content: { ...fixed.content, status: "published", version: liveVersion, clinicalReviewStatus: "pending" }, published_at: now, approved_by: row.created_by, approved_at: now,
    change_summary: `Published from ${VERSION}: medicine-line clean-up, authoring audit ${audit.score}%. clinicalReviewStatus stays pending.` });
  const cur = await rest<Array<{ id: string }>>("GET", `guideline_versions?select=id&guideline_id=eq.${row.guideline_id}&is_current=eq.true`);
  for (const c of cur) await rest("PATCH", `guideline_versions?id=eq.${c.id}`, { is_current: false });
  await rest("PATCH", `guideline_versions?id=eq.${ins.id}`, { is_current: true });
  await rest("PATCH", `clinical_guidelines?id=eq.${row.guideline_id}`, { status: "published" });
  live++; console.log(`     LIVE -> ${liveVersion}`);
}
console.log(`\n${touched} topics need changes; ${staged} staged; ${live} made live.`);
if (skipped.length) console.log(`Needs a look (${skipped.length}):\n  ${skipped.join("\n  ")}`);
if (!apply) console.log("Dry run only. Add --apply to stage, --apply --publish to go live.");
