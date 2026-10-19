import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { createServiceClient } from "@/lib/recent-developments/service-client";
import { DEVELOPMENT_CATEGORIES, type DevelopmentCategory, type DevelopmentRow } from "@/lib/recent-developments/types";

export type DevelopmentFilters = { category: string; speciality: string; source: string; saudi: boolean; query: string };
export const emptyDevelopmentFilters: DevelopmentFilters = { category: "", speciality: "", source: "", saudi: false, query: "" };

export type DevelopmentList =
  | { state: "ok"; items: DevelopmentRow[] }
  | { state: "unavailable" };

const BASE_COLUMNS = "id, source_id, category, title, excerpt, source_url, doi, published_at, specialities, saudi_relevant, status, created_at, reviewed_at";
const COLUMNS = `${BASE_COLUMNS}, summary, summary_source, free_full_text_url`;
// Until the summary migration (20261019090000) is applied, fall back to the original columns so the page keeps working.
const withSummaryDefaults = (rows: unknown[] | null) => (rows ?? []).map((row) => ({ summary: null, summary_source: null, free_full_text_url: null, ...(row as object) })) as DevelopmentRow[];
const isMissingSummaryColumn = (message: string) => /summary|free_full_text_url/i.test(message);
const ARCHIVE_COLUMNS = `${COLUMNS}, year, significance, why_it_matters, region, source_label, origin`;
const isMissingArchiveColumn = (message: string) => /origin|significance|why_it_matters|region|source_label|\byear\b/i.test(message);
const LIMIT = 60;
export const ARCHIVE_PAGE_SIZE = 24;
export const ARCHIVE_FIRST_YEAR = 2016;

export type ArchiveFilters = { year: number | null; category: string; speciality: string; saudi: boolean; gcc: boolean; landmarks: boolean; query: string; page: number };
export type ArchiveList =
  | { state: "ok"; items: DevelopmentRow[]; total: number; yearCounts: Record<number, number> }
  | { state: "unavailable" }
  | { state: "migration_needed" };

/** The curated, worldwide archive (origin = 'archive'). Needs migration 20261019100000. */
export async function getArchive(filters: ArchiveFilters): Promise<ArchiveList> {
  if (!isSupabaseConfigured()) return { state: "unavailable" };
  try {
    const supabase = await createSupabaseDataClient();
    const text = filters.query.replace(/[%_,()]/g, " ").trim().slice(0, 80);
    let query = supabase.from("recent_developments").select(ARCHIVE_COLUMNS, { count: "exact" }).eq("status", "published").eq("origin", "archive");
    if (filters.year) query = query.eq("year", filters.year);
    if ((DEVELOPMENT_CATEGORIES as readonly string[]).includes(filters.category)) query = query.eq("category", filters.category as DevelopmentCategory);
    if (filters.speciality) query = query.contains("specialities", [filters.speciality]);
    if (filters.saudi) query = query.eq("saudi_relevant", true);
    if (filters.gcc) query = query.in("region", ["gcc", "ksa"]);
    if (filters.landmarks) query = query.eq("significance", 1);
    if (text) query = query.ilike("title", `%${text}%`);
    const from = (Math.max(1, filters.page) - 1) * ARCHIVE_PAGE_SIZE;
    const { data, error, count } = await query.order("published_at", { ascending: false }).range(from, from + ARCHIVE_PAGE_SIZE - 1);
    if (error) {
      if (isMissingArchiveColumn(error.message)) return { state: "migration_needed" };
      console.warn("[recent-developments] archive unavailable", error.message);
      return { state: "unavailable" };
    }
    // Year chips: counts for the other active filters, ignoring the year itself.
    let counts = supabase.from("recent_developments").select("year").eq("status", "published").eq("origin", "archive");
    if ((DEVELOPMENT_CATEGORIES as readonly string[]).includes(filters.category)) counts = counts.eq("category", filters.category as DevelopmentCategory);
    if (filters.speciality) counts = counts.contains("specialities", [filters.speciality]);
    if (filters.saudi) counts = counts.eq("saudi_relevant", true);
    if (filters.gcc) counts = counts.in("region", ["gcc", "ksa"]);
    if (filters.landmarks) counts = counts.eq("significance", 1);
    if (text) counts = counts.ilike("title", `%${text}%`);
    const { data: yearRows } = await counts.limit(2000);
    const yearCounts: Record<number, number> = {};
    for (const row of (yearRows ?? []) as unknown as { year: number }[]) yearCounts[row.year] = (yearCounts[row.year] ?? 0) + 1;
    return { state: "ok", items: withSummaryDefaults(data as unknown as unknown[] | null), total: count ?? 0, yearCounts };
  } catch (error) {
    console.warn("[recent-developments] archive unavailable", error);
    return { state: "unavailable" };
  }
}

