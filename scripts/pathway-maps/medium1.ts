import type { PathwayMap } from "./types";

const one = (id: string, label: string, entry: string, rows: PathwayMap["rows"]): PathwayMap => ({ id, branches: [[label, entry]], rows });

export const maps: PathwayMap[] = [
  {
    id: "acne-vulgaris",
    branches: [
      ["First-line 12-week treatment", "Adult with acne of any severity"],
      ["Moderate to severe acne", "Adult with moderate to severe acne"],
      ["Severe acne resistant to standard therapy", "Adult with severe acne resistant to standard therapy, under specialist care"],
    ],
    rows: [
      [0, 0, "Topical treatment", "all"],
      [1, 1, "Oral antibiotic", "pref", undefined, { genericName: "Doxycycline", dose: "100 mg daily" }],
      [1, 1, "Oral antibiotic", "alt", "Chosen instead of doxycycline", { genericName: "Lymecycline", dose: "408 mg daily" }],
      [0, 1, "Topical treatment", "pref"],
      [2, 1, "Topical treatment", "alt", "Chosen instead of the fixed adapalene–benzoyl peroxide combination", { genericName: "Azelaic acid" }],
      [3, 2, "Specialist treatment", "all"],
    ],
  },
  {
    id: "acute-appendicitis",
    branches: [
      ["Complicated appendicitis — mild to moderate, community-acquired", "Adult with complicated appendicitis acquired in the community, mild to moderate"],
      ["Complicated appendicitis — severe", "Adult with severe infection or septic shock, or an older or immunocompromised adult"],
      ["Oral step-down", "Adult improving and eating"],
    ],
    rows: [
      [0, 0, "Antibiotic", "all"],
      [1, 1, "Antibiotic", "all"],
      [2, 2, "Oral antibiotic", "all"],
    ],
  },
  {
    id: "acute-asthma-exacerbation-in-children-ed-pathway",
    branches: [
      ["Initial bronchodilation", "Child aged 2–12 years with acute bronchospasm"],
      ["Moderate or severe attack", "Child with a PRAM-directed moderate or severe attack"],
      ["Refractory severe attack", "Child with PRAM 8–12 after initial treatment, needing critical-care escalation"],
    ],
    rows: [
      [0, 0, "Reliever", "all"],
      [2, 1, "Anticholinergic", "all"],
      [1, 1, "Systemic steroid", "all"],
      [3, 2, "Magnesium", "all"],
    ],
  },
  {
    id: "acute-heart-failure-exacerbation-in-the-community-diuretic-t",
    branches: [
      ["Congestion — titrate the oral loop diuretic", "Adult with chronic heart failure and congestion"],
      ["Poor response to the loop diuretic", "Adult with diuretic resistance"],
    ],
    rows: [
      [0, 0, "Loop diuretic", "all"],
      [1, 1, "Mineralocorticoid receptor antagonist", "all"],
    ],
  },
  {
    id: "acute-kidney-injury",
    branches: [
      ["Hyperkalaemia with ECG changes", "Adult with hyperkalaemia and ECG changes"],
      ["Moderate or severe hyperkalaemia", "Adult with moderate or severe hyperkalaemia"],
    ],
    rows: [
      [0, 0, "Membrane stabilisation", "all"],
      [1, 1, "Shift potassium into cells", "all"],
      [2, 1, "Adjunct", "all"],
      [3, 1, "Remove potassium", "all", "Potassium of 6.0 or more"],
    ],
  },
  {
    id: "acute-soft-tissue-injuries-and-sprains-ottawa-rules-and-refe",
    branches: [
      ["Pain from a sprain or strain", "Adult with pain from a sprain or strain"],
      ["Swelling from a sprain or strain", "Adult with swelling from a sprain or strain"],
    ],
    rows: [
      [0, 0, "Oral analgesic", "pref"],
      [1, 0, "Oral analgesic", "alt", "Chosen instead of paracetamol"],
      [2, 1, "Topical anti-inflammatory", "all", undefined, { genericName: "Ibuprofen topical gel" }],
    ],
  },
  {
    id: "acute-upper-gastrointestinal-bleeding",
    branches: [
      ["Suspected variceal bleeding", "Adult with suspected variceal bleeding"],
      ["High-risk ulcer stigmata after endoscopy", "Adult with high-risk ulcer stigmata after endoscopy"],
      ["Warfarin with active major bleeding", "Adult on warfarin with active major bleeding"],
    ],
    rows: [
      [0, 0, "Vasoactive drug", "all"],
      [1, 0, "Infection prophylaxis", "all", "Cirrhosis"],
      [2, 1, "Acid suppression", "all"],
      [3, 2, "Reversal", "all"],
    ],
  },
  {
    id: "advanced-heart-failure-supportive-care",
    branches: [
      ["Breathlessness", "Opioid-naïve adult with advanced heart failure and breathlessness"],
      ["Congestion", "Adult with advanced heart failure and congestion"],
    ],
    rows: [
      [0, 0, "Opioid", "all"],
      [1, 1, "Loop diuretic", "all"],
    ],
  },
  {
    id: "anaemia-in-pregnancy-screening-and-treatment",
    branches: [
      ["Iron deficiency anaemia — first line", "Pregnant or postnatal woman with iron deficiency anaemia"],
      ["Oral iron not tolerated or not working", "Pregnant (from the second trimester) or postnatal woman not responding to or intolerant of oral iron"],
    ],
    rows: [
      [0, 0, "Oral iron", "all"],
      [1, 1, "Intravenous iron", "pref"],
      [2, 1, "Intravenous iron", "alt", "Chosen instead of ferric carboxymaltose"],
    ],
  },
  {
    id: "antenatal-care-for-uncomplicated-pregnancy",
    branches: [
      ["Folic acid", "All pregnant women in the first trimester"],
      ["Iron supplementation", "Pregnant woman needing iron supplementation"],
    ],
    rows: [
      [0, 0, "Supplement", "all"],
      [1, 1, "Iron", "pref", undefined, { genericName: "Ferrous fumarate" }],
      [1, 1, "Iron", "alt", "Chosen instead of ferrous fumarate", { genericName: "Ferrous sulfate" }],
    ],
  },
  {
    id: "benign-prostatic-hyperplasia-and-luts-medical-management-and",
    branches: [
      ["Lower urinary tract symptoms — alpha blocker", "Adult man with symptoms of an enlarged prostate"],
      ["Enlarged prostate — 5-alpha-reductase inhibitor", "Adult man with an enlarged prostate"],
      ["Nocturnal polyuria", "Adult man with nocturnal polyuria after other causes are excluded and other treatments have failed"],
    ],
    rows: [
      [0, 0, "Alpha blocker", "all"],
      [1, 1, "5-alpha-reductase inhibitor", "all"],
      [2, 2, "Desmopressin", "all"],
    ],
  },
  {
    id: "bipolar-disorder",
    branches: [
      ["Mania or hypomania", "Adult with mania or hypomania"],
      ["Bipolar depression", "Adult with bipolar depression"],
      ["Long-term prevention", "Adult with bipolar I disorder needing prevention of relapse"],
    ],
    rows: [
      [1, 0, "Antimanic", "all", undefined, { dose: "50 mg twice daily initially, recommended 400 to 800 mg/day, maximum 800 mg/day (FDA label section 2.2)" }],
      [0, 0, "Add-on", "all", "Add-on for mania"],
      [1, 1, "Bipolar depression treatment", "pref", undefined, { dose: "50 mg once daily at bedtime, recommended and maximum 300 mg/day (FDA label section 2.2)" }],
      [2, 1, "Bipolar depression treatment", "alt", "Alone or added to lithium or valproate"],
      [0, 2, "Prevention", "all"],
    ],
  },
  {
    id: "breast-cancer-management",
    branches: [
      ["Premenopausal, male or low-risk postmenopausal ER-positive", "Adult with ER-positive breast cancer who is premenopausal, male, or postmenopausal at low risk"],
      ["Postmenopausal ER-positive, medium or high risk", "Postmenopausal woman with ER-positive breast cancer at medium or high risk"],
    ],
    rows: [
      [0, 0, "Adjuvant endocrine therapy", "all"],
      [1, 1, "Aromatase inhibitor", "pref"],
      [2, 1, "Aromatase inhibitor", "alt", "Chosen instead of letrozole"],
    ],
  },
  {
    id: "cardiac-arrest",
    branches: [
      ["Pulseless cardiac arrest", "Adult in cardiac arrest"],
      ["Refractory VF or pulseless VT", "Adult with ventricular fibrillation or pulseless ventricular tachycardia after defibrillation attempts"],
    ],
    rows: [
      [0, 0, "Vasopressor", "all"],
      [1, 1, "Antiarrhythmic", "all"],
    ],
  },
  {
    id: "cardiovascular-risk-assessment",
    branches: [
      ["Statin for primary prevention", "Adult with 10-year cardiovascular risk of 10% or more"],
      ["Aspirin for primary prevention", "Adult aged 40–59 with 10-year risk of 10% or more and low bleeding risk; individual decision"],
    ],
    rows: [
      [0, 0, "Statin", "all"],
      [1, 1, "Antiplatelet", "all"],
    ],
  },
  {
    id: "cataract-surgery-assessment-and-preparation",
    branches: [
      ["Topical surgical prophylaxis", "Adult having cataract surgery"],
      ["Optional intracameral or subconjunctival addition", "Adult having cataract surgery, with antibiotic added at the surgeon's discretion"],
    ],
    rows: [
      [0, 0, "Topical antibiotic", "all"],
      [1, 1, "Added antibiotic", "all", "Optional addition"],
    ],
  },
  {
    id: "childhood-immunisation-and-catch-up",
    branches: [
      ["Hepatitis B", "Infant on the national schedule"],
      ["DTaP-containing series", "Infant or child needing the primary series and boosters"],
      ["Measles, mumps and rubella", "Child on the national schedule"],
      ["Human papillomavirus", "Girl on the national schedule"],
    ],
    rows: [
      [0, 0, "Vaccine", "all"],
      [1, 1, "Vaccine", "all"],
      [2, 2, "Vaccine", "all"],
      [3, 3, "Vaccine", "all"],
    ],
  },
  {
    id: "conservative-kidney-care-planning",
    branches: [
      ["Iron deficiency", "Adult with non-dialysis CKD and iron deficiency"],
      ["Renal anaemia", "Adult with CKD and renal anaemia (specialist)"],
      ["Hyperphosphataemia", "Adult with CKD and hyperphosphataemia"],
    ],
    rows: [
      [0, 0, "Iron", "all"],
      [1, 1, "Erythropoiesis-stimulating agent", "all"],
      [2, 2, "Phosphate binder", "all"],
    ],
  },
  {
    id: "deep-neck-space-infections-and-quinsy-airway-risk-and-referr",
    branches: [
      ["Intravenous therapy — no penicillin allergy", "Adult with peritonsillar abscess or deep neck infection and no penicillin allergy"],
      ["Intravenous therapy — penicillin allergy", "Adult with peritonsillar abscess or deep neck infection and penicillin allergy"],
      ["Oral step-down", "Adult improving and without penicillin allergy"],
    ],
    rows: [
      [0, 0, "Antibiotic", "all"],
      [1, 0, "Anaerobic cover", "all"],
      [2, 1, "Antibiotic", "all"],
      [3, 2, "Oral antibiotic", "all"],
    ],
  },
  {
    id: "delirium-and-agitation-near-end-of-life",
    branches: [
      ["Delirium or agitation", "Adult near the end of life with delirium or agitation"],
      ["Anxiety or agitation", "Adult near the end of life with anxiety or agitation"],
    ],
    rows: [
      [0, 0, "Antipsychotic", "all"],
      [1, 1, "Benzodiazepine", "all"],
    ],
  },
  {
    id: "diabetes-screening-in-at-risk-adults",
    branches: [
      ["Prediabetes — metformin", "Adult with prediabetes and BMI 35 or more, prior GDM, or age under 60"],
      ["Prediabetes — orlistat", "Adult with prediabetes and BMI 28 or more"],
    ],
    rows: [
      [0, 0, "Medicine", "all"],
      [1, 1, "Medicine", "all"],
    ],
  },
  {
    id: "diabetic-foot-risk-stratification-and-ulcer-referral",
    branches: [
      ["Mild infection", "Adult with mild diabetic foot infection (skin and subcutaneous tissue only)"],
      ["Moderate or severe infection", "Adult with moderate or severe diabetic foot infection"],
    ],
    rows: [
      [0, 0, "Oral antibiotic", "pref"],
      [1, 0, "Oral antibiotic", "alt", "Penicillin allergy, or flucloxacillin is unsuitable"],
      [2, 1, "Antibiotic", "all"],
    ],
  },
  {
    id: "elective-cholecystectomy-pre-operative-assessment-pathway",
    branches: [
      ["Antibiotic prophylaxis — no beta-lactam allergy", "Adult having elective cholecystectomy without beta-lactam allergy"],
      ["Antibiotic prophylaxis — beta-lactam allergy", "Adult having elective cholecystectomy with beta-lactam allergy or cefazolin unavailable"],
      ["VTE prophylaxis", "Adult whose VTE risk is above bleeding risk"],
    ],
    rows: [
      [0, 0, "Prophylactic antibiotic", "all"],
      [1, 1, "Prophylactic antibiotic", "all"],
      [2, 1, "Prophylactic antibiotic", "all", "Given with clindamycin", { indication: "Surgical prophylaxis in combination with clindamycin" }],
      [3, 2, "VTE prophylaxis", "all"],
    ],
  },
  one("elective-coronary-revascularisation-review", "Surgical antibiotic prophylaxis", "Adult having coronary revascularisation surgery", [
    [0, 0, "Prophylactic antibiotic", "pref"],
    [1, 0, "Prophylactic antibiotic", "alt", "Beta-lactam allergy or cefazolin unavailable"],
  ]),
  {
    id: "elective-hernia-repair-assessment",
    branches: [
      ["Surgical antibiotic prophylaxis", "Adult having elective hernia repair"],
      ["VTE prophylaxis", "Adult whose VTE risk is above bleeding risk"],
    ],
    rows: [
      [0, 0, "Prophylactic antibiotic", "pref"],
      [1, 0, "Prophylactic antibiotic", "alt", "Beta-lactam allergy or cefazolin unavailable"],
      [2, 0, "Prophylactic antibiotic", "alt", "MRSA or beta-lactam allergy"],
      [3, 1, "VTE prophylaxis", "all"],
    ],
  },
  {
    id: "elective-hysterectomy-for-benign-disease",
    branches: [
      ["Antibiotic prophylaxis — no beta-lactam allergy", "Adult having elective hysterectomy without beta-lactam allergy"],
      ["Antibiotic prophylaxis — beta-lactam allergy", "Adult having elective hysterectomy with beta-lactam allergy or cefazolin unavailable"],
      ["VTE prophylaxis", "Adult whose VTE risk is above bleeding risk"],
    ],
    rows: [
      [0, 0, "Prophylactic antibiotic", "all"],
      [1, 1, "Prophylactic antibiotic", "all"],
      [2, 1, "Prophylactic antibiotic", "all", "Given with clindamycin", { indication: "Surgical prophylaxis in combination with clindamycin" }],
      [3, 2, "VTE prophylaxis", "all"],
    ],
  },
  {
    id: "elective-valve-intervention-assessment",
    branches: [
      ["Surgical antibiotic prophylaxis", "Adult having elective valve intervention"],
      ["After TAVI", "Adult after TAVI without another antithrombotic indication"],
    ],
    rows: [
      [0, 0, "Prophylactic antibiotic", "pref"],
      [1, 0, "Prophylactic antibiotic", "alt", "Beta-lactam allergy or cefazolin unavailable"],
      [2, 1, "Antiplatelet", "all"],
    ],
  },
  {
    id: "fibromyalgia-multidisciplinary-pain-management",
    branches: [
      ["Severe pain", "Adult with fibromyalgia and severe pain"],
      ["Sleep disturbance, or pain at low dose", "Adult with fibromyalgia and sleep disturbance"],
      ["Acute rescue", "Adult with severe fibromyalgia pain needing acute rescue therapy"],
    ],
    rows: [
      [0, 0, "Medicine", "pref"],
      [1, 0, "Medicine", "alt", "Chosen instead of duloxetine"],
      [2, 1, "Medicine", "pref"],
      [1, 1, "Medicine", "alt", "Chosen instead of amitriptyline"],
      [3, 2, "Rescue analgesic", "all"],
    ],
  },
  one("generalized-anxiety-disorder", "Drug treatment (step 3)", "Adult with GAD choosing drug treatment", [
    [0, 0, "First-choice drug", "pref"],
    [1, 0, "First-choice drug", "alt", "Chosen instead of sertraline"],
    [2, 0, "First-choice drug", "alt", "Chosen instead of sertraline"],
  ]),
  {
    id: "gestational-diabetes-identification-and-management-pathway",
    branches: [
      ["Medicine after diet and exercise", "Pregnant woman not at target after diet and exercise"],
      ["Intrapartum hyperglycaemia", "Woman in labour with hyperglycaemia"],
    ],
    rows: [
      [0, 0, "Glucose-lowering medicine", "pref"],
      [1, 0, "Glucose-lowering medicine", "alt", "Insulin is required"],
      [2, 0, "Glucose-lowering medicine", "alt", "Alternative to insulin"],
      [3, 1, "Intravenous insulin", "all"],
    ],
  },
  {
    id: "gestational-diabetes-antenatal-glucose-management-and-delive",
    branches: [
      ["Medicine after diet and exercise", "Pregnant woman not at target after diet and exercise"],
      ["Labour or birth hyperglycaemia", "Woman in labour or birth with hyperglycaemia"],
    ],
    rows: [
      [0, 0, "Glucose-lowering medicine", "pref"],
      [2, 0, "Glucose-lowering medicine", "alt", "Insulin is required"],
      [1, 0, "Glucose-lowering medicine", "alt", "Alternative to insulin"],
      [3, 1, "Intravenous insulin", "all"],
    ],
  },
  one("gestational-diabetes-screening-and-diagnosis", "Medicine after diet and exercise", "Pregnant woman with gestational diabetes not at target after diet and exercise", [
    [0, 0, "Glucose-lowering medicine", "pref"],
    [2, 0, "Glucose-lowering medicine", "alt", "Insulin is required"],
    [1, 0, "Glucose-lowering medicine", "alt", "Alternative to insulin"],
  ]),
  {
    id: "gout-long-term-urate-lowering-therapy-titration",
    branches: [
      ["Urate-lowering therapy", "Adult with gout needing treat-to-target urate-lowering therapy"],
      ["Flare prophylaxis", "Adult starting or titrating urate-lowering therapy who chooses prophylaxis"],
    ],
    rows: [
      [0, 0, "Urate-lowering drug", "pref"],
      [1, 0, "Urate-lowering drug", "alt", "Allopurinol is unsuitable; no established cardiovascular disease"],
      [2, 1, "Prophylaxis", "all"],
    ],
  },
  {
    id: "group-b-streptococcus-risk-based-intrapartum-prophylaxis",
    branches: [
      ["No penicillin allergy", "Woman in labour with an indication for intrapartum prophylaxis and no penicillin allergy"],
      ["Non-severe penicillin allergy", "Woman in labour with non-severe penicillin allergy"],
      ["Severe penicillin allergy", "Woman in labour with severe penicillin allergy"],
    ],
    rows: [
      [0, 0, "Intrapartum antibiotic", "all"],
      [1, 1, "Intrapartum antibiotic", "all"],
      [2, 2, "Intrapartum antibiotic", "pref"],
      [3, 2, "Intrapartum antibiotic", "alt", "Chosen instead of vancomycin"],
    ],
  },
  {
    id: "hepatitis-b-screening-and-serology-interpretation",
    branches: [
      ["Chronic hepatitis B — first-line treatment", "Treatment-naive adult with chronic hepatitis B, including cirrhosis"],
      ["Pregnancy", "Pregnant woman with hepatitis B needing antiviral treatment"],
      ["Finite therapy (specialist)", "Selected non-cirrhotic adult wanting finite therapy"],
    ],
    rows: [
      [0, 0, "Nucleos(t)ide analogue", "pref"],
      [1, 0, "Nucleos(t)ide analogue", "alt", "Chosen instead of entecavir"],
      [1, 1, "Nucleos(t)ide analogue", "pref"],
      [2, 1, "Nucleos(t)ide analogue", "alt", "Only if tenofovir and tenofovir alafenamide are unavailable"],
      [3, 2, "Interferon", "all"],
    ],
  },
  {
    id: "hyperosmolar-hyperglycaemic-state",
    branches: [
      ["HHS — fluids, potassium and insulin", "Adult with hyperosmolar hyperglycaemic state"],
      ["HHS — glucose falling", "HHS with glucose falling"],
    ],
    rows: [
      [0, 0, "1. Fluids", "all"],
      [2, 0, "2. Potassium replacement", "all"],
      [1, 0, "3. Insulin (late and low)", "all"],
      [3, 1, "Dextrose", "all"],
    ],
  },
  one("hyperthyroidism-and-thyrotoxicosis-anti-thyroid-drug-titrati", "Antithyroid regimen", "Adult with hyperthyroidism needing an antithyroid regimen", [
    [0, 0, "Antithyroid regimen", "pref"],
    [1, 0, "Antithyroid regimen", "alt", "Block-and-replace chosen instead of titration"],
  ]),
  {
    id: "hypothyroidism",
    branches: [
      ["Under 65, no cardiovascular disease", "Adult with primary hypothyroidism under 65 and without cardiovascular disease"],
      ["Aged 65 or over, or cardiovascular disease", "Adult with primary hypothyroidism aged 65 or over, or with cardiovascular disease"],
    ],
    rows: [
      [0, 0, "Levothyroxine", "all"],
      [1, 1, "Levothyroxine", "all"],
    ],
  },
  {
    id: "induction-of-labour-indications-and-process",
    branches: [
      ["Unfavourable cervix, no uterine scar", "Woman with Bishop score 6 or less and no uterine scar"],
      ["Intrauterine fetal death", "Woman with confirmed intrauterine fetal death"],
    ],
    rows: [
      [0, 0, "Induction agent", "all"],
      [1, 1, "Induction agent", "all"],
    ],
  },
  {
    id: "last-days-of-life-care",
    branches: [
      ["Pain or breathlessness", "Opioid-naïve adult in the last days of life with pain or breathlessness"],
      ["Delirium or agitation", "Adult in the last days of life with delirium or agitation"],
      ["Anxiety or agitation", "Adult in the last days of life with anxiety or agitation"],
    ],
    rows: [
      [0, 0, "Opioid", "all"],
      [1, 1, "Antipsychotic", "all"],
      [2, 2, "Benzodiazepine", "all"],
    ],
  },
  {
    id: "major-depressive-disorder",
    branches: [
      ["Antidepressant first choice", "Adult with depression starting an antidepressant"],
      ["Limited response — augmentation", "Adult with depression and limited response to an antidepressant"],
    ],
    rows: [
      [0, 0, "SSRI", "pref"],
      [1, 0, "SSRI", "alt", "Chosen instead of sertraline"],
      [2, 1, "Augmentation", "all", "Specialist advice"],
    ],
  },
  {
    id: "malignant-bowel-obstruction-support",
    branches: [
      ["Obstructive syndrome", "Adult with malignant bowel obstruction"],
      ["Nausea", "Adult with malignant bowel obstruction and nausea"],
      ["Refractory secretions or vomiting", "Adult with refractory secretions or vomiting after 24 h of hyoscine butylbromide"],
    ],
    rows: [
      [0, 0, "Corticosteroid", "all"],
      [1, 1, "Antiemetic", "all"],
      [2, 2, "Antisecretory", "all"],
    ],
  },
  {
    id: "metabolic-and-bariatric-surgery-evaluation",
    branches: [
      ["Surgical antibiotic prophylaxis", "Adult having bariatric surgery"],
      ["VTE prophylaxis", "Adult having bariatric surgery"],
    ],
    rows: [
      [0, 0, "Prophylactic antibiotic", "all"],
      [1, 1, "VTE prophylaxis", "all"],
    ],
  },
  {
    id: "miscarriage-expectant-medical-and-surgical-management",
    branches: [
      ["Missed miscarriage — medical management", "Woman with confirmed missed miscarriage choosing medical management"],
      ["Incomplete miscarriage — medical management", "Woman with incomplete miscarriage choosing medical management"],
      ["After surgical management", "Rhesus D negative woman after surgical management"],
    ],
    rows: [
      [0, 0, "1. Antiprogestogen", "all"],
      [1, 0, "2. Prostaglandin", "all"],
      [2, 1, "Prostaglandin", "all"],
      [3, 2, "Anti-D immunoglobulin", "all"],
    ],
  },
  {
    id: "osteoarthritis-and-chronic-pain",
    branches: [
      ["Knee osteoarthritis — first line", "Adult with knee osteoarthritis"],
      ["Oral NSAID when topical is unsuitable", "Adult for whom topical treatment is unsuitable and without GI, renal or cardiovascular contraindication"],
    ],
    rows: [
      [0, 0, "Topical NSAID", "all"],
      [1, 1, "Oral NSAID", "all"],
      [2, 1, "Gastroprotection", "all"],
    ],
  },
  {
    id: "palliative-management-of-end-of-life-dyspnoea-and-pain",
    branches: [
      ["Breathlessness or pain", "Opioid-naïve adult with breathlessness or pain"],
      ["Anxiety with breathlessness", "Adult with anxiety and breathlessness"],
    ],
    rows: [
      [0, 0, "Opioid", "all"],
      [1, 1, "Benzodiazepine", "all"],
    ],
  },
  {
    id: "palliative-sedation-proportionate-sedation-for-refractory-sy",
    branches: [
      ["Refractory symptoms", "Adult with advanced terminal illness and refractory symptoms"],
      ["Extreme tolerance to benzodiazepines and opioids (specialist)", "Adult under specialist supervision with extreme tolerance to benzodiazepines and opioids"],
    ],
    rows: [
      [0, 0, "Sedative", "pref"],
      [1, 0, "Sedative", "alt", "Agitated delirium"],
      [2, 1, "Sedative", "pref"],
      [3, 1, "Sedative", "alt", "Chosen instead of propofol"],
    ],
  },
  {
    id: "preconception-health-and-risk-review",
    branches: [
      ["All women planning or capable of pregnancy", "Woman planning or capable of pregnancy"],
      ["High risk of neural-tube defect", "Woman planning pregnancy with epilepsy, diabetes or a previous neural-tube defect"],
    ],
    rows: [
      [0, 0, "Folic acid", "all"],
      [1, 1, "High-dose folic acid", "all"],
    ],
  },
];
