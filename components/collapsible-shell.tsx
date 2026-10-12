"use client";

import { useSyncExternalStore } from "react";
import { PanelLeftClose, PanelLeftOpen } from "@/components/icons-3d";

const STORAGE_KEY = "marifa.sidebar-collapsed";
const CHANGE_EVENT = "marifa:sidebar-collapsed";
let memoryValue = false;

// The reader's choice survives reloads; storage can be unavailable in private windows, so fall back to memory.
function readCollapsed() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? memoryValue : stored === "1";
  } catch {
    return memoryValue;
  }
}

function writeCollapsed(value: boolean) {
  memoryValue = value;
  try { window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0"); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function CollapsibleShell({ children, primaryColor }: { children: React.ReactNode; primaryColor: string }) {
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  return (
    <div className={`app-shell${collapsed ? " sidebar-collapsed" : ""}`} style={{ "--royal": primaryColor } as React.CSSProperties}>
      <button type="button" className="sidebar-toggle" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} aria-controls="workspace-sidebar" onClick={() => writeCollapsed(!collapsed)}>
        {collapsed ? <PanelLeftOpen size={17} aria-hidden="true" /> : <PanelLeftClose size={17} aria-hidden="true" />}
      </button>
      {children}
    </div>
  );
}
