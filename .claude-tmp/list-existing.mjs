import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const { data, error } = await db.from("clinical_guidelines").select("*").limit(1);
if (error) throw error;
console.log("COLS", Object.keys(data[0]));
const all = [];
for (let s = 0; ; s += 500) {
  const { data: d, error: e } = await db.from("clinical_guidelines").select("id,title,specialty,status,is_shared_reference,organization_id,guideline_versions(id,version,status,is_current,content->pillar)").range(s, s + 499);
  if (e) throw e; all.push(...d); if (d.length < 500) break;
}
console.log("TOTAL", all.length);
for (const g of all.sort((a,b)=>a.title.localeCompare(b.title))) {
  const vs = g.guideline_versions.map(v => `${v.status}${v.is_current?"*":""}`).join(",");
  const pillar = g.guideline_versions.map(v=>v.pillar).filter(Boolean)[0] ?? "";
  console.log([g.title, g.specialty, g.status, pillar, vs].join(" | "));
}
