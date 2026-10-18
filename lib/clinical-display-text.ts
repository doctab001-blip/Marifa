/**
 * Removes inline source locators from clinical prose without changing stored content.
 * Structured sources remain available in the topic's References section.
 */
export function withoutInlineSourceLocators(text: string): string {
  return text
    .replace(/\s*\[\s*adapted from\s+(?:NICE|SDCPG)\s*\]/gi, "")
    .replace(/\s*\((?=[^)]*(?:NICE|NG\d+|CG\d+|QS\d+|SDCPG|MOH|SHC|PHA|SIGN|AHA|ACC|ESC|ADA|WHO|CDC|BNF|guideline|recommendation|table\s+\d|pp?\.\s*\d))[^)]*\)/gi, "")
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
