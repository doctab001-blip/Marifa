import { SEARCH_ALIASES } from "@/lib/search-aliases";

/**
 * One search engine for every clinical-topic search box (directory, sidebar filter,
 * header search and the dashboard hub all land here), so they always agree.
 *
 * Matching rules:
 *  - case, accents, punctuation and hyphens are ignored; British/American spellings are equal
 *    (oedema = edema, haemorrhage = hemorrhage, immunisation = immunization)
 *  - every word you type must be found, as the start of a word (asth -> asthma)
 *  - abbreviations and lay terms expand through SEARCH_ALIASES (DKA -> diabetic ketoacidosis)
 *  - title matches outrank keyword/speciality matches, which outrank summary matches
 *  - if nothing matches every word, topics matching most words are shown, then partial-word
 *    matches (tension -> hypertension), then near-spellings (sepsys -> sepsis)
 */

export type SearchableTopic = {
  title: string;
  summary?: string;
  specialty?: string;
  speciality?: string;
  subSpecialities?: readonly string[];
  authority?: string;
  pillar?: string;
  keywords?: readonly string[];
};

const STOP_WORDS = new Set(["a", "an", "and", "the", "of", "in", "on", "for", "to", "with", "or", "is", "are", "how"]);
// Words that describe the kind of document rather than the condition ("asthma treatment").
// They add to the score when present but a topic is never required to contain them.
const GENERIC_WORDS = new Set(["treatment", "management", "manage", "pathway", "guideline", "guidelines", "guidance", "protocol", "care", "assessment", "review", "planning", "support", "diagnosis", "therapy"]);

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ًͯ-ٰٟ]/g, "") // accents and Arabic diacritics
    .toLocaleLowerCase()
    .replace(/&/g, " and ")
    .replace(/ae|oe/g, "e") // oedema/edema, haemorrhage/hemorrhage, paediatric/pediatric
    .replace(/isation/g, "ization") // immunisation/immunization
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

// Alias table, normalised once at load.
const aliasTable = new Map<string, string[]>(
  Object.entries(SEARCH_ALIASES).map(([key, values]) => [normalizeSearchText(key), values.map(normalizeSearchText)]),
);
const MAX_ALIAS_WORDS = Math.max(...[...aliasTable.keys()].map((key) => key.split(" ").length));

type Term = { alternatives: { text: string; weight: number }[]; required: boolean };

/** Splits a query into terms; known multi-word phrases ("heart attack") stay together. */
function buildTerms(query: string): Term[] {
  const words = normalizeSearchText(query).split(" ").filter(Boolean);
  const terms: Term[] = [];
  let index = 0;
  while (index < words.length) {
    let length = Math.min(MAX_ALIAS_WORDS, words.length - index);
    let phrase = "";
    while (length > 1) {
      phrase = words.slice(index, index + length).join(" ");
      if (aliasTable.has(phrase)) break;
      length -= 1;
    }
    if (length <= 1) phrase = words[index];
    const alternatives = [{ text: phrase, weight: 1 }, ...(aliasTable.get(phrase) ?? []).map((text) => ({ text, weight: 0.95 }))];
    terms.push({ alternatives, required: !STOP_WORDS.has(phrase) && !GENERIC_WORDS.has(phrase) });
    index += Math.max(length, 1);
  }
  return terms.some((term) => term.required) ? terms : terms.map((term) => ({ ...term, required: true }));
}

type IndexedField = { text: string; padded: string; words: string[]; weights: [number, number, number] };
type IndexedTopic = { fields: IndexedField[]; titleWords: string[] };

// [exact word, word prefix, inside a word]
const TITLE_WEIGHTS: [number, number, number] = [100, 80, 50];
const KEYWORD_WEIGHTS: [number, number, number] = [40, 32, 18];
const TAG_WEIGHTS: [number, number, number] = [36, 28, 14];
const SUMMARY_WEIGHTS: [number, number, number] = [16, 12, 6];

const indexCache = new WeakMap<object, IndexedTopic>();

function field(value: string | undefined, weights: [number, number, number]): IndexedField | null {
  const text = normalizeSearchText(value ?? "");
  return text ? { text, padded: ` ${text}`, words: text.split(" "), weights } : null;
}

