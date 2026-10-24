from h import *
GS = "sections Presentations, Signs and red flags, Investigations, Management by level of care, Timing of cholecystectomy, Indications in asymptomatic stones, Referral"
NT = "section 4.4, printed pp. 35–36"
TGL = "Table 1"
TITLE = "Gallstone disease and acute cholecystitis (India)"
PAED = "Children: the opened sources give no paediatric dose; use a paediatric formulary."
T = topic(
 id=new_id(TITLE), title=TITLE, specialty="General Surgery / Gastroenterology", authority="ICMR", pillar="Urgent Care",
 scope="Adults with gallstones in India: biliary colic, acute cholecystitis and its complications, and when to operate on asymptomatic stones. Built on the ICMR Gall Stone Disease workflow (July 2022) and NCDC-ICMR antibiotic guidelines (2025), with Tokyo Guidelines severity grading and US labels for analgesic doses and renal adjustment.",
 findings=[
  "Presentations, red flags, investigations, magnetic resonance cholangiopancreatography (MRCP) indications, level-of-care management, cholecystectomy timing, cholecystostomy, pancreatitis timing, asymptomatic-stone surgery indications and referral checked against the ICMR Gall Stone Disease STW (July 2022).",
  "Antibiotic regimens with and without sepsis checked against NCDC-ICMR NTG 2025, section 4.4.",
  "Severity grading from the Tokyo Guidelines TG07/13 table reproduced in BMC Gastroenterology 2015; TG18 severity grades were not opened.",
  "Not clinically reviewed."],
 unverified=[
  "Tokyo diagnostic thresholds for 'suspected' and 'definite' cholecystitis were not in the opened table.",
  "The ICMR STW lists 'metronidazole plus an aminoglycoside' at primary level without doses; not dosed here.",
  "Common bile duct stones and cholangitis are covered in a separate topic."],
 summary="Gallstones form when bile is supersaturated with cholesterol or bilirubin. Most stay silent. A stone impacting in the cystic duct causes biliary colic; persistent obstruction with inflammation becomes acute cholecystitis, which can progress to empyema, gangrene, perforation or mucocele. Stones passing into the common bile duct cause obstructive jaundice, cholangitis or acute pancreatitis. Ultrasound is the investigation of choice (sensitivity 95%, ICMR STW) and laparoscopic cholecystectomy is the definitive treatment.",
 mechanisms=[
  "Cholesterol or pigment supersaturation and gallbladder stasis form stones.",
  "Transient cystic duct obstruction causes biliary colic.",
  "Persistent obstruction with chemical then bacterial inflammation causes acute cholecystitis.",
  "Duct stones cause jaundice, cholangitis or pancreatitis."],
 presentation={
  "symptoms": ["Biliary colic: constant right upper quadrant (RUQ) or epigastric pain with a crescendo-decrescendo pattern (ICMR STW)", "Acute cholecystitis: pain over 24 hours with fever (ICMR STW)", "Cholangitis: pain, fever and jaundice (ICMR STW)", "Dyspepsia-type symptoms: nausea, flatulence, food intolerance (ICMR STW)"],
  "physicalSigns": ["Murphy's sign; RUQ tenderness or mass (Tokyo local signs)", "Fever (Tokyo systemic signs)", "Jaundice with duct stones"],
  "redFlags": ["Not looking well, not ambulatory or not tolerating oral intake (ICMR STW)", "Pain out of proportion or not responding to analgesics (ICMR STW)", "Tachycardia and falling BP (ICMR STW)", "Organ dysfunction — Tokyo Grade III", "Acalculous cholecystitis in the critically ill: unexplained fever and leucocytosis (ICMR STW)"],
  "precipitants": ["Fatty meals", "Pregnancy, rapid weight loss", "Chronic haemolytic anaemia (pigment stones; ICMR STW indication)", "Diabetes (ICMR STW relative indication)"]},
 differentials=[
  ("Acute pancreatitis", "Raised amylase or lipase (ICMR STW investigation)."),
  ("Myocardial ischaemia", "Electrocardiogram (ECG) distinguishes cardiac pain (ICMR STW)."),
  ("Peptic ulcer disease", "Epigastric pain related to meals; normal gallbladder on ultrasound."),
  ("Renal colic", "Loin pain radiating to groin; ultrasound shows renal stones (ICMR STW notes other pathology)."),
  ("Acute hepatitis", "Markedly raised transaminases; normal gallbladder.")],
 criteria=[
  ("Diagnosis (ICMR STW; Tokyo)", "Local signs (Murphy's sign, RUQ pain, tenderness or mass), systemic signs (fever, raised C-reactive protein (CRP) or white cells) and imaging findings."),
  ("Tokyo Grade III (severe)", "Dysfunction of any organ: hypotension needing catecholamines; PaO2/FiO2 below 300; creatinine above 2.0 mg/dL; reduced consciousness; INR above 1.5; platelets below 100,000/µL."),
  ("Tokyo Grade II (moderate)", "Any of: symptoms over 72 hours; palpable RUQ mass; white cells above 18,000/µL; marked local inflammation (gangrenous cholecystitis)."),
  ("Tokyo Grade I (mild)", "Healthy patient with mild gallbladder inflammation and no Grade II or III features."),
  ("Surgery for asymptomatic stones (ICMR STW)", "Absolute: suspected malignancy, polyp over 1 cm, porcelain gallbladder, chronic haemolytic anaemia, transplant patient, stones over 3 cm, multiple small stones, children. Relative: stones over 2 cm, stones under 3 mm with patent cystic duct, diabetes, non-functioning gallbladder.")],
 ruleIn=[
  inv("firstLineImaging", "Ultrasound abdomen", "Ultrasound", "Gallstones; cholecystitis; duct dilatation", "No stones; thin gallbladder wall; common bile duct (CBD) not dilated", "Echogenic stones with acoustic shadow; thick wall; pericholecystic fluid; dilated CBD", "Investigation of choice, sensitivity 95%; also assess liver, CBD and intrahepatic ducts (ICMR STW).", "gs", GS),
  inv("laboratory", "Liver function tests", "Bilirubin, SGOT/SGPT, alkaline phosphatase", "Duct stones; cholangitis", "Bilirubin 0.3–1.2 mg/dL; alkaline phosphatase 40–130 U/L", "Raised bilirubin and alkaline phosphatase", "Raised values suggest duct stones; jaundice or high alkaline phosphatase is an MRCP indication (ICMR STW).", "gs", GS),
  inv("laboratory", "Haemogram and CRP", "Blood tests", "Inflammation; severity", "White cells 4–11 ×10⁹/L", "Leucocytosis; above 18,000/µL is Tokyo Grade II", "Systemic sign and severity marker (Tokyo).", "tg", TGL)],
 ruleOut=[
  inv("laboratory", "Amylase and lipase", "Pancreatic enzymes", "Gallstone pancreatitis", "Lipase under 60 U/L (assay dependent)", "More than 3 times upper limit", "Identifies pancreatitis, which changes cholecystectomy timing (ICMR STW).", "gs", GS),
  inv("laboratory", "Renal function, electrolytes, sugar, INR, platelets", "Blood tests", "Organ dysfunction; fitness for surgery", "Creatinine 0.6–1.2 mg/dL; INR 0.8–1.2; platelets 150,000–400,000/µL", "Creatinine above 2.0 mg/dL, INR above 1.5 or platelets below 100,000/µL (Grade III)", "Routine tests (ICMR STW); thresholds define Tokyo Grade III.", "gs", GS, extra=("tg", TGL)),
  inv("advancedImaging", "MRCP", "Magnetic resonance imaging (MRI)", "CBD stones; Mirizzi syndrome", "Normal calibre ducts without filling defect", "Filling defect in CBD", "If jaundice, high alkaline phosphatase, dilated CBD or suspected CBD stones (ICMR STW).", "gs", GS)],
 management=[
  step("phc", "Primary level", "First contact", ["Resuscitate; ultrasound if available; first IV antibiotic dose; refer to a higher centre (ICMR STW).", "ECG to separate cardiac pain (ICMR STW)."]),
  step("dh", "District hospital", "Admission", ["IV hydration, analgesia, bowel rest and IV antibiotics (ICMR STW).", "Grade by Tokyo criteria; complicated cases ideally managed at a tertiary centre after resuscitation (ICMR STW)."]),
  step("surgery", "Cholecystectomy timing", "24–72 hours, or after 6 weeks", ["Acute cholecystitis: early laparoscopic cholecystectomy within 24–72 hours if expertise available, otherwise delayed after 6 weeks (ICMR STW).", "Unfit or unstable: cholecystostomy, then laparoscopic cholecystectomy after 6 weeks (ICMR STW).", "Mild or moderate gallstone pancreatitis: cholecystectomy in the same admission; severe: 4–6 weeks after resolution (ICMR STW).", "Convert to open early if in doubt (ICMR STW)."]),
  step("sepsis", "Sepsis or cholangitis", "Immediately", ["Broad-spectrum IV antibiotics and urgent biliary drainage or relief of obstruction (NTG 2025).", "CBD stones: follow the common bile duct stone pathway (ICMR STW)."]),
  step("postop", "After surgery", "1 week", ["Suture removal at 1 week; send histopathology (ICMR STW).", "Continue antibiotics for mucocele, empyema or diabetes (ICMR STW).", "Refer early if any doubt postoperatively (ICMR STW)."])],
 branches=[
  ("Analgesia", "Biliary colic or cholecystitis pain."),
  ("Cholecystitis without sepsis", "Acute cholecystitis, Tokyo Grade I–II, no sepsis (NTG 2025)."),
  ("Cholecystitis with sepsis or cholangitis", "Sepsis, Tokyo Grade III, or cholangitis (NTG 2025).")],
 regimens=[
  rx("Analgesia", "Analgesic", "Biliary pain", "Adults", "Paracetamol (IV)", "1000 mg (50 kg or more); 15 mg/kg (under 50 kg)", "IV", "Every 6 hours", "Max 4000 mg/day (50 kg or more) or 75 mg/kg/day", "Children 2–12 years: 15 mg/kg every 6 hours, max 75 mg/kg/day (label 2.3).", NOT_ABX, "Creatinine clearance 30 mL/min or less: longer interval and lower daily dose may be needed (label 8.7).", "Lower dose may be needed; contraindicated in severe hepatic impairment (labels 4, 8.6).", ["Pain score", "Liver function in jaundice"], ["Severe hepatic impairment (label 4)"], "para", "sections 2.2–2.3, 4"),
  rx("Analgesia", "Add-on non-steroidal anti-inflammatory drug (NSAID)", "Pain not controlled", "Adults", "Ketorolac", "30 mg (15 mg if 65 or older, kidney impairment or under 50 kg)", "IV", "Every 6 hours", "Max 120 mg/day (60 mg/day reduced-dose group); no more than 5 days", "Not indicated in children (label).", NOT_ABX, "Contraindicated in advanced kidney impairment or volume depletion (label).", NS, ["Creatinine, urine output"], ["Peptic ulcer or gastrointestinal bleeding, current aspirin or NSAID, pregnancy at 30 weeks or later (label)"], "ketor", "section Dosage and Administration; section Contraindications"),
  rx("Cholecystitis without sepsis", "Antibiotic", "Acute cholecystitis without sepsis", "Adults", "Amoxicillin-clavulanate", "1 g", "Oral", "Twice daily", "5–7 days", PAED, "Do not use; choose cefixime or ceftriaxone if not anaphylaxis.", "Do not give the 875 mg tablet if GFR below 30 mL/min (label 2.3).", "History of cholestatic jaundice with amoxicillin-clavulanate: contraindicated (label 4.2).", ["Pain, temperature"], ["Penicillin allergy"], "ntg", NT, sel="one-of", pref=True),
  rx("Cholecystitis without sepsis", "Antibiotic", "Acute cholecystitis without sepsis", "Adults", "Cefixime", "400 mg", "Oral", "Twice daily", "5–7 days", PAED, "Cephalosporin: avoid if penicillin anaphylaxis.", NS, NS, ["Pain, temperature"], ["Severe beta-lactam allergy"], "ntg", NT, sel="one-of", pref=False, use="Non-anaphylactic penicillin allergy."),
  rx("Cholecystitis without sepsis", "Antibiotic", "Acute cholecystitis without sepsis", "Adults", "Ceftriaxone", "2 g", "IV", "Once daily", "5–7 days", PAED, "Cephalosporin: avoid if penicillin anaphylaxis.", NS, NS, ["Pain, temperature"], ["Severe beta-lactam allergy"], "ntg", NT, sel="one-of", pref=False, use="Vomiting or nil by mouth; needs IV therapy."),
  rx("Cholecystitis with sepsis or cholangitis", "Broad-spectrum antibiotic", "Sepsis, Grade III or cholangitis", "Adults", "Piperacillin-tazobactam", "4.5 g", "IV over 30 minutes", "Every 6 hours", "5–7 days if drained and no complication (NTG)", PAED, "Do not use; choose cefoperazone-sulbactam if not anaphylaxis, or meropenem.", "Creatinine clearance 20–40 mL/min: 2.25 g every 6 hours; below 20: 2.25 g every 8 hours (label Table 1).", NS, ["Blood cultures, lactate, organ function"], ["Penicillin allergy"], "ntg", NT, sel="one-of", pref=True),
  rx("Cholecystitis with sepsis or cholangitis", "Broad-spectrum antibiotic", "Sepsis, Grade III or cholangitis", "Adults", "Cefoperazone-sulbactam", "3 g", "IV", "Every 12 hours", "5–7 days if drained (NTG)", PAED, "Cephalosporin: avoid if penicillin anaphylaxis.", NS, NS, ["INR", "Cultures"], ["Severe beta-lactam allergy"], "ntg", NT, sel="one-of", pref=False, use="Non-anaphylactic penicillin allergy or piperacillin-tazobactam unavailable."),
  rx("Cholecystitis with sepsis or cholangitis", "Broad-spectrum antibiotic", "Sepsis, Grade III or cholangitis", "Adults", "Meropenem", "1 g", "IV", "Every 8 hours", "5–7 days if drained (NTG)", PAED, "Carbapenem: use with caution in penicillin anaphylaxis.", "Reduce dose in kidney impairment; check the formulary.", NS, ["Cultures; de-escalate"], ["Carbapenem allergy"], "ntg", NT, sel="one-of", pref=False, use="Septic shock, known resistant organism, or first-line agents failing.")],
 medNote="Antibiotics follow NCDC-ICMR NTG 2025 section 4.4; imipenem-cilastatin 0.5 g every 6 hours is another NTG alternative. Biliary drainage or relief of obstruction is the key treatment in sepsis (NTG). Analgesic doses from US labels. Not clinically reviewed.",
 comparison={"title": "First-line antibiotics for acute cholecystitis: ICMR STW vs NTG 2025", "columns": ["ICMR Gall Stone STW (2022)", "NCDC-ICMR NTG (2025)"], "rows": [
   {"parameter": "Without sepsis", "values": ["IV third-generation cephalosporin, or metronidazole plus an aminoglycoside (no doses)", "Amoxicillin-clavulanate 1 g twice daily; alternatives cefixime 400 mg twice daily or ceftriaxone 2 g IV daily; 5–7 days"]},
   {"parameter": "With sepsis", "values": ["Refer to tertiary centre after resuscitation", "Piperacillin-tazobactam 4.5 g every 6 hours or cefoperazone-sulbactam 3 g every 12 hours; carbapenem alternatives"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "Adult gallstone disease.", "learningObjectives": ["Separate biliary colic, cholecystitis and cholangitis.", "Grade severity with Tokyo criteria.", "Time cholecystectomy correctly."],
  "keyPoints": ["Ultrasound first.", "Early laparoscopic cholecystectomy within 24–72 hours where expertise exists.", "Sepsis: antibiotics plus drainage.", "Polyp over 1 cm or porcelain gallbladder: operate even if asymptomatic."],
  "pitfalls": ["Missing cardiac pain: do an ECG.", "Long antibiotic courses after source control.", "Missing CBD stones before cholecystectomy.", "Acalculous cholecystitis in intensive care unit (ICU) patients."],
  "references": [tref("gs", GS), tref("ntg", NT), tref("tg", TGL), tref("para", "sections 2.2, 2.3, 4, 8.6, 8.7"), tref("ketor", "section Dosage and Administration"), tref("zosyn", "section 2.4, Table 1")]},
 nonClinical={"patientEducation": ["Return for fever, jaundice or worsening pain.", "Gallstones that have caused symptoms usually need surgery."], "lifestyleAndDiet": ["Smaller, lower-fat meals while awaiting surgery.", "Gradual rather than rapid weight loss."], "mdtReferrals": ["General or laparoscopic surgeon", "Gastroenterology for CBD stones (endoscopic retrograde cholangiopancreatography)", "Interventional radiology for cholecystostomy"], "dischargeCriteria": ["Pain controlled on oral analgesia", "Afebrile, eating", "Surgery date planned"], "followUpPlan": "Wound review and suture removal at 1 week with histopathology report (ICMR STW); delayed cholecystectomy at 6 weeks if not done early."})
save("t26_gallstones.json", [T])
