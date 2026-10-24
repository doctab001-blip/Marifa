from h import *
T = topic(
 id="1edc4c45-d248-53d0-b551-f678f65b6742",
 title="Acute stroke (India)",
 specialty="Neurology / Emergency Medicine", authority="ICMR", pillar="Urgent Care",
 scope="Adults with suspected acute stroke in India, from first contact to stroke-unit care, built on the ICMR Stroke workflow (October 2019) with alteplase administration and timing from the AHA/ASA 2019 guideline.",
 findings=[
  "Definition, stroke types, symptoms, BEFAST warning signs, preliminary management, investigations, time-window pathway, stroke-unit care, secondary prevention, rehabilitation and follow-up schedule checked against the ICMR Stroke STW (October 2019).",
  "Alteplase dose, post-thrombolysis monitoring and blood pressure limits checked against AHA/ASA 2019 Table 9; time windows, aspirin timing and dual antiplatelet therapy checked against the ACC summary of the same guideline.",
  "ICMR and AHA/ASA give different thrombectomy windows; both are shown side by side.",
  "Not clinically reviewed."],
 unverified=[
  "The blood pressure that must be reached before alteplase (AHA/ASA Table 5) was not available in the text opened; no pre-thrombolysis threshold is stated.",
  "No source opened gives aspirin or clopidogrel doses for stroke; antiplatelet timing only is stated.",
  "Tenecteplase dosing for stroke was not found in the sources opened and is not included.",
  "Normal laboratory ranges are typical adult values."],
 summary="Stroke is an episode of neurological dysfunction caused by focal cerebral, spinal or retinal infarction or haemorrhage (ICMR STW). Ischaemic stroke follows arterial occlusion by thrombus or embolus (from carotid or intracranial atherosclerosis, small-vessel disease or atrial fibrillation); brain tissue in the ischaemic penumbra can be saved if blood flow returns quickly, which is why time to thrombolysis or thrombectomy decides outcome. Intracerebral haemorrhage, mostly from hypertensive small-vessel disease, damages tissue by mass effect and rising intracranial pressure. Subarachnoid haemorrhage, cerebral venous thrombosis and transient ischaemic attack (focal ischaemia without infarction) are other types (ICMR STW). In India hypertension, diabetes, smoking and rheumatic heart disease with atrial fibrillation are common causes; stroke often affects younger adults, and delayed arrival limits thrombolysis.",
 mechanisms=[
  "Arterial occlusion causes a core infarct surrounded by salvageable penumbra.",
  "Every minute of untreated occlusion enlarges the infarct; reperfusion is time-critical.",
  "Haemorrhage causes damage by mass effect and raised intracranial pressure.",
  "Hyperglycaemia, hypoxia, fever and extreme blood pressure worsen injury."],
 presentation={
  "symptoms": ["Sudden numbness or weakness, especially of one side", "Speech or language difficulty", "Loss of vision in one or both eyes", "Loss of balance or coordination; giddiness and vomiting", "Sudden severe headache, neck pain, altered consciousness (haemorrhage) (ICMR STW)"],
  "physicalSigns": ["Facial droop (deviation of the angle of the mouth)", "Arm drift", "Slurred speech", "Gait ataxia", "Reduced Glasgow Coma Scale score"],
  "redFlags": ["BEFAST: Balance, Eyes, Face, Arm, Speech — Time to act (ICMR STW)", "Onset within 4.5 hours: candidate for IV thrombolysis (ICMR STW)", "Sudden headache or loss of consciousness (ICMR STW)", "Worsening neurology, severe headache, vomiting or acute hypertension during alteplase: stop infusion, urgent CT (AHA/ASA Table 9)"],
  "precipitants": ["Hypertension", "Diabetes and dyslipidaemia", "Atrial fibrillation, including rheumatic heart disease", "Smoking and alcohol"]},
 differentials=[
  ("Hypoglycaemia", "Low capillary glucose; check glucose in every suspected stroke (ICMR STW)."),
  ("Seizure with post-ictal weakness", "Witnessed seizure; EEG if seizures suspected (ICMR STW)."),
  ("Subarachnoid haemorrhage", "Thunderclap headache; lumbar puncture if CT is negative (ICMR STW)."),
  ("Brain tumour or abscess", "Gradual onset; mass lesion on imaging."),
  ("Migraine with aura", "Spreading positive symptoms, history of similar attacks.")],
 criteria=[
  ("Stroke (ICMR STW)", "Neurological dysfunction caused by focal cerebral, spinal or retinal infarction or haemorrhage."),
  ("Transient ischaemic attack (ICMR STW)", "Transient focal neurological dysfunction from ischaemia without acute infarction."),
  ("IV thrombolysis window", "ICMR: 0–4.5 hours. AHA/ASA: all eligible within 3 hours of last known normal; selected patients within 4.5 hours."),
  ("Endovascular thrombectomy window", "ICMR: 4.5–24 hours by eligibility. AHA/ASA: within 6 hours (NIHSS ≥6, ASPECTS ≥6); 6–16 hours if DAWN or DEFUSE-3 criteria are met; 6–24 hours reasonable if DAWN criteria are met.")],
 ruleIn=[
  inv("advancedImaging", "Non-contrast CT brain (or MRI)", "Computed tomography (CT) or magnetic resonance imaging (MRI)", "Haemorrhage versus ischaemia", "No haemorrhage or acute lesion", "Haemorrhage excludes thrombolysis; early ischaemic changes", "Essential in all patients before treatment (ICMR STW); CT and glucose are the only tests required before alteplase unless coagulopathy is suspected (AHA/ASA summary).", "stroke", "section Investigations", ("acc19", "section Key Points, point 7")),
  inv("laboratory", "Capillary blood glucose", "Glucometer", "Hypoglycaemia mimic; hyperglycaemia", "70–140 mg/dL (random)", "Low (mimic) or high", "Determine and treat at first contact (ICMR STW).", "stroke", "section Preliminary management"),
  inv("laboratory", "Platelets, PT/INR and APTT", "Coagulation", "Bleeding risk before thrombolysis", "Platelets 150–400 ×10⁹/L; INR 0.8–1.2", "Low platelets or prolonged INR/APTT", "Essential; need not delay alteplase unless coagulopathy is suspected (AHA/ASA summary).", "stroke", "section Investigations", ("acc19", "section Key Points, point 7")),
  inv("specializedAdjunctive", "12-lead electrocardiogram (ECG) and cardiac monitoring", "ECG", "Atrial fibrillation, myocardial ischaemia", "Sinus rhythm", "Atrial fibrillation or ischaemic changes", "Initiate cardiac monitoring at first contact (ICMR STW).", "stroke", "sections Preliminary management and Investigations"),
  inv("specializedAdjunctive", "Vascular imaging (CT angiography) and echocardiogram", "CTA; echocardiography", "Large-vessel occlusion; cardiac source", "Patent vessels; normal heart", "Proximal occlusion; thrombus or valve disease", "Recommended diagnostic studies to select thrombectomy and find the cause (ICMR STW).", "stroke", "section Recommended diagnostic studies")],
 ruleOut=[
  inv("laboratory", "Electrolytes and renal function", "Sodium, potassium, creatinine", "Metabolic mimic; contrast safety", "Sodium 135–145 mEq/L; creatinine 0.6–1.2 mg/dL", "Abnormal", "Essential test (ICMR STW).", "stroke", "section Investigations"),
  inv("laboratory", "Lipid profile and carotid Doppler", "Fasting lipids; carotid ultrasound", "Atherosclerotic cause (ischaemic stroke)", "LDL below 100 mg/dL; no carotid stenosis", "Raised LDL; significant carotid stenosis", "For secondary prevention planning (ICMR STW).", "stroke", "section Investigations"),
  inv("laboratory", "Cardiac markers", "Troponin", "Concurrent myocardial ischaemia", "Below assay 99th percentile", "Raised", "Essential test (ICMR STW).", "stroke", "section Investigations")],
 management=[
  step("first-contact", "First contact (any facility)", "First 15 minutes", ["Airway, breathing, circulation; cardiac monitoring; keep SpO2 above 94%; IV access (ICMR STW).", "Check blood glucose and treat (ICMR STW).", "Record time of onset or last known normal and a family phone number (ICMR STW).", "Rapid transfer to the nearest district hospital with CT or a stroke centre with thrombolysis; notify the receiving hospital (ICMR STW)."]),
  step("code-stroke", "Code stroke at the receiving hospital", "Door to treatment", ["Rapid assessment, NIHSS, blood pressure and glucose monitoring, IV lines (ICMR STW).", "Urgent CT or MRI; decide by onset time (ICMR STW)."], [("Ischaemic, onset under 4.5 hours", ["IV alteplase if eligible, or endovascular treatment by eligibility and availability (ICMR STW)."]), ("Ischaemic, onset over 4.5 hours", ["Mechanical thrombectomy with stent retriever up to 24 hours if eligible (ICMR STW); AHA/ASA windows in diagnostic criteria."]), ("Haemorrhagic", ["Dysphagia assessment, blood pressure and glucose monitoring, IV fluids, pneumonia prevention, DVT prophylaxis, ECG monitoring (ICMR STW)."])]),
  step("after-alteplase", "After alteplase", "24 hours", ["Admit to an intensive care unit (ICU) or stroke unit (AHA/ASA Table 9).", "BP and neurological checks every 15 minutes for 2 hours, every 30 minutes for 6 hours, then hourly to 24 hours; keep BP at or below 180/105 mmHg (AHA/ASA Table 9).", "Avoid nasogastric tubes, urinary catheters and arterial lines if safely possible; repeat CT or MRI at 24 hours before antiplatelets or anticoagulants (AHA/ASA Table 9)."]),
  step("stroke-unit", "Stroke unit and secondary prevention", "Days to months", ["Control BP and diabetes, swallow assessment, DVT prophylaxis, antiplatelets (ICMR STW).", "Aspirin within 24–48 hours of onset, delayed 24 hours after alteplase; minor non-cardioembolic stroke (NIHSS 3 or less, no alteplase): aspirin plus clopidogrel within 24 hours for 21 days (AHA/ASA summary).", "Secondary prevention: aspirin (ischaemic), antihypertensives, antidiabetics, lipid-lowering drugs (ICMR STW).", "Rehabilitation: physiotherapy, speech, occupational and vocational therapy (ICMR STW)."])],
 branches=[("Ischaemic stroke within 4.5 hours", "CT excludes haemorrhage; onset or last known normal within 4.5 hours; no contraindication.")],
 regimens=[
  rx("Ischaemic stroke within 4.5 hours", "IV thrombolysis", "Acute ischaemic stroke", "Adults eligible for thrombolysis", "Alteplase", "0.9 mg/kg (maximum 90 mg); 10% as a bolus over 1 minute, the rest over 60 minutes", "IV", "Single course", "Single dose", "Adult guideline; not for children in the cited sources.", NOT_ABX, NS, NS, ["BP and neurological checks every 15 minutes for 2 hours, every 30 minutes for 6 hours, hourly to 24 hours", "Keep BP at or below 180/105 mmHg"], ["Haemorrhage on CT", "Stop the infusion for severe headache, acute hypertension, vomiting or neurological worsening (AHA/ASA)"], "aha19", "Table 9")],
 medNote="Alteplase dose and monitoring are from AHA/ASA 2019 Table 9; the ICMR workflow recommends IV tPA within 4.5 hours without a dose. Antiplatelet timing is from the ACC summary; doses were not in the sources opened. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 comparison={"title": "Reperfusion windows: ICMR vs AHA/ASA 2019", "columns": ["ICMR Stroke STW (2019)", "AHA/ASA 2019"], "rows": [
   {"parameter": "IV thrombolysis", "values": ["0–4.5 hours", "Within 3 hours for all eligible; 4.5 hours for selected patients"]},
   {"parameter": "Thrombectomy", "values": ["4.5–24 hours by eligibility (and under 4.5 hours by eligibility)", "Within 6 hours (NIHSS ≥6, ASPECTS ≥6); 6–16 hours with DAWN/DEFUSE-3; 6–24 hours with DAWN"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Acute stroke in India.", "learningObjectives": ["Recognise stroke with BEFAST and act on time.", "Select patients for thrombolysis or thrombectomy.", "Give alteplase and monitor safely."],
  "keyPoints": ["Check glucose first.", "Alteplase 0.9 mg/kg, maximum 90 mg, 10% bolus.", "Keep BP at or below 180/105 mmHg after alteplase.", "Follow up at 2 weeks, 1, 3 and 6 months (ICMR)."],
  "pitfalls": ["Delaying transfer to a CT-capable centre.", "Missing hypoglycaemia.", "Starting antiplatelets within 24 hours of alteplase.", "Feeding before swallow assessment."],
  "references": [tref("stroke", "sections What is stroke, Symptoms, Warning signs, Preliminary management, Investigations, Management, Stroke unit, Secondary prevention, Follow-up"), tref("aha19", "Table 9"), tref("acc19", "Points 4–14")]},
 nonClinical={"patientEducation": ["Learn BEFAST and call for help at once.", "Take blood pressure, diabetes and cholesterol medicines daily.", "Stop smoking."], "lifestyleAndDiet": ["Low-salt diet; healthy weight.", "Regular exercise as rehabilitation allows."], "mdtReferrals": ["Physiotherapy, speech and occupational therapy (ICMR STW)", "Vocational training (ICMR STW)", "Neurologist or stroke centre"], "dischargeCriteria": ["Swallow assessed and safe feeding plan", "Secondary prevention started", "Discharge checklist: drugs, diet, compliance, exercises, health education (ICMR STW)"], "followUpPlan": "Review at 2 weeks, 1 month, 3 months and 6 months (ICMR STW)."})
save("t11_stroke.json", [T])
