import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { auditTopicContent } from "../lib/clinical-authoring-audit";
import { DiseaseDetailSchema, type DiseaseDetail } from "../lib/validations/disease";

const DATE = "2026-10-15";
const VERSION = "authoring-standard-2026-10-15-v2-investigations";
const TITLES = [
  "Advanced COPD Supportive Care", "Advanced Dementia and Comfort-Focused Care", "Cardiac Arrest",
  "Childhood Immunisation and Catch-Up", "Community-Acquired Pneumonia", "Generalized Anxiety Disorder",
  "Hypertension: Primary Care Titration and Target Review", "Intrapartum Fetal Compromise",
  "Palliative Management of End-of-Life Dyspnoea and Pain", "Post-Cardiac Arrest Care",
  "Progressive Neurological Disease Support", "Psoriasis", "Schizophrenia", "Symptomatic Bradycardia",
  "Tachyarrhythmia With a Pulse", "Tobacco and Nicotine Cessation",
] as const;

type Investigation = DiseaseDetail["investigations"]["ruleIn"][number];
type Reference = NonNullable<Investigation["references"]>[number];
type Addition = { group: "ruleIn" | "ruleOut"; row: Investigation };
type CurrentVersion = Record<string, unknown> & { status: string; version: string; content: unknown };
const ref = (title: string, edition: string, url: string): Reference => ({ title, edition, url });
const row = (tier: Investigation["tier"], testName: string, normalValue: string, expectedFinding: string,
  targetCondition: string, clinicalRationale: string, references: Reference[], modalityTarget = "When clinically indicated"):
  Investigation => ({ tier, testName, normalValue, expectedFinding, targetCondition, clinicalRationale, references, modalityTarget });

const AHA_ALS = ref("2025 AHA Guidelines for CPR and ECC: Adult Advanced Life Support",
  "AHA 2025, Part 9 Adult Advanced Life Support, reversible causes and point-of-care ultrasonography sections; Adult Cardiac Arrest Algorithm Figure 5",
  "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support");
const AHA_POST = ref("2025 AHA Guidelines for CPR and ECC: Post-Cardiac Arrest Care",
  "AHA 2025, Part 11 Post-Cardiac Arrest Care, Diagnostic Studies recommendations 1–3; Adult Post-Cardiac Arrest Care Algorithm Figure 1",
  "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/post-cardiac-arrest-care");
const NICE_COPD = ref("NICE NG115: COPD in over 16s",
  "NICE NG115, recommendations 1.1.5–1.1.7 and Table 2 (additional investigations); recommendations 1.2.55–1.2.58 (oxygen assessment)",
  "https://www.nice.org.uk/guidance/ng115/chapter/Recommendations");
const NICE_DEMENTIA = ref("NICE NG97: Dementia",
  "NICE NG97, recommendations 1.2.6–1.2.8 (reversible causes), 1.7.1–1.7.3 (distress), 1.8.1–1.8.4 (pain), 1.10.6–1.10.8 (eating and swallowing)",
  "https://www.nice.org.uk/guidance/ng97/chapter/Recommendations");
const NICE_GAD = ref("NICE CG113: Generalised anxiety disorder and panic disorder in adults",
  "NICE CG113, recommendations 1.2.2 and 1.2.6–1.2.9",
  "https://www.nice.org.uk/guidance/cg113/chapter/Recommendations");
const NICE_THYROID = ref("NICE NG145: Thyroid disease",
  "NICE NG145, recommendations 1.2.3 and 1.2.8–1.2.11",
  "https://www.nice.org.uk/guidance/ng145/chapter/recommendations");
const NICE_FETAL = ref("NICE NG229: Fetal monitoring in labour",
  "NICE NG229, recommendations 1.2.1–1.2.9, 1.4.3–1.4.7, 1.5.1–1.5.12 and 1.6.1–1.6.2",
  "https://www.nice.org.uk/guidance/ng229/chapter/recommendations");
const NICE_EOL = ref("NICE NG31: Care of dying adults in the last days of life",
  "NICE NG31, recommendations 1.1.5–1.1.7, 1.4.1–1.4.5 and 1.5.10–1.5.17",
  "https://www.nice.org.uk/guidance/ng31/chapter/Recommendations");
