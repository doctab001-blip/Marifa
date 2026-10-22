/**
 * Reads values typed into a finding ("HR 124", "SpO2 88%", "BP 82/50", "K 6.9", "Temp 39.4") and returns the
 * clinical terms they imply ("tachycardia", "hypoxia", "hypotension"…). Adult reference thresholds; values that
 * fall in the normal range add nothing. Units are inferred where the scale is unambiguous (mg/dL vs mmol/L glucose,
 * g/L vs g/dL haemoglobin, °F vs °C).
 */

type Rule = { pattern: RegExp; interpret: (values: number[]) => string[] };

const NUM = String.raw`(-?\d+(?:\.\d+)?)`;
const SEP = String.raw`\s*(?:[:=]|is|of|at|was)?\s*`;
const label = (names: string) => new RegExp(String.raw`\b(?:${names})${SEP}${NUM}`, "i");

const RULES: Rule[] = [
  { pattern: label("hr|heart rate|pulse rate|pulse|p"), interpret: ([v]) => (v > 100 ? ["tachycardia"] : v < 50 ? ["bradycardia"] : []) },
  { pattern: label("rr|resp(?:iratory)? rate|respirations"), interpret: ([v]) => (v >= 22 ? ["tachypnoea"] : []) },
  { pattern: new RegExp(String.raw`\b(?:spo2|sp02|sats?|saturations?|o2 sat(?:uration)?s?|oxygen saturations?)${SEP}${NUM}`, "i"), interpret: ([v]) => (v <= 92 ? ["hypoxia"] : []) },
  {
    pattern: new RegExp(String.raw`\b(?:bp|blood pressure)${SEP}${NUM}\s*/\s*${NUM}`, "i"),
    interpret: ([s, d]) => [
      ...(s < 90 ? ["hypotension"] : []),
      ...(s >= 160 || d >= 110 ? ["severe hypertension"] : []),
    ],
  },
  { pattern: label("sbp|systolic(?: bp)?"), interpret: ([s]) => (s < 90 ? ["hypotension"] : s >= 160 ? ["severe hypertension"] : []) },
  {
    pattern: label("temp(?:erature)?|t"),
    interpret: ([v]) => {
      const celsius = v > 45 ? ((v - 32) * 5) / 9 : v;
      if (celsius >= 40) return ["fever", "hyperpyrexia"];
      if (celsius >= 38) return ["fever"];
      if (celsius < 35) return ["hypothermia"];
      return [];
    },
  },
  {
    pattern: label("glucose|blood glucose|bg|cbg|bm|rbs|sugar"),
    interpret: ([v]) => {
      const mmol = v > 40 ? v / 18 : v;
      if (mmol < 4) return ["hypoglycaemia", "low glucose"];
      if (mmol >= 11) return ["hyperglycaemia", "raised glucose"];
      return ["normal glucose"];
    },
  },
  { pattern: label("lactate|lac"), interpret: ([v]) => (v >= 2 ? ["raised lactate"] : []) },
  { pattern: label("k\\+?|potassium"), interpret: ([v]) => (v >= 5.5 ? ["hyperkalaemia", "raised potassium"] : v < 3.5 ? ["hypokalaemia"] : []) },
  { pattern: label("na\\+?|sodium"), interpret: ([v]) => (v < 130 ? ["hyponatraemia", "low sodium"] : v > 150 ? ["hypernatraemia"] : []) },
  {
    pattern: label("hb|haemoglobin|hemoglobin|hgb"),
    interpret: ([v]) => {
      const gdl = v > 25 ? v / 10 : v;
      return gdl < 10 ? ["low haemoglobin", "anaemia"] : [];
    },
  },
  { pattern: label("wbc|wcc|white cells?|white cell count|tlc"), interpret: ([v]) => { const n = v > 500 ? v / 1000 : v; return n > 11 ? ["leukocytosis"] : n < 4 ? ["leukopenia"] : []; } },
  { pattern: label("neut(?:rophil)?s?|anc"), interpret: ([v]) => (v < 0.5 || (v > 50 && v < 500) ? ["neutropenia"] : []) },
  { pattern: label("plt|platelets?"), interpret: ([v]) => { const n = v > 2000 ? v / 1000 : v; return n < 150 ? ["thrombocytopenia", "low platelets"] : []; } },
  { pattern: label("crp"), interpret: ([v]) => (v > 10 ? ["raised crp"] : []) },
  { pattern: label("ph"), interpret: ([v]) => (v < 7.35 && v > 6 ? ["low ph", "acidaemia"] : []) },
  { pattern: label("hco3|bicarb(?:onate)?"), interpret: ([v]) => (v < 18 ? ["low bicarbonate"] : []) },
  { pattern: label("ketones?|bhb|beta hydroxybutyrate"), interpret: ([v]) => (v >= 3 ? ["raised ketones"] : []) },
  { pattern: label("(?:adj(?:usted)? |corrected )?(?:ca|calcium)"), interpret: ([v]) => (v > 2.65 && v < 5 ? ["hypercalcaemia"] : v < 2.1 && v > 0.5 ? ["hypocalcaemia"] : []) },
  { pattern: label("osmolality|osm"), interpret: ([v]) => (v > 320 ? ["raised osmolality"] : v < 275 ? ["low osmolality"] : []) },
  { pattern: label("gcs"), interpret: ([v]) => (v < 15 && v >= 3 ? ["low gcs"] : []) },
  { pattern: label("pef|pefr|peak flow"), interpret: ([v]) => (v > 0 && v < 50 && v <= 100 ? ["low peak flow"] : []) },
  { pattern: label("lipase|amylase"), interpret: ([v]) => (v > 300 ? ["raised lipase"] : []) },
  { pattern: label("d[- ]?dimer"), interpret: ([v]) => (v >= 500 || (v >= 0.5 && v < 20) ? ["raised d dimer"] : []) },
];

/** Clinical terms implied by any values in the text (deduplicated). */
export function interpretValues(text: string): string[] {
  const found = new Set<string>();
  for (const clause of text.split(/[,;]/)) {
    for (const rule of RULES) {
      const match = rule.pattern.exec(clause);
      if (!match) continue;
      const values = match.slice(1).filter((value) => value !== undefined).map(Number);
      if (values.some((value) => Number.isNaN(value))) continue;
      for (const term of rule.interpret(values)) found.add(term);
    }
  }
  return [...found];
}
