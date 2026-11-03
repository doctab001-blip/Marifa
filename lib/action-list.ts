import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";

/**
 * Display-only bullet lists for management text. Stored text is never edited.
 *
 * Two ways a long line becomes a short lead-in plus bullets:
 *  1. Explicit (used by new content): "Lead-in:\n- first item\n- second item".
 *  2. Automatic, for existing topics, and deliberately conservative: a wrong split of clinical text is worse than a long line.
 *     A line is split only when ALL of these hold:
 *       - it has no medication badge and no semicolon outside parentheses (those are clause-style sentences, not lists);
 *       - the list ENDS the sentence (nothing follows the last item) and starts after a colon, or after
 *         "review/check/screen/test/look for", "including", "such as" (then it needs 5 or more items);
 *       - every item is a short noun phrase: no item starts with a verb or a linking word ("give", "check", "then", "which"...);
 *       - commas inside parentheses never split ("(complete right or left bundle branch block, or any degree of heart block)");
 *       - a piece that starts with a linking word ("during", "after", "with"...) continues the item before it
 *         ("no memory of the event before, during or after it" stays one bullet);
 *       - the text after the lead-in has no second sentence, no second colon and no dash clause, and no item contains a verb
 *         that would make it a statement about the whole list ("are contraindicated", "should", "must").
 *     The final "and" splits only when it is the single "and" of the last piece and there is no "or" there; otherwise the last two
 *     items stay together in one bullet.
 */
export type ActionList = { lead: string; items: string[] };

const NOT_A_NOUN_PHRASE = /^(?:then|which|that|but|if|so|because|while|when|where|after|before|until|unless|otherwise|however|also|never|do not|don't|avoid|give|start|stop|use|check|offer|refer|arrange|consider|ask|record|measure|take|treat|repeat|review|document|advise|seek|drink|monitor|stop|switch|add|increase|reduce|continue|discuss|explain|reassess|obtain|send|request|perform)\b/i;
/** An action verb anywhere in an item means the "list" is a run of instructions, not of findings or tests. */
const INSTRUCTION_VERB = /\b(?:look|send|shield|irrigate|refer|call|give|take|keep|apply|stop|start|treat|repeat|check|offer|advise|obtain|perform|request|arrange|consider|ask|record|measure|document|review|monitor|seek|switch|add|increase|reduce|continue|discuss|explain|reassess|observe|admit|discharge|remove|insert|inject|infuse|start|use)\b/i;
const CONTINUES_PREVIOUS = /^(?:during|after|before|or|and|but|with|without|in|on|at|of|to|from|by|for|than|then|while|plus|except|unless|until|including|especially|particularly)\b/i;
const STATEMENT_VERB = /\b(?:is|are|was|were|should|must|may|can|will|do not|does not|did not|never|only|always)\b|\s[—–]\s|—/i;
const LEAD_IN = /\b(?:(?:review|check|screen|test|look|monitor|assess|exclude)(?: it| them| for)? for|including|such as|includes?)\s+/gi;

/** Positions of top-level (outside parentheses/brackets) separators. */
function topLevel(text: string, ch: string): number[] {
  const out: number[] = [];
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === "(" || c === "[") depth += 1;
    else if ((c === ")" || c === "]") && depth > 0) depth -= 1;
    else if (depth === 0 && c === ch) out.push(i);
  }
  return out;
}

function cutAt(text: string, positions: number[]): string[] {
  const parts: string[] = [];
  let from = 0;
  for (const p of positions) { parts.push(text.slice(from, p)); from = p + 1; }
  parts.push(text.slice(from));
  return parts.map((part) => part.trim());
}

function parseItems(remainder: string): string[] | null {
  const body = remainder.trim().replace(/[.\s]+$/, "");
  if (!body) return null;
  if (/[.!?]\s+[A-Z]/.test(body) || /:\s/.test(body) || STATEMENT_VERB.test(body)) return null;
  const pieces = cutAt(body, topLevel(body, ","));
  if (pieces.length < 2) return null;
  // A piece that starts with a linking word belongs to the item before it.
  const merged: string[] = [];
  pieces.forEach((piece, index) => {
    const isLast = index === pieces.length - 1;
    const joinsPrevious = merged.length > 0 && CONTINUES_PREVIOUS.test(piece) && !(isLast && /^(?:and|or)\s+/i.test(piece));
    if (joinsPrevious) merged[merged.length - 1] = `${merged[merged.length - 1]}, ${piece}`;
    else merged.push(piece);
  });
  if (merged.length < 2) return null;
  const last = merged[merged.length - 1].replace(/^(?:and|or)\s+/i, "");
  const afterAnd = last.split(/\s+and\s+/i);
  const hasOr = /\sor\s/i.test(last);
  let items = merged.slice(0, -1);
  if (/^(?:and|or)\s+/i.test(merged[merged.length - 1])) items = [...items, last];
  else if (afterAnd.length === 2 && !hasOr && topLevel(last, ";").length === 0) items = [...items, ...afterAnd.map((part) => part.trim())];
  else items = [...items, last];
  if (items.some((item) => !item || item.length > 140 || item.split(/\s+/).length > 20)) return null;
  if (items.some((item) => NOT_A_NOUN_PHRASE.test(item) || INSTRUCTION_VERB.test(item) || item.endsWith(":"))) return null;
  return items;
}

export function splitActionList(raw: string): ActionList | null {
  if (!raw) return null;

  if (raw.includes("\n- ")) {
    const [lead, ...rest] = raw.split("\n- ");
    const items = rest.map((line) => line.trim()).filter(Boolean);
    return items.length ? { lead: lead.trim(), items } : null;
  }

  if (raw.includes("[💊")) return null;
  const text = withoutInlineSourceLocators(raw).trim();
  if (text.length < 110) return null;
  if (topLevel(text, ";").length > 0) return null;

  // 1) A colon, then at least 3 items.
  const colons = topLevel(text, ":").filter((at) => /[A-Za-z)]/.test(text[at - 1] ?? "") && /\s/.test(text[at + 1] ?? ""));
  if (colons.length) {
    const at = colons[0];
    const items = parseItems(text.slice(at + 1));
    if (items && items.length >= 3) return { lead: text.slice(0, at + 1), items };
  }

  // 2) A lead-in phrase, then at least 5 items. The leftmost phrase whose remainder is a clean list wins.
  LEAD_IN.lastIndex = 0;
  for (const match of text.matchAll(LEAD_IN)) {
    const end = (match.index ?? 0) + match[0].length;
    const items = parseItems(text.slice(end));
    if (items && items.length >= 5) return { lead: `${text.slice(0, end).trim()}:`, items };
  }
  return null;
}
