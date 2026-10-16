import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { auditTopicContent } from "../lib/clinical-authoring-audit";
import { DiseaseDetailSchema } from "../lib/validations/disease";

const GUIDELINE_ID = "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e105";
const SOURCE_VERSION_ID = "bd203075-b824-4a3f-8c9b-04cf1799f78d";
const DATE = "2026-10-16";
const VERSION = "user-pasted-replacement-2026-10-16-v1";
const APPLY = process.argv.includes("--apply");

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false },
});

const { data: source, error: sourceError } = await db
  .from("guideline_versions")
  .select("*")
  .eq("id", SOURCE_VERSION_ID)
  .eq("guideline_id", GUIDELINE_ID)
  .single();
if (sourceError || !source) throw sourceError ?? new Error("Requested published source version was not found");
if (source.status !== "published" || !source.is_current) throw new Error("Requested source is not the current published version");

const current = DiseaseDetailSchema.parse(source.content);
const references = [
  {
    title: "American Heart Association/American Stroke Association: Acute Ischemic Stroke Resources",
    edition: "2026; Section Acute Ischemic Stroke Resources",
    url: "https://www.stroke.org/en/professionals/stroke-resource-library/acute-ischemic-stroke-resources",
    locator: "Acute Ischemic Stroke Resources page, lines 12–15",
  },
  {
    title: "European Stroke Organisation guidelines on intravenous thrombolysis for acute ischaemic stroke",
    edition: "2021; PICO 1.1, recommendation after line 237; sections on late-window and imaging selection",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7995316/",
    locator: "PICO 1.1; recommendations 2.4–2.5, 4.1 and 5.7",
  },
  {
    title: "NICE NG128: Stroke and transient ischaemic attack in over 16s",
    edition: "2019, amended 2025; recommendations 1.3–1.6",
    url: "https://www.nice.org.uk/guidance/ng128",
    locator: "Recommendations 1.3–1.6",
  },
];
const ref = (index: number) => ({ title: references[index].title, edition: references[index].edition, url: references[index].url });
const investigation = (
  testName: string,
  tier: "laboratory" | "firstLineImaging" | "advancedImaging" | "specializedAdjunctive",
  normalValue: string,
  expectedFinding: string,
  clinicalRationale: string,
  sourceIndex: number,
) => ({
  testName,
  tier,
  normalValue,
  expectedFinding,
  clinicalRationale,
  modalityTarget: testName,
  targetCondition: "Acute ischemic stroke or urgent alternative",
  references: [ref(sourceIndex)],
});

