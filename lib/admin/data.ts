import "server-only";

import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type OrganizationAdminContext = {
  userId: string;
  organizationId: string;
  organizationName: string;
};

// org_admin is the tenant administrator role currently seeded by Marifa;
// these aliases keep the guard compatible with the names used by the module spec.
const ADMIN_ROLE_CODES = ["org_admin", "hospital_admin", "platform_admin"] as const;

/** Every admin data loader calls this before it reads organization data. */
export const requireOrganizationAdmin = cache(async (): Promise<OrganizationAdminContext> => {
  if (!isSupabaseConfigured()) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (authError || typeof userId !== "string") redirect("/login");

  const { data: memberships, error: membershipError } = await supabase
    .from("organization_memberships")
    .select("id, organization_id")
    .eq("user_id", userId)
    .eq("account_status", "active");

  if (membershipError || !memberships?.length) notFound();

  const membershipIds = memberships.map((membership) => membership.id);
  const { data: assignedRoles, error: rolesError } = await supabase
    .from("membership_roles")
    .select("membership_id, roles!inner(code,name)")
    .in("membership_id", membershipIds)
    .in("roles.code", [...ADMIN_ROLE_CODES]);

  if (rolesError || !assignedRoles?.length) notFound();

  const adminMembership = memberships.find((membership) =>
    assignedRoles.some((role) => role.membership_id === membership.id),
  );
  if (!adminMembership) notFound();

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", adminMembership.organization_id)
    .maybeSingle();

  if (organizationError || !organization) notFound();

  return {
    userId,
    organizationId: adminMembership.organization_id,
    organizationName: organization.name,
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

const previewActivities: AdminActivity[] = [{
  id: "demo-activity-1",
  action: "Dr. Tabassum approved Adult Sepsis Recognition and Escalation v1.8",
  entity: "Illustrative demo governance activity",
  occurredAt: "2026-10-09T09:30:00+03:00",
  illustrative: true,
}];

const previewMetrics: AdminMetric[] = [
  { label: "Total active staff", value: 24, detail: "Illustrative demo value", tone: "blue" },
  { label: "Guidelines pending review", value: 7, detail: "Illustrative demo value", tone: "amber" },
  { label: "Overdue competencies", value: 3, detail: "Illustrative demo value", tone: "red" },
  { label: "Policies expiring soon", value: 2, detail: "Illustrative demo value", tone: "green" },
];

export async function getAdminOverview() {
  const context = await requireOrganizationAdmin();
  const supabase = await createSupabaseServerClient();

  const [staffResult, guidelineResult, competencyResult, activityResult] = await Promise.all([
    supabase.from("organization_memberships").select("id", { count: "exact", head: true })
      .eq("organization_id", context.organizationId).eq("account_status", "active"),
    supabase.from("clinical_guidelines").select("id", { count: "exact", head: true })
      .eq("organization_id", context.organizationId).in("status", ["draft", "under_review"]),
    supabase.from("competency_assignments").select("id", { count: "exact", head: true })
      .eq("organization_id", context.organizationId).eq("state", "overdue"),
    supabase.from("audit_events").select("id, action, entity_type, occurred_at")
      .eq("organization_id", context.organizationId).order("occurred_at", { ascending: false }).limit(6),
  ]);

  const metrics: AdminMetric[] = [
    staffResult.error || staffResult.count === null
      ? previewMetrics[0]
      : { ...previewMetrics[0], value: staffResult.count, detail: "Active organization memberships" },
    guidelineResult.error || guidelineResult.count === null
      ? previewMetrics[1]
      : { ...previewMetrics[1], value: guidelineResult.count, detail: "Draft or under review" },
    competencyResult.error || competencyResult.count === null
      ? previewMetrics[2]
      : { ...previewMetrics[2], value: competencyResult.count, detail: "Marked overdue" },
    previewMetrics[3],
  ];

  const activities: AdminActivity[] = activityResult.error ? previewActivities : (activityResult.data ?? []).map((event) => ({
    id: event.id,
    action: event.action,
    entity: event.entity_type.replaceAll("_", " "),
    occurredAt: event.occurred_at,
  }));

  if (!activities.length) activities.push(...previewActivities);
  return { context, metrics, activities, usingPreview: metrics.some((metric, index) => metric.detail === previewMetrics[index].detail) || activities.some((activity) => activity.illustrative) };
}

export type StaffMember = {
  id: string;
  name: string;
  professionalLevel: string;
  specialty: string;
  systemRole: "Admin" | "Editor" | "Clinician";
  status: "Active" | "Inactive";
};

type StaffQueryRow = {
  id: string;
  professional_level: string | null;
  account_status: string;
  profiles: { display_name: string } | Array<{ display_name: string }> | null;
  membership_roles: Array<{ roles: { code: string } | Array<{ code: string }> | null }> | null;
};

export async function getAdminStaff(): Promise<{ context: OrganizationAdminContext; staff: StaffMember[] }> {
  const context = await requireOrganizationAdmin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("organization_memberships")
    .select("id, professional_level, account_status, profiles!inner(display_name), membership_roles(roles(code))")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false });

  if (error) return { context, staff: [] };

  const staff = ((data ?? []) as unknown as StaffQueryRow[]).map((member) => {
    const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
    const codes = (member.membership_roles ?? []).flatMap((assignment) => {
      const roles = Array.isArray(assignment.roles) ? assignment.roles : assignment.roles ? [assignment.roles] : [];
      return roles.map((role) => role.code);
    });
    const systemRole = codes.includes("org_admin") ? "Admin" : codes.includes("guideline_editor") ? "Editor" : "Clinician";
    const professionalLevel = ({ mbbs_gp: "MBBS / GP", specialist: "Specialist", consultant: "Consultant" } as Record<string, string>)[member.professional_level ?? ""] ?? "Unassigned";

    return {
      id: member.id,
      name: profile?.display_name ?? "Unnamed staff member",
      professionalLevel,
      specialty: "Unassigned",
      systemRole,
      status: member.account_status === "active" ? "Active" : "Inactive",
    } satisfies StaffMember;
  });

  return { context, staff };
}

export type GovernanceItem = { id: string; title: string; specialty: string; status: string; updatedAt: string };

export async function getGovernanceQueue(): Promise<{ context: OrganizationAdminContext; items: GovernanceItem[] }> {
  const context = await requireOrganizationAdmin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clinical_guidelines")
    .select("id, title, specialty, status, created_at")
    .eq("organization_id", context.organizationId)
    .in("status", ["draft", "under_review"])
    .order("created_at", { ascending: true });

  if (error) return { context, items: [] };
  return {
    context,
    items: (data ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      specialty: item.specialty ?? "Unassigned",
      status: item.status,
      updatedAt: item.created_at,
    })),
  };
}

export async function getOrganizationSettings() {
  const context = await requireOrganizationAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("organization_settings")
    .select("primary_color, locale, timezone")
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  return { context, settings: data ?? { primary_color: "#1F3C88", locale: "en-SA", timezone: "Asia/Riyadh" } };
}
