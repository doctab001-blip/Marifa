/* Compact display of medicine cautions, monitoring and contraindications (owner request, 28 Oct 2026).
 * Strips audit tags and source parentheses, drops adult-only boilerplate and shortens labels so each line
 * carries the clinical fact in as few words as possible. Display only: stored text is unchanged. */

const SOURCE_PAREN = /\s*\((?=[^()]*(?:label|SmPC|monograph|data sheet|datasheet|Section|guideline|guidance|Table|Recommendation|Rec\.|Figure|protocol|pathway|consensus|statement|standard clinical teaching|\bp\.\s*\d|\b(?:19|20)\d\d\b))[^()]*\)/gi;

export function compactMedicineLine(text: string): string {
  let s = text
    .replace(/\s*\[SUPPLEMENTED\s*-\s*EXTERNAL\]/gi, "")
    .replace(SOURCE_PAREN, "")
    .replace(SOURCE_PAREN, "")
    .replace(/^Paediatric:\s*Not applicable:\s*this topic covers adults(?: only)?\s*[;,.]?\s*/i, "Paediatric: ").replace(/^Paediatric:\s*Children (are|receive)\b/i, "Paediatric: $1").replace(/^Paediatric:\s*children\s+/i, "Paediatric: ")
    .replace(/^Paediatric:\s*(?:children (?:are treated|receive [^;.]*?) on (?:a|the) paediatric [^.;]*protocol\.?|Not applicable\.?)\s*$/i, "")
    .replace(/^Penicillin allergy:\s*Not an antibiotic;?.*$/i, "")
    .replace(/\bno allergy concern;?\s*/i, "")
    .replace(/\bstandard clinical teaching\b/gi, "")
    .replace(/\s*;\s*(?=[.;]|$)/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/([.;])\1+/g, "$1")
    .replace(/:\s*[.;]?\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  s = s.replace(/^((?:Paediatric|Children|Allergy|Penicillin allergy|CKD|CLD|Monitor):)\s*(?:\1\s*)+/i, "$1 ");
  if (/^(?:Paediatric|Allergy|CKD|CLD|Monitor):?\s*$/i.test(s)) return "";
  s = s.replace(/^Paediatric:/, "Children:");
  s = s.replace(/^Children:\s*(?:are dosed at|are given|are dosed|receive|are)\s+/i, "Children: ");
  if (/^Children:\s*(?:[a-z]+\s+){0,4}on (?:a|the) paediatric\b[^.;]*\.?$/i.test(s)) return "";
  if (s && !/[.!?]$/.test(s)) s += ".";
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return s.replace(/:\s+([a-z])/, (_m, c: string) => `: ${c.toUpperCase()}`);
}

const rank = (line: string) => { const i = ORDER_RANK.findIndex((pattern) => pattern.test(line)); return i < 0 ? ORDER_RANK.length : i; };
const ORDER_RANK = [/^CKD:/, /^CLD:/, /^(?:If Allergic|Penicillin allergy|Allergy):/i, /^Children:/];

/** Shown label for the allergy lines (owner request, 1 Nov 2026): "If Allergic:" followed by the alternative drug. Stored text keeps its "Allergy:" or "Penicillin allergy:" prefix. */
export const ifAllergicLabel = (line: string) => line.replace(/^(?:Penicillin allergy|Allergy):\s*/i, "If Allergic: ");

/* One line per label (owner request, 2 Nov 2026). A medicine can carry two stored rows (for example an eradication dose and a
 * prophylaxis dose), and a step table merges both rows' cautions, so "CKD:", "CLD:", "Children:" and the allergy line could each
 * appear twice. Lines with the same label are merged: a line already said by another is dropped, the fuller wording is kept, and
 * genuinely different facts are joined into the one line. An unlabelled kidney or liver line is folded into an existing CKD or CLD line. */
const GROUPS: Array<{ label: string; prefix: RegExp; loose?: RegExp }> = [
  { label: "CKD", prefix: /^CKD:\s*/i, loose: /\b(?:kidney|renal|eGFR|creatinine clearance|CrCl|dialysis)\b/i },
  { label: "CLD", prefix: /^CLD:\s*/i, loose: /\b(?:liver|hepatic|Child-Pugh|cirrhosis)\b/i },
  { label: "Allergy", prefix: /^(?:If Allergic|Penicillin allergy|Allergy):\s*/i },
  { label: "Children", prefix: /^Children:\s*/i },
];
const SYNONYM: Array<[RegExp, string]> = [[/\brenal\b/g, "kidney"], [/\bpatients\b/g, "people"], [/\bpaediatric\b/g, "children"], [/\bhepatic\b/g, "liver"]];
const STOP = new Set(["a", "an", "the", "and", "or", "of", "in", "to", "for", "with", "is", "are", "be", "by", "on", "at", "if", "as", "use"]);
const normal = (text: string) => SYNONYM.reduce((t, [p, r]) => t.replace(p, r), text.toLowerCase()).replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const words = (text: string) => new Set(normal(text).split(" ").filter((w) => w && !STOP.has(w)));
/** True when b adds nothing to a: contained in it, or (for a line without numbers) at least 70% of b's words already in a. */
function saidBy(a: string, b: string): boolean {
  if (normal(a).includes(normal(b))) return true;
  const wb = words(b), wa = words(a);
  if (!wb.size) return true;
  const shared = [...wb].filter((w) => wa.has(w)).length;
  // A line with a number (dose, threshold, age or weight band) is dropped only when it is the same fact reworded: either every
  // word of b is in a and a adds no further number (so a does not narrow it to another population, such as "under 40 kg"), or the
  // two lines share at least 85% of all their words. Otherwise both are kept, so no dose is ever lost.
  if (/\d/.test(b)) {
    const extra = [...wa].filter((w) => !wb.has(w));
    const union = new Set([...wa, ...wb]).size;
    return (shared === wb.size && !extra.some((w) => /\d/.test(w))) || shared / union >= 0.85;
  }
  return shared / wb.size >= 0.7;
}
const sentence = (text: string) => { const t = text.trim(); return /[.!?]$/.test(t) ? t : `${t}.`; };
const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function mergeLabelledLines(lines: string[]): string[] {
  const bodies = new Map<number, { prefix: string; parts: string[] }>();
  const out: Array<string | number> = [];
  const add = (g: number, prefix: string, body: string) => {
    let entry = bodies.get(g);
    if (!entry) { entry = { prefix, parts: [] }; bodies.set(g, entry); out.push(g); }
    if (!body.trim()) return;
    for (let i = 0; i < entry.parts.length; i += 1) {
      if (saidBy(entry.parts[i], body)) return;
      if (saidBy(body, entry.parts[i])) { entry.parts[i] = body; entry.parts = entry.parts.filter((p, j) => j === i || !saidBy(body, p)); return; }
    }
    entry.parts.push(body);
  };
  const loose: string[] = [];
  for (const line of lines) {
    const g = GROUPS.findIndex((group) => group.prefix.test(line));
    if (g < 0) { loose.push(line); out.push(line); continue; }
    add(g, line.match(GROUPS[g].prefix)![0].replace(/\s*$/, " "), line.replace(GROUPS[g].prefix, ""));
  }
  // Unlabelled kidney or liver lines join the CKD or CLD line already shown (never both, never when no such line exists).
  for (const line of loose) {
    const hits = GROUPS.map((group, g) => (group.loose?.test(line) && bodies.has(g) ? g : -1)).filter((g) => g >= 0);
    if (hits.length !== 1 || /^[A-Za-z][^:]{0,30}:/.test(line) || /\b(?:label|SmPC|DailyMed|data sheet|monograph|sections?)\b/i.test(line)) continue;
    out.splice(out.indexOf(line), 1);
    add(hits[0], "", line);
  }
  return out.map((item) => {
    if (typeof item === "string") return item;
    const entry = bodies.get(item)!;
    return entry.parts.length ? `${entry.prefix}${entry.parts.map((p) => capital(sentence(p))).join(" ")}` : "";
  }).filter(Boolean);
}

/** Compacted, de-duplicated lines: CKD, CLD, If Allergic and children first, then the rest in their stored order. */
export function compactMedicineLines(lines: string[]): string[] {
  return mergeLabelledLines([...new Set(lines.map(compactMedicineLine).filter(Boolean))]).map((line, i) => ({ line, i })).sort((a, b) => rank(a.line) - rank(b.line) || a.i - b.i).map((x) => x.line);
}

const ORDER: Array<[RegExp, string]> = [[/^CKD:/, "CKD"], [/^CLD:/, "CLD"], [/^(?:If Allergic|Penicillin allergy|Allergy):/i, "If Allergic"], [/^Children:/, "Children"]];

/** Short summary for the closed cautions panel: "CKD · CLD · Children · 2 more". */
export function cautionSummary(cautions: string[], monitoring: string[]): string {
  const labels = ORDER.filter(([pattern]) => cautions.some((line) => pattern.test(line))).map(([, label]) => label);
  const other = cautions.filter((line) => !ORDER.some(([pattern]) => pattern.test(line))).length;
  if (other) labels.push(`${other} more`);
  if (monitoring.length) labels.push(`${monitoring.length} check${monitoring.length > 1 ? "s" : ""}`);
  return labels.join(" · ");
}

/* Contraindications: the same compaction, plus wording that adds no knowledge is cut
 * ("contraindicated in patients with", "known hypersensitivity to the medicine"), and a line already
 * contained in a longer line is dropped. Display only. */
const CONTRA_TRIM: Array<[RegExp, string]> = [
  [/^(?:it is |this medicine is |the medicine is )?contraindicated (?:in|for|with) (?:patients|people|those) (?:with|who have|who are)\s+/i, ""],
  [/^(?:it is |this medicine is )?contraindicated (?:in|for|with)\s+/i, ""],
  [/^do not (?:use|give) (?:in|to|with) (?:patients|people) (?:with|who have)\s+/i, ""],
  [/^do not (?:use|give) (?:in|to|with)\s+/i, ""],
  [/^(?:patients|people) with\s+/i, ""],
  [/\b(?:known |documented )?(?:hypersensitivity|allergy) to (?:the (?:active substance|medicine|drug)|any (?:of the )?(?:excipients|ingredients|components))(?: or (?:to )?any (?:of the )?(?:excipients|ingredients|components))?/i, "Hypersensitivity"],
  [/\bclinically significant\s+/gi, ""],
  [/\bknown\s+(?=hypersensitivity)/gi, ""],
];
export function compactContraLine(text: string): string {
  let s = compactMedicineLine(text);
  for (const [pattern, replacement] of CONTRA_TRIM) s = s.replace(pattern, replacement);
  s = s.replace(/\s{2,}/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
export function compactContraLines(lines: string[]): string[] {
  const all = [...new Set(lines.map(compactContraLine).filter(Boolean))];
  const key = (x: string) => x.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  return all.filter((line, i) => !all.some((other, j) => j !== i && key(other).length > key(line).length && key(other).includes(key(line))));
}
