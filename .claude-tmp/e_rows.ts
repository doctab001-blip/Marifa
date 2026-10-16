// Additional investigation rows for topics authored on 14 Oct 2026. Every row cites a recommendation or page
// that was re-read in the source on 14 Oct 2026. Where a source does not name a test, the row says so.
export type Tier = "laboratory" | "firstLineImaging" | "advancedImaging" | "specializedAdjunctive";
type Ref = { title: string; url: string };
const NG203: Ref = { title: "NICE NG203: Chronic kidney disease: assessment and management", url: "https://www.nice.org.uk/guidance/ng203" };
const NG19: Ref = { title: "NICE NG19: Diabetic foot problems: prevention and management", url: "https://www.nice.org.uk/guidance/ng19" };
const NG232: Ref = { title: "NICE NG232: Head injury: assessment and early management", url: "https://www.nice.org.uk/guidance/ng232" };
const NG106: Ref = { title: "NICE NG106: Chronic heart failure in adults: diagnosis and management", url: "https://www.nice.org.uk/guidance/ng106" };
const NG238: Ref = { title: "NICE NG238: Cardiovascular disease: risk assessment and reduction, including lipid modification", url: "https://www.nice.org.uk/guidance/ng238" };
const NG136: Ref = { title: "NICE NG136: Hypertension in adults: diagnosis and management", url: "https://www.nice.org.uk/guidance/ng136" };
const NG3: Ref = { title: "NICE NG3: Diabetes in pregnancy: management from preconception to the postnatal period", url: "https://www.nice.org.uk/guidance/ng3" };
const SDCPG: Ref = { title: "Saudi Diabetes Clinical Practice Guidelines (Saudi National Diabetes Center / Saudi Health Council)", url: "https://www.moh.gov.sa/Ministry/MediaCenter/Publications/Documents/Saudi-Diabetes-Clinical-Practice-Guidelines.pdf" };

const row = (tier: Tier, testName: string, modalityTarget: string, targetCondition: string, normalValue: string, expectedFinding: string, clinicalRationale: string, ref: Ref, edition: string) => ({
  tier, testName, modalityTarget, targetCondition, normalValue, expectedFinding, clinicalRationale, references: [{ title: ref.title, edition, url: ref.url }],
});
type Rows = { ruleIn?: ReturnType<typeof row>[]; ruleOut?: ReturnType<typeof row>[] };

const acr = (edition: string) => row("laboratory", "Spot urine albumin:creatinine ratio (ACR)", "Random spot urine sample, with eGFR", "Diabetic kidney disease", "ACR below 3 mg/mmol (30 mg/g)",
  "ACR 3 mg/mmol or more on repeat testing suggests kidney damage", "Test at diagnosis of type 2 diabetes and at least yearly. Stage CKD with eGFR and ACR together and act on the result (see the Diabetic Kidney Disease topic).", SDCPG, edition);
const bp = (edition: string) => row("laboratory", "Blood pressure at every visit", "Clinic measurement, repeated on a separate day to confirm", "Hypertension in diabetes", "Below 140/90 mmHg",
  "140/90 mmHg or more on repeated readings, including one on a separate day", "Confirm before diagnosing hypertension. Patients with diabetes and hypertension should also monitor at home.", SDCPG, edition);

