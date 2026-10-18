import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
const DATE = "2026-10-13", VERSION = "topic-list-draft-2026-10-13-b003";
const CC="Chronic Care", UC="Urgent Care", KW="Keep Well", PC="Planned Care", SB="Safe Birth", PAL="Palliative Care";
const T = [
// Chronic Care
[CC,"Suspected Rheumatoid Arthritis: Primary Care Recognition and Early Referral","Rheumatology / Primary Care"],
[CC,"Rheumatoid Arthritis: DMARD Initiation and Monitoring","Rheumatology"],
[CC,"Irritable Bowel Syndrome: Primary Care Diagnosis and Red-Flag Exclusion","Gastroenterology / Primary Care"],
[CC,"Irritable Bowel Syndrome: Dietary and Medical Management Ladder","Gastroenterology / Primary Care"],
[CC,"Suspected Inflammatory Bowel Disease: Faecal Calprotectin and Referral Pathway","Gastroenterology / Primary Care"],
[CC,"Inflammatory Bowel Disease: Maintenance Monitoring and Flare Plan","Gastroenterology"],
[CC,"First Seizure in Adults: Assessment and Referral","Neurology / Emergency Medicine"],
[CC,"Epilepsy in Adults: Medication Review and Safety Counselling","Neurology / Primary Care"],
[CC,"Suspected Parkinson's Disease: Recognition and Referral","Neurology / Primary Care"],
[CC,"Parkinson's Disease: Medication Timing and Complication Review","Neurology"],
[CC,"Suspected Dementia: Memory Assessment and Referral","Geriatrics / Neurology / Primary Care"],
[CC,"Dementia After Diagnosis: Cognitive Support and Care Planning","Geriatrics / Primary Care"],
[CC,"Type 1 Diabetes in Adults: Newly Diagnosed Pathway","Endocrinology"],
[CC,"Type 1 Diabetes in Adults: Annual Review and Sick-Day Rules","Endocrinology / Primary Care"],
[CC,"Suspected Chronic Liver Disease: Community Detection and Staging","Hepatology / Primary Care"],
[CC,"Compensated Cirrhosis: Surveillance and Complication Prevention","Hepatology / Gastroenterology"],
[CC,"Headache: Red Flags and Primary Headache Diagnosis","Neurology / Primary Care"],
[CC,"Migraine: Acute Treatment and Prophylaxis Ladder","Neurology / Primary Care"],
[CC,"Suspected Endometriosis: Primary Care Recognition and Referral","Gynaecology / Primary Care"],
[CC,"Endometriosis: Long-Term Medical Management","Gynaecology"],
[CC,"Polycystic Ovary Syndrome: Diagnosis and Metabolic Screening","Gynaecology / Endocrinology"],
[CC,"Polycystic Ovary Syndrome: Cycle, Symptom and Fertility Management","Gynaecology / Endocrinology"],
[CC,"Gout and Hyperuricaemia: Flare Management","Rheumatology / Primary Care"],
[CC,"Gout: Long-Term Urate-Lowering Therapy Titration","Rheumatology / Primary Care"],
[CC,"Multiple Sclerosis: Relapse Recognition and Community Monitoring","Neurology / Primary Care"],
[CC,"Benign Prostatic Hyperplasia and LUTS: Medical Management and Surgical Referral Criteria","Urology / Primary Care"],
[CC,"Coeliac Disease: Serology Testing Pathway","Gastroenterology / Primary Care"],
[CC,"Coeliac Disease: Lifelong Dietary Management and Follow-Up","Gastroenterology / Primary Care"],
[CC,"Hyperthyroidism and Thyrotoxicosis: Anti-Thyroid Drug Titration and Block-and-Replace","Endocrinology"],
[CC,"Chronic Glaucoma: Pressure Monitoring and Drop Adherence","Ophthalmology"],
[CC,"Obstructive Sleep Apnoea: Screening and Referral","Respiratory Medicine / Primary Care"],
[CC,"Obstructive Sleep Apnoea: CPAP Adherence and Driving Advice","Respiratory Medicine / Sleep Medicine"],
[CC,"Fibromyalgia: Multidisciplinary Pain Management","Rheumatology / Pain Medicine"],
[CC,"Myalgic Encephalomyelitis / Chronic Fatigue Syndrome: Energy Management and Pacing","Primary Care / Internal Medicine"],
// Urgent Care
[UC,"Status Epilepticus and Acute Seizures: ED Stabilisation","Neurology / Emergency Medicine"],
[UC,"Transient Ischaemic Attack: Risk Stratification and Urgent Clinic Referral","Neurology / Emergency Medicine"],
[UC,"Renal Colic: ED Analgesia and Imaging","Urology / Emergency Medicine"],
[UC,"Kidney Stones: Urology Referral and Prevention","Urology"],
[UC,"Suspected Meningitis: Community Recognition and Pre-Hospital Antibiotics","Infectious Diseases / Primary Care"],
[UC,"Suspected Meningitis and Encephalitis: ED Investigation and Treatment Pathway","Infectious Diseases / Emergency Medicine"],
[UC,"Major Trauma: ED Primary Survey and Massive Haemorrhage Protocol","Emergency Medicine / Trauma Surgery"],
[UC,"Suspected Ectopic Pregnancy: ED Pathway","Gynaecology / Emergency Medicine"],
[UC,"Ruptured Ovarian Cyst and Acute Adnexal Pain: ED Assessment","Gynaecology / Emergency Medicine"],
[UC,"Biliary Colic: Assessment and Discharge Criteria","General Surgery / Emergency Medicine"],
[UC,"Acute Cholecystitis: Admission and Surgical Pathway","General Surgery / Emergency Medicine"],
[UC,"Acute Asthma Exacerbation in Children: ED Pathway","Paediatrics / Emergency Medicine"],
[UC,"Acute Asthma Exacerbation in Children: Inhaler Technique and Oral Steroid Discharge Plan","Paediatrics / Primary Care"],
[UC,"Suspected Cauda Equina Syndrome: Identification and Urgent MRI Pathway","Neurosurgery / Orthopaedics / Emergency Medicine"],
[UC,"Sudden Sensorineural Hearing Loss: Urgent Assessment and Steroid Therapy","Otolaryngology (ENT)"],
[UC,"Acute Otitis Media: Antibiotic Prescribing Criteria","Otolaryngology (ENT) / Primary Care"],
[UC,"Acute Otitis Externa: Topical Treatment and Referral","Otolaryngology (ENT) / Primary Care"],
[UC,"Suspected Spinal Cord Compression: Red Flags and Urgent Imaging","Neurosurgery / Oncology / Emergency Medicine"],
[UC,"Acute Red Eye: Conjunctivitis versus Angle-Closure Glaucoma and Uveitis","Ophthalmology / Emergency Medicine"],
[UC,"Cellulitis and Erysipelas: Outpatient versus Intravenous Antibiotic Criteria","Infectious Diseases / Primary Care"],
[UC,"Lower Gastrointestinal Bleeding: Risk Stratification and Discharge versus Admission","Gastroenterology / Emergency Medicine"],
[UC,"Deep Neck Space Infections and Quinsy: Airway Risk and Referral","Otolaryngology (ENT) / Emergency Medicine"],
[UC,"Neutropenic Sepsis: One-Hour Door-to-Antibiotic Protocol","Oncology / Emergency Medicine"],
[UC,"Acute Heart Failure Exacerbation in the Community: Diuretic Titration and Admission Triggers","Cardiology / Primary Care"],
[UC,"Minor Head Injury in Adults: Observation and CT Head Rules","Emergency Medicine"],
[UC,"Minor Head Injury in Children: Observation and CT Criteria","Paediatrics / Emergency Medicine"],
[UC,"Acute Soft Tissue Injuries and Sprains: Ottawa Rules and Referral Thresholds","Emergency Medicine / Orthopaedics"],
// Keep Well
[KW,"Depression and Anxiety Screening in Primary Care","Primary Care / Psychiatry"],
[KW,"Sexually Transmitted Infection Screening: Who to Test and Which Tests","Sexual Health / Primary Care"],
[KW,"Fall Risk Assessment in Older Adults","Geriatrics / Primary Care"],
[KW,"Paediatric Developmental Milestones Screening","Paediatrics / Primary Care"],
[KW,"Prostate Cancer Screening: PSA Discussion and Risk Assessment","Urology / Primary Care"],
[KW,"Childhood and Adolescent Obesity Screening","Paediatrics / Primary Care"],
[KW,"Menopause: Diagnosis and Symptom Control","Gynaecology / Primary Care"],
[KW,"Hormone Replacement Therapy: Risk-Benefit Counselling and Prescribing Review","Gynaecology / Primary Care"],
[KW,"Contraception: Method Choice and Medical Eligibility","Gynaecology / Primary Care"],
[KW,"Long-Acting Reversible Contraception: Insertion and Follow-Up","Gynaecology / Primary Care"],
[KW,"Frailty Assessment in Primary Care","Geriatrics / Primary Care"],
[KW,"Alcohol Misuse: AUDIT Screening and Brief Intervention","Primary Care / Psychiatry"],
[KW,"Hepatitis B: Screening and Serology Interpretation","Hepatology / Infectious Diseases"],
[KW,"Hepatitis C: Screening and Referral for Treatment","Hepatology / Infectious Diseases"],
[KW,"Vitamin D Deficiency: Testing Indications and Treatment","Endocrinology / Primary Care"],
[KW,"Antenatal and Postnatal Mental Health Screening","Obstetrics / Psychiatry"],
[KW,"Post-PCI Community Secondary Prevention","Cardiology / Primary Care"],
// Planned Care
[PC,"Endoscopy: Referral Criteria and Urgent Triggers","Gastroenterology"],
[PC,"Colonoscopy: Pre-Procedure Assessment and Bowel Preparation","Gastroenterology"],
[PC,"Tonsillectomy and Adenoidectomy: Referral Criteria and Pre-Operative Assessment","Otolaryngology (ENT)"],
[PC,"Varicose Veins: Vascular Referral Pathway","Vascular Surgery"],
[PC,"Carpal Tunnel Syndrome: Splinting and Injection in Primary Care","Orthopaedics / Primary Care"],
[PC,"Carpal Tunnel Syndrome: Surgical Release Criteria and Post-Operative Care","Orthopaedics"],
[PC,"Joint Injection Pathways: Corticosteroid Injection for Osteoarthritis","Rheumatology / Orthopaedics"],
[PC,"Thyroidectomy: Pre-Operative Assessment","Endocrine Surgery"],
[PC,"Abnormal Uterine Bleeding: Primary Care Workup and Urgent Referral Criteria","Gynaecology / Primary Care"],
[PC,"Dyspepsia and Helicobacter pylori: Test-and-Treat and Urgent Endoscopy Triggers","Gastroenterology / Primary Care"],
[PC,"Suspected Melanoma: Skin Lesion Assessment and Dermatology Referral","Dermatology / Primary Care"],
[PC,"Gallstone Disease: Conservative Management versus Elective Cholecystectomy","General Surgery"],
[PC,"Prostate Cancer Survivorship: Community PSA Monitoring and Side-Effect Management","Urology / Oncology"],
[PC,"Bariatric Surgery: Post-Operative Monitoring and Supplementation","Bariatric / Metabolic Surgery"],
// Safe Birth
[SB,"Twin Pregnancy: Antenatal Surveillance","Obstetrics / Maternal-Fetal Medicine"],
[SB,"Twin Pregnancy: Timing and Mode of Birth","Obstetrics / Maternal-Fetal Medicine"],
[SB,"Induction of Labour: Indications and Process","Obstetrics"],
[SB,"Vaginal Birth After Caesarean: Antenatal Counselling","Obstetrics"],
[SB,"Vaginal Birth After Caesarean: Intrapartum Care","Obstetrics"],
[SB,"Miscarriage: Diagnosis and Early Pregnancy Unit Assessment","Obstetrics / Gynaecology"],
[SB,"Miscarriage: Expectant, Medical and Surgical Management","Obstetrics / Gynaecology"],
[SB,"Hyperemesis Gravidarum: Assessment and Management","Obstetrics"],
[SB,"Perineal Tear: Assessment and Repair","Obstetrics"],
[SB,"Perineal Tear: Postpartum Care and Follow-Up","Obstetrics / Primary Care"],
[SB,"Group B Streptococcus: Risk-Based Intrapartum Prophylaxis","Obstetrics / Neonatology"],
[SB,"Placenta Praevia and Low-Lying Placenta: Surveillance and Delivery Planning","Obstetrics"],
[SB,"Anti-D Prophylaxis: Routine and Sensitising-Event Administration","Obstetrics / Haematology"],
[SB,"Shoulder Dystocia: Emergency Manoeuvres and Neonatal Assessment","Obstetrics"],
[SB,"Postpartum Depression: Screening and Primary Care Management","Obstetrics / Psychiatry / Primary Care"],
[SB,"Postpartum Psychosis: Emergency Assessment and Mother and Baby Unit Admission","Psychiatry / Obstetrics"],
// Palliative Care
[PAL,"Motor Neurone Disease: End-of-Life Anticipatory Prescribing","Palliative Medicine / Neurology"],
[PAL,"Palliative Sedation: Proportionate Sedation for Refractory Symptoms","Palliative Medicine"],
[PAL,"Respiratory Secretions at End of Life: Pharmacological Management","Palliative Medicine"],
[PAL,"Bereavement and Grief Support","Palliative Medicine / Primary Care"],
// Regional health model alignment (metabolic/CV burden, national screening, maternal and child health)
[CC,"Type 2 Diabetes: New Diagnosis and Initial Treatment","Endocrinology / Primary Care"],
[CC,"Type 2 Diabetes: Treatment Intensification and Add-On Therapy","Endocrinology / Primary Care"],
[CC,"Diabetic Kidney Disease: ACR Screening and Management","Nephrology / Endocrinology / Primary Care"],
[CC,"Diabetic Foot: Risk Stratification and Ulcer Referral","Endocrinology / Podiatry / Vascular Surgery"],
[CC,"Dyslipidaemia: Statin Initiation and Lipid Targets","Cardiology / Primary Care"],
[CC,"Familial Hypercholesterolaemia: Identification and Referral","Cardiology / Endocrinology"],
[CC,"Obesity in Adults: Primary Care Weight Management Pathway","Endocrinology / Primary Care"],
[CC,"Obesity in Adults: Pharmacotherapy and Bariatric Referral Criteria","Endocrinology / Bariatric Surgery"],
[CC,"Hypertension: Primary Care Titration and Target Review","Family Medicine / Cardiology"],
[CC,"Resistant Hypertension and Secondary Causes: Referral Triggers","Cardiology / Nephrology / Endocrinology"],
[CC,"Stable Coronary Artery Disease: Medical Management and Referral Triggers","Cardiology / Primary Care"],
[KW,"Diabetic Retinopathy Screening","Ophthalmology / Endocrinology / Primary Care"],
[KW,"Post-Myocardial Infarction Community Secondary Prevention and Cardiac Rehabilitation","Cardiology / Primary Care"],
[KW,"Premarital and Newborn Screening Programmes","Public Health / Genetics / Paediatrics"],
[SB,"Gestational Diabetes: Screening and Diagnosis","Obstetrics / Endocrinology"],
[SB,"Gestational Diabetes: Antenatal Glucose Management and Delivery Planning","Obstetrics / Endocrinology"],
[SB,"Gestational Diabetes: Postnatal Follow-Up for Type 2 Diabetes Risk","Obstetrics / Primary Care"],
[SB,"Pre-Eclampsia: Antenatal Risk Assessment and Aspirin Prophylaxis","Obstetrics / Maternal-Fetal Medicine"],
[SB,"Severe Pre-Eclampsia and Eclampsia: Emergency Management","Obstetrics / Anaesthesia / Emergency Medicine"],
[SB,"Routine Antenatal Care: Booking Visit and Visit Schedule","Obstetrics / Primary Care"],
[SB,"Anaemia in Pregnancy: Screening and Treatment","Obstetrics / Haematology"],
[SB,"Routine Postnatal Care: Mother and Baby Checks","Obstetrics / Paediatrics / Primary Care"],
];
const NA = "Not authored. Requires source review before clinical use.";
const shell = (id,title,specialty,pillar)=>({id,title,pillar,status:"draft",version:VERSION,authority:"Other",specialty,lastReviewed:DATE,
 presentation:{redFlags:["Not authored. Do not use this draft for clinical decision-making."],symptoms:[NA],physicalSigns:[NA]},
 differentials:[{condition:"Not authored",distinguishingFeatures:"Requires source review before clinical use."}],
 investigations:{ruleIn:[{tier:"specializedAdjunctive",testName:"Not authored",modalityTarget:"No investigation protocol is provided in this intake shell.",expectedFinding:"Not authored.",targetCondition:title,clinicalRationale:"Requires source review before clinical use."}],
  ruleOut:[{tier:"specializedAdjunctive",testName:"Not authored",modalityTarget:"No exclusion protocol is provided in this intake shell.",expectedFinding:"Not authored.",targetCondition:`Alternatives to ${title}`,clinicalRationale:"Requires source review before clinical use."}]},
 medicationPlan:{note:"No medicines, doses or treatment recommendations are included. Evidence review and local clinical governance are required.",status:"local-protocol-required",regimens:[]},
 pathophysiology:{summary:"Clinical content has not been authored. This schema-valid intake shell contains no clinical guidance and requires evidence review before use.",keyMechanisms:["Evidence review and clinician authoring are required before clinical content is added."]},
 clinicalManagement:[{id:"evidence-review-required",title:"Clinical pathway not authored",actions:["Complete source retrieval, evidence extraction, schema validation and clinician review before adding clinical guidance."],timeframe:"Before any clinical use"}],
 clinicalReviewStatus:"pending",
 nonClinicalManagement:{followUpPlan:NA,mdtReferrals:[NA],lifestyleAndDiet:[NA],patientEducation:[NA],dischargeCriteria:[NA]}});
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
if (process.argv.includes("--apply")) { const {data:old}=await db.from("guideline_versions").select("guideline_id").eq("version",VERSION).eq("status","draft"); const ids=(old??[]).map(r=>r.guideline_id); if(ids.length){const {error:de}=await db.from("clinical_guidelines").delete().in("id",ids); if(de) throw de; console.log("Removed previous b003 shells:",ids.length);} }
const { data: ex, error: ee } = await db.from("clinical_guidelines").select("title"); if (ee) throw ee;
const have = new Set(ex.map(x=>norm(x.title)));
const seen = new Set(); const recs=[];
for (const [pillar,title,specialty] of T) { const k=norm(title); if(have.has(k)||seen.has(k)){console.log("SKIP existing/dup:",title);continue;} seen.add(k); recs.push(shell(randomUUID(),title,specialty,pillar)); }
console.log("TO INSERT", recs.length);
writeFileSync("data/seeds/batch_07_topic_list_drafts.json", JSON.stringify(recs,null,2)+"\n");
if (process.argv.includes("--apply")) {
 for (const c of recs) {
  const g={id:c.id,organization_id:null,title:c.title,source_type:"curated-saudi-draft",is_shared_reference:true,specialty:c.specialty,status:"draft"};
  const {error:e1}=await db.from("clinical_guidelines").insert(g); if(e1){console.log("FAIL guideline",c.title,e1.message);continue;}
  const v={id:c.id,guideline_id:c.id,version:VERSION,version_number:VERSION,status:"draft",is_current:false,content:c,change_summary:"Topic added to the draft queue at the owner's request. Intake shell only; no clinical content authored; clinical review pending.",source_title:"Marifa topic-list intake; clinical sources not yet reviewed",issuing_organization:"Marifa topic-list intake; clinical sources not yet reviewed",source_url:"https://github.com/doctab001-blip/Marifa",jurisdiction:"Saudi Arabia",publication_date:DATE,last_verified_date:DATE,review_date:DATE,approved_by:null,approved_at:null,published_at:null,created_by:null};
  const {error:e2}=await db.from("guideline_versions").insert(v);
  if(e2){console.log("FAIL version",c.title,e2.message);await db.from("clinical_guidelines").delete().eq("id",c.id);continue;}
  console.log("OK",c.title);
 }
}
