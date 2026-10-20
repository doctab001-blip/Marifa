import type { CSSProperties } from "react";

export const medicalSpecialities = [
  { name: "Internal Medicine", terms: ["internal medicine", "general medicine"] },
  { name: "Cardiology", terms: ["cardiology", "cardiac"] },
  { name: "Pulmonology", terms: ["pulmonology", "respiratory", "pulmonary"] },
  { name: "Gastroenterology", terms: ["gastroenterology", "gastrointestinal", "hepatology"] },
  { name: "Nephrology", terms: ["nephrology", "renal"] },
  { name: "Endocrinology", terms: ["endocrinology", "diabetes"] },
  { name: "Infectious Diseases", terms: ["infectious diseases", "infection"] },
  { name: "Neurology", terms: ["neurology", "neurological"] },
  { name: "General Surgery", terms: ["general surgery", "bariatric", "colorectal surgery", "endocrine surgery", "breast surgery"] },
  { name: "Acute Care Surgery", terms: ["acute care surgery", "trauma surgery"] },
  { name: "Obstetrics and Gynecology", terms: ["obstetrics", "gynaecology", "gynecology", "maternal-fetal"] },
  { name: "Paediatrics", terms: ["paediatric", "pediatric", "paediatrics", "pediatrics"] },
  { name: "Neonatology", terms: ["neonatology", "neonatal"] },
  { name: "Emergency Medicine", terms: ["emergency medicine", "emergency"] },
  { name: "Orthopedics and Trauma", terms: ["orthopedics", "orthopaedics", "trauma"] },
  { name: "Otolaryngology (ENT)", terms: ["otolaryngology", "ent"] },
  { name: "Ophthalmology", terms: ["ophthalmology", "ophthalmic"] },
  { name: "Dermatology", terms: ["dermatology", "dermatological"] },
  { name: "Psychiatry", terms: ["psychiatry", "psychiatric"] },
  { name: "Urology", terms: ["urology", "urological"] },
  { name: "Anaesthesiology", terms: ["anaesthesiology", "anesthesiology", "anaesthesia", "anesthesia"] },
  // Added so that every topic lands in a named speciality instead of a one-off free-text label.
  { name: "Primary Care", terms: ["primary care", "family medicine", "general practice"] },
  { name: "Haematology", terms: ["haematology", "hematology"] },
  { name: "Oncology", terms: ["oncology"] },
  { name: "Rheumatology", terms: ["rheumatology"] },
  { name: "Geriatric Medicine", terms: ["geriatric medicine", "geriatrics", "geriatric"] },
  { name: "Palliative Medicine", terms: ["palliative medicine", "palliative"] },
  { name: "Critical Care Medicine", terms: ["critical care", "intensive care"] },
  { name: "Toxicology", terms: ["toxicology"] },
  { name: "Vascular Surgery", terms: ["vascular surgery", "vascular"] },
  { name: "Neurosurgery", terms: ["neurosurgery"] },
  { name: "Allergy and Immunology", terms: ["allergy and immunology", "allergy", "immunology"] },
  { name: "Public Health", terms: ["public health"] },
] as const;

