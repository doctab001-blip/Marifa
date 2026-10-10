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
    ? claims.user_metadata as { display_name?: unknown; full_name?: unknown; professional_level?: unknown }
    : null;
  const claimName = typeof userMetadata?.display_name === "string"
    ? userMetadata.display_name
    : typeof userMetadata?.full_name === "string"
      ? userMetadata.full_name
      : undefined;
  type JoinedProfile = {
    display_name?: string | null;
    memberships?: Array<{
      account_status?: string;
      organization_id?: string;
      professional_level?: string | null;
      organization?: { name?: string | null; settings?: { primary_color?: string | null } | Array<{ primary_color?: string | null }> | null } | null;
      assigned_roles?: Array<{ role?: { code?: string | null; name?: string | null } | Array<{ code?: string | null; name?: string | null }> | null }>;
    }>;
  };

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("display_name, memberships:organization_memberships(id, organization_id, professional_level, account_status, organization:organizations(name, settings:organization_settings(primary_color)), assigned_roles:membership_roles(role:roles(code,name)))")
    .eq("id", claims.sub)
    .maybeSingle();
  const profile = rawProfile as unknown as JoinedProfile | null;
  const membership = profile?.memberships?.find((item) => item.account_status === "active");
  const organization = Array.isArray(membership?.organization) ? membership.organization[0] : membership?.organization;
  const organizationSettings = Array.isArray(organization?.settings) ? organization.settings[0] : organization?.settings;
  const assignedRoles = membership?.assigned_roles?.map((item) => Array.isArray(item.role) ? item.role[0] : item.role);
  const adminRole = assignedRoles?.find((item) => item?.code === "platform_admin" || item?.code === "hospital_admin" || item?.code === "org_admin");
  const level = membership?.professional_level ?? (typeof userMetadata?.professional_level === "string" ? userMetadata.professional_level : undefined);
  const designation = level === "mbbs_gp" ? "MBBS / GP" : level === "specialist" ? "Specialist" : level === "consultant" ? "Consultant" : "Clinician";
  const adminRoleLabel = adminRole?.code === "platform_admin" ? "Platform Admin" : adminRole ? "Hospital Admin" : null;
  const displayName = profile?.display_name || claimName || email?.split("@")[0] || "Marifa user";
  return {
    id: claims.sub,
    name: displayName,
    initials: displayName.split(/\s+/).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase(),
    role: adminRoleLabel ?? designation,
    designation,
    isAdmin: Boolean(adminRole),
    primaryColor: organizationSettings?.primary_color ?? "#1f3c88",
    specialty: "Unassigned",
    organizationId: membership?.organization_id ?? "pending-membership",
    organizationName: organization?.name ?? "Membership pending"
  };
});
