/**
 * Removes inline source locators from clinical prose without changing stored content.
 * Structured sources remain available in the topic's References section.
 */
export function withoutInlineSourceLocators(text: string): string {
  return text
    .replace(/\s*\((?=[^)]*(?:NICE|NG\d+|CG\d+|QS\d+|SDCPG|MOH|SHC|PHA|SIGN|AHA|ACC|ESC|ADA|WHO|CDC|BNF|guideline|recommendation|table\s+\d|pp?\.\s*\d))[^)]*\)/gi, "")
    .replace(/\b(?:NICE\s+)?(?:NG|CG|QS)\d+\s+(?:advises|states|recommends|gives)\s+([a-z])/gi, (_match, first: string) => first.toUpperCase())
    .replace(/\bSDCPG\s+(?:advises|states|recommends|gives)\s+([a-z])/gi, (_match, first: string) => first.toUpperCase())
    .replace(/\b(?:NICE\s+)?(?:NG|CG|QS)\d+\b(?:\s+(?:recommendations?|tables?|sections?)?\s*[\d.]+(?:[–-][\d.]+)?(?:\s*(?:,|and)\s*(?:recommendations?|tables?|sections?)?\s*[\d.]+(?:[–-][\d.]+)?)*)?(?:\s+terms used)?/gi, "")
    .replace(/\bSDCPG\s+pp?\.\s*\d+(?:[–-]\d+)?/gi, "")
    .replace(/\bSee the BNF for\b/gi, "Check")
    .replace(/\b(?:NICE|SDCPG)\b/gi, "")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/:\s*\.?$/, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
}