/** Shown for a topic whose speciality is empty. Always listed last. */
export const UNASSIGNED_SPECIALITY = "Unassigned";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Whole-word match, so the short term "ent" (ENT) cannot match inside "Preventive" or "Management".
function findTerm(haystack: string, term: string) {
  const match = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(term)}(?![\\p{L}\\p{N}])`, "u").exec(haystack);
  return match ? match.index : -1;
}

export function hasMedicalSpeciality(value: string, selected: string) {
  const option = medicalSpecialities.find((item) => item.name === selected);
  const haystack = value.toLocaleLowerCase();
  return Boolean(option && option.terms.some((term) => findTerm(haystack, term) >= 0));
}

export function inferMedicalSpecialityTags(value: string) {
  const text = value.toLocaleLowerCase();
  return medicalSpecialities
    .map(({ name, terms }) => ({ name, position: Math.min(...terms.map((term) => findTerm(text, term)).filter((position) => position >= 0)) }))
    .filter(({ position }) => Number.isFinite(position))
    .sort((a, b) => a.position - b.position)
    .map(({ name }) => name);
}

const splitSegments = (text: string) => text.split(/\s*(?:\/|,|;|\band\b)\s*/i).map((segment) => segment.trim()).filter(Boolean);

/**
 * The single speciality a topic is filed under, used by every list, filter and side-panel group so they
 * always agree. The first speciality named in the topic's free-text `specialty` wins (authors put the lead
 * speciality first, e.g. "Nephrology / Emergency Medicine" is a Nephrology topic). `fallback` is only used
 * when the text names no catalogue speciality, for example a speciality picked from the shared catalogue.
 * Display only: the stored value is never changed.
 */
export function canonicalSpeciality(value: string | null | undefined, fallback?: string | null): string {
  const text = (value ?? "").trim();
  const alternative = (fallback ?? "").trim();
  const tag = (text && inferMedicalSpecialityTags(text)[0]) || (alternative && inferMedicalSpecialityTags(alternative)[0]);
  if (tag) return tag;
  const label = splitSegments(text || alternative)[0];
  return label ?? UNASSIGNED_SPECIALITY;
}

/**
 * Display-only summary of a topic's free-text `specialty` (e.g. "Endocrinology / Podiatry / Vascular Surgery").
 * Returns the primary speciality for a compact chip and how many further ones were left out. The stored
 * value is never changed. Catalogue matches win; otherwise the first "/", "," or " and " segment is used.
 */
export function summarizeSpecialty(value: string): { primary: string; extra: number } {
  const text = (value ?? "").trim();
  if (!text) return { primary: UNASSIGNED_SPECIALITY, extra: 0 };
  const tags = inferMedicalSpecialityTags(text);
  const segments = splitSegments(text);
  const primary = canonicalSpeciality(text);
  const extra = Math.max(0, Math.max(tags.length, segments.length) - 1);
  return { primary, extra };
}

export type SpecialityGroup<T> = { speciality: string; items: T[] };

/**
 * Splits items into one group per speciality, A to Z with "Unassigned" last. Items keep the order they were
 * given in, so the caller's sort (newest, A-Z, most viewed...) still applies inside every group.
 */
export function groupBySpeciality<T>(items: readonly T[], specialityOf: (item: T) => string): SpecialityGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = specialityOf(item) || UNASSIGNED_SPECIALITY;
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  return [...groups]
    .map(([speciality, list]) => ({ speciality, items: list }))
    .sort((a, b) => Number(a.speciality === UNASSIGNED_SPECIALITY) - Number(b.speciality === UNASSIGNED_SPECIALITY) || a.speciality.localeCompare(b.speciality, "en", { sensitivity: "base" }));
}

/** Distinct specialities with how many items fall in each, largest first. Feeds every Speciality filter. */
export function specialityCounts<T>(items: readonly T[], specialityOf: (item: T) => string): { value: string; count: number }[] {
  return groupBySpeciality(items, specialityOf)
    .map(({ speciality, items: list }) => ({ value: speciality, count: list.length }))
    .sort((a, b) => Number(a.value === UNASSIGNED_SPECIALITY) - Number(b.value === UNASSIGNED_SPECIALITY) || b.count - a.count || a.value.localeCompare(b.value));
}

/**
 * A fixed colour per speciality so the same speciality looks the same on every page. Catalogue names get
 * evenly spread hues (golden-angle steps keep neighbours apart); other labels get a stable hash hue;
 * "Unassigned" is grey. Used through the `data-spec` attribute and the --spec-hue / --spec-sat CSS variables.
 */
export function specialityHue(name: string): number {
  const index = medicalSpecialities.findIndex((item) => item.name === name);
  if (index >= 0) return Math.round((index * 137.508 + 14) % 360);
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 360;
}

export function specialityStyle(name: string): CSSProperties {
  return { "--spec-hue": specialityHue(name), "--spec-sat": name === UNASSIGNED_SPECIALITY ? "0%" : "62%" } as CSSProperties;
}
