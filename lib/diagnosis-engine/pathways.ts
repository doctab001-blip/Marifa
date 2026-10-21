import "server-only";
import type { GlobalDiseaseTopic } from "@/types/clinical";
import { getApprovedDiseaseGuidelines } from "@/lib/data/disease-guidelines";
import { getGlobalDiseaseTopic, listGlobalDiseaseTopicIds } from "@/lib/data/global-topics";
import { canonicalTopicId } from "@/lib/data/merged-topics";
import { catalogueResolver, type PathwayResolver } from "./engine";

/** Validated GlobalDiseaseTopic records held in the repository. */
export function loadGlobalTopics(): GlobalDiseaseTopic[] {
  return listGlobalDiseaseTopicIds().flatMap((id) => {
    const result = getGlobalDiseaseTopic(id);
    return result.state === "ready" ? [result.topic] : [];
  });
}

/**
 * Resolves each differential to a topic that is live in the published catalogue right now: a listed id first
 * (following merged-topic redirects), then a title match. When the directory cannot be reached the catalogue
 * id is used and marked unverified, so the clinician still lands on the governing topic.
 */
export async function createLivePathwayResolver(): Promise<PathwayResolver> {
  const directory = await getApprovedDiseaseGuidelines({ includeFamilyMembers: true });
  if (directory.state !== "ready" || directory.diseases.length === 0) return catalogueResolver;
  const live = new Map(directory.diseases.map((topic) => [topic.id, topic]));
  // Only a clinician's Approve action makes a topic "approved"; live topics awaiting sign-off stay pending.
  const statusOf = (topic: (typeof directory.diseases)[number]) => (topic.status === "approved" && topic.clinicalReviewStatus !== "pending" ? "approved" : "pending_review") as "approved" | "pending_review";

  return (pathway) => {
    if (pathway.global) return catalogueResolver(pathway);
    for (const candidate of pathway.topicIds) {
      const id = canonicalTopicId(candidate) ?? candidate;
      const topic = live.get(id);
      if (topic) return { id, title: topic.title, status: statusOf(topic) };
    }
    for (const hint of pathway.titleHints) {
      const needle = hint.toLowerCase();
      const match = directory.diseases.find((topic) => topic.title.toLowerCase().includes(needle));
      if (match) return { id: match.id, title: match.title, status: statusOf(match) };
    }
    return catalogueResolver(pathway);
  };
}
