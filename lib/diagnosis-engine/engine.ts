/**
 * Diagnosis Engine — deterministic, explainable differential ranking.
 *
 * Every entered finding (and every value it contains, e.g. "HR 124") is matched against weighted reference
 * features (curated profiles plus the GlobalDiseaseTopic dataset). The score combines how much of a condition's
 * picture is present (coverage) with how much of the entered picture the condition explains, minus findings that
 * argue against it, then applies age and region context. Life-threatening conditions with real supporting
 * evidence are always kept on the list.
 *
 * Pure module: no I/O, no patient data stored or logged. Pathway links are resolved by an injected resolver.
 */
import type { CountryCode, GlobalDiseaseTopic } from "@/types/clinical";
import type {
  DiagnosticEngineResponse,
  DiagnosticInputState,
  DifferentialMatch,
  DiscriminatingFinding,
  FindingDomain,
  PathwayStatus,
  UrgencyLevel,
} from "@/types/diagnosisEngine";
import { diagnosticProfiles, globalTopicOverlays, type DiagnosticProfile, type FeatureKind, type PathwayRef, type ProfileFeature } from "./knowledge-base";
import { aliasMatchStrength, aliasTokens, contentTokens, normalizeTerm, parseFinding, type AliasTokens, type ParsedFinding } from "./normalize";
import { REGION_NAMES } from "./region-names";
import { calculatorsFor } from "./calculators";

export const CLINICAL_SAFETY_NOTICE =
  "Decision support only — not a diagnosis. Rankings come from term matching against a curated reference set (demonstration data, pending clinical review) and can miss conditions outside it. Always apply clinical judgement, local protocols and senior review. Do not enter patient identifiers.";

export const MIN_DIFFERENTIALS = 3;
export const MAX_DIFFERENTIALS = 4;
const MAX_SCORE = 97;
const MAX_DISCRIMINATORS = 6;
const URGENCY_ORDER: Record<UrgencyLevel, number> = { CRITICAL_MUST_NOT_MISS: 0, HIGH: 1, ROUTINE: 2 };
const DOMAINS: FindingDomain[] = ["symptoms", "examFindings", "labInvestigations", "imagingFindings"];
const MATCH_KEY: Record<FindingDomain, keyof DifferentialMatch["matchedFeatures"]> = {
  symptoms: "symptomsMatched",
  examFindings: "examMatched",
  labInvestigations: "labsMatched",
  imagingFindings: "imagingMatched",
};
const KIND_LABEL: Record<FeatureKind, string> = { symptom: "symptom", exam: "exam", lab: "lab/ECG", imaging: "imaging" };

export class DiagnosisEngineError extends Error {
  readonly code: "no_findings" | "no_match";
  constructor(code: "no_findings" | "no_match", message: string) {
    super(message);
    this.code = code;
    this.name = "DiagnosisEngineError";
  }
}

/* ── Reference set ─────────────────────────────────────────────────────────────────────────────── */

type CompiledFeature = ProfileFeature & { tokens: AliasTokens[]; labelTokens: Set<string> };
type CompiledProfile = Omit<DiagnosticProfile, "features" | "against"> & {
  features: CompiledFeature[];
  against: Array<{ label: string; weight: number; tokens: AliasTokens[] }>;
  totalWeight: number;
};

const compileTokens = (aliases: string[]) => aliases.map(aliasTokens).filter((tokens) => tokens.length > 0);

function compile(profile: DiagnosticProfile): CompiledProfile {
  const features = profile.features.map((feature) => ({ ...feature, tokens: compileTokens(feature.aliases), labelTokens: new Set(aliasTokens(feature.label)) }));
  return {
    ...profile,
    features,
    against: (profile.against ?? []).map((item) => ({ label: item.label, weight: item.weight, tokens: compileTokens(item.aliases) })),
    totalWeight: features.reduce((sum, feature) => sum + feature.weight, 0),
  };
}

