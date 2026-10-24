from h import *
A = "sections Types, Timelines, Maculopapular reactions, Fixed drug eruption, Red flags, Culprit drugs, Investigations, Management, Drug provocation"
B = "sections SJS/TEN diagnostic features, BSA classification, Secondary and tertiary care, SCORTEN, DRESS"
TITLE = "Severe cutaneous adverse drug reactions: SJS/TEN and DRESS (India)"
T = topic(
 id=new_id(TITLE), title=TITLE, specialty="Dermatology / Internal Medicine / Emergency Medicine", authority="ICMR", pillar="Urgent Care",
 scope="Adults and children with drug rashes in India, focused on the severe reactions — Stevens-Johnson syndrome (SJS), toxic epidermal necrolysis (TEN) and drug reaction with eosinophilia and systemic symptoms (DRESS) — with first steps for milder maculopapular rashes and fixed drug eruptions. Built entirely on the ICMR Cutaneous Adverse Drug Reactions workflows, Parts A and B (July 2022).",
 findings=[
  "Reaction types and timelines, red flags, culprit drugs, investigations, management of maculopapular rash and fixed drug eruption, drug provocation rules and allergy documentation checked against ICMR cADR STW Part A (July 2022).",
  "SJS/TEN features and body-surface-area classification, skin, mouth and eye care, antibiotics, steroid and cyclosporine doses, referral at over 10% detachment, SCORTEN and mortality table, and DRESS features and treatment checked against ICMR cADR STW Part B (July 2022).",
  "Part A gives two prednisolone durations for severe maculopapular rash (5–7 days and 3–5 days); both are shown.",
  "Not clinically reviewed."],
 unverified=[
  "The ICMR STW does not say whether steroids or cyclosporine is preferred in SJS/TEN; steroids are listed first and shown as preferred.",
  "Cyclosporine dose for DRESS (second line, tertiary care) is not given; specialist dosing.",
  "Intravenous immunoglobulin and etanercept are not covered by the ICMR STWs and are not included.",
  "Fluid volumes for skin failure are not given in the opened sources."],
 summary="Cutaneous adverse drug reactions (cADR) range from common, self-limiting maculopapular rashes to life-threatening SJS/TEN and DRESS. SJS/TEN is a T-cell-mediated reaction in which keratinocytes die and the epidermis detaches, usually 4 days to 2 weeks after a new drug, with painful mucosal erosions. DRESS appears later (2–12 weeks) with fever, widespread rash, facial swelling, eosinophilia, lymph node enlargement and liver, kidney or heart involvement. The most important step in every case is to stop all suspect drugs at once and refer severe reactions early (ICMR STW).",
 mechanisms=[
  "Drug-specific cytotoxic T cells trigger widespread keratinocyte death and epidermal detachment (SJS/TEN).",
  "Loss of skin barrier causes fluid and protein loss, hypothermia and sepsis — 'skin failure'.",
  "DRESS combines drug hypersensitivity with herpesvirus reactivation, driving eosinophilia and organ inflammation.",
  "High-risk drugs: aromatic anticonvulsants, allopurinol, nevirapine, abacavir, co-trimoxazole, dapsone (ICMR STW)."],
 presentation={
  "symptoms": ["Fever, sore eyes, painful mouth before or with the rash (SJS/TEN)", "Painful, tender skin; blisters and peeling (ICMR STW)", "DRESS: fever above 38°C, widespread itchy rash, face swelling 2–12 weeks after starting a drug (ICMR STW)"],
  "physicalSigns": ["Dusky red macules and atypical targets with central blistering (ICMR STW)", "Epidermal detachment; mucosal erosions of mouth, eyes, genitals", "DRESS: rash over 50% of body surface, facial oedema, lymphadenopathy, hepatomegaly (ICMR STW)", "Fixed drug eruption: dusky violaceous plaques at the same site on re-exposure (ICMR STW)"],
  "redFlags": ["Mucosal involvement, purpuric or bullous lesions, skin tenderness, facial or acral oedema, erythroderma (ICMR STW)", "High-grade fever, jaundice or reduced urine output (ICMR STW)", "Detachment over 10% of body surface: refer to a centre with an intensive care unit (ICU) experienced in skin failure (ICMR STW)", "Sepsis, shock or systemic inflammatory response syndrome (SIRS): ICU (ICMR STW)", "DRESS with severe liver, kidney or heart involvement (ICMR STW)"],
  "precipitants": ["New drug in the previous 4 weeks (ICMR STW)", "Polypharmacy; recently added drugs or dose increases (ICMR STW)", "Concurrent viral infection, including HIV (ICMR STW)", "Chronic kidney disease (ICMR STW)"]},
 differentials=[
  ("Staphylococcal scalded skin syndrome", "Superficial peeling without mucosal involvement; often children (ICMR STW)."),
  ("Pemphigus", "Chronic course; direct immunofluorescence positive (ICMR STW)."),
  ("Viral exanthem", "Fever and prodrome before rash; no new drug (ICMR STW)."),
  ("Rickettsial rash or Kawasaki disease", "Eschar or fever pattern; Kawasaki in children (ICMR STW)."),
  ("Generalised bullous fixed drug eruption", "Well-defined dusky plaques; can mimic TEN when numerous (ICMR STW).")],
 criteria=[
  ("SJS/TEN by detachment (ICMR STW Part B)", "SJS under 10% of body surface; SJS-TEN overlap 10–30%; TEN 30% or more; TEN without spots 10% or more."),
  ("SCORTEN (within 24 hours, repeat day 3)", "One point each: age over 40; heart rate over 120; cancer; detachment over 10%; urea over 60 mg/dL; bicarbonate under 20 mmol/L; glucose over 252 mg/dL. Mortality: 0–1 3%; 2 12%; 3 35%; 4 58%; 5 or more over 90%."),
  ("Suspect DRESS (ICMR STW)", "High-risk drug; fever over 38°C; rash (over 50% of body surface, facial oedema, desquamation); eosinophilia; lymphadenopathy; liver or kidney dysfunction; onset 2–6 weeks (up to 12)."),
  ("Timelines (ICMR STW)", "Anaphylaxis 5–15 minutes; maculopapular rash, SJS/TEN and first fixed drug eruption a few hours to 2 weeks; DRESS 4–12 weeks.")],
 ruleIn=[
  inv("laboratory", "Complete blood count", "CBC with differential", "Eosinophilia; cytopenia", "Eosinophils under 500/µL; white cells 4–11 ×10⁹/L", "Eosinophilia (DRESS, maculopapular rash); leucocytosis", "Supports diagnosis (ICMR STW Part A); monitor weekly in DRESS (Part B).", "cadra", A, extra=("cadrb", B)),
  inv("laboratory", "Liver and kidney function, electrolytes", "LFT, creatinine, urea, magnesium, phosphate", "Organ involvement; SCORTEN", "Creatinine 0.6–1.2 mg/dL; urea 15–45 mg/dL; ALT under 40 U/L", "Raised transaminases or creatinine; urea over 60 mg/dL", "Organ involvement changes level of care; urea is a SCORTEN item (ICMR STW).", "cadrb", B),
  inv("laboratory", "Bicarbonate, glucose, lactate, blood gas", "Blood tests", "SCORTEN; sepsis", "Bicarbonate 22–28 mmol/L; glucose 70–140 mg/dL; lactate under 2 mmol/L", "Bicarbonate under 20 mmol/L; glucose over 252 mg/dL", "SCORTEN items and sepsis markers (ICMR STW).", "cadrb", B)],
 ruleOut=[
  inv("laboratory", "Blood and pus cultures", "Microbiology", "Secondary infection", "No growth", "Staphylococci, streptococci or Pseudomonas", "Guides antibiotics; avoid the suspect drug class (ICMR STW).", "cadrb", B),
  inv("firstLineImaging", "Chest X-ray, electrocardiogram (ECG), echocardiogram", "Imaging and ECG", "Lung involvement; DRESS myocarditis", "Clear lungs; normal ECG and ventricular function", "Infiltrates; ECG changes or reduced function", "In TEN and DRESS (ICMR STW).", "cadrb", B),
  inv("specializedAdjunctive", "Skin biopsy with direct immunofluorescence", "Histopathology", "Uncertain diagnosis; pemphigus or lupus", "Normal skin", "Full-thickness epidermal necrosis", "Only if the diagnosis is uncertain (ICMR STW).", "cadrb", B)],
 management=[
  step("stop", "Stop the drug", "Immediately", ["Withdraw all suspect drugs at once, except non-suspect life-saving drugs (ICMR STW).", "Keep every drug taken in the last 4 weeks on the suspect list (ICMR STW).", "Assess vital signs; stabilise; fluids and nutrition (ICMR STW)."]),
  step("sjs", "SJS/TEN care", "First 24–72 hours", ["Skin: dilute potassium permanganate, saline or chlorhexidine baths; leave detached skin in place under non-adherent vaseline gauze; topical mupirocin or fusidic acid on raw areas (ICMR STW).", "Mouth: chlorhexidine rinse 2–3 times daily, soft paraffin to lips, steroid mouthwash (ICMR STW).", "Eyes: ophthalmology referral (ICMR STW).", "Systemic adjuvant therapy ideally within 24–72 hours of onset (ICMR STW).", "Detachment over 10%: refer to a centre with ICU experienced in skin failure (ICMR STW)."]),
  step("infection", "Infection", "If sepsis or secondary infection", ["Broad-spectrum antibiotics covering staphylococci, streptococci and Pseudomonas; adjust to cultures; avoid the suspect drug class (ICMR STW)."]),
  step("dress", "DRESS care", "On diagnosis", ["Primary care: stop the drug, antihistamines and emollients, refer; do not add unnecessary new drugs (ICMR STW).", "Monitor CBC, liver and kidney function at least weekly (ICMR STW).", "Severe liver, kidney or heart involvement: tertiary multidisciplinary intensive care; cyclosporine second line if renal function is normal (ICMR STW)."]),
  step("after", "After recovery", "Before discharge", ["Record the reaction, educate the patient and give an allergy card (ICMR STW).", "Do not re-challenge in DRESS unless unavoidable; no provocation in active illness or pregnancy (ICMR STW).", "Long-term follow-up for eye, skin and lung complications after TEN (ICMR STW)."])],
 branches=[
  ("SJS/TEN — systemic adjuvant therapy", "SJS or TEN within 24–72 hours of onset (ICMR STW)."),
  ("SJS/TEN — mucosal and skin care", "All patients with SJS or TEN (ICMR STW)."),
  ("DRESS — no major organ involvement", "DRESS without severe liver, kidney or heart involvement (ICMR STW)."),
  ("Severe maculopapular rash", "Maculopapular rash with severe symptoms, after infection is excluded, secondary care (ICMR STW)."),
  ("Fixed drug eruption", "Localised fixed drug eruption, primary care (ICMR STW).")],
 regimens=[
  rx("SJS/TEN — systemic adjuvant therapy", "Systemic immunomodulation", "SJS/TEN", "Adults and children", "Prednisolone", "1–2 mg/kg (or equivalent IV dexamethasone)", "Oral or IV", "Daily", "3–7 days", "Same mg/kg dose used in children (ICMR STW).", NOT_ABX, NS, NS, ["Sepsis, glucose"], ["Higher doses for longer increase sepsis and metabolic risk (ICMR STW)"], "cadrb", B, sel="one-of", pref=True),
  rx("SJS/TEN — systemic adjuvant therapy", "Systemic immunomodulation", "SJS/TEN", "Adults and children", "Cyclosporine", "3–5 mg/kg", "Oral", "Daily (divided doses)", "10–14 days", "Weight-based; specialist supervision.", NOT_ABX, "Avoid or reduce in kidney impairment; monitor creatinine.", NS, ["Creatinine, blood pressure, potassium"], ["Uncontrolled hypertension, kidney impairment"], "cadrb", B, sel="one-of", pref=False, use="Steroids contraindicated or sepsis risk high; specialist preference."),
  rx("SJS/TEN — mucosal and skin care", "Oral care", "Mucositis", "Adults and children", "Chlorhexidine mouthwash", "Rinse", "Oral rinse", "2–3 times daily", "Until mucosa heals", "Use only if the child can rinse and spit.", NOT_ABX, "No change.", "No change.", ["Oral intake, pain"], ["Do not swallow"], "cadrb", B),
  rx("SJS/TEN — mucosal and skin care", "Topical antibiotic", "Raw sloughed areas", "Adults and children", "Mupirocin (topical)", "Thin layer to sloughed areas", "Topical", "As per dressing changes", "Until epithelialised", "Same use in children.", "Not a beta-lactam.", "No change.", "No change.", ["Signs of infection"], ["Large raw areas in kidney impairment: use sparingly"], "cadrb", B),
  rx("DRESS — no major organ involvement", "Systemic steroid", "DRESS", "Adults and children", "Prednisolone", "0.5–2 mg/kg", "Oral", "Daily", "Taper slowly after resolution, over months if needed", "Same mg/kg dose used in children (ICMR STW).", NOT_ABX, NS, NS, ["CBC, liver and kidney function weekly", "Glucose, blood pressure"], ["Active untreated infection"], "cadrb", B),
  rx("DRESS — no major organ involvement", "Antihistamine", "Itch", "Adults", "Pheniramine", "25 mg", "Oral", "Three times daily", "While itchy", "Use paediatric dosing in children.", NOT_ABX, NS, NS, ["Sedation"], ["Driving or machinery while drowsy"], "cadrb", B),
  rx("Severe maculopapular rash", "Systemic steroid", "Severe maculopapular drug rash", "Adults and children", "Prednisolone", "0.5–1 mg/kg/day", "Oral", "Daily", "5–7 days (text) or 3–5 days (management table) — both stated in ICMR Part A", "Same mg/kg dose used in children.", NOT_ABX, NS, NS, ["Rash progression, red flags"], ["Rule out infection first (ICMR STW)"], "cadra", A),
  rx("Fixed drug eruption", "Topical steroid", "Fixed drug eruption", "Adults", "Betamethasone valerate cream", "Thin layer", "Topical", "Twice daily", "Review in 1 week", "Use lower-potency steroid on children's face.", NOT_ABX, "No change.", "No change.", ["Response at 1 week"], ["Infected or eroded skin: use saline compresses first"], "cadra", A),
  rx("Fixed drug eruption", "Antihistamine", "Itch", "Adults", "Pheniramine", "25 mg", "Oral", "Two or three times daily", "While itchy", "Use paediatric dosing in children.", NOT_ABX, NS, NS, ["Sedation"], ["Driving while drowsy"], "cadra", A)],
 medNote="All doses are from the ICMR cADR STWs Parts A and B (July 2022). Systemic therapy for SJS/TEN works best within 24–72 hours; the STW lists steroids and cyclosporine without ranking them. IVIg and etanercept are not in the ICMR STW. Antibiotics only for sepsis or secondary infection, guided by culture and avoiding the culprit drug class. Not clinically reviewed.",
 comparison={"title": "Steroid duration for severe maculopapular drug rash: two statements in ICMR cADR Part A", "columns": ["Part A text (secondary care)", "Part A management table"], "rows": [
   {"parameter": "Prednisolone", "values": ["0.5–1 mg/kg/day for 5–7 days after ruling out infection", "0.5–1 mg/kg for 3–5 days"]}], "note": "Same document, two durations; shown as stated."},
 teaching={"scope": "Severe drug rashes.", "learningObjectives": ["Recognise SJS/TEN and DRESS red flags.", "Classify SJS/TEN and score SCORTEN.", "Give first care and refer correctly."],
  "keyPoints": ["Stop every suspect drug at once.", "Mucosal involvement, skin pain or blisters: think SJS/TEN.", "Over 10% detachment: refer to a skin-failure ICU.", "DRESS appears weeks later with fever, eosinophilia and organ involvement."],
  "pitfalls": ["Adding new drugs (including antibiotics of the same class) during the reaction.", "Peeling off detached skin.", "Missing eye involvement.", "Re-challenging after DRESS."],
  "references": [tref("cadra", A), tref("cadrb", B)]},
 nonClinical={"patientEducation": ["Carry an allergy card naming the drug (ICMR STW).", "Never take the drug, or related drugs, again without specialist advice.", "Tell every doctor and pharmacist about the reaction."], "lifestyleAndDiet": ["Soft, cool foods while the mouth heals", "Emollients for dry, peeling skin (ICMR STW)"], "mdtReferrals": ["Dermatology", "Ophthalmology for eye involvement (ICMR STW)", "ICU for over 10% detachment, sepsis or shock (ICMR STW)", "Hepatology, nephrology or cardiology for DRESS organ involvement"], "dischargeCriteria": ["Skin re-epithelialised or healing", "Eating and drinking", "Allergy card given (ICMR STW)"], "followUpPlan": "Review fixed drug eruption at 1 week (ICMR STW); DRESS: weekly blood tests during steroid taper; long-term eye, skin and lung follow-up after TEN (ICMR STW)."})
save("t33_scar.json", [T])
