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

const COLUMNS = "id, source_id, category, title, excerpt, source_url, doi, published_at, specialities, saudi_relevant, status, created_at, reviewed_at";
const LIMIT = 60;

/** Published items only (row-level security enforces this for signed-in users). */
export async function getPublishedDevelopments(filters: DevelopmentFilters = emptyDevelopmentFilters): Promise<DevelopmentList> {
  if (!isSupabaseConfigured()) return { state: "unavailable" };
  try {
    const supabase = await createSupabaseDataClient();
    let query = supabase.from("recent_developments").select(COLUMNS).eq("status", "published");
    if ((DEVELOPMENT_CATEGORIES as readonly string[]).includes(filters.category)) query = query.eq("category", filters.category as DevelopmentCategory);
    if (filters.speciality) query = query.contains("specialities", [filters.speciality]);
    if (filters.source) query = query.eq("source_id", filters.source);
    if (filters.saudi) query = query.eq("saudi_relevant", true);
    const text = filters.query.replace(/[%_,()]/g, " ").trim().slice(0, 80);
    if (text) query = query.ilike("title", `%${text}%`);
    const { data, error } = await query.order("published_at", { ascending: false }).order("created_at", { ascending: false }).limit(LIMIT);
    if (error) {
      console.warn("[recent-developments] list unavailable", error.message);
      return { state: "unavailable" };
    }
    return { state: "ok", items: (data ?? []) as DevelopmentRow[] };
  } catch (error) {
    console.warn("[recent-developments] list unavailable", error);
    return { state: "unavailable" };
  }
}

/** Items waiting for an administrator. Callers must have passed requireOrganizationAdmin() first. */
export async function getPendingDevelopments(): Promise<DevelopmentRow[]> {
  try {
    const { data, error } = await createServiceClient()
      .from("recent_developments")
      .select(COLUMNS)
      .eq("status", "pending_review")
      .order("published_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []) as DevelopmentRow[];
  } catch (error) {
    console.warn("[recent-developments] pending list unavailable", error);
    return [];
  }
}
