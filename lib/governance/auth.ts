import "server-only";
import { cache } from "react";
import { getTemporaryAdminIdentity, isTemporaryOpenAdminMode } from "@/lib/access-mode";
import { GOVERNANCE_READ_ROLES, type GovActor } from "@/lib/governance/policy";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";

/**
 * Resolves who is acting from the server session, never from anything the browser sends. Null when nobody is signed in or
 * there is no active organisation membership. Demo-cookie sessions never qualify: they have no database identity.
 * Prefers the membership that holds a governance role, so a person in two organisations lands in the right one.
 */
export const getGovernanceActor = cache(async (): Promise<GovActor | null> => {
  if (isTemporaryOpenAdminMode()) {
    const identity = getTemporaryAdminIdentity();
    return identity ? { userId: identity.userId, organizationId: identity.organizationId, roleCodes: ["platform_admin"] } : null;
  }
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createSupabaseDataClient();
    const { data: authData, error: authError } = await supabase.auth.getClaims();
    const userId = authData?.claims?.sub;
    if (authError || typeof userId !== "string") return null;

    const { data: memberships, error: membershipError } = await supabase
      .from("organization_memberships")
      .select("id, organization_id")
      .eq("user_id", userId)
      .eq("account_status", "active");
    if (membershipError || !memberships?.length) return null;

    const { data: assigned, error: rolesError } = await supabase
      .from("membership_roles")
      .select("membership_id, roles!inner(code)")
      .in("membership_id", memberships.map((membership) => membership.id));
    if (rolesError) return null;

    const actors: GovActor[] = memberships.map((membership) => {
      const roleCodes = (assigned ?? [])
        .filter((row) => row.membership_id === membership.id)
        .map((row) => {
          const role = (row as unknown as { roles: { code: string } | { code: string }[] | null }).roles;
          return Array.isArray(role) ? role[0]?.code : role?.code;
        })
        .filter((code): code is string => typeof code === "string");
      return { userId, organizationId: membership.organization_id, roleCodes };
    });
    return actors.find((actor) => actor.roleCodes.some((code) => (GOVERNANCE_READ_ROLES as readonly string[]).includes(code))) ?? actors[0];
  } catch {
    return null;
  }
});
