"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "@/components/icons-3d";

const STORAGE_KEY = "marifa.theme";
const EVENT = "marifa:theme";
type Theme = "light" | "dark";

function read(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}
function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/** Light is the default; the choice is remembered in this browser (storage may be blocked, so failures are ignored). */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  const dark = theme === "dark";
  function toggle() {
    const next: Theme = dark ? "light" : "dark";
    if (next === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* storage unavailable */ }
    window.dispatchEvent(new Event(EVENT));
  }
  return (
    <button type="button" className="top-action-link theme-toggle" onClick={toggle} aria-pressed={dark} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} title={dark ? "Switch to light theme" : "Switch to dark theme"}>
      {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
