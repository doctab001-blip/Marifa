import { describe, expect, it } from "vitest";
import { decodeEntities, parseFeed, toPlainText } from "@/lib/recent-developments/feed-parser";
import { canonicalUrl, cleanExcerpt, isAllowedHost, isSaudiRelevant, statusForSource, toRecord } from "@/lib/recent-developments/policy";
import { getSource, sources } from "@/lib/recent-developments/sources";


const NOW = new Date("2026-10-19T03:00:00Z");

const fdaFeed = `<?xml version="1.0"?><rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel>
<item><title>FDA Approves New Treatment for Advanced Pancreatic Cancer</title><link>http://www.fda.gov/drugs/news/fda-approves-pancreatic</link><description>The FDA approved a first-in-class therapy for patients with metastatic pancreatic cancer after a randomised trial showed longer survival.</description><pubDate>Sun, 18 Oct 2026 08:49:24 EDT</pubDate></item>
<item><title>GDUFA Paid Facilities List</title><link>http://www.fda.gov/industry/gdufa-paid-facilities-list</link><description>User fee list.</description><pubDate>Sun, 18 Oct 2026 08:49:24 EDT</pubDate></item>
<item><title>Navigating the FDA Bayesian Draft Guidance - webinar</title><link>http://www.fda.gov/drugs/events/bayesian</link><description>Event.</description><pubDate>Sun, 18 Oct 2026 08:49:24 EDT</pubDate></item>
<item><title>Old approval from last year</title><link>http://www.fda.gov/drugs/news/old</link><description>An old approved product from a previous year.</description><pubDate>Mon, 01 Sep 2025 08:49:24 EDT</pubDate></item>
<item><title>Phishing item</title><link>https://evil.example.com/fda-approves</link><description>Not on an allowed host, FDA approves everything.</description><pubDate>Sun, 18 Oct 2026 08:49:24 EDT</pubDate></item>
</channel></rss>`;

const nejmFeed = `<?xml version="1.0"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://purl.org/rss/1.0/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<item rdf:about="https://www.nejm.org/doi/full/10.1056/NEJMoa2518753?af=R&amp;rss=currentIssue"><title>Long-Acting HIV Therapy in African Adults with Adherence Challenges</title><link>https://www.nejm.org/doi/full/10.1056/NEJMoa2518753?af=R&amp;rss=currentIssue</link><description>New England Journal of Medicine, Volume 395, Issue 15, Page 1505-1518, October 15, 2026. &lt;br/&gt;</description><dc:identifier>doi:10.1056/NEJMoa2518753</dc:identifier><dc:date>2026-10-14T09:00:07Z</dc:date></item>
<item rdf:about="https://www.nejm.org/doi/full/10.1056/NEJMe2600001"><title>An Editorial</title><link>https://www.nejm.org/doi/full/10.1056/NEJMe2600001</link><description>x</description><dc:identifier>doi:10.1056/NEJMe2600001</dc:identifier><dc:date>2026-10-14T09:00:07Z</dc:date></item>
</rdf:RDF>`;

const bmjFeed = `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><item rdf:about="x"><title><![CDATA[Vaccine target isn&#x2019;t fast enough]]></title><link>http://www.bmj.com/content/395/bmj-2026-101166.short?rss=1</link><description><![CDATA[<p>International efforts.</p>]]></description></item></rdf:RDF>`;

describe("feed parser", () => {
  it("reads RSS 2.0 items with dates and links", () => {
    const entries = parseFeed(fdaFeed);
    expect(entries).toHaveLength(5);
    expect(entries[0].title).toBe("FDA Approves New Treatment for Advanced Pancreatic Cancer");
    expect(entries[0].publishedAt?.toISOString()).toBe("2026-10-18T12:49:24.000Z");
  });

  it("reads RSS 1.0 (RDF) items, DOI and ISO dates, and decodes escaped markup", () => {
    const [entry] = parseFeed(nejmFeed);
    expect(entry.doi).toBe("10.1056/NEJMoa2518753");
    expect(entry.publishedAt?.toISOString()).toBe("2026-10-14T09:00:07.000Z");
    expect(entry.description).toBe("New England Journal of Medicine, Volume 395, Issue 15, Page 1505-1518, October 15, 2026.");
  });

  it("handles CDATA, numeric entities and drops items without a title or link", () => {
    const [entry] = parseFeed(bmjFeed);
    expect(entry.title).toBe("Vaccine target isn’t fast enough");
    expect(entry.description).toBe("International efforts.");
    expect(parseFeed("<rss><channel><item><title>No link</title></item></channel></rss>")).toEqual([]);
  });

  it("decodes entities safely", () => {
    expect(decodeEntities("A &amp; B &#8211; C &#x2014; &bogus;")).toBe("A & B – C — &bogus;");
    expect(toPlainText("&lt;script&gt;alert(1)&lt;/script&gt;ok")).not.toContain("<");
  });
});

