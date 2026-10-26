"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

type Mode = "width" | "all" | "actual";

/**
 * Wraps a flowchart: a compact inline view that scrolls sideways, plus an "Open full flowchart" window that
 * shows the whole chart scaled to fit (fit width, fit everything, or 100%), scrolling only if it must.
 */
export function AlgorithmFrame({ title, chart }: { title: string; chart: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, w: 0, h: 0 });

  // Shrink the whole chart to the width of the page so every branch is visible without scrolling.
  // Very wide charts stop at 45% (still readable with "Open full flowchart"); beyond that the box scrolls.
  useLayoutEffect(() => {
    const box = scroller.current, content = inner.current;
    if (!box || !content) return;
    const measure = () => {
      const w = content.offsetWidth, h = content.offsetHeight;
      if (!w || !h) return;
      setFit({ scale: Math.max(0.45, Math.min(1, (box.clientWidth - 8) / w)), w, h });
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(box); observer.observe(content);
    return () => { observer.disconnect(); };
  }, []);

  return (
    <>
      <div className="clinical-algorithm-tools">
        <button type="button" className="clinical-algorithm-open" onClick={() => { setOpen(true); }} aria-haspopup="dialog">Open full flowchart</button>
      </div>
      <div className="clinical-algorithm-scroll" ref={scroller} role="region" aria-label={`${title}: flowchart. Scroll sideways, or open the full flowchart.`} tabIndex={0}>
        <div className="algorithm-inline-sizer" style={fit.w ? { width: fit.w * fit.scale, height: fit.h * fit.scale } : undefined}>
          <div className="algorithm-inline-content" ref={inner} style={{ transform: `scale(${fit.scale})` }}>{chart}</div>
        </div>
      </div>
      {open ? <FullView title={title} chart={chart} dialogRef={dialogRef} onClose={() => { setOpen(false); }} /> : null}
    </>
  );
}

function FullView({ title, chart, dialogRef, onClose }: { title: string; chart: ReactNode; dialogRef: React.RefObject<HTMLDialogElement | null>; onClose: () => void }) {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("width");
  const [details, setDetails] = useState(true);
  const [scale, setScale] = useState(1);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, [dialogRef]);

  const measure = useCallback(() => {
    const vp = viewport.current, ct = content.current;
    if (!vp || !ct) return;
    const w = ct.offsetWidth, h = ct.offsetHeight;
    if (!w || !h) return;
    const availW = vp.clientWidth - 24, availH = vp.clientHeight - 24;
    let next = 1;
    if (mode === "width") next = Math.min(availW / w, 1.6);
    if (mode === "all") next = Math.min(availW / w, availH / h, 1.6);
    setSize({ w, h });
    setScale(Math.max(next, 0.2));
  }, [mode]);

  useLayoutEffect(() => {
    content.current?.querySelectorAll("details").forEach((el) => { el.open = details; });
    measure();
  }, [measure, details]);
  useEffect(() => {
    const vp = viewport.current;
    if (!vp || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => { measure(); });
    observer.observe(vp);
    return () => { observer.disconnect(); };
  }, [measure]);

  return (
    <dialog
      ref={dialogRef}
      className="algorithm-dialog"
      aria-label={`${title}: full flowchart`}
      onClose={onClose}
      onClick={(event) => { if (event.target === dialogRef.current) onClose(); }}
    >
      <div className="algorithm-dialog-bar">
        <strong className="algorithm-dialog-title">{title}</strong>
        <div className="algorithm-dialog-controls" role="group" aria-label="Flowchart size">
          {([["width", "Fit width"], ["all", "Fit all"], ["actual", "100%"]] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={mode === value} className={mode === value ? "is-active" : undefined} onClick={() => { setMode(value); }}>{label}</button>
          ))}
          <button type="button" aria-pressed={details} className={details ? "is-active" : undefined} onClick={() => { setDetails((value) => !value); }}>Details</button>
          <button type="button" className="algorithm-dialog-close" onClick={onClose} autoFocus>Close</button>
        </div>
      </div>
      <div className="algorithm-dialog-viewport" ref={viewport} tabIndex={0} role="region" aria-label="Flowchart (scroll if it does not fit)">
        <div className="algorithm-dialog-sizer" style={{ width: size.w * scale || undefined, height: size.h * scale || undefined }}>
          <div className="algorithm-dialog-content" ref={content} style={{ transform: `scale(${scale})` }}>{chart}</div>
        </div>
      </div>
    </dialog>
  );
}
