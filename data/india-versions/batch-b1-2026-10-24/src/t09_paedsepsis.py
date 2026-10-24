from h import *
AB = "section Antibiotics"
SH = "section Poor perfusion (shock) pathway"
P = "This is the paediatric regimen (ICMR STW, children 2–59 months)."
PEN_CEPH = "Cephalosporin: use with caution in non-anaphylactic penicillin allergy (NCDC-ICMR NTG 2025 section 7.2 approach); with past anaphylaxis seek specialist advice."
PEN_NO = "Do not use; it is a penicillin. Seek specialist advice for an alternative."
GENTA_CKD = "Extend the interval or reduce the dose by serum creatinine (gentamicin label)."
TITLE = "Sepsis and septic shock in children (India)"
T = topic(
 id=new_id(TITLE),
 title=TITLE,
 specialty="Paediatrics / Emergency Medicine / Critical Care", authority="ICMR", pillar="Urgent Care",
 scope="Children aged 2–59 months with suspected sepsis or septic shock in Indian facilities, built on the ICMR Sepsis and Septic Shock in Children workflow (October 2019), with gentamicin renal cautions from the US label.",
 findings=[
  "Recognition, history, examination, triage thresholds, oxygen, fluid boluses, diarrhoeal shock fluids, adrenaline preparation, antibiotic doses, danger signs, blood-pressure thresholds, investigations, complications, referral, endpoints and discharge criteria checked against the ICMR STW (October 2019).",
  "Not clinically reviewed."],
 unverified=[
  "The ICMR workflow gives no lactate or resolution targets for capillary refill or blood pressure; none are invented here.",
  "Antibiotic durations are not given by the workflow beyond 'complete the course, adjusted to culture'.",
  "Normal values are typical paediatric values; age-specific charts apply."],
 summary="Sepsis is life-threatening organ dysfunction caused by a dysregulated host response to infection. In children aged 2–59 months in India, common sources are pneumonia, diarrhoea, skin and soft-tissue infection, meningitis, and tropical infections such as malaria and dengue (ICMR STW). Inflammatory mediators cause vasodilation, capillary leak and myocardial depression, so the child develops tachycardia, cold peripheries, weak pulses and capillary refill longer than 3 seconds before blood pressure falls — hypotension is a late sign in children. Untreated shock leads to multi-organ failure. The ICMR pathway is rapid triage by perfusion, oxygen, antibiotics within 1 hour, 20 mL/kg fluid boluses with careful reassessment for fluid overload, adrenaline for persistent shock, and early referral to a centre with intensive care (ICMR STW).",
 mechanisms=[
  "Infection triggers a systemic inflammatory response with vasodilation and capillary leak.",
  "Reduced effective circulating volume and myocardial depression cause poor perfusion.",
  "Compensatory tachycardia and vasoconstriction keep blood pressure normal until late.",
  "Ongoing hypoperfusion causes organ dysfunction: altered consciousness, oliguria, respiratory failure."],
 presentation={
  "symptoms": ["Fever with or without rash; pneumonia or diarrhoea (ICMR STW)", "Poor feeding, lethargy, reduced responsiveness", "Convulsions, excessive vomiting", "Reduced urine output (ICMR STW)"],
  "physicalSigns": ["Tachycardia: above 180/min under 12 months, above 120/min over 12 months (ICMR STW)", "Cold peripheries, weak pulse, capillary refill above 3 seconds", "Respiratory distress: retractions, flaring, grunting", "Petechiae, mottling, cyanosis, pallor (ICMR STW)"],
  "redFlags": ["AVPU below Alert (ICMR STW)", "Capillary refill above 3 seconds or weak or bounding pulse (ICMR STW)", "SpO2 below 95% (ICMR STW)", "Systolic BP below 70 mmHg under 1 year, or below 70 + (2 × age in years) over 1 year (ICMR STW)", "Hepatomegaly, falling SpO2 or new crepitations during fluids: stop fluids (ICMR STW)"],
  "precipitants": ["Pneumonia, diarrhoea, skin and soft-tissue infection (ICMR STW)", "Severe acute malnutrition", "Incomplete immunisation (ICMR STW history)", "Chronic illness or recurrent infection"]},
 differentials=[
  ("Hypovolaemic shock from diarrhoea", "Severe dehydration signs; responds to fluid (ICMR STW)."),
  ("Cardiogenic shock (heart disease, myocarditis)", "Murmur, gallop, hepatomegaly, sweating with feeds; give fluids cautiously (ICMR STW)."),
  ("Dengue shock", "Fever with rising haematocrit and falling platelets; follow the dengue STW (ICMR STW)."),
  ("Severe malaria", "Positive rapid malaria antigen test (ICMR STW)."),
  ("Meningitis or encephalitis", "Meningeal signs, seizures; CSF study (ICMR STW).")],
 criteria=[
  ("Suspect sepsis (ICMR STW)", "Child 2–59 months with any infection and risk of life-threatening organ dysfunction."),
  ("Poor perfusion (ICMR STW)", "Fast pulse (above 180/min under 12 months; above 120/min over 12 months), cold peripheries, poor pulse volume, capillary refill above 3 seconds."),
  ("Hypotension (ICMR STW)", "Systolic BP below 70 mmHg under 1 year; below 70 + (2 × age in years) over 1 year."),
  ("Adequate urine output (ICMR STW)", "Above 1 mL/kg/hour."),
  ("Discharge (ICMR STW)", "Afebrile for 48 hours, vital signs normal for age, good oral intake.")],
 ruleIn=[
  inv("laboratory", "Blood culture", "Culture before antibiotics", "Bacteraemia", "No growth", "Growth of a pathogen", "Desirable; adjust antibiotics to sensitivity (ICMR STW).", "psep", "section Investigations"),
  inv("laboratory", "Complete blood count and peripheral smear", "CBC, smear", "Infection, malaria, anaemia", "Haemoglobin 11–14 g/dL; white cells 6–17 ×10⁹/L (infant-to-preschool range)", "Leucocytosis or leucopenia; parasites; low platelets", "Essential test (ICMR STW).", "psep", "section Investigations"),
  inv("laboratory", "C-reactive protein", "CRP", "Bacterial infection", "Below 10 mg/L", "Raised", "Essential test (ICMR STW).", "psep", "section Investigations"),
  inv("laboratory", "Blood glucose and electrolytes", "Capillary glucose; sodium, potassium", "Hypoglycaemia and electrolyte disturbance", "Glucose 70–140 mg/dL; sodium 135–145 mEq/L", "Hypoglycaemia; hyponatraemia", "Essential tests (ICMR STW).", "psep", "section Investigations"),
  inv("laboratory", "Rapid malaria antigen test and dengue NS1/IgM", "Point-of-care and serology", "Malaria or dengue as cause", "Negative", "Positive", "Disease-specific desirable tests (ICMR STW).", "psep", "section Investigations"),
  inv("firstLineImaging", "Chest X-ray", "Chest radiograph", "Pneumonia as source", "Clear lung fields", "Consolidation or effusion", "Desirable test (ICMR STW).", "psep", "section Investigations")],
 ruleOut=[
  inv("laboratory", "Renal and liver function tests", "Urea, creatinine, ALT", "Organ dysfunction", "Creatinine 0.2–0.5 mg/dL (young child); ALT below 40 U/L", "Raised creatinine or transaminases", "Essential tests (ICMR STW).", "psep", "section Investigations"),
  inv("laboratory", "Urine routine", "Urinalysis", "Urinary tract infection as source", "No pus cells", "Pyuria", "Essential test (ICMR STW).", "psep", "section Investigations"),
  inv("laboratory", "Cerebrospinal fluid study", "Lumbar puncture when safe", "Meningitis", "Clear; cells below 5/mm³", "Turbid; raised cells and protein, low glucose", "Desirable when meningitis is suspected (ICMR STW).", "psep", "section Investigations")],
 management=[
  step("triage", "Triage by perfusion", "First 5 minutes", ["Check AVPU, pulse volume, heart and respiratory rate, capillary refill, SpO2 and blood pressure for age (ICMR STW).", "Good perfusion: admit or treat per IMNCI. Poor perfusion: admit, treat and refer to a centre with an intensive care unit (ICU), ventilation and 24-hour monitoring if needed (ICMR STW)."]),
  step("oxygen-access", "Oxygen, access, antibiotics", "First hour", ["Oxygen by face mask 4–6 L/min or hood 8–10 L/min (nasal prongs 1–2 L/min if unavailable); target SpO2 above 95% (ICMR STW).", "Insert two IV cannulas; give the first antibiotic dose within 1 hour (ICMR STW)."]),
  step("fluids", "Fluid boluses for shock", "First hour", ["Normal saline 20 mL/kg over 20–30 minutes; repeat 20 mL/kg over 30 minutes (ICMR STW).", "Stop fluids if hepatomegaly, falling SpO2 or chest crepitations appear (ICMR STW).", "Suspected heart disease: give boluses cautiously (ICMR STW)."], [("Hypovolaemic shock with diarrhoea that improves after the first bolus", ["Give 70 mL/kg over 5 hours in infants or 2.5 hours in older children, plus ongoing losses (ICMR STW)."]), ("Other illness after stabilisation", ["Start maintenance fluids (ICMR STW)."])]),
  step("persistent-shock", "Persistent shock and complications", "After the second bolus", ["Start adrenaline infusion and refer to a higher centre (ICMR STW).", "Respiratory failure (rising respiratory rate or SpO2 not above 94% on oxygen): CPAP, BiPAP or ventilation (ICMR STW).", "Heart failure: dobutamine or milrinone with furosemide (ICMR STW)."], [("Refer", ["Shock not improving after the second bolus, fluid overload or no continuous monitoring; counsel parents and inform the receiving centre (ICMR STW)."])])],
 branches=[
  ("Antibiotics — over 3 months", "Children aged 3–59 months with suspected sepsis."),
  ("Antibiotics — under 3 months", "Infants aged 2–3 months with suspected sepsis."),
  ("Soft-tissue infection", "Sepsis with skin or soft-tissue focus."),
  ("Shock — fluids", "Poor perfusion."),
  ("Shock — vasoactive", "Shock persisting after fluid boluses.")],
 regimens=[
  rx("Antibiotics — over 3 months", "Empiric antibiotic", "Suspected sepsis", "Children 3–59 months", "Ceftriaxone", "100 mg/kg/day", "IV", "In 2 divided doses", "Complete the course; adjust to culture", P, PEN_CEPH, NS, NS, ["Temperature, perfusion", "Culture result"], ["Severe beta-lactam allergy"], "psep", AB),
  rx("Antibiotics — under 3 months", "Beta-lactam", "Suspected sepsis", "Infants 2–3 months", "Cefotaxime", "200 mg/kg/day", "IV", "Divided every 6–8 hours", "Complete the course; adjust to culture", P, PEN_CEPH, NS, NS, ["Temperature, perfusion", "Culture result"], ["Severe beta-lactam allergy"], "psep", AB),
  rx("Antibiotics — under 3 months", "Aminoglycoside", "Suspected sepsis (added to cefotaxime)", "Infants 2–3 months", "Gentamicin", "5–7.5 mg/kg", "IV", "Once daily", "Complete the course; adjust to culture", P, "Not a beta-lactam; suitable in penicillin allergy.", GENTA_CKD, NS, ["Urine output and creatinine", "Hearing in prolonged use"], ["Other nephrotoxic drugs and loop diuretics (label)"], "psep", AB, extra_adj=("Renal adjustment from the gentamicin label (DailyMed).",)),
  rx("Soft-tissue infection", "Anti-staphylococcal antibiotic", "Sepsis with soft-tissue focus (add or substitute)", "Children 2–59 months", "Cloxacillin", "200 mg/kg/day", "IV", "Divided every 6 hours", "Complete the course; adjust to culture", P, PEN_NO, NS, NS, ["Wound and fever"], ["Penicillin allergy"], "psep", AB, sel="one-of", pref=True),
  rx("Soft-tissue infection", "Anti-staphylococcal antibiotic", "Sepsis with soft-tissue focus (add or substitute)", "Children 2–59 months", "Amoxicillin-clavulanate", "30 mg/kg/dose", "IV", "Every 8 hours", "Complete the course; adjust to culture", P, PEN_NO, NS, NS, ["Wound and fever"], ["Penicillin allergy"], "psep", AB, sel="one-of", pref=False, use="Cloxacillin unavailable."),
  rx("Shock — fluids", "Fluid bolus", "Septic shock", "Children 2–59 months with poor perfusion", "Sodium chloride 0.9%", "20 mL/kg over 20–30 minutes; repeat 20 mL/kg over 30 minutes", "IV", "Up to 2 boluses, reassess after each", "Until perfusion improves or overload signs appear", P, NOT_ABX, NS, NS, ["Heart rate, capillary refill, liver size, SpO2, crepitations after each bolus (ICMR STW)"], ["Stop for hepatomegaly, falling SpO2 or crepitations", "Suspected heart disease: cautious boluses"], "psep", SH),
  rx("Shock — vasoactive", "Vasopressor", "Shock persisting after fluids", "Children 2–59 months", "Adrenaline", "0.3 mg/kg in 50 mL normal saline or 5% dextrose at 1 mL/hour (about 0.1 mcg/kg/min)", "IV infusion", "Continuous", "Until shock resolves; refer to a higher centre", P, NOT_ABX, NS, NS, ["Heart rate, perfusion, blood pressure", "Urine output above 1 mL/kg/hour"], ["Extravasation: use a secure line"], "psep", "section Vasoactive drug")],
 medNote="All doses are from the ICMR Sepsis and Septic Shock in Children STW (October 2019); gentamicin renal advice is from the US label. Adults: see the adult sepsis topic. India-only topic; no Saudi topic is affected. Not clinically reviewed.",
 teaching={"scope": "Sepsis and septic shock in children 2–59 months in India.", "learningObjectives": ["Recognise poor perfusion before hypotension.", "Give oxygen and antibiotics within 1 hour.", "Give fluid boluses safely and know when to stop."],
  "keyPoints": ["Antibiotic within 1 hour.", "Normal saline 20 mL/kg over 20–30 minutes; repeat once.", "Stop fluids for hepatomegaly, crepitations or falling SpO2.", "Adrenaline 0.3 mg/kg in 50 mL at 1 mL/h ≈ 0.1 mcg/kg/min."],
  "pitfalls": ["Waiting for hypotension.", "Fluid overload in heart disease or malnutrition.", "Delayed referral when shock persists.", "Missing malaria or dengue."],
  "references": [tref("psep", "sections Suspect, History, Examination, Triage, Pathways, Vasoactive drug, Antibiotics, Danger signs, Investigations, Complications, Referral, Discharge"), tref("genta", "section Dosage in impaired renal function")]},
 nonClinical={"patientEducation": ["Explain danger signs: lethargy, poor feeding, fast breathing, cold hands and feet.", "Complete immunisation.", "Return at once if the child worsens."], "lifestyleAndDiet": ["Continue breastfeeding and feeding as tolerated.", "Assess nutrition; follow the SAM STW if malnourished (ICMR STW)."], "mdtReferrals": ["Paediatric intensive care for persistent shock or respiratory failure (ICMR STW)", "Nutrition services for malnutrition"], "dischargeCriteria": ["Afebrile for 48 hours (ICMR STW)", "Vital signs normal for age (ICMR STW)", "Good oral intake (ICMR STW)"], "followUpPlan": "Review within a few days of discharge to complete the antibiotic course and check growth and immunisation status."})
save("t09_paedsepsis.json", [T])
