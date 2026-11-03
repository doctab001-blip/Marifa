/**
 * Keep one copy per topic: deletes every non-current guideline version (owner instruction, 3 Nov 2026),
 * and with --drop-merged also deletes the hidden duplicate topics listed in lib/data/merged-topics.ts.
 *
 *   npx tsx --env-file=.env.local       scripts/prune-old-versions.ts                 # Saudi dry run
 *   npx tsx --env-file=.env.india.local scripts/prune-old-versions.ts                 # India dry run
 *   ... --apply                  # back up, then delete
 *   ... --apply --drop-merged    # also delete merged duplicate topics (their ids keep redirecting in the app)
 *
 * Safety:
 *  - A topic's current version is never touched. A topic with no current version is skipped and reported.
 *  - Versions referenced by pathways, payloads, governance reviews/links or order sets are kept (the rows depend on them).
 *  - Every row to be deleted is first written in full to .claude-tmp/backups/pruned-<region>-<time>.ndjson.
 */
import fs from "node:fs";
import { mergedTopics as MERGED_TOPICS } from "../lib/data/merged-topics";

const apply = process.argv.includes("--apply"), dropMerged = process.argv.includes("--drop-merged");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!, key = process.env.SUPABASE_SECRET_KEY!;
const region = (process.env.NEXT_PUBLIC_MARIFA_REGION ?? "").toUpperCase();
if (!url || !key || !["SA", "IN"].includes(region)) throw new Error("Use --env-file=.env.local (SA) or --env-file=.env.india.local (IN).");
async function rest<T>(method: string, p: string, allow = false): Promise<T> {
  const r = await fetch(`${url}/rest/v1/${p}`, { method, headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=minimal" } });
  if (allow && (r.status === 404 || r.status === 400)) return [] as unknown as T;
  if (!r.ok) throw new Error(`${method} ${p.split("?")[0]} -> ${r.status} ${(await r.text()).slice(0, 300)}`);
  const t = await r.text(); return (t ? JSON.parse(t) : null) as T;
}
async function all<T>(p: string, size = 1000): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += size) { const page = await rest<T[]>("GET", `${p}&order=id&limit=${size}&offset=${from}`); out.push(...page); if (page.length < size) return out; }
}
type L = { id: string; guideline_id: string; version: string; is_current: boolean };
const REFS: Array<[string, string]> = [["clinical_pathways", "guideline_version_id"], ["clinical_pathway_payloads", "guideline_version_id"], ["gov_guideline_reviews", "governed_version_id"], ["gov_links", "target_version_id"]];
const GREFS: Array<[string, string]> = [["gov_guideline_reviews", "guideline_id"], ["gov_meeting_files", "linked_guideline_id"], ["gov_policies", "clinical_guideline_id"], ["protocol_order_sets", "protocol_id"], ["patient_order_provenance", "protocol_id"]];

const versions = await all<L>("guideline_versions?select=id,guideline_id,version,is_current");
const referenced = new Set<string>();
for (const [table, col] of REFS) for (const row of await all<Record<string, string>>(`${table}?select=${col}&${col}=not.is.null`).catch(() => [])) referenced.add(row[col]);
const byG = new Map<string, L[]>();
for (const v of versions) byG.set(v.guideline_id, [...(byG.get(v.guideline_id) ?? []), v]);

const merged = dropMerged ? Object.keys(MERGED_TOPICS).filter((id) => byG.has(id)) : [];
const mergedSet = new Set(merged);
const del: L[] = []; let keptRef = 0; const noCurrent: string[] = [];
for (const [g, vs] of byG) {
  if (mergedSet.has(g)) continue;
  if (!vs.some((v) => v.is_current)) { noCurrent.push(g); continue; }
  for (const v of vs) { if (v.is_current) continue; if (referenced.has(v.id)) { keptRef++; continue; } del.push(v); }
}
const blockedMerged: string[] = [];
for (const g of merged) {
  for (const [table, col] of GREFS) if ((await rest<unknown[]>("GET", `${table}?select=${col}&${col}=eq.${g}&limit=1`, true)).length) { blockedMerged.push(g); break; }
  if (!blockedMerged.includes(g) && (byG.get(g) ?? []).some((v) => referenced.has(v.id))) blockedMerged.push(g);
}
const mergedToDrop = merged.filter((g) => !blockedMerged.includes(g));
console.log(`${apply ? "APPLY" : "DRY RUN"} ${region} ${new URL(url).host}`);
console.log(`topics ${byG.size}; versions ${versions.length}; current ${versions.filter((v) => v.is_current).length}`);
console.log(`old versions to delete: ${del.length}; kept because referenced: ${keptRef}; topics with no current version (skipped): ${noCurrent.length}`);
if (dropMerged) console.log(`merged duplicate topics to delete: ${mergedToDrop.length}; kept because referenced: ${blockedMerged.length}`);
if (!apply) { console.log("Dry run only. Add --apply to back up and delete."); process.exit(0); }

fs.mkdirSync(".claude-tmp/backups", { recursive: true });
const file = `.claude-tmp/backups/pruned-${region}-${new Date().toISOString().replace(/[:.]/g, "-")}.ndjson`;
const ids = del.map((v) => v.id);
for (let i = 0; i < ids.length; i += 20) {
  const rows = await rest<unknown[]>("GET", `guideline_versions?select=*&id=in.(${ids.slice(i, i + 20).join(",")})`);
  fs.appendFileSync(file, rows.map((r) => JSON.stringify({ table: "guideline_versions", row: r })).join("\n") + "\n");
}
for (const g of mergedToDrop) {
  const [gr] = await rest<unknown[]>("GET", `clinical_guidelines?select=*&id=eq.${g}`);
  const vr = await rest<unknown[]>("GET", `guideline_versions?select=*&guideline_id=eq.${g}`);
  fs.appendFileSync(file, JSON.stringify({ table: "clinical_guidelines", row: gr, versions: vr }) + "\n");
}
console.log(`Backup written: ${file}`);
let n = 0;
for (let i = 0; i < ids.length; i += 50) { await rest("DELETE", `guideline_versions?id=in.(${ids.slice(i, i + 50).join(",")})`); n += ids.slice(i, i + 50).length; }
for (const g of mergedToDrop) await rest("DELETE", `clinical_guidelines?id=eq.${g}`);
console.log(`Deleted ${n} old versions${dropMerged ? ` and ${mergedToDrop.length} merged duplicate topics` : ""}. Current versions untouched.`);
