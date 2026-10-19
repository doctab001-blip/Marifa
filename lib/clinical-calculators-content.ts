/* Page content for every calculator except Wells' PE (which carries its own): When to use, Why use, Next steps,
 * Evidence appraisal, creator and related calculators. Written for Marifa; figures are approximate and come from
 * the cited derivation or validation studies. */
import type { CalculatorNextSteps } from "./clinical-calculators";

export interface CalculatorContent {
  when: string; why: string; nextSteps: CalculatorNextSteps; evidenceAppraisal: string[];
  creator?: { name: string; bio: string[] }; related: string[];
}

export const calculatorContent: Record<string, CalculatorContent> = {
  "cha2ds2-vasc": {
    when: "Use in a patient with non-valvular atrial fibrillation or flutter to estimate stroke risk and decide whether to offer oral anticoagulation.",
    why: "A quick sum of eight clinical risk factors. It picks out truly low-risk patients better than the older CHADS₂ score and is the stroke-risk tool used by NICE and ESC.",
    nextSteps: {
      advice: ["Check bleeding risk with HAS-BLED to find fixable factors, not to talk yourself out of anticoagulation.", "Make the decision with the patient and record it.", "Recalculate at least yearly: age and comorbidities change the score."],
      management: [{ title: "Typical thresholds", items: ["Score 0 in a man, or 1 in a woman from sex alone: no antithrombotic treatment needed.", "Score 1 in a man, or 2 in a woman: consider oral anticoagulation after discussing benefits and risks.", "Score 2 or more in a man, or 3 or more in a woman: offer oral anticoagulation. A direct oral anticoagulant is usually first choice over warfarin.", "ESC 2024 uses CHA₂DS₂-VA (no sex item): anticoagulation recommended at 2 or more, considered at 1."] }],
      critical: ["Do not use aspirin alone as stroke prevention in AF.", "Mechanical heart valve or moderate to severe mitral stenosis needs warfarin whatever the score.", "New weakness, speech or vision change needs emergency stroke assessment."],
    },
    evidenceAppraisal: ["Derived from the Euro Heart Survey on atrial fibrillation (about 1,000 patients) and since validated in large registries and trial cohorts across many countries.", "Strengths: simple, no tests needed, good at identifying low-risk patients.", "Weaknesses: only modest ability to rank individual risk, treats each factor as yes or no, and leaves out kidney function, atrial size and biomarkers."],
    creator: { name: "Gregory Y. H. Lip, MD", bio: ["Professor of cardiovascular medicine at the University of Liverpool and Aalborg University.", "Led the work that produced CHA₂DS₂-VASc and the companion HAS-BLED score."] },
    related: ["has-bled", "cockcroft-gault", "ckd-epi-egfr"],
  },
  "has-bled": {
    when: "Use in a patient with atrial fibrillation who is on, or about to start, an anticoagulant, to find bleeding risks that can be changed.",
    why: "Turns a general worry about bleeding into a checklist of things you can act on: blood pressure, unstable INR, alcohol, interacting drugs.",
    nextSteps: {
      advice: ["Fix what can be fixed: control blood pressure, stop NSAIDs and unnecessary antiplatelets, reduce alcohol, improve INR control or switch to a DOAC.", "Review at every visit: items such as blood pressure and INR change over time."],
      management: [{ title: "By score", items: ["0 to 1: lower risk, routine follow-up.", "2: moderate risk. Review and correct modifiable factors.", "3 or more: higher risk. Review more often and look hard at every modifiable factor."] }],
      critical: ["A high score is not a reason to withhold anticoagulation that is otherwise indicated; benefit usually outweighs the risk.", "Active major bleeding or recent intracranial haemorrhage needs urgent specialist review of anticoagulation."],
    },
    evidenceAppraisal: ["Derived from the Euro Heart Survey and validated in several anticoagulation trial cohorts. Predicts major bleeding at about the same level as other bleeding scores.", "Weaknesses: discrimination is moderate, some items (labile INR) do not apply to DOAC users, and it does not capture bleeding risk that changes over time."],
    creator: { name: "Ron Pisters, MD, and Gregory Y. H. Lip, MD", bio: ["Published in Chest in 2010, based on the Euro Heart Survey on atrial fibrillation."] },
    related: ["cha2ds2-vasc", "cockcroft-gault"],
  },
  "heart-score": {
    when: "Use in the emergency department for an adult with chest pain suspected to be a non-ST-elevation acute coronary syndrome.",
    why: "Combines history, ECG, age, risk factors and troponin into one number. Patients scoring 0 to 3 have a low rate of major cardiac events and can be considered for early discharge.",
    nextSteps: {
      advice: ["Use your laboratory's high-sensitivity troponin protocol and repeat troponin as it requires.", "Write down each of the five components, not only the total.", "Re-check the diagnosis if the patient's pain or observations change."],
      management: [{ title: "By score", items: ["0 to 3: major adverse cardiac event rate about 2% in validation studies. Discharge can be considered if serial troponin is normal and the ECG is unchanged, with outpatient follow-up.", "4 to 6: about 17%. Observe, repeat troponin and arrange non-invasive testing such as CT coronary angiography or stress testing.", "7 to 10: about 50%. Treat as acute coronary syndrome and involve cardiology early for an invasive strategy."] }],
      critical: ["ST elevation or haemodynamic instability goes straight to the STEMI or ACS pathway; do not score first.", "Keep other causes of chest pain in mind: aortic dissection, pulmonary embolism, pneumothorax, oesophageal rupture.", "The history item is subjective; when in doubt, score it higher."],
    },
    evidenceAppraisal: ["Derived in a Dutch emergency cohort and validated in a multicentre study of about 2,900 patients, then in several prospective trials. Using it in a care pathway shortened emergency stay without raising missed events.", "Weaknesses: the history item varies between clinicians, troponin cut-offs differ between assays, and results from the original conventional troponin do not transfer exactly to high-sensitivity assays."],
    creator: { name: "A. J. Six, MD, PhD", bio: ["Cardiologist in the Netherlands who led the original derivation of the HEART score, with later validation by B. E. Backus and colleagues."] },
    related: ["wells-pe", "perc", "news2"],
  },
  "ckd-epi-egfr": {
    when: "Use in adults to estimate kidney function when staging or monitoring chronic kidney disease or when checking whether drug doses need changing.",
    why: "More accurate than older equations, and the 2021 version no longer uses race. It is the equation recommended by kidney guidelines.",
    nextSteps: {
      advice: ["Use eGFR together with albuminuria (urine albumin-creatinine ratio) to place the patient in a KDIGO risk category.", "Confirm a low eGFR on repeat testing over at least 3 months before calling it chronic kidney disease.", "Use cystatin C as well when creatinine is unreliable, for example low muscle mass, amputation, or very high protein intake."],
      management: [{ title: "By GFR category", items: ["90 or more, and 60 to 89: CKD only if there is another sign of kidney damage such as albuminuria. Manage blood pressure and diabetes.", "45 to 59 and 30 to 44: monitor at least yearly. Treat albuminuria and hypertension, consider an SGLT2 inhibitor, review medicines for renal dosing.", "15 to 29: refer to nephrology and start planning for kidney replacement.", "Under 15: kidney failure. Urgent nephrology care and kidney replacement planning."] }],
      critical: ["eGFR is not valid when kidney function is changing quickly, as in acute kidney injury.", "If a drug label gives doses by creatinine clearance, use Cockcroft-Gault for that drug.", "Check for urinary tract obstruction and stop nephrotoxic medicines in any sudden fall."],
    },
    evidenceAppraisal: ["The 2021 equation was fitted by the CKD-EPI collaboration on over 60,000 participants and tested against measured GFR. It is accurate within 30% of measured GFR in roughly nine of ten adults.", "Weaknesses: less accurate at extremes of body size and muscle mass, in pregnancy, and in unusual diets or supplements such as creatine."],
    creator: { name: "Andrew S. Levey, MD, and Lesley A. Inker, MD", bio: ["Nephrologists at Tufts Medical Center and lead investigators of the CKD-EPI collaboration."] },
    related: ["cockcroft-gault", "meld-na", "anion-gap"],
  },
  "cockcroft-gault": {
    when: "Use when a drug label or guideline sets doses by creatinine clearance, most commonly anticoagulants and antibiotics.",
    why: "Simple bedside estimate that has been used to set renal doses for decades, and many drug trials enrolled patients by this equation.",
    nextSteps: {
      advice: ["Check which measure your drug uses: eGFR or creatinine clearance. Do not mix them.", "Use actual body weight if the BMI is normal. In obesity use adjusted body weight; in underweight patients use actual weight.", "Recalculate after any change in kidney function."],
      management: [{ title: "By clearance", items: ["60 or more: usual doses for most drugs.", "30 to 59: adjust drugs with a narrow range or renal clearance according to the label.", "Under 30: reduce or avoid renally cleared drugs, and avoid nephrotoxic medicines."] }],
      critical: ["Not valid in acute kidney injury or unstable creatinine; use clinical judgement and repeat.", "Over-estimates clearance in oedema, ascites and obesity if actual weight is used."],
    },
    evidenceAppraisal: ["Derived in 1976 from 249 hospitalised men; the factor for women is an extrapolation. Compared with measured clearance it tends to over-estimate and varies widely in older, obese and very thin patients.", "It stays relevant because drug dosing studies used it."],
    creator: { name: "Donald W. Cockcroft, MD, and M. Henry Gault, MD", bio: ["Published in Nephron in 1976 as a way to predict creatinine clearance from serum creatinine."] },
    related: ["ckd-epi-egfr", "cha2ds2-vasc", "bmi-bsa"],
  },
  "curb-65": {
    when: "Use in an adult with community-acquired pneumonia to judge severity and help decide between home care and hospital.",
    why: "Five simple items, no tests beyond urea, and a clear link between score and 30-day death rate. It is the severity tool used in British Thoracic Society and NICE guidance.",
    nextSteps: {
      advice: ["Treat the score as one input. Low oxygen saturation, multilobar changes, other illness and home support also affect the decision.", "Check oxygen saturation and screen for sepsis in every patient."],
      management: [{ title: "By score", items: ["0 to 1: low risk. Oral antibiotics at home may be appropriate if follow-up is reliable.", "2: moderate risk. Consider a short hospital stay with oral or IV antibiotics.", "3 to 5: severe. Admit; with 4 or 5 consider critical care review."] }],
      critical: ["Hypoxia, shock or confusion changes the plan regardless of the score.", "Start antibiotics promptly according to the local pneumonia guideline.", "Think of sepsis and use NEWS2 or other early warning scores."],
    },
    evidenceAppraisal: ["Derived and validated by Lim and colleagues in over 1,000 patients and validated in other cohorts. Thirty-day mortality was under 1% at score 0, around 2% at 1, 9% at 2, 15% at 3, 40% at 4 and over 50% at 5.", "Weaknesses: ignores oxygenation and other illness, and can understate risk in young patients with severe pneumonia."],
    creator: { name: "W. S. Lim, MD", bio: ["Respiratory physician at Nottingham University Hospitals who led the British Thoracic Society pneumonia severity study."] },
    related: ["news2", "qsofa-score", "qsofa"],
  },
  "glasgow-coma-scale": {
    when: "Use in any patient with altered consciousness, especially after head injury, stroke, seizure or poisoning.",
    why: "A shared language for describing consciousness. Repeated scores show whether a patient is improving or getting worse.",
    nextSteps: {
      advice: ["Report the three parts, for example E3 V4 M5, not only the total.", "Repeat at set intervals and after any change in behaviour.", "Check blood glucose in every patient with reduced consciousness."],
      management: [{ title: "By score", items: ["13 to 15: mild. Manage by head injury criteria, with CT and observation if indicated.", "9 to 12: moderate. Admit, arrange CT and neurosurgical advice, watch the airway.", "8 or less: severe. Secure the airway, treat as a neurological emergency, CT and neurosurgical care."] }],
      critical: ["GCS of 8 or less is a warning to protect the airway, not a rule for intubation.", "Do not blame alcohol or drugs until other causes are excluded.", "Sedation, paralysis or intubation make the verbal score untestable; write NT."],
    },
    evidenceAppraisal: ["Described in 1974 and tested widely for prognosis in head injury. The motor score alone predicts outcome nearly as well as the total.", "Weaknesses: agreement between observers is weaker in the middle range, and the scale is hard to apply with sedation, facial injury, language barriers or in young children."],
    creator: { name: "Graham Teasdale, MD, and Bryan Jennett, MD", bio: ["Neurosurgeons at the Institute of Neurological Sciences, University of Glasgow, who published the scale in The Lancet in 1974."] },
    related: ["news2", "qsofa-score", "qsofa"],
  },
  qsofa: {
    when: "Use in critically ill adults to measure how much organ dysfunction is present, on admission and then daily.",
    why: "Gives a number for dysfunction in six organ systems. A rise of two or more points in a patient with infection matches the sepsis definition.",
    nextSteps: {
      advice: ["Record each organ score and repeat daily.", "Use the original SOFA if your sepsis pathway names it."],
      management: [{ title: "Using the result", items: ["Higher scores mean more organ dysfunction and higher risk; there is no single treatment threshold.", "In suspected infection, an acute rise of 2 or more points from baseline meets the sepsis definition. Start the sepsis bundle: cultures, lactate, antibiotics and fluids."] }],
      critical: ["This score does not tell you what to do for the patient in front of you; treat the cause."],
    },
    evidenceAppraisal: ["SOFA-2 is a recent update of the original SOFA score and needs external validation before it replaces it."],
    related: ["qsofa-score", "news2", "curb-65"],
  },
  "meld-na": {
    when: "Use in an adult with end-stage liver disease or cirrhosis to estimate short-term survival and to rank transplant priority.",
    why: "Made only of laboratory values, so it avoids the subjective items in Child-Pugh. Adding sodium improves prediction of 90-day death.",
    nextSteps: {
      advice: ["Repeat at intervals set by the score: more often when higher.", "Refer for transplant assessment early: MELD of 15 or more, or any decompensation such as ascites, variceal bleeding or encephalopathy."],
      management: [{ title: "By score", items: ["Under 10: lower short-term risk. Continue hepatology follow-up.", "10 to 19: consider referral to a hepatologist or transplant centre.", "20 or more: urgent hepatology and transplant review, and look for complications such as infection and kidney injury."] }],
      critical: ["Sudden rises in MELD often mean infection, bleeding or kidney injury; look for the cause.", "Avoid NSAIDs and other nephrotoxins.", "MELD 3.0, which adds sex and albumin, is now used for transplant allocation in the United States."],
    },
    evidenceAppraisal: ["MELD was built to predict 3-month survival after TIPS and then validated for transplant waiting lists. Sodium was added after studies showed hyponatraemia raised risk beyond MELD.", "Weaknesses: does not capture hepatocellular carcinoma or hepatic encephalopathy, varies with laboratory INR methods, and under-ranks women."],
    creator: { name: "Patrick S. Kamath, MD, and W. Ray Kim, MD", bio: ["Hepatologists at the Mayo Clinic who developed MELD and MELD-Na."] },
    related: ["child-pugh", "ckd-epi-egfr", "glasgow-blatchford"],
  },
  news2: {
    when: "Use at every set of observations in adults aged 16 and over on hospital wards, in the emergency department and in prehospital care.",
    why: "One number and a colour for six observations plus oxygen use, with a clear escalation response for each level. It helps find deterioration and sepsis earlier.",
    nextSteps: {
      advice: ["Take a full set of observations, score them, and act according to the band.", "Use clinical concern as a trigger even when the score is low.", "If the patient is on an SpO₂ target of 88 to 92%, use Scale 2 only when a senior clinician has documented it."],
      management: [{ title: "By response level", items: ["0: routine monitoring, at least every 12 hours.", "1 to 4: at least every 4 to 6 hours; nurse decides on escalation.", "Any single parameter scoring 3: urgent ward-based review by a clinician.", "5 or 6: urgent review by a team with acute illness skills; hourly observations.", "7 or more: emergency response, continuous monitoring and critical care assessment."] }],
      critical: ["Suspected sepsis with any raised NEWS2 should start the sepsis pathway.", "New confusion scores 3 points on its own; do not dismiss it as dementia or intoxication."],
    },
    evidenceAppraisal: ["Updated by the Royal College of Physicians in 2017 from the original NEWS. In UK data it discriminated well for death, cardiac arrest or unplanned critical care admission within 24 hours.", "Weaknesses: not validated in pregnancy or children, scale 2 is open to misuse, and some chronic conditions give a baseline score above zero."],
    creator: { name: "Royal College of Physicians, NEWS Development and Implementation Group", bio: ["The group produced NEWS in 2012 and NEWS2 in 2017 with NHS England as the standard for the NHS."] },
    related: ["qsofa-score", "curb-65", "glasgow-coma-scale"],
  },
  "wells-dvt": {
    when: "Use in an adult with a first suspected lower-limb deep vein thrombosis to choose between D-dimer and ultrasound.",
    why: "Splits patients into probability bands so that those at low risk can be cleared with a blood test and those at higher risk go directly to ultrasound.",
    nextSteps: {
      advice: ["Score the more symptomatic leg when both legs are affected.", "Record the score and the next test ordered."],
      management: [{ title: "Pathway", items: ["Score 1 or less (DVT unlikely): D-dimer. Negative excludes DVT; positive needs proximal leg vein ultrasound.", "Score 2 or more (DVT likely): proximal leg vein ultrasound within 4 hours, with interim anticoagulation if it will be delayed.", "If the first ultrasound is negative in a high-probability patient, repeat it in 6 to 8 days or add a D-dimer."] }],
      critical: ["Phlegmasia (a painful, blue or white swollen leg) is a limb-threatening emergency.", "Look for symptoms of pulmonary embolism: breathlessness, chest pain, haemoptysis."],
    },
    evidenceAppraisal: ["Derived in outpatients in 1997 and refined in 2003. Management studies using the two-level score with D-dimer found a low rate of venous thromboembolism at three months in patients who had no imaging.", "Weaknesses: the alternative diagnosis item is subjective and the score performs less well in hospital inpatients and people with previous DVT."],
    creator: { name: "Philip S. Wells, MD, MSc", bio: ["Professor of Medicine at the University of Ottawa and the Ottawa Hospital Research Institute; author of the Wells DVT and PE rules."] },
    related: ["wells-pe", "perc", "padua"],
  },
  qtc: {
    when: "Use when a QT interval is long on an ECG, when a QT-prolonging drug is started or changed, or when electrolytes are abnormal.",
    why: "The raw QT depends on heart rate. Correcting it allows a fair comparison and a decision about torsades risk.",
    nextSteps: {
      advice: ["Measure QT over several beats and use the same lead each time.", "Use Fridericia when the heart rate is above 100 or below 60.", "Compare with a baseline ECG if there is one."],
      management: [{ title: "By QTc", items: ["Normal (under 450 ms in men, 460 ms in women): continue; repeat the ECG after dose increases.", "Prolonged: review and stop QT-prolonging drugs where possible, replace potassium (aim 4.0 mmol/L or more) and magnesium, repeat the ECG.", "500 ms or more, or a rise of more than 60 ms: stop causative drugs, continuous monitoring, correct electrolytes, cardiology advice."] }],
      critical: ["Torsades de pointes: IV magnesium sulphate 2 g, correct potassium, and defibrillate if pulseless.", "Do not combine several QT-prolonging drugs without monitoring."],
    },
    evidenceAppraisal: ["Bazett's and Fridericia's formulas date from 1920 and are based on small samples. Larger studies show Bazett over-corrects at fast rates and Fridericia is closer to the truth across rates.", "Weaknesses: poor reliability with wide QRS, atrial fibrillation or difficult T waves, and QT length alone does not predict arrhythmia in every patient."],
    creator: { name: "Henry C. Bazett and Louis S. Fridericia", bio: ["Both described heart-rate correction of the QT interval in 1920; the formulas still carry their names."] },
    related: ["corrected-calcium", "heart-score", "anion-gap"],
  },
  "corrected-calcium": {
    when: "Use when total calcium is measured in a patient whose albumin is low or high.",
    why: "Total calcium is partly bound to albumin, so low albumin makes calcium look lower than the active (free) calcium really is.",
    nextSteps: {
      advice: ["If the result changes management, measure ionised calcium directly.", "Check magnesium, phosphate, creatinine and vitamin D with abnormal calcium."],
      management: [{ title: "By value", items: ["Low: look for vitamin D deficiency, low magnesium, hypoparathyroidism and kidney disease. Treat symptoms with IV calcium gluconate and monitoring.", "Mildly raised: repeat, check PTH and medicines; encourage fluids.", "12 mg/dL or more: admit if symptomatic, IV saline, discuss bisphosphonate; check PTH, PTHrP, vitamin D."] }],
      critical: ["Tetany, seizures or QT prolongation with low calcium need IV calcium now.", "Corrected calcium of 14 mg/dL or more (3.5 mmol/L) is an emergency: IV fluids, bisphosphonate and specialist input."],
    },
    evidenceAppraisal: ["The 1973 formula was fitted to a general sample. Later studies comparing it with ionised calcium found a sizeable minority of patients are misclassified, especially in critical illness and kidney disease.", "It remains a quick screen but should not be the only basis for treatment."],
    related: ["anion-gap", "qtc", "ckd-epi-egfr"],
  },
  "child-pugh": {
    when: "Use in a patient with cirrhosis to grade severity, estimate survival and plan drug doses or surgery.",
    why: "A fast bedside grade that clinicians recognise easily and that links to survival and to surgical and drug risk.",
    nextSteps: {
      advice: ["Calculate with the labs and the clinical findings from the same day.", "Use MELD-Na as well when thinking about transplant."],
      management: [{ title: "By class", items: ["A (5 to 6): surveillance ultrasound every 6 months, variceal screening, vaccination, standard drug doses.", "B (7 to 9): hepatology referral, transplant assessment, reduce doses of liver-cleared drugs.", "C (10 to 15): urgent hepatology and transplant referral, avoid elective surgery, markedly reduce or avoid liver-cleared drugs, consider palliative care."] }],
      critical: ["Avoid NSAIDs, sedatives and nephrotoxins in decompensated disease.", "Elective surgery in Class C carries very high mortality."],
    },
    evidenceAppraisal: ["Described by Child and Turcotte for surgical risk (1964) and modified by Pugh (1973) to use INR. Widely validated for survival in cirrhosis.", "Weaknesses: two subjective items, a ceiling effect that groups very different patients in Class C, and no measure of kidney function."],
    creator: { name: "C. G. Child and R. N. H. Pugh", bio: ["Child and Turcotte proposed the original grade for surgery in 1964; Pugh and colleagues modified it in 1973."] },
    related: ["meld-na", "glasgow-blatchford"],
  },
  perc: {
    when: "Use in the emergency department when you think pulmonary embolism is unlikely (below about 15%) and wonder whether any test is needed.",
    why: "Saves a D-dimer and often a CT scan in patients whose chance of PE is already lower than the risk of testing.",
    nextSteps: {
      advice: ["Settle on a low pre-test probability first, then apply PERC.", "Document that PERC was negative and that PE was judged unlikely."],
      management: [{ title: "Result", items: ["All eight absent (PERC negative): stop. No D-dimer or imaging needed for PE.", "Any present (PERC positive): PERC cannot rule out PE. Apply Wells' PE and follow the D-dimer or CTPA pathway."] }],
      critical: ["Do not use PERC when PE is a leading diagnosis.", "Unexplained hypoxia, syncope or signs of DVT take the patient out of the PERC group."],
    },
    evidenceAppraisal: ["Derived and validated by Kline and colleagues in emergency patients with low suspicion; failure rate was about 1%. The randomised PROPER trial found a PERC-based strategy non-inferior to usual testing.", "Weaknesses: depends on honest low-probability judgement, and the oxygen criterion needs altitude adjustment."],
    creator: { name: "Jeffrey A. Kline, MD", bio: ["Emergency physician and researcher who led the derivation and validation of the PERC rule."] },
    related: ["wells-pe", "wells-dvt"],
  },
  "anion-gap": {
    when: "Use in a patient with metabolic acidosis, or when electrolytes do not fit the clinical picture.",
    why: "Splits metabolic acidosis into those with extra unmeasured acids (high gap) and those without (normal gap), which points to different causes.",
    nextSteps: {
      advice: ["Correct for albumin before deciding the gap is normal.", "Look at a blood gas, lactate and ketones along with the gap."],
      management: [{ title: "By result", items: ["High gap: lactate, ketones, kidney failure, toxic alcohols and salicylate are the main causes. Send lactate, beta-hydroxybutyrate, creatinine, and an osmolal gap if ingestion is possible.", "Normal gap: look for bicarbonate loss (diarrhoea, renal tubular acidosis, saline load); calculate the urine anion gap.", "Low gap: repeat the labs, check albumin, and consider myeloma, lithium or bromide."] }],
      critical: ["pH under 7.1 or a rising lactate needs urgent senior care.", "Toxic alcohol or salicylate poisoning needs early toxicology advice and sometimes dialysis."],
    },
    evidenceAppraisal: ["The albumin correction of 2.5 mmol/L per 1 g/dL comes from Figge and colleagues. The reference range depends on the analyser.", "Weaknesses: the delta ratio is imprecise and mixed disorders can be missed."],
    related: ["corrected-calcium", "ckd-epi-egfr", "qtc"],
  },
  "glasgow-blatchford": {
    when: "Use at first assessment of a patient with suspected upper gastrointestinal bleeding, before endoscopy.",
    why: "Finds the patients who can safely go home and the patients who need admission, transfusion or endoscopic treatment, using only history, vital signs and two blood tests.",
    nextSteps: {
      advice: ["Resuscitate first and score once the patient is stable.", "Repeat the haemoglobin and score if bleeding continues."],
      management: [{ title: "By score", items: ["0 to 1: outpatient care can be considered with early endoscopy as an outpatient.", "2 to 6: admit, resuscitate and arrange endoscopy within 24 hours.", "7 or more: higher chance of needing endoscopic treatment. Early gastroenterology involvement; monitored bed."] }],
      critical: ["Haemodynamic instability or ongoing haematemesis overrides a low score.", "If cirrhosis is known or suspected, start vasoactive therapy and antibiotic prophylaxis before endoscopy.", "Use blood transfusion thresholds from the local guideline; avoid over-transfusion in variceal bleeding."],
    },
    evidenceAppraisal: ["Derived in Glasgow from about 1,800 patients and validated worldwide. In a large UK multicentre comparison of risk scores it was the best at predicting need for hospital-based intervention or death.", "Weaknesses: not for lower GI bleeding, and urea can be raised by other causes."],
    creator: { name: "Oliver Blatchford, MD", bio: ["Gastroenterologist who developed the score with colleagues in Glasgow, published in The Lancet in 2000."] },
    related: ["child-pugh", "meld-na", "news2"],
  },
  "bmi-bsa": {
    when: "Use to classify weight status and to calculate body surface area for dosing.",
    why: "Quick screen for obesity-related risk, and BSA is needed for chemotherapy, some cardiac indices and burns calculations.",
    nextSteps: {
      advice: ["Add waist circumference and look for diabetes, hypertension, sleep apnoea and fatty liver.", "In South Asian and other Asian populations use the lower BMI cut-offs for risk."],
      management: [{ title: "By BMI", items: ["Under 18.5: look for malnutrition, malabsorption, eating disorder and cancer; dietitian referral.", "25 to 29.9: lifestyle advice and check blood pressure, glucose and lipids.", "30 to 34.9: structured weight management; consider medicines; bariatric assessment if metabolic disease is present.", "35 and over: pharmacotherapy and bariatric surgery assessment; screen for sleep apnoea and heart failure."] }],
      critical: ["Rapid weight change needs a medical cause looked for.", "For chemotherapy follow the protocol on actual or capped BSA."],
    },
    evidenceAppraisal: ["BMI (weight divided by height squared) was proposed by Quetelet and adopted by the WHO. It tracks fat mass at population level but not in individuals with high muscle mass or oedema.", "Mosteller's BSA formula (1987) agrees closely with DuBois across adult sizes."],
    creator: { name: "Adolphe Quetelet; R. D. Mosteller", bio: ["Quetelet described the weight-for-height index in the 19th century; Mosteller published the simplified BSA formula in 1987."] },
    related: ["cockcroft-gault", "ckd-epi-egfr"],
  },
  padua: {
    when: "Use on admission of an acutely ill medical patient to decide whether to give drug prophylaxis against venous thromboembolism.",
    why: "Focuses prophylaxis on those most likely to benefit and spares low-risk patients the bleeding risk.",
    nextSteps: {
      advice: ["Check for bleeding risk and contraindications before starting prophylaxis.", "Repeat the assessment if the patient's condition or mobility changes, and at discharge."],
      management: [{ title: "By score", items: ["Under 4: low risk. Encourage mobility and hydration; drug prophylaxis is not routinely needed.", "4 or more: high risk. Offer low molecular weight heparin or unfractionated heparin, adjusted for kidney function."] }],
      critical: ["Active bleeding, severe thrombocytopenia or recent intracranial haemorrhage are contraindications; use mechanical prophylaxis instead.", "Suspected DVT or PE needs diagnosis, not prophylaxis."],
    },
    evidenceAppraisal: ["Derived in about 1,200 medical inpatients in Padua. High-risk patients who did not receive prophylaxis had a much higher rate of VTE than low-risk patients.", "Weaknesses: later validations show weaker discrimination, and the evidence that prophylaxis benefits patients at a score of 4 to 5 is limited."],
    creator: { name: "Stefano Barbar, MD, and Paolo Prandoni, MD", bio: ["Researchers at the University of Padua who published the score in the Journal of Thrombosis and Haemostasis in 2010."] },
    related: ["wells-dvt", "wells-pe"],
  },
  "qsofa-score": {
    when: "Use as a quick prompt in a patient with suspected infection to look for signs of poor outcome.",
    why: "Needs only three bedside observations, so it can be used anywhere, before any tests.",
    nextSteps: {
      advice: ["Do not use qSOFA alone to decide whether the patient has sepsis.", "Use NEWS2 or your local screening tool alongside it."],
      management: [{ title: "By score", items: ["Under 2: not reassuring on its own; keep assessing if infection is suspected.", "2 or more: assess urgently for organ dysfunction (lactate, creatinine, bilirubin, platelets). Start the sepsis bundle if sepsis is likely."] }],
      critical: ["Hypotension, confusion or a high lactate needs immediate sepsis treatment whatever the score."],
    },
    evidenceAppraisal: ["Derived in over 100,000 patients with suspected infection and linked to higher death rates outside intensive care.", "Weaknesses: it misses many patients with sepsis, and the Surviving Sepsis Campaign recommends against using it as the only screening tool."],
    creator: { name: "Christopher W. Seymour, MD", bio: ["Critical care physician and lead author of the 2016 Sepsis-3 analysis that introduced qSOFA."] },
    related: ["news2", "curb-65", "qsofa"],
  },
};
