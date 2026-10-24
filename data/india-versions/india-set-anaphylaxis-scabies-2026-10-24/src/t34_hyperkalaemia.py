from hx import *
TITLE = "Hyperkalaemia in adults (India)"
AK = "section Treatment of hyperkalemia"; UK16 = "sections 16.1–16.6"
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Nephrology / Emergency Medicine / Internal Medicine", authority="ICMR", pillar="Urgent Care",
 scope="Acute and chronic hyperkalaemia in adults in India: severity, electrocardiogram (ECG) assessment, cardiac protection with calcium, shifting potassium into cells, removing potassium, dialysis, monitoring and safe use of renin-angiotensin-aldosterone system (RAAS) inhibitors, built on the ICMR Acute Kidney Injury STW (July 2026) and the UK Kidney Association (UKKA) guideline (updated July 2026).",
 findings=[
  "Calcium gluconate 10 mL of 10% over 2–5 minutes under ECG monitoring repeatable up to 3 times, salbutamol 10 mg nebulised, insulin 10 units in 50 mL of 50% or 100 mL of 25% dextrose, withholding ACE inhibitors and ARBs, binders if dialysis is unavailable and urgent dialysis if life-threatening checked against the ICMR AKI STW (July 2026).",
  "Severity bands, ECG and monitoring rules, the UKKA calcium dose (6.8 mmol: 30 mL of 10% calcium gluconate or 10 mL of 10% calcium chloride), insulin with 25 g glucose, post-treatment 10% glucose if pre-treatment glucose below 7.0 mmol/L, salbutamol 10–20 mg, sodium zirconium cyclosilicate (SZC) 10 g three times daily for up to 72 hours, patiromer 8.4 g, potassium and glucose monitoring schedules and RAAS inhibitor rules checked against UKKA (July 2026).",
  "Calcium polystyrene sulfonate doses from the Calcium Resonium SmPC.",
  "Not clinically reviewed."],
 unverified=[
  "ICMR and UKKA give different calcium gluconate volumes (10 mL vs 30 mL of 10%) and dextrose regimens; both are shown, not merged.",
  "UKKA no longer recommends calcium polystyrene sulfonate routinely for acute hyperkalaemia; it is listed because SZC and patiromer may be unavailable in Indian hospitals.",
  "The sodium bicarbonate dose was not in the opened UKKA extract.",
  "Paediatric hyperkalaemia is outside the scope of the cited adult guidelines, except the calcium polystyrene sulfonate paediatric dose from its SmPC."],
 summary="Hyperkalaemia is serum potassium of 5.5 mmol/L or more; 6.5 mmol/L or more is severe (UKKA). It lowers the resting membrane potential of cardiac cells, slowing conduction and risking bradycardia, ventricular fibrillation or asystole. Common causes in India are acute kidney injury (AKI) and chronic kidney disease, RAAS inhibitors, potassium-sparing diuretics, diabetic ketoacidosis and tissue breakdown. Treatment follows a fixed order: protect the heart with IV calcium if the ECG shows changes, shift potassium into cells with insulin-glucose and salbutamol, remove potassium with binders or dialysis, and monitor potassium and glucose closely (UKKA; ICMR STW).",
 mechanisms=[
  "Raised extracellular potassium partly depolarises myocytes, inactivating sodium channels and slowing conduction.",
  "Calcium restores the threshold potential without lowering potassium.",
  "Insulin and beta-2 agonists drive potassium into cells via Na+/K+-ATPase.",
  "Binders and dialysis are the only treatments that remove potassium from the body."],
 presentation={
  "symptoms": ["Often none", "Muscle weakness, paraesthesia", "Palpitations", "Collapse in severe hyperkalaemia"],
  "physicalSigns": ["Bradycardia or irregular pulse", "Flaccid weakness", "Signs of AKI or volume depletion"],
  "redFlags": ["Potassium 6.5 mmol/L or more (UKKA)", "ECG changes: peaked T waves, flat P waves, wide QRS, sine wave, bradycardia", "Haemodialysis patient with potassium 6.5 mmol/L or more: urgent dialysis (UKKA 18.1)", "Life-threatening hyperkalaemia: urgent dialysis (ICMR STW)"],
  "precipitants": ["AKI and CKD", "ACE inhibitors, ARBs, mineralocorticoid antagonists, potassium supplements", "Diabetic ketoacidosis, rhabdomyolysis, tumour lysis", "Haemolysed sample (pseudohyperkalaemia)"]},
 differentials=[
  ("Pseudohyperkalaemia", "Haemolysed sample or very high WBC or platelets; repeat without tourniquet."),
  ("Hyperkalaemic periodic paralysis", "Episodic weakness, family history."),
  ("Digoxin toxicity", "Arrhythmias with raised potassium; check digoxin level.")],
 criteria=[
  ("Mild (UKKA)", "Potassium 5.5–5.9 mmol/L."),
  ("Moderate (UKKA)", "Potassium 6.0–6.4 mmol/L."),
  ("Severe (UKKA)", "Potassium 6.5 mmol/L or more."),
  ("Continuous monitoring (UKKA 14.2)", "Potassium 6.5 mmol/L or more, ECG changes, or 6.0–6.4 mmol/L if unwell or rising fast.")],
 ruleIn=[
  inv("laboratory", "Serum potassium", "Venous or arterial sample", "Hyperkalaemia", "3.5–5.0 mmol/L", "5.5 mmol/L or more; 6.5 or more severe", "Sets severity and treatment (UKKA).", "ukka", "sections 1.2, 16.1"),
  inv("specializedAdjunctive", "12-lead electrocardiogram (ECG)", "ECG", "Cardiac toxicity", "Normal P waves, QRS under 120 ms, normal T waves", "Peaked T, flat P, wide QRS, sine wave, bradycardia", "Urgent ECG for potassium 6.0 mmol/L or more; ECG changes need IV calcium (UKKA 14.1, 16.2).", "ukka", "sections 14.1, 16.2"),
  inv("laboratory", "Capillary glucose", "Bedside glucose", "Risk of insulin-induced hypoglycaemia", "4.0–7.8 mmol/L", "Below 7.0 mmol/L before treatment", "Start 10% glucose after insulin if below 7.0 mmol/L; check at set times up to 6 hours (UKKA 16.3.3, 17.2).", "ukka", "sections 16.3.3, 17.2"),
  inv("laboratory", "Creatinine and urea", "Serum", "AKI or CKD", "Creatinine 0.6–1.2 mg/dL", "Raised", "Cause; dialysis decision (ICMR STW).", "aki", "section Indications for dialysis"),
  inv("laboratory", "Venous blood gas (pH, bicarbonate)", "Blood gas", "Acidosis", "pH 7.35–7.45; bicarbonate 22–28 mmol/L", "Metabolic acidosis", "Acidosis worsens hyperkalaemia; check acid-base status (ICMR STW).", "aki", "section Desirable actions/investigations")],
 ruleOut=[
  inv("laboratory", "Repeat non-haemolysed sample", "Venous sample without prolonged tourniquet", "Pseudohyperkalaemia", "Potassium 3.5–5.0 mmol/L", "Persistently raised", "Do not delay treatment if ECG changes are present.", "ukka", "section 1.2"),
  inv("laboratory", "Creatine kinase, digoxin level as indicated", "Serum", "Rhabdomyolysis or digoxin toxicity", "CK below 200 U/L; digoxin 0.5–2 ng/mL", "Raised", "Identifies the cause.", "ukka", "section 16.1")],
 management=[
  step("assess", "Assess", "First 15 minutes", ["Repeat potassium if haemolysis likely, but treat at once if ECG changes (UKKA).", "12-lead ECG for potassium 6.0 or more; cardiac monitor for 6.5 or more or ECG changes (UKKA 14.1–14.2).", "Stop potassium supplements, ACE inhibitors, ARBs and mineralocorticoid antagonists (ICMR STW; UKKA 2.6)."]),
  step("heart", "Protect the heart", "Immediately if ECG changes", ["IV calcium under ECG monitoring (see medicines); repeat if ECG changes persist (ICMR STW).", "Calcium chloride in cardiac arrest or peri-arrest; gluconate otherwise (UKKA 16.2b)."]),
  step("shift", "Shift potassium into cells", "Within 30 minutes", ["Insulin with glucose for severe hyperkalaemia; suggested for moderate (UKKA 16.3).", "Add nebulised salbutamol in severe hyperkalaemia; never as sole treatment (UKKA 16.4)."]),
  step("remove", "Remove potassium", "Within hours", ["Potassium binder: SZC for severe and consider for moderate (UKKA 16.6); binders if dialysis unavailable (ICMR STW).", "Urgent dialysis if life-threatening or resistant (ICMR STW; UKKA 19.6)."]),
  step("monitor", "Monitor", "1, 2, 4, 6 and 24 hours", ["Potassium at 1, 2, 4, 6 and 24 hours for moderate or severe (UKKA 17.1.2).", "Glucose at 0, 30, 60, 90, 120, 180, 240, 300 and 360 minutes after insulin (UKKA 17.2).", "Restart RAAS inhibitors one at a time when potassium below 5.5 mmol/L (UKKA)."])],
 branches=[
  ("Moderate or severe hyperkalaemia", "Potassium 6.0 mmol/L or more, or any potassium with ECG changes.")],
 regimens=[
  rx("Moderate or severe hyperkalaemia", "Protect the heart (ECG changes)", "Hyperkalaemia with ECG changes", "Adults", "Calcium gluconate 10%", "10 mL over 2–5 minutes, repeat up to 3 times (ICMR); UKKA: 30 mL over 10 minutes", "IV, slow, under ECG monitoring", "Repeat if ECG changes persist", "Until ECG normalises", "Paediatric dose not in the cited adult guidelines.", NOT_ABX, "No adjustment.", "No adjustment.", ["Continuous ECG"], ["Digoxin toxicity: give slowly with caution", "Do not mix with bicarbonate"], "aki", AK, sel="one-of", pref=True, extra_adj=("UKKA guideline 16.2a: 6.8 mmol calcium = 30 mL 10% calcium gluconate.",)),
  rx("Moderate or severe hyperkalaemia", "Protect the heart (ECG changes)", "Hyperkalaemia in cardiac arrest or peri-arrest", "Adults", "Calcium chloride 10%", "10 mL over 5 minutes", "IV (large or central vein)", "Repeat if needed", "Until ECG normalises", "Paediatric dose not in the cited adult guidelines.", NOT_ABX, "No adjustment.", "No adjustment.", ["Continuous ECG"], ["Extravasation causes tissue necrosis"], "ukka", "section 16.2", sel="one-of", pref=False, use="Cardiac arrest or peri-arrest (UKKA 16.2b)."),
  rx("Moderate or severe hyperkalaemia", "Shift potassium into cells", "Moderate or severe hyperkalaemia", "Adults", "Insulin (soluble) with glucose", "10 units soluble insulin with 25 g glucose (ICMR: in 50 mL of 50% or 100 mL of 25% dextrose)", "IV over 15–30 minutes", "Repeat by potassium response", "Single dose; repeat if needed", "Paediatric dose not in the cited adult guidelines.", NOT_ABX, "Higher hypoglycaemia risk in kidney failure: monitor glucose closely.", "Higher hypoglycaemia risk in liver disease.", ["Glucose at 0–360 minutes (UKKA 17.2)", "Potassium at 1, 2, 4, 6, 24 hours"], ["Hypoglycaemia"], "aki", AK, extra_adj=("If pre-treatment glucose below 7.0 mmol/L, follow with 10% glucose 50 mL/hour for 5 hours (UKKA 16.3.3).",)),
  rx("Moderate or severe hyperkalaemia", "Adjunct shift", "Severe hyperkalaemia", "Adults", "Salbutamol (nebulised)", "10–20 mg (ICMR: 10 mg, 4 respules of 2.5 mg)", "Nebulised", "Once, may repeat", "Single dose", "Paediatric dose not in the cited adult guidelines.", NOT_ABX, "No adjustment.", "No adjustment.", ["Heart rate, tremor"], ["Never as sole treatment for severe hyperkalaemia (UKKA 16.4.3)", "Caution in ischaemic heart disease and tachyarrhythmia"], "ukka", "section 16.4"),
  rx("Moderate or severe hyperkalaemia", "Remove potassium", "Moderate or severe hyperkalaemia", "Adults", "Sodium zirconium cyclosilicate", "10 g three times daily", "Oral", "Three times daily", "Up to 72 hours", "Paediatric dose not in the cited adult guidelines.", NOT_ABX, "Usable in CKD.", "No adjustment.", ["Potassium, oedema (sodium load)"], ["Severe constipation or bowel obstruction"], "ukka", "section 16.6.1", sel="one-of", pref=True),
  rx("Moderate or severe hyperkalaemia", "Remove potassium", "Potassium 6.0 mmol/L or more", "Adults", "Patiromer", "8.4 g once daily", "Oral", "Once daily", "Until potassium controlled", "Paediatric dose not in the cited adult guidelines.", NOT_ABX, "Usable in CKD.", "No adjustment.", ["Potassium, magnesium"], ["Separate from other oral drugs by 3 hours"], "ukka", "section 16.6.2", sel="one-of", pref=False, use="SZC unavailable or not tolerated."),
  rx("Moderate or severe hyperkalaemia", "Remove potassium", "Hyperkalaemia, dialysis unavailable", "Adults", "Calcium polystyrene sulfonate", "15 g three or four times daily orally; or 30 g retention enema daily", "Oral or rectal", "Three or four times daily", "Until potassium below 5 mmol/L", "Children 1 g/kg/day in divided doses, then 0.5 g/kg/day (SmPC); no oral use in neonates.", NOT_ABX, "Monitor calcium in chronic renal failure.", "No adjustment stated.", ["Potassium, calcium", "Constipation"], ["Potassium below 5 mmol/L", "Obstructive bowel disease", "Hypercalcaemia states"], "cpsr", "section 4.2", sel="one-of", pref=False, use="SZC and patiromer unavailable and dialysis not immediately possible (ICMR STW).")],
 medNote="ICMR AKI STW (2026) doses are shown with UKKA (2026) doses where they differ. Remove potassium with binders or dialysis; calcium, insulin and salbutamol only buy time. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 comparison={"title": "Acute hyperkalaemia doses: ICMR AKI STW vs UKKA", "columns": ["ICMR AKI STW (2026)", "UKKA guideline (2026)"], "rows": [
   {"parameter": "Calcium gluconate 10%", "values": ["10 mL over 2–5 minutes, repeat up to 3 times", "30 mL over 10 minutes (6.8 mmol); or calcium chloride 10 mL in arrest"]},
   {"parameter": "Insulin-glucose", "values": ["10 units in 50 mL 50% or 100 mL 25% dextrose", "10 units with 25 g glucose; then 10% glucose 50 mL/hour for 5 hours if glucose below 7.0 mmol/L"]},
   {"parameter": "Salbutamol", "values": ["10 mg nebulised", "10–20 mg nebulised, adjunct only"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Adult hyperkalaemia in Indian hospitals.", "learningObjectives": ["Grade hyperkalaemia and read the ECG.", "Give treatments in the right order.", "Prevent hypoglycaemia after insulin."],
  "keyPoints": ["ECG changes: IV calcium first.", "Insulin 10 units with 25 g glucose; watch glucose for 6 hours.", "Salbutamol is an adjunct only.", "Remove potassium: binder or dialysis."],
  "pitfalls": ["Treating a haemolysed sample.", "No glucose monitoring after insulin.", "Restarting RAAS inhibitors too soon.", "Relying on calcium to lower potassium."],
  "references": [tref("aki", "sections Treatment of hyperkalemia, Indications for dialysis, Desirable actions/investigations"), tref("ukka", "sections 1.2, 2.1–2.7, 14.1–14.2, 16.1–16.6, 17.1–17.2, 18.1–18.4, 19.6"), tref("cpsr", "sections 4.2, 4.3")]},
 nonClinical={"patientEducation": ["Avoid high-potassium foods while potassium is high (ICMR STW).", "Do not take potassium supplements or salt substitutes.", "Tell the doctor before restarting BP or heart medicines."], "lifestyleAndDiet": ["Low-potassium diet guided by a dietitian in CKD.", "Avoid NSAIDs."], "mdtReferrals": ["Nephrologist for dialysis or recurrent hyperkalaemia", "Dietitian", "Critical care if airway, breathing, circulation or consciousness affected (UKKA 19.4)"], "dischargeCriteria": ["Potassium below 5.5 mmol/L and stable", "Cause addressed", "Medicines reviewed"], "followUpPlan": "Repeat potassium within 1–3 days; for mild hyperkalaemia in the community repeat within 3 days (UKKA Table 5)."})
save("t34_hyperkalaemia.json", [T])
