"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, ClipboardList, ShieldAlert, WandSparkles } from "@/components/icons-3d";
import { CLINICAL_DIRECTORY_MINIMUM_SCORE } from "@/lib/clinical-authoring-audit";
import { parsePastedTopic, type PasteSectionReport } from "@/lib/topic-paste";
import { buildFixPrompt, buildGeminiPrompt } from "@/lib/topic-paste-prompt";
import type { DiseaseDetail } from "@/lib/validations/disease";

type Props = {
  base: DiseaseDetail;
  guidelineId: string;
  versionId: string;
  versionLabel: string;
  today: string;
  saveAction: (formData: FormData) => void | Promise<void>;
};

const statusMark: Record<PasteSectionReport["status"], { symbol: string; label: string }> = {
  parsed: { symbol: "✓", label: "read from your paste" },
  kept: { symbol: "↺", label: "not in your paste — previous content kept" },
  missing: { symbol: "!", label: "missing" },
  optional: { symbol: "–", label: "optional" },
};

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = value;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

function CopyButton({ label, getText, disabled }: { label: string; getText: () => string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="ui-button ui-button-secondary paste-editor-copy"
      disabled={disabled}
      onClick={async () => {
        if (await copyToClipboard(getText())) {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }
      }}
    >
      <ClipboardList size={15} aria-hidden="true" />{copied ? "Copied" : label}
    </button>
  );
}

function SubmitButton({ mode, disabled, children, primary }: { mode: "publish" | "draft"; disabled: boolean; children: React.ReactNode; primary?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name="mode" value={mode} className={`ui-button ${primary ? "ui-button-primary" : "ui-button-secondary"}`} disabled={disabled || pending}>
      {pending ? "Saving…" : children}
    </button>
  );
}

