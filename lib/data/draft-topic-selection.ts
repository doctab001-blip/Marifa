export type DraftTopicVersion = {
  id: string;
  createdAt: string;
};

/**
 * Keep all version rows in storage, but expose only the newest actionable
 * version for each clinical topic in the Disease Management draft queue.
 */
export function selectNewestDraftPerTopic<T extends DraftTopicVersion>(drafts: T[]): T[] {
  const newestByTopic = new Map<string, T>();
  for (const draft of drafts) {
    const current = newestByTopic.get(draft.id);
    if (!current || draft.createdAt > current.createdAt) newestByTopic.set(draft.id, draft);
  }
  return [...newestByTopic.values()];
}
