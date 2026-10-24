from h import *
TITLE = "Chronic hepatitis C (India)"
V_DX = "p. 34 (diagnosis, whom to test)"
V_AS = "p. 35 (clinical assessment, fibrosis)"
V_MON = "p. 36 (Table 7 monitoring schedule, whom to treat, Fig. 7 algorithm)"
V_RX = "p. 37 (Tables 8 and 9 regimens and doses)"
V_REF = "p. 38 (referral, side effects, ribavirin dose adjustment)"
V_CI = "p. 39 (contraindications, Table 10, Table 11 decompensated cirrhosis)"
V_TE = "p. 40 (Table 12 treatment-experienced patients)"
V_HIV = "p. 41 (HIV/HCV co-infection)"
T = topic(
 id="73279482-1ebb-5533-975b-b5118ef7bb7c", title=TITLE, specialty="Hepatology / Infectious Diseases", authority="MoHFW", pillar="Chronic Care",
 scope="Adults in India with hepatitis C virus (HCV) infection: who to test, confirmation with HCV RNA, staging fibrosis, pan-genotypic direct-acting antiviral (DAA) treatment under the National Viral Hepatitis Control Program (NVHCP), monitoring to sustained virological response at 12 weeks (SVR12), and referral of complex cases. Built on the NVHCP National Guidelines for Diagnosis and Management of Viral Hepatitis (2018).",
 findings=[
  "Anti-HCV screening, confirmation by HCV RNA, priority groups for testing and pre-treatment assessment checked against NVHCP 2018, pp. 34–35.",
  "Treat everyone with viraemia; sofosbuvir with daclatasvir for 12 weeks without cirrhosis, sofosbuvir with velpatasvir for 12 weeks in compensated cirrhosis, and with ribavirin (or 24 weeks without ribavirin) in decompensated cirrhosis checked against pp. 36–37 (Fig. 7, Tables 8 and 9).",
  "Monitoring schedule (Table 7), referral criteria, ribavirin dose adjustment and contraindications, amiodarone and enzyme-inducer interactions checked against pp. 36–39.",
  "Treatment-experienced regimens (Table 12) and HIV co-infection checked against pp. 40–41.",
  "Not clinically reviewed."],
 unverified=[
  "Paediatric DAA doses are not given; NVHCP refers children to a specialised centre.",
  "Sofosbuvir in eGFR under 30 mL/min/1.73 m² is to be used with caution at a Model Treatment Centre; exact regimen not specified.",
  "HCV in pregnancy: DAAs are not recommended in pregnancy in the sources used; defer treatment until after delivery and seek specialist advice.",
  "Hepatocellular carcinoma surveillance after cure in cirrhosis is not specified in the NVHCP sections used."],
 summary="Hepatitis C is a blood-borne RNA virus. Most people infected develop chronic infection without symptoms, and over years some progress to cirrhosis, liver failure and hepatocellular carcinoma (HCC), at 2–4% per year once cirrhotic (NVHCP p. 34). Oral direct-acting antivirals achieve sustained virological response in over 95% (NVHCP p. 41), and every person with detectable HCV RNA should be treated (NVHCP p. 36).",
 mechanisms=[
  "HCV replicates in hepatocytes; chronic immune-mediated injury causes inflammation and fibrosis.",
  "Fibrosis progresses faster with alcohol, male sex, HIV or HBV co-infection and immunosuppression (NVHCP p. 35).",
  "Extrahepatic effects include cryoglobulinaemia, glomerulonephritis, insulin resistance and lichen planus (NVHCP p. 35).",
  "DAAs block viral NS5A and NS5B proteins; SVR12 equals cure."],
 presentation={
  "symptoms": ["Usually none; found on screening (NVHCP p. 34)", "Fatigue, cognitive problems, depression (NVHCP p. 35)", "Jaundice, abdominal swelling, confusion or bleeding in decompensated cirrhosis"],
  "physicalSigns": ["Often normal", "Stigmata of chronic liver disease", "Ascites, jaundice, encephalopathy (decompensation) (NVHCP p. 39)", "Purpura or rash from cryoglobulinaemia (NVHCP p. 35)"],
  "redFlags": ["Ascites, jaundice, encephalopathy or variceal bleeding (Child-Pugh B or C): refer to a Model Treatment Centre (NVHCP p. 39)", "Taking amiodarone: sofosbuvir is contraindicated (bradycardia) (NVHCP p. 38)", "HBV co-infection: risk of HBV reactivation during HCV treatment", "Liver mass on ultrasound: suspected HCC"],
  "precipitants": ["Injecting drug use with shared equipment (NVHCP p. 34)", "Blood transfusion before routine screening; frequent transfusion (thalassaemia, dialysis) (NVHCP p. 34)", "Unsafe injections or procedures", "HIV infection; men who have sex with men; sex work (NVHCP p. 34)"]},
 differentials=[
  ("Past cleared HCV infection", "Anti-HCV positive but HCV RNA not detected; no treatment needed (NVHCP p. 34)."),
  ("False-positive anti-HCV", "HCV RNA not detected (NVHCP p. 34)."),
  ("Chronic hepatitis B", "HBsAg positive."),
  ("Steatotic or alcohol-related liver disease", "HCV RNA negative; metabolic or alcohol history.")],
 criteria=[
  ("Chronic HCV infection (NVHCP p. 34)", "Reactive anti-HCV confirmed by detectable HCV RNA."),
  ("Whom to treat (NVHCP p. 36)", "Everyone with detectable HCV RNA."),
  ("Decompensated cirrhosis (NVHCP p. 39)", "Ascites, jaundice, history of hepatic encephalopathy or variceal bleed, or Child-Pugh score 7 or more (class B and C)."),
  ("Cure (NVHCP p. 36)", "HCV RNA not detected 12 weeks after the end of treatment (SVR12).")],
 ruleIn=[
  inv("laboratory", "Anti-HCV antibody", "Rapid test or immunoassay", "HCV exposure", "Non-reactive", "Reactive", "Screening test; does not separate current from past infection (NVHCP p. 34).", "vh", V_DX),
  inv("laboratory", "HCV RNA (nucleic acid test)", "Blood", "Current infection", "Not detected", "Detected", "Confirms chronic infection before treatment; repeat 12 weeks after treatment for SVR12 (NVHCP pp. 34, 36).", "vh", V_DX),
  inv("laboratory", "Platelet count, AST and ALT with APRI and FIB-4", "Blood", "Fibrosis and cirrhosis", "Platelets 150–400 ×10⁹/L; APRI under 0.5", "APRI 2 or more suggests cirrhosis", "Decides the regimen (cirrhosis or not) (NVHCP pp. 35–36).", "vh", V_MON),
  inv("laboratory", "Complete blood count, serum creatinine, liver function tests", "Blood", "Treatment safety", "Haemoglobin 12–15 g/dL (female), 13–17 g/dL (male); creatinine 0.6–1.2 mg/dL", "Anaemia, raised creatinine or deranged liver tests", "Baseline and at week 4 (and weeks 1, 2, 8, 12 on ribavirin) (NVHCP Table 7, p. 36).", "vh", V_MON)],
 ruleOut=[
  inv("firstLineImaging", "Abdominal ultrasound", "Liver and spleen", "Cirrhosis, HCC, ascites", "Normal liver; no focal lesion", "Nodular liver, splenomegaly, ascites or focal lesion", "Stage disease; refer focal lesions (NVHCP p. 41).", "vh", V_HIV),
  inv("specializedAdjunctive", "Transient elastography", "Liver stiffness", "Fibrosis", "Under 8.0 kPa", "12.5 kPa or more suggests cirrhosis", "Use if available (NVHCP Fig. 7, p. 36); cut-offs from the NVHCP Hepatitis B guideline (p. 22).", "vh", V_MON, extra=("hbtg", "p. 22 (elastography cut-offs)")),
  inv("laboratory", "HBsAg and HIV test", "Serology", "Co-infection", "Non-reactive", "Reactive", "Offer to all with HCV; HBV reactivation and drug interactions change care (NVHCP pp. 34, 41).", "vh", V_DX)],
 management=[
  step("confirm", "Confirm and stage", "Before treatment", ["Confirm with HCV RNA; test HBsAg and HIV (NVHCP p. 34).", "APRI, FIB-4, elastography if available; ultrasound (NVHCP p. 36).", "Alcohol history with brief intervention; review all medicines for interactions (NVHCP pp. 35, 39)."]),
  step("refer", "Refer complex cases", "Before starting", ["Decompensated cirrhosis, treatment-experienced, chemotherapy with deranged liver tests, kidney impairment, HCC, children, thalassaemia: refer to a Model Treatment Centre (NVHCP p. 38)."]),
  step("treat", "Treat", "12 weeks", ["No cirrhosis: sofosbuvir + daclatasvir for 12 weeks (NVHCP Table 8).", "Compensated cirrhosis: sofosbuvir + velpatasvir for 12 weeks (NVHCP Table 8).", "Adherence counselling with pill counts at monthly visits (NVHCP p. 38)."]),
  step("cure", "Confirm cure", "12 weeks after treatment ends", ["HCV RNA at SVR12; detected: refer to a higher centre (NVHCP Fig. 7).", "People who inject drugs: retest HCV RNA at least yearly for reinfection (NVHCP p. 40)."])],
 branches=[
  ("No cirrhosis", "Detectable HCV RNA, treatment naïve, no cirrhosis (NVHCP Table 8 regime I)."),
  ("Compensated cirrhosis", "Child-Pugh A cirrhosis, treatment naïve (NVHCP Table 8 regime II)."),
  ("Decompensated cirrhosis", "Child-Pugh B or C; manage at a Model Treatment Centre (NVHCP Table 11).")],
 regimens=[
  rx("No cirrhosis", "Antiviral", "Chronic HCV without cirrhosis", "Adults", "Sofosbuvir + daclatasvir", "Sofosbuvir 400 mg + daclatasvir 60 mg", "Oral", "Once daily", "12 weeks (84 days)", "Children: refer to a specialised centre (NVHCP p. 38).", NOT_ABX, "eGFR under 30: caution, treat at Model Treatment Centre (NVHCP p. 39); dose adjustment noted for renal insufficiency (Table 8).", "Not for decompensated cirrhosis.", ["CBC, creatinine, LFT at baseline and week 4; HCV RNA at SVR12 (Table 7)"], ["Amiodarone (bradycardia); carbamazepine, phenytoin (NVHCP pp. 38–39)"], "vh", V_RX),
  rx("Compensated cirrhosis", "Antiviral", "Chronic HCV with compensated cirrhosis", "Adults", "Sofosbuvir + velpatasvir", "Sofosbuvir 400 mg + velpatasvir 100 mg", "Oral", "Once daily", "12 weeks (84 days)", "Children: refer to a specialised centre (NVHCP p. 38).", NOT_ABX, "eGFR under 30: caution, treat at Model Treatment Centre (NVHCP p. 39).", "Child-Pugh A only in this branch.", ["CBC, creatinine, LFT at baseline and week 4; HCV RNA at SVR12"], ["Amiodarone; carbamazepine, phenytoin (NVHCP pp. 38–39)"], "vh", V_RX),
  rx("Decompensated cirrhosis", "Antiviral regimen", "Decompensated HCV cirrhosis", "Adults", "Sofosbuvir + velpatasvir + ribavirin", "Sofosbuvir 400 mg + velpatasvir 100 mg once daily; ribavirin 1,000 mg/day (under 75 kg) or 1,200 mg/day (75 kg or more), starting at 600 mg/day and increasing as tolerated", "Oral (ribavirin with food in 2 divided doses)", "Daily", "12 weeks", "Not applicable; specialist centre.", NOT_ABX, "Ribavirin: avoid if eGFR under 50; on haemodialysis 200 mg/day (NVHCP p. 38).", "Model Treatment Centre only (NVHCP Table 11).", ["Haemoglobin weeks 1, 2, 4, 8, 12; reduce ribavirin to 600 mg/day if haemoglobin under 10 g/dL, stop if under 8.5 g/dL (NVHCP p. 38)"], ["Pregnancy or no contraception; breastfeeding; haemoglobinopathy (ribavirin) (Table 10)"], "vh", V_CI, sel="one-of", pref=True),
  rx("Decompensated cirrhosis", "Antiviral regimen", "Decompensated HCV cirrhosis, ribavirin intolerant", "Adults", "Sofosbuvir + velpatasvir (24 weeks)", "Sofosbuvir 400 mg + velpatasvir 100 mg", "Oral", "Once daily", "24 weeks (168 days)", "Not applicable; specialist centre.", NOT_ABX, "eGFR under 30: caution (NVHCP p. 39).", "Model Treatment Centre only (NVHCP Table 11).", ["LFT, creatinine; HCV RNA at SVR12"], ["Amiodarone; carbamazepine, phenytoin"], "vh", V_CI, sel="one-of", pref=False, use="Ribavirin not tolerated or contraindicated (NVHCP Tables 8 and 11).")],
 medNote="All regimens and doses from NVHCP 2018: sofosbuvir 400 mg with daclatasvir 60 mg (no cirrhosis) or velpatasvir 100 mg (cirrhosis), 12 weeks; decompensated cirrhosis adds weight-based ribavirin or extends to 24 weeks. Treatment-experienced patients go to a Model Treatment Centre (Table 12). Check interactions at hep-druginteractions.org (NVHCP p. 39). Not clinically reviewed.",
 teaching={"scope": "Chronic hepatitis C in primary and specialist care.", "learningObjectives": ["Confirm infection with HCV RNA after a reactive antibody test.", "Choose the NVHCP regimen by cirrhosis status.", "Know when to refer to a Model Treatment Centre."],
  "keyPoints": ["Anti-HCV positive is not a diagnosis; check HCV RNA.", "Everyone with viraemia is treated.", "12 weeks of sofosbuvir-based therapy cures most patients.", "Confirm cure with HCV RNA 12 weeks after treatment."],
  "pitfalls": ["Treating on antibody result alone.", "Missing amiodarone or enzyme-inducing antiepileptics.", "Treating decompensated cirrhosis outside a specialist centre.", "Forgetting HBV reactivation in co-infection."],
  "references": [tref("vh", V_DX + "; " + V_AS + "; " + V_MON + "; " + V_RX + "; " + V_REF + "; " + V_CI + "; " + V_TE + "; " + V_HIV), tref("hbtg", "p. 22 (elastography cut-offs)")]},
 nonClinical={"patientEducation": ["Hepatitis C is curable with 12 weeks of tablets; take every dose.", "A negative antibody test does not protect against future infection (NVHCP p. 37).", "Cure does not prevent reinfection; avoid sharing needles."], "lifestyleAndDiet": ["Stop or reduce alcohol (NVHCP p. 37).", "Vaccinate against hepatitis A and B if not immune (NVHCP p. 37)."], "mdtReferrals": ["Model Treatment Centre for complex cases (NVHCP p. 38)", "Opioid substitution and harm reduction services for people who inject drugs (NVHCP p. 41)"], "dischargeCriteria": ["Treatment completed with adherence confirmed", "SVR12 test booked"], "followUpPlan": "Monitoring per NVHCP Table 7; HCV RNA 12 weeks after treatment; yearly HCV RNA for ongoing risk (NVHCP pp. 36, 40)."})
save("t45_chc.json", [T])
