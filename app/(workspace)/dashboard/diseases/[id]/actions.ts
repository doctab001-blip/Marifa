"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CLINICAL_DIRECTORY_TAG } from "@/lib/data/cache-tags";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { requireOrganizationAdmin } from "@/lib/admin/data";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";
import { DiseaseDetailSchema } from "@/lib/validations/disease";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const copied = ["guideline_id", "source_title", "issuing_organization", "source_url", "jurisdiction", "last_verified_date", "review_date", "published_at"] as const;

type VersionRow = Record<string, unknown> & { id: string; version: string; status: string; content: unknown };

function riyadhToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/**
 * Clinical sign-off for a live topic whose clinical review is pending.
 * Additive: inserts a NEW "<version>-approved" row (status approved, clinicalReviewStatus removed),
 * makes it current and keeps every earlier version. Nothing is edited in place.
 */
export async function approveLiveTopic(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const topicPath = `/dashboard/diseases/${encodeURIComponent(id)}`;
  const toApprovedList = formData.get("destination") === "approved";
  if (!uuid.test(id)) redirect("/dashboard/diseases?error=invalid_id");

  const context = await requireOrganizationAdmin();
  if (!["org_admin", "hospital_admin", "platform_admin"].includes(context.roleCode)) redirect(`${topicPath}?approval=not_authorized`);

  const supabase = await createSupabaseDataClient();
  const { data: current, error: currentError } = await supabase
    .from("guideline_versions")
    .select("*")
    .eq("guideline_id", id)
    .eq("is_current", true)
    .maybeSingle();
  if (currentError || !current) redirect(`${topicPath}?approval=failed`);
  const source = current as VersionRow;

  const parsed = DiseaseDetailSchema.safeParse(source.content);
  if (!parsed.success || parsed.data.id !== id) redirect(`${topicPath}?approval=failed`);
  const content = parsed.data;
  if (content.status === "approved" && !content.clinicalReviewStatus) redirect(toApprovedList ? "/dashboard/diseases/approved" : `${topicPath}?approval=already`);
  if (!["published", "approved"].includes(source.status) || !["published", "approved"].includes(content.status)) {
    redirect(`${topicPath}?approval=failed`);
  }

  const baseVersion = source.version.replace(/-approved(-\d+)?$/, "");
  let approvedVersion = `${baseVersion}-approved`;
  const { data: existing } = await supabase.from("guideline_versions").select("version").eq("guideline_id", id).like("version", `${baseVersion}-approved%`);
  if (existing?.length) approvedVersion = `${baseVersion}-approved-${existing.length + 1}`;

  const { clinicalReviewStatus: _pending, ...rest } = content;
  void _pending;
  const approvedContent = { ...rest, status: "approved" as const, version: approvedVersion, lastReviewed: riyadhToday() };
  const now = new Date().toISOString();
  const row: Record<string, unknown> = Object.fromEntries(copied.map((field) => [field, source[field] ?? null]));
  Object.assign(row, {
    version: approvedVersion,
    version_number: approvedVersion,
    status: "approved",
    is_current: false,
    content: approvedContent,
    approved_by: context.userId,
    approved_at: now,
    created_by: context.userId,
    change_summary: `Clinically approved from the topic page (from ${source.version}). Content unchanged; clinical review status cleared.${isTemporaryOpenAdminMode() ? " Recorded in temporary no-login admin mode: approver identity is the configured platform administrator, not a verified sign-in." : ""} Previous versions preserved.`,
  });

  const { data: inserted, error: insertError } = await supabase.from("guideline_versions").insert(row).select("id").single();
  if (insertError || !inserted) {
    console.error("Topic approval insert failed", { code: insertError?.code, guidelineId: id });
    redirect(`${topicPath}?approval=failed`);
  }

  const { error: unflagError } = await supabase.from("guideline_versions").update({ is_current: false }).eq("id", source.id);
  if (unflagError) redirect(`${topicPath}?approval=failed`);
  const { error: flagError } = await supabase.from("guideline_versions").update({ is_current: true }).eq("id", inserted.id);
  if (flagError) {
    await supabase.from("guideline_versions").update({ is_current: true }).eq("id", source.id);
    redirect(`${topicPath}?approval=failed`);
  }
  const { error: guidelineError } = await supabase.from("clinical_guidelines").update({ status: "approved" }).eq("id", id);
  if (guidelineError) {
    // Roll back so the catalogue row and current content keep the same status.
    await supabase.from("guideline_versions").update({ is_current: false }).eq("id", inserted.id);
    await supabase.from("guideline_versions").update({ is_current: true }).eq("id", source.id);
    redirect(`${topicPath}?approval=failed`);
  }

  updateTag(CLINICAL_DIRECTORY_TAG);
  revalidatePath("/dashboard/diseases");
  revalidatePath("/dashboard/diseases/published");
  revalidatePath("/dashboard/diseases/approved");
  revalidatePath(topicPath);
  redirect(toApprovedList ? "/dashboard/diseases/approved?approved=1" : `${topicPath}?approval=done`);
}
