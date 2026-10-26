"use client";

import { useEffect, useMemo, useState } from "react";
import { PLATFORM_REGION, REGION_CHANGE_EVENT, REGION_COOKIE, REGION_PARAM } from "@/lib/region";
import { UNASSIGNED_SPECIALITY, canonicalSpeciality, groupBySpeciality } from "@/lib/medical-specialities";

/**
 * Every topic list the reader can browse, in the order the side panel shows it:
 * live = the approved directory readers see; drafts / approved / published = the three governance queues.
 */
export type QueueKind = "live" | "drafts" | "approved" | "published";

export type QueueTopic = { id: string; title: string; speciality: string; href: string; versionId?: string };

export const topicHref = (id: string) => `/dashboard/diseases/${encodeURIComponent(id)}`;
export const editHref = (id: string, versionId: string) => `/dashboard/admin/guidelines/${encodeURIComponent(id)}?version=${encodeURIComponent(versionId)}`;

export function currentRegionCode() {
  if (PLATFORM_REGION) return PLATFORM_REGION;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get(REGION_PARAM);
    const fromCookie = document.cookie.split("; ").find((entry) => entry.startsWith(`${REGION_COOKIE}=`))?.split("=")[1];
    // The toggle writes the cookie before it updates the URL, so the cookie is the freshest choice.
    return (fromCookie ?? fromUrl ?? "SA").toUpperCase();
  } catch {
    return "SA";
  }
}

type LiveTopic = { id: string; title: string; pillar: string; speciality?: string; keywords?: string[] };
type QueueRow = { id: string; title: string; specialty?: string; versionId: string; version: string };

// One request per browser session, practice region and refresh key; shared by the side panel and the pager.
const liveRequests = new Map<string, Promise<LiveTopic[]>>();
export function loadLiveTopics(refreshKey = "") {
  const region = currentRegionCode();
  const key = `${region}|${refreshKey}`;
  let request = liveRequests.get(key);
  if (!request) {
    liveRequests.clear();
    request = fetch(`/api/topics?view=nav&region=${encodeURIComponent(region)}`, { credentials: "same-origin", cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Topic list unavailable (${response.status})`);
        return response.json() as Promise<{ topics: LiveTopic[] }>;
      })
      .then(({ topics }) => topics)
      .catch((error) => {
        liveRequests.delete(key);
        throw error;
      });
    liveRequests.set(key, request);
  }
  return request;
}

export async function loadQueueRows(kind: Exclude<QueueKind, "live">): Promise<QueueRow[]> {
  const response = await fetch(`/api/topics?view=${kind}`, { credentials: "same-origin", cache: "no-store" });
  if (!response.ok) throw new Error(`${kind} topics unavailable (${response.status})`);
  return ((await response.json()) as { topics: QueueRow[] }).topics;
}

/** Same order as the side panel: speciality groups A to Z, topics A to Z inside each. */
export function orderTopics<T extends { title: string }>(items: readonly T[], specialityOf: (item: T) => string): T[] {
  return groupBySpeciality(items, specialityOf).flatMap(({ items: list }) => [...list].sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" })));
}

export const rowsToTopics = (rows: QueueRow[]): QueueTopic[] =>
  rows.map((row) => ({ id: row.id, title: row.title, speciality: canonicalSpeciality(row.specialty), href: editHref(row.id, row.versionId), versionId: row.versionId }));

export const liveToTopics = (topics: LiveTopic[]): QueueTopic[] =>
  topics.map((topic) => ({ id: topic.id, title: topic.title, speciality: topic.speciality || UNASSIGNED_SPECIALITY, href: topicHref(topic.id) }));

type QueueState = { status: "loading" } | { status: "ready"; topics: QueueTopic[] } | { status: "error" };

/** Loads one list (re-loading when `refreshKey` changes, e.g. after an approval) in side-panel order. */
export function useTopicQueue(kind: QueueKind, refreshKey = ""): QueueState {
  const [state, setState] = useState<QueueState>({ status: "loading" });
  useEffect(() => {
    let active = true;
    const load = () => {
      const request = kind === "live" ? loadLiveTopics(refreshKey).then(liveToTopics) : loadQueueRows(kind).then(rowsToTopics);
      request.then(
        (topics) => { if (active) setState({ status: "ready", topics: orderTopics(topics, (topic) => topic.speciality) }); },
        () => { if (active) setState({ status: "error" }); },
      );
    };
    load();
    if (kind !== "live") return () => { active = false; };
    // The country toggle announces a region change; reload the live list for the new region.
    const onRegionChange = () => { setState({ status: "loading" }); load(); };
    window.addEventListener(REGION_CHANGE_EVENT, onRegionChange);
    return () => { active = false; window.removeEventListener(REGION_CHANGE_EVENT, onRegionChange); };
  }, [kind, refreshKey]);
  return useMemo(() => state, [state]);
}
