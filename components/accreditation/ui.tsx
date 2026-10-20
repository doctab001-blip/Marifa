import Link from "next/link";
import type { ReactNode } from "react";
import type { EvidenceHealth, Outcome } from "@/lib/governance/scoring";
import { OUTCOME_LABEL, RISK_BAND_LABEL, riskBand } from "@/lib/governance/scoring";
import { RATING_LABEL, type Rating } from "@/lib/governance/types";

export type Tone = "ok" | "warn" | "bad" | "info" | "muted";

export function Badge({ tone = "muted", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`gh-badge gh-${tone}`}>{children}</span>;
}

export function Meter({ pct, tone, label }: { pct: number | null; tone?: Exclude<Tone, "muted">; label: string }) {
  const value = pct === null ? 0 : Math.max(0, Math.min(100, pct));
  const auto = tone ?? (value >= 85 ? "ok" : value >= 70 ? "warn" : "bad");
  return (
    <div className={`gh-meter gh-tone-${auto}`} role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

export function Stat({ label, value, unit, note, href, tone }: { label: string; value: ReactNode; unit?: string; note?: ReactNode; href?: string; tone?: Tone }) {
  const body = (
    <>
      <div className="gh-stat-label">{label}</div>
      <div className="gh-stat-value">{value}{unit ? <small> {unit}</small> : null}</div>
      {note ? <div className="gh-stat-note">{tone ? <Badge tone={tone}>{note}</Badge> : note}</div> : null}
    </>
  );
  return href ? <Link href={href} className="gh-card gh-card-link">{body}</Link> : <div className="gh-card">{body}</div>;
}

export function Notice({ done, error }: { done?: string; error?: string }) {
  if (!done && !error) return null;
  return error
    ? <p className="gh-notice gh-notice-bad" role="alert">{error}</p>
    : <p className="gh-notice gh-notice-ok" role="status">{done}</p>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="gh-empty">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function Details({ title, children, open }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="gh-details gh-noprint" open={open}>
      <summary>{title}</summary>
      <div className="gh-details-body">{children}</div>
    </details>
  );
}

export function RatingBadge({ rating }: { rating: Rating | null }) {
  if (!rating) return <Badge tone="muted">Not assessed</Badge>;
  const tone: Tone = rating === "satisfactory" ? "ok" : rating === "partial" ? "warn" : rating === "insufficient" ? "bad" : "muted";
  return <Badge tone={tone}>{RATING_LABEL[rating]}</Badge>;
}

export function EvidenceBadge({ health, count }: { health: EvidenceHealth; count?: number }) {
  if (health === "valid") return <Badge tone="ok">Evidence current{count ? ` · ${count}` : ""}</Badge>;
  if (health === "expiring") return <Badge tone="warn">Evidence expiring{count ? ` · ${count}` : ""}</Badge>;
  if (health === "expired") return <Badge tone="bad">Evidence expired</Badge>;
  return <Badge tone="muted">No evidence</Badge>;
}

export function OutcomeBadge({ outcome }: { outcome: Outcome | null }) {
  if (!outcome) return <Badge tone="muted">Outcome not indicated yet</Badge>;
  return <Badge tone={outcome === "accreditation" ? "ok" : outcome === "conditional" ? "warn" : "bad"}>{OUTCOME_LABEL[outcome]}</Badge>;
}

export function RiskBadge({ score }: { score: number }) {
  const band = riskBand(score);
  const tone: Tone = band === "extreme" ? "bad" : band === "high" ? "warn" : band === "moderate" ? "info" : "ok";
  return <Badge tone={tone}>{RISK_BAND_LABEL[band]} · {score}</Badge>;
}

/** Circular gauge drawn in SVG, so it needs no client JavaScript. */
export function Gauge({ pct, label, tone }: { pct: number | null; label: string; tone: Exclude<Tone, "muted" | "info"> | "muted" }) {
  const r = 70, c = 2 * Math.PI * r;
  const value = pct === null ? 0 : Math.max(0, Math.min(100, pct));
  const stroke = tone === "ok" ? "#10b981" : tone === "warn" ? "#f59e0b" : tone === "bad" ? "#f43f5e" : "#94a3b8";
  return (
    <div className="gh-ring" role="img" aria-label={pct === null ? `${label}: not available yet` : `${label}: ${pct} percent`}>
      <svg viewBox="0 0 168 168" width="168" height="168" aria-hidden="true">
        <circle cx="84" cy="84" r={r} fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="14" />
        <circle cx="84" cy="84" r={r} fill="none" stroke={stroke} strokeWidth="14" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <div className="gh-ring-center">
        <div className="gh-ring-value">{pct === null ? "—" : `${pct}%`}</div>
        <div className="gh-ring-label">{label}</div>
      </div>
    </div>
  );
}

export function nameOf(people: Map<string, string>, userId: string | null | undefined): string {
  return userId ? people.get(userId) ?? "Unknown user" : "Unassigned";
}

export function pageParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] ?? "" : "";
}
