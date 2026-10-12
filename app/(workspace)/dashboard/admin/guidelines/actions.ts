"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CLINICAL_DIRECTORY_TAG } from "@/lib/data/cache-tags";
import { redirect } from "next/navigation";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { requireOrganizationAdmin } from "@/lib/admin/data";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";
import { DiseaseDetailSchema } from "@/lib/validations/disease";
import { approvalErrorCode } from "@/lib/approval-errors";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function saveDraftGuideline(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const versionId = String(formData.get("versionId") ?? "");
  const rawContent = String(formData.get("content") ?? "");
  const editPath = `/dashboard/admin/guidelines/${encodeURIComponent(id)}?version=${encodeURIComponent(versionId)}`;
  if (!uuid.test(id) || !uuid.test(versionId)) redirect("/dashboard/admin/governance?error=invalid_id");

  let input: unknown;
  try {
    input = JSON.parse(rawContent);
  } catch {
    redirect(`${editPath}&error=invalid_json`);
  }

  const parsed = DiseaseDetailSchema.safeParse(input);
  if (!parsed.success || parsed.data.id !== id || !["draft", "under_review"].includes(parsed.data.status)) {
    redirect(`${editPath}&error=invalid_content`);
  }

  const context = await requireOrganizationAdmin();
  const supabase = await createSupabaseDataClient();
  let guidelineQuery = supabase.from("clinical_guidelines").select("id,organization_id,is_shared_reference").eq("id", id);
  guidelineQuery = context.roleCode === "platform_admin"
    ? guidelineQuery.or(`organization_id.eq.${context.organizationId},and(organization_id.is.null,is_shared_reference.eq.true)`)
    : guidelineQuery.eq("organization_id", context.organizationId);
  const { data: guideline, error: guidelineError } = await guidelineQuery.maybeSingle();
  if (guidelineError || !guideline) redirect("/dashboard/admin/governance?error=not_editable");

  const { data: version, error: versionError } = await supabase
    .from("guideline_versions")
    .select("id,status,is_current")
    .eq("id", versionId)
    .eq("guideline_id", id)
    .maybeSingle();
  if (versionError || !version) redirect(`${editPath}&error=version_not_editable`);
  if (version.status !== parsed.data.status || !["draft", "under_review"].includes(version.status)) redirect(`${editPath}&error=version_not_editable`);

  const { error: contentError } = await supabase
    .from("guideline_versions")
    .update({
      content: parsed.data,
      change_summary: "Draft content updated in the Marifa editor; clinical and local governance review remains pending.",
    })
    .eq("id", version.id)
    .eq("guideline_id", id)
    .eq("status", parsed.data.status);
  if (contentError) redirect(`${editPath}&error=save_failed`);

  if (!guideline.is_shared_reference || version.is_current) {
    let metadataQuery = supabase.from("clinical_guidelines").update({ title: parsed.data.title, specialty: parsed.data.specialty }).eq("id", id);
    metadataQuery = guideline.is_shared_reference
      ? metadataQuery.is("organization_id", null).eq("is_shared_reference", true)
      : metadataQuery.eq("organization_id", context.organizationId);
    const { error: metadataError } = await metadataQuery;
    if (metadataError) redirect(`${editPath}&error=metadata_save_failed`);
  }

  revalidatePath(editPath);
  revalidatePath("/dashboard/admin/governance");
  updateTag(CLINICAL_DIRECTORY_TAG);
  revalidatePath("/dashboard/diseases");
  revalidatePath("/dashboard/diseases/drafts");
  revalidatePath(`/dashboard/diseases/${encodeURIComponent(id)}`);
  redirect(`${editPath}&saved=1`);
}

export async function approveGuidelineVersion(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const versionId = String(formData.get("versionId") ?? "");
  const destination = String(formData.get("destination") ?? "governance");
  if (!uuid.test(id) || !uuid.test(versionId)) redirect("/dashboard/admin/governance?error=invalid_id");

  const context = await requireOrganizationAdmin();
  if (!["org_admin", "hospital_admin", "platform_admin"].includes(context.roleCode)) {
    redirect("/dashboard/admin/governance?error=not_authorized");
  }

  const supabase = await createSupabaseDataClient();
  const { error } = isTemporaryOpenAdminMode()
    ? await supabase.rpc("approve_clinical_guideline_version_as_temporary_admin", {
      p_guideline_id: id,
      p_version_id: versionId,
      p_actor_id: context.userId,
    })
    : await supabase.rpc("approve_clinical_guideline_version", {
      p_guideline_id: id,
      p_version_id: versionId,
    });
  if (error) {
    if (error.code === "22023") {
      const { data: receipt } = await supabase.from("guideline_versions")
        .select("status,is_current,approved_by,approved_at")
        .eq("id", versionId).eq("guideline_id", id).maybeSingle();
      if (receipt?.is_current && ["approved", "published"].includes(receipt.status) && receipt.approved_by && receipt.approved_at) {
        updateTag(CLINICAL_DIRECTORY_TAG);
        revalidatePath("/dashboard/diseases/drafts");
        redirect(destination === "drafts" ? "/dashboard/diseases/drafts?approved=1" : "/dashboard/admin/governance?approved=1");
      }
    }
    console.error("Clinical version approval failed", { code: error.code, guidelineId: id, versionId });
    const code = approvalErrorCode(error.code);
    redirect(`${destination === "drafts" ? "/dashboard/diseases/drafts" : "/dashboard/admin/governance"}?error=${code}`);
  }

  revalidatePath("/dashboard/admin/governance");
  revalidatePath("/dashboard/diseases/drafts");
  updateTag(CLINICAL_DIRECTORY_TAG);
  revalidatePath("/dashboard/diseases");
  revalidatePath(`/dashboard/diseases/${encodeURIComponent(id)}`);
  redirect(destination === "drafts" ? "/dashboard/diseases/drafts?approved=1" : "/dashboard/admin/governance?approved=1");
}
