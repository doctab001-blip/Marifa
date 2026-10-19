"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CLINICAL_DIRECTORY_TAG } from "@/lib/data/cache-tags";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { requireOrganizationAdmin } from "@/lib/admin/data";
import { DiseaseDetailSchema } from "@/lib/validations/disease";
import { auditTopicContent } from "@/lib/clinical-authoring-audit";
import { isDevEditMode } from "@/lib/dev-edit-mode";
import { LOCAL_PROTOCOL_SOURCE_TYPE, PROTOCOLS_DRAFTS, PROTOCOLS_HOME, PROTOCOLS_PUBLISHED } from "@/lib/local-protocols";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function refresh(id: string) {
  updateTag(CLINICAL_DIRECTORY_TAG);
  revalidatePath(PROTOCOLS_HOME);
  revalidatePath(PROTOCOLS_DRAFTS);
  revalidatePath(PROTOCOLS_PUBLISHED);
  revalidatePath(`${PROTOCOLS_HOME}/${encodeURIComponent(id)}`);
}

/** Loads a version only when it belongs to a Local Protocol owned by the administrator's organization. */
async function loadProtocolVersion(id: string, versionId: string, fallback: string) {
  if (!uuid.test(id) || !uuid.test(versionId)) redirect(`${fallback}?error=invalid_id`);
  const context = await requireOrganizationAdmin();
  const supabase = await createSupabaseDataClient();
  const { data: guideline } = await supabase.from("clinical_guidelines").select("id")
    .eq("id", id).eq("source_type", LOCAL_PROTOCOL_SOURCE_TYPE).eq("organization_id", context.organizationId).maybeSingle();
  if (!guideline) redirect(`${fallback}?error=not_found`);
  const { data: version } = await supabase.from("guideline_versions").select("id,status,content")
    .eq("id", versionId).eq("guideline_id", id).maybeSingle();
  if (!version) redirect(`${fallback}?error=not_found`);
  return { context, supabase, version };
}

/** Draft -> Published. The version becomes the one current version of the protocol. */
export async function publishProtocol(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const versionId = String(formData.get("versionId") ?? "");
  const { context, supabase, version } = await loadProtocolVersion(id, versionId, PROTOCOLS_DRAFTS);
  if (!["draft", "under_review"].includes(version.status)) redirect(`${PROTOCOLS_DRAFTS}?error=not_a_draft`);
  const parsed = DiseaseDetailSchema.safeParse(version.content);
  if (!parsed.success || parsed.data.id !== id) redirect(`${PROTOCOLS_DRAFTS}?error=invalid_content`);

  // Same rule as every other publish path: the 80% authoring score applies once governance is enforced (MARIFA_ENFORCE_GOVERNANCE=true).
  if (!isDevEditMode() && !auditTopicContent({ ...parsed.data, status: "under_review" }).publishable) redirect(`${PROTOCOLS_DRAFTS}?error=below_threshold`);

  const now = new Date().toISOString();
  const content = { ...parsed.data, status: "published" as const };
  // The database allows one current version per topic, so release the previous one first.
  const { error: releaseError } = await supabase.from("guideline_versions").update({ is_current: false }).eq("guideline_id", id).eq("is_current", true).neq("id", versionId);
  if (releaseError) redirect(`${PROTOCOLS_DRAFTS}?error=publish_failed`);
  const { error: versionError } = await supabase.from("guideline_versions").update({
    status: "published", content, is_current: true, approved_by: context.userId, approved_at: now, published_at: now,
  }).eq("id", versionId).eq("guideline_id", id);
  if (versionError) redirect(`${PROTOCOLS_DRAFTS}?error=publish_failed`);
  const { error: guidelineError } = await supabase.from("clinical_guidelines")
    .update({ status: "published", title: parsed.data.title, specialty: parsed.data.specialty }).eq("id", id);
  if (guidelineError) redirect(`${PROTOCOLS_DRAFTS}?error=publish_failed`);

  refresh(id);
  redirect(`${PROTOCOLS_PUBLISHED}?published=1`);
}

/** Published -> Draft. History is kept; the protocol leaves the Published list immediately. */
export async function revertProtocolToDraft(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const versionId = String(formData.get("versionId") ?? "");
  const { supabase, version } = await loadProtocolVersion(id, versionId, PROTOCOLS_PUBLISHED);
  if (version.status !== "published") redirect(`${PROTOCOLS_PUBLISHED}?error=not_published`);
  const parsed = DiseaseDetailSchema.safeParse(version.content);
  if (!parsed.success || parsed.data.id !== id) redirect(`${PROTOCOLS_PUBLISHED}?error=invalid_content`);

  const { error: versionError } = await supabase.from("guideline_versions").update({
    status: "draft", content: { ...parsed.data, status: "draft" as const }, approved_by: null, approved_at: null, published_at: null,
  }).eq("id", versionId).eq("guideline_id", id);
  if (versionError) redirect(`${PROTOCOLS_PUBLISHED}?error=revert_failed`);
  const { error: guidelineError } = await supabase.from("clinical_guidelines").update({ status: "draft" }).eq("id", id);
  if (guidelineError) redirect(`${PROTOCOLS_PUBLISHED}?error=revert_failed`);

  refresh(id);
  redirect(`${PROTOCOLS_DRAFTS}?reverted=1`);
}

/** Deletes one draft version. If it was the topic's only version, the empty topic is removed too. */
export async function deleteProtocolDraft(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const versionId = String(formData.get("versionId") ?? "");
  const { supabase, version } = await loadProtocolVersion(id, versionId, PROTOCOLS_DRAFTS);
  if (!["draft", "under_review"].includes(version.status)) redirect(`${PROTOCOLS_DRAFTS}?error=not_a_draft`);

  const { error } = await supabase.from("guideline_versions").delete().eq("id", versionId).eq("guideline_id", id).in("status", ["draft", "under_review"]);
  if (error) redirect(`${PROTOCOLS_DRAFTS}?error=delete_failed`);
  const { count } = await supabase.from("guideline_versions").select("id", { count: "exact", head: true }).eq("guideline_id", id);
  if (count === 0) await supabase.from("clinical_guidelines").delete().eq("id", id).eq("source_type", LOCAL_PROTOCOL_SOURCE_TYPE);

  refresh(id);
  redirect(`${PROTOCOLS_DRAFTS}?deleted=1`);
}