export function PasteTopicEditor({ base, guidelineId, versionId, versionLabel, today, saveAction }: Props) {
  const [text, setText] = useState("");
  const [useTitle, setUseTitle] = useState(false);
  const deferred = useDeferredValue(text);
  const result = useMemo(() => parsePastedTopic(deferred, base, { today, useTitleFromPaste: useTitle }), [deferred, base, today, useTitle]);

  const hasText = deferred.trim().length > 0;
  const score = result.audit?.score;
  const canSave = Boolean(result.content) && result.parsedCount > 0 && text === deferred;
  const meets = typeof score === "number" && score >= CLINICAL_DIRECTORY_MINIMUM_SCORE;
  const problems = [...result.schemaErrors, ...result.issues.filter((issue) => issue.level !== "info").map((issue) => issue.message), ...(result.audit?.failures ?? [])];
  const titleDiffers = Boolean(result.pastedTitle && result.pastedTitle !== base.title);

  const verdict = !hasText
    ? { tone: "idle", head: "Paste the full topic to begin", body: "Copy it from Gemini and paste it into the box. Nothing is saved until you press a button." }
    : result.content
      ? meets
        ? { tone: "good", head: `Score ${score}% — ready to publish`, body: `At or above ${CLINICAL_DIRECTORY_MINIMUM_SCORE}%, so “Publish” will make it live. Clinical review stays pending.` }
        : { tone: "warn", head: `Score ${score}% — below ${CLINICAL_DIRECTORY_MINIMUM_SCORE}%`, body: "You can save it as a draft. To publish, fix the points below (the “Copy fix prompt” button writes the request for Gemini)." }
      : { tone: "bad", head: "Cannot save yet", body: "The text is missing something every topic must have. Fix the points below." };

  return (
    <div className="paste-editor">
      <header className="paste-editor-head">
        <div>
          <p className="eyebrow">Paste editor · works offline, no AI credits used</p>
          <h1>{base.title}</h1>
          <p className="paste-editor-sub">Editing from version <strong>{versionLabel}</strong>. Paste the complete topic from Gemini; Marifa sorts it under the right headings, scores it, and saves it as a new version. Earlier versions are always kept.</p>
        </div>
        <CopyButton
          label="Copy Gemini prompt"
          getText={() => buildGeminiPrompt({ title: base.title, specialty: base.specialty, pillar: base.pillar })}
        />
      </header>

      <form action={saveAction} className="paste-editor-grid">
        <input type="hidden" name="id" value={guidelineId} />
        <input type="hidden" name="versionId" value={versionId} />

        <div className="paste-editor-main card">
          <label htmlFor="paste-markdown" className="paste-editor-label">Topic text from Gemini</label>
          <textarea
            id="paste-markdown"
            name="markdown"
            className="paste-editor-textarea"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={"Paste the whole topic here.\n\nTip: press “Copy Gemini prompt”, paste it into Gemini, then paste Gemini’s answer back into this box."}
            spellCheck={false}
            aria-describedby="paste-verdict"
          />
          {titleDiffers && (
            <label className="paste-editor-check">
              <input type="checkbox" name="useTitle" checked={useTitle} onChange={(event) => setUseTitle(event.target.checked)} />
              Use the title from my paste: “{result.pastedTitle}”
            </label>
          )}
          <div className="paste-editor-actions">
            <SubmitButton mode="publish" primary disabled={!canSave || !meets}>Publish ({typeof score === "number" ? `${score}%` : "needs 80%"})</SubmitButton>
            <SubmitButton mode="draft" disabled={!canSave}>Save as draft</SubmitButton>
            <button type="button" className="ui-button ui-button-secondary" disabled={!text} onClick={() => setText("")}>Clear</button>
          </div>
          <p className="paste-editor-note">Publishing adds a new live version and never edits an old one. It does not mean a clinician has approved the topic — that remains a separate button on the topic page.</p>
        </div>

        <aside className="paste-editor-side" aria-label="What Marifa read from your paste">
          <section id="paste-verdict" className={`paste-verdict is-${verdict.tone}`} role="status" aria-live="polite">
            {verdict.tone === "good" ? <CheckCircle2 size={20} aria-hidden="true" /> : verdict.tone === "idle" ? <WandSparkles size={20} aria-hidden="true" /> : <ShieldAlert size={20} aria-hidden="true" />}
            <div>
              <strong>{verdict.head}</strong>
              <span>{verdict.body}</span>
              {typeof score === "number" && (
                <div className="paste-meter" aria-hidden="true">
                  <div className="paste-meter-fill" style={{ width: `${score}%` }} />
                  <div className="paste-meter-mark" style={{ left: `${CLINICAL_DIRECTORY_MINIMUM_SCORE}%` }} />
                </div>
              )}
            </div>
          </section>

          {hasText && problems.length > 0 && (
            <section className="paste-panel card">
              <div className="paste-panel-head">
                <h2>To fix ({new Set(problems).size})</h2>
                <CopyButton label="Copy fix prompt for Gemini" getText={() => buildFixPrompt(result.audit, result.issues, result.schemaErrors)} />
              </div>
              <ul>
                {[...new Set(problems)].map((problem) => <li key={problem}>{problem}</li>)}
              </ul>
            </section>
          )}

          {hasText && result.issues.some((issue) => issue.level === "info") && (
            <section className="paste-panel card paste-info">
              <ul>{result.issues.filter((issue) => issue.level === "info").map((issue) => <li key={issue.message}>{issue.message}</li>)}</ul>
            </section>
          )}

          {hasText && result.sections.length > 0 && (
            <section className="paste-panel card">
              <h2>What was read</h2>
              <ul className="paste-sections">
                {result.sections.map((section) => (
                  <li key={section.key} className={`is-${section.status}`}>
                    <span className="paste-mark" aria-label={statusMark[section.status].label}>{statusMark[section.status].symbol}</span>
                    <span><strong>{section.label}</strong> <small>{section.detail}</small></span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.references.length > 0 && (
            <section className="paste-panel card">
              <h2>References — open each link to check it</h2>
              <ol className="paste-refs">
                {result.references.map((ref) => (
                  <li key={ref.n}>
                    <a href={ref.url} target="_blank" rel="noopener noreferrer">{ref.title}</a>
                    <small>{ref.edition}{ref.locator ? ` · ${ref.locator}` : ""}</small>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </aside>
      </form>
    </div>
  );
}
