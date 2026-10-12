import { ArrowRight, GitBranch } from "lucide-react";
import type { DiseaseTopic } from "@/lib/types";

export function PathwayRenderer({ pathway }: { pathway: DiseaseTopic["pathway"] }) {
  return (
    <section className="card pathway" id="quick-pathway">
      <div className="section-head"><div><div className="eyebrow">Quick pathway</div><h2 style={{ marginTop: 5 }}>{pathway.title}</h2></div><GitBranch size={20} style={{ color: "var(--royal)" }} /></div>
      <div className="pathway-list">
        {pathway.nodes.map((node, index) => {
          const outgoing = pathway.transitions.filter((edge) => edge.from === node.id);
          return <div className="pathway-step" key={node.id}><div className="step-num">{index + 1}</div><div className={`step-box ${node.emphasis ?? ""}`}><strong>{node.title}</strong><p>{node.detail}</p>{outgoing.length > 1 && <div>{outgoing.map((edge) => <span className="branch-label" key={`${edge.from}-${edge.to}`}>{edge.label ?? "Next"} <ArrowRight size={10} style={{ display: "inline" }} /></span>)}</div>}</div></div>;
        })}
      </div>
    </section>
  );
}
