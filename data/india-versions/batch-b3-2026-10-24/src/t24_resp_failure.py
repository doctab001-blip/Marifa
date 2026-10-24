from h import *
RF = "sections Overview, Oxygen therapy, Drugs, Investigations, Referral"
CP = "section Management of acute exacerbation"
AS = "section Severe acute asthma"
NIV = "Recommendations 4, 23, 25, 32–35"
TITLE = "Acute respiratory failure and oxygen therapy in adults (India)"
T = topic(
 id=new_id(TITLE), title=TITLE, specialty="Pulmonology / Emergency Medicine / Critical Care", authority="ICMR", pillar="Urgent Care",
 scope="Adults with acute respiratory failure in India: recognising hypoxaemia and hypercapnia, giving oxygen to a target, treating the common causes and deciding on non-invasive ventilation (NIV) or intubation. Built on the ICMR Respiratory Failure workflow (October 2019) with the ICMR COPD and Asthma workflows, and BTS guidance for oxygen targets and NIV.",
 findings=[
  "Hypoxia threshold, causes covered, oxygen start and titration, devices, bronchodilator, steroid, diuretic and anticoagulant choices, severe pneumonia steroid criteria and referral checked against the ICMR Respiratory Failure STW (October 2019).",
  "Nebulised levosalbutamol/ipratropium dose, prednisolone and antibiotic doses for COPD exacerbation checked against the ICMR COPD STW; hydrocortisone and prednisolone doses for severe asthma against the ICMR Asthma STW.",
  "SpO2 targets from BTS 2017 oxygen guideline; NIV start criteria and intubation triggers from the BTS/ICS 2016 guideline.",
  "Oxygen targets differ between ICMR workflows and BTS; shown side by side.",
  "Not clinically reviewed."],
 unverified=[
  "Oxygen flow rates by device are not given in the opened sources.",
  "Antibiotic doses for pneumonia are not given in the ICMR Respiratory Failure STW; use the community-acquired pneumonia topic.",
  "Unfractionated heparin dose for suspected pulmonary embolism when thrombolysis is anticipated was not verified; follow the local weight-based protocol.",
  "The ICMR Respiratory Failure STW prints the general oxygen target as '< 96%', which looks like a typesetting error; the BTS 94–98% target is shown.",
  "Arterial blood gas normal ranges are typical adult values."],
 summary="Acute respiratory failure is failure of the lungs to keep oxygen up (hypoxaemia) or carbon dioxide down (hypercapnia). The ICMR workflow defines hypoxia as SpO2 below 90% and covers the common causes: acute severe asthma, acute exacerbation of chronic obstructive pulmonary disease (COPD), pneumonia, heart failure and pulmonary embolism. Management rests on oxygen titrated to a target, treatment of the cause, and early recognition of patients who need NIV or invasive ventilation. Patients at risk of hypercapnia (COPD, obesity, neuromuscular or chest-wall disease) need a lower SpO2 target of 88–92% because excess oxygen worsens carbon dioxide retention (BTS).",
 mechanisms=[
  "Ventilation-perfusion mismatch and shunt (pneumonia, pulmonary oedema) cause hypoxaemia.",
  "Airflow obstruction, fatigue or weak respiratory muscles reduce ventilation and raise PaCO2.",
  "Rising PaCO2 causes respiratory acidosis, drowsiness and asterixis.",
  "Uncontrolled high-flow oxygen in at-risk patients worsens hypercapnia."],
 presentation={
  "symptoms": ["Breathlessness, cough, wheeze, chest tightness (ICMR STW)", "Headache and drowsiness with hypercapnia", "Chest pain, haemoptysis or calf swelling (pulmonary embolism)"],
  "physicalSigns": ["Tachypnoea, tachycardia, accessory muscle use, falling SpO2 (ICMR STW)", "Cyanosis, restlessness, confusion (ICMR STW)", "Asterixis, bounding pulse, papilloedema (hypercapnia, ICMR STW)", "Pink frothy sputum and raised neck veins (heart failure, ICMR STW)"],
  "redFlags": ["SpO2 below 90% (ICMR STW)", "Altered sensorium, paradoxical breathing, hypotension or bradycardia (ICMR Asthma STW life-threatening features)", "SpO2 below 88% despite therapy, heart rate above 110/min or systolic BP below 90 mmHg in COPD (ICMR COPD STW referral)", "pH below 7.35 with PaCO2 above 6.5 kPa despite optimal therapy (BTS/ICS)", "Need for mechanical ventilation (ICMR STW)"],
  "precipitants": ["Respiratory infection", "Non-adherence to inhalers", "Heart failure or arrhythmia", "Sedative drugs", "Deep vein thrombosis (pulmonary embolism)"]},
 differentials=[
  ("Acute exacerbation of COPD", "Known COPD, increased sputum; hypercapnia common (ICMR STW)."),
  ("Acute severe asthma", "Wheeze, known asthma, younger patient (ICMR STW)."),
  ("Acute heart failure", "Orthopnoea, pink frothy sputum, raised neck veins (ICMR STW)."),
  ("Pneumonia", "Fever, crackles, consolidation on chest X-ray (ICMR STW)."),
  ("Pulmonary embolism", "Sudden breathlessness, pleuritic pain, calf swelling, clear chest X-ray (ICMR STW).")],
 criteria=[
  ("Hypoxia (ICMR STW)", "SpO2 below 90%: start oxygen."),
  ("Target SpO2 (BTS 2017)", "94–98% for most acutely ill adults; 88–92% if at risk of hypercapnic respiratory failure."),
  ("Start NIV (BTS/ICS 2016, Rec. 25)", "pH below 7.35 and PaCO2 above 6.5 kPa persisting despite optimal medical therapy."),
  ("Consider invasive ventilation (BTS/ICS 2016, Recs 32–35)", "Acidosis persists or worsens despite optimised NIV; respiratory arrest or peri-arrest; interface cannot be fitted."),
  ("Steroid in severe pneumonia (ICMR STW)", "FiO2 above 0.5 and pH below 7.3, or lactate above 4 mmol/L, or C-reactive protein (CRP) above 150 mg/L.")],
 ruleIn=[
  inv("laboratory", "Pulse oximetry", "SpO2", "Hypoxaemia", "95–100% on air", "Below 90%", "Start oxygen; titrate flow to target (ICMR STW; BTS).", "rf", RF),
  inv("laboratory", "Arterial blood gas (ABG)", "pH, PaCO2, PaO2", "Type of failure; acidosis", "pH 7.35–7.45; PaCO2 4.7–6.0 kPa (35–45 mmHg); PaO2 above 10.7 kPa (80 mmHg) on air", "Low PaO2; pH below 7.35 with PaCO2 above 6.5 kPa (hypercapnic)", "Decides NIV (BTS/ICS Rec. 25); listed investigation (ICMR STW).", "rf", RF, extra=("btsniv", "Recommendation 25")),
  inv("firstLineImaging", "Chest X-ray", "Chest radiograph", "Consolidation, oedema, pneumothorax", "Clear lung fields", "Consolidation; bilateral oedema; pneumothorax", "Identifies the cause; drain a pneumothorax before NIV (BTS/ICS).", "rf", RF)],
 ruleOut=[
  inv("laboratory", "Full blood count, CRP, urea and electrolytes", "Blood tests", "Infection; renal function", "White cells 4–11 ×10⁹/L; CRP under 5 mg/L", "Leucocytosis; CRP above 150 mg/L in severe pneumonia", "Supports infection; CRP is part of the steroid criteria (ICMR STW).", "rf", RF),
  inv("laboratory", "Sputum and blood culture", "Microbiology", "Pathogen", "No growth", "Pathogen isolated", "Blood culture if febrile (ICMR STW).", "rf", RF),
  inv("specializedAdjunctive", "Spirometry (after recovery)", "Lung function", "COPD; neuromuscular disease", "FEV1/FVC 0.70 or more", "FEV1/FVC below 0.70", "Confirms COPD or neuromuscular weakness (ICMR STW).", "rf", RF)],
 management=[
  step("oxygen", "Oxygen", "Immediately", ["Start oxygen when SpO2 is below 90%; monitor SpO2 and adjust flow (ICMR STW).", "Devices: nasal cannula, simple face mask, Venturi mask or non-rebreather mask (ICMR STW).", "Target 94–98%, or 88–92% if at risk of hypercapnia (BTS 2017).", "Check an ABG in drowsy patients and those at risk of hypercapnia."]),
  step("cause", "Treat the cause", "First hour", ["Bronchodilators for asthma and COPD; steroids; diuretic for heart failure; antibiotics for pneumonia; anticoagulation for suspected pulmonary embolism (ICMR STW).", "Pulmonary embolism with high suspicion and low bleeding risk: start low molecular weight heparin, or unfractionated heparin if thrombolysis is anticipated (ICMR STW)."]),
  step("niv", "Non-invasive ventilation", "Within 1–2 hours", ["Start NIV if pH stays below 7.35 with PaCO2 above 6.5 kPa despite optimal therapy (BTS/ICS Rec. 25).", "Keep SpO2 88–92% on NIV; optimise settings before raising oxygen (BTS/ICS Recs 4, 23).", "Severe acidosis alone does not rule out an NIV trial where intubation is available (BTS/ICS Rec. 26)."]),
  step("escalate", "Escalation and transfer", "When criteria met", ["Intubate if acidosis persists or worsens on optimised NIV, in respiratory arrest or peri-arrest, or if no interface fits (BTS/ICS Recs 32–34).", "Refer if no relief, need for mechanical ventilation or life-threatening features; stabilise circulation, airway and breathing before transfer (ICMR STW).", "Continue oxygen and nebulisation during transfer (ICMR COPD STW)."])],
 branches=[
  ("Oxygen for hypoxaemia", "SpO2 below 90% (ICMR STW)."),
  ("COPD exacerbation", "Known or suspected COPD with worsening breathlessness or sputum (ICMR COPD STW)."),
  ("Acute severe asthma", "Severe asthma needing admission (ICMR Asthma STW)."),
  ("Acute heart failure", "Breathlessness with pulmonary oedema (ICMR STW)."),
  ("Severe pneumonia — steroid", "FiO2 above 0.5 and pH below 7.3, or lactate above 4 mmol/L, or CRP above 150 mg/L (ICMR STW)."),
  ("Suspected pulmonary embolism", "High clinical suspicion and low bleeding risk (ICMR STW).")],
 regimens=[
  rx("Oxygen for hypoxaemia", "Supplemental oxygen", "Hypoxaemia", "Adults", "Oxygen", "Flow titrated to target SpO2 94–98% (88–92% if hypercapnia risk)", "Nasal cannula, face mask, Venturi or non-rebreather mask", "Continuous, adjusted to SpO2", "Until SpO2 at target on air", "Children: use paediatric targets and devices.", NOT_ABX, "No change.", "No change.", ["Continuous SpO2", "ABG if drowsy or at risk of hypercapnia"], ["Uncontrolled high flow in COPD or hypoventilation (BTS)"], "rf", RF, extra_adj=("Target source: BTS 2017 Web Appendix 3",)),
  rx("COPD exacerbation", "Nebulised bronchodilator", "COPD exacerbation", "Adults", "Levosalbutamol with ipratropium (nebulised)", "1.25 mg/0.5 mg", "Nebulised", "Repeat as needed at 20-minute intervals", "Until improved, then regular inhalers", ADULT, NOT_ABX, NS, NS, ["Heart rate, tremor, SpO2"], ["Tachyarrhythmia"], "copd", CP),
  rx("COPD exacerbation", "Systemic steroid", "COPD exacerbation", "Adults", "Prednisolone", "30 mg", "Oral", "Once daily", "5 days", ADULT, NOT_ABX, NS, NS, ["Blood glucose"], ["Uncontrolled diabetes: monitor glucose"], "copd", CP, sel="one-of", pref=True),
  rx("COPD exacerbation", "Systemic steroid", "COPD exacerbation", "Adults", "Methylprednisolone", "40–60 mg", "IV", "Once daily", "Switch to oral when able", ADULT, NOT_ABX, NS, NS, ["Blood glucose"], ["Uncontrolled diabetes"], "rf", RF, sel="one-of", pref=False, use="Unable to take oral medicines."),
  rx("COPD exacerbation", "Antibiotic (if purulent sputum)", "Bacterial exacerbation", "Adults", "Amoxicillin", "500 mg", "Oral", "Three times daily", "5 days", ADULT, "Do not use; choose azithromycin or doxycycline.", NS, NS, ["Clinical response"], ["Penicillin allergy"], "copd", CP, sel="one-of", pref=True),
  rx("COPD exacerbation", "Antibiotic (if purulent sputum)", "Bacterial exacerbation", "Adults", "Azithromycin", "500 mg", "Oral", "Once daily", "5 days", ADULT, "Not a beta-lactam; suitable in penicillin allergy.", NS, NS, ["QT if on other QT drugs"], ["QT prolongation"], "copd", CP, sel="one-of", pref=False, use="Penicillin allergy."),
  rx("COPD exacerbation", "Antibiotic (if purulent sputum)", "Bacterial exacerbation", "Adults", "Doxycycline", "100 mg (twice on day 1)", "Oral", "Once daily", "5 days", ADULT, "Not a beta-lactam; suitable in penicillin allergy.", NS, NS, ["Clinical response"], ["Pregnancy"], "copd", CP, sel="one-of", pref=False, use="Penicillin allergy and azithromycin unsuitable."),
  rx("Acute severe asthma", "Nebulised bronchodilator", "Severe asthma", "Adults", "Levosalbutamol with ipratropium (nebulised)", "1.25 mg/0.5 mg", "Nebulised", "Three doses 20 minutes apart, then every 4–6 hours or as needed", "Until improved", ADULT, NOT_ABX, NS, NS, ["SpO2 92–95% (ICMR Asthma STW)", "Heart rate"], ["Tachyarrhythmia"], "asthma", AS),
  rx("Acute severe asthma", "Systemic steroid — first dose", "Severe asthma", "Adults", "Hydrocortisone", "200 mg", "IV", "Single dose", "Then oral prednisolone", ADULT, NOT_ABX, NS, NS, ["Blood glucose"], ["Uncontrolled diabetes: monitor glucose"], "asthma", AS),
  rx("Acute severe asthma", "Systemic steroid — continuation", "Severe asthma", "Adults", "Prednisolone", "0.5 mg/kg", "Oral", "Once daily", "5 days", ADULT, NOT_ABX, NS, NS, ["Blood glucose"], ["Uncontrolled diabetes"], "asthma", AS),
  rx("Acute heart failure", "Loop diuretic", "Pulmonary oedema", "Adults", "Furosemide", "40 mg", "IV", "Single dose, repeat by response", "Until decongested", ADULT, NOT_ABX, "Higher doses may be needed in kidney impairment; monitor creatinine.", NS, ["Urine output, creatinine, potassium"], ["Hypovolaemia, hypotension"], "rf", RF, sel="one-of", pref=True),
  rx("Acute heart failure", "Loop diuretic", "Pulmonary oedema", "Adults", "Torsemide", "20 mg", "IV", "Single dose, repeat by response", "Until decongested", ADULT, NOT_ABX, "Monitor creatinine.", NS, ["Urine output, potassium"], ["Hypovolaemia"], "rf", RF, sel="one-of", pref=False, use="Furosemide unavailable."),
  rx("Severe pneumonia — steroid", "Systemic steroid", "Severe community-acquired pneumonia", "Adults", "Methylprednisolone", "0.5 mg/kg", "IV", "Every 12 hours", "Per specialist review", ADULT, NOT_ABX, NS, NS, ["Blood glucose", "Secondary infection"], ["Uncontrolled infection without antibiotics"], "rf", RF),
  rx("Suspected pulmonary embolism", "Anticoagulant", "Suspected pulmonary embolism", "Adults", "Enoxaparin", "1 mg/kg", "Subcutaneous", "Every 12 hours", "Until confirmed or excluded; then per diagnosis", ADULT, NOT_ABX, "Creatinine clearance below 30 mL/min: 1 mg/kg once daily (label 2.2).", NS, ["Platelets, bleeding"], ["Active major bleeding (label 4)", "Thrombolysis anticipated: use unfractionated heparin (ICMR STW)"], "enox", "sections 2.1–2.2, 4")],
 medNote="Branches follow the causes in the ICMR Respiratory Failure STW (October 2019), with doses from the ICMR COPD and Asthma STWs and the enoxaparin label. ICMR workflows list levosalbutamol/ipratropium; salbutamol is an equivalent short-acting bronchodilator. Antibiotics for pneumonia follow the community-acquired pneumonia topic. Not clinically reviewed.",
 comparison={"title": "Target SpO2: ICMR workflows vs BTS", "columns": ["ICMR STWs (2019)", "BTS (2017)"], "rows": [
   {"parameter": "Most acutely ill adults", "values": ["Start oxygen below 90%; general target printed as '< 96%' (Respiratory Failure STW)", "94–98%"]},
   {"parameter": "COPD or hypercapnia risk", "values": ["88–92% (Respiratory Failure STW); 92% (COPD STW)", "88–92%"]},
   {"parameter": "Acute severe asthma", "values": ["92–95% (Asthma STW)", "94–98%"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Adult acute respiratory failure.", "learningObjectives": ["Give oxygen to the right target.", "Treat the common causes.", "Know when to start NIV and when to intubate."],
  "keyPoints": ["SpO2 below 90%: start oxygen.", "Hypercapnia risk: target 88–92%.", "NIV for pH below 7.35 and PaCO2 above 6.5 kPa despite treatment.", "Worsening on NIV: intubate."],
  "pitfalls": ["High-flow oxygen without an ABG in COPD.", "Delaying intubation when NIV is failing.", "Missing pulmonary embolism with a clear chest X-ray.", "Starting NIV with an undrained pneumothorax."],
  "references": [tref("rf", RF), tref("copd", CP), tref("asthma", AS), tref("btso2", "Web Appendix 3, target saturations"), tref("btsniv", NIV), tref("enox", "sections 2.1, 2.2, 4")]},
 nonClinical={"patientEducation": ["Use inhalers correctly and keep a written action plan.", "Stop smoking and avoid biomass smoke.", "Return early with worsening breathlessness."], "lifestyleAndDiet": ["Smoking cessation", "Pulmonary rehabilitation after COPD exacerbation", "Influenza and pneumococcal vaccination"], "mdtReferrals": ["Pulmonology", "Intensive care unit (ICU) for invasive ventilation", "Cardiology for heart failure"], "dischargeCriteria": ["SpO2 at target on air or established home oxygen", "Cause treated and improving", "Inhaler technique checked"], "followUpPlan": "Review within 1–2 weeks; spirometry after recovery to confirm COPD (ICMR STW)."})
save("t24_resp_failure.json", [T])
