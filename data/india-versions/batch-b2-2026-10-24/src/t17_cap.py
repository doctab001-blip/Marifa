from h import *
N = "section 12.5, printed p. 83"
PAED = "Adult guideline; for children 2 months–5 years see the childhood pneumonia topic."
PEN_OK = "Not a beta-lactam; suitable in penicillin allergy."
PEN_NO = "Do not use; choose azithromycin, clarithromycin or doxycycline (NTG 2025 alternatives)."
PEN_CEPH = "Cephalosporin: NTG 2025 permits cephalosporins in non-anaphylactic penicillin allergy (section 7.2 table); with anaphylaxis use a non-beta-lactam regimen."
TITLE = "Community-acquired pneumonia in adults (India)"
T = topic(
 id=new_id(TITLE),
 title=TITLE,
 specialty="Pulmonology / Infectious Diseases / Primary Care", authority="ICMR", pillar="Urgent Care",
 scope="Adults with community-acquired pneumonia (CAP) in India, outpatient to intensive care unit (ICU), built on the ICMR Acute Respiratory Infection workflow (October 2019) and the NCDC-ICMR National Treatment Guidelines 2025.",
 findings=[
  "Symptoms, examination, CRB-65 scoring and site of care, referral criteria, investigations, outpatient regimens, inpatient regimens, adjuncts and discharge criteria checked against the ICMR ARI STW (October 2019).",
  "Outpatient, ward and ICU regimens, MRSA and Pseudomonas options and duration checked against NCDC-ICMR NTG 2025, section 12.5 (printed pp. 83–84).",
  "ICMR STW and NTG 2025 differ on amoxicillin dose and the comorbidity regimen; both are shown side by side.",
  "Not clinically reviewed."],
 unverified=[
  "Renal and hepatic antibiotic adjustments are not given in the sources; check the formulary.",
  "Normal laboratory ranges are typical adult values; local antibiograms should guide therapy."],
 summary="Community-acquired pneumonia (CAP) is acute infection of the lung parenchyma acquired outside hospital. Streptococcus pneumoniae is the main target of empiric therapy in India (ICMR STW), with atypical organisms, Haemophilus influenzae, Staphylococcus aureus after influenza, and Pseudomonas aeruginosa in people with structural lung disease or recent antibiotics (NTG 2025). Alveolar inflammation and exudate cause consolidation, impaired gas exchange and hypoxaemia; systemic inflammation can progress to sepsis and respiratory failure. Severity scoring with CRB-65 decides the site of care. Tuberculosis is an important mimic in India, so fluoroquinolones are avoided as empiric therapy and pneumonia that does not resolve in 2 weeks needs TB evaluation (ICMR STW; NTG 2025).",
 mechanisms=[
  "Aspirated or inhaled organisms overcome lung defences and fill alveoli with exudate.",
  "Consolidation causes ventilation-perfusion mismatch and hypoxaemia.",
  "Systemic inflammation can progress to sepsis and organ failure.",
  "Comorbidities and recent antibiotics shift likely organisms and resistance."],
 presentation={
  "symptoms": ["Cough with yellow or rusty sputum", "Breathlessness, pleuritic chest pain", "Fever, malaise, myalgia, arthralgia (ICMR STW)"],
  "physicalSigns": ["Fever, tachycardia, tachypnoea", "Crackles or bronchial breath sounds (ICMR STW)", "Low SpO2", "Confusion in severe disease"],
  "redFlags": ["CRB-65 score above 1 (ICMR STW referral)", "SpO2 92% or less (age 50 or under) or below 90% (over 50) (ICMR STW)", "Respiratory rate above 30/min, abdomino-thoracic paradox, cyanosis, short sentences (ICMR STW)", "Multilobar consolidation, confusion, hypothermia below 36°C, frank haemoptysis (ICMR STW)"],
  "precipitants": ["Diabetes, cardiovascular, kidney or liver disease, cancer, alcohol use (ICMR STW)", "Antibiotics in the last 3 months (ICMR STW)", "Recent influenza", "Structural lung disease (Pseudomonas risk, NTG 2025)"]},
 differentials=[
  ("Pulmonary tuberculosis", "Subacute course, haemoptysis, weight loss; sputum testing; rule out if not resolving in 2 weeks (NTG 2025)."),
  ("Acute exacerbation of asthma or chronic obstructive pulmonary disease (COPD)", "Wheeze with a history of airway disease (ICMR STW)."),
  ("Acute bronchitis", "Fever and cough with normal chest examination or only wheeze; no consolidation (ICMR STW)."),
  ("Heart failure", "Orthopnoea, bilateral crackles, cardiomegaly."),
  ("Lung cancer", "Persistent opacity; repeat chest X-ray if malignancy suspected (ICMR STW).")],
 criteria=[
  ("CRB-65 (ICMR STW)", "One point each: confusion; respiratory rate ≥30/min; low BP (diastolic ≤60 or systolic ≤90 mmHg); age ≥65. Score 0 low risk (outpatient); 1–2 intermediate (inpatient); 3–4 high risk (ICU)."),
  ("Referral to a higher centre (ICMR STW)", "Frank haemoptysis or respiratory failure; CRB-65 above 1; SpO2 ≤92% (age ≤50) or <90% (age >50); multilobar consolidation; confusion; temperature below 36°C."),
  ("Duration", "ICMR: 5 days without comorbidity; 7–10 days with comorbidity or no response by day 3. NTG 2025: 5–7 days; stop by day 5 if clinically stable for 48 hours."),
  ("Discharge (ICMR STW)", "Taking orally, afebrile and haemodynamically stable for at least 48 hours.")],
 ruleIn=[
  inv("firstLineImaging", "Chest X-ray PA view", "Chest radiograph", "Consolidation; multilobar disease", "Clear lung fields", "Lobar or multilobar consolidation", "Preliminary investigation; repeat if not improving or malignancy suspected (ICMR STW).", "ari", "section Investigations"),
  inv("laboratory", "Pulse oximetry", "SpO2", "Hypoxaemia", "95–100%", "92% or less (age ≤50) or below 90% (age >50)", "Referral threshold (ICMR STW).", "ari", "section Referral criteria"),
  inv("laboratory", "Total and differential leucocyte count", "CBC", "Bacterial infection", "White cells 4–11 ×10⁹/L", "Neutrophil leucocytosis", "Supports bacterial infection (ICMR STW).", "ari", "section Laboratory investigation"),
  inv("specializedAdjunctive", "CRB-65 score", "Bedside score", "Mortality risk and site of care", "0", "1–2 intermediate; 3–4 high", "Decides outpatient, ward or ICU care (ICMR STW).", "ari", "section Severity assessment"),
  inv("laboratory", "Sputum microbiology (Gram stain, culture, AFB/NAAT)", "Sputum", "Pathogen; tuberculosis", "No pathogen; AFB negative", "Pathogen identified; AFB or NAAT positive", "In suspected TB and in non-response after 48 hours (ICMR STW).", "ari", "section Investigations")],
 ruleOut=[
  inv("laboratory", "Blood culture (inpatients)", "Two sets before antibiotics", "Bacteraemia", "No growth", "Growth of a pathogen", "Bacteraemic pneumonia may need longer therapy (NTG 2025).", "ntg", N),
  inv("laboratory", "Renal function and glucose", "Creatinine, glucose", "Comorbidity and drug dosing", "Creatinine 0.6–1.2 mg/dL; glucose 70–140 mg/dL", "Raised creatinine; hyperglycaemia", "Comorbidities change the regimen (ICMR STW).", "ari", "section Treatment")],
 management=[
  step("assess", "Assess and score", "First contact", ["Vital signs including SpO2; examine upper and lower respiratory tract; look for respiratory failure (ICMR STW).", "Chest X-ray; score CRB-65 to decide site of care (ICMR STW)."]),
  step("opd", "Outpatient care (CRB-65 0–1)", "Same day", ["Oral antibiotic chosen by comorbidity (see medicines); paracetamol and fluids.", "Do not give corticosteroids unless otherwise indicated, and do not give fluoroquinolones (anti-tubercular activity) (ICMR STW).", "Review at 48–72 hours; extend to 7–10 days if no response by day 3 (ICMR STW)."]),
  step("refer", "Referral and transfer", "When criteria met", ["Give the first antibiotic dose, secure IV access, start 0.9% saline and oxygen 4–6 L/min by face mask during transfer (ICMR STW).", "If drowsy with copious secretions, call the district hospital for intubation and transport ventilator (ICMR STW)."]),
  step("inpatient", "Inpatient and ICU care", "Admission", ["Ward or ICU antibiotic regimen (see medicines); non-invasive ventilation may be used for respiratory failure unless contraindicated (ICMR STW).", "Steroids are not recommended in non-severe CAP (ICMR STW).", "Add an MRSA agent for necrotising pneumonia or pneumonia after influenza (NTG 2025)."], [("Not resolving in 2 weeks", ["Rule out tuberculosis (NTG 2025)."])])],
 branches=[
  ("Outpatient — no comorbidity", "CRB-65 0–1, no comorbidities, no antibiotics in last 3 months."),
  ("Outpatient — with comorbidity", "CRB-65 0–1 with diabetes, heart, kidney or liver disease, cancer, alcohol use or recent antibiotics."),
  ("Inpatient ward", "CRB-65 1–2 or referral criteria."),
  ("ICU — Pseudomonas risk", "ICU patients with structural lung disease, healthcare exposure or antibiotics in last 90 days, or immunocompromise."),
  ("Suspected MRSA", "Necrotising pneumonia or pneumonia after influenza (NTG 2025)."),
  ("Influenza-positive CAP", "CAP with a positive influenza test; treat inpatients regardless of illness duration (ATS/IDSA 2019).")],
 regimens=[
  rx("Outpatient — no comorbidity", "Oral antibiotic", "CAP without comorbidity", "Adults", "Amoxicillin", "1 g", "Oral", "Every 8 hours", "5–7 days", PAED, PEN_NO, NS, NS, ["Clinical response at 48–72 hours"], ["Penicillin allergy"], "ntg", N, sel="one-of", pref=True),
  rx("Outpatient — no comorbidity", "Oral antibiotic", "CAP without comorbidity", "Adults", "Azithromycin", "500 mg", "Oral", "Once daily", "5–7 days", PAED, PEN_OK, NS, NS, ["Clinical response"], ["QT prolongation risk"], "ntg", N, sel="one-of", pref=False, use="Penicillin allergy."),
  rx("Outpatient — no comorbidity", "Oral antibiotic", "CAP without comorbidity", "Adults", "Doxycycline", "100 mg", "Oral", "Twice daily", "5–7 days", PAED, PEN_OK, NS, NS, ["Clinical response"], ["Pregnancy"], "ntg", N, sel="one-of", pref=False, use="Penicillin allergy and azithromycin unsuitable."),
  rx("Outpatient — no comorbidity", "Oral antibiotic", "CAP without comorbidity", "Adults", "Clarithromycin", "500 mg", "Oral", "Twice daily", "5–7 days", PAED, PEN_OK, "Dose reduction needed in severe kidney impairment; check the formulary.", NS, ["Clinical response"], ["QT prolongation; many drug interactions"], "idsa19", "Table 3 footnote", sel="one-of", pref=False, use="Penicillin allergy and azithromycin unavailable (NTG 2025 alternative)."),
  rx("Outpatient — with comorbidity", "Beta-lactam", "CAP with comorbidity", "Adults", "Amoxicillin-clavulanate", "1 g", "Oral", "Twice daily", "5–7 days", PAED, PEN_NO, NS, NS, ["Clinical response"], ["Penicillin allergy"], "ntg", N, sel="one-of", pref=True),
  rx("Outpatient — with comorbidity", "Beta-lactam", "CAP with comorbidity", "Adults", "Cefuroxime", "500 mg", "Oral", "Twice daily", "5–7 days", PAED, PEN_CEPH, NS, NS, ["Clinical response"], ["Severe beta-lactam allergy"], "ntg", N, sel="one-of", pref=False, use="Amoxicillin-clavulanate unsuitable or non-anaphylactic penicillin allergy."),
  rx("Outpatient — with comorbidity", "Atypical cover", "Atypical pathogens", "Adults", "Azithromycin", "500 mg", "Oral", "Once daily", "5–7 days", PAED, PEN_OK, NS, NS, ["Clinical response"], ["QT prolongation risk"], "ntg", N, sel="one-of", pref=True),
  rx("Outpatient — with comorbidity", "Atypical cover", "Atypical pathogens", "Adults", "Doxycycline", "100 mg", "Oral", "Twice daily", "5–7 days", PAED, PEN_OK, NS, NS, ["Clinical response"], ["Pregnancy"], "ntg", N, sel="one-of", pref=False, use="Azithromycin unsuitable."),
  rx("Inpatient ward", "IV beta-lactam", "Hospitalised CAP", "Adults", "Ceftriaxone", "2 g", "IV", "Once daily", "5–7 days", PAED, PEN_CEPH, NS, NS, ["Fever, SpO2, switch to oral when stable"], ["Severe beta-lactam allergy"], "ntg", N, sel="one-of", pref=True),
  rx("Inpatient ward", "IV beta-lactam", "Hospitalised CAP", "Adults", "Amoxicillin-clavulanate", "1.2 g", "IV", "Every 8 hours", "5–7 days", PAED, PEN_NO, NS, NS, ["Fever, SpO2"], ["Penicillin allergy"], "ntg", N, sel="one-of", pref=False, use="Ceftriaxone unavailable."),
  rx("Inpatient ward", "Atypical cover", "Atypical pathogens", "Adults", "Azithromycin", "500 mg", "Oral or IV", "Once daily", "5–7 days", PAED, PEN_OK, NS, NS, ["QT if other QT drugs"], ["QT prolongation risk"], "ntg", N, sel="one-of", pref=True),
  rx("Inpatient ward", "Atypical cover", "Atypical pathogens", "Adults", "Doxycycline", "100 mg", "Oral", "Every 12 hours", "5–7 days", PAED, PEN_OK, NS, NS, ["Clinical response"], ["Pregnancy"], "ntg", N, sel="one-of", pref=False, use="Azithromycin unsuitable."),
  rx("ICU — Pseudomonas risk", "Anti-pseudomonal beta-lactam", "Severe CAP with Pseudomonas risk", "Adults in ICU", "Piperacillin-tazobactam", "4.5 g", "IV", "Every 6 hours", "7 days", PAED, "Do not use; seek specialist advice for a non-penicillin anti-pseudomonal regimen.", NS, NS, ["Cultures, renal function"], ["Penicillin allergy"], "ntg", N, sel="one-of", pref=True),
  rx("ICU — Pseudomonas risk", "Anti-pseudomonal beta-lactam", "Severe CAP with Pseudomonas risk", "Adults in ICU", "Cefepime", "2 g", "IV", "Every 8 hours", "7 days", PAED, PEN_CEPH, "Dose reduction needed in kidney impairment; check the formulary.", NS, ["Cultures, renal function", "Neurotoxicity in kidney impairment"], ["Severe beta-lactam allergy"], "idsa19", "Table 4 footnote", sel="one-of", pref=False, use="Non-anaphylactic penicillin allergy or piperacillin-tazobactam unavailable."),
  rx("ICU — Pseudomonas risk", "Atypical cover", "Atypical pathogens", "Adults in ICU", "Azithromycin", "500 mg", "IV or oral", "Once daily", "7 days", PAED, PEN_OK, NS, NS, ["QT"], ["QT prolongation risk"], "ntg", N),
  rx("Suspected MRSA", "MRSA cover (added to the ward or ICU regimen)", "Necrotising or post-influenza pneumonia", "Adults in hospital", "Vancomycin", "15 mg/kg", "IV", "Every 12 hours, adjusted to levels", "7 days, review with cultures", PAED, PEN_OK, "Adjust by levels and creatinine clearance.", NS, ["Trough or AUC levels", "Creatinine"], ["Nephrotoxicity with other nephrotoxins"], "idsa19", "Table 4 footnote", sel="one-of", pref=True),
  rx("Suspected MRSA", "MRSA cover (added to the ward or ICU regimen)", "Necrotising or post-influenza pneumonia", "Adults in hospital", "Linezolid", "600 mg", "IV or oral", "Every 12 hours", "7 days, review with cultures", PAED, PEN_OK, "No adjustment needed.", NS, ["Blood count if over 2 weeks"], ["Serotonergic drugs; give only after tuberculosis is excluded (NTG 2025)"], "idsa19", "Table 4 footnote", sel="one-of", pref=False, use="Kidney impairment, vancomycin unavailable, or level monitoring not possible."),
  rx("Influenza-positive CAP", "Antiviral (with antibiotics)", "Influenza with pneumonia", "Adults, inpatient or outpatient", "Oseltamivir", "75 mg", "Oral", "Twice daily", "5 days", "1–12 years by weight: 30 mg (15 kg or less), 45 mg (15.1–23 kg), 60 mg (23.1–40 kg), 75 mg (over 40 kg) twice daily; 2 weeks to under 1 year 3 mg/kg twice daily (label section 2.2).", PEN_OK, "Creatinine clearance 30–60 mL/min: 30 mg twice daily; 10–30 mL/min: 30 mg once daily (label section 2.4).", NS, ["Clinical response"], ["Not recommended in end-stage kidney disease not on dialysis (label)"], "osel", "section 2.2")],
 medNote="Regimens follow NCDC-ICMR NTG 2025 section 12.5; the ICMR ARI STW (2019) regimens are shown in the comparison. Avoid empiric fluoroquinolones (ICMR STW). MRSA agents only for necrotising or post-influenza pneumonia (NTG 2025); MRSA, cefepime, clarithromycin and oseltamivir doses are from ATS/IDSA 2019 and the oseltamivir label. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 comparison={"title": "Outpatient CAP antibiotics: ICMR ARI STW vs NTG 2025", "columns": ["ICMR ARI STW (2019)", "NCDC-ICMR NTG (2025)"], "rows": [
   {"parameter": "No comorbidity", "values": ["Amoxicillin 500 mg TDS, or erythromycin 250 mg QID, or doxycycline 100 mg BD; 5 days", "Amoxicillin 1 g q8h; alternatives azithromycin, clarithromycin or doxycycline; 5–7 days"]},
   {"parameter": "With comorbidity", "values": ["Amoxicillin 500 mg TDS + azithromycin 500 mg OD; 7–10 days", "Amoxicillin-clavulanate 1 g BD + doxycycline or azithromycin; 5–7 days"]},
   {"parameter": "Hospitalised, non-ICU", "values": ["IV beta-lactam (cefotaxime 2 g TDS, ceftriaxone 1 g BD or amoxicillin-clavulanate 1.2 g TDS) ± oral macrolide", "Ceftriaxone 2 g OD + azithromycin or doxycycline; 5–7 days"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Adult CAP in India.", "learningObjectives": ["Score CRB-65 and choose site of care.", "Choose an empiric regimen by setting and comorbidity.", "Avoid fluoroquinolones and remember tuberculosis."],
  "keyPoints": ["CRB-65 0 outpatient; 1–2 inpatient; 3–4 ICU.", "Amoxicillin first line for outpatients without comorbidity.", "Stop by day 5 if stable for 48 hours (NTG 2025).", "Not resolving in 2 weeks: rule out TB."],
  "pitfalls": ["Empiric fluoroquinolones masking TB.", "Steroids in non-severe CAP.", "Missing hypoxaemia thresholds by age.", "Prolonged antibiotic courses."],
  "references": [tref("ari", "sections Symptoms, Clinical examination, Severity assessment (CRB-65), Referral criteria, Investigations, Treatment, Inpatient management, Adjunctive therapies, Discharge criteria"), tref("ntg", "section 12.5, printed pp. 83–84"), tref("idsa19", "Tables 3 and 4; Question 13")]},
 nonClinical={"patientEducation": ["Complete the antibiotic course.", "Return for worsening breathlessness, confusion or persistent fever.", "Stop smoking."], "lifestyleAndDiet": ["Plenty of oral fluids and rest (ICMR STW).", "Pneumococcal and influenza vaccination for at-risk adults."], "mdtReferrals": ["Pulmonologist for non-resolving pneumonia", "TB services if TB suspected"], "dischargeCriteria": ["Taking orally (ICMR STW)", "Afebrile for at least 48 hours (ICMR STW)", "Haemodynamically stable for at least 48 hours (ICMR STW)"], "followUpPlan": "Review at 48–72 hours for outpatients; chest X-ray if not improving or malignancy suspected (ICMR STW)."})
save("t17_cap.json", [T])
