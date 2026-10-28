/* Explanations of the clinical scores and grading systems named in topic text.
 * Every score a topic mentions is explained, with a table of its values, at the first place the topic uses it
 * (see components/score-explainers.tsx). Figures come from the cited derivation or validation papers; the
 * explanations are teaching summaries, not a substitute for the original tool. Clinical review pending. */

export interface ScoreTable { caption: string; columns: string[]; rows: string[][] }
export interface ScoreDefinition {
  id: string; name: string; patterns: RegExp[];
  /** One or two sentences: what the score measures and when it is used. */
  purpose: string; range: string; tables: ScoreTable[];
  /** Id of the matching calculator in the medical calculators page, when one exists. */
  calculatorId?: string; note?: string; source: { label: string; url: string };
}

const pm = (term: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(term)}`;
const yes = (rows: Array<[string, string]>): string[][] => rows.map(([a, b]) => [a, b]);

export const clinicalScores: ScoreDefinition[] = [
  {
    id: "grace", name: "GRACE score (Global Registry of Acute Coronary Events)", patterns: [/\bGRACE\b/],
    purpose: "Estimates the risk of death in hospital for a patient with an acute coronary syndrome. In non-ST-elevation acute coronary syndrome it helps decide how soon to do coronary angiography.",
    range: "Roughly 1 to 372 points; higher means higher risk", calculatorId: "grace",
    tables: [
      { caption: "Parameters scored (GRACE 1.0, in-hospital death)", columns: ["Parameter", "How it is scored"], rows: yes([
        ["Age", "Under 30 = 0 points; 30–39 = 8; 40–49 = 25; 50–59 = 41; 60–69 = 58; 70–79 = 75; 80–89 = 91; 90 and over = 100"],
        ["Heart rate (beats/min)", "Under 50 = 0; 50–69 = 3; 70–89 = 9; 90–109 = 15; 110–149 = 24; 150–199 = 38; 200 and over = 46"],
        ["Systolic blood pressure (mmHg)", "Under 80 = 58; 80–99 = 53; 100–119 = 43; 120–139 = 34; 140–159 = 24; 160–199 = 10; 200 and over = 0"],
        ["Creatinine (mg/dL)", "0–0.39 = 1; 0.40–0.79 = 4; 0.80–1.19 = 7; 1.20–1.59 = 10; 1.60–1.99 = 13; 2.00–3.99 = 21; 4.00 and over = 28"],
        ["Killip class", "I = 0; II = 20; III = 39; IV = 59"],
        ["Cardiac arrest at admission", "Yes = 39"], ["ST-segment deviation on the ECG", "Yes = 28"], ["Raised cardiac enzymes (troponin)", "Yes = 14"],
      ]) },
      { caption: "How to read the total", columns: ["Total score", "Risk of in-hospital death", "Meaning in practice"], rows: [
        ["108 or less", "Low (under 1%)", "Routine care; a selective or delayed invasive strategy is usual"],
        ["109 to 140", "Intermediate (1% to 3%)", "Consider early angiography, within 24 hours (guideline pathway)"],
        ["Above 140", "High (above 3%)", "Early invasive strategy within 24 hours; very high-risk features need an immediate strategy"],
      ] },
    ],
    note: "Use the values from first assessment. The score does not replace clinical judgement: refractory pain, shock, heart failure or arrhythmia mean an immediate invasive strategy whatever the score.",
    source: { label: "Granger CB et al. Arch Intern Med 2003;163:2345-53", url: pm("Granger Predictors of hospital mortality in the Global Registry of Acute Coronary Events") },
  },
  {
    id: "timi-nstemi", name: "TIMI risk score for unstable angina and non-ST-elevation myocardial infarction", patterns: [/\bTIMI\b/],
    purpose: "Estimates the 14-day risk of death, new myocardial infarction or urgent revascularisation in unstable angina or NSTEMI. A higher score favours an earlier invasive strategy and intensive antithrombotic treatment.",
    range: "0 to 7 points (one point for each item present)", calculatorId: "timi-nstemi",
    tables: [
      { caption: "The seven items (1 point each)", columns: ["Item", "Present when"], rows: yes([
        ["Age 65 or over", "Age is 65 years or more"], ["Three or more coronary risk factors", "Family history, hypertension, high cholesterol, diabetes or current smoking: at least three"],
        ["Known coronary stenosis of 50% or more", "Previous angiogram showing 50% or greater stenosis"], ["Aspirin in the past 7 days", "The patient took aspirin during the last week"],
        ["Severe angina", "Two or more anginal episodes in the last 24 hours"], ["ST-segment change", "ST deviation of 0.5 mm or more on the presenting ECG"], ["Raised cardiac marker", "Troponin or CK-MB above normal"],
      ]) },
      { caption: "How to read the total", columns: ["Score", "Risk of death, MI or urgent revascularisation by 14 days"], rows: [
        ["0 or 1", "About 5%"], ["2", "About 8%"], ["3", "About 13%"], ["4", "About 20%"], ["5", "About 26%"], ["6 or 7", "About 41%"],
      ] },
    ],
    note: "A score of 3 or more is generally treated as higher risk. TIMI uses simpler items than GRACE and predicts a combined outcome, so the two scores are not interchangeable.",
    source: { label: "Antman EM et al. JAMA 2000;284:835-42", url: pm("Antman The TIMI risk score for unstable angina/non-ST elevation MI") },
  },
  {
    id: "killip", name: "Killip class", patterns: [/\bKillip\b/],
    purpose: "Bedside grade of heart failure after myocardial infarction. It predicts death in hospital and is one input to the GRACE score.", range: "Class I to IV", calculatorId: "grace",
    tables: [{ caption: "Killip classes", columns: ["Class", "Findings", "Approximate in-hospital mortality"], rows: [
      ["I", "No signs of heart failure", "About 6%"], ["II", "Crackles in the lower lung fields, a third heart sound or raised jugular venous pressure", "About 17%"],
      ["III", "Frank pulmonary oedema", "About 38%"], ["IV", "Cardiogenic shock", "About 81%"] ] }],
    source: { label: "Killip T, Kimball JT. Am J Cardiol 1967;20:457-64", url: pm("Killip Kimball Treatment of myocardial infarction in a coronary care unit") },
  },
  {
    id: "heart", name: "HEART score", patterns: [/\bHEART score\b/i],
    purpose: "Sorts adults with chest pain in the emergency department into low, moderate and high risk of a major cardiac event in the next six weeks.", range: "0 to 10 points", calculatorId: "heart-score",
    tables: [
      { caption: "Five components, each scored 0, 1 or 2", columns: ["Component", "0 points", "1 point", "2 points"], rows: [
        ["History", "Slightly suspicious", "Moderately suspicious", "Highly suspicious"], ["ECG", "Normal", "Non-specific repolarisation change", "Significant ST deviation"],
        ["Age", "Under 45", "45 to 64", "65 or over"], ["Risk factors", "None", "One or two", "Three or more, or known atherosclerotic disease"], ["Troponin", "Normal", "1 to 3 times the limit", "More than 3 times the limit"] ] },
      { caption: "How to read the total", columns: ["Score", "Risk of a major cardiac event", "Usual action"], rows: [
        ["0 to 3", "About 1% to 2%", "Early discharge can be considered with a normal serial troponin"], ["4 to 6", "About 12% to 17%", "Observation and further testing"], ["7 to 10", "About 50% to 65%", "Admit; early invasive strategy"] ] },
    ],
    source: { label: "Six AJ et al. Neth Heart J 2008;16:191-6", url: pm("Six A chest pain in the emergency room value of the HEART score") },
  },
  {
    id: "cha2ds2-vasc", name: "CHA₂DS₂-VASc score", patterns: [/CHA2DS2[-\s]?VASc/i, /CHA₂DS₂[-\s]?VASc/],
    purpose: "Estimates the yearly risk of stroke in atrial fibrillation and guides whether to offer anticoagulation.", range: "0 to 9 points", calculatorId: "cha2ds2-vasc",
    tables: [
      { caption: "Items", columns: ["Item", "Points"], rows: [["Congestive heart failure or low ejection fraction", "1"], ["Hypertension", "1"], ["Age 75 or over", "2"], ["Diabetes", "1"], ["Stroke, TIA or thromboembolism before", "2"], ["Vascular disease (previous MI, peripheral arterial disease, aortic plaque)", "1"], ["Age 65 to 74", "1"], ["Female sex", "1"]] },
      { caption: "How to read the total", columns: ["Score", "Meaning"], rows: [["0 (men) or 1 (women, from sex alone)", "Low risk; no anticoagulation needed"], ["1 (men) or 2 (women)", "Consider oral anticoagulation after discussion"], ["2 or more (men) or 3 or more (women)", "Offer oral anticoagulation"]] },
    ],
    source: { label: "Lip GYH et al. Chest 2010;137:263-72", url: pm("Lip Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation") },
  },
  {
    id: "has-bled", name: "HAS-BLED score", patterns: [/HAS-BLED/],
    purpose: "Lists the bleeding risks in a patient on, or about to start, an anticoagulant so that the correctable ones can be fixed. It is not a reason to withhold needed anticoagulation.", range: "0 to 9 points", calculatorId: "has-bled",
    tables: [
      { caption: "Items (1 point each)", columns: ["Letter", "Item"], rows: [["H", "Uncontrolled hypertension (systolic above 160 mmHg)"], ["A", "Abnormal kidney function or abnormal liver function (1 point each)"], ["S", "Stroke before"], ["B", "Bleeding history or predisposition (anaemia)"], ["L", "Labile INR (time in range under 60%)"], ["E", "Elderly (over 65)"], ["D", "Drugs (antiplatelets, NSAIDs) or alcohol excess (1 point each)"]] },
      { caption: "How to read the total", columns: ["Score", "Meaning"], rows: [["0 to 1", "Lower bleeding risk"], ["2", "Moderate risk: review and correct modifiable factors"], ["3 or more", "High risk: review more often; do not simply stop anticoagulation"]] },
    ],
    source: { label: "Pisters R et al. Chest 2010;138:1093-100", url: pm("Pisters novel user-friendly score HAS-BLED bleeding risk") },
  },
  {
    id: "wells-pe", name: "Wells criteria for pulmonary embolism", patterns: [/Wells'? (?:score|criteria|rule)/i, /\bWells\b(?= (?:PE|DVT))/],
    purpose: "Estimates the pre-test probability of pulmonary embolism (or, in the DVT version, deep vein thrombosis) and decides whether to send a D-dimer or go straight to imaging.", range: "0 to 12.5 points (PE)", calculatorId: "wells-pe",
    tables: [
      { caption: "Items (PE version)", columns: ["Item", "Points"], rows: [["Clinical signs of deep vein thrombosis", "3"], ["Pulmonary embolism is the leading or equally likely diagnosis", "3"], ["Heart rate above 100", "1.5"], ["Immobilisation for 3 days or more, or surgery in the last 4 weeks", "1.5"], ["Previous DVT or PE", "1.5"], ["Haemoptysis", "1"], ["Active cancer", "1"]] },
      { caption: "How to read the total (two-tier)", columns: ["Score", "Probability", "Next step"], rows: [["4 or less", "PE unlikely", "D-dimer; if negative, PE is effectively excluded"], ["More than 4", "PE likely", "Go to CT pulmonary angiography and give anticoagulation while waiting if imaging is delayed"]] },
    ],
    source: { label: "Wells PS et al. Thromb Haemost 2000;83:416-20", url: pm("Wells Derivation of a simple clinical model to categorize patients probability of pulmonary embolism") },
  },
  {
    id: "perc", name: "PERC rule (Pulmonary Embolism Rule-out Criteria)", patterns: [/\bPERC\b/],
    purpose: "Lets a doctor stop work-up for pulmonary embolism in a patient who is already at low clinical probability, with no D-dimer needed, if all eight criteria are absent.", range: "Eight yes/no criteria", calculatorId: "perc",
    tables: [{ caption: "PERC criteria (any one present means the rule fails)", columns: ["Criterion"], rows: [["Age 50 or over"], ["Heart rate 100 or over"], ["Oxygen saturation below 95% on room air"], ["Unilateral leg swelling"], ["Haemoptysis"], ["Recent surgery or trauma (within 4 weeks)"], ["Previous DVT or PE"], ["Oral oestrogen use"]] }],
    note: "Apply only when the clinician already judges the probability of PE to be low (below about 15%). If all eight are absent, PE is effectively excluded; if any is present, go on to D-dimer or imaging.",
    source: { label: "Kline JA et al. J Thromb Haemost 2004;2:1247-55", url: pm("Kline Clinical criteria to prevent unnecessary diagnostic testing in emergency department patients with suspected pulmonary embolism") },
  },
  {
    id: "spesi", name: "sPESI (simplified Pulmonary Embolism Severity Index)", patterns: [/\bsPESI\b/, /\bPESI\b/],
    purpose: "After pulmonary embolism is confirmed, sorts patients into low and higher risk of death at 30 days to decide who can be treated at home or needs monitoring.", range: "0 or 1 or more", calculatorId: "spesi",
    tables: [
      { caption: "Items (1 point each)", columns: ["Item", "Present when"], rows: [["Age", "Over 80 years"], ["Cancer", "History of cancer"], ["Chronic cardiopulmonary disease", "Heart failure or chronic lung disease"], ["Heart rate", "110 or more per minute"], ["Systolic blood pressure", "Below 100 mmHg"], ["Oxygen saturation", "Below 90%"]] },
      { caption: "How to read the total", columns: ["Score", "30-day mortality", "Meaning"], rows: [["0", "About 1%", "Low risk; outpatient treatment can be considered if no other reason to admit"], ["1 or more", "About 11%", "Higher risk; admit and monitor"]] },
    ],
    source: { label: "Jiménez D et al. Arch Intern Med 2010;170:1383-9", url: pm("Jimenez Simplification of the Pulmonary Embolism Severity Index for prognostication in patients with acute symptomatic pulmonary embolism") },
  },
  {
    id: "padua", name: "Padua prediction score", patterns: [/\bPadua\b/],
    purpose: "Estimates the risk of venous thromboembolism in a hospitalised medical patient to decide who needs pharmacological prophylaxis.", range: "0 to 20 points", calculatorId: "padua",
    tables: [
      { caption: "Items", columns: ["Item", "Points"], rows: [["Active cancer, previous VTE, reduced mobility, known thrombophilia (each)", "3"], ["Recent trauma or surgery", "2"], ["Age 70 or over; heart or respiratory failure; acute MI or ischaemic stroke; acute infection or rheumatological disorder; obesity; ongoing hormonal treatment (each)", "1"]] },
      { caption: "How to read the total", columns: ["Score", "Risk", "Meaning"], rows: [["Below 4", "Low", "Early mobilisation; no pharmacological prophylaxis"], ["4 or more", "High", "Offer prophylaxis unless there is a bleeding contraindication"]] },
    ],
    source: { label: "Barbar S et al. J Thromb Haemost 2010;8:2450-7", url: pm("Barbar A risk assessment model for the identification of hospitalized medical patients at risk for venous thromboembolism Padua") },
  },
  {
    id: "curb65", name: "CURB-65 pneumonia severity score", patterns: [/\bCURB-?65\b/, /\bCRB-?65\b/],
    purpose: "Estimates the 30-day risk of death in adults with community-acquired pneumonia and guides the choice between home and hospital care.", range: "0 to 5 points (CRB-65 omits urea: 0 to 4)", calculatorId: "curb-65",
    tables: [
      { caption: "Items (1 point each)", columns: ["Letter", "Item"], rows: [["C", "New confusion"], ["U", "Urea above 7 mmol/L (blood urea nitrogen above 19 mg/dL)"], ["R", "Respiratory rate 30 or more per minute"], ["B", "Systolic blood pressure below 90 mmHg or diastolic 60 mmHg or less"], ["65", "Age 65 or over"]] },
      { caption: "How to read the total", columns: ["Score", "30-day mortality", "Usual setting"], rows: [["0 to 1", "Under 3%", "Home treatment"], ["2", "About 9%", "Short hospital stay or supervised outpatient care"], ["3 to 5", "15% to 40%", "Hospital; consider intensive care if 4 or 5"]] },
    ],
    source: { label: "Lim WS et al. Thorax 2003;58:377-82", url: pm("Lim Defining community acquired pneumonia severity on presentation to hospital CURB65") },
  },
  {
    id: "qsofa", name: "qSOFA (quick Sequential Organ Failure Assessment)", patterns: [/\bqSOFA\b/i],
    purpose: "A three-item bedside prompt to look for organ dysfunction in suspected infection. It flags higher risk and is not a stand-alone test for sepsis.", range: "0 to 3 points", calculatorId: "qsofa-score",
    tables: [
      { caption: "Items (1 point each)", columns: ["Item", "Present when"], rows: [["Respiratory rate", "22 or more per minute"], ["Systolic blood pressure", "100 mmHg or less"], ["Mental state", "Altered (Glasgow Coma Scale below 15)"]] },
      { caption: "How to read the total", columns: ["Score", "Meaning"], rows: [["0 or 1", "Lower risk; sepsis is not excluded"], ["2 or 3", "Higher risk of death; look at once for organ dysfunction and start the sepsis bundle"]] },
    ],
    source: { label: "Seymour CW et al. JAMA 2016;315:762-74", url: pm("Seymour Assessment of clinical criteria for sepsis Third International Consensus Definitions") },
  },
  {
    id: "sofa", name: "SOFA score (Sequential Organ Failure Assessment)", patterns: [/\bSOFA\b/],
    purpose: "Measures organ dysfunction in six systems. In the Sepsis-3 definition, sepsis is infection with an acute rise in SOFA of 2 points or more.", range: "0 to 24 points", calculatorId: "sofa",
    tables: [
      { caption: "Points by organ system (0 to 4 each)", columns: ["System", "0", "1", "2", "3", "4"], rows: [
        ["Respiration (PaO₂/FiO₂, mmHg)", "400 or more", "Below 400", "Below 300", "Below 200 with ventilation", "Below 100 with ventilation"],
        ["Coagulation (platelets, ×10⁹/L)", "150 or more", "Below 150", "Below 100", "Below 50", "Below 20"],
        ["Liver (bilirubin, mg/dL)", "Below 1.2", "1.2–1.9", "2.0–5.9", "6.0–11.9", "12 or more"],
        ["Circulation", "MAP 70 or more", "MAP below 70", "Dopamine up to 5 or dobutamine", "Dopamine above 5, or adrenaline or noradrenaline up to 0.1", "Dopamine above 15, or adrenaline or noradrenaline above 0.1"],
        ["Brain (Glasgow Coma Scale)", "15", "13–14", "10–12", "6–9", "Below 6"],
        ["Kidney (creatinine, mg/dL)", "Below 1.2", "1.2–1.9", "2.0–3.4", "3.5–4.9 or urine under 500 mL/day", "5.0 or more or urine under 200 mL/day"] ] },
      { caption: "How to read the score", columns: ["Finding", "Meaning"], rows: [["Rise of 2 points or more from baseline with infection", "Meets the Sepsis-3 definition of sepsis"], ["Higher totals", "Higher mortality; hospital mortality is about 10% at 0–6 and above 40% at 10 or more"]] },
    ],
    source: { label: "Vincent JL et al. Intensive Care Med 1996;22:707-10", url: pm("Vincent The SOFA Sepsis-related Organ Failure Assessment score to describe organ dysfunction/failure") },
  },
  {
    id: "sirs", name: "SIRS criteria (Systemic Inflammatory Response Syndrome)", patterns: [/\bSIRS\b/],
    purpose: "Four simple bedside signs of a systemic inflammatory response. Two or more suggest infection or another inflammatory cause but are not specific for sepsis.", range: "0 to 4 criteria", calculatorId: "sirs",
    tables: [{ caption: "Criteria (SIRS present when two or more)", columns: ["Criterion", "Threshold"], rows: [["Temperature", "Above 38 °C or below 36 °C"], ["Heart rate", "Above 90 per minute"], ["Respiratory rate", "Above 20 per minute, or PaCO₂ below 32 mmHg"], ["White cell count", "Above 12 000 or below 4 000 per µL, or more than 10% immature forms"]] }],
    source: { label: "Bone RC et al. Chest 1992;101:1644-55", url: pm("Bone Definitions for sepsis and organ failure and guidelines for the use of innovative therapies in sepsis") },
  },
  {
    id: "news2", name: "NEWS2 (National Early Warning Score 2)", patterns: [/\bNEWS2?\b/],
    purpose: "Adds up seven routine observations to flag a deteriorating adult patient and set how urgent the clinical response should be.", range: "0 to 20 points", calculatorId: "news2",
    tables: [
      { caption: "Parameters scored (0 to 3 each; oxygen use adds 2)", columns: ["Parameter", "Scores 3", "Scores 2", "Scores 1", "Scores 0"], rows: [
        ["Respiratory rate", "8 or less; 25 or more", "21–24", "9–11", "12–20"], ["Oxygen saturation (scale 1)", "91 or less", "92–93", "94–95", "96 or more"],
        ["Systolic blood pressure", "90 or less; 220 or more", "91–100", "101–110", "111–219"], ["Pulse", "40 or less; 131 or more", "111–130", "41–50; 91–110", "51–90"],
        ["Consciousness", "Confusion, voice, pain or unresponsive", "", "", "Alert"], ["Temperature", "35.0 or less", "39.1 or more", "35.1–36.0; 38.1–39.0", "36.1–38.0"] ] },
      { caption: "How to read the total", columns: ["Score", "Response"], rows: [["0 to 4", "Ward-based monitoring; a single parameter scoring 3 needs urgent review"], ["5 to 6", "Urgent clinical review"], ["7 or more", "Emergency response; continuous monitoring; critical care team"]] },
    ],
    source: { label: "Royal College of Physicians. NEWS2, 2017", url: "https://www.rcp.ac.uk/improving-care/resources/national-early-warning-score-news-2/" },
  },
  {
    id: "gcs", name: "Glasgow Coma Scale (GCS)", patterns: [/\bGCS\b/, /Glasgow Coma (?:Scale|Score)/i],
    purpose: "Describes the level of consciousness from three responses. It is used to follow a patient over time and to grade head injury and coma.", range: "3 to 15 points", calculatorId: "glasgow-coma-scale",
    tables: [
      { caption: "Responses scored", columns: ["Response", "Points"], rows: [
        ["Eye opening", "Spontaneous 4; to voice 3; to pain 2; none 1"], ["Verbal", "Orientated 5; confused 4; inappropriate words 3; sounds only 2; none 1"],
        ["Motor", "Obeys commands 6; localises pain 5; withdraws 4; abnormal flexion 3; extension 2; none 1"] ] },
      { caption: "How to read the total", columns: ["GCS", "Severity"], rows: [["13 to 15", "Mild impairment"], ["9 to 12", "Moderate impairment"], ["8 or less", "Severe: protect the airway and consider intubation"]] },
    ],
    source: { label: "Teasdale G, Jennett B. Lancet 1974;2:81-4", url: pm("Teasdale Jennett Assessment of coma and impaired consciousness") },
  },
  {
    id: "child-pugh", name: "Child-Pugh score", patterns: [/Child[-–\s]Pugh/i],
    purpose: "Grades the severity of cirrhosis from five measures. It guides prognosis, drug dosing and the choice of treatments.", range: "5 to 15 points", calculatorId: "child-pugh",
    tables: [
      { caption: "Five measures", columns: ["Measure", "1 point", "2 points", "3 points"], rows: [
        ["Bilirubin (mg/dL)", "Below 2", "2–3", "Above 3"], ["Albumin (g/dL)", "Above 3.5", "2.8–3.5", "Below 2.8"], ["INR", "Below 1.7", "1.7–2.3", "Above 2.3"],
        ["Ascites", "None", "Mild or controlled", "Moderate to severe"], ["Encephalopathy", "None", "Grade 1–2", "Grade 3–4"] ] },
      { caption: "How to read the total", columns: ["Class", "Score", "One-year survival"], rows: [["A", "5 to 6", "About 100%"], ["B", "7 to 9", "About 80%"], ["C", "10 to 15", "About 45%"]] },
    ],
    source: { label: "Pugh RN et al. Br J Surg 1973;60:646-9", url: pm("Pugh Transection of the oesophagus for bleeding oesophageal varices") },
  },
  {
    id: "meld", name: "MELD score (Model for End-Stage Liver Disease)", patterns: [/\bMELD(?:-Na)?\b/],
    purpose: "Estimates three-month mortality in chronic liver disease from laboratory values. It ranks patients for liver transplantation.", range: "6 to 40", calculatorId: "meld-na",
    tables: [
      { caption: "Inputs and formula", columns: ["Input", "How it is used"], rows: [["Bilirubin, INR, creatinine", "MELD = 3.78 × ln(bilirubin mg/dL) + 11.2 × ln(INR) + 9.57 × ln(creatinine mg/dL) + 6.43; values below 1 are set to 1 and creatinine is capped at 4"], ["Sodium (MELD-Na)", "Adds a correction for low serum sodium, which raises the score"]] },
      { caption: "How to read the total", columns: ["MELD", "Approximate 3-month mortality"], rows: [["9 or less", "About 2%"], ["10 to 19", "About 6%"], ["20 to 29", "About 20%"], ["30 to 39", "About 53%"], ["40 or more", "About 71%"]] },
    ],
    source: { label: "Kamath PS et al. Hepatology 2001;33:464-70", url: pm("Kamath A model to predict survival in patients with end-stage liver disease") },
  },
  {
    id: "maddrey", name: "Maddrey discriminant function (DF)", patterns: [/Maddrey/],
    purpose: "Identifies severe alcohol-associated hepatitis that may benefit from corticosteroids.", range: "Calculated value", calculatorId: "maddrey",
    tables: [
      { caption: "Formula", columns: ["Formula"], rows: [["DF = 4.6 × (patient prothrombin time − control prothrombin time, seconds) + bilirubin (mg/dL)"]] },
      { caption: "How to read the value", columns: ["DF", "Meaning"], rows: [["Below 32", "Not severe; supportive care"], ["32 or more", "Severe alcohol-associated hepatitis; short-term mortality 30% to 50%; consider corticosteroids if no contraindication"]] },
    ],
    source: { label: "Maddrey WC et al. Gastroenterology 1978;75:193-9", url: pm("Maddrey Corticosteroid therapy of alcoholic hepatitis") },
  },
  {
    id: "fib4", name: "FIB-4 index", patterns: [/\bFIB-4\b/],
    purpose: "A blood-test estimate of liver fibrosis from age, AST, ALT and platelets, used to decide who needs elastography or a specialist opinion.", range: "Calculated value", calculatorId: "fib-4",
    tables: [
      { caption: "Formula", columns: ["Formula"], rows: [["FIB-4 = (age in years × AST) ÷ (platelets in 10⁹/L × √ALT)"]] },
      { caption: "How to read the value", columns: ["FIB-4", "Meaning"], rows: [["Below 1.3 (below 2.0 if aged 65 or over)", "Advanced fibrosis unlikely"], ["1.3 to 2.67", "Indeterminate; check elastography"], ["Above 2.67", "High probability of advanced fibrosis; refer to hepatology"]] },
    ],
    source: { label: "Sterling RK et al. Hepatology 2006;43:1317-25", url: pm("Sterling Development of a simple noninvasive index to predict significant fibrosis FIB-4") },
  },
  {
    id: "glasgow-blatchford", name: "Glasgow-Blatchford score", patterns: [/Glasgow[-–\s]Blatchford/i, /\bBlatchford\b/],
    purpose: "Identifies patients with upper gastrointestinal bleeding who need hospital treatment and those safe for outpatient care, before endoscopy.", range: "0 to 23 points", calculatorId: "glasgow-blatchford",
    tables: [
      { caption: "Items", columns: ["Item", "Points"], rows: [["Urea (mmol/L): 6.5–7.9 / 8–9.9 / 10–24.9 / 25 or more", "2 / 3 / 4 / 6"], ["Haemoglobin, men (g/dL): 12–12.9 / 10–11.9 / below 10", "1 / 3 / 6"], ["Haemoglobin, women (g/dL): 10–11.9 / below 10", "1 / 6"], ["Systolic blood pressure (mmHg): 100–109 / 90–99 / below 90", "1 / 2 / 3"], ["Pulse 100 or more; melaena", "1 each"], ["Syncope; hepatic disease; cardiac failure", "2 each"]] },
      { caption: "How to read the total", columns: ["Score", "Meaning"], rows: [["0 (or 1)", "Very low risk; outpatient care can be considered"], ["2 to 6", "Intermediate; admit and plan endoscopy within 24 hours"], ["7 or more", "High risk of needing endoscopic treatment or transfusion"]] },
    ],
    source: { label: "Blatchford O et al. Lancet 2000;356:1318-21", url: pm("Blatchford A risk score to predict need for treatment for upper gastrointestinal haemorrhage") },
  },
  {
    id: "bisap", name: "BISAP score (Bedside Index for Severity in Acute Pancreatitis)", patterns: [/\bBISAP\b/],
    purpose: "Five items in the first 24 hours that predict death in acute pancreatitis.", range: "0 to 5 points", calculatorId: "bisap",
    tables: [
      { caption: "Items (1 point each)", columns: ["Letter", "Item"], rows: [["B", "Blood urea nitrogen above 25 mg/dL (urea above 9 mmol/L)"], ["I", "Impaired mental status"], ["S", "SIRS: two or more criteria"], ["A", "Age above 60 years"], ["P", "Pleural effusion"]] },
      { caption: "How to read the total", columns: ["Score", "In-hospital mortality"], rows: [["0", "About 0.1%"], ["1", "About 0.4%"], ["2", "About 1.6%"], ["3", "About 3.6%"], ["4", "About 7.4%"], ["5", "About 9.5%"]] },
    ],
    source: { label: "Wu BU et al. Gut 2008;57:1698-703", url: pm("Wu The early prediction of mortality in acute pancreatitis BISAP") },
  },
  {
    id: "alvarado", name: "Alvarado score", patterns: [/Alvarado/],
    purpose: "Estimates the likelihood of acute appendicitis from symptoms, signs and two blood results to decide who needs imaging or surgical review.", range: "0 to 10 points", calculatorId: "alvarado",
    tables: [
      { caption: "Items (mnemonic MANTRELS)", columns: ["Item", "Points"], rows: [["Migration of pain to the right iliac fossa", "1"], ["Anorexia", "1"], ["Nausea or vomiting", "1"], ["Tenderness in the right iliac fossa", "2"], ["Rebound tenderness", "1"], ["Elevated temperature (37.3 °C or more)", "1"], ["Leucocytosis (above 10 000 per µL)", "2"], ["Shift to the left (neutrophils above 75%)", "1"]] },
      { caption: "How to read the total", columns: ["Score", "Meaning"], rows: [["0 to 3", "Appendicitis unlikely"], ["4 to 6", "Possible; observe or image"], ["7 to 10", "Probable; surgical review"]] },
    ],
    source: { label: "Alvarado A. Ann Emerg Med 1986;15:557-64", url: pm("Alvarado A practical score for the early diagnosis of acute appendicitis") },
  },
  {
    id: "centor", name: "Centor / McIsaac score", patterns: [/\bCentor\b/, /\bMcIsaac\b/],
    purpose: "Estimates the chance that a sore throat is due to group A streptococcus and guides testing and antibiotic use.", range: "−1 to 5 points", calculatorId: "centor-mcisaac",
    tables: [
      { caption: "Items", columns: ["Item", "Points"], rows: [["Tonsillar swelling or exudate", "1"], ["Tender anterior cervical nodes", "1"], ["Fever above 38 °C by history", "1"], ["No cough", "1"], ["Age 3 to 14 years", "+1"], ["Age 15 to 44 years", "0"], ["Age 45 years or more", "−1"]] },
      { caption: "How to read the total (McIsaac)", columns: ["Score", "Chance of streptococcal infection", "Usual action"], rows: [["−1 to 1", "Under 10%", "No test, no antibiotic"], ["2 to 3", "About 11% to 35%", "Rapid test or culture; treat if positive"], ["4 or more", "About 51%", "Test; consider treatment"]] },
    ],
    source: { label: "McIsaac WJ et al. CMAJ 1998;158:75-83", url: pm("McIsaac A clinical score to reduce unnecessary antibiotic use in patients with sore throat") },
  },
  {
    id: "abcd2", name: "ABCD² score", patterns: [/\bABCD2\b/, /\bABCD²\b/],
    purpose: "Estimates the risk of stroke in the two days after a transient ischaemic attack and helps decide how fast to investigate.", range: "0 to 7 points", calculatorId: "abcd2",
    tables: [
      { caption: "Items", columns: ["Item", "Points"], rows: [["Age 60 or over", "1"], ["Blood pressure 140/90 mmHg or higher at first assessment", "1"], ["Clinical features: unilateral weakness / speech disturbance without weakness", "2 / 1"], ["Duration: 60 minutes or more / 10 to 59 minutes", "2 / 1"], ["Diabetes", "1"]] },
      { caption: "How to read the total", columns: ["Score", "Risk of stroke within 2 days"], rows: [["0 to 3", "Low, about 1%"], ["4 to 5", "Moderate, about 4%"], ["6 to 7", "High, about 8%"]] },
    ],
    note: "Many guidelines now advise urgent specialist assessment for every suspected TIA whatever the score.",
    source: { label: "Johnston SC et al. Lancet 2007;369:283-92", url: pm("Johnston Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack") },
  },
  {
    id: "nihss", name: "NIHSS (National Institutes of Health Stroke Scale)", patterns: [/\bNIHSS\b/],
    purpose: "Measures the severity of an acute stroke from 15 neurological items. It is used to document deficits, follow change and help select treatment.", range: "0 to 42 points",
    tables: [
      { caption: "Items tested", columns: ["Group", "Items (each scored from 0)"], rows: [["Consciousness", "Level of consciousness, questions, commands (0–3, 0–2, 0–2)"], ["Eyes and face", "Gaze (0–2), visual fields (0–3), facial palsy (0–3)"], ["Limbs", "Motor arm and leg on each side (0–4 each); limb ataxia (0–2)"], ["Sensation, language, speech", "Sensory loss (0–2), best language (0–3), dysarthria (0–2)"], ["Attention", "Extinction and inattention (0–2)"]] },
      { caption: "How to read the total", columns: ["Score", "Severity"], rows: [["0", "No stroke symptoms"], ["1 to 4", "Minor stroke"], ["5 to 15", "Moderate stroke"], ["16 to 20", "Moderate to severe"], ["21 to 42", "Severe stroke"]] },
    ],
    source: { label: "Brott T et al. Stroke 1989;20:864-70", url: pm("Brott Measurements of acute cerebral infarction a clinical examination scale") },
  },
  {
    id: "sgarbossa", name: "Sgarbossa criteria", patterns: [/Sgarbossa/],
    purpose: "Finds myocardial infarction on an ECG that has a left bundle branch block or a paced rhythm, where ST changes are normally hard to interpret.", range: "Score of 3 or more is specific for infarction",
    tables: [{ caption: "Criteria", columns: ["Criterion", "Points"], rows: [["ST elevation of 1 mm or more in a lead with a positive QRS (concordant)", "5"], ["ST depression of 1 mm or more in leads V1 to V3 (concordant)", "3"], ["ST elevation of 1 mm or more in a lead with a negative QRS, and the ST elevation is 25% or more of the depth of the S wave (excessively discordant)", "2"]] }],
    note: "A total of 3 or more is highly specific for acute myocardial infarction; a lower score does not exclude it.",
    source: { label: "Sgarbossa EB et al. N Engl J Med 1996;334:481-7", url: pm("Sgarbossa Electrocardiographic diagnosis of evolving acute myocardial infarction in the presence of left bundle-branch block") },
  },
  {
    id: "nyha", name: "NYHA functional class (New York Heart Association)", patterns: [/\bNYHA\b/],
    purpose: "Describes how much heart failure limits everyday activity. It is used to follow symptoms and to choose treatments.", range: "Class I to IV",
    tables: [{ caption: "Classes", columns: ["Class", "Symptoms"], rows: [["I", "No limitation of ordinary physical activity"], ["II", "Slight limitation: comfortable at rest, ordinary activity causes fatigue, palpitation or breathlessness"], ["III", "Marked limitation: comfortable at rest, less than ordinary activity causes symptoms"], ["IV", "Symptoms at rest; any activity increases discomfort"]] }],
    source: { label: "New York Heart Association Criteria Committee, 1994", url: pm("New York Heart Association functional classification heart failure") },
  },
  {
    id: "mmrc", name: "mMRC dyspnoea scale (modified Medical Research Council)", patterns: [/\bmMRC\b/],
    purpose: "Grades breathlessness in chronic lung disease by the activity that causes it.", range: "Grade 0 to 4",
    tables: [{ caption: "Grades", columns: ["Grade", "Breathless"], rows: [["0", "Only on strenuous exercise"], ["1", "When hurrying on the level or walking up a slight hill"], ["2", "Walks slower than people of the same age or has to stop for breath on the level"], ["3", "Stops for breath after about 100 metres or a few minutes on the level"], ["4", "Too breathless to leave the house or when dressing"]] }],
    source: { label: "Fletcher CM. BMJ 1960;2:1665", url: pm("Fletcher Standardised questionnaire on respiratory symptoms") },
  },
  {
    id: "pram", name: "PRAM score (Preschool Respiratory Assessment Measure)", patterns: [/\bPRAM\b/],
    purpose: "Grades the severity of an acute asthma attack in a child from five signs, and is repeated to judge response to treatment.", range: "0 to 12 points", calculatorId: "pram",
    tables: [
      { caption: "Items", columns: ["Item", "Points"], rows: [["Oxygen saturation: 95% or more / 92–94% / below 92%", "0 / 1 / 2"], ["Suprasternal retraction: absent / present", "0 / 2"], ["Scalene muscle use: absent / present", "0 / 2"], ["Air entry: normal / decreased at the bases / decreased at apex and bases / minimal or absent", "0 / 1 / 2 / 3"], ["Wheeze: absent / expiratory only / inspiratory and expiratory / audible without stethoscope or silent chest", "0 / 1 / 2 / 3"]] },
      { caption: "How to read the total", columns: ["Score", "Severity"], rows: [["0 to 3", "Mild"], ["4 to 7", "Moderate"], ["8 to 12", "Severe"]] },
    ],
    source: { label: "Chalut DS et al. J Pediatr 2000;137:762-8", url: pm("Chalut The Preschool Respiratory Assessment Measure PRAM") },
  },
  {
    id: "silverman", name: "Silverman–Andersen retraction score", patterns: [/Silverman/i],
    purpose: "Grades respiratory distress in a newborn from five signs of the work of breathing.", range: "0 to 10 points", calculatorId: "silverman",
    tables: [
      { caption: "Items (each 0, 1 or 2)", columns: ["Item", "0", "1", "2"], rows: [["Upper chest movement", "Synchronised with abdomen", "Lag on inspiration", "See-saw breathing"], ["Lower chest retraction", "None", "Just visible", "Marked"], ["Xiphoid retraction", "None", "Just visible", "Marked"], ["Nasal flaring", "None", "Minimal", "Marked"], ["Expiratory grunt", "None", "Heard with stethoscope", "Heard without stethoscope"]] },
      { caption: "How to read the total", columns: ["Score", "Meaning"], rows: [["0", "No respiratory distress"], ["1 to 3", "Mild distress"], ["4 to 6", "Moderate distress; needs support"], ["7 or more", "Severe distress or impending respiratory failure"]] },
    ],
    source: { label: "Silverman WA, Andersen DH. Pediatrics 1956;17:1-10", url: pm("Silverman Andersen A controlled clinical trial of effects of water mist on obstructive respiratory signs") },
  },
  {
    id: "apgar", name: "Apgar score", patterns: [/\bApgar\b/i],
    purpose: "Describes how well a newborn is adapting in the first minutes after birth. It is scored at 1 and 5 minutes and does not decide whether to start resuscitation.", range: "0 to 10 points", calculatorId: "apgar",
    tables: [
      { caption: "Items (each 0, 1 or 2)", columns: ["Item", "0", "1", "2"], rows: [["Appearance (colour)", "Blue or pale all over", "Body pink, limbs blue", "Pink all over"], ["Pulse", "Absent", "Below 100", "100 or more"], ["Grimace (reflex)", "None", "Grimace", "Cough, sneeze or cry"], ["Activity (tone)", "Limp", "Some flexion", "Active movement"], ["Respiration", "Absent", "Weak or irregular", "Strong cry"]] },
      { caption: "How to read the total", columns: ["Score", "Meaning"], rows: [["7 to 10", "Normal"], ["4 to 6", "Moderately abnormal; may need stimulation or support"], ["0 to 3", "Low; needs resuscitation"]] },
    ],
    source: { label: "Apgar V. Curr Res Anesth Analg 1953;32:260-7", url: pm("Apgar A proposal for a new method of evaluation of the newborn infant") },
  },
  {
    id: "bishop", name: "Bishop score", patterns: [/\bBishop\b/],
    purpose: "Assesses how ready the cervix is for labour, to predict whether induction will succeed and whether cervical ripening is needed first.", range: "0 to 13 points", calculatorId: "bishop",
    tables: [
      { caption: "Items", columns: ["Item", "0", "1", "2", "3"], rows: [["Dilation (cm)", "Closed", "1–2", "3–4", "5 or more"], ["Effacement (%)", "0–30", "40–50", "60–70", "80 or more"], ["Station", "−3", "−2", "−1 or 0", "+1 or +2"], ["Consistency", "Firm", "Medium", "Soft", ""], ["Position", "Posterior", "Mid", "Anterior", ""]] },
      { caption: "How to read the total", columns: ["Score", "Meaning"], rows: [["6 or less", "Unfavourable cervix; induction less likely to succeed; ripening usually needed"], ["7", "Borderline"], ["8 or more", "Favourable; response similar to spontaneous labour"]] },
    ],
    source: { label: "Bishop EH. Obstet Gynecol 1964;24:266-8", url: pm("Bishop Pelvic scoring for elective induction") },
  },
  {
    id: "phq9", name: "PHQ-9 (Patient Health Questionnaire-9)", patterns: [/\bPHQ-?9\b/],
    purpose: "Nine questions about the last two weeks that screen for depression and measure its severity and change with treatment.", range: "0 to 27 points", calculatorId: "phq-9",
    tables: [
      { caption: "Scoring", columns: ["Answer to each of the 9 items", "Points"], rows: [["Not at all", "0"], ["Several days", "1"], ["More than half the days", "2"], ["Nearly every day", "3"]] },
      { caption: "How to read the total", columns: ["Score", "Severity", "Usual response"], rows: [["0 to 4", "None or minimal", "No treatment"], ["5 to 9", "Mild", "Watchful waiting; repeat"], ["10 to 14", "Moderate", "Psychological therapy or medicines"], ["15 to 19", "Moderately severe", "Active treatment"], ["20 to 27", "Severe", "Immediate treatment and specialist referral"]] },
    ],
    note: "Item 9 asks about thoughts of self-harm. Any answer above 0 needs a direct clinical risk assessment the same day.",
    source: { label: "Kroenke K et al. J Gen Intern Med 2001;16:606-13", url: pm("Kroenke The PHQ-9 validity of a brief depression severity measure") },
  },
  {
    id: "gad7", name: "GAD-7 (Generalised Anxiety Disorder-7)", patterns: [/\bGAD-?[27]\b/, /\bGAD scale\b/],
    purpose: "Seven questions about the last two weeks that screen for anxiety and measure its severity.", range: "0 to 21 points", calculatorId: "gad-7",
    tables: [
      { caption: "Scoring", columns: ["Answer to each of the 7 items", "Points"], rows: [["Not at all", "0"], ["Several days", "1"], ["More than half the days", "2"], ["Nearly every day", "3"]] },
      { caption: "How to read the total", columns: ["Score", "Severity"], rows: [["0 to 4", "Minimal"], ["5 to 9", "Mild"], ["10 to 14", "Moderate"], ["15 to 21", "Severe"]] },
    ],
    note: "A score of 10 or more is the usual threshold for further assessment.",
    source: { label: "Spitzer RL et al. Arch Intern Med 2006;166:1092-7", url: pm("Spitzer A brief measure for assessing generalized anxiety disorder the GAD-7") },
  },
  {
    id: "parkland", name: "Parkland formula and the rule of nines", patterns: [/Parkland/, /rule of nines/i, /Lund[-\s]and[-\s]Browder/i],
    purpose: "The rule of nines estimates the percentage of body surface burnt (TBSA); the Parkland formula then estimates the crystalloid needed in the first 24 hours.", range: "Calculated volume", calculatorId: "parkland",
    tables: [
      { caption: "Rule of nines (adult)", columns: ["Area", "% of body surface"], rows: [["Head and neck", "9"], ["Each arm", "9"], ["Front of trunk", "18"], ["Back of trunk", "18"], ["Each leg", "18"], ["Genitalia", "1"]] },
      { caption: "Parkland formula", columns: ["Step", "Calculation"], rows: [["Total fluid in 24 hours", "4 mL × body weight (kg) × % TBSA burnt (Ringer's lactate)"], ["Timing", "Half in the first 8 hours from the time of the burn; the other half over the next 16 hours"], ["Adjustment", "Titrate to urine output about 0.5 mL/kg/h in adults and 1 mL/kg/h in children"], ["Children", "Use the Lund and Browder chart, which adjusts head and leg proportions for age"]] },
    ],
    note: "Count partial-thickness and full-thickness burns only; do not include superficial erythema. The formula is a starting point, not a fixed order.",
    source: { label: "Baxter CR, Shires T. Ann N Y Acad Sci 1968;150:874-94", url: pm("Baxter Shires Physiological response to crystalloid resuscitation of severe burns") },
  },
  {
    id: "apri", name: "APRI (AST-to-Platelet Ratio Index)", patterns: [/\bAPRI\b/],
    purpose: "A blood-test estimate of liver fibrosis and cirrhosis from AST and platelets, widely used in hepatitis B and C where elastography is not available.", range: "Calculated value",
    tables: [
      { caption: "Formula", columns: ["Formula"], rows: [["APRI = [AST ÷ upper limit of normal AST] ÷ platelet count (10⁹/L) × 100"]] },
      { caption: "How to read the value (WHO hepatitis B guidance, 2015)", columns: ["APRI", "Meaning"], rows: [["Below 0.5", "Significant fibrosis unlikely"], ["0.5 to 2.0", "Possible significant fibrosis; further assessment"], ["Above 2.0", "Cirrhosis likely; treat and refer"]] },
    ],
    note: "AST rises in many liver and non-liver conditions, so interpret with the clinical picture and repeat or confirm with elastography when available.",
    source: { label: "WHO. Guidelines for the prevention, care and treatment of persons with chronic hepatitis B infection, 2015", url: "https://www.who.int/publications/i/item/9789241549059" },
  },
  {
    id: "mews", name: "MEWS (Modified Early Warning Score)", patterns: [/\bMEWS\b/],
    purpose: "Adds up five routine observations to flag a deteriorating adult on a ward; it is the forerunner of NEWS2.", range: "0 to 14 points",
    tables: [
      { caption: "Parameters scored", columns: ["Parameter", "Scores 3", "Scores 2", "Scores 1", "Scores 0"], rows: [["Systolic blood pressure (mmHg)", "70 or less", "71–80 or 200 or more", "81–100", "101–199"], ["Heart rate (per minute)", "130 or more", "40 or less, or 111–129", "41–50 or 101–110", "51–100"], ["Respiratory rate (per minute)", "30 or more", "Below 9, or 21–29", "15–20", "9–14"], ["Temperature (°C)", "", "Below 35 or 38.5 or more", "", "35–38.4"], ["Consciousness", "Unresponsive", "Responds to pain", "Responds to voice", "Alert"]] },
      { caption: "How to read the total", columns: ["Score", "Meaning"], rows: [["0 to 2", "Routine monitoring"], ["3 to 4", "Increase observation frequency and review"], ["5 or more", "Higher risk of death or ICU admission; urgent senior review"]] },
    ],
    source: { label: "Subbe CP et al. QJM 2001;94:521-6", url: pm("Subbe Validation of a modified Early Warning Score in medical admissions") },
  },
  {
    id: "avpu", name: "AVPU scale", patterns: [/\bAVPU\b/],
    purpose: "A four-level bedside check of consciousness used when a full Glasgow Coma Scale is not practical.", range: "Four levels",
    tables: [{ caption: "Levels", columns: ["Level", "Meaning"], rows: [["A: Alert", "Awake and responding normally"], ["V: Voice", "Responds only to a spoken command"], ["P: Pain", "Responds only to a painful stimulus"], ["U: Unresponsive", "No response; roughly equivalent to a Glasgow Coma Scale of 8 or less"]] }],
    note: "Anything other than Alert counts as altered consciousness and needs urgent assessment.",
    source: { label: "Royal College of Physicians. NEWS2, 2017 (AVPU consciousness levels)", url: "https://www.rcp.ac.uk/improving-care/resources/national-early-warning-score-news-2/" },
  },
  {
    id: "rockall", name: "Rockall score", patterns: [/\bRockall\b/],
    purpose: "Estimates the risk of rebleeding and death after upper gastrointestinal bleeding. The pre-endoscopy score uses clinical items; the full score adds endoscopic findings.", range: "0 to 7 before endoscopy; 0 to 11 in full",
    tables: [
      { caption: "Items", columns: ["Item", "0", "1", "2", "3"], rows: [["Age (years)", "Under 60", "60–79", "80 or over", ""], ["Shock", "None (pulse under 100, systolic 100 or more)", "Pulse 100 or more, systolic 100 or more", "Systolic below 100", ""], ["Comorbidity", "None", "", "Heart failure, ischaemic heart disease or other major illness", "Kidney or liver failure, disseminated cancer"], ["Diagnosis (endoscopy)", "Mallory–Weiss tear or no lesion", "All other diagnoses", "Upper gastrointestinal cancer", ""], ["Stigmata of recent bleeding (endoscopy)", "None or dark spot", "", "Blood, adherent clot, visible or spurting vessel", ""]] },
      { caption: "How to read the full score", columns: ["Score", "Meaning"], rows: [["0 to 2", "Low risk of rebleeding and death; early discharge can be considered"], ["3 to 4", "Intermediate risk"], ["5 or more", "High risk of rebleeding and death"]] },
    ],
    source: { label: "Rockall TA et al. Gut 1996;38:316-21", url: pm("Rockall Risk assessment after acute upper gastrointestinal haemorrhage") },
  },
  {
    id: "lille", name: "Lille score", patterns: [/\bLille\b/],
    purpose: "Judges response to corticosteroids at day 7 in severe alcohol-associated hepatitis. A high score means the steroid is not working and should be stopped.", range: "0 to 1",
    tables: [
      { caption: "Inputs", columns: ["Input", "Notes"], rows: [["Age, albumin, creatinine, prothrombin time", "At the start of treatment"], ["Bilirubin", "At day 0 and at day 7"]] },
      { caption: "How to read the value", columns: ["Lille", "Meaning"], rows: [["Below 0.45", "Responder: continue prednisolone for 28 days (6-month survival about 85%)"], ["0.45 or above", "Non-responder: stop prednisolone (6-month survival about 25%); consider transplant assessment"]] },
    ],
    note: "The value is calculated with the published formula or an online tool; do not estimate it by eye.",
    source: { label: "Louvet A et al. Hepatology 2007;45:1348-54", url: pm("Louvet The Lille model a new tool for therapeutic strategy in patients with severe alcoholic hepatitis treated with steroids") },
  },
  {
    id: "cat", name: "COPD Assessment Test (CAT)", patterns: [/\bCAT score\b/, /\bCOPD Assessment Test\b/],
    purpose: "Eight questions that measure how much chronic obstructive pulmonary disease affects daily life.", range: "0 to 40 points",
    tables: [
      { caption: "Scoring", columns: ["Part", "Detail"], rows: [["Questions", "Cough, phlegm, chest tightness, breathlessness on hills, activity at home, confidence leaving home, sleep, energy"], ["Each question", "Scored from 0 (no problem) to 5 (worst)"]] },
      { caption: "How to read the total", columns: ["Score", "Impact of COPD"], rows: [["0 to 9", "Low"], ["10 to 20", "Medium"], ["21 to 30", "High"], ["31 to 40", "Very high"]] },
    ],
    note: "A score of 10 or more is the usual threshold for more symptomatic disease (GOLD group B or E).",
    source: { label: "Jones PW et al. Eur Respir J 2009;34:648-54", url: pm("Jones Development and first validation of the COPD Assessment Test") },
  },
  {
    id: "epworth", name: "Epworth Sleepiness Scale", patterns: [/\bEpworth\b/],
    purpose: "Eight everyday situations rated for the chance of dozing, to measure excessive daytime sleepiness.", range: "0 to 24 points",
    tables: [
      { caption: "Scoring", columns: ["Answer to each situation", "Points"], rows: [["Would never doze", "0"], ["Slight chance of dozing", "1"], ["Moderate chance of dozing", "2"], ["High chance of dozing", "3"]] },
      { caption: "How to read the total", columns: ["Score", "Meaning"], rows: [["0 to 10", "Normal"], ["11 to 12", "Mild excessive sleepiness"], ["13 to 15", "Moderate"], ["16 to 24", "Severe"]] },
    ],
    note: "It measures sleepiness, not sleep apnoea. It must not be used alone to decide on referral or testing.",
    source: { label: "Johns MW. Sleep 1991;14:540-5", url: pm("Johns A new method for measuring daytime sleepiness the Epworth sleepiness scale") },
  },
  {
    id: "who-hiv-stage", name: "WHO clinical staging of HIV disease", patterns: [/WHO (?:clinical )?stage/i],
    purpose: "Groups people with HIV into four stages by their symptoms and conditions. Stage 3 or 4, or a CD4 count below 200 cells/mm³, defines advanced HIV disease.", range: "Stage 1 to 4",
    tables: [{ caption: "Stages and examples", columns: ["Stage", "Examples"], rows: [["1: asymptomatic", "No symptoms; persistent generalised lymphadenopathy"], ["2: mild", "Weight loss under 10%, recurrent respiratory infections, herpes zoster, angular cheilitis, recurrent oral ulcers, itchy rash, fungal nail infection"], ["3: advanced", "Weight loss over 10%, chronic diarrhoea over 1 month, persistent fever, persistent oral candidiasis, pulmonary tuberculosis, severe bacterial infection, severe anaemia or neutropenia"], ["4: severe", "HIV wasting, Pneumocystis pneumonia, oesophageal candidiasis, extrapulmonary tuberculosis, cryptococcal meningitis, toxoplasmosis of the brain, Kaposi sarcoma, cytomegalovirus disease, lymphoma"]] }],
    source: { label: "WHO. Case definitions of HIV for surveillance and revised clinical staging, 2007", url: "https://www.who.int/publications/i/item/9789241595629" },
  },
  {
    id: "shock-index", name: "Shock index", patterns: [/\bshock index\b/i],
    purpose: "Heart rate divided by systolic blood pressure. It picks up circulatory compromise earlier than either value alone, for example in obstetric haemorrhage, trauma and bleeding.", range: "Calculated ratio",
    tables: [
      { caption: "Formula", columns: ["Formula"], rows: [["Shock index = heart rate (beats per minute) ÷ systolic blood pressure (mmHg)"]] },
      { caption: "How to read the value (adults)", columns: ["Shock index", "Meaning"], rows: [["0.5 to 0.7", "Normal"], ["Above 0.9", "Abnormal; look for bleeding or sepsis and treat"], ["Above 1.0", "Significant shock risk; urgent resuscitation"]] },
    ],
    note: "In pregnancy, a shock index of 0.9 or more is used as a trigger for obstetric haemorrhage. Beta-blockers can mask a raised value.",
    source: { label: "Allgöwer M, Burri C. Dtsch Med Wochenschr 1967;92:1947-50", url: pm("shock index heart rate systolic blood pressure Allgower Burri") },
  },
  {
    id: "ciwa", name: "CIWA-Ar (Clinical Institute Withdrawal Assessment for Alcohol, revised)", patterns: [/CIWA/],
    purpose: "Ten items that measure the severity of alcohol withdrawal and guide how much benzodiazepine to give.", range: "0 to 67 points",
    tables: [
      { caption: "Items assessed", columns: ["Item", "Scored"], rows: [["Nausea and vomiting, tremor, sweating, anxiety, agitation, headache", "0 to 7 each"], ["Tactile, auditory and visual disturbances", "0 to 7 each"], ["Orientation and clouding of sensorium", "0 to 4"]] },
      { caption: "How to read the total", columns: ["Score", "Severity", "Usual response"], rows: [["Below 8", "Minimal", "Supportive care; repeat"], ["8 to 15", "Mild to moderate", "Symptom-triggered benzodiazepine if symptomatic"], ["16 to 20", "Moderate", "Benzodiazepine; admit"], ["Above 20", "Severe: risk of seizures and delirium tremens", "Monitored setting and higher dosing"]] },
    ],
    note: "Do not use CIWA-Ar if the patient cannot communicate; use clinical observation instead.",
    source: { label: "Sullivan JT et al. Br J Addict 1989;84:1353-7", url: pm("Sullivan Assessment of alcohol withdrawal the revised clinical institute withdrawal assessment for alcohol scale CIWA-Ar") },
  },
  {
    id: "puqe", name: "PUQE-24 score (Pregnancy-Unique Quantification of Emesis)", patterns: [/PUQE/],
    purpose: "Three questions that grade nausea and vomiting of pregnancy over the last 24 hours and guide treatment.", range: "3 to 15 points",
    tables: [
      { caption: "Questions (each scored 1 to 5)", columns: ["Question", "Scoring"], rows: [["Hours of nausea in the last 24 hours", "None = 1; up to 1 hour = 2; 2–3 hours = 3; 4–6 hours = 4; more than 6 hours = 5"], ["Number of vomiting episodes", "None = 1; 1–2 = 2; 3–4 = 3; 5–6 = 4; 7 or more = 5"], ["Number of episodes of dry retching", "None = 1; 1–2 = 2; 3–4 = 3; 5–6 = 4; 7 or more = 5"]] },
      { caption: "How to read the total", columns: ["Score", "Severity"], rows: [["6 or less", "Mild"], ["7 to 12", "Moderate"], ["13 or more", "Severe; consider admission for intravenous fluids"]] },
    ],
    source: { label: "Ebrahimi N et al. J Obstet Gynaecol Can 2010", url: pm("PUQE-24 Pregnancy-Unique Quantification of Emesis") },
  },
  {
    id: "ferriman-gallwey", name: "Modified Ferriman–Gallwey score", patterns: [/Ferriman/],
    purpose: "Grades excess body hair in nine body areas to assess hirsutism, for example in polycystic ovary syndrome.", range: "0 to 36 points",
    tables: [
      { caption: "Scoring", columns: ["Part", "Detail"], rows: [["Areas", "Upper lip, chin, chest, upper back, lower back, upper abdomen, lower abdomen, upper arm, thigh"], ["Each area", "0 (no terminal hair) to 4 (frankly virile)"]] },
      { caption: "How to read the total", columns: ["Score", "Meaning"], rows: [["Below 8", "Not hirsute by the usual cut-off"], ["8 to 15", "Mild"], ["16 to 25", "Moderate"], ["Above 25", "Severe"]] },
    ],
    note: "Cut-offs vary by ethnicity; some South Asian guidance uses 6 or more as hirsutism. Interpret with ethnicity and distress in mind.",
    source: { label: "Hatch R et al. Am J Obstet Gynecol 1981;140:815-30", url: pm("Hatch Hirsutism implications etiology and management modified Ferriman Gallwey") },
  },
  {
    id: "jones", name: "Revised Jones criteria for acute rheumatic fever (2015)", patterns: [/Jones criteria/i, /Jones' criteria/i],
    purpose: "Diagnoses a first attack of acute rheumatic fever from major and minor manifestations plus evidence of a preceding group A streptococcal infection. India is a moderate- or high-risk population.", range: "Criteria met or not",
    tables: [
      { caption: "Manifestations in moderate- and high-risk populations", columns: ["Major criteria", "Minor criteria"], rows: [["Carditis (clinical or subclinical on echocardiography)", "Monoarthralgia"], ["Arthritis: polyarthritis or monoarthritis", "Fever of 38 °C or more"], ["Sydenham chorea", "ESR 30 mm/h or more, or CRP 3 mg/dL or more"], ["Erythema marginatum", "Prolonged PR interval (if no carditis)"], ["Subcutaneous nodules", ""]] },
      { caption: "How to diagnose a first attack", columns: ["Requirement", "Detail"], rows: [["Evidence of preceding streptococcal infection", "Raised or rising ASO or anti-DNase B, positive throat culture or rapid antigen test, or recent scarlet fever"], ["Plus", "Two major criteria, or one major and two minor criteria"]] },
    ],
    source: { label: "Gewitz MH et al. Circulation 2015;131:1806-18", url: pm("Gewitz Revision of the Jones Criteria for the diagnosis of acute rheumatic fever in the era of Doppler echocardiography") },
  },
  {
    id: "rotterdam", name: "Rotterdam criteria for polycystic ovary syndrome", patterns: [/Rotterdam criteria/i],
    purpose: "Diagnoses polycystic ovary syndrome in adults after other causes have been excluded: two of three features are needed.", range: "Two of three features",
    tables: [{ caption: "The three features (two needed)", columns: ["Feature", "Detail"], rows: [["Oligo-ovulation or anovulation", "Irregular or absent periods"], ["Hyperandrogenism", "Clinical (hirsutism, acne) or biochemical (raised free androgen)"], ["Polycystic ovaries on ultrasound", "12 or more follicles of 2–9 mm in an ovary, or ovarian volume above 10 mL"]] }],
    note: "Exclude thyroid disease, hyperprolactinaemia and non-classic congenital adrenal hyperplasia first. In adolescents, use irregular periods and hyperandrogenism, and do not rely on ultrasound.",
    source: { label: "Teede HJ et al. International evidence-based guideline for PCOS, 2023", url: "https://www.monash.edu/medicine/sphc/mchri/pcos" },
  },
  {
    id: "act", name: "Asthma Control Test (ACT)", patterns: [/\bACT score\b/, /Asthma Control Test/i],
    purpose: "Five questions about the last four weeks that show how well asthma is controlled.", range: "5 to 25 points",
    tables: [
      { caption: "Questions (each scored 1 to 5)", columns: ["Question about the last 4 weeks"], rows: [["Asthma kept you from getting things done at work, school or home"], ["Shortness of breath"], ["Symptoms woke you at night or early in the morning"], ["Use of a reliever inhaler or nebuliser"], ["Your own rating of asthma control"]] },
      { caption: "How to read the total", columns: ["Score", "Meaning"], rows: [["25", "Complete control"], ["20 to 24", "Well controlled"], ["19 or less", "Not well controlled; review inhaler technique, adherence and treatment"]] },
    ],
    source: { label: "Nathan RA et al. J Allergy Clin Immunol 2004;113:59-65", url: pm("Nathan Development of the asthma control test") },
  },
  {
    id: "years", name: "YEARS algorithm for suspected pulmonary embolism", patterns: [/YEARS (?:rule|algorithm|criteria)/i],
    purpose: "Uses three clinical items to choose the D-dimer threshold, so that more patients with suspected pulmonary embolism can avoid CT pulmonary angiography.", range: "0 to 3 items",
    tables: [
      { caption: "The three YEARS items", columns: ["Item"], rows: [["Clinical signs of deep vein thrombosis"], ["Haemoptysis"], ["Pulmonary embolism is the most likely diagnosis"]] },
      { caption: "How to read the result", columns: ["Items present", "D-dimer", "Result"], rows: [["None", "Below 1000 ng/mL", "Pulmonary embolism excluded"], ["None", "1000 ng/mL or above", "Do CT pulmonary angiography"], ["One or more", "Below 500 ng/mL", "Pulmonary embolism excluded"], ["One or more", "500 ng/mL or above", "Do CT pulmonary angiography"]] },
    ],
    note: "Not for patients who are haemodynamically unstable or already anticoagulated.",
    source: { label: "van der Hulle T et al. Lancet 2017;390:289-97", url: pm("van der Hulle Simplified diagnostic management of suspected pulmonary embolism YEARS") },
  },
  {
    id: "carotid-stenosis", name: "NASCET and ECST methods of measuring carotid stenosis", patterns: [/NASCET/, /\bECST\b/],
    purpose: "Two ways of expressing the degree of carotid stenosis from imaging. The same artery gives a lower percentage by ECST than by NASCET.", range: "Percentage stenosis",
    tables: [
      { caption: "The two methods", columns: ["Method", "Calculation", "Notes"], rows: [["NASCET", "(1 − narrowest diameter ÷ diameter of the normal distal internal carotid artery) × 100", "Used in most current guidelines; 70% to 99% is severe"], ["ECST", "(1 − narrowest diameter ÷ estimated diameter of the carotid bulb at that point) × 100", "Gives a higher figure; 80% ECST is about 50% NASCET"]] },
    ],
    source: { label: "NASCET Collaborators. N Engl J Med 1991;325:445-53", url: pm("North American Symptomatic Carotid Endarterectomy Trial beneficial effect of carotid endarterectomy in symptomatic patients with high-grade carotid stenosis") },
  },
  {
    id: "qrisk3", name: "QRISK3 cardiovascular risk score", patterns: [/QRISK/],
    purpose: "Estimates the 10-year risk of heart attack or stroke from age, sex, ethnicity, blood pressure, cholesterol, smoking, diabetes and other conditions, to decide who should be offered a statin.", range: "Percentage 10-year risk",
    tables: [{ caption: "How to read the result", columns: ["10-year risk", "Meaning"], rows: [["Below 10%", "Lower risk; lifestyle advice"], ["10% or above", "Offer discussion of a statin (NICE)"], ["20% or above", "High risk; offer a high-intensity statin"]] }],
    note: "It was built on UK data and may underestimate risk in South Asian people; use clinical judgement. QRISK3 is run in an online calculator.",
    source: { label: "Hippisley-Cox J et al. BMJ 2017;357:j2099", url: pm("Hippisley-Cox Development and validation of QRISK3 risk prediction algorithms") },
  },
  {
    id: "frax", name: "FRAX fracture risk score", patterns: [/\bFRAX\b/],
    purpose: "Estimates the 10-year probability of a major osteoporotic fracture and of hip fracture from age, sex, weight, previous fracture, family history, smoking, alcohol, steroids and bone density.", range: "Percentage 10-year probability",
    tables: [{ caption: "How to read the result", columns: ["Finding", "Meaning"], rows: [["Major osteoporotic fracture risk of 20% or more, or hip fracture risk of 3% or more (US threshold)", "Treatment is usually recommended"], ["Lower values", "Use country-specific intervention thresholds and clinical judgement"]] }],
    note: "Thresholds depend on the country. FRAX is run in an online calculator.",
    source: { label: "Kanis JA et al. Osteoporos Int 2008;19:385-97", url: pm("Kanis FRAX and the assessment of fracture probability in men and women from the UK") },
  },
  {
    id: "burch-wartofsky", name: "Burch-Wartofsky point scale for thyroid storm", patterns: [/Burch[-–]Wartofsky/],
    purpose: "Scores how likely it is that a patient with thyrotoxicosis has thyroid storm, using temperature, nervous system, gut and liver, heart and precipitant features. It supports, but does not replace, clinical diagnosis.",
    range: "0 to 140 points",
    tables: [
      { caption: "Items scored", columns: ["Feature", "Points"], rows: yes([
        ["Temperature", "37.2–37.7°C = 5; 37.8–38.2 = 10; 38.3–38.8 = 15; 38.9–39.3 = 20; 39.4–39.9 = 25; 40.0 or above = 30"],
        ["Central nervous system", "Absent = 0; mild (agitation) = 10; moderate (delirium, psychosis, extreme lethargy) = 20; severe (seizure, coma) = 30"],
        ["Gastrointestinal and liver", "Absent = 0; moderate (diarrhoea, nausea, vomiting, abdominal pain) = 10; severe (unexplained jaundice) = 20"],
        ["Heart rate (beats/min)", "90–109 = 5; 110–119 = 10; 120–129 = 15; 130–139 = 20; 140 or above = 25"],
        ["Heart failure", "Absent = 0; mild (ankle oedema) = 5; moderate (bibasal crackles) = 10; severe (pulmonary oedema) = 15"],
        ["Atrial fibrillation", "Absent = 0; present = 10"], ["Precipitating event", "Absent = 0; present = 10"],
      ]) },
      { caption: "How to read the total", columns: ["Total", "Meaning"], rows: [
        ["45 or above", "Highly suggestive of thyroid storm"], ["25 to 44", "Impending storm; treat as storm"], ["Below 25", "Storm unlikely"],
      ] },
    ],
    note: "Score the worst value in each group. Thyroid hormone levels are not part of the scale and do not separate storm from uncomplicated thyrotoxicosis.",
    source: { label: "Burch HB, Wartofsky L. Endocrinol Metab Clin North Am 1993;22:263-77", url: pm("Burch Wartofsky Life-threatening thyrotoxicosis thyroid storm 1993") },
  },
  {
    id: "gmaws", name: "GMAWS (Glasgow Modified Alcohol Withdrawal Scale)", patterns: [/\bGMAWS\b/, /Glasgow Modified Alcohol Withdrawal/i],
    purpose: "Five bedside items that grade the severity of alcohol withdrawal and guide symptom-triggered benzodiazepine dosing. It is repeated at set intervals, including overnight.",
    range: "0 to 10 points",
    tables: [
      { caption: "Items scored (0 to 2 each)", columns: ["Item", "0", "1", "2"], rows: [
        ["Tremor", "None", "Arms outstretched", "At rest"],
        ["Sweating", "None", "Moist", "Drenching"],
        ["Hallucinations", "None", "Dubious or brief", "Present"],
        ["Orientation", "Oriented", "Vague or detached", "Disoriented or no contact"],
        ["Agitation", "Calm", "Anxious", "Panicky"],
      ] },
      { caption: "How to read the total", columns: ["Score", "Meaning"], rows: [
        ["0", "No withdrawal features; continue scoring"], ["1 to 3", "Mild withdrawal"], ["4 to 8", "Moderate withdrawal; benzodiazepine dose by the scale"], ["9 to 10", "Severe withdrawal; urgent senior review"],
      ] },
    ],
    note: "Four consecutive scores of 0 suggest withdrawal has settled. Severe withdrawal and delirium tremens need senior review whatever the score.",
    source: { label: "McPherson A et al. Alcohol Alcohol 2012;47:688-93 (Glasgow Modified Alcohol Withdrawal Scale)", url: pm("McPherson Glasgow modified alcohol withdrawal scale 2012") },
  },
];

/* ---- First-use detection ---------------------------------------------------------------------------------- */

export type ScoreSection = "pathophysiology" | "signs-symptoms" | "investigations" | "management";
const SECTION_ORDER: ScoreSection[] = ["pathophysiology", "signs-symptoms", "investigations", "management"];
const PLACEMENT_SECTION: Record<string, ScoreSection> = { recognise: "signs-symptoms", confirm: "investigations", manage: "management", ongoing: "management" };

type Loose = Record<string, any> | undefined | null; // eslint-disable-line @typescript-eslint/no-explicit-any
const text = (value: unknown) => (value === undefined || value === null ? "" : typeof value === "string" ? value : JSON.stringify(value));

/** The main-body text of each section, in the order a reader meets it. Teaching blocks (quizzes, explanations) are excluded. */
export function sectionTexts(disease: Loose): Array<{ section: ScoreSection; text: string }> {
  const d = (disease ?? {}) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const algorithms: Array<Record<string, any>> = Array.isArray(d.algorithms) ? d.algorithms : []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const out: Array<{ section: ScoreSection; text: string }> = [
    { section: "pathophysiology", text: text(d.teaching?.vignette) },
    { section: "pathophysiology", text: text(d.pathophysiology) },
    { section: "signs-symptoms", text: text(d.presentation) },
    { section: "signs-symptoms", text: text(d.differentials) },
  ];
  for (const placement of ["recognise", "confirm", "manage", "ongoing"]) {
    const section = PLACEMENT_SECTION[placement];
    out.push({ section, text: algorithms.filter((a) => a.placement === placement).map((a) => text(a.nodes)).join(" ") });
  }
  out.push({ section: "investigations", text: text(d.diagnosticCriteria) }, { section: "investigations", text: text(d.investigations) });
  out.push({ section: "management", text: text(d.clinicalManagement) }, { section: "management", text: text(d.medicationPlan) }, { section: "management", text: text(d.nonClinicalManagement) });
  return out.sort((a, b) => SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section));
}

/** Scores named anywhere in the main body, each with the section where it is first used. */
export function scoresByFirstUse(disease: Loose): Record<ScoreSection, ScoreDefinition[]> {
  const result: Record<ScoreSection, ScoreDefinition[]> = { pathophysiology: [], "signs-symptoms": [], investigations: [], management: [] };
  const chunks = sectionTexts(disease);
  for (const score of clinicalScores) {
    const hit = chunks.find((chunk) => score.patterns.some((pattern) => pattern.test(chunk.text)));
    if (hit) result[hit.section].push(score);
  }
  return result;
}

/* ---- Authoring check: a score named in the main body must be in the registry above ----------------------------- */

const SCORE_NAME = /\b((?:[A-Z]{2,}[A-Za-z0-9²₂]*|[A-Z][a-z]+[-–][A-Z][a-z]+)(?:[-–][A-Za-z0-9²₂]+)*) (?:score|index|criteria|rule|scale|classification)\b/g;
/** Names that look like scores but are manuals, organisations, imaging or ordinary terms. */
const NOT_A_SCORE = new Set(["DSM", "DSM-5", "ICHD-3", "AAD", "MoH", "MOH", "STS", "CAP", "CT", "ICU", "DKA", "NICE", "NG259", "AUB", "WHO", "ESC", "AHA", "ACC", "ICMR", "NTEP", "IAP", "CDC", "ASA", "GOLD", "GINA", "SASMBS", "AAS", "FS", "NSW", "BMI", "Z", "T", "Body-mass", "Glasgow-Blatchford"]);

/** Score names the topic uses that have no explanation in the registry. Empty when every score is explained. */
export function unexplainedScores(disease: Loose): string[] {
  const body = sectionTexts(disease).map((chunk) => chunk.text).join(" \n ");
  const found = new Set<string>();
  for (const match of body.matchAll(SCORE_NAME)) {
    const name = match[1];
    if (NOT_A_SCORE.has(name)) continue;
    const phrase = match[0];
    if (clinicalScores.some((score) => score.patterns.some((pattern) => pattern.test(phrase) || pattern.test(name)))) continue;
    found.add(phrase);
  }
  return [...found];
}
