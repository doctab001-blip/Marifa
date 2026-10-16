import type { DiseaseDetail } from "@/lib/validations/disease";
import { investigationDisplayTier, investigationMethod, investigationNeedsReview, type InvestigationReference } from "@/lib/investigation-display";

const groups = [
  ["bedside", "Bedside assessment & monitoring"],
  ["laboratory", "Laboratory tests"],
  ["firstLineImaging", "First-line imaging"],
  ["advancedImaging", "Advanced imaging"],
  ["specializedAdjunctive", "Specialist & additional assessments"],
] as const;

export function InvestigationCards({ investigations, source }: {
  investigations: DiseaseDetail["investigations"];
  source?: InvestigationReference;
}) {
  const tests = (["ruleIn", "ruleOut"] as const).flatMap((group) => investigations[group].map((test) => ({ ...test, group })));
  const incomplete = tests.some(investigationNeedsReview);
  return <div className="investigation-groups">
    <p className="investigation-intro">Read each assessment with its clinical question, findings and reason for testing. Select tests according to the patient and the current local pathway.</p>
    {incomplete && <p className="investigation-review-note" role="note"><strong>Investigation detail needs clinical review.</strong> Some saved entries contain general assessment advice. Their exact tests, findings and decision rationale still need source verification; they are marked below.</p>}
    {groups.map(([tier, title]) => {
      const entries = tests.filter((test) => investigationDisplayTier(test) === tier);
      if (!entries.length) return null;
      return <section className="investigation-tier" key={tier} aria-labelledby={`investigation-${tier}`}>
        <h3 id={`investigation-${tier}`}>{title} <span className="investigation-count">{entries.length}</span></h3>
        <ul className="investigation-list">
          {entries.map((test, index) => {
            const method = investigationMethod(test);
            return <li className="investigation-card" key={`${test.group}-${index}-${test.testName}`}>
              <header><h4>{test.testName}</h4><span className="investigation-purpose">{test.group === "ruleIn" ? "Diagnostic assessment" : "Alternatives & complications"}</span></header>
              {investigationNeedsReview(test) && <p className="investigation-review-label">Specific test details awaiting review</p>}
              <dl className="investigation-details">
                <div><dt>What are we looking for?</dt><dd>{test.targetCondition}</dd></div>
                <div><dt>Why are we doing it?</dt><dd>{test.clinicalRationale}</dd></div>
                <div className="investigation-finding"><dt>Findings & interpretation</dt><dd>{test.expectedFinding}</dd></div>
                {method && <div><dt>Method & clinical context</dt><dd>{method}</dd></div>}
              </dl>
              {test.references?.length ? <div className="investigation-card-sources"><strong>References</strong><ul>{test.references.map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer">{reference.title} ({reference.edition})</a></li>)}</ul></div> : null}
            </li>;
          })}
        </ul>
      </section>;
    })}
    {source && <div className="investigation-sources"><strong>Saved guideline source</strong><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><p>Source provenance for this version. A textbook edition page or protocol directory is a reading reference; it does not verify each test or establish local approval.</p></div>}
  </div>;
}