/** Splits "Constipation or diarrhea" into separate aliases so either finding matches. */
const splitAlternatives = (item: string) => item.split(/\s+or\s+|\//i).map((part) => part.trim()).filter(Boolean);

/** Turns a GlobalDiseaseTopic (plus its optional overlay) into a diagnostic profile. */
export function profileFromGlobalTopic(topic: GlobalDiseaseTopic): DiagnosticProfile {
  const overlay = globalTopicOverlays[topic.id];
  const existing = new Set((overlay?.features ?? []).flatMap((feature) => feature.aliases.map((alias) => alias.toLowerCase())));
  const fromTopic = (items: string[], kind: FeatureKind): ProfileFeature[] =>
    items
      .filter((item) => !existing.has(item.toLowerCase()))
      // Topic signs are specific (rose spots, relative bradycardia); topic symptoms are often shared (headache).
      .map((item) => ({ label: item, kind, weight: kind === "exam" ? (2 as const) : (1 as const), aliases: [item, ...splitAlternatives(item)], classic: true }));
  const { symptoms, signs, redFlags } = topic.universalFeatures.clinicalPresentation;
  return {
    key: overlay?.key ?? topic.id,
    title: topic.title,
    icd10Code: topic.icd10Code,
    specialty: overlay?.specialty ?? "Infectious Diseases",
    urgencyLevel: overlay?.urgencyLevel ?? "HIGH",
    clusters: overlay?.clusters ?? ["fever"],
    sex: overlay?.sex,
    priors: overlay?.priors,
    features: [...(overlay?.features ?? []), ...fromTopic(symptoms, "symptom"), ...fromTopic(signs, "exam")],
    against: overlay?.against,
    redFlags: [...redFlags.map((flag) => `${flag}: escalate.`), ...(overlay?.redFlags ?? [])],
    nextSteps: [
      ...(overlay?.nextSteps ?? []),
      ...topic.universalFeatures.differentials.map((item) => ({ testName: `Exclude ${item.condition}`, clinicalRationale: item.distinguishingFeatures })),
    ],
    pathway: { topicIds: [topic.id], titleHints: [topic.title], title: topic.title, global: true },
  };
}

export function buildReferenceSet(globalTopics: GlobalDiseaseTopic[] = []): DiagnosticProfile[] {
  return [...diagnosticProfiles, ...globalTopics.map(profileFromGlobalTopic)];
}

/* ── Pathway resolution ────────────────────────────────────────────────────────────────────────── */

export type ResolvedPathway = { id: string; title: string; status: PathwayStatus };
export type PathwayResolver = (pathway: PathwayRef) => ResolvedPathway;

/**
 * Offline resolver: the first catalogue id, unverified. Used when the live directory is unavailable.
 * Repository GlobalDiseaseTopic records are always present but remain pending clinical review.
 */
export const catalogueResolver: PathwayResolver = (pathway) => ({ id: pathway.topicIds[0], title: pathway.title, status: pathway.global ? "pending_review" : "unverified" });

export function pathwayUrl(id: string, region?: CountryCode): string {
  const base = `/dashboard/diseases/${encodeURIComponent(id)}`;
  return region ? `${base}?region=${region}` : base;
}

/* ── Context (age, region) ─────────────────────────────────────────────────────────────────────── */

const ageText = ([min, max]: [number, number]) => (max >= 120 ? `${min}+` : min === 0 ? `under ${max}` : `${min}–${max}`);

/** Score multiplier and explanation from age and region. `excluded` when age is outside a hard limit. */
export function contextAdjustment(profile: DiagnosticProfile, input: Pick<DiagnosticInputState, "age" | "region">) {
  const notes: string[] = [];
  let factor = 1;
  const { ageRange, typicalAge, regionWeight, regionNote } = profile.priors ?? {};
  const age = input.age;
  if (age !== undefined) {
    if (ageRange && (age < ageRange[0] || age > ageRange[1])) return { factor: 0, notes, excluded: true };
    if (typicalAge && (age < typicalAge[0] || age > typicalAge[1])) {
      factor *= 0.8;
      notes.push(`Age ${age} is outside the usual range (${ageText(typicalAge)}) — score reduced.`);
    }
  }
  const weight = input.region ? regionWeight?.[input.region] : undefined;
  if (weight && weight !== 1 && input.region) {
    factor *= weight;
    notes.push(weight > 1
      ? `Region weighting (${REGION_NAMES[input.region]}): ${regionNote ?? "higher local prevalence"}.`
      : `Less common in ${REGION_NAMES[input.region]} — ask about travel and exposure.`);
  }
  return { factor, notes, excluded: false };
}

/* ── Scoring ───────────────────────────────────────────────────────────────────────────────────── */

type Entry = ParsedFinding & { domain: FindingDomain };

type Scored = {
  profile: CompiledProfile;
  evidence: number;
  matchScore: number;
  contraWeight: number;
  matchedEntries: Entry[];
  matched: Set<CompiledFeature>;
  contradicting: string[];
  missingClassic: CompiledFeature[];
  contextNotes: string[];
  hasKeyFeature: boolean;
  /** A specific (non-generic) feature carries the match, not only fever, tachycardia or raised CRP. */
  supported: boolean;
  /** An explicit contrary result (weight 3, e.g. negative pregnancy test for ectopic) rules it off the list. */
  refuted: boolean;
  /** None of the profile's gate features is present, so the condition is not considered. */
  gated: boolean;
};

function bestStrength(tokens: Set<string>, aliases: AliasTokens[]) {
  return aliases.reduce((best, alias) => Math.max(best, aliasMatchStrength(tokens, alias)), 0);
}

/** Best match across the entry's own words and the terms read from its values. */
function entryStrength(entry: ParsedFinding, aliases: AliasTokens[]) {
  return entry.variants.reduce((best, variant) => Math.max(best, bestStrength(variant, aliases)), 0);
}

function scoreProfile(profile: CompiledProfile, entries: Entry[], context: { factor: number; notes: string[] }): Scored {
  const featureStrength = new Map<CompiledFeature, number>();
  const matchedEntries: Entry[] = [];
  const contradicting: string[] = [];
  let contraWeight = 0;
  let refutingWeight = 0;
  let positiveEntries = 0;
  let explainedTotal = 0;

  for (const entry of entries) {
    // Explicit contrary findings ("normal chest X-ray" against pneumonia, "negative pregnancy test" against ectopic).
    const contra = profile.against.find((item) => entryStrength(entry, item.tokens) === 1);
    if (contra) {
      contraWeight += contra.weight;
      refutingWeight += contra.weight;
      contradicting.push(entry.original);
      continue;
    }
    if (entry.negated) {
      // A denied classic feature ("no fever") counts against the condition.
      const denied = profile.features.find((feature) => feature.classic && bestStrength(entry.coreTokens, feature.tokens) > 0);
      if (denied) {
        contraWeight += denied.weight * 0.6;
        contradicting.push(entry.original);
      }
      continue;
    }
    positiveEntries += 1;
    // How well this condition explains the entry: a specific (weight 3) feature explains it fully, a
    // non-specific one (fever, vomiting) only a third, so common findings do not inflate unrelated conditions.
    let explanation = 0;
    for (const feature of profile.features) {
      const strength = entryStrength(entry, feature.tokens);
      if (strength === 0) continue;
      featureStrength.set(feature, Math.max(featureStrength.get(feature) ?? 0, strength));
      explanation = Math.max(explanation, (feature.weight * strength) / 3);
    }
    if (explanation >= 1 / 6) matchedEntries.push(entry);
    explainedTotal += explanation;
  }

  let evidence = 0;
  let specificEvidence = 0;
  let hasKeyFeature = false;
  for (const [feature, strength] of featureStrength) {
    evidence += feature.weight * strength;
    if (feature.generic || feature.weight < 2) continue;
    specificEvidence += feature.weight * strength;
    if (feature.weight === 3 && strength === 1) hasKeyFeature = true;
  }

  const saturation = Math.min(profile.totalWeight * 0.55, 24);
  const coverage = Math.min(1, evidence / saturation);
  const explainedShare = positiveEntries ? explainedTotal / positiveEntries : 0;
  const penalty = Math.min(0.6, contraWeight * 0.1);
  const raw = evidence > 0 ? (0.65 * coverage + 0.35 * explainedShare) * (1 - penalty) * context.factor : 0;
  const matchScore = Math.round(Math.min(MAX_SCORE, raw * 100));
  const missingClassic = profile.features.filter((feature) => feature.classic && !featureStrength.has(feature));
  return {
    profile,
    evidence,
    matchScore,
    contraWeight,
    matchedEntries,
    matched: new Set(featureStrength.keys()),
    contradicting,
    missingClassic,
    contextNotes: evidence > 0 ? context.notes : [],
    hasKeyFeature,
    supported: hasKeyFeature || specificEvidence >= 2,
    refuted: refutingWeight >= 3,
    gated: Boolean(profile.gate?.length) && !profile.features.some((feature) => profile.gate?.includes(feature.label) && featureStrength.has(feature)),
  };
}

function byRank(a: Scored, b: Scored) {
  return b.matchScore - a.matchScore || URGENCY_ORDER[a.profile.urgencyLevel] - URGENCY_ORDER[b.profile.urgencyLevel] || b.evidence - a.evidence;
}

/** A must-not-miss condition is kept on the list when real evidence supports it and nothing strongly refutes it. */
function isPlausibleCritical(item: Scored) {
  return item.profile.urgencyLevel === "CRITICAL_MUST_NOT_MISS" && item.supported && !item.refuted;
}

/* ── What would change the ranking ─────────────────────────────────────────────────────────────── */

const CHECK_STOPWORDS = new Set(["raised", "low", "positive", "test", "score", "level", "only", "if", "acute", "new"]);

function howToCheck(feature: CompiledFeature, profile: CompiledProfile) {
  const keywords = [...feature.labelTokens].filter((token) => token.length >= 3 && !CHECK_STOPWORDS.has(token));
  const step = profile.nextSteps.find((item) => {
    const stepTokens = new Set(contentTokens(normalizeTerm(item.testName)));
    return keywords.some((token) => stepTokens.has(token));
  });
  return step?.testName;
}

/**
 * Specific findings not yet entered that would raise one listed differential over the others. A finding that
 * supports only one condition separates them best; must-not-miss conditions and higher-ranked ones come first.
 */
function discriminatingFindings(selected: Scored[], entries: Entry[]): DiscriminatingFinding[] {
  const entered = (feature: CompiledFeature) => entries.some((entry) => entryStrength(entry, feature.tokens) > 0 || bestStrength(entry.coreTokens, feature.tokens) === 1);
  const candidates = new Map<string, DiscriminatingFinding & { priority: number }>();
  selected.forEach((item, rank) => {
    for (const feature of item.profile.features) {
      if (feature.generic || feature.weight < 2 || item.matched.has(feature) || entered(feature)) continue;
      const key = [...feature.labelTokens].sort().join(" ");
      if (candidates.has(key)) continue;
      const supports = selected
        .filter((other) => other.profile.features.some((candidate) => !candidate.generic && candidate.weight >= 2 && bestStrength(feature.labelTokens, candidate.tokens) === 1))
        .map((other) => other.profile.title);
      if (!supports.includes(item.profile.title)) supports.unshift(item.profile.title);
      const priority = feature.weight * 2 + (supports.length === 1 ? 2 : 0) + (item.profile.urgencyLevel === "CRITICAL_MUST_NOT_MISS" ? 1.5 : 0) + (feature.classic ? 1 : 0) - rank * 0.75;
      candidates.set(key, { finding: feature.label, kind: feature.kind, supports, howToCheck: howToCheck(feature, item.profile), priority });
    }
  });
  return [...candidates.values()]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, MAX_DISCRIMINATORS)
    .map(({ finding, kind, supports, howToCheck }) => ({ finding, kind, supports, howToCheck }));
}

