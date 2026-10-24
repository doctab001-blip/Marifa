from h import *
PH = "section Pharmacotherapy"
PAED = "Adult workflow; paediatric doses are not given in the ICMR STW."
PEN_CEPH = "NCDC-ICMR NTG 2025 permits a cephalosporin in non-anaphylactic penicillin allergy (section 7.2 table); with past anaphylaxis to beta-lactams seek specialist advice."
TITLE = "Acute upper gastrointestinal bleeding (India)"
T = topic(
 id=new_id(TITLE),
 title=TITLE,
 specialty="Gastroenterology / Emergency Medicine", authority="ICMR", pillar="Urgent Care",
 scope="Adults with acute upper gastrointestinal bleeding (haematemesis or melaena) in Indian facilities, built on the ICMR Acute GI Bleed workflow Part A (July 2020), with a label caution for terlipressin.",
 findings=[
  "Diagnosis, clinical evaluation, essential and desirable tests, high-risk criteria, resuscitation targets, PPI, vasoconstrictor and antibiotic doses, transfusion thresholds and endoscopy timing checked against the ICMR STW Part A (July 2020).",
  "Terlipressin ischaemia and hypoxia cautions checked against the US label, whose approved indication is hepatorenal syndrome, not bleeding.",
  "Not clinically reviewed."],
 unverified=[
  "The ICMR STW does not include a formal risk score such as Glasgow-Blatchford; none is used here.",
  "Endoscopic therapy and surgery are in ICMR STW Part B, which was not reviewed for this version.",
  "No paediatric doses are given; normal laboratory ranges are typical adult values."],
 summary="Acute upper gastrointestinal bleeding arises proximal to the ligament of Treitz and presents with haematemesis, blood in the nasogastric aspirate or melaena. In India the two main groups are non-variceal bleeding — mostly peptic ulcers linked to NSAIDs, aspirin, antiplatelets and anticoagulants — and variceal bleeding from portal hypertension in cirrhosis, often from alcohol or chronic hepatitis B or C (ICMR STW). Ulcer bleeding comes from erosion into a submucosal artery; acid impairs clot stability, so high-dose proton pump inhibitor (PPI) helps. Variceal bleeding is driven by high portal pressure, which vasoconstrictors such as terlipressin, somatostatin or octreotide lower; cirrhotic patients who bleed are also prone to infection. Rapid loss causes hypovolaemic shock, so early resuscitation, risk assessment and endoscopy within 24 hours are the core of care (ICMR STW).",
 mechanisms=[
  "Peptic ulcer erodes a submucosal vessel; acid destabilises the clot.",
  "Portal hypertension dilates gastro-oesophageal varices that rupture under pressure.",
  "Antiplatelets, anticoagulants and NSAIDs precipitate and worsen bleeding.",
  "Blood loss causes hypovolaemia, tachycardia, hypotension and syncope."],
 presentation={
  "symptoms": ["Haematemesis", "Black tarry stools (melaena)", "Postural giddiness or breathlessness (rapid loss)", "Epigastric pain (ulcer) or alcohol use and jaundice (varices) (ICMR STW)"],
  "physicalSigns": ["Tachycardia, hypotension", "Pallor", "Jaundice, ascites, splenomegaly (suggest varices) (ICMR STW)", "Melaena on rectal examination"],
  "redFlags": ["Systolic BP below 90 mmHg (ICMR STW high-risk)", "Pulse above 100/min (ICMR STW)", "History of syncope or altered sensorium (ICMR STW)", "SpO2 below 90% (ICMR STW)", "Age above 60 years or significant comorbidity (ICMR STW)", "Altered sensorium with active bleeding: secure the airway (ICMR STW)"],
  "precipitants": ["NSAIDs and aspirin", "Antiplatelets and anticoagulants", "Alcohol", "Chronic liver disease from hepatitis B or C or past transfusion (ICMR STW)"]},
 differentials=[
  ("Lower GI bleeding", "Fresh blood per rectum or maroon stools; brisk upper bleeding can mimic it (ICMR STW)."),
  ("Swallowed blood from nose or mouth", "Epistaxis or oral bleeding; no melaena."),
  ("Haemoptysis", "Frothy bright blood with cough."),
  ("Iron or bismuth stools", "Black but not tarry; no anaemia or haemodynamic change.")],
 criteria=[
  ("Diagnosis (ICMR STW)", "History of haematemesis; upper GI source suggested by haematemesis, blood in the nasogastric tube or melaena."),
  ("High risk — refer after resuscitation (ICMR STW)", "Systolic BP below 90 mmHg, syncope, altered sensorium, SpO2 below 90%, age above 60 years and/or significant comorbidity, pulse above 100/min."),
  ("Resuscitation targets (ICMR STW)", "Systolic BP above 90 mmHg, pulse below 100/min, SpO2 above 90%, haemoglobin above 7 g/dL (above 9 g/dL in heart disease)."),
  ("Transfusion (ICMR STW)", "Packed red cells or whole blood if haemoglobin below 7 g/dL, or below 9 g/dL with pre-existing heart disease.")],
 ruleIn=[
  inv("laboratory", "Haemoglobin", "Complete blood count", "Severity of blood loss", "Haemoglobin 12–17 g/dL", "Below 7 g/dL (transfuse); below 9 g/dL in heart disease", "Guides transfusion (ICMR STW).", "ugib", "sections Investigations and Blood transfusion"),
  inv("laboratory", "Platelet count and PT/INR", "Coagulation", "Coagulopathy, cirrhosis", "Platelets 150–400 ×10⁹/L; INR 0.8–1.2", "Low platelets or raised INR", "Essential test; suggests liver disease (ICMR STW).", "ugib", "section Investigations"),
  inv("laboratory", "Blood group and cross-match", "Blood bank", "Transfusion readiness", "Not applicable — compatibility test", "Cross-matched units available", "Essential before transfusion (ICMR STW).", "ugib", "section Investigations"),
  inv("specializedAdjunctive", "Upper GI endoscopy", "Oesophagogastroduodenoscopy", "Source of bleeding; varices or ulcer", "Normal mucosa", "Bleeding ulcer or varices", "All cases within 24 hours of stabilisation; earlier if actively bleeding; therapy per Part B (ICMR STW).", "ugib", "section Endoscopy"),
  inv("laboratory", "Liver function tests, HBsAg and anti-HCV", "LFT and viral markers", "Chronic liver disease (variceal bleeding)", "Bilirubin below 1.2 mg/dL; albumin 3.5–5 g/dL; viral markers negative", "Raised bilirubin, low albumin, positive viral markers", "Desirable tests pointing to cirrhosis (ICMR STW).", "ugib", "section Investigations")],
 ruleOut=[
  inv("laboratory", "Blood urea and creatinine", "Renal function", "Hypovolaemic kidney injury; upper GI source", "Urea 15–40 mg/dL; creatinine 0.6–1.2 mg/dL", "Raised urea out of proportion to creatinine", "Desirable test (ICMR STW).", "ugib", "section Investigations"),
  inv("firstLineImaging", "Abdominal ultrasound", "USG abdomen", "Cirrhosis, splenomegaly, ascites", "Normal liver and spleen", "Coarse liver, splenomegaly, ascites", "Desirable test supporting portal hypertension (ICMR STW).", "ugib", "section Investigations"),
  inv("laboratory", "Total leucocyte count", "CBC", "Infection, infective cause of bleeding", "4–11 ×10⁹/L", "Raised", "Essential test (ICMR STW).", "ugib", "section Investigations")],
 management=[
  step("resuscitate", "Resuscitate", "First 15–60 minutes", ["At least one 18G IV cannula; Ringer's lactate or normal saline (ICMR STW).", "Oxygen 2 L/min in high-risk patients and shock (ICMR STW).", "Nasogastric tube and lavage (ICMR STW).", "Secure the airway if sensorium is altered and bleeding is active; intensive care unit (ICU) care as needed (ICMR STW)."]),
  step("stop-precipitants", "Stop precipitants", "Immediately", ["Stop aspirin, NSAIDs, antiplatelets and anticoagulants (ICMR STW).", "Recent myocardial infarction or stent: consult a cardiologist before stopping antiplatelets (ICMR STW)."]),
  step("drugs", "Drugs before endoscopy", "Immediately", ["IV PPI for all suspected GI bleeds; stop it if variceal bleeding is documented (ICMR STW).", "Suspected variceal bleed: add one vasoconstrictor (ICMR STW).", "Antibiotic as per ICMR STW (see medicines)."], [("Lower GI bleed with fever (infective cause)", ["Ceftriaxone 2 g IV 12-hourly with metronidazole 500 mg IV 8-hourly (ICMR STW)."])]),
  step("transfuse", "Transfuse to target", "Ongoing", ["Packed red cells or whole blood if haemoglobin below 7 g/dL (below 9 g/dL with heart disease) (ICMR STW).", "Targets: systolic BP above 90 mmHg, pulse below 100/min, SpO2 above 90% (ICMR STW)."]),
  step("endoscopy-refer", "Endoscopy and referral", "Within 24 hours", ["Endoscopy within 24 hours of stabilisation; earlier with active ongoing bleeding; take informed consent (ICMR STW).", "Refer all high-risk patients after initial resuscitation (ICMR STW).", "Endoscopic therapy or surgery per ICMR STW Part B."])],
 branches=[
  ("All suspected upper GI bleeding", "Haematemesis or melaena."),
  ("Suspected variceal bleeding", "Alcohol use, jaundice, ascites, splenomegaly or known cirrhosis.")],
 regimens=[
  rx("All suspected upper GI bleeding", "Proton pump inhibitor", "Suspected ulcer bleeding", "Adults", "Pantoprazole", "80 mg stat, then 40 mg", "IV (oral if IV unavailable)", "Every 12 hours", "Until endoscopy decides; stop if variceal bleeding documented", PAED, NOT_ABX, NS, NS, ["Rebleeding signs"], ["Stop when bleeding is shown to be variceal (ICMR STW)"], "ugib", PH, sel="one-of", pref=True),
  rx("All suspected upper GI bleeding", "Proton pump inhibitor", "Suspected ulcer bleeding", "Adults", "Esomeprazole", "80 mg stat, then 40 mg", "IV (oral if IV unavailable)", "Every 12 hours", "Until endoscopy decides; stop if variceal bleeding documented", PAED, NOT_ABX, NS, NS, ["Rebleeding signs"], ["Stop when bleeding is shown to be variceal (ICMR STW)"], "ugib", PH, sel="one-of", pref=False, use="Pantoprazole unavailable."),
  rx("All suspected upper GI bleeding", "Antibiotic", "Infection prophylaxis in GI bleeding (ICMR STW: all patients)", "Adults", "Ceftriaxone", "1 g", "IV", "Every 12 hours", "3–5 days", PAED, PEN_CEPH, NS, NS, ["Temperature", "Clinical response"], ["Severe beta-lactam allergy"], "ugib", PH, sel="one-of", pref=True),
  rx("All suspected upper GI bleeding", "Antibiotic", "Infection prophylaxis in GI bleeding (ICMR STW: all patients)", "Adults", "Cefotaxime", "1 g", "IV", "Every 8 hours", "3–5 days", PAED, PEN_CEPH, NS, NS, ["Temperature"], ["Severe beta-lactam allergy"], "ugib", PH, sel="one-of", pref=False, use="Ceftriaxone unavailable."),
  rx("Suspected variceal bleeding", "Vasoconstrictor", "Lower portal pressure", "Adults with suspected variceal bleeding", "Terlipressin", "2 mg stat, then 1 mg", "IV", "Every 6 hours", "3–5 days", PAED, NOT_ABX, NS, "Label (hepatorenal syndrome use): do not start if SpO2 below 90%; risk of respiratory failure with volume overload.", ["Examine regularly for peripheral or cardiac ischaemia (ICMR STW)", "SpO2 (label)"], ["Suspected heart disease or peripheral vascular disease (ICMR STW)", "Ongoing coronary, peripheral or mesenteric ischaemia (label)", "Pregnancy: may cause fetal harm (label)"], "ugib", PH, sel="one-of", pref=True, extra_adj=("Ischaemia, hypoxia and pregnancy cautions from the terlipressin label (DailyMed), boxed warning and section 4.",)),
  rx("Suspected variceal bleeding", "Vasoconstrictor", "Lower portal pressure", "Adults with suspected variceal bleeding", "Somatostatin", "250 µg stat, then 250 µg/hour", "IV infusion", "Continuous", "3–5 days", PAED, NOT_ABX, NS, NS, ["Glucose", "Rebleeding signs"], ["None specific in the cited source"], "ugib", PH, sel="one-of", pref=False, use="Terlipressin contraindicated (heart or peripheral vascular disease) or unavailable."),
  rx("Suspected variceal bleeding", "Vasoconstrictor", "Lower portal pressure", "Adults with suspected variceal bleeding", "Octreotide", "50 µg stat, then 50 µg/hour", "IV infusion", "Continuous", "3–5 days", PAED, NOT_ABX, NS, NS, ["Glucose", "Rebleeding signs"], ["None specific in the cited source"], "ugib", PH, sel="one-of", pref=False, use="Terlipressin contraindicated and somatostatin unavailable.")],
 medNote="Doses are from the ICMR Acute GI Bleed STW Part A (July 2020); terlipressin cautions are from the US label for hepatorenal syndrome. India-only topic; no Saudi topic is affected. Not clinically reviewed.",
 teaching={"scope": "Acute upper GI bleeding in adults in India.", "learningObjectives": ["Identify high-risk features and resuscitate to target.", "Start PPI for all and a vasoconstrictor for suspected varices.", "Arrange endoscopy within 24 hours."],
  "keyPoints": ["Transfuse below 7 g/dL (below 9 g/dL with heart disease).", "Pantoprazole 80 mg IV stat then 40 mg 12-hourly.", "Terlipressin 2 mg stat then 1 mg 6-hourly for 3–5 days in suspected varices."],
  "pitfalls": ["Over-transfusion.", "Terlipressin in heart or peripheral vascular disease.", "Continuing anticoagulants or NSAIDs.", "Delaying endoscopy beyond 24 hours."],
  "references": [tref("ugib", "sections Diagnosis, Clinical evaluation, Investigations, High-risk assessment, Resuscitation, Pharmacotherapy, Blood transfusion, Endoscopy"), tref("terli", "Boxed warning and sections 4, 5")]},
 nonClinical={"patientEducation": ["Avoid NSAIDs and alcohol.", "Seek care at once for black stools or vomiting blood.", "Do not stop heart medicines without medical advice."], "lifestyleAndDiet": ["Alcohol abstinence for variceal bleeding.", "Diet as tolerated after endoscopy."], "mdtReferrals": ["Gastroenterologist for endoscopy (ICMR STW)", "Cardiologist if on antiplatelets after recent MI or stent (ICMR STW)", "De-addiction services for alcohol use"], "dischargeCriteria": ["No rebleeding and stable haemoglobin", "Endoscopic findings treated", "Plan for antiplatelet or anticoagulant restart agreed"], "followUpPlan": "Gastroenterology follow-up for ulcer healing or variceal eradication; Helicobacter pylori testing and liver evaluation as indicated."})
save("t07_ugib.json", [T])
