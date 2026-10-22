import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";
import { CLINICAL_DIRECTORY_TAG } from "@/lib/data/cache-tags";
import { mergedTopics } from "@/lib/data/merged-topics";
import { collapseTopicFamilies } from "@/lib/data/topic-families";
import { DiseaseDetailSchema, type DiseaseDetail } from "@/lib/validations/disease";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { canonicalSpeciality, hasMedicalSpeciality, inferMedicalSpecialityTags } from "@/lib/medical-specialities";
import { isClinicalDirectoryEligible } from "@/lib/data/clinical-directory-eligibility";
import { DEFAULT_REGION, REGION_COOKIE, resolveRegion } from "@/lib/region";
import { isTopicVisibleInRegion } from "@/lib/region-topics";
import type { CountryCode } from "@/types/clinical";

export type DiseaseGuidelineSummary = Pick<DiseaseDetail, "id" | "title" | "specialty" | "authority" | "status" | "version" | "lastReviewed" | "pillar" | "clinicalReviewStatus"> & { summary: string; sourceType?: string; speciality?: string; subSpecialities?: string[]; keywords?: string[] };
type GuidelineVersionJoin = { content: unknown; source_title?: string | null; source_url?: string | null };
type GuidelineRow = { id: string; title: string; specialty: string | null; speciality_id?: string | null; speciality?: { name: string } | { name: string }[] | null; sub_specialities?: string[] | null; status: string; source_type: string; guideline_versions: GuidelineVersionJoin | GuidelineVersionJoin[] };

export type DiseaseDirectoryResult = { diseases: DiseaseGuidelineSummary[]; state: "ready" | "unavailable"; rejectedCount: number; withheldCount: number };
export type DiseaseDetailResult =
  | { state: "ready"; disease: DiseaseDetail; investigationSource?: { title: string; url: string } }
  | { state: "not-found" }
  | { state: "invalid" }
  | { state: "unavailable" };

// This module powers end-user views and search. Staged and draft versions must
// never cross this boundary. An audit-eligible published version is live while
// clinical sign-off remains visibly pending; approval creates a later additive
// `approved` version without rewriting its history.
const liveStatuses = ["published", "approved"] as const;

function currentContent(row: GuidelineRow) {
  return Array.isArray(row.guideline_versions) ? row.guideline_versions[0]?.content : row.guideline_versions?.content;
}

