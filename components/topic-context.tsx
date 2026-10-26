"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

/** The topic a page has open, shared with the side panel and the top bar. */
export type ActiveTopic = {
  id: string;
  /** Display title, already cleaned for reading. */
  title: string;
  /** Governance state of the open version. */
  status: "draft" | "approved" | "published";
  /** Disease Management topics and Local Protocols share the editor but have separate menus. */
  scope: "disease" | "protocol";
  versionId?: string;
};

type Store = { topic: ActiveTopic | null; setTopic: (topic: ActiveTopic | null) => void };
const TopicContext = createContext<Store>({ topic: null, setTopic: () => undefined });

export function TopicContextProvider({ children }: { children: React.ReactNode }) {
  const [topic, setTopic] = useState<ActiveTopic | null>(null);
  const value = useMemo(() => ({ topic, setTopic }), [topic]);
  return <TopicContext.Provider value={value}>{children}</TopicContext.Provider>;
}

export const useActiveTopic = () => useContext(TopicContext).topic;

/** Rendered by a topic page; tells the side panel and top bar which topic is open, and clears it on leaving. */
export function ActiveTopicSignal({ id, title, status, scope = "disease", versionId }: Omit<ActiveTopic, "scope"> & { scope?: ActiveTopic["scope"] }) {
  const { setTopic } = useContext(TopicContext);
  useEffect(() => {
    setTopic({ id, title, status, scope, versionId });
    return () => setTopic(null);
  }, [id, title, status, scope, versionId, setTopic]);
  return null;
}
