"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { AlertTriangle, CheckSquare, FileText, ImagePlus, Loader2, ScanEye, ShieldCheck, Square, Trash2, X } from "lucide-react";
import type { DeclaredStudyType, ImageAnalysisRequest, ImageAnalysisResponse, ImageStudyKind, SuggestedFinding } from "@/types/diagnosisEngine";
import { DicomError, isDicom, readDicom } from "@/lib/diagnosis-engine/dicom";

const MAX_IMAGES = 4;
const MAX_EDGE = 1568;
const MAX_PDF_BYTES = 2_200_000;
const MAX_FILE_BYTES = 60_000_000;
/** Vercel limits a request body to 4.5 MB; keep the base64 payload comfortably below it. */
const MAX_PAYLOAD_BASE64 = 3_800_000;

type Prepared = { id: string; name: string; mediaType: "image/jpeg"; data: string; preview: string; note?: string };
type Pdf = { name: string; data: string };

const TYPES: Record<ImageStudyKind, Array<[DeclaredStudyType, string]>> = {
  imaging: [["chest-xray", "Chest X-ray"], ["xray-other", "X-ray (other)"], ["ct-head", "CT head"], ["ct-chest", "CT chest / CTPA"], ["ct-abdomen", "CT abdomen & pelvis"], ["ct-other", "CT (other)"], ["mri", "MRI"], ["ultrasound", "Ultrasound"], ["other", "Other"]],
  investigation: [["lab-report", "Lab report"], ["ecg", "ECG"], ["other", "Other"]],
};

