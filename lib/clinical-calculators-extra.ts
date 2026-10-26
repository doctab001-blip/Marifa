/* eslint-disable @typescript-eslint/no-explicit-any --
 * Calculator answers are heterogeneous (strings, arrays, numeric objects); every reader below guards its value.
 * New calculators (MDCalc-style): each defines inputs, a pure calculate(), interpretation bands, pearls,
 * pitfalls, the formula, facts and figures, and references.
 */
import type { CalculatorInput, CalculatorNextSteps, ClinicalCalculatorSchema, LegacyResult, RiskTone, SecondaryResult } from "./clinical-calculators";

export type Band = [min: number | undefined, range: string, label: string, tone: RiskTone, summary: string, steps: string[]];
type UnitSpec = [value: string, label: string, multiplier?: number, offset?: number];

export interface Spec {
  id: string; name: string; shortName: string; specialty: string; description: string; whyUseIt: string; when?: string;
  inputs: any[]; calculate: (inputs: Record<string, any>) => number | string; bands: Band[];
  interpret?: (score: number, inputs: Record<string, any>) => LegacyResult | undefined;
  secondary?: (inputs: Record<string, any>) => SecondaryResult[];
  isComplete?: (inputs: Record<string, any>) => boolean;
  unit?: string; decimals?: number; pearls: string[]; pitfalls: string[]; formula: string[]; facts?: Array<{ label: string; value: string }>;
  references: Array<[string, string]>; popularity: number; keywords?: string[]; isNew?: boolean;
  nextSteps?: CalculatorNextSteps; evidenceAppraisal?: string[]; creator?: { name: string; bio: string[] }; related?: string[];
}

const COLOR: Record<RiskTone, string> = { low: "bg-emerald-50 text-emerald-800", moderate: "bg-yellow-50 text-yellow-800", high: "bg-red-50 text-red-800" };
export const opt = (value: string, label: string, points: number, description?: string) => ({ value, label, points, description });
export const yn = (id: string, label: string, points = 1, help?: string) => ({ id, label, help, type: "binary", options: [opt("no", "No", 0), opt("yes", "Yes", points)] });
export const choice = (id: string, label: string, options: Array<[string, string, number]>, help?: string) => ({ id, label, help, type: "binary", options: options.map(([v, l, p]) => opt(v, l, p)) });
export const numeric = (id: string, label: string, units: UnitSpec[], extra: { min?: number; max?: number; help?: string; required?: boolean } = {}) => ({
  id, label, type: "numeric", ...extra,
  units: units.map(([value, unitLabel, canonicalMultiplier, canonicalOffset]) => ({ value, label: unitLabel, canonicalMultiplier, canonicalOffset })),
});
export const val = (i: Record<string, any>, k: string): number | undefined => { const v = i?.[k]; const n = typeof v === "object" && v !== null ? v.value : v; return typeof n === "number" && Number.isFinite(n) ? n : undefined; };
export const isYes = (i: Record<string, any>, k: string) => i?.[k] === "yes";
const round = (n: number, dp: number) => { const f = 10 ** dp; return Math.round((n + Number.EPSILON) * f) / f; };

export function build(s: Spec): ClinicalCalculatorSchema {
  const decimals = s.decimals ?? 0;
  const results: LegacyResult[] = s.bands.map(([min, range, label, tone, summary, steps], n) => {
    const next = s.bands[n + 1]?.[0];
    return { id: `${s.id}-${n}`, label, tone, range, match: { minScore: min, maxScore: next === undefined ? undefined : next - 1 / 10 ** (decimals + 3) }, summary, management: steps };
  });
  const tiers = results.map((r) => ({ min: r.match.minScore, max: r.match.maxScore, riskLabel: r.label, managementAdvice: r.management[0] ?? r.summary, colorCode: COLOR[r.tone], tone: r.tone, label: r.label, summary: r.summary, management: r.management }));
  const inputs = s.inputs as CalculatorInput[];
  const questions = s.inputs.map((q: any) => ({ ...q, type: q.type === "binary" ? "single-select" : q.type === "numeric" ? "number" : q.type }));
  return {
    id: s.id, name: s.name, shortName: s.shortName, specialty: s.specialty, description: s.description, inputs,
    calculate: (i) => { const v = s.calculate(i); return typeof v === "number" ? (Number.isFinite(v) ? round(v, decimals) : 0) : v; },
    tiers, pearls: s.pearls, whyUseIt: s.whyUseIt, references: s.references.map(([citation, url]) => ({ citation, url })),
    shortTitle: s.shortName, title: s.name, objective: s.description, indication: s.when ?? s.whyUseIt, scoreLabel: s.shortName,
    questions: questions as any, results,
    evidence: { formula: s.formula, validation: s.whyUseIt, limitations: s.pitfalls, sources: s.references.map(([label, url]) => ({ label, detail: "", url })) },
    interpret: s.interpret, secondary: s.secondary, isComplete: s.isComplete, unit: s.unit, decimals, formula: s.formula, pitfalls: s.pitfalls, limitations: s.pitfalls,
    facts: s.facts, popularity: s.popularity, isNew: s.isNew ?? true, keywords: s.keywords ?? [], lastReviewed: "19 Oct 2026",
    nextSteps: s.nextSteps, evidenceAppraisal: s.evidenceAppraisal, creator: s.creator, related: s.related,
  };
}

const LINK = {
  nice158: "https://www.nice.org.uk/guidance/ng158",
  news2: "https://www.rcp.ac.uk/improving-care/resources/national-early-warning-score-news-2/",
};

/* 1. Wells DVT ------------------------------------------------------------------------------------------------ */
const wellsDvt = build({
  id: "wells-dvt", name: "Wells' Criteria for Deep Vein Thrombosis", shortName: "Wells' DVT", specialty: "Emergency medicine",
  description: "Estimate the pre-test probability of lower-limb deep vein thrombosis.",
  whyUseIt: "Use in outpatients and ED patients with suspected first lower-limb DVT to choose between D-dimer and ultrasound.",
  popularity: 11, keywords: ["dvt", "vte", "thrombosis", "leg swelling"], related: ["wells-pe", "perc"],
  inputs: [
    yn("cancer", "Active cancer (treatment ongoing, within 6 months, or palliative)"),
    yn("paralysis", "Paralysis, paresis or recent plaster immobilisation of the lower extremity"),
    yn("bedridden", "Recently bedridden ≥3 days, or major surgery within 12 weeks requiring general or regional anaesthesia"),
    yn("tenderness", "Localised tenderness along the distribution of the deep venous system"),
    yn("leg-swollen", "Entire leg swollen"),
    yn("calf-swelling", "Calf swelling ≥3 cm compared with the asymptomatic leg", 1, "Measured 10 cm below the tibial tuberosity."),
    yn("pitting", "Pitting oedema confined to the symptomatic leg"),
    yn("collaterals", "Collateral superficial veins (non-varicose)"),
    yn("prior-dvt", "Previously documented DVT"),
    yn("alt-dx", "Alternative diagnosis at least as likely as DVT", -2, "For example cellulitis, ruptured Baker cyst, muscle injury."),
  ],
  calculate: (i) => ["cancer", "paralysis", "bedridden", "tenderness", "leg-swollen", "calf-swelling", "pitting", "collaterals", "prior-dvt"].reduce((t, k) => t + (isYes(i, k) ? 1 : 0), 0) + (isYes(i, "alt-dx") ? -2 : 0),
  bands: [
    [undefined, "≤0", "DVT unlikely (low probability)", "low", "Low pre-test probability (about 3% in the derivation cohort).", ["Two-level Wells ≤1 (DVT unlikely): send a D-dimer. If negative, DVT is excluded.", "If D-dimer is positive, arrange proximal leg vein ultrasound (within 4 hours, or interim anticoagulation if it will be delayed)."]],
    [1, "1–2", "Moderate probability", "moderate", "Moderate pre-test probability (about 17% in the derivation cohort). On the two-level score, 1 = DVT unlikely and 2 = DVT likely.", ["Score 1 (DVT unlikely): D-dimer first; positive result needs proximal leg vein ultrasound.", "Score 2 (DVT likely): proximal leg vein ultrasound within 4 hours; give interim therapeutic anticoagulation if imaging is delayed and bleeding risk allows."]],
    [3, "≥3", "High probability", "high", "High pre-test probability (about 75% in the derivation cohort).", ["Proximal leg vein ultrasound within 4 hours; give interim therapeutic anticoagulation if imaging is delayed and bleeding risk allows.", "A negative single ultrasound does not fully exclude DVT at high probability: repeat in 6 to 8 days or add a D-dimer."]],
  ],
  pearls: ["Score the more symptomatic leg when both legs are affected.", "Subtract 2 points when another diagnosis is at least as likely as DVT.", "Two-level interpretation (NICE NG158): ≤1 unlikely, ≥2 likely."],
  pitfalls: ["Validated for first suspected lower-limb DVT, not for recurrence suspected in a previously affected leg.", "Not validated in pregnancy, upper-limb DVT or patients already anticoagulated for more than 48 hours.", "D-dimer rises with age, pregnancy, cancer, infection and recent surgery; interpret positives accordingly."],
  formula: ["Add 1 point for each of: active cancer, paralysis/paresis/plaster, bedridden ≥3 days or recent major surgery, localised deep-vein tenderness, entire leg swollen, calf swelling ≥3 cm, pitting oedema, collateral superficial veins, previous DVT.", "Subtract 2 points if an alternative diagnosis is at least as likely as DVT."],
  facts: [{ label: "Range", value: "−2 to 9" }, { label: "Derivation prevalence of DVT: low / moderate / high", value: "about 3% / 17% / 75% (Wells 1997)" }, { label: "Two-level cut-off", value: "≤1 DVT unlikely; ≥2 DVT likely" }],
  references: [["Wells PS et al. Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis. N Engl J Med 2003;349:1227-35", "https://pubmed.ncbi.nlm.nih.gov/?term=Evaluation%20of%20D-dimer%20in%20the%20diagnosis%20of%20suspected%20deep-vein%20thrombosis"], ["NICE NG158. Venous thromboembolic diseases: diagnosis, management and thrombophilia testing", LINK.nice158]],
});

