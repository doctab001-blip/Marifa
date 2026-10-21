import Link from "next/link";
import type { ReactNode } from "react";
import type { EvidenceHealth, Outcome } from "@/lib/governance/scoring";
import { OUTCOME_LABEL, RISK_BAND_LABEL, riskBand, riskBandWith, type RiskThresholds } from "@/lib/governance/scoring";
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

/** Section accents from the V2.1 palette (restrained tints, never a full saturated background). */
export type Accent = "navy" | "teal" | "turquoise" | "blue" | "gold" | "coral" | "emerald" | "indigo";

export function Stat({ label, value, unit, note, href, tone, accent, icon, progress }: {
  label: string; value: ReactNode; unit?: string; note?: ReactNode; href?: string; tone?: Tone;
  /** Tinted KPI card with a small icon and an optional compact progress bar. */
  accent?: Accent; icon?: ReactNode; progress?: number | null;
}) {
  const body = (
    <>
      <div className="gh-stat-top">
        <div className="gh-stat-label">{label}</div>
        {icon ? <span className="gh-stat-icon" aria-hidden="true">{icon}</span> : null}
      </div>
      <div className="gh-stat-value">{value}{unit ? <small> {unit}</small> : null}</div>
      {progress !== undefined && progress !== null ? (
        <div className="gh-stat-progress" role="progressbar" aria-label={`${label} progress`} aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      ) : null}
      {note ? <div className="gh-stat-note">{tone ? <Badge tone={tone}>{note}</Badge> : note}</div> : null}
    </>
  );
  const cls = `gh-card gh-stat${accent ? ` gh-kpi gh-accent-${accent}` : ""}`;
  return href ? <Link href={href} className={`${cls} gh-card-link`}>{body}</Link> : <div className={cls}>{body}</div>;
}

/** Compact page header: icon, eyebrow, title, one-line subtitle and the page's main actions. */
export function PageHeader({ icon, eyebrow = "Governance hub", title, subtitle, actions, children }: {
  icon?: ReactNode; eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children?: ReactNode;
}) {
  return (
    <header className="gh-head gh-pagehead">
      <div className="gh-pagehead-main">
        {icon ? <span className="gh-pagehead-icon" aria-hidden="true">{icon}</span> : null}
        <div>
          <div className="gh-eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
          {children}
        </div>
      </div>
      {actions ? <div className="gh-btnrow gh-noprint">{actions}</div> : null}
    </header>
  );
}

export type Step = { key: string; label: string; hint?: string };

/**
 * One visual language for every workflow (policy approval, evidence verification, incident investigation, CAPA,
 * committee meetings, PDSA). Done / current / to-do are shown with text and shape, not only colour.
 */
export function Stepper({ steps, current, branch, label }: { steps: Step[]; current: string; branch?: { label: string; tone: Tone } | null; label: string }) {
  const index = steps.findIndex((s) => s.key === current);
  return (
    <ol className="gh-stepper" aria-label={label}>
      {steps.map((step, i) => {
        const state = index === -1 ? "todo" : i < index ? "done" : i === index ? "current" : "todo";
        return (
          <li key={step.key} className={`gh-step gh-step-${state}`} aria-current={state === "current" ? "step" : undefined}>
            <span className="gh-step-dot" aria-hidden="true">{state === "done" ? "✓" : i + 1}</span>
            <span className="gh-step-text"><strong>{step.label}</strong>{step.hint ? <small>{step.hint}</small> : null}
              <span className="sr-only">{state === "done" ? " (completed)" : state === "current" ? " (current step)" : " (not started)"}</span></span>
          </li>
        );
      })}
      {branch ? <li className="gh-step gh-step-branch"><Badge tone={branch.tone}>{branch.label}</Badge></li> : null}
    </ol>
  );
}

/** Secondary tabs inside a section (e.g. Policies | Clinical guidelines). Links, so they work without JavaScript. */
export function SubNav({ items, current, label }: { items: { href: string; label: string; key: string; count?: number }[]; current: string; label: string }) {
  return (
    <nav className="gh-subnav gh-noprint" aria-label={label}>
      {items.map((item) => (
        <Link key={item.key} href={item.href} aria-current={item.key === current ? "page" : undefined}>
          {item.label}{item.count !== undefined ? <span className="gh-count">{item.count}</span> : null}
        </Link>
      ))}
    </nav>
  );
}

/** Shown in place of a V2.1 panel when the V2.1 migration has not been applied to this database yet. */
export function NeedsV21({ what }: { what: string }) {
  return (
    <p className="gh-notice gh-notice-info" role="note">
      <strong>{what} is not available yet.</strong> It needs the Governance Hub V2.1 database update (migration 20261021090000). Everything else on this page works as before.
    </p>
  );
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

export function RiskBadge({ score, thresholds }: { score: number; thresholds?: RiskThresholds }) {
  const band = thresholds ? riskBandWith(score, thresholds) : riskBand(score);
  const tone: Tone = band === "extreme" ? "bad" : band === "high" ? "warn" : band === "moderate" ? "info" : "ok";
  return <Badge tone={tone}>{RISK_BAND_LABEL[band]} · {score}</Badge>;
}

/** Circular gauge drawn in SVG, so it needs no client JavaScript. */
export function Gauge({ pct, label, tone }: { pct: number | null; label: string; tone: Exclude<Tone, "muted" | "info"> | "muted" }) {
  const r = 70, c = 2 * Math.PI * r;
  const value = pct === null ? 0 : Math.max(0, Math.min(100, pct));
  const stroke = tone === "ok" ? "var(--mx-emerald, #10b981)" : tone === "warn" ? "var(--mx-gold, #f59e0b)" : tone === "bad" ? "var(--mx-coral, #f43f5e)" : "#94a3b8";
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
