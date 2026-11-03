/**
 * Removes leftover Saudi records from the India Supabase project
 * (owner instruction, 3 Nov 2026: Saudi topics never on the India platform; mirror of move-india-records-out-of-saudi.ts).
 *
 *   npx tsx scripts/remove-saudi-records-from-india.ts            # dry run: report only
 *   npx tsx scripts/remove-saudi-records-from-india.ts --delete   # back up, then delete the safe ones
 *
 * Reads .env.local (must be region SA) and .env.india.local (must be region IN) itself; the two hosts must differ.
 * A record in the India database is a "Saudi leftover" only if ALL of these hold:
 *  - lib/region-topics.ts topicCountry() does not say IN (not a listed India topic, not ICMR/MoHFW, no "(India)" title);
 *  - none of its versions has "india" in the version string (India-written drafts on shared ids are India work: kept);
 *  - the same topic exists in the Saudi database and every one of its India versions also exists there
 *    (same version string), so nothing unique is lost;
 *  - no pathway, payload, governance, policy or order-set row in the India database references it.
 * Safety: --delete always writes a full backup of every matched India row to .claude-tmp/backups/ first.
 * Nothing in the Saudi database is touched. Deletion cascades to the topic's versions in India only.
 */
import fs from "node:fs";
import path from "node:path";
import { topicCountry } from "../lib/region-topics";

const del = process.argv.includes("--delete");

function env(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
const SA = env(".env.local"), IN = env(".env.india.local");
if ((SA.NEXT_PUBLIC_MARIFA_REGION ?? "").toUpperCase() !== "SA") throw new Error(".env.local is not region SA");
if ((IN.NEXT_PUBLIC_MARIFA_REGION ?? "").toUpperCase() !== "IN") throw new Error(".env.india.local is not region IN");
if (!SA.NEXT_PUBLIC_SUPABASE_URL || !SA.SUPABASE_SECRET_KEY || !IN.NEXT_PUBLIC_SUPABASE_URL || !IN.SUPABASE_SECRET_KEY) throw new Error("Missing Supabase URL or secret key");
if (new URL(SA.NEXT_PUBLIC_SUPABASE_URL).host === new URL(IN.NEXT_PUBLIC_SUPABASE_URL).host) throw new Error("Saudi and India point at the same host; refusing");

type Db = { url: string; key: string; name: string };
const saudi: Db = { url: SA.NEXT_PUBLIC_SUPABASE_URL, key: SA.SUPABASE_SECRET_KEY, name: "Saudi" };
const india: Db = { url: IN.NEXT_PUBLIC_SUPABASE_URL, key: IN.SUPABASE_SECRET_KEY, name: "India" };

async function rest<T>(db: Db, method: string, p: string, allow404 = false): Promise<T> {
  const r = await fetch(`${db.url}/rest/v1/${p}`, { method, headers: { apikey: db.key, Authorization: `Bearer ${db.key}`, "Content-Type": "application/json", Prefer: "return=representation" } });
  if (allow404 && (r.status === 404 || r.status === 400)) return [] as unknown as T;
  if (!r.ok) throw new Error(`${db.name} ${method} ${p.split("?")[0]} -> ${r.status} ${(await r.text()).slice(0, 300)}`);
  const text = await r.text();
  return (text ? JSON.parse(text) : null) as T;
}
async function all<T>(db: Db, p: string, size = 500): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += size) {
    const page = await rest<T[]>(db, "GET", `${p}${p.includes("?") ? "&" : "?"}order=id&limit=${size}&offset=${from}`);
    out.push(...page);
    if (page.length < size) return out;
  }
}
type G = Record<string, unknown> & { id: string; title: string };
type L = { id: string; guideline_id: string; version: string; is_current?: boolean; authority?: string | null; ctitle?: string | null };

