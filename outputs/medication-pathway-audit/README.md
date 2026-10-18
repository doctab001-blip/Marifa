# Medicine-pathway audit

Captured: 2026-10-18T15:36:22.497Z (database, read-only)

A medicine plan passes when every drug sits in a branch (STEMI, NSTEMI, ...), alternatives are marked one-of with exactly one preferred option, and no two drugs of one exclusive class are given together (`lib/medication-pathway.ts`).

- Versions audited: 272
- With a multi-drug or single-drug medicine plan: 167
- Compliant pathway: 0
- Flat drug list (needs restructuring): 147
- Partly branched (needs fixes): 0
- Priority — critical (two drugs of one strict class listed together): 20; high (5+ drugs): 52; medium: 75

## Restructuring queue

| Priority | Topic | Version | Status | Drugs | Main findings |
|---|---|---|---|---|---|
| critical | Acute Chest Pain | acute-chest-pain-blueprint-revision-2026-10-15-v1 | approved (current) | 9 | ticagrelor, clopidogrel are all P2Y12 inhibitors; heparin, enoxaparin, fondaparinux are all parenteral anticoagulants; alternatives written inline or not marked; not branched |
| critical | Acute Coronary Syndrome | emergency-2026-10-12-v3-live-approved | approved (current) | 7 | ticagrelor, clopidogrel, prasugrel are all P2Y12 inhibitors; alternatives written inline or not marked; not branched |
| critical | Acute Coronary Syndrome Assessment and Escalation Pathway | user-pasted-replacement-2026-10-16-v1-live | approved (current) | 7 | ticagrelor, prasugrel, clopidogrel are all P2Y12 inhibitors; alternatives written inline or not marked; not branched |
| critical | Acute Ischemic Stroke | user-pasted-replacement-2026-10-16-v1-live | approved (current) | 3 | alteplase, tenecteplase are all thrombolytics; not branched |
| critical | Acute Pulmonary Embolism | authoring-standard-2026-10-12-v1-live | published (current) | 6 | apixaban, rivaroxaban are all oral anticoagulants; heparin, enoxaparin are all parenteral anticoagulants; alternatives written inline or not marked; not branched |
| critical | Atrial Fibrillation [Adapted from NICE] | authoring-standard-2026-10-12-v1-live | published (current) | 3 | apixaban, rivaroxaban, dabigatran are all oral anticoagulants; not branched |
| critical | Chronic Kidney Disease | emergency-2026-10-12-v1-live | published (current) | 5 | ramipril, losartan are all renin–angiotensin blockers; alternatives written inline or not marked; not branched |
| critical | Deep-Vein Thrombosis and Pulmonary Embolism | emergency-2026-10-12-v1-live | published (current) | 6 | apixaban, warfarin are all oral anticoagulants; enoxaparin, heparin, fondaparinux are all parenteral anticoagulants; not branched |
| critical | Diabetic Kidney Disease: ACR Screening and Management | authoring-standard-2026-10-14-v2-investigations-live | published (current) | 4 | ramipril, losartan are all renin–angiotensin blockers; alternatives written inline or not marked; not branched |
| critical | Dyslipidaemia and Atherosclerotic Risk | emergency-2026-10-12-v1-live | published (current) | 5 | atorvastatin, rosuvastatin are all statins; alternatives written inline or not marked; not branched |
| critical | Dyslipidaemia: Statin Initiation and Lipid Targets | authoring-standard-2026-10-14-v2-investigations-live | published (current) | 4 | atorvastatin, rosuvastatin are all statins; alternatives written inline or not marked; not branched |
| critical | Heart Failure | emergency-2026-10-12-v1-live | published (current) | 12 | enalapril, valsartan, candesartan are all renin–angiotensin blockers; alternatives written inline or not marked; not branched |
| critical | Hypertension in Adults [Adapted from NICE] | authoring-standard-2026-10-12-v1-live | published (current) | 5 | ramipril, losartan are all renin–angiotensin blockers; not branched |
| critical | Hypertension: Primary Care Titration and Target Review | authoring-standard-2026-10-15-v2-investigations-live | published (current) | 5 | ramipril, losartan are all renin–angiotensin blockers; not branched |
| critical | Non-ST-Elevation Myocardial Infarction | authoring-standard-2026-10-12-v1-live | published (current) | 7 | ticagrelor, clopidogrel, prasugrel are all P2Y12 inhibitors; fondaparinux, enoxaparin, heparin are all parenteral anticoagulants; not branched |
| critical | Post-Myocardial Infarction Community Secondary Prevention and Cardiac Rehabilitation | authoring-standard-2026-10-18-tier1-first5-review-v1-live | published (current) | 6 | ticagrelor, clopidogrel are all P2Y12 inhibitors; not branched |
| critical | Resistant Hypertension and Secondary Causes: Referral Triggers | authoring-standard-2026-10-14-v2-investigations-live | published (current) | 5 | ramipril, losartan are all renin–angiotensin blockers; not branched |
| critical | ST-Elevation Myocardial Infarction | authoring-standard-2026-10-13-v1-live | published (current) | 7 | ticagrelor, clopidogrel, prasugrel are all P2Y12 inhibitors; alternatives written inline or not marked; not branched |
| critical | Unstable Angina | authoring-standard-2026-10-13-v1-live | published (current) | 7 | ticagrelor, clopidogrel, prasugrel are all P2Y12 inhibitors; fondaparinux, enoxaparin, heparin are all parenteral anticoagulants; not branched |
| critical | Venous Thromboembolism in Pregnancy and Postpartum | emergency-2026-10-12-v1-live | published (current) | 5 | enoxaparin, heparin, fondaparinux are all parenteral anticoagulants; alternatives written inline or not marked; not branched |
| high | Acute Anaphylaxis | emergency-2026-10-12-v1-live-approved | approved (current) | 6 | alternatives written inline or not marked; not branched |
| high | Acute Asthma Exacerbation in Children: Inhaler Technique and Oral Steroid Discharge Plan | paediatric-asthma-discharge-plan-sina-2024-20261018-v4-live | published (current) | 5 | alternatives written inline or not marked; not branched |
| high | Acute Cholecystitis: Admission and Surgical Pathway | acute-cholecystitis-wses2020-moh-20261018-v1-live | published (current) | 10 | not branched |
| high | Acute Exacerbation of COPD | user-pasted-replacement-2026-10-16-v1-live-approved | approved (current) | 6 | alternatives written inline or not marked; not branched |
| high | Acute Otitis Media: Antibiotic Prescribing Criteria | authoring-standard-2026-10-18-tier3b-v1 | under_review (current) | 7 | not branched |
| high | Acute Otitis Media: Antibiotic Prescribing Criteria | authoring-standard-2026-10-18-tier3b-v1-live | under_review | 7 | not branched |
| high | Acute Poisoning and Overdose | emergency-2026-10-12-v1-live | published (current) | 6 | not branched |
| high | Acute Red Eye: Conjunctivitis versus Angle-Closure Glaucoma and Uveitis | authoring-standard-2026-10-18-next5-saudi-review-v1-live | published (current) | 8 | not branched |
| high | Acute Severe Asthma Exacerbation | emergency-2026-10-12-v1-live | published (current) | 5 | not branched |
| high | Acute Severe Asthma Exacerbation (Adult) | emergency-2026-10-12-v1-live | published (current) | 5 | not branched |
| high | Adult Vaccination Review | authoring-standard-2026-10-12-v1-live | published (current) | 6 | not branched |
| high | Alcohol Misuse: AUDIT Screening and Brief Intervention | authoring-standard-2026-10-18-tier3b-v1 | under_review (current) | 5 | not branched |
| high | Alcohol Misuse: AUDIT Screening and Brief Intervention | authoring-standard-2026-10-18-tier3b-v1-live | under_review | 5 | not branched |
| high | Anti-D Prophylaxis: Routine and Sensitising-Event Administration | authoring-standard-2026-10-18-tier4a-v1 | under_review (current) | 5 | not branched |
| high | Anti-D Prophylaxis: Routine and Sensitising-Event Administration | authoring-standard-2026-10-18-tier4a-v1-live | under_review | 5 | not branched |
| high | Asthma | emergency-2026-10-12-v1-live-approved | approved (current) | 5 | alternatives written inline or not marked; not branched |
| high | Asthma | emergency-2026-10-12-v1-live-approved-draft-1792312482562 | draft | 5 | alternatives written inline or not marked; not branched |
| high | Atopic Dermatitis | authoring-standard-2026-10-12-v1-live | published (current) | 6 | alternatives written inline or not marked; not branched |
| high | Cancer Pain Assessment and Support | authoring-standard-2026-10-12-v1-live | published (current) | 9 | alternatives written inline or not marked; not branched |
| high | Cellulitis and Erysipelas: Outpatient versus Intravenous Antibiotic Criteria | authoring-standard-2026-10-18-saudi2-v1-live | published (current) | 13 | alternatives written inline or not marked; not branched |
| high | Chronic Obstructive Pulmonary Disease | emergency-2026-10-12-v1-live | published (current) | 7 | alternatives written inline or not marked; not branched |
| high | Community-Acquired Pneumonia | authoring-standard-2026-10-15-v2-investigations-live | published (current) | 5 | not branched |
| high | Dementia After Diagnosis: Cognitive Support and Care Planning | authoring-standard-2026-10-18-saudi4-v1-live | published (current) | 15 | not branched |
| high | Depression and Anxiety Screening in Primary Care | authoring-standard-2026-10-18-saudi3-v1-live | published (current) | 15 | alternatives written inline or not marked; not branched |
| high | Diabetic Ketoacidosis | emergency-2026-10-12-v1-live | published (current) | 5 | not branched |
| high | Elective Hip and Knee Arthroplasty Preparation | authoring-standard-2026-10-12-v1-live | published (current) | 6 | alternatives written inline or not marked; not branched |
| high | Gout and Hyperuricaemia: Flare Management | authoring-standard-2026-10-18-tier4a-v1 | under_review (current) | 5 | not branched |
| high | Gout and Hyperuricaemia: Flare Management | authoring-standard-2026-10-18-tier4a-v1-live | under_review | 5 | not branched |
| high | Headache: Red Flags and Primary Headache Diagnosis | authoring-standard-2026-10-18-saudi1-v1-live | published (current) | 26 | alternatives written inline or not marked; not branched |
| high | Hyperemesis Gravidarum: Assessment and Management | authoring-standard-2026-10-18-tier4a-v1 | under_review (current) | 8 | not branched |
| high | Hyperemesis Gravidarum: Assessment and Management | authoring-standard-2026-10-18-tier4a-v1-live | under_review | 8 | not branched |
| high | Hypertensive Disorders of Pregnancy | emergency-2026-10-12-v1-live | published (current) | 7 | alternatives written inline or not marked; not branched |
| high | Ischaemic Heart Disease | emergency-2026-10-12-v1-live | published (current) | 8 | alternatives written inline or not marked; not branched |
| high | Maternal Sepsis in Pregnancy or Postpartum | emergency-2026-10-12-v1-live | published (current) | 7 | alternatives written inline or not marked; not branched |
| high | Migraine: Acute Treatment and Prophylaxis Ladder | authoring-standard-2026-10-18-tier4a-v1 | under_review (current) | 9 | alternatives written inline or not marked; not branched |
| high | Migraine: Acute Treatment and Prophylaxis Ladder | authoring-standard-2026-10-18-tier4a-v1-live | under_review | 9 | alternatives written inline or not marked; not branched |
| high | Motor Neurone Disease: End-of-Life Anticipatory Prescribing | authoring-standard-2026-10-18-tier3a-v1-live | published (current) | 5 | not branched |
| high | Nausea and Vomiting in Advanced Illness | authoring-standard-2026-10-12-v1-live | published (current) | 5 | not branched |
| high | Obesity in Adults: Pharmacotherapy and Bariatric Referral Criteria | authoring-standard-2026-10-18-saudi6-v1-live | published (current) | 6 | not branched |
| high | Postpartum Haemorrhage Response | emergency-2026-10-12-v1-live | published (current) | 7 | not branched |
| high | Prelabour Rupture of Membranes | emergency-2026-10-12-v1-live | published (current) | 5 | not branched |
| high | Preterm Labour and Threatened Preterm Birth | emergency-2026-10-12-v1-live | published (current) | 6 | not branched |
| high | Stable Angina | authoring-standard-2026-10-13-v1-live | published (current) | 8 | alternatives written inline or not marked; not branched |
| high | Stable Chest Pain | authoring-standard-2026-10-13-v1-live | published (current) | 8 | alternatives written inline or not marked; not branched |
| high | Status Epilepticus and Acute Seizures: ED Stabilisation | authoring-standard-2026-10-18-status-epilepsy-saudi-fix-v1-live | published (current) | 9 | alternatives written inline or not marked; not branched |
| high | Suspected Meningitis and Encephalitis: ED Investigation and Treatment Pathway | authoring-standard-2026-10-18-tier3b-v1 | under_review (current) | 7 | not branched |
| high | Suspected Meningitis and Encephalitis: ED Investigation and Treatment Pathway | authoring-standard-2026-10-18-tier3b-v1-live | under_review | 7 | not branched |
| high | Type 1 Diabetes in Adults: Newly Diagnosed Pathway | authoring-standard-2026-10-18-saudi8-v1-live | published (current) | 10 | alternatives written inline or not marked; not branched |
| high | Type 2 Diabetes Mellitus Longitudinal Care | emergency-2026-10-12-v1-live | published (current) | 7 | alternatives written inline or not marked; not branched |
| high | Type 2 Diabetes Mellitus Longitudinal Care Pathway | authoring-standard-2026-10-12-v1-live | published (current) | 7 | alternatives written inline or not marked; not branched |
| high | Type 2 Diabetes: New Diagnosis and Initial Treatment | authoring-standard-2026-10-14-v2-investigations-live | published (current) | 5 | not branched |
| high | Type 2 Diabetes: Treatment Intensification and Add-On Therapy | authoring-standard-2026-10-14-v2-investigations-live | published (current) | 5 | not branched |
| medium | Acne Vulgaris | authoring-standard-2026-10-12-v1-live-approved | approved (current) | 4 | alternatives written inline or not marked; not branched |
| medium | Acute Appendicitis | emergency-2026-10-12-v1-live-approved | approved (current) | 3 | not branched |
| medium | Acute Asthma Exacerbation in Children: ED Pathway | user-pasted-revision-2026-10-16-v2-pram-appendix-live-approved | approved (current) | 4 | not branched |
| medium | Acute Heart Failure Exacerbation in the Community: Diuretic Titration and Admission Triggers | authoring-standard-2026-10-14-v2-investigations-live | approved (current) | 2 | not branched |
| medium | Acute Kidney Injury | emergency-2026-10-12-v2-live | approved (current) | 4 | not branched |
| medium | Acute Kidney Injury | emergency-2026-10-12-v2-live-draft-1792312508261 | draft | 4 | not branched |
| medium | Acute Soft Tissue Injuries and Sprains: Ottawa Rules and Referral Thresholds | authoring-standard-2026-10-18-tier3b-v1 | under_review (current) | 3 | alternatives written inline or not marked; not branched |
| medium | Acute Soft Tissue Injuries and Sprains: Ottawa Rules and Referral Thresholds | authoring-standard-2026-10-18-tier3b-v1-live | under_review | 3 | alternatives written inline or not marked; not branched |
| medium | Acute Upper Gastrointestinal Bleeding | emergency-2026-10-12-v1-live | published (current) | 4 | not branched |
| medium | Advanced Heart Failure Supportive Care | authoring-standard-2026-10-12-v1-live | published (current) | 2 | not branched |
| medium | Anaemia in Pregnancy: Screening and Treatment | authoring-standard-2026-10-18-tier3b-v1 | under_review (current) | 3 | alternatives written inline or not marked; not branched |
| medium | Anaemia in Pregnancy: Screening and Treatment | authoring-standard-2026-10-18-tier3b-v1-live | under_review | 3 | alternatives written inline or not marked; not branched |
| medium | Antenatal Care for Uncomplicated Pregnancy | authoring-standard-2026-10-12-v1-live | published (current) | 2 | alternatives written inline or not marked; not branched |
| medium | Benign Prostatic Hyperplasia and LUTS: Medical Management and Surgical Referral Criteria | authoring-standard-2026-10-18-tier4b-v1 | under_review (current) | 3 | not branched |
| medium | Benign Prostatic Hyperplasia and LUTS: Medical Management and Surgical Referral Criteria | authoring-standard-2026-10-18-tier4b-v1-live | under_review | 3 | not branched |
| medium | Bipolar Disorder | authoring-standard-2026-10-12-v1-live | published (current) | 3 | not branched |
| medium | Breast Cancer Management | authoring-standard-2026-10-12-v1-live | published (current) | 3 | alternatives written inline or not marked; not branched |
| medium | Cardiac Arrest | authoring-standard-2026-10-15-v2-investigations-live | published (current) | 2 | not branched |
| medium | Cardiovascular Risk Assessment | authoring-standard-2026-10-12-v1-live | published (current) | 2 | not branched |
| medium | Cataract Surgery Assessment and Preparation | authoring-standard-2026-10-12-v1-live | published (current) | 2 | not branched |
| medium | Childhood Immunisation and Catch-Up | authoring-standard-2026-10-15-v2-investigations-live | published (current) | 4 | not branched |
| medium | Conservative Kidney Care Planning | authoring-standard-2026-10-12-v1-live | published (current) | 3 | not branched |
| medium | Deep Neck Space Infections and Quinsy: Airway Risk and Referral | authoring-standard-2026-10-18-next5-saudi-review-v1-live | published (current) | 4 | not branched |
| medium | Delirium and Agitation Near End of Life | authoring-standard-2026-10-12-v1-live | published (current) | 2 | not branched |
| medium | Diabetes Screening in At-Risk Adults | authoring-standard-2026-10-12-v1-live | published (current) | 2 | not branched |
| medium | Diabetic Foot: Risk Stratification and Ulcer Referral | authoring-standard-2026-10-14-v2-investigations-live | published (current) | 3 | not branched |
| medium | Elective Cholecystectomy Pre-operative Assessment Pathway | authoring-standard-2026-10-12-v1-live | published (current) | 4 | alternatives written inline or not marked; not branched |
| medium | Elective Coronary Revascularisation Review | authoring-standard-2026-10-12-v1-live | published (current) | 2 | not branched |
| medium | Elective Hernia Repair Assessment | authoring-standard-2026-10-12-v1-live | published (current) | 4 | alternatives written inline or not marked; not branched |
| medium | Elective Hysterectomy for Benign Disease | authoring-standard-2026-10-12-v1-live | published (current) | 4 | alternatives written inline or not marked; not branched |
| medium | Elective Valve Intervention Assessment | authoring-standard-2026-10-12-v1-live | published (current) | 3 | not branched |
| medium | Fibromyalgia: Multidisciplinary Pain Management | authoring-standard-2026-10-18-saudi5-v3-live | published (current) | 4 | not branched |
| medium | Generalized Anxiety Disorder | authoring-standard-2026-10-15-v2-investigations-live | published (current) | 3 | alternatives written inline or not marked; not branched |
| medium | Gestational Diabetes Identification and Management Pathway | emergency-2026-10-12-v1-live | published (current) | 4 | alternatives written inline or not marked; not branched |
| medium | Gestational Diabetes: Antenatal Glucose Management and Delivery Planning | authoring-standard-2026-10-14-v1-live | published (current) | 4 | alternatives written inline or not marked; not branched |
| medium | Gestational Diabetes: Screening and Diagnosis | authoring-standard-2026-10-18-tier1-first5-review-v1-live | published (current) | 3 | alternatives written inline or not marked; not branched |
| medium | Gout: Long-Term Urate-Lowering Therapy Titration | authoring-standard-2026-10-18-tier4a-v1 | under_review (current) | 3 | alternatives written inline or not marked; not branched |
| medium | Gout: Long-Term Urate-Lowering Therapy Titration | authoring-standard-2026-10-18-tier4a-v1-live | under_review | 3 | alternatives written inline or not marked; not branched |
| medium | Group B Streptococcus: Risk-Based Intrapartum Prophylaxis | authoring-standard-2026-10-18-tier4a-v1 | under_review (current) | 4 | not branched |
| medium | Group B Streptococcus: Risk-Based Intrapartum Prophylaxis | authoring-standard-2026-10-18-tier4a-v1-live | under_review | 4 | not branched |
| medium | Hepatitis B: Screening and Serology Interpretation | authoring-standard-2026-10-18-saudi7-v1-live | published (current) | 4 | alternatives written inline or not marked; not branched |
| medium | Hyperosmolar Hyperglycaemic State | emergency-2026-10-12-v1-live | published (current) | 4 | not branched |
| medium | Hyperthyroidism and Thyrotoxicosis: Anti-Thyroid Drug Titration and Block-and-Replace | authoring-standard-2026-10-18-tier4b-v1 | under_review (current) | 2 | not branched |
| medium | Hyperthyroidism and Thyrotoxicosis: Anti-Thyroid Drug Titration and Block-and-Replace | authoring-standard-2026-10-18-tier4b-v1-live | under_review | 2 | not branched |
| medium | Hypothyroidism | emergency-2026-10-12-v1-live | published (current) | 2 | not branched |
| medium | Induction of Labour: Indications and Process | authoring-standard-2026-10-18-tier4b-v1 | under_review (current) | 2 | not branched |
| medium | Induction of Labour: Indications and Process | authoring-standard-2026-10-18-tier4b-v1-live | under_review | 2 | not branched |
| medium | Last Days of Life Care | authoring-standard-2026-10-12-v1-live | published (current) | 3 | not branched |
| medium | Major Depressive Disorder | authoring-standard-2026-10-12-v1-live | published (current) | 3 | alternatives written inline or not marked; not branched |
| medium | Malignant Bowel Obstruction Support | authoring-standard-2026-10-12-v1-live | published (current) | 3 | not branched |
| medium | Metabolic and Bariatric Surgery Evaluation | authoring-standard-2026-10-12-v1-live | published (current) | 2 | not branched |
| medium | Miscarriage: Expectant, Medical and Surgical Management | authoring-standard-2026-10-18-tier4b-v1 | under_review (current) | 4 | not branched |
| medium | Miscarriage: Expectant, Medical and Surgical Management | authoring-standard-2026-10-18-tier4b-v1-live | under_review | 4 | not branched |
| medium | Osteoarthritis and Chronic Pain | authoring-standard-2026-10-12-v1-live | published (current) | 3 | not branched |
| medium | Palliative Management of End-of-Life Dyspnoea and Pain | authoring-standard-2026-10-15-v2-investigations-live | published (current) | 2 | not branched |
| medium | Palliative Sedation: Proportionate Sedation for Refractory Symptoms | authoring-standard-2026-10-18-tier3a-v1-live | published (current) | 4 | not branched |
| medium | Preconception Health and Risk Review | authoring-standard-2026-10-12-v1-live | published (current) | 2 | not branched |
| medium | Progressive Neurological Disease Support | authoring-standard-2026-10-15-v2-investigations-live | published (current) | 2 | alternatives written inline or not marked; not branched |
| medium | Prostate Cancer Diagnosis and Treatment Planning | authoring-standard-2026-10-12-v1-live | published (current) | 4 | not branched |
| medium | Renal Colic: ED Analgesia and Imaging | authoring-standard-2026-10-18-tier4a-v1 | under_review (current) | 4 | not branched |
| medium | Renal Colic: ED Analgesia and Imaging | authoring-standard-2026-10-18-tier4a-v1-live | under_review | 4 | not branched |
| medium | Respiratory Secretions at End of Life: Pharmacological Management | authoring-standard-2026-10-18-tier4b-v1 | under_review (current) | 4 | not branched |
| medium | Respiratory Secretions at End of Life: Pharmacological Management | authoring-standard-2026-10-18-tier4b-v1-live | under_review | 4 | not branched |
| medium | Sepsis | emergency-2026-10-12-v1-live | published (current) | 4 | not branched |
| medium | Sepsis and Septic Shock | emergency-2026-10-12-v1-live | published (current) | 4 | not branched |
| medium | Severe Hypoglycaemia | emergency-2026-10-12-v1-live | published (current) | 3 | alternatives written inline or not marked; not branched |
| medium | Severe Pre-Eclampsia and Eclampsia: Emergency Management | authoring-standard-2026-10-18-next5-saudi-review-v1-live | published (current) | 3 | not branched |
| medium | Suspected Ectopic Pregnancy: ED Pathway | authoring-standard-2026-10-18-tier3b-v1 | under_review (current) | 2 | not branched |
| medium | Suspected Ectopic Pregnancy: ED Pathway | authoring-standard-2026-10-18-tier3b-v1-live | under_review | 2 | not branched |
| medium | Suspected Meningitis: Community Recognition and Pre-Hospital Antibiotics | authoring-standard-2026-10-18-tier3b-v1 | under_review (current) | 3 | alternatives written inline or not marked; not branched |
| medium | Suspected Meningitis: Community Recognition and Pre-Hospital Antibiotics | authoring-standard-2026-10-18-tier3b-v1-live | under_review | 3 | alternatives written inline or not marked; not branched |
| medium | Suspected Spinal Cord Compression: Red Flags and Urgent Imaging | authoring-standard-2026-10-18-tier3b-v1 | under_review (current) | 2 | not branched |
| medium | Suspected Spinal Cord Compression: Red Flags and Urgent Imaging | authoring-standard-2026-10-18-tier3b-v1-live | under_review | 2 | not branched |
| medium | Vitamin D Deficiency: Testing Indications and Treatment | authoring-standard-2026-10-18-tier4a-v1 | under_review (current) | 3 | not branched |
| medium | Vitamin D Deficiency: Testing Indications and Treatment | authoring-standard-2026-10-18-tier4a-v1-live | under_review | 3 | not branched |