function indexTopic(topic: SearchableTopic): IndexedTopic {
  const cached = indexCache.get(topic);
  if (cached) return cached;
  const fields = [
    field(topic.title, TITLE_WEIGHTS),
    ...(topic.keywords ?? []).map((keyword) => field(keyword, KEYWORD_WEIGHTS)),
    field(topic.pillar, TAG_WEIGHTS),
    field(topic.specialty, TAG_WEIGHTS),
    field(topic.speciality, TAG_WEIGHTS),
    ...(topic.subSpecialities ?? []).map((tag) => field(tag, TAG_WEIGHTS)),
    field(topic.authority, TAG_WEIGHTS),
    field(topic.summary, SUMMARY_WEIGHTS),
  ].filter((entry): entry is IndexedField => entry !== null);
  const indexed = { fields, titleWords: fields[0]?.words ?? [] };
  indexCache.set(topic, indexed);
  return indexed;
}

/** Score of one search text inside one field (0 = no match). Short words (<3) must match whole words. */
function scoreText(text: string, entry: IndexedField, allowInside: boolean): number {
  const [exact, prefix, inside] = entry.weights;
  if (text.includes(" ")) {
    // Phrase: must start on a word boundary; the last word may be partial.
    if (entry.padded.includes(` ${text} `) || entry.text === text) return exact;
    return entry.padded.includes(` ${text}`) ? prefix : 0;
  }
  if (entry.words.includes(text)) return exact;
  if (text.length < 3) return 0;
  if (entry.words.some((word) => word.startsWith(text))) return prefix;
  return allowInside && text.length >= 4 && entry.text.includes(text) ? inside : 0;
}

function scoreTerm(term: Term, indexed: IndexedTopic, allowInside: boolean): number {
  let best = 0;
  for (const { text, weight } of term.alternatives) {
    for (const entry of indexed.fields) {
      const score = scoreText(text, entry, allowInside) * weight;
      if (score > best) best = score;
    }
  }
  return best;
}

/** Bounded edit distance: true when a and b differ by at most `max` single-character edits. */
function withinEdits(a: string, b: string, max: number): boolean {
  if (Math.abs(a.length - b.length) > max) return false;
  let previous = Array.from({ length: b.length + 1 }, (_, column) => column);
  for (let row = 1; row <= a.length; row += 1) {
    const current = [row];
    let rowMin = row;
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      const value = Math.min(previous[column] + 1, current[column - 1] + 1, previous[column - 1] + cost);
      current.push(value);
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return false;
    previous = current;
  }
  return previous[b.length] <= max;
}

function typoScore(term: Term, indexed: IndexedTopic): number {
  const word = term.alternatives[0].text;
  if (word.length < 4 || word.includes(" ")) return 0;
  const max = word.length >= 8 ? 2 : 1;
  const close = (candidate: string) => candidate.length >= 4 && (withinEdits(word, candidate, max) || withinEdits(word, candidate.slice(0, word.length), max));
  if (indexed.titleWords.some(close)) return 60; // a near-spelling of a title word beats one buried in the body
  return indexed.fields.some((entry) => entry.words.some(close)) ? 20 : 0;
}

type Ranked<T> = { item: T; score: number; position: number };

type Mode = "all" | "most" | "inside" | "typo";

function rank<T extends SearchableTopic>(items: readonly T[], terms: Term[], mode: Mode): Ranked<T>[] {
  const required = terms.filter((term) => term.required);
  const needed = mode === "all" || mode === "inside" ? required.length : Math.max(1, Math.ceil(required.length / 2));
  const allowInside = mode === "inside" || mode === "typo";
  const results: Ranked<T>[] = [];
  items.forEach((item, position) => {
    const indexed = indexTopic(item);
    let matched = 0;
    let total = 0;
    for (const term of terms) {
      let score = scoreTerm(term, indexed, allowInside);
      if (score === 0 && mode === "typo") score = typoScore(term, indexed);
      if (score > 0) {
        total += score;
        if (term.required) matched += 1;
      }
    }
    if (matched >= needed && total > 0) results.push({ item, score: total, position });
  });
  return results;
}

/**
 * Returns the topics that match the query, best match first.
 * An empty query returns every topic in its original order.
 */
export function searchTopics<T extends SearchableTopic>(items: readonly T[], query: string): T[] {
  if (!normalizeSearchText(query)) return [...items];
  const terms = buildTerms(query);
  const required = terms.filter((term) => term.required).length;
  let ranked = rank(items, terms, "all");
  if (ranked.length === 0 && required > 1) ranked = rank(items, terms, "most");
  if (ranked.length === 0) ranked = rank(items, terms, "inside");
  if (ranked.length === 0) ranked = rank(items, terms, "typo");
  return ranked.sort((a, b) => b.score - a.score || a.position - b.position).map(({ item }) => item);
}

export function topicMatches(item: SearchableTopic, query: string): boolean {
  return searchTopics([item], query).length > 0;
}
