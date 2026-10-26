from hx import *
from hxdeep import node, algo, explain, bq, deepen
TITLE = "Status epilepticus in children (India)"
PH = "section Prehospital management"; FL = "section First-line (benzodiazepines)"; SL = "section Second-line"; RF = "section Refractory SE"
PD = "This is the paediatric dose (IAP STG 2022)."
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Paediatrics / Paediatric Neurology / Emergency Medicine / Critical Care", authority="ICMR", pillar="Urgent Care",
 scope="Convulsive status epilepticus (SE) in infants and children (beyond the newborn period) in India: definitions, prehospital rescue medicines, time-based hospital algorithm, intensive care unit (ICU) treatment of refractory SE, supportive care and investigations, built on the IAP Standard Treatment Guidelines (2022) with the ICMR AES in Children STW. Neonatal seizures and adult SE have separate topics.",
 findings=["ILAE timings (t1 5 minutes, t2 30 minutes for convulsive SE), causes, prehospital buccal or intranasal midazolam 0.1–0.2 mg/kg, lorazepam and rectal diazepam doses, first-line IV doses with maximums, second-line phenytoin, fosphenytoin, valproate, phenobarbitone and levetiracetam doses and rates, refractory midazolam, phenobarbitone, propofol and thiopentone regimens, investigations and monitoring checked against IAP STG 2022.", "Matching first- and second-line doses (lorazepam 0.1 mg/kg, midazolam 0.2 mg/kg, phenytoin 20 mg/kg at 1 mg/kg/min) checked against the ICMR AES in Children STW (2019).", "Not clinically reviewed."],
 unverified=["IAP does not rank second-line drugs; phenytoin is listed first by ICMR and is marked preferred.", "Calcium and pyridoxine are not addressed in the IAP chapter.", "Maintenance doses after loading are not given."],
 summary="Status epilepticus is the commonest neurological emergency in children. A convulsive seizure lasting 5 minutes or longer is treated as SE, because seizures beyond 30 minutes are likely to cause lasting neuronal injury (ILAE, quoted by IAP). In Indian children, common causes are febrile seizures, neuroinfection (meningitis, encephalitis, neurocysticercosis), poor adherence in known epilepsy, metabolic derangements and trauma. Treatment is time-based: rescue benzodiazepine at home or at first contact, IV benzodiazepine at 5–20 minutes, a second-line drug at 20–40 minutes, and ICU-based anaesthetic infusions for refractory SE, while correcting hypoglycaemia and finding the cause.",
 mechanisms=["Failure of seizure-termination mechanisms and excess excitation sustain seizures.", "GABA-A receptors are internalised over time, so benzodiazepines work less well the longer SE lasts.", "Prolonged seizures cause hypoxia, acidosis, hyperthermia and excitotoxic neuronal injury.", "Underlying causes (infection, metabolic, structural) drive recurrence."],
 presentation={"symptoms": ["Continuous convulsion 5 minutes or more", "Repeated seizures without regaining consciousness"], "physicalSigns": ["Tonic-clonic movements, eye deviation", "Reduced consciousness between seizures", "Fever, neck stiffness (neuroinfection)", "Signs of trauma or raised intracranial pressure"], "redFlags": ["Seizure continuing after two benzodiazepine doses: second-line drug now", "Seizure beyond 60 minutes or needing anaesthetic drugs: PICU (IAP 2022)", "Hypoglycaemia", "Signs of raised intracranial pressure"], "precipitants": ["Fever and febrile seizures (IAP 2022)", "Neuroinfection (IAP 2022)", "Missed antiseizure medicines in known epilepsy (IAP 2022)", "Electrolyte or glucose derangement, trauma, toxins (IAP 2022)"]},
 differentials=[("Psychogenic non-epileptic events", "Eyes closed, resisting opening, preserved awareness."), ("Rigors", "Shivering with fever, no loss of awareness."), ("Dystonia from drugs", "Sustained postures with metoclopramide or antipsychotics."), ("Syncope with brief jerks", "Short duration, rapid recovery.")],
 criteria=[("Convulsive SE (ILAE, IAP 2022)", "Seizure lasting 5 minutes or more (t1); long-term consequences likely after 30 minutes (t2)."), ("Focal SE with impaired consciousness (IAP 2022)", "t1 10 minutes; t2 over 60 minutes."), ("Refractory SE (IAP 2022)", "Seizures persisting after benzodiazepine and a second-line drug."), ("Super-refractory SE (IAP 2022)", "Persisting 24 hours or more after anaesthetic treatment starts.")],
 ruleIn=[
  inv("laboratory", "Capillary glucose", "Bedside glucose", "Hypoglycaemia", "70–140 mg/dL", "Low", "Check at once; give glucose if low (IAP 2022).", "iapse", PH),
  inv("laboratory", "Electrolytes, calcium, magnesium, blood gas", "Blood", "Metabolic cause", "Sodium 135–145 mmol/L; calcium 8.5–10.5 mg/dL", "Hyponatraemia, hypocalcaemia, acidosis", "Treat any abnormality (IAP 2022).", "iapse", "section Supportive care"),
  inv("laboratory", "Blood count and blood culture (if febrile)", "Blood", "Infection", "No growth", "Leucocytosis; positive culture", "Fever: blood culture (IAP 2022).", "iapse", "section Supportive care"),
  inv("laboratory", "CSF examination", "Lumbar puncture once stable", "Neuroinfection", "Normal cells, protein and glucose", "Pleocytosis, raised protein, low glucose", "For suspected neuroinfection (IAP 2022).", "iapse", "section Investigations"),
  inv("advancedImaging", "Computed tomography (CT) or magnetic resonance imaging (MRI) brain", "Neuroimaging", "Structural cause", "Normal", "Lesion, oedema, bleed, neurocysticercosis", "CT if unstable; MRI preferred (IAP 2022).", "iapse", "section Investigations")],
 ruleOut=[inv("specializedAdjunctive", "Electroencephalogram (EEG)", "Bedside EEG", "Non-convulsive SE", "No ongoing seizure activity", "Electrographic seizures", "Refractory SE in PICU (IAP 2022).", "iapse", RF)],
 management=[
  step("home", "Prehospital", "0–5 minutes", ["Recovery position; rescue benzodiazepine (see medicines) (IAP 2022).", "Check glucose; ambulance with oxygen (IAP 2022)."]),
  step("first", "First line", "5–20 minutes", ["Airway, oxygen, IV access, glucose (IAP 2022).", "IV benzodiazepine; repeat once if seizures continue (IAP 2022)."]),
  step("second", "Second line", "20–40 minutes", ["Load one second-line drug (see medicines) (IAP 2022; ICMR AES STW).", "Avoid valproate if liver disease or inborn error suspected; avoid phenobarbitone without ventilation backup (IAP 2022).", "Known epilepsy on that drug: give half the loading dose (IAP 2022)."]),
  step("refractory", "Refractory SE", "From 40–60 minutes", ["PICU: midazolam infusion, or high-dose phenobarbitone, propofol or thiopentone with EEG (IAP 2022).", "Treat raised ICP with mannitol or 3% saline; monitor rhabdomyolysis, arrhythmia and sepsis (IAP 2022)."]),
  step("cause", "Find the cause", "Throughout", ["Glucose, electrolytes, infection, imaging, CSF (IAP 2022).", "Teach caregivers first aid and rescue medicine (IAP 2022)."])],
 branches=[("Prehospital rescue", "Seizure 5 minutes or more at home or before IV access."), ("Hospital first line", "Ongoing seizure with IV access."), ("Second line", "Seizure continuing after two benzodiazepine doses."), ("Refractory SE", "Seizure continuing after a second-line drug (PICU).")],
 regimens=[
  rx("Prehospital rescue", "Rescue benzodiazepine", "Seizure 5 minutes or more", "Children", "Midazolam (buccal, intranasal)", "0.1–0.2 mg/kg (2 puffs per 5 kg nasal spray)", "Buccal or intranasal", "Once; may repeat once", "Single dose", PD, NOT_ABX, "No adjustment.", "No adjustment.", ["Breathing, colour"], ["Respiratory depression"], "iapse", PH, sel="one-of", pref=True),
  rx("Prehospital rescue", "Rescue benzodiazepine", "Seizure 5 minutes or more", "Children", "Diazepam (rectal)", "0.5 mg/kg", "Rectal", "Once", "Single dose", PD, NOT_ABX, "No adjustment.", "No adjustment.", ["Breathing"], ["Respiratory depression"], "iapse", PH, sel="one-of", pref=False, use="Midazolam unavailable."),
  rx("Hospital first line", "IV benzodiazepine", "Ongoing seizure", "Children", "Lorazepam", "0.1 mg/kg (maximum 4 mg)", "IV", "Once; repeat once after 5–10 minutes", "Up to 2 doses", PD, NOT_ABX, "No adjustment.", "No adjustment.", ["Respiratory rate, SpO2"], ["Respiratory depression"], "iapse", FL, sel="one-of", pref=True),
  rx("Hospital first line", "IV benzodiazepine", "Ongoing seizure", "Children", "Midazolam", "0.15–0.2 mg/kg (maximum 5 mg)", "IV (or IM if no access)", "Once; repeat once", "Up to 2 doses", PD, NOT_ABX, "No adjustment.", "No adjustment.", ["Respiratory rate, SpO2"], ["Respiratory depression"], "iapse", FL, sel="one-of", pref=False, use="Lorazepam unavailable or no IV access (IM)."),
  rx("Hospital first line", "IV benzodiazepine", "Ongoing seizure", "Children", "Diazepam", "0.2–0.3 mg/kg (maximum 10 mg)", "IV", "Once; repeat once", "Up to 2 doses", PD, NOT_ABX, "No adjustment.", "No adjustment.", ["Respiratory rate"], ["Respiratory depression"], "iapse", FL, sel="one-of", pref=False, use="Lorazepam and midazolam unavailable."),
  rx("Second line", "Second-line antiseizure medicine", "Benzodiazepine-resistant SE", "Children", "Phenytoin", "20 mg/kg in normal saline at 1 mg/kg/min; may repeat 10 mg/kg", "IV", "Loading", "Maintenance after 8–12 hours", PD, NOT_ABX, "No adjustment for loading.", "Caution in liver failure.", ["Heart rate, electrocardiogram (ECG) and BP during infusion"], ["Bradycardia, heart block", "Do not mix with dextrose"], "iapse", SL, sel="one-of", pref=True, extra_adj=("Fosphenytoin 20 mg PE/kg at 3 mg/kg/min is an alternative (IAP 2022).",)),
  rx("Second line", "Second-line antiseizure medicine", "Benzodiazepine-resistant SE", "Children", "Levetiracetam", "20–60 mg/kg at 5 mg/kg/min", "IV", "Loading", "Maintenance after 8–12 hours", PD, NOT_ABX, "Reduce maintenance in renal impairment.", "No adjustment; preferred in liver dysfunction.", ["Seizure control, behaviour"], ["Hypersensitivity"], "iapse", SL, sel="one-of", pref=False, use="Liver dysfunction or suspected metabolic disease, or cardiac concerns with phenytoin."),
  rx("Second line", "Second-line antiseizure medicine", "Benzodiazepine-resistant SE", "Children", "Sodium valproate", "20–40 mg/kg", "IV", "Loading", "Maintenance after 8–12 hours", PD, NOT_ABX, "No adjustment.", "Avoid in liver disease.", ["Liver tests, ammonia"], ["Liver disease", "Suspected inborn error of metabolism", "Under 2 years with unknown cause (caution)"], "iapse", SL, sel="one-of", pref=False, use="Phenytoin unsuitable and liver normal."),
  rx("Second line", "Second-line antiseizure medicine", "Benzodiazepine-resistant SE", "Children", "Phenobarbitone", "20 mg/kg in normal saline at 2 mg/kg/min", "IV", "Loading", "Maintenance after 8–12 hours", PD, NOT_ABX, "Caution in renal impairment.", "Caution in liver failure.", ["Respiratory depression, BP"], ["No ventilation backup (IAP 2022)"], "iapse", SL, sel="one-of", pref=False, use="Ventilation available and other options unsuitable."),
  rx("Refractory SE", "Anaesthetic infusion", "Refractory SE", "Children in PICU", "Midazolam (infusion)", "0.2 mg/kg bolus, then 1 mcg/kg/min, increase by 1 mcg/kg/min every 5–10 minutes to maximum 30 mcg/kg/min", "IV infusion", "Continuous", "Taper after 24 hours seizure-free by 1 mcg/kg/min every 3 hours", PD, NOT_ABX, "Accumulates in renal failure.", "Accumulates in liver failure.", ["EEG, BP, ventilation"], ["Hypotension"], "iapse", RF, sel="one-of", pref=True),
  rx("Refractory SE", "Anaesthetic infusion", "Refractory SE", "Children in PICU", "Thiopentone", "5 mg/kg bolus, then 3–5 mg/kg/hour to burst suppression", "IV infusion", "Continuous", "Taper after 24 hours seizure-free", PD, NOT_ABX, "No adjustment stated.", "Prolonged effect in liver failure.", ["EEG, BP, need for inotropes"], ["Hypotension", "Ventilated patients only"], "iapse", RF, sel="one-of", pref=False, use="Midazolam infusion fails."),
  rx("Refractory SE", "Anaesthetic infusion", "Refractory SE", "Children in PICU", "Propofol", "1–2 mg/kg load, then 1–2 mg/kg/hour (maximum 5 mg/kg/hour)", "IV infusion", "Continuous", "Short-term", PD, NOT_ABX, "No adjustment.", "No adjustment.", ["Lactate, triglycerides, CK (propofol infusion syndrome)"], ["Prolonged high-dose use"], "iapse", RF, sel="one-of", pref=False, use="Midazolam fails; short-term use with monitoring.")],
 medNote="Doses are from IAP STG 2022 (status epilepticus), consistent with the ICMR AES in Children STW. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "Childhood status epilepticus in India.", "learningObjectives": ["Treat at 5 minutes.", "Use correct benzodiazepine and second-line doses.", "Escalate refractory SE to PICU."],
  "keyPoints": ["Buccal or intranasal midazolam 0.1–0.2 mg/kg at home.", "IV lorazepam 0.1 mg/kg (maximum 4 mg); repeat once.", "Then phenytoin 20 mg/kg or levetiracetam 20–60 mg/kg.", "Check glucose early."],
  "pitfalls": ["More than two benzodiazepine doses.", "Valproate in suspected metabolic or liver disease.", "Phenytoin in dextrose.", "Missing non-convulsive SE after movements stop."],
  "references": [tref("iapse", "sections Definition, Etiology, Prehospital management, First-line, Second-line, Refractory SE, Supportive care, Investigations"), tref("aes", "section Seizure control")]},
 nonClinical={"patientEducation": ["Learn seizure first aid: recovery position, time the seizure, give rescue medicine at 5 minutes (IAP 2022).", "Keep antiseizure medicines regular."], "lifestyleAndDiet": ["Regular sleep; supervise swimming and heights."], "mdtReferrals": ["Paediatric neurologist", "PICU for refractory SE"], "dischargeCriteria": ["Seizure-free and back to baseline", "Cause identified and treated", "Rescue medicine plan given"], "followUpPlan": "Neurology review in 2–4 weeks; neurodevelopmental follow-up."})
