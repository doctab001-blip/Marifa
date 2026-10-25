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

function Branch({ id, nodes, label }: { id: string; nodes: Map<string, AlgorithmNode>; label?: string }) {
  const node = nodes.get(id);
  if (!node) return null;
  const next = node.next ?? [];
  return (
    <li className="algorithm-branch">
      {label ? <span className="algorithm-edge-label">{label}</span> : null}
      <NodeCard node={node} />
      {next.length ? (
        <ul className={`algorithm-children${next.length > 1 ? " is-split" : ""}`} role="list">
          {next.map((edge) => <Branch key={edge.to} id={edge.to} nodes={nodes} label={edge.label} />)}
        </ul>
      ) : null}
    </li>
  );
}

/** Tree flowchart drawn with CSS only; branches sit side by side on wide screens and stack on phones. */
export function ClinicalAlgorithmChart({ algorithm }: { algorithm: ClinicalAlgorithm }) {
  const nodes = new Map(algorithm.nodes.map((node) => [node.id, node]));
  const titleId = `algorithm-${algorithm.id}-title`;
  return (
    <figure className="clinical-algorithm" aria-labelledby={titleId}>
      <figcaption id={titleId} className="clinical-algorithm-title"><span className="disease-kicker">Algorithm</span>{algorithm.title}</figcaption>
      <div className="clinical-algorithm-scroll">
        <ul className="algorithm-root" role="list">
          <Branch id={algorithm.nodes[0].id} nodes={nodes} />
        </ul>
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
