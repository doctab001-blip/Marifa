import "server-only";
import { DiseaseDetailSchema, type DiseaseDetail } from "@/lib/validations/disease";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasMedicalSpeciality, inferMedicalSpecialityTags } from "@/lib/medical-specialities";

export type DiseaseGuidelineSummary = Pick<DiseaseDetail, "id" | "title" | "specialty" | "authority" | "status" | "version" | "lastReviewed" | "pillar" | "clinicalReviewStatus"> & { summary: string; sourceType?: string; speciality?: string; subSpecialities?: string[] };
type GuidelineVersionJoin = { content: unknown };
type GuidelineRow = { id: string; title: string; specialty: string | null; speciality_id?: string | null; speciality?: { name: string } | { name: string }[] | null; sub_specialities?: string[] | null; status: string; source_type: string; guideline_versions: GuidelineVersionJoin | GuidelineVersionJoin[] };

export type DiseaseDirectoryResult = { diseases: DiseaseGuidelineSummary[]; state: "ready" | "unavailable"; rejectedCount: number };
export type DiseaseDetailResult =
  | { state: "ready"; disease: DiseaseDetail }
  | { state: "not-found" }
  | { state: "invalid" }
  | { state: "unavailable" };

const approvedStatuses = ["approved", "published"] as const;

function currentContent(row: GuidelineRow) {
  return Array.isArray(row.guideline_versions) ? row.guideline_versions[0]?.content : row.guideline_versions?.content;
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
    const supabase = await createSupabaseServerClient();
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
    return { diseases, state: "ready", rejectedCount };
  } catch {
    return { diseases: [], state: "unavailable", rejectedCount: 0 };
  }
}

export async function getApprovedDiseaseGuideline(id: string): Promise<DiseaseDetailResult> {
  if (!isSupabaseConfigured()) return { state: "unavailable" };
  try {
    const supabase = await createSupabaseServerClient();
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
