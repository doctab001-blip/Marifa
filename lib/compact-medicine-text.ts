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
  if (/^(?:Paediatric|Allergy|CKD|CLD|Monitor):?\s*$/i.test(s)) return "";
  s = s.replace(/^Paediatric:/, "Children:");
  s = s.replace(/^Children:\s*(?:are dosed at|are given|are dosed|receive|are)\s+/i, "Children: ");
  if (/^Children:\s*(?:[a-z]+\s+){0,4}on (?:a|the) paediatric\b[^.;]*\.?$/i.test(s)) return "";
  if (s && !/[.!?]$/.test(s)) s += ".";
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return s.replace(/:\s+([a-z])/, (_m, c: string) => `: ${c.toUpperCase()}`);
}

const rank = (line: string) => { const i = ORDER_RANK.findIndex((pattern) => pattern.test(line)); return i < 0 ? ORDER_RANK.length : i; };
const ORDER_RANK = [/^CKD:/, /^CLD:/, /^(?:Penicillin allergy|Allergy):/i, /^Children:/];

/** Compacted, de-duplicated lines: kidney, liver, allergy and children first, then the rest in their stored order. */
export function compactMedicineLines(lines: string[]): string[] {
  return [...new Set(lines.map(compactMedicineLine).filter(Boolean))].map((line, i) => ({ line, i })).sort((a, b) => rank(a.line) - rank(b.line) || a.i - b.i).map((x) => x.line);
}

const ORDER: Array<[RegExp, string]> = [[/^CKD:/, "CKD"], [/^CLD:/, "CLD"], [/^(?:Penicillin allergy|Allergy):/i, "Allergy"], [/^Children:/, "Children"]];

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
