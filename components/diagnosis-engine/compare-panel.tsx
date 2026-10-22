"use client";

import Link from "next/link";
import { Columns2, X } from "lucide-react";
import type { DiscriminatingFinding, DifferentialMatch } from "@/types/diagnosisEngine";
import { URGENCY, matchedList, scoreBand } from "./differential-card";

type Props = { pair: [DifferentialMatch, DifferentialMatch]; discriminators: DiscriminatingFinding[]; onClose: () => void };

const List = ({ items, empty = "—" }: { items: string[]; empty?: string }) => (items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <span className="dx-muted-inline">{empty}</span>);

/** Two differentials side by side, with the findings and tests that tell them apart. */
export function ComparePanel({ pair, discriminators, onClose }: Props) {
  const [a, b] = pair;
  const matchedA = matchedList(a), matchedB = matchedList(b);
  const sharedSet = new Set(matchedA.filter((item) => matchedB.includes(item)));
  const separating = (match: DifferentialMatch) => discriminators.filter((item) => item.supports.length === 1 && item.supports[0] === match.diseaseTitle).map((item) => `${item.finding}${item.howToCheck ? ` (${item.howToCheck})` : ""}`);
  const testsA = a.suggestedNextSteps.map((step) => step.testName), testsB = b.suggestedNextSteps.map((step) => step.testName);

  const rows: Array<{ label: string; cells: [React.ReactNode, React.ReactNode] }> = [
    { label: "Match", cells: [`${a.matchScore}% · ${scoreBand(a.matchScore)}`, `${b.matchScore}% · ${scoreBand(b.matchScore)}`] },
    { label: "Urgency", cells: [<span key="a" className={URGENCY[a.urgencyLevel].className}>{URGENCY[a.urgencyLevel].label}</span>, <span key="b" className={URGENCY[b.urgencyLevel].className}>{URGENCY[b.urgencyLevel].label}</span>] },
    { label: "Supports only this", cells: [<List key="a" items={matchedA.filter((item) => !sharedSet.has(item))} />, <List key="b" items={matchedB.filter((item) => !sharedSet.has(item))} />] },
    { label: "Against", cells: [<List key="a" items={a.contradictingFindings} />, <List key="b" items={b.contradictingFindings} />] },
    { label: "Key features not yet found", cells: [<List key="a" items={a.missingClassicFeatures.slice(0, 4)} />, <List key="b" items={b.missingClassicFeatures.slice(0, 4)} />] },
    { label: "Would favour this", cells: [<List key="a" items={separating(a)} />, <List key="b" items={separating(b)} />] },
    { label: "First tests", cells: [<List key="a" items={testsA.slice(0, 3)} />, <List key="b" items={testsB.slice(0, 3)} />] },
    { label: "Pathway", cells: [<Link key="a" href={a.marifaPathwayUrl} prefetch={false}>{a.pathwayTitle}</Link>, <Link key="b" href={b.marifaPathwayUrl} prefetch={false}>{b.pathwayTitle}</Link>] },
  ];

  return (
    <section className="dx-compare" aria-labelledby="dx-compare-title">
      <header>
        <h3 id="dx-compare-title"><Columns2 size={16} strokeWidth={2} aria-hidden="true" />Side-by-side comparison</h3>
        <button type="button" className="dx-ghost-button dx-no-print" onClick={onClose}><X size={14} strokeWidth={2} aria-hidden="true" />Close</button>
      </header>
      {sharedSet.size ? <p className="dx-compare-shared">Shared findings: {[...sharedSet].join(", ")}</p> : null}
      <div className="dx-compare-scroll">
        <table>
          <thead>
            <tr><th scope="col"><span className="dx-sr-only">Feature</span></th><th scope="col">{a.diseaseTitle}</th><th scope="col">{b.diseaseTitle}</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}><th scope="row">{row.label}</th><td>{row.cells[0]}</td><td>{row.cells[1]}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
