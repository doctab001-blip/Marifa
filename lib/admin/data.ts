import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { getTemporaryAdminIdentity, isTemporaryOpenAdminMode } from "@/lib/access-mode";
import { LOCAL_PROTOCOL_SOURCE_TYPE } from "@/lib/local-protocols";
import { DiseaseDetailSchema } from "@/lib/validations/disease";

export type OrganizationAdminContext = {
  userId: string;
  organizationId: string;
  organizationName: string;
  roleCode: string;
};

// Role codes in Marifa are stored in lowercase snake case.
const ADMIN_ROLE_CODES = ["org_admin", "hospital_admin", "platform_admin"] as const;

/** Every admin data loader calls this before it reads organization data. */
export const requireOrganizationAdmin = cache(async (): Promise<OrganizationAdminContext> => {
  if (isTemporaryOpenAdminMode()) {
    const identity = getTemporaryAdminIdentity();
    if (!identity) redirect("/dashboard/diseases/drafts?error=temporary_admin_config");
    return {
      userId: identity.userId,
      organizationId: identity.organizationId,
      organizationName: "Marifa Platform",
      roleCode: "platform_admin",
    };
  }
  if (!isSupabaseConfigured()) redirect("/login?error=auth_config");

  const supabase = await createSupabaseDataClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (authError || typeof userId !== "string") redirect("/login");

  const { data: memberships, error: membershipError } = await supabase
    .from("organization_memberships")
    .select("id, organization_id")
    .eq("user_id", userId)
    .eq("account_status", "active");

  if (membershipError || !memberships?.length) redirect("/dashboard?error=unauthorized");

  const membershipIds = memberships.map((membership) => membership.id);
  const { data: assignedRoles, error: rolesError } = await supabase
    .from("membership_roles")
    .select("membership_id, roles!inner(code,name)")
    .in("membership_id", membershipIds)
    .in("roles.code", [...ADMIN_ROLE_CODES]);

  if (rolesError || !assignedRoles?.length) redirect("/dashboard?error=unauthorized");

  const adminMembership = memberships.find((membership) =>
    assignedRoles.some((role) => role.membership_id === membership.id),
  );
  if (!adminMembership) redirect("/dashboard?error=unauthorized");
  const adminRole = assignedRoles.find((role) => role.membership_id === adminMembership.id) as unknown as { roles: { code: string } | { code: string }[] | null };
  const roleValue = Array.isArray(adminRole.roles) ? adminRole.roles[0] : adminRole.roles;

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", adminMembership.organization_id)
    .maybeSingle();

  if (organizationError || !organization) redirect("/dashboard?error=unauthorized");

  return {
    userId,
    organizationId: adminMembership.organization_id,
    organizationName: organization.name,
    roleCode: roleValue?.code ?? "org_admin",
  };
});

export type AdminMetric = {
  label: string;
  value: number;
  detail: string;
  tone: "blue" | "amber" | "red" | "green";
};

export type AdminActivity = {
  id: string;
  action: string;
  entity: string;
  occurredAt: string;
  illustrative?: boolean;
};

export async function getAdminOverview() {
  const context = await requireOrganizationAdmin();
  const supabase = await createSupabaseDataClient();
  const [staffResult, reviewResult, activityResult] = await Promise.all([
    supabase.from("organization_memberships").select("id", { count: "exact", head: true })
      .eq("organization_id", context.organizationId).eq("account_status", "active"),
    supabase.from("clinical_guidelines").select("id, guideline_versions!inner(id)")
      .eq("organization_id", context.organizationId).eq("guideline_versions.status", "under_review"),
    supabase.from("audit_events").select("id, action, entity_type, occurred_at")
      .eq("organization_id", context.organizationId).order("occurred_at", { ascending: false }).limit(8),
  ]);

  const metrics: AdminMetric[] = [
    { label: "Total Active Staff", value: staffResult.error ? 0 : staffResult.count ?? 0, detail: "Active organization members", tone: "blue" },
    { label: "Guidelines Pending Review", value: reviewResult.error ? 0 : new Set((reviewResult.data ?? []).map((item) => item.id)).size, detail: "Awaiting governance review", tone: "amber" },
  ];
  const activities: AdminActivity[] = activityResult.error ? [] : (activityResult.data ?? []).map((item) => ({
    id: item.id,
    action: item.action,
    entity: item.entity_type.replaceAll("_", " "),
    occurredAt: item.occurred_at,
    illustrative: false,
  }));
  return { context, metrics, activities, usingPreview: false };
}

export type StaffMember = {
  id: string;
  name: string;
  professionalLevel: string;
  specialty: string;
  systemRole: "Platform_Admin" | "Hospital_Admin" | "Editor" | "Clinician";
  status: "Active" | "Inactive";
};

export async function getAdminStaff(): Promise<{ context: OrganizationAdminContext; staff: StaffMember[] }> {
  const context = await requireOrganizationAdmin();
  const supabase = await createSupabaseDataClient();
  const { data, error } = await supabase
    .from("organization_memberships")
    .select("id, user_id, professional_level, account_status, profiles(display_name), membership_roles(roles(code,name))")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: true });
  if (error || !data) return { context, staff: [] };

  const roleLabels: Record<string, StaffMember["systemRole"]> = {
    platform_admin: "Platform_Admin", hospital_admin: "Hospital_Admin", org_admin: "Hospital_Admin",
    editor: "Editor", clinician: "Clinician",
  };
  const staff = (data as unknown as Array<{
    id: string; user_id: string; professional_level: string | null; account_status: string;
    profiles: { display_name: string } | { display_name: string }[] | null;
    membership_roles: Array<{ roles: { code: string; name: string } | { code: string; name: string }[] | null }> | null;
  }>).filter((member) => member.user_id !== context.userId).map((member) => {
    const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
    const assignedRole = member.membership_roles?.map((item) => Array.isArray(item.roles) ? item.roles[0] : item.roles).find(Boolean);
    const level = member.professional_level?.replaceAll("_", " ") ?? "Not specified";
    return {
      id: member.id,
      name: profile?.display_name ?? "Unnamed staff member",
      professionalLevel: level.replace(/\b\w/g, (letter) => letter.toUpperCase()),
      specialty: "Not specified",
      systemRole: roleLabels[assignedRole?.code ?? ""] ?? "Clinician",
      status: member.account_status === "active" ? "Active" as const : "Inactive" as const,
    };
  });
  return { context, staff };
}

