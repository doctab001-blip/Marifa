from hx import *
from hxdeep import node, algo, explain, bq, deepen
TITLE = "Acute encephalitis syndrome in children (India)"
A = "section Step I (ABC and stabilization)"; SZ = "section Seizure control"; ICP = "section Raised ICP management"; EM = "section Step III (empiric treatment)"
PD = "This is the paediatric dose (ICMR STW)."
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Paediatrics / Paediatric Neurology / Infectious Diseases / Critical Care", authority="ICMR", pillar="Urgent Care",
 scope="Children with acute encephalitis syndrome (AES) in India: definition, stabilisation, seizure and raised intracranial pressure (ICP) control, empiric ceftriaxone, acyclovir and artesunate, investigations and referral, built on the ICMR STW for AES in Children (October 2019). Adult JE/AES is covered in the Japanese encephalitis topic.",
 findings=["Definition, red flags, lumbar puncture contraindications, intubation criteria, 20 mL/kg fluid bolus, first- and second-line seizure drugs with doses, refractory status options, mannitol and 3% saline doses, PaCO2 and sodium targets, empiric ceftriaxone, acyclovir by age with stopping rules, artesunate dosing, investigations, supportive care and discharge criteria checked against the ICMR AES STW (October 2019).", "Not clinically reviewed."],
 unverified=["Scrub typhus is a major cause of AES in India but is not in the ICMR AES workflow; doxycycline or azithromycin are not dosed here (see Scrub typhus topic).", "Phenytoin, valproate and levetiracetam as alternatives are listed without ranking when no ICU is available; the first-listed is marked preferred."],
 summary="Acute encephalitis syndrome is acute fever (up to 5–7 days) with altered sensorium and/or new-onset seizures, excluding simple febrile seizures (ICMR STW). In India the main causes are Japanese encephalitis, scrub typhus, dengue, cerebral malaria, herpes simplex virus (HSV), bacterial meningitis and tuberculosis, with autoimmune encephalitis increasingly recognised. Brain inflammation and oedema raise intracranial pressure, and seizures and shock add secondary injury. Outcome depends on rapid stabilisation, seizure and ICP control, and early empiric treatment of the treatable causes (bacterial meningitis, HSV and malaria) while tests are pending.",
 mechanisms=["Viral, bacterial or parasitic invasion inflames the brain parenchyma and meninges.", "Cerebral oedema raises intracranial pressure and risks herniation.", "Seizures increase cerebral metabolic demand and worsen injury.", "Shock, hypoxia and hypoglycaemia cause secondary brain injury."],
 presentation={"symptoms": ["Fever up to 5–7 days (ICMR STW)", "Altered sensorium, irritability, drowsiness", "New-onset seizures", "Headache, vomiting"], "physicalSigns": ["Reduced Glasgow Coma Scale (GCS)", "Neck stiffness, focal deficits", "Abnormal pupils or posturing", "Rash or eschar (scrub typhus), pallor, splenomegaly (malaria)"], "redFlags": ["GCS below 8 (ICMR STW)", "Abnormal breathing pattern (ICMR STW)", "Shock not responding to fluid bolus (ICMR STW)", "Decerebrate or decorticate posturing (ICMR STW)", "Seizures persisting despite benzodiazepine and phenytoin (ICMR STW)"], "precipitants": ["Monsoon season (JE, scrub typhus, dengue)", "Endemic areas (eastern Uttar Pradesh, Bihar, Assam)", "Unvaccinated against JE"]},
 differentials=[("Simple febrile seizure", "Brief generalised seizure, rapid full recovery; excluded from AES (ICMR STW)."), ("Bacterial meningitis", "CSF neutrophils, low glucose, positive culture."), ("Cerebral malaria", "Positive smear or RDT."), ("Toxic or metabolic encephalopathy", "Hypoglycaemia, electrolyte disorder, poisoning history.")],
 criteria=[("AES (ICMR STW)", "Acute onset fever (5–7 days or less) with altered sensorium and/or new-onset seizures, excluding simple febrile seizures."), ("Intubation (ICMR STW)", "GCS below 8, impaired airway reflexes, abnormal respiration, raised ICP, SpO2 below 92% despite high-flow oxygen, or fluid-refractory shock."), ("LP contraindications (ICMR STW)", "Papilloedema, platelets below 50,000, focal deficits, asymmetric or unreactive pupils, posturing: image first.")],
 ruleIn=[
  inv("laboratory", "CSF examination", "Lumbar puncture: cells, protein, glucose, Gram stain, culture, AFB, GeneXpert", "Meningitis, encephalitis, TB", "Cells under 5/mm³; protein 15–45 mg/dL; glucose over 60% of blood", "Pleocytosis, raised protein, low glucose in bacterial or TB infection", "Essential unless contraindicated (ICMR STW).", "aes", "section Investigations"),
  inv("laboratory", "Blood glucose", "Capillary glucose", "Hypoglycaemia", "70–140 mg/dL", "Low", "Maintain euglycaemia (ICMR STW).", "aes", A),
  inv("laboratory", "Peripheral smear and malaria RDT", "Blood", "Cerebral malaria", "No parasites; RDT negative", "P. falciparum", "Stop artesunate if both negative (ICMR STW).", "aes", EM),
  inv("laboratory", "JE serology, dengue NS1 and IgM, CSF HSV PCR", "Serum and CSF", "Viral cause", "Negative", "Positive", "Desirable tests; HSV PCR guides acyclovir (ICMR STW).", "aes", "section Investigations"),
  inv("advancedImaging", "Contrast CT brain or MRI brain", "Computed tomography (CT) or magnetic resonance imaging (MRI)", "Oedema, HSV, ADEM, abscess", "Normal", "Oedema, temporal lobe change, demyelination, lesions", "CECT essential; MRI desirable; image before LP if contraindications (ICMR STW).", "aes", "section Investigations"),
  inv("laboratory", "Blood count, liver and kidney function, electrolytes", "Blood", "Organ dysfunction", "Platelets 150–400 x10^9/L; sodium 135–145 mmol/L", "Thrombocytopenia (dengue, scrub), hyponatraemia, raised creatinine", "Essential (ICMR STW).", "aes", "section Investigations")],
 ruleOut=[inv("specializedAdjunctive", "Electroencephalogram (EEG)", "EEG", "Non-convulsive seizures", "Normal background", "Seizure activity or diffuse slowing", "Desirable (ICMR STW).", "aes", "section Investigations")],
 management=[
  step("abc", "Stabilise", "First 15 minutes", ["Airway, breathing, circulation; intubate per criteria (ICMR STW).", "Normal saline 20 mL/kg for circulatory failure; inotropes if needed (ICMR STW).", "Maintain euglycaemia; treat fever (ICMR STW)."]),
  step("seizure", "Control seizures", "Immediately", ["Benzodiazepine, then phenytoin (see medicines) (ICMR STW).", "Refractory: PICU for midazolam infusion 1–18 mcg/kg/min; if no intensive care unit (ICU), valproate, levetiracetam or phenobarbitone (ICMR STW)."]),
  step("icp", "Treat raised ICP", "When signs present", ["Head end up 15–30°; sedation; avoid noxious stimuli (ICMR STW).", "Mannitol or 3% saline (target sodium 145–155 mEq/L) (ICMR STW).", "Impending herniation: hyperventilate to PaCO2 30–35 mmHg (ICMR STW)."]),
  step("empiric", "Empiric treatment", "Within the first hour", ["Ceftriaxone, acyclovir and artesunate if CSF delayed and child unwell (ICMR STW).", "Stop acyclovir if HSV PCR negative twice 24–48 hours apart and MRI not suggestive (ICMR STW).", "Suspected ADEM or autoimmune encephalitis: pulse methylprednisolone (ICMR STW)."]),
  step("support", "Supportive care and referral", "Throughout", ["Admit all; refer to a PICU with ventilation if any red flag (ICMR STW).", "Physiotherapy, posture change, eye care, early feeding (ICMR STW)."])],
 branches=[("Seizure control", "AES with seizures."), ("Raised ICP", "AES with signs of raised intracranial pressure."), ("Empiric antimicrobials", "AES where CSF cannot be obtained or results delayed and the child is unwell.")],
 regimens=[
  rx("Seizure control", "First-line benzodiazepine", "Seizure", "Children", "Lorazepam", "0.1 mg/kg", "IV", "Once; may repeat once", "Single dose", PD, NOT_ABX, "No adjustment.", "No adjustment.", ["Respiratory rate, SpO2"], ["Respiratory depression"], "aes", SZ, sel="one-of", pref=True),
  rx("Seizure control", "First-line benzodiazepine", "Seizure", "Children", "Midazolam", "0.2 mg/kg", "IV or IM", "Once", "Single dose", PD, NOT_ABX, "No adjustment.", "No adjustment.", ["Respiratory rate, SpO2"], ["Respiratory depression"], "aes", SZ, sel="one-of", pref=False, use="No IV access (IM) or lorazepam unavailable."),
  rx("Seizure control", "First-line benzodiazepine", "Seizure", "Children", "Diazepam", "0.3 mg/kg", "IV", "Once", "Single dose", PD, NOT_ABX, "No adjustment.", "No adjustment.", ["Respiratory rate"], ["Respiratory depression"], "aes", SZ, sel="one-of", pref=False, use="Lorazepam and midazolam unavailable."),
  rx("Seizure control", "Second-line", "Seizure persisting after benzodiazepine", "Children", "Phenytoin", "20 mg/kg in normal saline at 1 mg/kg/min", "IV", "Once (loading)", "Then maintenance", PD, NOT_ABX, "No adjustment for loading.", "Caution in liver failure.", ["Electrocardiogram (ECG) and BP during infusion"], ["Bradycardia, heart block", "Do not dilute in dextrose"], "aes", SZ, sel="one-of", pref=True),
  rx("Seizure control", "Second-line", "Seizure persisting, no ICU available", "Children", "Levetiracetam", "20–40 mg/kg", "IV", "Once (loading)", "Then maintenance", PD, NOT_ABX, "Reduce maintenance in renal impairment.", "No adjustment.", ["Seizure control"], ["Behavioural change"], "aes", SZ, sel="one-of", pref=False, use="Phenytoin fails or no ICU; preferred if liver dysfunction."),
  rx("Seizure control", "Second-line", "Seizure persisting, no ICU available", "Children", "Sodium valproate", "20 mg/kg", "IV", "Once (loading)", "Then maintenance", PD, NOT_ABX, "No adjustment.", "Avoid in liver dysfunction or suspected metabolic disease.", ["Liver tests, ammonia"], ["Liver disease", "Suspected inborn error of metabolism"], "aes", SZ, sel="one-of", pref=False, use="Phenytoin fails or no ICU, normal liver function."),
  rx("Seizure control", "Second-line", "Seizure persisting, no ICU available", "Children", "Phenobarbitone", "20 mg/kg", "IV", "Once (loading)", "Then maintenance", PD, NOT_ABX, "Caution in renal impairment.", "Caution in liver failure.", ["Respiratory depression, BP"], ["Without ventilation backup: monitor closely"], "aes", SZ, sel="one-of", pref=False, use="Other second-line drugs unavailable."),
  rx("Raised ICP", "Osmotherapy", "Raised ICP", "Children", "Mannitol 20%", "0.25 g/kg bolus, then 0.25 g/kg every 6 hours as needed", "IV", "Every 6 hours", "Up to 48 hours", PD, NOT_ABX, "Avoid in renal failure: use 3% saline.", "No adjustment.", ["Serum osmolality, urine output, sodium"], ["Hypotension, hypovolaemia, renal failure (use 3% saline)"], "aes", ICP, sel="one-of", pref=True),
  rx("Raised ICP", "Osmotherapy", "Raised ICP with hypotension, hypovolaemia or renal failure", "Children", "Sodium chloride 3%", "0.1–1 mL/kg/hour", "IV infusion", "Continuous", "To serum sodium 145–155 mEq/L", PD, NOT_ABX, "Preferred over mannitol in renal failure.", "No adjustment.", ["Sodium every 4–6 hours"], ["Rapid sodium rise"], "aes", ICP, sel="one-of", pref=False, use="Hypotension, hypovolaemia or renal failure (ICMR STW)."),
  rx("Empiric antimicrobials", "Antibacterial", "Possible bacterial meningitis", "Children", "Ceftriaxone", "100 mg/kg/day in 2 divided doses", "IV", "Every 12 hours", "10–14 days if bacterial meningitis confirmed", PD, "Avoid after an immediate (anaphylactic) penicillin reaction; seek specialist advice.", "No adjustment alone.", "Maximum dose reduction only with combined hepatic and renal failure.", ["CSF culture result"], ["Neonates with jaundice; calcium infusions in neonates"], "aes", EM),
  rx("Empiric antimicrobials", "Antiviral", "Possible HSV encephalitis", "Children 3 months to 12 years", "Acyclovir", "500 mg/m² every 8 hours (over 12 years: 10 mg/kg every 8 hours)", "IV", "Every 8 hours", "Minimum 21 days if confirmed (14–21 days over 12 years); stop if HSV PCR negative twice and MRI not suggestive", PD, NOT_ABX, "Reduce dose in renal impairment; hydrate well.", "No adjustment.", ["Creatinine, hydration"], ["Nephrotoxicity: ensure hydration"], "aes", EM),
  rx("Empiric antimicrobials", "Antimalarial", "Possible cerebral malaria", "Children", "Artesunate", "3 mg/kg (under 20 kg) or 2.4 mg/kg (over 20 kg) at 0, 12 and 24 hours, then daily", "IV or IM", "0, 12, 24 hours then daily", "3–7 days parenteral or oral; stop if smear and RDT negative", PD, NOT_ABX, "No adjustment.", "No adjustment.", ["Smear, Hb"], ["Do not give by infusion"], "aes", EM)],
 medNote="All doses are from the ICMR AES in Children STW (2019). Add doxycycline or azithromycin when scrub typhus is suspected (see Scrub typhus topic). India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 teaching={"scope": "AES in Indian children.", "learningObjectives": ["Recognise AES and its red flags.", "Control seizures and raised ICP.", "Start empiric treatment for treatable causes."],
  "keyPoints": ["Fever with altered sensorium or new seizures = AES.", "Benzodiazepine then phenytoin 20 mg/kg.", "Mannitol 0.25 g/kg or 3% saline; head up 15–30°.", "Ceftriaxone + acyclovir + artesunate while tests pending."],
  "pitfalls": ["LP despite papilloedema or low platelets.", "Missing hypoglycaemia.", "Stopping acyclovir on one negative PCR.", "Forgetting scrub typhus."],
  "references": [tref("aes", "sections Definition, Red flags, Steps I–V, Seizure control, Raised ICP management, Empiric treatment, Investigations, Referral, Discharge criteria")]},
 nonClinical={"patientEducation": ["Explain the need for ICU and long-term follow-up.", "JE vaccination for siblings per the national schedule."], "lifestyleAndDiet": ["Early feeding; nasogastric feeds if unconscious (ICMR STW)."], "mdtReferrals": ["PICU with ventilation for red flags (ICMR STW)", "Physiotherapy and rehabilitation", "District surveillance for AES/JE notification"], "dischargeCriteria": ["Haemodynamically stable (ICMR STW)", "Improved consciousness, afebrile (ICMR STW)", "Eating and drinking, seizures subsided (ICMR STW)", "Parents counselled on home care and physiotherapy (ICMR STW)"], "followUpPlan": "Neurodevelopmental follow-up with physiotherapy; hearing and vision assessment."})
