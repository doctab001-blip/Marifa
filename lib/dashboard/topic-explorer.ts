// Pure sorting and filtering for the dashboard topic explorer. No React, no I/O: this is the part
// that decides what "most recent" or "most viewed" mean, so it is unit tested on its own.

export const SORT_KEYS = ["recent", "viewed", "trending", "title"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_LABELS: Record<SortKey, string> = {
  recent: "Most recent",
  viewed: "Most viewed",
  trending: "Trending (7 days)",
  title: "A–Z",
};

export type ExplorerTopic = {
  id: string;
  title: string;
  speciality: string;
  pillar: string;
  authority: string;
  version: string;
  /** ISO date (YYYY-MM-DD) the live version was last reviewed. */
  lastReviewed: string;
  /** True once a clinician has approved the topic; false while clinical review is pending. */
  clinicallyApproved: boolean;
  keywords: string[];
  totalViews: number;
  views7d: number;
};

export type ExplorerFilters = {
  query: string;
  speciality: string;
  pillar: string;
  authority: string;
  review: "all" | "approved" | "pending";
};

export const emptyFilters: ExplorerFilters = { query: "", speciality: "", pillar: "", authority: "", review: "all" };

export function isSortKey(value: unknown): value is SortKey {
  return typeof value === "string" && (SORT_KEYS as readonly string[]).includes(value);
}

function dateValue(value: string) {
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

const byTitle = (a: ExplorerTopic, b: ExplorerTopic) => a.title.localeCompare(b.title, "en", { sensitivity: "base" });

export function sortTopics(topics: readonly ExplorerTopic[], sort: SortKey): ExplorerTopic[] {
  const copy = [...topics];
  switch (sort) {
    case "recent":
      return copy.sort((a, b) => dateValue(b.lastReviewed) - dateValue(a.lastReviewed) || byTitle(a, b));
    case "viewed":
      return copy.sort((a, b) => b.totalViews - a.totalViews || b.views7d - a.views7d || byTitle(a, b));
    case "trending":
      return copy.sort((a, b) => b.views7d - a.views7d || b.totalViews - a.totalViews || byTitle(a, b));
    case "title":
      return copy.sort(byTitle);
  }
}

export function filterTopics(topics: readonly ExplorerTopic[], filters: ExplorerFilters): ExplorerTopic[] {
  const terms = filters.query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return topics.filter((topic) => {
    if (filters.speciality && topic.speciality !== filters.speciality) return false;
    if (filters.pillar && topic.pillar !== filters.pillar) return false;
    if (filters.authority && topic.authority !== filters.authority) return false;
    if (filters.review === "approved" && !topic.clinicallyApproved) return false;
    if (filters.review === "pending" && topic.clinicallyApproved) return false;
    if (!terms.length) return true;
    const haystack = [topic.title, topic.speciality, topic.pillar, topic.authority, ...topic.keywords].join(" ").toLocaleLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export type FacetOption = { value: string; count: number };

/** Distinct values of one field with how many topics carry each, most common first. */
export function facet(topics: readonly ExplorerTopic[], field: "speciality" | "pillar" | "authority"): FacetOption[] {
  const counts = new Map<string, number>();
  for (const topic of topics) {
    const value = topic[field];
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** Whole days between an ISO date and `now`, or null when the date cannot be read. */
export function daysSince(isoDate: string, now = new Date()): number | null {
  const time = Date.parse(isoDate);
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.floor((now.getTime() - time) / 86_400_000));
}

export function relativeAge(isoDate: string, now = new Date()): string {
  const days = daysSince(isoDate, now);
  if (days === null) return isoDate;
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}
