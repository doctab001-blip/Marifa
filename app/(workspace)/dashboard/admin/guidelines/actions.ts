"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrganizationAdmin } from "@/lib/admin/data";
import { DiseaseDetailSchema } from "@/lib/validations/disease";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function saveDraftGuideline(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const rawContent = String(formData.get("content") ?? "");
  const editPath = `/dashboard/admin/guidelines/${encodeURIComponent(id)}`;
  if (!uuid.test(id)) redirect("/dashboard/admin/governance?error=invalid_id");

  let input: unknown;
  try {
    input = JSON.parse(rawContent);
  } catch {
    redirect(`${editPath}?error=invalid_json`);
  }

  const parsed = DiseaseDetailSchema.safeParse(input);
  if (!parsed.success || parsed.data.id !== id || parsed.data.status !== "draft") {
    redirect(`${editPath}?error=invalid_content`);
  }

  const context = await requireOrganizationAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: guideline, error: guidelineError } = await supabase
    .from("clinical_guidelines")
    .select("id")
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .eq("status", "draft")
    .maybeSingle();
  if (guidelineError || !guideline) redirect("/dashboard/admin/governance?error=not_editable");

  const { data: version, error: versionError } = await supabase
    .from("guideline_versions")
    .select("id")
    .eq("guideline_id", id)
    .eq("status", "draft")
    .eq("is_current", true)
    .maybeSingle();
  if (versionError || !version) redirect(`${editPath}?error=version_not_editable`);

  const { error: contentError } = await supabase
    .from("guideline_versions")
    .update({
      content: parsed.data,
      change_summary: "Draft content updated in the Marifa live editor; clinical and local governance review remains pending.",
    })
    .eq("id", version.id)
    .eq("guideline_id", id)
    .eq("status", "draft");
  if (contentError) redirect(`${editPath}?error=save_failed`);

  const { error: metadataError } = await supabase
    .from("clinical_guidelines")
    .update({ title: parsed.data.title, specialty: parsed.data.specialty })
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .eq("status", "draft");
  if (metadataError) redirect(`${editPath}?error=metadata_save_failed`);

  revalidatePath(editPath);
  revalidatePath("/dashboard/admin/governance");
  redirect(`${editPath}?saved=1`);
}
