import type { ClinicalAction } from "@/lib/clinical-guideline-resolution";

export function PharmacotherapyPlan({ steps }: { steps: readonly ClinicalAction[] }) {
  return (
    <section aria-labelledby="pharmacotherapy-plan-title">
      <h2 id="pharmacotherapy-plan-title" className="text-lg font-semibold text-slate-900">Pharmacotherapy plan</h2>
      <ol className="prose prose-slate max-w-none mt-3 list-decimal space-y-4 ps-6">
        {steps.map((step) => (
          <li key={step.id}>
            <span>{step.instruction}</span>
            {step.strictTimeframe && <span className="ms-2 font-semibold text-blue-900 bg-blue-50 px-1 rounded">{step.strictTimeframe}</span>}
            {step.exactDosing && <ul className="list-disc ps-5">
              {(["loadingDose", "maintenanceDose", "route", "duration"] as const).map((field) => {
                const value = step.exactDosing?.[field];
                return value ? <li key={field}><span className="capitalize">{field.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}:</span>{" "}<span className="font-semibold text-blue-900 bg-blue-50 px-1 rounded">{value}</span></li> : null;
              })}
            </ul>}
          </li>
        ))}
      </ol>
    </section>
  );
}
