import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoBanner } from "@/components/demo-banner";

type BranchDraft = {
  conditionName: string;
  clinicalActionPlan: string;
  diagnosticEvaluation: { primaryAssessments: string[]; differentialElimination: string[] };
  interventionAndManagement: { firstLineTherapy: string[]; supportiveMeasures: string[] };
  pros: string[];
  cons: string[];
  disposition: string;
};

type StructuredBranchDraft = {
  disease_name: string;
  is_verified: false;
  presentation_and_red_flags: { cardinal_symptoms: string[]; urgent_escalation_criteria: string[] };
  differential_diagnoses: { condition: string; distinguishing_features: string }[];
  investigations: { test_name: string; rationale: string; interpretation_threshold: string }[];
  acute_management_sequence: { step_order: number; intervention_type: string; details: string; specific_drugs: { drug_name: string; dosage: string; route: string; frequency: string }[] }[];
  disposition_criteria: { discharge_requirements: string[]; follow_up_timeline: string };
};

type SourceMetadata = {
  reviewStatus: string;
  clinicalUseApproved: false;
  generatedAt: string;
  model: string;
  citations: Array<{ url: string; title: string }>;
};

function ItemList({ title, items }: { title: string; items: string[] }) {
  return <section className="card section-card"><h2 className="heading">{title}</h2><ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-body">{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul></section>;
}

function SourceReferences({ source }: { source: SourceMetadata }) {
  return <section className="card section-card"><h2 className="heading">Reference sources</h2><ul className="list-disc space-y-2 pl-5 text-sm">{source.citations.map((citation) => <li key={citation.url}><a href={citation.url} target="_blank" rel="noreferrer">{citation.title || citation.url}</a></li>)}</ul><p className="mt-3 text-xs text-muted">Draft recorded {new Date(source.generatedAt).toLocaleString("en-GB", { timeZone: "Asia/Riyadh" })} · {source.model}</p></section>;
}

function StructuredDraft({ draft }: { draft: StructuredBranchDraft }) {
  return <>
    <section className="card section-card"><h2 className="heading">Cardinal symptoms</h2><ItemList title="Presentation" items={draft.presentation_and_red_flags.cardinal_symptoms} /><ItemList title="Urgent escalation criteria" items={draft.presentation_and_red_flags.urgent_escalation_criteria} /></section>
    <section className="card section-card"><h2 className="heading">Differential diagnoses</h2><ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-body">{draft.differential_diagnoses.map(({ condition, distinguishing_features }) => <li key={condition}><strong>{condition}:</strong> {distinguishing_features}</li>)}</ul></section>
    <section className="card section-card"><h2 className="heading">Investigations</h2><ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-body">{draft.investigations.map(({ test_name, rationale, interpretation_threshold }, index) => <li key={`${test_name}-${index}`}><strong>{test_name === "NULL" ? "No routine test specified" : test_name}:</strong> {rationale}{interpretation_threshold !== "NULL" ? ` Interpretation: ${interpretation_threshold}` : ""}</li>)}</ul></section>
    <section className="card section-card"><h2 className="heading">Management sequence</h2><ol className="list-decimal space-y-4 pl-5 text-sm leading-6 text-body">{draft.acute_management_sequence.map((step) => <li key={step.step_order}><strong>{step.intervention_type}.</strong> {step.details}{step.specific_drugs.length > 0 && <ul className="mt-2 list-disc pl-5">{step.specific_drugs.map((drug) => <li key={drug.drug_name}><strong>{drug.drug_name}</strong> — {drug.dosage}; {drug.route}; {drug.frequency}</li>)}</ul>}</li>)}</ol></section>
    <section className="card section-card"><h2 className="heading">Disposition and follow-up</h2><p className="page-copy">{draft.disposition_criteria.follow_up_timeline}</p>{draft.disposition_criteria.discharge_requirements.filter((item) => item !== "NULL").length > 0 && <ItemList title="Discharge requirements" items={draft.disposition_criteria.discharge_requirements.filter((item) => item !== "NULL")} />}</section>
  </>;
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function readJson<T>(filename: string): Promise<T | null> {
  try { return JSON.parse(await readFile(filename, "utf8")) as T; }
  catch { return null; }
}

export default async function ClinicalBranchPage({ params }: { params: Promise<{ condition: string }> }) {
  const { condition } = await params;
  if (!/^[a-z0-9-]+$/.test(condition)) notFound();
  const directory = join(process.cwd(), "data/clinical-branch-drafts");
  const [draft, source] = await Promise.all([
    readJson<BranchDraft | StructuredBranchDraft>(join(directory, `${condition}.json`)),
    readJson<SourceMetadata>(join(directory, `${condition}.sources.json`)),
  ]);
  if (!draft || !source || source.clinicalUseApproved !== false) notFound();
  const isStructured = "disease_name" in draft;
  const conditionName = isStructured ? draft.disease_name : draft.conditionName;
  if (isStructured && draft.is_verified !== false) notFound();
  if (slugify(conditionName) !== condition) notFound();

  return <main className="page"><DemoBanner />
    <Link href="/diseases" className="section-link" style={{ display: "inline-flex", marginBottom: 16 }}>← Back to disease directory</Link>
    <header className="page-header"><div><div className="eyebrow">Clinical branch · {source.reviewStatus}</div><h1 className="page-title">{conditionName}</h1><p className="page-copy">Unreviewed clinical draft awaiting source verification and governance review.</p></div><span className="status status-warn">UNREVIEWED · NOT FOR CLINICAL USE</span></header>
    <p className="clinical-review-draft-notice"><strong>UNREVIEWED DRAFT — NOT FOR CLINICAL USE.</strong> This draft has no clinical approval or publication record. Verify every statement against the original guideline and local policy before any clinical use.</p>
    {isStructured ? <div className="grid"><StructuredDraft draft={draft} /><SourceReferences source={source} /></div> : <>
    <section className="card section-card"><h2 className="heading">Clinical action plan</h2><p className="page-copy">{draft.clinicalActionPlan}</p></section>
    <div className="clinical-grid" style={{ marginTop: 16 }}>
      <div className="grid">
        <ItemList title="Primary assessments" items={draft.diagnosticEvaluation.primaryAssessments} />
        <ItemList title="Differential elimination" items={draft.diagnosticEvaluation.differentialElimination} />
        <ItemList title="First-line therapy" items={draft.interventionAndManagement.firstLineTherapy} />
        <ItemList title="Supportive measures" items={draft.interventionAndManagement.supportiveMeasures} />
      </div>
      <aside className="grid" style={{ alignContent: "start" }}>
        <ItemList title="Potential benefits" items={draft.pros} />
        <ItemList title="Risks and limitations" items={draft.cons} />
        <section className="card section-card"><h2 className="heading">Disposition and follow-up</h2><p className="page-copy">{draft.disposition}</p></section>
        <SourceReferences source={source} />
      </aside>
    </div>
    </>}
  </main>;
}
