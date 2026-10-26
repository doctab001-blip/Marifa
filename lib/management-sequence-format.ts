/**
 * Management-sequence format (platform owner rule, 26 Oct 2026).
 *
 * 1. The first step of any acute or initial sequence is an ABCDE survey (Airway, Breathing, Circulation,
 *    Disability, Exposure) and says that abnormalities are corrected concurrently, as they are found.
 * 2. Every drug mention carries dose, route, frequency and duration, written as one badge:
 *      [💊 {Drug} | {Dose} | {Route} | {Frequency} | {Duration}]
 * 3. Management sequences do not carry side effects, contraindications or special dose adjustments
 *    (CKD, CLD, age, weight band). Those stay in the medicines table.
 *
 * `splitMedicationBadges` is used by the UI to draw pills; `lintManagementSequence` is used by
 * scripts/lint-management-sequences.ts to check stored topics. Stored text is the plain badge string.
 */

export const MEDICATION_BADGE_FIELDS = ["drug", "dose", "route", "frequency", "duration"] as const;

export type MedicationBadge = { drug: string; dose: string; route: string; frequency: string; duration: string };

export type BadgeSegment = { kind: "text"; text: string } | { kind: "badge"; badge: MedicationBadge; raw: string };

const FIELD = String.raw`([^\[\]|]+?)`;
const BADGE_SOURCE = String.raw`\[💊\s*${FIELD}\s*\|\s*${FIELD}\s*\|\s*${FIELD}\s*\|\s*${FIELD}\s*\|\s*${FIELD}\s*\]`;
/** Any opening of a badge, well formed or not: used to find malformed ones. */
const BADGE_OPEN = /\[\s*💊/gu;

const PLACEHOLDER_FIELD = /^(?:n\/?a|none|nil|nan|tbc|tbd|unknown|not (?:stated|specified|applicable|available)|as (?:directed|needed|required|per .*)|per (?:local|hospital|unit|protocol|guideline|formulary).*|see .*|[-–—.?]+)$/i;
const DEFERRAL = /\b(?:local (?:guideline|policy|protocol)|hospital (?:protocol|policy|formulary)|formulary|check (?:the )?(?:bnf|label))\b/i;

export function formatMedicationBadge(badge: MedicationBadge): string {
  const fields = MEDICATION_BADGE_FIELDS.map((key) => badge[key].replace(/[\[\]|]/g, " ").replace(/\s+/g, " ").trim());
  const empty = fields.findIndex((value) => !value);
  if (empty >= 0) throw new Error(`Medication badge is missing ${MEDICATION_BADGE_FIELDS[empty]}.`);
  return `[💊 ${fields.join(" | ")}]`;
}

/** Splits text into plain runs and parsed badges. Malformed badge text stays as plain text. */
export function splitMedicationBadges(text: string): BadgeSegment[] {
  const segments: BadgeSegment[] = [];
  const pattern = new RegExp(BADGE_SOURCE, "gu");
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ kind: "text", text: text.slice(last, index) });
    const [drug, dose, route, frequency, duration] = match.slice(1).map((value) => value.trim());
    segments.push({ kind: "badge", raw: match[0], badge: { drug, dose, route, frequency, duration } });
    last = index + match[0].length;
  }
  if (last < text.length) segments.push({ kind: "text", text: text.slice(last) });
  return segments;
}

export function extractMedicationBadges(text: string): MedicationBadge[] {
  return splitMedicationBadges(text).flatMap((segment) => (segment.kind === "badge" ? [segment.badge] : []));
}

/** Text with every well-formed badge removed, used to look for drug names written outside a badge. */
export function stripMedicationBadges(text: string): string {
  return splitMedicationBadges(text).map((segment) => (segment.kind === "text" ? segment.text : " ")).join("");
}

export type ManagementStepLike = { id: string; title: string; timeframe: string; actions: string[]; branches?: { condition: string; actions: string[] }[] };

export type SequenceIssue = { severity: "error" | "warn"; where: string; rule: "abcde" | "badge" | "drug-outside-badge" | "exclusion"; message: string; text?: string };

export type LintOptions = {
  /** Acute or initial-emergency topic: the first step must be the ABCDE survey. */
  acute: boolean;
  /** Extra drug names (from the topic's medication plan) that must only appear inside badges. */
  drugNames?: string[];
};

/** Drug words that must not appear outside a badge. Kept short and generic; the topic's own drug names are added per run. */
export const BASE_DRUG_WORDS = [
  "oxygen", "adrenaline", "epinephrine", "noradrenaline", "norepinephrine", "atropine", "amiodarone", "aspirin", "clopidogrel", "ticagrelor",
  "prasugrel", "heparin", "enoxaparin", "alteplase", "tenecteplase", "morphine", "fentanyl", "ketamine", "midazolam", "lorazepam", "diazepam",
  "salbutamol", "ipratropium", "hydrocortisone", "prednisolone", "dexamethasone", "methylprednisolone", "furosemide", "frusemide", "glyceryl trinitrate",
  "nitroglycerin", "labetalol", "hydralazine", "magnesium sulphate", "magnesium sulfate", "calcium gluconate", "calcium chloride", "insulin", "glucagon",
  "dextrose", "sodium chloride", "saline", "crystalloid", "ringer", "ceftriaxone", "cefotaxime", "meropenem", "piperacillin", "gentamicin", "amikacin",
  "vancomycin", "benzylpenicillin", "amoxicillin", "co-amoxiclav", "azithromycin", "doxycycline", "metronidazole", "paracetamol", "ondansetron",
  "naloxone", "flumazenil", "tranexamic acid", "vitamin k", "phytomenadione", "levetiracetam", "phenytoin", "valproate", "thiamine", "oxytocin",
  "carboprost", "misoprostol", "ergometrine", "artesunate", "quinine", "omeprazole", "pantoprazole", "terlipressin", "octreotide", "lactulose", "rifaximin",
];

