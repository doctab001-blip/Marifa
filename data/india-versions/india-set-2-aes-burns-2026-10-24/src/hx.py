"""Helpers for India topic set 2 (AES to burns) (copied from batch 2 helpers) (DiseaseDetailSchema shape)."""
import json, os, uuid
TODAY = "2026-10-24"
VERSION = os.environ.get("MARIFA_VERSION", "india-set-2-2026-10-24-v1")
S = {
 "dka":   ("Standard Treatment Workflow: Diabetic Ketoacidosis (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1726567244_diabetic_ketoacidosis.pdf", "ICMR STW, July 2022"),
 "ada24": ("Hyperglycemic crises in adults: a look at the 2024 consensus report (ADA/EASD/JBDS/AACE/DTS), Cleveland Clinic Journal of Medicine", "https://www.ccjm.org/content/92/3/152.full.pdf", "Cleve Clin J Med 2025;92(3), summarising Umpierrez et al., Diabetes Care 2024"),
 "ispad": ("ISPAD Clinical Practice Consensus Guidelines 2022: Diabetic ketoacidosis and hyperglycemic hyperosmolar state", "https://renaissance.stonybrookmedicine.edu/system/files/Ch.11._ISPAD_Guidelines_DKA_HHS_Pediatric_Diabetes_2022-_.pdf", "Pediatric Diabetes 2022;23:835-856"),
 "epi":   ("Standard Treatment Workflow: Epilepsy (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1725952345_neurology_epilepsy.pdf", "ICMR STW, October 2019"),
 "lev":   ("Levetiracetam injection, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=e86dc508-4d22-493b-bdf1-408b6484d3f1&type=display", "DailyMed label"),
 "vpa":   ("Valproate sodium injection, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=8d5fc1c1-d3c0-497e-971b-6c4dba9a3fad&type=display", "DailyMed label, rev. 3/2026"),
 "copd":  ("Standard Treatment Workflow: Chronic Obstructive Pulmonary Disease (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1725952329_pulmonology_chronic_obstructive_pulmonary_disease.pdf", "ICMR STW, October 2019"),
 "ntg":   ("National Treatment Guidelines for Antimicrobial Use in Infectious Disease Syndromes (NCDC-ICMR)", "https://ncdc.mohfw.gov.in/uploads/pdf/amr17.pdf", "Version 2.0, November 2025"),
 "aki":   ("Standard Treatment Workflow: Acute Kidney Injury (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1784807239_acutekidneyinjury-updated.pdf", "ICMR STW, July 2026"),
 "hf":    ("Standard Treatment Workflow: Heart Failure — a breathless patient (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1768823345_cardiology_1-3.pdf", "ICMR STW, January 2026"),
 "arni":  ("Sacubitril and valsartan tablets, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=487102e3-f319-836b-e063-6394a90a4438", "DailyMed label"),
 "spiro": ("Spironolactone tablets, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8a66d90e-5450-4716-8c01-e7dc1967d00d", "DailyMed label"),
 "gdm":   ("Diagnosis & Management of Gestational Diabetes Mellitus: Technical and Operational Guidelines (MoHFW, Government of India)", "https://nhm.gov.in/New_Updates_2018/NHM_Components/RMNCH_MH_Guidelines/Gestational-Diabetes-Mellitus.pdf", "MoHFW national guidelines 2018"),
 "met":   ("Metformin hydrochloride tablets, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b8004451-7b26-425b-b5ea-cbb1b08e30e3", "DailyMed label"),
 "ugib":  ("Standard Treatment Workflow: Acute Gastrointestinal Bleed in Adults, Part A (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1726567564_gastrointestinal_bleed_part_a.pdf", "ICMR STW, July 2020"),
 "terli": ("Terlipressin for injection (TERLIVAZ), US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=3a35b86c-f451-4fac-8499-43019e4da354&type=display", "DailyMed label (indication: hepatorenal syndrome)"),
 "uti":   ("Standard Treatment Workflow: Urinary Tract Infections (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1784807340_uti.pdf", "ICMR STW, July 2026"),
 "ispn":  ("Management of urinary tract infections and vesicoureteric reflux: key updates from revised Indian Society of Pediatric Nephrology guidelines 2023", "https://indianjnephrol.org/management-of-urinary-tract-infections-and-vesicoureteric-reflux-key-updates-from-revised-indian-society-of-pediatric-nephrology-guidelines-2023/", "Indian J Nephrol 2024;34:442-7"),
 "nitro": ("Nitrofurantoin capsules (macrocrystals), US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=bc90b22e-e48a-4a22-b328-ca5bb2561864", "DailyMed label"),
 "genta": ("Gentamicin injection, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=8bdeef7f-ad8e-46e0-a872-e945eae51d68&type=display", "DailyMed label"),
 "psep":  ("Standard Treatment Workflow: Sepsis and Septic Shock in Children (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1725952338_paediatrics_sepsis_and_septic_shock_in_children.pdf", "ICMR STW, October 2019"),
 "anc":   ("Standard Treatment Workflow: Antenatal Management of Normal Pregnancy (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1771568619_ante-natalmanagementofnormalpregnancy-7.pdf", "ICMR STW, December 2025"),
}

