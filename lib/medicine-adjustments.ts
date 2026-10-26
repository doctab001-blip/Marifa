/** Display rules for the "adjustments" lines of a medicine: keep the table short and only show lines that carry information. */

const ANTIBIOTIC = /(cillin|cef[a-z]*|ceph[a-z]*|penem|aztreonam|mycin|micin|cycline|floxacin|vancomycin|teicoplanin|linezolid|trimethoprim|co-trimoxazole|metronidazole|nitrofurantoin|fosfomycin|rifamp|isoniazid|pyrazinamide|ethambutol|chloramphenicol|colistin|antibiotic)/i;

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