# Depth standard (2026-10-25)
T["lastReviewed"] = "2026-10-25"
EA = T["evidenceAudit"]
EA["unverifiedSections"] = [u for u in EA["unverifiedSections"] if not (u.startswith("Maintenance doses after loading") or u.startswith("Calcium and pyridoxine"))]
EA["unverifiedSections"].insert(1, "Maintenance doses after loading are taken from the US labels (Drugs.com), dextrose from the BC status epilepticus guideline (2011) and pyridoxine from the LHSC NICU manual, because the IAP chapter gives none. Calcium and magnesium replacement follows the electrolyte topics.")
P = T["medicationPlan"]; R = P["regimens"]
def setadj(r, prefix, text):
    r["adjustments"] = [text if a.startswith(prefix) else a for a in r["adjustments"]]
for r in R:
    n = r["genericName"]
    if n == "Phenytoin":
        r["duration"] = "Then maintenance 4–8 mg/kg/day orally or IV in divided doses every 6–8 hours (label, Drugs.com); check levels"
    if n == "Levetiracetam":
        r["duration"] = "Then maintenance: 6 months–under 4 years 10 mg/kg twice daily (maximum 25 mg/kg twice daily); 4–16 years 10 mg/kg twice daily (maximum 30 mg/kg twice daily) (label, Drugs.com)"
    if n == "Sodium valproate":
        r["duration"] = "Then 10–15 mg/kg/day, increasing to effect, maximum 60 mg/kg/day; IV equivalent to oral dose over 60 minutes (label, Drugs.com)"
        r["contraindications"] = ["Liver disease, suspected metabolic or POLG mitochondrial disease; under 2 years: high risk of fatal hepatotoxicity (label)"]
    if n == "Phenobarbitone":
        r["duration"] = "Then maintenance 3–6 mg/kg/day orally, or 5–15 mg/kg/day IV or IM (label, Drugs.com)"
