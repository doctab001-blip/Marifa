import { isEmptyClinicalLine, withoutDeferrals } from "@/lib/clinical-display-text";
import { penicillinAllergyLine } from "@/lib/medicine-allergy";
import { renalHepaticLines } from "@/lib/medicine-renal-hepatic";
/** Display rules for the "adjustments" lines of a medicine: keep the table short and only show lines that carry information. */

const ANTIBIOTIC = /(cillin|amoxiclav|clavulan|cef[a-z]*|ceph[a-z]*|penem|aztreonam|mycin|micin|cycline|floxacin|vancomycin|teicoplanin|linezolid|trimethoprim|co-trimoxazole|metronidazole|nitrofurantoin|fosfomycin|rifamp|isoniazid|pyrazinamide|ethambutol|chloramphenicol|colistin|antibiotic)/i;

export function isAntibiotic(name: string): boolean {
  return ANTIBIOTIC.test(name);
}

/** Placeholder text that says nothing a prescriber can use. */
const EMPTY_LINE = /^(CKD|CLD):\s*(not specified|not stated|not given|not addressed)[^]*$|^Paediatric:\s*(not specified|adult (topic|guideline|workflow);[^]*(outside the scope|not given|not for children))|^Penicillin allergy:\s*not an antibiotic/i;

export function cleanAdjustments(lines: string[], medicineName?: string): string[] {
  return lines.filter((line) => {
    if (EMPTY_LINE.test(line.trim())) return false;
    if (medicineName && /^Penicillin allergy:/i.test(line) && !isAntibiotic(medicineName)) return false;
    return true;
  });
}

export function isEmptyAdjustment(line: string): boolean {
  return /^(CKD|CLD):/i.test(line) && EMPTY_LINE.test(line.trim());
}

/**
 * The adjustment lines a reader sees for one medicine (platform owner rule, 27 Oct 2026): deferral wording removed,
 * and a CKD line, a CLD line and, for antibiotics, a penicillin-allergy line always present. A missing line comes from
 * international reference data (BNF, Renal Drug Handbook, EMA/FDA labels, KDIGO, BSACI). Display only.
 */
export function displayAdjustments(lines: string[] = [], medicineName = ""): string[] {
  const shown = cleanAdjustments(lines.map(withoutDeferrals).filter((line) => !isEmptyClinicalLine(line)), medicineName)
    .filter((line) => !isEmptyAdjustment(line));
  const has = (label: RegExp) => shown.some((line) => label.test(line.trim()));
  const reference = medicineName ? renalHepaticLines(medicineName) : null;
  if (reference && !has(/^CKD\b/i)) shown.push(`CKD: ${withoutDeferrals(reference.ckd)}`);
  if (reference && !has(/^CLD\b/i)) shown.push(`CLD: ${withoutDeferrals(reference.cld)}`);
  if (medicineName && isAntibiotic(medicineName) && !has(/^Penicillin allergy:/i)) shown.push(`Penicillin allergy: ${penicillinAllergyLine(medicineName)}`);
  return shown;
}

/** Contraindication and monitoring lines with deferral wording removed. Display only. */
export function displayLines(lines: string[] = []): string[] {
  return lines.map(withoutDeferrals).filter((line) => !isEmptyClinicalLine(line));
}