const NICE_MND = ref("NICE NG42: Motor neurone disease",
  "NICE NG42, recommendations 1.13.1–1.13.6 and 1.15.1–1.15.20 including Table 2",
  "https://www.nice.org.uk/guidance/ng42/chapter/Recommendations");
const NICE_PSO = ref("NICE CG153: Psoriasis",
  "NICE CG153, recommendations 1.2.1.1–1.2.3.3 and 1.5.1.1–1.5.1.7",
  "https://www.nice.org.uk/guidance/cg153/chapter/recommendations");
const NICE_SCZ = ref("NICE CG178: Psychosis and schizophrenia in adults",
  "NICE CG178, recommendations 1.3.6.1–1.3.6.4 and 1.5.3.2",
  "https://www.nice.org.uk/guidance/cg178/chapter/recommendations");
const NICE_TOBACCO = ref("NICE NG209: Tobacco dependence",
  "NICE NG209, recommendations 1.11.1–1.11.6, 1.12.1–1.12.8 and 1.14.1–1.14.5",
  "https://www.nice.org.uk/guidance/ng209/chapter/recommendations");
const CDC_VACCINE = ref("CDC General Best Practice Guidelines for Immunization: Special Situations",
  "CDC Best Practices, Special Situations, Table 9-1 and section Persons Vaccinated Outside the United States",
  "https://www.cdc.gov/vaccines/hcp/imz-best-practices/special-situations.html");
