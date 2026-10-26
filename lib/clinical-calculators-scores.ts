/* Calculators for the clinical scores that topics name and explain (see lib/clinical-scores.ts).
 * Each follows the same MDCalc-style layout as the other calculators: inputs, result bands, next steps,
 * formula, evidence appraisal and references. Figures are from the cited derivation or validation papers. */
import { build, choice, numeric, val, yn, isYes, type Band, type Spec } from "./clinical-calculators-extra";
import type { ClinicalCalculatorSchema } from "./clinical-calculators";

const pm = (term: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(term)}`;
/** Sum of the points of the chosen option of every single-select question. */
const sumChoices = (inputs: any[], i: Record<string, any>) => inputs.filter((q) => q.type === "binary").reduce((total, q) => total + (q.options.find((o: any) => o.value === i?.[q.id])?.points ?? 0), 0); // eslint-disable-line @typescript-eslint/no-explicit-any
const answered = (inputs: any[]) => (i: Record<string, any>) => inputs.every((q) => (q.type === "binary" ? i?.[q.id] !== undefined : val(i, q.id) !== undefined)); // eslint-disable-line @typescript-eslint/no-explicit-any
const spec = (s: Omit<Spec, "calculate" | "isComplete"> & { calculate?: Spec["calculate"] }): ClinicalCalculatorSchema => build({ calculate: (i) => sumChoices(s.inputs, i), isComplete: answered(s.inputs), ...s } as Spec);

/* GRACE ------------------------------------------------------------------------------------------------------ */
const band = (v: number, cuts: number[], pts: number[]) => { let n = 0; while (n < cuts.length && v >= cuts[n]) n++; return pts[n]; };
const graceInputs = [
  numeric("age", "Age", [["years", "years"]], { min: 18, max: 110 }),
  numeric("hr", "Heart rate", [["bpm", "beats/min"]], { min: 20, max: 250 }),
  numeric("sbp", "Systolic blood pressure", [["mmhg", "mmHg"]], { min: 40, max: 300 }),
  numeric("creat", "Serum creatinine", [["mg-dl", "mg/dL"], ["umol-l", "µmol/L", 0.0113]], { min: 0.2, max: 15 }),
  choice("killip", "Killip class", [["1", "I: no heart failure", 0], ["2", "II: crackles, third heart sound or raised JVP", 20], ["3", "III: pulmonary oedema", 39], ["4", "IV: cardiogenic shock", 59]]),
  yn("arrest", "Cardiac arrest at admission", 39), yn("st", "ST-segment deviation on the ECG", 28), yn("enzymes", "Raised cardiac enzymes (troponin)", 14),
];
const grace = build({
  id: "grace", name: "GRACE Risk Score for Acute Coronary Syndrome (in-hospital mortality)", shortName: "GRACE", specialty: "Cardiology",
  description: "Estimate the risk of death in hospital in unstable angina, NSTEMI or STEMI, and guide the timing of angiography.",
  when: "Use at first assessment of an adult with a confirmed or suspected acute coronary syndrome, most often NSTEMI, to decide between an immediate, early (within 24 hours) or selective invasive strategy.",
  whyUseIt: "Combines eight routinely available findings into one number that predicts death in hospital better than clinical impression, and is the risk score named in ESC and NICE pathways for NSTEMI.",
  popularity: 6, keywords: ["acs", "nstemi", "unstable angina", "angiography", "risk"], related: ["timi-nstemi", "heart-score", "has-bled"],
  inputs: graceInputs, isComplete: answered(graceInputs),
  calculate: (i) => {
    const age = val(i, "age"), hr = val(i, "hr"), sbp = val(i, "sbp"), cr = val(i, "creat");
    if (age === undefined || hr === undefined || sbp === undefined || cr === undefined) return 0;
    const a = band(age, [30, 40, 50, 60, 70, 80, 90], [0, 8, 25, 41, 58, 75, 91, 100]);
    const h = band(hr, [50, 70, 90, 110, 150, 200], [0, 3, 9, 15, 24, 38, 46]);
    const s = band(sbp, [80, 100, 120, 140, 160, 200], [58, 53, 43, 34, 24, 10, 0]);
    const c = band(cr, [0.4, 0.8, 1.2, 1.6, 2.0, 4.0], [1, 4, 7, 10, 13, 21, 28]);
    const killip = (graceInputs[4] as any).options.find((o: any) => o.value === i?.killip)?.points ?? 0; // eslint-disable-line @typescript-eslint/no-explicit-any
    return a + h + s + c + killip + (isYes(i, "arrest") ? 39 : 0) + (isYes(i, "st") ? 28 : 0) + (isYes(i, "enzymes") ? 14 : 0);
  },
  bands: [
    [undefined, "≤108", "Low risk", "low", "Risk of death in hospital is under 1%.", ["Routine antithrombotic treatment and a selective or delayed invasive strategy are usual.", "Keep monitoring; the score does not replace clinical judgement."]],
    [109, "109–140", "Intermediate risk", "moderate", "Risk of death in hospital is about 1% to 3%.", ["Consider an early invasive strategy with angiography within 24 hours.", "Check renal function and bleeding risk before choosing antithrombotic drugs."]],
    [141, ">140", "High risk", "high", "Risk of death in hospital is above 3%.", ["Arrange an early invasive strategy within 24 hours at a centre that can perform PCI.", "Refractory pain, shock, acute heart failure or life-threatening arrhythmia need an immediate invasive strategy, within 2 hours, whatever the score."]],
  ],
  nextSteps: {
    advice: ["Calculate the score from the first set of results and record each component.", "Re-score if the patient deteriorates: new heart failure, arrhythmia or renal impairment changes the risk."],
    management: [{ title: "By risk group", items: ["Low: routine care and a planned outpatient or inpatient assessment.", "Intermediate: coronary angiography within 24 hours.", "High: early angiography; transfer to a PCI-capable centre if needed."] }],
    critical: ["ST-elevation, refractory ischaemic pain, shock or malignant arrhythmia need immediate reperfusion or an immediate invasive strategy; do not wait to calculate a score."],
  },
  evidenceAppraisal: ["Derived from the GRACE registry (over 11 000 patients, 1999 to 2001) and validated in many later cohorts and in trial populations.", "It predicts in-hospital death well across the spectrum of acute coronary syndromes, with good discrimination (c-statistic about 0.83).", "Weaknesses: points tables apply to in-hospital death, creatinine and Killip class must be recorded accurately, and benefit of an earlier invasive strategy in intermediate-risk patients is less certain than in high-risk patients."],
  creator: { name: "Christopher B. Granger, MD, and the GRACE investigators", bio: ["The Global Registry of Acute Coronary Events was a multinational observational study of patients admitted with acute coronary syndrome.", "The risk model was published in the Archives of Internal Medicine in 2003."] },
  pearls: ["Eight inputs: age, heart rate, systolic pressure, creatinine, Killip class, cardiac arrest, ST deviation, raised enzymes.", "A score above 140 is the usual threshold for an early invasive strategy."],
  pitfalls: ["The score is for acute coronary syndrome, not for chest pain of unknown cause.", "It is a guide: instability always overrides a low score.", "Creatinine units differ (mg/dL versus µmol/L); the calculator converts µmol/L for you."],
  formula: ["Sum the points for each of age, heart rate, systolic blood pressure, creatinine and Killip class, then add 39 for cardiac arrest at admission, 28 for ST-segment deviation and 14 for raised cardiac enzymes."],
  facts: [{ label: "Range", value: "About 1 to 372" }, { label: "Low / intermediate / high", value: "≤108 / 109–140 / >140" }],
  references: [["Granger CB et al. Predictors of hospital mortality in the Global Registry of Acute Coronary Events. Arch Intern Med 2003;163:2345-53", pm("Granger Predictors of hospital mortality in the Global Registry of Acute Coronary Events")], ["Collet JP et al. 2020 ESC guidelines for non-ST-segment elevation acute coronary syndromes. Eur Heart J 2021;42:1289-367", pm("2020 ESC Guidelines for the management of acute coronary syndromes in patients presenting without persistent ST-segment elevation")]],
});

/* TIMI --------------------------------------------------------------------------------------------------------- */
const timiInputs = [yn("age", "Age 65 or over"), yn("risk", "Three or more coronary risk factors (family history, hypertension, high cholesterol, diabetes, current smoker)"), yn("cad", "Known coronary stenosis of 50% or more"), yn("aspirin", "Aspirin taken in the past 7 days"), yn("angina", "Severe angina: two or more episodes in the last 24 hours"), yn("st", "ST-segment deviation of 0.5 mm or more"), yn("marker", "Raised cardiac marker (troponin or CK-MB)")];
const timi = spec({
  id: "timi-nstemi", name: "TIMI Risk Score for Unstable Angina and NSTEMI", shortName: "TIMI UA/NSTEMI", specialty: "Cardiology",
  description: "Estimate the 14-day risk of death, myocardial infarction or urgent revascularisation in unstable angina or NSTEMI.",
  when: "Use in an adult with unstable angina or non-ST-elevation myocardial infarction to judge short-term risk and support the choice of an earlier invasive strategy.",
  whyUseIt: "Seven yes/no items, all available at the bedside, give a quick estimate of risk that rises steadily with the score. It is simpler than GRACE and is often used alongside it.",
  popularity: 7, keywords: ["nstemi", "unstable angina", "acs", "risk"], related: ["grace", "heart-score"],
  inputs: timiInputs,
  bands: [
    [undefined, "0–2", "Lower risk", "low", "Risk of death, MI or urgent revascularisation by 14 days is about 5% to 8%.", ["Observe and complete the work-up; a non-invasive strategy or later angiography is reasonable."]],
    [3, "3–4", "Intermediate risk", "moderate", "Risk by 14 days is about 13% to 20%.", ["Consider angiography within 24 to 72 hours and intensive antithrombotic therapy."]],
    [5, "5–7", "High risk", "high", "Risk by 14 days is about 26% to 41%.", ["Early invasive strategy and intensive antithrombotic therapy; admit to a monitored unit."]],
  ],
  nextSteps: { advice: ["Use the findings at first presentation and record each item.", "Combine with GRACE and the clinical picture: score alone does not decide management."], management: [{ title: "By score", items: ["0 to 2: lower risk, continue assessment.", "3 to 4: intermediate risk, consider early angiography.", "5 to 7: high risk, early invasive strategy."] }], critical: ["Persisting pain, haemodynamic instability or arrhythmia need immediate action regardless of the score."] },
  evidenceAppraisal: ["Derived and validated in the TIMI 11B and ESSENCE trial populations (about 7 000 patients with unstable angina or NSTEMI), then confirmed in the PRISM-PLUS trial.", "Risk rises in a graded way from about 5% at a score of 0 or 1 to about 41% at 6 or 7.", "Weaknesses: items are dichotomous, so it uses less information than GRACE, and the outcome is a 14-day composite that includes urgent revascularisation, which depends on local practice."],
  creator: { name: "Elliott M. Antman, MD, and the TIMI Study Group", bio: ["The Thrombolysis in Myocardial Infarction (TIMI) Study Group is based at Brigham and Women's Hospital in Boston.", "The UA/NSTEMI risk score was published in JAMA in 2000."] },
  pearls: ["One point for each of seven bedside items.", "A score of 3 or more is generally treated as higher risk."],
  pitfalls: ["Not for STEMI, which has its own TIMI score.", "A low score does not exclude infarction in a patient with ongoing pain.", "Aspirin use in the past week is scored because it marks a patient who has already failed aspirin."],
  formula: ["Add one point for each: age 65 or over; three or more risk factors; known stenosis of 50% or more; aspirin in the past 7 days; two or more anginal episodes in 24 hours; ST deviation of 0.5 mm or more; raised cardiac marker."],
  facts: [{ label: "Range", value: "0 to 7" }, { label: "14-day risk at 0–1 / 2 / 3 / 4 / 5 / 6–7", value: "about 5% / 8% / 13% / 20% / 26% / 41%" }],
  references: [["Antman EM et al. The TIMI risk score for unstable angina/non-ST elevation MI. JAMA 2000;284:835-42", pm("Antman The TIMI risk score for unstable angina/non-ST elevation MI")]],
});

/* sPESI ------------------------------------------------------------------------------------------------------- */
const spesiInputs = [yn("age", "Age over 80 years"), yn("cancer", "History of cancer"), yn("cardiopulm", "Chronic heart failure or chronic lung disease"), yn("hr", "Heart rate 110 or more per minute"), yn("sbp", "Systolic blood pressure below 100 mmHg"), yn("spo2", "Arterial oxygen saturation below 90%")];
const spesi = spec({
  id: "spesi", name: "sPESI: Simplified Pulmonary Embolism Severity Index", shortName: "sPESI", specialty: "Respiratory medicine",
  description: "Estimate 30-day mortality after confirmed pulmonary embolism and identify patients who may be treated as outpatients.",
  when: "Use after pulmonary embolism is confirmed in a haemodynamically stable adult, to decide between early discharge and admission.",
  whyUseIt: "Six easily measured items separate a low-risk group (score 0, about 1% 30-day mortality) from a higher-risk group, and are part of the ESC risk classification.",
  popularity: 9, keywords: ["pe", "pulmonary embolism", "outpatient", "pesi"], related: ["wells-pe", "perc", "padua"],
  inputs: spesiInputs,
  bands: [
    [undefined, "0", "Low risk", "low", "30-day mortality is about 1%.", ["Outpatient treatment can be considered if there are no other reasons to admit (for example severe pain, bleeding risk, poor home support)."]],
    [1, "≥1", "Higher risk", "high", "30-day mortality is about 11%.", ["Admit and monitor; assess right ventricular function and troponin to separate intermediate-high from intermediate-low risk."]],
  ],
  nextSteps: { advice: ["Use only after confirmation of PE and when the patient is stable.", "Check the patient has a safe home environment and can take the anticoagulant before discharge."], management: [{ title: "By score", items: ["0: consider outpatient anticoagulation.", "1 or more: admit for monitoring."] }], critical: ["Hypotension, shock or right-heart strain with instability needs urgent reperfusion therapy; the score does not apply."] },
  evidenceAppraisal: ["Derived and validated in the RIETE registry (about 15 000 patients) and an external cohort; the simplified index kept the prognostic strength of the original 11-item PESI.", "Strengths: six items, no laboratory tests; weaknesses: it does not account for right ventricular dysfunction or social factors, and some high-risk patients score 0."],
  creator: { name: "David Jiménez, MD, PhD", bio: ["Pulmonologist at Ramón y Cajal Hospital in Madrid and lead author of the simplified PESI (2010)."] },
  pearls: ["Six items, one point each.", "A score of 0 supports outpatient care."], pitfalls: ["Not for unstable patients.", "A score of 0 does not remove the need to check social circumstances."],
  formula: ["One point each: age over 80; cancer; chronic cardiopulmonary disease; heart rate 110 or more; systolic pressure below 100 mmHg; oxygen saturation below 90%."],
  facts: [{ label: "Range", value: "0 to 6" }, { label: "30-day mortality, 0 / 1 or more", value: "about 1% / 11%" }],
  references: [["Jiménez D et al. Simplification of the Pulmonary Embolism Severity Index. Arch Intern Med 2010;170:1383-9", pm("Jimenez Simplification of the Pulmonary Embolism Severity Index for prognostication in patients with acute symptomatic pulmonary embolism")]],
});

/* SIRS ---------------------------------------------------------------------------------------------------------- */
const sirsInputs = [yn("temp", "Temperature above 38 °C or below 36 °C"), yn("hr", "Heart rate above 90 per minute"), yn("rr", "Respiratory rate above 20 per minute, or PaCO₂ below 32 mmHg"), yn("wbc", "White cell count above 12 000 or below 4 000 per µL, or more than 10% immature forms")];
const sirs = spec({
  id: "sirs", name: "SIRS Criteria (Systemic Inflammatory Response Syndrome)", shortName: "SIRS", specialty: "Critical care",
  description: "Count the four bedside criteria of systemic inflammation.",
  when: "Use when an adult looks unwell with a possible infection, burns, pancreatitis or trauma, to show whether there is a systemic inflammatory response.",
  whyUseIt: "Four routine observations take a minute to check. Two or more criteria show a systemic response, and it is part of the BISAP score, but it is not specific and is no longer the definition of sepsis.",
  popularity: 14, keywords: ["sepsis", "inflammation", "sirs"], related: ["qsofa-score", "sofa", "news2"],
  inputs: sirsInputs,
  bands: [
    [undefined, "0–1", "SIRS not met", "low", "Fewer than two criteria. A serious infection is not excluded.", ["Continue observation; if infection is suspected, use clinical judgement and NEWS2."]],
    [2, "≥2", "SIRS met", "moderate", "Two or more criteria show a systemic inflammatory response.", ["Look for a source of infection or another cause such as pancreatitis or burns.", "Check lactate and organ function and consider the sepsis pathway."]],
  ],
  nextSteps: { advice: ["Use SIRS with other tools: SIRS is common in non-infectious illness.", "Repeat the observations if the patient's condition changes."], management: [{ title: "If two or more criteria", items: ["Find the cause and start treatment.", "Assess for organ dysfunction (SOFA) if infection is suspected."] }], critical: ["Hypotension, confusion or lactate above 2 mmol/L needs urgent sepsis management whatever the SIRS count."] },
  evidenceAppraisal: ["Defined by consensus in 1992 (ACCP/SCCM); sensitive but not specific, and about one in eight patients with severe sepsis does not meet two criteria.", "Sepsis-3 (2016) moved to SOFA-based organ dysfunction, but SIRS is still used in several scores and some national protocols."],
  creator: { name: "Roger C. Bone, MD", bio: ["American intensivist who chaired the 1991 ACCP/SCCM consensus conference that defined SIRS and sepsis."] },
  pearls: ["Two or more of four criteria."], pitfalls: ["Common in non-infectious illness.", "Normal values do not exclude sepsis, especially in older patients."],
  formula: ["Count one for each: temperature above 38 or below 36 °C; heart rate above 90; respiratory rate above 20 or PaCO₂ below 32 mmHg; white cells above 12 000 or below 4 000 or more than 10% bands."],
  facts: [{ label: "Range", value: "0 to 4" }],
  references: [["Bone RC et al. Definitions for sepsis and organ failure. Chest 1992;101:1644-55", pm("Bone Definitions for sepsis and organ failure and guidelines for the use of innovative therapies in sepsis")]],
});

/* SOFA ---------------------------------------------------------------------------------------------------------- */
const sofaInputs = [
  choice("resp", "Respiration: PaO₂/FiO₂ (mmHg)", [["0", "400 or more", 0], ["1", "Below 400", 1], ["2", "Below 300", 2], ["3", "Below 200 with respiratory support", 3], ["4", "Below 100 with respiratory support", 4]]),
  choice("coag", "Coagulation: platelets (×10⁹/L)", [["0", "150 or more", 0], ["1", "Below 150", 1], ["2", "Below 100", 2], ["3", "Below 50", 3], ["4", "Below 20", 4]]),
  choice("liver", "Liver: bilirubin (mg/dL)", [["0", "Below 1.2", 0], ["1", "1.2 to 1.9", 1], ["2", "2.0 to 5.9", 2], ["3", "6.0 to 11.9", 3], ["4", "12 or more", 4]]),
  choice("cardio", "Cardiovascular", [["0", "Mean arterial pressure 70 mmHg or more", 0], ["1", "Mean arterial pressure below 70 mmHg", 1], ["2", "Dopamine 5 µg/kg/min or less, or any dobutamine", 2], ["3", "Dopamine above 5, or adrenaline or noradrenaline 0.1 or less", 3], ["4", "Dopamine above 15, or adrenaline or noradrenaline above 0.1", 4]]),
  choice("cns", "Central nervous system: Glasgow Coma Scale", [["0", "15", 0], ["1", "13 to 14", 1], ["2", "10 to 12", 2], ["3", "6 to 9", 3], ["4", "Below 6", 4]]),
  choice("renal", "Kidney: creatinine (mg/dL) or urine output", [["0", "Below 1.2", 0], ["1", "1.2 to 1.9", 1], ["2", "2.0 to 3.4", 2], ["3", "3.5 to 4.9, or urine under 500 mL/day", 3], ["4", "5.0 or more, or urine under 200 mL/day", 4]]),
];
const sofa = spec({
  id: "sofa", name: "SOFA Score (Sequential Organ Failure Assessment)", shortName: "SOFA", specialty: "Critical care",
  description: "Measure the degree of organ dysfunction in six systems, and identify sepsis by a rise of 2 points or more.",
  when: "Use in an adult with suspected infection, on admission to critical care and daily after, to quantify organ failure. Sepsis-3 defines sepsis as infection with an acute rise in SOFA of 2 or more.",
  whyUseIt: "It turns organ failure into a number that can be followed over days, and the Sepsis-3 definition of sepsis is built on it.",
  popularity: 10, keywords: ["sepsis", "organ failure", "icu"], related: ["qsofa-score", "sirs", "news2"],
  inputs: sofaInputs,
  bands: [
    [undefined, "0–1", "Minimal dysfunction", "low", "Little or no organ dysfunction; hospital mortality under about 5%.", ["Continue monitoring and repeat if the patient changes."]],
    [2, "2–9", "Organ dysfunction", "moderate", "An acute rise of 2 or more from baseline with infection meets the Sepsis-3 definition of sepsis.", ["Start the sepsis bundle and treat the source.", "Repeat daily to follow trend."]],
    [10, "≥10", "Severe dysfunction", "high", "Hospital mortality is above about 40%.", ["Manage in critical care with organ support; discuss goals of care early."]],
  ],
  nextSteps: { advice: ["Use the worst value in each system over the previous 24 hours.", "Compare with the patient's baseline, because chronic disease may already score points."], management: [{ title: "By score", items: ["Rise of 2 or more with infection: sepsis, urgent treatment.", "10 or more: critical care."] }], critical: ["Septic shock needs fluids, vasopressors and source control without delay."] },
  evidenceAppraisal: ["Introduced in 1996 and validated in several critical care cohorts; mortality rises steadily with the total and with its change over the first days.", "The Sepsis-3 task force (2016) used it to define sepsis, with SOFA of 2 or more linked to a mortality of at least 10%.", "Weaknesses: needs laboratory values and blood gases, so it is less useful in the field or ward than qSOFA or NEWS2."],
  creator: { name: "Jean-Louis Vincent, MD, PhD", bio: ["Intensivist at Erasme Hospital, Brussels; led the 1996 working group of the European Society of Intensive Care Medicine that proposed SOFA."] },
  pearls: ["Six systems, 0 to 4 points each.", "A rise of 2 or more with infection defines sepsis."], pitfalls: ["Use the baseline score when known.", "Respiratory points depend on blood gas results."],
  formula: ["Add the highest point value (0 to 4) in each of respiration, coagulation, liver, cardiovascular, central nervous system and kidney."],
  facts: [{ label: "Range", value: "0 to 24" }],
  references: [["Vincent JL et al. The SOFA score to describe organ dysfunction/failure. Intensive Care Med 1996;22:707-10", pm("Vincent The SOFA Sepsis-related Organ Failure Assessment score to describe organ dysfunction/failure")], ["Singer M et al. The Third International Consensus Definitions for Sepsis and Septic Shock. JAMA 2016;315:801-10", pm("Singer The Third International Consensus Definitions for Sepsis and Septic Shock Sepsis-3")]],
});

/* FIB-4 --------------------------------------------------------------------------------------------------------- */
const fib4Inputs = [numeric("age", "Age", [["years", "years"]], { min: 18, max: 100 }), numeric("ast", "AST", [["iu-l", "IU/L"]], { min: 5, max: 3000 }), numeric("alt", "ALT", [["iu-l", "IU/L"]], { min: 5, max: 3000 }), numeric("plt", "Platelet count", [["10e9-l", "×10⁹/L"]], { min: 10, max: 1000 })];
const fib4 = build({
  id: "fib-4", name: "FIB-4 Index for Liver Fibrosis", shortName: "FIB-4", specialty: "Gastroenterology",
  description: "Estimate the likelihood of advanced liver fibrosis from age, AST, ALT and platelets.",
  when: "Use in adults with chronic liver disease or risk factors (fatty liver, viral hepatitis, alcohol), to decide who needs elastography or hepatology referral.",
  whyUseIt: "Uses blood tests already done to separate people at low risk of advanced fibrosis, who can stay in primary care, from those who need further testing.",
  popularity: 12, keywords: ["fibrosis", "nafld", "masld", "hepatitis"], related: ["child-pugh", "meld-na"],
  inputs: fib4Inputs, isComplete: answered(fib4Inputs), decimals: 2,
  calculate: (i) => { const age = val(i, "age"), ast = val(i, "ast"), alt = val(i, "alt"), plt = val(i, "plt"); return age && ast && alt && plt ? (age * ast) / (plt * Math.sqrt(alt)) : 0; },
  interpret: (score, i) => {
    const age = val(i, "age") ?? 0;
    if (age >= 65 && score >= 1.3 && score < 2.0) return { id: "fib-4-elderly-low", label: "Advanced fibrosis unlikely (age 65 or over)", tone: "low", range: "1.3 to <2.0 at age 65 or over", match: {}, summary: "At age 65 or over the lower cut-off is 2.0.", management: ["Advanced fibrosis is unlikely; manage risk factors and repeat in 1 to 3 years."] };
    return undefined;
  },
  bands: [
    [undefined, "<1.3", "Advanced fibrosis unlikely", "low", "Negative predictive value is high.", ["Manage risk factors in primary care; repeat in 1 to 3 years."]],
    [1.3, "1.3–2.67", "Indeterminate", "moderate", "The result neither confirms nor excludes advanced fibrosis.", ["Do a second test such as transient elastography or the ELF test."]],
    [2.68, ">2.67", "Advanced fibrosis likely", "high", "High probability of advanced fibrosis.", ["Refer to hepatology; screen for varices and hepatocellular carcinoma as indicated."]],
  ],
  nextSteps: { advice: ["Use a second non-invasive test for results of 1.3 or more.", "Treat the cause: weight loss, alcohol, antiviral therapy."], management: [{ title: "By result", items: ["Below 1.3: primary care, repeat in 1 to 3 years.", "1.3 to 2.67: elastography.", "Above 2.67: hepatology."] }], critical: ["Signs of decompensation (jaundice, ascites, encephalopathy, bleeding) need urgent specialist care."] },
  evidenceAppraisal: ["Derived in hepatitis C and HIV co-infection (Sterling 2006) and validated in non-alcoholic fatty liver disease and other chronic liver diseases.", "Strengths: free, simple, good negative predictive value. Weaknesses: less accurate below age 35 and over 65, and in acute hepatitis."],
  creator: { name: "Richard K. Sterling, MD", bio: ["Hepatologist at Virginia Commonwealth University who developed FIB-4 in the APRICOT study."] },
  pearls: ["Needs only age, AST, ALT and platelets."], pitfalls: ["Less reliable in acute hepatitis and in those under 35 or over 65.", "Not a substitute for imaging in suspected cirrhosis."],
  formula: ["FIB-4 = (age × AST) ÷ (platelets × √ALT), with platelets in 10⁹/L."],
  facts: [{ label: "Cut-offs", value: "<1.3 low; 1.3 to 2.67 indeterminate; >2.67 high (use 2.0 as the lower cut-off at age 65 or over)" }],
  references: [["Sterling RK et al. Development of a simple noninvasive index to predict significant fibrosis in patients with HIV/HCV coinfection. Hepatology 2006;43:1317-25", pm("Sterling Development of a simple noninvasive index to predict significant fibrosis FIB-4")]],
});

/* Alvarado ------------------------------------------------------------------------------------------------------ */
const alvaradoInputs = [yn("migration", "Migration of pain to the right iliac fossa"), yn("anorexia", "Anorexia"), yn("nausea", "Nausea or vomiting"), yn("tender", "Tenderness in the right iliac fossa", 2), yn("rebound", "Rebound tenderness"), yn("temp", "Elevated temperature (37.3 °C or more)"), yn("wbc", "Leucocytosis (white cells above 10 000 per µL)", 2), yn("left", "Shift to the left (neutrophils above 75%)")];
const alvarado = spec({
  id: "alvarado", name: "Alvarado Score for Acute Appendicitis", shortName: "Alvarado", specialty: "Surgery",
  description: "Estimate the likelihood of acute appendicitis from symptoms, signs and blood results.",
  when: "Use in an adult or child with right iliac fossa pain to decide who can be observed, who needs imaging and who needs surgical review.",
  whyUseIt: "Eight items, easy to record, help decide when to image and reduce unneeded surgery in the low group.",
  popularity: 15, keywords: ["appendicitis", "abdominal pain", "mantrels"], related: ["sirs"],
  inputs: alvaradoInputs,
  bands: [
    [undefined, "0–3", "Appendicitis unlikely", "low", "Few patients with this score have appendicitis.", ["Observe or discharge with return advice if the pain settles; image if the clinical suspicion remains."]],
    [4, "4–6", "Possible appendicitis", "moderate", "Appendicitis is possible.", ["Observe with serial examination and image with ultrasound or CT."]],
    [7, "7–10", "Appendicitis probable", "high", "Appendicitis is likely.", ["Surgical review and treatment; imaging only if the diagnosis is in doubt (for example in women of reproductive age)."]],
  ],
  nextSteps: { advice: ["Repeat the examination after a few hours if the score is intermediate.", "Do not delay surgery for a very high score with peritonism."], management: [{ title: "By score", items: ["0 to 3: observe.", "4 to 6: image.", "7 to 10: surgical review."] }], critical: ["Peritonitis, sepsis or perforation need urgent surgery whatever the score."] },
  evidenceAppraisal: ["Described by Alvarado in 1986 in 305 patients; later studies show good performance for low and high scores but variable accuracy in women, children and in South Asian and African populations.", "Performance is poorer in the intermediate range, so imaging is advised there."],
  creator: { name: "Alfredo Alvarado, MD", bio: ["Peruvian surgeon who published the score in Annals of Emergency Medicine in 1986."] },
  pearls: ["Mnemonic MANTRELS."], pitfalls: ["Not validated in pregnancy.", "Less accurate in women and children."],
  formula: ["Right iliac fossa tenderness 2; leucocytosis 2; migration, anorexia, nausea or vomiting, rebound, fever and left shift 1 each."],
  facts: [{ label: "Range", value: "0 to 10" }],
  references: [["Alvarado A. A practical score for the early diagnosis of acute appendicitis. Ann Emerg Med 1986;15:557-64", pm("Alvarado A practical score for the early diagnosis of acute appendicitis")]],
});

/* Centor / McIsaac -------------------------------------------------------------------------------------------------- */
const centorInputs = [yn("exudate", "Tonsillar swelling or exudate"), yn("nodes", "Tender anterior cervical lymph nodes"), yn("fever", "Fever above 38 °C by history"), yn("nocough", "No cough"), choice("age", "Age", [["child", "3 to 14 years", 1], ["adult", "15 to 44 years", 0], ["older", "45 years or more", -1]])];
const centor = spec({
  id: "centor-mcisaac", name: "Centor (McIsaac) Score for Streptococcal Pharyngitis", shortName: "Centor/McIsaac", specialty: "Primary care",
  description: "Estimate the chance that a sore throat is group A streptococcal and decide who needs testing or antibiotics.",
  when: "Use in a patient aged 3 or more with an acute sore throat, to avoid unnecessary antibiotics.",
  whyUseIt: "A short checklist that stops most patients getting antibiotics for viral throat infections and picks out who should be tested.",
  popularity: 16, keywords: ["sore throat", "pharyngitis", "strep"], related: ["sirs"],
  inputs: centorInputs,
  bands: [
    [undefined, "≤1", "Low probability", "low", "Chance of streptococcal infection is under about 10%.", ["No test and no antibiotic; give symptomatic care and safety-net advice."]],
    [2, "2–3", "Intermediate probability", "moderate", "Chance is about 11% to 35%.", ["Use a rapid antigen test or culture; treat only if positive."]],
    [4, "≥4", "High probability", "high", "Chance is about 51%.", ["Test, and consider treatment while awaiting the result."]],
  ],
  nextSteps: { advice: ["Check for red flags: stridor, drooling, trismus, unilateral swelling."], management: [{ title: "By score", items: ["Up to 1: no antibiotic.", "2 to 3: test.", "4 or more: test and consider treating."] }], critical: ["Airway compromise, peritonsillar abscess and sepsis need urgent hospital care."] },
  evidenceAppraisal: ["The Centor criteria (1981) were modified by McIsaac in 1998 by adding age, and validated in Canadian primary care (over 600 patients).", "Strengths: high negative predictive value at low scores; weaknesses: moderate positive predictive value, so testing is still needed."],
  creator: { name: "Warren McIsaac, MD, and Robert Centor, MD", bio: ["The original criteria were described by Robert Centor in 1981; McIsaac modified them in 1998."] },
  pearls: ["Age 3 to 14 adds a point; 45 or more subtracts one."], pitfalls: ["Not for children under 3.", "Rheumatic fever risk is higher in some populations and may need a lower threshold to treat."],
  formula: ["One point for each of exudate, tender nodes, fever, no cough; age 3 to 14 +1, age 45 or more −1."],
  facts: [{ label: "Range", value: "−1 to 5" }],
  references: [["McIsaac WJ et al. A clinical score to reduce unnecessary antibiotic use in patients with sore throat. CMAJ 1998;158:75-83", pm("McIsaac A clinical score to reduce unnecessary antibiotic use in patients with sore throat")]],
});

/* PHQ-9 and GAD-7 ------------------------------------------------------------------------------------------------ */
const freq = (id: string, label: string) => choice(id, label, [["0", "Not at all", 0], ["1", "Several days", 1], ["2", "More than half the days", 2], ["3", "Nearly every day", 3]]);
const phqInputs = [["interest", "Little interest or pleasure in doing things"], ["down", "Feeling down, depressed or hopeless"], ["sleep", "Trouble falling or staying asleep, or sleeping too much"], ["tired", "Feeling tired or having little energy"], ["appetite", "Poor appetite or overeating"], ["failure", "Feeling bad about yourself, or that you are a failure"], ["concentrate", "Trouble concentrating on things"], ["slow", "Moving or speaking so slowly that others notice, or being fidgety or restless"], ["selfharm", "Thoughts that you would be better off dead, or of hurting yourself"]].map(([id, label]) => freq(id, label));
const phq9 = spec({
  id: "phq-9", name: "PHQ-9 Depression Severity Questionnaire", shortName: "PHQ-9", specialty: "Psychiatry",
  description: "Screen for depression and measure its severity from nine questions about the last two weeks.",
  when: "Use to screen for depression, to grade it at diagnosis, and to follow response to treatment.",
  whyUseIt: "Free, short, validated in many languages and cultures, and the same nine items map to the diagnostic criteria for major depression.",
  popularity: 5, keywords: ["depression", "mood", "screening", "mental health"], related: ["gad-7"],
  inputs: phqInputs,
  bands: [
    [undefined, "0–4", "None or minimal", "low", "No or minimal depressive symptoms.", ["No treatment needed; repeat if symptoms appear."]],
    [5, "5–9", "Mild", "low", "Mild depressive symptoms.", ["Watchful waiting, self-help and repeat the questionnaire in 2 to 4 weeks."]],
    [10, "10–14", "Moderate", "moderate", "Moderate depression; a score of 10 or more has about 88% sensitivity and specificity for major depression.", ["Offer psychological therapy or medicine and arrange follow-up."]],
    [15, "15–19", "Moderately severe", "high", "Moderately severe depression.", ["Start active treatment with medicine, psychological therapy or both."]],
    [20, "20–27", "Severe", "high", "Severe depression.", ["Start treatment now and refer to mental health services."]],
  ],
  nextSteps: { advice: ["Ask directly about thoughts of self-harm whenever item 9 scores above 0, and assess risk the same day.", "Repeat at each visit; a fall of 5 points is a clinically meaningful improvement."], management: [{ title: "By severity", items: ["Mild: watchful waiting and support.", "Moderate: therapy or medicine.", "Severe: both, with specialist input."] }], critical: ["Any answer above 0 on item 9 needs a same-day risk assessment and a safety plan; immediate danger needs emergency help."] },
  evidenceAppraisal: ["Validated in over 6 000 patients in primary care and obstetric clinics (Kroenke 2001); a cut-off of 10 gives sensitivity and specificity of 88% for major depression.", "It is a screening and severity tool, not a diagnosis: diagnosis needs a clinical interview."],
  creator: { name: "Kurt Kroenke, MD, Robert Spitzer, MD, and Janet Williams, DSW", bio: ["Developed the PHQ from the PRIME-MD instrument; validated and published in 2001."] },
  pearls: ["Nine items scored 0 to 3."], pitfalls: ["Item 9 needs a direct clinical response.", "Cultural and language factors affect scores."],
  formula: ["Sum the nine items, each scored 0 (not at all), 1 (several days), 2 (more than half the days) or 3 (nearly every day)."],
  facts: [{ label: "Range", value: "0 to 27" }],
  references: [["Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med 2001;16:606-13", pm("Kroenke The PHQ-9 validity of a brief depression severity measure")]],
});
const gadInputs = [["nervous", "Feeling nervous, anxious or on edge"], ["control", "Not being able to stop or control worrying"], ["worry", "Worrying too much about different things"], ["relax", "Trouble relaxing"], ["restless", "Being so restless that it is hard to sit still"], ["irritable", "Becoming easily annoyed or irritable"], ["afraid", "Feeling afraid as if something awful might happen"]].map(([id, label]) => freq(id, label));
const gad7 = spec({
  id: "gad-7", name: "GAD-7 Anxiety Severity Questionnaire", shortName: "GAD-7", specialty: "Psychiatry",
  description: "Screen for generalised anxiety and measure its severity from seven questions about the last two weeks.",
  when: "Use to screen for anxiety in primary care and to follow response to treatment.",
  whyUseIt: "Seven items give a quick, validated severity score; 10 or more is the usual threshold for further assessment.",
  popularity: 13, keywords: ["anxiety", "screening", "mental health"], related: ["phq-9"],
  inputs: gadInputs,
  bands: [
    [undefined, "0–4", "Minimal", "low", "Minimal anxiety.", ["No treatment needed."]],
    [5, "5–9", "Mild", "low", "Mild anxiety.", ["Monitor, offer self-help and repeat."]],
    [10, "10–14", "Moderate", "moderate", "Moderate anxiety; a score of 10 or more has about 89% sensitivity and 82% specificity for generalised anxiety disorder.", ["Further assessment and consider therapy or medicine."]],
    [15, "15–21", "Severe", "high", "Severe anxiety.", ["Active treatment and specialist referral as needed."]],
  ],
  nextSteps: { advice: ["Rule out physical causes such as thyroid disease and substance use.", "Ask about depression: PHQ-9 is often scored at the same visit."], management: [{ title: "By severity", items: ["Mild: self-help.", "Moderate: therapy or medicine.", "Severe: both, with specialist input."] }], critical: ["Ask about self-harm and suicidal thoughts whenever anxiety is severe."] },
  evidenceAppraisal: ["Validated in primary care (Spitzer 2006, about 2 700 patients); a cut-off of 10 gives sensitivity of 89% and specificity of 82% for generalised anxiety disorder.", "It also detects panic, social anxiety and post-traumatic stress disorder with moderate accuracy."],
  creator: { name: "Robert L. Spitzer, MD, Kurt Kroenke, MD, Janet B. W. Williams, DSW and Bernd Löwe, MD", bio: ["Published in the Archives of Internal Medicine in 2006."] },
  pearls: ["Seven items scored 0 to 3."], pitfalls: ["Screens; does not diagnose."],
  formula: ["Sum seven items, each scored 0 to 3."], facts: [{ label: "Range", value: "0 to 21" }],
  references: [["Spitzer RL et al. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med 2006;166:1092-7", pm("Spitzer A brief measure for assessing generalized anxiety disorder the GAD-7")]],
});

/* Bishop ------------------------------------------------------------------------------------------------------------ */
const bishopInputs = [
  choice("dil", "Cervical dilation", [["0", "Closed", 0], ["1", "1 to 2 cm", 1], ["2", "3 to 4 cm", 2], ["3", "5 cm or more", 3]]),
  choice("eff", "Effacement", [["0", "0% to 30%", 0], ["1", "40% to 50%", 1], ["2", "60% to 70%", 2], ["3", "80% or more", 3]]),
  choice("stn", "Station of the fetal head", [["0", "−3", 0], ["1", "−2", 1], ["2", "−1 or 0", 2], ["3", "+1 or +2", 3]]),
  choice("con", "Cervical consistency", [["0", "Firm", 0], ["1", "Medium", 1], ["2", "Soft", 2]]),
  choice("pos", "Cervical position", [["0", "Posterior", 0], ["1", "Mid", 1], ["2", "Anterior", 2]]),
];
const bishop = spec({
  id: "bishop", name: "Bishop Score for Cervical Ripeness", shortName: "Bishop", specialty: "Obstetrics",
  description: "Assess cervical readiness for labour and predict the success of induction.",
  when: "Use before induction of labour at term to decide whether cervical ripening is needed first.",
  whyUseIt: "A five-item examination score that predicts how likely induction is to lead to vaginal birth.",
  popularity: 17, keywords: ["induction", "labour", "cervix"], related: [],
  inputs: bishopInputs,
  bands: [
    [undefined, "≤6", "Unfavourable cervix", "high", "Induction is less likely to succeed.", ["Use cervical ripening (prostaglandin or mechanical method) before oxytocin."]],
    [7, "7", "Borderline", "moderate", "Between unfavourable and favourable.", ["Individualise: ripening or induction according to the clinical situation."]],
    [8, "≥8", "Favourable cervix", "low", "Likelihood of vaginal birth is similar to spontaneous labour.", ["Proceed to amniotomy or oxytocin as appropriate."]],
  ],
  nextSteps: { advice: ["Record the examination in the notes and repeat as the plan requires.", "Confirm the indication and gestation before induction."], management: [{ title: "By score", items: ["6 or less: ripening first.", "8 or more: amniotomy or oxytocin."] }], critical: ["Do not use prostaglandins in a patient with a uterine scar without senior obstetric advice."] },
  evidenceAppraisal: ["Described by Bishop in 1964 in 500 multiparous women; modified versions are in use. It predicts induction success moderately, and ultrasound cervical length is an alternative."],
  creator: { name: "Edward H. Bishop, MD", bio: ["American obstetrician; published the score in Obstetrics & Gynecology in 1964."] },
  pearls: ["Five items: dilation, effacement, station, consistency, position."], pitfalls: ["Examination is subjective.", "Predicts success less well in nulliparous women."],
  formula: ["Add the points for dilation, effacement, station, consistency and position."], facts: [{ label: "Range", value: "0 to 13" }],
  references: [["Bishop EH. Pelvic scoring for elective induction. Obstet Gynecol 1964;24:266-8", pm("Bishop Pelvic scoring for elective induction")]],
});

/* Apgar ------------------------------------------------------------------------------------------------------------ */
const apgarInputs = [
  choice("app", "Appearance (colour)", [["0", "Blue or pale all over", 0], ["1", "Body pink, limbs blue", 1], ["2", "Pink all over", 2]]),
  choice("pulse", "Pulse", [["0", "Absent", 0], ["1", "Below 100 per minute", 1], ["2", "100 or more per minute", 2]]),
  choice("grim", "Grimace (reflex irritability)", [["0", "No response", 0], ["1", "Grimace", 1], ["2", "Cough, sneeze or cry", 2]]),
  choice("act", "Activity (muscle tone)", [["0", "Limp", 0], ["1", "Some flexion", 1], ["2", "Active movement", 2]]),
  choice("resp", "Respiration", [["0", "Absent", 0], ["1", "Weak or irregular", 1], ["2", "Strong cry", 2]]),
];
const apgar = spec({
  id: "apgar", name: "Apgar Score", shortName: "Apgar", specialty: "Neonatology",
  description: "Describe how well a newborn is adapting at 1 and 5 minutes after birth.",
  when: "Use at 1 and 5 minutes after birth, and every 5 minutes up to 20 minutes if the score is 7 or less.",
  whyUseIt: "A shared, quick language for the condition of a newborn. It describes the baby but should never delay resuscitation.",
  popularity: 18, keywords: ["newborn", "neonate", "birth"], related: ["silverman"],
  inputs: apgarInputs,
  bands: [
    [undefined, "0–3", "Low", "high", "The baby is severely depressed.", ["Start or continue resuscitation according to the neonatal resuscitation guideline."]],
    [4, "4–6", "Moderately abnormal", "moderate", "The baby needs help.", ["Stimulate, give airway support and oxygen as needed; reassess."]],
    [7, "7–10", "Normal", "low", "The baby is adapting well.", ["Routine care and skin-to-skin contact."]],
  ],
  nextSteps: { advice: ["Resuscitate on the baby's condition, not the Apgar score; do not wait until 1 minute."], management: [{ title: "By score", items: ["0 to 3: resuscitate.", "4 to 6: support and reassess.", "7 to 10: routine care."] }], critical: ["A 5-minute score of 7 or less needs repeat scoring every 5 minutes and senior review."] },
  evidenceAppraisal: ["Introduced in 1953; a low 5-minute score is associated with neonatal mortality and neurological outcome but has poor specificity for later cerebral palsy.", "It is affected by gestation, medication and the examiner."],
  creator: { name: "Virginia Apgar, MD", bio: ["American anaesthesiologist who proposed the score in 1952 and published it in 1953."] },
  pearls: ["Five items, 0 to 2 points each."], pitfalls: ["Do not delay resuscitation to calculate the score.", "Preterm babies score lower for tone."],
  formula: ["Add the points for appearance, pulse, grimace, activity and respiration."], facts: [{ label: "Range", value: "0 to 10" }],
  references: [["Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg 1953;32:260-7", pm("Apgar A proposal for a new method of evaluation of the newborn infant")]],
});

/* BISAP ------------------------------------------------------------------------------------------------------------ */
const bisapInputs = [yn("bun", "Blood urea nitrogen above 25 mg/dL (urea above 9 mmol/L)"), yn("mental", "Impaired mental status"), yn("sirs", "SIRS: two or more criteria"), yn("age", "Age above 60 years"), yn("pleural", "Pleural effusion on imaging")];
const bisap = spec({
  id: "bisap", name: "BISAP Score for Acute Pancreatitis", shortName: "BISAP", specialty: "Gastroenterology",
  description: "Predict in-hospital mortality in acute pancreatitis from five items in the first 24 hours.",
  when: "Use within 24 hours of admission with acute pancreatitis to find patients at higher risk.",
  whyUseIt: "Five easy items give a graded estimate of risk early, when other scores need 48 hours of data.",
  popularity: 19, keywords: ["pancreatitis", "severity"], related: ["sirs"],
  inputs: bisapInputs,
  bands: [
    [undefined, "0–2", "Lower risk", "low", "In-hospital mortality is under 2%.", ["Standard ward care with fluids, analgesia and early feeding."]],
    [3, "≥3", "Higher risk", "high", "In-hospital mortality is about 4% to 9%, with a higher risk of organ failure.", ["Consider a high-dependency or critical care review and careful fluid resuscitation."]],
  ],
  nextSteps: { advice: ["Treat on the clinical picture: organ failure at any time defines severe pancreatitis."], management: [{ title: "By score", items: ["Lower: ward care.", "Higher: monitor closely and consider critical care."] }], critical: ["Persistent organ failure beyond 48 hours needs intensive care."] },
  evidenceAppraisal: ["Derived from over 17 000 admissions and validated in a further 18 000 (Wu 2008). Predictive accuracy is similar to APACHE II and Ranson, with simpler data."],
  creator: { name: "Bechien U. Wu, MD, MPH", bio: ["Gastroenterologist who derived BISAP at Massachusetts General Hospital."] },
  pearls: ["Five items, one point each."], pitfalls: ["Does not replace judgement; low scores do not exclude severe disease."],
  formula: ["One point each: BUN above 25 mg/dL; impaired mental status; SIRS; age above 60; pleural effusion."],
  facts: [{ label: "In-hospital mortality at 0 / 1 / 2 / 3 / 4 / 5", value: "about 0.1% / 0.4% / 1.6% / 3.6% / 7.4% / 9.5%" }, { label: "Range", value: "0 to 5" }],
  references: [["Wu BU et al. The early prediction of mortality in acute pancreatitis: a large population-based study. Gut 2008;57:1698-703", pm("Wu The early prediction of mortality in acute pancreatitis BISAP")]],
});

/* Maddrey ------------------------------------------------------------------------------------------------------------ */
const maddreyInputs = [numeric("pt", "Patient prothrombin time", [["s", "seconds"]], { min: 8, max: 120 }), numeric("ctl", "Control prothrombin time", [["s", "seconds"]], { min: 8, max: 20 }), numeric("bili", "Total bilirubin", [["mg-dl", "mg/dL"], ["umol-l", "µmol/L", 0.0585]], { min: 0.1, max: 60 })];
const maddrey = build({
  id: "maddrey", name: "Maddrey Discriminant Function for Alcohol-Associated Hepatitis", shortName: "Maddrey DF", specialty: "Gastroenterology",
  description: "Identify severe alcohol-associated hepatitis that may benefit from corticosteroids.",
  when: "Use in a patient with suspected alcohol-associated hepatitis (jaundice, raised AST and bilirubin, recent heavy drinking) to grade severity.",
  whyUseIt: "A value of 32 or more marks severe disease with high short-term mortality and is the traditional threshold for considering prednisolone.",
  popularity: 20, keywords: ["alcohol", "hepatitis", "steroids"], related: ["meld-na", "child-pugh"],
  inputs: maddreyInputs, isComplete: answered(maddreyInputs), decimals: 1,
  calculate: (i) => { const pt = val(i, "pt"), ctl = val(i, "ctl"), b = val(i, "bili"); return pt === undefined || ctl === undefined || b === undefined ? 0 : 4.6 * (pt - ctl) + b; },
  bands: [
    [undefined, "<32", "Not severe", "low", "Short-term mortality is lower.", ["Supportive care, nutrition, alcohol cessation and thiamine."]],
    [32, "≥32", "Severe", "high", "Short-term mortality is about 30% to 50% without treatment.", ["Check for infection and kidney injury, then consider prednisolone 40 mg daily for 28 days; use the Lille score at day 7 to judge response."]],
  ],
  nextSteps: { advice: ["Exclude infection, gastrointestinal bleeding and kidney injury before steroids.", "Assess nutrition and treat alcohol withdrawal."], management: [{ title: "If 32 or more", items: ["Consider prednisolone for 28 days if there is no contraindication.", "Check the Lille score on day 7."] }], critical: ["Active infection or gastrointestinal bleeding is a contraindication to steroids until treated."] },
  evidenceAppraisal: ["Described by Maddrey in 1978 and used as the entry criterion in many corticosteroid trials; benefit of steroids is modest (28-day survival) and does not extend beyond 28 days (STOPAH 2015).", "MELD and Glasgow alcoholic hepatitis score are alternatives with similar performance."],
  creator: { name: "Willis C. Maddrey, MD", bio: ["American hepatologist who described the discriminant function in 1978."] },
  pearls: ["A value of 32 or more is severe."], pitfalls: ["Prothrombin times differ between laboratories; use the lab's control value.", "Steroid benefit is limited."],
  formula: ["DF = 4.6 × (patient PT − control PT in seconds) + bilirubin (mg/dL)."], facts: [{ label: "Threshold", value: "32 or more" }],
  references: [["Maddrey WC et al. Corticosteroid therapy of alcoholic hepatitis. Gastroenterology 1978;75:193-9", pm("Maddrey Corticosteroid therapy of alcoholic hepatitis")]],
});

/* PRAM --------------------------------------------------------------------------------------------------------------- */
const pramInputs = [
  choice("spo2", "Oxygen saturation", [["0", "95% or more", 0], ["1", "92% to 94%", 1], ["2", "Below 92%", 2]]),
  choice("supra", "Suprasternal retraction", [["0", "Absent", 0], ["2", "Present", 2]]),
  choice("scalene", "Scalene muscle contraction", [["0", "Absent", 0], ["2", "Present", 2]]),
  choice("air", "Air entry", [["0", "Normal", 0], ["1", "Decreased at the bases", 1], ["2", "Decreased at the apex and bases", 2], ["3", "Minimal or absent", 3]]),
  choice("wheeze", "Wheeze", [["0", "Absent", 0], ["1", "Expiratory only", 1], ["2", "Inspiratory and expiratory", 2], ["3", "Audible without stethoscope, or silent chest", 3]]),
];
const pram = spec({
  id: "pram", name: "PRAM Score for Paediatric Asthma", shortName: "PRAM", specialty: "Paediatrics",
  description: "Grade the severity of an acute asthma attack in a child aged 3 to 17 and judge response to treatment.",
  when: "Use at triage and again after treatment in a child with an acute asthma attack.",
  whyUseIt: "Five objective signs give a repeatable severity grade that links to treatment and disposition.",
  popularity: 21, keywords: ["asthma", "child", "wheeze"], related: [],
  inputs: pramInputs,
  bands: [
    [undefined, "0–3", "Mild", "low", "Mild attack.", ["Give an inhaled bronchodilator via spacer and consider oral steroid; discharge if well after treatment."]],
    [4, "4–7", "Moderate", "moderate", "Moderate attack.", ["Give repeated bronchodilator doses, oral steroid and oxygen if saturation is below 92%; reassess within an hour."]],
    [8, "8–12", "Severe", "high", "Severe attack.", ["Oxygen, nebulised bronchodilator with ipratropium, steroid; senior review and consider admission to a high-dependency unit."]],
  ],
  nextSteps: { advice: ["Repeat after each treatment to judge response."], management: [{ title: "By score", items: ["Mild: spacer and steroid.", "Moderate: repeated bronchodilator and steroid.", "Severe: oxygen, nebulisers, steroid and senior review."] }], critical: ["Silent chest, exhaustion, cyanosis or altered consciousness need immediate senior and critical care help."] },
  evidenceAppraisal: ["Developed in Canada (Chalut 2000) and validated in children aged 3 to 6 years, with later studies in older children; scores correlate with admission and treatment response."],
  creator: { name: "Dennis S. Chalut, MD", bio: ["Canadian paediatric emergency physician who developed PRAM at the Montreal Children's Hospital."] },
  pearls: ["Five items: saturation, retractions, scalene use, air entry, wheeze."], pitfalls: ["Observer variation in wheeze and air entry."],
  formula: ["Add the points for each of the five signs."], facts: [{ label: "Range", value: "0 to 12" }],
  references: [["Chalut DS et al. The Preschool Respiratory Assessment Measure (PRAM): a responsive index of acute asthma severity. J Pediatr 2000;137:762-8", pm("Chalut The Preschool Respiratory Assessment Measure PRAM")]],
});

/* Silverman ------------------------------------------------------------------------------------------------------------ */
const silvInputs = [
  choice("upper", "Upper chest movement", [["0", "Synchronised with abdomen", 0], ["1", "Lag on inspiration", 1], ["2", "See-saw breathing", 2]]),
  choice("lower", "Lower chest retraction", [["0", "None", 0], ["1", "Just visible", 1], ["2", "Marked", 2]]),
  choice("xiph", "Xiphoid retraction", [["0", "None", 0], ["1", "Just visible", 1], ["2", "Marked", 2]]),
  choice("nasal", "Nasal flaring", [["0", "None", 0], ["1", "Minimal", 1], ["2", "Marked", 2]]),
  choice("grunt", "Expiratory grunt", [["0", "None", 0], ["1", "Heard with a stethoscope", 1], ["2", "Heard without a stethoscope", 2]]),
];
const silverman = spec({
  id: "silverman", name: "Silverman–Andersen Retraction Score (newborn respiratory distress)", shortName: "Silverman", specialty: "Neonatology",
  description: "Grade respiratory distress in a newborn from five signs of the work of breathing.",
  when: "Use in a newborn with fast breathing, grunting or retractions, and repeat to follow the trend.",
  whyUseIt: "A bedside score that needs no equipment and that standardises how distress is described in nurseries and referral letters.",
  popularity: 22, keywords: ["newborn", "respiratory distress", "neonate"], related: ["apgar"],
  inputs: silvInputs,
  bands: [
    [undefined, "0", "No distress", "low", "No respiratory distress.", ["Routine care."]],
    [1, "1–3", "Mild distress", "low", "Mild respiratory distress.", ["Observe closely, keep warm, check saturation and glucose; reassess in 30 minutes."]],
    [4, "4–6", "Moderate distress", "moderate", "Moderate respiratory distress.", ["Give oxygen or CPAP according to local guideline and look for the cause; involve the neonatal team."]],
    [7, "≥7", "Severe distress", "high", "Severe distress or impending respiratory failure.", ["Start respiratory support (CPAP or ventilation) and transfer to neonatal intensive care."]],
  ],
  nextSteps: { advice: ["Check temperature, glucose and saturation in every baby with distress."], management: [{ title: "By score", items: ["1 to 3: observe.", "4 to 6: support and find the cause.", "7 or more: ventilatory support."] }], critical: ["Grunting with cyanosis or apnoea needs immediate neonatal resuscitation skills."] },
  evidenceAppraisal: ["Described in 1956 for premature infants; widely used in nurseries in India and elsewhere. It has not been validated as a stand-alone predictor, so treatment decisions rest on the whole picture."],
  creator: { name: "William A. Silverman, MD, and Dorothy H. Andersen, MD", bio: ["Described the retraction score in a 1956 controlled trial of water mist in newborns."] },
  pearls: ["Five items, 0 to 2 points each."], pitfalls: ["Preterm babies may show retractions with normal lungs; use the trend."],
  formula: ["Add the points for upper chest movement, lower chest retraction, xiphoid retraction, nasal flaring and grunt."], facts: [{ label: "Range", value: "0 to 10" }],
  references: [["Silverman WA, Andersen DH. A controlled clinical trial of effects of water mist on obstructive respiratory signs. Pediatrics 1956;17:1-10", pm("Silverman Andersen A controlled clinical trial of effects of water mist on obstructive respiratory signs")]],
});

/* ABCD2 ----------------------------------------------------------------------------------------------------------------- */
const abcdInputs = [yn("age", "Age 60 or over"), yn("bp", "Blood pressure 140/90 mmHg or higher at first assessment"), choice("clin", "Clinical features", [["none", "Neither", 0], ["speech", "Speech disturbance without weakness", 1], ["weak", "Unilateral weakness", 2]]), choice("dur", "Duration of symptoms", [["short", "Under 10 minutes", 0], ["mid", "10 to 59 minutes", 1], ["long", "60 minutes or more", 2]]), yn("dm", "Diabetes")];
const abcd2 = spec({
  id: "abcd2", name: "ABCD² Score for Stroke Risk after TIA", shortName: "ABCD²", specialty: "Neurology",
  description: "Estimate the risk of stroke in the 2 days after a transient ischaemic attack.",
  when: "Use after a suspected TIA to judge urgency of assessment and investigation.",
  whyUseIt: "Five items predict early stroke risk; the high group needs the fastest assessment.",
  popularity: 23, keywords: ["tia", "stroke", "transient ischaemic attack"], related: ["cha2ds2-vasc"],
  inputs: abcdInputs,
  bands: [
    [undefined, "0–3", "Low risk", "low", "Risk of stroke at 2 days is about 1%.", ["Specialist assessment within 24 hours to 7 days according to local guidance."]],
    [4, "4–5", "Moderate risk", "moderate", "Risk of stroke at 2 days is about 4%.", ["Specialist assessment within 24 hours; start antiplatelet treatment."]],
    [6, "6–7", "High risk", "high", "Risk of stroke at 2 days is about 8%.", ["Urgent specialist assessment and brain and vascular imaging the same day; start antiplatelet treatment unless contraindicated."]],
  ],
  nextSteps: { advice: ["Current guidelines advise urgent assessment for all suspected TIA, whatever the score.", "Arrange brain and carotid imaging and ECG monitoring for atrial fibrillation."], management: [{ title: "Every suspected TIA", items: ["Aspirin (or per local guideline) after excluding haemorrhage.", "Urgent specialist review.", "Risk factor control."] }], critical: ["Persisting deficit is a stroke and needs emergency treatment."] },
  evidenceAppraisal: ["Derived from population cohorts and validated in a combined analysis (Johnston 2007); discrimination for 2-day stroke is moderate (c-statistic about 0.7), so it is not used to withhold urgent assessment."],
  creator: { name: "S. Claiborne Johnston, MD, PhD", bio: ["Neurologist and dean who led the validation of ABCD² at the University of California, San Francisco."] },
  pearls: ["Age, blood pressure, clinical features, duration, diabetes."], pitfalls: ["Does not include imaging or atrial fibrillation, which also predict risk."],
  formula: ["Age 60 or over 1; BP 140/90 or more 1; unilateral weakness 2 or speech disturbance 1; duration 60 minutes or more 2 or 10 to 59 minutes 1; diabetes 1."], facts: [{ label: "Range", value: "0 to 7" }],
  references: [["Johnston SC et al. Validation and refinement of scores to predict very early stroke risk after TIA. Lancet 2007;369:283-92", pm("Johnston Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack")]],
});

/* Parkland ---------------------------------------------------------------------------------------------------------------- */
const parklandInputs = [numeric("wt", "Weight", [["kg", "kg"]], { min: 3, max: 250 }), numeric("tbsa", "Burn size (percentage of body surface area, partial and full thickness)", [["pct", "%"]], { min: 1, max: 100 })];
const parkland = build({
  id: "parkland", name: "Parkland Formula for Burn Fluid Resuscitation", shortName: "Parkland", specialty: "Emergency medicine",
  description: "Estimate the crystalloid volume for the first 24 hours after a major burn.",
  when: "Use in an adult or child with a burn over more than 15% (adults) or 10% (children) of body surface area to plan starting fluid.",
  whyUseIt: "Gives a safe starting rate that is then adjusted to urine output; under- and over-resuscitation both cause harm.",
  popularity: 24, keywords: ["burns", "fluid", "resuscitation", "tbsa"], related: [],
  inputs: parklandInputs, isComplete: answered(parklandInputs),
  calculate: (i) => { const w = val(i, "wt"), t = val(i, "tbsa"); return w === undefined || t === undefined ? 0 : 4 * w * t; },
  secondary: (i) => { const w = val(i, "wt"), t = val(i, "tbsa"); if (w === undefined || t === undefined) return []; const total = 4 * w * t; return [{ label: "First 8 hours (from time of burn)", value: `${Math.round(total / 2)} mL`, note: `about ${Math.round(total / 16)} mL/hour` }, { label: "Next 16 hours", value: `${Math.round(total / 2)} mL`, note: `about ${Math.round(total / 32)} mL/hour` }]; },
  unit: "mL in 24 hours",
  bands: [[undefined, "All", "Starting volume", "moderate", "This is a starting estimate; adjust hourly to urine output.", ["Give Ringer's lactate; half in the first 8 hours from the time of burn, half in the next 16.", "Target urine output about 0.5 mL/kg/h in adults and 1 mL/kg/h in children, and adjust the rate up or down by about 10% each hour."]]],
  nextSteps: { advice: ["Estimate burn size with the rule of nines or Lund-Browder chart; count only partial and full-thickness burns.", "Start the clock at the time of injury, not hospital arrival."], management: [{ title: "Titration", items: ["Check urine output hourly.", "Reduce the rate if output is above target; increase it if below."] }], critical: ["Inhalation injury, electrical burns and very large burns need burns-centre advice and often more fluid."] },
  evidenceAppraisal: ["Described by Baxter and Shires at Parkland Hospital in 1968. Modern practice often starts lower (2 to 4 mL/kg/% TBSA) because over-resuscitation causes compartment syndrome and respiratory failure; the formula is a starting point."],
  creator: { name: "Charles R. Baxter, MD", bio: ["American surgeon at Parkland Memorial Hospital, Dallas, who described the formula with Tom Shires."] },
  pearls: ["4 mL × kg × %TBSA over 24 hours."], pitfalls: ["Do not count superficial burns.", "Titrate to urine output, not to the formula."],
  formula: ["Total fluid in 24 hours = 4 mL × weight (kg) × % TBSA burnt. Half in the first 8 hours, half in the next 16 hours."], facts: [{ label: "Fluid", value: "Ringer's lactate" }],
  references: [["Baxter CR, Shires T. Physiological response to crystalloid resuscitation of severe burns. Ann N Y Acad Sci 1968;150:874-94", pm("Baxter Shires Physiological response to crystalloid resuscitation of severe burns")]],
});

export const scoreCalculators: ClinicalCalculatorSchema[] = [grace, timi, spesi, sirs, sofa, fib4, alvarado, centor, phq9, gad7, bishop, apgar, bisap, maddrey, pram, silverman, abcd2, parkland];
