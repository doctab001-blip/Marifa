"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CLINICAL_DIRECTORY_TAG } from "@/lib/data/cache-tags";
import { redirect } from "next/navigation";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { requireOrganizationAdmin } from "@/lib/admin/data";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";
import { DiseaseDetailSchema } from "@/lib/validations/disease";
import { approvalErrorCode } from "@/lib/approval-errors";
import { auditTopicContent, CLINICAL_DIRECTORY_MINIMUM_SCORE } from "@/lib/clinical-authoring-audit";

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
  if (!parsed.success || parsed.data.id !== id || !["draft", "under_review", "published"].includes(parsed.data.status)) {
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
    .select("id,status,is_current,version,source_title,issuing_organization,source_url,jurisdiction,last_verified_date,review_date")
    .eq("id", versionId)
    .eq("guideline_id", id)
    .maybeSingle();
  if (versionError || !version) redirect(`${editPath}&error=version_not_editable`);
  if (version.status !== parsed.data.status || !["draft", "under_review", "published"].includes(version.status)) redirect(`${editPath}&error=version_not_editable`);

  // Every editor save is additive. The row being edited stays intact as
  // history; the submitted content becomes a fresh, reviewable version.
  const suffix = new Date().toISOString().replace(/[-:.TZ]/g, "");
  const revision = `${version.version.replace(/-live$/, "")}-revision-${suffix}`;
  const reviewContent = { ...parsed.data, version: revision, status: "under_review" as const, clinicalReviewStatus: "pending" as const };
  const audit = auditTopicContent(reviewContent);
  const shared = {
    guideline_id: id,
    source_title: version.source_title,
    issuing_organization: version.issuing_organization,
    source_url: version.source_url,
    jurisdiction: version.jurisdiction,
    last_verified_date: version.last_verified_date,
    review_date: version.review_date,
    created_by: context.userId,
  };
  const { data: reviewVersion, error: reviewError } = await supabase.from("guideline_versions").insert({
    ...shared,
    version: revision,
    version_number: revision,
    status: "under_review",
    is_current: false,
    approved_by: null,
    approved_at: null,
    published_at: null,
    content: reviewContent,
    change_summary: `New editor revision created from ${version.version}; prior version preserved. Authoring-standard score ${audit.score}%. Clinical review pending.`,
  }).select("id").single();
  if (reviewError || !reviewVersion) redirect(`${editPath}&error=save_failed`);

  let published = false;
  let destinationVersionId = reviewVersion.id;
  if (audit.publishable) {
    const liveVersion = `${revision}-live`;
    const now = new Date().toISOString();
    const liveContent = { ...reviewContent, version: liveVersion, status: "published" as const };
    const { data: liveVersionRow, error: liveError } = await supabase.from("guideline_versions").insert({
      ...shared,
      version: liveVersion,
      version_number: liveVersion,
      status: "published",
      is_current: false,
      approved_by: context.userId,
      approved_at: now,
      published_at: now,
      content: liveContent,
      change_summary: `Published automatically from ${revision}: authoring-standard score ${audit.score}% (threshold ${CLINICAL_DIRECTORY_MINIMUM_SCORE}%). Clinical review remains pending.`,
    }).select("id").single();
    if (liveError || !liveVersionRow) redirect(`${editPath}&error=save_failed`);
    const { error: previousCurrentError } = await supabase.from("guideline_versions").update({ is_current: false }).eq("guideline_id", id).eq("is_current", true);
    const { error: currentError } = await supabase.from("guideline_versions").update({ is_current: true }).eq("guideline_id", id).eq("version", liveVersion);
    if (previousCurrentError || currentError) redirect(`${editPath}&error=save_failed`);
    let metadataQuery = supabase.from("clinical_guidelines").update({ title: parsed.data.title, specialty: parsed.data.specialty, status: "published" }).eq("id", id);
    metadataQuery = guideline.is_shared_reference
      ? metadataQuery.is("organization_id", null).eq("is_shared_reference", true)
      : metadataQuery.eq("organization_id", context.organizationId);
    const { error: metadataError } = await metadataQuery;
    if (metadataError) redirect(`${editPath}&error=metadata_save_failed`);
    published = true;
    destinationVersionId = liveVersionRow.id;
  }

  revalidatePath(editPath);
  revalidatePath("/dashboard/admin/governance");
  updateTag(CLINICAL_DIRECTORY_TAG);
  revalidatePath("/dashboard/diseases");
  revalidatePath("/dashboard/diseases/drafts");
  revalidatePath("/dashboard/diseases/approved");
  revalidatePath(`/dashboard/diseases/${encodeURIComponent(id)}`);
  const destination = `/dashboard/admin/guidelines/${encodeURIComponent(id)}?version=${encodeURIComponent(destinationVersionId)}`;
  redirect(`${destination}&saved=1&${published ? "published=1" : `under_review=1&score=${audit.score}`}`);
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
  revalidatePath("/dashboard/diseases/approved");
  updateTag(CLINICAL_DIRECTORY_TAG);
  revalidatePath("/dashboard/diseases");
  revalidatePath(`/dashboard/diseases/${encodeURIComponent(id)}`);
  redirect(destination === "drafts" ? "/dashboard/diseases/drafts?approved=1" : "/dashboard/admin/governance?approved=1");
}

