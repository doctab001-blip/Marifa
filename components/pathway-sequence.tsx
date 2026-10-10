import { ArrowRight, GitBranch, ListChecks } from "lucide-react";
import type { DiseaseDetail } from "@/lib/validations/disease";

export function PathwaySequence({ steps }: { steps: DiseaseDetail["clinicalManagement"] }) {
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
                <p>{step.timeframe}</p>
              </div>
              <ul className="pathway-actions">
                {step.actions.map((action) => <li key={action}>{action}</li>)}
              </ul>
              {step.branches && (
                <div className="pathway-branches" aria-label={`Decision branches for ${step.title}`}>
                  <div className="pathway-branches-label">
                    <GitBranch size={15} strokeWidth={1.5} aria-hidden="true" />
                    Decision branches
                  </div>
                  <div className="pathway-branch-grid">
                    {step.branches.map((branch) => (
                      <div className="pathway-branch" key={branch.condition}>
                        <strong>{branch.condition}</strong>
                        <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
                        <ul>{branch.actions.map((action) => <li key={action}>{action}</li>)}</ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