P["branches"].append({"label": "Correct the cause", "entryCriteria": "Hypoglycaemia at any stage, or infant under 2 years with refractory seizures."})
R.append(rx("Correct the cause", "Glucose", "Bedside glucose below 3 mmol/L", "Children", "Dextrose 10%", "5 mL/kg", "IV", "Bolus; recheck glucose", "Until glucose normal",
  "This is the paediatric dose (BC guideline).", NOT_ABX, "No adjustment.", "No adjustment.", ["Glucose every 15–30 minutes after bolus"], ["Avoid hyperglycaemia; use 10%, not 25% or 50%, in children"], "bcmjse", "section Initial management"))
R.append(rx("Correct the cause", "Vitamin", "Infant under 2 years with refractory seizures (possible pyridoxine dependency)", "Infants", "Pyridoxine", "100 mg", "IV over 10–15 minutes (or oral)", "Once; specialist may repeat", "Maintenance 50–100 mg orally if responsive",
  "This is the infant dose (LHSC).", NOT_ABX, "No adjustment.", "No adjustment.", ["EEG if available; watch for apnoea and hypotonia after IV dose"], ["None in this setting"], "lhscpyr", "sections Dose, Administration"))
T["pathophysiology"]["summary"] += " Every minute of delay matters: benzodiazepines given within 5–10 minutes stop most seizures, while those given after 30 minutes often fail, which is why rescue medicine at home and fixed time targets in hospital save brain."
T["presentation"]["symptoms"] += ["Eye deviation, nystagmus or subtle twitching after visible jerks stop (non-convulsive SE)", "Fever, vomiting or headache before the seizure (neuroinfection)"]
T["differentials"] = [{"condition": c, "distinguishingFeatures": f} for c, f in [
 ("Psychogenic non-epileptic events", "Eyes closed and resisting opening, side-to-side head movement, preserved awareness; video EEG settles it."),
 ("Rigors", "Shivering with high fever and preserved awareness, no post-ictal state; observation and normal consciousness settle it."),
 ("Dystonia from drugs", "Sustained twisting postures after metoclopramide or antipsychotics with intact awareness; drug history and response to an anticholinergic settle it."),
 ("Syncope with brief jerks", "Pallor and a trigger, a few jerks lasting seconds and rapid recovery; history and ECG settle it."),
 ("Hypoglycaemia", "Sweating, drowsiness and seizure in a fasting, ill or diabetic child; bedside glucose settles it."),
 ("Raised intracranial pressure with posturing", "Decerebrate or decorticate posturing with bradycardia and hypertension, not seizures; CT and pupil examination settle it.")]]
