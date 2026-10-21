import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const DATE = "2026-10-21";
const OLD = "authoring-standard-2026-10-21-next-outline-v1";
const VERSION = "authoring-standard-2026-10-21-full-v2";
const DIR = path.resolve("data/emergency-versions");

const topics = [
  ["acute-pyelonephritis-in-pregnancy", "NICE NG111, Recommendations 1.1.1–1.3.3", "https://www.nice.org.uk/guidance/ng111/chapter/recommendations"],
  ["adult-upper-airway-emergency", "Resuscitation Council UK, Airway Management and Ventilation, Chapter 7, pp. 53–56", "https://lms.resus.org.uk/modules/m65-non-technical-skills/resources/chapter_7.pdf"],
  ["antimicrobial-allergy-penicillin-delabelling", "NICE CG183, Recommendations 1.1–1.4", "https://www.nice.org.uk/guidance/cg183/chapter/Recommendations"],
  ["adhd-recognition-assessment-shared-care", "NICE NG87, Recommendations 1.2–1.8", "https://www.nice.org.uk/guidance/ng87/chapter/recommendations"],
  ["autism-early-recognition-referral", "NICE CG128, Recommendations 1.2–1.5", "https://www.nice.org.uk/guidance/cg128/chapter/Recommendations"],
  ["bronchiolitis-infant-distress", "NICE NG9, Recommendations 1.1–1.5", "https://www.nice.org.uk/guidance/ng9/chapter/Recommendations"],
  ["child-safeguarding-non-accidental-injury", "NICE CG89, Recommendations 1.1–1.3", "https://www.nice.org.uk/guidance/cg89/chapter/Recommendations"],
  ["diabetic-foot-infection", "IWGDF/IDSA 2023, Recommendations 1–22", "https://www.idsociety.org/practice-guideline/diabetic-foot-infections/"],
  ["fournier-gangrene", "EAU Urological Infections Guideline 2026, Section Fournier's gangrene", "https://uroweb.org/guidelines/urological-infections/chapter/the-guideline"],
  ["infective-endocarditis", "2023 ESC Endocarditis Guideline, Sections 5–9 and Tables 7–10", "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/endocarditis/"],
];

const src = (title, edition, url) => ({ title, edition, url });
const inv = (testName, normalValue, expectedFinding, clinicalRationale, edition, url, tier = "laboratory") => ({
  tier, testName, modalityTarget: "Diagnosis, severity and complications", targetCondition: "Named condition",
  normalValue, expectedFinding, clinicalRationale, references: [src(edition.split(",")[0], edition, url)],
});
const med = (x) => ({
  indication: x.indication, patientGroup: x.patientGroup, genericName: x.genericName, dose: x.dose, route: x.route,
  frequency: x.frequency, duration: x.duration, adjustments: x.adjustments, monitoring: x.monitoring,
  contraindications: x.contraindications, branch: x.branch, step: x.step, selection: x.selection ?? "all",
  ...(x.preferred === undefined ? {} : { preferred: x.preferred }), ...(x.useWhen ? { useWhen: x.useWhen } : {}),
  sourceTitle: x.sourceTitle, sourceUrl: x.sourceUrl, sourceEdition: x.sourceEdition,
});
const noDrug = (note) => ({ status: "no-drug-indicated", regimens: [], note });

