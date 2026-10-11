import type { TeachingView } from "@/lib/teaching";

function GuideBlock({ emoji, title, children, tone = "teal" }: { emoji: string; title: string; children: React.ReactNode; tone?: "teal" | "amber" | "blue" }) {
  return (
    <section className={`teach-block teach-tone-${tone}`}>
      <h2 className="teach-heading"><span aria-hidden="true">{emoji}</span>{title}</h2>
      <div className="teach-callout">{children}</div>
    </section>
  );
}

function DerivedNote({ show }: { show: boolean }) {
  if (!show) return null;
  return <p className="teach-derived">Built automatically from this topic&apos;s clinical sections below. No new clinical claims have been added.</p>;
}

export function TeachingGuide({ view }: { view: TeachingView }) {
  return (
    <div className="teaching-guide">
      <GuideBlock emoji="🎯" title="What you will learn">
        <ol className="teach-objectives">{view.objectives.map((item) => <li key={item}>{item}</li>)}</ol>
        {view.scope ? <p className="teach-scope"><strong>Scope:</strong> {view.scope}</p> : null}
        <DerivedNote show={!view.objectivesAuthored} />
      </GuideBlock>

      {view.vignette ? (
        <GuideBlock emoji="🧑‍⚕️" title="The case" tone="blue">
          <p className="teach-label">{view.vignette.fictitious ? "Fictitious teaching case" : "Teaching case"}</p>
          <p className="teach-vignette">{view.vignette.text}</p>
        </GuideBlock>
      ) : null}

      <GuideBlock emoji="🧭" title="How to approach it">
        <p className="teach-label">Work through these steps in order</p>
        <ol className="teach-steps">
          {view.approach.map((step) => (
            <li key={step.title}>
              <div className="teach-step-title">{step.anchor ? <a href={`#${step.anchor}`}>{step.title}</a> : step.title}</div>
              <p className="teach-step-prompt">{step.prompt}</p>
              <p className="teach-step-guidance">{step.guidance}</p>
            </li>
          ))}
        </ol>
        <DerivedNote show={!view.approachAuthored} />
      </GuideBlock>

      {view.checkpoints.length ? (
        <GuideBlock emoji="❓" title="Check your understanding" tone="blue">
          <p className="teach-label">Think it through, then reveal the answer</p>
          <div className="teach-checkpoints">
            {view.checkpoints.map((item) => (
              <details key={item.question} className="teach-checkpoint">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
          <DerivedNote show={!view.checkpointsAuthored} />
        </GuideBlock>
      ) : null}

      {view.pitfalls.length ? (
        <GuideBlock emoji="⚠️" title="Common pitfalls" tone="amber">
          <ul className="teach-list">{view.pitfalls.map((item) => <li key={item}>{item}</li>)}</ul>
        </GuideBlock>
      ) : null}

      {view.keyPoints.length ? (
        <GuideBlock emoji="📌" title="Key teaching points">
          <ul className="teach-list">{view.keyPoints.map((item) => <li key={item}>{item}</li>)}</ul>
        </GuideBlock>
      ) : null}

      {view.references.length ? (
        <GuideBlock emoji="📚" title="Teaching sources" tone="blue">
          <ul className="teach-list teach-refs">
            {view.references.map((ref) => (
              <li key={`${ref.title}-${ref.edition}`}><a href={ref.url} target="_blank" rel="noreferrer">{ref.title}</a> <span>({ref.edition}{ref.locator ? ` · ${ref.locator}` : ""})</span></li>
            ))}
          </ul>
        </GuideBlock>
      ) : null}
    </div>
  );
}