# Depth standard (2026-10-25)
T["lastReviewed"] = "2026-10-25"
EA = T["evidenceAudit"]
EA["unverifiedSections"] = [u for u in EA["unverifiedSections"] if not u.startswith("Scrub typhus is a major cause")]
EA["unverifiedSections"].insert(0, "Scrub typhus is a major cause of AES in India but is not in the ICMR AES workflow; doxycycline and azithromycin doses are taken from the DHR-ICMR rickettsial guideline (2015).")
EA["findings"].append("DHR-ICMR 2015, pp. 16–18: children doxycycline 4.5 mg/kg/day in 2 divided doses or azithromycin 10 mg/kg once daily for 5 days; severe disease IV doxycycline or azithromycin.")
P = T["medicationPlan"]
P["branches"].append({"label": "Suspected scrub typhus", "entryCriteria": "Monsoon AES with eschar, rash, lymphadenopathy, hepatosplenomegaly or thrombocytopenia."})
P["note"] = P["note"].replace("Add doxycycline or azithromycin when scrub typhus is suspected (see Scrub typhus topic).", "Doxycycline and azithromycin for suspected scrub typhus from the DHR-ICMR rickettsial guideline (2015).")
P["regimens"].append(rx("Suspected scrub typhus", "Anti-rickettsial", "Suspected scrub typhus (eschar, rash, thrombocytopenia, raised transaminases)", "Children", "Doxycycline", "4.5 mg/kg/day in 2 divided doses (maximum 100 mg per dose)", "Oral or nasogastric; IV if available", "Twice daily", "7 days",
  "This is the paediatric dose; short courses are acceptable at any age in rickettsial disease (DHR-ICMR).", "Not a beta-lactam; suitable in penicillin allergy.", "No adjustment.", "No adjustment.", ["Fever response within 48 hours"], ["Pregnancy (use azithromycin)"], "rick", "pp. 16–18", sel="one-of", pref=True))
