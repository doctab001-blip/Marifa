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
  return withoutDeferrals(withoutIndiaCitations(text))
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

/* ── Deferral wording is never published (platform owner rule, 27 Oct 2026) ─────────────────────────────
 * Lines that say a national source is silent, or send the reader to a label, formulary, pharmacist or local
 * protocol, are not shown. Where a national protocol is silent the topic uses international guideline data
 * instead (see lib/medicine-renal-hepatic.ts and lib/medicine-allergy.ts). Display only: stored text is unchanged.
 */
const TARGET = String.raw`(?:the |your |a |an )?(?:(?:current |relevant |manufacturer'?s? )?(?:product label(?:ling|ing)?|label(?: sections?)?|(?:product )?SmPC|summary of product characteristics|package insert|product information|prescribing information)|BNF|(?:the )?(?:Saudi Food and Drug Authority (?:\(SFDA\) )?|SFDA )(?:register|registration)|the register|(?:[\w-]+-specific\s+|neonatal\s+|paediatric\s+|maternity\s+)?(?:(?:local|hospital|unit|trust|institutional|current|Saudi hospital|ICU|intensive care unit(?: \(ICU\))?)\s+)+(?:[\w/-]+\s+){0,2}(?:protocols?|policy|policies|guidelines?|formulary|practice|pharmacy|antibiogram|availability)|(?:approved )?product monograph|formulary|pharmacist|pharmacy)`;
/** Clauses that only say a source is silent or unverified: dropped whole. */
const SILENT_CLAUSE = new RegExp(String.raw`\b(?:the )?(?:MOH|SDCPG|national|ICMR|MoHFW|STW|NTG|sources?|protocols?|guidelines?|documents?|summary|review|label|text|section|paper|article|chapter|page(?: opened)?)(?: protocol| guideline)? (?:gives?|states?|provides?|lists?) no\b|\b(?:MOH|SDCPG|national|ICMR|MoHFW|STW|NTG|sources?|protocols?|guidelines?|documents?|summary|label|page)(?: protocol| guideline)?(?: opened| cited)? (?:does not|do not|did not) (?:give|state|specify|address|provide|cover|list)|\b(?:is|are|was|were) (?:not|never) (?:given|stated|specified|addressed|provided|listed|verified|reproduced) (?:in|by) (?:the |this )?(?:[\w-]+ ){0,3}(?:sources?|tables?|texts?|booklets?|documents?|summary|workflow|module|checklist|framework|extract(?: opened)?|part read|manual|insert|guidance|guide|it|STW|STG|SIGN|NTG|NVHCP|SMFM|ICMR|SUA(?: \d{4})?|NLEM|JBDS|KDIGO|IDSA|RCOG|sections? [\d.]+|label(?: sections?)?(?: read)?|NG\d+|CG\d+|MOH|protocols?|guidelines?|SDCPG|page|national|ICMR|STW|task)|\bnot (?:given|stated|specified|verified|reproduced) in (?:the |this )?(?:[\w-]+ ){0,3}(?:sources?|tables?|texts?|booklets?|documents?|summary|workflow|module|checklist|framework|extract(?: opened)?|part read|manual|insert|guidance|guide|it|STW|STG|SIGN|NTG|NVHCP|SMFM|ICMR|SUA(?: \d{4})?|NLEM|JBDS|KDIGO|IDSA|RCOG|sections? [\d.]+|label(?: sections?)?|NG\d+|CG\d+|protocols?|guidelines?|page|task)|\bno (?:specific |separate )?(?:renal|hepatic|liver|kidney|dose|dosing) (?:dose )?(?:adjustment|change|thresholds?|guidance|advice) (?:is |are )?(?:given|stated|specified|provided)|\bthreshold not verified\b|\bnot (?:been )?(?:independently )?(?:checked|verified)\b|\b(?:texts?|sources?|site|register|page|guideline|reference)s? (?:(?:was|were|is|are) )?not (?:accessible|reachable|available|opened|retrieved)\b|\bcould not be (?:opened|reached|retrieved|accessed|confirmed)\b|\bno (?:number|dose|value|figure) is given here\b|\brefused automated access\b|\b(?:gives?|give|provides?|lists?|states?|offers?) no (?:\S+ ){0,7}?(?:doses?|dosing|cut-offs?|thresholds?|regimens?|advice|data|definitions?|criteria|recommendations?|list|schedule|targets?|interpretation|adjustments?|values?|figures?|numbers?|timelines?|supplement doses|frequencies|preparations|switching rules|bands?|volumes?|intervals?|maximum|therapy|timing|grading)\b|\b(?:does|do|did) not (?:state|specify|mention|give (?:a |any )?(?:dose|doses|maximum|threshold|cut-off|duration|number|target))\b|${TARGET}\s+(?:decides?|should (?:decide|choose)|applies|limits? apply|rules? apply|review|may differ|uses|prefers)\b|^\s*${TARGET}\s+for\b|\bnot clinically reviewed\b|\bcheck for (?:a |an )?(?:newer|updated|current)\s+(?:[\w-]+\s+)?(?:protocol|guideline|policy)|\bcheck against the PDF\b|\bnot found in the (?:SFDA )?register\b|${TARGET}\s+must (?:choose|decide|confirm)|\b(?:gives?|states?) none\b|\b(?:requires?|needs?) reconciliation\b|\b(?:confirm|check)\b[^.;]{0,50}\blocally\b|^\s*not (?:stated|specified|given|available)\s*$|\b(?:availability|registration)\b[^.;]{0,60}\b(?:hospital formulary|SFDA|register)\b|\b(?:registration|availability)\b[^.;]{0,60}\b(?:was|were|is|has|have) not (?:been )?(?:independently )?(?:checked|verified|confirmed)\b|\b(?:requires?|needs?)\s+${TARGET}(?:\s+confirmation)?|${TARGET}\s+(?:required|confirmation)\b|^\s*${TARGET}\s*$|^\s*(?:(?:a |an )?(?:pharmacist|pharmacy) review\b|(?:check|consult|see|follow|refer to)\s+${TARGET}\s*$)`, "i");
/** "WSES 2020 gives no doses", "JBDS does not state …": a named guideline (an acronym, so case-sensitive) that is silent. */
const ACRONYM_SILENT = /\b[A-Z]{2,}[A-Za-z0-9-]*(?:\s+\d{4})?\s+(?:(?:gives?|provides?|states?|lists?)\s+(?:no|none)\b|(?:does|do) not (?:state|give|specify|provide|list)\b)/;
/** A clause that is only "local protocol" or "the label" ("Drug doses — local protocol"). */
const BARE_SOURCE = new RegExp(String.raw`(?:^|[;:(]|\s[–—]\s)\s*${TARGET}(?:\s+for\s+[\w-]+)?\s*(?=[;.)]|\s[–—]\s|$)`, "i");