T["teaching"]["references"] += [tref("bcmjse", "section Initial management"), tref("lhscpyr", "section Dose")]

ALG = algo("se-children-pathway", "Convulsive status epilepticus in children: time-based treatment", "manage", "iapse", "sections Prehospital management, First-line, Second-line, Refractory SE", [
 node("start", "start", "Convulsive seizure lasting 5 minutes or more", [("abc", None)]),
 node("abc", "action", "Airway, oxygen, recovery position; check glucose (dextrose 10% 5 mL/kg if below 3 mmol/L)", [("iv", None)]),
 node("iv", "decision", "IV access available?", [("ivb", "Yes"), ("buccal", "No")]),
 node("buccal", "action", "Buccal or intranasal midazolam 0.1–0.2 mg/kg, or rectal diazepam 0.5 mg/kg", [("stop1", None)]),
 node("stop1", "decision", "Seizure stopped within 5–10 minutes?", [("cause1", "Yes"), ("ivb2", "No")]),
 node("cause1", "outcome", "Observe; find the cause (glucose, electrolytes, infection, imaging)"),
 node("ivb2", "outcome", "Secure IV or IO access; one further benzodiazepine, then second-line drug at 20 minutes"),
 node("ivb", "action", "IV lorazepam 0.1 mg/kg (maximum 4 mg); repeat once after 5–10 minutes", [("stop2", None)]),
 node("stop2", "decision", "Still seizing after two benzodiazepine doses?", [("second", "Yes"), ("cause2", "No")]),
 node("cause2", "outcome", "Find and treat the cause; monitor for non-convulsive seizures"),
 node("second", "action", "Phenytoin 20 mg/kg, levetiracetam 20–60 mg/kg, valproate 20–40 mg/kg or phenobarbitone 20 mg/kg", [("stop3", None)]),
 node("stop3", "decision", "Still seizing after the second-line drug?", [("picu", "Yes"), ("maint", "No")]),
 node("picu", "outcome", "Refractory SE: PICU, midazolam infusion (or thiopentone, propofol) with EEG; pyridoxine 100 mg IV if under 2 years"),
 node("maint", "outcome", "Start maintenance after 8–12 hours; treat the cause")])