P["regimens"].append(rx("Suspected scrub typhus", "Anti-rickettsial", "Suspected scrub typhus (eschar, rash, thrombocytopenia, raised transaminases)", "Children", "Azithromycin", "10 mg/kg (maximum 500 mg)", "Oral or IV", "Once daily", "5 days",
  "This is the paediatric dose (DHR-ICMR).", "Not a beta-lactam; suitable in penicillin allergy.", "No adjustment.", "Caution in severe liver disease.", ["Fever response, QTc if on other QT drugs"], ["Macrolide allergy"], "rick", "pp. 16–18", sel="one-of", pref=False, use="Doxycycline unavailable or not tolerated."))
for m in T["clinicalManagement"]:
    if m["id"] == "empiric":
        m["actions"].append("Suspected scrub typhus (eschar, monsoon, thrombocytopenia): add doxycycline 4.5 mg/kg/day in 2 doses or azithromycin 10 mg/kg daily for 5 days (DHR-ICMR).")
T["pathophysiology"]["summary"] += " In north and east India, outbreaks peak in the monsoon and post-monsoon months, and Japanese encephalitis vaccination, early referral and treatment of hypoglycaemia have cut deaths; most children who die do so within the first 24–48 hours, which is why the first hour of stabilisation matters most."
T["differentials"] = [{"condition": c, "distinguishingFeatures": f} for c, f in [
 ("Simple febrile seizure", "Brief generalised seizure with rapid full recovery and no altered sensorium; excluded from AES (ICMR STW)."),
 ("Bacterial meningitis", "Neck stiffness and toxic look; CSF neutrophils, low glucose and positive Gram stain or culture settle it."),
 ("Cerebral malaria", "Fever with coma in an endemic area, pallor, splenomegaly; positive smear or rapid diagnostic test settles it."),
 ("Toxic or metabolic encephalopathy", "Hypoglycaemia, electrolyte disorder, liver failure or poisoning history; bedside glucose, electrolytes and history settle it."),
 ("Scrub typhus meningoencephalitis", "Eschar, rash, lymphadenopathy, thrombocytopenia and raised transaminases; scrub typhus IgM ELISA settles it."),
 ("Tuberculous meningitis", "Subacute onset over more than a week, cranial nerve palsies, contact history; CSF lymphocytes, high protein and imaging settle it."),
 ("Autoimmune encephalitis or ADEM", "Behaviour change, movement disorder or multifocal deficits after an infection; MRI demyelination or CSF antibodies settle it.")]]
