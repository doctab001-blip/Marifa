"use client";

import { CheckCircle2, Clock3, FilePenLine, History, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";

type Step = "draft" | "under_review" | "approved" | "published";
const order: Step[] = ["draft", "under_review", "approved", "published"];
const titles: Record<Step, string> = { draft: "Draft", under_review: "Under review", approved: "Approved", published: "Published" };

export function GuidelineWorkflow() {
  const [step, setStep] = useState<Step>("draft");
  const [history, setHistory] = useState(["Version 0.1-demo created as draft"]);
  const advance = () => {
    const next = order[order.indexOf(step) + 1];
    if (!next) return;
    setStep(next);
    setHistory((items) => [`Status changed to ${titles[next]} by demo governance user`, ...items]);
  };
  return <div className="clinical-grid"><section className="card section-card"><div className="section-head"><div><div className="eyebrow">Demonstration workflow</div><h2 style={{ marginTop: 5 }}>Chest pain assessment record</h2></div><span className="status status-draft">{titles[step]}</span></div><div className="grid" style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>{order.map((item, index) => <div key={item} style={{ padding: 12, borderRadius: 10, border: "1px solid #e5eaf1", background: order.indexOf(step) >= index ? "var(--royal-soft)" : "white", color: order.indexOf(step) >= index ? "var(--royal)" : "#98a2b3", fontWeight: 800, textAlign: "center" }}>{titles[item]}</div>)}</div><div className="card" style={{ boxShadow: "none", marginTop: 16, padding: 16 }}><div className="result-meta"><span><FilePenLine size={13} />Version 0.1-demo</span><span><Clock3 size={13} />Review due 18 Dec 2026</span><span><ShieldCheck size={13} />Not clinically approved</span></div><p className="page-copy" style={{ marginTop: 12 }}>This interactive demonstration shows lifecycle state changes. It intentionally does not publish real content or persist outside this browser session.</p></div><button className="button-primary" style={{ marginTop: 16 }} onClick={advance} disabled={step === "published"}>{step === "published" ? <><CheckCircle2 size={15} />Workflow complete</> : <><Send size={15} />Advance to {titles[order[order.indexOf(step) + 1]]}</>}</button></section><aside className="card section-card"><div className="section-head"><h2>Immutable audit preview</h2><History size={18} style={{ color: "var(--royal)" }} /></div>{history.map((event, index) => <div className="topic-row" key={`${event}-${index}`}><div className="topic-icon"><History size={15} /></div><div className="topic-main"><strong>{event}</strong><p>{new Date().toLocaleString()}</p></div></div>)}</aside></div>;
}