const panels = {
  "acute-pyelonephritis-in-pregnancy": [
    ["Maternal observations and sepsis screen", "Temperature 36.0–37.5 °C; systolic blood pressure at least 90 mmHg; alert mental state", "Fever, tachycardia, hypotension, altered mentation or oliguria", "Treat physiological instability as sepsis; obtain senior obstetric and medical review without waiting for imaging.", "specializedAdjunctive"],
    ["Urinalysis", "No nitrite, leucocyte esterase or blood", "Pyuria and/or nitrite; haematuria may occur", "Supports a urinary source but does not identify susceptibility."],
    ["Midstream urine culture and susceptibility", "No significant pathogen growth", "A urinary pathogen with a susceptibility profile", "Collect before antibiotics when this does not delay treatment; narrow treatment to the result."],
    ["Full blood count", "White-cell count 4.0–11.0 ×10⁹/L; haemoglobin and platelets within pregnancy-adjusted range", "Leucocytosis, anaemia or thrombocytopenia", "Assesses inflammatory response and complications; use local pregnancy ranges."],
    ["Renal profile", "Creatinine within the pregnancy-adjusted laboratory range; potassium 3.5–5.0 mmol/L", "Acute kidney injury or electrolyte disturbance", "Guides fluid treatment and antimicrobial dose adjustment."],
    ["Lactate and blood cultures when systemically unwell", "Lactate below 2 mmol/L; blood cultures no growth", "Raised lactate and/or bloodstream pathogen", "Identifies sepsis severity and bacteraemia; do not delay antibiotics in an unstable patient."],
    ["Obstetric and fetal assessment", "No uterine activity; fetal assessment appropriate for gestation", "Contractions, fetal concern or threatened preterm labour", "Determines obstetric monitoring and location of care.", "specializedAdjunctive"],
    ["Renal ultrasound", "No hydronephrosis, calculus or collection", "Obstruction, stone or renal/perinephric collection", "Use for suspected obstruction, recurrent disease or failure to improve.", "firstLineImaging"],
  ],
  "adult-upper-airway-emergency": [
    ["Repeated airway examination", "Quiet breathing, normal voice and secretion handling", "Stridor, drooling, muffled voice, reduced airflow or fatigue", "The trend determines urgency; a quieter airway can mean worsening airflow, not recovery.", "specializedAdjunctive"],
    ["Continuous pulse oximetry", "Oxygen saturation 94–98% in most adults", "Falling saturation or increasing oxygen requirement", "Hypoxaemia is a late sign; do not delay definitive airway control.", "specializedAdjunctive"],
    ["Venous or arterial blood gas in severe illness", "pH 7.35–7.45; lactate below 2 mmol/L", "Acidaemia, hypercapnia or raised lactate", "Shows exhaustion or shock; sampling must not agitate the patient or delay airway control."],
    ["Full blood count and C-reactive protein", "White-cell count 4.0–11.0 ×10⁹/L; C-reactive protein below local upper limit", "Inflammatory response may support infection", "Supports cause and severity but cannot exclude dangerous supraglottic disease."],
    ["Blood cultures when febrile or septic", "No growth", "A bloodstream pathogen", "Collect before antibiotics if this causes no delay."],
    ["Flexible nasendoscopy", "Patent supraglottis and larynx", "Oedema, pooling, mass or foreign body", "Experienced ear, nose and throat assessment only where immediate rescue-airway capability exists.", "specializedAdjunctive"],
    ["Chest radiograph", "No aspiration, collapse or pulmonary oedema", "Aspiration, secondary lung pathology or radiopaque foreign body", "Use after stabilisation when lower respiratory complications are suspected.", "firstLineImaging"],
    ["Contrast computed tomography of the neck", "Patent airway without deep-neck collection", "Abscess, mass, oedema or foreign body", "Only in a stable patient after airway-team agreement; never delay airway control.", "advancedImaging"],
  ],
  "antimicrobial-allergy-penicillin-delabelling": [
    ["Structured drug-allergy history", "No reproducible immune-type reaction", "Timing and phenotype compatible with immediate or delayed allergy", "Record drug, route, indication, dose timing, number of doses, reaction, treatment and outcome.", "specializedAdjunctive"],
    ["Clinical examination during an acute reaction", "No urticaria, mucosal lesion, bronchospasm or circulatory compromise", "Objective skin, airway, breathing, circulation or organ involvement", "Defines severity and whether the acute anaphylaxis or severe cutaneous reaction pathway is required.", "specializedAdjunctive"],
    ["Acute mast-cell tryptase after suspected anaphylaxis", "Within the laboratory reference interval", "A time-related rise can support mast-cell activation", "Take using the anaphylaxis sampling schedule; a normal result does not exclude anaphylaxis."],
    ["Baseline mast-cell tryptase", "Within the laboratory reference interval", "Persistent elevation needs specialist interpretation", "Provides the comparator for the acute sample and can identify a need for further specialist work-up."],
    ["Specialist skin-prick testing", "Negative validated control-adjusted response", "Positive validated response to the suspected medicine", "Only an allergy service should select reagents and interpret the result.", "specializedAdjunctive"],
    ["Specialist intradermal or patch testing", "Negative validated response", "A positive response compatible with the phenotype", "Used selectively by specialists; not appropriate for every reaction.", "specializedAdjunctive"],
    ["Supervised drug provocation", "No objective reaction during the protocol", "Reproducible objective reaction", "Selected specialist confirmation test; do not use after severe delayed reactions.", "specializedAdjunctive"],
  ],
  "adhd-recognition-assessment-shared-care": [
    ["Specialist diagnostic interview", "Age-appropriate attention, activity and impulse control", "Persistent symptoms causing impairment in more than one important setting", "Diagnosis requires a full clinical and psychosocial assessment; rating scales alone are insufficient.", "specializedAdjunctive"],
    ["Multi-informant reports and rating scales", "Scores below validated concern thresholds with no cross-setting impairment", "Concordant functional impairment reported by home and education or work", "Supports but does not replace clinical diagnosis.", "specializedAdjunctive"],
    ["Developmental, psychiatric and substance-use assessment", "No alternative disorder or high-risk substance pattern explaining symptoms", "Coexisting or alternative neurodevelopmental, mood, sleep or substance-use condition", "Changes the treatment plan and urgency.", "specializedAdjunctive"],
    ["Physical examination", "No neurological, thyroid or dysmorphic abnormality", "Findings suggesting another diagnosis or comorbidity", "Direct targeted investigation or referral rather than routine broad testing.", "specializedAdjunctive"],
    ["Height, weight and body-mass index", "Tracking expected age- and sex-adjusted centiles", "Growth faltering, weight loss or obesity", "Record before medicine and monitor during treatment.", "specializedAdjunctive"],
    ["Pulse and blood pressure", "Within age-appropriate centiles or adult reference range", "Persistent tachycardia or hypertension", "Record before medicine; seek specialist advice for significant abnormalities.", "specializedAdjunctive"],
    ["Cardiovascular history and examination", "No exertional syncope, concerning family history, murmur or heart-failure sign", "A concerning symptom, family history or examination finding", "Obtain cardiology advice before stimulant treatment when indicated.", "specializedAdjunctive"],
    ["Electrocardiogram when clinically indicated", "Sinus rhythm with intervals in the age-appropriate range", "Conduction, rhythm or repolarisation abnormality", "Not routine when cardiovascular history and examination are normal; use for a clinical indication.", "firstLineImaging"],
  ],
  "autism-early-recognition-referral": [
    ["Multidisciplinary autism assessment", "Age-appropriate reciprocal social communication and flexible behaviour", "Persistent social-communication differences with restricted or repetitive behaviour", "Integrates developmental history, observation and information across settings.", "specializedAdjunctive"],
    ["Developmental and medical history", "Milestones achieved in the expected sequence without regression", "Delay, uneven profile or loss of previously acquired skills", "Regression changes urgency and the differential diagnosis.", "specializedAdjunctive"],
    ["Direct observation across contexts", "Age-appropriate interaction, communication and play", "Consistent qualitative differences in interaction, communication or behaviour", "Do not rely on one brief encounter or one screening tool.", "specializedAdjunctive"],
    ["Hearing assessment", "Hearing thresholds appropriate for age", "Hearing loss or conductive deficit", "Excludes a remediable contributor to communication difficulty.", "specializedAdjunctive"],
    ["Vision assessment", "Visual function appropriate for age", "Visual impairment", "Identifies a sensory cause or comorbidity that changes support.", "specializedAdjunctive"],
    ["Physical and neurological examination", "No focal neurology, dysmorphism or abnormal head growth", "Neurological sign, dysmorphism or growth abnormality", "Directs genetic, neurological or metabolic referral.", "specializedAdjunctive"],
    ["Genetic testing when clinically indicated", "No pathogenic finding", "Pathogenic or likely pathogenic finding relevant to the phenotype", "Use when the multidisciplinary team identifies dysmorphism, intellectual disability or a syndrome pattern.", "laboratory"],
    ["Electroencephalography when seizures are suspected", "No epileptiform abnormality", "Epileptiform activity or captured seizure", "Not routine for autism; use for suspected epilepsy or episodic regression.", "specializedAdjunctive"],
  ],
  "bronchiolitis-assessment-admission-discharge": [
    ["Pulse oximetry", "Oxygen saturation at least 92% in air", "Persistent saturation below the age/risk admission threshold", "Measure in every child; interpret with work of breathing, feeding, age and comorbidity.", "specializedAdjunctive"],
    ["Respiratory rate and work of breathing", "Age-appropriate rate without recession, grunting or apnoea", "Tachypnoea, recession, grunting, exhaustion or apnoea", "Determines severity and need for admission or respiratory support.", "specializedAdjunctive"],
    ["Hydration and feeding assessment", "Adequate intake and urine output", "Reduced intake, dehydration or inability to feed safely", "Determines oral, nasogastric or intravenous fluid support.", "specializedAdjunctive"],
    ["Apnoea observation in young or high-risk infants", "No apnoeic episode", "Observed or reported apnoea", "Apnoea is an admission and escalation feature even without marked wheeze.", "specializedAdjunctive"],
    ["Blood gas in impending respiratory failure", "pH 7.35–7.45 without carbon-dioxide retention", "Acidaemia or rising carbon dioxide", "Reserve for severe deterioration; do not use routinely."],
    ["Chest radiograph only when an alternative diagnosis or intensive care is considered", "No focal consolidation, collapse or air leak", "Focal disease, collapse or complication", "Routine radiography can mimic pneumonia and lead to unnecessary antibiotics.", "firstLineImaging"],
    ["Viral testing only for cohorting or local infection-control need", "No respiratory virus detected", "Respiratory virus detected", "Does not usually change individual treatment; follow local infection-control policy."],
  ],
  "child-safeguarding-recognition-escalation": [
    ["Separate, verbatim clinical history", "History is developmentally plausible and consistent across accounts", "Inconsistent, changing, delayed or developmentally implausible explanation", "Record exact words and who was present; do not conduct a forensic interview.", "specializedAdjunctive"],
    ["Full top-to-toe examination and body map", "No unexplained injury or neglect feature", "Patterned, multiple, protected-site or different-age injuries", "Document size, site, colour and morphology; use medical photography under policy.", "specializedAdjunctive"],
    ["Growth and nutritional assessment", "Growth tracks expected centiles", "Faltering growth, dehydration or nutritional deficiency", "Identifies neglect or medical mimics and immediate care needs.", "specializedAdjunctive"],
    ["Full blood count and coagulation screen for unexplained bruising", "Platelets 150–400 ×10⁹/L with coagulation times in the laboratory range", "Thrombocytopenia or coagulation abnormality, or normal tests despite suspicious bruising", "Investigates bleeding disorders without allowing normal results to exclude inflicted injury."],
    ["Skeletal survey under the paediatric radiology protocol", "No fracture", "Occult, multiple or different-age fractures", "Use when abuse is suspected in the age group specified by the local child-protection imaging protocol.", "firstLineImaging"],
    ["Computed tomography or magnetic resonance imaging of the head", "No intracranial injury", "Haemorrhage, oedema, hypoxic injury or fracture", "Urgent imaging for neurological signs or suspected abusive head trauma; follow the paediatric pathway.", "advancedImaging"],
    ["Specialist ophthalmology examination", "No retinal haemorrhage or ocular injury", "Retinal haemorrhage or other ocular trauma", "Arrange promptly when abusive head trauma is suspected.", "specializedAdjunctive"],
    ["Abdominal injury screen and imaging", "Liver enzymes, pancreatic enzymes and urinalysis within local paediatric ranges", "Biochemical or clinical evidence of occult abdominal injury", "Escalate to paediatric surgery and image according to findings.", "advancedImaging"],
  ],
  "diabetic-foot-infection": [
    ["Clinical wound and infection-severity examination", "No erythema, warmth, tenderness, swelling or purulence", "At least two local inflammatory features; systemic features indicate severe infection", "Classify severity with the IWGDF/IDSA system and document wound depth, necrosis and systemic physiology.", "specializedAdjunctive"],
    ["Perfusion assessment", "Palpable pulses with reassuring Doppler waveforms and toe pressure", "Absent pulses or abnormal perfusion tests", "Urgent vascular review when infection coexists with ischaemia.", "specializedAdjunctive"],
    ["Probe-to-bone test", "Bone not contacted", "Hard or gritty bone contacted through the ulcer", "Combine with radiography and inflammatory markers when osteomyelitis is suspected.", "specializedAdjunctive"],
    ["Full blood count and inflammatory markers", "White-cell count 4.0–11.0 ×10⁹/L; inflammatory markers below local upper limits", "Leucocytosis and/or raised C-reactive protein, erythrocyte sedimentation rate or procalcitonin", "Use biomarkers when the clinical examination is equivocal; they do not replace examination."],
    ["Deep tissue culture after cleansing and debridement", "No pathogenic growth", "Pathogen with susceptibility profile", "Prefer an aseptically collected tissue specimen over a superficial swab."],
    ["Plain foot radiographs", "No gas, foreign body, cortical destruction or Charcot change", "Gas, foreign body, bone destruction or another bony abnormality", "Initial imaging for suspected osteomyelitis and complications.", "firstLineImaging"],
    ["Magnetic resonance imaging", "No marrow or deep soft-tissue infection", "Marrow oedema compatible with osteomyelitis or a deep collection", "Use when osteomyelitis remains uncertain after examination, radiographs and laboratory tests.", "advancedImaging"],
    ["Positron-emission tomography, labelled-leucocyte scan or single-photon emission computed tomography", "No focal uptake compatible with infection", "Focal uptake supporting osteomyelitis", "Alternative when magnetic resonance imaging is contraindicated or unavailable.", "advancedImaging"],
    ["Bone culture", "No pathogenic growth", "Bone pathogen with susceptibility profile", "Obtain bone rather than soft tissue for suspected osteomyelitis when feasible.", "specializedAdjunctive"],
  ],
  "fournier-gangrene": [
    ["Immediate sepsis observations and lactate", "Lactate below 2 mmol/L with stable perfusion and mentation", "Shock physiology, altered mentation or raised lactate", "Start resuscitation and obtain intensive-care support without delaying surgery.", "specializedAdjunctive"],
    ["Full blood count", "White-cell count 4.0–11.0 ×10⁹/L; platelets 150–400 ×10⁹/L", "Leucocytosis or leucopenia, anaemia or thrombocytopenia", "Supports severity assessment and operative preparation."],
    ["Renal profile and glucose", "Creatinine, electrolytes and glucose within local adult ranges", "Acute kidney injury, electrolyte disturbance or hyperglycaemia", "Guides fluid, insulin and antimicrobial dosing."],
    ["C-reactive protein, coagulation screen and group-and-save", "C-reactive protein below local upper limit; coagulation times within range", "Marked inflammation, coagulopathy or transfusion requirement", "Supports severity assessment and preparation for repeated debridement."],
    ["Blood cultures", "No growth", "A bloodstream pathogen", "Take before antimicrobials if this causes no delay."],
    ["Deep operative tissue culture", "No pathogenic growth", "Polymicrobial or monomicrobial pathogen with susceptibility profile", "Collect during first debridement and narrow antimicrobials when results return.", "specializedAdjunctive"],
    ["Computed tomography of abdomen and pelvis", "No fascial gas, collection or deep extension", "Gas, fascial thickening, collection or pelvic source", "Use only when the diagnosis or extent is uncertain in a stable patient; imaging must not delay debridement.", "advancedImaging"],
    ["Bedside ultrasound when immediately available", "No subcutaneous gas or collection", "Dirty shadowing from gas or a drainable collection", "A rapid adjunct when examination is uncertain; a negative scan does not exclude necrotising infection.", "firstLineImaging"],
  ],
  "infective-endocarditis-recognition-referral": [
    ["Three sets of peripheral blood cultures", "No growth", "Typical or persistent bloodstream pathogen", "Obtain before antibiotics when stable enough; document separate venepunctures and timing."],
    ["Full blood count and inflammatory markers", "White-cell count 4.0–11.0 ×10⁹/L; inflammatory markers below local upper limits", "Anaemia, leucocytosis and raised inflammatory markers", "Supports systemic inflammation and provides a treatment baseline."],
    ["Renal profile and urinalysis", "Creatinine within local range; no blood or protein in urine", "Acute kidney injury, haematuria or proteinuria", "Detects immune or embolic renal injury and guides antimicrobial dosing."],
    ["Liver profile", "Enzymes and bilirubin within local adult ranges", "Cholestatic or hepatocellular abnormality", "Provides severity and antimicrobial-safety baseline."],
    ["Electrocardiogram", "Sinus rhythm without new conduction delay", "New atrioventricular block or other conduction change", "A new conduction abnormality can indicate peri-annular extension and needs urgent escalation.", "specializedAdjunctive"],
    ["Transthoracic echocardiography", "No vegetation, abscess or new valvular dysfunction", "Vegetation, new regurgitation, abscess or prosthetic complication", "First-line cardiac imaging; a negative study does not exclude high-probability disease.", "firstLineImaging"],
    ["Transoesophageal echocardiography", "No endocardial infection feature", "Vegetation, abscess, prosthetic or device infection", "Use when suspicion remains high, prosthetic/device infection is possible or transthoracic imaging is inadequate.", "advancedImaging"],
    ["Cardiac computed tomography angiography", "No paravalvular lesion", "Abscess, pseudoaneurysm, fistula or prosthetic complication", "Use when echocardiography is inconclusive or peri-annular anatomy needs definition.", "advancedImaging"],
    ["Fluorodeoxyglucose positron-emission tomography/computed tomography", "No pathological periprosthetic or extracardiac uptake", "Abnormal uptake supporting prosthetic infection or metastatic focus", "Use within the endocarditis-team imaging pathway, especially for prosthetic material.", "advancedImaging"],
    ["Brain and body imaging for complications", "No embolus, infarct, haemorrhage or abscess", "Embolic infarct, haemorrhage, mycotic aneurysm or metastatic infection", "Image urgently for focal symptoms and before decisions affected by neurological complications.", "advancedImaging"],
  ],
};

