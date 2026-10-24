from h import *
TX = "section Treatment flowchart"
EX = "section Disease exacerbation"
PAED = "Not applicable: COPD is an adult disease (ICMR STW: suspect over 35 years)."
PEN_CEPH = "NCDC-ICMR NTG 2025 permits a cephalosporin in non-anaphylactic penicillin allergy (section 7.2 table); with anaphylaxis use azithromycin or doxycycline instead."
T = topic(
 id="c372249a-8688-5be9-a0fd-e57bb6280c31",
 title="COPD (biomass smoke exposure, India adaptation) (India)",
 specialty="Pulmonology / Primary Care", authority="ICMR", pillar="Chronic Care",
 scope="Adults with chronic obstructive pulmonary disease (COPD) in India, including solid-fuel (biomass) exposure, built on the ICMR COPD workflow (October 2019) with antibiotic choices from the NCDC-ICMR National Treatment Guidelines 2025.",
 findings=[
  "Suspicion criteria, spirometry threshold, mMRC scale, severity grading, stepwise inhaler doses, exacerbation drugs, severe-exacerbation features, admission, referral and discharge criteria checked against the ICMR COPD STW (October 2019).",
  "Infective-exacerbation antibiotic choices and duration checked against NCDC-ICMR NTG 2025, section 12.3 (printed p. 81).",
  "ICMR and NTG 2025 recommend different first-line antibiotics; both are shown side by side.",
  "Not clinically reviewed."],
 unverified=[
  "The ICMR severity table is partly illegible for the mMRC and exacerbation columns; only FEV1 bands and complications are stated.",
  "The ICMR flowchart mentions low-dose methylxanthines without a dose; no theophylline dose is given here.",
  "Renal and hepatic adjustments for inhalers and antibiotics are not stated in the cited sources; check the formulary.",
  "Normal laboratory and spirometry ranges are typical adult values; local reference equations apply."],
 summary="Chronic obstructive pulmonary disease (COPD) is persistent, usually progressive airflow limitation caused by long-term inhalation of noxious particles. In India tobacco smoking is joined by smoke from cooking on solid fuels (wood, dung, crop waste) and occupational dust as major causes, so COPD is common in non-smoking women (ICMR STW). Inflammation narrows and remodels small airways and destroys alveolar walls (emphysema), causing air trapping, hyperinflation and breathlessness that worsens over years. Chronic hypoxia leads to pulmonary hypertension and cor pulmonale. Exacerbations — acute worsening of dyspnoea, sputum volume and purulence — are mostly triggered by viral or bacterial infection and drive decline and death. Diagnosis needs post-bronchodilator spirometry, and pulmonary tuberculosis must be excluded when cough lasts more than 2 weeks (ICMR STW).",
 mechanisms=[
  "Chronic airway inflammation narrows small airways and increases mucus.",
  "Alveolar destruction (emphysema) causes air trapping and hyperinflation.",
  "Ventilation-perfusion mismatch causes hypoxaemia and, in severe disease, hypercapnia.",
  "Chronic hypoxia causes pulmonary hypertension, cor pulmonale and secondary polycythaemia."],
 presentation={
  "symptoms": ["Chronic cough", "Progressively worsening breathlessness", "Sputum production", "Exacerbations with more dyspnoea, sputum volume and purulence (ICMR STW)"],
  "physicalSigns": ["Barrel-shaped chest, hyper-resonant percussion, diminished breath sounds, rhonchi (ICMR STW)", "Forced expiratory time above 6 seconds (ICMR STW)", "Cor pulmonale: loud P2, raised jugular venous pressure, oedema (ICMR STW)"],
  "redFlags": ["Altered sensorium (ICMR STW)", "SpO2 below 88% despite therapy (ICMR STW)", "Heart rate above 110/min or systolic BP below 90 mmHg (ICMR STW)", "Respiratory rate above 30/min, cyanosis, paradoxical breathing or asterixis (severe exacerbation, ICMR STW)", "High-risk comorbidity: arrhythmia, heart failure, poorly controlled diabetes, renal or liver failure (ICMR STW)"],
  "precipitants": ["Tobacco smoking", "Cooking with solid fuels (biomass) (ICMR STW)", "Occupational dust and fumes", "Respiratory infection (exacerbations)"]},
 differentials=[
  ("Asthma", "Onset in youth, variable symptoms, marked reversibility; see the ICMR Asthma STW comparison table."),
  ("Pulmonary tuberculosis", "Cough over 2 weeks, fever, weight loss, haemoptysis; sputum for acid-fast bacilli (ICMR STW)."),
  ("Heart failure", "Orthopnoea, raised jugular venous pressure, cardiomegaly and pulmonary venous congestion on X-ray."),
  ("Bronchiectasis", "Daily copious purulent sputum; crackles; bronchial dilatation on computed tomography (CT)."),
  ("Lung cancer", "Haemoptysis, weight loss, focal signs or abnormal chest X-ray (ICMR STW alternative-diagnosis flags).")],
 criteria=[
  ("Airflow obstruction (ICMR STW)", "Post-bronchodilator FEV1/FVC below 0.70."),
  ("Severity by FEV1 (ICMR STW)", "Mild: FEV1 above 80% predicted. Moderate: 50–79%. Severe: below 50% or complications (respiratory failure, cor pulmonale, secondary polycythaemia). The worst category decides severity."),
  ("Exacerbation (ICMR STW)", "Increased dyspnoea, increased sputum volume and increased sputum purulence."),
  ("Severe exacerbation (ICMR STW)", "Any of: cyanosis, respiratory rate above 30/min, heart rate above 110/min, systolic BP below 90 mmHg, SpO2 below 90%, paradoxical breathing, altered sensorium, asterixis, severe comorbidity.")],
 ruleIn=[
  inv("specializedAdjunctive", "Spirometry with bronchodilator", "Post-bronchodilator FEV1/FVC and FEV1 % predicted", "Airflow obstruction and severity", "FEV1/FVC 0.70 or above; FEV1 above 80% predicted", "FEV1/FVC below 0.70", "Required in every provisionally diagnosed patient; refer if unavailable (ICMR STW).", "copd", "section Diagnosis and severity"),
  inv("laboratory", "Pulse oximetry", "SpO2", "Hypoxaemia", "95–100% on air", "Below 90% (severe exacerbation); below 88% despite therapy (refer)", "Guides oxygen; target SpO2 92% in severe exacerbation (ICMR STW).", "copd", EX),
  inv("laboratory", "Sputum for acid-fast bacilli", "Smear or NAAT", "Pulmonary tuberculosis", "Negative", "Positive", "Mandatory if cough lasts more than 2 weeks (ICMR STW).", "copd", "section Rule out"),
  inv("laboratory", "Arterial blood gas (hospital)", "ABG", "Respiratory failure", "PaO2 above 80 mmHg; PaCO2 35–45 mmHg; pH 7.35–7.45", "Hypoxaemia with or without hypercapnia and acidosis", "Respiratory failure is a complication that makes COPD severe (ICMR STW).", "copd", "section Severity Table 2"),
  inv("laboratory", "Haemoglobin and haematocrit", "Complete blood count", "Secondary polycythaemia", "Haematocrit 36–50%", "Raised haematocrit", "Polycythaemia is a complication defining severe disease (ICMR STW).", "copd", "section Severity Table 2")],
 ruleOut=[
  inv("firstLineImaging", "Chest X-ray", "Chest radiograph PA view", "Alternative diagnosis or complication", "Clear lung fields, normal heart size", "Hyperinflation; consolidation, mass, cavity or effusion suggests another diagnosis", "An abnormal radiograph is an alternative-diagnosis flag (ICMR STW).", "copd", "section Rule out"),
  inv("specializedAdjunctive", "12-lead electrocardiogram (ECG)", "ECG", "Cor pulmonale and arrhythmia", "Sinus rhythm, normal axis", "Right ventricular strain, P pulmonale, arrhythmia", "Arrhythmia is a high-risk comorbidity needing referral (ICMR STW).", "copd", "section Red flags")],
 management=[
  step("diagnose", "Confirm and grade", "First visit", ["Suspect COPD in anyone over 35 with chronic cough or progressive breathlessness and smoke or dust exposure (ICMR STW).", "Exclude tuberculosis when cough lasts more than 2 weeks (ICMR STW).", "Confirm with post-bronchodilator spirometry; grade by FEV1, mMRC dyspnoea score, exacerbations and complications (ICMR STW)."]),
  step("stable-care", "Stable COPD", "Every visit", ["Stop smoking and reduce solid-fuel smoke exposure (ICMR STW).", "Prescribe inhalers by severity (see medicines); check adherence and inhaler technique at every visit (ICMR STW).", "Review every 3–6 months if mild or moderate, every 1–3 months if severe (ICMR STW)."], [("Inadequate response or complications", ["Severe COPD: add tiotropium and/or a low-dose methylxanthine, or refer (ICMR STW)."])]),
  step("exacerbation", "Exacerbation", "Same day", ["Increase bronchodilator dose or frequency; nebulise every 20 minutes as needed (ICMR STW).", "Give a 5-day antibiotic and prednisolone 30 mg daily for 5 days (ICMR STW).", "Severe exacerbation: oxygen to SpO2 92% (ICMR STW)."], [("Red flags present", ["Refer to a higher centre with oxygen and nebulisation continued during transfer (ICMR STW)."])]),
  step("admit-discharge", "Admission and discharge", "As needed", ["Admit for severe or sudden dyspnoea at rest, falling saturation, cyanosis, confusion, drowsiness, failure of initial treatment or serious comorbidity (ICMR STW).", "Discharge when parameters are back to baseline, maintenance therapy is understood, acute drugs are complete and comorbidities are controlled; review 1 week after discharge (ICMR STW)."])],
 branches=[
  ("Stable COPD — mild", "FEV1 above 80% predicted, no complications."),
  ("Stable COPD — moderate", "FEV1 50–79% predicted, no complications."),
  ("Stable COPD — severe", "FEV1 below 50% predicted or complications."),
  ("Exacerbation — outpatient", "Increased dyspnoea, sputum volume and purulence without severe features."),
  ("Exacerbation — hospital", "Severe exacerbation or admission criteria met.")],
 regimens=[
  rx("Stable COPD — mild", "Reliever", "Symptom relief", "Adults, mild COPD", "Levosalbutamol (metered-dose inhaler)", "50 µg, 2 puffs", "Inhaled", "As needed", "Long term", PAED, NOT_ABX, NS, NS, ["Inhaler technique", "Symptom frequency"], ["Tachycardia, tremor"], "copd", TX),
  rx("Stable COPD — moderate", "Maintenance", "Long-acting bronchodilation", "Adults, moderate COPD", "Tiotropium (metered-dose inhaler)", "9 µg, 2 puffs", "Inhaled", "Once daily", "Long term", PAED, NOT_ABX, NS, NS, ["Symptoms and exacerbations", "Inhaler technique"], ["Urinary retention, narrow-angle glaucoma: use with caution"], "copd", TX),
  rx("Stable COPD — moderate", "Reliever", "Symptom relief", "Adults, moderate COPD", "Levosalbutamol (metered-dose inhaler)", "50 µg, 2 puffs", "Inhaled", "As needed", "Long term", PAED, NOT_ABX, NS, NS, ["Reliever use"], ["Tachycardia, tremor"], "copd", TX),
  rx("Stable COPD — severe", "Maintenance", "Bronchodilation and inhaled steroid", "Adults, severe COPD", "Formoterol/budesonide (single inhaler)", "6/200 µg, 2 puffs", "Inhaled", "Twice daily", "Long term", PAED, NOT_ABX, NS, NS, ["Exacerbations", "Oral thrush"], ["Rinse mouth after use"], "copd", TX),
  rx("Stable COPD — severe", "Reliever", "Symptom relief", "Adults, severe COPD", "Levosalbutamol (metered-dose inhaler)", "50 µg, 2 puffs", "Inhaled", "As needed", "Long term", PAED, NOT_ABX, NS, NS, ["Reliever use"], ["Tachycardia, tremor"], "copd", TX),
  rx("Stable COPD — severe", "Escalation add-on", "Inadequate response on formoterol/budesonide", "Adults, severe COPD", "Tiotropium (metered-dose inhaler)", "9 µg, 2 puffs", "Inhaled", "Once daily", "Long term", PAED, NOT_ABX, NS, NS, ["Symptoms and exacerbations"], ["Urinary retention, narrow-angle glaucoma: use with caution"], "copd", TX),
  rx("Exacerbation — outpatient", "Nebulised bronchodilator", "Acute bronchospasm", "Adults with exacerbation", "Levosalbutamol/ipratropium (nebuliser solution)", "1.25 mg/0.5 mg", "Nebulised", "Repeat at 20-minute intervals as needed", "Until improved", PAED, NOT_ABX, NS, NS, ["Respiratory rate, heart rate, SpO2"], ["Tachyarrhythmia"], "copd", EX),
  rx("Exacerbation — outpatient", "Antibiotic", "Infective exacerbation", "Adults", "Amoxicillin", "500 mg", "Oral", "Three times daily", "5 days", PAED, "Do not use; choose azithromycin or doxycycline (ICMR STW alternatives).", NS, NS, ["Clinical response at 48–72 hours"], ["Penicillin allergy"], "copd", EX, sel="one-of", pref=True),
  rx("Exacerbation — outpatient", "Antibiotic", "Infective exacerbation", "Adults", "Azithromycin", "500 mg", "Oral", "Once daily", "5 days", PAED, "Suitable in penicillin allergy.", NS, NS, ["Clinical response"], ["QT prolongation risk"], "copd", EX, sel="one-of", pref=False, use="Penicillin allergy or amoxicillin unsuitable."),
  rx("Exacerbation — outpatient", "Antibiotic", "Infective exacerbation", "Adults", "Doxycycline", "100 mg (twice on day 1)", "Oral", "Once daily", "5 days", PAED, "Suitable in penicillin allergy.", NS, NS, ["Clinical response"], ["Pregnancy"], "copd", EX, sel="one-of", pref=False, use="Penicillin allergy and azithromycin unsuitable."),
  rx("Exacerbation — outpatient", "Corticosteroid", "Exacerbation", "Adults", "Prednisolone", "30 mg", "Oral", "Once daily", "5 days", PAED, NOT_ABX, NS, NS, ["Blood glucose in diabetes"], ["Uncontrolled diabetes: monitor glucose"], "copd", EX),
  rx("Exacerbation — hospital", "Oxygen", "Hypoxaemia in severe exacerbation", "Adults with SpO2 below 90%", "Oxygen", "Titrate to SpO2 92%", "Inhaled (nasal prongs or mask)", "Continuous", "Until stable", PAED, NOT_ABX, NS, NS, ["SpO2", "Drowsiness (CO2 retention)"], ["Avoid uncontrolled high-flow oxygen"], "copd", EX),
  rx("Exacerbation — hospital", "Nebulised bronchodilator", "Acute bronchospasm", "Adults admitted with exacerbation", "Levosalbutamol/ipratropium (nebuliser solution)", "1.25 mg/0.5 mg", "Nebulised", "Repeat at 20-minute intervals as needed", "Until improved", PAED, NOT_ABX, NS, NS, ["Heart rate, SpO2"], ["Tachyarrhythmia"], "copd", EX),
  rx("Exacerbation — hospital", "Antibiotic", "Infective exacerbation, unable to take oral", "Adults admitted", "Ceftriaxone", "2 g", "IV", "Once daily", "3–5 days (NTG 2025)", PAED, PEN_CEPH, NS, NS, ["Clinical response", "Switch to oral when able"], ["Severe beta-lactam allergy"], "ntg", "section 12.3, printed p. 81"),
  rx("Exacerbation — hospital", "Corticosteroid", "Exacerbation", "Adults admitted", "Prednisolone", "30 mg", "Oral", "Once daily", "5 days", PAED, NOT_ABX, NS, NS, ["Blood glucose"], ["Uncontrolled diabetes: monitor glucose"], "copd", EX)],
 medNote="Inhaler and exacerbation doses are from the ICMR COPD STW (2019); hospital IV antibiotic is from NCDC-ICMR NTG 2025. Antibiotics only when dyspnoea, sputum volume and purulence all increase (NTG 2025). India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 comparison={"title": "Antibiotics for infective COPD exacerbation", "columns": ["ICMR COPD STW (2019)", "NCDC-ICMR NTG (2025)"], "rows": [
   {"parameter": "First line", "values": ["Amoxicillin 500 mg TDS, or azithromycin 500 mg OD, or doxycycline 100 mg OD (BD day 1)", "Amoxicillin-clavulanate 1 g BD, or cefuroxime 500 mg BD, or cefpodoxime 200 mg BD"]},
   {"parameter": "Alternative", "values": ["Not stated", "Ceftriaxone 2 g IV OD"]},
   {"parameter": "Duration", "values": ["5 days", "3–5 days"]},
   {"parameter": "When to give", "values": ["Exacerbation (cardinal symptoms)", "Only with increased dyspnoea, sputum volume and purulence (Anthonisen)"]}],
   "note": "Shown as each source states; not merged. Choose using local resistance data."},
 teaching={"scope": "COPD in Indian primary and secondary care.", "learningObjectives": ["Diagnose COPD with spirometry and exclude tuberculosis.", "Step inhaler therapy by severity.", "Treat and triage exacerbations."],
  "keyPoints": ["Post-bronchodilator FEV1/FVC below 0.70 confirms obstruction.", "Biomass smoke is a major cause in Indian women.", "Exacerbation: bronchodilator, 5-day antibiotic, prednisolone 30 mg for 5 days."],
  "pitfalls": ["Diagnosing COPD without spirometry.", "Missing tuberculosis.", "Never checking inhaler technique.", "Uncontrolled high-flow oxygen."],
  "references": [tref("copd", "sections When to suspect, Rule out, Diagnosis and severity (Tables 1–2), Treatment flowchart, Disease exacerbation, Admission and discharge"), tref("ntg", "section 12.3, printed p. 81")]},
 nonClinical={"patientEducation": ["Stop smoking; cook with clean fuel or improve ventilation.", "Use inhalers correctly; bring them to every visit.", "Seek care early for more breathlessness or purulent sputum."], "lifestyleAndDiet": ["Stay active; pulmonary rehabilitation where available.", "Adequate nutrition."], "mdtReferrals": ["Tobacco cessation services", "Pulmonologist for uncontrolled disease or complications (ICMR STW)", "Pulmonary rehabilitation"], "dischargeCriteria": ["Back to pre-admission parameters (ICMR STW)", "Can follow maintenance therapy (ICMR STW)", "Acute medicines completed and comorbidities controlled (ICMR STW)"], "followUpPlan": "Review 1 week after discharge, then every 3–6 months (mild or moderate) or every 1–3 months (severe) (ICMR STW)."})
save("t03_copd.json", [T])
