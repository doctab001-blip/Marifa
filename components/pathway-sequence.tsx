import { ArrowRight, Clock3, GitBranch, ListChecks } from "@/components/icons-3d";
import type { DiseaseDetail } from "@/lib/validations/disease";
import { ClinicalTimeframe } from "@/components/clinical-timeframe";
import { SourceCitation, type CitationSource } from "@/components/source-citation";
import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";

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

      <div className="pathway-sequence-list" role="list">
        {steps.map((step, index) => (
          <div className="pathway-sequence-step" key={step.id} role="listitem">
            <div className="pathway-marker" aria-hidden="true">{index + 1}</div>
            <article className="pathway-step-content">
              <div className="pathway-step-heading">
                <span>Step {index + 1}</span>
                <h3>{withoutInlineSourceLocators(step.title)}</h3>
                <p className="pathway-timeframe"><span className="pill pill-amber pill-sm pill-wrap"><Clock3 size={14} aria-hidden="true" /><span className="sr-only">Timeframe: </span>{withoutInlineSourceLocators(step.timeframe)}</span></p>
              </div>
              <ul className="pathway-actions">
                {step.actions.map((action, actionIndex) => <li key={`${actionIndex}-${action}`}><ClinicalTimeframe text={withoutInlineSourceLocators(action)} /></li>)}
              </ul>
              {step.branches && (
                <div className="pathway-branches" aria-label={`Decision branches for ${step.title}`}>
                  <div className="pathway-branches-label">
                    <GitBranch size={15} strokeWidth={1.5} aria-hidden="true" />
                    Decision branches
                  </div>
                  <div className="pathway-branch-grid">
                    {step.branches.map((branch) => (
                      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_14px] items-start gap-2 rounded-lg border border-edge bg-panel-2 p-3" key={branch.condition}>
                        <strong className="text-sm font-semibold leading-snug text-ink">{withoutInlineSourceLocators(branch.condition)}</strong>
                        <ArrowRight className="mt-0.5 text-aqua-300" size={14} strokeWidth={1.5} aria-hidden="true" />
                        <ul className="col-span-full m-0 list-disc space-y-2 ps-5 text-sm leading-relaxed text-body marker:text-aqua-300">
                          {branch.actions.map((action, actionIndex) => <li key={`${actionIndex}-${action}`}><ClinicalTimeframe text={withoutInlineSourceLocators(action)} /></li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {compact ? null : <SourceCitation sources={sources} />}
                </div>
              )}
            </article>
          </div>
        ))}
      </div>
      {compact ? null : <SourceCitation sources={sources} />}
    </section>
  );
}
