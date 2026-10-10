import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { demoUser, governanceUser } from "@/lib/demo-data";
import type { DemoUser } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getCurrentViewer = cache(async (): Promise<DemoUser | null> => {
  const cookieStore = await cookies();
  const demoSession = cookieStore.get("marifa_demo_session")?.value;
  if (demoSession === "governance") return governanceUser;
  if (demoSession === "clinician") return demoUser;
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;

  const email = typeof claims.email === "string" ? claims.email : undefined;
  const userMetadata = claims.user_metadata && typeof claims.user_metadata === "object"
    ? claims.user_metadata as { display_name?: unknown; full_name?: unknown }
    : null;
  const claimName = typeof userMetadata?.display_name === "string"
    ? userMetadata.display_name
    : typeof userMetadata?.full_name === "string"
      ? userMetadata.full_name
      : undefined;
  const displayName = claimName || email?.split("@")[0] || "Marifa user";
  return {
    id: claims.sub,
    name: displayName,
    initials: displayName.split(/\s+/).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase(),
    role: "MBBS / GP",
    specialty: "Unassigned",
    organizationId: "pending-membership",
    organizationName: "Membership pending"
  };
});