const content = DiseaseDetailSchema.parse({
  ...current,
  status: "under_review",
  version: VERSION,
  lastReviewed: DATE,
  clinicalReviewStatus: "pending",
  evidenceAudit: {
    checkedOn: DATE,
    status: "incomplete",
    scope: "Adult suspected acute ischemic stroke: recognition, initial imaging, thrombolysis and thrombectomy referral, early antithrombotic and supportive care. The supplied text was reconciled only where supported by opened AHA/ASA, ESO and NICE sources.",
    findings: [
      "User-supplied revision was preserved as an additive under-review version; the current published and all historical rows remain unchanged.",
      "The opened AHA/ASA resource confirms a 2026 acute ischemic stroke guideline exists; the opened ESO guideline supports alteplase within 4.5 hours and selected MRI-mismatch wake-up presentations when thrombectomy is not planned.",
      "Claims not directly supported by an opened source in this task were omitted rather than treated as verified clinical instructions.",
    ],
    unverifiedSections: [
      "No open Saudi national acute ischemic stroke guideline was identified in this task; apply the local Saudi stroke-code, transfer and formulary protocol.",
      "The submitted cerebral blood-flow cut-offs, neuron-loss estimate, NIHSS category cut-offs, door-to-CT target, DAPT loading/duration, glucose target, BP-agent regimens, and named medicine maximum doses were not independently source-verified in this task.",
      "SFDA registration and local formulary availability were not rechecked for alteplase, tenecteplase, aspirin, labetalol, nicardipine, clevidipine, clopidogrel, insulin, paracetamol or LMWH.",
    ],
    medscapeStatus: "unavailable",
    originalVersionIds: [SOURCE_VERSION_ID],
  },
  pathophysiology: {
    summary: "Acute Ischemic Stroke (AIS) results from arterial occlusion and sudden cerebral hypoperfusion. Reperfusion treatment seeks to preserve potentially salvageable tissue while avoiding haemorrhagic harm.",
    keyMechanisms: [
      "Large-artery atherosclerosis may cause in-situ thrombosis or artery-to-artery embolism.",
      "Cardioembolism includes atrial fibrillation and structural cardiac sources.",
      "Small-vessel disease can cause lacunar infarction; dissection and hypercoagulable disorders are alternative causes.",
      "Earlier reperfusion is associated with greater benefit; eligible patients need urgent specialist imaging and treatment decisions.",
      "Hypoxaemia, hyperglycaemia and fever may worsen acute brain injury and require protocol-directed assessment.",
    ],
    references: references.map(({ title, edition, url }) => ({ title, edition, url })),
  },
  presentation: {
    symptoms: [
      "Sudden unilateral face, arm or leg weakness or sensory loss.",
      "Aphasia, dysarthria, neglect, gaze deviation or homonymous visual-field loss.",
      "Vertigo, ataxia, diplopia, crossed signs or reduced consciousness can indicate posterior-circulation stroke.",
    ],
    physicalSigns: [
      "Record National Institutes of Health Stroke Scale (NIHSS) score and repeat it if the deficit changes.",
      "Assess pulse rhythm, blood pressure, oxygen saturation, glucose and signs of trauma, seizure or infection.",
      "A severe cortical deficit raises concern for large-vessel occlusion and urgent vascular imaging.",
    ],
    redFlags: [
      "Last-known-well time within a reperfusion window or unknown-onset/wake-up stroke: activate the local stroke pathway immediately.",
      "Severe deficit, gaze deviation, aphasia, neglect, dense hemiparesis, coma or fluctuating brainstem signs: urgent stroke-team and thrombectomy-centre discussion.",
      "Anticoagulant exposure, bleeding tendency, severe headache, vomiting, seizure or falling consciousness: urgent brain imaging to assess haemorrhage and other alternatives.",
    ],
    precipitants: ["Atrial fibrillation", "Hypertension", "Diabetes mellitus", "Smoking", "Carotid disease", "Recent myocardial infarction", "Arterial dissection"],
  },
  differentials: [
    { condition: "Intracranial haemorrhage", distinguishingFeatures: "Cannot be safely distinguished from ischaemia clinically; urgent brain imaging is required." },
    { condition: "Hypoglycaemia", distinguishingFeatures: "Capillary glucose can identify a reversible mimic during immediate assessment." },
    { condition: "Seizure with post-ictal paresis", distinguishingFeatures: "A witnessed seizure supports the diagnosis, but seizure at onset does not by itself exclude ischemic stroke." },
    { condition: "Migraine with aura", distinguishingFeatures: "Symptoms often spread gradually and may be positive; a new focal deficit still needs an urgent stroke assessment." },
  ],
  diagnosticCriteria: [
    { criterion: "Standard intravenous thrombolysis assessment", threshold: "Assess urgently when symptom onset or last-known-well time is within 4.5 hours; use local eligibility and contraindication protocol." },
    { criterion: "Unknown-onset or late-window assessment", threshold: "Use specialist advanced-imaging selection where the local pathway supports it; do not exclude solely because onset is unknown." },
    { criterion: "Large-vessel occlusion assessment", threshold: "Obtain urgent vascular imaging when thrombectomy is being considered; time-critical referral continues through the imaging decision." },
  ],
  investigations: {
    ruleIn: [
      investigation("Capillary blood glucose", "laboratory", "Typical adult range: 4–11 mmol/L; use the local laboratory range", "Low glucose can mimic focal stroke; treat confirmed hypoglycaemia while maintaining the stroke assessment.", "Obtain immediately; do not delay urgent imaging.", 2),
      investigation("National Institutes of Health Stroke Scale (NIHSS)", "specializedAdjunctive", "0 is no measured deficit", "A documented baseline and change in score quantify neurological deficit.", "Supports serial assessment and specialist communication; it does not replace imaging.", 0),
      investigation("Non-contrast computed tomography (CT) brain", "firstLineImaging", "No acute intracranial haemorrhage", "Haemorrhage, early ischaemic change or a structural mimic may be seen.", "Urgently assesses haemorrhage before ischemic reperfusion treatment.", 2),
      investigation("Computed tomography angiography (CTA) head and neck", "advancedImaging", "No proximal arterial occlusion", "A proximal occlusion can support urgent thrombectomy-centre discussion.", "Use when large-vessel occlusion or thrombectomy is suspected; it must not create avoidable reperfusion delay.", 2),
    ],
    ruleOut: [
      investigation("CT perfusion or magnetic resonance imaging (MRI) mismatch study", "advancedImaging", "No ischaemic core–penumbra mismatch", "A mismatch may support selected late-window or wake-up treatment decisions.", "Use only through the specialist imaging pathway; the ESO guideline describes MRI DWI-FLAIR mismatch selection when thrombectomy is not planned.", 1),
      investigation("Platelet count and coagulation assessment", "laboratory", "Platelets: typical adult range 150–400 × 10⁹/L; INR and aPTT use local reference ranges", "Abnormal results or relevant anticoagulant exposure may change thrombolysis eligibility.", "Draw promptly and follow the local reperfusion protocol; do not introduce a delay where the protocol does not require it.", 1),
      investigation("Electrocardiogram (ECG) and cardiac monitoring", "specializedAdjunctive", "Sinus rhythm without acute ischaemic change", "Atrial fibrillation or another cardiac abnormality may guide cause assessment and ongoing care.", "Obtain without delaying urgent stroke imaging and treatment decisions.", 0),
      investigation("Swallow screen", "specializedAdjunctive", "Pass on the local validated screen", "Failure identifies aspiration risk and changes oral medicine, food and fluid administration.", "Complete before oral intake or medicines; obtain specialist swallowing input when failed.", 2),
    ],
  },
  clinicalManagement: [
    { id: "activate-stroke", title: "Activate the acute stroke pathway", timeframe: "Immediately", actions: ["Record last-known-well and discovery times, establish airway, breathing and circulation, and obtain glucose.", "Record baseline NIHSS and arrange urgent brain imaging with stroke-team review.", "Keep the patient nil by mouth until a validated swallow screen is passed."] },
    { id: "image-and-reperfuse", title: "Image and make reperfusion decisions", timeframe: "As soon as possible", actions: ["Use non-contrast CT to assess haemorrhage and urgent vascular imaging when large-vessel occlusion or thrombectomy is suspected.", "Offer intravenous thrombolysis only through the current specialist and local-protocol eligibility pathway; the ESO guideline supports alteplase within 4.5 hours for eligible adults.", "For wake-up or selected late presentations, use specialist advanced-imaging selection; do not exclude solely because the onset is unknown."] },
    { id: "thrombectomy", title: "Escalate possible large-vessel occlusion", timeframe: "Concurrent with imaging", actions: ["Discuss confirmed or strongly suspected large-vessel occlusion with the stroke and neurointerventional team immediately.", "Do not delay thrombectomy-centre transfer solely to observe response to intravenous thrombolysis when both treatments are indicated by the local pathway.", "Use local transfer, imaging and eligibility criteria for anterior and posterior circulation occlusions."] },
    { id: "early-care", title: "Provide early stroke-unit supportive care", timeframe: "First 24 hours", actions: ["Monitor neurological status, blood pressure, oxygenation, temperature and glucose using the local stroke protocol.", "After intravenous thrombolysis, withhold antithrombotics and obtain follow-up brain imaging according to the local post-thrombolysis protocol before starting them.", "If reperfusion is not used, initiate antithrombotic treatment only after haemorrhage is excluded and according to the local stroke protocol."] },
    { id: "disposition", title: "Admit, rehabilitate and plan secondary prevention", timeframe: "After initial stabilisation", actions: ["Admit to an acute stroke unit or transfer to an appropriate specialist centre.", "Assess swallowing, mobility, communication, rehabilitation needs and cardioembolic/vascular cause.", "Document emergency return precautions, medication plan and stroke-service follow-up before discharge."] },
  ],
  medicationPlan: {
    status: "local-protocol-required",
    note: "UNREVIEWED DRAFT — not clinically approved. Alteplase and tenecteplase are specialist-reperfusion medicines; all doses, maximum doses, exclusions, blood-pressure treatment, antiplatelet selection, anticoagulation timing and SFDA/formulary status must be confirmed against the current Saudi hospital stroke protocol before prescribing.",
    regimens: [
      { indication: "Eligible adult acute ischemic stroke", patientGroup: "Adults; specialist stroke pathway only", genericName: "Alteplase", dose: "0.9 mg/kg; maximum and administration protocol must follow the local authorised product and stroke protocol", route: "Intravenous", frequency: "Single reperfusion course", duration: "One course", adjustments: ["Use only after specialist eligibility review and haemorrhage assessment.", "Follow local renal, hepatic, anticoagulant, bleeding-risk and blood-pressure exclusions."], monitoring: ["Continuous neurological and bleeding surveillance under the post-thrombolysis protocol."], contraindications: ["Use the current authorised product and local stroke-protocol exclusions; not independently reproduced in this draft."], sourceTitle: references[1].title, sourceUrl: references[1].url, sourceEdition: references[1].edition },
      { indication: "Eligible large-vessel occlusion before thrombectomy", patientGroup: "Adults; specialist stroke and thrombectomy pathway only", genericName: "Tenecteplase", dose: "0.25 mg/kg; product-specific maximum requires local protocol confirmation", route: "Intravenous bolus", frequency: "Single reperfusion course", duration: "One course", adjustments: ["Use only where the local stroke protocol authorises it.", "Confirm product-specific maximum dose, exclusions and SFDA/formulary status before prescribing."], monitoring: ["Continuous neurological and bleeding surveillance under the post-thrombolysis protocol."], contraindications: ["Use the current authorised product and local stroke-protocol exclusions; not independently reproduced in this draft."], sourceTitle: references[1].title, sourceUrl: references[1].url, sourceEdition: references[1].edition },
      { indication: "Acute ischemic stroke when reperfusion-specific restrictions have been assessed", patientGroup: "Adults; local stroke protocol", genericName: "Aspirin", dose: "300 mg daily when indicated after haemorrhage is excluded; route and timing follow the local protocol", route: "Oral, rectal or enteral route according to swallowing assessment", frequency: "Once daily", duration: "Initial 2 weeks then a long-term antithrombotic strategy per specialist plan", adjustments: ["Do not give orally before swallow safety is established.", "Confirm allergy, bleeding risk, post-thrombolysis timing and SFDA/formulary status locally."], monitoring: ["Bleeding and gastrointestinal tolerance."], contraindications: ["Active bleeding or true aspirin hypersensitivity; confirm full contraindications locally."], sourceTitle: references[2].title, sourceUrl: references[2].url, sourceEdition: references[2].edition },
    ],
  },
  guidelineComparison: {
    title: "Reperfusion-selection comparison",
    columns: ["ESO IV thrombolysis guideline 2021", "NICE NG128"],
    rows: [
      { parameter: "Within 4.5 hours", values: ["Alteplase is recommended for eligible adults.", "Use the current NICE/local thrombolysis pathway and technology appraisals."] },
      { parameter: "Unknown onset or wake-up stroke", values: ["Supports selected MRI DWI-FLAIR mismatch presentations when thrombectomy is not planned.", "Use specialist imaging and local pathway selection."] },
      { parameter: "Thrombectomy referral", values: ["This IVT guideline does not define the full thrombectomy pathway.", "Use urgent vascular imaging and specialist thrombectomy pathway."] },
    ],
    note: "This table intentionally does not merge guideline criteria. Saudi local stroke-code criteria and transfer arrangements still govern patient-level decisions.",
  },
  teaching: {
    scope: "Adult emergency recognition and specialist escalation for acute ischemic stroke; not a substitute for the Saudi hospital stroke protocol.",
    learningObjectives: ["Recognise possible AIS and important mimics.", "Prioritise time-critical imaging and reperfusion referral.", "Apply swallowing and post-reperfusion safety checks."],
    keyPoints: ["Record last-known-well time and activate the stroke pathway immediately.", "Brain imaging is required to assess haemorrhage before ischemic reperfusion treatment.", "Advanced imaging can support selected wake-up and late-window decisions.", "Do not give oral medicines, food or fluid before a swallow screen."],
    pitfalls: ["Using a normal early CT to exclude ischemic stroke.", "Treating a possible large-vessel occlusion without early vascular imaging and specialist discussion.", "Copying drug doses or exclusions without confirming the current local protocol and authorised product.", "Mistaking publication for clinician approval."],
    references,
  },
  nonClinicalManagement: {
    patientEducation: ["Call emergency services immediately for recurrent focal neurological symptoms, even if they resolve.", "Explain the reason for swallowing assessment and supervised rehabilitation planning.", "Use teach-back for the medication and emergency-return plan before discharge."],
    lifestyleAndDiet: ["Follow the speech-and-language therapy diet and fluid plan when dysphagia is present.", "Address smoking, blood pressure, diabetes, lipids and physical activity through the stroke-prevention plan."],
    mdtReferrals: ["Stroke neurology", "Neurointerventional team when thrombectomy is considered", "Speech and language therapy", "Physiotherapy and occupational therapy", "Cardiology when a cardiac source is suspected", "Rehabilitation services"],
    dischargeCriteria: ["Acute stroke assessment and safe specialist disposition completed.", "Swallowing, mobility, communication and support needs assessed.", "Secondary prevention, rehabilitation and follow-up plan documented.", "Clear recurrent-stroke and emergency-return advice understood."],
    followUpPlan: "Arrange stroke-service follow-up, rehabilitation and aetiological assessment; communicate the prevention plan to primary care and the patient/caregiver.",
  },
});