const EXCLUSION = /\b(?:contra-?indicat\w*|side[- ]effects?|adverse (?:effects?|reactions?|events?)|(?:renal|hepatic|kidney|liver) (?:impairment|failure dosing|dose|adjustment)|dose[- ](?:adjust\w*|reduc\w*|modif\w*|chang\w*)|(?:reduce|halve|lower)(?:d)? (?:the )?dose|CKD|CLD|Child[- ]Pugh|eGFR\s*(?:below|under|[<≤])|(?:avoid|do not give|never give|withhold) (?:in|if|when|for) (?:patients? with )?(?:renal|kidney|liver|hepatic|pregnan\w+|asthma|allerg\w+)|caution (?:in|with|if)|use with caution)\b/i;

/** Phrases that contain a drug word but are not a prescription. */
const BENIGN = /\b(?:oxygen (?:saturations?|requirements?|delivery|demand|levels?|sats?|targets?|cylinders?)|insulin (?:resistance|deficiency|sensitivity|levels?)|serum albumin|albumin levels?|sodium (?:level|concentration|chloride level)|blood glucose|glucose (?:level|monitor\w*|target)|saline lock|heparin[- ]induced)\b/gi;

function escapeForRegex(word: string): string {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function drugWordPattern(words: string[]): RegExp | null {
  const unique = [...new Set(words.map((word) => word.trim().toLowerCase()).filter((word) => word.length >= 4))];
  if (!unique.length) return null;
  return new RegExp(`(?<![\\w-])(?:${unique.sort((a, b) => b.length - a.length).map(escapeForRegex).join("|")})(?![\\w-])`, "i");
}

function lintText(text: string, where: string, pattern: RegExp | null, issues: SequenceIssue[]): void {
  // Malformed badges.
  const opens = [...text.matchAll(BADGE_OPEN)].length;
  const good = splitMedicationBadges(text).filter((segment) => segment.kind === "badge");
  if (opens !== good.length) issues.push({ severity: "error", where, rule: "badge", message: "Badge is malformed: it needs exactly five fields (drug | dose | route | frequency | duration).", text });
  for (const segment of good) {
    if (segment.kind !== "badge") continue;
    for (const key of MEDICATION_BADGE_FIELDS) {
      const value = segment.badge[key];
      if (PLACEHOLDER_FIELD.test(value) || DEFERRAL.test(value)) issues.push({ severity: "error", where, rule: "badge", message: `Badge ${key} is a placeholder or defers elsewhere: "${value}".`, text: segment.raw });
      if (key === "dose" && !/\d/.test(value)) issues.push({ severity: "error", where, rule: "badge", message: `Badge dose has no number: "${value}".`, text: segment.raw });
    }
  }
  const outside = stripMedicationBadges(text).replace(BENIGN, " ");
  if (pattern) {
    const hit = outside.match(pattern);
    if (hit) issues.push({ severity: "error", where, rule: "drug-outside-badge", message: `Drug "${hit[0]}" is written outside a badge.`, text });
  }
  const excluded = outside.match(EXCLUSION);
  if (excluded) issues.push({ severity: "warn", where, rule: "exclusion", message: `Side effect, contraindication or dose adjustment wording ("${excluded[0]}") does not belong in a management sequence.`, text });
}

export function lintManagementSequence(steps: ManagementStepLike[], options: LintOptions): SequenceIssue[] {
  const issues: SequenceIssue[] = [];
  const pattern = drugWordPattern([...BASE_DRUG_WORDS, ...(options.drugNames ?? [])]);
  steps.forEach((step, stepIndex) => {
    const label = `step ${stepIndex + 1} "${step.title}"`;
    // Headings and branch conditions name a drug without room for a dose, so only actions are checked for bare drug names.
    lintText(step.title, `${label} title`, null, issues);
    step.actions.forEach((action, i) => lintText(action, `${label} action ${i + 1}`, pattern, issues));
    step.branches?.forEach((branch, b) => {
      lintText(branch.condition, `${label} branch ${b + 1} condition`, null, issues);
      branch.actions.forEach((action, i) => lintText(action, `${label} branch ${b + 1} action ${i + 1}`, pattern, issues));
    });
  });
  if (options.acute) {
    const first = steps[0];
    const letters = ["Airway", "Breathing", "Circulation", "Disability", "Exposure"];
    if (!first) issues.push({ severity: "error", where: "sequence", rule: "abcde", message: "Sequence has no steps." });
    else {
      if (!/ABCDE/.test(first.title)) issues.push({ severity: "error", where: "step 1", rule: "abcde", message: 'First step title must name the "ABCDE" survey.' });
      const joined = first.actions.join("\n");
      if (!/concurrent/i.test(joined)) issues.push({ severity: "error", where: "step 1", rule: "abcde", message: "First step must say abnormalities are corrected concurrently as they are found." });
      for (const letter of letters) {
        if (!first.actions.some((action) => new RegExp(`^${letter}\\b`).test(action.trim()))) issues.push({ severity: "error", where: "step 1", rule: "abcde", message: `First step has no action starting with "${letter}".` });
      }
    }
  }
  return issues;
}
