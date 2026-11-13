/**
 * Audits every flowchart on every CURRENT topic and shortens over-long boxes without deleting content
 * (long text is split: headline stays, the rest moves to the box's "Details"). Other findings are listed for review.
 *   npx tsx --env-file=.env.india.local scripts/fix-algorithms.ts                    # audit + dry run, writes .claude-tmp/algo-report.json
 *   npx tsx --env-file=.env.india.local scripts/fix-algorithms.ts --apply            # stage new under_review versions
 *   npx tsx --env-file=.env.india.local scripts/fix-algorithms.ts --apply --publish  # and make them live (audit gates apply)
 *   add --tag v2 for a new version name, --only id8,id8 to limit topics
 */
import fs from "node:fs";
import { DiseaseDetailSchema } from "../lib/validations/disease";
import { auditTopicContent } from "../lib/clinical-authoring-audit";
import { auditTopicDepth } from "../lib/clinical-depth-standard";
import { tightenAlgorithm } from "../lib/algorithm-tighten";
import { auditAlgorithm } from "../lib/algorithm-audit";

const args = process.argv.slice(2);
const apply = args.includes("--apply"), publish = args.includes("--publish");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;
const tag = args.includes("--tag") ? args[args.indexOf("--tag") + 1] : "v1";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (use --env-file).");
const india = (process.env.NEXT_PUBLIC_MARIFA_REGION ?? "").toUpperCase() === "IN";
const VERSION = `${india ? "india-" : ""}algofmt-${tag}-2026-10-26-v1`, DATE = "2026-10-26";

async function rest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(`${url}/rest/v1/${path}`, { method, headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!r.ok) throw new Error(`${method} ${path.split("?")[0]} -> ${r.status} ${(await r.text()).slice(0, 300)}`);
  const text = await r.text(); return (text ? JSON.parse(text) : null) as T;
}
type Row = Record<string, any> & { guideline_id: string; version: string; content: any };
const rows = await rest<Row[]>("GET", "guideline_versions?select=*&is_current=eq.true&limit=1000");
console.log(`${apply ? "APPLY" : "DRY RUN"}${publish ? " + PUBLISH" : ""} ${new URL(url).host}: ${rows.length} current versions -> ${VERSION}`);

const report: Record<string, any[]> = { review: [] }; let topicsWith = 0, algos = 0, nodesFixed = 0, topicsChanged = 0, staged = 0, live = 0; const held: string[] = [];
const totals: Record<string, number> = {};
for (const row of rows) {
  if (only && !only.some((p) => row.guideline_id.startsWith(p))) continue;
  const list: any[] = row.content?.algorithms ?? []; if (!list.length) continue; topicsWith++;
  let changed = 0;
  const next = list.map((a) => {
    algos++;
    for (const issue of auditAlgorithm(a)) totals[issue.code] = (totals[issue.code] ?? 0) + 1;
    const t = tightenAlgorithm(a); changed += t.changed;
    // Whatever is still wrong after the automatic shortening goes to the review list.
    for (const issue of auditAlgorithm(t.algorithm)) {
      const node = t.algorithm.nodes.find((n: any) => n.id === issue.node);
      const branches = node?.next?.map((e: any) => `${e.label ?? "next"} -> ${e.to}`) ?? [];
      report.review.push({ topic: row.content.title, id: row.guideline_id.slice(0, 8), algorithm: a.id, ...issue, kind: node?.kind, text: node?.text, detail: node?.detail, branches });
    }
    return t.algorithm;
  });
  if (!changed) continue;
  nodesFixed += changed; topicsChanged++;
  const content = DiseaseDetailSchema.parse({ ...row.content, algorithms: next, version: VERSION, status: "under_review", clinicalReviewStatus: "pending", lastReviewed: DATE });
  const audit = auditTopicContent(content), srcDepth = auditTopicDepth(row.content).passed, newDepth = auditTopicDepth(content);
  const ok = audit.publishable && (!srcDepth || newDepth.passed);
  if (!ok) held.push(`${row.content.title} [${row.guideline_id.slice(0, 8)}]: audit ${audit.score}%${srcDepth && !newDepth.passed ? ", depth lost" : ""}`);
  if (!apply) continue;
  if ((await rest<unknown[]>("GET", `guideline_versions?select=id&guideline_id=eq.${row.guideline_id}&version=eq.${encodeURIComponent(VERSION)}`)).length) continue;
  const common = { guideline_id: row.guideline_id, source_title: row.source_title, source_url: row.source_url, issuing_organization: row.issuing_organization, jurisdiction: row.jurisdiction, last_verified_date: DATE, review_date: row.review_date, created_by: row.created_by };
  await rest("POST", "guideline_versions", { ...common, version: VERSION, version_number: VERSION, status: "under_review", is_current: false, content, approved_by: null, approved_at: null, published_at: null, change_summary: `Flowchart boxes shortened (${VERSION}) on ${row.version}: long box text split into a headline plus Details; no content removed.` });
  staged++;
  if (!publish || !ok) continue;
  const liveVersion = `${VERSION}-live`, now = new Date().toISOString();
  const [ins] = await rest<Array<{ id: string }>>("POST", "guideline_versions", { ...common, version: liveVersion, version_number: liveVersion, status: "published", is_current: false, content: { ...content, status: "published", version: liveVersion, clinicalReviewStatus: "pending" }, published_at: now, approved_by: row.created_by, approved_at: now, change_summary: `Published from ${VERSION}: flowchart formatting only; authoring audit ${audit.score}%.` });
  for (const c of await rest<Array<{ id: string }>>("GET", `guideline_versions?select=id&guideline_id=eq.${row.guideline_id}&is_current=eq.true`)) await rest("PATCH", `guideline_versions?id=eq.${c.id}`, { is_current: false });
  await rest("PATCH", `guideline_versions?id=eq.${ins.id}`, { is_current: true });
  await rest("PATCH", `clinical_guidelines?id=eq.${row.guideline_id}`, { status: "published" });
  live++;
}
fs.mkdirSync(".claude-tmp", { recursive: true });
fs.writeFileSync(".claude-tmp/algo-report.json", JSON.stringify({ totals, review: report.review, held }, null, 1));
console.log(`\n${topicsWith} topics have flowcharts (${algos} flowcharts). Findings before shortening, by type:`, totals);
console.log(`${nodesFixed} boxes shortened in ${topicsChanged} topics; ${staged} staged; ${live} live. ${held.length} held back.`);
console.log(`${report.review.length} items need a person to review (see .claude-tmp/algo-report.json): dead ends, unlabelled or non-exhaustive decisions, medicines without an exclusion, very long details.`);
if (held.length) console.log("Held back:\n  " + held.join("\n  "));
if (!apply) console.log("Dry run only. Add --apply to stage, --apply --publish to go live.");
