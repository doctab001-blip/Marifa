"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrganizationAdmin } from "@/lib/admin/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";

const themes = ["#1f3c88", "#0e7490", "#166534", "#7c3aed", "#be123c"] as const;
const levels = ["mbbs_gp", "specialist", "consultant"] as const;
const locales = ["en-SA", "ar-SA"] as const;
const timezones = ["Asia/Riyadh", "UTC"] as const;

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function saveAdminSettings(formData: FormData) {
  if (isTemporaryOpenAdminMode()) redirect("/dashboard/admin/settings?error=temporary_mode#profile");
  const context = await requireOrganizationAdmin();
  const displayName = field(formData, "display_name");
  const professionalLevel = field(formData, "professional_level");
  const primaryColor = field(formData, "primary_color").toLowerCase();
  const locale = field(formData, "locale");
  const timezone = field(formData, "timezone");

  if (
    displayName.length < 2 || displayName.length > 80 ||
    !levels.includes(professionalLevel as (typeof levels)[number]) ||
    !themes.includes(primaryColor as (typeof themes)[number]) ||
    !locales.includes(locale as (typeof locales)[number]) ||
    !timezones.includes(timezone as (typeof timezones)[number])
  ) {
    redirect("/dashboard/admin/settings?error=invalid#profile");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("save_admin_settings", {
    p_organization_id: context.organizationId,
    p_display_name: displayName,
    p_professional_level: professionalLevel,
    p_primary_color: primaryColor,
    p_locale: locale,
    p_timezone: timezone,
  });

  if (error) redirect("/dashboard/admin/settings?error=save#profile");

  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/dashboard");
  redirect("/dashboard/admin/settings?saved=1#profile");
}
