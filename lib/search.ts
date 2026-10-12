import type { DiseaseTopic } from "@/lib/types";

const normalize = (value: string) => value.toLocaleLowerCase().trim().replace(/[–—-]/g, " ").replace(/\s+/g, " ");

export function searchDiseases(items: DiseaseTopic[], query: string, specialty = "all") {
  const normalized = normalize(query);
  return items
    .filter((item) => specialty === "all" || item.specialty === specialty)
    .map((item) => {
      if (!normalized) return { item, score: 1 };
      const name = normalize(item.name);
      const searchable = [item.arabicName, item.summary, item.specialty, ...item.abbreviations, ...item.synonyms, ...item.symptoms].map(normalize);
      let score = name === normalized ? 120 : name.startsWith(normalized) ? 90 : name.includes(normalized) ? 70 : 0;
      for (const term of searchable) {
        if (!term) continue;
        if (term === normalized) score = Math.max(score, 100);
        else if (term.startsWith(normalized)) score = Math.max(score, 75);
        else if (term.includes(normalized) || normalized.includes(term)) score = Math.max(score, 50);
      }
      if (item.source.status === "published") score += 15;
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.item.updatedAt.localeCompare(a.item.updatedAt))
    .map(({ item }) => item);
}