/* 2. PERC -------------------------------------------------------------------------------------------------- */
const perc = build({
  id: "perc", name: "PERC Rule for Pulmonary Embolism", shortName: "PERC", specialty: "Emergency medicine",
  description: "Rule out pulmonary embolism without further testing when clinical suspicion is already low.",
  whyUseIt: "Use only when your clinical gestalt says the pre-test probability of PE is low (below about 15%). If all eight criteria are absent, PE is sufficiently unlikely that D-dimer and imaging are not needed.",
  popularity: 6, keywords: ["pe", "pulmonary embolism", "rule out"], related: ["wells-pe", "wells-dvt"],
  inputs: [
    yn("age", "Age ≥50 years"), yn("hr", "Heart rate ≥100 beats/min"), yn("spo2", "Oxygen saturation <95% on room air"),
    yn("leg", "Unilateral leg swelling"), yn("haemoptysis", "Haemoptysis"), yn("surgery", "Surgery or trauma within 4 weeks requiring general anaesthesia"),
    yn("vte", "Previous pulmonary embolism or deep vein thrombosis"), yn("hormone", "Exogenous oestrogen (oral contraceptive, HRT or oestrogen-containing therapy)"),
  ],
  calculate: (i) => ["age", "hr", "spo2", "leg", "haemoptysis", "surgery", "vte", "hormone"].reduce((t, k) => t + (isYes(i, k) ? 1 : 0), 0),
  bands: [
    [undefined, "0", "PERC negative", "low", "All eight criteria absent. In a low-probability patient the PE rate is about 1%, below the usual test threshold.", ["No D-dimer or imaging is needed for PE. Document the pre-test probability and the PERC result.", "Look for an alternative diagnosis and give return precautions for pleuritic pain, breathlessness or leg swelling."]],
    [1, "≥1", "PERC positive", "moderate", "At least one criterion is present, so PERC cannot rule out PE.", ["Calculate a Wells' score for PE and continue the diagnostic pathway.", "D-dimer if PE unlikely on the two-level Wells; CT pulmonary angiography if PE likely."]],
  ],
  pearls: ["PERC is a rule-out tool, not a risk score: it never rules PE in.", "Apply it only when clinical gestalt already puts PE probability below about 15%.", "One positive criterion is enough to abandon PERC."],
  pitfalls: ["Do not use when PE is a leading diagnosis, or in pregnancy or known thrombophilia.", "The oxygen saturation criterion was derived near sea level; use a lower threshold only with local validation.", "Not validated in children."],
  formula: ["Count the criteria present. PERC is negative only when all eight are absent."],
  facts: [{ label: "Rule-out failure rate (low-probability patients)", value: "about 1.0% (Kline 2008)" }],
  references: [["Kline JA et al. Prospective multicenter evaluation of the pulmonary embolism rule-out criteria. J Thromb Haemost 2008;6:772-80", "https://pubmed.ncbi.nlm.nih.gov/?term=Prospective%20multicenter%20evaluation%20of%20the%20pulmonary%20embolism%20rule-out%20criteria"], ["NICE NG158", LINK.nice158]],
});

/* 3. Child-Pugh --------------------------------------------------------------------------------------------- */
const childPugh = build({
  id: "child-pugh", name: "Child-Pugh Score for Cirrhosis Mortality", shortName: "Child-Pugh", specialty: "Hepatology",
  description: "Grade the severity of chronic liver disease and cirrhosis.",
  whyUseIt: "Use in cirrhosis to grade hepatic reserve, estimate prognosis, and guide drug dosing and surgical risk.",
  popularity: 5, keywords: ["cirrhosis", "liver", "ascites", "encephalopathy"],
  inputs: [
    numeric("bilirubin", "Total bilirubin", [["mg-dl", "mg/dL"], ["umol-l", "µmol/L", 0.058479]], { min: 0, max: 60 }),
    numeric("albumin", "Albumin", [["g-dl", "g/dL"], ["g-l", "g/L", 0.1]], { min: 0, max: 8 }),
    numeric("inr", "INR", [["ratio", "ratio"]], { min: 0.5, max: 10 }),
    choice("ascites", "Ascites", [["none", "None", 1], ["mild", "Mild, or controlled with diuretics", 2], ["moderate", "Moderate to severe, or refractory to diuretics", 3]]),
    choice("encephalopathy", "Hepatic encephalopathy", [["none", "No encephalopathy", 1], ["grade1-2", "Grade 1 to 2, or suppressed with medication", 2], ["grade3-4", "Grade 3 to 4, or refractory", 3]]),
  ],
  calculate: (i) => {
    const b = val(i, "bilirubin"), a = val(i, "albumin"), r = val(i, "inr");
    if (b === undefined || a === undefined || r === undefined) return 0;
    return (b < 2 ? 1 : b <= 3 ? 2 : 3) + (a > 3.5 ? 1 : a >= 2.8 ? 2 : 3) + (r < 1.7 ? 1 : r <= 2.3 ? 2 : 3) + ({ none: 1, mild: 2, moderate: 3 } as Record<string, number>)[i?.ascites] + ({ none: 1, "grade1-2": 2, "grade3-4": 3 } as Record<string, number>)[i?.encephalopathy];
  },
  bands: [
    [undefined, "5–6", "Class A (well compensated)", "low", "Least severe disease. Approximate survival 100% at 1 year and 85% at 2 years.", ["Continue surveillance: hepatocellular carcinoma ultrasound every 6 months, variceal screening per Baveno criteria, vaccination.", "Standard dosing for most drugs; avoid hepatotoxins and NSAIDs."]],
    [7, "7–9", "Class B (significant compromise)", "moderate", "Moderately severe disease. Approximate survival 81% at 1 year and 57% at 2 years.", ["Refer to hepatology; assess for liver transplant candidacy and treat the cause and complications.", "Reduce doses of hepatically cleared drugs and review the need for each."]],
    [10, "10–15", "Class C (decompensated)", "high", "Most severe disease. Approximate survival 45% at 1 year and 35% at 2 years.", ["Urgent hepatology and transplant-centre referral; calculate MELD-Na.", "Avoid elective surgery where possible; use markedly reduced doses or avoid hepatically cleared drugs; consider palliative care input."]],
  ],
  pearls: ["Bilirubin and albumin are scored on traditional units; the calculator converts µmol/L and g/L for you.", "Ascites and encephalopathy are clinical grades, so score them at the time of the labs.", "Use MELD-Na alongside Child-Pugh when listing for transplant."],
  pitfalls: ["Contains two subjective items (ascites, encephalopathy) and treated findings are scored as present.", "For primary biliary cholangitis and primary sclerosing cholangitis the bilirubin bands are different (<4, 4 to 10, >10 mg/dL).", "Survival figures are approximate group estimates, not individual predictions."],
  formula: ["Bilirubin: <2 mg/dL (<34 µmol/L) 1 point; 2 to 3 mg/dL (34 to 51) 2; >3 mg/dL (>51) 3.", "Albumin: >3.5 g/dL (>35 g/L) 1; 2.8 to 3.5 g/dL (28 to 35) 2; <2.8 g/dL (<28) 3.", "INR: <1.7 1; 1.7 to 2.3 2; >2.3 3.", "Ascites: none 1; mild 2; moderate to severe 3. Encephalopathy: none 1; grade 1 to 2 2; grade 3 to 4 3.", "Class A = 5 to 6, B = 7 to 9, C = 10 to 15."],
  facts: [{ label: "Range", value: "5 to 15" }, { label: "1-year survival A / B / C", value: "about 100% / 81% / 45%" }, { label: "2-year survival A / B / C", value: "about 85% / 57% / 35%" }],
  references: [["Pugh RN et al. Transection of the oesophagus for bleeding oesophageal varices. Br J Surg 1973;60:646-9", "https://pubmed.ncbi.nlm.nih.gov/?term=Transection%20of%20the%20oesophagus%20for%20bleeding%20oesophageal%20varices"], ["EASL Clinical Practice Guidelines on decompensated cirrhosis. J Hepatol 2018;69:406-60", "https://pubmed.ncbi.nlm.nih.gov/?term=EASL%20Clinical%20Practice%20Guidelines%20on%20decompensated%20cirrhosis"]],
});