/** Guess the study type from DICOM Modality / Body Part (non-identifying tags). */
function typeFromDicom(modality?: string, bodyPart?: string): DeclaredStudyType | undefined {
  const part = (bodyPart ?? "").toUpperCase();
  switch ((modality ?? "").toUpperCase()) {
    case "CR": case "DX": return part.includes("CHEST") ? "chest-xray" : "xray-other";
    case "CT": return part.includes("HEAD") || part.includes("BRAIN") ? "ct-head" : part.includes("CHEST") ? "ct-chest" : part.includes("ABD") || part.includes("PELV") ? "ct-abdomen" : "ct-other";
    case "MR": return "mri";
    case "US": return "ultrasound";
    case "ECG": return "ecg";
    default: return undefined;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Draws any source onto a canvas no larger than MAX_EDGE and re-encodes it as JPEG — this also drops EXIF/file metadata. */
async function canvasJpeg(width: number, height: number, draw: (context: CanvasRenderingContext2D, scale: number) => void) {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser.");
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  draw(context, scale);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
  if (!blob) throw new Error("The image could not be prepared.");
  return { data: await blobToBase64(blob), preview: URL.createObjectURL(blob) };
}

async function prepareFile(file: File): Promise<{ image?: Prepared; pdf?: Pdf; dicomType?: DeclaredStudyType }> {
  if (file.size > MAX_FILE_BYTES) throw new Error(`${file.name} is larger than 60 MB.`);
  const id = `${file.name}-${file.size}-${file.lastModified}`;
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    if (file.size > MAX_PDF_BYTES) throw new Error(`${file.name} is larger than 2 MB. Attach a photo or screenshot of the relevant page instead.`);
    return { pdf: { name: file.name, data: await blobToBase64(file) } };
  }
  const buffer = await file.arrayBuffer();
  if (isDicom(buffer) || file.name.toLowerCase().endsWith(".dcm") || file.type === "application/dicom") {
    const dicom = readDicom(buffer);
    const imageData = new ImageData(dicom.rgba, dicom.width, dicom.height);
    const source = document.createElement("canvas");
    source.width = dicom.width;
    source.height = dicom.height;
    source.getContext("2d")?.putImageData(imageData, 0, 0);
    const { data, preview } = await canvasJpeg(dicom.width, dicom.height, (context, scale) => context.drawImage(source, 0, 0, dicom.width * scale, dicom.height * scale));
    const note = [dicom.modality, dicom.bodyPart, dicom.frames > 1 ? `middle of ${dicom.frames} frames` : ""].filter(Boolean).join(" · ");
    return { image: { id, name: file.name, mediaType: "image/jpeg", data, preview, note: `DICOM${note ? ` · ${note}` : ""} · header removed` }, dicomType: typeFromDicom(dicom.modality, dicom.bodyPart) };
  }
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image, DICOM or PDF file.`);
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error(`${file.name} could not be opened. Use JPEG, PNG or WebP.`); });
  const { data, preview } = await canvasJpeg(bitmap.width, bitmap.height, (context, scale) => context.drawImage(bitmap, 0, 0, bitmap.width * scale, bitmap.height * scale));
  bitmap.close();
  return { image: { id, name: file.name, mediaType: "image/jpeg", data, preview } };
}

type Props = {
  kind: ImageStudyKind;
  /** Findings already entered, sent as clinical context. */
  clinicalContext: string[];
  age?: number;
  /** Adds the accepted findings to this vector. */
  onAccept: (findings: string[]) => void;
};

const CONFIDENCE_LABEL = { low: "Low confidence", moderate: "Moderate", high: "High" } as const;

export function StudyAttachments({ kind, clinicalContext, age, onAccept }: Props) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<Prepared[]>([]);
  const [pdf, setPdf] = useState<Pdf | null>(null);
  const [declaredType, setDeclaredType] = useState<DeclaredStudyType>(kind === "imaging" ? "chest-xray" : "lab-report");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState<"preparing" | "reading" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [read, setRead] = useState<ImageAnalysisResponse | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const label = kind === "imaging" ? "scan" : "report";
  const accept = kind === "imaging" ? "image/jpeg,image/png,image/webp,.dcm,application/dicom" : "image/jpeg,image/png,image/webp,application/pdf,.pdf";

  const resetRead = () => { setRead(null); setSelected(new Set()); setAdded(0); };

  const addFiles = async (files: FileList | File[]) => {
    setError(null);
    setBusy("preparing");
    resetRead();
    const additions: Prepared[] = [];
    const problems: string[] = [];
    let room = MAX_IMAGES - images.length;
    for (const file of Array.from(files)) {
      try {
        const prepared = await prepareFile(file);
        if (prepared.pdf) {
          if (kind !== "investigation") throw new Error("PDF reports can be attached under Laboratory & investigations.");
          setPdf(prepared.pdf);
        }
        if (prepared.image) {
          if (room <= 0) {
            URL.revokeObjectURL(prepared.image.preview);
            throw new Error(`Attach up to ${MAX_IMAGES} images per study.`);
          }
          if (!images.some((item) => item.id === prepared.image!.id)) {
            additions.push(prepared.image);
            room -= 1;
          }
        }
        if (prepared.dicomType) setDeclaredType(prepared.dicomType);
      } catch (problem) {
        problems.push(problem instanceof DicomError || problem instanceof Error ? problem.message : `${file.name} could not be prepared.`);
      }
    }
    if (additions.length) setImages((current) => [...current, ...additions]);
    setError(problems.length ? [...new Set(problems)].join(" ") : null);
    setBusy(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeImage = (imageId: string) => {
    setImages((current) => {
      const item = current.find((entry) => entry.id === imageId);
      if (item) URL.revokeObjectURL(item.preview);
      return current.filter((entry) => entry.id !== imageId);
    });
    resetRead();
  };

  const clearAll = () => {
    images.forEach((item) => URL.revokeObjectURL(item.preview));
    setImages([]);
    setPdf(null);
    setConfirmed(false);
    setError(null);
    resetRead();
  };

  const runRead = async () => {
    if ((!images.length && !pdf) || !confirmed || busy) return;
    const size = images.reduce((sum, image) => sum + image.data.length, 0) + (pdf?.data.length ?? 0);
    if (size > MAX_PAYLOAD_BASE64) {
      setError("These files are too large to read together. Remove an image or attach a smaller PDF.");
      return;
    }
    setBusy("reading");
    setError(null);
    resetRead();
    const payload: ImageAnalysisRequest = {
      kind,
      declaredType,
      images: images.map((image) => ({ mediaType: image.mediaType, data: image.data })),
      ...(pdf ? { pdf: { data: pdf.data } } : {}),
      clinicalContext: clinicalContext.slice(0, 40),
      ...(age !== undefined ? { age } : {}),
      identifiersConfirmedAbsent: true,
    };
    try {
      const response = await fetch("/api/diagnosis-engine/analyse-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = (await response.json().catch(() => ({}))) as ImageAnalysisResponse & { error?: string };
      if (!response.ok || !body.findings) {
        setError(body.error ?? (response.status === 413 ? "The images are too large. Attach fewer images." : "The study could not be read."));
        return;
      }
      setRead(body);
      setSelected(new Set(body.findings.filter((item) => item.suggested).map((item) => item.text)));
    } catch {
      setError("The image reading service could not be reached.");
    } finally {
      setBusy(null);
    }
  };

  const toggle = (item: SuggestedFinding) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(item.text)) next.delete(item.text); else next.add(item.text);
    return next;
  });

  const acceptSelected = () => {
    if (!read) return;
    const chosen = read.findings.filter((item) => selected.has(item.text)).map((item) => item.text);
    if (!chosen.length) return;
    onAccept(chosen);
    setAdded(chosen.length);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) void addFiles(event.dataTransfer.files);
  };

  if (!open) {
    return (
      <button type="button" className="dx-attach-open" onClick={() => setOpen(true)}>
        <ImagePlus size={15} strokeWidth={2} aria-hidden="true" />
        {kind === "imaging" ? "Attach scan for AI read (X-ray, CT, MRI, US, DICOM)" : "Attach report or ECG for AI read (photo or PDF)"}
      </button>
    );
  }

  const hasFiles = images.length > 0 || Boolean(pdf);

  return (
    <div className="dx-attach" aria-labelledby={`${id}-title`}>
      <div className="dx-attach-head">
        <p id={`${id}-title`} className="dx-attach-title"><ScanEye size={15} strokeWidth={2} aria-hidden="true" />AI read of attached {label}</p>
        <button type="button" className="dx-icon-button" onClick={() => { clearAll(); setOpen(false); }} aria-label="Close attachments"><X size={15} strokeWidth={2} aria-hidden="true" /></button>
      </div>
      <p className="dx-attach-policy"><ShieldCheck size={14} strokeWidth={2} aria-hidden="true" />Use de-identified or teaching images only. Files are prepared in your browser (metadata and DICOM headers removed), read once and not stored.</p>

      <div
        className={`dx-dropzone${dragging ? " is-dragging" : ""}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input ref={inputRef} id={`${id}-file`} type="file" accept={accept} multiple className="dx-sr-only" onChange={(event) => event.target.files && void addFiles(event.target.files)} />
        <label htmlFor={`${id}-file`} className="dx-dropzone-label">
          {busy === "preparing" ? <Loader2 size={18} className="dx-spin" aria-hidden="true" /> : <ImagePlus size={18} aria-hidden="true" />}
          <span><strong>Choose files</strong> or drop them here</span>
          <em>{kind === "imaging" ? "JPEG, PNG, WebP or uncompressed DICOM · up to 4 images (e.g. PA + lateral, key CT slices)" : "Photo/screenshot of a lab report or ECG, or a PDF up to 2 MB"}</em>
        </label>
      </div>

      {hasFiles ? (
        <ul className="dx-thumbs" aria-label="Attached files">
          {images.map((image) => (
            <li key={image.id}>
              <img src={image.preview} alt={`Attached ${label}: ${image.name}`} />
              <span className="dx-thumb-name" title={image.name}>{image.name}</span>
              {image.note ? <span className="dx-thumb-note">{image.note}</span> : null}
              <button type="button" onClick={() => removeImage(image.id)} aria-label={`Remove ${image.name}`}><Trash2 size={13} aria-hidden="true" /></button>
            </li>
          ))}
          {pdf ? (
            <li className="dx-thumb-pdf">
              <FileText size={28} strokeWidth={1.6} aria-hidden="true" />
              <span className="dx-thumb-name" title={pdf.name}>{pdf.name}</span>
              <button type="button" onClick={() => { setPdf(null); resetRead(); }} aria-label={`Remove ${pdf.name}`}><Trash2 size={13} aria-hidden="true" /></button>
            </li>
          ) : null}
        </ul>
      ) : null}

      {hasFiles ? (
        <div className="dx-attach-controls">
          <label className="dx-attach-type">
            <span>Study</span>
            <select value={declaredType} onChange={(event) => { setDeclaredType(event.target.value as DeclaredStudyType); resetRead(); }}>
              {TYPES[kind].map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
          <label className="dx-attach-confirm">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
            <span>No names, ID numbers, dates of birth or faces are visible in these files.</span>
          </label>
          <button type="button" className="dx-secondary-button" onClick={runRead} disabled={!confirmed || Boolean(busy)} aria-busy={busy === "reading"}>
            {busy === "reading" ? <Loader2 size={15} className="dx-spin" aria-hidden="true" /> : <ScanEye size={15} aria-hidden="true" />}
            {busy === "reading" ? "Reading…" : read ? "Read again" : `Read ${label}`}
          </button>
        </div>
      ) : null}

      {error ? <p className="dx-error" role="alert"><AlertTriangle size={15} aria-hidden="true" />{error}</p> : null}

      {read ? (
        <section className="dx-read" aria-label="AI read">
          <header className="dx-read-head">
            <p><strong>{read.studyDescription}</strong></p>
            <span className={`dx-adequacy dx-adequacy--${read.adequacy}`}>{read.adequacy === "adequate" ? "Adequate study" : read.adequacy === "limited" ? "Limited study" : "Non-diagnostic"}</span>
          </header>
          {read.adequacyNote ? <p className="dx-read-note">{read.adequacyNote}</p> : null}
          {read.identifiersVisible ? <p className="dx-read-warning" role="alert"><AlertTriangle size={14} aria-hidden="true" />The read detected text that may identify a patient. Remove this file and use a de-identified image.</p> : null}
          {read.urgentAlerts.length ? (
            <ul className="dx-read-urgent" aria-label="Urgent findings">{read.urgentAlerts.map((alert) => <li key={alert}><AlertTriangle size={14} aria-hidden="true" />{alert}</li>)}</ul>
          ) : null}
          <p className="dx-read-impression"><span>Impression</span>{read.impression}</p>

          {read.findings.length ? (
            <>
              <p className="dx-read-label">Select findings to add to {kind === "imaging" ? "Imaging findings" : "Laboratory & investigations"}</p>
              <ul className="dx-read-findings">
                {read.findings.map((item) => {
                  const checked = selected.has(item.text);
                  return (
                    <li key={item.text} className={`is-${item.significance}`}>
                      <button type="button" role="checkbox" aria-checked={checked} onClick={() => toggle(item)} disabled={added > 0}>
                        {checked ? <CheckSquare size={16} aria-hidden="true" /> : <Square size={16} aria-hidden="true" />}
                        <span className="dx-read-text">{item.text}</span>
                        <span className={`dx-confidence dx-confidence--${item.confidence}`}>{CONFIDENCE_LABEL[item.confidence]}</span>
                        {item.significance !== "normal" ? <span className={`dx-significance dx-significance--${item.significance}`}>{item.significance === "critical" ? "Critical" : "Abnormal"}</span> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="dx-read-actions">
                {added ? <span className="dx-read-added" role="status">{added} finding{added === 1 ? "" : "s"} added — regenerate differentials to include them.</span> : (
                  <button type="button" className="dx-secondary-button" onClick={acceptSelected} disabled={!selected.size}>Add {selected.size || ""} selected finding{selected.size === 1 ? "" : "s"}</button>
                )}
              </div>
            </>
          ) : <p className="dx-muted">No findings were reported.</p>}

          {read.limitations.length ? <ul className="dx-read-limits" aria-label="Limitations">{read.limitations.map((item) => <li key={item}>{item}</li>)}</ul> : null}
          <p className="dx-read-notice">{read.notice}</p>
        </section>
      ) : null}
    </div>
  );
}
