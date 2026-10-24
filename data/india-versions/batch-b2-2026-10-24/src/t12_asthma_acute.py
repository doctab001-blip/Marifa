from h import *
EX = "section Disease exacerbation"
PAED_O2 = "Children 5 years and younger: oxygen to keep SpO2 94–98% (GINA 2024 Box 12-4)."
PAED_BD = "Children 5 years and younger: salbutamol 2–6 puffs by spacer or 2.5 mg nebulised every 20 minutes for the first hour; ipratropium 250 mcg nebulised every 20 minutes for 1 hour only (GINA 2024 Box 12-4)."
PAED_SC = "Children: prednisolone 1–2 mg/kg/day for 3–5 days, maximum 20 mg (under 2 years), 30 mg (2–5 years), 40 mg (6–11 years) (GINA 2024 Box 12-4, section 9)."
T = topic(
 id="57808c03-dbb2-540d-badf-abef2d334d16",
 title="Acute severe asthma (India)",
 specialty="Pulmonology / Emergency Medicine", authority="ICMR", pillar="Urgent Care",
 scope="Adults with an asthma exacerbation in India, from self-management to admission and referral, built on the ICMR Asthma workflow (October 2019).",
 findings=[
  "Exacerbation recognition, severe and life-threatening features, oxygen target, nebuliser, hydrocortisone and prednisolone doses, referral and discharge criteria checked against the ICMR Asthma STW (October 2019).",
  "Not clinically reviewed."],
 unverified=[
  "The ICMR workflow gives no magnesium sulphate or paediatric doses; these are from GINA 2024. GINA does not recommend aminophylline (no added benefit over SABA), so it is not included.",
  "Normal values are typical adult values."],
 summary="An asthma exacerbation is acute worsening of symptoms or a fall in peak expiratory flow (PEF) below 80% of personal best despite usual treatment (ICMR STW). Triggers such as viral infection, allergens, smoke and missed controller therapy increase airway inflammation, bronchial smooth-muscle contraction and mucus plugging. Airflow limitation causes air trapping, hyperinflation and rising work of breathing; ventilation–perfusion mismatch causes hypoxaemia. Early in an attack hyperventilation lowers carbon dioxide; a normal or rising carbon dioxide, a silent chest, exhaustion, altered sensorium, bradycardia or hypotension mean impending respiratory arrest. Treatment is controlled oxygen, repeated inhaled bronchodilators and early systemic corticosteroids, with admission for severe attacks and transfer to an intensive care unit for life-threatening ones (ICMR STW).",
 mechanisms=[
  "Bronchospasm, airway oedema and mucus plugging narrow the airways.",
  "Air trapping and hyperinflation increase the work of breathing.",
  "Ventilation-perfusion mismatch causes hypoxaemia.",
  "Fatigue leads to hypoventilation and respiratory arrest."],
 presentation={
  "symptoms": ["Worsening wheeze, breathlessness, cough, chest tightness", "Increasing reliever use with little relief", "PEF below 80% of personal best (ICMR STW)"],
  "physicalSigns": ["Inability to complete sentences, agitation, accessory muscle use (severe)", "Respiratory rate above 30/min, heart rate above 110/min (severe)", "Pulsus paradoxus above 25 mmHg, silent chest (severe)", "Cyanosis, paradoxical breathing (life-threatening)"],
  "redFlags": ["Room-air SpO2 below 92%: severe — admit (ICMR STW)", "Altered sensorium, orthopnoea, cyanosis, paradoxical breathing, hypotension or heart rate below 60/min: life-threatening — refer immediately to a centre with an intensive care unit (ICU) (ICMR STW)", "No response to treatment: refer (ICMR STW)", "No response after 24 hours of extra reliever doses at home: see a physician (ICMR STW)"],
  "precipitants": ["Viral respiratory infection", "Allergen or smoke exposure", "Stopping or under-using controller inhalers", "Poor inhaler technique"]},
 differentials=[
  ("Chronic obstructive pulmonary disease (COPD) exacerbation","Older smoker or biomass exposure, progressive course; see the ICMR asthma–COPD table."),
  ("Pneumonia", "Fever, purulent sputum, focal signs, consolidation on X-ray (ICMR mimics)."),
  ("Foreign-body aspiration", "Sudden onset, unilateral wheeze (ICMR mimics)."),
  ("Acute heart failure", "Orthopnoea, crackles, raised jugular venous pressure, cardiomegaly."),
  ("Pneumothorax", "Sudden pleuritic pain, absent breath sounds on one side.")],
 criteria=[
  ("Exacerbation (ICMR STW)", "Acute symptomatic worsening, or PEF below 80% of personal best, while on treatment."),
  ("Severe acute asthma — admit (ICMR STW)", "Any of: cannot complete sentences, agitation, accessory muscles, respiratory rate above 30/min, heart rate above 110/min, pulsus paradoxus above 25 mmHg, silent chest, room-air SpO2 below 92%."),
  ("Life-threatening (ICMR STW)", "Altered sensorium, orthopnoea, cyanosis, paradoxical breathing, hypotension and/or heart rate below 60/min."),
  ("Discharge (ICMR STW)", "Symptoms improved, wheeze absent or much reduced, heart rate below 100/min, respiratory rate below 30/min, room-air SpO2 above 94%.")],
 ruleIn=[
  inv("laboratory", "Pulse oximetry", "SpO2 on room air", "Hypoxaemia", "95–100%", "Below 92% (severe)", "Target SpO2 92–95% on oxygen; above 94% on air for discharge (ICMR STW).", "asthma", EX),
  inv("specializedAdjunctive", "Peak expiratory flow", "PEF meter", "Airflow limitation", "At or above 80% of personal best", "Below 80% of personal best", "Defines an exacerbation (ICMR STW).", "asthma", EX),
  inv("laboratory", "Arterial blood gas (if severe)", "ABG", "Respiratory failure", "pH 7.35–7.45; PaCO2 35–45 mmHg", "Hypoxaemia; normal or rising PaCO2 signals fatigue", "Guides referral for ventilation (life-threatening features, ICMR STW).", "asthma", EX),
  inv("firstLineImaging", "Chest X-ray", "Chest radiograph", "Pneumothorax, pneumonia, other mimic", "Clear lungs, no pneumothorax", "Consolidation, pneumothorax or other abnormality", "An abnormal radiograph suggests a mimic (ICMR STW).", "asthma", "section Try and rule out"),
  inv("specializedAdjunctive", "Heart rate, respiratory rate and pulsus paradoxus", "Bedside observation", "Severity grading", "Heart rate 60–100/min; respiratory rate 12–20/min", "Heart rate above 110/min, respiratory rate above 30/min, pulsus paradoxus above 25 mmHg", "Defines severe acute asthma (ICMR STW).", "asthma", EX)],
 ruleOut=[
  inv("laboratory", "Complete blood count (if febrile)", "CBC", "Infective trigger or pneumonia", "White cells 4–11 ×10⁹/L", "Leucocytosis", "Fever and purulent sputum suggest a mimic (ICMR STW).", "asthma", "section Try and rule out")],
 management=[
  step("home", "Self-management", "At first worsening", ["Take two extra puffs of the usual inhaler; repeat if needed (ICMR STW).", "If no response after 24 hours, worse symptoms or falling PEF, contact a physician (ICMR STW)."]),
  step("assess", "Assess severity", "On arrival", ["Grade as non-severe, severe or life-threatening using ICMR criteria.", "Life-threatening: refer immediately to a centre with an ICU (ICMR STW)."]),
  step("severe", "Severe acute asthma (admit)", "First hour onwards", ["Oxygen to keep SpO2 92–95% (ICMR STW).", "Nebulised levosalbutamol/ipratropium three doses at 20-minute intervals, then 4–6-hourly or as needed (ICMR STW).", "IV hydrocortisone 200 mg, then oral prednisolone 0.5 mg/kg daily for 5 days (ICMR STW).", "Refer if no improvement (ICMR STW)."]),
  step("non-severe", "Non-severe acute asthma (outpatient)", "Same day", ["Continue extra inhaler doses as needed; oral prednisolone 0.5 mg/kg daily for 5 days (ICMR STW).", "Follow-up visit at 1 week (ICMR STW)."]),
  step("discharge", "Discharge", "When criteria met", ["Discharge only when symptoms improve, wheeze is absent or much reduced, heart rate below 100/min, respiratory rate below 30/min and room-air SpO2 above 94%; review at 1 week (ICMR STW)."])],
 branches=[("Severe acute asthma", "Admitted adults with severe features."), ("Non-severe acute asthma", "Adults without severe or life-threatening features.")],
 regimens=[
  rx("Severe acute asthma", "Oxygen", "Hypoxaemia", "Admitted adults", "Oxygen", "Titrate to SpO2 92–95%", "Inhaled", "Continuous", "Until stable on room air", PAED_O2, NOT_ABX, NS, NS, ["SpO2"], ["Avoid unmonitored high-flow oxygen"], "asthma", EX),
  rx("Severe acute asthma", "Nebulised bronchodilator", "Bronchospasm", "Admitted adults", "Levosalbutamol/ipratropium (nebuliser solution)", "1.25 mg/0.5 mg", "Nebulised", "Three doses at 20-minute intervals, then 4–6-hourly or as needed", "Until improved", PAED_BD, NOT_ABX, NS, NS, ["Heart rate, respiratory rate, SpO2"], ["Tachyarrhythmia"], "asthma", EX),
  rx("Severe acute asthma", "Systemic corticosteroid (IV start)", "Airway inflammation", "Admitted adults", "Hydrocortisone", "200 mg", "IV", "Once on admission", "Then oral prednisolone", PAED_SC, NOT_ABX, NS, NS, ["Blood glucose"], ["Monitor glucose in diabetes"], "asthma", EX),
  rx("Severe acute asthma", "Systemic corticosteroid (oral continuation)", "Airway inflammation", "Admitted adults", "Prednisolone", "0.5 mg/kg", "Oral", "Once daily", "5 days", PAED_SC, NOT_ABX, NS, NS, ["Blood glucose"], ["Monitor glucose in diabetes"], "asthma", EX),
  rx("Severe acute asthma", "Add-on for poor response", "Severe exacerbation not responding to initial treatment", "Admitted adults", "Magnesium sulphate", "2 g", "IV infusion over 20 minutes", "Single dose", "Once", "Children 2 years and older with a severe exacerbation: nebulised isotonic magnesium sulphate 150 mg, 3 doses in the first hour (GINA 2024 Box 12-4).", NOT_ABX, "Use with caution in severe kidney impairment (magnesium is renally excreted).", NS, ["BP, reflexes, respiratory rate"], ["Not for routine use (GINA)", "Hypotension"], "gina24", "section 9, printed p. 175"),
  rx("Non-severe acute asthma", "Systemic corticosteroid", "Exacerbation", "Adults managed as outpatients", "Prednisolone", "0.5 mg/kg", "Oral", "Once daily", "5 days", PAED_SC, NOT_ABX, NS, NS, ["Symptoms; review at 1 week"], ["Monitor glucose in diabetes"], "asthma", EX)],
 medNote="Adult doses are from the ICMR Asthma STW (October 2019); magnesium sulphate and children's doses are from GINA 2024. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Asthma exacerbations in adults in India.", "learningObjectives": ["Grade exacerbation severity with ICMR criteria.", "Give oxygen, nebulised bronchodilators and steroids promptly.", "Recognise life-threatening asthma and refer."],
  "keyPoints": ["Target SpO2 92–95%.", "Levosalbutamol/ipratropium 1.25/0.5 mg ×3 at 20 minutes.", "Hydrocortisone 200 mg IV, then prednisolone 0.5 mg/kg for 5 days."],
  "pitfalls": ["Missing a silent chest or bradycardia.", "No steroids for a non-severe exacerbation.", "Discharging before criteria are met.", "No follow-up at 1 week."],
  "references": [tref("asthma", "sections When to suspect exacerbation, Severe acute asthma, Life-threatening exacerbation, Non-severe acute asthma, Try and rule out"), tref("gina24", "section 9 (printed pp. 168–175) and Box 12-4 (printed p. 201)")]},
 comparison={"title": "Oral corticosteroid for exacerbations: ICMR vs GINA 2024", "columns": ["ICMR Asthma STW (2019)", "GINA 2024"], "rows": [
   {"parameter": "Adult prednisolone", "values": ["0.5 mg/kg daily for 5 days", "1 mg/kg/day up to 50 mg/day; 40–50 mg/day for 5–7 days"]},
   {"parameter": "IV magnesium", "values": ["Not mentioned", "Single 2 g over 20 minutes for severe exacerbations not responding to initial treatment"]}],
   "note": "Shown as each source states; not merged."},
 nonClinical={"patientEducation": ["Written action plan: extra reliever puffs and when to seek care (ICMR STW).", "Correct inhaler technique.", "Avoid triggers and smoke."], "lifestyleAndDiet": ["Avoid smoking and smoke from solid fuels.", "Influenza vaccination where available."], "mdtReferrals": ["Pulmonologist if poorly controlled", "Higher centre with an ICU for life-threatening attacks (ICMR STW)"], "dischargeCriteria": ["Symptoms improved; wheeze absent or reduced (ICMR STW)", "Heart rate below 100/min and respiratory rate below 30/min (ICMR STW)", "Room-air SpO2 above 94% (ICMR STW)"], "followUpPlan": "Outpatient review at 1 week (ICMR STW); step up controller therapy as in the asthma long-term care topic."})
save("t12_asthma_acute.json", [T])
