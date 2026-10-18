import type { SupabaseClient } from "@supabase/supabase-js";
import { parseFeed } from "./feed-parser";
import { toRecord } from "./policy";
import { sources as defaultSources, type SourceConfig } from "./sources";
import type { DevelopmentRecord } from "./types";

const USER_AGENT = "MarifaPulse/1.0 (weekly clinical news digest; links to original sources)";
const MAX_FEED_BYTES = 5_000_000;
const FETCH_TIMEOUT_MS = 15_000;

export type SourceResult = { id: string; fetched: number; kept: number; inserted: number; error?: string };
export type ScanSummary = { runId: string | null; fetched: number; inserted: number; skipped: number; sources: SourceResult[] };

type Fetcher = typeof fetch;

export async function fetchFeedText(url: string, fetcher: Fetcher = fetch): Promise<string> {
  const response = await fetcher(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml, application/xml, text/xml, */*" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  if (text.length > MAX_FEED_BYTES) throw new Error("Feed larger than the 5 MB limit.");
  return text;
}

/** Newest first, capped, and unique by URL within one source. */
export function selectRecords(source: SourceConfig, xml: string, now: Date): { fetched: number; records: DevelopmentRecord[] } {
  const entries = parseFeed(xml);
  const seen = new Set<string>();
  const records: DevelopmentRecord[] = [];
  for (const entry of entries) {
    const record = toRecord(source, entry, now);
    if (!record || seen.has(record.source_url)) continue;
    seen.add(record.source_url);
    records.push(record);
  }
  records.sort((a, b) => b.published_at.localeCompare(a.published_at));
  return { fetched: entries.length, records: records.slice(0, source.maxPerRun) };
}

/**
 * Runs the weekly scan. One failing source never stops the others. Existing rows are never overwritten
 * (ignoreDuplicates), so an administrator's approve / hide decision is permanent.
 */
export async function runScan(supabase: SupabaseClient, options: { now?: Date; fetcher?: Fetcher; sources?: SourceConfig[] } = {}): Promise<ScanSummary> {
  const now = options.now ?? new Date();
  const fetcher = options.fetcher ?? fetch;
  const list = options.sources ?? defaultSources;

  const { data: enabledRows } = await supabase.from("dev_sources").select("id, enabled");
  const disabled = new Set((enabledRows ?? []).filter((row: { enabled: boolean }) => !row.enabled).map((row: { id: string }) => row.id));

  const { data: run } = await supabase.from("dev_scan_runs").insert({ started_at: now.toISOString() }).select("id").single();
  const runId: string | null = run?.id ?? null;

  const results: SourceResult[] = [];
  for (const source of list) {
    if (disabled.has(source.id)) continue;
    const result: SourceResult = { id: source.id, fetched: 0, kept: 0, inserted: 0 };
    try {
      const xml = await fetchFeedText(source.url, fetcher);
      const { fetched, records } = selectRecords(source, xml, now);
      result.fetched = fetched;
      result.kept = records.length;
      if (records.length) {
        const { data, error } = await supabase
          .from("recent_developments")
          .upsert(records.map((record) => ({ ...record, scan_run_id: runId })), { onConflict: "source_url", ignoreDuplicates: true })
          .select("id");
        if (error) throw new Error(error.message);
        result.inserted = data?.length ?? 0;
      }
      await supabase.from("dev_sources").update({ last_ok_at: new Date().toISOString(), last_error: null }).eq("id", source.id);
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      await supabase.from("dev_sources").update({ last_error: result.error.slice(0, 300) }).eq("id", source.id);
    }
    results.push(result);
  }

  const summary: ScanSummary = {
    runId,
    fetched: results.reduce((total, item) => total + item.fetched, 0),
    inserted: results.reduce((total, item) => total + item.inserted, 0),
    skipped: results.reduce((total, item) => total + (item.kept - item.inserted), 0),
    sources: results,
  };
  if (runId) {
    await supabase.from("dev_scan_runs").update({
      finished_at: new Date().toISOString(),
      fetched: summary.fetched,
      inserted: summary.inserted,
      skipped: summary.skipped,
      errors: results.filter((item) => item.error).map(({ id, error }) => ({ id, error })),
    }).eq("id", runId);
  }
  return summary;
}
