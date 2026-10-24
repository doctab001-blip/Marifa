from hx import *
TITLE = "Hepatic encephalopathy (India)"
EN = "section Treatment at higher centre (encephalopathy)"; AE = "section Acute on chronic liver failure"
T = topic(
 id=new_id(TITLE), title=TITLE,
 specialty="Hepatology / Gastroenterology / Internal Medicine", authority="ICMR", pillar="Urgent Care",
 scope="Hepatic encephalopathy (HE) in adults with cirrhosis or acute-on-chronic liver failure (ACLF) in India: West Haven grading, finding and treating precipitants, lactulose, rifaximin, airway protection, nutrition and secondary prophylaxis, built on the ICMR Acute Liver Failure / ACLF STW (July 2020) and the AASLD/EASL HE guideline (2014).",
 findings=[
  "Lactulose 20–30 mL every 6 hours titrated to 3–4 stools/day, rifaximin 400 mg three times daily, airway protection in grade 3–4 coma, mannitol only in acute liver failure without renal failure, ceftriaxone 1 g twice daily for spontaneous bacterial peritonitis (SBP), and investigations checked against the ICMR ALF/ACLF STW (July 2020).",
  "West Haven grades, precipitants (Table 3), ammonia not needed for diagnosis (recommendation 9), lactulose 25 mL every 1–2 hours until 2 soft stools then titrate to 2–3/day (recommendation 19), rifaximin add-on and secondary prophylaxis (recommendations 20, 25, 26), BCAA and IV LOLA as options, and nutrition targets (recommendations 30–32) checked against AASLD/EASL 2014.",
  "Not clinically reviewed."],
 unverified=[
  "The ICMR rifaximin dose (400 mg three times daily) is used; the AASLD/EASL extract did not state a dose.",
  "IV L-ornithine L-aspartate (LOLA) and branched-chain amino acids (BCAA) are options for non-responders (AASLD/EASL) but no doses were in the opened sources.",
  "Paediatric HE is outside the scope of the cited sources.",
  "The ascitic neutrophil cut-off of 250/mm³ for SBP is standard practice; it was not in the opened ICMR workflow."],
 summary="Hepatic encephalopathy is brain dysfunction caused by liver insufficiency or portosystemic shunting, ranging from subtle cognitive changes (covert HE) to coma. Gut-derived ammonia and other toxins bypass the failing liver, causing astrocyte swelling and altered neurotransmission. Most episodes in cirrhosis are triggered by a precipitant: infection, gastrointestinal bleeding, diuretic overuse, electrolyte disorders or constipation (AASLD/EASL Table 3); correcting it resolves most episodes. Lactulose is the first-line treatment; rifaximin is added to prevent recurrence. Blood ammonia does not diagnose, grade or predict HE (AASLD/EASL recommendation 9).",
 mechanisms=[
  "Failing liver and portosystemic shunts let gut-derived ammonia reach the brain.",
  "Astrocytes convert ammonia to glutamine, causing swelling and low-grade cerebral oedema.",
  "Inflammation from infection amplifies ammonia neurotoxicity.",
  "Lactulose acidifies the colon and traps ammonia; rifaximin reduces ammonia-producing bacteria."],
 presentation={
  "symptoms": ["Sleep reversal, poor attention (grade 1)", "Lethargy, disorientation to time, personality change (grade 2)", "Somnolence, confusion, bizarre behaviour (grade 3)", "Coma (grade 4)"],
  "physicalSigns": ["Asterixis (flapping tremor) in grade 2", "Fetor hepaticus", "Jaundice, ascites, spider naevi", "Signs of the precipitant: fever, melaena, dehydration"],
  "redFlags": ["Grade 3–4: secure the airway (ICMR STW)", "Gastrointestinal bleeding: see the Upper GI bleeding topic", "Fever or abdominal pain: suspect SBP", "Focal signs or seizures: look for another cause"],
  "precipitants": ["Infections including SBP (AASLD/EASL Table 3)", "Gastrointestinal bleeding", "Diuretic overdose, electrolyte disorder, dehydration", "Constipation", "Sedatives, alcohol"]},
 differentials=[
  ("Hypoglycaemia", "Low glucose; responds to dextrose."),
  ("Alcohol intoxication or withdrawal (Wernicke encephalopathy)", "Alcohol history; ophthalmoplegia or ataxia; give thiamine."),
  ("Intracranial bleed", "Focal deficit or head injury; computed tomography (CT) head."),
  ("Sepsis-associated encephalopathy or meningitis", "Fever, neck stiffness; cultures, lumbar puncture.")],
 criteria=[
  ("West Haven grade 1 (covert)", "Trivial lack of awareness, euphoria or anxiety, short attention span, impaired addition or subtraction, altered sleep rhythm; oriented."),
  ("West Haven grade 2 (overt)", "Lethargy or apathy, disorientation for time, personality change, inappropriate behaviour, asterixis."),
  ("West Haven grade 3", "Somnolence to semi-stupor, responsive to stimuli, confusion, gross disorientation."),
  ("West Haven grade 4", "Coma."),
  ("ACLF (ICMR STW)", "Bilirubin 5 mg/dL or more and INR 1.5 or more in chronic liver disease; additional organ failure means severe disease.")],
 ruleIn=[
  inv("specializedAdjunctive", "Mental status and asterixis (West Haven grade)", "Bedside examination", "Overt HE", "Alert, oriented, no asterixis", "Disorientation, asterixis, somnolence or coma", "Grade sets the level of care; grade 3–4 needs airway protection (ICMR STW).", "aasld14", "Table 2"),
  inv("laboratory", "Capillary glucose", "Bedside glucose", "Hypoglycaemia mimic", "70–140 mg/dL", "Below 70 mg/dL", "Give dextrose if low (ICMR STW).", "alf", "section Primary treatment/stabilization"),
  inv("laboratory", "Sodium, potassium, urea, creatinine", "Serum", "Electrolyte precipitant; kidney injury", "Sodium 135–145 mmol/L; potassium 3.5–5.0 mmol/L; creatinine 0.6–1.2 mg/dL", "Hyponatraemia, hypokalaemia, rising creatinine", "Correct; stop diuretics in kidney injury (ICMR STW).", "alf", "section Essential investigations"),
  inv("laboratory", "Ascitic fluid analysis and culture", "Diagnostic paracentesis", "SBP", "Ascitic neutrophils below 250/mm³; no growth", "Neutrophils 250/mm³ or more, or positive culture", "Treat SBP as a precipitant (ICMR STW lists ascitic analysis as essential).", "alf", "section Essential investigations"),
  inv("laboratory", "Blood count, blood and urine cultures", "Blood; urine", "Infection or bleeding", "Hb 12–16 g/dL; WBC 4,000–11,000/µL", "Falling Hb (bleeding) or raised WBC", "Find and treat the precipitant (AASLD/EASL recommendation 14–18).", "aasld14", "Table 3"),
  inv("laboratory", "Bilirubin, INR, albumin", "Serum", "Liver function; ACLF", "Bilirubin below 1.2 mg/dL; INR about 1.0; albumin 3.5–5.0 g/dL", "Bilirubin 5 mg/dL or more with INR 1.5 or more (ACLF)", "Defines ACLF and prognosis (ICMR STW).", "alf", "section Diagnostic criteria")],
 ruleOut=[
  inv("laboratory", "Blood ammonia", "Venous ammonia", "HE", "Laboratory reference range", "Raised", "Does not diagnose, grade or predict HE; a normal value calls for re-evaluation (AASLD/EASL recommendation 9).", "aasld14", "recommendation 9"),
  inv("advancedImaging", "Computed tomography (CT) head", "CT", "Intracranial bleed or other cause", "No acute lesion", "Haemorrhage or mass", "When focal signs, head injury or no response to treatment.", "aasld14", "recommendation 14")],
 management=[
  step("stabilise", "Stabilise", "First hour", ["Grade 3–4: secure the airway; intubate if needed (ICMR STW).", "Check glucose; give dextrose if low (ICMR STW).", "Nurse head-up; aspiration precautions."]),
  step("precip", "Find and treat precipitants", "First hours", ["Look for infection, bleeding, electrolyte disorder, dehydration, constipation and sedatives (AASLD/EASL Table 3).", "Diagnostic paracentesis if ascites; treat SBP (ICMR STW).", "Stop diuretics and nephrotoxins in kidney injury (ICMR STW).", "Gastrointestinal bleeding: treat as in the Upper GI bleeding topic."]),
  step("lactulose", "Start lactulose", "Immediately", ["Oral or nasogastric lactulose (see medicines); titrate to 2–3 soft stools a day (AASLD/EASL) or 3–4 (ICMR STW).", "Avoid overuse: dehydration and hypernatraemia worsen HE (AASLD/EASL)."]),
  step("refractory", "Not improving", "24–48 hours", ["Re-examine for another cause and missed precipitant (AASLD/EASL).", "Options: rifaximin add-on, oral BCAA or IV LOLA (AASLD/EASL recommendations 21–22).", "ACLF with organ failure: refer to a higher centre or intensive care unit (ICU) (ICMR STW)."]),
  step("prevent", "Secondary prophylaxis", "After the first episode", ["Lactulose after the first episode (AASLD/EASL recommendation 25).", "Add rifaximin after a second episode (AASLD/EASL recommendation 26).", "Recurrent intractable HE with liver failure: refer for liver transplant assessment (AASLD/EASL recommendation 13)."])],
 branches=[
  ("Overt HE episode", "Grade 2–4 hepatic encephalopathy in cirrhosis or ACLF."),
  ("Precipitant: suspected SBP", "HE with ascites and suspected or proven SBP."),
  ("Secondary prophylaxis", "After an episode of overt HE.")],
 regimens=[
  rx("Overt HE episode", "Non-absorbable disaccharide", "Overt HE", "Adults", "Lactulose", "20–30 mL every 6 hours, titrated to 3–4 stools/day (ICMR); AASLD/EASL: 25 mL every 1–2 hours until 2 soft stools, then titrate to 2–3/day", "Oral or nasogastric", "Every 6 hours (or 1–2-hourly until stools)", "Until HE resolves, then prophylaxis", "Paediatric dose not covered by the cited sources.", NOT_ABX, "Watch for dehydration and hypernatraemia in kidney injury.", "This is the hepatic dose; titrate to stool output.", ["Stool count daily", "Sodium, potassium, hydration"], ["Bowel obstruction", "Ileus"], "alf", EN, extra_adj=("AASLD/EASL 2014 recommendation 19 regimen shown as each source states.",)),
  rx("Overt HE episode", "Gut-selective antibiotic", "HE in ACLF", "Adults", "Rifaximin", "400 mg three times daily", "Oral", "Three times daily", "Until recovery; continue for prophylaxis if recurrent", "Paediatric dose not covered by the cited sources.", "Not a beta-lactam; safe in penicillin allergy.", "No adjustment (minimal absorption).", "Use with caution in Child-Pugh C.", ["Mental status", "Diarrhoea"], ["Hypersensitivity to rifamycins"], "alf", AE),
  rx("Precipitant: suspected SBP", "Antibiotic", "Spontaneous bacterial peritonitis", "Adults", "Ceftriaxone", "1 g twice daily", "IV", "Every 12 hours", "Usually 5–7 days, guided by response", "Label: 50–75 mg/kg/day in children, maximum 2 g/day.", "Avoid after an immediate (anaphylactic) penicillin reaction; seek microbiology advice.", "No adjustment for renal impairment alone.", "No adjustment for liver disease alone; maximum 2 g/day with combined hepatic and renal disease (label).", ["Repeat ascitic neutrophils at 48 hours", "Creatinine"], ["Cephalosporin allergy"], "alf", EN, extra_adj=("ICMR STW: ceftriaxone 'may be tried'; adjust to local antibiogram.",)),
  rx("Precipitant: suspected SBP", "Volume expansion", "Prevent hepatorenal syndrome", "Adults", "Albumin 20%", "20–40 g over 6–12 hours", "IV", "As directed", "With antibiotic", "Paediatric dose not covered by the cited sources.", NOT_ABX, "Watch for fluid overload.", "This is the hepatic indication.", ["Creatinine, BP, lung crackles"], ["Heart failure (fluid overload)"], "alf", EN),
  rx("Secondary prophylaxis", "Non-absorbable disaccharide", "Prevent recurrence after first episode", "Adults", "Lactulose", "Dose titrated to 2–3 soft stools a day", "Oral", "Two or three times daily", "Long term; may stop when precipitants controlled and liver function or nutrition improve (recommendation 28)", "Paediatric dose not covered by the cited sources.", NOT_ABX, "Avoid dehydration.", "Titrate to stools.", ["Stool frequency", "Sodium"], ["Bowel obstruction"], "aasld14", "recommendations 25, 28"),
  rx("Secondary prophylaxis", "Gut-selective antibiotic", "Prevent recurrence after a second episode", "Adults", "Rifaximin", "400 mg three times daily", "Oral", "Three times daily", "Long term with lactulose", "Paediatric dose not covered by the cited sources.", "Not a beta-lactam; safe in penicillin allergy.", "No adjustment.", "Use with caution in Child-Pugh C.", ["Recurrence of HE"], ["Hypersensitivity to rifamycins"], "aasld14", "recommendation 26", extra_adj=("Dose from ICMR ACLF STW; AASLD/EASL extract gave no dose.",))],
 medNote="Lactulose, rifaximin, ceftriaxone and albumin doses are from the ICMR Acute Liver Failure / ACLF STW (July 2020); prophylaxis rules from AASLD/EASL 2014. India-only topic; the Saudi topic is unchanged. Not clinically reviewed.",
 comparison={"title": "Lactulose for overt HE: ICMR vs AASLD/EASL", "columns": ["ICMR ALF/ACLF STW (2020)", "AASLD/EASL 2014"], "rows": [
   {"parameter": "Starting regimen", "values": ["20–30 mL every 6 hours", "25 mL every 1–2 hours until at least 2 soft stools"]},
   {"parameter": "Stool target", "values": ["3–4 stools/day", "2–3 soft stools/day"]}],
   "note": "Shown as each source states; not merged."},
 teaching={"scope": "HE in Indian liver practice.", "learningObjectives": ["Grade HE with West Haven criteria.", "Find and treat precipitants.", "Use lactulose and rifaximin correctly."],
  "keyPoints": ["Most episodes have a precipitant: infection, bleed, diuretics, electrolytes, constipation.", "Lactulose first; titrate to soft stools.", "Ammonia does not diagnose HE.", "Rifaximin after the second episode."],
  "pitfalls": ["Restricting protein (target 1.2–1.5 g/kg/day).", "Too much lactulose causing dehydration.", "Missing SBP.", "Sedating agitated patients with benzodiazepines."],
  "references": [tref("alf", "sections Diagnostic criteria, Primary treatment/stabilization, Essential investigations, Treatment at higher centre (encephalopathy), Acute on chronic liver failure"), tref("aasld14", "Tables 2 and 3; recommendations 9–33")]},
 nonClinical={"patientEducation": ["Take lactulose daily; aim for 2–3 soft stools.", "Family: watch for confusion or sleepiness and seek care early.", "Do not drive while recovering from overt HE."], "lifestyleAndDiet": ["Energy 35–40 kcal/kg and protein 1.2–1.5 g/kg a day; do not restrict protein (AASLD/EASL recommendations 30–31).", "Small frequent meals and a late-night snack (recommendation 32).", "No alcohol."], "mdtReferrals": ["Hepatologist", "Liver transplant centre for recurrent intractable HE", "Dietitian"], "dischargeCriteria": ["Back to baseline mental state", "Precipitant treated", "On lactulose with stool target understood"], "followUpPlan": "Hepatology review in 1–2 weeks; continue prophylaxis; transplant assessment if recurrent."})
save("t30_hepatic_enceph.json", [T])
