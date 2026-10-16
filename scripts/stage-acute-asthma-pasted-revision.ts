import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { DiseaseDetailSchema } from "../lib/validations/disease";

const GUIDELINE_ID = "b7094a86-5aa2-4e91-856f-0ea66a94c988";
const DATE = "2026-10-16";
const VERSION = "user-pasted-revision-2026-10-16-v1";
const SOURCE_URL = "https://pmc.ncbi.nlm.nih.gov/articles/PMC10911239/";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
const { data: currentRow, error: currentError } = await db.from("guideline_versions").select("*").eq("guideline_id", GUIDELINE_ID).eq("is_current", true).single();
if (currentError || !currentRow) throw currentError ?? new Error("Current topic not found");
const current = DiseaseDetailSchema.parse(currentRow.content);
const ref = { title: "Saudi Initiative for Asthma 2024 update", edition: "SINA 2024, Section 10, Boxes 10.1–10.3", url: SOURCE_URL };
const investigation = (testName: string, tier: "laboratory" | "firstLineImaging" | "specializedAdjunctive", modalityTarget: string, targetCondition: string, expectedFinding: string, clinicalRationale: string, normalValue: string) => ({ testName, tier, modalityTarget, targetCondition, expectedFinding, clinicalRationale, normalValue, references: [ref] });

