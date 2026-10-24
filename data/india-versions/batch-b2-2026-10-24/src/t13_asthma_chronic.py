from h import *
FIG = "Figure 1 (initiation and modulation of pharmacotherapy)"
PAED = "Adult workflow; paediatric asthma doses are not given in the ICMR STW."
T = topic(
 id="ba28cdf8-642f-5ff8-bfa5-12be4725368a",
 title="Asthma: long-term care (India)",
 specialty="Pulmonology / Primary Care", authority="ICMR", pillar="Chronic Care",
 scope="Adults with asthma in Indian primary and secondary care: diagnosis, step-wise inhaled treatment and control assessment, built on the ICMR Asthma workflow (October 2019).",
 findings=[
  "Classic symptoms, supportive features, mimics, asthma–COPD differentiation, step-wise inhaler regimens, control table, follow-up intervals and referral checked against the ICMR Asthma STW (October 2019).",
  "Not clinically reviewed."],
 unverified=[
  "The ICMR workflow names low-dose oral methylxanthine and low-dose oral corticosteroids without doses; doses are from the theophylline label and GINA 2024. Montelukast and children's inhaled corticosteroid doses are from the montelukast label and GINA 2024.",
  "Normal values are typical adult values."],
 summary="Asthma is a chronic inflammatory airway disease with variable, reversible airflow obstruction, airway hyper-responsiveness and recurrent wheeze, breathlessness, cough and chest tightness. Inflammation — often allergic (atopic), with a family history and identifiable triggers — narrows the airways through smooth-muscle contraction, oedema and mucus. Unlike chronic obstructive pulmonary disease (COPD), onset is usually in childhood or early adulthood and symptoms are episodic (ICMR STW). Inhaled corticosteroids control inflammation and prevent exacerbations; bronchodilators relieve symptoms. The ICMR workflow starts treatment by symptom frequency, reassesses response at 3–4 weeks (a good response supports the diagnosis), and steps treatment up or down by control.",
 mechanisms=[
  "Airway inflammation drives hyper-responsiveness and variable obstruction.",
  "Triggers (allergens, infection, smoke) provoke bronchospasm.",
  "Inhaled corticosteroids reduce inflammation and exacerbations.",
  "Poor control leads to exacerbations and, over time, airway remodelling."],
 presentation={
  "symptoms": ["Recurrent or episodic wheeze", "Breathlessness", "Cough and/or chest tightness", "Night-time symptoms or awakening"],
  "physicalSigns": ["Rhonchi on auscultation (ICMR STW)", "Normal examination between attacks", "Nasal symptoms of atopy"],
  "redFlags": ["Fever, constitutional symptoms, purulent sputum, haemoptysis or focal signs: look for a mimic (ICMR STW)", "Asthma remaining poorly controlled: refer (ICMR STW)", "Frequent exacerbations"],
  "precipitants": ["Allergens and atopy", "Viral infections", "Smoke and pollution", "Non-adherence and poor inhaler technique"]},
 differentials=[
  ("COPD", "Later onset (4th–5th decade), smoking, progressive course, rarely atopic (ICMR Table 1)."),
  ("Foreign-body aspiration", "Sudden onset, localised wheeze (ICMR mimics)."),
  ("Pulmonary tuberculosis", "Fever, weight loss, haemoptysis, abnormal chest X-ray."),
  ("Heart failure", "Orthopnoea, oedema, cardiomegaly.")],
 criteria=[
  ("Clinical diagnosis (ICMR STW)", "Classic symptoms with supportive features (atopy, family history, triggers, rhonchi) and no alternative explanation; spirometry obstruction with bronchodilator reversibility supports it."),
  ("Adequately controlled — all present (ICMR Table 2)", "Daytime symptoms or rescue use twice or less a week; no night-time symptoms; no activity limitation; FEV1 or PEF above 80%."),
  ("Inadequately controlled — any one (ICMR Table 2)", "Daytime symptoms or rescue use more than twice a week; any night-time symptoms; any activity limitation; FEV1 or PEF below 80%.")],
 ruleIn=[
  inv("specializedAdjunctive", "Spirometry with bronchodilator", "FEV1/FVC and reversibility", "Variable airflow obstruction", "FEV1 above 80% predicted, FEV1/FVC normal", "Obstruction with significant bronchodilator reversibility", "Supports diagnosis if available; refer if diagnosis is in doubt (ICMR STW).", "asthma", "section Approach to diagnosis"),
  inv("specializedAdjunctive", "Peak expiratory flow monitoring", "PEF meter", "Control and exacerbation", "Above 80% of personal best", "Below 80% of personal best", "Part of patient education and control assessment (ICMR STW, Table 2).", "asthma", "Table 2"),
  inv("laboratory", "Pulse oximetry", "SpO2", "Hypoxaemia during symptoms", "95–100%", "Below 92% in an attack", "Triggers acute-care pathway (ICMR STW).", "asthma", "section Severe acute asthma"),
  inv("firstLineImaging", "Chest X-ray", "Chest radiograph", "Mimics", "Normal", "Abnormal radiograph", "An abnormal film suggests another diagnosis (ICMR STW).", "asthma", "section Try and rule out"),
  inv("specializedAdjunctive", "Response to 3–4 weeks of treatment", "Clinical reassessment", "Diagnostic confirmation", "Not applicable — therapeutic trial", "Good response supports asthma", "Reassess at 3–4 weeks (ICMR STW).", "asthma", "section Guiding principles")],
 ruleOut=[
  inv("laboratory", "Sputum for acid-fast bacilli (if cough over 2 weeks or haemoptysis)", "Smear or NAAT", "Pulmonary tuberculosis", "Negative", "Positive", "Exclude TB when mimic features are present.", "asthma", "section Try and rule out")],
 management=[
  step("diagnose", "Diagnose and educate", "First visit", ["Diagnose clinically; use spirometry if available; exclude mimics and COPD (ICMR STW).", "Teach inhaler technique, triggers, warning signs and PEF monitoring (ICMR STW)."]),
  step("start", "Start treatment by symptom frequency", "First visit", ["Infrequent, intermittent symptoms: reliever as needed.", "Symptoms more than twice a month but under twice a week: budesonide twice daily plus reliever.", "Symptoms more than twice a week or an exacerbation in the past year: formoterol/budesonide twice daily and as needed (ICMR STW)."]),
  step("review", "Review and adjust", "3–4 weeks, then every 4–12 weeks, then 3-monthly", ["Check control (Table 2), adherence and inhaler technique at each visit (ICMR STW).", "Step up for poor control; step down for good control (ICMR STW)."], [("Poor control on formoterol/budesonide", ["Add tiotropium and low-dose oral methylxanthine; then low-dose oral corticosteroids; then refer (ICMR STW)."])])],
 branches=[
  ("Infrequent intermittent symptoms", "Symptoms occasional and intermittent."),
  ("Regular symptoms (more than twice a month, under twice a week)", "Regular but infrequent symptoms."),
  ("Frequent symptoms or recent exacerbation", "Symptoms more than twice a week or an exacerbation in the past year."),
  ("Poor control on step 3", "Inadequately controlled on formoterol/budesonide.")],
 regimens=[
  rx("Infrequent intermittent symptoms", "Reliever", "Symptom relief", "Adults", "Levosalbutamol (metered-dose inhaler)", "50 µg, 2 puffs", "Inhaled", "As needed", "Long term", PAED, NOT_ABX, NS, NS, ["Reliever use per week"], ["Tachycardia, tremor"], "asthma", FIG, sel="one-of", pref=True),
  rx("Infrequent intermittent symptoms", "Reliever", "Symptom relief", "Adults", "Salbutamol (metered-dose inhaler)", "100 µg, 2 puffs", "Inhaled", "As needed", "Long term", PAED, NOT_ABX, NS, NS, ["Reliever use per week"], ["Tachycardia, tremor"], "asthma", FIG, sel="one-of", pref=False, use="Levosalbutamol unavailable."),
  rx("Regular symptoms (more than twice a month, under twice a week)", "Controller", "Airway inflammation", "Adults", "Budesonide (metered-dose inhaler)", "100 µg, 2 puffs", "Inhaled", "Twice daily", "Long term; review at 3–4 weeks", "Children 6–11 years: low-dose budesonide 100–200 µg total daily (GINA 2024 Box 4-2).", NOT_ABX, NS, NS, ["Control (Table 2)", "Oral thrush"], ["Rinse mouth after use"], "asthma", FIG),
  rx("Regular symptoms (more than twice a month, under twice a week)", "Reliever", "Symptom relief", "Adults", "Levosalbutamol (metered-dose inhaler)", "50 µg, 2 puffs", "Inhaled", "As needed", "Long term", PAED, NOT_ABX, NS, NS, ["Reliever use"], ["Tachycardia, tremor"], "asthma", FIG),
  rx("Frequent symptoms or recent exacerbation", "Controller and reliever (single inhaler)", "Control and relief", "Adults", "Formoterol/budesonide (single inhaler)", "6/200 µg, 2 puffs", "Inhaled", "Twice daily and as needed", "Long term", PAED, NOT_ABX, NS, NS, ["Control (Table 2)", "Oral thrush"], ["Rinse mouth after use"], "asthma", FIG),
  rx("Poor control on step 3", "Add-on", "Inadequate control", "Adults on formoterol/budesonide", "Tiotropium (metered-dose inhaler)", "9 µg, 2 puffs", "Inhaled", "Once daily", "Long term; refer if still poorly controlled", PAED, NOT_ABX, NS, NS, ["Control (Table 2)"], ["Urinary retention, narrow-angle glaucoma: use with caution"], "asthma", FIG, sel="one-of", pref=True),
  rx("Poor control on step 3", "Add-on", "Inadequate control", "Adults on formoterol/budesonide", "Montelukast", "10 mg", "Oral", "Once daily (evening)", "Long term", "6–14 years 5 mg chewable; 2–5 years 4 mg; 12–23 months 4 mg granules (label section 2.1).", NOT_ABX, "No adjustment needed.", NS, ["Mood, sleep and behaviour changes"], ["Boxed warning: serious neuropsychiatric events — stop if mood or behaviour changes"], "mlk", "section 2.1", sel="one-of", pref=False, use="Tiotropium unavailable or not tolerated."),
  rx("Poor control on step 3", "Last-resort add-on: methylxanthine", "Persistent poor control", "Adults over 16 without risk factors for reduced clearance", "Theophylline (extended release)", "Start 300 mg/day; after 3 days 400 mg/day; after 3 more days up to 600 mg/day if needed", "Oral", "Once daily", "Long term; levels above 600 mg/day", "Children 12–15 years under 45 kg: 12–14 mg/kg/day (max 300 mg) rising to 20 mg/kg/day (max 600 mg) (label Table V).", NOT_ABX, NS, "Hepatic impairment, heart failure or age over 60: do not exceed 400 mg/day (label Table V).", ["Serum level 10–15 mcg/mL peak", "Nausea, palpitations"], ["Many drug interactions (e.g. ciprofloxacin, erythromycin)", "Seizure disorder, arrhythmia"], "theo", "Table V"),
  rx("Poor control on step 3", "Last-resort add-on: oral corticosteroid", "Severe asthma with poor control despite above", "Adults with severe asthma (specialist)", "Prednisolone", "7.5 mg or less (low dose)", "Oral", "Once daily, morning", "Shortest possible; specialist review", PAED, NOT_ABX, NS, NS, ["Blood glucose, BP, bone health"], ["Cumulative steroid adverse effects"], "gina24", "section 4, printed p. 92")],
 medNote="Inhaler doses are from the ICMR Asthma STW (October 2019). ICMR names low-dose methylxanthine and oral corticosteroid steps without doses; theophylline doses are from the label and low-dose prednisolone from GINA 2024; montelukast is a GINA alternative add-on. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Long-term asthma care in adults in India.", "learningObjectives": ["Diagnose asthma clinically and separate it from COPD.", "Start and step treatment by symptom frequency and control.", "Teach inhaler technique and self-management."],
  "keyPoints": ["Inhaled drugs are the mainstay.", "Reassess at 3–4 weeks; then every 4–12 weeks.", "Formoterol/budesonide 6/200 µg, 2 puffs twice daily and as needed for frequent symptoms."],
  "pitfalls": ["Reliever-only treatment for regular symptoms.", "Never checking inhaler technique.", "Labelling COPD as asthma."],
  "references": [tref("asthma", "sections Symptoms, Try and rule out, Guiding principles, Approach to diagnosis, Figure 1, Tables 1 and 2"), tref("gina24", "Box 4-2 (printed p. 71); section 4, printed p. 92")]},
 nonClinical={"patientEducation": ["Use the controller every day even when well.", "Know warning signs and the action plan (ICMR STW).", "Correct inhaler technique; bring inhalers to visits."], "lifestyleAndDiet": ["Avoid tobacco smoke, solid-fuel smoke and known triggers.", "Regular exercise."], "mdtReferrals": ["Pulmonologist if poorly controlled or diagnosis uncertain (ICMR STW)"], "dischargeCriteria": ["Not applicable to outpatient care; each visit ends with a control assessment and next review date"], "followUpPlan": "Reassess at 3–4 weeks, then every 4–12 weeks, then 3-monthly (ICMR STW)."})
save("t13_asthma_chronic.json", [T])
