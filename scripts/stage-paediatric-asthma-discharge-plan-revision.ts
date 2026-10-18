import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { auditTopicContent } from "../lib/clinical-authoring-audit";
import { DiseaseDetailSchema } from "../lib/validations/disease";

const GUIDELINE_ID = "502aed05-1d2f-4401-85a2-3b7fd34c8645";
const SOURCE_VERSION = "topic-list-draft-2026-10-13-b003-revision-20261018090259892";
const VERSION = "paediatric-asthma-discharge-plan-sina-2024-20261018-v4";
const DATE = "2026-10-18";
const SOURCE_URL = "https://saudithoracicsociety.org/wp-content/uploads/2023/11/Saudi_Initiative_for_Asthma_2024.pdf";
const source = { title: "Saudi Initiative for Asthma 2024 update", edition: "SINA 2024, Section 10, pp. 32–34; Box 10.3", url: SOURCE_URL };
const abgSource = { title: "Arterial Blood Gas (ABG) Test", edition: "MedlinePlus, Section Normal ranges", url: "https://medlineplus.gov/lab-tests/arterial-blood-gas-abg-test/" };

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
const { data: original, error: sourceError } = await db.from("guideline_versions").select("*").eq("guideline_id", GUIDELINE_ID).eq("version", SOURCE_VERSION).single();
if (sourceError || !original) throw sourceError ?? new Error("The requested source draft was not found");

const investigation = (testName: string, tier: "laboratory" | "firstLineImaging" | "specializedAdjunctive", normalValue: string, expectedFinding: string, clinicalRationale: string) => ({ testName, tier, modalityTarget: testName, targetCondition: "Acute asthma severity or alternative diagnosis", normalValue, expectedFinding, clinicalRationale, references: [source] });