const content = DiseaseDetailSchema.parse({
  ...current,
  status: "under_review",
  version: VERSION,
  lastReviewed: DATE,
  clinicalReviewStatus: "pending",
  evidenceAudit: {
    ...(current.evidenceAudit ?? { medscapeStatus: "unavailable", originalVersionIds: [GUIDELINE_ID] }),
    checkedOn: DATE,
    status: "incomplete",
    scope: "Paediatric acute asthma assessment and Emergency Department (ED) treatment for children aged 2–12 years, incorporating the user-pasted pathway.",
    findings: ["User-pasted pathway incorporated as an additive revision on 16 October 2026.", "Clinical claims, doses and thresholds remain pending clinician verification against the cited source and local hospital protocol."],
    unverifiedSections: ["The pasted content does not provide claim-level locators for each dose and threshold.", "Saudi Food and Drug Authority (SFDA) registration and local formulary availability were not independently checked for each medicine.", "Paediatric critical-care escalation and local oxygen/nebuliser protocols require clinician review."],
    medscapeStatus: "unavailable",
    originalVersionIds: [GUIDELINE_ID],
  },
  pathophysiology: {
    summary: "Airway inflammation and oedema narrow the bronchial lumen. Bronchial smooth-muscle constriction causes variable expiratory airflow obstruction. Mucus plugging increases ventilation–perfusion mismatch. Progressive respiratory-muscle fatigue and rising carbon dioxide signal impending respiratory failure.",
    keyMechanisms: ["Airway inflammation and oedema cause mucosal swelling and luminal narrowing.", "Bronchospasm restricts expiratory airflow and causes hyperinflation.", "Mucus plugging and local atelectasis impair gas exchange.", "Respiratory-muscle fatigue can lead to alveolar hypoventilation, hypercapnia and respiratory failure."],
    references: [ref],
  },
  presentation: {
    symptoms: ["Recurrent wheeze, persistent cough, dyspnoea, chest tightness and reduced feeding or activity."],
    physicalSigns: ["Tachypnoea, intercostal or subcostal retractions, accessory-muscle use, polyphonic wheeze, reduced air entry and low baseline oxygen saturation."],
    redFlags: ["Unable to speak a few words, central cyanosis, exhaustion, altered consciousness, silent chest, severe bradycardia or poor response to initial Short-Acting Beta-2 Agonist (SABA) therapy."],
    precipitants: ["Viral upper respiratory tract infection, environmental allergens, tobacco smoke or vaping exposure, airborne pollutants, poor controller adherence and incorrect inhaler or spacer technique."],
  },
  differentials: [
    { condition: "Anaphylaxis", distinguishingFeatures: "Acute airway, breathing or circulatory compromise with urticaria, angioedema or gastrointestinal distress; give immediate Intramuscular (IM) adrenaline (epinephrine) and manage the airway and circulation." },
    { condition: "Foreign-body aspiration", distinguishingFeatures: "Sudden unwitnessed choking, stridor or focal/unilateral findings such as monophonic wheeze or asymmetric air entry; seek urgent paediatric bronchoscopy assessment." },
  ],
  diagnosticCriteria: [{ criterion: "Pediatric Respiratory Assessment Measure (PRAM)", threshold: "Assess ages 2–17 years using oxygen saturation, suprasternal retractions, scalene use, air entry and wheeze: 1–3 mild, 4–7 moderate and 8–12 severe." }],
  investigations: {
    ruleIn: [
      investigation("PRAM score", "specializedAdjunctive", "Oxygen saturation, retractions, scalene use, air entry and wheeze", "Acute asthma severity", "1–3 mild; 4–7 moderate; 8–12 severe", "Record at baseline and after treatment to guide disposition.", "0"),
      investigation("Pulse oximetry", "specializedAdjunctive", "Oxygenation", "Hypoxaemia", "Reduced saturation, especially below 92% in severe distress", "Give oxygen when hypoxaemic and maintain the locally specified target during transfer.", ">94% on room air"),
      investigation("Serial respiratory rate and work of breathing", "specializedAdjunctive", "Respiratory distress", "Attack severity and fatigue", "Persistent tachypnoea, severe recession, accessory-muscle use or decreasing effort", "Repeat with PRAM after bronchodilator therapy and escalate deterioration.", "Age-appropriate rate without retractions"),
      investigation("Peak expiratory flow or spirometry", "specializedAdjunctive", "Expiratory airflow", "Reversible airflow obstruction", "Markedly reduced flow with bronchodilator reversibility", "Use only in a cooperative child, typically aged 5 years or older, without delaying emergency treatment.", "Personal best or predicted baseline"),
    ],
    ruleOut: [
      investigation("Blood gas analysis", "laboratory", "Ventilation and acid-base status", "Impending respiratory failure", "Carbon-dioxide retention, hypercapnia, acidaemia or severe refractory hypoxaemia", "Reserve for life-threatening features, exhaustion, altered sensorium or failure to respond to maximal therapy.", "Normal carbon dioxide without acidaemia"),
      investigation("Targeted microbiological testing", "laboratory", "Viral or bacterial trigger", "Infection requiring separate management", "Identified pathogen when the result changes isolation or treatment", "Do not use routinely; antibiotics are not indicated for an uncomplicated asthma attack.", "No relevant pathogen"),
      investigation("Chest radiograph", "firstLineImaging", "Alternative thoracic pathology or complication", "Pneumothorax, lobar collapse, foreign body or focal consolidation", "Focal consolidation, pneumothorax or pneumomediastinum when an alternative or complication is suspected", "Routine radiography is not recommended for a typical responding attack.", "No acute focal abnormality"),
    ],
  },
  clinicalManagement: [
    { id: "assess-bronchodilation", title: "Assess severity and start bronchodilation", timeframe: "First minutes of arrival", actions: ["Calculate and record the initial PRAM score and oxygen saturation.", "Screen for Intensive Care Unit (ICU) admission history or near-fatal asthma risk factors.", "Give supplemental oxygen if hypoxaemic.", "Initiate inhaled SABA therapy with salbutamol." ] },
    { id: "first-hour", title: "First-hour treatment", timeframe: "Every 20 minutes for 1 hour", actions: ["Repeat salbutamol by Metered-Dose Inhaler (MDI) with spacer, or use oxygen-driven nebulisation for severe attacks, every 20 minutes for three doses.", "Add ipratropium bromide every 20 minutes during the first hour for moderate or severe exacerbations.", "Give oral (PO) systemic corticosteroid prednisolone early for moderate-to-severe attacks or poor initial response to SABA." ] },
    { id: "reassess-disposition", title: "Reassess and decide disposition", timeframe: "At 60 minutes after treatment", actions: ["Repeat PRAM and reassess oxygen saturation and work of breathing.", "For PRAM 8–12 or worsening, escalate immediately to the paediatric critical-care or ICU team and consider intravenous (IV) magnesium sulfate under continuous cardiac monitoring.", "For PRAM 1–3 with sustained response, use the discharge pathway with SABA, Inhaled Corticosteroid (ICS) plan, spacer demonstration, written asthma action plan and review within 7 days." ] },
  ],
  medicationPlan: {
    status: "local-protocol-required",
    note: "The pasted pathway states that doses align with Saudi Initiative for Asthma (SINA) 2024. Verify every dose, maximum, contraindication, Saudi Food and Drug Authority (SFDA) registration and local hospital formulary before clinical use.",
    regimens: [
      { indication: "Acute bronchospasm", patientGroup: "Children aged 2–12 years", genericName: "Salbutamol", dose: "4–8 puffs by MDI with spacer, or weight/severity-based nebulisation", route: "Inhaled", frequency: "Every 20 minutes for the first hour, then titrate to response", duration: "First hour and reassessment thereafter", adjustments: ["Use oxygen-driven nebulisation if MDI with spacer is not feasible."], monitoring: ["PRAM, heart rate and oxygen saturation."], contraindications: ["Hypersensitivity; use caution with severe tachyarrhythmia."], sourceTitle: ref.title, sourceUrl: SOURCE_URL, sourceEdition: ref.edition },
      { indication: "Moderate or severe attack or poor initial SABA response", patientGroup: "Children younger than 12 years", genericName: "Prednisolone", dose: "1–2 mg/kg; maximum 20 mg under 2 years, 30 mg at 2–5 years and 60 mg at 5–12 years", route: "PO", frequency: "Once daily", duration: "3–5 days total", adjustments: ["Seek specialist advice if oral treatment is not tolerated."], monitoring: ["Clinical response, vomiting and glucose in high-risk children."], contraindications: ["Hypersensitivity; evaluate active serious infection while treating the emergency."], sourceTitle: ref.title, sourceUrl: SOURCE_URL, sourceEdition: ref.edition },
      { indication: "Moderate or severe attack during the first hour", patientGroup: "Children with PRAM-directed moderate or severe attack", genericName: "Ipratropium bromide", dose: "4 puffs by MDI with spacer or 250 micrograms by nebuliser", route: "Inhaled", frequency: "Every 20 minutes for the first hour; maximum three doses", duration: "First hour only", adjustments: ["Use local device equivalence and infection-control policy."], monitoring: ["PRAM, heart rate and dry mouth."], contraindications: ["Hypersensitivity to ipratropium or atropine derivatives."], sourceTitle: ref.title, sourceUrl: SOURCE_URL, sourceEdition: ref.edition },
      { indication: "Refractory severe attack with PRAM 8–12 after initial treatment", patientGroup: "Children requiring critical-care escalation", genericName: "Magnesium sulfate", dose: "40 mg/kg; maximum 2 g", route: "IV infusion", frequency: "Single dose in the ED", duration: "Infuse over 20 minutes", adjustments: ["Use only under paediatric critical-care or local emergency protocol."], monitoring: ["Continuous cardiac monitoring, blood pressure, deep tendon reflexes and weakness."], contraindications: ["Severe renal failure, atrioventricular block or neuromuscular disease."], sourceTitle: ref.title, sourceUrl: SOURCE_URL, sourceEdition: ref.edition },
    ],
  },
  teaching: {
    scope: "Paediatric acute asthma assessment and Emergency Department (ED) treatment for children aged 2–12 years.",
    learningObjectives: ["Use PRAM to stage and reassess acute asthma.", "Apply age-specific corticosteroid maximum doses.", "Recognise red flags requiring paediatric critical-care escalation."],
    keyPoints: ["Treat first, then reassess at 1 hour.", "A silent chest, cyanosis, exhaustion or altered consciousness is life-threatening."],
    pitfalls: ["Using adult doses in children.", "Relying on routine chest radiographs or blood gas testing in a responding attack.", "Discharging without confirming spacer technique and issuing a written asthma action plan."],
    references: [{ ...ref, locator: "Section 10; Boxes 10.1–10.3" }],
  },
  nonClinicalManagement: {
    patientEducation: ["Demonstrate correct MDI and spacer technique.", "Provide a written asthma action plan with daily ICS controller and rescue SABA instructions.", "Counsel on avoiding tobacco smoke, vaping and known triggers."],
    lifestyleAndDiet: ["Avoid environmental tobacco smoke, vaping and known triggers.", "Resume age-appropriate activity after recovery."],
    mdtReferrals: ["Paediatric Emergency Department, respiratory team and critical care for severe or poorly responding attacks."],
    dischargeCriteria: ["PRAM 1–3 sustained for at least 1–2 hours, oxygen saturation above 94% on room air, stable work of breathing and caregiver able to execute the home plan."],
    followUpPlan: "Arrange primary-care or specialist paediatric asthma-clinic review within 7 days.",
  },
});

const { data: existing, error: existingError } = await db.from("guideline_versions").select("id").eq("guideline_id", GUIDELINE_ID).eq("version", VERSION);
if (existingError) throw existingError;
if (existing?.length) throw new Error(`Version already exists: ${VERSION}`);
const row = {
  id: randomUUID(), guideline_id: GUIDELINE_ID, version: VERSION, version_number: VERSION,
  status: "under_review", is_current: false, content, source_title: currentRow.source_title,
  issuing_organization: currentRow.issuing_organization, source_url: currentRow.source_url,
  jurisdiction: currentRow.jurisdiction, last_verified_date: DATE, review_date: DATE,
  created_by: currentRow.created_by, approved_by: null, approved_at: null, published_at: null,
  change_summary: "Additive user-pasted paediatric acute asthma pathway revision. Current and historical versions preserved; clinical review pending.",
};
const { error: insertError } = await db.from("guideline_versions").insert(row);
if (insertError) throw insertError;
console.log(JSON.stringify({ staged: true, version: VERSION, versionId: row.id, status: row.status, isCurrent: row.is_current, clinicalReviewStatus: content.clinicalReviewStatus }, null, 2));
