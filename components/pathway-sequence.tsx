import { ArrowRight, GitBranch, ListChecks } from "lucide-react";
import type { DiseaseDetail } from "@/lib/validations/disease";
import { ClinicalTimeframe } from "@/components/clinical-timeframe";
import { SourceCitation, type CitationSource } from "@/components/source-citation";

export function PathwaySequence({ steps, sources = [], compact = false }: { steps: DiseaseDetail["clinicalManagement"]; sources?: CitationSource[]; compact?: boolean }) {
  return (
    <section className="pathway-sequence" aria-labelledby="pathway-sequence-title">
      <header className="pathway-sequence-header">
        <div>
          <p className="disease-kicker">Clinical pathway</p>
          <h2 id="pathway-sequence-title">Management sequence</h2>
          <p>Follow the governed sequence, timeframe and documented decision branches.</p>
        </div>
        <div className="pathway-sequence-icon" aria-hidden="true">
          <ListChecks size={22} strokeWidth={1.5} />
        </div>
      </header>

      <ol className="pathway-sequence-list">
        {steps.map((step, index) => (
          <li className="pathway-sequence-step" key={step.id}>
            <div className="pathway-marker" aria-hidden="true">{index + 1}</div>
            <article className="pathway-step-content">
              <div className="pathway-step-heading">
                <span>Step {index + 1}</span>
                <h3>{step.title}</h3>
                <p className="font-semibold text-slate-900"><ClinicalTimeframe text={step.timeframe} /></p>
              </div>
              <ol className="m-0 list-decimal space-y-2 py-4 pe-4 ps-9 text-sm leading-relaxed text-slate-700 marker:font-semibold marker:text-blue-700 sm:pe-5 sm:ps-10">
                {step.actions.map((action, actionIndex) => <li key={`${actionIndex}-${action}`}><ClinicalTimeframe text={action} /></li>)}
              </ol>
              {step.branches && (
                <div className="pathway-branches" aria-label={`Decision branches for ${step.title}`}>
                  <div className="pathway-branches-label">
                    <GitBranch size={15} strokeWidth={1.5} aria-hidden="true" />
                    Decision branches
                  </div>
                  <div className="pathway-branch-grid">
                    {step.branches.map((branch) => (
                      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_14px] items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3" key={branch.condition}>
                        <strong className="text-sm font-semibold leading-snug text-slate-900">{branch.condition}</strong>
                        <ArrowRight className="mt-0.5 text-blue-700" size={14} strokeWidth={1.5} aria-hidden="true" />
                        <ul className="col-span-full m-0 list-disc space-y-2 ps-5 text-sm leading-relaxed text-slate-700 marker:text-blue-700">
                          {branch.actions.map((action, actionIndex) => <li key={`${actionIndex}-${action}`}><ClinicalTimeframe text={action} /></li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {compact ? null : <SourceCitation sources={sources} />}
                </div>
              )}
            </article>
          </li>
        ))}
      </ol>
      <SourceCitation sources={sources} />
    </section>
  );
}
