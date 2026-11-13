import { wordCount, KEEP_VISIBLE, type AlgoLike } from "@/lib/algorithm-tighten";

export type AlgoIssue = { severity: "fix" | "review"; code: string; node?: string; message: string };

const DRUG = /\b(metoprolol|beta-?blocker|aspirin|clopidogrel|ticagrelor|prasugrel|heparin|enoxaparin|fondaparinux|nitrate|nitroglycerin|statin|ACE inhibitor|tenecteplase|alteplase|morphine|amiodarone|adenosine|verapamil|diltiazem|digoxin|magnesium|insulin|potassium|furosemide|adrenaline|epinephrine|atropine|labetalol|hydralazine|carvedilol|propranolol|warfarin|apixaban|rivaroxaban)\b/i;

/** Checks one flowchart. "fix" issues are repaired by tightenAlgorithm; "review" issues need a clinician or author. */
export function auditAlgorithm(a: AlgoLike): AlgoIssue[] {
  const issues: AlgoIssue[] = [];
  const add = (severity: AlgoIssue["severity"], code: string, message: string, node?: string) => issues.push({ severity, code, node, message });
  const first = a.nodes[0];
  if (!first || first.kind !== "start") add("review", "no-start", "First node is not a start node.");
  const parents = new Map<string, number>();
  for (const n of a.nodes) for (const e of n.next ?? []) parents.set(e.to, (parents.get(e.to) ?? 0) + 1);
  for (const n of a.nodes) {
    const next = n.next ?? [], words = wordCount(n.text);
    if (words > 16) add("fix", "long-text", `${words} words in the box; headline should be 16 or fewer.`, n.id);
    if (wordCount(n.detail) > 40) add("review", "long-detail", `${wordCount(n.detail)} words in the detail line.`, n.id);
    if (n.kind === "decision") {
      const labels = next.map((e) => (e.label ?? "").trim().toLowerCase());
      if (next.length < 2) add("review", "decision-branches", `Decision has ${next.length} branch(es); needs at least 2.`, n.id);
      else if (labels.some((l) => !l) || new Set(labels).size !== labels.length) add("review", "decision-labels", "Decision branches are unlabelled or share a label.", n.id);
      else if (next.length === 2 && !(labels.some((l) => l.startsWith("yes")) && labels.some((l) => l.startsWith("no")))) add("review", "decision-not-yes-no", `Two branches but not Yes/No (${labels.join(" | ")}); check they are exhaustive.`, n.id);
      else if (next.length > 2) add("review", "decision-multiway", `${next.length}-way decision (${labels.join(" | ")}); check the branches are mutually exclusive and exhaustive.`, n.id);
    } else if (next.length > 1) add("review", "branch-without-decision", `${n.kind} node splits into ${next.length}; use a decision node.`, n.id);
    if (!next.length && n.kind !== "outcome") add("review", "dead-end", `${n.kind} node has no next step and is not an outcome.`, n.id);
    if (n.kind === "outcome" && next.length) add("review", "outcome-continues", "Outcome node has onward steps.", n.id);
    if (n.id !== first?.id && parents.get(n.id) !== 1) add("review", "parents", `Node has ${parents.get(n.id) ?? 0} parents; each node needs exactly one.`, n.id);
    const all = `${n.text} ${n.detail ?? ""}`;
    if (DRUG.test(all) && !KEEP_VISIBLE.test(all) && !/\bsee\b|medicines table/i.test(all)) add("review", "drug-without-caveat", `Names a medicine with no exclusion or caution: "${n.text.slice(0, 70)}".`, n.id);
  }
  return issues;
}
