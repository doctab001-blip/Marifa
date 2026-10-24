from h import *
TB = "sections When to suspect, Clinical evaluation, Investigations, CSF findings, ATT, Steroid regimen, Complications, Follow-up"
NP = "sections Adult FDC weight bands, Daily doses (mg/kg), TB meningitis, Pyridoxine"
FDC = "Weight bands: 25–34 kg 2 tablets; 35–49 kg 3; 50–64 kg 4; 65–75 kg 5; over 75 kg 6 (each 4-FDC: H 75 mg, R 150 mg, Z 400 mg, E 275 mg)"
TITLE = "Tuberculous meningitis in adults (India)"
T = topic(
 id=new_id(TITLE), title=TITLE, specialty="Infectious Diseases / Neurology / Internal Medicine", authority="ICMR", pillar="Urgent Care",
 scope="Adults with suspected or confirmed tuberculous meningitis (TBM) in India: when to suspect it, cerebrospinal fluid (CSF) and imaging work-up, anti-tubercular therapy (ATT), corticosteroids and complications. Built on the ICMR Adult Tubercular Meningitis workflow (March 2022) and the ICMR drug-sensitive TB treatment workflow as per the National TB Elimination Programme (NTEP) (March 2022).",
 findings=[
  "Suspicion criteria, risk factors, examination, imaging-before-lumbar-puncture rule, laboratory and CSF tests, CSF patterns by meningitis type, NAAT caveat, ATT phases and duration, dexamethasone and prednisolone regimens, complications and follow-up checked against the ICMR Adult TBM STW (March 2022).",
  "Weight-band fixed-dose combination (FDC) tablets, mg/kg doses, streptomycin use in TBM and pyridoxine 10 mg checked against the ICMR NTEP drug-sensitive TB STW (March 2022).",
  "The two ICMR workflows differ on the continuation phase (RHZ vs RHE); shown side by side.",
  "Not clinically reviewed."],
 unverified=[
  "British Medical Research Council (MRC) grading and Glasgow Coma Scale cut-offs are not in the opened STW.",
  "Timing of antiretroviral therapy in HIV co-infection is not given in the opened sources; follow the national HIV programme and an HIV specialist.",
  "Management of hydrocephalus (shunt), hyponatraemia and paradoxical reactions is not detailed in the STW.",
  "CSF numeric thresholds other than cell counts are not given in the STW table; typical adult normal ranges are shown."],
 summary="Tuberculous meningitis is the most severe form of tuberculosis. Mycobacterium tuberculosis seeds the brain surface and forms a thick basal exudate that strangles cranial nerves and blood vessels and blocks CSF flow, causing cranial nerve palsies, infarcts and hydrocephalus. It usually presents subacutely with fever for 5 days or more, headache, vomiting and altered sensorium (ICMR STW). Outcome depends on starting ATT and steroids early, so treatment is often started on clinical and CSF grounds before microbiological proof; a negative nucleic acid test does not exclude TBM (ICMR STW).",
 mechanisms=[
  "Rich foci near the meninges rupture into the subarachnoid space.",
  "Thick basal exudate entraps cranial nerves (especially VI, III) and blocks CSF flow (hydrocephalus).",
  "Vasculitis of penetrating arteries causes infarcts and hemiparesis.",
  "Inflammation drives raised intracranial pressure and hyponatraemia (syndrome of inappropriate antidiuretic hormone secretion, SIADH)."],
 presentation={
  "symptoms": ["Fever for 5 days or more (ICMR STW)", "Headache and vomiting (ICMR STW)", "Altered sensorium, seizures (ICMR STW)", "Neck pain and stiffness; weight loss, night sweats (ICMR STW)"],
  "physicalSigns": ["Neck rigidity, Kernig's sign (ICMR STW)", "Cranial nerve palsy (ICMR STW)", "Hemiparesis or limb weakness (ICMR STW)", "Papilloedema on fundus examination (ICMR STW)"],
  "redFlags": ["Papilloedema or focal deficit: computed tomography (CT) before lumbar puncture (ICMR STW)", "Worsening headache with vomiting or drowsiness: hydrocephalus or raised pressure (ICMR STW)", "Vision loss: optico-chiasmatic arachnoiditis (ICMR STW)", "New weakness of legs with bladder involvement: myelitis or spinal disease (ICMR STW)", "Persistent confusion: hyponatraemia or SIADH (ICMR STW)"],
  "precipitants": ["Active or past TB, previous ATT (ICMR STW)", "Contact with a TB patient (ICMR STW)", "HIV infection (ICMR STW)", "Poverty and high-burden area (ICMR STW)"]},
 differentials=[
  ("Pyogenic (bacterial) meningitis", "Acute onset; CSF cells in thousands, neutrophils, very low sugar; Gram stain and culture (ICMR STW)."),
  ("Cryptococcal meningitis", "Often HIV; India ink, cryptococcal antigen positive (ICMR STW)."),
  ("Viral meningitis or encephalitis", "CSF 50–500 lymphocytes, normal sugar; viral PCR (ICMR STW)."),
  ("Neurocysticercosis or brain abscess", "Imaging shows cysts or ring lesions; CSF less inflammatory.")],
 criteria=[
  ("Suspect TBM (ICMR STW)", "Fever 5 days or more with headache, vomiting, altered sensorium, cranial nerve palsy, weakness, seizures or neck stiffness — do not delay CSF examination."),
  ("TBM CSF (ICMR STW)", "Cells usually under 500, lymphocytic (neutrophilic in some acute cases); high protein; low sugar; acid-fast bacilli (AFB) smear and culture; nucleic acid amplification test (NAAT)."),
  ("ATT (ICMR TBM STW)", "Intensive phase 2 months RHZE or RHZS; continuation at least 10 months RHZ; may be extended."),
  ("Steroids (ICMR STW)", "Dexamethasone 0.4 mg/kg/day IV in 3–4 divided doses while in hospital; oral taper to a total of 8–12 weeks.")],
 ruleIn=[
  inv("laboratory", "CSF cell count, protein and sugar (with blood sugar)", "Lumbar puncture", "TBM pattern", "White cells 0–5/µL; protein 15–45 mg/dL; CSF sugar about two-thirds of blood sugar", "Cells usually under 500, lymphocytic; high protein; low sugar", "Pattern supports TBM and guides empirical ATT (ICMR STW).", "tbm", TB),
  inv("laboratory", "CSF NAAT (Xpert or TrueNat), AFB smear and culture", "Molecular and culture", "Mycobacterium tuberculosis; rifampicin resistance", "Negative", "M. tuberculosis detected", "Confirms TBM; a negative NAAT does not rule it out (ICMR STW).", "tbm", TB),
  inv("firstLineImaging", "Non-contrast or contrast CT head", "CT", "Basal exudates, hydrocephalus, tuberculomas, infarcts", "Normal", "Basal enhancement, hydrocephalus, tuberculoma, infarct", "Preferred first imaging; do before lumbar puncture if papilloedema or focal deficit (ICMR STW).", "tbm", TB),
  inv("advancedImaging", "Magnetic resonance imaging (MRI) brain and spine", "MRI", "Exudates, tuberculomas, spinal arachnoiditis", "Normal", "Basal enhancement; ring lesions; spinal involvement", "Selective cases (ICMR STW).", "tbm", TB)],
 ruleOut=[
  inv("laboratory", "CSF Gram stain, bacterial culture, India ink and cryptococcal antigen", "Microbiology", "Pyogenic or cryptococcal meningitis", "Negative", "Organisms or antigen positive", "Essential CSF tests to exclude other meningitis (ICMR STW).", "tbm", TB),
  inv("laboratory", "HIV test, liver and kidney function, electrolytes, blood sugar", "Blood tests", "Co-infection; drug toxicity baseline; hyponatraemia", "Sodium 135–145 mmol/L; ALT under 40 U/L", "HIV positive; hyponatraemia; raised liver enzymes", "Baseline before ATT and for complications (ICMR STW).", "tbm", TB),
  inv("firstLineImaging", "Chest X-ray (PA) and ultrasound abdomen", "Imaging", "TB elsewhere", "Normal", "Pulmonary or abdominal TB", "Supports diagnosis (ICMR STW).", "tbm", TB)],
 management=[
  step("suspect", "Suspect and investigate", "Same day", ["Refer to a centre with lumbar puncture and CT (ICMR STW).", "CT head first if papilloedema or focal deficit; then lumbar puncture (ICMR STW).", "Send CSF promptly; if delayed, refrigerate and transport on ice (ICMR STW)."]),
  step("treat", "Start treatment", "As soon as TBM is likely", ["Start ATT on clinical and CSF grounds; do not wait for NAAT (ICMR STW).", "Start dexamethasone with ATT (ICMR STW).", "Pyridoxine 10 mg daily with isoniazid (NTEP STW)."]),
  step("monitor", "Monitor", "Daily in hospital", ["Watch for worsening headache or drowsiness (hydrocephalus), vision loss, new weakness, seizures, confusion (hyponatraemia) (ICMR STW).", "Monitor liver function for drug toxicity (ICMR STW).", "Seek neurosurgery for hydrocephalus."]),
  step("discharge", "Discharge and follow-up", "After stabilisation", ["Oral steroid taper to complete 8–12 weeks (ICMR STW).", "Review monthly for at least the first 3 months, then at longer intervals until treatment ends (ICMR STW).", "Notify to NTEP and register for treatment support."])],
 branches=[
  ("Intensive phase (2 months)", "All adults starting TBM treatment (ICMR TBM STW)."),
  ("Continuation phase (at least 10 months)", "After 2-month intensive phase (ICMR TBM STW; NTEP STW)."),
  ("Corticosteroid", "All adults with TBM (ICMR TBM STW)."),
  ("Neuropathy prevention", "All adults on isoniazid (NTEP STW).")],
 regimens=[
  rx("Intensive phase (2 months)", "Four-drug ATT", "TBM intensive phase", "Adults 25 kg and over", "Isoniazid-rifampicin-pyrazinamide-ethambutol fixed-dose combination (HRZE)", FDC, "Oral", "Once daily", "2 months", "Children: use paediatric TBM regimen.", NOT_ABX, "Ethambutol is renally cleared: reduce frequency in kidney impairment; specialist advice.", "Monitor liver function; see ATT-induced hepatitis topic if transaminases rise.", ["Liver function tests", "Visual acuity and colour vision (ethambutol)"], ["Optic neuritis (ethambutol)"], "ntep", NP, sel="one-of", pref=True),
  rx("Intensive phase (2 months)", "Four-drug ATT", "TBM intensive phase", "Adults", "Isoniazid-rifampicin-pyrazinamide (HRZ) plus streptomycin", "HRZ by weight (H 5, R 10, Z 25 mg/kg) + streptomycin 15 mg/kg (range 15–20)", "Oral + intramuscular", "Once daily", "2 months", "Children: use paediatric TBM regimen.", NOT_ABX, "Streptomycin: avoid or reduce in kidney impairment.", "Monitor liver function.", ["Hearing and balance, creatinine (streptomycin)", "Liver function tests"], ["Pregnancy (streptomycin); hearing loss"], "ntep", NP, sel="one-of", pref=False, use="Ethambutol cannot be used or vision cannot be monitored (unconscious patient) — RHZS is an ICMR option."),
  rx("Continuation phase (at least 10 months)", "Continuation ATT", "TBM continuation", "Adults", "Isoniazid-rifampicin-pyrazinamide (HRZ)", "H 5, R 10, Z 25 mg/kg daily", "Oral", "Once daily", "At least 10 months; may be extended", "Children: paediatric regimen.", NOT_ABX, NS, "Monitor liver function.", ["Liver function tests", "Clinical response monthly"], ["Hepatotoxicity"], "tbm", TB, sel="one-of", pref=True),
  rx("Continuation phase (at least 10 months)", "Continuation ATT", "TBM continuation", "Adults", "Isoniazid-rifampicin-ethambutol fixed-dose combination (HRE)", FDC.replace("4-FDC: H 75 mg, R 150 mg, Z 400 mg, E 275 mg", "3-FDC: H 75 mg, R 150 mg, E 275 mg"), "Oral", "Once daily", "At least 10 months", "Children: paediatric regimen.", NOT_ABX, "Ethambutol renally cleared; specialist advice in kidney impairment.", "Monitor liver function.", ["Vision (ethambutol)", "Liver function tests"], ["Optic neuritis"], "ntep", NP, sel="one-of", pref=False, use="Programme (NTEP) regimen used locally; the TBM STW omits ethambutol from continuation because of toxicity."),
  rx("Corticosteroid", "Steroid", "TBM inflammation", "Adults", "Dexamethasone", "0.4 mg/kg/day", "IV (oral if IV not feasible)", "In 3–4 divided doses", "During admission, then oral taper to a total of 8–12 weeks", "Children: paediatric TBM protocol.", NOT_ABX, NS, NS, ["Glucose, blood pressure", "Gastrointestinal bleeding"], ["Uncontrolled diabetes: monitor closely"], "tbm", TB, sel="one-of", pref=True),
  rx("Corticosteroid", "Steroid", "TBM inflammation", "Adults", "Prednisolone", "1 mg/kg/day", "Oral", "Single morning dose", "Taper to a total of 8–12 weeks", "Children: paediatric protocol.", NOT_ABX, NS, NS, ["Glucose, blood pressure"], ["Uncontrolled diabetes: monitor closely"], "tbm", TB, sel="one-of", pref=False, use="IV dexamethasone not feasible."),
  rx("Neuropathy prevention", "Vitamin", "Isoniazid neuropathy prevention", "Adults", "Pyridoxine", "10 mg", "Oral", "Once daily", "Throughout ATT", "Paediatric dose per programme.", NOT_ABX, "No change.", "No change.", ["Tingling of feet"], ["None significant"], "ntep", NP)],
 medNote="ATT phases, steroids and complications from the ICMR Adult TBM STW (March 2022); weight bands, mg/kg doses, streptomycin and pyridoxine from the ICMR NTEP drug-sensitive TB STW (March 2022). The TBM STW gives RHZ for continuation (ethambutol omitted for toxicity, sent to NTEP); the NTEP STW gives RHE. Drug-resistant TBM needs specialist care. Not clinically reviewed.",
 comparison={"title": "TBM continuation phase: ICMR TBM STW vs ICMR NTEP STW", "columns": ["ICMR Adult TBM STW (2022)", "ICMR NTEP drug-sensitive TB STW (2022)"], "rows": [
   {"parameter": "Intensive phase", "values": ["2 months RHZE or RHZS", "2 months RHZE or RHZS"]},
   {"parameter": "Continuation phase", "values": ["At least 10 months RHZ (ethambutol omitted for toxicity)", "At least 10 months RHE"]},
   {"parameter": "Steroid", "values": ["Dexamethasone 0.4 mg/kg/day IV in 3–4 doses; taper over 8–12 weeks", "Dexamethasone 0.4 mg/kg/day IV in 3–4 doses (preferred)"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Adult tuberculous meningitis.", "learningObjectives": ["Suspect TBM early.", "Interpret CSF patterns.", "Start ATT and steroids correctly."],
  "keyPoints": ["Fever 5 days or more with headache and confusion: do a lumbar puncture.", "Negative NAAT does not rule out TBM.", "2 months intensive, at least 10 months continuation.", "Dexamethasone 0.4 mg/kg/day with ATT."],
  "pitfalls": ["Waiting for microbiological proof before treating.", "Missing hydrocephalus in a patient getting drowsier.", "Ethambutol without vision monitoring in an unconscious patient.", "Stopping steroids abruptly."],
  "references": [tref("tbm", TB), tref("ntep", NP)]},
 nonClinical={"patientEducation": ["Take ATT every day for the full course (about a year).", "Report yellow eyes, vomiting, blurred vision or numb feet.", "Steroids must be tapered, not stopped suddenly."], "lifestyleAndDiet": ["Good nutrition; NTEP nutritional support where available", "Avoid alcohol"], "mdtReferrals": ["Neurology", "Neurosurgery for hydrocephalus", "NTEP treatment supporter", "HIV services if positive"], "dischargeCriteria": ["Improving consciousness and no new deficits", "Tolerating oral ATT and steroid taper", "NTEP registration and follow-up arranged"], "followUpPlan": "Monthly review for at least the first 3 months, then at longer intervals until treatment ends (ICMR STW); liver function and vision checks during ATT."})
save("t37_tbm.json", [T])
