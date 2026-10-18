import { describe, expect, it, vi } from "vitest";


import { runScan, selectRecords } from "@/lib/recent-developments/scan";
import { getSource } from "@/lib/recent-developments/sources";

const NOW = new Date("2026-10-19T03:00:00Z");
const feed = (n: number) => `<rss><channel>${Array.from({ length: n }, (_, i) => `<item><title>FDA approves drug ${i}</title><link>https://www.fda.gov/drugs/a-${i}</link><description>Approval number ${i} for a new medicine.</description><pubDate>Sun, 18 Oct 2026 08:00:00 EDT</pubDate></item>`).join("")}</channel></rss>`;

function fakeSupabase() {
  const upserts: unknown[][] = [];
  const updates: Array<{ table: string; values: unknown }> = [];
  const client = {
    from(table: string) {
      return {
        select: () => (table === "dev_sources" ? Promise.resolve({ data: [{ id: "fda-drugs", enabled: true }] }) : { single: () => Promise.resolve({ data: { id: "run-1" } }) }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: "run-1" } }) }) }),
        upsert: (rows: unknown[]) => { upserts.push(rows); return { select: () => Promise.resolve({ data: rows.map((_, i) => ({ id: String(i) })), error: null }) }; },
        update: (values: unknown) => { updates.push({ table, values }); return { eq: () => Promise.resolve({ error: null }) }; },
      };
    },
  };
  return { client: client as never, upserts, updates };
}

describe("selectRecords", () => {
  it("caps each source at maxPerRun, newest first, unique by URL", () => {
    const source = getSource("fda-drugs")!;
    const { fetched, records } = selectRecords(source, feed(30) + feed(30), NOW);
    expect(fetched).toBe(60);
    expect(records).toHaveLength(source.maxPerRun);
    expect(new Set(records.map((r) => r.source_url)).size).toBe(records.length);
  });
});

describe("runScan", () => {
  it("stores new items, never overwrites (ignoreDuplicates), and survives a failing source", async () => {
    const { client, upserts, updates } = fakeSupabase();
    const fetcher = vi.fn(async (url: string | URL | Request) => {
      if (String(url).includes("medwatch")) return new Response("boom", { status: 500 });
      return new Response(feed(3), { status: 200 });
    }) as unknown as typeof fetch;
    const summary = await runScan(client, {
      now: NOW,
      fetcher,
      sources: [getSource("fda-drugs")!, getSource("fda-medwatch")!],
    });
    expect(summary.sources.find((s) => s.id === "fda-drugs")).toMatchObject({ fetched: 3, kept: 3, inserted: 3 });
    expect(summary.sources.find((s) => s.id === "fda-medwatch")?.error).toBe("HTTP 500");
    expect(upserts).toHaveLength(1);
    expect(updates.some((u) => u.table === "dev_sources" && JSON.stringify(u.values).includes("HTTP 500"))).toBe(true);
    expect(summary.inserted).toBe(3);
  });
});
