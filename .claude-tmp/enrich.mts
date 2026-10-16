// Adds investigation rows (e_rows.ts) to the current published version of each topic, as a NEW under_review version.
// Usage: tsx enrich.mts [--apply] [--only=key1,key2]. Then publish with scripts/publish-if-eligible.ts $(cat ids_enrich.txt)
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { auditTopicContent } from "../mnt/Marifa/lib/clinical-authoring-audit";
import { DiseaseDetailSchema } from "../mnt/Marifa/lib/validations/disease";
import { rows, normalFix } from "./e_rows.ts";

const VERSION = "authoring-standard-2026-10-14-v2-investigations";
const DATE = "2026-10-14";
const flags = process.argv.slice(2);
const apply = flags.includes("--apply");
const only = flags.find((f) => f.startsWith("--only="))?.slice(7).split(",");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
const OUT = process.env.HOME + "/mnt/Marifa/data/emergency-versions/";
const ids: string[] = [];
// key -> published file used earlier (tells us the title)
for (const [key, add] of Object.entries(rows).filter(([k]) => !only || only.includes(k))) {
  const src = JSON.parse(fs.readFileSync(`${OUT}${key}.authoring-standard-2026-10-14-v1.json`, "utf8"));
  const title: string = (src.content ?? src).title;
  const { data: g } = await db.from("clinical_guidelines").select("id,title,status").eq("title", title).single();
  if (!g) { console.log("NO CATALOGUE ROW", key, title); continue; }
  const { data: cur } = await db.from("guideline_versions").select("*").eq("guideline_id", g.id).eq("is_current", true).single();
  if (!cur || cur.status !== "published") { console.log("NO CURRENT PUBLISHED VERSION", key); continue; }
  const content = structuredClone(cur.content);
  const have = new Set([...content.investigations.ruleIn, ...content.investigations.ruleOut].map((i: any) => i.testName));
  for (const grp of ["ruleIn", "ruleOut"] as const) for (const r of add[grp] ?? []) if (!have.has(r.testName)) content.investigations[grp].push(r);
  for (const i of [...content.investigations.ruleIn, ...content.investigations.ruleOut]) { const fix = normalFix[key]?.[i.testName]; if (fix) i.normalValue = fix; }
  Object.assign(content, { status: "under_review", version: VERSION, lastReviewed: DATE, clinicalReviewStatus: "pending" });
  content.evidenceAudit.checkedOn = DATE;
  const parsed = DiseaseDetailSchema.safeParse(content);
  if (!parsed.success) { console.log("SCHEMA FAIL", key, JSON.stringify(parsed.error.issues.slice(0, 4))); continue; }
  const a = auditTopicContent(content);
  const n = content.investigations.ruleIn.length + content.investigations.ruleOut.length;
  console.log(`${key}: ${n} investigations, score ${a.score}% (${a.passedChecks}/${a.totalChecks}) failures=${a.failures.length}`, a.failures.slice(0, 3));
  fs.writeFileSync(`${OUT}${key}.${VERSION}.json`, JSON.stringify(content, null, 2) + "\n");
  if (!apply || a.score < 80) continue;
  const { data: ex } = await db.from("guideline_versions").select("id").eq("guideline_id", g.id).eq("version", VERSION);
  if (ex?.length) { console.log("  version exists, skip insert"); ids.push(`${g.id}:${VERSION}`); continue; }
  const row = { id: randomUUID(), guideline_id: g.id, version: VERSION, version_number: VERSION, status: "under_review", content, is_current: false,
    change_summary: "Investigation panel expanded with additional source-cited tests; pending clinical review.",
    source_title: cur.source_title, issuing_organization: cur.issuing_organization, source_url: cur.source_url,
    jurisdiction: cur.jurisdiction ?? "Saudi Arabia", last_verified_date: DATE, review_date: DATE, approved_by: null, approved_at: null, published_at: null };
  const { error } = await db.from("guideline_versions").insert(row);
  if (error) { console.log("  INSERT FAIL", error.message); continue; }
  console.log("  inserted under_review", g.id); ids.push(`${g.id}:${VERSION}`);
}
if (ids.length) fs.writeFileSync(process.env.HOME + "/topics/ids_enrich.txt", ids.join(" "));