S.update({
 "stroke": ("Standard Treatment Workflow: Stroke (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1725952342_neurology_stroke.pdf", "ICMR STW, October 2019"),
 "aha19":  ("2019 Update to the 2018 Guidelines for the Early Management of Acute Ischemic Stroke (AHA/ASA)", "https://www.ahajournals.org/doi/10.1161/STR.0000000000000211", "Stroke 2019;50:e344-e418"),
 "acc19":  ("Guidelines for the Early Management of Acute Ischemic Stroke: Key Points (ACC summary of AHA/ASA 2019)", "https://acc.org/Latest-in-Cardiology/ten-points-to-remember/2019/11/06/15/31/Guidelines-for-the-Early-Management-of-AIS", "ACC Ten Points to Remember, 2019"),
 "asthma": ("Standard Treatment Workflow: Asthma (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1725952329_pulmonology_asthma.pdf", "ICMR STW, October 2019"),
 "stemi":  ("Standard Treatment Workflow: ST Elevation Myocardial Infarction (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1768823342_cardiology_1-5.pdf", "ICMR STW, January 2026"),
 "nstemi": ("Standard Treatment Workflow: Unstable Angina / NSTEMI (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1768823342_cardiology_1-4.pdf", "ICMR STW, January 2026"),
 "enox":   ("Enoxaparin sodium injection (Lovenox), US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=afec67a9-ae16-4f48-bc0b-5331835e8aa2", "DailyMed label"),
 "dep":    ("Standard Treatment Workflow: Depression (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1725952332_psychiatry_depression.pdf", "ICMR STW, October 2019"),
 "ari":    ("Standard Treatment Workflow: Acute Respiratory Infection in Adults (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1725963734_pulmonology_acute_respiratory_infections.pdf", "ICMR STW, October 2019"),
 "thy":    ("Standard Treatment Workflow: Hypothyroidism (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1726567243_hypothyroidism.pdf", "ICMR STW, July 2022"),
 "na":     ("Standard Treatment Workflow: Approach to Hyponatremia (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1726567243_approach_to_hyponatremia.pdf", "ICMR STW, July 2022"),
 "tolv":   ("Tolvaptan tablets (Samsca), US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=5526617c-c7b9-4556-886d-729bbabbc566", "DailyMed label"),
 "nhypo":  ("Standard Treatment Workflow: Neonatal Hypoglycemia (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1726568620_neonatal_hypoglycemia.pdf", "ICMR STW, July 2020"),
 "chol18": ("2018 AHA/ACC Guideline on the Management of Blood Cholesterol", "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000625", "Circulation 2019;139:e1082-e1143"),
 "gina24": ("Global Strategy for Asthma Management and Prevention (GINA) 2024 Strategy Report", "https://ginasthma.org/wp-content/uploads/2024/05/GINA-2024-Strategy-Report-24_05_22_WMS.pdf", "GINA 2024"),
 "mlk":    ("Montelukast (Singulair), US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=482dcc92-b47f-4ea6-854a-f5ac2aea7842", "DailyMed label"),
 "theo":   ("Theophylline (anhydrous) extended-release tablets, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=04f1d1da-ce61-45b3-acf4-903cc81d16da", "DailyMed label"),
 "idsa19": ("Diagnosis and Treatment of Adults with Community-acquired Pneumonia (ATS/IDSA)", "https://pmc.ncbi.nlm.nih.gov/articles/PMC6812437/", "Am J Respir Crit Care Med 2019;200:e45-e67"),
 "osel":   ("Oseltamivir (Tamiflu), US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ee3c9555-60f2-4f82-a760-11983c86e97b", "DailyMed label"),
 "ata14":  ("Guidelines for the Treatment of Hypothyroidism (American Thyroid Association)", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4267409/", "Thyroid 2014;24:1670-1751"),
 "es16":   ("Diagnosis and Treatment of Primary Adrenal Insufficiency (Endocrine Society)", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4880116/", "J Clin Endocrinol Metab 2016;101:364-389"),
 "sfe":    ("Emergency management of severe and moderately severely symptomatic hyponatraemia in adult patients (Society for Endocrinology)", "https://www.endocrinology.org/media/xhrhxhxm/emergency-management-of-severe-and-moderately-severely-symptomatic-hyponatraemia-in-adult-patients-2022.pdf", "Society for Endocrinology Endocrine Emergency Guidance, 2022"),
 "nzhypo": ("Oranga Hukihuki: neonatal hypoglycaemia clinical practice guidelines (Liggins Institute, University of Auckland)", "https://www.auckland.ac.nz/en/liggins/our-research/reports-and-guidelines-1/neonatal-hypoglycaemia-guidelines/treatment/question-26.html", "Liggins Institute guideline, Treatment"),
 "hf22":   ("2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure", "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001063", "Circulation 2022;145:e895-e1032"),
 "nste14": ("2014 AHA/ACC Guideline for the Management of Patients With Non-ST-Elevation Acute Coronary Syndromes", "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000134", "Circulation 2014;130:e344-e426"),
 "tnk":    ("Tenecteplase (TNKase), US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=739a3c53-caf6-40d6-a6af-84ce733a948b", "DailyMed label"),
 "szc":    ("Sodium zirconium cyclosilicate (Lokelma), US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=90bf8e28-748d-4e4b-a19f-9cf483370eff", "DailyMed label"),
 "pbinj":  ("Phenobarbital sodium injection, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ffcaa218-ed6a-4557-9645-b9a91128a214", "DailyMed label"),
 "fosfo":  ("Fosfomycin tromethamine granules, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=48e352bc-52ea-4778-905a-60ef38a5c18a", "DailyMed label"),
 "nice111":("Pyelonephritis (acute): antimicrobial prescribing (NICE NG111)", "https://www.nice.org.uk/guidance/ng111/chapter/Recommendations", "NICE guideline NG111, 2018"),
 "nice109":("Urinary tract infection (lower): antimicrobial prescribing (NICE NG109)", "https://www.nice.org.uk/guidance/ng109/chapter/Recommendations", "NICE guideline NG109, 2018"),
 "esge15": ("Diagnosis and management of nonvariceal upper gastrointestinal hemorrhage: ESGE Guideline", "https://doi.org/10.1055/s-0034-1393172", "Endoscopy 2015;47:a1-a46"),
 "pals25": ("PALS 2025 Reference Card: Pediatric Septic Shock (American Red Cross)", "https://guidelines.redcross.org/wp-content/uploads/2025/12/PALS-Pediatric-Septic-Shock.pdf", "American Red Cross PALS, 2025"),
 "alt":    ("Alteplase (Activase), US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=c669f77c-fa48-478b-a14b-80b20a0139c2", "DailyMed label"),
 "ksn22":  ("Korean Society of Nephrology 2022 Recommendations on Controversial Issues in Diagnosis and Management of Hyponatremia", "https://enbpr.org/DOIx.php?id=10.5049%2FEBP.2022.20.1.21", "Electrolyte Blood Press 2022;20(1):21-38"),
 "cnsd19": ("Pharmacotherapy for Pediatric Convulsive Status Epilepticus (review)", "https://pmc.ncbi.nlm.nih.gov/articles/PMC6982635/", "CNS Drugs 2019"),
 "sps":    ("Sodium polystyrene sulfonate powder for suspension, US prescribing information (DailyMed)", "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=fd9b192f-51f3-4737-be14-1970327f39aa", "DailyMed label"),
 "cpsr":   ("Calcium Resonium (calcium polystyrene sulfonate), Summary of Product Characteristics (UK eMC)", "https://www.medicines.org.uk/emc/product/1439/smpc", "UK SmPC"),
 "whoanc": ("WHO recommendations on antenatal care for a positive pregnancy experience: daily iron and folic acid supplementation", "https://www.who.int/tools/elena/interventions/daily-iron-pregnancy", "WHO eLENA, 2016 recommendation"),
})

# Sources opened 24 Oct 2026 for this set
S.update({
 "htn":    ("Standard Treatment Workflow: Hypertension in Adults (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1778941063_hypertensioninadults_final.pdf", "ICMR STW, May 2026"),
 "wao20":  ("World Allergy Organization Anaphylaxis Guidance 2020", "https://www.worldallergyorganizationjournal.org/article/S1939-4551(20)30375-6/fulltext", "World Allergy Organ J 2020;13:100472"),
 "rcuk21": ("Emergency treatment of anaphylaxis: guidelines for healthcare providers (Resuscitation Council UK)", "https://www.cem.scot.nhs.uk/adult/anphyl.pdf", "Resuscitation Council UK, May 2021"),
 "rcukalg":("Anaphylaxis algorithm (Resuscitation Council UK)", "https://resus.org.uk/media/333/download", "Resuscitation Council UK, 2021"),
 "pcm":    ("Updated guidelines for the management of paracetamol poisoning in Australia and New Zealand", "https://www.mja.com.au/journal/2020/212/4/updated-guidelines-management-paracetamol-poisoning-australia-and-new-zealand", "Med J Aust 2020;212(4):175-183"),
 "alf":    ("Standard Treatment Workflow: Acute Liver Failure or Acute on Chronic Liver Failure (ICMR / Department of Health Research)", "https://icmr.gov.in/icmrobject/uploads/STWs/1726567562_liver_failure.pdf", "ICMR STW, July 2020"),
 "ndp13":  ("National Drug Policy on Malaria (NVBDCP / NCVBDC, MoHFW)", "https://ncvbdc.mohfw.gov.in/WriteReadData/l892s/National-Drug-Policy-2013.pdf", "NVBDCP, 2013"),
 "whosev": ("Severe malaria criteria adapted from WHO Guidelines for malaria 2021 (McMaster Textbook of Internal Medicine table)", "https://empendium.com/mcmtextbook/table/031_7695", "McMaster Textbook, WHO 2021 criteria"),
 "msfart": ("Artesunate injectable (MSF Essential drugs, medical guidelines)", "https://medicalguidelines.msf.org/viewport/EssDr/english/artesunate-injectable-16682465.html", "MSF, updated June 2025"),
 "whoras": ("Rectal artesunate for pre-referral treatment of severe malaria: information note (WHO)", "https://severemalaria.org/sites/mmv-smo/files/content/attachments/2024-08-02/Information%20note%20WHO%20RAS.pdf", "WHO/HTM/GMP/2017.19, October 2017"),
 "acgap":  ("American College of Gastroenterology Guidelines: Management of Acute Pancreatitis", "https://www.darmzentrum-bern.ch/fileadmin/darmzentrum/Education/Bible_Class/2024/Acute_Pancreatitis/ACG.pdf", "Am J Gastroenterol 2024;119:419-437"),
 "gsd":    ("Standard Treatment Workflow: Gall Stone Disease (ICMR / Department of Health Research)", "https://icmr.gov.in/icmrobject/uploads/STWs/1726567742_gall_stone_disease.pdf", "ICMR STW, July 2022"),
 "gsurg":  ("Standard Treatment Workflows, General Surgery: Appendicitis, CBD stone, Diabetic foot, Gall stone disease, Ventral hernia (ICMR / Department of Health Research)", "https://icmr.gov.in/icmrobject/uploads/STWs/1726567742_general_surgery_all.pdf", "ICMR STW Vol III, July 2022"),
 "aasld14":("Hepatic Encephalopathy in Chronic Liver Disease: 2014 Practice Guideline by AASLD and EASL", "https://www.aasld.org/sites/default/files/2022-07/Hepatic%20Encephalopathy%20in%20Chronic%20Liver%20Disease%202014.pdf", "Hepatology 2014;60:715-735"),
 "ctrx":   ("Ceftriaxone for injection, US prescribing information (Pfizer)", "https://labeling.pfizer.com/ShowLabeling.aspx?id=4387", "Prescribing information"),
 "ukka":   ("Clinical Practice Guideline: Management of Hyperkalaemia in Adults (UK Kidney Association)", "https://www.ukkidney.org/sites/default/files/documents/FINAL%20VERSION%20-%20UKKA%20CLINICAL%20PRACTICE%20GUIDELINE%20-%20MANAGEMENT%20OF%20HYPERKALAEMIA%20IN%20ADULTS%20-%20UPDATED%20JULY%202026_0.pdf", "UKKA, updated July 2026"),
 "bsi":    ("Standard Treatment Workflow: Bacterial Skin Infections (ICMR / Department of Health Research)", "https://icmr.gov.in/icmrobject/uploads/STWs/1725967368_bacterial_skin_infections.pdf", "ICMR STW, July 2022"),
 "scab":   ("Standard Treatment Workflow: Scabies (ICMR / Department of Health Research)", "https://icmr.gov.in/icmrobject/uploads/STWs/1725967365_scabies.pdf", "ICMR STW, July 2022"),
 "derm":   ("Standard Treatment Workflow: Dermatophytoses (ICMR / Department of Health Research)", "https://icmr.gov.in/icmrobject/uploads/STWs/1725967367_dermatophytoses.pdf", "ICMR STW, July 2022"),
 "bsg20":  ("Guidelines on the management of ascites in cirrhosis (BSG/BASL)", "https://www.basl.org.uk/uploads/Portal%20Hypertension%20SIG/gutjnl-2020-321790.full_.pdf", "Gut 2020 (Aithal et al.)"),
 "nice158":("Venous thromboembolic diseases: diagnosis, management and thrombophilia testing (NICE NG158)", "https://www.nice.org.uk/guidance/NG158/chapter/Recommendations", "NICE NG158, 2020 (updated 2023)"),
 "esc19pe":("2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism: key points (ACC summary)", "https://www.acc.org/Latest-in-Cardiology/Articles/2020/07/10/08/44/2019-ESC-Guidelines-for-the-Diagnosis-and-Management-of-Acute-PE", "ACC summary of Konstantinides et al., Eur Respir J 2019;54:1901647"),
 "apix":   ("Apixaban (Eliquis) tablets, US prescribing information (FDA)", "https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/202155Orig1s039%2Cs040lbl.pdf", "FDA label, 2025"),
 "dabi":   ("Dabigatran etexilate (Pradaxa) capsules, US prescribing information (FDA)", "https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/022512s049lbl.pdf", "FDA label, 2025"),
 "flu19":  ("Clinical Management Protocol for Seasonal Influenza (MoHFW / NCDC)", "https://ncdc.mohfw.gov.in/wp-content/uploads/2024/02/66872871241561442115.pdf", "Revised 25 February 2019"),
 "msfors": ("WHO rehydration plans in patients with diarrhoea (MSF Medical Guidelines, Appendix 14, adapted from WHO Pocket book of hospital care for children 2013)", "https://medicalguidelines.msf.org/en/viewport/mme/english/appendix-14-plan-rehydration-who-32408338.html", "MSF 2026, Table 14.1"),
 "nrd":    ("Standard Treatment Workflow: Respiratory Distress in Neonates (ICMR / Department of Health Research)", "https://icmr.gov.in/icmrobject/uploads/STWs/1726568619_respiratory_distress.pdf", "ICMR STW, July 2020"),
 "curo":   ("Poractant alfa (Curosurf) intratracheal suspension, US prescribing information (FDA)", "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/020744s040lbl.pdf", "FDA label, 2019"),
})
S.update({
 "aes":    ("Standard Treatment Workflow: Acute Encephalitis Syndrome in Children (ICMR / Department of Health Research)", "https://icmr.gov.in/icmrobject/uploads/STWs/1725959608_paediatrics_acute_encephalitis_syndrome.pdf", "ICMR STW, October 2019"),
 "deng":   ("Standard Treatment Workflow: Dengue Fever (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1725952338_paediatrics_dengue_fever.pdf", "ICMR STW, October 2019"),
 "fevc":   ("Standard Treatment Workflow: Fever in Children (ICMR / Department of Health Research)", "https://icmr.gov.in/icmrobject/uploads/STWs/1725952338_paediatrics_fever_in_children.pdf", "ICMR STW, October 2019"),
 "iapse":  ("Evaluation and Management of Status Epilepticus in Children (IAP Standard Treatment Guidelines)", "https://iapindia.org/pdf/Ch-040-evaluation-and-management-of-status-epilepticus-in-children.pdf", "IAP STG 2022"),
 "sign158":("Initial treatment of acute asthma in children (BTS/SIGN 158, Right Decision Service, Healthcare Improvement Scotland)", "https://rightdecisions.scot.nhs.uk/asthma-pathway-bts-nice-sign-sign-244/managing-acute-asthma/management-of-acute-asthma-in-children/initial-treatment-of-acute-asthma-in-children", "BTS/SIGN 158, 2019"),
 "bgh":    ("Paediatric asthma management, Borders General Hospital (referenced to SIGN 158)", "https://rightdecisions.scot.nhs.uk/media/lp3nxk5x/bgh-paediatric-asthma-management-2020-sign-158-referenced-v2.pdf", "NHS Borders, January 2020"),
 "dr":     ("Standard Treatment Workflow: Diabetic Retinopathy (ICMR / Department of Health Research)", "https://icmr.gov.in/icmrobject/uploads/STWs/1726569102_diabetic_retinopathy.pdf", "ICMR STW, July 2020"),
 "kdigo22":("KDIGO 2022 Clinical Practice Guideline for Diabetes Management in Chronic Kidney Disease", "https://kdigo.org/wp-content/uploads/2023/12/KDIGO-2022-Diabetes-Guideline.pdf", "Kidney Int 2022;102(5S):S1-S127"),
 "dapa":   ("Dapagliflozin tablets, US prescribing information", "https://www.drugs.com/pro/dapagliflozin.html", "Prescribing information"),
 "t2dm":   ("Standard Treatment Workflow: Diabetes Mellitus Type 2 (ICMR / Department of Health Research)", "https://icmr.gov.in/icmrobject/uploads/STWs/1726567245_diabetes_mellitus_type_2.pdf", "ICMR STW, July 2022"),
 "cardv":  ("Standard Treatment Workflows of India, Cardiology (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1768823344_cardiology-1.pdf", "ICMR STW Cardiology, January 2026"),
 "rcog63": ("Antepartum Haemorrhage, Green-top Guideline No. 63 (RCOG)", "https://www.rcog.org.uk/media/pwdi1tef/gtg_63.pdf", "RCOG, 2011"),
 "whoacs": ("WHO recommendations on antenatal corticosteroids for improving preterm birth outcomes", "https://docs.bvsalud.org/biblioref/2022/10/1398125/9789240057296-eng.pdf", "WHO, 2022"),
 "rcukals":("Adult advanced life support algorithm (Resuscitation Council UK)", "https://www.resus.org.uk/sites/default/files/2025-10/Adult%20ALS%20algorithm%202025.pdf", "Resuscitation Council UK, 2025"),
 "erc21":  ("ERC Guidelines 2021: Adult Advanced Life Support (summary of Soar et al., Resuscitation 2021;161:115-151)", "https://esanum.com/today/posts/erc-guidelines-2021-adult-advanced-life-support", "esanum summary, 2021"),
 "aha20":  ("2020 AHA Guidelines for CPR and ECC: Adult Basic and Advanced Life Support", "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000916", "Circulation 2020;142(16 Suppl 2):S366-S468"),
 "nib":    ("Good Blood Transfusion Practices Guidance (National Institute of Biologicals / Haemovigilance Programme of India)", "https://www.nib.gov.in/media/Good Blood Transfusion Practices Guidance.pdf", "NIB, MoHFW"),
 "neoseiz":("Standard Treatment Workflow: Neonatal Seizures (ICMR / Department of Health Research)", "https://icmr.gov.in/icmrobject/uploads/STWs/1726568620_neonatal_seizures.pdf", "ICMR STW, July 2020"),
 "psy":    ("Standard Treatment Workflow: Psychosis (ICMR / Department of Health Research)", "https://icmr.gov.in/icmrobject/uploads/STWs/1725952331_psychiatry_psychosis.pdf", "ICMR STW, October 2019"),
 "anx":    ("Standard Treatment Workflow: Anxiety Disorders (ICMR / Department of Health Research)", "https://icmr.gov.in/icmrobject/uploads/STWs/1725952333_psychiatry_anxiety_disorder.pdf", "ICMR STW, October 2019"),
 "burnsf": ("Fluid resuscitation in adult burns (COBIS guideline, Scotland)", "https://www.cem.scot.nhs.uk/adult/fluidresusburn.pdf", "COBIS, reviewed May 2016"),
 "thermal":("Standard Treatment Workflow: Thermal Care of Newborn (ICMR / Department of Health Research)", "https://www.icmr.gov.in/icmrobject/uploads/STWs/1726568617_thermal_care_newborn.pdf", "ICMR STW, July 2020"),
 "vitk":   ("Vitamin K prophylaxis at birth: Government of India (NHM) standard treatment guidelines (Medical Dialogues report)", "https://speciality.medicaldialogues.in/amp/vitamin-k-deficiency-hemorrhagic-disease-government-of-india-guidelines", "NHM guideline, reported July 2017"),
 "ips17":  ("Clinical Practice Guidelines for Management of Schizophrenia (Indian Psychiatric Society; Grover et al., Indian J Psychiatry 2017;59 Suppl 1:S19-33)", "https://indianpsychiatricsociety.org/wp-content/uploads/2022/05/Grover_2017_Clinical_Practice_Guidelines_for.pdf", "IPS CPG, January 2017"),
 "bbets":  ("Rapid tranquilisation in acute psychotic agitation (BestBETs; includes the TREC-India trial, Raveendran 2009)", "https://www.bestbets.org/?p=5424", "BestBETs, updated January 2011"),
 "cloz":   ("Clozapine tablets, US prescribing information (Drugs.com copy of FDA label)", "https://drugs.com/pro/clozapine.html", "Label revised July 2025"),
 "morph":  ("Morphine sulfate injection, US prescribing information: dosage and administration (Pfizer)", "https://www.pfizermedical.com/morphine/dosage-admin", "Current label"),
 "dghsb":  ("Standard Treatment Guidelines for Management of Burns (Trauma and Burn Division, DGHS, MoHFW)", "https://www.dghs.mohfw.gov.in/uploads/assets/S1Ipab4025VceQpFs7Qa6THwh07NLmggStsg1cDD.pdf", "DGHS STG, 2025"),
 "nzburn": ("Initial Assessment and Management of Burn Injuries (National Burn Service, New Zealand)", "https://nationalburnservice.co.nz/assets/Documents/NBC-Initial-assessment-and-management-of-burn-injuries-Guideline-v2.pdf", "Revision 6.0, reviewed September 2023"),
 "glosan": ("Analgesia for Children (Gloucestershire Hospitals NHS FT Emergency Department)", "https://www.gloshospitals.nhs.uk/media/documents/Analgesia_for_Children_updated_May_2020.pdf", "Emergency department guideline, January 2020"),
})
ADULT = "Adult topic; paediatric use is outside the scope of the cited sources."
NOT_ABX = "Not an antibiotic; penicillin allergy does not change this medicine."
NS = "Not specified in the cited sources."

def ref(k, loc):
    t, u, e = S[k]
    return {"title": t, "edition": f"{e}, {loc}", "url": u}

def tref(k, loc):
    t, u, e = S[k]
    return {"title": t, "edition": e, "url": u, "locator": loc}

def inv(tier, test, modality, target, normal, finding, rationale, k, loc, extra=None):
    d = {"tier": tier, "testName": test, "modalityTarget": modality, "targetCondition": target, "normalValue": normal,
         "expectedFinding": finding, "clinicalRationale": rationale, "references": [ref(k, loc)]}
    if extra:
        d["references"].append(ref(*extra))
    return d

def rx(branch, step, ind, group, name, dose, route, freq, dur, paed, pen, ckd, cld, mon, contra, k, loc,
       sel="all", pref=None, use=None, extra_adj=()):
    t, u, e = S[k]
    d = {"indication": ind, "patientGroup": group, "genericName": name, "dose": dose, "route": route, "frequency": freq,
         "duration": dur,
         "adjustments": [f"Paediatric: {paed}", f"Penicillin allergy: {pen}", f"CKD: {ckd}", f"CLD: {cld}", *extra_adj],
         "monitoring": mon, "contraindications": contra, "branch": branch, "step": step, "selection": sel,
         "sourceTitle": t, "sourceUrl": u, "sourceEdition": f"{e}, {loc}"}
    if pref is not None:
        d["preferred"] = pref
    if use:
        d["useWhen"] = use
    return d

def step(id, title, tf, actions, branches=None):
    d = {"id": id, "title": title, "timeframe": tf, "actions": actions}
    if branches:
        d["branches"] = [{"condition": c, "actions": a} for c, a in branches]
    return d

def new_id(title):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, "marifa-india/" + title))