function currentSource(row: GuidelineRow) {
  const version = Array.isArray(row.guideline_versions) ? row.guideline_versions[0] : row.guideline_versions;
  if (!version?.source_title || !version.source_url || !/^https?:\/\//.test(version.source_url)) return undefined;
  return { title: version.source_title, url: version.source_url };
}

function isLive(disease: DiseaseDetail) {
  return liveStatuses.some((status) => status === disease.status);
}

const MAX_SEARCH_KEYWORDS = 40;
const MAX_KEYWORD_LENGTH = 80;

// Search-only terms taken from the topic's own content (symptoms, signs, differentials, drugs, tests,
// triggers). They let clinicians find a topic by what they see or prescribe, not just by its title.
export function searchKeywords(disease: DiseaseDetail): string[] {
  const candidates = [
    ...disease.presentation.symptoms,
    ...disease.presentation.physicalSigns,
    ...(disease.presentation.precipitants ?? []),
    ...disease.differentials.map(({ condition }) => condition),
    ...(disease.medicationPlan?.regimens.map(({ genericName }) => genericName) ?? []),
    ...disease.investigations.ruleIn.map(({ testName }) => testName),
    ...(disease.diagnosticCriteria?.map(({ criterion }) => criterion) ?? []),
  ];
  const seen = new Set<string>();
  const keywords: string[] = [];
  for (const candidate of candidates) {
    const text = candidate.trim().slice(0, MAX_KEYWORD_LENGTH);
    const key = text.toLocaleLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    keywords.push(text);
    if (keywords.length >= MAX_SEARCH_KEYWORDS) break;
  }
  return keywords;
}

function toSummary(disease: DiseaseDetail, row: GuidelineRow): Omit<DiseaseGuidelineSummary, "sourceType"> {
  const inferred = inferMedicalSpecialityTags(disease.specialty);
  const catalogSpeciality = Array.isArray(row.speciality) ? row.speciality[0]?.name : row.speciality?.name;
  // One canonical speciality per topic, the same one every list, filter and side-panel group uses.
  const speciality = canonicalSpeciality(disease.specialty, catalogSpeciality ?? disease.speciality);
  return { id: disease.id, title: disease.title, specialty: disease.specialty, speciality, subSpecialities: disease.sub_specialities ?? row.sub_specialities ?? inferred.filter((tag) => tag !== speciality), authority: disease.authority, clinicalReviewStatus: disease.clinicalReviewStatus, status: disease.status, version: disease.version, lastReviewed: disease.lastReviewed, pillar: disease.pillar, summary: disease.pathophysiology.summary, keywords: searchKeywords(disease) };
}

export { CLINICAL_DIRECTORY_TAG };
const CROSS_REQUEST_CACHE_SECONDS = 300;

type DirectoryPayload = { diseases: DiseaseGuidelineSummary[]; rejectedCount: number; withheldCount: number };

// Loads and validates the complete published catalogue. Throws on failure so a failed load is never cached.
async function loadDirectory(): Promise<DirectoryPayload> {
  const supabase = await createSupabaseDataClient();
  const { data, error } = await supabase
    .from("clinical_guidelines")
    .select("id,title,specialty,speciality_id,speciality:specialties!clinical_guidelines_speciality_id_fkey(name),sub_specialities,status,source_type,guideline_versions!inner(content)")
    .is("organization_id", null)
    .in("status", [...liveStatuses])
    .eq("guideline_versions.is_current", true)
    .in("guideline_versions.status", [...liveStatuses])
    .order("title", { ascending: true });
  if (error) throw error;

  const diseases: DiseaseGuidelineSummary[] = [];
  let rejectedCount = 0;
  let withheldCount = 0;
  for (const row of (data ?? []) as unknown as GuidelineRow[]) {
    if (Object.hasOwn(mergedTopics, row.id)) continue;
    const parsed = DiseaseDetailSchema.safeParse(currentContent(row));
    if (!parsed.success || !isLive(parsed.data) || parsed.data.id !== row.id || row.status !== parsed.data.status || row.title !== parsed.data.title || row.specialty !== parsed.data.specialty) {
      rejectedCount += 1;
      continue;
    }
    // Live automatically when the current version scores >= 80% on the authoring audit; otherwise it stays in Draft.
    if (!isClinicalDirectoryEligible(parsed.data)) {
      withheldCount += 1;
      continue;
    }
    diseases.push({ ...toSummary(parsed.data, row), sourceType: row.source_type });
  }

  // Review overrides are intentionally excluded from end-user results. A
  // non-current under-review version may be useful to admins, but is not public.
  return { diseases, rejectedCount, withheldCount };
}

// With temporary open administration, clinical data is read with a server key rather than the viewer's
// cookies, so one validated catalogue can be shared across requests. Otherwise row-level security depends
// on the signed-in viewer and the catalogue is only reused within a single request.
const loadSharedDirectory = unstable_cache(loadDirectory, ["clinical-directory-v4"], { tags: [CLINICAL_DIRECTORY_TAG], revalidate: CROSS_REQUEST_CACHE_SECONDS });

const getDirectoryForRequest = cache(async (): Promise<DirectoryPayload | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    return isTemporaryOpenAdminMode() ? await loadSharedDirectory() : await loadDirectory();
  } catch (error) {
    console.error("[disease-guidelines] directory load failed", error);
    return null;
  }
});

/** The practice region of the current request (cookie), defaulting to Saudi Arabia outside a request. */
async function requestRegion(): Promise<CountryCode> {
  try {
    return resolveRegion(undefined, (await cookies()).get(REGION_COOKIE)?.value);
  } catch {
    return DEFAULT_REGION;
  }
}

/**
 * Live topics for one practice region. India topics are listed only in the India region, and India adaptations
 * replace their Saudi counterparts there; the Saudi catalogue is unchanged (lib/region-topics.ts).
 */
