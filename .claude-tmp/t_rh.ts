import { SRC, cite, reg, refFromReg, type Spec } from "./common.ts";
const H = "seed-htn.authoring-standard-2026-10-12-v1.json";
const NH = (ed: string) => cite(SRC.NG136, ed);
const regs = [reg(H, "Spironolactone", { indication: "Step 4 for resistant hypertension with potassium 4.5 mmol/L or less (NICE NG136 1.4.49)", sourceEdition: "NICE NG136 Recommendations 1.4.49–1.4.50 (indication and monitoring); dose from the repository's earlier label-checked hypertension topic, Section 2 (Dosage and Administration)" }), reg(H, "Indapamide"), reg(H, "Amlodipine"), reg(H, "Ramipril"), reg(H, "Losartan")];
const seen = new Set<string>();
const refs = regs.map(refFromReg).filter((x) => { if (seen.has(x.ref.url)) return false; seen.add(x.ref.url); return true; });
export const specs: Spec[] = [
{
  key: "resistant-htn", draftTitle: "Resistant Hypertension and Secondary Causes: Referral Triggers", pillar: "Chronic Care", authority: "NICE",
  scope: "Adults with hypertension that stays uncontrolled on treatment, or with features pointing to a secondary cause: how to confirm true resistance, step 4 drugs and monitoring, and when to ask for same-day or routine specialist advice. Checked against NICE NG136 (updated 26 Feb 2026) recommendations 1.2.13, 1.4.14, 1.4.16–1.4.18, 1.4.40, 1.4.46–1.4.52 and 1.5.1–1.5.3.",
  unverified: ["NICE NG136 does not say which tests to use for secondary causes (for example aldosterone and renin, renal imaging, sleep studies); no source that does was opened, so this topic stops at the referral trigger.", "No Saudi hypertension guideline was opened for this version; thresholds and drug steps are NICE NG136.", "No dose is given for alpha-blockers or beta-blockers at step 4 because the repository's hypertension topic holds none and the labels were not opened.", "Medicine doses were reused from the repository's earlier label-checked hypertension topic and were not re-opened on 14 Oct 2026.", "This topic overlaps the hypertension titration topic by design; it is the referral-focused view of the step 4 pathway.", "SFDA registration and hospital formulary availability were not independently verified."],
  mech: [
    "Resistant hypertension means pressure stays above target on the optimal tolerated doses of an ACE inhibitor or ARB plus a calcium-channel blocker plus a thiazide-like diuretic (NG136 1.4.46).",
    "Many people labelled resistant are not: a white-coat effect, poor adherence, postural hypotension or sub-optimal dosing must be excluded first (NG136 1.4.47, 1.4.40).",
    "Further diuretic therapy with low-dose spironolactone lowers pressure when potassium is 4.5 mmol/L or less, with hyperkalaemia and renal risk requiring monitoring (NG136 1.4.49–1.4.50).",
    "A secondary cause is more likely in younger people or with features such as labile pressure, headache, palpitations or pallor, so specialist evaluation is considered (NG136 1.4.14, 1.2.13, 1.5.3).",
  ],
  symptoms: ["Headache, palpitations, pallor, abdominal pain or sweating with labile or postural hypotension suggest phaeochromocytoma (NG136 1.5.3).", "New confusion, chest pain or breathlessness with very high pressure suggests accelerated hypertension (NG136 1.5.2).", "Dizziness or falls on treatment suggest postural hypotension (NG136 1.4.16)."],
  signs: ["Clinic pressure 180/120 mmHg or higher (NG136 1.5.1–1.5.2).", "Retinal haemorrhage or papilloedema (NG136 1.5.2).", "Fall in standing systolic pressure of 20 mmHg or more or diastolic 10 mmHg or more (NG136 1.4.16).", "Signs of heart failure or acute kidney injury (NG136 1.5.2)."],
  red: [
    "Clinic pressure 180/120 mmHg or higher with retinal haemorrhage, papilloedema, new confusion, chest pain, signs of heart failure or acute kidney injury: same-day specialist assessment (NG136 1.5.2).",
    "Suspected phaeochromocytoma: same-day specialist assessment (NG136 1.5.3).",
    "Clinic pressure 180/120 mmHg or higher without those features: check target organ damage as soon as possible and confirm within 7 days (NG136 1.5.1).",
    "Uncontrolled on optimal doses of four drugs: seek specialist advice (NG136 1.4.52).",
  ],
  precip: ["Missed or sub-optimal doses (NG136 1.4.40, 1.4.44).", "White-coat effect: clinic pressure above out-of-clinic readings (NG136 1.4.18).", "Postural hypotension misread as poor control (NG136 1.4.47).", "Possible secondary cause in a person under 40 (NG136 1.4.14)."],
  diffs: [
    { condition: "White-coat effect", distinguishingFeatures: "Clinic pressure higher than ABPM or HBPM; confirm with out-of-clinic readings before adding drugs (NG136 1.4.18, 1.4.47)." },
    { condition: "Poor adherence or sub-optimal dosing", distinguishingFeatures: "Discuss and support adherence and check doses are optimal before calling it resistant (NG136 1.4.40, 1.4.44)." },
    { condition: "Postural hypotension", distinguishingFeatures: "Standing fall of 20/10 mmHg or more; set targets from standing pressure (NG136 1.4.16, 1.4.47)." },
    { condition: "Secondary hypertension", distinguishingFeatures: "Under 40 or features of a secondary cause; seek specialist evaluation (NG136 1.2.13, 1.4.14)." },
  ],
  criteria: [
    { criterion: "Resistant hypertension", threshold: "Not controlled on optimal tolerated doses of an ACE inhibitor or ARB plus a calcium-channel blocker plus a thiazide-like diuretic (NG136 1.4.46)" },
    { criterion: "Before further treatment", threshold: "Confirm with ABPM or HBPM, assess postural hypotension, and discuss adherence (NG136 1.4.47)" },
    { criterion: "Step 4 drug choice", threshold: "Potassium 4.5 mmol/L or less: low-dose spironolactone; above 4.5 mmol/L: alpha-blocker or beta-blocker (NG136 1.4.49, 1.4.51)" },
    { criterion: "Specialist advice", threshold: "Uncontrolled on optimal tolerated doses of four drugs; or under 40 years; or features of a secondary cause (NG136 1.4.52, 1.4.14, 1.2.13)" },
    { criterion: "Same-day referral", threshold: "Clinic 180/120 mmHg or higher with retinal haemorrhage, papilloedema, confusion, chest pain, heart failure or acute kidney injury; or suspected phaeochromocytoma (NG136 1.5.2–1.5.3)" },
    { criterion: "Out-of-clinic targets", threshold: "ABPM or HBPM below 135/85 mmHg under 80 and below 145/85 mmHg at 80 or over (NG136 1.4.20–1.4.22)" },
  ],
  rule_in: [
    { name: "ABPM or HBPM", target: "Adult with apparently resistant hypertension", condition: "True resistance versus white-coat effect", finding: "Out-of-clinic average at or above 135/85 mmHg (under 80) confirms uncontrolled pressure (NG136 1.4.22, 1.4.47).", why: "Confirm elevated clinic readings before adding a fourth drug; ABPM and HBPM readings run about 5 mmHg lower than clinic (NG136 1.4.18, 1.4.47).", normal: "Below 135/85 mmHg (under 80); below 145/85 mmHg (80 or over)", ref: NH("Recommendations 1.4.18, 1.4.22 and 1.4.47") },
    { name: "Standing blood pressure", target: "Adult with resistant hypertension, type 2 diabetes, symptoms or aged 80 or over", condition: "Postural hypotension", finding: "Systolic fall of 20 mmHg or more, or diastolic fall of 10 mmHg or more, after 1 minute (NG136 1.1.6).", why: "Postural hypotension must be assessed before step 4 treatment (NG136 1.4.47).", normal: "Fall below 20 mmHg systolic and 10 mmHg diastolic", ref: NH("Recommendations 1.1.5–1.1.6 and 1.4.47") },
    { name: "Urine albumin:creatinine ratio, ECG and fundoscopy", target: "Adult with clinic pressure 180/120 mmHg or higher", condition: "Target organ damage", finding: "Target organ damage: consider starting or intensifying treatment at once; retinal haemorrhage or papilloedema: same-day referral (NG136 1.5.1–1.5.2).", why: "Carry out investigations for target organ damage as soon as possible (NG136 1.3.3, 1.5.1).", normal: "Urine ACR below 3 mg/mmol (30 mg/g); normal ECG; normal fundi", ref: NH("Recommendations 1.3.3 and 1.5.1–1.5.2") },
  ],
  rule_out: [
    { name: "Sodium, potassium and renal function", target: "Adult before and within 1 month of step 4 diuretic therapy", condition: "Hyperkalaemia and renal impairment on spironolactone", finding: "Potassium above 4.5 mmol/L favours an alpha-blocker or beta-blocker; take care with reduced eGFR (NG136 1.4.49, 1.4.51).", why: "Monitor within 1 month of starting further diuretic therapy and repeat as needed (NG136 1.4.50).", normal: "Potassium 3.5–5.0 mmol/L; eGFR 60 mL/min/1.73 m² or more", ref: NH("Recommendations 1.4.49–1.4.51") },
    { name: "Medicines and adherence review", target: "Adult not at target", condition: "Non-adherence and non-optimal doses", finding: "Missed or sub-optimal doses explain apparent resistance (NG136 1.4.40, 1.4.44).", why: "Discuss adherence and support it before next-step treatment (NG136 1.4.40, 1.4.47).", normal: "Taking all medicines as prescribed at optimal tolerated doses", tier: "specializedAdjunctive", ref: NH("Recommendations 1.4.40, 1.4.44 and 1.4.47") },
  ],
  steps: [
    { id: "urgent", title: "Same-day triage", timeframe: "Every visit with pressure 180/120 mmHg or higher", actions: ["Refer the same day for retinal haemorrhage, papilloedema, new confusion, chest pain, signs of heart failure, acute kidney injury or suspected phaeochromocytoma (NG136 1.5.2–1.5.3).", "Without those features, check target organ damage as soon as possible and confirm within 7 days by repeat clinic pressure or ABPM or HBPM with review (NG136 1.5.1)."] },
    { id: "confirm", title: "Confirm true resistance", timeframe: "Before any fourth drug", actions: ["Check the person is on optimal tolerated doses of an ACE inhibitor or ARB, a calcium-channel blocker and a thiazide-like diuretic (NG136 1.4.44, 1.4.46).", "Confirm with ABPM or HBPM, assess postural hypotension and discuss adherence (NG136 1.4.47)."] },
    { id: "secondary", title: "Consider a secondary cause", timeframe: "At diagnosis and when resistance is confirmed", actions: ["Under 40 with hypertension: consider specialist evaluation of secondary causes (NG136 1.4.14).", "Signs or symptoms of a secondary cause: consider specialist investigations (NG136 1.2.13).", "Suspected phaeochromocytoma: same-day referral (NG136 1.5.3)."] },
    { id: "step4", title: "Step 4 treatment", timeframe: "When resistance is confirmed", actions: ["Consider adding a fourth drug or seeking specialist advice (NG136 1.4.48).", "Potassium 4.5 mmol/L or less: consider low-dose spironolactone; use caution with reduced eGFR (NG136 1.4.49).", "Potassium above 4.5 mmol/L: consider an alpha-blocker or beta-blocker (NG136 1.4.51).", "Monitor sodium, potassium and renal function within 1 month of starting the further diuretic (NG136 1.4.50)."] },
    { id: "specialist", title: "Specialist advice", timeframe: "If uncontrolled on four optimal drugs", actions: ["Seek specialist advice if pressure remains uncontrolled on optimal tolerated doses of four drugs (NG136 1.4.52).", "Take the out-of-clinic readings, medicine list and doses and renal function results to the referral."] },
  ],
  meds: { status: "source-verified", regimens: regs, note: "NICE NG136 gives drug classes and steps without doses; starting doses are from the repository's earlier label-checked hypertension topic. Step 4 spironolactone was off-label at March 2019 (NG136 1.4.49). Alpha-blocker and beta-blocker doses are not given here. ACE inhibitors and ARBs must not be used in pregnancy unless absolutely necessary. SFDA registration was not verified. Check hospital formulary." },
  teach: {
    objectives: ["Confirm true resistant hypertension before adding a fourth drug.", "Choose step 4 treatment by potassium and know the triggers for specialist advice."],
    keyPoints: ["Resistant means uncontrolled on optimal tolerated doses of ACE inhibitor or ARB, CCB and thiazide-like diuretic.", "Confirm with ABPM or HBPM, check postural hypotension and adherence first.", "Spironolactone if potassium 4.5 mmol/L or less; alpha- or beta-blocker above 4.5.", "Specialist advice after four optimal drugs, under age 40 or suspected secondary cause."],
    pitfalls: ["Adding a fourth drug without confirming out-of-clinic pressure.", "Starting spironolactone without checking potassium and renal function, then monitoring within 1 month.", "Missing phaeochromocytoma features that need same-day referral.", "Treating postural hypotension as uncontrolled hypertension."],
    refs: [{ ref: SRC.NG136, edition: "NICE NG136, updated 26 Feb 2026", locator: "Recommendations 1.2.13, 1.4.14, 1.4.16–1.4.18, 1.4.40, 1.4.46–1.4.52, 1.5.1–1.5.3" }, ...refs],
  },
  edu: ["Explain why pressure checks outside the clinic and adherence checks come before another drug (NG136 1.4.47).", "Teach home blood pressure measurement and the symptoms that need urgent care (NG136 1.4.19, 1.5.2)."],
  life: ["Reduce salt and alcohol, avoid excess caffeine, stop smoking, keep active and a healthy weight (NG136 1.4.2–1.4.7).", "Check supplements and over-the-counter medicines that may raise pressure with the clinician."],
  mdt: ["Same-day specialist assessment for the red flags above (NG136 1.5.2–1.5.3).", "Specialist advice for four-drug resistance, age under 40 or a suspected secondary cause (NG136 1.4.52, 1.4.14, 1.2.13).", "Pharmacist support for adherence."],
  discharge: ["True resistance confirmed with out-of-clinic readings and adherence discussed.", "Step 4 drug started with a blood test booked within 1 month, or specialist referral made.", "Written plan for the symptoms that need same-day care."],
  follow: "Review the response to step 4 treatment with sodium, potassium and renal function within 1 month, repeat as needed, and give an annual review of pressure, symptoms and medicines (NG136 1.4.24, 1.4.50).",
},
];
