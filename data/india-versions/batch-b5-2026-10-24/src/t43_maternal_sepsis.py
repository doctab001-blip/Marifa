from h import *
TITLE = "Maternal sepsis (India)"
NT_P = "section 6.8 Puerperal sepsis, pp. 43–44"
NT_C = "section 6.10 Chorio-amnionitis, p. 44"
NT_SA = "section 6.3 Septic abortion, p. 41"
SM_R = "p. B1 (summary recommendations 1–19)"
SM_F = "Figure 2 Initial treatment of sepsis during pregnancy, p. B7"
SM_T = "Table 4 empiric antibiotic coverage, p. B9"
SM_S = "Table 1 Sequential Organ Failure Assessment score, p. B3"
T = topic(
 id="f1dba32a-b18d-5e10-bcd3-28bee44db627", title=TITLE, specialty="Obstetrics & Gynaecology", authority="ICMR", pillar="Safe Birth",
 scope="Pregnant and postpartum women (up to 42 days after birth or abortion) with suspected infection and organ dysfunction in India: recognition, the first-hour bundle, empiric antibiotics by source, fluids, vasopressors and source control. Antibiotics follow the NCDC-ICMR National Treatment Guidelines (NTG) 2025 sections on puerperal sepsis, chorioamnionitis and septic abortion; resuscitation targets follow the Society for Maternal-Fetal Medicine (SMFM) Consult #67 (2023).",
 findings=[
  "Puerperal sepsis definition and diagnostic features, piperacillin-tazobactam first line, clindamycin with gentamicin in penicillin allergy, carbapenem for septic shock, and MRSA cover with vancomycin or teicoplanin checked against NCDC-ICMR NTG 2025 section 6.8.",
  "Chorioamnionitis regimens (ampicillin, gentamicin and metronidazole; piperacillin-tazobactam when septic) checked against NTG section 6.10; septic abortion against NTG section 6.3.",
  "Antibiotics within 1 hour, lactate and cultures, 1–2 L balanced crystalloid in the first 3 hours, norepinephrine to a mean arterial pressure of 65 mmHg, hydrocortisone 50 mg every 6 hours for refractory shock, thromboprophylaxis and source control checked against SMFM Consult #67, recommendations and Figure 2.",
  "NTG and SMFM differ on first-line antibiotics for endometritis; shown side by side.",
  "Not clinically reviewed."],
 unverified=[
  "No Indian national maternal sepsis bundle could be opened; resuscitation steps are from SMFM Consult #67.",
  "Norepinephrine is given as a titrated infusion; starting rates are not stated in SMFM and follow the intensive care unit (ICU) protocol.",
  "Thromboprophylaxis drug and dose are not specified in SMFM; follow the obstetric thromboprophylaxis protocol.",
  "Antenatal corticosteroids for fetal lung maturity are mentioned by SMFM without a dose here; use the preterm birth protocol.",
  "Paediatric doses do not apply; adolescents in pregnancy receive adult doses."],
 summary="Maternal sepsis is life-threatening organ dysfunction caused by infection during pregnancy, childbirth, after abortion or in the postpartum period. Common sources are the genital tract (endometritis, chorioamnionitis, septic abortion), urinary tract, lungs, breast and wounds. Normal pregnancy changes mask early signs, so deterioration can be sudden. Treat as an emergency: antibiotics within an hour, fluids, vasopressors if needed, and early source control (SMFM 2023; NTG 2025).",
 mechanisms=[
  "Organisms ascend from the vagina into the uterus after delivery, procedures or retained tissue.",
  "A dysregulated host response causes vasodilatation, capillary leak and organ hypoperfusion; lactate rises.",
  "Pregnancy lowers colloid oncotic pressure, so aggressive fluids cause pulmonary oedema more easily (SMFM p. B10).",
  "Group A streptococcus and clostridia can cause rapid toxic shock and necrotising infection (NTG section 6.8)."],
 presentation={
  "symptoms": ["Fever or chills; feeling very unwell", "Pelvic pain (NTG section 6.8)", "Foul-smelling or purulent vaginal discharge (NTG section 6.8)", "Breathlessness, confusion, reduced urine output"],
  "physicalSigns": ["Oral temperature 38.5°C or higher (NTG section 6.8)", "Uterus involuting less than 2 cm/day in the first 8 days (NTG section 6.8)", "Tachycardia, tachypnoea, hypotension", "Uterine or wound tenderness; breast redness; chest signs"],
  "redFlags": ["Mean arterial pressure under 65 mmHg or lactate over 2 mmol/L after fluids: septic shock (SMFM p. B3)", "Altered mental state, low urine output, low platelets", "Rapid spreading skin changes or severe pain out of proportion: necrotising infection (SMFM Table 4)", "Fetal tachycardia or distress in antenatal sepsis"],
  "precipitants": ["Prolonged rupture of membranes and prolonged labour", "Caesarean birth, retained placenta or products", "Unsafe abortion (NTG section 6.3)", "Anaemia, diabetes, HIV"]},
 differentials=[
  ("Pulmonary embolism", "Sudden breathlessness, pleuritic pain, often without fever; computed tomography (CT) pulmonary angiogram."),
  ("Postpartum haemorrhage", "Shock with visible or concealed bleeding, no fever."),
  ("Pre-eclampsia or HELLP syndrome", "Hypertension, proteinuria, low platelets and raised liver enzymes without infection."),
  ("Amniotic fluid embolism", "Sudden collapse and coagulopathy around delivery.")],
 criteria=[
  ("Puerperal sepsis (NTG section 6.8)", "Serious genital tract infection within 42 days of delivery; 2 or more of pelvic pain, oral temperature 38.5°C or more, abnormal discharge, delayed uterine involution (under 2 cm/day in first 8 days)."),
  ("Sepsis (SMFM p. B2–B3)", "Infection with organ dysfunction, scored by the Sequential Organ Failure Assessment (SOFA) with pregnancy-adjusted interpretation."),
  ("Septic shock (SMFM p. B3)", "Vasopressors needed to keep mean arterial pressure 65 mmHg and lactate over 2 mmol/L despite adequate fluids.")],
 ruleIn=[
  inv("laboratory", "Blood cultures (2 sets) before antibiotics", "Microbiology", "Bacteraemia", "No growth", "Growth of pathogen", "Take before antibiotics without delaying them beyond 1 hour (SMFM Figure 2).", "smfm", SM_F),
  inv("laboratory", "Serum lactate", "Blood", "Hypoperfusion", "Under 2 mmol/L", "Over 2 mmol/L", "Over 2 mmol/L suggests sepsis; labour can raise lactate (SMFM p. B6, rec 7).", "smfm", SM_R),
  inv("laboratory", "Full blood count, creatinine, bilirubin, coagulation", "Blood", "Organ dysfunction", "Platelets 150–400 ×10⁹/L; creatinine under 1.2 mg/dL; bilirubin under 1.2 mg/dL", "Platelets under 100 ×10⁹/L, creatinine 2.0 mg/dL or more, bilirubin 2.0 mg/dL or more", "Scores organ dysfunction (SMFM Table 1).", "smfm", SM_S),
  inv("laboratory", "High vaginal or endocervical swab, urine culture, wound swab", "Microbiology", "Source of infection", "No pathogen", "Pathogen isolated", "Guides de-escalation (NTG section 6.3).", "ntg", NT_SA)],
 ruleOut=[
  inv("firstLineImaging", "Pelvic and abdominal ultrasound", "Uterus and pelvis", "Retained products; abscess", "Empty uterine cavity; no collection", "Retained tissue or pelvic collection", "Identifies a source needing evacuation or drainage (SMFM p. B9).", "smfm", SM_T),
  inv("firstLineImaging", "Chest X-ray", "Chest", "Pneumonia; pulmonary oedema", "Clear lung fields", "Consolidation or oedema", "Finds a respiratory source and fluid overload (SMFM Table 4).", "smfm", SM_T)],
 management=[
  step("hour1", "First-hour bundle", "Within 1 hour of recognition", ["Cultures and lactate, then broad-spectrum intravenous antibiotics (SMFM rec 8; Figure 2).", "Start 1–2 L balanced crystalloid over the first 3 hours; reassess often (SMFM rec 10–11).", "Treat as an emergency: senior obstetric, anaesthetic and critical care review (SMFM rec 2)."]),
  step("shock", "Septic shock", "Within 1 hour", ["Norepinephrine to keep mean arterial pressure at 65 mmHg if hypotension persists (SMFM rec 14; Figure 2).", "Hydrocortisone if no response to norepinephrine or epinephrine 0.25 micrograms/kg/min or more for at least 4 hours (SMFM Figure 2).", "Transfer to intensive care unit (ICU) or high-dependency care."]),
  step("source", "Source control", "As soon as a source is found", ["Evacuate retained products, drain abscesses, deliver if intra-amniotic infection, regardless of gestational age when the uterus is the source (SMFM rec 9, 18).", "Necrotising infection or myometrial necrosis: debridement and hysterectomy (SMFM p. B9)."]),
  step("ongoing", "Ongoing care", "Daily", ["De-escalate antibiotics with culture results; daily review (SMFM p. B9).", "Pharmacological thromboprophylaxis in septic shock (SMFM rec 16); insulin if glucose over 180 mg/dL (SMFM rec 17); early enteral feeding (SMFM Figure 2).", "Breastfeeding usually continues; check drug compatibility."])],
 branches=[
  ("Puerperal sepsis", "Genital tract infection within 42 days of delivery (NTG section 6.8)."),
  ("Puerperal sepsis with septic shock", "Puerperal sepsis needing vasopressors (NTG section 6.8)."),
  ("Chorioamnionitis", "Intra-amniotic infection before delivery without organ dysfunction (NTG section 6.10)."),
  ("Haemodynamic support", "Hypotension or hypoperfusion despite fluids (SMFM Figure 2)."),
  ("Fluid resuscitation", "Sepsis with hypotension or suspected organ hypoperfusion (SMFM rec 10).")],
 regimens=[
  rx("Puerperal sepsis", "Antibiotic", "Puerperal sepsis", "Adults", "Piperacillin-tazobactam", "4.5 g", "Intravenous", "Every 6 hours", "7–14 days", "Adolescents: adult dose (NTG).", "Do not use; give clindamycin with gentamicin.", "Reduce dose when creatinine clearance is low; check the formulary.", NS, ["Temperature, lactate, urine output; cultures"], ["Penicillin allergy"], "ntg", NT_P, sel="one-of", pref=True),
  rx("Puerperal sepsis", "Antibiotic", "Puerperal sepsis", "Adults", "Clindamycin + gentamicin", "Clindamycin 600–900 mg every 8 h; gentamicin 5 mg/kg once daily", "Intravenous", "As stated per drug", "7–14 days", "Adolescents: weight-based gentamicin (NTG).", "Penicillin-allergy option (NTG section 6.8).", "Gentamicin: reduce dose or extend interval in kidney impairment; monitor levels.", NS, ["Creatinine; diarrhoea"], ["Previous C. difficile colitis; myasthenia gravis (gentamicin)"], "ntg", NT_P, sel="one-of", pref=False, use="Penicillin allergy."),
  rx("Puerperal sepsis with septic shock", "Carbapenem", "Puerperal sepsis in septic shock", "Adults", "Meropenem", "1 g", "Intravenous", "Every 8 hours", "7–14 days", "Adolescents: adult dose (NTG).", "Seek specialist advice after penicillin anaphylaxis.", "Reduce dose when creatinine clearance is low; check the formulary.", NS, ["Lactate, blood pressure, urine output; cultures"], ["Carbapenem allergy"], "ntg", NT_P, sel="one-of", pref=True),
  rx("Puerperal sepsis with septic shock", "Carbapenem", "Puerperal sepsis in septic shock", "Adults", "Imipenem-cilastatin", "500 mg", "Intravenous", "Every 6 hours", "7–14 days", "Adolescents: adult dose (NTG).", "Seek specialist advice after penicillin anaphylaxis.", "Reduce dose when creatinine clearance is low; seizure risk.", NS, ["Seizures; cultures"], ["Seizure disorder (caution)"], "ntg", NT_P, sel="one-of", pref=False, use="Meropenem unavailable."),
  rx("Puerperal sepsis with septic shock", "MRSA cover", "Septic shock with suspected MRSA", "Adults", "Vancomycin", "1 g", "Intravenous", "Every 12 hours", "Total course 14 days", "Adolescents: adult dose (NTG).", "Not a beta-lactam.", "Adjust dose by levels in kidney impairment.", NS, ["Trough levels; creatinine"], ["Vancomycin allergy"], "ntg", NT_P, sel="one-of", pref=True),
  rx("Puerperal sepsis with septic shock", "MRSA cover", "Septic shock with suspected MRSA", "Adults", "Teicoplanin", "400 mg every 12 h for 3 doses, then 400 mg once daily", "Intravenous", "As stated", "Total course 14 days", "Adolescents: adult dose (NTG).", "Not a beta-lactam.", "Reduce maintenance dose in kidney impairment; check the formulary.", NS, ["Creatinine; blood count"], ["Teicoplanin allergy"], "ntg", NT_P, sel="one-of", pref=False, use="Vancomycin unavailable or level monitoring not possible."),
  rx("Chorioamnionitis", "Antibiotic", "Chorioamnionitis", "Adults", "Ampicillin + gentamicin + metronidazole", "Ampicillin 2 g every 6 h; gentamicin 5 mg/kg daily; metronidazole 500 mg every 8 h", "Intravenous", "As stated per drug", "7–10 days", "Adolescents: weight-based gentamicin (NTG).", "Use clindamycin with gentamicin.", "Gentamicin: reduce dose or extend interval in kidney impairment.", NS, ["Maternal temperature, fetal heart rate"], ["Penicillin allergy (ampicillin)"], "ntg", NT_C, sel="one-of", pref=True),
  rx("Chorioamnionitis", "Antibiotic", "Chorioamnionitis", "Adults", "Amoxicillin-clavulanic acid", "1.2 g", "Intravenous", "Every 8 hours", "7–10 days", "Adolescents: adult dose (NTG).", "Do not use in penicillin allergy.", NS, NS, ["Maternal temperature"], ["Penicillin allergy"], "ntg", NT_C, sel="one-of", pref=False, use="Aminoglycoside unsuitable."),
  rx("Chorioamnionitis", "Antibiotic", "Chorioamnionitis", "Adults", "Clindamycin + gentamicin (chorioamnionitis)", "Clindamycin 600 mg every 8 h; gentamicin 5 mg/kg daily", "Intravenous", "As stated per drug", "7–10 days", "Adolescents: weight-based gentamicin (NTG).", "Penicillin-allergy option (NTG section 6.10).", "Gentamicin: reduce dose or extend interval in kidney impairment.", NS, ["Creatinine"], ["Previous C. difficile colitis"], "ntg", NT_C, sel="one-of", pref=False, use="Penicillin allergy."),
  rx("Haemodynamic support", "Vasopressor", "Septic shock", "Adults", "Norepinephrine", "Infusion titrated to mean arterial pressure 65 mmHg", "Intravenous (central line preferred)", "Continuous", "Until shock resolves", "Not applicable.", NOT_ABX, NS, NS, ["Mean arterial pressure, lactate, urine output; fetal heart rate"], ["Uncorrected hypovolaemia"], "smfm", SM_F),
  rx("Haemodynamic support", "Corticosteroid", "Refractory septic shock", "Adults", "Hydrocortisone", "50 mg (200 mg/day)", "Intravenous", "Every 6 hours, or as a continuous infusion", "Until vasopressors stopped", "Not applicable.", NOT_ABX, NS, NS, ["Glucose (keep under 180 mg/dL)"], ["Use only if norepinephrine or epinephrine 0.25 micrograms/kg/min or more for 4 hours or longer"], "smfm", SM_F),
  rx("Fluid resuscitation", "Crystalloid", "Sepsis with hypotension or hypoperfusion", "Adults", "Balanced crystalloid (Ringer lactate)", "1–2 L (up to 30 mL/kg in septic shock, individualised)", "Intravenous", "Over the first 3 hours", "First 3 hours, then by response", "Not applicable.", NOT_ABX, "Smaller boluses with reassessment in kidney failure.", NS, ["Dynamic fluid response, chest sounds, oxygen saturation"], ["Pulmonary oedema; do not use starches or gelatin (SMFM rec 12)"], "smfm", SM_F)],
 medNote="Antibiotic choices and doses from NCDC-ICMR NTG 2025 (sections 6.3, 6.8, 6.10); give within 1 hour. Resuscitation (crystalloid 1–2 L, norepinephrine to mean arterial pressure 65 mmHg, hydrocortisone 200 mg/day for refractory shock) from SMFM Consult #67. Source control is essential. Not clinically reviewed.",
 comparison={"title": "Empiric antibiotics for postpartum endometritis: NCDC-ICMR NTG vs SMFM", "columns": ["NCDC-ICMR NTG 2025 (section 6.8)", "SMFM Consult #67 (Table 4)"], "rows": [
   {"parameter": "First line", "values": ["Piperacillin-tazobactam 4.5 g IV every 6 h", "Ampicillin, gentamicin and metronidazole (or clindamycin)"]},
   {"parameter": "Penicillin allergy / alternative", "values": ["Clindamycin 600–900 mg IV every 8 h + gentamicin 5 mg/kg daily", "Cefotaxime or ceftriaxone plus metronidazole"]},
   {"parameter": "Septic shock", "values": ["Imipenem-cilastatin or meropenem; add vancomycin or teicoplanin for MRSA", "Add MRSA cover if high risk; 2 gram-negative agents if multidrug resistance risk"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Sepsis in pregnancy and after birth or abortion.", "learningObjectives": ["Recognise maternal sepsis despite pregnancy physiology.", "Deliver the first-hour bundle.", "Choose antibiotics by source and achieve source control."],
  "keyPoints": ["Antibiotics within 1 hour.", "Fluids 1–2 L balanced crystalloid in 3 hours; watch for pulmonary oedema.", "Norepinephrine to mean arterial pressure 65 mmHg.", "Find and remove the source: retained products, abscess, infected uterus."],
  "pitfalls": ["Attributing tachycardia to pain or labour.", "Delaying antibiotics for imaging.", "Over-filling with fluids in pregnancy.", "Missing group A streptococcal toxic shock."],
  "references": [tref("ntg", NT_SA + "; " + NT_P + "; " + NT_C), tref("smfm", SM_R + "; " + SM_S + "; " + SM_F + "; " + SM_T)]},
 nonClinical={"patientEducation": ["Seek care at once for fever, foul discharge, severe pain or feeling very unwell after birth or abortion.", "Complete the antibiotic course.", "Breastfeeding can usually continue."], "lifestyleAndDiet": ["Early enteral feeding (SMFM Figure 2).", "Perineal hygiene and hand washing."], "mdtReferrals": ["Intensive care or high-dependency unit", "Microbiology or infectious diseases", "Neonatology for the baby"], "dischargeCriteria": ["Afebrile 48 hours, haemodynamically stable", "Source controlled; cultures reviewed", "Psychological support offered (SMFM rec 19)"], "followUpPlan": "Review within 1–2 weeks; screen for anaemia and post-intensive care physical and mental health problems (SMFM rec 19)."})
save("t43_maternal_sepsis.json", [T])
