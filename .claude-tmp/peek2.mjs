import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const { data: v } = await db.from("guideline_versions").select("content,status,version").eq("guideline_id","ebb76601-6f86-436e-89f8-0e2af4de8791").eq("version","topic-list-draft-2026-10-12-b001").single();
console.log(JSON.stringify(v.content,null,1));
