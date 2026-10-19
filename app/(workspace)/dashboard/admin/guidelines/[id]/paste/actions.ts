"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CLINICAL_DIRECTORY_TAG } from "@/lib/data/cache-tags";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { requireOrganizationAdmin } from "@/lib/admin/data";
import { DiseaseDetailSchema } from "@/lib/validations/disease";
import { auditTopicContent, CLINICAL_DIRECTORY_MINIMUM_SCORE } from "@/lib/clinical-authoring-audit";
import { parsePastedTopic } from "@/lib/topic-paste";
import { isDevEditMode } from "@/lib/dev-edit-mode";
import { LOCAL_PROTOCOL_SOURCE_TYPE, PROTOCOLS_DRAFTS, PROTOCOLS_HOME, PROTOCOLS_PUBLISHED } from "@/lib/local-protocols";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_PASTE_CHARACTERS = 400_000;

function riyadhToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/** Drops earlier "-live", "-revision-…" and "-pasted-…" suffixes so version names do not grow with every save. */
function baseVersionName(version: string) {
  let name = version;
  for (let guard = 0; guard < 10; guard += 1) {
    const next = name.replace(/-live$/, "").replace(/-(?:revision|pasted)-\d{10,}$/, "");
    if (next === name) break;
    name = next;
  }
  return name;
}

/**
 * Saves a whole pasted topic as a NEW version (never edits a row in place).
 *
 * The text is parsed again here on the server, so nothing the browser claims about the score is trusted.
 * mode "draft"   -> saved as under_review only.
 * mode "publish" -> saved as under_review, then published as a new "-live" row only if the audit score
 *                   is at least 80%. Clinical approval is never set; clinicalReviewStatus stays "pending".
 * No AI service is called: the parser is plain code, so this costs no Claude or Codex credits.
 */
