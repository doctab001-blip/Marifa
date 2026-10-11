import type { ClinicalPathwayPayload, ExactDoseSchema, Medicines_Doses } from "@/lib/validations/clinical-pathway";
import type { z } from "zod";
import { SourceCitation } from "@/components/source-citation";
import { ClinicalTimeframe } from "@/components/clinical-timeframe";

function Dose({ dose }: { dose: z.infer<typeof ExactDoseSchema> }) {
  return dose.kind === "exact" ? <>{dose.amount} {dose.unit}; {dose.frequency}; {dose.duration}</> : <>Not indicated: {dose.reason}</>;
}
function Medicines({ medicines }: { medicines: Medicines_Doses[] }) {
  return <ul className="list-disc">
    {medicines.map((medicine) => <li key={medicine.id}>
      <h4>{medicine.medicine}</h4>
      <ul className="list-disc">
        <li><strong>Indication:</strong> {medicine.indication}</li>
        <li><strong>Patient group:</strong> {medicine.patient_group}</li>
        <li><strong>Loading dose:</strong> <Dose dose={medicine.loading_dose} /></li>
        <li><strong>Maintenance dose:</strong> <Dose dose={medicine.maintenance_dose} /></li>
        <li><strong>Route:</strong> {medicine.route}</li>
        <li><strong>Contraindications:</strong><ul>{medicine.contraindications.map((item, i) => <li key={i}>{item}</li>)}</ul></li>
        <li><strong>Adjustments:</strong><ul>{medicine.adjustments.map((item, i) => <li key={i}>{item}</li>)}</ul></li>
        <li><strong>Monitoring:</strong><ul>{medicine.monitoring.map((item, i) => <li key={i}>{item}</li>)}</ul></li>
      </ul>
      <SourceCitation sources={medicine.evidence.sources} selectionRationale={medicine.evidence.selection_rationale} />
    </li>)}
  </ul>;
}
export function Investigations({ phases }: { phases: ClinicalPathwayPayload["Investigations"] }) {
  return <div className="prose prose-slate max-w-none"><ol className="list-decimal">
    {phases.map((phase) => <li key={phase.id}>
      <h3>{phase.title}</h3><strong className="font-semibold text-slate-900">{phase.timeframe}</strong>
      <ol className="list-decimal">{phase.steps.map((step, i) => <li key={i}>
        <strong>{step.test}</strong><ul className="list-disc">
          <li><strong className="font-semibold text-slate-900">{step.timeframe}</strong></li>
          <li>Clinical question: {step.clinical_question}</li>
          <li>Expected finding: {step.expected_finding}</li>
          <li>Decision rationale: {step.decision_rationale}</li>
        </ul>
      </li>)}</ol>
      <SourceCitation sources={phase.evidence.sources} selectionRationale={phase.evidence.selection_rationale} />
    </li>)}
  </ol></div>;
}
export function TreatmentDetails({ plans }: { plans: ClinicalPathwayPayload["Treatment_Plan"] }) {
  return <div className="prose prose-slate max-w-none"><ol className="list-decimal">
    {plans.map((plan) => <li key={plan.id}>
      <h3>{plan.title}</h3><strong className="font-semibold text-slate-900">{plan.timeframe}</strong>
      <ol>{plan.actions.map((action, i) => <li key={i}><strong className="font-semibold text-slate-900">{action.timeframe}</strong>: <ClinicalTimeframe text={action.instruction} /></li>)}</ol>
      <Medicines medicines={plan.Medicines_Doses} />
      <ul>{plan.branches.map((branch) => <li key={branch.id}>
        <h4>{branch.condition}</h4>
        <ol>{branch.actions.map((action, i) => <li key={i}><strong className="font-semibold text-slate-900">{action.timeframe}</strong>: <ClinicalTimeframe text={action.instruction} /></li>)}</ol>
        <Medicines medicines={branch.Medicines_Doses} />
        <SourceCitation sources={branch.evidence.sources} selectionRationale={branch.evidence.selection_rationale} />
      </li>)}</ul>
      <SourceCitation sources={plan.evidence.sources} selectionRationale={plan.evidence.selection_rationale} />
    </li>)}
  </ol></div>;
}