/** "follow / check / consult the label, local protocol …": the span is cut out (with its joining word) and the rest kept. */
const REFER_SPAN = new RegExp(String.raw`(?:\s*(?:,|→|->|and|or|then)\s*)?\b(?:follow(?:ing)?|check(?:ing)?|consult(?:ing)?|see|refer to|use|recommends?|confirm(?:ing)?(?: with| against)?|verify(?:ing)?(?: with| against)?)\s+${TARGET}(?:\s+(?:and|or)\s+${TARGET})?(?:\s+(?:steps|instructions|advice|guidance|ranges?))?(?:\s+and\s+(?:specialist |cardiology |senior )?advice)?(?:\s+before (?:prescribing|clinical use|use|giving))?`, "gi");
/** "per the label / according to local protocol": removed, the rest of the sentence kept. */
const PER_SPAN = new RegExp(String.raw`\s*\/\s*${TARGET}|,?\s+(?:adjusted|adjust) to\s+${TARGET}|\s+for\s+${TARGET}(?=\s*(?:[.;,)]|$))|\s+unless\s+${TARGET}\s+(?:allows|permits|says otherwise)|\s+from\s+${TARGET}(?=\s*(?:[.;,)]|$))|(?:\s*(?:,|\band)\s*(?:adjust|titrate)(?: (?:the )?dose)?(?=\s+(?:per|according to))|)\s*,?\s*(?:as |and )?(?:per|according to|in line with|guided by|as directed by|as set out in|following|under|by)\s+${TARGET}(?:\s+and\s+${TARGET})?`, "gi");
/** "route and timing follow the local protocol", "dose per local protocol": the whole clause is a deferral. */
const DEFERRED_CHOICE = new RegExp(String.raw`^\s*(?:the )?(?:route|timing|dose|dosing|duration|choice|panel|frequency)(?:\s+(?:and|or)\s+(?:route|timing|dose|dosing|duration|frequency))?\s+(?:follows?|is set by|depends on|per|according to)\s+${TARGET}\s*$`, "i");