const meds = {
  "acute-pyelonephritis-in-pregnancy": {
    status: "source-verified", branches: [
      { label: "Pregnant, stable and able to take oral medicine", entryCriteria: "Pregnant patient with acute pyelonephritis who is clinically stable, can take oral treatment and has a specialist-approved outpatient plan" },
      { label: "Pregnant, vomiting or severely unwell", entryCriteria: "Pregnant patient who is vomiting, unable to take oral medicine or severely unwell; admit and use the hospital intravenous pathway" },
    ], note: "Review intravenous treatment by 48 hours and step down to oral treatment when possible. Check culture, allergy, renal function and the hospital antibiogram. Current live SFDA registration was not individually confirmed; check the hospital formulary.", regimens: [
      med({ indication:"Treatment of acute pyelonephritis", patientGroup:"Pregnant patient, clinically stable and able to take oral medicine", genericName:"Cefalexin", dose:"500 mg; for severe infection the source permits 1–1.5 g per dose", route:"Oral", frequency:"Twice or three times daily; severe infection three or four times daily", duration:"7–10 days", adjustments:["Use culture results to narrow treatment.","Adjust for renal impairment using the product label and local pharmacy guidance.","Check hospital formulary; current live SFDA registration was not individually confirmed."], monitoring:["Temperature, blood pressure, symptoms and oral intake within 24–48 hours.","Urine-culture result and renal function."], contraindications:["Immediate or severe cephalosporin hypersensitivity.","Use caution with a serious immediate penicillin allergy and seek microbiology advice."], branch:"Pregnant, stable and able to take oral medicine", step:"Initial antimicrobial", sourceTitle:"NICE NG111: Pyelonephritis (acute): antimicrobial prescribing", sourceUrl:"https://www.nice.org.uk/guidance/ng111/chapter/recommendations", sourceEdition:"NICE NG111, Recommendation 1.3.3, Table 2" }),
      med({ indication:"Intravenous treatment of acute pyelonephritis", patientGroup:"Pregnant patient who is vomiting, unable to take oral medicine or severely unwell", genericName:"Cefuroxime", dose:"750 mg to 1.5 g", route:"Intravenous", frequency:"Three or four times daily", duration:"Review at 48 hours; step down to oral treatment when possible to complete the specialist-defined course", adjustments:["Dose at the higher end for severe infection.","Reduce in renal impairment using the product label and pharmacy guidance.","Check hospital formulary; cefuroxime is listed in the Saudi Essential Medicines List, but current live SFDA registration was not individually confirmed."], monitoring:["Maternal observations, renal function and response at least daily.","Culture and susceptibility; fetal/obstetric status."], contraindications:["Immediate or severe cephalosporin hypersensitivity.","Use caution with a serious immediate penicillin allergy and seek microbiology advice."], branch:"Pregnant, vomiting or severely unwell", step:"Initial antimicrobial", sourceTitle:"NICE NG111: Pyelonephritis (acute): antimicrobial prescribing", sourceUrl:"https://www.nice.org.uk/guidance/ng111/chapter/recommendations", sourceEdition:"NICE NG111, Recommendation 1.3.3, Table 2" }),
    ],
  },
  "adult-upper-airway-emergency": {
    status:"source-verified", branches:[
      {label:"Anaphylaxis with upper-airway compromise",entryCriteria:"Acute airway, breathing or circulation compromise consistent with anaphylaxis"},
      {label:"Suspected bacterial epiglottitis",entryCriteria:"Stable enough for antimicrobial treatment after immediate airway-team control planning"},
    ], note:"Airway control takes priority. These branches are cause-specific and must not be combined automatically. Current live SFDA registration was not individually confirmed; check the hospital formulary.", regimens:[
      med({indication:"First-line treatment of adult anaphylaxis",patientGroup:"Adult with anaphylaxis and upper-airway compromise",genericName:"Epinephrine (adrenaline) 1 mg/mL",dose:"0.5 mg (0.5 mL)",route:"Intramuscular into the mid-anterolateral thigh",frequency:"Repeat every 5–15 minutes if airway, breathing or circulation problems persist",duration:"Continue repeated doses while the emergency response is activated; refractory cases require a monitored specialist infusion pathway",adjustments:["Use age/weight-specific dosing for children; this row is adult only.","Do not delay for intravenous access.","Check hospital formulary; current live SFDA registration was not individually confirmed."],monitoring:["Continuous airway, breathing, circulation, oxygen saturation and cardiac rhythm.","Record response and time of every dose."],contraindications:["No absolute contraindication in life-threatening anaphylaxis.","Intravenous bolus epinephrine is not this regimen and requires an experienced specialist setting."],branch:"Anaphylaxis with upper-airway compromise",step:"Immediate anaphylaxis treatment",sourceTitle:"Saudi Ministry of Health Anaphylaxis Protocol",sourceUrl:"https://www.moh.gov.sa/en/Ministry/MediaCenter/Publications/Pages/Protocols.aspx",sourceEdition:"Saudi MOH Anaphylaxis Protocol, Section emergency treatment algorithm"}),
      med({indication:"Empirical treatment after airway planning for suspected bacterial epiglottitis",patientGroup:"Adult with suspected bacterial epiglottitis",genericName:"Ceftriaxone",dose:"2 g",route:"Intravenous",frequency:"Every 24 hours",duration:"7–10 days; narrow to microbiology and specialist advice",adjustments:["Seek microbiology advice for severe beta-lactam allergy.","Review hepatic and renal function when both are severely impaired.","Ceftriaxone is listed in the Saudi Essential Medicines List; current live SFDA registration was not individually confirmed."],monitoring:["Airway status continuously; temperature and inflammatory response daily.","Blood-culture result, adverse effects and liver/renal profile."],contraindications:["Severe immediate cephalosporin hypersensitivity.","Do not delay definitive airway management to give antibiotics."],branch:"Suspected bacterial epiglottitis",step:"Empirical antimicrobial",sourceTitle:"Galway Antimicrobial Prescribing Policy: Acute Epiglottitis",sourceUrl:"https://eguides.megsupporttools.com/public/guh/respiratory-tract-infections/acute-epiglottitis",sourceEdition:"Galway guideline, Section Acute Epiglottitis, adult treatment table"}),
    ]
  },
  "antimicrobial-allergy-penicillin-delabelling": noDrug("Assessment, skin testing and drug provocation are specialist diagnostic procedures, not routine drug treatment. Treat an acute reaction through the separate anaphylaxis or severe cutaneous adverse-reaction pathway."),
  "adhd-recognition-assessment-shared-care": {
    status:"source-verified", branches:[
      {label:"Child aged 5 years or over or young person",entryCriteria:"Specialist-confirmed attention-deficit/hyperactivity disorder with persistent significant impairment after environmental modifications"},
      {label:"Adult",entryCriteria:"Specialist-confirmed attention-deficit/hyperactivity disorder with significant impairment and a documented titration/shared-care plan"},
    ], note:"Initiation and titration remain specialist-led. Use modified-release products exactly as prescribed; formulations are not automatically interchangeable. Current live SFDA registration was not individually confirmed.", regimens:[
      med({indication:"First-line pharmacological treatment",patientGroup:"Child aged 5 years or over or young person",genericName:"Modified-release methylphenidate",dose:"Start 18 mg",route:"Oral",frequency:"Once each morning",duration:"Titrate to response; maximum 54 mg daily for children on the cited Concerta XL label",adjustments:["Titrate against symptoms and adverse effects under specialist supervision.","Swallow modified-release tablets whole; do not crush or chew.","No specific renal or hepatic dosing recommendation is established in the cited label; specialist/pharmacy review is required.","Check hospital formulary; current live SFDA registration was not individually confirmed."],monitoring:["Height every 6 months; weight at the age-specific intervals in NICE NG87 Recommendation 1.8.5.","Pulse and blood pressure before and after each dose change and every 6 months.","Appetite, sleep, behaviour, tics and misuse/diversion risk."],contraindications:["Severe cardiovascular disease, severe hypertension, glaucoma, phaeochromocytoma, hyperthyroidism or thyrotoxicosis.","Current monoamine-oxidase inhibitor use or use within 14 days.","Specialist review for psychosis, mania, seizures or significant substance-use risk."],branch:"Child aged 5 years or over or young person",step:"First-line stimulant",sourceTitle:"Concerta XL summary of product characteristics",sourceUrl:"https://www.medicines.org.uk/emc/product/314/smpc",sourceEdition:"Concerta XL SmPC, Sections 4.2–4.4; NICE NG87, Recommendations 1.7.7 and 1.8.5–1.8.11"}),
      med({indication:"First-line pharmacological treatment",patientGroup:"Adult",genericName:"Lisdexamfetamine",dose:"Start 30 mg; 20 mg may be used when a lower initial dose is appropriate",route:"Oral",frequency:"Once each morning",duration:"Increase by 10 mg or 20 mg at approximately weekly intervals; maximum 70 mg daily; stop if symptoms do not improve after an appropriate 1-month trial",adjustments:["Use the lowest effective dose and specialist titration.","Severe renal impairment may require a lower maximum according to the product label.","Check hospital formulary; current live SFDA registration was not individually confirmed."],monitoring:["Pulse and blood pressure before and after each dose change and every 6 months.","Weight every 6 months in adults.","Sleep, psychiatric symptoms and misuse/diversion risk."],contraindications:["Symptomatic cardiovascular disease, moderate-to-severe hypertension, hyperthyroidism, glaucoma or phaeochromocytoma.","Current monoamine-oxidase inhibitor use or use within 14 days.","Specialist review for psychosis, mania or significant substance-use risk."],branch:"Adult",step:"Choose one first-line stimulant",selection:"one-of",preferred:true,useWhen:"Use when the specialist selects lisdexamfetamine as the first-line stimulant.",sourceTitle:"Elvanse summary of product characteristics",sourceUrl:"https://www.medicines.org.uk/emc/product/14089/smpc",sourceEdition:"Elvanse SmPC, Sections 4.2–4.4; NICE NG87, Recommendation 1.7.11"}),
      med({indication:"First-line pharmacological treatment",patientGroup:"Adult",genericName:"Modified-release methylphenidate",dose:"Start 18 mg",route:"Oral",frequency:"Once each morning",duration:"Titrate to response; maximum 72 mg daily for adults on the cited Concerta XL label",adjustments:["Titrate against symptoms and adverse effects under specialist supervision.","Swallow modified-release tablets whole; do not crush or chew.","Check hospital formulary; current live SFDA registration was not individually confirmed."],monitoring:["Pulse and blood pressure before and after each dose change and every 6 months.","Weight every 6 months in adults.","Sleep, psychiatric symptoms and misuse/diversion risk."],contraindications:["Severe cardiovascular disease, severe hypertension, glaucoma, phaeochromocytoma, hyperthyroidism or thyrotoxicosis.","Current monoamine-oxidase inhibitor use or use within 14 days."],branch:"Adult",step:"Choose one first-line stimulant",selection:"one-of",preferred:false,useWhen:"Use when the specialist selects methylphenidate based on patient preference, response, duration profile or adverse-effect considerations.",sourceTitle:"Concerta XL summary of product characteristics",sourceUrl:"https://www.medicines.org.uk/emc/product/314/smpc",sourceEdition:"Concerta XL SmPC, Sections 4.2–4.4; NICE NG87, Recommendation 1.7.11"}),
    ]
  },
  "autism-early-recognition-referral": noDrug("Do not use medication for the core features of autism. Treat epilepsy, sleep disorder, attention-deficit/hyperactivity disorder, anxiety or severe behaviour only through the relevant separate condition-specific pathway."),
  "bronchiolitis-assessment-admission-discharge": noDrug("Routine salbutamol, ipratropium, corticosteroids, nebulised adrenaline and antibiotics are not indicated for bronchiolitis. Management is supportive: oxygen when the guideline threshold is met, suction when secretions impair feeding or breathing, and enteral or intravenous fluids when intake is inadequate."),
  "child-safeguarding-recognition-escalation": noDrug("Safeguarding assessment has no routine medication regimen. Treat each injury, pain, infection, poisoning or mental-health emergency through its condition-specific pathway while preserving forensic evidence and child protection processes."),
};

