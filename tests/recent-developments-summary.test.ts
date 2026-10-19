import { afterEach, describe, expect, it, vi } from "vitest";
import { findPubmedRecord, parsePubmedXml, summariseAbstract, summariseMissing } from "@/lib/recent-developments/summarise";

const XML = `<PubmedArticleSet><PubmedArticle><MedlineCitation><PMID Version="1">12345</PMID><Article><ArticleTitle>Semaglutide &amp; kidney outcomes in type 2 diabetes.</ArticleTitle><Abstract><AbstractText Label="BACKGROUND">Kidney disease is common.</AbstractText><AbstractText Label="RESULTS">Risk fell by 24%.</AbstractText></Abstract></Article></MedlineCitation><PubmedData><ArticleIdList><ArticleId IdType="pubmed">12345</ArticleId><ArticleId IdType="pmc">PMC999</ArticleId></ArticleIdList></PubmedData></PubmedArticle></PubmedArticleSet>`;

function fakeFetch(opts: { ids?: string[]; xml?: string; aiText?: string; aiStatus?: number } = {}) {
  return vi.fn(async (url: string | URL | Request) => {
    const text = String(url);
    if (text.includes("esearch")) return new Response(JSON.stringify({ esearchresult: { idlist: opts.ids ?? ["12345"] } }));
    if (text.includes("efetch")) return new Response(opts.xml ?? XML);
    if (text.includes("api.anthropic.com")) return new Response(JSON.stringify({ content: [{ type: "text", text: opts.aiText ?? "Plain summary." }] }), { status: opts.aiStatus ?? 200 });
    throw new Error(`unexpected ${text}`);
  }) as unknown as typeof fetch;
}

afterEach(() => { vi.unstubAllEnvs(); });

describe("parsePubmedXml", () => {
  it("reads title, labelled abstract and the free PubMed Central link", () => {
    const record = parsePubmedXml(XML)!;
    expect(record.pmid).toBe("12345");
    expect(record.title).toBe("Semaglutide & kidney outcomes in type 2 diabetes.");
    expect(record.abstract).toBe("BACKGROUND: Kidney disease is common. RESULTS: Risk fell by 24%.");
    expect(record.freeFullTextUrl).toBe("https://pmc.ncbi.nlm.nih.gov/articles/PMC999/");
  });
  it("returns null when there is no abstract", () => {
    expect(parsePubmedXml("<PMID>1</PMID><ArticleTitle>x</ArticleTitle>")).toBeNull();
  });
});

describe("findPubmedRecord", () => {
  it("accepts a DOI match", async () => {
    expect((await findPubmedRecord({ title: "Anything", doi: "10.1/x" }, fakeFetch()))?.pmid).toBe("12345");
  });
  it("rejects a title search that returns a different paper", async () => {
    expect(await findPubmedRecord({ title: "[Articles] A completely different randomised trial of aspirin", doi: null }, fakeFetch())).toBeNull();
  });
  it("accepts a title search when the titles agree", async () => {
    expect((await findPubmedRecord({ title: "[Articles] Semaglutide and kidney outcomes in type 2 diabetes", doi: null }, fakeFetch()))?.pmid).toBe("12345");
  });
});

describe("summariseAbstract", () => {
  it("does nothing without an API key", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(await summariseAbstract("t", "a", fakeFetch())).toBeNull();
  });
  it("returns the model text, capped", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "k");
    const text = await summariseAbstract("t", "a", fakeFetch({ aiText: "x ".repeat(800) }));
    expect(text!.length).toBeLessThanOrEqual(900);
    expect(text!.endsWith("…")).toBe(true);
  });
});

describe("summariseMissing", () => {
  function fakeDb(rows: unknown[]) {
    const updates: unknown[] = [];
    const chain: Record<string, unknown> = {};
    for (const name of ["select", "is", "in", "order"]) chain[name] = () => chain;
    chain.limit = () => Promise.resolve({ data: rows });
    chain.update = (values: unknown) => { updates.push(values); return { eq: () => Promise.resolve({ error: null }) }; };
    return { db: { from: () => chain } as never, updates };
  }
  it("skips quietly without an API key", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { db } = fakeDb([]);
    expect((await summariseMissing(db)).skipped).toBe("no_api_key");
  });
  it("stores the summary and free full-text link, but not the abstract", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "k");
    const { db, updates } = fakeDb([{ id: "a", title: "T", doi: "10.1/x" }]);
    const result = await summariseMissing(db, { fetcher: fakeFetch(), pauseMs: 0 });
    expect(result.summarised).toBe(1);
    expect(updates[0]).toMatchObject({ summary: "Plain summary.", summary_source: "pubmed_abstract", pmid: "12345", free_full_text_url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC999/" });
    expect(JSON.stringify(updates)).not.toContain("Kidney disease is common");
  });
  it("marks an item with no free abstract as attempted, and retries after a temporary failure", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "k");
    const none = fakeDb([{ id: "a", title: "A long enough title for a search", doi: null }]);
    expect((await summariseMissing(none.db, { fetcher: fakeFetch({ ids: [] }), pauseMs: 0 })).noAbstract).toBe(1);
    expect(none.updates[0]).toHaveProperty("summary_attempted_at");
    const failing = fakeDb([{ id: "b", title: "T", doi: "10.1/y" }]);
    const result = await summariseMissing(failing.db, { fetcher: fakeFetch({ aiStatus: 500 }), pauseMs: 0 });
    expect(result.failed).toBe(1);
    expect(failing.updates).toHaveLength(0);
  });
});
