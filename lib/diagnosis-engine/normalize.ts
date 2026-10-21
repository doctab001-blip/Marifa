/**
 * Clinical term normalisation for the Diagnosis Engine.
 *
 * Entered findings and reference aliases pass through the same function, so British/American spelling,
 * common synonyms ("elevated", "high" → "raised") and abbreviations compare equal. Matching is on
 * content-token sets, so word order does not matter ("D-dimer raised" = "raised D-dimer").
 */

const PHRASES: Array<[RegExp, string]> = [
  [/\bx ray\b/g, "xray"],
  [/\bcxr\b/g, "chest xray"],
  [/\bchest radiograph\b/g, "chest xray"],
  [/\b(electrocardiogram|ekg)\b/g, "ecg"],
  [/\b(oxygen saturations?|sats)\b/g, "spo2"],
  [/\b(shortness of breath|breathlessness|breathless|sob)\b/g, "dyspnea"],
  [/\b(white blood cell count|white cell count|wcc|wbc count|white cells)\b/g, "wbc"],
  [/\b(beta hcg|bhcg|b hcg|serum hcg|urine hcg|urinary hcg)\b/g, "hcg"],
  [/\b(urine pregnancy test|upt)\b/g, "pregnancy test"],
  [/\b(not passing flatus|no flatus|not passing wind|no bowel movement)\b/g, "absolute constipation"],
  [/\b(no focal neurology|no focal neurological deficits?|non focal neurology|no focal deficits?|neurologically intact)\b/g, "normal neurological examination"],
  [/\b(no (hemorrhage|bleed|bleeding) on ct|ct no (hemorrhage|bleed)|ct (excludes|negative for) (hemorrhage|bleed))\b/g, "ct without hemorrhage"],
  [/\b(elevated|high|increased|rising|raised|↑)\b/g, "raised"],
  [/\b(reduced|decreased|diminished|low|↓)\b/g, "low"],
  [/\bright iliac fossa\b/g, "right iliac fossa"],
  [/\brif\b/g, "right iliac fossa"],
  [/\bruq\b/g, "right upper quadrant"],
];

const STOPWORDS = new Set(["a", "an", "the", "of", "on", "in", "to", "with", "and", "or", "for", "at", "by", "is", "was", "are", "has", "had", "patient", "pt", "very", "mild", "mildly", "markedly", "some", "noted", "seen", "present", "sign"]);

const NEGATION_PREFIX = new Set(["no", "not", "denies", "denied", "without", "absent", "negative", "nil", "neg"]);
const NEGATION_SUFFIX = new Set(["negative", "absent", "excluded", "neg"]);

/** Lower-case, unify spelling and synonyms, strip punctuation. Applied to entries and aliases alike. */
export function normalizeTerm(value: string): string {
  let text = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']s\b/g, "")
    .replace(/β/g, "beta ")
    .replace(/[^a-z0-9↑↓]+/g, " ")
    .trim();
  // British → American and Latin digraphs (haem/oedema/anaemia/dyspnoea/paed/naevi).
  text = text.replace(/ae/g, "e").replace(/oe/g, "e").replace(/leuc/g, "leuk").replace(/isation/g, "ization").replace(/\bgrey\b/g, "gray");
  for (const [pattern, replacement] of PHRASES) text = text.replace(pattern, replacement);
  return text.replace(/\s+/g, " ").trim();
}

export function contentTokens(normalized: string): string[] {
  return normalized.split(" ").filter((token) => token && !STOPWORDS.has(token));
}

export type ParsedFinding = {
  /** The clinician's own text, shown back on the result cards. */
  original: string;
  normalized: string;
  tokens: Set<string>;
  negated: boolean;
  /** Tokens without the negation word, used to find the feature being denied. */
  coreTokens: Set<string>;
};

export function parseFinding(original: string): ParsedFinding | null {
  const normalized = normalizeTerm(original);
  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length === 0) return null;
  const negated = NEGATION_PREFIX.has(tokens[0]) || (tokens.length > 1 && NEGATION_SUFFIX.has(tokens[tokens.length - 1]));
  const core = contentTokens(normalized).filter((token) => !NEGATION_PREFIX.has(token) && !NEGATION_SUFFIX.has(token));
  return { original: original.trim(), normalized, tokens: new Set(contentTokens(normalized)), negated, coreTokens: new Set(core) };
}

export type AliasTokens = string[];

export function aliasTokens(alias: string): AliasTokens {
  return contentTokens(normalizeTerm(alias));
}

/**
 * How strongly an entry matches one alias:
 *  1   — every alias token is in the entry ("raised D-dimer 1200" ⊇ "raised d dimer")
 *  0.5 — a multi-word entry is fully contained in the alias ("chest pain" ⊂ "pleuritic chest pain")
 *  0   — otherwise
 */
export function aliasMatchStrength(entry: Set<string>, alias: AliasTokens): number {
  if (alias.length === 0 || entry.size === 0) return 0;
  if (alias.every((token) => entry.has(token))) return 1;
  if (entry.size >= 2 && [...entry].every((token) => alias.includes(token))) return 0.5;
  return 0;
}