export const rows: Record<string, Rows> = {
  "gdm-postnatal": {
    ruleOut: [
      row("laboratory", "Diabetes testing before a future pregnancy", "Fasting plasma glucose or HbA1c when planning another pregnancy", "Recurrence of gestational diabetes or undiagnosed type 2 diabetes", "Fasting plasma glucose below 6.0 mmol/L (108 mg/dL); HbA1c below 39 mmol/mol (5.7%)",
        "Fasting plasma glucose 6.0 mmol/L or more, or HbA1c 39 mmol/mol or more, before conception",
        "Explain the risk of recurrence and offer testing when she plans a pregnancy. Fasting glucose 7.0 mmol/L or more means diabetes is likely; confirm with a second test.",
        NG3, "NICE NG3, Recommendations 1.6.10 and 1.6.12–1.6.13"),
    ],
  },
  dkd: {
    ruleIn: [
      row("laboratory", "Urine reagent strip for haematuria", "Reagent strip on a fresh urine sample; do not confirm with urine microscopy", "Haematuria pointing to a non-diabetic cause of CKD or urinary tract disease", "Negative (below 1+)",
        "1+ or higher on the strip; 2 of 3 positive strips confirm persistent invisible haematuria",
        "Evaluate a result of 1+ or higher. Persistent invisible haematuria, with or without proteinuria, prompts investigation for urinary tract malignancy in the appropriate age groups and a renal ultrasound.",
        NG203, "NICE NG203, Recommendations 1.1.16–1.1.19 and 1.2.5"),
      row("firstLineImaging", "Renal ultrasound", "Ultrasound of both kidneys and the urinary tract", "Obstruction, structural disease or polycystic kidneys as a cause of CKD", "Two kidneys of normal size, no hydronephrosis, stones or cysts (typical adult finding)",
        "Offer if CKD is progressing fast, haematuria is visible or persistent, obstructive symptoms are present, there is a family history of polycystic kidney disease and age is over 20, GFR is below 30 mL/min/1.73 m², or a nephrologist plans a biopsy",
        "Find treatable causes such as obstruction. Explain the implications of an abnormal result to people with a family history of hereditary kidney disease before scanning.",
        NG203, "NICE NG203, Recommendations 1.2.5–1.2.6"),
    ],
    ruleOut: [
      row("laboratory", "Haemoglobin", "Venous full blood count", "Anaemia of CKD or another cause of anaemia", "Typical adult range about 130–170 g/L (men) and 120–150 g/L (women); local ranges apply",
        "110 g/L or less, or symptoms such as tiredness, breathlessness or palpitations",
        "Investigate and manage anaemia at 110 g/L or less. With eGFR above 60 look for other causes; at 30–60 judge how far to investigate; below 30 CKD is the usual cause. Do not use transferrin saturation or ferritin alone to judge iron status in CKD anaemia.",
        NG203, "NICE NG203, Recommendations 1.7.1–1.7.4"),
    ],
  },
  "diabetic-foot": {
    ruleIn: [
      row("specializedAdjunctive", "Foot-skin temperature difference with serial weight-bearing X-ray", "Skin temperature at the same site on both feet; X-ray of the foot and ankle, MRI if the X-ray is normal", "Acute Charcot arthropathy activity",
        "Difference between the two feet of less than 2 °C, with no further change on X-ray",
        "Red, warm, swollen foot with intact skin, especially with neuropathy or renal failure; a sustained temperature difference of 2 °C or more means the Charcot process is still active",
        "Suspected Charcot: refer to the multidisciplinary foot care service within 1 working day and offer non-weight-bearing treatment. Treatment is likely to be complete when the difference stays under 2 °C and X-rays show no further progression.",
        NG19, "NICE NG19, Recommendations 1.7.2–1.7.4 and 1.7.7"),
    ],
  },
  "head-injury-adult": {
    ruleIn: [
      row("firstLineImaging", "CT cervical spine", "Non-contrast CT of the whole cervical spine with multiplanar reformats", "Cervical spine injury after head injury", "No fracture, malalignment or prevertebral swelling",
        "Scan within 1 hour if GCS is 12 or less, the person is intubated, there is blunt polytrauma involving head with chest, abdomen or pelvis, or there is clinical suspicion with age 65 or over, a dangerous mechanism, focal peripheral deficit or paraesthesia. Also scan within 1 hour if neck pain or tenderness and neck movement cannot be assessed safely, cannot be rotated 45° each way, or a predisposing condition such as axial spondyloarthritis is present",
        "Add MRI if neurological signs or symptoms suggest a cervical spine injury.",
        NG232, "NICE NG232, Recommendations 1.6.2–1.6.3 and 1.6.9"),
    ],
  },
  "hf-decompensation": {
    ruleIn: [
      row("laboratory", "Iron status: ferritin, transferrin saturation and haemoglobin", "Venous blood tests in heart failure with reduced ejection fraction", "Iron deficiency or anaemia worsening heart failure symptoms", "Ferritin 100 ng/mL or more and transferrin saturation 20% or more; haemoglobin local adult range",
        "Ferritin below 100 ng/mL or transferrin saturation below 20%, with haemoglobin below 150 g/L",
        "Consider intravenous iron in heart failure with reduced ejection fraction with these results. If iron deficiency anaemia is found, do not assume heart failure is the cause; look for other causes.",
        NG106, "NICE NG106, Recommendations 1.4.5–1.4.7"),
    ],
    ruleOut: [
      row("laboratory", "Thyroid, liver and lipid profile, HbA1c, full blood count and urinalysis", "Venous blood tests and urine dipstick, with ECG and chest X-ray", "Aggravating factors or alternative diagnoses", "TSH about 0.4–4.0 mIU/L; ALT up to about 40 U/L; HbA1c below 42 mmol/mol (6.0%); urine protein negative (typical adult values; local ranges apply)",
        "Abnormal thyroid, liver, glucose or blood count results, or proteinuria",
        "Perform an ECG and consider these tests to find aggravating factors or another diagnosis. Peak flow or spirometry also helps exclude lung disease.",
        NG106, "NICE NG106, Recommendation 1.2.12"),
    ],
  },
  "statin-initiation": {
    ruleIn: [
      row("laboratory", "Baseline assessment before a statin: smoking, alcohol, blood pressure, BMI and diabetes status", "Clinical assessment and baseline blood tests", "Modifiable risk factors and contraindications to statin treatment", "Individual targets agreed with the patient",
        "Risk factors present that raise cardiovascular risk or alter treatment choice",
        "Record all of these with the full lipid profile, renal function and transaminase before starting. Check TSH only if there are symptoms of an underactive or overactive thyroid.",
        NG238, "NICE NG238, Recommendation 1.5.5"),
    ],
    ruleOut: [
      row("laboratory", "Thyroid-stimulating hormone and screen for other secondary causes", "Venous TSH, with alcohol history, HbA1c, liver tests and urine protein", "Secondary dyslipidaemia (hypothyroidism, excess alcohol, uncontrolled diabetes, liver disease, nephrotic syndrome)", "TSH about 0.4–4.0 mIU/L (typical adult range; local range applies)",
        "Raised TSH or another secondary cause explaining the lipid result",
        "Exclude common secondary causes before specialist referral. Refer for specialist assessment if total cholesterol is above 9.0 mmol/L or non-HDL cholesterol is above 7.5 mmol/L, even without a family history.",
        NG238, "NICE NG238, Recommendations 1.4.3 and 1.4.5, 1.5.5"),
      row("specializedAdjunctive", "Familial hypercholesterolaemia assessment", "Clinical findings, full lipid profile and family history", "Familial lipid disorder", "No family history of premature cardiovascular disease; lipid profile below the thresholds that prompt referral",
        "A familial pattern is judged from clinical findings, lipid profile and family history, not from strict cut-offs alone",
        "Use the NICE familial hypercholesterolaemia guideline to decide whether to suspect and how to treat it.",
        NG238, "NICE NG238, Recommendations 1.4.2 and 1.4.4"),
    ],
  },
  "resistant-htn": {
    ruleOut: [
      row("specializedAdjunctive", "Specialist investigations for secondary causes of hypertension", "Tests chosen by the specialist for the suspected cause; NG136 does not name them", "Secondary hypertension, including phaeochromocytoma", "No features suggesting a secondary cause",
        "Signs or symptoms of a secondary cause; age under 40; suspected phaeochromocytoma (labile or postural hypotension, headache, palpitations, pallor, abdominal pain or sweating)",
        "Suspected phaeochromocytoma needs same-day specialist assessment. Under 40, seek specialist evaluation. Pressure still uncontrolled on 4 drugs at optimal tolerated doses: seek specialist advice.",
        NG136, "NICE NG136, Recommendations 1.2.12–1.2.13, 1.4.14, 1.4.52 and 1.5.3"),
    ],
  },
  "t2dm-initial": {
    ruleIn: [
      acr("Saudi Diabetes Clinical Practice Guidelines, p. 26 and p. 82"),
      bp("Saudi Diabetes Clinical Practice Guidelines, p. 26"),
      row("laboratory", "Lipid profile at diagnosis", "Venous fasting or non-fasting lipid profile", "Dyslipidaemia and cardiovascular risk in diabetes", "No fixed normal value; set an individual lipid target from cardiovascular risk (see the Dyslipidaemia topic)",
        "Obtain at diagnosis in people under 40 who are not on a statin, then every 5 years or more often if indicated",
        "Assess 10-year cardiovascular risk at least yearly in everyone with diabetes. Use the result to set the lipid target and statin intensity.",
        SDCPG, "Saudi Diabetes Clinical Practice Guidelines, pp. 25–26"),
      row("specializedAdjunctive", "Foot examination with 10 g monofilament", "Annual foot examination: sensation, pulses, skin and deformity", "Feet at risk of ulceration", "Sensation to 10 g monofilament intact at every site tested; pedal pulses palpable",
        "Loss of sensation to the monofilament, absent pulses, deformity, callus or previous ulcer",
        "Examine at diagnosis and at least yearly, more often in high-risk feet. Refer for ankle-brachial index and a specialist if there is claudication or diminished pedal pulses.",
        SDCPG, "Saudi Diabetes Clinical Practice Guidelines, pp. 81–82"),
    ],
  },
  "t2dm-intensify": {
    ruleIn: [
      acr("Saudi Diabetes Clinical Practice Guidelines, p. 26 and p. 82"),
      bp("Saudi Diabetes Clinical Practice Guidelines, p. 26"),
    ],
    ruleOut: [
      row("specializedAdjunctive", "Hypoglycaemia risk assessment", "Clinical review of risk factors at each follow-up visit", "Treatment-associated hypoglycaemia", "None of the risk factors present",
        "Insulin or insulin secretagogue use, alcohol use, impaired kidney or liver function, longer diabetes duration, polypharmacy, older age or cognitive impairment, or hypoglycaemia unawareness",
        "Use the risk to set individual glucose targets and to choose the next glucose-lowering medicine.",
        SDCPG, "Saudi Diabetes Clinical Practice Guidelines, p. 26, Table 5"),
    ],
  },
};

/** Replacement normal values for existing rows whose normal value was only "local reference range". Typical adult values; local ranges apply. */
export const normalFix: Record<string, Record<string, string>> = {
  "statin-initiation": { "Creatine kinase": "Below the laboratory upper limit of normal (about 200 U/L in many assays; varies with sex and activity). A statin is withheld if CK stays above 5 times that limit on repeat testing" },
  "t2dm-initial": { "Vitamin B12": "Above about 200 ng/L (150 pmol/L); local ranges apply" },
  "t2dm-intensify": { "Fructosamine or total glycated haemoglobin": "Fructosamine about 200–285 µmol/L (typical adult range; local range applies)" },
};
