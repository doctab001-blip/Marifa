from hx import *
TITLE = "Acute pancreatitis (India)"
NTG = "section 4.9, printed p. 38"
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Gastroenterology / General Surgery / Internal Medicine", authority="ICMR", pillar="Urgent Care",
 scope="Adult acute pancreatitis in India: diagnosis, severity (Revised Atlanta), fluid resuscitation, nutrition, endoscopic retrograde cholangiopancreatography (ERCP) for cholangitis, antibiotics only for infected necrosis, cholecystectomy timing in gallstone pancreatitis and alcohol counselling, using the ACG guideline (2024), the NCDC-ICMR antimicrobial guideline (2025) and the ICMR Gall Stone Disease STW (2022).",
 findings=[
  "Diagnosis (two of three), computed tomography (CT) only when unclear or not improving at 48–72 hours, Revised Atlanta grades, organ failure markers, risk factors for severe disease, lactated Ringer's at up to 1.5 mL/kg/hour with 10 mL/kg boluses for hypovolaemia, early oral feeding, enteral over parenteral nutrition, no prophylactic antibiotics, ERCP within 24 hours for cholangitis and same-admission cholecystectomy checked against ACG 2024.",
  "Infected necrosis regimens and no antibiotics for sterile pancreatitis checked against NCDC-ICMR NTG 2025 section 4.9; cholecystectomy timing against the ICMR Gall Stone Disease STW (July 2022).",
  "Not clinically reviewed."],
 unverified=[
  "No ICMR STW dedicated to acute pancreatitis was found.",
  "Analgesic choice and doses are not in the opened sources; use local analgesia protocols (opioids are acceptable).",
  "Paediatric acute pancreatitis is outside the scope of the cited sources."],
 summary="Acute pancreatitis is inflammation of the pancreas caused mainly by gallstones and alcohol in India; others include hypertriglyceridaemia, hypercalcaemia, drugs, trauma and post-ERCP. Premature activation of trypsin inside acinar cells digests the gland and triggers a systemic inflammatory response that can cause capillary leak, hypovolaemia and organ failure. Most attacks are mild and settle in days; severe disease with persistent organ failure (over 48 hours) carries high mortality (ACG 2024). Early care is fluid resuscitation with careful reassessment, pain control, early feeding, and treating the cause; antibiotics are only for infection (ACG 2024; NTG 2025).",
 mechanisms=[
  "Duct obstruction or alcohol triggers premature trypsinogen activation in acinar cells.",
  "Autodigestion and cytokine release cause local necrosis and systemic inflammation.",
  "Capillary leak causes hypovolaemia, haemoconcentration and organ failure.",
  "Necrotic tissue can become infected, usually after the first week."],
 presentation={
  "symptoms": ["Severe epigastric pain radiating to the back", "Nausea and vomiting", "Pain eased by leaning forward"],
  "physicalSigns": ["Epigastric tenderness and guarding", "Tachycardia, fever", "Hypotension in severe disease", "Jaundice if a common bile duct stone"],
  "redFlags": ["Systolic BP below 90 mmHg (ACG 2024)", "PaO2 below 60 mmHg (ACG 2024)", "Creatinine above 2 mg/dL after rehydration (ACG 2024)", "Organ failure lasting over 48 hours: severe pancreatitis", "Fever, jaundice and pain: cholangitis needs ERCP within 24 hours (ACG 2024)"],
  "precipitants": ["Gallstones", "Alcohol (usually over 50 g/day for over 5 years) (ACG 2024)", "Hypertriglyceridaemia, hypercalcaemia", "Drugs, trauma, ERCP"]},
 differentials=[
  ("Perforated peptic ulcer", "Free gas under the diaphragm; board-like rigidity."),
  ("Acute cholecystitis", "Right upper quadrant pain and Murphy's sign; lipase normal or mildly raised."),
  ("Mesenteric ischaemia", "Pain out of proportion; lactate high; CT angiography."),
  ("Inferior myocardial infarction", "Electrocardiogram (ECG) changes and troponin rise.")],
 criteria=[
  ("Diagnosis (ACG 2024)", "Two of three: typical pain; lipase or amylase above 3 times the upper limit of normal (ULN); characteristic imaging."),
  ("Mild (Revised Atlanta)", "No organ failure and no local complications."),
  ("Moderately severe (Revised Atlanta)", "Transient organ failure resolving within 48 hours and/or local complications."),
  ("Severe (Revised Atlanta)", "Persistent organ failure beyond 48 hours."),
  ("Risk of severe disease (ACG 2024 Table 4)", "BUN 20 mg/dL or more, haematocrit 44% or more, BMI above 30, age over 55, altered mental status, SIRS.")],
 ruleIn=[
  inv("laboratory", "Serum lipase (or amylase)", "Serum", "Acute pancreatitis", "Within the laboratory reference range", "Above 3 times ULN", "Diagnostic criterion; lipase preferred (ACG 2024).", "acgap", "section Diagnosis"),
  inv("firstLineImaging", "Ultrasound abdomen", "Ultrasound", "Gallstones; dilated bile duct", "No gallstones; normal duct", "Gallstones or sludge; dilated common bile duct", "Identifies gallstone pancreatitis and need for cholecystectomy (ICMR GSD STW).", "gsd", "section Investigations"),
  inv("laboratory", "Liver tests (bilirubin, ALT, ALP)", "Serum", "Biliary cause; cholangitis", "Bilirubin below 1.2 mg/dL; ALT below 40 U/L", "Raised ALT and bilirubin", "Suggests gallstone cause; jaundice or dilated duct needs magnetic resonance cholangiopancreatography (MRCP) or endoscopic ultrasound (EUS) (ACG 2024).", "acgap", "section ERCP"),
  inv("laboratory", "Blood urea nitrogen (BUN) and haematocrit", "Serum; blood count", "Severity and fluid response", "BUN 7–20 mg/dL; haematocrit 36–46%", "BUN 20 mg/dL or more; haematocrit 44% or more", "Risk of severe disease; falling BUN shows adequate fluids (ACG 2024).", "acgap", "Table 4"),
  inv("laboratory", "Creatinine, calcium, triglycerides", "Serum", "Organ failure; cause", "Creatinine 0.6–1.2 mg/dL; calcium 8.5–10.5 mg/dL; triglycerides below 150 mg/dL", "Creatinine above 2 mg/dL; hypercalcaemia; triglycerides very high", "Organ failure marker and cause (ACG 2024).", "acgap", "section Severity"),
  inv("specializedAdjunctive", "Oxygen saturation or arterial gas", "Pulse oximetry; PaO2", "Respiratory failure", "SpO2 94–100%; PaO2 above 80 mmHg", "PaO2 below 60 mmHg", "Organ failure criterion (ACG 2024).", "acgap", "section Severity")],
 ruleOut=[
  inv("advancedImaging", "Contrast computed tomography (CT) abdomen", "CT", "Necrosis, other diagnoses", "Normal pancreas", "Necrosis, collections", "Only if the diagnosis is unclear or no improvement in 48–72 hours (ACG 2024).", "acgap", "section Diagnosis"),
  inv("specializedAdjunctive", "Electrocardiogram (ECG) and troponin", "12-lead ECG", "Myocardial infarction mimic", "Normal", "Ischaemic changes", "Exclude cardiac pain (ICMR GSD STW).", "gsd", "section Investigations")],
 management=[
  step("fluids", "Fluid resuscitation", "First 24–48 hours", ["Lactated Ringer's in preference to normal saline (ACG 2024 recommendation 4).", "Hypovolaemic: 10 mL/kg bolus; otherwise up to 1.5 mL/kg/hour (ACG 2024).", "Reassess within 6 hours and over 24–48 hours: aim for falling BUN; watch for fluid overload (ACG 2024)."]),
  step("pain", "Pain and monitoring", "From arrival", ["Adequate analgesia (opioids acceptable) per local protocol.", "Monitor for organ failure in the first 48 hours; intensive care unit (ICU) for persistent organ failure."]),
  step("feed", "Nutrition", "Within 24–48 hours", ["Mild: oral low-fat solid diet within 24–48 hours as tolerated (ACG 2024 recommendations 10–11).", "Moderately severe or severe: enteral feeding (nasogastric acceptable); avoid parenteral unless enteral fails (ACG 2024)."]),
  step("biliary", "Biliary cause", "As indicated", ["Cholangitis: ERCP within 24 hours (ACG 2024).", "No cholangitis: medical treatment rather than ERCP within 72 hours (ACG 2024 recommendation 5).", "Mild or moderate gallstone pancreatitis: laparoscopic cholecystectomy in the same admission (ICMR GSD STW; ACG 2024).", "Severe: cholecystectomy 4–6 weeks after resolution (ICMR GSD STW)."]),
  step("infect", "Antibiotics", "Only for infection", ["No prophylactic antibiotics, including severe or sterile necrotising pancreatitis (ACG 2024 recommendation 8; NTG 2025).", "Suspect infected necrosis with deterioration after the first week: start antibiotics, take surgical opinion; delay drainage to about 4 weeks if stable (ACG 2024; NTG 2025)."]),
  step("alcohol", "Prevent recurrence", "Before discharge", ["Alcohol cessation counselling; treat hypertriglyceridaemia or hypercalcaemia."])],
 branches=[
  ("Initial resuscitation", "All patients with acute pancreatitis."),
  ("Infected pancreatic necrosis", "Infected necrosis or infected pseudocyst (clinical deterioration, gas on CT, positive culture).")],
 regimens=[
  rx("Initial resuscitation", "IV fluid", "Acute pancreatitis", "Adults", "Lactated Ringer's solution", "10 mL/kg bolus if hypovolaemic; otherwise up to 1.5 mL/kg/hour", "IV", "Continuous, reassessed within 6 hours", "24–48 hours, guided by BUN and clinical response", "Paediatric fluid rates not in the cited source.", NOT_ABX, "Caution and frequent reassessment in kidney disease (ACG 2024).", "Caution in cirrhosis with ascites.", ["Heart rate, BP, urine output", "BUN and haematocrit at 6–24 hours"], ["Fluid overload in cardiac or renal disease (ACG 2024)", "Hypercalcaemia: avoid calcium-containing fluid until corrected"], "acgap", "recommendations 3–4"),
  rx("Infected pancreatic necrosis", "Empiric antibiotic", "Infected necrosis", "Adults", "Piperacillin-tazobactam", "4.5 g every 6 hours", "IV", "Every 6 hours", "Stop 5–7 days after source control", "Paediatric dose not in the cited source.", "Not suitable in penicillin allergy: use a carbapenem option with caution or seek microbiology advice.", "Reduce dose if CrCl below 40 mL/min.", "No adjustment.", ["Cultures from aspirate or necrosectomy", "Renal function"], ["Penicillin allergy"], "ntg", NTG, sel="one-of", pref=True),
  rx("Infected pancreatic necrosis", "Empiric antibiotic", "Infected necrosis", "Adults", "Meropenem", "1 g every 8 hours", "IV", "Every 8 hours", "Stop 5–7 days after source control", "Paediatric dose not in the cited source.", "Low cross-reactivity; usable with caution in non-anaphylactic penicillin allergy.", "Reduce dose if CrCl below 50 mL/min.", "No adjustment.", ["Cultures", "Renal function"], ["Carbapenem allergy", "Valproate"], "ntg", NTG, sel="one-of", pref=False, use="Penicillin allergy (non-anaphylactic) or ESBL risk."),
  rx("Infected pancreatic necrosis", "Empiric antibiotic", "Infected necrosis", "Adults", "Imipenem-cilastatin", "500 mg every 6 hours", "IV", "Every 6 hours", "Stop 5–7 days after source control", "Paediatric dose not in the cited source.", "Low cross-reactivity; usable with caution in non-anaphylactic penicillin allergy.", "Reduce dose if CrCl below 70 mL/min.", "No adjustment.", ["Cultures", "Seizure risk"], ["Seizure disorder (prefer meropenem)"], "ntg", NTG, sel="one-of", pref=False, use="Meropenem unavailable.")],
 medNote="Fluid strategy from ACG 2024; infected necrosis regimens and no-antibiotic rule for sterile pancreatitis from NCDC-ICMR NTG 2025 section 4.9. Add antifungal cover only if risk factors for invasive candidiasis (NTG 2025). India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 comparison={"title": "Cholecystectomy timing in gallstone pancreatitis: ICMR vs ACG", "columns": ["ICMR Gall Stone Disease STW (2022)", "ACG 2024"], "rows": [
   {"parameter": "Mild or moderate", "values": ["Laparoscopic cholecystectomy in the same admission", "Early cholecystectomy, preferably during the same admission (mild)"]},
   {"parameter": "After severe pancreatitis", "values": ["4–6 weeks after resolution", "Not specified in the extracted text"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Adult acute pancreatitis in India.", "learningObjectives": ["Diagnose with two of three criteria.", "Resuscitate with measured fluids.", "Use antibiotics and ERCP only when indicated."],
  "keyPoints": ["Lipase above 3 times ULN plus typical pain is enough; CT is not routine.", "Lactated Ringer's, up to 1.5 mL/kg/hour; reassess at 6 hours.", "Feed early.", "No prophylactic antibiotics."],
  "pitfalls": ["Aggressive fluids causing overload.", "Routine CT on day 1.", "Prophylactic carbapenems.", "Sending mild gallstone pancreatitis home without cholecystectomy."],
  "references": [tref("acgap", "recommendations 3–11; Table 4; sections Diagnosis, Severity, ERCP, Antibiotics, Nutrition, Surgery"), tref("ntg", "section 4.9, printed p. 38"), tref("gsd", "sections Investigations, Timing of surgery")]},
 nonClinical={"patientEducation": ["Stop alcohol completely.", "Return for fever, jaundice or worsening pain.", "Gallstone pancreatitis: keep the cholecystectomy date."], "lifestyleAndDiet": ["Low-fat diet while recovering.", "Control triglycerides and weight."], "mdtReferrals": ["Gastroenterologist for ERCP or necrosis", "Surgeon for cholecystectomy", "De-addiction services for alcohol"], "dischargeCriteria": ["Pain controlled with oral analgesia", "Tolerating oral diet", "Cause identified and plan made (cholecystectomy or alcohol counselling)"], "followUpPlan": "Surgical review for cholecystectomy; imaging at about 4 weeks if collections."})
save("t29_pancreatitis.json", [T])
