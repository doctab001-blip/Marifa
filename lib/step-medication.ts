import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";
import { collectMedicationBadges, type ManagementStepLike, type MedicationBadge } from "@/lib/management-sequence-format";

/** The parts of a stored regimen that the step tables need. Structural, so any regimen shape fits. */
export type RegimenLike = {
  genericName: string;
  route: string;
  adjustments?: string[];
  contraindications?: string[];
  monitoring?: string[];
  sourceTitle?: string;
  sourceUrl?: string;
  sourceEdition?: string;
};

/** "Adrenaline 1 mg/mL (1:1000)" -> "adrenaline"; "Sodium chloride 0.9% (crystalloid)" -> "sodium chloride". */
export function drugKey(name: string): string {
  return name.toLowerCase().replace(/\([^)]*\)/g, " ").replace(/\b(iv|im|io|oral)\b/g, " ").split(/\d/)[0].replace(/[,;].*$/, "").replace(/\s+/g, " ").trim();
}

/** Short pill label: the drug name without strength or concentration. */
export function shortDrugName(name: string): string {
  const cut = name.replace(/\([^)]*\)/g, " ").split(/\d/)[0].replace(/[,;].*$/, "").replace(/\s+/g, " ").trim();
  return cut || name;
}

const parts = (name: string) => name.split(/\bplus\b|\band\b|\//i).map(drugKey).filter(Boolean);
const ROUTE_WORDS = ["im", "iv", "io", "oral", "nebulis", "inhal", "subcut", "intravenous", "intramuscular"];
const routeWords = (route: string) => ROUTE_WORDS.filter((w) => new RegExp(`\\b${w}`, "i").test(route));
const STOP = new Set(["plus", "with", "oral", "intravenous", "intramuscular", "infusion", "nebulised", "inhaled", "bolus", "dose", "epinephrine"]);
const tokens = (name: string) => (name.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter((t) => !STOP.has(t));
const SPECIFIC = ["nebulis", "inhal", "infusion"];

/** Salt and carrier words: two names that share only these (sodium, chloride, succinate ...) are different medicines. */
const SALTS = new Set(["sodium", "chloride", "hydrochloride", "sulfate", "sulphate", "acetate", "phosphate", "succinate", "citrate", "bitartrate", "maleate", "tartrate", "fumarate", "mesylate", "besilate", "bromide", "acid", "injection", "solution", "tablets", "tablet", "capsules", "ready", "mixed", "diluted", "concentrated", "only"]);
const strengths = (name: string) => new Set((name.match(/\d+(?:\.\d+)?\s*%/g) ?? []).map((x) => x.replace(/\s+/g, "")));
const norm = (name: string) => name.toLowerCase().replace(/\s+/g, " ").trim();

/** How surely a medicine-table name names the badge's drug: 3 same drug, 2 one part of a combination, 1 same principal word, 0 another shared drug word; null for no real overlap. */
function nameTier(badgeDrug: string, genericName: string): number | null {
  const key = drugKey(badgeDrug), regimenKey = drugKey(genericName);
  const bare = (name: string) => norm(name.replace(/\([^)]*\)/g, " ").replace(/\d+(?:\.\d+)?\s*%/g, " "));
  if ((key && key === regimenKey) || bare(badgeDrug) === bare(genericName)) return 3;
  if ((key && parts(genericName).includes(key)) || (regimenKey && parts(badgeDrug).includes(regimenKey))) return 2;
  const a = tokens(badgeDrug).filter((t) => !SALTS.has(t)), b = tokens(genericName).filter((t) => !SALTS.has(t));
  if (a.length && b.length && a[0] === b[0]) return 1;
  return a.some((t) => b.includes(t)) ? 0 : null;
}

/** Regimens in the topic's medicine table that describe the drug named by a badge (best match by name, strength, route and form).
 * An exact name match wins outright. Otherwise only the closest names are kept, a different stated strength (0.9% versus 3%)
 * rules a row out, and names sharing only salt words (sodium chloride versus diatrizoate sodium) never match. */
export function matchRegimens<R extends RegimenLike>(badge: MedicationBadge, regimens: R[]): R[] {
  if (!badge.drug.trim()) return [];
  const exact = regimens.filter((r) => norm(r.genericName) === norm(badge.drug));
  const wantedStrength = strengths(badge.drug);
  const tiered = exact.length ? exact.map((r) => ({ r, tier: 9 })) : regimens
    .map((r) => ({ r, tier: nameTier(badge.drug, r.genericName) }))
    .filter((x): x is { r: R; tier: number } => x.tier !== null)
    .filter(({ r }) => {
      if (!wantedStrength.size) return true;
      const own = strengths(r.genericName);
      return !own.size || [...own].some((x) => wantedStrength.has(x));
    });
  if (!tiered.length) return [];
  const top = Math.max(...tiered.map((x) => x.tier));
  const badgeText = `${badge.drug} ${badge.route}`.toLowerCase();
  const wanted = routeWords(badge.route);
  const scored = tiered.filter((x) => x.tier === top).map(({ r }) => {
    const regimenText = `${r.genericName} ${r.route}`.toLowerCase();
    let score = routeWords(r.route).some((w) => wanted.includes(w)) ? 2 : 0;
    for (const word of SPECIFIC) score += badgeText.includes(word) === regimenText.includes(word) ? 1 : -3;
    return { r, score };
  });
  const best = Math.max(...scored.map((x) => x.score));
  return scored.filter((x) => x.score === best).map((x) => x.r);
}

/** Regimens that no medication badge in any step refers to: only these still need a separate medicines table. */
export function uncoveredRegimens<R extends RegimenLike>(steps: ManagementStepLike[], regimens: R[]): R[] {
  const covered = new Set<R>();
  for (const step of linkStepMedicines(steps, regimens)) for (const { regimen } of step.medicines ?? []) covered.add(regimen as R);
  for (const badge of collectMedicationBadges(steps)) for (const r of matchRegimens(badge, regimens)) covered.add(r);
  return regimens.filter((r) => !covered.has(r));
}

/* ── Automatic step medicines (display only) ─────────────────────────────────────────────────────────────
 * Topics written before the badge format name their drugs in plain step text. For those topics the page
 * finds each drug of the topic's own medicine table where a step mentions it, shows the name in bold and
 * lists that medicine (dose, route, frequency, duration from the medicine table) in the table under the
 * first step that mentions it. Stored content is never changed. Topics that already carry badges are
 * shown exactly as written.
 */

/** Marks a drug name in step text so the page can draw it in bold. Private-use characters: never in stored text. */
export const DRUG_MARK_OPEN = "";
export const DRUG_MARK_CLOSE = "";
const MARKED = /([^]*)/g;

export type DoseRegimen = RegimenLike & { dose: string; frequency: string; duration: string };
export type LinkedStep<S extends ManagementStepLike = ManagementStepLike> = S & { medicines?: { badge: MedicationBadge; regimen: RegimenLike }[] };

/** Phrases that contain a drug word but are not about giving it. */
const NOT_A_PRESCRIPTION = /\b(?:oxygen (?:saturations?|requirements?|delivery|demand|levels?|sats?|targets?|cylinders?)|insulin (?:resistance|deficiency|sensitivity|levels?)|albumin (?:levels?)|serum \w+|sodium (?:levels?|concentration)|blood glucose|glucose (?:levels?|monitor\w*|targets?)|saline lock|heparin[- ]induced|\w+ (?:levels?|toxicity|allergy|allergic|overdose|poisoning)|(?:capillary|plasma|fasting|random|serum|urine|urinary|point-of-care|bedside) (?:glucose|ketones?|calcium|potassium|sodium|magnesium|iron|lithium|digoxin|paracetamol)|(?:glucose|ketones?|calcium|potassium|sodium|magnesium|iron|folate|vitamin [a-z]\d*|lithium|digoxin|paracetamol|insulin) (?:deficiency|studies|status|stores|concentrations?|below|above|under|over|is|was|of|between|target|<|>|≤|≥|\d+(?:\.\d+)?\s*(?:mmol|mg\/dl|micromol|µmol|mcg\/l|ng\/ml)))(?![\w])/gi;

/** Lower case with every dash as "-"; keeps the length so matches map back onto the text as written. */
const normalise = (text: string) => text.toLowerCase().replace(/[‐-―]/g, "-");
const escape = (word: string) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Words and phrases that describe a form, route, class of fluid or disease rather than naming one medicine. */
const NOT_A_NAME = new Set([
  "basal", "bolus", "rectal", "oral", "intramuscular", "intravenous", "subcutaneous", "intradermal", "intracavernosal", "nebulised", "nebulized", "infusion",
  "topical", "depot", "chewable", "soluble", "live", "packed", "equine", "same", "fixed", "fixed combination", "juice", "electrolytes", "minerals", "silver",
  "hypertonic", "lactated", "ringer", "unfractionated", "hepatitis", "influenza", "herpes", "varicella", "rehydration", "fluid restriction", "plasma exchange",
  "low-osmolarity", "heat-stable", "ready-mixed", "rapid-acting carbohydrate", "long-acting carbohydrate", "isophane", "aspart", "sugar", "premixed", "regular",
  "short", "long", "human", "normal", "tablet", "tablets", "capsule", "capsules", "injection", "solution", "syrup", "cream", "ointment", "gel", "drops", "spray",
  "vaccine", "dose", "loading", "maintenance", "adult", "child", "children", "infant", "standard", "alternative", "first-line", "second-line",
]);

const usableName = (name: string) => {
  const n = name.trim();
  if (n.length < 4 || NOT_A_NAME.has(n)) return false;
  if ((n.match(/\(/g) ?? []).length !== (n.match(/\)/g) ?? []).length) return false;
  if (/^[\d\W]/.test(n)) return false;
  return !n.split(/\s+/).every((word) => NOT_A_NAME.has(word));
};

/** Names a step's text may use for one regimen: the generic name, each part of a combination and any bracketed alias. */
function regimenNames(regimen: RegimenLike): string[] {
  const name = normalise(regimen.genericName);
  const names = new Set<string>();
  names.add(drugKey(name));
  for (const part of name.replace(/\([^)]*\)/g, " ").split(/\bplus\b|\band\b|\bwith\b|\bor\b|\/|\+|,/)) names.add(drugKey(part));
  for (const [, alias] of name.matchAll(/\(([a-z][a-z\s-]{3,30})\)/g)) names.add(alias.trim());
  for (const n of [...names]) { if (n.includes("sulf")) names.add(n.replace(/sulf/g, "sulph")); if (n.includes("sulph")) names.add(n.replace(/sulph/g, "sulf")); }
  return [...names].filter(usableName);
}