const content = DiseaseDetailSchema.parse({
  ...original.content,
  id: GUIDELINE_ID,
  title: "Acute Asthma Exacerbation in Children: Inhaler Technique and Oral Steroid Discharge Plan",
  specialty: "Paediatrics / Primary Care",
  authority: "Other",
  pillar: "Urgent Care",
  status: "under_review",
  version: VERSION,
  lastReviewed: DATE,
  clinicalReviewStatus: "pending",
  evidenceAudit: {
    checkedOn: DATE,
    status: "incomplete",
    scope: "Paediatric acute asthma assessment, emergency treatment, inhaler technique and oral-steroid discharge plan; SINA 2024 Section 10 and Box 10.3.",
    findings: ["Rewritten from the pasted draft using the Saudi Initiative for Asthma (SINA) 2024 child acute-asthma pathway.", "Every included dose, threshold and disposition step is traced to SINA 2024 Section 10 or Box 10.3."],
    unverifiedSections: ["Saudi Food and Drug Authority registration could not be independently confirmed in this task for salbutamol, ipratropium bromide, prednisolone or dexamethasone; check the SFDA register and hospital formulary before prescribing.", "Local paediatric oxygen-delivery, monitoring and escalation policies must be followed."],
    medscapeStatus: "unavailable",
    originalVersionIds: [original.id],
  },
  pathophysiology: {
    summary: "Acute airway inflammation, bronchial smooth-muscle constriction and mucus increase expiratory airflow obstruction. Air trapping can increase work of breathing and ventilation–perfusion mismatch. Exhaustion with falling air entry can precede respiratory failure.",
    keyMechanisms: ["Airway inflammation narrows the bronchial lumen.", "Bronchospasm causes variable expiratory airflow obstruction and wheeze.", "Mucus and air trapping increase work of breathing.", "Severe airflow obstruction can cause hypoxaemia; exhaustion and a silent chest are danger signs."],
    references: [source],
  },
  presentation: {
    symptoms: ["Wheeze or worsening shortness of breath.", "New cough, particularly at night.", "Reduced activity; in children younger than 2 years, lethargy or poor feeding."],
    physicalSigns: ["Tachypnoea, increased work of breathing, reduced air entry or wheeze.", "Assess oxygen saturation, ability to speak or feed, and level of alertness."],
    redFlags: ["Acute distress, inability to complete a few words in one breath, or poor response to short-acting beta-2 agonist (SABA) at home require urgent medical care.", "Silent chest, exhaustion, cyanosis, altered consciousness or worsening oxygenation require immediate senior and paediatric critical-care assessment."],
    precipitants: ["Viral upper respiratory tract infection commonly precedes attacks.", "Poor controller adherence, incorrect inhaler technique, tobacco smoke or vaping exposure, and known environmental triggers."],
  },
  differentials: [
    { condition: "Viral bronchiolitis in children younger than 2 years", distinguishingFeatures: "A common winter differential; assess age, clinical pattern and response rather than assuming asthma." },
    { condition: "Bacterial pneumonia", distinguishingFeatures: "Fever above 39°C with focal reduced breath sounds and crackles supports pneumonia and is an indication to consider chest radiography." },
    { condition: "Pneumothorax or foreign-body aspiration", distinguishingFeatures: "Asymmetric signs, sudden onset or a poor response to maximal treatment warrants assessment for an alternative diagnosis or complication." },
  ],
  diagnosticCriteria: [{ criterion: "Pediatric Respiratory Assessment Measure (PRAM)", threshold: "Score 1–3 mild, 4–7 moderate, and 8–12 severe; obtain at initial assessment and after treatment." }],
  investigations: {
    ruleIn: [
      investigation("PRAM score", "specializedAdjunctive", "0", "1–3 mild; 4–7 moderate; 8–12 severe", "Document initially and after treatment to guide treatment intensity and disposition."),
      investigation("Pulse oximetry", "specializedAdjunctive", "Oxygen saturation ≥92% on room air", "Saturation below 92% or deterioration indicates hypoxaemia", "Give oxygen as needed to maintain saturation ≥92%; reassess with the clinical score."),
      investigation("Respiratory examination and vital signs", "specializedAdjunctive", "Age-appropriate respiratory effort and alertness", "Reduced air entry, silent chest, exhaustion or altered consciousness", "Identify life-threatening deterioration and obtain urgent paediatric critical-care help."),
    ],
    ruleOut: [
      { ...investigation("Capillary blood gas", "laboratory", "Adult arterial pH 7.35–7.45; arterial carbon dioxide partial pressure 35–45 mmHg (4.7–6.0 kPa); local paediatric laboratory ranges apply", "Abnormal ventilation or acid-base status in severe asthma not responding to maximal therapy", "Not routine; use for severe non-response requiring Intensive Care Unit (ICU) consideration."), references: [source, abgSource] },
      investigation("Chest radiograph", "firstLineImaging", "No focal consolidation, pneumothorax or other acute thoracic abnormality", "Focal consolidation, pneumothorax or another alternative diagnosis", "Do not image routinely; consider for fever >39°C with focal signs, suspected pneumothorax, diagnostic uncertainty, disproportionate hypoxaemia or severe non-response."),
    ],
  },
  clinicalManagement: [
    { id: "initial", title: "Immediate assessment and first hour", timeframe: "At presentation and every 20 minutes during the first hour", actions: ["Record vital signs, oxygen saturation and PRAM.", "Give oxygen when required to maintain saturation ≥92%.", "For initial home treatment, the written plan uses salbutamol 2–4 puffs by spacer every 20 minutes for up to three doses; seek medical advice promptly even if improved.", "In the emergency department, use the PRAM-directed pathway and reassess after treatment."] },
    { id: "moderate", title: "Moderate or severe attack", timeframe: "First 60 minutes", actions: ["For PRAM 4–7, use weight-based salbutamol and add ipratropium bromide every 20 minutes for the first hour.", "Give systemic steroid after the first SABA dose when indicated.", "For PRAM 8–12, establish intravenous access, monitor closely, consider continuous nebulised salbutamol and contact paediatric intensive care." ] },
    { id: "discharge", title: "Discharge plan and follow-up", timeframe: "After sustained response; observe one hour after the last bronchodilator when the pathway specifies", actions: ["Discharge only if PRAM ≤3 after observation and the child is clinically stable.", "Provide salbutamol every 4–6 hours for 24 hours then as needed, complete the prescribed oral steroid course, continue inhaled corticosteroid until the next clinic review if indicated, and supply a written action plan.", "Observe the child and caregiver demonstrating one-puff-at-a-time spacer use: shake the inhaler, seal mouthpiece or mask, actuate one puff, allow several normal breaths, then repeat as prescribed.", "Arrange clinic review within one week."] },
  ],
  medicationPlan: {
    status: "local-protocol-required",
    note: "Doses are from SINA 2024 Section 10. SFDA registration was not independently verified in this task; check the SFDA register and hospital formulary before prescribing.",
    regimens: [
      { indication: "Acute bronchospasm at home", patientGroup: "Children with an individual asthma action plan", genericName: "Salbutamol", dose: "2–4 puffs", route: "Inhaled by metered-dose inhaler (MDI) with spacer", frequency: "Every 20 minutes for up to three doses", duration: "Initial home management only; seek medical advice promptly", adjustments: ["Use a spacer; use the child’s individual action plan and local protocol."], monitoring: ["Symptoms, work of breathing and response after each dose."], contraindications: ["Hypersensitivity; use clinical caution with significant tachyarrhythmia."], sourceTitle: source.title, sourceUrl: SOURCE_URL, sourceEdition: "SINA 2024, Section 10, p. 32" },
      { indication: "Moderate or severe emergency-department exacerbation", patientGroup: "Children weighing under 20 kg or 20 kg and above", genericName: "Salbutamol", dose: "<20 kg: 5 puffs by MDI/spacer or 2.5 mg nebulised; ≥20 kg: 10 puffs by MDI/spacer or 5 mg nebulised", route: "Inhaled", frequency: "As directed by PRAM pathway; titrate MDI dose to response", duration: "First hour and reassessment", adjustments: ["Use weight band and local nebuliser/oxygen protocol."], monitoring: ["PRAM, oxygen saturation, heart rate and clinical response."], contraindications: ["Hypersensitivity; use clinical caution with significant tachyarrhythmia."], sourceTitle: source.title, sourceUrl: SOURCE_URL, sourceEdition: "SINA 2024, Section 10, p. 33; Box 10.3" },
      { indication: "Moderate or severe attack during first hour", patientGroup: "Children managed by the PRAM pathway", genericName: "Ipratropium bromide", dose: "4 puffs by MDI/spacer or 250 micrograms nebulised", route: "Inhaled", frequency: "Every 20 minutes for the first hour only; maximum three doses", duration: "First hour only", adjustments: ["Use local device equivalence and infection-control policy."], monitoring: ["PRAM, oxygen saturation, heart rate and anticholinergic adverse effects."], contraindications: ["Hypersensitivity to ipratropium or atropine derivatives."], sourceTitle: source.title, sourceUrl: SOURCE_URL, sourceEdition: "SINA 2024, Section 10, p. 33; Box 10.3" },
      { indication: "Systemic steroid after first SABA dose when indicated", patientGroup: "Children with moderate or severe attack", genericName: "Prednisolone", dose: "1–2 mg/kg; maximum 20 mg if under 2 years, 30 mg at 2–5 years, and 60 mg at 5–12 years", route: "Oral", frequency: "Once daily", duration: "Complete 3–5 days total", adjustments: ["If oral treatment is not tolerated or the child is critically ill, use the local paediatric emergency protocol and seek senior advice."], monitoring: ["Clinical response, vomiting and glucose when clinically indicated."], contraindications: ["Hypersensitivity; assess infection risk while treating the acute attack."], sourceTitle: source.title, sourceUrl: SOURCE_URL, sourceEdition: "SINA 2024, Section 10, p. 33; Box 10.3" },
      { indication: "Alternative oral systemic steroid course when selected by the treating clinician", patientGroup: "Children with acute asthma", genericName: "Dexamethasone", dose: "0.6 mg/kg; maximum 16 mg", route: "Oral", frequency: "A second dose the following day when an oral steroid course is used", duration: "Two-day course", adjustments: ["Choose one systemic-steroid regimen; do not combine routinely with prednisolone outside the pathway."], monitoring: ["Clinical response, vomiting and behavioural adverse effects."], contraindications: ["Hypersensitivity; assess infection risk while treating the acute attack."], sourceTitle: source.title, sourceUrl: SOURCE_URL, sourceEdition: "SINA 2024, Section 10, p. 33; Box 10.3" },
    ],
  },
  teaching: {
    scope: "Paediatric acute asthma discharge and inhaler technique.",
    learningObjectives: ["Use PRAM at assessment and reassessment.", "Teach spacer technique before discharge.", "Give a written action plan and timely follow-up."],
    keyPoints: ["A worsening score, silent chest, exhaustion or poor response requires escalation.", "The discharge plan includes short-term SABA instructions, completion of oral steroid when prescribed, action plan, inhaler technique and clinic review."],
    pitfalls: ["Routine chest radiography, blood gas testing and antibiotics are not indicated for a typical responding attack.", "Do not discharge without observing caregiver and child inhaler-spacer technique."],
    references: [{ ...source, locator: "Section 10, pp. 32–34; Box 10.3" }],
  },
  nonClinicalManagement: {
    patientEducation: ["Give a written asthma action plan.", "Demonstrate and observe MDI/spacer technique before discharge.", "Explain when to seek urgent medical care: distress, inability to speak a few words in one breath, or poor SABA response."],
    lifestyleAndDiet: ["Avoid tobacco smoke, vaping exposure and known triggers.", "No special diet is recommended in the SINA acute-asthma pathway."],
    mdtReferrals: ["Paediatric emergency team; paediatric intensive care for severe deterioration or PRAM 8–12.", "Asthma or primary-care clinic for follow-up."],
    dischargeCriteria: ["PRAM ≤3 after required observation.", "Clinically stable with a caregiver able to demonstrate spacer technique and follow the written plan."],
    followUpPlan: "Clinic visit within one week.",
  },
});

