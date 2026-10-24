from h import *
TITLE = "Rheumatic fever and rheumatic heart disease (India)"
A1 = "page 1 (pathophysiology, clinical features, Jones criteria table, laboratory investigations, differential diagnosis)"
A2 = "page 2 (management: primary prophylaxis table, anti-inflammatory flowchart and treatment schedule, secondary prophylaxis table)"
NT = "section 1.4 Rheumatic fever, p. 17"
T = topic(
 id="4faf842e-1541-5c9c-b5ac-4996e665fc09", title=TITLE, specialty="Cardiology / Paediatrics", authority="ICMR", pillar="Chronic Care",
 scope="Children and adults in India with acute rheumatic fever (ARF) or established rheumatic heart disease (RHD): diagnosis with the revised Jones criteria for moderate- and high-risk populations, eradication of group A streptococcus, anti-inflammatory treatment by manifestation, and secondary prophylaxis with its duration. Built on the ICMR Standard Treatment Workflow for Acute Rheumatic Fever (July 2024) and the NCDC-ICMR National Treatment Guidelines (2025) section 1.4.",
 findings=[
  "Pathophysiology, major manifestations with frequencies, Jones criteria for low-risk and moderate/high-risk populations, laboratory investigations and differentials checked against ICMR ARF STW (July 2024), page 1.",
  "Primary prophylaxis (benzathine penicillin G by weight, penicillin V, amoxicillin, erythromycin), anti-inflammatory schedule (prednisolone 2 mg/kg/day for moderate/severe carditis; aspirin 75–100 mg/kg/day or naproxen 10–20 mg/kg/day), chorea treatment and secondary prophylaxis drugs and duration checked against the STW page 2.",
  "Benzathine penicillin G every 3 weeks for secondary prophylaxis, and azithromycin for confirmed penicillin allergy, checked against NCDC-ICMR NTG 2025 section 1.4.",
  "The STW and NTG differ on penicillin V dosing and allergy alternatives; shown side by side.",
  "Not clinically reviewed."],
 unverified=[
  "The STW does not state the interval for benzathine penicillin G secondary prophylaxis; the 3-weekly interval is from NCDC-ICMR NTG.",
  "Heart failure drugs (diuretics, digoxin, vasodilators) are named in the STW without doses; dose them per the heart failure topic and paediatric cardiology advice.",
  "Anticoagulation for atrial fibrillation or mechanical valves, infective endocarditis prevention, and timing of valve intervention in established RHD are not covered in the sources used.",
  "Penicillin V weight bands (27 kg or less: 250 mg; over 27 kg: 500 mg) were read from the STW poster image and match its benzathine penicillin bands; confirm against the original before use.",
  "Adult anti-inflammatory doses are not separately stated; the weight-based doses apply to children and adolescents."],
 summary="Acute rheumatic fever is an immune reaction that follows untreated or partly treated group A streptococcal (GAS) throat infection, mainly in children aged 5–15 years. It inflames the joints, heart, brain and skin. Repeated attacks scar the heart valves, causing rheumatic heart disease, still a major cause of heart failure, stroke and maternal death in India. Regular benzathine penicillin prevents recurrences and progression (ICMR ARF STW 2024).",
 mechanisms=[
  "Molecular mimicry between streptococcal antigens and heart, joint and brain tissue, plus an exaggerated T-cell response (ICMR STW).",
  "Overcrowding, poor hygiene and limited access to care allow repeated GAS infections (ICMR STW).",
  "Each recurrence adds valve damage; mitral regurgitation and stenosis are typical.",
  "Valve disease leads to heart failure, atrial fibrillation and embolic stroke."],
 presentation={
  "symptoms": ["Migratory pain and swelling of large joints (ankles, knees, wrists), each lasting under a week (ICMR STW)", "Breathlessness, palpitations, fatigue (carditis or heart failure) (ICMR STW)", "Involuntary jerky movements, clumsy handwriting, emotional lability 2–6 months after sore throat (chorea) (ICMR STW)", "Fever after a recent sore throat"],
  "physicalSigns": ["Tender, red, swollen joints that respond quickly to NSAIDs (ICMR STW)", "Tachycardia, new murmur, signs of heart failure (ICMR STW)", "Erythema marginatum: pink rings with pale centres on trunk and limbs (ICMR STW)", "Painless pea-sized subcutaneous nodules over extensor surfaces (ICMR STW)"],
  "redFlags": ["Heart failure or moderate/severe carditis (ICMR STW)", "No response to treatment: refer to an ARF/RHD expert (ICMR STW)", "Missed benzathine penicillin doses in known RHD", "Pregnancy in a woman with RHD"],
  "precipitants": ["Untreated or partly treated streptococcal sore throat (ICMR STW)", "Overcrowding and poor hygiene (ICMR STW)", "Previous ARF (high recurrence risk)", "Poor access to health care (ICMR STW)"]},
 differentials=[
  ("Post-streptococcal reactive arthritis", "Small joints, poor response to NSAIDs (ICMR STW)."),
  ("Juvenile idiopathic (rheumatoid) arthritis", "Persistent, non-migratory arthritis (ICMR STW)."),
  ("Infective endocarditis", "Fever with murmur, positive blood cultures (ICMR STW)."),
  ("Paediatric autoimmune neuropsychiatric disorder with streptococcal infection (PANDAS)", "Tics or obsessive-compulsive symptoms rather than chorea (ICMR STW).")],
 criteria=[
  ("Major criteria, moderate/high-risk populations such as India (ICMR STW)", "Carditis (clinical and/or subclinical on echocardiography), arthritis (monoarthritis, polyarthritis or polyarthralgia), chorea, erythema marginatum, subcutaneous nodules."),
  ("Minor criteria, moderate/high-risk (ICMR STW)", "Monoarthralgia; fever 38°C or more; ESR over 30 mm/h and/or CRP 3 mg/dL or more; prolonged PR interval for age (unless carditis is a major criterion)."),
  ("Essential (ICMR STW)", "Evidence of preceding GAS infection: positive throat culture or antigen test, or raised ASO titre (over 320 U)."),
  ("Diagnosis (ICMR STW)", "Initial ARF: 2 major, or 1 major + 2 minor. Recurrent ARF: 2 major, or 1 major + 2 minor, or 3 minor.")],
 ruleIn=[
  inv("specializedAdjunctive", "Echocardiography", "Heart valves", "Carditis; RHD", "Normal valve structure and function", "Mitral or aortic regurgitation, valve thickening, stenosis", "Detects clinical and subclinical carditis, a major criterion (ICMR STW).", "arf", A1),
  inv("laboratory", "Anti-streptolysin O titre and anti-DNase B", "Serology", "Preceding GAS infection", "ASO under 200 U (local range)", "ASO over 320 U", "Essential evidence of recent GAS infection (ICMR STW).", "arf", A1),
  inv("laboratory", "Throat swab culture and rapid antigen test", "Throat swab", "GAS", "Normal flora", "Group A streptococcus", "Evidence of GAS; treat to eradicate (ICMR STW).", "arf", A1),
  inv("laboratory", "ESR and C-reactive protein", "Blood", "Inflammation", "ESR under 20 mm/h; CRP under 1 mg/dL", "ESR over 30 mm/h; CRP 3 mg/dL or more", "Minor criterion; follow to detect rebound when tapering (ICMR STW).", "arf", A1)],
 ruleOut=[
  inv("laboratory", "Electrocardiogram (ECG), 12-lead", "Heart rhythm", "Carditis", "PR interval within normal for age (adult 120–200 ms)", "Prolonged PR interval; heart block", "Minor criterion when carditis is not counted (ICMR STW).", "arf", A1),
  inv("firstLineImaging", "Chest X-ray", "Chest", "Heart failure", "Cardiothoracic ratio under 0.5; clear lungs", "Cardiomegaly, pulmonary congestion", "Assesses carditis and heart failure (ICMR STW).", "arf", A1),
  inv("laboratory", "Total and differential leucocyte count", "Blood count", "Inflammation; other causes", "White cells 4–11 ×10⁹/L", "Raised white cells", "Essential test (ICMR STW).", "arf", A1)],
 management=[
  step("eradicate", "Eradicate streptococcus", "At diagnosis", ["Give primary prophylaxis to every confirmed or suspected case (ICMR STW).", "Injectable penicillin is safe; allergy is uncommon (ICMR STW)."]),
  step("inflam", "Treat by manifestation", "Days 1–14", ["Check every patient for carditis, whatever the presenting feature (ICMR STW)."],
       branches=[("Arthritis", ["NSAIDs or salicylates; continue 2–4 weeks, taper, watch for rebound (ICMR STW)."]), ("Mild or subclinical carditis", ["Salicylates 4–6 weeks, then taper (ICMR STW)."]), ("Moderate or severe carditis", ["Prednisolone 8–12 weeks with aspirin during the taper; heart failure care with bed rest, diuretics, digoxin and vasodilators (ICMR STW)."]), ("Chorea", ["Carbamazepine, valproate or haloperidol; sedatives if needed (ICMR STW)."])]),
  step("refer", "Escalate", "If no response", ["Refer to an ARF/RHD expert if no response, especially with moderate/severe carditis or heart failure (ICMR STW)."]),
  step("secondary", "Secondary prophylaxis", "Long term", ["Benzathine penicillin G every 3 weeks (NTG section 1.4).", "No carditis: 5 years after the last attack or until 21 years, whichever is longer. Carditis without RHD: 10 years or until 25 years. RHD with valve surgery: at least until 40 years, preferably lifelong (ICMR STW)."])],
 branches=[
  ("Primary prophylaxis", "Confirmed or suspected ARF, to eradicate GAS (ICMR STW)."),
  ("Arthritis or mild carditis", "Polyarthritis, monoarthritis or mild/subclinical carditis (ICMR STW)."),
  ("Moderate or severe carditis", "Carditis with heart failure or significant valve disease (ICMR STW)."),
  ("Chorea", "Sydenham chorea needing treatment (ICMR STW)."),
  ("Secondary prophylaxis", "Everyone with previous ARF or RHD, for the duration in the STW (ICMR STW).")],
 regimens=[
  rx("Primary prophylaxis", "Eradication", "GAS eradication in ARF", "Children and adults", "Benzathine penicillin G", "600,000 units if 27 kg or less; 1,200,000 units if over 27 kg", "Intramuscular", "Once", "Single dose", "Weight-based dose above is the paediatric dose (ICMR STW).", "Do not use; see erythromycin or azithromycin.", NS, NS, ["Observe 30 minutes for anaphylaxis"], ["Penicillin allergy"], "arf", A2, sel="one-of", pref=True),
  rx("Primary prophylaxis", "Eradication", "GAS eradication in ARF", "Children and adults", "Phenoxymethylpenicillin (penicillin V)", "250 mg per dose if 27 kg or less; 500 mg per dose if over 27 kg", "Oral", "2–3 times daily (NTG: 500 mg every 8 h)", "10 days", "Weight-based dose (ICMR STW).", "Do not use.", NS, NS, ["Adherence to 10 days"], ["Penicillin allergy"], "arf", A2, sel="one-of", pref=False, use="Injection refused or unavailable."),
  rx("Primary prophylaxis", "Eradication", "GAS eradication in ARF", "Children and adults", "Erythromycin", "20–40 mg/kg/day in 2–4 divided doses (maximum 1 g/day)", "Oral", "2–4 times daily", "10 days", "Weight-based dose (ICMR STW).", "Option in penicillin allergy (ICMR STW).", NS, "Caution in liver disease.", ["Gastrointestinal upset"], ["QT prolongation; interacting drugs"], "arf", A2, sel="one-of", pref=False, use="Penicillin allergy."),
  rx("Primary prophylaxis", "Eradication", "GAS eradication in ARF", "Adults", "Azithromycin", "500 mg", "Oral", "Once daily", "5 days", "Paediatric dose not given in NTG.", "Option in confirmed penicillin allergy (NTG section 1.4).", NS, NS, ["Symptoms"], ["QT prolongation"], "ntg", NT, sel="one-of", pref=False, use="Confirmed penicillin allergy and erythromycin not tolerated."),
  rx("Arthritis or mild carditis", "Anti-inflammatory", "Arthritis or mild/subclinical carditis", "Children", "Aspirin", "75–100 mg/kg/day in 4 divided doses", "Oral", "Four times daily", "2–4 weeks (salicylates 4–6 weeks with taper for mild carditis), then taper", "Weight-based paediatric dose (ICMR STW).", NOT_ABX, "Avoid in kidney impairment.", "Avoid in liver disease.", ["Rebound after tapering; tinnitus; bleeding"], ["Dengue or bleeding disorder; influenza or varicella (Reye syndrome)"], "arf", A2, sel="one-of", pref=True),
  rx("Arthritis or mild carditis", "Anti-inflammatory", "Arthritis", "Children", "Naproxen", "10–20 mg/kg/day", "Oral", "Twice daily", "2–4 weeks, then taper", "Weight-based paediatric dose (ICMR STW).", NOT_ABX, "Avoid in kidney impairment.", NS, ["Rebound after tapering; gastrointestinal symptoms"], ["Peptic ulcer; kidney impairment"], "arf", A2, sel="one-of", pref=False, use="Arthritis when aspirin is unsuitable (ICMR STW)."),
  rx("Moderate or severe carditis", "Corticosteroid", "Moderate or severe carditis", "Children", "Prednisolone", "2 mg/kg/day", "Oral", "Once daily", "8–12 weeks with taper; aspirin added during the taper", "Weight-based paediatric dose (ICMR STW).", NOT_ABX, NS, NS, ["Blood pressure, glucose; rebound"], ["Untreated serious infection"], "arf", A2),
  rx("Chorea", "Anti-chorea", "Sydenham chorea", "Children", "Carbamazepine", "4–10 mg/kg/day", "Oral", "In divided doses", "As long as needed", "Weight-based paediatric dose (ICMR STW).", NOT_ABX, NS, "Caution in liver disease.", ["Rebound; blood count; rash"], ["Bone marrow suppression"], "arf", A2, sel="one-of", pref=True),
  rx("Chorea", "Anti-chorea", "Sydenham chorea", "Children", "Valproic acid", "20–30 mg/kg/day", "Oral", "In divided doses", "As long as needed", "Weight-based paediatric dose (ICMR STW).", NOT_ABX, NS, "Avoid in liver disease.", ["Liver function; rebound"], ["Liver disease; pregnancy"], "arf", A2, sel="one-of", pref=False, use="Carbamazepine not tolerated."),
  rx("Chorea", "Anti-chorea", "Sydenham chorea", "Adolescents and adults", "Haloperidol", "2–6 mg/day", "Oral", "In divided doses", "As long as needed", "Fixed dose for older patients (ICMR STW).", NOT_ABX, NS, NS, ["Dystonia, sedation"], ["QT prolongation; Parkinson disease"], "arf", A2, sel="one-of", pref=False, use="Severe chorea not controlled by antiepileptic drugs."),
  rx("Secondary prophylaxis", "Prophylaxis", "Prevention of ARF recurrence", "Children and adults", "Benzathine penicillin G (secondary prophylaxis)", "600,000 units if 27 kg or less; 1,200,000 units if over 27 kg", "Intramuscular", "Every 3 weeks (NTG section 1.4)", "Per STW: 5 years/age 21, 10 years/age 25, or until 40 years/lifelong", "Weight-based dose (ICMR STW).", "Do not use; give erythromycin.", NS, NS, ["Dose adherence register; anaphylaxis observation"], ["Penicillin allergy"], "arf", A2, sel="one-of", pref=True),
  rx("Secondary prophylaxis", "Prophylaxis", "Prevention of ARF recurrence", "Children and adults", "Phenoxymethylpenicillin (secondary prophylaxis)", "250 mg", "Oral", "Twice daily", "As for benzathine penicillin", "Same dose for children (ICMR STW).", "Do not use.", NS, NS, ["Daily adherence"], ["Penicillin allergy"], "arf", A2, sel="one-of", pref=False, use="Injections refused or not possible."),
  rx("Secondary prophylaxis", "Prophylaxis", "Prevention of ARF recurrence", "Children and adults", "Erythromycin (secondary prophylaxis)", "250 mg", "Oral", "Twice daily", "As for benzathine penicillin", "Same dose for children (ICMR STW).", "Option in penicillin allergy (ICMR STW).", NS, "Caution in liver disease.", ["Daily adherence"], ["QT prolongation"], "arf", A2, sel="one-of", pref=False, use="Penicillin allergy.")],
 medNote="Doses from the ICMR ARF STW (July 2024); benzathine penicillin G secondary prophylaxis interval (every 3 weeks) and azithromycin for confirmed penicillin allergy from NCDC-ICMR NTG 2025 section 1.4. Heart failure drugs are named in the STW without doses. Not clinically reviewed.",
 comparison={"title": "Streptococcal eradication in ARF: ICMR STW vs NCDC-ICMR NTG", "columns": ["ICMR ARF STW (July 2024)", "NCDC-ICMR NTG 2025 (section 1.4)"], "rows": [
   {"parameter": "Oral penicillin V", "values": ["250 mg/dose (27 kg or less) or 500 mg/dose, 10 days", "500 mg every 8 h, 10 days"]},
   {"parameter": "Penicillin allergy", "values": ["Erythromycin 20–40 mg/kg/day (max 1 g/day), 10 days", "Azithromycin 500 mg once daily, 5 days"]},
   {"parameter": "Secondary prophylaxis interval", "values": ["Not stated", "Benzathine penicillin G every 3 weeks"]},
   {"parameter": "Oral secondary prophylaxis in allergy", "values": ["Erythromycin 250 mg twice daily", "Erythromycin 20 mg/kg/dose, maximum 500 mg twice daily"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Acute rheumatic fever and secondary prevention of RHD.", "learningObjectives": ["Apply the Jones criteria for high-risk populations such as India.", "Treat each manifestation correctly.", "Run secondary prophylaxis for the right duration."],
  "keyPoints": ["In India, monoarthritis and polyarthralgia can count as major criteria.", "Echocardiography finds subclinical carditis.", "Benzathine penicillin every 3 weeks prevents recurrences.", "Injectable penicillin is safe; allergy is uncommon."],
  "pitfalls": ["Stopping anti-inflammatories abruptly (rebound).", "Missing subclinical carditis without echocardiography.", "Stopping prophylaxis too early in RHD.", "Using NSAIDs in suspected dengue."],
  "references": [tref("arf", A1 + "; " + A2), tref("ntg", NT)]},
 nonClinical={"patientEducation": ["Every sore throat in a child should be checked and treated.", "Never miss a benzathine penicillin injection; keep a dose card.", "Women with RHD should plan pregnancy with their cardiologist."], "lifestyleAndDiet": ["Reduce overcrowding where possible; good hygiene (ICMR STW).", "Dental hygiene in valve disease."], "mdtReferrals": ["Paediatric cardiology or ARF/RHD expert (ICMR STW)", "Obstetrics and cardiology for pregnant women with RHD"], "dischargeCriteria": ["Inflammation settling on tapering doses", "First benzathine penicillin given and prophylaxis schedule agreed"], "followUpPlan": "Benzathine penicillin every 3 weeks (NTG); echocardiography and clinical review for carditis; continue prophylaxis for the STW duration (ICMR STW)."})
save("t46_rf_rhd.json", [T])
