/**
 * Moves Marifa India records out of the Saudi Supabase project into the India Supabase project
 * (owner instruction, 2 Nov 2026: the Saudi database should hold Saudi content only).
 *
 *   npx tsx scripts/move-india-records-out-of-saudi.ts                    # dry run: report only
 *   npx tsx scripts/move-india-records-out-of-saudi.ts --copy             # back up, then copy missing topics/versions into India
 *   npx tsx scripts/move-india-records-out-of-saudi.ts --copy --delete    # also delete the Saudi copies that are fully in India
 *
 * Reads .env.local (must be region SA) and .env.india.local (must be region IN) itself; the two hosts must differ.
 * A record is "India" if lib/region-topics.ts topicCountry() says IN (listed India topic, ICMR/MoHFW authority or
 * "(India)" title) or any of its version strings contains "india".
 * Safety:
 *  - --copy always writes a full backup of every matched Saudi row to .claude-tmp/backups/ first.
 *  - Copies keep the same guideline and version ids; nothing in India is overwritten or edited
 *    (existing India versions are skipped; India's current version is only set when India had none).
 *  - --delete removes a Saudi topic only if EVERY one of its versions now exists in India (same version string)
 *    and no pathway, payload, governance, policy or order-set row references it. Deletion cascades to its versions.
 */
import fs from "node:fs";
import path from "node:path";
import { topicCountry } from "../lib/region-topics";

const copy = process.argv.includes("--copy");
const del = process.argv.includes("--delete");
if (del && !copy) throw new Error("--delete must be used together with --copy");

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
const PUBLISHER = IN.MARIFA_PUBLISHER_ID ?? SA.MARIFA_PUBLISHER_ID ?? "310a1d7b-646d-4adb-b822-8d79453237cf";

type Db = { url: string; key: string; name: string };
const saudi: Db = { url: SA.NEXT_PUBLIC_SUPABASE_URL, key: SA.SUPABASE_SECRET_KEY, name: "Saudi" };
const india: Db = { url: IN.NEXT_PUBLIC_SUPABASE_URL, key: IN.SUPABASE_SECRET_KEY, name: "India" };