/** "treat per unit protocol and the neonatal sepsis workflow" → "treat per the neonatal sepsis workflow". */
const PER_THEN_SOURCE = new RegExp(String.raw`\b(per|according to|following|in line with)\s+${TARGET}\s+and\s+(?=the |an? )`, "gi");

/** "… or local protocol", "… and local protocol" at the end of a clause. */
const TAIL_SOURCE = new RegExp(String.raw`\s+(?:or|and)\s+${TARGET}(?=\s*(?:[.,;)]|$))`, "gi");

const words = (text: string) => (text.match(/[A-Za-z0-9]+/g) ?? []).length;

function cleanClause(clause: string): string {
  if (SILENT_CLAUSE.test(clause) || DEFERRED_CHOICE.test(clause) || ACRONYM_SILENT.test(clause)) return "";
  // A deferral that is the clause's own instruction ("renal reductions follow the label") takes the clause with it;
  // one tacked on with "and", "then", "," or "→" ("follow WHO 2025 and confirm with the local protocol") is cut alone.
  let main = false;
  const cut = clause.replace(REFER_SPAN, (span) => { if (!/^\s*(?:,|→|->|and\b|or\b|then\b)/i.test(span)) main = true; return ""; });
  if (main) return "";
  const out = cut.replace(PER_THEN_SOURCE, "$1 ").replace(PER_SPAN, "").replace(TAIL_SOURCE, "").replace(/\s*(?:,|→|->)\s*$/, "").replace(/^\s*(?:and|or|then)\s+/i, "");
  if (out === clause) return clause;
  // "adjust to renal function" with nothing else says nothing a CKD/CLD line does not say better.
  if (/^\s*(?:and\s+)?(?:adjust|reduce|modify)(?: the)?(?: dose)? (?:to|for|by|in) (?:renal|kidney|hepatic|liver) (?:function|impairment)\s*$/i.test(out)) return "";
  return words(out) >= 2 ? out : "";
}

/** True when the text contains wording that defers or says a source is silent. */
export function hasDeferral(text: string): boolean {
  return SILENT_CLAUSE.test(text) || DEFERRED_CHOICE.test(text) || ACRONYM_SILENT.test(text) || BARE_SOURCE.test(text) || [REFER_SPAN, PER_SPAN, TAIL_SOURCE].some((re) => new RegExp(re.source, "i").test(text));
}

/** A clinical quantity: a number with a unit. Text carrying one is salvaged rather than dropped. */
const QUANTITY = /\d+(?:[.,]\d+)?(?:\s*(?:to|–|-)\s*\d+(?:[.,]\d+)?)?\s*(?:mg|g\b|mcg|micrograms?|mmol|mL|L\/min|units?|IU|%|mmHg|kg|hours?|-hourly|days?|weeks?|minutes?)/i;
/** Where one sentence holds a clinical statement and a deferral, split it so the deferral can go alone. */
const CLAUSE_SPLIT = /(;|\s[–—]\s|\s→\s|,\s+so\s+|\s+(?:and|but|while)\s+(?=(?:(?:the|this|it|its)\s+)?(?:[\w-]+\s+){0,2}(?:gives?|states?|lists?|provides?)\s+no\b)|:\s+(?=[A-Z]{2,}[\w-]*(?:\s+\d{4})?\s+(?:gives?|states?|lists?)\s+no\b))/;
const capitalise = (text: string) => text.replace(/^\s*([a-z])/, (_m, c: string) => c.toUpperCase());