const audit = auditTopicContent(content);
if (!audit.meetsEightyPercent) throw new Error(`Refusing to stage below threshold: ${audit.score}% ${audit.failures.join(" | ")}`);
const { data: existing, error: existingError } = await db.from("guideline_versions").select("id,status,is_current").eq("guideline_id", GUIDELINE_ID).eq("version", VERSION).maybeSingle();
if (existingError) throw existingError;
if (existing) throw new Error(`Version already exists (${existing.id}); refusing to overwrite it.`);
const row = { id: randomUUID(), guideline_id: GUIDELINE_ID, version: VERSION, version_number: VERSION, status: "under_review", is_current: false, content, source_title: source.title, issuing_organization: "Saudi Thoracic Society", source_url: SOURCE_URL, jurisdiction: "Saudi Arabia", last_verified_date: DATE, review_date: DATE, created_by: original.created_by, approved_by: null, approved_at: null, published_at: null, change_summary: "Additive correction of the user-pasted paediatric acute-asthma discharge plan. Replaced unsupported content with SINA 2024 Section 10 and Box 10.3 claims; preserved every historical version. Clinical review pending." };
const { error: insertError } = await db.from("guideline_versions").insert(row);
if (insertError) throw insertError;
console.log(JSON.stringify({ staged: true, guidelineId: GUIDELINE_ID, versionId: row.id, version: VERSION, score: audit.score, status: row.status, isCurrent: row.is_current, reviewStatus: content.clinicalReviewStatus, failures: audit.failures }, null, 2));
