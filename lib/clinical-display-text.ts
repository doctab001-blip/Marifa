/**
 * Removes inline source locators from clinical prose without changing stored content.
 * Structured sources remain available in the topic's References section.
 */
export function withoutInlineSourceLocators(text: string): string {
  return text
    .replace(/\s*\((?=[^)]*(?:NICE|NG\d+|CG\d+|QS\d+|SDCPG|MOH|SHC|PHA|SIGN|AHA|ACC|ESC|ADA|WHO|CDC|BNF|guideline|recommendation|table\s+\d|pp?\.\s*\d))[^)]*\)/gi, "")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}
