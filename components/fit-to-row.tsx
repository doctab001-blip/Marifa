"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Shows its content inside the height the table row already has (set by the medicine and dose columns).
 * When the content does not fit, the rest is hidden behind a "Show all" toggle that expands the cell in place.
 * Outside a .fit-cell table cell (and on narrow screens) nothing is clipped. Display only.
 */
export function FitToRow({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [clipped, setClipped] = useState(false);
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || open) return;
    const check = () => setClipped(el.scrollHeight > el.clientHeight + 2);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    if (el.parentElement?.parentElement) observer.observe(el.parentElement.parentElement);
    return () => observer.disconnect();
  }, [open]);
  return (
    <div className={`fit-row${open ? " is-open" : ""}${clipped ? " is-clipped" : ""}`}>
      <div ref={box} className="fit-row-box">{children}</div>
      {clipped || open ? (
        <button type="button" className="fit-row-toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? "Show less" : "Show all"}
        </button>
      ) : null}
    </div>
  );
}