VIG = "Ishaan, a 2-year-old boy weighing 12 kg, is brought to the emergency department after convulsing for 15 minutes at home. His mother gave no rescue medicine. He has had fever for 2 days. He is still having generalised tonic-clonic movements, SpO2 is 90% on air, and bedside glucose is 4.6 mmol/L. IV access is obtained on the second attempt."

EXP = [
 explain("pathophysiology", "Why benzodiazepines work less with time", "What changes in the brain as a seizure continues?",
  "A seizure normally stops because inhibitory GABA-A mechanisms and other termination processes overcome excitation. In status epilepticus these fail: within minutes, synaptic GABA-A receptors are internalised while NMDA and AMPA receptors move to the cell surface, so inhibition weakens and excitation strengthens. This explains why benzodiazepines are most effective when given early and lose much of their effect after 20–30 minutes. Prolonged seizures cause hypoxia, lactic acidosis, hyperthermia, rhabdomyolysis and excitotoxic neuronal death, especially in the hippocampus. Underlying causes in Indian children — fever, neuroinfection, neurocysticercosis, missed medicines and metabolic disturbances — drive recurrence and outcome."),
 explain("signs-symptoms", "Recognise SE and its causes", "What should you look for during and after the seizure?",
  "Treat any convulsive seizure lasting 5 minutes, or repeated seizures without recovery in between, as status epilepticus. While treating, look for clues to the cause: fever and neck stiffness or a bulging fontanelle (meningitis or encephalitis), signs of raised intracranial pressure, trauma, a rash, a known epilepsy with missed doses, or a toxin. After visible jerks stop, check that consciousness improves; persistent eye deviation, nystagmus or subtle twitching with poor responsiveness suggests non-convulsive status epilepticus and needs EEG. Rigors, dystonia from drugs, syncope and psychogenic events can mimic seizures."),
 explain("investigations", "Glucose first, then the cause", "Which tests matter in the first hour?",
  "Check capillary glucose immediately and treat a value below 3 mmol/L with 10% dextrose 5 mL/kg. Send electrolytes, calcium, magnesium and a blood gas; correct hyponatraemia and hypocalcaemia, which can sustain seizures. In febrile children, take blood cultures and consider lumbar puncture once the child is stable and there is no contraindication. Image with CT if the child is unstable or has focal signs, and MRI when available. Antiseizure drug levels help in known epilepsy. Continuous EEG is used in the intensive care unit for refractory SE and to detect non-convulsive seizures after anaesthetic infusions."),
 explain("management", "Treat by the clock", "How do you treat paediatric SE step by step?",
  "At 5 minutes, give a rescue benzodiazepine: buccal or intranasal midazolam 0.1–0.2 mg/kg or rectal diazepam 0.5 mg/kg if there is no IV access, or IV lorazepam 0.1 mg/kg (maximum 4 mg), repeated once after 5–10 minutes. Do not give more than two benzodiazepine doses. If seizures continue, load one second-line drug: phenytoin 20 mg/kg in saline at 1 mg/kg/min, levetiracetam 20–60 mg/kg, valproate 20–40 mg/kg (avoid in liver or metabolic disease and under 2 years if possible) or phenobarbitone 20 mg/kg. Refractory SE needs intensive care with a midazolam infusion from 1 microgram/kg/min, EEG, and pyridoxine 100 mg IV in infants under 2 years.")]

