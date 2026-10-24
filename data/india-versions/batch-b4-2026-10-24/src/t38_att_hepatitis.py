from h import *
AH = "sections Diagnosis, Risk factors, Baseline evaluation, Monitoring, Management, Child-Pugh-based ATT, Reintroduction, Do's and don'ts"
NP = "section Adult daily doses (mg/kg)"
MD = "section Weight-band dosage table (levofloxacin row)"
TITLE = "Anti-tubercular therapy-induced hepatitis (India)"
T = topic(
 id=new_id(TITLE), title=TITLE, specialty="Infectious Diseases / Hepatology / Pulmonology", authority="ICMR", pillar="Urgent Care",
 scope="Adults on first-line anti-tubercular therapy (ATT) in India who develop raised liver enzymes or jaundice: diagnosis, when to stop drugs, an interim liver-safe regimen when TB treatment cannot wait, stepwise reintroduction, and ATT choice in chronic liver disease. Built on the ICMR ATT-Related Hepatitis workflow (March 2022), with drug doses from the ICMR National TB Elimination Programme (NTEP) drug-sensitive TB workflow and NTEP weight bands for levofloxacin.",
 findings=[
  "Diagnostic thresholds with and without symptoms, risk factors, baseline and viral hepatitis tests, monitoring, stopping hepatotoxic drugs, interim non-hepatotoxic drugs, Child-Pugh-based regimens and scoring, reintroduction criteria, sequence and doses, and do's and don'ts checked against the ICMR ATT Hepatitis STW (March 2022).",
  "Ethambutol and streptomycin mg/kg doses from the ICMR NTEP drug-sensitive TB STW; levofloxacin weight-band doses from the NTEP knowledge base (longer oral M/XDR-TB regimen table).",
  "Not clinically reviewed."],
 unverified=[
  "The ICMR STW names fluoroquinolones, ethambutol and aminoglycosides for the interim regimen without doses; levofloxacin doses are taken from the NTEP drug-resistant TB weight-band table.",
  "Cycloserine and capreomycin doses for Child-Pugh C regimens are not given; specialist only.",
  "The source drops some inequality symbols; thresholds are read as 'at or above'."],
 summary="Isoniazid, rifampicin and pyrazinamide can all injure the liver. ATT-induced hepatitis is diagnosed when transaminases rise to 3 times the upper limit with symptoms (or bilirubin 2 times the upper limit with jaundice), or to 5 times without symptoms (ICMR STW). Hepatotoxic drugs are stopped; if TB is severe and treatment cannot pause, a liver-safe interim regimen of ethambutol, a fluoroquinolone and an aminoglycoside is used. When enzymes settle, drugs are reintroduced one at a time — rifampicin, then isoniazid, then pyrazinamide — to find the culprit. Viral hepatitis must be excluded.",
 mechanisms=[
  "Isoniazid metabolites (via acetylation) cause direct hepatocyte injury.",
  "Pyrazinamide causes dose-related hepatotoxicity.",
  "Rifampicin can cause cholestasis and enhances isoniazid toxicity by enzyme induction.",
  "Alcohol, malnutrition, HIV, older age and existing liver disease reduce liver reserve."],
 presentation={
  "symptoms": ["Abdominal pain, vomiting, unexplained fatigue (ICMR STW)", "Yellow eyes (ICMR STW)", "Loss of appetite, dark urine"],
  "physicalSigns": ["Jaundice", "Tender liver", "Altered sensorium or flapping tremor (encephalopathy)", "Signs of chronic liver disease: splenomegaly, ascites, oedema (risk factors)"],
  "redFlags": ["Jaundice with coagulopathy or encephalopathy: refer immediately (ICMR STW)", "Altered sensorium (ICMR STW symptom)", "INR rising (liver failure)", "Severe hepatitis: do not reintroduce pyrazinamide (ICMR STW)"],
  "precipitants": ["Underlying liver disease, alcoholism (ICMR STW)", "Low albumin, malnutrition (ICMR STW)", "Raised transaminases at baseline (ICMR STW)", "HIV, injecting drug use, older age (ICMR STW)"]},
 differentials=[
  ("Acute viral hepatitis A or E", "Immunoglobulin M (IgM) anti-HAV or IgM anti-HEV positive (ICMR STW)."),
  ("Hepatitis B or C", "HBsAg or anti-HCV positive (ICMR STW)."),
  ("Alcoholic hepatitis", "Heavy drinking; aspartate aminotransferase (AST) greater than alanine aminotransferase (ALT)."),
  ("Other drug-induced liver injury", "Other hepatotoxic medicines (for example co-trimoxazole, antiretrovirals)."),
  ("TB of the liver or biliary obstruction", "Ultrasound findings (ICMR STW baseline ultrasound).")],
 criteria=[
  ("ATT hepatitis with symptoms (ICMR STW)", "AST or ALT 3 times baseline or upper limit of normal (ULN), or jaundice with bilirubin 2 times ULN."),
  ("ATT hepatitis without symptoms (ICMR STW)", "AST or ALT 5 times baseline or ULN."),
  ("Reintroduce when (ICMR STW)", "AST and ALT below 2 times ULN and bilirubin normal."),
  ("Child-Pugh regimens (ICMR STW)", "Child A (score 1–6): 9 months HRE, or 2 months HRE then 7 months HR. Child B (7–10): one hepatotoxic drug — 2 months isoniazid or rifampicin with ethambutol and an aminoglycoside, then 10 months isoniazid or rifampicin with ethambutol. Child C (11–15): no hepatotoxic drugs — 18–24 months ethambutol, fluoroquinolone, cycloserine and an aminoglycoside or capreomycin."),
  ("Child-Pugh points (ICMR STW)", "Bilirubin under 2 / 2–3 / over 3 mg/dL; albumin over 3.5 / 2.8–3.5 / under 2.8 g/dL; INR under 1.7 / 1.7–2.2 / over 2.2; ascites none / slight / moderate; encephalopathy none / grade 1–2 / grade 3–4.")],
 ruleIn=[
  inv("laboratory", "Liver function tests (AST, ALT, bilirubin)", "Blood tests", "ATT hepatitis", "AST and ALT under 40 U/L; bilirubin 0.3–1.2 mg/dL", "AST or ALT 3 times ULN with symptoms or 5 times without; bilirubin 2 times ULN with jaundice", "Defines ATT hepatitis; repeat 1 week after stopping and at each reintroduction step (ICMR STW).", "atth", AH),
  inv("laboratory", "Prothrombin time / INR", "Coagulation", "Liver failure", "INR 0.8–1.2", "Raised or rising INR", "Coagulopathy with jaundice: refer immediately (ICMR STW).", "atth", AH),
  inv("firstLineImaging", "Ultrasound liver", "Ultrasound", "Chronic liver disease; obstruction", "Normal liver echotexture", "Cirrhosis, splenomegaly, ascites", "Baseline evaluation for underlying liver disease (ICMR STW).", "atth", AH)],
 ruleOut=[
  inv("laboratory", "Viral hepatitis markers", "HBsAg, anti-HCV, IgM anti-HAV, IgM anti-HEV", "Viral hepatitis", "Negative", "Positive marker", "Exclude viral hepatitis (ICMR STW).", "atth", AH),
  inv("laboratory", "Serum albumin", "Blood test", "Child-Pugh scoring; malnutrition", "3.5–5.0 g/dL", "Under 2.8 g/dL scores 3 points", "Low albumin is a risk factor and Child-Pugh item (ICMR STW).", "atth", AH)],
 management=[
  step("stop", "Stop hepatotoxic drugs", "On diagnosis", ["Stop isoniazid, rifampicin and pyrazinamide (ICMR STW).", "Jaundice with coagulopathy or encephalopathy: refer to a higher centre immediately (ICMR STW).", "Exclude viral hepatitis and check INR and ultrasound (ICMR STW)."]),
  step("interim", "Is TB treatment urgent?", "Same day", ["Life- or organ-threatening TB (for example meningitis, miliary): start liver-safe drugs — fluoroquinolone, ethambutol and an aminoglycoside such as streptomycin (ICMR STW).", "Not urgent: repeat liver tests after 1 week, then reintroduce (ICMR STW)."]),
  step("reintro", "Reintroduce one drug at a time", "When AST and ALT under 2 times ULN and bilirubin normal", ["Rifampicin 10 mg/kg; after 1 week, if liver tests normal, add isoniazid 5 mg/kg; after another week, if normal, add pyrazinamide 25 mg/kg (ICMR STW).", "Alternative: start each drug at low dose and reach full dose after 3 days (ICMR STW).", "After severe hepatitis (liver failure, coagulopathy, altered sensorium), do not reintroduce pyrazinamide (ICMR STW).", "Count treatment duration only from the start of full ATT (ICMR STW)."]),
  step("cld", "Underlying chronic liver disease", "Before starting ATT", ["Score Child-Pugh and choose the regimen by class (ICMR STW).", "Counsel on symptoms; monitor liver tests (ICMR STW)."])],
 branches=[
  ("Interim liver-safe regimen", "ATT hepatitis when TB treatment cannot be paused (ICMR STW)."),
  ("Reintroduction — step 1", "AST and ALT below 2 times ULN and bilirubin normal (ICMR STW)."),
  ("Reintroduction — step 2 (after 1 week)", "Liver tests normal 1 week after rifampicin (ICMR STW)."),
  ("Reintroduction — step 3 (after another week)", "Liver tests normal 1 week after isoniazid; not after severe hepatitis (ICMR STW).")],
 regimens=[
  rx("Interim liver-safe regimen", "Liver-safe drugs (given together)", "ATT hepatitis, urgent TB", "Adults", "Ethambutol", "15 mg/kg (range 12–18)", "Oral", "Once daily", "Until reintroduction is complete", "Children: paediatric programme dosing.", NOT_ABX, "Renally cleared: reduce frequency in kidney impairment; specialist advice.", "Not hepatotoxic (ICMR STW).", ["Visual acuity and colour vision"], ["Optic neuritis"], "ntep", NP),
  rx("Interim liver-safe regimen", "Liver-safe drugs (given together)", "ATT hepatitis, urgent TB", "Adults", "Levofloxacin", "30–45 kg: 750 mg; 46–70 kg: 1000 mg; over 70 kg: 1000 mg", "Oral", "Once daily", "Until reintroduction is complete", "Children: paediatric programme dosing.", "Not a beta-lactam.", "Reduce dose in kidney impairment; check the formulary.", "Not hepatotoxic in this role (ICMR STW lists fluoroquinolones).", ["QT interval if risk factors", "Tendon pain"], ["QT prolongation, myasthenia gravis"], "ntepmdr", MD),
  rx("Interim liver-safe regimen", "Liver-safe drugs (given together)", "ATT hepatitis, urgent TB", "Adults", "Streptomycin", "15 mg/kg (range 15–20)", "Intramuscular", "Once daily", "Until reintroduction is complete", "Children: paediatric programme dosing.", NOT_ABX, "Avoid or reduce in kidney impairment; monitor creatinine.", "Not hepatotoxic.", ["Hearing, balance, creatinine"], ["Pregnancy; existing hearing loss"], "ntep", NP),
  rx("Reintroduction — step 1", "First drug back", "Rifampicin reintroduction", "Adults", "Rifampicin", "10 mg/kg (max 600 mg)", "Oral", "Once daily", "Continue; recheck liver tests after 1 week", "Children: programme dosing.", NOT_ABX, "No change.", "Stop again if enzymes rise.", ["Liver function at 1 week"], ["Recurrent hepatitis on rechallenge"], "atth", AH),
  rx("Reintroduction — step 2 (after 1 week)", "Second drug back", "Isoniazid reintroduction", "Adults", "Isoniazid", "5 mg/kg (max 300 mg)", "Oral", "Once daily", "Continue; recheck liver tests after 1 week", "Children: programme dosing.", NOT_ABX, "No change.", "Stop again if enzymes rise.", ["Liver function at 1 week"], ["Recurrent hepatitis on rechallenge"], "atth", AH),
  rx("Reintroduction — step 3 (after another week)", "Third drug back", "Pyrazinamide reintroduction", "Adults", "Pyrazinamide", "25 mg/kg (max 2000 mg)", "Oral", "Once daily", "Complete intensive phase", "Children: programme dosing.", NOT_ABX, "Reduce frequency in kidney impairment; specialist advice.", "Do not reintroduce after severe hepatitis (ICMR STW).", ["Liver function at 1 week", "Uric acid, joint pain"], ["Severe hepatitis previously (ICMR STW)"], "atth", AH)],
 medNote="Reintroduction doses and sequence are from the ICMR ATT Hepatitis STW; ethambutol and streptomycin doses from the ICMR NTEP STW (maximum doses from its paediatric table); levofloxacin from NTEP weight bands. Once the culprit is found, the regimen is rebuilt without it under specialist and NTEP guidance. Not clinically reviewed.",
 teaching={"scope": "Liver injury during ATT.", "learningObjectives": ["Diagnose ATT hepatitis using thresholds.", "Decide when an interim regimen is needed.", "Reintroduce drugs safely."],
  "keyPoints": ["3 times ULN with symptoms, 5 times without.", "Stop isoniazid, rifampicin and pyrazinamide.", "Reintroduce rifampicin, then isoniazid, then pyrazinamide, a week apart.", "No pyrazinamide after severe hepatitis."],
  "pitfalls": ["Stopping all TB treatment in TB meningitis without an interim regimen.", "Missing viral hepatitis A or E.", "Reintroducing all drugs together.", "Counting interrupted weeks toward treatment duration."],
  "references": [tref("atth", AH), tref("ntep", NP), tref("ntepmdr", MD)]},
 nonClinical={"patientEducation": ["Stop ATT and report at once if eyes turn yellow, vomiting or abdominal pain start (ICMR STW counselling).", "Do not take herbal or over-the-counter medicines without advice.", "Do not drink alcohol."], "lifestyleAndDiet": ["Normal balanced diet", "Avoid alcohol"], "mdtReferrals": ["Chest physician or TB specialist", "Hepatology for liver failure or chronic liver disease", "NTEP treatment supporter"], "dischargeCriteria": ["No encephalopathy or coagulopathy", "Liver tests improving", "Reintroduction plan agreed"], "followUpPlan": "Liver tests 1 week after stopping and after each reintroduction step (ICMR STW); then regularly during ATT."})
save("t38_att_hepatitis.json", [T])
