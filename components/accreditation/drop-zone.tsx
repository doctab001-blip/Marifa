"use client";

import { useRef, useState } from "react";
import { CloudUpload } from "lucide-react";

/**
 * A file input with drag-and-drop. It stays a real <input type="file"> inside the surrounding <form>, so submitting
 * works exactly as before (and without JavaScript the input is still usable through the label).
 */
export function DropZone({ name, multiple, required, label = "Drop a file here or choose one", hint }: { name: string; multiple?: boolean; required?: boolean; label?: string; hint?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const sync = () => setNames(Array.from(input.current?.files ?? []).map((f) => f.name));
  return (
    <label
      className={`gh-drop${over ? " is-over" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!input.current || e.dataTransfer.files.length === 0) return;
        const transfer = new DataTransfer();
        Array.from(e.dataTransfer.files).slice(0, multiple ? 5 : 1).forEach((file) => transfer.items.add(file));
        input.current.files = transfer.files;
        sync();
      }}
    >
      <CloudUpload size={22} aria-hidden="true" />
      <strong>{label}</strong>
      <small>{hint ?? "PDF, Word, Excel, CSV, text, PNG or JPEG · up to 20 MB"}</small>
      {names.length > 0 ? <span className="gh-drop-files" aria-live="polite">{names.join(", ")}</span> : null}
      <input ref={input} type="file" name={name} multiple={multiple} required={required} onChange={sync} />
    </label>
  );
}
