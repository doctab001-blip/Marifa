import type { CalculatorLink } from "@/types/diagnosisEngine";

/**
 * Marifa medical calculators that help rule a condition in or out, keyed by diagnostic profile key.
 * Ids must exist in lib/clinical-calculators (checked by tests/diagnosisEngine.test.ts).
 */
const CALCULATORS: Record<string, Array<[id: string, title: string]>> = {
  "pulmonary-embolism": [["wells-pe", "Wells' PE score"], ["perc", "PERC rule"], ["wells-dvt", "Wells' DVT score"]],
  "acute-coronary-syndrome": [["heart-score", "HEART score"]],
  "community-acquired-pneumonia": [["curb-65", "CURB-65"]],
  sepsis: [["qsofa-score", "qSOFA"], ["news2", "NEWS2"], ["qsofa", "SOFA-2"]],
  "neutropenic-sepsis": [["news2", "NEWS2"], ["qsofa-score", "qSOFA"]],
  "upper-gi-bleed": [["glasgow-blatchford", "Glasgow-Blatchford score"]],
  "atrial-fibrillation": [["cha2ds2-vasc", "CHA₂DS₂-VASc"], ["has-bled", "HAS-BLED"]],
  "diabetic-ketoacidosis": [["anion-gap", "Anion gap"]],
  hypercalcaemia: [["corrected-calcium", "Corrected calcium"]],
  "hepatic-encephalopathy": [["child-pugh", "Child-Pugh"], ["meld-na", "MELD-Na"], ["glasgow-coma-scale", "Glasgow Coma Scale"]],
  "bacterial-meningitis": [["glasgow-coma-scale", "Glasgow Coma Scale"]],
  "subarachnoid-haemorrhage": [["glasgow-coma-scale", "Glasgow Coma Scale"]],
  "acute-ischaemic-stroke": [["glasgow-coma-scale", "Glasgow Coma Scale"]],
  "status-epilepticus": [["glasgow-coma-scale", "Glasgow Coma Scale"]],
  delirium: [["glasgow-coma-scale", "Glasgow Coma Scale"], ["news2", "NEWS2"]],
  "aecopd": [["news2", "NEWS2"]],
};

export const calculatorHref = (id: string) => `/dashboard/medical-calculators?calc=${encodeURIComponent(id)}`;

export function calculatorsFor(profileKey: string): CalculatorLink[] {
  return (CALCULATORS[profileKey] ?? []).map(([id, title]) => ({ id, title, href: calculatorHref(id) }));
}

/** Every calculator id referenced (for validation). */
export const referencedCalculatorIds = () => [...new Set(Object.values(CALCULATORS).flat().map(([id]) => id))];