/* 4. Corrected calcium ------------------------------------------------------------------------------------------- */
const correctedCalcium = build({
  id: "corrected-calcium", name: "Calcium Correction for Hypoalbuminaemia", shortName: "Corrected calcium", specialty: "Endocrinology",
  description: "Correct total serum calcium for a low albumin.",
  whyUseIt: "Use when total calcium is measured in a patient with abnormal albumin to avoid missing true hypo- or hypercalcaemia.",
  popularity: 4, keywords: ["calcium", "albumin", "hypercalcaemia", "hypocalcaemia"], unit: "mg/dL", decimals: 1,
  inputs: [
    numeric("calcium", "Total calcium", [["mg-dl", "mg/dL"], ["mmol-l", "mmol/L", 4.008]], { min: 3, max: 25 }),
    numeric("albumin", "Albumin", [["g-dl", "g/dL"], ["g-l", "g/L", 0.1]], { min: 0.5, max: 8 }),
  ],
  calculate: (i) => { const c = val(i, "calcium"), a = val(i, "albumin"); return c === undefined || a === undefined ? 0 : c + 0.8 * (4 - a); },
  secondary: (i) => { const c = val(i, "calcium"), a = val(i, "albumin"); if (c === undefined || a === undefined) return []; const mg = c + 0.8 * (4 - a); return [{ label: "Corrected calcium (SI)", value: `${round(mg / 4.008, 2)} mmol/L` }]; },
  bands: [
    [undefined, "<8.5 mg/dL (<2.12 mmol/L)", "Hypocalcaemia", "moderate", "Corrected calcium is low.", ["Check ionised calcium, magnesium, phosphate, PTH and 25-hydroxyvitamin D.", "ECG for QT prolongation. Treat symptomatic or severe hypocalcaemia with IV calcium gluconate and monitoring."]],
    [8.5, "8.5–10.5 mg/dL (2.12–2.62 mmol/L)", "Normal range", "low", "Corrected calcium is within the usual adult range. Check against your laboratory's reference interval.", ["No calcium-specific action needed if the patient has no symptoms."]],
    [10.6, "10.6–11.9 mg/dL", "Mild hypercalcaemia", "moderate", "Mild hypercalcaemia (below 12 mg/dL, 3.0 mmol/L).", ["Repeat with ionised calcium, then check PTH, creatinine, vitamin D and medicines (thiazides, lithium, calcium and vitamin D supplements).", "Encourage oral hydration; look for primary hyperparathyroidism and malignancy."]],
    [12, "12.0–13.9 mg/dL", "Moderate hypercalcaemia", "high", "Moderate hypercalcaemia (3.0 to 3.5 mmol/L).", ["Admit if symptomatic. Check PTH, PTHrP, vitamin D, creatinine and ECG.", "Start IV isotonic saline rehydration and discuss bisphosphonate therapy with the medical team."]],
    [14, "≥14.0 mg/dL (≥3.5 mmol/L)", "Severe hypercalcaemia", "high", "Severe hypercalcaemia: a medical emergency.", ["Aggressive IV isotonic saline, ECG and cardiac monitoring; give a bisphosphonate (zoledronic acid) and consider calcitonin for rapid effect.", "Urgent senior, endocrine and renal input; treat the underlying cause."]],
  ],
  pearls: ["Each 1 g/dL fall in albumin lowers total calcium by about 0.8 mg/dL (0.2 mmol/L).", "If the result matters clinically, measure ionised calcium directly."],
  pitfalls: ["Unreliable in critical illness, advanced kidney disease, pregnancy and extreme albumin values.", "Assumes a normal albumin of 4.0 g/dL (40 g/L); laboratories differ in albumin assay and reference range.", "Does not correct for acid-base disturbance, which alters ionised calcium."],
  formula: ["Corrected calcium (mg/dL) = measured total calcium (mg/dL) + 0.8 × (4.0 − albumin g/dL)", "SI: corrected calcium (mmol/L) = measured calcium (mmol/L) + 0.02 × (40 − albumin g/L)"],
  facts: [{ label: "Unit conversion", value: "1 mmol/L calcium = 4.008 mg/dL" }],
  references: [["Payne RB et al. Interpretation of serum calcium in patients with abnormal serum proteins. Br Med J 1973;4:643-6", "https://pubmed.ncbi.nlm.nih.gov/?term=Interpretation%20of%20serum%20calcium%20in%20patients%20with%20abnormal%20serum%20proteins"]],
});