export type GovernanceItem = { id: string; title: string; specialty: string; status: string; updatedAt: string; versionId?: string; versionNumber?: string; canEdit?: boolean };

export async function getGovernanceQueue(): Promise<{ context: OrganizationAdminContext; items: GovernanceItem[] }> {
  const context = await requireOrganizationAdmin();
  const supabase = await createSupabaseDataClient();
  const { data, error } = await supabase
    .from("clinical_guidelines")
    .select("id, title, specialty, status, created_at, guideline_versions!inner(id,version,status,is_current)")
    .eq("organization_id", context.organizationId)
    // Local Protocols have their own Drafts/Published tabs, not the disease governance queue.
    .neq("source_type", LOCAL_PROTOCOL_SOURCE_TYPE)
    .in("status", ["draft", "under_review"])
    .eq("guideline_versions.is_current", true)
    .in("guideline_versions.status", ["draft", "under_review"])
    .order("created_at", { ascending: true });

  if (error) return { context, items: [] };
  const sharedResult = context.roleCode === "platform_admin" ? await supabase
    .from("clinical_guidelines")
    .select("id,title,specialty,status,created_at")
    .is("organization_id", null).eq("is_shared_reference", true).eq("source_type", "curated-textbook-topic").eq("status", "published")
    .order("created_at", { ascending: true }) : { data: [], error: null };
  return {
    context,
    items: [...(data ?? []).map((item) => {
      const versions = item.guideline_versions as unknown as Array<{ id: string; version: string; status: string; is_current: boolean }>;
      const currentVersion = versions.find((version) => version.is_current && ["draft", "under_review"].includes(version.status));
      return {
        id: item.id,
        title: item.title,
        specialty: item.specialty ?? "Unassigned",
        status: item.status,
        updatedAt: item.created_at,
        versionId: currentVersion?.id,
        versionNumber: currentVersion?.version,
      };
    }), ...(sharedResult.data ?? []).map((item) => ({ id: item.id, title: item.title, specialty: item.specialty ?? "Unassigned", status: item.status, updatedAt: item.created_at, canEdit: true }))],
  };
}

export async function getDraftGuideline(id: string, requestedVersionId?: string) {
  const context = await requireOrganizationAdmin();
  const supabase = await createSupabaseDataClient();
  const canManageShared = context.roleCode === "platform_admin";
  let query = supabase
    .from("clinical_guidelines")
    .select("id,title,specialty,status,source_type,guideline_versions!inner(id,version,status,content,source_title,source_url,publication_date,review_date,is_current)")
    .eq("id", id);
  if (requestedVersionId) {
    query = query.eq("guideline_versions.id", requestedVersionId).in("guideline_versions.status", ["draft", "under_review", "published", "approved"]);
  } else {
    query = query.eq("guideline_versions.is_current", true);
  }
  query = canManageShared
    ? query.or(`organization_id.eq.${context.organizationId},and(organization_id.is.null,is_shared_reference.eq.true)`)
    : query.eq("organization_id", context.organizationId);
  const { data, error } = await query.maybeSingle();

  if (error || !data) return { state: "not-found" as const };
  const version = Array.isArray(data.guideline_versions) ? data.guideline_versions[0] : data.guideline_versions;
  if (!version) return { state: "not-found" as const };
  const parsed = DiseaseDetailSchema.safeParse(version.content);
  if (!parsed.success) return { state: "invalid" as const, title: data.title, sourceType: data.source_type as string, issues: parsed.error.issues.map((issue) => issue.message) };

  return {
    state: "ready" as const,
    title: data.title,
    sourceType: data.source_type as string,
    specialty: data.specialty ?? "Unassigned",
    disease: parsed.data,
    sourceTitle: version.source_title,
    sourceUrl: version.source_url,
    publicationDate: version.publication_date,
    reviewDate: version.review_date,
    versionId: version.id,
    versionStatus: version.status,
    isLive: version.is_current && version.status === "approved",
    isPublished: version.is_current && version.status === "published",
    canApprove: ["draft", "under_review"].includes(version.status),
  };
}

export async function getAdminSettings() {
  const context = await requireOrganizationAdmin();
  const supabase = await createSupabaseDataClient();
  const [profileResult, membershipResult, settingsResult] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", context.userId).maybeSingle(),
    supabase.from("organization_memberships").select("professional_level").eq("organization_id", context.organizationId).eq("user_id", context.userId).eq("account_status", "active").maybeSingle(),
    supabase.from("organization_settings").select("primary_color, locale, timezone").eq("organization_id", context.organizationId).maybeSingle(),
  ]);
  return {
    context,
    profile: {
      displayName: profileResult.data?.display_name ?? "Marifa Administrator",
      professionalLevel: membershipResult.data?.professional_level ?? "consultant",
    },
    settings: settingsResult.data ?? { primary_color: "#0e7490", locale: "en-SA", timezone: "Asia/Riyadh" },
  };
}
