from h import *
HT = "sections Hypertension urgency, Severe hypertension without acute target-organ damage, Suggested treatment protocols"
MS = "sections Definitions, Target-organ damage, Treatment, drug table"
TITLE = "Hypertensive emergency and severe hypertension (India)"
T = topic(
 id=new_id(TITLE), title=TITLE, specialty="Cardiology / Internal Medicine / Emergency Medicine", authority="ICMR", pillar="Urgent Care",
 scope="Adults with blood pressure (BP) of 180/120 mmHg or more in India, with or without acute target-organ damage, built on the ICMR Hypertension in Adults workflow (May 2026). The ICMR workflow gives no intravenous (IV) therapy, so IV choices come from the MSD Manual review and doses from US product labels.",
 findings=[
  "BP thresholds, symptoms of target-organ damage, refer-to-emergency-care instruction, oral-only management of severe hypertension without organ damage, 24–48 hour lowering, 1-week follow-up and the amlodipine-telmisartan protocol checked against the ICMR Hypertension in Adults STW (May 2026).",
  "Hypertensive emergency definition, target-organ list, the 20–25% mean arterial pressure reduction and drug choice by condition taken from the MSD Manual Professional review (February 2025, updated April 2026).",
  "Labetalol and nicardipine doses from US labels; esmolol dose from 2023 ACC/AHA/ACCP/HRS Table 21.",
  "ICMR and MSD use the word 'urgency' differently; both are shown side by side.",
  "Not clinically reviewed."],
 unverified=[
  "IV nitroglycerin and sodium nitroprusside doses were not opened; use the local protocol (MSD: nitroglycerin preferred for myocardial ischaemia and heart failure; nitroprusside only when alternatives are unavailable).",
  "Condition-specific BP targets (aortic dissection, acute stroke, pre-eclampsia) were not confirmed in an opened source; follow the relevant topic and specialist advice.",
  "Investigation normal ranges are typical adult values; local laboratory ranges apply."],
 summary="Severe hypertension is a BP of 180 mmHg systolic or more and/or 120 mmHg diastolic or more. When it comes with acute damage to the brain, eyes, heart, aorta or kidneys it is a hypertensive emergency and needs controlled IV lowering in a monitored bed. Without acute organ damage, it is treated with oral drugs and lowered gradually over 24–48 hours; IV drugs and rapid falls are avoided because cerebral, coronary and renal autoregulation has shifted upward and a sudden drop can cause ischaemia (ICMR STW; MSD).",
 mechanisms=[
  "Abrupt rise in vascular resistance overwhelms autoregulation and injures arteriolar walls.",
  "Endothelial damage causes fibrinoid necrosis, retinal haemorrhages, papilloedema and acute kidney injury.",
  "Raised afterload causes acute left ventricular (LV) failure, pulmonary oedema and myocardial ischaemia.",
  "Chronic hypertension shifts autoregulation upward, so rapid normalisation risks brain, heart and kidney ischaemia."],
 presentation={
  "symptoms": ["Headache, confusion, dizziness, visual disturbance (ICMR STW)", "Chest pain (ICMR STW)", "Breathlessness, worse lying down, or leg swelling (ICMR STW)", "Sudden weakness, speech or swallowing difficulty (ICMR STW)"],
  "physicalSigns": ["BP 180/120 mmHg or more on repeat measurement", "Retinal haemorrhages, exudates or papilloedema", "Crackles and raised jugular venous pressure (pulmonary oedema)", "Focal neurological deficit; reduced consciousness"],
  "redFlags": ["Any symptom of target-organ damage with BP 180/120 mmHg or more: stabilise ABC and refer to emergency care (ICMR STW)", "Hypertensive encephalopathy", "Acute aortic dissection (tearing chest or back pain)", "Pulmonary oedema or myocardial ischaemia", "Pre-eclampsia or eclampsia (MSD target-organ list)"],
  "precipitants": ["Stopping antihypertensive medicines", "Untreated or undiagnosed hypertension", "Pregnancy (pre-eclampsia)", "Kidney disease", "Anxiety or pain (common cause of high readings without organ damage, MSD)"]},
 differentials=[
  ("Severe hypertension without acute organ damage", "No new symptoms or signs of organ damage; managed orally (ICMR STW)."),
  ("Acute stroke with reactive hypertension", "Focal deficit first; BP lowering follows the stroke pathway, not urgent normalisation (MSD)."),
  ("Pain- or anxiety-related BP rise", "BP falls with analgesia or reassurance; no organ damage (MSD)."),
  ("Pheochromocytoma crisis", "Paroxysmal headache, sweating, palpitations; phentolamine is reserved for confirmed cases (MSD).")],
 criteria=[
  ("ICMR 'hypertension urgency' (ICMR STW)", "Systolic BP 180 or more and/or diastolic 120 or more with symptoms of target-organ damage: stabilise ABC and refer to emergency care at a higher centre."),
  ("Hypertensive emergency (MSD)", "Severe hypertension (often 180/120 mmHg or more) with signs of target-organ damage: immediate IV lowering."),
  ("Severe hypertension without acute target-organ damage (ICMR STW)", "Systolic 180 or more and/or diastolic 120 or more with no acute organ damage: oral drugs, no IV medicines, lower over 24–48 hours, follow up within 1 week."),
  ("Lowering target in emergency (MSD)", "Reduce mean arterial pressure by 20–25% over about the first 1–2 hours, then titrate; urgent normalisation is not needed, especially in acute stroke."),
  ("Long-term targets (ICMR STW)", "All adults under 140/90 mmHg; diabetes, chronic kidney disease or cardiovascular disease under 130/80 if tolerated; age 80 or over under 150/90.")],
 ruleIn=[
  inv("laboratory", "Repeat BP measurement", "Both arms, correct cuff", "Severity", "Under 120/80 mmHg (normal, ICMR STW)", "180/120 mmHg or more", "Defines severe hypertension (ICMR STW).", "htn", HT),
  inv("specializedAdjunctive", "Fundoscopy", "Ophthalmoscope", "Hypertensive retinopathy", "Normal discs and vessels", "Haemorrhages, exudates, papilloedema", "Retinopathy is target-organ damage (MSD).", "msd", MS),
  inv("laboratory", "12-lead electrocardiogram (ECG) and troponin", "ECG, cardiac biomarker", "Myocardial ischaemia; LV hypertrophy", "Normal ECG; troponin below the assay 99th percentile", "Ischaemic changes; raised troponin", "Myocardial ischaemia is target-organ damage (MSD).", "msd", MS),
  inv("advancedImaging", "Computed tomography (CT) head", "Non-contrast CT", "Stroke, haemorrhage, encephalopathy", "No acute abnormality", "Haemorrhage, infarct or oedema", "Neurological symptoms with severe BP (MSD target-organ list).", "msd", MS)],
 ruleOut=[
  inv("laboratory", "Creatinine, electrolytes and urinalysis", "Blood and urine", "Acute kidney injury", "Creatinine 0.6–1.2 mg/dL; urine protein and blood negative", "Rising creatinine; proteinuria or haematuria", "Renal failure is target-organ damage (MSD).", "msd", MS),
  inv("firstLineImaging", "Chest X-ray", "Chest radiograph", "Pulmonary oedema; widened mediastinum", "Clear lungs, normal mediastinum", "Pulmonary oedema; wide mediastinum (dissection)", "Breathlessness or chest pain with severe BP (MSD target-organ list).", "msd", MS)],
 management=[
  step("triage", "Triage", "First 15 minutes", ["Confirm BP 180/120 mmHg or more on repeat measurement.", "Look for symptoms of target-organ damage: visual disturbance, confusion, headache, chest pain, breathlessness, weakness or speech difficulty (ICMR STW).", "Symptoms present: stabilise airway, breathing and circulation (ABC) and refer to emergency care at a higher centre (ICMR STW)."]),
  step("emergency", "Hypertensive emergency (higher centre)", "First 1–2 hours", ["Monitored bed with intra-arterial or frequent BP checks.", "IV drug chosen by organ involved; reduce mean arterial pressure by 20–25% over about 1–2 hours, then titrate to symptoms (MSD).", "Labetalol for most emergencies except acute LV failure; nicardipine for most except acute heart failure; esmolol for aortic dissection; nitroglycerin for myocardial ischaemia or heart failure (MSD).", "Do not give oral short-acting nifedipine (MSD)."]),
  step("severe", "Severe hypertension without acute organ damage", "Same day", ["Start oral antihypertensives; do not use IV medicines (ICMR STW).", "Lower BP gradually over 24–48 hours (ICMR STW).", "Refer or admit if symptoms or organ damage are suspected (ICMR STW).", "Treat pain or anxiety, which commonly raise readings (MSD)."]),
  step("follow", "Follow-up", "Within 1 week", ["Review within 1 week (ICMR STW).", "Step up every 4 weeks using the ICMR protocol (amlodipine, then telmisartan, then chlorthalidone) until under 140/90 mmHg (ICMR STW)."])],
 branches=[
  ("Hypertensive emergency — IV therapy", "BP 180/120 mmHg or more with acute target-organ damage, in a monitored setting (MSD)."),
  ("Aortic dissection", "Suspected or confirmed acute aortic dissection (MSD)."),
  ("Severe hypertension without acute organ damage", "BP 180/120 mmHg or more, no acute target-organ damage (ICMR STW).")],
 regimens=[
  rx("Hypertensive emergency — IV therapy", "IV antihypertensive", "Hypertensive emergency", "Adults", "Labetalol", "0.25 mg/kg (up to 20 mg) over 2 minutes, then 20–80 mg every 10 minutes; or infusion 2 mg/minute", "IV", "Bolus every 10 minutes or continuous infusion", "Until target reached; safety above 300 mg total not established (label 2.2)", "Safety and effectiveness in children not established (label 8.4).", NOT_ABX, NS, NS, ["BP every 5–10 minutes during titration", "Heart rate"], ["Asthma or obstructive airway disease, heart block above first degree, severe bradycardia, cardiogenic shock (label 4)", "Acute LV failure (MSD)"], "labet", "sections 2.2, 4", sel="one-of", pref=True),
  rx("Hypertensive emergency — IV therapy", "IV antihypertensive", "Hypertensive emergency", "Adults", "Nicardipine", "Start 5 mg/h; increase by 2.5 mg/h every 15 minutes (every 5 minutes for faster effect); max 15 mg/h", "IV infusion", "Continuous", "Until target reached, then switch to oral", "Safety and efficacy under 18 years not established (label 8.4).", NOT_ABX, "Titrate carefully beyond mild kidney impairment (label 5.6).", "Consider lower doses and monitor closely (label 5.5).", ["BP and heart rate during titration; stop for hypotension or tachycardia, restart at 3–5 mg/h (label 2.5)"], ["Advanced aortic stenosis (label 4.1)", "Acute heart failure (MSD)"], "nicar", "sections 2.4–2.5, 4.1", sel="one-of", pref=False, use="Asthma, heart block or bradycardia make labetalol unsuitable."),
  rx("Aortic dissection", "Beta-blockade", "Aortic dissection", "Adults", "Esmolol", "500 µg/kg over 1 minute, then 50–300 µg/kg/minute", "IV", "Bolus then continuous infusion", "Until surgical or specialist plan", ADULT, NOT_ABX, NS, NS, ["Heart rate, BP continuously"], ["Bradycardia, heart block, decompensated heart failure"], "acc23t", "Table 21 (dose); MSD drug table (indication)"),
  rx("Severe hypertension without acute organ damage", "Oral first step", "Severe hypertension", "Adults", "Amlodipine", "5 mg (increase to 10 mg per protocol)", "Oral", "Once daily", "Long-term; review within 1 week", ADULT, NOT_ABX, NS, NS, ["BP at 1 week, then every 4 weeks (ICMR STW)", "Ankle oedema"], ["Severe aortic stenosis"], "htn", HT),
  rx("Severe hypertension without acute organ damage", "Add second drug", "BP still 140/90 or more", "Adults", "Telmisartan", "40 mg, then 80 mg", "Oral", "Once daily", "Long-term", ADULT, NOT_ABX, "Check creatinine and potassium after starting.", NS, ["BP", "Creatinine, potassium"], ["Pregnancy", "Bilateral renal artery stenosis"], "htn", HT)],
 medNote="The ICMR STW gives oral treatment only; IV drug choice follows the MSD Manual review with doses from US labels and ACC/AHA Table 21. For severe hypertension MSD supports starting two oral drugs together; the ICMR protocol adds telmisartan after amlodipine. Nitroglycerin and nitroprusside infusions follow the local protocol (dose not verified here). Pre-eclampsia is managed in the obstetric topic. Not clinically reviewed.",
 comparison={"title": "BP 180/120 mmHg or more: ICMR STW vs MSD Manual", "columns": ["ICMR Hypertension STW (2026)", "MSD Manual (2025)"], "rows": [
   {"parameter": "With symptoms or signs of organ damage", "values": ["Called 'hypertension urgency': stabilise ABC and refer to emergency care", "Called 'hypertensive emergency': immediate IV lowering"]},
   {"parameter": "Without acute organ damage", "values": ["Severe hypertension: oral drugs, no IV, lower over 24–48 hours, follow up within 1 week", "Called 'hypertensive urgency': no immediate lowering; oral therapy (often 2 drugs) and close outpatient review"]},
   {"parameter": "Speed of lowering in emergency", "values": ["Not stated", "Mean arterial pressure down 20–25% over about 1–2 hours"]}],
   "note": "Same thresholds, different labels; shown as each source states."},
 teaching={"scope": "Adults with BP 180/120 mmHg or more.", "learningObjectives": ["Separate hypertensive emergency from severe hypertension without organ damage.", "Choose an IV drug by the organ involved.", "Avoid harmful rapid BP falls."],
  "keyPoints": ["Organ damage decides the pathway, not the number.", "No organ damage: oral drugs, lower over 24–48 hours.", "Emergency: reduce mean arterial pressure 20–25% over 1–2 hours.", "Labetalol is not for asthma or acute LV failure."],
  "pitfalls": ["IV drugs for a high reading without organ damage.", "Sublingual or short-acting nifedipine.", "Normalising BP fast in acute stroke.", "Missing aortic dissection before choosing a vasodilator."],
  "references": [tref("htn", HT), tref("msd", MS), tref("labet", "sections 2.2, 4, 8.4"), tref("nicar", "sections 2.4, 2.5, 4.1, 5.5, 5.6"), tref("acc23t", "Table 21 (esmolol)")]},
 nonClinical={"patientEducation": ["Take BP medicines every day and do not stop them suddenly.", "Return at once for headache with vision change, chest pain, breathlessness or weakness."], "lifestyleAndDiet": ["Reduce salt; avoid alcohol and tobacco.", "Regular physical activity and weight control."], "mdtReferrals": ["Emergency medicine or intensive care unit (ICU) for hypertensive emergency", "Cardiology, neurology or nephrology by organ involved", "Obstetrics for pregnant patients"], "dischargeCriteria": ["No acute target-organ damage", "BP falling on oral drugs", "Follow-up booked within 1 week (ICMR STW)"], "followUpPlan": "Review within 1 week, then every 4 weeks, stepping up the ICMR protocol until BP is under 140/90 mmHg (or under 130/80 with diabetes, chronic kidney disease or cardiovascular disease if tolerated)."})
save("t23_htn_emergency.json", [T])
