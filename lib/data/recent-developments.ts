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
const LIMIT = 60;

/** Published items only (row-level security enforces this for signed-in users). */
export async function getPublishedDevelopments(filters: DevelopmentFilters = emptyDevelopmentFilters): Promise<DevelopmentList> {
  if (!isSupabaseConfigured()) return { state: "unavailable" };
  try {
    const supabase = await createSupabaseDataClient();
    const text = filters.query.replace(/[%_,()]/g, " ").trim().slice(0, 80);
    const run = (columns: string) => {
      let query = supabase.from("recent_developments").select(columns).eq("status", "published");
      if ((DEVELOPMENT_CATEGORIES as readonly string[]).includes(filters.category)) query = query.eq("category", filters.category as DevelopmentCategory);
      if (filters.speciality) query = query.contains("specialities", [filters.speciality]);
      if (filters.source) query = query.eq("source_id", filters.source);
      if (filters.saudi) query = query.eq("saudi_relevant", true);
      if (text) query = query.ilike("title", `%${text}%`);
      return query.order("published_at", { ascending: false }).order("created_at", { ascending: false }).limit(LIMIT);
    };
    let { data, error } = await run(COLUMNS);
    if (error && isMissingSummaryColumn(error.message)) ({ data, error } = await run(BASE_COLUMNS));
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
