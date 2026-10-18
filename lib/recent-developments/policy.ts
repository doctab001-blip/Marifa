import { inferMedicalSpecialityTags } from "@/lib/medical-specialities";
import type { SourceConfig } from "./sources";
import type { DevelopmentRecord, DevelopmentStatus, FeedEntry } from "./types";

/** Regulators publish straight away; journal items wait for an administrator. */
export function statusForSource(source: Pick<SourceConfig, "tier">): DevelopmentStatus {
  return source.tier === "A" ? "published" : "pending_review";
}

/** https only, no query string or fragment (strips tracking such as ?rss=1), no trailing slash. */
export function canonicalUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.protocol = "https:";
    url.search = "";
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    const text = url.toString();
    return text.endsWith("/") && url.pathname !== "/" ? text.slice(0, -1) : text;
  } catch {
    return null;
  }
}

/** An item is accepted only if its link is on a host the source is known to publish on. */
export function isAllowedHost(url: string, hosts: string[]): boolean {
  try {
    return hosts.includes(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}

const SAUDI_PATTERN = /\b(saudi|SFDA|MERS(-CoV)?|hajj|umrah|middle east|gulf|GCC|eastern mediterranean|EMRO)\b/i;
/** Headlines rarely name a speciality, so common disease and drug words add to the catalogue's own term matching. */
const EXTRA_SPECIALITY_TERMS: Array<[string, RegExp]> = [
  ["Infectious Diseases", /\b(HIV|hepatitis|tubercul\w*|malaria|antibiotic\w*|antimicrobial|antiviral|vaccin\w*|sepsis|MERS|influenza|COVID|measles|polio|mpox|ebola)\b/i],
  ["Cardiology", /\b(heart|myocardial|atrial|statin\w*|hypertension|cardiovascular|anticoagula\w*)\b/i],
  ["Endocrinology", /\b(GLP-1|obesity|insulin|thyroid|semaglutide|tirzepatide|orforglipron)\b/i],
  ["Neurology", /\b(stroke|epilep\w*|dementia|alzheimer\w*|parkinson\w*|migraine)\b/i],
  ["Pulmonology", /\b(asthma|COPD|pneumonia|lung|pulmonary)\b/i],
  ["Nephrology", /\b(kidney|dialysis)\b/i],
  ["Gastroenterology", /\b(liver|crohn\w*|colitis|cirrhosis)\b/i],
  ["Psychiatry", /\b(depress\w*|schizophren\w*|bipolar)\b/i],
];

export function inferSpecialities(text: string): string[] {
  const tags = new Set<string>(inferMedicalSpecialityTags(text));
  for (const [name, pattern] of EXTRA_SPECIALITY_TERMS) if (pattern.test(text)) tags.add(name);
  return [...tags];
}

export const isSaudiRelevant = (text: string) => SAUDI_PATTERN.test(text);

export function cleanExcerpt(description: string, title: string): string | null {
  const text = description.replace(/\s+/g, " ").trim();
  if (text.length < 20 || text.toLowerCase() === title.toLowerCase()) return null;
  if (text.length <= 280) return text;
  const cut = text.slice(0, 280);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 200)).replace(/[,;:\s]+$/, "")}…`;
}

export function riyadhDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** Applies every Marifa rule to one feed entry. Returns null when the entry must not be stored. */
export function toRecord(source: SourceConfig, entry: FeedEntry, now: Date, lookbackDays = 8): DevelopmentRecord | null {
  const url = canonicalUrl(entry.link);
  if (!url || !isAllowedHost(url, source.hosts)) return null;
  if (!entry.publishedAt) return null;
  const ageDays = (now.getTime() - entry.publishedAt.getTime()) / 86_400_000;
  if (ageDays > lookbackDays || ageDays < -2) return null;
  if (source.include && !source.include(entry)) return null;
  const title = entry.title.slice(0, 500);
  // Journals: citation only. We never copy their abstracts.
  const excerpt = source.tier === "A" ? cleanExcerpt(entry.description, title) : null;
  const text = `${title} ${excerpt ?? ""}`;
  return {
    source_id: source.id,
    category: source.category(entry),
    title,
    excerpt,
    source_url: url,
    doi: entry.doi,
    published_at: riyadhDate(entry.publishedAt),
    specialities: inferSpecialities(text),
    saudi_relevant: isSaudiRelevant(text),
    status: statusForSource(source),
  };
}
