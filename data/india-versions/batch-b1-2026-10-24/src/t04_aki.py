from h import *
HK = "section Treatment of hyperkalaemia"
PAED_REF = "Children and neonates: refer to a paediatrician; paediatric doses are not given in the ICMR AKI STW."
T = topic(
 id="60c36c75-b185-537d-b6a5-3f831fb1ad76",
 title="Acute kidney injury (India)",
 specialty="Nephrology / Internal Medicine / Emergency Medicine", authority="ICMR", pillar="Urgent Care",
 scope="Adults with acute kidney injury (AKI) in Indian primary, secondary and tertiary care, built on the ICMR AKI workflow (July 2026), including India-specific causes such as envenomation, heat stroke, poisoning and indigenous medicines.",
 findings=[
  "Definition, risk factors, specific settings, assessment principles, hyperkalaemia treatment, investigations, level-of-care actions, red flags, dialysis indications and follow-up checked against the ICMR AKI STW (July 2026).",
  "The intravenous furosemide dose range is taken from the ICMR Heart Failure STW (January 2026) because the AKI workflow names loop diuretics without a dose.",
  "Not clinically reviewed."],
 unverified=[
  "The ICMR AKI workflow gives no dose for potassium binders or loop diuretics; the furosemide range is borrowed from the ICMR Heart Failure STW.",
  "No paediatric doses are given in the AKI workflow; neonatal AKI is referred to a paediatrician.",
  "KDIGO stage thresholds beyond the definition are not reproduced because the workflow cites KDIGO without listing the stages.",
  "Normal laboratory ranges are typical adult ranges; local laboratory ranges apply."],
 summary="Acute kidney injury (AKI) is a rapid fall in glomerular filtration shown by rising serum creatinine or falling urine output. Causes are pre-renal (low effective blood flow from hypotension, volume loss through vomiting, diarrhoea or bleeding, heat stroke, heart failure or decompensated liver disease), intrinsic renal (acute tubular injury from sepsis, nephrotoxic or indigenous drugs, plant and chemical toxins, radiocontrast, snake and other animal bites, haemolysis, rhabdomyolysis and pregnancy complications) and post-renal (urinary obstruction) (ICMR STW). Falling filtration causes retention of potassium, acid, fluid and urea, so hyperkalaemia, metabolic acidosis, pulmonary oedema and uraemic encephalopathy or pericarditis are the life-threatening complications that may need dialysis. Many causes are reversible if recognised early, which is why ICMR stresses 'act fast, protect kidneys'.",
 mechanisms=[
  "Reduced renal perfusion lowers filtration (pre-renal) and, if prolonged, causes tubular injury.",
  "Toxins, haem pigments, sepsis and venom injure tubules directly (intrinsic AKI).",
  "Obstruction raises tubular pressure and stops filtration (post-renal).",
  "Loss of excretion causes hyperkalaemia, acidosis, fluid overload and uraemia."],
 presentation={
  "symptoms": ["Reduced urine output; dark concentrated urine", "Swelling of feet or face", "Breathlessness", "Nausea, vomiting, poor appetite", "Confusion or altered sensorium (ICMR STW)"],
  "physicalSigns": ["Hypotension and dehydration (pre-renal)", "Oedema, raised jugular venous pressure, lung crackles (overload)", "Palpable bladder (obstruction)", "Bite marks, rash or features of the systemic cause"],
  "redFlags": ["Dialysis indication present (ICMR STW)", "Unexplained AKI or other organ involvement (ICMR STW)", "Sepsis, systemic disease, complicated pregnancy or transplant recipient (ICMR STW)", "Life-threatening hyperkalaemia: urgent dialysis (ICMR STW)"],
  "precipitants": ["Hypotension, vomiting, diarrhoea, bleeding", "Heat exposure or heat stroke (ICMR STW)", "Nephrotoxic or indigenous drugs, plant and chemical toxins, radiocontrast (ICMR STW)", "Snake and other animal bites or stings (ICMR STW)", "Infection, haemolysis, rhabdomyolysis, pregnancy complications (ICMR STW)"]},
 differentials=[
  ("Chronic kidney disease", "Long history, small kidneys on ultrasound, anaemia; ICMR asks to rule out pre-existing kidney disease."),
  ("Urinary obstruction", "Hydronephrosis or distended bladder on ultrasound; apply AKI criteria only after excluding obstruction (ICMR STW)."),
  ("Glomerulonephritis", "Proteinuria and haematuria on urinalysis (ICMR STW)."),
  ("Thrombotic microangiopathy", "Haemolysis and low platelets on blood count (ICMR STW)."),
  ("Rhabdomyolysis", "Raised CPK after trauma or exertion (ICMR STW).")],
 criteria=[
  ("AKI definition (ICMR STW, KDIGO)", "Any one of: creatinine rise ≥0.3 mg/dL within 48 hours; creatinine ≥1.5 times baseline within 7 days; urine output <0.5 mL/kg/h for 6 hours — after excluding urinary obstruction."),
  ("Dialysis indications (ICMR STW)", "Refractory acidosis; electrolyte disturbance such as hyperkalaemia; intoxications; refractory fluid overload; uraemic encephalopathy or pericarditis."),
  ("Stopping dialysis (ICMR STW)", "Urine output above 1 L, creatinine stable or falling and no symptoms."),
  ("Non-resolving AKI (ICMR STW)", "Not resolved after more than 2 weeks: contrast-enhanced computed tomography (CT) to exclude cortical necrosis; biopsy as indicated.")],
 ruleIn=[
  inv("laboratory", "Serum creatinine (serial)", "Creatinine with baseline comparison", "AKI", "0.6–1.2 mg/dL (adult)", "Rise ≥0.3 mg/dL in 48 h or ≥1.5× baseline in 7 days", "Defines and stages AKI (ICMR STW, KDIGO).", "aki", "section AKI definition"),
  inv("laboratory", "Hourly urine output", "Urine volume and body weight", "Oliguric AKI", "Above 0.5 mL/kg/h", "Below 0.5 mL/kg/h for 6 hours", "Part of the definition; monitor with daily weight (ICMR STW).", "aki", "sections AKI definition and Preliminary actions"),
  inv("laboratory", "Electrolytes and blood gas", "Sodium, potassium, bicarbonate, calcium, phosphate, uric acid", "Hyperkalaemia and acidosis", "Potassium 3.5–5.0 mEq/L; bicarbonate 22–28 mEq/L", "High potassium; low bicarbonate", "Identifies dialysis indications (ICMR STW).", "aki", "section Desirable actions"),
  inv("laboratory", "Urinalysis", "Urine protein, blood and sediment", "Glomerulonephritis", "No protein or blood", "Proteinuria or haematuria", "If present, rule out glomerulonephritis (ICMR STW).", "aki", "section Desirable actions"),
  inv("laboratory", "Complete blood count with platelets", "CBC", "Haemolysis and thrombotic microangiopathy", "Platelets 150–400 ×10⁹/L", "Anaemia with low platelets", "Suggests thrombotic microangiopathy (ICMR STW).", "aki", "section Desirable actions"),
  inv("laboratory", "CPK, LDH and bilirubin", "Muscle and haemolysis markers", "Rhabdomyolysis or haemolysis", "CPK below 200 U/L", "Markedly raised CPK; raised LDH and bilirubin", "Check CPK if rhabdomyolysis suspected; LDH and bilirubin for haemolysis (ICMR STW).", "aki", "section Desirable actions")],
 ruleOut=[
  inv("firstLineImaging", "Ultrasound of kidneys, ureters and bladder", "USG KUB", "Obstruction and chronic kidney disease", "Normal-sized kidneys, no hydronephrosis", "Hydronephrosis, distended bladder or small kidneys", "Exclude obstruction before applying AKI criteria (ICMR STW).", "aki", "sections Definition footnote and Desirable actions"),
  inv("specializedAdjunctive", "12-lead electrocardiogram (ECG)", "ECG", "Hyperkalaemia effects", "Normal T waves and QRS", "Peaked T waves, wide QRS, arrhythmia", "Give calcium gluconate under ECG monitoring (ICMR STW).", "aki", "sections Treatment of hyperkalaemia and Desirable actions"),
  inv("firstLineImaging", "Chest X-ray", "Chest radiograph", "Pulmonary oedema", "Clear lung fields", "Pulmonary oedema or effusion", "Baseline before dialysis (ICMR STW).", "aki", "section Levels of care"),
  inv("laboratory", "Viral markers before dialysis", "HBsAg, anti-HCV, HIV", "Infection-control status for dialysis", "Negative", "Positive", "Screen before starting dialysis (ICMR STW).", "aki", "section Levels of care")],
 management=[
  step("recognise", "Recognise and classify", "At first contact", ["Apply the AKI definition after excluding obstruction (ICMR STW).", "Classify as pre-renal, renal or post-renal; community- or hospital-acquired (ICMR STW).", "Review all medicines and look for occult causes such as envenomation or poisoning (ICMR STW)."]),
  step("preliminary", "Preliminary actions", "First hours", ["Correct hydration; stabilise blood pressure; treat infection; optimise glucose (ICMR STW).", "Stop nephrotoxic drugs, including ACE inhibitors and ARBs when potassium is high (ICMR STW).", "Exclude and relieve urinary outflow obstruction (ICMR STW).", "Monitor urine volume and body weight; look for complications (ICMR STW)."], [("Snakebite", ["Give anti-snake venom and correct haemodynamics (ICMR STW)."]), ("Poisoning", ["Give the specific antidote if available (ICMR STW)."]), ("Pregnancy", ["Manage the obstetric complication; deliver if indicated (ICMR STW)."])]),
  step("hyperkalaemia", "Treat hyperkalaemia", "Immediately if potassium is high", ["Calcium gluconate under ECG monitoring, then salbutamol and insulin-dextrose (see medicines) (ICMR STW).", "Avoid high-potassium foods; withhold ACE inhibitors and ARBs (ICMR STW).", "Urgent dialysis if life-threatening; potassium binders if dialysis is unavailable (ICMR STW)."]),
  step("level-of-care", "Level of care and referral", "After stabilisation", ["Primary care: correct volume, stop nephrotoxins, relieve bladder obstruction, treat hyperkalaemia, IV loop diuretic and oxygen for pulmonary oedema, peritoneal dialysis if indicated, then refer (ICMR STW).", "Secondary care: admit, image the urinary tract, look for underlying CKD, start peritoneal or haemodialysis (ICMR STW).", "Tertiary care: kidney biopsy, multidisciplinary care, CRRT and plasma exchange where indicated (ICMR STW)."]),
  step("follow-up", "Recovery and follow-up", "Weeks to lifelong", ["Stop dialysis when urine output is above 1 L, creatinine is stable or falling and the patient is well (ICMR STW).", "AKI not resolved after 2 weeks: contrast-enhanced CT for cortical necrosis and biopsy as indicated (ICMR STW).", "Check creatinine and urine protein every 6–12 months for life (ICMR STW)."])],
 branches=[
  ("Hyperkalaemia", "AKI with high potassium or ECG changes."),
  ("Fluid overload", "AKI with pulmonary oedema or refractory overload.")],
 regimens=[
  rx("Hyperkalaemia", "Membrane stabilisation", "Cardiac protection in hyperkalaemia", "Adults with hyperkalaemia and ECG changes", "Calcium gluconate 10%", "10 mL", "IV, slowly", "Over 2–5 minutes; may repeat up to 3 times", "Until ECG improves", PAED_REF, NOT_ABX, "This is the AKI regimen (ICMR STW).", NS, ["Continuous ECG monitoring (ICMR STW)"], ["Digoxin toxicity: use with caution"], "aki", HK),
  rx("Hyperkalaemia", "Shift potassium into cells", "Lower serum potassium", "Adults with hyperkalaemia", "Salbutamol (nebuliser solution)", "10 mg (4 respules of 2.5 mL)", "Nebulised", "Single dose; repeat per response", "Short term", PAED_REF, NOT_ABX, "This is the AKI regimen (ICMR STW).", NS, ["Potassium recheck", "Heart rate"], ["Tachyarrhythmia"], "aki", HK),
  rx("Hyperkalaemia", "Shift potassium into cells", "Lower serum potassium", "Adults with hyperkalaemia", "Regular insulin with dextrose", "10 units in 50 mL of 50% dextrose, or in 100 mL of 25% dextrose", "IV", "Single dose; repeat per potassium", "Short term", PAED_REF, NOT_ABX, "This is the AKI regimen (ICMR STW); check glucose for hypoglycaemia.", NS, ["Capillary glucose", "Potassium recheck"], ["Hypoglycaemia risk"], "aki", HK),
  rx("Fluid overload", "Loop diuretic", "Pulmonary oedema or fluid overload", "Adults with AKI and fluid overload", "Furosemide", "10–80 mg as needed (ICMR Heart Failure STW range)", "IV", "As needed", "Until decongested; dialysis if refractory", PAED_REF, NOT_ABX, "Refractory overload is a dialysis indication (ICMR AKI STW).", NS, ["Urine output", "Electrolytes, creatinine"], ["Anuria without response: proceed to dialysis"], "hf", "section Drug therapy table", extra_adj=("Use in AKI from the ICMR AKI STW, section Levels of care (IV loop diuretics for fluid overload).",))],
 medNote="Hyperkalaemia doses are from the ICMR AKI STW (July 2026). The AKI workflow recommends IV loop diuretics and potassium binders without doses; the furosemide range shown is from the ICMR Heart Failure STW. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "AKI in India from primary care to tertiary care.", "learningObjectives": ["Apply the AKI definition after excluding obstruction.", "Find reversible and India-specific causes.", "Recognise dialysis indications."],
  "keyPoints": ["Creatinine +0.3 mg/dL in 48 h, ×1.5 in 7 days, or urine <0.5 mL/kg/h for 6 h.", "Calcium gluconate 10 mL over 2–5 min under ECG for hyperkalaemia.", "Check creatinine and urine protein every 6–12 months for life after AKI."],
  "pitfalls": ["Missing obstruction.", "Continuing NSAIDs, ACE inhibitors or ARBs.", "Missing snakebite, poisoning or indigenous medicine as the cause.", "Late referral for dialysis."],
  "references": [tref("aki", "sections AKI definition, Risk factors, Specific settings, Preliminary actions, Treatment of hyperkalaemia, Desirable actions, Levels of care, Red flags, Dialysis indications, Follow-up"), tref("hf", "section Drug therapy table (furosemide)")]},
 nonClinical={"patientEducation": ["Avoid painkillers such as NSAIDs and untested indigenous or herbal medicines.", "Drink enough fluid in heat and during diarrhoea.", "Keep follow-up appointments for life (ICMR STW)."], "lifestyleAndDiet": ["Low-potassium diet while potassium is high (ICMR STW).", "Fluid and salt advice from the treating team."], "mdtReferrals": ["Nephrologist for red flags and dialysis (ICMR STW)", "Urologist for obstruction", "Paediatrician for neonatal AKI (ICMR STW)"], "dischargeCriteria": ["Creatinine stable or falling", "Urine output adequate and electrolytes safe", "Cause identified and treated"], "followUpPlan": "Recheck creatinine within weeks of discharge, then creatinine and urine protein every 6–12 months for life (ICMR STW)."})
save("t04_aki.json", [T])
