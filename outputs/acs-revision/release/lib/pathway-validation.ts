import type { DiseaseTopic } from "@/lib/types";

export function validatePathway(pathway: DiseaseTopic["pathway"]) {
  const errors: string[] = [];
  const nodeIds = new Set(pathway.nodes.map((node) => node.id));
  if (nodeIds.size !== pathway.nodes.length) errors.push("Duplicate node identifier");
  const starts = pathway.nodes.filter((node) => node.type === "start");
  if (starts.length !== 1) errors.push("Pathway must have exactly one start node");
  for (const node of pathway.nodes) {
    if (node.referenceIds.length === 0) errors.push(`Node ${node.id} has no source reference`);
  }
  for (const transition of pathway.transitions) {
    if (!nodeIds.has(transition.from) || !nodeIds.has(transition.to)) errors.push(`Invalid transition ${transition.from} -> ${transition.to}`);
  }
  if (starts.length === 1) {
    const visited = new Set<string>();
    const active = new Set<string>();
    const visit = (id: string) => {
      if (active.has(id)) { errors.push(`Cycle detected at ${id}`); return; }
      if (visited.has(id)) return;
      visited.add(id); active.add(id);
      pathway.transitions.filter((edge) => edge.from === id).forEach((edge) => visit(edge.to));
      active.delete(id);
    };
    visit(starts[0].id);
    pathway.nodes.forEach((node) => { if (!visited.has(node.id)) errors.push(`Unreachable node ${node.id}`); });
  }
  return { valid: errors.length === 0, errors };
}
