import "server-only";
import { diseases as fallbackDiseases } from "@/lib/demo-data";
import type { DiseaseTopic } from "@/lib/types";

export async function getDiseaseTopics(): Promise<DiseaseTopic[]> {
  // Legacy demo routes must obey the same public boundary as the live
  // directory. They intentionally expose no draft or published fallback data.
  return fallbackDiseases.filter((topic) => topic.source.status === "approved");
}

export async function getDiseaseTopic(slug: string) {
  return (await getDiseaseTopics()).find((item) => item.slug === slug);
}
