import "server-only";
import { clinicalReviewOverrides } from "@/lib/data/clinical-review-overrides";
import { mergedTopics } from "@/lib/data/merged-topics";
import { DiseaseDetailSchema, type DiseaseDetail } from "@/lib/validations/disease";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { hasMedicalSpeciality, inferMedicalSpecialityTags } from "@/lib/medical-specialities";

export type DiseaseGuidelineSummary = Pick<DiseaseDetail, "id" | "title" | "specialty" | "authority" | "status" | "version" | "lastReviewed" | "pillar" | "clinicalReviewStatus"> & { summary: string; sourceType?: string; speciality?: string; subSpecialities?: string[] };
type GuidelineVersionJoin = { content: unknown; source_title?: string | null; source_url?: string | null };
type GuidelineRow = { id: string; title: string; specialty: string | null; speciality_id?: string | null; speciality?: { name: string } | { name: string }[] | null; sub_specialities?: string[] | null; status: string; source_type: string; guideline_versions: GuidelineVersionJoin | GuidelineVersionJoin[] };

export type DiseaseDirectoryResult = { diseases: DiseaseGuidelineSummary[]; state: "ready" | "unavailable"; rejectedCount: number };
export type DiseaseDetailResult =
  | { state: "ready"; disease: DiseaseDetail; investigationSource?: { title: string; url: string } }
  | { state: "not-found" }
  | { state: "invalid" }
  | { state: "unavailable" };

const approvedStatuses = ["approved", "published"] as const;

function currentContent(row: GuidelineRow) {
  return Array.isArray(row.guideline_versions) ? row.guideline_versions[0]?.content : row.guideline_versions?.content;
}

