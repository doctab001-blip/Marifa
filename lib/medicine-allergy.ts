/**
 * Penicillin-allergy line for every antibiotic, by class, from international guidance (BSACI 2022 drug allergy
 * guideline, NICE CG183, IDSA/AAAAI 2022 practice parameter, BNF, CDC STI 2021 for syphilis).
 * Written from standard reference knowledge; a clinician confirms each line at sign-off, as for the CKD and CLD lines.
 * Display only: shown when the stored medicine has no "Penicillin allergy:" line of its own.
 */
type AllergyRule = readonly [pattern: RegExp, line: string];

const PENICILLINS: readonly AllergyRule[] = [
  [/benzathine|penicillin g benzathine/i, "Contraindicated. Syphilis: doxycycline 100 mg orally twice daily for 14 days (28 days if late latent or unknown duration); in pregnancy, desensitise and give penicillin."],
  [/piperacillin|tazobactam/i, "Contraindicated. Non-severe allergy: ceftazidime or cefepime, plus metronidazole if anaerobic cover is needed. Severe or immediate allergy: meropenem (cross-reactivity about 1%) or aztreonam plus metronidazole, adding vancomycin if Gram-positive cover is needed."],
  [/co-amoxiclav|amoxicillin[\s–-]*(?:with |and |\/)?clavulan/i, "Contraindicated. Non-severe allergy: cefuroxime or ceftriaxone. Severe or immediate allergy: a non-beta-lactam by site, such as doxycycline or levofloxacin for chest infection, or clindamycin plus ciprofloxacin for intra-abdominal or skin infection."],
  [/flucloxacillin|cloxacillin|dicloxacillin|nafcillin|oxacillin/i, "Contraindicated. Use clarithromycin, doxycycline or clindamycin; for severe or MRSA-risk infection use vancomycin or teicoplanin."],
  [/ampicillin/i, "Contraindicated. Non-severe allergy: ceftriaxone. Severe allergy: vancomycin; where Listeria cover is needed, co-trimoxazole."],
  [/benzylpenicillin|penicillin g|crystalline penicillin/i, "Contraindicated. Non-severe allergy: ceftriaxone. Severe allergy: vancomycin, or chloramphenicol for meningitis."],
  [/phenoxymethylpenicillin|penicillin v/i, "Contraindicated. Use clarithromycin or erythromycin (doxycycline in adults and children 12 years and over who are not pregnant)."],
  [/amoxicillin|amoxycillin/i, "Contraindicated. Use clarithromycin, or doxycycline in adults and children 12 years and over who are not pregnant."],
];

const CEPHALOSPORIN = /cef|ceph/i;
const CEPH_LINE: readonly AllergyRule[] = [
  [/cefazolin/i, "Usable after a non-severe penicillin allergy (different side chain; cross-reactivity under 1%). After anaphylaxis to a penicillin or cephalosporin: surgical prophylaxis with clindamycin or vancomycin."],
  [/cefalexin|cephalexin|cefadroxil/i, "Avoid after anaphylaxis or a severe reaction to a penicillin (shares the ampicillin side chain). Use clarithromycin, doxycycline, co-trimoxazole or nitrofurantoin according to the infection."],
  [/ceftazidime/i, "Usable after a non-severe penicillin allergy. Avoid with aztreonam allergy (shared side chain). After anaphylaxis to a beta-lactam: ciprofloxacin plus an aminoglycoside, or meropenem under observation."],
  [/.*/, "Usable after a non-severe penicillin allergy (cross-reactivity under 2% for third-generation agents). After anaphylaxis to a penicillin or cephalosporin, use a non-beta-lactam by site: levofloxacin for pneumonia, ciprofloxacin plus metronidazole for intra-abdominal infection, or vancomycin plus aztreonam for severe sepsis."],
];
const CARBAPENEM_LINE = "Usable in penicillin allergy, including most severe reactions (cross-reactivity about 1%); give the first dose under observation. Avoid only after anaphylaxis to a carbapenem.";
const AZTREONAM_LINE = "Safe in penicillin allergy (no cross-reactivity). Avoid if allergic to ceftazidime (shared side chain).";
const NON_BETA_LACTAM = "Not a beta-lactam: safe to use in penicillin allergy.";

/** The penicillin-allergy line for an antibiotic. Combinations take the line of their most allergy-relevant component. */
export function penicillinAllergyLine(genericName: string): string {
  const name = genericName.toLowerCase();
  for (const [re, line] of PENICILLINS) if (re.test(name) && !/^(?:co-trimoxazole)/.test(name)) return line;
  if (/penem/.test(name)) return CARBAPENEM_LINE;
  if (CEPHALOSPORIN.test(name)) for (const [re, line] of CEPH_LINE) if (re.test(name)) return line;
  if (/aztreonam/.test(name)) return AZTREONAM_LINE;
  return NON_BETA_LACTAM;
}
