/**
 * Keeps flowchart boxes short without dropping any content: a long box text is split into a short headline
 * (kept in "text") and the remainder (moved to "detail", shown under "+ Details"). Nothing is deleted.
 *   1. a long parenthetical, e.g. "Any CT indication? (GCS below 15, vomiting, ...)": the list moves to detail;
 *   2. else the first clause before ";" stays and the later clauses move to detail.
 */
export type AlgoNode = { id: string; kind: string; text: string; detail?: string; next?: { to: string; label?: string }[] };
export type AlgoLike = { id: string; title: string; nodes: AlgoNode[] } & Record<string, unknown>;

export const wordCount = (s?: string) => (s ? s.trim().split(/\s+/).filter(Boolean).length : 0);
const LONG = 16;
const cap = (s: string) => s.replace(/^[\s,;:]+/, "").replace(/^./, (c) => c.toUpperCase());
const dot = (s: string) => (/[.!?)]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);

/** Clauses that must stay visible beside the headline: exclusions, cautions and alternatives. */
export const KEEP_VISIBLE = /unless|avoid|do not|don't|contraindicat|except|\bnot\b|\bno\b|instead|only if|stop |withhold|go straight|transplant|pregnan|allerg/i;

export function tightenNode(node: AlgoNode): AlgoNode {
  if (wordCount(node.text) <= LONG) return node;
  let head = node.text; const moved: string[] = [];
  const paren = /\s*\(([^()]{20,})\)(\?)?/.exec(head);
  if (paren && paren.index > 0 && wordCount(paren[1]) >= 5 && !KEEP_VISIBLE.test(paren[1])) {
    head = (head.slice(0, paren.index) + (paren[2] ?? "") + head.slice(paren.index + paren[0].length)).replace(/\s+([;,.])/g, "$1").trim();
    moved.push(paren[1]);
  }
  if (wordCount(head) > LONG) {
    const parts = head.split(/;\s+/);
    const rest = parts.slice(1).join("; ");
    if (parts.length > 1 && wordCount(parts[0]) >= 5 && !KEEP_VISIBLE.test(rest)) { head = parts[0]; moved.push(rest); }
  }
  if (!moved.length || wordCount(head) < 3) return node;
  const detail = [...moved.map((m) => dot(cap(m))), node.detail].filter(Boolean).join(" ");
  return { ...node, text: head.replace(/[;:,\s]+$/, ""), detail };
}

export function tightenAlgorithm<T extends AlgoLike>(algorithm: T): { algorithm: T; changed: number } {
  let changed = 0;
  const nodes = algorithm.nodes.map((node) => { const next = tightenNode(node); if (next !== node) changed++; return next; });
  return { algorithm: changed ? { ...algorithm, nodes } : algorithm, changed };
}
