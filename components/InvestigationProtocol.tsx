import type { ClinicalAction, EvidenceSource } from "@/lib/clinical-guideline-resolution";

export interface InvestigationProtocolProps {
  steps: readonly ClinicalAction[];
  sources?: readonly EvidenceSource[];
}

export function InvestigationProtocol({ steps }: InvestigationProtocolProps) {
  return (
    <section aria-labelledby="investigation-protocol-title">
      <h2 id="investigation-protocol-title" className="text-lg font-semibold text-ink">Investigation protocol</h2>
      <ol className="prose prose-slate max-w-none mt-3 list-decimal space-y-3 ps-6">
        {steps.map((step) => (
          <li key={step.id}>
            <span>{step.instruction}</span>
            {step.strictTimeframe && <span className="ms-2 font-semibold text-aqua-300 bg-aqua-400/15 px-1 rounded">{step.strictTimeframe}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
