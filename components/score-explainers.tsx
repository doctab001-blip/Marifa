import Link from "next/link";
import { scoresByFirstUse, type ScoreSection } from "@/lib/clinical-scores";

type DiseaseLike = Parameters<typeof scoresByFirstUse>[0];

/** Explains every clinical score the topic names, with a table of its values, at the first section that uses it. */
export function ScoreExplainers({ disease, section }: { disease: DiseaseLike; section: ScoreSection }) {
  const scores = scoresByFirstUse(disease)[section];
  if (!scores.length) return null;
  return (
    <div className="score-explainers">
      {scores.map((score) => (
        <details key={score.id} className="score-explainer">
          <summary className="score-explainer-summary">
            <span className="score-explainer-kicker">Score explained</span>
            <span className="score-explainer-title">{score.name}</span>
            <span className="score-explainer-toggle" aria-hidden="true">Show table</span>
          </summary>
          <p className="score-explainer-purpose">{score.purpose}</p>
          <p className="score-explainer-range"><strong>Range:</strong> {score.range}</p>
          {score.tables.map((table) => (
            <div className="em-table-wrap score-explainer-table" key={table.caption}>
              <table className="em-table">
                <caption>{table.caption}</caption>
                <thead><tr>{table.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
                <tbody>{table.rows.map((row, index) => <tr key={`${table.caption}-${index}`}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          ))}
          {score.note ? <p className="score-explainer-note">{score.note}</p> : null}
          <p className="score-explainer-foot">
            {score.calculatorId ? <Link href={`/dashboard/medical-calculators?calc=${encodeURIComponent(score.calculatorId)}`} prefetch={false}>Open the calculator</Link> : null}
            <span>Source: <a href={score.source.url} target="_blank" rel="noreferrer noopener">{score.source.label}</a></span>
          </p>
        </details>
      ))}
    </div>
  );
}
