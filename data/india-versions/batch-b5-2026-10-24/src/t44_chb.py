from h import *
TITLE = "Chronic hepatitis B (India)"
HB_W = "p. 22 (whom to treat algorithm)"
HB_D = "p. 23 (Tables 2 and 3, selection of antiviral drug)"
HB_M = "p. 24 (monitoring the treatment, referral, pregnancy)"
HB_P = "pp. 24–25 (pregnancy, care of the baby, breastfeeding, children)"
HB_C = "pp. 26–27 (co-infections, prevention)"
HB_R = "p. 47 (use of TAF, renal monitoring, entecavir dose in renal impairment)"
HB_I = "p. 18 (introduction)"
T = topic(
 id="bcec1963-9cf6-5601-b5c3-f293cd3a5b49", title=TITLE, specialty="Hepatology / Infectious Diseases", authority="MoHFW", pillar="Chronic Care",
 scope="Adults and children in India with hepatitis B surface antigen (HBsAg) persisting for 6 months or more: assessment, who to treat under the National Viral Hepatitis Control Program (NVHCP), choice and dosing of tenofovir or entecavir, monitoring, pregnancy and prevention of mother-to-child transmission, and co-infection with HIV or hepatitis C. Built on the NVHCP Technical Guidelines for Diagnosis and Management of Hepatitis B (2019).",
 findings=[
  "Definition of chronic infection, use of aspartate aminotransferase-to-platelet ratio index (APRI) and fibrosis-4 (FIB-4) cut-offs, elastography thresholds and the whom-to-treat algorithm checked against NVHCP Hepatitis B Technical Guidelines 2019, p. 22.",
  "Adult and paediatric doses of tenofovir disoproxil fumarate (TDF), entecavir and tenofovir alafenamide (TAF) and rules for choosing between them checked against Tables 2 and 3, p. 23.",
  "Baseline and follow-up tests, referral to Model Treatment Centres, pregnancy, birth-dose vaccine and hepatitis B immunoglobulin, breastfeeding and children checked against pp. 24–25.",
  "HIV co-infection (tenofovir-based antiretroviral therapy), hepatitis C co-infection and prevention checked against pp. 26–27; renal monitoring and entecavir renal dosing against p. 47.",
  "Not clinically reviewed."],
 unverified=[
  "TDF dose interval in reduced creatinine clearance is not given in the NVHCP guideline; the guideline advises entecavir or TAF when eGFR is under 60 mL/min/1.73 m².",
  "Antiviral prophylaxis in pregnancy for high viral load is described as unclear in NVHCP 2019; follow current specialist advice.",
  "Hepatocellular carcinoma surveillance interval is not stated explicitly in the NVHCP sections used; ultrasound is part of baseline assessment.",
  "The fixed-dose antiretroviral tablet strengths (TDF 300 mg, lamivudine 300 mg, efavirenz 600 mg) are not stated in NVHCP 2019; the National AIDS Control Organisation now favours dolutegravir-based tenofovir regimens — follow the current national ART guideline.",
  "Pegylated interferon is for selected patients at Model Treatment Centres; dosing is not given here."],
 summary="Chronic hepatitis B (CHB) is defined by HBsAg persisting for 6 months or more. India has intermediate endemicity; most infections are acquired at birth or in early childhood, when about 90% of infected newborns become chronic carriers. Many people stay well for years, but some develop cirrhosis, liver failure or hepatocellular carcinoma (HCC). Antivirals suppress the virus and prevent progression but rarely cure, so treatment is usually lifelong (NVHCP 2019, p. 18).",
 mechanisms=[
  "Hepatitis B virus (HBV) persists in hepatocytes as covalently closed circular DNA, which drugs do not eradicate.",
  "Immune attack on infected hepatocytes causes inflammation (raised ALT) and progressive fibrosis.",
  "Fibrosis leads to cirrhosis, portal hypertension and decompensation.",
  "Integrated viral DNA and chronic inflammation drive HCC, even without cirrhosis."],
 presentation={
  "symptoms": ["Usually none; found on screening (antenatal, blood donation, pre-surgery) (NVHCP p. 18)", "Fatigue, right upper abdominal discomfort", "Jaundice, abdominal swelling or confusion in advanced disease"],
  "physicalSigns": ["Often normal examination", "Signs of chronic liver disease: palmar erythema, spider naevi", "Ascites, pedal oedema in decompensation (NVHCP p. 26)"],
  "redFlags": ["Jaundice, ascites, hepatic encephalopathy or variceal bleeding: decompensated cirrhosis — refer to Model Treatment Centre (NVHCP p. 24)", "Flare with jaundice or acute liver failure (NVHCP p. 24)", "Stopping tenofovir in HIV co-infection: risk of severe flare (NVHCP p. 27)", "Starting chemotherapy or immunosuppression: reactivation risk (NVHCP p. 24)"],
  "precipitants": ["Perinatal transmission from an infected mother (NVHCP p. 18)", "Unsafe injections, transfusion, needle sharing", "Unprotected sex", "Immunosuppression or chemotherapy causing reactivation"]},
 differentials=[
  ("Acute hepatitis B", "Recent exposure within 180 days and high ALT; repeat HBsAg after 6 months to confirm chronicity (NVHCP p. 22)."),
  ("Chronic hepatitis C", "Anti-HCV positive with detectable HCV RNA."),
  ("Metabolic dysfunction-associated steatotic liver disease", "HBsAg negative; fatty liver on ultrasound with metabolic risk factors."),
  ("Alcohol-related liver disease", "Alcohol history; AST:ALT ratio often over 2.")],
 criteria=[
  ("Chronic HBV infection (NVHCP p. 22)", "HBsAg positive for 6 months or more."),
  ("Cirrhosis by non-invasive tests (NVHCP p. 22)", "APRI 2 or more, or FIB-4 3.25 or more, or elastography 12.5 kPa or more."),
  ("Significant fibrosis (NVHCP p. 22)", "APRI over 1.5, or FIB-4 over 1.45, or elastography 8.0 kPa or more."),
  ("Treat (NVHCP p. 22)", "Cirrhosis: treat irrespective of age, ALT, HBeAg or HBV DNA. Non-cirrhotic: treat if HBV DNA over 20,000 IU/mL with persistently raised ALT, or HBV DNA over 2,000 IU/mL with APRI over 1.5, FIB-4 over 1.45 or platelets under 100 ×10⁹/L, particularly if over 30 years."),
  ("Persistently raised ALT (NVHCP p. 22)", "At least 2 values 4 weeks apart in the last 6 months above the upper limit of normal.")],
 ruleIn=[
  inv("laboratory", "Hepatitis B surface antigen", "Serology (rapid test or immunoassay)", "HBV infection", "Non-reactive", "Reactive for 6 months or more", "Defines chronic infection (NVHCP p. 22).", "hbtg", HB_W),
  inv("laboratory", "HBV DNA viral load (real-time PCR)", "Blood", "Viral replication", "Undetectable", "Over 2,000 or over 20,000 IU/mL", "Decides treatment in non-cirrhotic patients; repeat yearly (NVHCP pp. 22, 24).", "hbtg", HB_M),
  inv("laboratory", "ALT and AST", "Liver function tests", "Liver inflammation", "ALT under 35 U/L (local upper limit)", "Persistently above upper limit", "Two raised values 4 weeks apart define persistent elevation; repeat every 6 months (NVHCP pp. 22, 24).", "hbtg", HB_W),
  inv("laboratory", "Platelet count with APRI and FIB-4", "Blood count and calculation", "Fibrosis and cirrhosis", "Platelets 150–400 ×10⁹/L; APRI under 0.5", "APRI over 1.5 (fibrosis) or 2 or more (cirrhosis)", "Non-invasive staging; repeat every 6 months (NVHCP pp. 22, 24).", "hbtg", HB_W)],
 ruleOut=[
  inv("firstLineImaging", "Abdominal ultrasound", "Liver and spleen", "Cirrhosis, HCC", "Normal liver echotexture; no focal lesion", "Coarse nodular liver, splenomegaly, ascites or focal lesion", "Baseline assessment for cirrhosis and HCC (NVHCP p. 24).", "hbtg", HB_M),
  inv("specializedAdjunctive", "Transient elastography (FibroScan)", "Liver stiffness", "Fibrosis", "Under 8.0 kPa", "8.0 kPa or more (fibrosis); 12.5 kPa or more (cirrhosis)", "Use where available (conditional) (NVHCP p. 22).", "hbtg", HB_W),
  inv("laboratory", "HIV and anti-HCV testing", "Serology", "Co-infection", "Non-reactive", "Reactive", "Screen all HBsAg-positive people; changes treatment (NVHCP pp. 24, 26).", "hbtg", HB_C),
  inv("laboratory", "Serum creatinine (eGFR) and phosphate", "Blood", "Drug toxicity", "eGFR 90 mL/min/1.73 m² or more; phosphate 2.5–4.5 mg/dL", "eGFR under 60 or phosphate under 2 mg/dL", "Monitor on TDF every 3 months in year 1, then every 6 months (NVHCP p. 47).", "hbtg", HB_R)],
 management=[
  step("assess", "Assess", "First visit", ["Complete blood count, HBsAg, APRI, liver function tests, abdominal ultrasound and HBV DNA (NVHCP p. 24).", "Test for HIV and hepatitis C (NVHCP p. 24).", "Assess alcohol use; vaccinate household contacts and sexual partners who are HBsAg negative."]),
  step("decide", "Decide on treatment", "After baseline tests", ["Use the NVHCP whom-to-treat algorithm (NVHCP p. 22).", "HBeAg is not needed to decide on treatment (NVHCP p. 22)."]),
  step("treat", "Start antiviral", "When criteria met", ["Tenofovir or entecavir; both have a high barrier to resistance (NVHCP p. 23).", "Refer to a Model Treatment Centre for TAF, interferon, decompensation, chemotherapy, virological failure or flares (NVHCP p. 24)."]),
  step("monitor", "Monitor", "Every 6–12 months, lifelong", ["ALT and APRI/FIB-4 every 6 months; HBV DNA yearly (NVHCP p. 24).", "Renal function on TDF every 3 months in year 1, then 6-monthly (NVHCP p. 47)."]),
  step("pregnancy", "Pregnancy and newborn", "Antenatal and at birth", ["Assess the mother for treatment; caesarean only for obstetric reasons (NVHCP p. 24).", "Baby: hepatitis B vaccine birth dose within 24 hours plus doses at 6, 10 and 14 weeks; hepatitis B immunoglobulin 0.5 mL (100 IU) within 12–24 hours in the other thigh (NVHCP pp. 25, 27).", "Breastfeeding is allowed (NVHCP p. 25)."])],
 branches=[
  ("Adults and adolescents 12 years or older", "Meets NVHCP treatment criteria (NVHCP p. 22)."),
  ("Children 2–11 years", "Meets treatment criteria; manage with paediatric specialist (NVHCP pp. 23, 25)."),
  ("HIV co-infection", "HBsAg positive with HIV, irrespective of CD4 count or liver disease (NVHCP p. 26)."),
  ("Newborn of HBsAg-positive mother", "All babies born to HBsAg-positive mothers (NVHCP pp. 25, 27).")],
 regimens=[
  rx("Adults and adolescents 12 years or older", "Antiviral", "Chronic hepatitis B", "Adults", "Tenofovir disoproxil fumarate (TDF)", "300 mg", "Oral", "Once daily", "Long term, usually lifelong", "12 years or older and at least 35 kg: 300 mg once daily (NVHCP Table 3).", NOT_ABX, "eGFR under 60 mL/min/1.73 m², albuminuria or low phosphate: prefer entecavir or TAF (NVHCP pp. 23, 47).", "No dose change stated in NVHCP; decompensated cirrhosis is managed at a Model Treatment Centre (NVHCP p. 24).", ["Creatinine and phosphate every 3 months in year 1, then 6-monthly", "ALT 6-monthly; HBV DNA yearly"], ["Kidney impairment; osteoporosis"], "hbtg", HB_D, sel="one-of", pref=True),
  rx("Adults and adolescents 12 years or older", "Antiviral", "Chronic hepatitis B", "Adults", "Entecavir", "0.5 mg (1 mg in decompensated liver disease)", "Oral", "Once daily", "Long term, usually lifelong", "2–11 years: oral solution by weight (see paediatric branch) (NVHCP Table 3).", NOT_ABX, "CrCl 30–49 mL/min: 0.5 mg every 48 h; 10–29: every 72 h; under 10 or dialysis: every 7 days (NVHCP p. 47).", "Decompensated liver disease: 1 mg once daily (NVHCP Table 2).", ["ALT 6-monthly; HBV DNA yearly"], ["Pregnancy (not recommended); previous lamivudine exposure (resistance risk)"], "hbtg", HB_D, sel="one-of", pref=False, use="Age over 60, bone disease, eGFR under 60 or on dialysis, and not pregnant or planning pregnancy (NVHCP p. 23)."),
  rx("Adults and adolescents 12 years or older", "Antiviral", "Chronic hepatitis B", "Adults", "Tenofovir alafenamide (TAF)", "25 mg", "Oral", "Once daily", "Long term, usually lifelong", "Not given for children in NVHCP.", NOT_ABX, "Drug of choice in reduced renal function or bone disease when entecavir is contraindicated (NVHCP p. 23).", NS, ["Creatinine 6-monthly; ALT; HBV DNA yearly"], ["Prescribe through a Model Treatment Centre (NVHCP p. 24)"], "hbtg", HB_D, sel="one-of", pref=False, use="Kidney or bone disease where entecavir is unsuitable, or previous lamivudine or telbivudine exposure (NVHCP pp. 23, 47)."),
  rx("Children 2–11 years", "Antiviral", "Chronic hepatitis B in children", "Children 2–11 years, at least 10 kg", "Entecavir oral solution (paediatric)", "By weight: 10–11 kg 3 mL; over 11–14 kg 4 mL; over 14–17 kg 5 mL; over 17–20 kg 6 mL; over 20–23 kg 7 mL; over 23–26 kg 8 mL; over 26–30 kg 9 mL; over 30 kg 10 mL (0.5 mg)", "Oral", "Once daily", "Long term; specialist decision", "Paediatric dose from NVHCP Table 3; paediatric formulations were not yet approved in India in 2019.", NOT_ABX, "Adjust interval in renal impairment; seek paediatric advice.", NS, ["ALT; HBV DNA; growth"], ["Under 2 years or under 10 kg"], "hbtg", HB_D),
  rx("HIV co-infection", "Antiretroviral therapy", "HIV and HBV co-infection", "Adults and adolescents", "Tenofovir + lamivudine + efavirenz (fixed-dose combination)", "One tablet (TDF 300 mg, lamivudine 300 mg, efavirenz 600 mg per national ART formulation)", "Oral", "Once daily", "Lifelong; never stop tenofovir", "Per national antiretroviral therapy guidelines.", NOT_ABX, "Renal monitoring as for TDF.", NS, ["HIV viral load, HBV DNA, creatinine"], ["Do not stop tenofovir: risk of severe hepatitis flare (NVHCP p. 27)"], "hbtg", HB_C),
  rx("Newborn of HBsAg-positive mother", "Immunoprophylaxis", "Prevention of mother-to-child transmission", "Newborn", "Hepatitis B immunoglobulin", "0.5 mL (100 IU)", "Intramuscular, anterolateral thigh (other thigh to vaccine)", "Single dose", "Single dose within 12–24 hours of birth", "Newborn dose (NVHCP p. 25).", NOT_ABX, "Not applicable.", "Not applicable.", ["Complete vaccine schedule; test baby after 1 year of age (NVHCP p. 25)"], ["Do not delay the hepatitis B vaccine birth dose"], "hbtg", HB_P)],
 medNote="All doses from NVHCP Technical Guidelines for Hepatitis B (2019): TDF 300 mg, entecavir 0.5 mg (1 mg if decompensated), TAF 25 mg once daily; paediatric entecavir by weight. The fixed-dose antiretroviral tablet composition follows the national ART programme; confirm with the National AIDS Control Organisation formulary. Hepatitis B vaccine is given to the baby within 24 hours plus 3 further doses. Not clinically reviewed.",
 teaching={"scope": "Chronic hepatitis B in primary and specialist care.", "learningObjectives": ["Stage liver disease with APRI, FIB-4 and ultrasound.", "Apply the NVHCP whom-to-treat algorithm.", "Prevent mother-to-child transmission."],
  "keyPoints": ["Cirrhosis: treat regardless of DNA or ALT.", "Tenofovir or entecavir; never lamivudine alone.", "Women who may become pregnant: tenofovir.", "Birth-dose vaccine within 24 hours for every baby of an HBsAg-positive mother."],
  "pitfalls": ["Stopping antivirals and triggering a flare.", "Using entecavir in a woman planning pregnancy.", "Missing HIV co-infection before starting therapy.", "Starting chemotherapy without checking HBsAg."],
  "references": [tref("hbtg", HB_I + "; " + HB_W + "; " + HB_D + "; " + HB_M + "; " + HB_P + "; " + HB_C + "; " + HB_R)]},
 nonClinical={"patientEducation": ["Hepatitis B is long-term; take tablets every day and do not stop without advice.", "Family members and partners should be tested and vaccinated.", "Breastfeeding is safe if the baby is vaccinated (NVHCP p. 25)."], "lifestyleAndDiet": ["Avoid alcohol.", "Safe sex and no sharing of needles, razors or toothbrushes."], "mdtReferrals": ["Model Treatment Centre for decompensation, failure, TAF, interferon or chemotherapy (NVHCP p. 24)", "Obstetrics and neonatology for pregnant women"], "dischargeCriteria": ["Treatment plan agreed", "Contacts referred for testing and vaccination"], "followUpPlan": "ALT and APRI/FIB-4 every 6 months, HBV DNA yearly, renal tests on tenofovir every 3–6 months (NVHCP pp. 24, 47)."})
save("t44_chb.json", [T])