T["teaching"]["learningObjectives"].append("Recognise scrub typhus and give an anti-rickettsial early.")
T["teaching"]["references"].append(tref("rick", "pp. 16–18"))

ALG = algo("aes-pathway", "Child with fever and altered sensorium or new seizures", "manage", "aes", "sections Steps I–V, Seizure control, Raised ICP management", [
 node("start", "start", "Child with fever up to 5–7 days and altered sensorium or new seizures", [("abc", None)]),
 node("abc", "action", "Airway, breathing, circulation; check glucose; saline 20 mL/kg if circulatory failure", [("seize", None)]),
 node("seize", "decision", "Seizing now?", [("benzo", "Yes"), ("icp", "No")]),
 node("benzo", "action", "Lorazepam 0.1 mg/kg (or midazolam 0.2 mg/kg); then phenytoin 20 mg/kg if seizures persist", [("icp2", None)]),
 node("icp2", "decision", "GCS below 8, abnormal breathing, posturing or fluid-refractory shock?", [("picu", "Yes"), ("emp", "No")]),
 node("picu", "outcome", "Intubate, treat raised ICP (head up, mannitol or 3% saline), empiric antimicrobials, refer to PICU"),
 node("emp", "outcome", "Image if LP contraindicated, then LP; ceftriaxone, acyclovir and artesunate while tests pending; doxycycline if scrub typhus suspected"),
 node("icp", "decision", "Red flags: GCS below 8, abnormal breathing, posturing, refractory shock?", [("picu2", "Yes"), ("lp", "No")]),
 node("picu2", "outcome", "Intubate per criteria, treat raised ICP, empiric antimicrobials, refer to PICU"),
 node("lp", "decision", "Any LP contraindication (papilloedema, platelets below 50,000, focal deficit, unequal pupils)?", [("ct", "Yes"), ("dolp", "No")]),
 node("ct", "outcome", "CT first; start empiric ceftriaxone, acyclovir, artesunate (and doxycycline if scrub typhus suspected) without waiting"),
 node("dolp", "outcome", "LP, smear and RDT, scrub IgM; tailor treatment to results")])

