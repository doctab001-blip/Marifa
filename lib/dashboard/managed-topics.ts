// Pure sort/filter for the Draft, Approved and Published management tabs.
import { canonicalSpeciality, groupBySpeciality, specialityCounts, type SpecialityGroup } from "@/lib/medical-specialities";

export const MANAGED_SORTS = ["newest", "oldest", "title", "title-desc"] as const;
export type ManagedSort = (typeof MANAGED_SORTS)[number];

export const MANAGED_SORT_LABELS: Record<ManagedSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  title: "A–Z",
  "title-desc": "Z–A",
};

export type ManagedItem = { key: string; title: string; specialty: string; changedAt: string };

const time = (value: string) => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};
const byTitle = (a: ManagedItem, b: ManagedItem) => a.title.localeCompare(b.title, "en", { sensitivity: "base" });

export function primarySpeciality(specialty: string) {
  return canonicalSpeciality(specialty);
}

export function sortManaged<T extends ManagedItem>(items: readonly T[], sort: ManagedSort): T[] {
  const copy = [...items];
  switch (sort) {
    case "newest": return copy.sort((a, b) => time(b.changedAt) - time(a.changedAt) || byTitle(a, b));
    case "oldest": return copy.sort((a, b) => time(a.changedAt) - time(b.changedAt) || byTitle(a, b));
    case "title": return copy.sort(byTitle);
    case "title-desc": return copy.sort((a, b) => byTitle(b, a));
  }
}

export function filterManaged<T extends ManagedItem>(items: readonly T[], query: string, speciality: string): T[] {
  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    if (speciality && primarySpeciality(item.specialty) !== speciality) return false;
    if (!terms.length) return true;
    const haystack = `${item.title} ${item.specialty}`.toLocaleLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export function specialityOptions(items: readonly ManagedItem[]) {
  return specialityCounts(items, (item) => primarySpeciality(item.specialty));
}

/** One section per speciality (A to Z); the sort chosen by the user still orders the tiles inside each section. */
export function groupManaged<T extends ManagedItem>(items: readonly T[]): SpecialityGroup<T>[] {
  return groupBySpeciality(items, (item) => primarySpeciality(item.specialty));
}
