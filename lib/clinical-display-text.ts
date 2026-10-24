/** Indian national authorities whose citations appear inline in Marifa India prose. */
const INDIA_AUTHORITY = /^(?:ICMR|MoHFW|NCDC|NCVBDC|NVBDCP|NTEP|NTG|NDP|RNTCP|NACO|FOGSI|IAP|ISPN|DGHS|DHR|NVHCP|NPCDCS|NLEP|STW)$/;
const LOCATOR_WORD = /^(?:section|sections|table|p|pp|slide|rec|and|annexure)$/i;
const ACRONYM = /^[A-Z][A-Z0-9&]+$/;

/**
 * True when a parenthesis or dash tail is only a citation ("ICMR STW", "MoHFW 2011, Section 5.3b, pp. 44–45",
 * "NCVBDC 2023, p. 15"): an Indian authority plus acronyms, years and page/section numbers, and no other words,
 * so a parenthesis that carries clinical meaning ("ICMR prefers ticagrelor") is always kept.
 * A bare acronym after a capitalised name ("National TB Elimination Programme (NTEP)") is a definition, not a citation.
 */
function isIndiaCitation(inner: string, before = ""): boolean {
  const tokens = inner.split(/[\s,;:/()–—-]+/).map((token) => token.replace(/\.$/, "")).filter(Boolean);
  if (!tokens.some((token) => INDIA_AUTHORITY.test(token))) return false;
  if (!tokens.every((token) => INDIA_AUTHORITY.test(token) || /\d/.test(token) || ACRONYM.test(token) || LOCATOR_WORD.test(token))) return false;
  const bareAcronym = tokens.length === 1 && tokens[0] !== "STW";
  return !(bareAcronym && /\b[A-Z][A-Za-z]*\s*$/.test(before));
}

function withoutIndiaCitations(text: string): string {
  return text
    // "(ICMR STW)", "(MoHFW 2019)", "(NCVBDC 2023, p. 15)"
    .replace(/\s*\(([^()]*)\)/g, (match, inner: string, offset: number, whole: string) => isIndiaCitation(inner, whole.slice(0, offset)) ? "" : match)
    // "(use warfarin, ICMR STW)" -> "(use warfarin)"; "(given in the second trimester per ICMR STW)" -> "(given in the second trimester)"
    .replace(/\(([^()]*?)(?:\s*[,;]\s*|\s+per\s+)([^()[,;]*)\)/g, (match, head: string, tail: string) => head.trim() && isIndiaCitation(tail) ? `(${head.trim()})` : match)
    // "Shock (...) — MoHFW 2011, Section 5.3b, pp. 44–45"
    .replace(/\s+[—–]\s+((?:(?!\s[—–]\s).)+)$/, (match, tail: string) => isIndiaCitation(tail) ? "" : match);
}

/**
 * Removes inline source locators from clinical prose without changing stored content.
 * Structured sources remain available in the topic's References section.
 */
export function withoutInlineSourceLocators(text: string): string {
  return withoutIndiaCitations(text)
    .replace(/\s*\[\s*adapted from\s+(?:NICE|SDCPG)\s*\]/gi, "")
    .replace(/\s*\((?=[^)]*(?:NICE|NG\d+|CG\d+|QS\d+|SDCPG|MOH|SHC|PHA|SIGN|AHA|ACC|ESC|ADA|WHO|CDC|BNF|\bSSC\b|\bISPAD\b|\bWSES\b|guideline|recommendation|\brecs?\.?\s*\d|table\s+\d|pp?\.\s*\d))[^)]*\)/gi, "")
    .replace(/\b(?:according to|as recommended by|per)\s+(?:NICE|SDCPG)(?:\s+(?:NG|CG|QS)\d+)?\s*[:,]?\s*/gi, "")
    .replace(/\b(?:NICE\s+)?(?:NG|CG|QS)\d+\s+(?:advises|states|recommends|gives)\s+([a-z])/gi, (_match, first: string) => first.toUpperCase())
    .replace(/\bSDCPG\s+(?:advises|states|recommends|gives)\s+([a-z])/gi, (_match, first: string) => first.toUpperCase())
    .replace(/\bNICE\s+finds?\s+not enough evidence\b/gi, "There is not enough evidence")
    .replace(/\b(?:NICE\s+)?(?:NG|CG|QS)\d+\b(?:\s+(?:recommendations?|tables?|sections?)?\s*[\d.]+(?:[–-][\d.]+)?(?:\s*(?:,|and)\s*(?:recommendations?|tables?|sections?)?\s*[\d.]+(?:[–-][\d.]+)?)*)?(?:\s+terms used)?/gi, "")
    .replace(/\bSDCPG\s+pp?\.\s*\d+(?:[–-]\d+)?/gi, "")
    .replace(/\bSee the BNF for\b/gi, "Check")
    .replace(/\b(?:NICE|SDCPG)(?:\s+(?:NG|CG|QS)\d+)?\s*:\s*/gi, "")
    .replace(/\b(?:NICE|SDCPG)\b/gi, "")
    .replace(/^\s*[:;,–—-]+\s*/, "")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/:\s*\.?$/, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
}
