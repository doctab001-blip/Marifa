import "server-only";
import { DiseaseDetailSchema, type DiseaseDetail } from "@/lib/validations/disease";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DiseaseGuidelineSummary = Pick<DiseaseDetail, "id" | "title" | "specialty" | "authority" | "status" | "version" | "lastReviewed" | "pillar"> & { summary: string; sourceType?: string };
type GuidelineVersionJoin = { content: unknown };
type GuidelineRow = { id: string; title: string; specialty: string | null; status: string; source_type: string; guideline_versions: GuidelineVersionJoin | GuidelineVersionJoin[] };

export type DiseaseDirectoryResult = { diseases: DiseaseGuidelineSummary[]; state: "ready" | "unavailable"; rejectedCount: number };
export type DiseaseDetailResult =
  | { state: "ready"; disease: DiseaseDetail }
  | { state: "not-found" }
  | { state: "invalid" }
  | { state: "unavailable" };

const approvedStatuses = ["approved", "published"] as const;
const postPublicationReviewId = "a14c7e92-5b31-4d68-9f20-6c83e1b7a405";

function currentContent(row: GuidelineRow) {
  return Array.isArray(row.guideline_versions) ? row.guideline_versions[0]?.content : row.guideline_versions?.content;
}

function isApproved(disease: DiseaseDetail) {
  return disease.status === "approved" || disease.status === "published";
}

function toSummary(disease: DiseaseDetail): Omit<DiseaseGuidelineSummary, "sourceType"> {
  return { id: disease.id, title: disease.title, specialty: disease.specialty, authority: disease.authority, status: disease.status, version: disease.version, lastReviewed: disease.lastReviewed, pillar: disease.pillar, summary: disease.pathophysiology.summary };
}

export async function getApprovedDiseaseGuidelines(): Promise<DiseaseDirectoryResult> {
  if (!isSupabaseConfigured()) return { diseases: [], state: "unavailable", rejectedCount: 0 };
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("clinical_guidelines")
      .select("id,title,specialty,status,source_type,guideline_versions!inner(content)")
      .is("organization_id", null)
      .in("status", [...approvedStatuses])
      .eq("guideline_versions.is_current", true)
      .in("guideline_versions.status", [...approvedStatuses])
      .order("title", { ascending: true });
    if (error) throw error;

    const diseases: DiseaseGuidelineSummary[] = [];
    let rejectedCount = 0;
    for (const row of (data ?? []) as unknown as GuidelineRow[]) {
      const parsed = DiseaseDetailSchema.safeParse(currentContent(row));
      if (!parsed.success || !isApproved(parsed.data) || parsed.data.id !== row.id || row.status !== parsed.data.status || row.title !== parsed.data.title || row.specialty !== parsed.data.specialty) {
        rejectedCount += 1;
        continue;
      }
      diseases.push({ ...toSummary(parsed.data), sourceType: row.source_type });
    }

    const { data: reviewData, error: reviewError } = await supabase
      .from("clinical_guidelines")
      .select("id,title,specialty,status,source_type,guideline_versions!inner(content)")
      .eq("id", postPublicationReviewId)
      .is("organization_id", null)
      .eq("status", "approved")
      .eq("guideline_versions.is_current", false)
      .eq("guideline_versions.status", "under_review")
      .maybeSingle();
    if (reviewError) throw reviewError;
    if (reviewData) {
      const row = reviewData as unknown as GuidelineRow;
      const parsed = DiseaseDetailSchema.safeParse(currentContent(row));
      if (parsed.success && parsed.data.status === "under_review" && parsed.data.id === row.id) {
        const index = diseases.findIndex((disease) => disease.id === row.id);
        if (index >= 0) diseases[index] = { ...toSummary(parsed.data), sourceType: row.source_type };
      } else {
        rejectedCount += 1;
      }
    }
    return { diseases, state: "ready", rejectedCount };
  } catch {
    return { diseases: [], state: "unavailable", rejectedCount: 0 };
  }
}

export async function getApprovedDiseaseGuideline(id: string): Promise<DiseaseDetailResult> {
  if (!isSupabaseConfigured()) return { state: "unavailable" };
  try {
    const supabase = await createSupabaseServerClient();
    if (id === postPublicationReviewId) {
      const { data: reviewData, error: reviewError } = await supabase
        .from("clinical_guidelines")
        .select("id,guideline_versions!inner(content)")
        .eq("id", id)
        .is("organization_id", null)
        .eq("status", "approved")
        .eq("guideline_versions.is_current", false)
        .eq("guideline_versions.status", "under_review")
        .maybeSingle();
      if (reviewError) throw reviewError;
      if (reviewData) {
        const reviewRow = reviewData as unknown as GuidelineRow;
        const reviewContent = DiseaseDetailSchema.safeParse(currentContent(reviewRow));
        if (!reviewContent.success || reviewContent.data.id !== reviewRow.id || reviewContent.data.status !== "under_review") return { state: "invalid" };
        return { state: "ready", disease: reviewContent.data };
      }
    }
    const { data, error } = await supabase
      .from("clinical_guidelines")
      .select("id,guideline_versions!inner(content)")
      .eq("id", id)
      .is("organization_id", null)
      .in("status", [...approvedStatuses])
      .eq("guideline_versions.is_current", true)
      .in("guideline_versions.status", [...approvedStatuses])
      .maybeSingle();
    if (error) throw error;
    if (!data) return { state: "not-found" };

    const row = data as unknown as GuidelineRow;
    const parsed = DiseaseDetailSchema.safeParse(currentContent(row));
    if (!parsed.success || !isApproved(parsed.data) || parsed.data.id !== row.id) return { state: "invalid" };
    return { state: "ready", disease: parsed.data };
  } catch {
    return { state: "unavailable" };
  }
}