function currentSource(row: GuidelineRow) {
  const version = Array.isArray(row.guideline_versions) ? row.guideline_versions[0] : row.guideline_versions;
  if (!version?.source_title || !version.source_url || !/^https?:\/\//.test(version.source_url)) return undefined;
  return { title: version.source_title, url: version.source_url };
}

function isApproved(disease: DiseaseDetail) {
  return disease.status === "approved" || disease.status === "published";
}

function toSummary(disease: DiseaseDetail, row: GuidelineRow): Omit<DiseaseGuidelineSummary, "sourceType"> {
  const inferred = inferMedicalSpecialityTags(disease.specialty);
  const catalogSpeciality = Array.isArray(row.speciality) ? row.speciality[0]?.name : row.speciality?.name;
  const speciality = catalogSpeciality ?? disease.speciality ?? inferred[0] ?? disease.specialty;
  return { id: disease.id, title: disease.title, specialty: disease.specialty, speciality, subSpecialities: disease.sub_specialities ?? row.sub_specialities ?? inferred.filter((tag) => tag !== speciality), authority: disease.authority, clinicalReviewStatus: disease.clinicalReviewStatus, status: disease.status, version: disease.version, lastReviewed: disease.lastReviewed, pillar: disease.pillar, summary: disease.pathophysiology.summary };
}

export async function getApprovedDiseaseGuidelines(filters: { speciality?: string; carePillar?: string } = {}): Promise<DiseaseDirectoryResult> {
  if (!isSupabaseConfigured()) return { diseases: [], state: "unavailable", rejectedCount: 0 };
  try {
    const supabase = await createSupabaseDataClient();
    const { data, error } = await supabase
      .from("clinical_guidelines")
      .select("id,title,specialty,speciality_id,speciality:specialties!clinical_guidelines_speciality_id_fkey(name),sub_specialities,status,source_type,guideline_versions!inner(content)")
      .is("organization_id", null)
      .in("status", [...approvedStatuses])
      .eq("guideline_versions.is_current", true)
      .in("guideline_versions.status", [...approvedStatuses])
      .order("title", { ascending: true });
    if (error) throw error;

    const diseases: DiseaseGuidelineSummary[] = [];
    let rejectedCount = 0;
    for (const row of (data ?? []) as unknown as GuidelineRow[]) {
      if (Object.hasOwn(mergedTopics, row.id)) continue;
      const parsed = DiseaseDetailSchema.safeParse(currentContent(row));
      if (!parsed.success || !isApproved(parsed.data) || parsed.data.id !== row.id || row.status !== parsed.data.status || row.title !== parsed.data.title || row.specialty !== parsed.data.specialty) {
        rejectedCount += 1;
        continue;
      }
      const summary = toSummary(parsed.data, row);
      if (filters.speciality && ![summary.speciality ?? summary.specialty, ...(summary.subSpecialities ?? [])].some((tag) => hasMedicalSpeciality(tag, filters.speciality!))) continue;
      if (filters.carePillar && parsed.data.pillar !== filters.carePillar) continue;
      diseases.push({ ...summary, sourceType: row.source_type });
    }

    for (const [reviewId, reviewVersion] of Object.entries(clinicalReviewOverrides)) {
      let reviewQuery = supabase
        .from("clinical_guidelines")
        .select("id,title,specialty,status,source_type,guideline_versions!inner(content)")
        .eq("id", reviewId)
        .is("organization_id", null)
        .in("status", [...approvedStatuses])
        .eq("guideline_versions.is_current", false)
        .eq("guideline_versions.status", "under_review");
      if (reviewVersion) reviewQuery = reviewQuery.eq("guideline_versions.version", reviewVersion);
      const { data: reviewData, error: reviewError } = await reviewQuery.maybeSingle();
      if (reviewError) throw reviewError;
      if (reviewData) {
        const row = reviewData as unknown as GuidelineRow;
        const parsed = DiseaseDetailSchema.safeParse(currentContent(row));
        if (parsed.success && parsed.data.status === "under_review" && parsed.data.id === row.id) {
          const index = diseases.findIndex((disease) => disease.id === row.id);
          if (index >= 0) diseases[index] = { ...toSummary(parsed.data, row), sourceType: row.source_type };
        } else {
          rejectedCount += 1;
        }
      }
    }
    return { diseases, state: "ready", rejectedCount };
  } catch (error) {
    console.error("[disease-guidelines] directory load failed", error);
    return { diseases: [], state: "unavailable", rejectedCount: 0 };
  }
}

export async function getApprovedDiseaseGuideline(id: string): Promise<DiseaseDetailResult> {
  if (!isSupabaseConfigured()) return { state: "unavailable" };
  try {
    const supabase = await createSupabaseDataClient();
    if (Object.hasOwn(clinicalReviewOverrides, id)) {
      let reviewQuery = supabase
        .from("clinical_guidelines")
        .select("id,guideline_versions!inner(content,source_title,source_url)")
        .eq("id", id)
        .is("organization_id", null)
        .in("status", [...approvedStatuses])
        .eq("guideline_versions.is_current", false)
        .eq("guideline_versions.status", "under_review");
      const reviewVersion = clinicalReviewOverrides[id];
      if (reviewVersion) reviewQuery = reviewQuery.eq("guideline_versions.version", reviewVersion);
      const { data: reviewData, error: reviewError } = await reviewQuery.maybeSingle();
      if (reviewError) throw reviewError;
      if (reviewData) {
        const reviewRow = reviewData as unknown as GuidelineRow;
        const reviewContent = DiseaseDetailSchema.safeParse(currentContent(reviewRow));
        if (!reviewContent.success || reviewContent.data.id !== reviewRow.id || reviewContent.data.status !== "under_review") return { state: "invalid" };
        return { state: "ready", disease: reviewContent.data, investigationSource: currentSource(reviewRow) };
      }
    }
    const { data, error } = await supabase
      .from("clinical_guidelines")
      .select("id,guideline_versions!inner(content,source_title,source_url)")
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
    return { state: "ready", disease: parsed.data, investigationSource: currentSource(row) };
  } catch (error) {
    console.error("[disease-guidelines] topic load failed", error);
    return { state: "unavailable" };
  }
}