async function rest<T>(db: Db, method: string, p: string, body?: unknown, allow404 = false): Promise<T> {
  const r = await fetch(`${db.url}/rest/v1/${p}`, { method, headers: { apikey: db.key, Authorization: `Bearer ${db.key}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: body === undefined ? undefined : JSON.stringify(body) });
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
type V = Record<string, unknown> & { id: string; guideline_id: string; version: string; is_current?: boolean; content?: { authority?: string } };

// Rows in other tables that would block deleting a Saudi topic (table, column, which id it holds).
const REFS: Array<[string, string, "guideline" | "version"]> = [
  ["clinical_pathways", "guideline_version_id", "version"], ["clinical_pathway_payloads", "guideline_version_id", "version"],
  ["gov_guideline_reviews", "guideline_id", "guideline"], ["gov_guideline_reviews", "governed_version_id", "version"],
  ["gov_links", "target_version_id", "version"], ["gov_meeting_files", "linked_guideline_id", "guideline"],
  ["gov_policies", "clinical_guideline_id", "guideline"], ["protocol_order_sets", "protocol_id", "guideline"],
  ["patient_order_provenance", "protocol_id", "guideline"],
];

const guidelines = await all<G>(saudi, "clinical_guidelines?select=*");
// Light read first (no content), then full rows only for the matched topics, a few at a time.
type L = { id: string; guideline_id: string; version: string; is_current?: boolean; authority?: string | null };
const light = await all<L>(saudi, "guideline_versions?select=id,guideline_id,version,is_current,authority:content->>authority", 1000);
const lightByG = new Map<string, L[]>();
for (const v of light) lightByG.set(v.guideline_id, [...(lightByG.get(v.guideline_id) ?? []), v]);
const matched = guidelines.filter((g) => {
  const vs = lightByG.get(g.id) ?? [];
  const cur = vs.find((v) => v.is_current) ?? vs[0];
  return topicCountry({ id: g.id, title: g.title, authority: cur?.authority ?? undefined }) === "IN" || vs.some((v) => /india/i.test(v.version));
});
const byG = new Map<string, V[]>();
for (const g of matched) byG.set(g.id, await rest<V[]>(saudi, "GET", `guideline_versions?select=*&guideline_id=eq.${g.id}`));
console.log(`${copy ? (del ? "COPY + DELETE" : "COPY") : "DRY RUN"} — Saudi ${new URL(saudi.url).host} → India ${new URL(india.url).host}`);
console.log(`Saudi database: ${guidelines.length} topics; India records found: ${matched.length} (${matched.reduce((n, g) => n + (byG.get(g.id)?.length ?? 0), 0)} versions)`);

if (copy && matched.length) {
  const dir = ".claude-tmp/backups"; fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `india-records-from-saudi-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(file, JSON.stringify(matched.map((g) => ({ guideline: g, versions: byG.get(g.id) ?? [] })), null, 1));
  console.log(`Backup written: ${file}`);
}

const profileCache = new Map<string, boolean>();
async function indiaProfile(id: unknown): Promise<string> {
  if (typeof id !== "string") return PUBLISHER;
  if (!profileCache.has(id)) profileCache.set(id, (await rest<unknown[]>(india, "GET", `profiles?select=id&id=eq.${id}`)).length > 0);
  return profileCache.get(id) ? id : PUBLISHER;
}
async function indiaHas(table: string, id: unknown): Promise<boolean> {
  return typeof id === "string" && (await rest<unknown[]>(india, "GET", `${table}?select=id&id=eq.${id}`)).length > 0;
}

let moved = 0, kept = 0, copied = 0;
for (const g of matched) {
  const vs = byG.get(g.id) ?? [];
  const [gi] = await rest<G[]>(india, "GET", `clinical_guidelines?select=id&id=eq.${g.id}`);
  const iv = gi ? await rest<V[]>(india, "GET", `guideline_versions?select=id,version,is_current&guideline_id=eq.${g.id}`) : [];
  const have = new Set(iv.map((v) => v.version));
  const missing = vs.filter((v) => !have.has(v.version));
  const label = `${g.title} [${g.id}]`;
  if (!copy) { console.log(`${gi ? "IN INDIA" : "NOT IN INDIA"} ${label}: ${vs.length} Saudi versions, ${missing.length} missing in India`); }
  else {
    if (!gi) {
      const row: Record<string, unknown> = { ...g, organization_id: null, is_shared_reference: true, responsible_owner_id: null };
      if (!(await indiaHas("disease_topics", g.disease_topic_id))) row.disease_topic_id = null;
      await rest(india, "POST", "clinical_guidelines", row);
    }
    for (const v of missing) {
      const row: Record<string, unknown> = { ...v, is_current: false, created_by: await indiaProfile(v.created_by) };
      if (v.approved_by) row.approved_by = await indiaProfile(v.approved_by);
      if (await indiaHas("guideline_versions", v.id)) delete row.id;
      await rest(india, "POST", "guideline_versions", row); copied++;
    }
    if (!iv.some((v) => v.is_current)) {
      const cur = vs.find((v) => v.is_current);
      if (cur) await rest(india, "PATCH", `guideline_versions?guideline_id=eq.${g.id}&version=eq.${encodeURIComponent(cur.version)}`, { is_current: true });
    }
    console.log(`COPIED ${label}: ${gi ? "topic already in India" : "new topic in India"}, ${missing.length} versions added`);
  }
  if (!del) continue;
  // Verify and delete.
  const after = new Set((await rest<V[]>(india, "GET", `guideline_versions?select=version&guideline_id=eq.${g.id}`)).map((v) => v.version));
  const notCopied = vs.filter((v) => !after.has(v.version));
  if (notCopied.length) { console.log(`KEPT ${label}: ${notCopied.length} versions not confirmed in India`); kept++; continue; }
  const blockers: string[] = [];
  for (const [table, col, kind] of REFS) {
    const ids = kind === "guideline" ? [g.id] : vs.map((v) => v.id);
    const rows = await rest<unknown[]>(saudi, "GET", `${table}?select=${col}&${col}=in.(${ids.join(",")})&limit=1`, undefined, true);
    if (rows.length) blockers.push(table);
  }
  if (blockers.length) { console.log(`KEPT ${label}: referenced by ${blockers.join(", ")}`); kept++; continue; }
  await rest(saudi, "DELETE", `clinical_guidelines?id=eq.${g.id}`);
  console.log(`MOVED ${label}: removed from Saudi (${vs.length} versions)`); moved++;
}
console.log(copy ? `Done. ${copied} versions copied to India${del ? `; ${moved} topics removed from Saudi, ${kept} kept` : ""}.` : "Dry run only. Re-run with --copy, then --copy --delete.");