/** Published items only (row-level security enforces this for signed-in users). */
export async function getPublishedDevelopments(filters: DevelopmentFilters = emptyDevelopmentFilters): Promise<DevelopmentList> {
  if (!isSupabaseConfigured()) return { state: "unavailable" };
  try {
    const supabase = await createSupabaseDataClient();
    const text = filters.query.replace(/[%_,()]/g, " ").trim().slice(0, 80);
    const run = (columns: string, withOrigin = true) => {
      let query = supabase.from("recent_developments").select(columns).eq("status", "published");
      if (withOrigin) query = query.neq("origin", "archive");
      if ((DEVELOPMENT_CATEGORIES as readonly string[]).includes(filters.category)) query = query.eq("category", filters.category as DevelopmentCategory);
      if (filters.speciality) query = query.contains("specialities", [filters.speciality]);
      if (filters.source) query = query.eq("source_id", filters.source);
      if (filters.saudi) query = query.eq("saudi_relevant", true);
      if (text) query = query.ilike("title", `%${text}%`);
      return query.order("published_at", { ascending: false }).order("created_at", { ascending: false }).limit(LIMIT);
    };
    let { data, error } = await run(COLUMNS);
    if (error && /origin/i.test(error.message)) ({ data, error } = await run(COLUMNS, false));
    if (error && isMissingSummaryColumn(error.message)) ({ data, error } = await run(BASE_COLUMNS, false));
    if (error) {
      console.warn("[recent-developments] list unavailable", error.message);
      return { state: "unavailable" };
    }
    return { state: "ok", items: withSummaryDefaults(data as unknown as unknown[] | null) };
  } catch (error) {
    console.warn("[recent-developments] list unavailable", error);
    return { state: "unavailable" };
  }
}

/** Items waiting for an administrator. Callers must have passed requireOrganizationAdmin() first. */
export async function getPendingDevelopments(): Promise<DevelopmentRow[]> {
  try {
    const run = (columns: string) => createServiceClient()
      .from("recent_developments")
      .select(columns)
      .eq("status", "pending_review")
      .order("published_at", { ascending: false })
      .limit(100);
    let { data, error } = await run(COLUMNS);
    if (error && isMissingSummaryColumn(error.message)) ({ data, error } = await run(BASE_COLUMNS));
    if (error) throw new Error(error.message);
    return withSummaryDefaults(data as unknown as unknown[] | null);
  } catch (error) {
    console.warn("[recent-developments] pending list unavailable", error);
    return [];
  }
}

export type SpotlightItem = Pick<DevelopmentRow, "id" | "category" | "title" | "summary" | "why_it_matters" | "source_url" | "published_at" | "specialities" | "source_label" | "saudi_relevant">;
const SPOTLIGHT_SIZE = 30;

/**
 * Dashboard spotlight: landmark items (any type) plus guidelines and key trials from the curated archive,
 * published in the last ten years, spread evenly across the years in a fresh random order for each page load.
 * Returns an empty list when the archive is unavailable or not migrated yet; the panel then links to the page.
 */
export async function getSpotlightDevelopments(): Promise<SpotlightItem[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createSupabaseDataClient();
    const since = new Date();
    since.setUTCFullYear(since.getUTCFullYear() - 10);
    const { data, error } = await supabase
      .from("recent_developments")
      .select("id, category, title, summary, why_it_matters, source_url, published_at, specialities, source_label, saudi_relevant, year")
      .eq("status", "published")
      .eq("origin", "archive")
      .gte("published_at", since.toISOString().slice(0, 10))
      .or("significance.eq.1,category.in.(guideline_update,key_trial)")
      .limit(600);
    if (error) {
      console.warn("[recent-developments] spotlight unavailable", error.message);
      return [];
    }
    const byYear = new Map<number, SpotlightItem[]>();
    for (const row of (data ?? []) as unknown as (SpotlightItem & { year: number })[]) {
      const bucket = byYear.get(row.year) ?? [];
      bucket.push(row);
      byYear.set(row.year, bucket);
    }
    const shuffle = <T,>(list: T[]) => { for (let i = list.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; } return list; };
    const buckets = shuffle([...byYear.values()].map((bucket) => shuffle(bucket)));
    const picked: SpotlightItem[] = [];
    while (picked.length < SPOTLIGHT_SIZE && buckets.some((bucket) => bucket.length)) {
      for (const bucket of buckets) {
        const next = bucket.pop();
        if (next && picked.length < SPOTLIGHT_SIZE) picked.push(next);
      }
    }
    return picked.map(({ id, category, title, summary, why_it_matters, source_url, published_at, specialities, source_label, saudi_relevant }) => ({ id, category, title, summary, why_it_matters, source_url, published_at, specialities, source_label, saudi_relevant }));
  } catch (error) {
    console.warn("[recent-developments] spotlight unavailable", error);
    return [];
  }
}
