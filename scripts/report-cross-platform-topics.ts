/**
 * READ-ONLY check for the Marifa Saudi / Marifa India split. Run it against each platform's Supabase project:
 * it lists topics stored there that belong to the OTHER platform. The app already hides them (lib/region-topics.ts);
 * this report is what we review before any clean-up, which is a separate, approved step. Writes nothing.
 *
 *   npx tsx --env-file=.env.local       scripts/report-cross-platform-topics.ts   # Saudi project, NEXT_PUBLIC_MARIFA_REGION=SA
 *   npx tsx --env-file=.env.india.local scripts/report-cross-platform-topics.ts   # India project, NEXT_PUBLIC_MARIFA_REGION=IN
 */
import { topicCountry } from "../lib/region-topics";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const platform = (process.env.NEXT_PUBLIC_MARIFA_REGION ?? "").trim().toUpperCase();
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
if (platform !== "SA" && platform !== "IN") throw new Error("Set NEXT_PUBLIC_MARIFA_REGION to SA or IN in the env file for this project.");

async function rest<T>(path: string): Promise<T> {
  const response = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key!, Authorization: `Bearer ${key}` } });
  if (!response.ok) throw new Error(`GET ${path.split("?")[0]} -> ${response.status} ${(await response.text()).slice(0, 300)}`);
  return (await response.json()) as T;
}

type Guideline = { id: string; title: string };
type VersionRow = { guideline_id: string; authority: string | null; is_current: boolean };
const guidelines = await rest<Guideline[]>("clinical_guidelines?select=id,title&limit=10000");
const versions = await rest<VersionRow[]>("guideline_versions?select=guideline_id,authority:content->>authority,is_current&limit=50000");
const authorityOf = new Map<string, string>();
for (const row of versions) if (row.authority && (row.is_current || !authorityOf.has(row.guideline_id))) authorityOf.set(row.guideline_id, row.authority);

const foreign = guidelines.filter((g) => topicCountry({ id: g.id, title: g.title, authority: authorityOf.get(g.id) }) !== platform);
const name = platform === "IN" ? "Marifa India" : "Marifa Saudi";
console.log(`${name} — ${new URL(url).host}`);
console.log(`${guidelines.length} topics stored; ${guidelines.length - foreign.length} belong here; ${foreign.length} belong to the other platform (hidden by the app).`);
for (const g of foreign.sort((a, b) => a.title.localeCompare(b.title))) console.log(`  ${g.id}  ${g.title}${authorityOf.get(g.id) ? `  [${authorityOf.get(g.id)}]` : ""}`);
console.log("Read-only: nothing was changed.");
