import { Clock3, GitBranch, ListChecks } from "@/components/icons-3d";
import type { DiseaseDetail } from "@/lib/validations/disease";
import { ClinicalTimeframe } from "@/components/clinical-timeframe";
import { SourceCitation, type CitationSource } from "@/components/source-citation";
import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";
import { StepMedicationTable } from "@/components/medication-table";
import { parseAbcdeAction } from "@/lib/management-sequence-format";

type Branch = NonNullable<DiseaseDetail["clinicalManagement"][number]["branches"]>[number];

/**
 * Splits a stored branch condition into the keyword shown on the tag ("If" / "Otherwise")
 * and the condition text, so "If unstable" never renders as "IF If unstable".
 * Display only: the stored condition is unchanged.
 */
export function branchCondition(condition: string): { keyword: "If" | "Otherwise"; text: string } {
  const clean = withoutInlineSourceLocators(condition);
  const otherwise = clean.match(/^(?:otherwise|else|all others?|everyone else)\b[\s,:;–—-]*(?:if\s+)?(.*)$/i);
  if (otherwise) return { keyword: "Otherwise", text: capitalise(otherwise[1]) };
  const lead = clean.match(/^if\s+(.+)$/i);
  return { keyword: "If", text: capitalise(lead ? lead[1] : clean) };
}

function capitalise(text: string) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function BranchActions({ actions }: { actions: string[] }) {
  // Nearly every branch carries one action: render it as a sentence, not a lone bullet.
  if (actions.length === 1) return <p className="pathway-branch-action"><ClinicalTimeframe text={actions[0]} /></p>;
  return (
    <ul className="pathway-branch-actions">
      {actions.map((action, actionIndex) => <li key={`${actionIndex}-${action}`}><ClinicalTimeframe text={action} /></li>)}
    </ul>
  );
}

/**
 * Renders a step's branches as one if/then decision table.
 * The schema does not record whether branches are exclusive, cumulative or sequential, so the table
 * never tells the reader to "apply every branch" or "choose one": the clinical text carries that meaning.
 * An "Otherwise" branch is a fall-through, so it is always shown last (display order only).
 */
function DecisionBranches({ stepTitle, branches }: { stepTitle: string; branches: Branch[] }) {
  const single = branches.length === 1;
  const rows = branches
    .map((branch, sourceIndex) => ({ branch, sourceIndex, ...branchCondition(branch.condition) }))
    .sort((a, b) => Number(a.keyword === "Otherwise") - Number(b.keyword === "Otherwise") || a.sourceIndex - b.sourceIndex);
  return (
    <div className={`pathway-branches${single ? " is-single" : ""}`} role="group" aria-label={`${single ? "Conditional action" : "Decision branches"} for ${stepTitle}`}>
      <div className="pathway-branches-label">
        <GitBranch size={15} strokeWidth={1.5} aria-hidden="true" />
        <span>{single ? "Conditional action" : "Decision branches"}</span>
        {single ? null : <span className="pathway-branches-count" aria-label={`${branches.length} branches`}>{branches.length}</span>}
      </div>
      <div className="pathway-branch-table">
        {single ? null : (
          <div className="pathway-branch-head" aria-hidden="true">
            <span>If</span>
            <span>Then</span>
          </div>
        )}
        <ol className="pathway-branch-list">
          {rows.map(({ branch, sourceIndex, keyword, text }, rowIndex) => {
            const isElse = keyword === "Otherwise";
            return (
              <li className={`pathway-branch${isElse ? " is-else" : ""}`} key={`${sourceIndex}-${branch.condition}`}>
                <div className="pathway-branch-if">
                  {single ? null : <span className="pathway-branch-key" aria-hidden="true">{String.fromCharCode(65 + rowIndex)}</span>}
                  {isElse
                    ? <span className="pathway-branch-tag is-else">Otherwise</span>
                    : <span className="pathway-branch-tag is-if">If</span>}
                  <strong className={text ? undefined : "is-muted"}>{text || "None of the above applies"}</strong>
                </div>
                <div className="pathway-branch-then">
                  <span className="pathway-branch-tag is-then" aria-hidden="true">Then</span>
                  <span className="sr-only">then </span>
                  <BranchActions actions={branch.actions} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

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
                {step.actions.map((action, actionIndex) => {
                  const abcde = parseAbcdeAction(action);
                  if (abcde) {
                    return (
                      <li className="abcde-row" key={`${actionIndex}-${action}`}>
                        <span className="abcde-letter" aria-hidden="true">{abcde.letter}</span>
                        <span><strong className="abcde-label">{abcde.label}:</strong> <ClinicalTimeframe text={abcde.text} /></span>
                      </li>
                    );
                  }
                  const isAbcdeStep = /ABCDE/.test(step.title);
                  return <li className={isAbcdeStep ? "abcde-note" : undefined} key={`${actionIndex}-${action}`}><ClinicalTimeframe text={action} /></li>;
                })}
              </ul>
              <StepMedicationTable step={step} />
              {step.branches?.length ? <DecisionBranches stepTitle={withoutInlineSourceLocators(step.title)} branches={step.branches} /> : null}
            </article>
          </div>
        ))}
      </div>
      {compact ? null : <SourceCitation sources={sources} />}
    </section>
  );
}
