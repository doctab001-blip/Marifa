import type { GlobalDiseaseTopic } from "@/types/clinical";
import type { VocabularyTerm } from "@/types/diagnosisEngine";
import { buildReferenceSet } from "./engine";

const ACRONYMS = ["alp", "alt", "ast", "ggt", "ck", "bnp", "nt probnp", "crp", "csf", "pco2", "po2", "t3", "ft4", "tsh", "wbc", "hcg", "jvp", "ecg", "ct", "cta", "ctpa", "mri", "gcs", "spo2", "lfts", "lft", "pr", "aki", "af", "dvt", "pe", "rv", "lv", "ef", "st", "lbbb", "rbbb", "iv", "csf", "ns1", "igm", "hiv", "tb", "uti", "rif", "ruq", "rlq", "nsaid", "pnd", "abg", "vbg", "inr", "ldh", "pcr", "ivf"];
const ACRONYM_PATTERN = new RegExp(String.raw`\b(${ACRONYMS.map((item) => item.replace(/ /g, "\\s")).join("|")})\b`, "gi");
const display = (term: string) => {
  const cased = term.replace(ACRONYM_PATTERN, (match) => match.toUpperCase());
  return cased[0].toUpperCase() + cased.slice(1);
};

/**
 * Terms the finding inputs suggest while typing: every feature label and alias in the reference set, so a
 * suggestion is always something the engine recognises. Aliases are kept when they read as a clinical phrase.
 */
export function buildVocabulary(globalTopics: GlobalDiseaseTopic[] = []): VocabularyTerm[] {
  const terms = new Map<string, VocabularyTerm>();
  const add = (term: string, kind: VocabularyTerm["kind"]) => {
    const clean = term.trim();
    if (clean.length < 3 || clean.length > 70 || /[{}]/.test(clean)) return;
    const key = clean.toLowerCase();
    if (!terms.has(key)) terms.set(key, { term: display(clean), kind });
  };
  for (const profile of buildReferenceSet(globalTopics)) {
    for (const feature of profile.features) {
      add(feature.label, feature.kind);
      for (const alias of feature.aliases) if (alias.includes(" ") || alias.length >= 5) add(alias, feature.kind);
    }
    for (const item of profile.against ?? []) add(item.label, "lab");
  }
  return [...terms.values()].sort((a, b) => a.term.localeCompare(b.term));
}
