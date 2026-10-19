/**
 * Outline list of the most commonly used Emergency Department protocols (NHS and US practice).
 *
 * These are TOPIC OUTLINES only: a title, the clinical domain, a one-line planned scope and the
 * candidate source documents the protocol should be built from. No doses, thresholds or timings are
 * stated here. The full clinical content is written later (paste editor) and checked against the
 * sources before a protocol is moved from Draft to Published.
 *
 * `sources` are candidate references to verify, not citations of verified content.
 */
export type EdProtocolOutline = {
  title: string;
  /** Clinical domain(s); the draft list groups and filters by the first recognised speciality. */
  specialty: string;
  /** Display group used when this list is reviewed (not stored on the topic). */
  group: string;
  /** One-line planned scope. No doses or numeric thresholds. */
  scope: string;
  /** Candidate source documents to verify when the content is written. */
  sources: string;
};

export const ED_PROTOCOL_OUTLINES: readonly EdProtocolOutline[] = [
  // ── Endocrine and metabolic emergencies ───────────────────────────────────────────────
  { group: "Endocrine and metabolic", title: "Diabetic Ketoacidosis (DKA) in Adults", specialty: "Endocrinology / Emergency Medicine",
    scope: "Recognition and severity, fluids, fixed-rate insulin, potassium replacement, glucose and ketone monitoring, precipitant search, transition to subcutaneous insulin.",
    sources: "JBDS-IP management of DKA in adults; ADA/EASD hyperglycaemic crises consensus." },
  { group: "Endocrine and metabolic", title: "Hyperosmolar Hyperglycaemic State (HHS)", specialty: "Endocrinology / Emergency Medicine",
    scope: "Recognition, cautious fluid replacement, insulin timing, osmolality and sodium monitoring, thrombosis risk, precipitant search.",
    sources: "JBDS-IP management of HHS in adults; ADA/EASD hyperglycaemic crises consensus." },
  { group: "Endocrine and metabolic", title: "Hypoglycaemia in Adults", specialty: "Endocrinology / Emergency Medicine",
    scope: "Conscious and unconscious patient pathways, treatment, recheck, causes (insulin, sulfonylurea, non-diabetic), safe discharge criteria.",
    sources: "JBDS-IP hospital management of hypoglycaemia; ADA Standards of Care." },
  { group: "Endocrine and metabolic", title: "Adrenal Crisis", specialty: "Endocrinology / Emergency Medicine",
    scope: "Recognition in known and unknown adrenal insufficiency, immediate steroid and fluid treatment, precipitants, steroid sick-day rules.",
    sources: "Society for Endocrinology adrenal crisis guidance; Endocrine Society primary adrenal insufficiency guideline." },
  { group: "Endocrine and metabolic", title: "Thyroid Storm", specialty: "Endocrinology / Emergency Medicine",
    scope: "Diagnostic scoring, beta-blockade, anti-thyroid drug sequence, steroids, supportive care, precipitants, critical care referral.",
    sources: "American Thyroid Association hyperthyroidism guideline; Burch-Wartofsky point scale." },
  { group: "Endocrine and metabolic", title: "Hypercalcaemia (Acute, Including Malignancy-Associated)", specialty: "Endocrinology / Emergency Medicine",
    scope: "Severity, rehydration, bisphosphonate and other options, ECG, causes, referral pathway.",
    sources: "Society for Endocrinology emergency guidance on acute hypercalcaemia." },
  { group: "Endocrine and metabolic", title: "Hypocalcaemia (Acute)", specialty: "Endocrinology / Emergency Medicine",
    scope: "Symptomatic versus asymptomatic, ECG, intravenous and oral replacement, magnesium and vitamin D, causes.",
    sources: "Society for Endocrinology emergency guidance on acute hypocalcaemia." },

  // ── Electrolyte emergencies ───────────────────────────────────────────────────────────
  { group: "Electrolytes", title: "Hyperkalaemia", specialty: "Nephrology / Emergency Medicine",
    scope: "ECG-guided severity, membrane stabilisation, shifting agents (salbutamol, insulin with dextrose), removal, cause, monitoring, dialysis referral.",
    sources: "UK Kidney Association treatment of acute hyperkalaemia in adults; Resuscitation Council UK; AHA ACLS special circumstances." },
  { group: "Electrolytes", title: "Hypokalaemia", specialty: "Nephrology / Emergency Medicine",
    scope: "Severity by level and ECG, oral versus intravenous replacement and rate limits, magnesium, causes, monitoring.",
    sources: "NHS trust potassium replacement protocols; US ED references to be confirmed." },
  { group: "Electrolytes", title: "Hyponatraemia", specialty: "Nephrology / Emergency Medicine",
    scope: "Symptom-based severity, hypertonic saline for severe symptoms, volume status, correction-rate limits, osmotic demyelination risk, causes.",
    sources: "European clinical practice guideline on hyponatraemia (ESE/ESICM/ERA); US expert panel recommendations." },
  { group: "Electrolytes", title: "Hypernatraemia", specialty: "Nephrology / Emergency Medicine",
    scope: "Acute versus chronic, free water deficit estimation, safe correction rate, fluid choice, causes including diabetes insipidus.",
    sources: "To be confirmed from NHS trust guidance and standard nephrology references." },
  { group: "Electrolytes", title: "Hypophosphataemia", specialty: "Nephrology / Emergency Medicine",
    scope: "Severity, oral and intravenous replacement, refeeding risk, causes, monitoring.",
    sources: "NICE nutrition support (refeeding) guidance; NHS trust phosphate replacement protocols." },
  { group: "Electrolytes", title: "Hyperphosphataemia", specialty: "Nephrology / Emergency Medicine",
    scope: "Causes (kidney disease, tumour lysis, rhabdomyolysis), calcium interaction, binders, dialysis indications.",
    sources: "KDIGO CKD-MBD guideline; NHS trust protocols." },
  { group: "Electrolytes", title: "Hypomagnesaemia", specialty: "Nephrology / Emergency Medicine",
    scope: "Severity, ECG and arrhythmia risk (including torsades), oral and intravenous replacement, associated hypokalaemia and hypocalcaemia.",
    sources: "NHS trust magnesium replacement protocols; Resuscitation Council UK peri-arrest guidance." },
  { group: "Electrolytes", title: "Hypermagnesaemia", specialty: "Nephrology / Emergency Medicine",
    scope: "Causes (kidney failure, magnesium therapy), recognition (reflexes, ECG, respiratory depression), calcium, fluids, dialysis.",
    sources: "NHS trust protocols; standard nephrology references to be confirmed." },

  // ── Renal ─────────────────────────────────────────────────────────────────────────────
  { group: "Renal", title: "Acute Kidney Injury (AKI)", specialty: "Nephrology / Emergency Medicine",
    scope: "Staging, volume assessment, nephrotoxic drug review, obstruction check, urgent dialysis indications, referral and follow-up.",
    sources: "NICE NG148; KDIGO AKI guideline; UK Kidney Association AKI guidance." },
  { group: "Renal", title: "Rhabdomyolysis", specialty: "Nephrology / Emergency Medicine",
    scope: "Recognition, creatine kinase interpretation, fluid strategy, electrolyte complications, compartment syndrome check, referral.",
    sources: "To be confirmed from NHS trust guidance and published reviews." },

  // ── Cardiovascular ────────────────────────────────────────────────────────────────────
  { group: "Cardiovascular", title: "Acute Coronary Syndrome (STEMI and NSTEMI)", specialty: "Cardiology / Emergency Medicine",
    scope: "ECG within minutes, STEMI reperfusion pathway, NSTEMI risk stratification, antithrombotic therapy, analgesia, disposition.",
    sources: "NICE NG185; ESC ACS guidelines; AHA/ACC acute coronary syndrome guideline." },
  { group: "Cardiovascular", title: "Acute Heart Failure and Pulmonary Oedema", specialty: "Cardiology / Emergency Medicine",
    scope: "Recognition, oxygen and non-invasive ventilation, diuretics, vasodilators, cardiogenic shock, precipitants, disposition.",
    sources: "NICE NG106; ESC heart failure guidelines; AHA/ACC/HFSA heart failure guideline." },
  { group: "Cardiovascular", title: "Supraventricular Tachycardia (SVT)", specialty: "Cardiology / Emergency Medicine",
    scope: "Stable versus unstable pathway, vagal manoeuvres, adenosine, alternatives, cardioversion, follow-up.",
    sources: "Resuscitation Council UK peri-arrest arrhythmia guidance; AHA ACLS tachycardia algorithm." },
  { group: "Cardiovascular", title: "Atrial Fibrillation with Rapid Ventricular Response", specialty: "Cardiology / Emergency Medicine",
    scope: "Stability assessment, rate versus rhythm control, cardioversion criteria, anticoagulation decision, precipitants.",
    sources: "NICE NG196; ESC atrial fibrillation guideline; AHA/ACC AF guideline." },
  { group: "Cardiovascular", title: "Ventricular Tachycardia and Broad-Complex Tachycardia", specialty: "Cardiology / Emergency Medicine",
    scope: "Pulse and stability assessment, synchronised cardioversion, antiarrhythmic options, torsades, electrolyte correction.",
    sources: "Resuscitation Council UK peri-arrest arrhythmia guidance; AHA ACLS tachycardia algorithm." },
  { group: "Cardiovascular", title: "Symptomatic Bradycardia", specialty: "Cardiology / Emergency Medicine",
    scope: "Adverse features, atropine, alternatives, pacing, reversible causes (drugs, hyperkalaemia, ischaemia).",
    sources: "Resuscitation Council UK peri-arrest arrhythmia guidance; AHA ACLS bradycardia algorithm." },
  { group: "Cardiovascular", title: "Adult Cardiac Arrest (Advanced Life Support)", specialty: "Cardiology / Emergency Medicine",
    scope: "Shockable and non-shockable pathways, drugs, airway, reversible causes, post-ROSC care, termination considerations.",
    sources: "Resuscitation Council UK adult ALS; AHA adult cardiac arrest algorithm." },
  { group: "Cardiovascular", title: "Hypertensive Emergency", specialty: "Cardiology / Emergency Medicine",
    scope: "Distinguishing emergency from severe asymptomatic hypertension, target-organ syndromes, controlled reduction, drug choice by syndrome.",
    sources: "ESC/ESH hypertension guideline; AHA/ACC hypertension guideline." },
  { group: "Cardiovascular", title: "Pulmonary Embolism", specialty: "Pulmonology / Emergency Medicine",
    scope: "Pre-test probability, D-dimer and imaging, risk stratification, anticoagulation, thrombolysis for high-risk disease, disposition.",
    sources: "NICE NG158; ESC pulmonary embolism guideline; CHEST/ASH guidance." },

  // ── Respiratory and allergy ───────────────────────────────────────────────────────────
  { group: "Respiratory and allergy", title: "Acute Severe Asthma in Adults", specialty: "Pulmonology / Emergency Medicine",
    scope: "Severity grading, bronchodilators, steroids, magnesium, escalation to critical care, discharge and follow-up.",
    sources: "BTS/SIGN asthma guideline; GINA; NAEPP asthma guidelines." },
  { group: "Respiratory and allergy", title: "Acute Exacerbation of COPD", specialty: "Pulmonology / Emergency Medicine",
    scope: "Controlled oxygen targets, bronchodilators, steroids, antibiotic criteria, non-invasive ventilation criteria, disposition.",
    sources: "NICE NG115; GOLD report; BTS oxygen guideline." },
  { group: "Respiratory and allergy", title: "Anaphylaxis", specialty: "Emergency Medicine",
    scope: "Recognition, intramuscular adrenaline, airway and fluids, adjuncts, observation period, biphasic reaction, referral and auto-injector teaching.",
    sources: "Resuscitation Council UK anaphylaxis guideline; WAO; AAAAI/ACAAI anaphylaxis practice parameter." },

  // ── Neurology ─────────────────────────────────────────────────────────────────────────
  { group: "Neurology", title: "Status Epilepticus", specialty: "Neurology / Emergency Medicine",
    scope: "Time-based stages, first-line benzodiazepine, second-line agents, refractory pathway, glucose and cause search.",
    sources: "NICE NG217; Neurocritical Care Society status epilepticus guideline; American Epilepsy Society guideline." },
  { group: "Neurology", title: "Acute Stroke and Thrombolysis Pathway", specialty: "Neurology / Emergency Medicine",
    scope: "Recognition scales, urgent imaging, thrombolysis and thrombectomy eligibility, blood pressure targets, mimics, transfer.",
    sources: "NICE NG128; RCP UK stroke guideline; AHA/ASA acute ischaemic stroke guideline." },

  // ── Infection ─────────────────────────────────────────────────────────────────────────
  { group: "Infection", title: "Sepsis in Adults", specialty: "Infectious Diseases / Emergency Medicine",
    scope: "Risk stratification, cultures, antibiotics, fluids, lactate, vasopressors, source control, escalation.",
    sources: "NICE NG51; Surviving Sepsis Campaign international guidelines; Saudi MOH sepsis guidance to be checked." },
  { group: "Infection", title: "Suspected Bacterial Meningitis", specialty: "Infectious Diseases / Emergency Medicine",
    scope: "Early antibiotics, steroid decision, imaging before lumbar puncture criteria, public-health notification, contact prophylaxis.",
    sources: "NICE bacterial meningitis and meningococcal disease guideline; IDSA bacterial meningitis guideline." },
  { group: "Infection", title: "Neutropenic Sepsis", specialty: "Infectious Diseases / Emergency Medicine",
    scope: "Recognition in patients on chemotherapy, time-critical empirical antibiotics, risk assessment, escalation, oncology liaison.",
    sources: "NICE NG151; ASCO/IDSA febrile neutropenia guideline." },

  // ── Gastrointestinal ──────────────────────────────────────────────────────────────────
  { group: "Gastrointestinal", title: "Acute Upper Gastrointestinal Bleeding (Including Variceal)", specialty: "Gastroenterology / Emergency Medicine",
    scope: "Risk scoring, resuscitation and transfusion thresholds, proton-pump inhibitor and variceal-specific treatment, endoscopy timing.",
    sources: "NICE acute upper GI bleeding guideline; BSG guidance; ACG upper GI bleeding guideline." },

  // ── Toxicology ────────────────────────────────────────────────────────────────────────
  { group: "Toxicology", title: "Paracetamol Overdose", specialty: "Toxicology / Emergency Medicine",
    scope: "Acute and staggered presentations, nomogram use, acetylcysteine, liver and kidney monitoring, psychiatric assessment before discharge.",
    sources: "UK TOXBASE and MHRA paracetamol guidance; Rumack-Matthew nomogram; US poison centre guidance." },
  { group: "Toxicology", title: "Opioid Overdose", specialty: "Toxicology / Emergency Medicine",
    scope: "Airway and ventilation first, naloxone strategy, observation period, long-acting opioid cautions, harm-reduction and referral.",
    sources: "TOXBASE; SAMHSA opioid overdose toolkit; ACEP guidance." },
  { group: "Toxicology", title: "Alcohol Withdrawal and Delirium Tremens", specialty: "Psychiatry / Emergency Medicine",
    scope: "Severity scoring, symptom-triggered benzodiazepines, thiamine, electrolytes, seizures, admission criteria.",
    sources: "NICE CG100; CIWA-Ar; ASAM alcohol withdrawal guideline." },

  // ── Trauma and haemorrhage ────────────────────────────────────────────────────────────
  { group: "Trauma and haemorrhage", title: "Major Haemorrhage and Massive Transfusion", specialty: "Emergency Medicine / Haematology",
    scope: "Activation criteria, blood product ratios, tranexamic acid, calcium and temperature, point-of-care monitoring, stand-down.",
    sources: "NICE blood transfusion guideline; UK national major haemorrhage guidance; ATLS; EAST/ACS trauma guidance." },
  { group: "Trauma and haemorrhage", title: "Major Trauma: Primary Survey and Resuscitation", specialty: "Orthopedics and Trauma / Emergency Medicine",
    scope: "Catastrophic haemorrhage, airway with spinal protection, breathing, circulation, disability, exposure, trauma team activation.",
    sources: "ATLS (ACS); NICE major trauma guidance; Trauma Audit and Research Network standards." },
  { group: "Trauma and haemorrhage", title: "Adult Head Injury", specialty: "Neurology / Emergency Medicine",
    scope: "Risk stratification, CT criteria, anticoagulant patients, observation and discharge advice, neurosurgical referral.",
    sources: "NICE head injury guideline; Canadian CT Head Rule; ACEP mild traumatic brain injury clinical policy." },

  // ── Haematology ───────────────────────────────────────────────────────────────────────
  { group: "Haematology", title: "Reversal of Anticoagulation (Warfarin and DOACs)", specialty: "Emergency Medicine / Haematology",
    scope: "Bleeding severity, agent-specific reversal options, vitamin K, factor concentrates, timing of restarting anticoagulation.",
    sources: "British Society for Haematology guidance; ACC expert consensus on bleeding with oral anticoagulants." },
  { group: "Haematology", title: "Sickle Cell Crisis (Acute Painful Episode)", specialty: "Emergency Medicine / Haematology",
    scope: "Rapid analgesia, fluids and oxygen cautions, acute chest syndrome and other complications, escalation, safe discharge.",
    sources: "NICE NG143; ASH sickle cell disease guidelines; NHLBI expert panel." },

  // ── Obstetrics and gynaecology ────────────────────────────────────────────────────────
  { group: "Obstetrics and gynaecology", title: "Ectopic Pregnancy", specialty: "Obstetrics and Gynecology / Emergency Medicine",
    scope: "Pregnancy of unknown location, haemodynamic assessment, ultrasound and hCG use, medical versus surgical management, Rh status.",
    sources: "NICE NG126; ACOG practice bulletin on tubal ectopic pregnancy." },
  { group: "Obstetrics and gynaecology", title: "Severe Pre-eclampsia and Eclampsia", specialty: "Obstetrics and Gynecology / Emergency Medicine",
    scope: "Blood pressure control, magnesium sulfate seizure prophylaxis and treatment, toxicity monitoring, delivery planning, transfer.",
    sources: "NICE NG133; RCOG Green-top guideline on eclampsia; ACOG hypertension in pregnancy." },

  // ── Environmental and procedures ──────────────────────────────────────────────────────
  { group: "Environmental and procedures", title: "Heat Stroke", specialty: "Emergency Medicine",
    scope: "Recognition, rapid active cooling, organ-dysfunction monitoring, fluids, complications, mass-gathering and Hajj considerations.",
    sources: "Wilderness Medical Society heat illness guideline; ACEP; Saudi MOH heat illness guidance to be checked." },
  { group: "Environmental and procedures", title: "Rapid Sequence Intubation in the ED", specialty: "Anaesthesiology / Emergency Medicine",
    scope: "Preparation checklist, pre-oxygenation, drug selection, failed-airway plan, post-intubation care.",
    sources: "Difficult Airway Society guidelines; ACEP airway management policy; local RSI checklist." },
];
