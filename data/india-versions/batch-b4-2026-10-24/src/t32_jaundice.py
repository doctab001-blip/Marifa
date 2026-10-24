from h import *
JD = "sections Definition, Classification, Signs and symptoms, Essential tests, Differential diagnosis, Referral, Management by category"
NT = "section 4.4, printed pp. 35–36"
TITLE = "Jaundice in adults: approach (India)"
T = topic(
 id=new_id(TITLE), title=TITLE, specialty="Gastroenterology / Internal Medicine / Primary Care", authority="ICMR", pillar="Urgent Care",
 scope="Adults with jaundice in India: sorting obstructive, parenchymal, infective and isolated (unconjugated) causes from bedside tests, recognising liver failure early, and first treatment before referral. Built on the ICMR Jaundice workflow (July 2020), with NCDC-ICMR antibiotic regimens (2025) for suspected cholangitis.",
 findings=[
  "Bilirubin threshold, four-category classification, symptoms, essential tests (liver function tests (LFT), aspartate and alanine aminotransferases (SGOT, SGPT), alkaline phosphatase) and their patterns, causes, international normalised ratio (INR) warning, referral triggers and management by category (including folic acid 5 mg for haemolysis) checked against the ICMR Jaundice STW (July 2020).",
  "Cholangitis antibiotic regimens with and without sepsis from NCDC-ICMR NTG 2025 section 4.4; thiamine dose from the ICMR Alcohol Use Disorders STW.",
  "Not clinically reviewed."],
 unverified=[
  "Viral hepatitis serology panel (hepatitis A, B, C and E markers) is named in other India topics, not listed in the Jaundice STW; included as standard practice.",
  "Vitamin K, lactulose and antiemetic doses were not given in the opened sources.",
  "Normal laboratory ranges are typical adult values; local ranges apply."],
 summary="Jaundice is yellow discolouration from raised serum bilirubin; the ICMR workflow uses a threshold above 1.5 mg/dL. Bilirubin rises when too much is made (haemolysis), when the liver cannot conjugate or excrete it (hepatitis from viruses, alcohol, drugs such as anti-tubercular therapy, or autoimmunity), or when bile flow is blocked (stones, strictures, cancers of the gallbladder, pancreas or bile ducts). In India, systemic infections such as malaria, enteric fever, dengue, scrub typhus and leptospirosis are common causes with fever. Liver enzymes, alkaline phosphatase and an ultrasound sort most patients; a rising INR is an early sign of liver failure.",
 mechanisms=[
  "Haemolysis overloads conjugation: unconjugated (indirect) bilirubin rises with normal liver enzymes.",
  "Hepatocyte injury impairs uptake, conjugation and excretion: transaminases rise sharply.",
  "Bile duct obstruction backs up conjugated bilirubin: alkaline phosphatase rises, stools pale, urine darkens, itching.",
  "Loss of synthetic function raises INR and signals liver failure."],
 presentation={
  "symptoms": ["Anorexia, nausea, vomiting, viral prodrome (ICMR STW)", "Abdominal pain; itching (ICMR STW)", "Clay-coloured stools and high-coloured urine (ICMR STW)", "Fever (ICMR STW)"],
  "physicalSigns": ["Scleral icterus", "Palpable gallbladder or mass (malignant obstruction)", "Signs of chronic liver disease", "Pallor and splenomegaly (haemolysis)"],
  "redFlags": ["Altered sensorium (ICMR STW)", "Bleeding (ICMR STW)", "Recurrent vomiting with dehydration (ICMR STW)", "Systolic BP below 90 mmHg (ICMR STW)", "INR above 1.5 or rising: early liver failure (ICMR STW)"],
  "precipitants": ["Alcohol (ICMR STW)", "Hepatotoxic drugs including anti-tubercular therapy (ICMR STW)", "Hepatitis A or E outbreaks (contaminated water)", "Gallstones"]},
 differentials=[
  ("Obstructive (stone, stricture, malignancy)", "Alkaline phosphatase over 4–5 times upper limit; dilated bile ducts on ultrasound (ICMR STW)."),
  ("Parenchymal (viral, alcoholic, drug, autoimmune hepatitis)", "Transaminases usually over 5 times upper limit (under 500 in alcoholic hepatitis); no duct dilatation (ICMR STW)."),
  ("Systemic infection (malaria, enteric fever, dengue, scrub typhus, leptospirosis)", "Fever; positive smear, culture or serology (ICMR STW)."),
  ("Isolated raised bilirubin (haemolysis, Gilbert syndrome)", "Indirect more than direct bilirubin; normal enzymes and ultrasound (ICMR STW).")],
 criteria=[
  ("Jaundice (ICMR STW)", "Serum bilirubin above 1.5 mg/dL."),
  ("Obstructive pattern (ICMR STW)", "Alkaline phosphatase over 4–5 times upper limit; normal or mildly raised transaminases; dilated ducts on imaging."),
  ("Hepatitic pattern (ICMR STW)", "Transaminases usually over 5 times upper limit (under 500 U/L in alcoholic hepatitis); no duct dilatation."),
  ("Refer (ICMR STW)", "Altered sensorium, bleeding, recurrent vomiting with dehydration, systolic BP below 90 mmHg, or INR above 1.5 or rising.")],
 ruleIn=[
  inv("laboratory", "Liver function tests: bilirubin (total and direct), SGOT, SGPT, alkaline phosphatase", "Blood tests", "Pattern of jaundice", "Bilirubin 0.3–1.2 mg/dL; SGOT and SGPT under 40 U/L; alkaline phosphatase 40–130 U/L", "Bilirubin above 1.5 mg/dL with obstructive or hepatitic pattern", "Essential test; pattern decides the pathway (ICMR STW).", "jd", JD),
  inv("firstLineImaging", "Ultrasound of liver and biliary system", "Ultrasound", "Duct dilatation; stones; mass", "Common bile duct normal calibre; no intrahepatic dilatation", "Dilated ducts (obstruction) or normal ducts (hepatitis)", "Separates obstructive from parenchymal causes (ICMR STW).", "jd", JD),
  inv("laboratory", "Prothrombin time / INR", "Coagulation", "Liver synthetic failure", "INR 0.8–1.2", "INR above 1.5 or rising", "Early marker of liver failure; refer (ICMR STW).", "jd", JD)],
 ruleOut=[
  inv("laboratory", "Peripheral smear for malaria, blood culture, Widal or relevant serology", "Blood tests", "Systemic infection", "No parasites; no growth; serology negative", "Malaria parasites; Salmonella; positive dengue, scrub typhus or leptospira serology", "In the right setting with fever (ICMR STW).", "jd", JD),
  inv("laboratory", "Viral hepatitis markers", "IgM anti-HAV, IgM anti-HEV, HBsAg, anti-HCV", "Viral hepatitis", "Negative", "Positive marker", "Check in hepatitic pattern (ICMR STW: 'check viral markers').", "jd", JD),
  inv("laboratory", "Complete blood count with reticulocytes", "Blood test", "Haemolysis", "Haemoglobin 12–17 g/dL; reticulocytes 0.5–2.5%", "Anaemia with raised reticulocytes", "Supports haemolytic cause of isolated raised bilirubin (ICMR STW).", "jd", JD)],
 management=[
  step("assess", "Assess and classify", "First visit", ["Confirm bilirubin above 1.5 mg/dL; do LFT, SGOT, SGPT, alkaline phosphatase and ultrasound (ICMR STW).", "Check INR; refer if INR above 1.5 or rising (ICMR STW).", "Ask about alcohol, hepatotoxic drugs (including anti-tubercular therapy), fever and travel."]),
  step("obstructive", "Obstructive jaundice", "Same day", ["IV antibiotics if fever or raised white count (suspected cholangitis) (ICMR STW).", "IV fluids if dehydrated (ICMR STW).", "Refer to a centre with computed tomography (CT) or magnetic resonance cholangiopancreatography (MRCP); definitive treatment by endoscopic retrograde cholangiopancreatography (ERCP), percutaneous transhepatic biliary drainage (PTBD) or surgery (ICMR STW).", "Biliary drainage or relief of obstruction is of utmost importance in sepsis (NTG 2025)."]),
  step("hepatitic", "Parenchymal (hepatitis)", "Ongoing", ["Maintain hydration; treat symptoms such as vomiting; normal diet (ICMR STW).", "Stop alcohol and all non-prescription drugs (ICMR STW).", "Thiamine for alcoholic hepatitis (ICMR STW)."]),
  step("other", "Isolated raised bilirubin or systemic infection", "Ongoing", ["Haemolysis: folic acid and haematology referral (ICMR STW).", "Congenital hyperbilirubinaemia: reassure and refer to confirm (ICMR STW).", "Systemic infection: treat the specific illness (ICMR STW)."])],
 branches=[
  ("Haemolytic jaundice", "Isolated raised indirect bilirubin with haemolysis (ICMR STW)."),
  ("Obstructive jaundice with suspected cholangitis — no sepsis", "Fever or raised white count with obstruction, haemodynamically stable (ICMR STW; NTG 2025)."),
  ("Obstructive jaundice with sepsis", "Cholangitis with sepsis (NTG 2025)."),
  ("Alcoholic hepatitis", "Hepatitic pattern with heavy alcohol use (ICMR STW).")],
 regimens=[
  rx("Haemolytic jaundice", "Supplement", "Haemolytic anaemia", "Adults", "Folic acid", "5 mg", "Oral", "Once daily", "Until haematology review", "Use paediatric dosing in children.", NOT_ABX, "No change.", "No change.", ["Haemoglobin, reticulocytes"], ["Untreated vitamin B12 deficiency (masks it)"], "jd", JD),
  rx("Obstructive jaundice with suspected cholangitis — no sepsis", "Antibiotic", "Cholangitis without sepsis", "Adults", "Ceftriaxone", "2 g", "IV", "Once daily", "5–7 days (NTG)", ADULT, "Cephalosporin: avoid if penicillin anaphylaxis.", NS, NS, ["Temperature, bilirubin"], ["Severe beta-lactam allergy"], "ntg", NT, sel="one-of", pref=True),
  rx("Obstructive jaundice with suspected cholangitis — no sepsis", "Antibiotic", "Cholangitis without sepsis", "Adults", "Amoxicillin-clavulanate", "1 g", "Oral", "Twice daily", "5–7 days (NTG)", ADULT, "Do not use; choose ceftriaxone if not anaphylaxis.", NS, "Contraindicated after cholestatic jaundice with this drug.", ["Temperature, bilirubin"], ["Penicillin allergy", "Vomiting (needs IV)"], "ntg", NT, sel="one-of", pref=False, use="Mild illness, able to take oral medicines (NTG first-line oral option)."),
  rx("Obstructive jaundice with sepsis", "Broad-spectrum antibiotic", "Cholangitis with sepsis", "Adults", "Piperacillin-tazobactam", "4.5 g", "IV over 30 minutes", "Every 6 hours", "5–7 days after drainage if no complication (NTG)", ADULT, "Do not use; choose cefoperazone-sulbactam if not anaphylaxis, or meropenem.", "Creatinine clearance 20–40 mL/min: 2.25 g every 6 hours; below 20: 2.25 g every 8 hours (label Table 1).", NS, ["Blood cultures, lactate, INR"], ["Penicillin allergy"], "ntg", NT, sel="one-of", pref=True),
  rx("Obstructive jaundice with sepsis", "Broad-spectrum antibiotic", "Cholangitis with sepsis", "Adults", "Cefoperazone-sulbactam", "3 g", "IV", "Every 12 hours", "5–7 days after drainage (NTG)", ADULT, "Cephalosporin: avoid if penicillin anaphylaxis.", NS, NS, ["INR (cefoperazone can prolong prothrombin time)"], ["Severe beta-lactam allergy"], "ntg", NT, sel="one-of", pref=False, use="Non-anaphylactic penicillin allergy or piperacillin-tazobactam unavailable."),
  rx("Obstructive jaundice with sepsis", "Broad-spectrum antibiotic", "Cholangitis with sepsis", "Adults", "Meropenem", "1 g", "IV", "Every 8 hours", "5–7 days after drainage (NTG)", ADULT, "Carbapenem: use with caution in penicillin anaphylaxis.", "Reduce dose in kidney impairment; check the formulary.", NS, ["Cultures; de-escalate"], ["Carbapenem allergy"], "ntg", NT, sel="one-of", pref=False, use="Septic shock or known resistant organism."),
  rx("Alcoholic hepatitis", "Vitamin", "Prevention of Wernicke encephalopathy", "Adults", "Thiamine", "100 mg", "Oral", "Once daily", "During admission and while drinking or malnourished", ADULT, NOT_ABX, "No change.", "No change.", ["Confusion, ataxia"], ["Give with IV glucose, not after"], "aud", "section Withdrawal management")],
 medNote="The Jaundice STW names folic acid 5 mg, IV antibiotics for suspected cholangitis and thiamine for alcoholic hepatitis; antibiotic regimens follow NCDC-ICMR NTG 2025 section 4.4 (acute cholecystitis and cholangitis), and the thiamine dose the ICMR Alcohol Use Disorders STW. Definitive treatment of obstruction is drainage. Not clinically reviewed.",
 teaching={"scope": "Adult jaundice.", "learningObjectives": ["Classify jaundice from LFT pattern and ultrasound.", "Recognise early liver failure.", "Know when antibiotics and drainage are urgent."],
  "keyPoints": ["Jaundice: bilirubin above 1.5 mg/dL.", "Alkaline phosphatase over 4–5 times upper limit with dilated ducts: obstruction.", "INR above 1.5 or rising: refer.", "Fever with obstruction: antibiotics and drainage."],
  "pitfalls": ["Missing malaria, leptospirosis or scrub typhus as the cause of fever with jaundice.", "Continuing hepatotoxic drugs or herbal products.", "Antibiotics alone without draining an obstructed infected system.", "Over-investigating Gilbert syndrome."],
  "references": [tref("jd", JD), tref("ntg", NT), tref("aud", "section Withdrawal management"), tref("zosyn", "section 2.4, Table 1")]},
 nonClinical={"patientEducation": ["Avoid alcohol and all non-prescription medicines (ICMR STW).", "Return for confusion, bleeding, repeated vomiting or fainting."], "lifestyleAndDiet": ["Normal diet (ICMR STW).", "Boil or purify drinking water (hepatitis A and E)."], "mdtReferrals": ["Gastroenterology or hepatology", "Surgery or interventional radiology for obstruction", "Haematology for haemolysis (ICMR STW)"], "dischargeCriteria": ["No red flags; INR stable", "Cause identified or referral arranged", "Eating and drinking"], "followUpPlan": "Recheck bilirubin, liver enzymes and INR within 1 week for hepatitis; follow-up after definitive drainage for obstruction."})
save("t32_jaundice.json", [T])
