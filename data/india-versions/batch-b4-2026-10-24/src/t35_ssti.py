from h import *
SK = "sections General principles, Impetigo, Folliculitis, Furuncle, Carbuncle, Abscess, Cellulitis, Erysipelas, SSSS, Investigations, Sepsis red flags, Suspect MRSA, Topical, Oral, MRSA options"
TITLE = "Skin and soft-tissue infections: cellulitis, abscess and impetigo (India)"
PEN_NO = "Do not use; choose clindamycin or erythromycin (ICMR STW penicillin-allergy options)."
T = topic(
 id=new_id(TITLE), title=TITLE, specialty="Dermatology / General Surgery / Primary Care", authority="ICMR", pillar="Urgent Care",
 scope="Adults and children with bacterial skin and soft-tissue infections in India: impetigo, folliculitis, boils and carbuncles, abscess, cellulitis and erysipelas, with red flags for sepsis and necrotising infection. Built on the ICMR Bacterial Skin Infections workflow (July 2022); piperacillin-tazobactam dose and renal adjustment from its US label.",
 findings=[
  "Features of each infection, hygiene principles, gram-negative cover in diabetes or immunocompromise, incision and drainage as primary abscess treatment, cellulitis severity and treatment, sepsis red flags, when to suspect methicillin-resistant Staphylococcus aureus (MRSA), and every topical, oral, IV and MRSA drug with dose checked against the ICMR Bacterial Skin Infections STW (July 2022).",
  "The STW names vancomycin plus piperacillin-tazobactam for severe cellulitis without a piperacillin-tazobactam dose; the label dose is used.",
  "Not clinically reviewed."],
 unverified=[
  "Treatment durations for cellulitis are not given in the ICMR STW; 5–7 days is not stated and is left to clinical response.",
  "The ICMR STW abscess section layout is garbled; small versus large abscess mapping should be checked against the printed STW.",
  "Necrotising fasciitis management beyond red flags and surgical debridement is not detailed in the STW.",
  "Ceftriaxone 2 g twice daily is as printed in the STW; many sources use 2 g once daily for cellulitis — confirm locally."],
 summary="Bacterial skin infections are mostly caused by Staphylococcus aureus and streptococci entering through broken skin. Superficial infections (impetigo, folliculitis) need hygiene and topical treatment; deeper collections (boils, carbuncles, abscesses) need drainage; spreading infection of the dermis and subcutaneous tissue (cellulitis, erysipelas) needs systemic antibiotics, chosen by severity. Diabetes, immunosuppression, scabies and eczema predispose, and recurrent infection should prompt a search for nasal carriage and diabetes (ICMR STW). Severe pain out of proportion, then numbness, with dark skin suggests necrotising infection needing surgery.",
 mechanisms=[
  "Breaks in the skin (trauma, eczema, scabies, tinea) let bacteria in.",
  "Staphylococci form pus-filled follicular infections and abscesses.",
  "Streptococci spread through dermis and lymphatics, causing cellulitis and erysipelas with lymphangitis.",
  "Toxin-producing staphylococci cause blistering and peeling in scalded skin syndrome."],
 presentation={
  "symptoms": ["Painful, red, warm, swollen skin (cellulitis) (ICMR STW)", "Fluctuant painful lump (abscess) (ICMR STW)", "Honey-coloured crusts, usually around nose and mouth in children (impetigo) (ICMR STW)", "Fever and malaise in moderate or severe infection"],
  "physicalSigns": ["Diffuse tender swelling of a limb (cellulitis) (ICMR STW)", "Bright red, raised plaque with a sharp edge (erysipelas) (ICMR STW)", "Follicle-centred pustules or nodules (folliculitis, furuncle) (ICMR STW)", "Lymphangitis and tender lymph nodes"],
  "redFlags": ["Temperature over 38°C, white cells over 12,000 or under 4,000/µL, heart rate over 90, respiratory rate over 24 (ICMR STW sepsis signs)", "Severe pain then deceptive loss of pain, dark skin discolouration: necrotising infection (ICMR STW)", "Bullae, skin sloughing, hypotension or organ dysfunction: severe cellulitis (ICMR STW)", "No improvement in 48–72 hours: suspect MRSA (ICMR STW)"],
  "precipitants": ["Diabetes and immunosuppression (ICMR STW)", "Scabies or atopic eczema (ICMR STW)", "Nasal Staphylococcus aureus carriage (ICMR STW)", "Oil application, waxing, occlusive dressings (folliculitis) (ICMR STW)"]},
 differentials=[
  ("Deep vein thrombosis", "Calf swelling without warmth or redness of the skin surface; Doppler."),
  ("Necrotising fasciitis", "Pain out of proportion, anaesthetic dark skin, rapid spread (ICMR STW)."),
  ("Gout or septic arthritis", "Joint-centred swelling and pain on movement."),
  ("Staphylococcal scalded skin syndrome", "Tender erythema progressing to generalised peeling; children (ICMR STW)."),
  ("Contact dermatitis", "Itchy rather than painful; no fever.")],
 criteria=[
  ("Mild cellulitis (ICMR STW)", "Typical cellulitis, no pus focus, no systemic signs: outpatient oral antibiotics."),
  ("Moderate cellulitis (ICMR STW)", "Systemic signs of infection: admit for IV antibiotics."),
  ("Severe cellulitis (ICMR STW)", "Failed oral antibiotics, immunocompromise, bullae, skin sloughing, hypotension or organ dysfunction: broad IV cover and surgical debridement."),
  ("Antibiotics with an abscess (ICMR STW)", "Incision and drainage is primary; add antibiotics for systemic signs, septic phlebitis, multiple or large abscesses, marked cellulitis or immunocompromise."),
  ("Suspect MRSA (ICMR STW)", "Poor immune status, severe systemic signs, MRSA elsewhere, no improvement in 48–72 hours, penetrating trauma.")],
 ruleIn=[
  inv("laboratory", "Gram stain and pus culture", "Pus from abscess or wound", "Organism and sensitivity", "No growth", "Staphylococcus aureus (including MRSA) or streptococci", "Desirable; guides change of antibiotic (ICMR STW).", "bsi", SK),
  inv("laboratory", "Complete blood count", "White cell count", "Sepsis", "White cells 4–11 ×10⁹/L", "Over 12,000 or under 4,000/µL", "Sepsis red flag (ICMR STW).", "bsi", SK),
  inv("laboratory", "Blood glucose", "Random or fasting glucose", "Undiagnosed or uncontrolled diabetes", "Random under 140 mg/dL", "Hyperglycaemia", "Look for diabetes in recurrent or severe infection (ICMR STW).", "bsi", SK)],
 ruleOut=[
  inv("laboratory", "Blood culture", "Two sets", "Bacteraemia", "No growth", "Growth", "Not routine; useful with comorbidities, chemotherapy, immunocompromise or animal bites (ICMR STW).", "bsi", SK),
  inv("firstLineImaging", "Ultrasound of the swelling", "Ultrasound", "Hidden collection", "No fluid collection", "Collection needing drainage", "Finds abscesses that need incision and drainage.", "bsi", SK),
  inv("laboratory", "Creatinine", "Blood test", "Dosing; sepsis", "Creatinine 0.6–1.2 mg/dL", "Raised creatinine", "Adjust piperacillin-tazobactam and vancomycin dosing.", "zosyn", "section 2.4, Table 1")],
 management=[
  step("general", "General care", "All patients", ["Skin and hand hygiene; no oil on the skin; adequate nutrition (ICMR STW).", "Elevate the affected limb in cellulitis; treat predisposing factors such as tinea, scabies or diabetes (ICMR STW).", "Analgesia: paracetamol 500 mg or ibuprofen 400 mg as needed (ICMR STW)."]),
  step("superficial", "Impetigo and folliculitis", "Outpatient", ["Topical antibiotic for 5 days (ICMR STW).", "Oral antibiotic for extensive impetigo, many lesions, lymph node enlargement or outbreaks (ICMR STW).", "Ecthyma: oral antibiotic for 7 days, soak and remove crusts, topical antibiotic on the ulcer (ICMR STW)."]),
  step("abscess", "Abscess, furuncle, carbuncle", "Same day", ["Incision and drainage or debridement is the primary treatment (ICMR STW).", "Add antibiotics only for the indications listed (ICMR STW)."]),
  step("cellulitis", "Cellulitis by severity", "On diagnosis", ["Mild: oral beta-lactam outpatient (ICMR STW).", "Moderate: admit; IV ceftriaxone or amoxicillin-clavulanate; clindamycin if penicillin-allergic (ICMR STW).", "Severe: vancomycin plus piperacillin-tazobactam, surgical debridement, adjust to cultures (ICMR STW)."]),
  step("recurrent", "Recurrent infection", "Follow-up", ["Look for nasal carriage, diabetes, scabies or eczema (ICMR STW).", "Nasal carriers: 2% mupirocin ointment for 5 days a month (ICMR STW)."])],
 branches=[
  ("Superficial (impetigo, folliculitis)", "Localised superficial infection (ICMR STW)."),
  ("Mild cellulitis or infection needing oral antibiotics", "No systemic signs; outpatient (ICMR STW)."),
  ("Moderate cellulitis", "Systemic signs; admitted (ICMR STW)."),
  ("Severe cellulitis", "Failed oral treatment, bullae, sloughing, hypotension, organ dysfunction or immunocompromise (ICMR STW)."),
  ("Suspected or confirmed MRSA — oral", "MRSA suspected, not severely ill (ICMR STW).")],
 regimens=[
  rx("Superficial (impetigo, folliculitis)", "Topical antibiotic", "Impetigo, folliculitis", "Adults and children", "Mupirocin 2% cream", "Thin layer", "Topical", "Per product label (frequency not stated in ICMR STW)", "5 days", "Same use in children.", "Not a beta-lactam.", "No change.", "No change.", ["Response at 5 days"], ["Extensive disease: use oral antibiotics"], "bsi", SK, sel="one-of", pref=True),
  rx("Superficial (impetigo, folliculitis)", "Topical antibiotic", "Impetigo, folliculitis", "Adults and children", "Fusidic acid 2% cream", "Thin layer", "Topical", "Per product label (frequency not stated in ICMR STW)", "5 days", "Same use in children.", "Not a beta-lactam.", "No change.", "No change.", ["Response"], ["Avoid prolonged use (resistance)"], "bsi", SK, sel="one-of", pref=False, use="Mupirocin unavailable."),
  rx("Mild cellulitis or infection needing oral antibiotics", "Oral antibiotic", "Mild cellulitis, extensive impetigo, multiple boils", "Adults", "Cloxacillin", "500 mg", "Oral", "Four times daily", "Until clinical response (duration not stated in STW)", "50 mg/kg/day in divided doses (ICMR STW).", PEN_NO, NS, NS, ["Spread of redness (mark the edge)"], ["Penicillin allergy"], "bsi", SK, sel="one-of", pref=True),
  rx("Mild cellulitis or infection needing oral antibiotics", "Oral antibiotic", "Mild cellulitis", "Adults", "Cephalexin", "250–500 mg", "Oral", "Four times daily", "Until clinical response", "25–50 mg/kg/day in divided doses (ICMR STW).", "Cephalosporin: avoid in penicillin anaphylaxis.", NS, NS, ["Spread of redness"], ["Cephalosporin allergy"], "bsi", SK, sel="one-of", pref=False, use="Cloxacillin unavailable or non-anaphylactic penicillin allergy."),
  rx("Mild cellulitis or infection needing oral antibiotics", "Oral antibiotic", "Mild cellulitis", "Adults", "Amoxicillin-clavulanate", "625 mg", "Oral", "Three times daily", "Until clinical response", "Paediatric dose not stated in the ICMR STW.", PEN_NO, NS, NS, ["Spread of redness"], ["Penicillin allergy"], "bsi", SK, sel="one-of", pref=False, use="Bite wounds or mixed infection, or diabetes needing broader cover (ICMR STW gram-negative note)."),
  rx("Mild cellulitis or infection needing oral antibiotics", "Oral antibiotic", "Mild cellulitis", "Adults", "Clindamycin", "300–600 mg", "Oral", "Two or three times daily", "Until clinical response", "20 mg/kg/day (ICMR STW).", "Not a beta-lactam; ICMR penicillin-allergy option.", NS, NS, ["Diarrhoea"], ["Previous Clostridioides difficile colitis"], "bsi", SK, sel="one-of", pref=False, use="Penicillin allergy."),
  rx("Mild cellulitis or infection needing oral antibiotics", "Oral antibiotic", "Mild cellulitis", "Adults", "Erythromycin", "500 mg", "Oral", "Four times daily", "Until clinical response", "40 mg/kg/day (ICMR STW).", "Not a beta-lactam; ICMR penicillin-allergy option.", NS, NS, ["Gastrointestinal upset"], ["QT prolongation; drug interactions"], "bsi", SK, sel="one-of", pref=False, use="Penicillin allergy and clindamycin unsuitable."),
  rx("Moderate cellulitis", "IV antibiotic", "Moderate cellulitis", "Adults", "Ceftriaxone", "2 g", "IV", "Twice daily (as printed in ICMR STW)", "Switch to oral when improving", ADULT, "Cephalosporin: avoid in penicillin anaphylaxis.", NS, NS, ["Temperature, redness margin daily"], ["Severe beta-lactam allergy"], "bsi", SK, sel="one-of", pref=True),
  rx("Moderate cellulitis", "IV antibiotic", "Moderate cellulitis", "Adults", "Amoxicillin-clavulanate", "1.2 g", "IV", "Three times daily", "Switch to oral when improving", ADULT, PEN_NO, NS, NS, ["Temperature, redness margin"], ["Penicillin allergy"], "bsi", SK, sel="one-of", pref=False, use="Ceftriaxone unavailable."),
  rx("Moderate cellulitis", "IV antibiotic", "Moderate cellulitis", "Adults", "Clindamycin", "600–900 mg", "IV", "Three times daily", "Switch to oral when improving", ADULT, "Not a beta-lactam; for penicillin allergy (ICMR STW).", NS, NS, ["Diarrhoea"], ["Previous C. difficile colitis"], "bsi", SK, sel="one-of", pref=False, use="Penicillin allergy."),
  rx("Severe cellulitis", "MRSA cover", "Severe cellulitis or suspected necrotising infection", "Adults", "Vancomycin", "15 mg/kg", "IV", "Twice daily", "Adjust to cultures", ADULT, "Not a beta-lactam.", "Adjust by levels and creatinine clearance.", NS, ["Trough levels, creatinine"], ["Nephrotoxins"], "bsi", SK),
  rx("Severe cellulitis", "Gram-negative and anaerobic cover", "Severe cellulitis", "Adults", "Piperacillin-tazobactam", "3.375 g (label adult dose)", "IV over 30 minutes", "Every 6 hours", "Adjust to cultures", ADULT, "Do not use; seek microbiology advice.", "Creatinine clearance 20–40 mL/min: 2.25 g every 6 hours; below 20: 2.25 g every 8 hours (label Table 1).", NS, ["Creatinine, cultures"], ["Penicillin allergy"], "zosyn", "sections 2.2, 2.4"),
  rx("Suspected or confirmed MRSA — oral", "Oral MRSA agent", "MRSA skin infection", "Adults", "Co-trimoxazole", "2 double-strength tablets", "Oral", "Twice daily", "Until clinical response", ADULT, "Not a beta-lactam.", "Reduce dose in kidney impairment; check potassium.", NS, ["Potassium, blood count, rash"], ["Sulfonamide allergy; late pregnancy"], "bsi", SK, sel="one-of", pref=True),
  rx("Suspected or confirmed MRSA — oral", "Oral MRSA agent", "MRSA skin infection", "Adults", "Doxycycline", "100 mg", "Oral", "Twice daily", "Until clinical response", "Avoid under 8 years.", "Not a beta-lactam.", NS, NS, ["Photosensitivity"], ["Pregnancy"], "bsi", SK, sel="one-of", pref=False, use="Sulfonamide allergy or co-trimoxazole unsuitable."),
  rx("Suspected or confirmed MRSA — oral", "Oral MRSA agent", "MRSA skin infection", "Adults", "Linezolid", "600 mg", "Oral", "Twice daily", "Until clinical response", ADULT, "Not a beta-lactam.", NS, NS, ["Blood count if over 2 weeks"], ["Serotonergic drugs"], "bsi", SK, sel="one-of", pref=False, use="Other oral MRSA agents unsuitable or resistant.")],
 medNote="All doses except piperacillin-tazobactam are from the ICMR Bacterial Skin Infections STW (July 2022). Drain abscesses: antibiotics are adjuncts. Consider gram-negative cover in diabetes or immunocompromise (ICMR STW). Ceftriaxone frequency is as printed in the STW. Not clinically reviewed.",
 teaching={"scope": "Bacterial skin and soft-tissue infections.", "learningObjectives": ["Match treatment to infection depth and severity.", "Know when to drain and when to add antibiotics.", "Recognise MRSA and necrotising infection."],
  "keyPoints": ["Abscess: drain first.", "Mild cellulitis: oral beta-lactam; elevate the limb.", "Systemic signs: admit for IV antibiotics.", "Pain out of proportion with dark skin: surgery now."],
  "pitfalls": ["Antibiotics without draining an abscess.", "Missing diabetes in recurrent boils.", "Calling bilateral leg redness cellulitis (often stasis dermatitis).", "Missing necrotising fasciitis."],
  "references": [tref("bsi", SK), tref("zosyn", "sections 2.2, 2.4, Table 1")]},
 nonClinical={"patientEducation": ["Keep the skin clean; wash hands; do not apply oil (ICMR STW).", "Raise the affected leg when resting.", "Return if redness spreads beyond the marked line or fever develops."], "lifestyleAndDiet": ["Treat athlete's foot and scabies in the household.", "Control blood sugar in diabetes."], "mdtReferrals": ["Surgeon for abscess drainage or debridement", "Dermatology for recurrent infection", "Diabetes clinic"], "dischargeCriteria": ["Afebrile, redness receding", "Able to take oral antibiotics", "Abscess drained"], "followUpPlan": "Review in 48–72 hours; suspect MRSA if no improvement (ICMR STW)."})
save("t35_ssti.json", [T])