// Reuse the already governed diabetic-foot antimicrobial pathway, retaining every dose and source.
const dfi = JSON.parse(fs.readFileSync(path.join(DIR, "diabetic-foot-risk-stratification-and-ulcer-referral.pathway-2026-10-18-v1.json"), "utf8"));
meds["diabetic-foot-infection"] = {
  ...dfi.medicationPlan,
  note: `${dfi.medicationPlan.note} Do not treat a clinically uninfected ulcer with antibiotics. Soft-tissue infection is usually treated for 1–2 weeks; the IWGDF/IDSA guideline permits up to 3–4 weeks when infection is extensive, resolves slowly or severe peripheral artery disease is present. Current live SFDA registration was not individually confirmed; check the hospital formulary.`,
};

meds["fournier-gangrene"] = {
  status:"source-verified", branches:[{label:"Suspected Fournier gangrene or necrotising infection",entryCriteria:"Clinical suspicion of perineal necrotising soft-tissue infection; start immediately with resuscitation and urgent debridement"}],
  note:"Antibiotics never replace urgent surgical debridement. Obtain blood and deep tissue cultures without delaying treatment, then narrow with microbiology. Doses below require renal adjustment and local critical-care/pharmacy review. Listed agents appear in the Saudi Essential Medicines List; current live SFDA registration was not individually confirmed.", regimens:[
    med({indication:"Broad Gram-positive, Gram-negative and anaerobic cover",patientGroup:"Adult with suspected Fournier gangrene",genericName:"Piperacillin with tazobactam",dose:"4.5 g",route:"Intravenous infusion",frequency:"Every 6–8 hours according to the local severe-infection protocol",duration:"Continue empirically until source control and culture review; infectious-diseases/microbiology team defines total duration",adjustments:["Reduce dose or extend interval in renal impairment according to the product label and pharmacy guidance.","Check hospital formulary and the local antibiogram."],monitoring:["Renal function, electrolytes, liver profile and full blood count daily in critical illness.","Clinical response and operative findings after every debridement."],contraindications:["Immediate or severe penicillin/beta-lactam hypersensitivity.","Use caution with high sodium load or severe renal impairment."],branch:"Suspected Fournier gangrene or necrotising infection",step:"Broad-spectrum backbone",sourceTitle:"IDSA Skin and Soft Tissue Infection Guideline",sourceUrl:"https://www.idsociety.org/practice-guideline/skin-and-soft-tissue-infections/",sourceEdition:"IDSA SSTI Guideline 2014, Recommendation VIII.4"}),
    med({indication:"Empirical methicillin-resistant Staphylococcus aureus cover",patientGroup:"Adult with suspected Fournier gangrene",genericName:"Vancomycin",dose:"15–20 mg/kg per dose using actual body weight",route:"Intravenous infusion",frequency:"Every 8–12 hours initially; individualise by renal function and therapeutic drug monitoring",duration:"Continue until cultures and clinical assessment allow narrowing",adjustments:["Use pharmacy-led area-under-the-curve or local therapeutic drug monitoring.","Reduce or extend interval in renal impairment; account for renal replacement therapy.","Infuse at the product-label rate to reduce infusion reactions."],monitoring:["Serum concentrations using the local protocol, renal function and urine output.","Infusion reaction, hearing symptoms and full blood count during prolonged therapy."],contraindications:["Serious vancomycin hypersensitivity.","Use enhanced caution with acute kidney injury or other nephrotoxins."],branch:"Suspected Fournier gangrene or necrotising infection",step:"Empirical resistant Gram-positive cover",sourceTitle:"IDSA Skin and Soft Tissue Infection Guideline",sourceUrl:"https://www.idsociety.org/practice-guideline/skin-and-soft-tissue-infections/",sourceEdition:"IDSA SSTI Guideline 2014, Recommendation VIII.4"}),
  ]
};