const field = (text: unknown) => withoutInlineSourceLocators(String(text ?? "")).replace(/[\[\]|]/g, " ").replace(/\s+/g, " ").trim();

/**
 * Display copy of the steps with each mentioned medicine marked in bold and, on the first step that
 * mentions it, the medicine's full row from the topic's medicine table. A topic that already has badges
 * is returned unchanged.
 */
export function linkStepMedicines<S extends ManagementStepLike>(steps: S[], regimens: RegimenLike[]): LinkedStep<S>[] {
  if (!regimens.length || collectMedicationBadges(steps).length) return steps;
  const patterns = regimens.map((regimen) => {
    const names = regimenNames(regimen).sort((a, b) => b.length - a.length);
    return { regimen, pattern: names.length ? new RegExp(`(?<![\\w-])(?:${names.map(escape).join("|")})(?![\\w-])`, "gi") : null };
  }).filter((p) => p.pattern);
  const anyName = patterns.length ? new RegExp(patterns.map((p) => p.pattern!.source).join("|"), "gi") : null;
  const placed = new Set<RegimenLike>();

  const mentions = (text: string) => {
    const plain = normalise(text).replace(NOT_A_PRESCRIPTION, (m) => " ".repeat(m.length));
    return patterns.filter((p) => { p.pattern!.lastIndex = 0; return p.pattern!.test(plain); }).map((p) => p.regimen);
  };
  const mark = (text: string) => {
    if (!anyName) return text;
    const plain = normalise(text).replace(NOT_A_PRESCRIPTION, (m) => " ".repeat(m.length));
    let out = "";
    let last = 0;
    anyName.lastIndex = 0;
    for (const match of plain.matchAll(anyName)) {
      const start = match.index ?? 0;
      out += text.slice(last, start) + DRUG_MARK_OPEN + text.slice(start, start + match[0].length) + DRUG_MARK_CLOSE;
      last = start + match[0].length;
    }
    return out + text.slice(last);
  };

  return steps.map((step) => {
    const texts = [...step.actions, ...(step.branches ?? []).flatMap((b) => b.actions)];
    const found = [...new Set(texts.flatMap(mentions))].filter((r) => !placed.has(r));
    found.forEach((r) => placed.add(r));
    const medicines = found
      .filter((r): r is DoseRegimen => Boolean((r as DoseRegimen).dose))
      .map((regimen) => ({ regimen, badge: { drug: field(regimen.genericName), dose: field(regimen.dose), route: field(regimen.route), frequency: field(regimen.frequency), duration: field(regimen.duration) } }));
    return {
      ...step,
      actions: step.actions.map(mark),
      ...(step.branches ? { branches: step.branches.map((b) => ({ ...b, actions: b.actions.map(mark) })) } : {}),
      medicines,
    };
  });
}

/** Splits text carrying drug marks into plain and bold parts. */
export function splitDrugMarks(text: string): { bold: boolean; text: string }[] {
  const out: { bold: boolean; text: string }[] = [];
  let last = 0;
  for (const match of text.matchAll(MARKED)) {
    const start = match.index ?? 0;
    if (start > last) out.push({ bold: false, text: text.slice(last, start) });
    out.push({ bold: true, text: match[1] });
    last = start + match[0].length;
  }
  if (last < text.length) out.push({ bold: false, text: text.slice(last) });
  return out;
}