QS = [
 bq("q1", "A 2-year-old boy weighing 12 kg has been convulsing for 15 minutes. He received IV lorazepam 1.2 mg 5 minutes ago and a second dose of 1.2 mg is now due. Glucose is 4.6 mmol/L and he has fever for 2 days. Airway and oxygenation are being supported.", "If he is still seizing 5–10 minutes after the second lorazepam dose, what is the next step?",
  [("A third dose of lorazepam", "More than two benzodiazepine doses increase respiratory depression without benefit (IAP 2022)."),
   ("Rectal paracetamol and observation", "Treating fever is reasonable but does not stop status epilepticus."),
   ("Thiopentone infusion on the ward", "Anaesthetic infusions are for refractory SE in intensive care, after a second-line drug."),
   ("Load a second-line drug, such as levetiracetam 20–60 mg/kg or phenytoin 20 mg/kg", "Correct. After two benzodiazepine doses, a second-line drug is given (IAP 2022)."),
   ("Lumbar puncture now", "LP is delayed until seizures stop and the child is stable.")],
  "D", "Escalate after benzodiazepine failure.", "Two benzodiazepine doses, then one second-line drug."),
 bq("q2", "An 18-month-old girl with developmental delay is in the PICU with status epilepticus. She has received two doses of lorazepam, phenytoin 20 mg/kg and a midazolam infusion, and seizures continue on EEG. Glucose, sodium and calcium are normal and CSF is normal. She has no fever.", "Which additional treatment should be given?",
  [("Pyridoxine 100 mg IV with EEG monitoring", "Correct. In infants under 2 years with refractory seizures, a pyridoxine trial is given (LHSC)."),
   ("Sodium valproate 40 mg/kg", "Valproate carries a high risk of fatal hepatotoxicity in children under 2, especially with possible metabolic disease (label)."),
   ("Further lorazepam", "Benzodiazepine boluses are not repeated beyond two doses (IAP 2022)."),
   ("Oral carbamazepine", "Oral drugs have no role in refractory status epilepticus."),
   ("Stop the midazolam infusion", "Stopping the infusion while seizures continue would allow seizures to worsen.")],
  "A", "Remember treatable metabolic causes in infants.", "Infant with refractory SE: give pyridoxine."),
 bq("q3", "A 7-year-old boy with known epilepsy on oral phenytoin presents in status epilepticus after missing doses for a week. He has had two IV doses of lorazepam and is still seizing. He weighs 20 kg. His liver function is normal and he has no fever.", "What is the most appropriate second-line approach?",
  [("Phenytoin 20 mg/kg as usual", "Patients already on the drug receive half the loading dose to avoid toxicity (IAP 2022)."),
   ("No second-line drug, as he is already on phenytoin", "He is still seizing and needs a second-line drug now."),
   ("Phenytoin 10 mg/kg (half load) or a different second-line drug such as levetiracetam", "Correct. Known epilepsy on that drug: give half the loading dose, or choose another drug (IAP 2022)."),
   ("Propofol infusion on the ward", "Propofol is an intensive care treatment for refractory status epilepticus."),
   ("Diazepam infusion", "Further benzodiazepines are not recommended after two doses.")],
  "C", "Adjust loading in children already on an antiseizure medicine.", "Already on phenytoin: half load or switch to another second-line drug.")]

