"use client";

import { Suspense, useEffect, useId, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import type { CountryCode } from "@/types/clinical";
import { REGIONS, REGION_CHANGE_EVENT, REGION_COOKIE, REGION_PARAM, getRegionOption, parseRegion } from "@/lib/region";

function readCookie(): CountryCode | null {
  try {
    const match = document.cookie.split("; ").find((entry) => entry.startsWith(`${REGION_COOKIE}=`));
    return parseRegion(match ? decodeURIComponent(match.split("=")[1] ?? "") : null);
  } catch {
    return null;
  }
}

function writeCookie(code: CountryCode) {
  try {
    document.cookie = `${REGION_COOKIE}=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  } catch {
    /* cookies unavailable — the URL parameter still carries the choice */
  }
}

type ToggleProps = { initialRegion: CountryCode };

function TriggerContent({ code, busy }: { code: CountryCode; busy?: boolean }) {
  const option = getRegionOption(code);
  return (
    <>
      <Globe className={`size-4 shrink-0 text-[var(--region-accent)] ${busy ? "animate-pulse" : ""}`} aria-hidden="true" />
      <span aria-hidden="true" className="text-base leading-none">{option.flag}</span>
      <span className="hidden whitespace-nowrap sm:inline">{option.name}</span>
      <span className="font-mono text-xs font-semibold sm:hidden">{option.code}</span>
      <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
    </>
  );
}

const triggerClass =
  "inline-flex h-9 items-center gap-2 rounded-full border border-[var(--region-border)] bg-[var(--region-soft)] px-3 text-sm font-semibold text-[var(--region-accent)] transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--region-solid)]/40";

function CountryToggleInner({ initialRegion }: ToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<CountryCode | null>(null);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const fromQuery = parseRegion(searchParams.get(REGION_PARAM));
  const active: CountryCode = (isPending ? pending : null) ?? fromQuery ?? initialRegion;

  // Expose the active region on <html> so other modules (e.g. Diagnosis Engine) pick up its theme.
  useEffect(() => {
    document.documentElement.dataset.region = active;
  }, [active]);

  // A shared link such as ?region=IN becomes the remembered choice for the rest of the app.
  useEffect(() => {
    if (fromQuery && readCookie() !== fromQuery) writeCookie(fromQuery);
  }, [fromQuery]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function select(code: CountryCode) {
    setOpen(false);
    if (code === active) return;
    writeCookie(code);
    try { window.dispatchEvent(new Event(REGION_CHANGE_EVENT)); } catch { /* no window */ }
    setPending(code);
    const params = new URLSearchParams(searchParams.toString());
    params.set(REGION_PARAM, code);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      router.refresh();
    });
  }

  return (
    <div ref={rootRef} className="relative" data-region={active}>
      <button
        type="button"
        className={triggerClass}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Practice region: ${getRegionOption(active).name}. Change region`}
        title="Practice region — swaps formulary, guidelines and stewardship rules"
        onClick={() => setOpen((value) => !value)}
      >
        <TriggerContent code={active} busy={isPending} />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200/70 bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.35)]">
          <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Practice region</p>
          <ul id={listId} role="listbox" aria-label="Practice region" className="grid gap-0.5">
            {REGIONS.map((region) => {
              const selected = region.code === active;
              return (
                <li key={region.code} role="option" aria-selected={selected} data-region={region.code}>
                  <button
                    type="button"
                    onClick={() => select(region.code)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-2 focus-visible:ring-[var(--region-solid)] ${selected ? "bg-[var(--region-soft)]" : "hover:bg-slate-50"}`}
                  >
                    <span aria-hidden="true" className="text-xl leading-none">{region.flag}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-semibold ${selected ? "text-[var(--region-accent)]" : "text-slate-900"}`}>{region.name}</span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-500"><span aria-hidden="true" className="size-2 rounded-full bg-[var(--region-solid)]" /><span className="font-mono">{region.authority}</span><span aria-hidden="true">·</span>{region.accent}</span>
                    </span>
                    {selected ? <Check className="size-4 text-[var(--region-accent)]" aria-hidden="true" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Global practice-region switch. The choice lives in the URL (`?region=IN`) so links
 * are shareable, and in a cookie so it persists as the clinician moves around the app.
 */
export function CountryToggle({ initialRegion }: ToggleProps) {
  return (
    <Suspense
      fallback={
        <button type="button" className={triggerClass} disabled aria-label="Practice region" data-region={initialRegion}>
          <TriggerContent code={initialRegion} />
        </button>
      }
    >
      <CountryToggleInner initialRegion={initialRegion} />
    </Suspense>
  );
}