meds["infective-endocarditis-recognition-referral"] = {
  status:"source-verified", branches:[
    {label:"Oral streptococcus or Streptococcus gallolyticus native-valve endocarditis",entryCriteria:"Susceptible isolate and endocarditis-team confirmation of native-valve infection"},
    {label:"Methicillin-resistant Staphylococcus aureus native-valve endocarditis",entryCriteria:"Confirmed methicillin-resistant Staphylococcus aureus native-valve infection"},
    {label:"Enterococcus native-valve endocarditis",entryCriteria:"Confirmed Enterococcus species susceptible to the selected beta-lactam; endocarditis-team selection"},
  ], note:"Obtain three blood-culture sets before antibiotics when the patient is stable enough. Empirical therapy depends on native/prosthetic valve, acquisition setting, prior antibiotics and local resistance and must follow the endocarditis team. The regimens shown are selected organism-directed pathways from ESC Tables 7–10. Current live SFDA registration was not individually confirmed; check the hospital formulary.", regimens:[
    med({indication:"Organism-directed treatment",patientGroup:"Adult with susceptible oral-streptococcal or Streptococcus gallolyticus native-valve endocarditis",genericName:"Ceftriaxone",dose:"2 g",route:"Intravenous",frequency:"Once daily",duration:"4 weeks for native-valve endocarditis; 6 weeks for prosthetic-valve endocarditis",adjustments:["Confirm organism and susceptibility with microbiology.","Review hepatic and renal function when both are severely impaired.","Ceftriaxone is listed in the Saudi Essential Medicines List; current live SFDA registration was not individually confirmed."],monitoring:["Blood cultures until clearance, temperature and inflammatory response.","Full blood count, renal/liver profile and echocardiographic complications."],contraindications:["Severe immediate cephalosporin hypersensitivity.","Do not use this branch for resistant isolates or an unconfirmed organism."],branch:"Oral streptococcus or Streptococcus gallolyticus native-valve endocarditis",step:"Definitive antimicrobial",sourceTitle:"2023 ESC Guidelines for the management of endocarditis",sourceUrl:"https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/endocarditis/",sourceEdition:"2023 ESC Endocarditis Guideline, Section 7.2, Table 7, pp. 67–68"}),
    med({indication:"Organism-directed treatment",patientGroup:"Adult with methicillin-resistant Staphylococcus aureus native-valve endocarditis",genericName:"Vancomycin",dose:"30–60 mg/kg/day",route:"Intravenous",frequency:"Divide into 2–3 doses and individualise by therapeutic drug monitoring",duration:"4–6 weeks",adjustments:["Use pharmacy-led therapeutic drug monitoring and renal adjustment.","Account for obesity, unstable renal function and renal replacement therapy.","Vancomycin is listed in the Saudi Essential Medicines List; current live SFDA registration was not individually confirmed."],monitoring:["Blood cultures until clearance and serum vancomycin exposure using the local protocol.","Renal function and urine output at least daily during instability."],contraindications:["Serious vancomycin hypersensitivity.","Use enhanced caution with acute kidney injury or concurrent nephrotoxins."],branch:"Methicillin-resistant Staphylococcus aureus native-valve endocarditis",step:"Definitive antimicrobial",sourceTitle:"2023 ESC Guidelines for the management of endocarditis",sourceUrl:"https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/endocarditis/",sourceEdition:"2023 ESC Endocarditis Guideline, Section 7.4, Table 8, pp. 68–70"}),
    med({indication:"Cell-wall active component of definitive dual beta-lactam treatment",patientGroup:"Adult with Enterococcus native-valve endocarditis",genericName:"Ampicillin",dose:"12 g/day",route:"Intravenous",frequency:"Divide into 4–6 doses",duration:"6 weeks with ceftriaxone",adjustments:["Adjust for renal impairment with pharmacy/microbiology advice.","Confirm species and susceptibility.","Check hospital formulary; current live SFDA registration was not individually confirmed."],monitoring:["Blood cultures until clearance, renal/liver profile and full blood count.","Hypersensitivity and sodium load."],contraindications:["Immediate or severe penicillin hypersensitivity.","Do not use without the paired ceftriaxone in this branch."],branch:"Enterococcus native-valve endocarditis",step:"Dual beta-lactam regimen",selection:"all",sourceTitle:"2023 ESC Guidelines for the management of endocarditis",sourceUrl:"https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/endocarditis/",sourceEdition:"2023 ESC Endocarditis Guideline, Section 7.8, Table 10, pp. 70–71"}),
    med({indication:"Second component of definitive dual beta-lactam treatment",patientGroup:"Adult with Enterococcus native-valve endocarditis",genericName:"Ceftriaxone",dose:"4 g/day",route:"Intravenous",frequency:"Divide into 2 doses",duration:"6 weeks with ampicillin",adjustments:["Review hepatic and renal function when both are severely impaired.","Confirm species and susceptibility.","Ceftriaxone is listed in the Saudi Essential Medicines List; current live SFDA registration was not individually confirmed."],monitoring:["Blood cultures until clearance, liver profile and full blood count.","Biliary adverse effects and hypersensitivity."],contraindications:["Severe immediate cephalosporin hypersensitivity.","Do not use as monotherapy in this Enterococcus branch."],branch:"Enterococcus native-valve endocarditis",step:"Dual beta-lactam regimen",selection:"all",sourceTitle:"2023 ESC Guidelines for the management of endocarditis",sourceUrl:"https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/endocarditis/",sourceEdition:"2023 ESC Endocarditis Guideline, Section 7.8, Table 10, pp. 70–71"}),
  ]
};

