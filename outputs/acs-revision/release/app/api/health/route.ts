import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ status: "degraded", database: "not_configured" }, { status: 503 });
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase.from("disease_topics").select("id", { count: "exact", head: true }).is("organization_id", null);
  if (error) return NextResponse.json({ status: "degraded", database: "unavailable" }, { status: 503 });
  return NextResponse.json({ status: "ok", database: "connected", demoTopics: count ?? 0 });
}