/* 5. Anion gap -------------------------------------------------------------------------------------------------- */
const anionGap = build({
  id: "anion-gap", name: "Serum Anion Gap", shortName: "Anion gap", specialty: "Nephrology",
  description: "Calculate the anion gap, correct it for albumin, and assess metabolic acidosis.",
  whyUseIt: "Use in metabolic acidosis to separate high anion gap causes (lactate, ketones, uraemia, toxins) from normal anion gap causes (bicarbonate loss, hyperchloraemia).",
  popularity: 7, keywords: ["acidosis", "delta ratio", "bicarbonate", "sodium chloride"], unit: "mmol/L", decimals: 1,
  inputs: [
    numeric("sodium", "Sodium", [["mmol-l", "mmol/L"]], { min: 90, max: 200 }),
    numeric("chloride", "Chloride", [["mmol-l", "mmol/L"]], { min: 50, max: 160 }),
    numeric("bicarbonate", "Bicarbonate", [["mmol-l", "mmol/L"]], { min: 2, max: 60 }),
    numeric("albumin", "Albumin (optional, for correction)", [["g-dl", "g/dL"], ["g-l", "g/L", 0.1]], { min: 0.5, max: 8, required: false }),
  ],
  calculate: (i) => {
    const na = val(i, "sodium"), cl = val(i, "chloride"), hco3 = val(i, "bicarbonate"), alb = val(i, "albumin");
    if (na === undefined || cl === undefined || hco3 === undefined) return 0;
    const ag = na - cl - hco3;
    return alb === undefined ? ag : ag + 2.5 * (4 - alb);
  },
  secondary: (i) => {
    const na = val(i, "sodium"), cl = val(i, "chloride"), hco3 = val(i, "bicarbonate"), alb = val(i, "albumin");
    if (na === undefined || cl === undefined || hco3 === undefined) return [];
    const ag = na - cl - hco3;
    const rows: SecondaryResult[] = [{ label: "Anion gap (uncorrected)", value: `${round(ag, 1)} mmol/L` }];
    if (alb !== undefined) rows.push({ label: "Albumin-corrected anion gap (headline result)", value: `${round(ag + 2.5 * (4 - alb), 1)} mmol/L` });
    const gap = alb === undefined ? ag : ag + 2.5 * (4 - alb);
    if (gap > 12 && hco3 < 24) {
      const delta = (gap - 12) / (24 - hco3);
      const read = delta < 0.4 ? "hyperchloraemic normal anion gap acidosis predominates" : delta < 0.8 ? "mixed high anion gap and normal anion gap acidosis" : delta <= 2 ? "pure high anion gap metabolic acidosis" : "high anion gap acidosis with a concurrent metabolic alkalosis or pre-existing high bicarbonate";
      rows.push({ label: "Delta ratio", value: `${round(delta, 2)}`, note: read });
    }
    return rows;
  },
  bands: [
    [undefined, "<3", "Low anion gap", "moderate", "Unusually low gap. Suspect laboratory error or low unmeasured anions.", ["Recheck the electrolytes and albumin. Consider hypoalbuminaemia (use the albumin correction), paraproteinaemia (IgG myeloma), lithium, bromide or severe hypercalcaemia."]],
    [3, "3–12", "Normal anion gap", "low", "Anion gap within the usual range (about 3 to 12 mmol/L with ion-selective electrodes; check your laboratory's range).", ["If acidotic with a normal gap, think bicarbonate loss: diarrhoea, renal tubular acidosis, saline load, pancreatic fistula. Calculate the urine anion gap."]],
    [12.1, ">12", "High anion gap", "high", "Raised gap: unmeasured anions are present if the patient is acidotic.", ["Send lactate, beta-hydroxybutyrate/ketones, creatinine and urea, salicylate and an osmolal gap if toxic alcohol ingestion is possible.", "Treat the cause (for example sepsis or hypoperfusion for lactate, insulin and fluids for DKA, dialysis for severe toxic alcohol or salicylate poisoning)."]],
  ],
  isComplete: (i) => val(i, "sodium") !== undefined && val(i, "chloride") !== undefined && val(i, "bicarbonate") !== undefined,
  pearls: ["Potassium is not included in this formula.", "Correct for albumin: every 1 g/dL fall in albumin lowers the expected gap by about 2.5 mmol/L and can hide a true high gap.", "The delta ratio helps find a second acid-base disorder behind a high anion gap acidosis."],
  pitfalls: ["Reference range depends on the laboratory's analyser; modern analysers give lower normal values than older ones.", "The delta ratio is imprecise and should not be used alone to diagnose a mixed disorder.", "Interpret alongside a blood gas, lactate and the clinical picture."],
  formula: ["Anion gap = Na − (Cl + HCO₃)", "Albumin-corrected anion gap = anion gap + 2.5 × (4.0 − albumin g/dL)", "Delta ratio = (anion gap − 12) ÷ (24 − HCO₃)"],
  facts: [{ label: "Delta ratio <0.4", value: "Hyperchloraemic normal gap acidosis" }, { label: "Delta ratio 0.4 to 0.8", value: "Mixed high and normal gap acidosis" }, { label: "Delta ratio 0.8 to 2", value: "Pure high gap acidosis" }, { label: "Delta ratio >2", value: "High gap acidosis plus metabolic alkalosis" }],
  references: [["Figge J et al. Anion gap and hypoalbuminemia. Crit Care Med 1998;26:1807-10", "https://pubmed.ncbi.nlm.nih.gov/?term=Anion%20gap%20and%20hypoalbuminemia"], ["Kraut JA, Madias NE. Serum anion gap: its uses and limitations in clinical medicine. Clin J Am Soc Nephrol 2007;2:162-74", "https://pubmed.ncbi.nlm.nih.gov/?term=Serum%20anion%20gap%3A%20its%20uses%20and%20limitations%20in%20clinical%20medicine"]],
});

/* 6. QTc ----------------------------------------------------------------------------------------------------------- */
const rrOf = (hr: number) => 60 / hr;
const qtcBazett = (qt: number, hr: number) => qt / Math.sqrt(rrOf(hr));
const qtcFridericia = (qt: number, hr: number) => qt / Math.cbrt(rrOf(hr));
const qtcFramingham = (qt: number, hr: number) => qt + 154 * (1 - rrOf(hr));
const qtcHodges = (qt: number, hr: number) => qt + 1.75 * (hr - 60);
const qtc = build({
  id: "qtc", name: "Corrected QT Interval (QTc)", shortName: "QTc", specialty: "Cardiology",
  description: "Correct the QT interval for heart rate with the Bazett, Fridericia, Framingham and Hodges formulas.",
  whyUseIt: "Use when starting or monitoring QT-prolonging drugs, after syncope, and with electrolyte disturbance, to judge the risk of torsades de pointes.",
  popularity: 3, keywords: ["qt", "torsades", "ecg", "bazett", "fridericia"], unit: "ms", decimals: 0,
  inputs: [
    numeric("qt", "QT interval", [["ms", "ms"]], { min: 200, max: 800 }),
    numeric("hr", "Heart rate", [["bpm", "beats/min"]], { min: 30, max: 220 }),
    choice("sex", "Sex", [["male", "Male", 0], ["female", "Female", 0]]),
  ],
  calculate: (i) => { const q = val(i, "qt"), h = val(i, "hr"); return q === undefined || h === undefined ? 0 : qtcBazett(q, h); },
  secondary: (i) => {
    const q = val(i, "qt"), h = val(i, "hr"); if (q === undefined || h === undefined) return [];
    return [
      { label: "Fridericia (preferred at fast or slow rates)", value: `${Math.round(qtcFridericia(q, h))} ms` },
      { label: "Framingham", value: `${Math.round(qtcFramingham(q, h))} ms` },
      { label: "Hodges", value: `${Math.round(qtcHodges(q, h))} ms` },
    ];
  },
  interpret: (score, i) => {
    const female = i?.sex === "female";
    const idx = score >= 500 ? 2 : score >= (female ? 460 : 450) ? 1 : 0;
    return qtc.results[idx];
  },
  bands: [
    [undefined, "<450 ms men; <460 ms women", "Normal QTc", "low", "QTc is within the normal range.", ["No QT-specific action. Repeat the ECG after starting or increasing any QT-prolonging drug."]],
    [450, "450–499 ms men; 460–499 ms women", "Prolonged QTc", "moderate", "Prolonged QTc: increased risk of torsades de pointes, higher with other risk factors.", ["Review and stop or switch QT-prolonging drugs where possible.", "Check and correct potassium (aim ≥4.0 mmol/L), magnesium (aim ≥2.0 mg/dL, 0.8 mmol/L) and calcium; repeat the ECG."]],
    [500, "≥500 ms", "Markedly prolonged QTc", "high", "QTc ≥500 ms, or a rise of more than 60 ms from baseline, carries a high risk of torsades de pointes.", ["Stop all QT-prolonging drugs, replace potassium and magnesium, and place on continuous cardiac monitoring.", "Seek cardiology advice; give IV magnesium sulphate if torsades or ventricular ectopy occurs."]],
  ],
  pearls: ["Bazett over-corrects at heart rates above 100 and under-corrects below 60; use Fridericia in those cases.", "Measure QT over several beats (3 to 5 in sinus rhythm; average 10 in AF) in lead II or V5.", "Compare against the patient's own baseline: an increase of more than 60 ms is itself a warning."],
  pitfalls: ["With a wide QRS (bundle branch block, paced rhythm) QTc overestimates repolarisation; subtract the extra QRS width or use JT interval.", "Formulas are population estimates and differ by up to 20 to 30 ms.", "Does not include other torsades risks: bradycardia, structural heart disease, female sex, hypokalaemia, hypomagnesaemia."],
  formula: ["RR (s) = 60 ÷ heart rate", "Bazett: QTc = QT ÷ √RR", "Fridericia: QTc = QT ÷ ∛RR", "Framingham: QTc = QT + 154 × (1 − RR)", "Hodges: QTc = QT + 1.75 × (heart rate − 60)"],
  facts: [{ label: "Prolonged (AHA/ACC/HRS 2009)", value: "≥450 ms men, ≥460 ms women" }, { label: "High torsades risk", value: "≥500 ms, or rise >60 ms" }],
  references: [["Rautaharju PM et al. AHA/ACCF/HRS recommendations for the standardization and interpretation of the ECG, part IV. Circulation 2009;119:e241-50", "https://pubmed.ncbi.nlm.nih.gov/19228821/"], ["Luo S et al. A comparison of commonly used QT correction formulae. J Electrocardiol 2004;37(Suppl):81-90", "https://pubmed.ncbi.nlm.nih.gov/?term=A%20comparison%20of%20commonly%20used%20QT%20correction%20formulae"]],
});