panels["bronchiolitis-infant-distress"] = panels["bronchiolitis-assessment-admission-discharge"];
panels["child-safeguarding-non-accidental-injury"] = panels["child-safeguarding-recognition-escalation"];
panels["infective-endocarditis"] = panels["infective-endocarditis-recognition-referral"];
meds["bronchiolitis-infant-distress"] = meds["bronchiolitis-assessment-admission-discharge"];
meds["child-safeguarding-non-accidental-injury"] = meds["child-safeguarding-recognition-escalation"];
meds["infective-endocarditis"] = meds["infective-endocarditis-recognition-referral"];

const generated = [];
for (const [slug, edition, url] of topics) {
  const oldFile = path.join(DIR, `${slug}.${OLD}.json`);
  const content = JSON.parse(fs.readFileSync(oldFile, "utf8"));
  content.version = VERSION;
  content.status = "under_review";
  content.clinicalReviewStatus = "pending";
  content.lastReviewed = DATE;
  const rows = panels[slug].map(([name, normal, finding, meaning, tier]) => inv(name, normal, finding, meaning, edition, url, tier));
  content.investigations = { ruleIn: rows.slice(0, Math.max(1, rows.length - 2)), ruleOut: rows.slice(Math.max(1, rows.length - 2)) };
  content.medicationPlan = meds[slug];
  content.evidenceAudit = {
    ...content.evidenceAudit, checkedOn: DATE, status: "incomplete",
    findings: ["Rebuilt against the approved-topic structure: a tiered investigation panel, time-ordered management and an explicit medicine decision pathway.", "Every investigation row includes a reference or normal state, condition finding and next action.", "Previous outline and published rows remain preserved; this additive version is pending clinical review."],
    unverifiedSections: ["No topic-specific Saudi national guideline was found in the opened Saudi Ministry of Health protocol index unless a Saudi source is explicitly cited in the medicine row.", "Current live Saudi Food and Drug Authority product registration was not individually confirmed; clinicians must check the hospital formulary.", "Local antibiogram, resistance pattern, shared-care agreement and imaging availability require site-level confirmation where relevant."],
  };
  content.teaching.references = [...new Map([...(content.teaching.references ?? []), {title: edition.split(",")[0], edition, url, locator: edition}].map((x) => [x.url, x])).values()];
  content.teaching.pitfalls = ["Stopping after a short outline instead of documenting the full investigation pathway.", "Using a medicine row without checking the branch, allergy, organ function, culture result and local formulary.", "Mistaking publication status for clinical approval; this version remains pending until a clinician approves it."];
  const out = path.join(DIR, `${slug}.${VERSION}.json`);
  fs.writeFileSync(out, JSON.stringify(content, null, 2) + "\n");
  generated.push(content);
  console.log(out);
}