VIG = "Aarav, a 6-year-old boy from Gorakhpur, is brought in September with 3 days of fever, 2 generalised seizures today and increasing drowsiness. He opens his eyes only to pain and localises (GCS 8). Temperature is 39.4 °C, pulse 136/min, capillary refill 3 seconds, BP 90/56 mmHg, and bedside glucose 3.0 mmol/L. There is a black-crusted lesion in the left groin. His JE vaccination status is unknown."

EXP = [
 explain("pathophysiology", "Why the first hours decide outcome", "How do infection, oedema and seizures interact in AES?",
  "Japanese encephalitis and other neurotropic viruses infect neurons directly, especially the thalamus, basal ganglia and brainstem, while bacteria, malaria parasites and rickettsiae injure the brain through meningeal inflammation, microvascular sequestration or vasculitis. Whatever the cause, inflammation causes cerebral oedema, and the rigid skull turns any rise in volume into raised intracranial pressure, reducing perfusion and eventually causing herniation. Seizures raise cerebral oxygen demand and intracranial pressure further, and shock, hypoxia, hypoglycaemia and hyponatraemia add secondary injury. This is why control of airway, circulation, glucose, seizures and intracranial pressure prevents more deaths than any specific antiviral."),
 explain("signs-symptoms", "Spot the red flags and the clues to the cause", "Which findings change what you do in the first hour?",
  "Assess airway, breathing and circulation, then GCS and pupils. A GCS below 8, abnormal breathing pattern, posturing, unequal or unreactive pupils, fluid-refractory shock or seizures that continue after a benzodiazepine and phenytoin mean the child needs intubation and a paediatric intensive care unit. Look for clues to treatable causes: an eschar, rash, lymph nodes or hepatosplenomegaly suggests scrub typhus; pallor and splenomegaly suggest malaria; neck stiffness and a toxic look suggest bacterial meningitis; subacute onset with cranial nerve palsies suggests tuberculosis; behaviour change and movement disorder suggest autoimmune encephalitis."),
 explain("investigations", "Test without delaying treatment", "Which tests matter and when is LP unsafe?",
  "Check bedside glucose at once. Send a blood count, electrolytes, liver and kidney function, malaria smear and rapid test, dengue NS1 and IgM, scrub typhus IgM and JE IgM. CSF examination is essential unless there is papilloedema, platelets below 50,000, a focal deficit, unequal or unreactive pupils or posturing; in those children, image first with contrast CT or MRI. CSF HSV PCR guides acyclovir, which should continue until two PCRs 24–48 hours apart are negative and MRI is not suggestive. Never let investigations delay empiric ceftriaxone, acyclovir and artesunate when the child is unwell."),
 explain("management", "Stabilise, stop seizures, protect the brain, treat the treatable", "How do you manage AES step by step?",
  "Secure the airway and intubate if criteria are met; give normal saline 20 mL/kg for circulatory failure and inotropes if needed; correct hypoglycaemia. Stop seizures with lorazepam 0.1 mg/kg or midazolam 0.2 mg/kg, then phenytoin 20 mg/kg at 1 mg/kg/min; refractory seizures need a midazolam infusion in intensive care, or valproate, levetiracetam or phenobarbitone if no ICU is available. For raised intracranial pressure, nurse head up 15–30°, give mannitol 0.25 g/kg or 3% saline to a sodium of 145–155 mEq/L. Start ceftriaxone 100 mg/kg/day, acyclovir 500 mg/m² every 8 hours and artesunate, and add doxycycline 4.5 mg/kg/day or azithromycin 10 mg/kg when scrub typhus is suspected.")]