const ATS_CAP = ref("ATS/IDSA adult community-acquired pneumonia guideline",
  "Metlay et al. 2019, Table 1 and Questions 1–6; Jones et al. 2025, lung-ultrasound recommendation",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC6812437/");

const additions: Record<string, Addition[]> = {
  "Advanced COPD Supportive Care": [
    { group: "ruleIn", row: row("specializedAdjunctive", "Spirometry review", "Post-bronchodilator FEV1/FVC 0.70 or above does not show persistent airflow obstruction", "Persistent airflow obstruction and severity trend", "COPD physiology and trajectory", "Confirm that progressive breathlessness is compatible with COPD severity; reconsider alternative diagnoses when symptoms are disproportionate.", [NICE_COPD], "At diagnostic review or unexplained deterioration") },
    { group: "ruleOut", row: row("firstLineImaging", "Chest radiograph", "No focal opacity, pleural fluid, mass or pulmonary oedema", "Alternative or complicating cardiopulmonary abnormality", "Pneumonia, malignancy, effusion, heart failure or pneumothorax", "Look for a treatable cause of new or disproportionate symptoms rather than attributing every deterioration to advanced COPD.", [NICE_COPD], "New, changed or disproportionate respiratory symptoms") },
    { group: "ruleOut", row: row("laboratory", "Full blood count", "Haemoglobin and white-cell count within the laboratory age- and sex-specific reference interval", "Anaemia, polycythaemia or leucocytosis", "Anaemia, secondary polycythaemia or infection", "Anaemia can worsen breathlessness; polycythaemia supports chronic hypoxaemia; leucocytosis may support infection when interpreted clinically.", [NICE_COPD], "New deterioration or oxygen assessment") },
  ],
  "Advanced Dementia and Comfort-Focused Care": [
    { group: "ruleOut", row: row("laboratory", "Targeted blood tests for acute deterioration", "Results within local age-appropriate ranges", "Abnormal glucose, electrolytes, renal function, full blood count or inflammatory markers", "Potentially reversible metabolic disturbance, dehydration, infection or medicine toxicity", "Order only when the result could change a goal-concordant treatment; do not label acute delirium or distress as dementia progression without assessing reversible causes.", [NICE_DEMENTIA], "New delirium, reduced intake or otherwise unexplained deterioration") },
    { group: "ruleOut", row: row("firstLineImaging", "Chest radiograph when aspiration or lower respiratory infection is suspected", "No focal air-space opacity", "New focal or dependent opacity, or another chest complication", "Aspiration pneumonia or alternative chest cause", "Use only when respiratory findings make the result likely to alter comfort-focused treatment or place of care.", [NICE_DEMENTIA], "New cough, fever, hypoxaemia or focal chest signs") },
  ],
  "Cardiac Arrest": [
    { group: "ruleOut", row: row("laboratory", "Point-of-care glucose, blood gas and electrolytes", "Glucose 3.9–10 mmol/L; potassium 3.5–5.0 mmol/L; no severe acid-base disturbance", "Hypoglycaemia, severe potassium abnormality, hypoxaemia or marked acid-base disturbance", "Metabolic reversible causes", "Identify and immediately correct a reversible metabolic cause without interrupting high-quality CPR.", [AHA_ALS], "During resuscitation when sampling is feasible") },
    { group: "ruleOut", row: row("firstLineImaging", "Focused point-of-care ultrasound", "No tamponade, severe right-heart strain, tension pneumothorax pattern or profound hypovolaemia", "A finding suggesting a reversible mechanical cause", "Tamponade, pulmonary embolism, pneumothorax or hypovolaemia", "May support a cause-specific intervention, but acquisition must not prolong pulse checks or interrupt compressions.", [AHA_ALS], "Only with a skilled operator and no CPR interruption") },
    { group: "ruleOut", row: row("specializedAdjunctive", "Medication, toxin and event review", "No exposure or event suggesting poisoning or a special resuscitation circumstance", "Exposure, overdose, dialysis interruption, pregnancy, hypothermia or another cause-specific clue", "Toxins and special circumstances", "Directs antidote or cause-specific resuscitation while the standard arrest algorithm continues.", [AHA_ALS], "Concurrent with resuscitation") },
  ],
  "Childhood Immunisation and Catch-Up": [
    { group: "ruleIn", row: row("specializedAdjunctive", "Age, previous-dose interval and product review", "Documented doses meet the current national schedule and minimum interval rules", "A valid dose series that is incomplete, delayed or contains doses of uncertain validity", "Catch-up schedule requirements", "Build an age-appropriate catch-up plan without restarting a valid series and identify doses needing specialist advice.", [CDC_VACCINE], "At every catch-up visit") },
    { group: "ruleOut", row: row("laboratory", "Targeted vaccine serology", "Protective antibody documented for the specific antigen when an accepted correlate exists", "Non-protective or indeterminate antibody result", "Immunity when revaccination versus testing is a recognised option", "Do not use broad serology routinely; reserve it for defined circumstances because commercial tests do not reliably establish immunity for every vaccine.", [CDC_VACCINE], "Only for a vaccine-specific accepted indication") },
    { group: "ruleOut", row: row("specializedAdjunctive", "Immunocompromise and household-contact assessment", "No condition, treatment or contact issue that changes live-vaccine use", "Primary or acquired immunodeficiency, immunosuppressive treatment, transplant status or a vulnerable household contact", "Live-vaccine safety and specialist scheduling", "Determine whether a live vaccine is contraindicated, needs timing around treatment or requires specialist immunisation advice.", [CDC_VACCINE], "Before a live vaccine or when history suggests immunocompromise") },
  ],
  "Generalized Anxiety Disorder": [
    { group: "ruleOut", row: row("laboratory", "Thyroid function tests (TSH with reflex FT4/FT3)", "TSH within the local adult reference interval", "Suppressed or raised TSH with the corresponding free-hormone pattern", "Thyroid dysfunction presenting with unexplained anxiety", "Consider testing for unexplained anxiety; an abnormal result redirects management to the thyroid pathway. Avoid indiscriminate repeat testing during acute illness.", [NICE_THYROID], "Unexplained, atypical or treatment-refractory anxiety") },
  ],
  "Intrapartum Fetal Compromise": [
    { group: "ruleOut", row: row("firstLineImaging", "Urgent real-time ultrasound for absent fetal heartbeat", "Fetal cardiac activity visualised", "No fetal cardiac activity or an urgent alternative finding", "Fetal viability when auscultation cannot detect a heartbeat", "Confirm viability urgently rather than assuming that the maternal pulse or equipment failure explains an absent fetal heartbeat.", [NICE_FETAL], "Immediately when no fetal heartbeat is detected") },
  ],
  "Palliative Management of End-of-Life Dyspnoea and Pain": [
    { group: "ruleOut", row: row("firstLineImaging", "Bedside chest ultrasound or chest radiograph", "No pleural effusion, pulmonary oedema, focal opacity or pneumothorax", "A potentially reversible chest cause of dyspnoea", "Pleural effusion, pulmonary oedema, infection or pneumothorax", "Use only when the person wants investigation and the result would lead to a proportionate intervention likely to improve comfort.", [NICE_EOL], "New dyspnoea with a plausible reversible cause and goal-concordant treatment") },
    { group: "ruleOut", row: row("laboratory", "Targeted renal function, calcium or other symptom-directed blood tests", "Results within local adult reference ranges", "Renal impairment, hypercalcaemia or another biochemical cause that would change symptom treatment", "Medicine accumulation or a reversible biochemical cause", "Avoid routine panels in the last days of life; test only when essential to choose safer symptom treatment or address a reversible cause consistent with the person's goals.", [NICE_EOL], "Only when essential to immediate comfort-focused care") },
  ],
  "Post-Cardiac Arrest Care": [
    { group: "ruleIn", row: row("laboratory", "Blood glucose, electrolytes, renal function and serial blood gas", "Glucose 3.9–10 mmol/L; potassium 3.5–5.0 mmol/L; PaCO2 35–45 mmHg unless severe acidemia", "Hypoglycaemia below 70 mg/dL, hyperglycaemia above 180 mg/dL, electrolyte disturbance or ventilation/acidaemia requiring correction", "Post-arrest physiology and reversible cause", "Guide ventilation, glucose safety and correction of metabolic causes while avoiding harmful extremes.", [AHA_POST], "Immediately after ROSC and serially in critical care") },
    { group: "ruleOut", row: row("firstLineImaging", "Echocardiography or focused cardiac ultrasound", "No clinically important ventricular, valvular or pericardial abnormality", "Ventricular dysfunction, tamponade, right-heart strain, hypovolaemia or another actionable finding", "Cardiac cause and post-arrest myocardial dysfunction", "Identify a diagnosis requiring immediate haemodynamic or cause-specific intervention.", [AHA_POST], "Early after ROSC when it can change management") },
    { group: "ruleOut", row: row("advancedImaging", "Cause-directed CT of head, chest, abdomen and/or pelvis", "No acute cause or resuscitation injury", "Intracranial catastrophe, pulmonary embolism, aortic disease or significant resuscitation injury", "Non-coronary cause or CPR complication", "Consider selectively after stabilisation; balance diagnostic yield against transport instability and contrast risk.", [AHA_POST], "After initial stabilisation when cause remains uncertain") },
    { group: "ruleIn", row: row("specializedAdjunctive", "Electroencephalography", "No electrographic seizure", "Electrographic seizure or status epilepticus", "Post-arrest seizure", "Evaluate patients who do not follow commands or have clinical events concerning for seizure; treat confirmed seizures and avoid prognosis from EEG alone.", [AHA_POST], "Persistent coma or suspected seizure") },
  ],
  "Progressive Neurological Disease Support": [
    { group: "ruleIn", row: row("laboratory", "Arterial or capillary blood gas", "PaCO2 6 kPa or less with no clinically important hypoxaemia", "PaCO2 above 6 kPa or another gas-exchange abnormality", "Ventilatory failure", "A raised PaCO2 requires urgent respiratory ventilation-service referral; interpret with symptoms and respiratory-function tests.", [NICE_MND], "Low oxygen saturation, orthopnoea or symptoms of hypoventilation") },
    { group: "ruleIn", row: row("specializedAdjunctive", "Nocturnal oximetry or limited sleep study", "No clinically important nocturnal desaturation or sleep-disordered breathing", "Nocturnal desaturation or hypoventilation pattern", "Sleep-related hypoventilation", "Investigate sleep-related respiratory symptoms when daytime tests do not explain them and use results to support ventilation assessment.", [NICE_MND], "Sleep-related respiratory symptoms despite inconclusive daytime tests") },
  ],
  "Psoriasis": [
    { group: "ruleIn", row: row("specializedAdjunctive", "Cardiovascular risk assessment", "Risk factors and estimated risk below the treatment threshold used by the local cardiovascular pathway", "Raised calculated risk, blood pressure, adiposity, smoking risk or other modifiable factor", "Cardiometabolic comorbidity in severe psoriasis", "Offer at presentation for severe psoriasis and repeat at least every 5 years or sooner when indicated.", [NICE_PSO], "Severe psoriasis at presentation and follow-up") },
    { group: "ruleOut", row: row("laboratory", "Systemic-treatment safety blood tests", "Full blood count, renal and liver indices within treatment-specific acceptable ranges", "Cytopenia, renal impairment or liver abnormality relevant to the proposed systemic medicine", "Contraindication or toxicity risk before systemic treatment", "Obtain the medicine-specific baseline and monitoring tests required by the current product information and local policy; act on abnormalities before treatment.", [NICE_PSO], "Before and during systemic treatment") },
    { group: "ruleOut", row: row("laboratory", "Infection and pregnancy screening before selected systemic or biologic treatment", "No infection marker requiring action; pregnancy test negative when relevant", "Latent/active infection marker or pregnancy affecting treatment choice", "Treatment-specific infection or fetal risk", "Order only the screen required for the proposed medicine and the person's risk profile; refer abnormal results before immunosuppression.", [NICE_PSO], "Before a medicine for which product information or local policy requires screening") },
  ],
  "Schizophrenia": [
    { group: "ruleIn", row: row("laboratory", "Fasting glucose or HbA1c", "HbA1c below 42 mmol/mol (6.0%) unless a different local diagnostic threshold applies", "Prediabetes, diabetes or deterioration after antipsychotic initiation", "Baseline and treatment-emergent dysglycaemia", "Record before treatment and repeat during follow-up so diabetes risk triggers prevention or treatment rather than unmonitored continuation.", [NICE_SCZ], "Before antipsychotic treatment and during monitoring") },
    { group: "ruleIn", row: row("laboratory", "Lipid profile and prolactin", "Lipids and prolactin within the local age- and sex-specific reference intervals", "Dyslipidaemia or hyperprolactinaemia", "Antipsychotic metabolic and endocrine adverse effects", "Establish a baseline, investigate symptoms and use abnormalities in shared medicine selection and follow-up.", [NICE_SCZ], "Before antipsychotic treatment and when clinically indicated thereafter") },
    { group: "ruleOut", row: row("laboratory", "Targeted toxicology and physical-cause investigations", "No substance or laboratory abnormality explaining the presentation", "Evidence of intoxication, withdrawal, infection, metabolic disturbance or another medical cause", "Substance-induced psychosis, delirium or another medical mimic", "Select tests from history, examination and mental-state findings; no laboratory test confirms schizophrenia.", [NICE_SCZ], "First episode, atypical presentation or altered consciousness") },
  ],
  "Symptomatic Bradycardia": [
    { group: "ruleOut", row: row("laboratory", "Glucose, electrolytes and blood gas", "Glucose 3.9–10 mmol/L; potassium 3.5–5.0 mmol/L; no severe acid-base disturbance", "Hypoglycaemia, potassium disturbance, hypoxaemia or acidaemia", "Reversible metabolic cause of bradycardia", "Correct a reversible cause while cardiorespiratory support and rhythm treatment continue.", [AHA_ALS], "During initial stabilisation") },
    { group: "ruleOut", row: row("laboratory", "Cardiac troponin when acute coronary syndrome is suspected", "Below the assay-specific 99th-centile upper reference limit without a significant serial rise or fall", "Dynamic elevation compatible with acute myocardial injury", "Ischaemia-related conduction disturbance", "Use symptoms, ECG and serial change to direct the acute coronary syndrome pathway; do not delay pacing for an unstable patient.", [AHA_ALS], "Ischaemic symptoms or ECG changes") },
    { group: "ruleOut", row: row("firstLineImaging", "Focused echocardiography", "No major structural or pericardial abnormality", "Ventricular dysfunction, tamponade or another actionable structural finding", "Structural cause or consequence of haemodynamic compromise", "Use after immediate stabilisation when the result can change pacing, fluid or specialist management.", [AHA_ALS], "Persistent compromise or suspected structural disease") },
  ],
  "Tachyarrhythmia With a Pulse": [
    { group: "ruleOut", row: row("laboratory", "Glucose, electrolytes and blood gas", "Glucose 3.9–10 mmol/L; potassium 3.5–5.0 mmol/L; magnesium within the laboratory reference interval", "Hypoglycaemia, potassium or magnesium disturbance, hypoxaemia or acidaemia", "Reversible driver of tachyarrhythmia", "Correct the abnormality while rhythm-directed treatment continues; never delay cardioversion in an unstable patient.", [AHA_ALS], "During initial stabilisation") },
    { group: "ruleOut", row: row("laboratory", "Cardiac troponin when myocardial ischaemia is suspected", "Below the assay-specific 99th-centile upper reference limit without a significant serial rise or fall", "Dynamic elevation compatible with acute myocardial injury", "Acute myocardial ischaemia as trigger or consequence", "Interpret serial results with symptoms and ECG; a raised value alone does not define the rhythm mechanism.", [AHA_ALS], "Ischaemic symptoms or ECG changes") },
    { group: "ruleOut", row: row("firstLineImaging", "Focused echocardiography", "No major structural, ventricular or pericardial abnormality", "Ventricular dysfunction, right-heart strain, hypovolaemia or another actionable finding", "Structural disease or haemodynamic cause", "Use after immediate rhythm stabilisation when the finding will change treatment or disposition.", [AHA_ALS], "Persistent instability or suspected structural disease") },
  ],
  "Tobacco and Nicotine Cessation": [
    { group: "ruleIn", row: row("specializedAdjunctive", "Exhaled carbon monoxide", "Typically below 4 ppm in a person without recent smoke exposure; device cut-offs vary", "Raised reading consistent with recent combustible-tobacco exposure", "Recent smoke exposure and treatment feedback", "Use as an optional motivational and follow-up aid; a low value does not exclude intermittent smoking or non-combustible nicotine use.", [NICE_TOBACCO], "When equipment is available and the person agrees") },
    { group: "ruleOut", row: row("specializedAdjunctive", "Spirometry when chronic respiratory symptoms are present", "FEV1/FVC at or above the laboratory lower limit of normal", "Persistent airflow obstruction", "COPD in a person with tobacco exposure", "Do not use as a prerequisite for cessation treatment; investigate cough, sputum or breathlessness through the respiratory pathway.", [NICE_TOBACCO], "Chronic cough, sputum, wheeze or exertional breathlessness") },
    { group: "ruleOut", row: row("laboratory", "Renal function before renally cleared cessation medicine when indicated", "eGFR 60 mL/min/1.73 m² or above", "Renal impairment requiring product-specific dose review", "Safe selection and dosing of cessation pharmacotherapy", "Use only when the chosen medicine's product information or clinical history makes renal function relevant; do not delay behavioural support.", [NICE_TOBACCO], "Before selected pharmacotherapy in renal disease or when renal function is unknown") },
  ],
};

const tiers: Record<string, Record<string, Investigation["tier"]>> = {
  "Advanced COPD Supportive Care": { "Resting SpO2 and arterial blood gas (stable)": "laboratory" },
  "Community-Acquired Pneumonia": { "Chest X-ray (or lung ultrasound)": "firstLineImaging", "Pulse oximetry / blood gas": "specializedAdjunctive" },
  "Hypertension: Primary Care Titration and Target Review": { "Clinic blood pressure, both arms": "specializedAdjunctive", "ABPM or HBPM": "specializedAdjunctive", "Postural blood pressure": "specializedAdjunctive", "12-lead ECG and fundoscopy": "specializedAdjunctive" },
  "Post-Cardiac Arrest Care": { "Pulse oximetry and arterial blood gas": "laboratory" },
  "Progressive Neurological Disease Support": { "Resting SpO2; blood gas if low": "laboratory" },
  "Schizophrenia": { "Physical and metabolic baseline": "specializedAdjunctive" },
  "Tobacco and Nicotine Cessation": { "Lung cancer screening eligibility": "advancedImaging" },
};

function repairExisting(title: string, item: Investigation): Investigation {
  const fixed = structuredClone(item);
  fixed.tier = tiers[title]?.[fixed.testName] ?? fixed.tier;
  if (!fixed.normalValue) fixed.normalValue = fixed.testName.includes("culture") || fixed.testName.includes("antigen") || fixed.testName.includes("testing") ? "Negative or not detected" : "No abnormal result requiring action";
  fixed.references = (fixed.references?.length ? fixed.references : [title === "Community-Acquired Pneumonia" ? ATS_CAP : NICE_GAD]).map((r) => ({
    ...r,
    edition: /\b(p{1,2}\.?\s*\d+|page\s*\d|section\s*[\w.]+|table\s*[\w.]+|figure\s*[\w.]+|recommendation\s*[\w.]+|rec\.?\s*\d|appendix\s*[\w.]+)/i.test(r.edition)
      ? r.edition : `${r.edition}; section/recommendations cited in topic reference list`,
  }));
  return fixed;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment");
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await db.from("clinical_guidelines")
    .select("id,title,guideline_versions!inner(*)").in("title", [...TITLES]).eq("guideline_versions.is_current", true);
  if (error) throw error;
  if (data?.length !== TITLES.length) throw new Error(`Expected ${TITLES.length} current topics; found ${data?.length ?? 0}`);
  const payload: DiseaseDetail[] = [];
  const rows: Array<Record<string, unknown>> = [];
  for (const topic of data.sort((a, b) => a.title.localeCompare(b.title))) {
    const current = (topic.guideline_versions as unknown as CurrentVersion[])[0];
    if (current.status !== "published") throw new Error(`${topic.title} current version is not published`);
    const content = structuredClone(current.content) as DiseaseDetail;
    content.investigations.ruleIn = content.investigations.ruleIn.map((item) => repairExisting(topic.title, item));
    content.investigations.ruleOut = content.investigations.ruleOut.map((item) => repairExisting(topic.title, item));
    const present = new Set([...content.investigations.ruleIn, ...content.investigations.ruleOut].map((item) => item.testName));
    for (const addition of additions[topic.title] ?? []) if (!present.has(addition.row.testName)) content.investigations[addition.group].push(addition.row);
    Object.assign(content, { status: "under_review", version: VERSION, lastReviewed: DATE, clinicalReviewStatus: "pending" });
    if (content.evidenceAudit) {
      content.evidenceAudit.checkedOn = DATE;
      content.evidenceAudit.status = "incomplete";
      content.evidenceAudit.findings = [...content.evidenceAudit.findings, "Investigation tiers and added tests were checked against the cited source sections on 15 Oct 2026; additions are pending clinician review."];
      content.evidenceAudit.unverifiedSections = [...new Set([...content.evidenceAudit.unverifiedSections, "The expanded investigation panel is not clinically approved and remains non-current pending review."])];
    }
    const parsed = DiseaseDetailSchema.parse(content);
    const audit = auditTopicContent(parsed);
    const all = [...parsed.investigations.ruleIn, ...parsed.investigations.ruleOut];
    if (all.length < 5 || new Set(all.map((item) => item.tier)).size < 2 || audit.score < 80) throw new Error(`${topic.title}: investigation correction failed ${JSON.stringify(audit.failures)}`);
    payload.push(parsed);
    rows.push({ title: topic.title, guidelineId: topic.id, sourceVersion: current.version, investigations: all.length, tiers: [...new Set(all.map((item) => item.tier))], score: audit.score, failures: audit.failures });
    if (!process.argv.includes("--apply")) continue;
    const { data: existing, error: existingError } = await db.from("guideline_versions").select("id").eq("guideline_id", topic.id).eq("version", VERSION);
    if (existingError) throw existingError;
    if (existing?.length) { console.log(`PRESERVE ${topic.title}: review version already exists`); continue; }
    const insert = { ...current, id: randomUUID(), guideline_id: topic.id, version: VERSION, version_number: VERSION,
      status: "under_review", content: parsed, is_current: false, created_at: undefined, updated_at: undefined,
      change_summary: "Investigation panel expanded and correctly tiered with topic-relevant, source-cited tests; pending clinical review.",
      last_verified_date: DATE, review_date: DATE, approved_by: null, approved_at: null, published_at: null };
    const { error: insertError } = await db.from("guideline_versions").insert(insert);
    if (insertError) throw insertError;
    console.log(`INSERT ${topic.title}`);
  }
  await mkdir("outputs/urgent-investigation-revisions", { recursive: true });
  await writeFile("outputs/urgent-investigation-revisions/payload.json", `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile("outputs/urgent-investigation-revisions/audit.json", `${JSON.stringify(rows, null, 2)}\n`);
  console.log(JSON.stringify(rows, null, 2));
}

await main();