const audit = auditTopicContent(content);
console.log(JSON.stringify({ mode: APPLY ? "apply" : "dry-run", sourceVersionId: SOURCE_VERSION_ID, version: VERSION, audit, sourceStatus: source.status, sourceIsCurrent: source.is_current }, null, 2));
if (!audit.meetsEightyPercent) throw new Error(`Refusing to stage a sub-threshold version: ${audit.score}%`);
if (!APPLY) process.exit(0);

const { data: existing, error: existingError } = await db.from("guideline_versions").select("id,status,is_current").eq("guideline_id", GUIDELINE_ID).eq("version", VERSION);
if (existingError) throw existingError;
if (existing?.length) throw new Error(`Version already exists: ${VERSION}; refusing to overwrite any existing version`);

const row = {
  id: randomUUID(), guideline_id: GUIDELINE_ID, version: VERSION, version_number: VERSION,
  status: "under_review", is_current: false, content,
  source_title: source.source_title, issuing_organization: source.issuing_organization, source_url: source.source_url, jurisdiction: source.jurisdiction,
  last_verified_date: DATE, review_date: DATE, created_by: source.created_by, approved_by: null, approved_at: null, published_at: null,
  change_summary: "Additive Acute Ischemic Stroke user-pasted revision. Published source bd203075-b824-4a3f-8c9b-04cf1799f78d and all history retained. Unsupported pasted numeric/drug claims were not adopted; clinical review pending.",
};
const { error: insertError } = await db.from("guideline_versions").insert(row);
if (insertError) throw insertError;
console.log(JSON.stringify({ staged: true, id: row.id, guidelineId: GUIDELINE_ID, version: VERSION, status: row.status, isCurrent: row.is_current, clinicalReviewStatus: content.clinicalReviewStatus, audit }, null, 2));
