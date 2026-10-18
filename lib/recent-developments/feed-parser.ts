import type { FeedEntry } from "./types";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…", copy: "©",
};

export function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
    if (body[0] === "#") {
      const code = body[1].toLowerCase() === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

/** Turns feed markup into plain text. Entities are decoded once, then any remaining tags are removed. */
export function toPlainText(value: string): string {
  const withoutCdata = value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  const decoded = decodeEntities(withoutCdata);
  // Feeds often escape their own HTML (&lt;br/&gt;), so strip tags after decoding, then decode again for &amp;nbsp; style leftovers.
  return decodeEntities(decoded.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function firstTag(block: string, names: string[]): string | null {
  for (const name of names) {
    const escaped = name.replace(":", "\\:");
    const match = block.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)</${escaped}>`, "i"));
    if (match) return match[1];
  }
  return null;
}

function atomLink(block: string): string | null {
  const alternate = block.match(/<link\b[^>]*\brel=["']alternate["'][^>]*\bhref=["']([^"']+)["']/i)
    ?? block.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']alternate["']/i)
    ?? block.match(/<link\b[^>]*\bhref=["']([^"']+)["']/i);
  return alternate ? decodeEntities(alternate[1]) : null;
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(toPlainText(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function extractDoi(block: string, link: string): string | null {
  const tagged = firstTag(block, ["dc:identifier", "prism:doi", "dc:source"]);
  const candidates = [tagged ? toPlainText(tagged) : "", link];
  for (const candidate of candidates) {
    const match = candidate.match(/\b(10\.\d{4,9}\/[^\s"'<>?#]+)/);
    if (match) return match[1].replace(/[.,;]+$/, "");
  }
  return null;
}

/** Reads RSS 2.0, RSS 1.0 (RDF) and Atom feeds. Entries without a title or link are dropped. */
export function parseFeed(xml: string): FeedEntry[] {
  const blocks = [
    ...(xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? []),
    ...(xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? []),
  ];
  const entries: FeedEntry[] = [];
  for (const block of blocks) {
    const rawTitle = firstTag(block, ["title", "dc:title"]);
    const rawLink = firstTag(block, ["link"]);
    const link = (rawLink ? toPlainText(rawLink) : "") || atomLink(block) || "";
    const title = rawTitle ? toPlainText(rawTitle) : "";
    if (!title || !link) continue;
    const rawDescription = firstTag(block, ["description", "summary", "content:encoded", "content"]) ?? "";
    entries.push({
      title,
      link,
      description: toPlainText(rawDescription),
      publishedAt: parseDate(firstTag(block, ["pubDate", "dc:date", "published", "updated"])),
      doi: extractDoi(block, link),
    });
  }
  return entries;
}
