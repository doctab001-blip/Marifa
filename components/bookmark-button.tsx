"use client";

import { Bookmark } from "lucide-react";
import { useSyncExternalStore } from "react";

const bookmarkEvent = "marifa-bookmark-change";

export function BookmarkButton({ topicId }: { topicId: string }) {
  const saved = useSyncExternalStore(
    (notify) => {
      window.addEventListener(bookmarkEvent, notify);
      window.addEventListener("storage", notify);
      return () => { window.removeEventListener(bookmarkEvent, notify); window.removeEventListener("storage", notify); };
    },
    () => localStorage.getItem(`marifa-bookmark-${topicId}`) === "true",
    () => false
  );
  const toggle = () => {
    const next = !saved;
    localStorage.setItem(`marifa-bookmark-${topicId}`, String(next));
    window.dispatchEvent(new Event(bookmarkEvent));
  };
  return <button className="button-secondary" onClick={toggle} aria-pressed={saved}><Bookmark size={15} fill={saved ? "currentColor" : "none"} />{saved ? "Bookmarked" : "Bookmark"}</button>;
}