export async function savePastedTopic(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const versionId = String(formData.get("versionId") ?? "");
  const markdown = String(formData.get("markdown") ?? "");
  const mode = formData.get("mode") === "draft" ? "draft" : "publish";
  const useTitle = formData.get("useTitle") === "on";
  const pastePath = `/dashboard/admin/guidelines/${encodeURIComponent(id)}/paste`;
  const here = `${pastePath}?version=${encodeURIComponent(versionId)}`;
  if (!uuid.test(id) || !uuid.test(versionId)) redirect("/dashboard/admin/governance?error=invalid_id");
  if (!markdown.trim()) redirect(`${here}&error=empty`);
  if (markdown.length > MAX_PASTE_CHARACTERS) redirect(`${here}&error=too_large`);

  const context = await requireOrganizationAdmin();
  const supabase = await createSupabaseDataClient();
  let guidelineQuery = supabase.from("clinical_guidelines").select("id,organization_id,is_shared_reference,source_type").eq("id", id);
  guidelineQuery = context.roleCode === "platform_admin"
    ? guidelineQuery.or(`organization_id.eq.${context.organizationId},and(organization_id.is.null,is_shared_reference.eq.true)`)
    : guidelineQuery.eq("organization_id", context.organizationId);
  const { data: guideline, error: guidelineError } = await guidelineQuery.maybeSingle();
  if (guidelineError || !guideline) redirect("/dashboard/admin/governance?error=not_editable");
  // Local Protocols stay Drafts until published explicitly ("Publish" mode here, or the Publish action).
  const isProtocol = guideline.source_type === LOCAL_PROTOCOL_SOURCE_TYPE;

  const { data: version, error: versionError } = await supabase
    .from("guideline_versions")
    .select("id,status,version,content,source_title,issuing_organization,source_url,jurisdiction,last_verified_date,review_date")
    .eq("id", versionId)
    .eq("guideline_id", id)
    .maybeSingle();
  const devEdit = isDevEditMode();
  const editableStatuses = devEdit ? ["draft", "under_review", "published", "approved"] : ["draft", "under_review", "published"];
  if (versionError || !version || !editableStatuses.includes(version.status)) redirect(`${here}&error=version_not_editable`);

  const base = DiseaseDetailSchema.safeParse(version.content);
  if (!base.success) redirect(`${here}&error=version_not_editable`);

  const parsed = parsePastedTopic(markdown, base.data, { today: riyadhToday(), useTitleFromPaste: useTitle });
  if (!parsed.content || parsed.parsedCount === 0) redirect(`${here}&error=paste_invalid`);

  const suffix = new Date().toISOString().replace(/[-:.TZ]/g, "");
  const revision = `${baseVersionName(version.version)}-pasted-${suffix}`;
  const reviewStatus = isProtocol ? ("draft" as const) : ("under_review" as const);
  const reviewContent = { ...parsed.content, version: revision, status: reviewStatus, clinicalReviewStatus: "pending" as const };
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
    status: reviewStatus,
    is_current: false,
    approved_by: null,
    approved_at: null,
    published_at: null,
    content: reviewContent,
    change_summary: `Whole-topic paste (offline editor) saved on top of ${version.version}; prior version preserved. Authoring-standard score ${audit.score}%. Clinical review pending.`,
  }).select("id").single();
  if (reviewError || !reviewVersion) redirect(`${here}&error=save_failed`);

  let published = false;
  let destinationVersionId = reviewVersion.id;
  if (mode === "publish" && (audit.publishable || devEdit)) {
    const liveVersion = `${revision}-live`;
    const now = new Date().toISOString();
    const liveContent = { ...reviewContent, version: liveVersion, status: "published" as const };
    const { data: liveRow, error: liveError } = await supabase.from("guideline_versions").insert({
      ...shared,
      version: liveVersion,
      version_number: liveVersion,
      status: "published",
      is_current: false,
      approved_by: context.userId,
      approved_at: now,
      published_at: now,
      content: liveContent,
      change_summary: `Published from ${revision}: authoring-standard score ${audit.score}% (threshold ${CLINICAL_DIRECTORY_MINIMUM_SCORE}%${audit.publishable ? "" : "; not met, published anyway in development edit mode"}). Clinical review remains pending.`,
    }).select("id").single();
    if (liveError || !liveRow) redirect(`${here}&error=save_failed`);
    const { error: previousError } = await supabase.from("guideline_versions").update({ is_current: false }).eq("guideline_id", id).eq("is_current", true);
    const { error: currentError } = await supabase.from("guideline_versions").update({ is_current: true }).eq("id", liveRow.id);
    if (previousError || currentError) redirect(`${here}&error=save_failed`);
    let metadataQuery = supabase.from("clinical_guidelines").update({ title: parsed.content.title, specialty: parsed.content.specialty, status: "published" }).eq("id", id);
    metadataQuery = guideline.is_shared_reference
      ? metadataQuery.is("organization_id", null).eq("is_shared_reference", true)
      : metadataQuery.eq("organization_id", context.organizationId);
    const { error: metadataError } = await metadataQuery;
    if (metadataError) redirect(`${here}&error=metadata_save_failed`);
    published = true;
    destinationVersionId = liveRow.id;
  }

  updateTag(CLINICAL_DIRECTORY_TAG);
  revalidatePath(pastePath);
  revalidatePath("/dashboard/admin/governance");
  revalidatePath("/dashboard/diseases");
  revalidatePath("/dashboard/diseases/drafts");
  revalidatePath("/dashboard/diseases/published");
  revalidatePath(`/dashboard/diseases/${encodeURIComponent(id)}`);
  if (isProtocol) { revalidatePath(PROTOCOLS_HOME); revalidatePath(PROTOCOLS_DRAFTS); revalidatePath(PROTOCOLS_PUBLISHED); revalidatePath(`${PROTOCOLS_HOME}/${encodeURIComponent(id)}`); }
  const destination = `${pastePath}?version=${encodeURIComponent(destinationVersionId)}`;
  redirect(`${destination}&saved=1&${published ? "published=1" : `score=${audit.score}${mode === "draft" ? "&draft=1" : ""}`}`);
}
