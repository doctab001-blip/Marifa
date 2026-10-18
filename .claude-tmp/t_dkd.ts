import { SRC, cite, reg, refFromReg, type Spec } from "./common.ts";
const NG203 = { title: "NICE NG203: Chronic kidney disease: assessment and management", url: "https://www.nice.org.uk/guidance/ng203" };
const N = (loc: string) => cite(NG203, `NICE NG203, ${loc}`);
const S = (loc: string) => cite(SRC.SDCPG, `Saudi Diabetes Clinical Practice Guidelines, ${loc}`);
const H = "seed-htn.authoring-standard-2026-10-12-v1.json";
const F = "t2dm-pathway.authoring-standard-2026-10-12-v1.json";
const raas = "NICE NG203 Recommendations 1.6.4, 1.6.7 and 1.6.12–1.6.21 (indication and monitoring); starting dose from the repository's earlier label-checked topic, Section 2 (Dosage and Administration)";
const regs = [
  reg(H, "Ramipril", { indication: "Diabetes with CKD and ACR 3 mg/mmol or more, titrated to the highest licensed tolerated dose (NICE NG203 1.6.7)", sourceEdition: raas }),
  reg(H, "Losartan", { indication: "Diabetes with CKD and ACR 3 mg/mmol or more when an ACE inhibitor is not tolerated (NICE NG203 1.6.4, 1.6.7)", sourceEdition: raas }),
  reg(F, "Dapagliflozin", { indication: "Add-on to optimised ACE inhibitor or ARB in CKD with type 2 diabetes and eGFR 20 mL/min/1.73 m² or more (NICE NG203 1.6.9; SDCPG eGFR above 30 and urine albumin above 30 mg/g)", sourceEdition: "NICE NG203 Recommendation 1.6.9 and TA1075; SDCPG pp. 83 (indication); dose from the repository's earlier type 2 diabetes topic, FDA label Section 2 (Dosage and Administration)" }),
  reg(F, "Empagliflozin", { indication: "Alternative SGLT2 inhibitor add-on in CKD (NICE NG203 1.6.9 and TA942; SDCPG p. 83)", sourceEdition: "NICE NG203 Recommendation 1.6.9 and TA942; SDCPG p. 83 (indication); dose from the repository's earlier type 2 diabetes topic, FDA label Section 2 (Dosage and Administration)" }),
];
const seen = new Set<string>();
const refs = regs.map(refFromReg).filter((x) => { if (seen.has(x.ref.url)) return false; seen.add(x.ref.url); return true; });
export const specs: Spec[] = [
{
  key: "dkd", draftTitle: "Diabetic Kidney Disease: ACR Screening and Management", pillar: "Chronic Care", authority: "SHC",
  scope: "Adults with type 1 or type 2 diabetes: urine ACR and eGFR screening, CKD classification, ACE inhibitor or ARB and SGLT2 inhibitor treatment, blood pressure targets, monitoring after starting treatment, and when to refer to a nephrologist. Checked against the Saudi Diabetes Clinical Practice Guidelines chronic kidney disease section (printed pp. 82–84) and NICE NG203 recommendations 1.1.8–1.1.21, 1.2.1, 1.3.4–1.3.7, 1.5.5, 1.6.1–1.6.21 and Tables 1–2.",
  unverified: ["SDCPG Table 13 (CKD stages) is an image and was not read; classification here follows NICE NG203 Table 1.", "SDCPG expresses ACR in mg/g and mg/mmol; conversions here use 1 mg/mmol ≈ 8.8 mg/g and are approximate, so laboratory units must be checked.", "NICE NG203 recommendations on anaemia, mineral bone disease and conservative care were not reviewed.", "Finerenone (NG203 1.6.10) is named, not summarised, and no dose is given.", "ACE inhibitor, ARB and SGLT2 inhibitor doses were reused from the repository's earlier label-checked hypertension and diabetes topics and were not re-opened on 14 Oct 2026; NICE says titrate to the highest licensed tolerated dose.", "SFDA registration and hospital formulary availability were not independently verified."],
  mech: [
    "In Saudi Arabia diabetes is the leading cause of chronic kidney disease; kidney disease in diabetes can be diabetic nephropathy, ischaemic nephropathy or hypertensive nephrosclerosis (SDCPG p. 82).",
    "Albuminuria and a falling eGFR together multiply the risk of adverse outcomes, so CKD is classified by GFR and ACR category (NG203 1.2.1).",
    "ACE inhibitors and ARBs lower albuminuria and slow progression when ACR is raised, and SGLT2 inhibitors add benefit on progression and cardiovascular events (SDCPG p. 83; NG203 1.6.7, 1.6.9).",
    "Atypical features (active urinary sediment, rapidly increasing albuminuria, rapidly falling eGFR, or no retinopathy in type 1 diabetes) suggest another or additional kidney disease and call for nephrology review (SDCPG p. 83).",
  ],
  symptoms: ["Usually none until advanced; detection depends on annual testing (SDCPG p. 82).", "Foamy urine, leg swelling or reduced urine output in advanced disease.", "Symptoms of uraemia or fluid overload when eGFR is very low."],
  signs: ["Blood pressure above the individual target (NG203 1.6.1–1.6.2).", "Oedema and signs of fluid overload.", "Retinopathy, which in type 1 diabetes supports a diabetic cause (SDCPG p. 83)."],
  red: [
    "Rapid loss of kidney function, or a sustained fall in eGFR of 25% or more with a change in category within 12 months, or 15 mL/min/1.73 m² or more per year: refer (NG203 1.5.5; SDCPG p. 83).",
    "Active urinary sediment (red or white cells or casts), nephrotic syndrome, or an ACR rising rapidly: consider nephrology and possible biopsy (SDCPG p. 83).",
    "Potassium 6.0 mmol/L or more on an ACE inhibitor or ARB after other hyperkalaemic drugs are stopped: stop the ACE inhibitor or ARB (NG203 1.6.18).",
    "eGFR below 30 mL/min/1.73 m²: refer to a nephrologist for evaluation for renal replacement treatment (SDCPG p. 83).",
  ],
  precip: ["Poor glucose and blood pressure control (SDCPG p. 83).", "Nephrotoxic drugs: NSAIDs, aminoglycosides, contrast media (SDCPG p. 83; NG203 1.3.10).", "Previous acute kidney injury, smoking, cardiovascular disease and urinary outflow obstruction (NG203 1.3.9)."],
  diffs: [
    { condition: "Diabetic nephropathy", distinguishingFeatures: "Persistent albuminuria with retinopathy, gradual eGFR decline, bland urine sediment (SDCPG pp. 82–83)." },
    { condition: "Other or additional kidney disease", distinguishingFeatures: "Active sediment, nephrotic syndrome, rapidly rising ACR, rapidly falling eGFR, or no retinopathy in type 1 diabetes; consider nephrology and biopsy (SDCPG p. 83)." },
    { condition: "Hypertensive or ischaemic nephrosclerosis", distinguishingFeatures: "Hypertension or renovascular disease with little albuminuria; suspected renal artery stenosis needs referral (SDCPG p. 82; NG203 1.5.5)." },
  ],
  criteria: [
    { criterion: "Screening", threshold: "At least annually, urine ACR and eGFR (CKD-EPI) in all type 2 diabetes, in type 1 diabetes of more than 5 years, and in any diabetes with hypertension; at diagnosis of type 2 diabetes (SDCPG p. 82); NICE: test everyone with diabetes (NG203 1.1.14, 1.1.21)" },
    { criterion: "CKD diagnosis", threshold: "SDCPG: eGFR below 60 mL/min/1.73 m² and/or ACR 2.0 mg/mmol or more on at least two of three samples over 3 months; NICE: confirmed ACR 3 mg/mmol or more is clinically important proteinuria (SDCPG p. 83; NG203 1.1.13)" },
    { criterion: "Confirm the first result", threshold: "ACR 3–70 mg/mmol: repeat on an early morning sample; no repeat if 70 mg/mmol or more; confirm eGFR below 60 within 2 weeks (NG203 1.1.8, 1.1.12)" },
    { criterion: "Offer ACE inhibitor or ARB", threshold: "Diabetes and CKD with ACR 3 mg/mmol or more, titrated to the highest licensed tolerated dose (NG203 1.6.7); SDCPG: ACR 30–299 mg/g modestly raised, strongly recommended if ACR 300 mg/g or more or eGFR below 60 (SDCPG p. 83)" },
    { criterion: "SGLT2 inhibitor", threshold: "NICE: add-on to optimised ACE inhibitor or ARB with eGFR 20–44, or 45–90 with ACR 22.6 mg/mmol or more or type 2 diabetes; SDCPG: eGFR above 30 and albumin above 30 mg/g (NG203 1.6.9; SDCPG p. 83)" },
    { criterion: "Blood pressure target (NICE)", threshold: "ACR under 70 mg/mmol: clinic below 140/90 mmHg (systolic 120–139); ACR 70 mg/mmol or more: below 130/80 mmHg (systolic 120–129) (NG203 1.6.1–1.6.2)" },
    { criterion: "Refer to a nephrologist", threshold: "ACR 70 mg/mmol or more (unless caused by diabetes and already treated); ACR over 30 mg/mmol with haematuria; sustained eGFR fall; 4 drugs without BP control; 5-year kidney failure risk over 5% (NG203 1.5.5); SDCPG also eGFR below 30 or ACR persistently over 60 mg/mmol (p. 83–84)" },
  ],
  rule_in: [
    { name: "Spot urine albumin:creatinine ratio (ACR) and eGFR (CKD-EPI)", target: "Every adult with diabetes at diagnosis of type 2, then at least annually", condition: "Diabetic kidney disease", finding: "ACR 3 mg/mmol or more confirmed on repeat is clinically important proteinuria; eGFR below 60 confirmed within 2 weeks indicates CKD (NG203 1.1.8, 1.1.13).", why: "Use ACR, not protein:creatinine, for initial detection; confirm values of 3–70 mg/mmol on an early morning sample (NG203 1.1.12). Reagent strips only if they report ACR (NG203 1.1.11).", normal: "ACR below 3 mg/mmol (30 mg/g); eGFR 90 mL/min/1.73 m² or more", ref: N("Recommendations 1.1.8, 1.1.11–1.1.14; SDCPG p. 82") },
    { name: "Classification by GFR and ACR category", target: "Adult with confirmed CKD", condition: "Risk of adverse outcomes", finding: "Higher ACR and lower GFR categories multiply risk and set monitoring frequency (NG203 1.2.1, Tables 1–2).", why: "Minimum eGFR checks per year: for example 1 for G3a with A1–A2 and 2 for G3a with A3, 3 for G4 with A3, 4 or more for G5; tailor to cause and progression (NG203 Table 2).", normal: "G1–G2 with ACR below 3 mg/mmol: no CKD without other markers of damage", tier: "specializedAdjunctive", ref: N("Recommendation 1.2.1 and Tables 1–2") },
    { name: "Kidney Failure Risk Equation (4-variable)", target: "Adult with CKD", condition: "Risk of needing renal replacement therapy", finding: "5-year risk above 5% is a referral criterion (NG203 1.5.5).", why: "Give people their 5-year risk and document the discussion (NG203 1.5.1–1.5.4).", normal: "5-year risk of 5% or less", tier: "specializedAdjunctive", ref: N("Recommendations 1.5.1–1.5.5") },
  ],
  rule_out: [
    { name: "Serum potassium and eGFR after starting an ACE inhibitor or ARB", target: "Adult starting or increasing a renin–angiotensin antagonist", condition: "Hyperkalaemia and unsafe creatinine rise", finding: "eGFR fall of 25% or more or creatinine rise of 30% or more: investigate other causes such as volume depletion or NSAIDs; potassium 6.0 mmol/L or more: stop (NG203 1.6.18, 1.6.21).", why: "Measure before starting, 1–2 weeks after, and after each dose increase; do not change the dose if the eGFR fall is under 25% or creatinine rise under 30% (NG203 1.6.14, 1.6.19–1.6.20).", normal: "Potassium 3.5–5.0 mmol/L; eGFR fall below 25%; creatinine rise below 30%", ref: N("Recommendations 1.6.14–1.6.21; SDCPG p. 83") },
    { name: "Clinic blood pressure", target: "Adult with diabetes and CKD", condition: "Uncontrolled hypertension speeding progression", finding: "Above the individual target (NICE 130/80 or 140/90 by ACR); SDCPG asks for optimised control (NG203 1.6.1–1.6.2).", why: "Referral if above target despite at least 4 antihypertensive medicines at therapeutic doses (NG203 1.5.5).", normal: "Below 140/90 mmHg; below 130/80 mmHg if ACR is 70 mg/mmol or more", ref: N("Recommendations 1.6.1–1.6.2 and 1.5.5") },
  ],
  steps: [
    { id: "screen", title: "Screen", timeframe: "At diagnosis of type 2 diabetes and at least annually", actions: ["Measure spot urine ACR and eGFR (CKD-EPI) in all type 2 diabetes, in type 1 diabetes of more than 5 years, and in any diabetes with hypertension (SDCPG p. 82).", "Send an early morning ACR if the first result is 3–70 mg/mmol; repeat eGFR within 2 weeks if below 60 (NG203 1.1.8, 1.1.12)."] },
    { id: "classify", title: "Classify and set monitoring", timeframe: "When CKD is confirmed", actions: ["Classify by GFR and ACR category and agree the monitoring frequency with the person (NG203 1.2.1, 1.3.1, 1.3.4).", "Identify the rate of progression with at least 3 eGFR values over at least 90 days; accelerated progression is a fall of 25% or more with a category change within 12 months, or 15 mL/min/1.73 m² per year (NG203 1.3.5–1.3.6)."] },
    { id: "treat", title: "Treat", timeframe: "As soon as ACR is 3 mg/mmol or more", actions: ["Optimise glucose and blood pressure; avoid nephrotoxic drugs such as NSAIDs, aminoglycosides and contrast media (SDCPG p. 83; NG203 1.3.10).", "Offer an ACE inhibitor or ARB titrated to the highest licensed tolerated dose; do not combine them (NG203 1.6.7, 1.6.12).", "Add an SGLT2 inhibitor in type 2 diabetes if eGFR allows; add a GLP-1 receptor agonist with proven cardiovascular benefit if an SGLT2 inhibitor is not tolerated or eGFR is below 30 (NG203 1.6.9; SDCPG p. 83).", "Protein intake 0.8 g/kg a day in non-dialysis CKD (SDCPG p. 83)."] },
    { id: "monitor", title: "Monitor the ACE inhibitor or ARB", timeframe: "Before, 1–2 weeks after and after each dose increase", actions: ["Measure potassium and eGFR at those points (NG203 1.6.14).", "Do not routinely start if potassium is above 5.0 mmol/L (NG203 1.6.15).", "Stop if potassium reaches 6.0 mmol/L or more with other causes removed; if eGFR falls 25% or more or creatinine rises 30% or more, look for other causes (NG203 1.6.18, 1.6.21)."] },
    { id: "metformin", title: "Metformin and eGFR", timeframe: "At each eGFR result", actions: ["Contraindicated at eGFR below 30 mL/min/1.73 m²; do not start below 45 and reassess benefit and risk at that level (SDCPG p. 84).", "Stop temporarily at or before iodinated contrast imaging when eGFR is 30–60 (SDCPG p. 84)."] },
    { id: "refer", title: "Refer", timeframe: "When any threshold is met", actions: ["Use the NICE and SDCPG referral criteria in the criteria table (NG203 1.5.5; SDCPG pp. 83–84).", "Discuss by letter, call or virtual meeting if there are concerns but referral is not needed (NG203 1.5.7)."] },
  ],
  comparison: {
    title: "Saudi Diabetes Clinical Practice Guidelines versus NICE NG203",
    columns: ["SDCPG (Saudi)", "NICE NG203"],
    rows: [
      { parameter: "CKD diagnosis by ACR", values: ["ACR 2.0 mg/mmol or more on 2 of 3 samples in 3 months, or eGFR below 60 (p. 83)", "Confirmed ACR 3 mg/mmol or more (1.1.13)"] },
      { parameter: "ACE inhibitor or ARB", values: ["Modestly raised ACR 30–299 mg/g; strongly if 300 mg/g or more or eGFR below 60; not for normotensive normal ACR (p. 83)", "Diabetes and ACR 3 mg/mmol or more, to highest tolerated dose (1.6.7)"] },
      { parameter: "SGLT2 inhibitor", values: ["eGFR above 30 and albumin above 30 mg/g (p. 83)", "eGFR 20–44, or 45–90 with ACR 22.6 mg/mmol or more or type 2 diabetes (1.6.9)"] },
      { parameter: "Nephrology referral", values: ["ACR persistently above 60 mg/mmol; eGFR below 30; uncertain cause; rapid decline; BP not at target (pp. 83–84)", "ACR 70 mg/mmol or more; 5-year risk above 5%; sustained eGFR fall; 4 drugs without BP control (1.5.5)"] },
    ],
    note: "Units differ: 3 mg/mmol is about 30 mg/g, so the two ACR thresholds for CKD (2.0 and 3 mg/mmol) are close but not identical. Check the laboratory's reporting units before applying a threshold.",
  },
  meds: { status: "source-verified", regimens: regs, note: "NICE NG203 recommends titrating the ACE inhibitor or ARB to the highest licensed dose the person can tolerate and gives no doses; starting doses are from the repository's earlier label-checked topics. Never combine an ACE inhibitor with an ARB (NG203 1.6.12). Finerenone is a NICE technology appraisal option and is not summarised here. SFDA registration was not verified. Check hospital formulary." },
  teach: {
    objectives: ["Screen for and classify diabetic kidney disease using ACR and eGFR.", "Start and monitor an ACE inhibitor or ARB and an SGLT2 inhibitor, and recognise referral triggers."],
    keyPoints: ["Annual ACR and eGFR in everyone with type 2 diabetes.", "ACR 3 mg/mmol or more in diabetes: ACE inhibitor or ARB at the highest tolerated dose.", "Check potassium and eGFR 1–2 weeks after each change.", "eGFR below 30: metformin contraindicated and nephrology referral."],
    pitfalls: ["Relying on dipstick protein instead of ACR.", "Stopping an ACE inhibitor for an eGFR fall under 25% or creatinine rise under 30%.", "Combining an ACE inhibitor and an ARB.", "Missing atypical features that need nephrology review."],
    refs: [{ ref: SRC.SDCPG, edition: "Saudi Diabetes Clinical Practice Guidelines", locator: "Chronic kidney disease section, printed pp. 82–84" }, { ref: NG203, edition: "NICE NG203", locator: "Recommendations 1.1.8–1.1.21, 1.2.1, 1.3.4–1.3.7, 1.5.5, 1.6.1–1.6.21; Tables 1–2" }, ...refs],
  },
  edu: ["Explain that diabetes is the commonest cause of kidney disease in Saudi Arabia and that early treatment slows it (SDCPG p. 82).", "Explain why potassium and kidney blood tests are needed after starting the tablets (NG203 1.6.13).", "Share the 5-year risk of needing kidney replacement treatment and document the discussion (NG203 1.5.1–1.5.4)."],
  life: ["Control glucose and blood pressure and stop smoking (SDCPG p. 83; NG203 1.3.9).", "Avoid NSAIDs, aminoglycosides and unnecessary contrast (SDCPG p. 83).", "Protein 0.8 g/kg a day in non-dialysis CKD (SDCPG p. 83)."],
  mdt: ["Nephrologist for the referral criteria above (NG203 1.5.5; SDCPG pp. 83–84).", "Dietitian for protein and potassium advice.", "Ophthalmology for retinopathy screening, which supports the diabetic cause (SDCPG p. 83)."],
  discharge: ["ACR, eGFR and category documented with a monitoring schedule.", "ACE inhibitor or ARB started with a blood test booked at 1–2 weeks (NG203 1.6.14).", "Referral made or care plan agreed if a referral threshold is met (NG203 1.5.9)."],
  follow: "Monitor eGFR at the minimum frequency set by the GFR and ACR category and tailor to progression and treatment changes; check potassium and eGFR 1–2 weeks after each renin–angiotensin dose change (NG203 1.3.4, 1.6.14, Table 2).",
},
];
