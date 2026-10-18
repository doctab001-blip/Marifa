import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const { data: g } = await db.from("clinical_guidelines").select("*").eq("title","Acne Vulgaris").single();
console.log(g);
const { data: v } = await db.from("guideline_versions").select("*").eq("guideline_id", g.id).eq("status","draft");
for (const r of v) { const {content, ...rest} = r; console.log(rest); }
const { data: s } = await db.from("medical_specialities").select("*").limit(60).then(r=>r).catch(()=>({data:null}));
console.log(s && s.map(x=>[x.id,x.name].join(":")));
