import type { ClinicalPathwayPayload, ExactDoseSchema, Medicines_Doses } from "@/lib/validations/clinical-pathway";
import type { z } from "zod";
import { SourceCitation } from "@/components/source-citation";
import { ClinicalTimeframe } from "@/components/clinical-timeframe";
import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";

function Dose({ dose }: { dose: z.infer<typeof ExactDoseSchema> }) {
  return dose.kind === "exact" ? <>{dose.amount} {dose.unit}; {withoutInlineSourceLocators(dose.frequency)}; {withoutInlineSourceLocators(dose.duration)}</> : <>Not indicated: {withoutInlineSourceLocators(dose.reason)}</>;
}
function Medicines({ medicines, showSources }: { medicines: Medicines_Doses[]; showSources: boolean }) {
  return <ul className="list-disc">
    {medicines.map((medicine) => <li key={medicine.id}>
      <h4>{withoutInlineSourceLocators(medicine.medicine)}</h4>
      <ul className="list-disc">
        <li><strong>Indication:</strong> {withoutInlineSourceLocators(medicine.indication)}</li>
        <li><strong>Patient group:</strong> {withoutInlineSourceLocators(medicine.patient_group)}</li>
        <li><strong>Loading dose:</strong> <Dose dose={medicine.loading_dose} /></li>
        <li><strong>Maintenance dose:</strong> <Dose dose={medicine.maintenance_dose} /></li>
        <li><strong>Route:</strong> {withoutInlineSourceLocators(medicine.route)}</li>
        <li><strong>Contraindications:</strong><ul>{medicine.contraindications.map((item, i) => <li key={i}>{withoutInlineSourceLocators(item)}</li>)}</ul></li>
        <li><strong>Adjustments:</strong><ul>{medicine.adjustments.map((item, i) => <li key={i}>{withoutInlineSourceLocators(item)}</li>)}</ul></li>
        <li><strong>Monitoring:</strong><ul>{medicine.monitoring.map((item, i) => <li key={i}>{withoutInlineSourceLocators(item)}</li>)}</ul></li>
      </ul>
      {showSources ? <SourceCitation sources={medicine.evidence.sources} selectionRationale={medicine.evidence.selection_rationale} /> : null}
    </li>)}
  </ul>;
}
export function Investigations({ phases, showSources = true }: { phases: ClinicalPathwayPayload["Investigations"]; showSources?: boolean }) {
  return <div className="prose prose-slate max-w-none"><ol className="list-decimal">
    {phases.map((phase) => <li key={phase.id}>
      <h3>{withoutInlineSourceLocators(phase.title)}</h3><strong className="font-semibold text-ink">{withoutInlineSourceLocators(phase.timeframe)}</strong>
      <ol className="list-decimal">{phase.steps.map((step, i) => <li key={i}>
        <strong>{withoutInlineSourceLocators(step.test)}</strong><ul className="list-disc">
          <li><strong className="font-semibold text-ink">{withoutInlineSourceLocators(step.timeframe)}</strong></li>
          <li>Clinical question: {withoutInlineSourceLocators(step.clinical_question)}</li>
          <li>Expected finding: {withoutInlineSourceLocators(step.expected_finding)}</li>
          <li>Decision rationale: {withoutInlineSourceLocators(step.decision_rationale)}</li>
        </ul>
      </li>)}</ol>
      {showSources ? <SourceCitation sources={phase.evidence.sources} selectionRationale={phase.evidence.selection_rationale} /> : null}
    </li>)}
  </ol></div>;
}
export function TreatmentDetails({ plans, showSources = true }: { plans: ClinicalPathwayPayload["Treatment_Plan"]; showSources?: boolean }) {
  return <div className="prose prose-slate max-w-none"><ol className="list-decimal">
    {plans.map((plan) => <li key={plan.id}>
      <h3>{withoutInlineSourceLocators(plan.title)}</h3><strong className="font-semibold text-ink">{withoutInlineSourceLocators(plan.timeframe)}</strong>
      <ol>{plan.actions.map((action, i) => <li key={i}><strong className="font-semibold text-ink">{withoutInlineSourceLocators(action.timeframe)}</strong>: <ClinicalTimeframe text={withoutInlineSourceLocators(action.instruction)} /></li>)}</ol>
      <Medicines medicines={plan.Medicines_Doses} showSources={showSources} />
      <ul>{plan.branches.map((branch) => <li key={branch.id}>
        <h4>{withoutInlineSourceLocators(branch.condition)}</h4>
        <ol>{branch.actions.map((action, i) => <li key={i}><strong className="font-semibold text-ink">{withoutInlineSourceLocators(action.timeframe)}</strong>: <ClinicalTimeframe text={withoutInlineSourceLocators(action.instruction)} /></li>)}</ol>
        <Medicines medicines={branch.Medicines_Doses} showSources={showSources} />
        {showSources ? <SourceCitation sources={branch.evidence.sources} selectionRationale={branch.evidence.selection_rationale} /> : null}
      </li>)}</ul>
      {showSources ? <SourceCitation sources={plan.evidence.sources} selectionRationale={plan.evidence.selection_rationale} /> : null}
    </li>)}
  </ol></div>;
}