QS = [
 bq("q1", "A 6-year-old boy has 3 days of fever, 2 seizures and drowsiness in September in eastern Uttar Pradesh. GCS is 8, capillary refill 3 seconds, BP 90/56 mmHg and glucose 3.0 mmol/L. He has a black-crusted groin lesion and platelets of 62,000/µL. He is no longer seizing.", "In addition to stabilisation and ceftriaxone, acyclovir and artesunate, which drug should be added now?",
  [("Oseltamivir", "There is no evidence of influenza, and it does not treat the likely cause here."),
   ("Doxycycline 4.5 mg/kg/day in 2 doses", "Correct. The eschar and thrombocytopenia suggest scrub typhus, which responds to doxycycline (DHR-ICMR)."),
   ("Methylprednisolone pulse", "Steroids are for suspected ADEM or autoimmune encephalitis, not this picture."),
   ("Chloroquine", "Chloroquine is not used for severe or cerebral malaria; artesunate is already given."),
   ("Vancomycin", "There is no specific indication for vancomycin in this child.")],
  "B", "Recognise scrub typhus as a cause of AES.", "Eschar plus AES in monsoon: add doxycycline or azithromycin."),
 bq("q2", "A 4-year-old girl with AES has a GCS of 10, platelets of 40,000/µL, and unequal pupils on examination. She has had one generalised seizure, which has stopped. BP and oxygen saturation are normal. The resident wants to perform a lumbar puncture before starting antimicrobials.", "What is the best next step?",
  [("Lumbar puncture now, then antimicrobials", "LP is contraindicated with low platelets and unequal pupils (ICMR STW)."),
   ("Wait for CT before any treatment", "Treatment must not wait for imaging when the child is unwell."),
   ("Oral antibiotics and observe", "Oral treatment and observation are inadequate for a child with AES."),
   ("Start empiric ceftriaxone, acyclovir and artesunate, and image before any LP", "Correct. Image first when LP is contraindicated and start empiric treatment without delay (ICMR STW)."),
   ("Discharge with follow-up", "AES needs admission in all cases (ICMR STW).")],
  "D", "Know the LP contraindications and do not delay treatment.", "LP contraindicated: image first, treat immediately."),
 bq("q3", "A 9-year-old boy with AES received lorazepam 0.1 mg/kg 10 minutes ago and is still seizing. He weighs 25 kg. There is no paediatric intensive care unit in the district hospital and transfer will take 3 hours. Glucose is normal and airway is maintained.", "What is the next drug?",
  [("Phenytoin 20 mg/kg IV at 1 mg/kg/min (500 mg)", "Correct. Phenytoin 20 mg/kg is the second-line drug after a benzodiazepine (ICMR STW)."),
   ("Mannitol 0.25 g/kg", "Mannitol treats raised intracranial pressure, not ongoing seizures."),
   ("Oral carbamazepine", "Oral drugs have no role in a seizing child."),
   ("Midazolam infusion on the ward", "Infusions need intensive care monitoring; give second-line drugs first."),
   ("Paracetamol alone", "Antipyretics treat fever but do not stop an ongoing seizure.")],
  "A", "Escalate seizure control in AES.", "Benzodiazepine, then phenytoin 20 mg/kg; refractory: ICU or valproate, levetiracetam, phenobarbitone.")]

