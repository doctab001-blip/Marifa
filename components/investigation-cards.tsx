import type { DiseaseDetail } from "@/lib/validations/disease";
import { investigationNeedsReview, type InvestigationReference } from "@/lib/investigation-display";
import { SourceCitation } from "@/components/source-citation";
import { InvestigationTable } from "@/components/investigation-table";
import { mapInvestigationTableRows } from "@/lib/investigation-table";

export function InvestigationCards({ investigations, source }: {
  investigations: DiseaseDetail["investigations"];
  source?: InvestigationReference;
}) {
  const tests = (["ruleIn", "ruleOut"] as const).flatMap((group) => investigations[group].map((test) => ({ ...test, group })));
  const incomplete = tests.some(investigationNeedsReview);
  const tableData = mapInvestigationTableRows(investigations);
  const references = tests.flatMap((test) => (test.references ?? []).map((reference) => ({ ...reference, investigation: test.testName })));
  return <div className="investigation-groups">
    <p className="investigation-intro">Read each assessment with its clinical question, findings and reason for testing. Select tests according to the patient and the current local pathway.</p>
    {incomplete && <p className="investigation-review-note" role="note"><strong>Investigation detail needs clinical review.</strong> Some saved entries contain general assessment advice. Their exact tests, findings and decision rationale still need source verification; they are marked below.</p>}
    <InvestigationTable data={tableData} />
    {references.length ? <div className="investigation-sources"><strong>Investigation references</strong><ul>{references.map((reference) => <li key={`${reference.investigation}-${reference.url}`}><strong>{reference.investigation}:</strong> <a href={reference.url} target="_blank" rel="noreferrer">{reference.title} ({reference.edition})</a></li>)}</ul></div> : null}
    <SourceCitation sources={source ? [source] : []} />
  </div>;
}