/* ── Run ───────────────────────────────────────────────────────────────────────────────────────── */

export type RunOptions = {
  globalTopics?: GlobalDiseaseTopic[];
  resolvePathway?: PathwayResolver;
  now?: Date;
  queryId?: string;
};

export function collectEntries(input: DiagnosticInputState): Entry[] {
  const seen = new Set<string>();
  const entries: Entry[] = [];
  for (const domain of DOMAINS) {
    for (const raw of input[domain] ?? []) {
      const parsed = parseFinding(raw);
      if (!parsed) continue;
      const key = `${parsed.negated}:${parsed.normalized}`;
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({ ...parsed, domain });
    }
  }
  return entries;
}

export function runDiagnosisEngine(input: DiagnosticInputState, options: RunOptions = {}): DiagnosticEngineResponse {
  const entries = collectEntries(input);
  if (entries.length === 0) throw new DiagnosisEngineError("no_findings", "Enter at least one symptom, examination, laboratory or imaging finding.");

  const resolve = options.resolvePathway ?? catalogueResolver;
  const scored: Scored[] = [];
  for (const profile of buildReferenceSet(options.globalTopics)) {
    if (profile.sex && input.gender && input.gender !== "all" && input.gender !== profile.sex) continue;
    const context = contextAdjustment(profile, input);
    if (context.excluded) continue;
    scored.push(scoreProfile(compile(profile), entries, context));
  }

  // Strongly refuted conditions (e.g. ectopic pregnancy with a negative pregnancy test) are not listed.
  // A candidate needs specific support; shared findings (fever, CRP, tachycardia) alone do not qualify it.
  // If nothing reaches that bar (a vague single complaint), fall back to any condition with partial support.
  const plausible = scored.filter((item) => item.matchScore > 0 && !item.refuted && !item.gated);
  const supported = plausible.filter((item) => item.supported);
  const candidates = (supported.length ? supported : plausible).sort(byRank);
  if (candidates.length === 0) {
    throw new DiagnosisEngineError("no_match", "No condition in the reference set matched these findings. Add more specific findings (for example the character of pain, key signs or abnormal results).");
  }

  const size = candidates.length >= MAX_DIFFERENTIALS ? MAX_DIFFERENTIALS : MIN_DIFFERENTIALS;
  const selected = candidates.slice(0, size);

  // Must-not-miss guarantee: keep the strongest plausible life-threatening condition on the list.
  if (!selected.some(isPlausibleCritical)) {
    const critical = candidates.slice(size).find(isPlausibleCritical);
    if (critical) selected[selected.length - 1] = critical;
  }

  // Pad to the minimum with conditions from the same presentation: supported ones first, life-threatening next.
  if (selected.length < MIN_DIFFERENTIALS) {
    const clusters = new Set(selected.flatMap((item) => item.profile.clusters));
    const pool = scored
      .filter((item) => !selected.includes(item) && item.profile.clusters.some((cluster) => clusters.has(cluster)) && !item.refuted && !item.gated)
      .sort((a, b) => Number(b.evidence > 0) - Number(a.evidence > 0) || URGENCY_ORDER[a.profile.urgencyLevel] - URGENCY_ORDER[b.profile.urgencyLevel] || byRank(a, b));
    selected.push(...pool.slice(0, MIN_DIFFERENTIALS - selected.length));
  }
  selected.sort(byRank);

  const topDifferentials = selected.map((item): DifferentialMatch => {
    const resolved = resolve(item.profile.pathway);
    const matchedFeatures: DifferentialMatch["matchedFeatures"] = { symptomsMatched: [], examMatched: [], labsMatched: [], imagingMatched: [] };
    for (const entry of item.matchedEntries) matchedFeatures[MATCH_KEY[entry.domain]].push(entry.original);
    return {
      diseaseId: resolved.id,
      diseaseTitle: item.profile.title,
      icd10Code: item.profile.icd10Code,
      specialty: item.profile.specialty,
      matchScore: item.matchScore,
      urgencyLevel: item.profile.urgencyLevel,
      matchedFeatures,
      missingClassicFeatures: [...item.missingClassic]
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5)
        .map((feature) => `${feature.label} (${KIND_LABEL[feature.kind]})`),
      contradictingFindings: item.contradicting,
      redFlags: item.profile.redFlags,
      suggestedNextSteps: item.profile.nextSteps,
      marifaPathwayUrl: pathwayUrl(resolved.id, input.region),
      pathwayTitle: resolved.title,
      pathwayStatus: resolved.status,
      contextNotes: item.contextNotes,
      calculators: calculatorsFor(item.profile.key),
    };
  });

  return {
    queryId: options.queryId ?? globalThis.crypto.randomUUID(),
    timestamp: (options.now ?? new Date()).toISOString(),
    topDifferentials,
    clinicalSafetyNotice: CLINICAL_SAFETY_NOTICE,
    discriminatingFindings: discriminatingFindings(selected, entries),
    inputInterpretation: entries.filter((entry) => entry.derived.length).map((entry) => ({ original: entry.original, interpretedAs: entry.derived })),
  };
}