/** Moves a draft through the administrator-only staging workflow. */
export async function transitionGuidelineVersion(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const versionId = String(formData.get("versionId") ?? "");
  const target = String(formData.get("target") ?? "");
  const destination = target === "approved" ? "/dashboard/diseases/approved" : target === "published" ? "/dashboard/diseases/published" : "/dashboard/diseases/drafts";
  if (!uuid.test(id) || !uuid.test(versionId) || !["draft", "published", "approved"].includes(target)) redirect(destination);
  const context = await requireOrganizationAdmin();
  const supabase = await createSupabaseDataClient();
  const { data: version } = await supabase.from("guideline_versions").select("id,status,is_current,content").eq("id", versionId).eq("guideline_id", id).maybeSingle();
  if (!version) redirect(destination);
  const allowed = (version.status === "draft" || version.status === "under_review") && target === "published"
    || version.status === "published" && (target === "draft" || target === "approved");
  const parsed = DiseaseDetailSchema.safeParse(version.content);
  if (!allowed || !parsed.success) redirect(destination);
  const content = { ...parsed.data, status: target as "draft" | "published" | "approved" };
  if (target === "approved") delete content.clinicalReviewStatus;
  const { error } = await supabase.from("guideline_versions").update({ status: target, content, approved_by: target === "approved" ? context.userId : null, approved_at: target === "approved" ? new Date().toISOString() : null }).eq("id", versionId);
  if (error) redirect(destination);
  if (target === "approved" && !version.is_current) {
    await supabase.from("guideline_versions").update({ is_current: false }).eq("guideline_id", id).eq("is_current", true);
    await supabase.from("guideline_versions").update({ is_current: true }).eq("id", versionId);
  }
  if (version.is_current || target === "approved") await supabase.from("clinical_guidelines").update({ status: target }).eq("id", id);
  updateTag(CLINICAL_DIRECTORY_TAG);
  revalidatePath("/dashboard/diseases"); revalidatePath("/dashboard/diseases/drafts"); revalidatePath("/dashboard/diseases/published"); revalidatePath("/dashboard/diseases/approved");
  redirect(destination);
}

/** Starts a new editable draft while leaving the live approved version intact. */
export async function createDraftFromApproved(formData: FormData) {
  const id = String(formData.get("id") ?? ""); const versionId = String(formData.get("versionId") ?? "");
  if (!uuid.test(id) || !uuid.test(versionId)) redirect("/dashboard/diseases/approved");
  const context = await requireOrganizationAdmin(); const supabase = await createSupabaseDataClient();
  const { data: source } = await supabase.from("guideline_versions").select("*").eq("id", versionId).eq("guideline_id", id).eq("status", "approved").maybeSingle();
  const parsed = DiseaseDetailSchema.safeParse(source?.content);
  if (!source || !parsed.success) redirect("/dashboard/diseases/approved");
  const version = `${source.version}-draft-${Date.now()}`;
  const { error } = await supabase.from("guideline_versions").insert({ ...source, id: undefined, version, version_number: version, status: "draft", is_current: false, approved_by: null, approved_at: null, created_by: context.userId, content: { ...parsed.data, version, status: "draft", clinicalReviewStatus: "pending" }, change_summary: `Editable draft created from approved version ${source.version}; approved version preserved.` });
  if (error) redirect("/dashboard/diseases/approved");
  revalidatePath("/dashboard/diseases/drafts"); redirect("/dashboard/diseases/drafts");
}

export async function deleteDraftVersion(formData: FormData) {
  const id = String(formData.get("id") ?? ""); const versionId = String(formData.get("versionId") ?? "");
  if (!uuid.test(id) || !uuid.test(versionId)) redirect("/dashboard/diseases/drafts");
  await requireOrganizationAdmin(); const supabase = await createSupabaseDataClient();
  await supabase.from("guideline_versions").delete().eq("id", versionId).eq("guideline_id", id).in("status", ["draft", "under_review"]);
  revalidatePath("/dashboard/diseases/drafts"); redirect("/dashboard/diseases/drafts");
}
