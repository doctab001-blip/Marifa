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

/** Regimens in the topic's medicine table that describe the drug named by a badge (best match by name, route and form). */
export function matchRegimens<R extends RegimenLike>(badge: MedicationBadge, regimens: R[]): R[] {
  const key = drugKey(badge.drug);
  const badgeTokens = tokens(badge.drug);
  if (!key && !badgeTokens.length) return [];
  const badgeText = `${badge.drug} ${badge.route}`.toLowerCase();
  const wanted = routeWords(badge.route);
  const scored = regimens
    .map((r) => {
      const regimenTokens = tokens(r.genericName);
      if (!regimenTokens.some((t) => badgeTokens.includes(t))) return { r, score: -Infinity };
      const regimenText = `${r.genericName} ${r.route}`.toLowerCase();
      let score = parts(r.genericName).includes(key) ? 4 : 0;
      if (routeWords(r.route).some((w) => wanted.includes(w))) score += 2;
      for (const word of SPECIFIC) score += badgeText.includes(word) === regimenText.includes(word) ? 1 : -3;
      return { r, score };
    })
    .filter((x) => x.score > -Infinity);
  const best = Math.max(...scored.map((x) => x.score));
  return scored.filter((x) => x.score === best).map((x) => x.r);
}

/** Regimens that no medication badge in any step refers to: only these still need a separate medicines table. */
export function uncoveredRegimens<R extends RegimenLike>(steps: ManagementStepLike[], regimens: R[]): R[] {
  const covered = new Set<R>();
  for (const badge of collectMedicationBadges(steps)) for (const r of matchRegimens(badge, regimens)) covered.add(r);
  return regimens.filter((r) => !covered.has(r));
}