/* 7. Glasgow-Blatchford ------------------------------------------------------------------------------------------ */
const blatchford = build({
  id: "glasgow-blatchford", name: "Glasgow-Blatchford Score for Upper GI Bleeding", shortName: "Glasgow-Blatchford", specialty: "Gastroenterology",
  description: "Identify patients with upper GI bleeding who need hospital-based intervention and those safe for outpatient care.",
  whyUseIt: "Use at first assessment of suspected upper GI bleeding to separate very low-risk patients from those who need admission, transfusion or endoscopic therapy.",
  popularity: 8, keywords: ["gi bleed", "melaena", "haematemesis", "gbs"],
  inputs: [
    numeric("bun", "Blood urea", [["mg-dl", "BUN mg/dL"], ["mmol-l", "Urea mmol/L", 2.8]], { min: 0, max: 300 }),
    numeric("hb", "Haemoglobin", [["g-dl", "g/dL"], ["g-l", "g/L", 0.1]], { min: 2, max: 25 }),
    choice("sex", "Sex", [["male", "Male", 0], ["female", "Female", 0]]),
    numeric("sbp", "Systolic blood pressure", [["mmhg", "mmHg"]], { min: 40, max: 260 }),
    yn("hr", "Heart rate ≥100 beats/min"), yn("melaena", "Melaena at presentation"), yn("syncope", "Syncope", 2),
    yn("hepatic", "Hepatic disease (known chronic liver disease or evidence of liver failure)", 2), yn("cardiac", "Cardiac failure (present at presentation)", 2),
  ],
  calculate: (i) => {
    const bun = val(i, "bun"), hb = val(i, "hb"), sbp = val(i, "sbp");
    if (bun === undefined || hb === undefined || sbp === undefined) return 0;
    const female = i?.sex === "female";
    const urea = bun >= 70 ? 6 : bun >= 28 ? 4 : bun >= 22.4 ? 3 : bun >= 18.2 ? 2 : 0;
    const haem = female ? (hb < 10 ? 6 : hb < 12 ? 1 : 0) : (hb < 10 ? 6 : hb < 12 ? 3 : hb < 13 ? 1 : 0);
    const bp = sbp < 90 ? 3 : sbp < 100 ? 2 : sbp < 110 ? 1 : 0;
    return urea + haem + bp + (isYes(i, "hr") ? 1 : 0) + (isYes(i, "melaena") ? 1 : 0) + (isYes(i, "syncope") ? 2 : 0) + (isYes(i, "hepatic") ? 2 : 0) + (isYes(i, "cardiac") ? 2 : 0);
  },
  bands: [
    [undefined, "0", "Very low risk", "low", "No need for hospital-based intervention is expected.", ["Outpatient management is appropriate if the patient is reliable: arrange early outpatient endoscopy or GP review.", "Give return advice for further bleeding, black stool, dizziness or collapse."]],
    [1, "1", "Low risk", "low", "Score ≤1 is a validated outpatient threshold in international guidance.", ["Outpatient management can be considered if there are no other reasons to admit.", "Check the haemoglobin trend and arrange follow-up."]],
    [2, "2–6", "Intermediate risk", "moderate", "Some risk of needing transfusion, endoscopic therapy or surgery.", ["Admit. Resuscitate, establish IV access, cross-match if indicated, and keep nil by mouth until endoscopy.", "Arrange endoscopy within 24 hours of presentation after resuscitation."]],
    [7, "≥7", "High risk", "high", "A score of 7 or more best predicts the need for endoscopic treatment.", ["Admit to a monitored area and resuscitate. Discuss early with gastroenterology and arrange endoscopy as soon as the patient is stable (within 24 hours, earlier if unstable).", "If cirrhosis or varices are suspected, start vasoactive therapy (terlipressin) and antibiotic prophylaxis without waiting for endoscopy."]],
  ],
  pearls: ["Includes no endoscopic findings, so it can be used before endoscopy.", "Score 0 identifies about 1 in 5 patients who can avoid admission.", "Urea, haemoglobin and systolic BP carry most of the weight."],
  pitfalls: ["Not validated for lower GI bleeding.", "Haemodynamic instability, ongoing haematemesis or suspected varices override a low score.", "Urea can be raised by other causes (kidney disease, high protein intake, dehydration)."],
  formula: ["Urea (BUN mg/dL): 18.2 to <22.4 = 2; 22.4 to <28 = 3; 28 to <70 = 4; ≥70 = 6 (urea mmol/L: 6.5, 8, 10, 25).", "Haemoglobin, men: 12 to <13 = 1; 10 to <12 = 3; <10 = 6. Women: 10 to <12 = 1; <10 = 6.", "Systolic BP: 100 to 109 = 1; 90 to 99 = 2; <90 = 3.", "Heart rate ≥100 = 1; melaena = 1; syncope = 2; hepatic disease = 2; cardiac failure = 2."],
  facts: [{ label: "Range", value: "0 to 23" }, { label: "Outpatient threshold", value: "0, or ≤1 in international consensus guidance" }, { label: "Best cut-off for endoscopic treatment", value: "≥7 (Stanley 2017)" }],
  references: [["Blatchford O et al. A risk score to predict need for treatment for upper gastrointestinal haemorrhage. Lancet 2000;356:1318-21", "https://pubmed.ncbi.nlm.nih.gov/?term=A%20risk%20score%20to%20predict%20need%20for%20treatment%20for%20upper%20gastrointestinal%20haemorrhage"], ["Stanley AJ et al. Comparison of risk scoring systems for patients presenting with upper gastrointestinal bleeding. BMJ 2017;356:i6432", "https://pubmed.ncbi.nlm.nih.gov/28053181/"]],
});