describe("policy", () => {
  it("publishes regulator items and holds journal items for review", () => {
    expect(statusForSource({ tier: "A" })).toBe("published");
    expect(statusForSource({ tier: "B" })).toBe("pending_review");
    for (const source of sources) expect(source.tier === "A" ? "published" : "pending_review").toBe(statusForSource(source));
  });

  it("canonicalises URLs: https, no query, no fragment, no trailing slash", () => {
    expect(canonicalUrl("http://www.bmj.com/content/395/x.short?rss=1#top")).toBe("https://www.bmj.com/content/395/x.short");
    expect(canonicalUrl("https://www.fda.gov/drugs/news/")).toBe("https://www.fda.gov/drugs/news");
    expect(canonicalUrl("javascript:alert(1)")).toBeNull();
    expect(canonicalUrl("not a url")).toBeNull();
  });

  it("only accepts links on the source's own hosts", () => {
    expect(isAllowedHost("https://www.fda.gov/x", ["www.fda.gov"])).toBe(true);
    expect(isAllowedHost("https://www.fda.gov.evil.com/x", ["www.fda.gov"])).toBe(false);
    expect(isAllowedHost("https://evil.example.com/fda", ["www.fda.gov"])).toBe(false);
  });

  it("trims excerpts at a word boundary and drops echoes of the title", () => {
    expect(cleanExcerpt("x", "title")).toBeNull();
    expect(cleanExcerpt("Same as the title here please", "same as the title here please")).toBeNull();
    const long = cleanExcerpt(`${"word ".repeat(100)}`, "t");
    expect(long!.length).toBeLessThanOrEqual(281);
    expect(long!.endsWith("…")).toBe(true);
  });

  it("flags Saudi-relevant text", () => {
    expect(isSaudiRelevant("MERS-CoV cases reported ahead of Hajj")).toBe(true);
    expect(isSaudiRelevant("New statin approved")).toBe(false);
  });
});

describe("toRecord", () => {
  const fda = getSource("fda-drugs")!;
  const entries = parseFeed(fdaFeed);

  it("keeps a recent regulator approval, published, with the regulator's excerpt", () => {
    const record = toRecord(fda, entries[0], NOW)!;
    expect(record).toMatchObject({ source_id: "fda-drugs", category: "new_drug_approval", status: "published", source_url: "https://www.fda.gov/drugs/news/fda-approves-pancreatic", published_at: "2026-10-18" });
    expect(record.excerpt).toContain("first-in-class");
  });

  it("filters out industry notices, events, stale items and off-host links", () => {
    expect(toRecord(fda, entries[1], NOW)).toBeNull();
    expect(toRecord(fda, entries[2], NOW)).toBeNull();
    expect(toRecord(fda, entries[3], NOW)).toBeNull();
    expect(toRecord(fda, entries[4], NOW)).toBeNull();
  });

  it("holds journal items for review, keeps citation only, and skips editorials", () => {
    const nejm = getSource("nejm")!;
    const [article, editorial] = parseFeed(nejmFeed);
    const record = toRecord(nejm, article, NOW)!;
    expect(record).toMatchObject({ status: "pending_review", category: "key_trial", excerpt: null, source_url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2518753", doi: "10.1056/NEJMoa2518753" });
    expect(record.specialities).toContain("Infectious Diseases");
    expect(toRecord(nejm, editorial, NOW)).toBeNull();
  });

  it("drops FDA table pages and keeps only clear approval / safety headlines", () => {
    const make = (title: string) => ({ ...entries[0], title, link: "https://www.fda.gov/drugs/x" });
    expect(toRecord(fda, make("Other | Cancer Accelerated Approvals"), NOW)).toBeNull();
    expect(toRecord(fda, make("Verified Clinical Benefit | Cancer Accelerated Approvals"), NOW)).toBeNull();
    expect(toRecord(fda, make("FDA Approves New Nonprescription Eye Drop for Relief of Eye Redness"), NOW)?.category).toBe("new_drug_approval");
    expect(toRecord(fda, make("FDA Drug Safety Communication: new boxed warning"), NOW)?.category).toBe("safety_alert");
  });

  it("only takes research articles and guidelines from The Lancet, and trial/guideline titles from The BMJ", () => {
    const lancet = getSource("lancet")!;
    const bmj = getSource("bmj")!;
    const base = { ...entries[0], description: "A randomised trial of something", publishedAt: new Date("2026-10-15T00:00:00Z") };
    expect(toRecord(lancet, { ...base, title: "[Review] Threats to global health", link: "https://www.thelancet.com/a" }, NOW)).toBeNull();
    expect(toRecord(lancet, { ...base, title: "[Articles] Drug X versus placebo", link: "https://www.thelancet.com/b" }, NOW)?.category).toBe("key_trial");
    expect(toRecord(bmj, { ...base, title: "Alan Lucas: pioneer of infant nutrition", link: "https://www.bmj.com/c" }, NOW)).toBeNull();
    expect(toRecord(bmj, { ...base, title: "Rapid recommendation: drug for condition", link: "https://www.bmj.com/d" }, NOW)?.category).toBe("guideline_update");
  });

  it("rejects entries with no date", () => {
    expect(toRecord(fda, { ...entries[0], publishedAt: null }, NOW)).toBeNull();
  });
});