T = deepen(T, [ALG], VIG, EXP, QS)

# Reviewer fixes (independent check, 25 Oct 2026)
EA["findings"] = [f for f in EA["findings"] if not f.startswith("DHR-ICMR 2015")]
EA["findings"].append("DHR-ICMR 2015, p. 17: doxycycline 4.5 mg/kg/day in two divided doses for children below 45 kg; azithromycin 10 mg/kg once daily for 5 days.")
EA["unverifiedSections"].insert(1, "Doxycycline duration, the azithromycin maximum and the ceftriaxone maximum are usual practice; acyclovir renal doses are from the US label (Drugs.com); dextrose from the BC status epilepticus guideline (2011).")
def setadj(r, prefix, text):
    r["adjustments"] = [text if a.startswith(prefix) else a for a in r["adjustments"]]
P["branches"].append({"label": "Glucose", "entryCriteria": "Bedside glucose below 3 mmol/L."})
for r in P["regimens"]:
    n = r["genericName"]
    if n == "Doxycycline":
        r["dose"] = "4.5 mg/kg/day in 2 divided doses (children under 45 kg)"
        r["duration"] = "Until 3 days afebrile, usually 7 days in total (usual practice)"
        r["sourceEdition"] = "DHR-ICMR, February 2015, p. 17, sections 3.3.1(c), 3.3.2(b)"
        setadj(r, "Paediatric:", "Paediatric: This is the paediatric dose for children under 45 kg (DHR-ICMR p. 17).")
    if n == "Azithromycin":
        r["dose"] = "10 mg/kg (maximum 500 mg, usual practice)"
        r["sourceEdition"] = "DHR-ICMR, February 2015, p. 17, sections 3.3.1(c), 3.3.2(b)"
    if n == "Phenytoin":
        r["selection"] = "all"; r.pop("preferred", None)
        r["dose"] = "20 mg/kg in normal saline at 1 mg/kg/min (not faster than 50 mg/min, label)"
    if n in ("Levetiracetam", "Sodium valproate", "Phenobarbitone"):
        r["step"] = "Refractory, no ICU"
        r["preferred"] = (n == "Levetiracetam")
        r["indication"] = "Refractory seizures when no ICU is available (ICMR STW)"
    if n == "Acyclovir":
        r["patientGroup"] = "Children 3 months and over (over 12 years: weight-based dose)"
        setadj(r, "Paediatric:", "Paediatric: This is the paediatric dose from 3 months (ICMR STW); under 3 months use neonatal dosing (see neonatal topics).")
        setadj(r, "CKD:", "CKD: Creatinine clearance 25–50 full dose every 12 hours; 10–25 every 24 hours; below 10 half dose every 24 hours (label, Drugs.com); hydrate well.")
    if n == "Ceftriaxone":
        r["dose"] = "100 mg/kg/day in 2 divided doses (maximum 2 g per dose, 4 g/day, general pharmacology)"