/* 8. NEWS2 ------------------------------------------------------------------------------------------------------------ */
const news2Parts = (i: Record<string, any>): number[] => {
  const rr = Math.round(val(i, "rr") ?? 16), sat = Math.round(val(i, "spo2") ?? 98), sbp = val(i, "sbp") ?? 120, pulse = val(i, "pulse") ?? 70;
  const temp = Math.round((val(i, "temp") ?? 37) * 10) / 10, oxygen = i?.oxygen === "oxygen", scale2 = i?.scale === "2";
  const rrS = rr <= 8 ? 3 : rr <= 11 ? 1 : rr <= 20 ? 0 : rr <= 24 ? 2 : 3;
  const satS = scale2 ? (sat <= 83 ? 3 : sat <= 85 ? 2 : sat <= 87 ? 1 : sat <= 92 ? 0 : !oxygen ? 0 : sat <= 94 ? 1 : sat <= 96 ? 2 : 3) : (sat <= 91 ? 3 : sat <= 93 ? 2 : sat <= 95 ? 1 : 0);
  const sbpS = sbp <= 90 ? 3 : sbp <= 100 ? 2 : sbp <= 110 ? 1 : sbp <= 219 ? 0 : 3;
  const pulseS = pulse <= 40 ? 3 : pulse <= 50 ? 1 : pulse <= 90 ? 0 : pulse <= 110 ? 1 : pulse <= 130 ? 2 : 3;
  const tempS = temp <= 35 ? 3 : temp <= 36 ? 1 : temp <= 38 ? 0 : temp <= 39 ? 1 : 2;
  return [rrS, satS, oxygen ? 2 : 0, sbpS, pulseS, i?.consciousness === "cvpu" ? 3 : 0, tempS];
};
const news2 = build({
  id: "news2", name: "National Early Warning Score 2 (NEWS2)", shortName: "NEWS2", specialty: "Critical care",
  description: "Detect clinical deterioration in adult inpatients from routine observations.",
  whyUseIt: "Use at every set of observations in adults (16 years and over) to trigger a graded clinical response and detect sepsis and deterioration early.",
  popularity: 1, keywords: ["early warning", "deterioration", "observations", "sepsis", "rcp"],
  inputs: [
    numeric("rr", "Respiratory rate", [["bpm", "breaths/min"]], { min: 0, max: 80 }),
    numeric("spo2", "Oxygen saturation", [["pct", "%"]], { min: 50, max: 100 }),
    choice("scale", "SpO₂ scale", [["1", "Scale 1 (default)", 0], ["2", "Scale 2: target 88 to 92% (confirmed hypercapnic respiratory failure only)", 0]], "Use Scale 2 only when a qualified clinician has documented a target of 88 to 92%."),
    choice("oxygen", "Air or oxygen", [["air", "Room air", 0], ["oxygen", "Supplemental oxygen", 2]]),
    numeric("sbp", "Systolic blood pressure", [["mmhg", "mmHg"]], { min: 30, max: 300 }),
    numeric("pulse", "Pulse", [["bpm", "beats/min"]], { min: 10, max: 250 }),
    choice("consciousness", "Consciousness", [["alert", "Alert", 0], ["cvpu", "New confusion, responds to Voice or Pain, or Unresponsive (CVPU)", 3]]),
    numeric("temp", "Temperature", [["c", "°C"], ["f", "°F", 5 / 9, -160 / 9]], { min: 28, max: 44 }),
  ],
  calculate: (i) => news2Parts(i).reduce((a, b) => a + b, 0),
  interpret: (score, i) => {
    const red = news2Parts(i).some((p) => p === 3);
    const idx = score >= 7 ? 4 : score >= 5 ? 3 : red ? 2 : score >= 1 ? 1 : 0;
    return news2.results[idx];
  },
  bands: [
    [undefined, "0", "Low clinical risk", "low", "Aggregate score 0.", ["Continue routine monitoring with a minimum of 12-hourly observations."]],
    [1, "1–4", "Low clinical risk", "low", "Aggregate score 1 to 4.", ["Minimum 4 to 6 hourly observations.", "The registered nurse decides whether to increase monitoring or escalate."]],
    [3, "Any single parameter scoring 3", "Low-medium clinical risk", "moderate", "A red score: one parameter scored 3 even though the total is below 5.", ["Urgent ward-based response: urgent review by a clinician to decide whether escalation is needed.", "Observations at least hourly until reviewed."]],
    [5, "5–6", "Medium clinical risk", "moderate", "Key threshold for urgent response (also triggered by a red score).", ["Urgent review by a clinician with core competencies in acute illness (acute team or critical care outreach).", "Observations at least hourly; consider moving to a monitored area."]],
    [7, "≥7", "High clinical risk", "high", "Emergency response threshold.", ["Emergency assessment by a team with critical care competencies, including airway skills.", "Continuous monitoring; consider transfer to a level 2 or 3 critical care area."]],
  ],
  pearls: ["Scores of 5 or more, or any single red score of 3, need an urgent clinical review.", "New confusion scores 3 even when the patient is otherwise alert.", "Use Scale 2 for SpO₂ only for confirmed hypercapnic respiratory failure, never by default."],
  pitfalls: ["Not validated in children, in pregnancy (use an obstetric early warning score) or in patients with a do-not-escalate plan.", "Not a replacement for clinical concern: a patient can be unwell with a low score.", "Treat each parameter in the context of chronic disease (for example baseline tachycardia or atrial fibrillation)."],
  formula: ["Respiratory rate: ≤8 = 3; 9 to 11 = 1; 12 to 20 = 0; 21 to 24 = 2; ≥25 = 3.", "SpO₂ scale 1: ≤91 = 3; 92 to 93 = 2; 94 to 95 = 1; ≥96 = 0. Air = 0; oxygen = 2.", "Systolic BP: ≤90 = 3; 91 to 100 = 2; 101 to 110 = 1; 111 to 219 = 0; ≥220 = 3.", "Pulse: ≤40 = 3; 41 to 50 = 1; 51 to 90 = 0; 91 to 110 = 1; 111 to 130 = 2; ≥131 = 3.", "Consciousness: alert = 0; CVPU = 3.", "Temperature: ≤35.0 = 3; 35.1 to 36.0 = 1; 36.1 to 38.0 = 0; 38.1 to 39.0 = 1; ≥39.1 = 2."],
  facts: [{ label: "Range", value: "0 to 20" }, { label: "Urgent response threshold", value: "Aggregate ≥5 or any single parameter of 3" }, { label: "Emergency threshold", value: "Aggregate ≥7" }],
  references: [["Royal College of Physicians. National Early Warning Score (NEWS) 2: standardising the assessment of acute-illness severity in the NHS. 2017", LINK.news2]],
});

/* 9. BMI and BSA ------------------------------------------------------------------------------------------------- */
const bmiBsa = build({
  id: "bmi-bsa", name: "Body Mass Index (BMI) and Body Surface Area (BSA)", shortName: "BMI & BSA", specialty: "Endocrinology",
  description: "Calculate BMI with WHO weight categories and body surface area.",
  whyUseIt: "Use to classify weight status, screen for obesity-related risk, and calculate body surface area for chemotherapy and other dosing.",
  popularity: 9, keywords: ["obesity", "weight", "bsa", "mosteller", "dubois"], unit: "kg/m²", decimals: 1,
  inputs: [
    numeric("weight", "Weight", [["kg", "kg"], ["lb", "lb", 0.45359237]], { min: 2, max: 400 }),
    numeric("height", "Height", [["cm", "cm"], ["in", "in", 2.54]], { min: 40, max: 250 }),
  ],
  calculate: (i) => { const w = val(i, "weight"), h = val(i, "height"); return w === undefined || h === undefined || h === 0 ? 0 : w / ((h / 100) ** 2); },
  secondary: (i) => {
    const w = val(i, "weight"), h = val(i, "height"); if (w === undefined || h === undefined) return [];
    return [
      { label: "BSA (Mosteller)", value: `${round(Math.sqrt((h * w) / 3600), 2)} m²` },
      { label: "BSA (DuBois)", value: `${round(0.007184 * w ** 0.425 * h ** 0.725, 2)} m²` },
    ];
  },
  bands: [
    [undefined, "<18.5", "Underweight", "moderate", "BMI below the healthy range.", ["Assess for malnutrition, malabsorption, chronic disease, eating disorder, thyroid disease and cancer.", "Dietitian referral and nutritional support as appropriate."]],
    [18.5, "18.5–24.9", "Normal weight", "low", "BMI within the WHO healthy range.", ["Encourage regular activity and a balanced diet."]],
    [25, "25.0–29.9", "Overweight (pre-obese)", "moderate", "Raised BMI with increased cardiometabolic risk.", ["Measure waist circumference, blood pressure, glucose or HbA1c and lipids.", "Offer lifestyle counselling."]],
    [30, "30.0–34.9", "Obesity class I", "moderate", "Obesity with increased risk of type 2 diabetes, hypertension and cardiovascular disease.", ["Screen for diabetes, hypertension, dyslipidaemia, fatty liver, sleep apnoea.", "Structured lifestyle programme; consider anti-obesity pharmacotherapy; consider bariatric assessment if BMI 30 to 34.9 with metabolic disease."]],
    [35, "35.0–39.9", "Obesity class II", "high", "Severe obesity with marked comorbidity risk.", ["Full comorbidity assessment. Offer pharmacotherapy and refer for bariatric surgery assessment (BMI ≥35 is an indication in ASMBS/IFSO 2022)."]],
    [40, "≥40", "Obesity class III", "high", "Very severe obesity.", ["Refer to a multidisciplinary obesity service for bariatric surgery assessment; screen for sleep apnoea, heart failure and hypoventilation."]],
  ],
  pearls: ["Mosteller BSA is the most widely used formula in dosing.", "For South Asian and some other Asian populations, risk rises at lower BMI (WHO expert consultation: 23 or more increased risk, 27.5 or more high risk).", "Add waist circumference for central adiposity."],
  pitfalls: ["BMI does not separate fat from muscle (athletes, oedema, sarcopenic obesity).", "Not valid in children (use age- and sex-specific centiles) or in pregnancy.", "For chemotherapy dosing, follow the protocol on whether to use actual or capped BSA."],
  formula: ["BMI = weight (kg) ÷ height (m)²", "BSA (Mosteller) = √(height cm × weight kg ÷ 3600)", "BSA (DuBois) = 0.007184 × weight^0.425 × height^0.725"],
  facts: [{ label: "WHO categories", value: "<18.5, 18.5 to 24.9, 25 to 29.9, 30 to 34.9, 35 to 39.9, ≥40" }, { label: "Asian cut-offs (WHO 2004)", value: "≥23 increased risk; ≥27.5 high risk" }],
  references: [["WHO Expert Consultation. Appropriate body-mass index for Asian populations. Lancet 2004;363:157-63", "https://pubmed.ncbi.nlm.nih.gov/?term=WHO%20Expert%20Consultation.%20Appropriate%20body-mass%20index%20for%20Asian%20populations"], ["Mosteller RD. Simplified calculation of body-surface area. N Engl J Med 1987;317:1098", "https://pubmed.ncbi.nlm.nih.gov/3657876/"]],
});