T = deepen(T, [ALG], VIG, EXP, QS)

# Reviewer fixes (independent check, 25 Oct 2026)
EA["unverifiedSections"].insert(2, "IAP gives no limit on the number of benzodiazepine doses; giving no more than two is usual practice. The age criterion for a pyridoxine trial (infants under 2 years) is usual practice; the dose is from LHSC.")
def setadj(r, prefix, text):
    r["adjustments"] = [text if a.startswith(prefix) else a for a in r["adjustments"]]
for r in R:
    n = r["genericName"]
    if n == "Lorazepam":
        r["frequency"] = "Once; repeat once after 5–10 minutes if still seizing (usual practice)"
    if n == "Phenytoin":
        r["dose"] = "20 mg/kg in normal saline at 1 mg/kg/min (not faster than 50 mg/min, label); may repeat 10 mg/kg"
        r["duration"] = "Then maintenance after 8–12 hours (IAP); oral maintenance 4–8 mg/kg/day in divided doses (oral label, Drugs.com); check levels"
    if n == "Levetiracetam":
        r["dose"] = "20–60 mg/kg at 5 mg/kg/min (maximum 3 g, usual practice)"
        r["duration"] = "Then maintenance: 1–under 6 months 7 mg/kg twice daily (maximum 21 mg/kg twice daily); 6 months–under 4 years 10 mg/kg twice daily (maximum 25 mg/kg twice daily); 4–16 years 10 mg/kg twice daily (maximum 30 mg/kg twice daily, not above 3000 mg/day) (label, Drugs.com)"
        setadj(r, "CKD:", "CKD: The label gives no paediatric renal adjustment; reduce maintenance by creatinine clearance with specialist advice.")
    if n == "Sodium valproate":
        r["duration"] = "Then maintenance; enteral dosing 10–15 mg/kg/day increasing to effect, maximum 60 mg/kg/day (label, for 10 years and over)"
    if n == "Phenobarbitone":
        r["duration"] = "Then maintenance: 4–6 mg/kg/day for 7–10 days to a level of 10–15 micrograms/mL, or 10–15 mg/kg/day IM or IV (label, Drugs.com)"
    if n == "Pyridoxine":
        r["indication"] = "Infant under 2 years with refractory seizures, possible pyridoxine dependency (age criterion: usual practice)"
        setadj(r, "Paediatric:", "Paediatric: 100 mg per dose IV over 10–15 minutes or orally; maintenance 50–100 mg orally (LHSC, for pyridoxine-dependent seizures).")
