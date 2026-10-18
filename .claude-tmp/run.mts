import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { auditTopicContent } from "../lib/clinical-authoring-audit";
import { build, VERSION, DATE, type Spec } from "./common.ts";
const [mod, ...flags] = process.argv.slice(2);
const only = flags.find((f) => f.startsWith("--only="))?.slice(7).split(",");
const { specs } = (await import(`./${mod}.ts`)) as { specs: Spec[] };
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
const OUT = new URL("../data/emergency-versions/", import.meta.url).pathname;
const apply = flags.includes("--apply");
const ids: string[] = [];
for (const s of specs.filter((x) => !only || only.includes(x.key))) {
  const { data: g, error } = await db.from("clinical_guidelines").select("id,title,specialty").eq("title", s.draftTitle).single();
  if (error || !g) { console.log("NO CATALOGUE ROW", s.draftTitle, error?.message); continue; }
  let content;
  try { content = build(s, g as any); } catch (e: any) { console.log("SCHEMA FAIL", s.key, JSON.stringify(e.issues?.slice(0, 5) ?? e.message)); continue; }
  const a = auditTopicContent(content);
  console.log(`${s.key}: score ${a.score}% (${a.passedChecks}/${a.totalChecks}) failures=${a.failures.length}`, a.failures.slice(0, 4));
  fs.writeFileSync(`${OUT}${s.key}.${VERSION}.json`, JSON.stringify(content, null, 2) + "\n");
  if (!apply || a.score < 80) continue;
  const { data: ex } = await db.from("guideline_versions").select("id").eq("guideline_id", g.id).eq("version", VERSION);
  if (ex?.length) { console.log("  version exists, skip insert"); ids.push(`${g.id}:${VERSION}`); continue; }
  const row = { id: randomUUID(), guideline_id: g.id, version: VERSION, version_number: VERSION, status: "under_review", content, is_current: false,
    change_summary: "Authored against the Marifa clinical-topic authoring standard from opened guideline sections; pending clinical review.",
    source_title: content.teaching!.references![0].title, issuing_organization: "Marifa evidence synthesis", source_url: content.teaching!.references![0].url,
    jurisdiction: "Saudi Arabia", last_verified_date: DATE, review_date: DATE, approved_by: null, approved_at: null, published_at: null };
  const { error: ie } = await db.from("guideline_versions").insert(row);
  if (ie) { console.log("  INSERT FAIL", ie.message); continue; }
  console.log("  inserted under_review", g.id); ids.push(`${g.id}:${VERSION}`);
}
if (ids.length) fs.writeFileSync(new URL(`ids_${mod}.txt`, import.meta.url), ids.join(" "));