const REFS: Array<[string, string, "guideline" | "version"]> = [
  ["clinical_pathways", "guideline_version_id", "version"], ["clinical_pathway_payloads", "guideline_version_id", "version"],
  ["gov_guideline_reviews", "guideline_id", "guideline"], ["gov_guideline_reviews", "governed_version_id", "version"],
  ["gov_links", "target_version_id", "version"], ["gov_meeting_files", "linked_guideline_id", "guideline"],
  ["gov_policies", "clinical_guideline_id", "guideline"], ["protocol_order_sets", "protocol_id", "guideline"],
  ["patient_order_provenance", "protocol_id", "guideline"],
];
const LIGHT = "guideline_versions?select=id,guideline_id,version,is_current,authority:content->>authority,ctitle:content->>title";
function group(rows: L[]): Map<string, L[]> {
  const m = new Map<string, L[]>();
  for (const v of rows) m.set(v.guideline_id, [...(m.get(v.guideline_id) ?? []), v]);
  return m;
}

const gIn = await all<G>(india, "clinical_guidelines?select=*");
const vIn = group(await all<L>(india, LIGHT, 1000));
const gSa = new Set((await all<{ id: string }>(saudi, "clinical_guidelines?select=id")).map((g) => g.id));
const vSa = group(await all<L>(saudi, "guideline_versions?select=id,guideline_id,version", 1000));

console.log(`${del ? "DELETE" : "DRY RUN"} — India ${new URL(india.url).host} (Saudi ${new URL(saudi.url).host} read only)`);
let visible = 0, indiaDrafts = 0, onlyInIndia = 0, blocked = 0, removed = 0;
const toRemove: Array<{ g: G; vs: L[] }> = [];
for (const g of gIn) {
  const vs = vIn.get(g.id) ?? [];
  const cur = vs.find((v) => v.is_current) ?? vs[0];
  const country = topicCountry({ id: g.id, title: cur?.ctitle ?? g.title, authority: cur?.authority ?? undefined });
  if (country === "IN") { visible++; continue; }
  const label = `${cur?.ctitle ?? g.title} [${g.id}]`;
  if (vs.some((v) => /india/i.test(v.version))) { indiaDrafts++; console.log(`KEEP (India draft) ${label}`); continue; }
  const saVersions = new Set((vSa.get(g.id) ?? []).map((v) => v.version));
  const unique = vs.filter((v) => !saVersions.has(v.version));
  if (!gSa.has(g.id) || unique.length) { onlyInIndia++; console.log(`KEEP (not fully in Saudi: ${gSa.has(g.id) ? unique.map((v) => v.version).join(", ") : "topic missing in Saudi"}) ${label}`); continue; }
  const blockers: string[] = [];
  for (const [table, col, kind] of REFS) {
    const ids = kind === "guideline" ? [g.id] : vs.map((v) => v.id);
    if (!ids.length) continue;
    const rows = await rest<unknown[]>(india, "GET", `${table}?select=${col}&${col}=in.(${ids.join(",")})&limit=1`, true);
    if (rows.length) blockers.push(table);
  }
  if (blockers.length) { blocked++; console.log(`KEEP (referenced by ${blockers.join(", ")}) ${label}`); continue; }
  toRemove.push({ g, vs });
  console.log(`${del ? "REMOVE" : "WOULD REMOVE"} ${label}: ${vs.length} versions`);
}

if (del && toRemove.length) {
  const dir = ".claude-tmp/backups"; fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `saudi-records-from-india-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  const backup = [];
  for (const { g } of toRemove) backup.push({ guideline: g, versions: await rest<unknown[]>(india, "GET", `guideline_versions?select=*&guideline_id=eq.${g.id}`) });
  fs.writeFileSync(file, JSON.stringify(backup, null, 1));
  console.log(`Backup written: ${file}`);
  for (const { g } of toRemove) { await rest(india, "DELETE", `clinical_guidelines?id=eq.${g.id}`); removed++; }
}
console.log(`India database: ${gIn.length} topics. Visible India topics: ${visible}. India drafts kept: ${indiaDrafts}. Kept (not fully in Saudi): ${onlyInIndia}. Kept (referenced): ${blocked}. ${del ? `Removed: ${removed}.` : `Would remove: ${toRemove.length}. Re-run with --delete.`}`);
