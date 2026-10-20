import "server-only";
import { cache } from "react";
import { getTemporaryAdminIdentity, isTemporaryOpenAdminMode } from "@/lib/access-mode";
import { assertCanManageOrders, canManageOrders } from "@/lib/clinical-orders/policy";
import type { OrderActor } from "@/lib/clinical-orders/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";

/**
 * Resolves who is acting, from the server session, never from anything the browser sends.
 * Returns null when nobody is signed in or there is no active organisation membership.
 * Order access is decided by ASSIGNED ROLES (see policy.ts); demo-cookie sessions never qualify because they have no database identity.
 */
export const getOrderActor = cache(async (): Promise<OrderActor | null> => {
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

    // Prefer the first membership that actually holds an ordering role.
    for (const membership of memberships) {
      const codes = (assigned ?? [])
        .filter((row) => row.membership_id === membership.id)
        .map((row) => {
          const role = (row as unknown as { roles: { code: string } | { code: string }[] | null }).roles;
          return Array.isArray(role) ? role[0]?.code : role?.code;
        })
        .filter((code): code is string => typeof code === "string");
      const actor: OrderActor = { userId, organizationId: membership.organization_id, roleCodes: codes };
      if (canManageOrders(actor)) return actor;
    }
    return { userId, organizationId: memberships[0].organization_id, roleCodes: [] };
  } catch {
    return null;
  }
});

/** For server actions and pages: the signed-in clinician, or an OrderAuthorizationError. */
export async function requireOrderActor(): Promise<OrderActor> {
  const actor = await getOrderActor();
  assertCanManageOrders(actor);
  return actor;
}