/* 10. Padua --------------------------------------------------------------------------------------------------------- */
const padua = build({
  id: "padua", name: "Padua Prediction Score for Risk of VTE", shortName: "Padua", specialty: "Haematology",
  description: "Identify hospitalised medical patients at high risk of venous thromboembolism who need prophylaxis.",
  whyUseIt: "Use on admission of acutely ill medical patients to decide whether to give pharmacological VTE prophylaxis.",
  popularity: 10, keywords: ["vte", "prophylaxis", "thromboprophylaxis", "inpatient"],
  inputs: [
    yn("cancer", "Active cancer", 3, "Local or distant metastases and/or chemotherapy or radiotherapy in the previous 6 months."),
    yn("prior-vte", "Previous VTE (excluding superficial vein thrombosis)", 3),
    yn("mobility", "Reduced mobility", 3, "Anticipated bed rest with bathroom privileges for at least 3 days."),
    yn("thrombophilia", "Known thrombophilic condition", 3, "Antithrombin, protein C or S deficiency, factor V Leiden, prothrombin G20210A, antiphospholipid syndrome."),
    yn("trauma", "Recent (≤1 month) trauma and/or surgery", 2),
    yn("age", "Age ≥70 years", 1), yn("failure", "Heart and/or respiratory failure", 1), yn("mi-stroke", "Acute myocardial infarction or ischaemic stroke", 1),
    yn("infection", "Acute infection and/or rheumatological disorder", 1), yn("obesity", "Obesity (BMI ≥30)", 1), yn("hormonal", "Ongoing hormonal treatment", 1),
  ],
  calculate: (i) => [["cancer", 3], ["prior-vte", 3], ["mobility", 3], ["thrombophilia", 3], ["trauma", 2], ["age", 1], ["failure", 1], ["mi-stroke", 1], ["infection", 1], ["obesity", 1], ["hormonal", 1]].reduce((t, [k, p]) => t + (isYes(i, k as string) ? (p as number) : 0), 0),
  bands: [
    [undefined, "<4", "Low risk of VTE", "low", "About 0.3% VTE rate without prophylaxis in the derivation cohort.", ["Pharmacological prophylaxis is not routinely needed. Encourage mobilisation and hydration.", "Reassess if the clinical state changes."]],
    [4, "≥4", "High risk of VTE", "high", "About 11% VTE rate without prophylaxis in the derivation cohort.", ["Offer pharmacological prophylaxis (LMWH or unfractionated heparin) unless there is active bleeding or another contraindication; adjust for renal function.", "Use mechanical prophylaxis (intermittent pneumatic compression) when anticoagulation is contraindicated. Reassess daily and at discharge."]],
  ],
  pearls: ["Score at admission and again if the patient's condition or mobility changes.", "A high score does not override active bleeding, severe thrombocytopenia or other contraindications.", "Reduced mobility is the most commonly missed item."],
  pitfalls: ["Derived and validated in acutely ill medical inpatients; not for surgical, orthopaedic, obstetric or ICU patients.", "Prospective validation in other populations is limited and the benefit of prophylaxis at a score of 4 to 5 is debated.", "Always pair with a bleeding-risk assessment."],
  formula: ["Active cancer 3; previous VTE 3; reduced mobility 3; known thrombophilia 3; recent trauma or surgery 2.", "Age ≥70 1; heart or respiratory failure 1; acute MI or ischaemic stroke 1; acute infection or rheumatological disorder 1; obesity 1; hormonal treatment 1."],
  facts: [{ label: "Range", value: "0 to 20" }, { label: "VTE rate without prophylaxis: low / high risk", value: "about 0.3% / 11%" }],
  references: [["Barbar S et al. A risk assessment model for the identification of hospitalized medical patients at risk for venous thromboembolism: the Padua Prediction Score. J Thromb Haemost 2010;8:2450-7", "https://pubmed.ncbi.nlm.nih.gov/?term=A%20risk%20assessment%20model%20for%20the%20identification%20of%20hospitalized%20medical%20patients%20at%20risk%20for%20venous%20thromboembolism%3A%20the%20Padua%20Prediction%20Score"], ["Schünemann HJ et al. American Society of Hematology 2018 guidelines for management of VTE: prophylaxis for hospitalized and nonhospitalized medical patients. Blood Adv 2018;2:3198-225", "https://pubmed.ncbi.nlm.nih.gov/?term=American%20Society%20of%20Hematology%202018%20guidelines%20for%20management%20of%20VTE%3A%20prophylaxis%20for%20hospitalized%20and%20nonhospitalized%20medical%20patients"]],
});

/* 11. qSOFA (restored) ------------------------------------------------------------------------------------------ */
const qsofa = build({
  id: "qsofa-score", name: "qSOFA (Quick SOFA) Criteria for Sepsis", shortName: "qSOFA", specialty: "Critical care",
  description: "Bedside prompt to identify adults with suspected infection at higher risk of poor outcome.",
  whyUseIt: "Use as a prompt to look for organ dysfunction in suspected infection outside the ICU. It is not a stand-alone sepsis screen.",
  popularity: 11, keywords: ["sepsis", "quick sofa"],
  inputs: [yn("rr", "Respiratory rate ≥22 breaths/min"), yn("sbp", "Systolic blood pressure ≤100 mmHg"), yn("mentation", "Altered mentation (GCS <15)")],
  calculate: (i) => ["rr", "sbp", "mentation"].reduce((t, k) => t + (isYes(i, k) ? 1 : 0), 0),
  bands: [
    [undefined, "0–1", "Lower risk", "low", "Fewer than two criteria. This does not exclude sepsis.", ["Continue assessment and monitoring if infection is suspected; use NEWS2 and clinical judgement."]],
    [2, "≥2", "Higher risk", "high", "Two or more criteria are associated with higher in-hospital mortality and ICU stay.", ["Assess urgently for organ dysfunction: lactate, blood cultures, creatinine, bilirubin, platelets, SOFA.", "Start the sepsis bundle if sepsis is suspected: antibiotics within 1 hour for probable septic shock, 30 mL/kg crystalloid for hypotension or lactate ≥4 mmol/L."]],
  ],
  pearls: ["Three bedside items, no lab tests.", "Score ≥2 flags higher risk; it does not diagnose sepsis."],
  pitfalls: ["Low sensitivity: the Surviving Sepsis Campaign 2021 advises against using qSOFA alone as a screening tool.", "Not validated in children or pregnancy."],
  formula: ["1 point each for: respiratory rate ≥22/min, systolic BP ≤100 mmHg, altered mentation (GCS <15)."],
  facts: [{ label: "Range", value: "0 to 3" }],
  references: [["Seymour CW et al. Assessment of clinical criteria for sepsis (Sepsis-3). JAMA 2016;315:762-74", "https://pubmed.ncbi.nlm.nih.gov/?term=Assessment%20of%20Clinical%20Criteria%20for%20Sepsis%20Third%20International%20Consensus%20Definitions"], ["Evans L et al. Surviving Sepsis Campaign 2021. Intensive Care Med 2021;47:1181-247", "https://pubmed.ncbi.nlm.nih.gov/?term=Surviving%20Sepsis%20Campaign%202021"]],
});