export async function getApprovedDiseaseGuidelines(filters: { speciality?: string; carePillar?: string; includeFamilyMembers?: boolean; region?: CountryCode } = {}): Promise<DiseaseDirectoryResult> {
  const payload = await getDirectoryForRequest();
  if (!payload) return { diseases: [], state: "unavailable", rejectedCount: 0, withheldCount: 0 };
  const region = filters.region ?? await requestRegion();
  const filteredDiseases = payload.diseases.filter((summary) => {
    if (!isTopicVisibleInRegion(summary, region)) return false;
    if (filters.speciality && ![summary.speciality ?? summary.specialty, ...(summary.subSpecialities ?? [])].some((tag) => hasMedicalSpeciality(tag, filters.speciality!))) return false;
    if (filters.carePillar && summary.pillar !== filters.carePillar) return false;
    return true;
  });
  const diseases = filters.includeFamilyMembers ? filteredDiseases : collapseTopicFamilies(filteredDiseases);
  return { diseases, state: "ready", rejectedCount: payload.rejectedCount, withheldCount: payload.withheldCount };
}

type TopicPayload = Exclude<DiseaseDetailResult, { state: "unavailable" }>;

// Loads one validated topic. Throws on failure so a failed load is never cached.
async function loadTopic(id: string): Promise<TopicPayload> {
  const supabase = await createSupabaseDataClient();
  const { data, error } = await supabase
    .from("clinical_guidelines")
    .select("id,guideline_versions!inner(content,source_title,source_url)")
    .eq("id", id)
    .is("organization_id", null)
    .in("status", [...liveStatuses])
    .eq("guideline_versions.is_current", true)
    .in("guideline_versions.status", [...liveStatuses])
    .maybeSingle();
  if (error) throw error;
  if (!data) return { state: "not-found" };

  const row = data as unknown as GuidelineRow;
  const parsed = DiseaseDetailSchema.safeParse(currentContent(row));
  if (!parsed.success || !isLive(parsed.data) || parsed.data.id !== row.id) return { state: "invalid" };
  if (!isClinicalDirectoryEligible(parsed.data)) return { state: "not-found" };
  return { state: "ready", disease: parsed.data, investigationSource: currentSource(row) };
}

const loadSharedTopic = unstable_cache(loadTopic, ["clinical-topic-v5"], { tags: [CLINICAL_DIRECTORY_TAG], revalidate: CROSS_REQUEST_CACHE_SECONDS });

export const getApprovedDiseaseGuideline = cache(async (id: string): Promise<DiseaseDetailResult> => {
  if (!isSupabaseConfigured()) return { state: "unavailable" };
  try {
    return isTemporaryOpenAdminMode() ? await loadSharedTopic(id) : await loadTopic(id);
  } catch (error) {
    console.error("[disease-guidelines] topic load failed", error);
    return { state: "unavailable" };
  }
});

/** Loads a specific approved version, including non-current approval history. */
export const getApprovedDiseaseGuidelineVersion = cache(async (id: string, versionId: string): Promise<DiseaseDetailResult> => {
  if (!isSupabaseConfigured()) return { state: "unavailable" };
  try {
    const supabase = await createSupabaseDataClient();
    const { data, error } = await supabase
      .from("clinical_guidelines")
      .select("id,guideline_versions!inner(content,source_title,source_url,id,status)")
      .eq("id", id)
      .is("organization_id", null)
      .eq("status", "approved")
      .eq("guideline_versions.id", versionId)
      .eq("guideline_versions.status", "approved")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { state: "not-found" };

    const row = data as unknown as GuidelineRow;
    const parsed = DiseaseDetailSchema.safeParse(currentContent(row));
    if (!parsed.success || parsed.data.status !== "approved" || parsed.data.id !== row.id) return { state: "invalid" };
    return { state: "ready", disease: parsed.data, investigationSource: currentSource(row) };
  } catch (error) {
    console.error("[disease-guidelines] approved version load failed", error);
    return { state: "unavailable" };
  }
});