R.append(rx("Refractory SE", "Anaesthetic infusion", "Refractory SE where infusions are unavailable or as an adjunct", "Children", "Phenobarbitone (high dose)", "5–10 mg/kg boluses every 30 minutes, up to 120 mg/kg over 24 hours; maintenance up to 40 mg/kg/day", "IV", "Every 30 minutes as boluses", "Until seizures controlled; ventilation needed",
  "This is the paediatric dose (IAP STG 2022).", NOT_ABX, "Caution in renal impairment.", "Caution in liver failure.", ["Ventilation, BP, levels"], ["Use only with ventilation and BP support available"], "iapse", "section Refractory SE", sel="one-of", pref=False, use="Midazolam infusion ineffective or unavailable, in PICU."))
R.append(rx("Refractory SE", "Enteral adjunct", "Refractory SE while tapering anaesthetic agents", "Children", "Topiramate", "2–5 mg/kg enteral loading, increase by 5–10 mg/kg/day to a maximum of 25 mg/kg/day", "Orogastric or nasogastric", "Daily in divided doses", "While tapering infusions",
  "This is the paediatric dose (IAP STG 2022).", NOT_ABX, "Reduce dose in renal impairment.", "Caution in liver impairment.", ["Acidosis, sedation"], ["Metabolic acidosis, kidney stones"], "iapse", "section Refractory SE"))
T["presentation"]["redFlags"][1] = "Unstable at the second-line stage or refractory SE: PICU (IAP 2022)"
for m in T["clinicalManagement"]:
    if m["id"] == "second":
        m["actions"][2] = "Already on that drug: at up to phenytoin 6, phenobarbitone 5, valproate 30 or levetiracetam 30 mg/kg/day, give a half dose; at larger doses avoid loading and give the maintenance dose (IAP 2022)."
    if m["id"] == "refractory":
        m["actions"][0] = "PICU with EEG: midazolam infusion, or high-dose phenobarbitone boluses 5–10 mg/kg every 30 minutes (up to 120 mg/kg/24 hours), propofol or thiopentone; enteral topiramate while tapering (IAP 2022)."
for q in T["teaching"]["boardQuestions"]:
    if q["id"] == "q1":
        for o in q["options"]:
            if o["id"] == "A": o["explanation"] = "Giving more than two benzodiazepine doses increases respiratory depression without benefit (usual practice)."
    if q["id"] == "q3":
        q["vignette"] = "A 7-year-old boy with known epilepsy takes oral phenytoin 5 mg/kg/day with good adherence, confirmed by his mother. He presents in status epilepticus during a febrile illness and is still seizing after two IV doses of lorazepam. He weighs 20 kg. His liver function is normal."
        for o in q["options"]:
            if o["id"] == "A": o["explanation"] = "IAP advises a half dose when a child already takes up to 6 mg/kg/day of phenytoin, not a full 20 mg/kg load."
            if o["id"] == "C":
                o["text"] = "Phenytoin at half dose (10 mg/kg) or a different second-line drug such as levetiracetam"
                o["explanation"] = "Correct. On phenytoin up to 6 mg/kg/day, IAP advises a half dose; switching to another second-line drug is also reasonable (IAP 2022)."
N = {n["id"]: n for n in T["algorithms"][0]["nodes"]}
N["ivb"]["text"] = "IV lorazepam 0.1 mg/kg (maximum 4 mg); one repeat after 5–10 minutes"
N["picu"]["text"] = "Refractory SE: PICU with EEG; midazolam infusion, high-dose phenobarbitone, thiopentone or propofol; pyridoxine 100 mg IV if under 2 years (LHSC dose)"

save("t54_se_children.json", [T])