/* Wells' criteria for PE: the full example calculator (replaces the earlier two-tier-only version) ---------------------- */
const wellsPeScore = (i: Record<string, any>) => (isYes(i, "dvt-signs") ? 3 : 0) + (isYes(i, "pe-leading") ? 3 : 0) + (isYes(i, "hr") ? 1.5 : 0) + (isYes(i, "immobilisation") ? 1.5 : 0) + (isYes(i, "previous-vte") ? 1.5 : 0) + (isYes(i, "haemoptysis") ? 1 : 0) + (isYes(i, "malignancy") ? 1 : 0);
const wellsPe = build({
  id: "wells-pe", name: "Wells' Criteria for Pulmonary Embolism", shortName: "Wells' PE", specialty: "Emergency medicine",
  description: "Estimate the pre-test probability of pulmonary embolism and choose the next test.",
  when: "Use in adults when pulmonary embolism is already on your differential after history and examination. The score tells you whether to send a D-dimer or go straight to imaging. It is not a screening tool for patients in whom PE is not suspected; if suspicion is low, consider the PERC rule first.",
  whyUseIt: "Replaces unstructured gut feeling with a validated, repeatable estimate. Paired with D-dimer it safely avoids imaging in many patients, which saves radiation, contrast and time, and it is built into the NICE and ESC diagnostic pathways.",
  popularity: 2, isNew: false, keywords: ["pe", "pulmonary embolism", "vte", "d-dimer", "ctpa"], related: ["perc", "wells-dvt"],
  inputs: [
    yn("dvt-signs", "Clinical signs and symptoms of DVT", 3, "Leg swelling and pain on palpation of the deep veins."),
    yn("pe-leading", "PE is the leading diagnosis, or at least as likely as any alternative", 3, "Your own judgement after history, examination and basic tests."),
    yn("hr", "Heart rate above 100 beats/min", 1.5),
    yn("immobilisation", "Immobilised for 3 days or more, or surgery in the previous 4 weeks", 1.5),
    yn("previous-vte", "Previous objectively confirmed PE or DVT", 1.5),
    yn("haemoptysis", "Haemoptysis", 1),
    yn("malignancy", "Malignancy on treatment within the last 6 months, or palliative", 1),
  ],
  calculate: wellsPeScore, decimals: 1,
  secondary: (i) => { const sc = wellsPeScore(i); return [sc > 4 ? { label: "Two-tier model", value: "PE likely (>4)", note: "About 37% had PE in validation cohorts. Go to imaging." } : { label: "Two-tier model", value: "PE unlikely (0 to 4)", note: "About 12% had PE in validation cohorts. D-dimer first." }]; },
  bands: [
    [undefined, "<2", "Low probability", "low", "Three-tier model: low pre-test probability (about 1% to 2% have PE).", ["Apply PERC. If all eight criteria are absent, stop; no D-dimer is needed.", "If PERC cannot be applied or is positive, send a D-dimer: negative excludes PE, positive needs CT pulmonary angiography (CTPA)."]],
    [2, "2–6", "Moderate probability", "moderate", "Three-tier model: moderate pre-test probability (about 16% have PE).", ["A D-dimer is acceptable if your laboratory uses a high-sensitivity assay: negative excludes PE, positive needs CTPA.", "Many centres go straight to CTPA at this level; follow your pathway."]],
    [6.5, ">6", "High probability", "high", "Three-tier model: high pre-test probability (about 38% have PE).", ["Go to CTPA (or V/Q scan if contrast is contraindicated). A negative D-dimer does not exclude PE here, so do not use it.", "Start therapeutic anticoagulation while waiting for imaging if there is no contraindication."]],
  ],
  nextSteps: {
    advice: [
      "Use the score only once PE is a genuine possibility, and write down the score and the reason for the judgement item.",
      "Follow the pathway that matches the score instead of sending a D-dimer on everyone.",
      "Findings the score does not capture still count: unexplained hypoxia, syncope, a raised troponin or right ventricular strain on ECG or echo should override a low score.",
    ],
    management: [
      { title: "Three-tier model", items: [
        "Low (<2): apply PERC; if PERC is positive or not suitable, send a D-dimer. Negative D-dimer excludes PE.",
        "Moderate (2 to 6): D-dimer if a high-sensitivity assay is available, otherwise CTPA. Positive D-dimer needs CTPA.",
        "High (>6): CTPA, or V/Q scan if contrast is contraindicated. Do not rely on D-dimer.",
      ] },
      { title: "Two-tier model (NICE and ESC pathways)", items: [
        "PE unlikely (0 to 4): D-dimer. Negative excludes PE; positive needs CTPA. In patients over 50, an age-adjusted cut-off (age × 10 µg/L) improves specificity.",
        "PE likely (>4): CTPA straight away. D-dimer adds nothing. Give interim therapeutic anticoagulation if imaging will be delayed and bleeding risk allows.",
      ] },
    ],
    critical: [
      "If the patient is haemodynamically unstable, do not wait for a score: arrange bedside echo and immediate imaging, and follow the high-risk PE pathway including reperfusion therapy.",
      "Do not give anticoagulation for suspected PE and then forget to confirm or exclude it: document the plan and the time of imaging.",
      "In pregnancy, severe renal impairment or contrast allergy, use the pregnancy-adapted algorithm or V/Q imaging rather than the standard pathway.",
      "A negative D-dimer is only valid in the low, moderate (high-sensitivity assay) or PE-unlikely groups.",
    ],
  },
  pearls: [
    "The judgement item (PE the leading diagnosis) is worth 3 points, as much as clinical DVT signs, so it carries the most weight and the most variation between clinicians.",
    "The two-tier version (cut-off at 4) is the one most guidelines use. The three-tier version gives a finer probability.",
    "PE unlikely plus a negative D-dimer is a safe way to exclude PE without imaging (3-month thromboembolic event rate about 0.5% in the Christopher study).",
    "Score items are added up; there are no negative points.",
  ],
  pitfalls: [
    "Not validated in pregnancy, in children, in patients already anticoagulated, or when the patient is haemodynamically unstable.",
    "The judgement item is subjective, so two clinicians can reach different categories for the same patient.",
    "D-dimer is raised by age, pregnancy, cancer, infection and recent surgery, so a positive result is common and not specific.",
    "A low score lowers the probability of PE but does not remove it; a low score alone is not a negative test.",
  ],
  formula: ["Clinical signs and symptoms of DVT: +3", "PE is the leading diagnosis or equally likely: +3", "Heart rate above 100: +1.5", "Immobilisation of 3 days or more, or surgery within 4 weeks: +1.5", "Previous PE or DVT: +1.5", "Haemoptysis: +1", "Malignancy (treatment within 6 months, or palliative): +1", "Three-tier: <2 low, 2 to 6 moderate, >6 high. Two-tier: 0 to 4 PE unlikely, >4 PE likely."],
  facts: [
    { label: "Range", value: "0 to 12.5" },
    { label: "PE prevalence, three-tier: low / moderate / high", value: "about 1.3% / 16.2% / 37.5%" },
    { label: "PE prevalence, two-tier: unlikely / likely", value: "about 12.1% / 37.1%" },
    { label: "Safe exclusion: PE unlikely + negative D-dimer", value: "3-month thromboembolic event rate about 0.5% (Christopher study)" },
  ],
  evidenceAppraisal: [
    "The score was derived in Canadian emergency and inpatient populations (Wells 1998 and 2000) and has since been validated in many cohorts, including emergency departments in several countries. Prevalence in each band varies between settings, so the percentages above are approximate.",
    "Management studies are the strongest evidence: the Christopher study followed patients managed with the two-tier score and D-dimer and found a very low rate of venous thromboembolism at three months in those left without imaging.",
    "Weaknesses: one third of the score depends on clinician judgement, agreement between clinicians is only moderate, and performance is weaker in older and hospitalised patients, where D-dimer specificity is also lower. The three-tier groups were studied less than the two-tier split.",
  ],
  creator: { name: "Philip S. Wells, MD, MSc", bio: ["Professor of Medicine at the University of Ottawa, working at the Ottawa Hospital Research Institute.", "Led the research that produced the Wells criteria for suspected DVT and for suspected PE, among the most widely used clinical prediction rules in thrombosis."] },
  references: [
    ["Wells PS et al. Derivation of a simple clinical model to categorize patients' probability of pulmonary embolism. Thromb Haemost 2000;83:416-20", "https://pubmed.ncbi.nlm.nih.gov/?term=Derivation%20of%20a%20simple%20clinical%20model%20to%20categorize%20patients%20probability%20of%20pulmonary%20embolism"],
    ["van Belle A et al. Effectiveness of managing suspected pulmonary embolism using an algorithm combining clinical probability, D-dimer testing, and CT (Christopher study). JAMA 2006;295:172-9", "https://pubmed.ncbi.nlm.nih.gov/?term=Effectiveness%20of%20managing%20suspected%20pulmonary%20embolism%20using%20an%20algorithm%20combining%20clinical%20probability%20D-dimer%20testing%20and%20computed%20tomography"],
    ["Konstantinides SV et al. 2019 ESC guidelines for acute pulmonary embolism. Eur Heart J 2020;41:543-603", "https://pubmed.ncbi.nlm.nih.gov/?term=2019%20ESC%20Guidelines%20for%20the%20diagnosis%20and%20management%20of%20acute%20pulmonary%20embolism"],
    ["NICE NG158. Venous thromboembolic diseases: diagnosis, management and thrombophilia testing", LINK.nice158],
  ],
});

export const replacementCalculators: ClinicalCalculatorSchema[] = [wellsPe];

export const extraCalculators: ClinicalCalculatorSchema[] = [news2, wellsDvt, qtc, correctedCalcium, childPugh, perc, anionGap, blatchford, bmiBsa, padua, qsofa];
