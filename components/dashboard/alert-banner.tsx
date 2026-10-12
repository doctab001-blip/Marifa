"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight, BellRing, X } from "lucide-react";
import type { HospitalAlert } from "@/lib/dashboard/hospital-feed";

const STORAGE_KEY = "marifa.dismissed-alerts";
const CHANGE_EVENT = "marifa:dismissed-alerts";
let memoryValue = "";

// Dismissals are per browser; storage can be unavailable in private windows, so fall back to memory.
function readDismissed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? memoryValue;
  } catch {
    return memoryValue;
  }
}

function dismiss(id: string) {
  const ids = new Set(readDismissed().split(",").filter(Boolean));
  ids.add(id);
  memoryValue = [...ids].join(",");
  try { window.localStorage.setItem(STORAGE_KEY, memoryValue); } catch { /* storage unavailable */ }
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

export function AlertBanner({ alert }: { alert: HospitalAlert }) {
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => "");
  if (dismissed.split(",").includes(alert.id)) return null;
  return (
    <aside className={`alert-banner alert-banner-${alert.severity}`} role="alert" aria-labelledby={`alert-${alert.id}`}>
      <span className="alert-banner-icon" aria-hidden="true"><BellRing size={18} /></span>
      <div className="alert-banner-copy">
        <strong id={`alert-${alert.id}`}>
          {alert.title}
          {alert.sample && <span className="badge badge-yellow">Sample notice</span>}
        </strong>
        <p>{alert.detail}</p>
      </div>
      <Link className="alert-banner-action" href={alert.href}>{alert.actionLabel}<ArrowRight size={15} aria-hidden="true" /></Link>
      <button type="button" className="alert-banner-dismiss" onClick={() => dismiss(alert.id)} aria-label={`Dismiss: ${alert.title}`} title="Dismiss">
        <X size={16} aria-hidden="true" />
      </button>
    </aside>
  );
}
