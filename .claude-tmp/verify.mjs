import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const { data } = await db.from("guideline_versions").select("id,status,is_current,clinical_guidelines!inner(title,status)").eq("version","topic-list-draft-2026-10-13-b003");
console.log("rows", data.length, "draft", data.filter(r=>r.status==="draft"&&!r.is_current).length);
