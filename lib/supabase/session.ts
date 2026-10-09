import "server-only";
import { cookies } from "next/headers";
import { demoUser, governanceUser } from "@/lib/demo-data";
import type { DemoUser } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentViewer(): Promise<DemoUser | null> {
  const cookieStore = await cookies();
  const demoSession = cookieStore.get("marifa_demo_session")?.value;
  if (demoSession === "governance") return governanceUser;
  if (demoSession === "clinician") return demoUser;
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
  const displayName = (profile as { display_name?: string } | null)?.display_name || user.email?.split("@")[0] || "Marifa user";
  return {
    id: user.id,
    name: displayName,
    initials: displayName.split(/\s+/).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase(),
    role: "MBBS / GP",
    specialty: "Unassigned",
    organizationId: "pending-membership",
    organizationName: "Membership pending"
  };
}
