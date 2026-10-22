"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight, Calculator, CheckCircle2, ChevronDown, CircleDashed, Columns2, FlaskConical, Info, ShieldAlert, Siren, XCircle } from "lucide-react";
import type { DifferentialMatch, PathwayStatus, UrgencyLevel } from "@/types/diagnosisEngine";

// A pathway is only called "approved" after a clinician presses Approve on the topic page.
const PATHWAY_STATUS: Record<PathwayStatus, string> = {
  approved: "Clinically approved",
  pending_review: "Live · clinical review pending",
  unverified: "Catalogue link · not verified live",
};

export const URGENCY: Record<UrgencyLevel, { label: string; className: string }> = {
  CRITICAL_MUST_NOT_MISS: { label: "Must-not-miss", className: "dx-urgency dx-urgency--critical" },
  HIGH: { label: "High priority", className: "dx-urgency dx-urgency--high" },
  ROUTINE: { label: "Routine", className: "dx-urgency dx-urgency--routine" },
};

export function scoreBand(score: number) {
  if (score >= 70) return "Strong match";
  if (score >= 40) return "Moderate match";
  if (score > 0) return "Weak match";
  return "Consider — not yet supported";
}

export const matchedList = (match: DifferentialMatch) => [
  ...match.matchedFeatures.symptomsMatched,
  ...match.matchedFeatures.examMatched,
  ...match.matchedFeatures.labsMatched,
  ...match.matchedFeatures.imagingMatched,
];

type CardProps = {
  match: DifferentialMatch;
  rank: number;
  defaultOpen?: boolean;
  /** Compare selection; omit to hide the compare control. */
  compareSelected?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: () => void;
};

export function DifferentialCard({ match, rank, defaultOpen = false, compareSelected = false, compareDisabled = false, onToggleCompare }: CardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const critical = match.urgencyLevel === "CRITICAL_MUST_NOT_MISS";
  const urgency = URGENCY[match.urgencyLevel];
  const matched = matchedList(match);
  const contextNotes = match.contextNotes ?? [];
  const calculators = match.calculators ?? [];

  return (
    <article className={`dx-card${critical ? " dx-card--critical" : ""}${compareSelected ? " dx-card--compare" : ""}`} data-urgency={match.urgencyLevel} aria-labelledby={`${panelId}-title`}>
      {critical ? (
        <p className="dx-critical-banner" role="note"><Siren size={15} strokeWidth={2} aria-hidden="true" />Life-threatening — exclude actively before an alternative diagnosis is accepted</p>
      ) : null}
      <header className="dx-card-head">
        <span className="dx-rank" aria-label={`Rank ${rank}`}>{rank}</span>
        <div className="dx-card-title-block">
          <h3 id={`${panelId}-title`} className="dx-card-title">{match.diseaseTitle}</h3>
          <p className="dx-card-meta">
            <span className="dx-icd" title="ICD-10 code">ICD-10 {match.icd10Code}</span>
            <span className={urgency.className}>{critical ? <ShieldAlert size={13} strokeWidth={2.2} aria-hidden="true" /> : null}{urgency.label}</span>
            <span className="dx-specialty">{match.specialty}</span>
          </p>
        </div>
        {onToggleCompare ? (
          <button type="button" className="dx-compare-toggle dx-no-print" aria-pressed={compareSelected} disabled={compareDisabled && !compareSelected} onClick={onToggleCompare} title={compareDisabled && !compareSelected ? "Two conditions are already selected" : "Compare side by side"}>
            <Columns2 size={14} strokeWidth={2} aria-hidden="true" />{compareSelected ? "Comparing" : "Compare"}
          </button>
        ) : null}
      </header>

      <div className="dx-score">
        <div className="dx-score-row">
          <span className="dx-score-label">{scoreBand(match.matchScore)}</span>
          <span className="dx-score-value">{match.matchScore}%</span>
        </div>
        <div className="dx-meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={match.matchScore} aria-label={`Match score ${match.matchScore}%`}>
          <span style={{ width: `${Math.max(match.matchScore, 2)}%` }} />
        </div>
        {matched.length ? (
          <ul className="dx-match-tags" aria-label="Entered findings that match">
            {matched.map((item) => <li key={item}>{item}</li>)}
          </ul>
        ) : (
          <p className="dx-muted">No entered finding matches yet — listed so it is actively considered.</p>
        )}
        {contextNotes.length ? (
          <ul className="dx-context-notes" aria-label="Age and region adjustments">
            {contextNotes.map((note) => <li key={note}><Info size={13} strokeWidth={2.2} aria-hidden="true" />{note}</li>)}
          </ul>
        ) : null}
      </div>

      <button type="button" className="dx-disclosure dx-no-print" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}>
        Clinical justification
        <ChevronDown size={16} strokeWidth={2} aria-hidden="true" className={open ? "dx-rotate" : undefined} />
      </button>

      <div id={panelId} className={`dx-justification${open ? "" : " dx-collapsed"}`}>
        <section>
          <h4>Matched evidence</h4>
          {matched.length ? (
            <ul className="dx-evidence">
              {matched.map((item) => <li key={item}><CheckCircle2 size={15} strokeWidth={2.2} aria-hidden="true" />{item}</li>)}
            </ul>
          ) : <p className="dx-muted">None entered.</p>}
          {match.contradictingFindings.length ? (
            <ul className="dx-evidence dx-evidence--against" aria-label="Findings against">
              {match.contradictingFindings.map((item) => <li key={item}><XCircle size={15} strokeWidth={2.2} aria-hidden="true" />{item}<span className="dx-sr-only"> (argues against)</span></li>)}
            </ul>
          ) : null}
        </section>
        {match.missingClassicFeatures.length ? (
          <section>
            <h4>Key missing features</h4>
            <ul className="dx-missing">
              {match.missingClassicFeatures.map((item) => <li key={item}><CircleDashed size={12} strokeWidth={2.2} aria-hidden="true" />{item}</li>)}
            </ul>
          </section>
        ) : null}
        <section>
          <h4>Suggested rule-in / rule-out tests</h4>
          <ul className="dx-steps">
            {match.suggestedNextSteps.map((step) => (
              <li key={step.testName}><FlaskConical size={14} strokeWidth={2} aria-hidden="true" /><span><strong>{step.testName}</strong> — {step.clinicalRationale}</span></li>
            ))}
          </ul>
        </section>
        {match.redFlags.length ? (
          <section className="dx-redflags">
            <h4>Red flags</h4>
            <ul>{match.redFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul>
          </section>
        ) : null}
      </div>

      {calculators.length ? (
        <div className="dx-calculators">
          <span className="dx-calculators-label"><Calculator size={14} strokeWidth={2} aria-hidden="true" />Calculators</span>
          {calculators.map((calculator) => (
            <Link key={calculator.id} href={calculator.href} prefetch={false} className="dx-calculator-link">{calculator.title}</Link>
          ))}
        </div>
      ) : null}

      <footer className="dx-card-foot">
        <span className="dx-pathway-name">
          {match.pathwayTitle}
          <span className={`dx-pathway-flag dx-pathway-flag--${match.pathwayStatus}`}>{PATHWAY_STATUS[match.pathwayStatus]}</span>
        </span>
        <Link className="dx-pathway-button" href={match.marifaPathwayUrl} prefetch={false}>
          {match.pathwayStatus === "approved" ? "Open Approved Pathway" : "Open Pathway"} <ArrowRight size={15} strokeWidth={2.2} aria-hidden="true" />
        </Link>
      </footer>
    </article>
  );
}