P["regimens"].append(rx("Glucose", "Dextrose", "Bedside glucose below 3 mmol/L", "Children", "Dextrose 10%", "5 mL/kg", "IV", "Bolus; recheck glucose in 15–30 minutes", "Until euglycaemic",
  "This is the paediatric dose (BC guideline).", NOT_ABX, "No adjustment.", "No adjustment.", ["Glucose every 15–30 minutes, then hourly"], ["Avoid hyperglycaemia"], "bcmjse", "section Initial management"))
for m in T["clinicalManagement"]:
    if m["id"] == "empiric":
        m["actions"] = [a if not a.startswith("Suspected scrub typhus") else "Suspected scrub typhus (eschar, monsoon, thrombocytopenia): add doxycycline 4.5 mg/kg/day in 2 doses (under 45 kg) or azithromycin 10 mg/kg daily for 5 days (DHR-ICMR)." for a in m["actions"]]
    if m["id"] == "abc":
        m["actions"][2] = "Maintain euglycaemia (ICMR STW): glucose below 3 mmol/L, give 10% dextrose 5 mL/kg (BC guideline); treat fever (ICMR STW)."
A = T["algorithms"][0]; N = {n["id"]: n for n in A["nodes"]}
N["abc"]["text"] = "Airway, breathing, circulation; glucose (10% dextrose 5 mL/kg if below 3 mmol/L); saline 20 mL/kg if circulatory failure"
N["benzo"]["next"] = [{"to": "refr"}]
N["dolp"]["text"] = "LP, smear and RDT, scrub IgM; start ceftriaxone, acyclovir and artesunate if results will be delayed and the child is sick; tailor to results"
i = [n["id"] for n in A["nodes"]].index("benzo") + 1
A["nodes"][i:i] = [
 {"id": "refr", "kind": "decision", "text": "Still seizing after phenytoin?", "next": [{"to": "refout", "label": "Yes"}, {"to": "icp2", "label": "No"}]},
 {"id": "refout", "kind": "outcome", "text": "Refractory: PICU midazolam infusion 1–18 micrograms/kg/min; if no ICU, levetiracetam 20–40 mg/kg, valproate 20 mg/kg or phenobarbitone 20 mg/kg; intubate and refer"}]
for b in T["teaching"]["guidedApproach"]:
    b["guidance"] = b["guidance"].replace("correct hypoglycaemia.", "correct hypoglycaemia with 10% dextrose 5 mL/kg.")
T["teaching"]["references"].append(tref("bcmjse", "section Initial management"))

save("t51_aes_children.json", [T])
