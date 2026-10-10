import { ArrowRight, GitBranch, ListChecks } from "lucide-react";
import type { ClinicalPathway } from "@/data/mockDiseases";

export function PathwaySequence({ pathway }: { pathway: ClinicalPathway }) {
  return (
    <section className="pathway-sequence" aria-labelledby="pathway-sequence-title">
      <header className="pathway-sequence-header">
        <div>
          <p className="disease-kicker">Clinical pathway</p>
          <h2 id="pathway-sequence-title">{pathway.title}</h2>
          <p>{pathway.description}</p>
        </div>
        <div className="pathway-sequence-icon" aria-hidden="true">
          <ListChecks size={22} strokeWidth={1.5} />
        </div>
      </header>

      <ol className="pathway-sequence-list">
        {pathway.steps.map((step, index) => (
          <li className="pathway-sequence-step" key={step.id}>
            <div className="pathway-marker" aria-hidden="true">{index + 1}</div>
            <article className="pathway-step-content">
              <div className="pathway-step-heading">
                <span>Step {index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.subtitle}</p>
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
                        <p>{branch.outcome}</p>
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
