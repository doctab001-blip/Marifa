"use client";

import { useState } from "react";
import { FileText } from "@/components/icons-3d";
import { draftToMarkdown, markdownToDraft, type DraftTopic } from "@/lib/draft-markdown";

export function DraftMarkdownCanvas({ topic, onApply }: { topic: DraftTopic; onApply: (next: DraftTopic) => void }) {
  const [markdown, setMarkdown] = useState(() => draftToMarkdown(topic));
  const [warnings, setWarnings] = useState<string[]>([]);

  const parse = (value: string) => {
    const result = markdownToDraft(value, topic);
    setWarnings(result.warnings);
    onApply(result.draft);
  };

  return <section className="card markdown-canvas" aria-labelledby="markdown-canvas-title">
    <header><FileText size={20} aria-hidden="true" /><div><p className="eyebrow">Bulk Markdown</p><h3 id="markdown-canvas-title">Single canvas editor</h3><p>Changes are parsed locally as you type. No AI or network request is used.</p></div></header>
    <textarea aria-label="Bulk Markdown draft" value={markdown} onChange={(event) => { const value = event.target.value; event.currentTarget.style.height = "auto"; event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`; setMarkdown(value); parse(value); }} onBlur={() => parse(markdown)} spellCheck={false} />
    <footer><span className={`markdown-parse-status ${warnings.length ? "is-warning" : "is-ready"}`}>{warnings.length ? "🟡 Parsed with warnings" : "🟢 All 8 core sections successfully parsed"}</span>{warnings.length > 0 && <div className="markdown-warning-pills" role="status">{warnings.map((warning) => <span key={warning}>{warning}</span>)}</div>}</footer>
  </section>;
}
