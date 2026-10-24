from h import *
PH = "sections Causes, Centor criteria, Red flags, Investigations, Management at PHC, District hospital, Tonsillectomy indications"
ST = "antibiotic dosing table and penicillin-allergy pathway"
TITLE = "Pharyngitis and sore throat (India)"
T = topic(
 id=new_id(TITLE), title=TITLE, specialty="ENT / Primary Care / Paediatrics", authority="ICMR", pillar="Urgent Care",
 scope="Children and adults with acute sore throat in India: separating viral from group A beta-haemolytic streptococcal (GABHS) pharyngitis with the Centor score, deciding who needs antibiotics, and recognising dangerous causes (epiglottitis, deep neck abscess, diphtheria). Built on the ICMR Pharyngitis and Sore Throat workflow (October 2019); maximum doses, penicillin V, benzathine penicillin and penicillin-allergy options from a stewardship algorithm based on AHA 2009 and IDSA 2012.",
 findings=[
  "Causes, bacterial versus viral features, specific syndromes, Centor criteria and actions, red flags, investigations, symptomatic care, amoxicillin 50 mg/kg/day for 10 days, macrolide alternatives, airway compromise management and tonsillectomy criteria checked against the ICMR Pharyngitis STW (October 2019).",
  "Maximum doses and alternatives (penicillin V, benzathine penicillin G, cephalexin, clindamycin, azithromycin) and the penicillin-allergy pathway from the Stanford stewardship algorithm (dosing per American Heart Association (AHA) 2009 and Infectious Diseases Society of America (IDSA) 2012).",
  "ICMR and the AHA-based algorithm differ on amoxicillin dosing frequency; shown side by side.",
  "Not clinically reviewed."],
 unverified=[
  "Analgesic doses are not given in the Pharyngitis STW; paracetamol and ibuprofen doses are taken from the ICMR Bacterial Skin Infections STW.",
  "Ceftriaxone, cefotaxime and steroid doses for epiglottitis or croup are not given in the STW; follow the airway emergency protocol.",
  "Diphtheria antitoxin and peritonsillar abscess drainage are not covered here; see the diphtheria topic.",
  "The adult doses shown are the algorithm's maximum doses for heavier patients; the ICMR STW gives only the weight-based amoxicillin dose."],
 summary="Most sore throats are viral and settle within a week. Group A beta-haemolytic streptococcus (GABHS) is the main bacterial cause; it matters because untreated infection can lead to rheumatic fever, rheumatic heart disease and glomerulonephritis, which remain important in India (ICMR STW). The Centor score (no cough, tonsillar exudate, tender anterior neck nodes, fever) decides who gets antibiotics. Dangerous causes — epiglottitis, deep neck space abscess, diphtheria and infectious mononucleosis — must not be missed.",
 mechanisms=[
  "Viruses or bacteria infect the pharyngeal and tonsillar mucosa, causing inflammation and pain.",
  "GABHS produces exudate, tender nodes and fever without cough.",
  "Cross-reacting antibodies after GABHS can cause rheumatic fever and glomerulonephritis.",
  "Spread into neck spaces causes abscesses that threaten the airway."],
 presentation={
  "symptoms": ["Sore throat, painful swallowing, fever (ICMR STW)", "Runny nose, red eyes, cough or mouth ulcers suggest a virus (ICMR STW)", "Hoarse 'hot potato' voice (abscess) (ICMR STW red flag)"],
  "physicalSigns": ["Tonsillar exudate, tender anterior cervical nodes (ICMR STW)", "Sandpaper-like scarlatiniform rash (GABHS) (ICMR STW)", "Generalised lymph nodes, enlarged liver or spleen (infectious mononucleosis) (ICMR STW)", "Grey adherent membrane beyond the tonsils (diphtheria) (ICMR STW)"],
  "redFlags": ["Drooling, high fever, breathing difficulty in a child: epiglottitis (ICMR STW)", "Hot potato voice or one-sided tonsil swelling (ICMR STW)", "Membrane beyond the tonsils with toxaemia: diphtheria (ICMR STW)", "Generalised lymphadenopathy; heart murmur (ICMR STW)", "Sore throat with agranulocytosis (for example on antithyroid drugs) (ICMR STW)"],
  "precipitants": ["Close contact with infected people", "Influenza epidemics (ICMR STW)", "Smoking and gastro-oesophageal reflux (non-infective sore throat) (ICMR STW)"]},
 differentials=[
  ("Viral pharyngitis", "Cough, coryza, conjunctivitis; low or no fever (ICMR STW)."),
  ("Infectious mononucleosis", "Generalised lymphadenopathy, splenomegaly, atypical lymphocytes; rash if given amoxicillin (ICMR STW)."),
  ("Diphtheria", "Adherent grey membrane extending beyond tonsils, toxaemia (ICMR STW)."),
  ("Epiglottitis or croup", "Drooling, stridor or breathing difficulty in children (ICMR STW)."),
  ("Peritonsillar abscess", "Hot potato voice, one-sided tonsil swelling (ICMR STW).")],
 criteria=[
  ("Centor score (ICMR STW)", "One point each: no cough; tonsillar exudate; tender anterior cervical lymph nodes; fever."),
  ("Action by score (ICMR STW)", "0–1: no antibiotic. 2–3: antibiotic only if rapid antigen test or throat culture is positive. 4: antibiotic without waiting for tests."),
  ("Tonsillectomy referral (ICMR STW)", "More than 7 episodes in the last year; 5 or more a year for 2 years; or 3 or more a year for 3 years.")],
 ruleIn=[
  inv("laboratory", "Throat swab culture", "Culture", "GABHS", "Normal flora", "Beta-haemolytic streptococcus group A", "Essential test; confirms GABHS for Centor 2–3 (ICMR STW).", "phar", PH),
  inv("specializedAdjunctive", "Rapid antigen detection test", "Throat swab", "GABHS", "Negative", "Positive", "Optional; positive result justifies antibiotics at Centor 2–3 (ICMR STW).", "phar", PH),
  inv("laboratory", "Haemogram with differential and peripheral smear", "Blood count", "Infectious mononucleosis; agranulocytosis", "White cells 4–11 ×10⁹/L; no atypical lymphocytes", "Atypical lymphocytes; very low neutrophils", "Essential test (ICMR STW).", "phar", PH)],
 ruleOut=[
  inv("laboratory", "Temperature chart", "Bedside", "Bacterial versus viral", "Under 37.5°C", "Fever (Centor point)", "Fever is absent or low-grade in viral pharyngitis (ICMR STW).", "phar", PH),
  inv("specializedAdjunctive", "Tests for Epstein-Barr virus, herpes, fungal or gonococcal infection", "Serology or swab", "Other causes", "Negative", "Positive", "Desirable in atypical cases (ICMR STW).", "phar", PH)],
 management=[
  step("assess", "Assess", "First contact", ["Look for toxicity, epiglottitis or an oropharyngeal abscess; check hydration (ICMR STW).", "Examine the throat with a tongue depressor and feel for neck and generalised nodes (ICMR STW)."]),
  step("symptoms", "Symptomatic care", "All patients", ["Salt-water gargles, warm drinks, rest (ICMR STW).", "Paracetamol or ibuprofen for pain (ICMR STW)."]),
  step("antibiotic", "Antibiotic decision", "Same visit", ["Score Centor; treat at 4, test at 2–3, do not treat at 0–1 (ICMR STW).", "First choice amoxicillin for 10 days (ICMR STW)."]),
  step("airway", "Airway compromise", "Immediately", ["Suspected epiglottitis or croup: parenteral ceftriaxone or cefotaxime and steroids; refer (ICMR STW).", "Manage deep neck space infection, diphtheria, epiglottitis and croup at district hospital (ICMR STW)."]),
  step("recurrent", "Recurrent tonsillitis", "Follow-up", ["Refer for tonsillectomy if episode criteria are met (ICMR STW)."])],
 branches=[
  ("Pain and fever", "All patients with sore throat (ICMR STW)."),
  ("GABHS pharyngitis", "Centor 4, or Centor 2–3 with a positive antigen test or culture (ICMR STW).")],
 regimens=[
  rx("Pain and fever", "Analgesic", "Sore throat pain", "Adults", "Paracetamol", "500 mg", "Oral", "As needed", "While symptomatic", "Use weight-based paediatric dosing.", NOT_ABX, NS, "Reduce dose in liver disease.", ["Total daily dose"], ["Severe liver disease"], "bsi", "section Folliculitis (analgesia doses)", sel="one-of", pref=True),
  rx("Pain and fever", "Analgesic", "Sore throat pain", "Adults", "Ibuprofen", "400 mg", "Oral", "As needed", "While symptomatic", "Use weight-based paediatric dosing.", NOT_ABX, "Avoid in kidney impairment.", NS, ["Gastrointestinal symptoms"], ["Peptic ulcer; dengue suspected (bleeding risk)"], "bsi", "section Folliculitis (analgesia doses)", sel="one-of", pref=False, use="Paracetamol insufficient and no contraindication to non-steroidal anti-inflammatory drugs."),
  rx("GABHS pharyngitis", "Antibiotic", "Streptococcal pharyngitis", "Children and adults", "Amoxicillin", "50 mg/kg/day (ICMR: in 2–3 divided doses; algorithm: once daily, max 1000 mg/dose)", "Oral", "2–3 times daily (ICMR STW)", "10 days", "Weight-based dose is the paediatric dose (ICMR STW).", "Do not use; see alternatives.", NS, NS, ["Symptom resolution in 2–3 days", "Rash (mononucleosis)"], ["Penicillin allergy; suspected infectious mononucleosis (rash)"], "phar", PH, sel="one-of", pref=True),
  rx("GABHS pharyngitis", "Antibiotic", "Streptococcal pharyngitis", "Over 27 kg", "Penicillin V (phenoxymethylpenicillin)", "500 mg (250 mg if 27 kg or less)", "Oral", "Twice daily", "10 days", "250 mg twice daily if 27 kg or less (algorithm).", "Do not use.", NS, NS, ["Completion of 10 days"], ["Penicillin allergy"], "stan", ST, sel="one-of", pref=False, use="Amoxicillin unavailable."),
  rx("GABHS pharyngitis", "Antibiotic", "Streptococcal pharyngitis", "Over 27 kg", "Benzathine penicillin G", "1,200,000 units (600,000 units if 27 kg or less)", "Intramuscular", "Single dose", "Single dose", "600,000 units if 27 kg or less (algorithm).", "Do not use.", NS, NS, ["Observe for anaphylaxis after injection"], ["Penicillin allergy"], "stan", ST, sel="one-of", pref=False, use="Unlikely to complete a 10-day oral course."),
  rx("GABHS pharyngitis", "Antibiotic", "Streptococcal pharyngitis", "Children and adults", "Cephalexin", "20 mg/kg/dose (max 500 mg)", "Oral", "Twice daily", "10 days", "20 mg/kg/dose (algorithm).", "For non-anaphylactic penicillin allergy only (rash or hives).", NS, NS, ["Response"], ["Penicillin or cephalosporin anaphylaxis"], "stan", ST, sel="one-of", pref=False, use="Penicillin allergy limited to mild delayed rash or hives."),
  rx("GABHS pharyngitis", "Antibiotic", "Streptococcal pharyngitis", "Children and adults", "Azithromycin", "12 mg/kg (max 500 mg)", "Oral", "Once daily", "5 days", "12 mg/kg once daily (algorithm).", "Not a beta-lactam; ICMR alternative in penicillin allergy.", NS, NS, ["Response; resistance rising — culture if possible"], ["QT prolongation"], "stan", ST, sel="one-of", pref=False, use="Immediate or severe penicillin allergy (ICMR: erythromycin or azithromycin)."),
  rx("GABHS pharyngitis", "Antibiotic", "Streptococcal pharyngitis", "Children and adults", "Clindamycin", "7 mg/kg/dose (max 300 mg)", "Oral", "Three times daily", "10 days", "7 mg/kg/dose (algorithm).", "Not a beta-lactam.", NS, NS, ["Diarrhoea"], ["Previous C. difficile colitis"], "stan", ST, sel="one-of", pref=False, use="Severe penicillin allergy and macrolide unsuitable.")],
 medNote="ICMR STW: amoxicillin 50 mg/kg/day for 10 days, erythromycin or azithromycin if penicillin-allergic. Maximum doses and other alternatives are from the Stanford algorithm (AHA 2009 dosing), which strongly discourages non-penicillin alternatives unless needed. Analgesic doses from the ICMR Bacterial Skin Infections STW. Not clinically reviewed.",
 comparison={"title": "Amoxicillin for GABHS pharyngitis: ICMR vs AHA-based algorithm", "columns": ["ICMR Pharyngitis STW (2019)", "Stanford algorithm (AHA 2009 dosing)"], "rows": [
   {"parameter": "Dose and frequency", "values": ["50 mg/kg/day in 2–3 divided doses", "50 mg/kg once daily, max 1000 mg/dose"]},
   {"parameter": "Duration", "values": ["10 days", "10 days"]},
   {"parameter": "Penicillin allergy", "values": ["Erythromycin or azithromycin", "Cephalexin if mild delayed reaction; clindamycin or azithromycin otherwise"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Acute sore throat.", "learningObjectives": ["Use the Centor score to decide on antibiotics.", "Choose and dose the right antibiotic.", "Recognise airway and diphtheria red flags."],
  "keyPoints": ["Centor 0–1: no antibiotic.", "Centor 4: amoxicillin for 10 days.", "Drooling or breathing difficulty in a child: airway emergency.", "Membrane beyond the tonsils: think diphtheria."],
  "pitfalls": ["Antibiotics for viral sore throat.", "Short courses of penicillin for GABHS (10 days needed).", "Amoxicillin rash in infectious mononucleosis.", "Examining the throat of a child with suspected epiglottitis outside a safe setting."],
  "references": [tref("phar", PH), tref("stan", ST), tref("bsi", "section Folliculitis (analgesia)")]},
 nonClinical={"patientEducation": ["Most sore throats get better within a week without antibiotics.", "If prescribed, finish the full 10-day course to prevent rheumatic fever.", "Return for breathing difficulty, drooling or inability to swallow."], "lifestyleAndDiet": ["Warm fluids, salt-water gargles, rest (ICMR STW).", "Stop smoking."], "mdtReferrals": ["ENT for abscess, recurrent tonsillitis or airway compromise", "Paediatrics for epiglottitis or croup"], "dischargeCriteria": ["Swallowing fluids", "No airway compromise"], "followUpPlan": "Return if not better in 3–5 days or with red flags; ENT review for tonsillectomy criteria (ICMR STW)."})
save("t36_pharyngitis.json", [T])