if (process.argv.includes("--apply")) {
  const endpoint = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!endpoint || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");
  const db = createClient(endpoint, key, { auth: { persistSession: false } });
  for (const content of generated) {
    const { data: existing, error: existingError } = await db.from("guideline_versions").select("id").eq("guideline_id", content.id).eq("version", VERSION);
    if (existingError) throw existingError;
    if (existing?.length) { console.log(`SKIP ${content.title}: ${VERSION} already exists`); continue; }
    const { data: source, error: sourceError } = await db.from("guideline_versions").select("jurisdiction,created_by").eq("guideline_id", content.id).order("created_at", { ascending: false }).limit(1).single();
    if (sourceError) throw sourceError;
    const primary = content.teaching.references[0];
    const { error } = await db.from("guideline_versions").insert({
      id: randomUUID(), guideline_id: content.id, version: VERSION, version_number: VERSION,
      status: "under_review", is_current: false, content,
      source_title: primary.title, issuing_organization: "Marifa evidence synthesis",
      source_url: primary.url, jurisdiction: source.jurisdiction ?? "Saudi Arabia",
      last_verified_date: DATE, review_date: DATE, created_by: source.created_by,
      approved_by: null, approved_at: null, published_at: null,
      change_summary: "Additive full rebuild replacing the withdrawn thin outline: expanded investigations and explicit medicine pathways using the approved-topic format. Historical versions preserved; clinical review pending.",
    });
    if (error) throw error;
    console.log(`STAGED ${content.id}:${VERSION}`);
  }
}
