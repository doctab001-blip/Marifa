import type { ClinicalAlgorithm } from "@/lib/validations/disease";
import { SourceCitation } from "@/components/source-citation";

type AlgorithmNode = ClinicalAlgorithm["nodes"][number];

const KIND_LABEL: Record<AlgorithmNode["kind"], string> = {
  start: "Start",
  decision: "Decision",
  action: "Action",
  outcome: "Outcome",
};

function NodeCard({ node }: { node: AlgorithmNode }) {
  return (
    <div className={`algorithm-node algorithm-node-${node.kind}`}>
      <span className="algorithm-node-kind">{KIND_LABEL[node.kind]}</span>
      <p className="algorithm-node-text">{node.text}</p>
      {node.detail ? <p className="algorithm-node-detail">{node.detail}</p> : null}
    </div>
  );
}

function Step({ id, nodes, label, seen }: { id: string; nodes: Map<string, AlgorithmNode>; label?: string; seen: Set<string> }) {
  const node = nodes.get(id);
  if (!node || seen.has(id)) return null;
  const visited = new Set(seen).add(id);
  const next = node.next ?? [];
  return (
    <div className="algorithm-step">
      {label ? <span className="algorithm-edge-label">{label}</span> : null}
      <NodeCard node={node} />
      {next.length === 1 ? (
        <>
          <span className="algorithm-arrow" aria-hidden="true" />
          <Step id={next[0].to} nodes={nodes} label={next[0].label} seen={visited} />
        </>
      ) : null}
      {next.length > 1 ? (
        <ul className="algorithm-children" role="list">
          {next.map((edge) => (
            <li key={edge.to} className="algorithm-branch">
              <Step id={edge.to} nodes={nodes} label={edge.label} seen={visited} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Flowchart drawn with CSS only. Straight sequences stack with arrows; only real Yes/No splits indent, so the chart stays inside the page at any width. */
export function ClinicalAlgorithmChart({ algorithm }: { algorithm: ClinicalAlgorithm }) {
  const nodes = new Map(algorithm.nodes.map((node) => [node.id, node]));
  const titleId = `algorithm-${algorithm.id}-title`;
  return (
    <figure className="clinical-algorithm" aria-labelledby={titleId}>
      <figcaption id={titleId} className="clinical-algorithm-title"><span className="disease-kicker">Algorithm</span>{algorithm.title}</figcaption>
      <div className="clinical-algorithm-scroll">
        <div className="algorithm-root" role="group" aria-label={`${algorithm.title}: step-by-step flowchart, read top to bottom`}>
          <Step id={algorithm.nodes[0].id} nodes={nodes} seen={new Set()} />
        </div>
      </div>
      <SourceCitation sources={[{ title: algorithm.source.title, url: algorithm.source.url, edition: algorithm.source.edition, locator: algorithm.source.locator }]} />
    </figure>
  );
}

export function ClinicalAlgorithms({ algorithms, placement }: { algorithms?: ClinicalAlgorithm[]; placement: ClinicalAlgorithm["placement"] }) {
  const list = (algorithms ?? []).filter((algorithm) => algorithm.placement === placement);
  if (!list.length) return null;
  return <div className="clinical-algorithms">{list.map((algorithm) => <ClinicalAlgorithmChart key={algorithm.id} algorithm={algorithm} />)}</div>;
}
