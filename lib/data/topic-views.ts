import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";

export type TopicViewStat = { total: number; last7Days: number; lastViewed: string | null };

/** `available` is false when tracking is not set up yet (migration not applied) or the call failed. */
export type TopicViewStats = { available: boolean; byTopic: Record<string, TopicViewStat> };

const unavailable: TopicViewStats = { available: false, byTopic: {} };

/** Counts one view of a live topic. Best effort: a failure must never affect the page being read. */
export async function recordTopicView(topicId: string): Promise<void> {
  if (!isSupabaseConfigured() || !topicId) return;
  try {
    const supabase = await createSupabaseDataClient();
    const { error } = await supabase.rpc("record_topic_view", { p_guideline_id: topicId });
    if (error) console.warn("[topic-views] record failed", error.message);
  } catch (error) {
    console.warn("[topic-views] record failed", error);
  }
}

type StatRow = { guideline_id: string; total_views: number | string; views_7d: number | string; last_viewed: string | null };

/** Real view counts for every topic that has been opened at least once. */
export const getTopicViewStats = cache(async (): Promise<TopicViewStats> => {
  if (!isSupabaseConfigured()) return unavailable;
  try {
    const supabase = await createSupabaseDataClient();
    const { data, error } = await supabase.rpc("topic_view_stats");
    if (error) {
      console.warn("[topic-views] stats unavailable", error.message);
      return unavailable;
    }
    const byTopic: Record<string, TopicViewStat> = {};
    for (const row of (data ?? []) as StatRow[]) {
      byTopic[row.guideline_id] = { total: Number(row.total_views), last7Days: Number(row.views_7d), lastViewed: row.last_viewed };
    }
    return { available: true, byTopic };
  } catch (error) {
    console.warn("[topic-views] stats unavailable", error);
    return unavailable;
  }
});