/** What a dropped clause still holds that a prescriber needs: a quantity in brackets or after "beyond". */
function salvage(clause: string, restore: (s: string) => string): string {
  const groups = [...clause.matchAll(/\uE010(\d+)\uE011/g)].map((m) => restore(m[0]).replace(/^\(|\)$/g, "")).filter((g) => QUANTITY.test(g));
  if (groups.length) {
    const subject = clause.match(/^\s*(.*?)\s+(?:is|are|was|were)\s+not\s+(?:stated|given|specified|reproduced)\b/i)?.[1];
    const subjectText = subject && !/\uE010/.test(subject) && QUANTITY.test(groups.join(" ")) ? `${capitalise(restore(subject))}: ` : "";
    return subjectText ? `${subjectText}${groups.join("; ")}` : capitalise(groups.join("; "));
  }
  const beyond = clause.match(/\b(?:beyond|other than|except|only)\s+(.+)$/i)?.[1];
  return beyond && QUANTITY.test(beyond) && !hasDeferral(beyond) ? capitalise(restore(beyond)) : "";
}

export function withoutDeferrals(text: string): string {
  if (!text || !hasDeferral(text)) return text;
  // Bracketed asides are cleaned on their own and protected while the sentence is split.
  const kept: string[] = [];
  const protectedText = text.replace(/\(([^()]*)\)/g, (_m, inner: string) => {
    const cleaned = withoutDeferrals(inner).replace(/[.;]\s*$/, "");
    if (!cleaned) return "";
    kept.push(`(${cleaned})`);
    return `\uE010${kept.length - 1}\uE011`;
  });
  const restore = (s: string) => s.replace(/\uE010(\d+)\uE011/g, (_m, i: string) => kept[Number(i)]);
  const sentences = protectedText.split(/(?<=[.!?])\s+(?=[A-Z0-9\uE010])/);
  const out = sentences.map((sentence) => {
    const end = sentence.match(/[.!?]+\s*$/)?.[0] ?? "";
    const body = end ? sentence.slice(0, sentence.length - end.length) : sentence;
    const parts = body.split(CLAUSE_SPLIT);
    let joined = "";
    for (let i = 0; i < parts.length; i += 2) {
      const sep = i > 0 ? parts[i - 1] : "";
      const raw = parts[i];
      if (raw === undefined) continue;
      let cleaned = cleanClause(raw);
      if (!cleaned.trim() && hasDeferral(raw)) cleaned = salvage(raw, restore);
      if (!cleaned.trim()) continue;
      const glue = !joined ? "" : sep && /^\s*[,:]?\s*(?:and|but|while|so)\s*$|^,\s+so\s+$/.test(sep) ? sep : /→/.test(sep) ? " → " : /[–—]/.test(sep) ? " – " : /^:/.test(sep) ? ": " : "; ";
      joined += glue + (joined ? cleaned.trim() : cleaned.trim());
    }
    if (!joined) return "";
    if (/^[A-Z\uE010]/.test(sentence.trim()) && /^[a-z]/.test(joined)) joined = capitalise(joined);
    return joined + end.trim();
  }).filter((s) => s.replace(/\uE010\d+\uE011/g, "").trim());
  return restore(out.join(" "))
    .replace(/\(\s*\)/g, "")
    .replace(/\s+([,.;:)])/g, "$1")
    .replace(/;\s*([.!?])/g, "$1")
    .replace(/[,;]\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** A list line that is only a label ("Hypersensitivity:") once deferrals are removed carries nothing. */
export function isEmptyClinicalLine(text: string): boolean {
  return !text.trim() || /^[^:]{1,40}:\s*\.?$/.test(text.trim());
}

/** Strings that identify rather than describe: never rewritten. */
const KEEP_KEYS = new Set(["id", "url", "sourceUrl", "version", "status", "clinicalReviewStatus", "authority", "pillar", "specialty", "speciality", "checkedOn", "lastReviewed", "doi", "pmid", "kind", "type"]);

/**
 * Display copy of a whole topic with deferral wording removed from every text field; list items left empty are dropped.
 * Topic pages call this once before drawing, so no field can publish "MOH gives no …", "per the label",
 * "check the hospital formulary" or similar. Stored content is unchanged.
 */
export function withoutDeferralsDeep<T>(value: T, key = ""): T {
  if (typeof value === "string") return (KEEP_KEYS.has(key) ? value : withoutDeferrals(value)) as T;
  if (Array.isArray(value)) {
    return value.map((item) => withoutDeferralsDeep(item, key)).filter((item, i) => !(typeof value[i] === "string" && typeof item === "string" && !item.trim())) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, withoutDeferralsDeep(v, k)])) as T;
  }
  return value;
}