def topic(**kw):
    t = {"id": kw["id"], "title": kw["title"], "specialty": kw["specialty"], "authority": kw.get("authority", "ICMR"),
         "status": "under_review", "version": VERSION, "lastReviewed": TODAY, "pillar": kw["pillar"],
         "clinicalReviewStatus": "pending",
         "evidenceAudit": {"checkedOn": TODAY, "status": "incomplete", "scope": kw["scope"], "findings": kw["findings"],
                           "unverifiedSections": kw["unverified"] + ["Drug cautions, contraindications and renal or hepatic adjustment lines without a source tag are general pharmacology statements and need formulary confirmation."], "medscapeStatus": "unavailable",
                           "originalVersionIds": [kw["id"]]},
         "pathophysiology": {"summary": kw["summary"], "keyMechanisms": kw["mechanisms"]},
         "presentation": kw["presentation"],
         "differentials": [{"condition": c, "distinguishingFeatures": f} for c, f in kw["differentials"]],
         "diagnosticCriteria": [{"criterion": c, "threshold": th} for c, th in kw["criteria"]],
         "investigations": {"ruleIn": kw["ruleIn"], "ruleOut": kw["ruleOut"]},
         "clinicalManagement": kw["management"],
         "medicationPlan": {"status": "source-verified",
                            "branches": [{"label": l, "entryCriteria": e} for l, e in kw["branches"]],
                            "regimens": kw["regimens"], "note": kw["medNote"]},
         "teaching": kw["teaching"], "nonClinicalManagement": kw["nonClinical"]}
    if kw.get("comparison"):
        t["guidelineComparison"] = kw["comparison"]
    return t

def save(name, items):
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), name)
    json.dump(items, open(p, "w"), indent=1, ensure_ascii=False)
    print("saved", p, len(items))
