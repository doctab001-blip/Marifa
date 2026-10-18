import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { DiseaseDetailSchema } from "../lib/validations/disease";
import { auditTopicContent } from "../lib/clinical-authoring-audit";

const GUIDELINE_ID = "f337914a-3ddd-4356-8425-fa81450dd412";
const DATE = "2026-10-18";
const VERSION = "user-pasted-revision-2026-10-18-v1";

const AAO_URL = "https://www.aepap.org/sites/default/files/otitis_externa_guia2014-rosenfeld-161-8_0.pdf";
const RVEEH_URL = "https://eyeandear.org.au/wp-content/uploads/2021/11/Malignant-Otitis-Externa-Clinical-Practice-Guideline.pdf";
const MUGHAL_URL = "https://pmc.ncbi.nlm.nih.gov/articles/PMC8076578";
const YOUNGS_URL = "https://www.cambridge.org/core/product/19722296B6068874DCAF478DE0AE58FA/core-reader";

const aao = (loc: string) => ({ title: "Clinical Practice Guideline: Acute Otitis Externa, Executive Summary (AAO-HNSF)", edition: `Rosenfeld et al., Otolaryngology–Head and Neck Surgery 2014;150(2):161–168, ${loc}`, url: AAO_URL });
const rveeh = (loc: string) => ({ title: "Malignant Otitis Externa Clinical Practice Guideline (CPG22.0), Royal Victorian Eye and Ear Hospital", edition: `Emergency Department, V2.0 approved 24 Aug 2018, ${loc}`, url: RVEEH_URL });
const mughal = { title: "A Systematic Review of Antibiotic Prescription for Acute Otitis Externa", edition: "Mughal et al., Cureus 2021, Implications for Practice section", url: MUGHAL_URL };
const youngs = { title: "Topical aural antibiotic use in the UK – time for a change of policy?", edition: "Youngs et al., Journal of Laryngology & Otology 2016;130(1):1, editorial text", url: YOUNGS_URL };

const inv = (tier: "laboratory" | "firstLineImaging" | "advancedImaging" | "specializedAdjunctive", testName: string, modalityTarget: string, targetCondition: string, expectedFinding: string, clinicalRationale: string, normalValue: string, reference: { title: string; edition: string; url: string }) => ({ tier, testName, modalityTarget, targetCondition, expectedFinding, clinicalRationale, normalValue, references: [reference] });

const content = DiseaseDetailSchema.parse({
  id: GUIDELINE_ID,
  title: "Acute Otitis Externa: Topical Treatment and Referral",
  specialty: "Otolaryngology (ENT) / Primary Care",
  authority: "Other",
  status: "under_review",
  version: VERSION,
  lastReviewed: DATE,
  pillar: "Urgent Care",
  clinicalReviewStatus: "pending",
  evidenceAudit: {
    checkedOn: DATE,
    status: "incomplete",
    scope: "Adult acute otitis externa (AOE) in primary care and urgent care: first-line topical treatment, drop delivery, reassessment and referral, plus red flags for necrotizing (malignant) otitis externa (NOE). The user-pasted draft was restructured into the canonical Marifa topic shape and checked against the sources opened on 18 October 2026.",
    findings: [
      "Opened on 18 Oct 2026: AAO-HNSF 2014 acute otitis externa guideline executive summary (key action statements 3–8, Tables 4–5); Royal Victorian Eye and Ear Hospital malignant otitis externa guideline CPG22.0 (pp. 1–5); Mughal 2021 systematic review; Youngs 2016 editorial.",
      "Where the pasted text and an opened source differ (course length, aminoglycoside drops with a perforation, wick timing, imaging for suspected NOE) both are shown in the guideline comparison; nothing was blended.",
    ],
    unverifiedSections: [
      "No Saudi national guideline for otitis externa was found in a web search on 18 Oct 2026, and no Saudi Ministry of Health protocol was opened. NICE Clinical Knowledge Summaries (otitis externa) could not be opened from outside the UK, so no NICE source was used.",
      "No medicine regimen is listed. The product, drops per dose, doses of analgesics and the pasted '3–4 drops twice daily' were not found in the opened sources; the AAO-HNSF Table 3 product list was not read. SFDA registration was not checked. Check hospital formulary.",
      "Page numbers for the AAO-HNSF executive summary were inferred from running heads and may be off by one page.",
      "Taken from the pasted draft without a locator in the opened sources: the 48-hour onset criterion, pH and organism mechanism, symptom and sign lists, differential features, fever or spreading cellulitis as a red flag, ear swab indications in uncomplicated AOE, wick change at 48–72 hours, avoiding syringing, NSAID cautions, water precautions and petroleum-jelly cotton ball, and the 1–2 week review.",
      "The statement that UK ENT consensus allows aminoglycoside drops with a perforation for up to two weeks was seen only as a secondary citation in Mughal 2021; the ENT-UK document itself was not opened.",
      "The Royal Victorian Eye and Ear Hospital guideline is an Australian hospital document whose review date (24 Aug 2023) has passed; the AAO-HNSF guideline excludes NOE and dates from 2014. Whether a newer version exists was not checked.",
    ],
    medscapeStatus: "unavailable",
    originalVersionIds: [GUIDELINE_ID],
  },
  pathophysiology: {
    summary: "Acute otitis externa (AOE) is diffuse inflammation of the skin of the ear canal and is almost always bacterial. Moisture or trauma damages the canal's protective layer, and canal swelling then blocks drug delivery. In older, diabetic or immunocompromised people the infection can reach the skull base as necrotizing (malignant) otitis externa (NOE).",
    keyMechanisms: [
      "Diffuse AOE is almost always bacterial; fungal infection is uncommon in a first episode (AAO-HNSF 2014, p. 161).",
      "Moisture or trauma from cotton swabs or hearing aids is thought to break down the canal's wax-lipid barrier and macerate the skin, favouring Pseudomonas aeruginosa and Staphylococcus aureus (pasted draft; not verified in the opened sources).",
      "Canal swelling and debris stop drops reaching the skin, so cleaning the canal or placing a wick improves delivery (AAO-HNSF 2014, key action statement 6, p. 165).",
      "Prolonged topical antibiotic use can allow secondary fungal infection (AAO-HNSF 2014, key action statement 5, p. 164).",
      "In elderly, diabetic or immunocompromised people, infection can invade the skull base as NOE, which the AAO-HNSF guideline excludes from its scope (p. 162; RVEEH CPG22.0, p. 1).",
    ],
    references: [aao("pp. 161–165"), rveeh("p. 1")],
  },
  presentation: {
    symptoms: [
      "Rapid-onset ear pain that may spread to the jaw.",
      "Itching inside the canal.",
      "Blocked or full feeling in the ear.",
      "Reduced hearing from canal swelling or debris.",
      "Clear, purulent or foul-smelling discharge.",
    ],
    physicalSigns: [
      "Pain on moving the pinna or pressing the tragus.",
      "Canal skin red and swollen, sometimes closing the canal.",
      "Debris, sloughed skin or pus in the canal.",
      "Tympanic membrane (TM) normal if it can be seen; canal swelling often hides it.",
      "Look for a perforation or tympanostomy tube: it changes which drops are safe (AAO-HNSF 2014, key action statement 2, p. 163).",
    ],
    redFlags: [
      "Severe or deep ear pain out of proportion to the findings, especially in an older, diabetic or immunocompromised person: suspect NOE (RVEEH CPG22.0, pp. 1–2).",
      "Granulation tissue at the junction of the bony and cartilaginous canal, or pain and discharge that do not improve with local treatment: suspect NOE (RVEEH CPG22.0, p. 2).",
      "Cranial nerve palsy, most often facial weakness on the same side: suspect NOE with a poor prognosis; refer same day to ear, nose and throat (ENT) with infectious diseases input (RVEEH CPG22.0, pp. 1–3).",
      "Fever or redness spreading to the pinna or face (pasted draft; not verified in the opened sources).",
      "A child with these features: consider an underlying malignancy (RVEEH CPG22.0, p. 1).",
    ],
    precipitants: [
      "Water exposure, swimming and humid weather (pasted draft).",
      "Canal trauma from cotton swabs, objects or hearing aids (pasted draft).",
      "Diabetes, immunocompromise or earlier radiotherapy to the head and neck: these change management (AAO-HNSF 2014, key action statement 2, p. 163).",
      "Known or suspected eardrum perforation or a tympanostomy tube (AAO-HNSF 2014, key action statement 2, p. 163).",
    ],
  },
  differentials: [
    { condition: "Necrotizing (malignant) otitis externa", distinguishingFeatures: "Deep, severe pain, usually in an older diabetic or immunocompromised person, with granulation tissue at the bony-cartilaginous junction, a cranial nerve palsy or no response to local treatment; needs ENT and infectious diseases admission (RVEEH CPG22.0, pp. 1–3)." },
    { condition: "Acute otitis media with perforation", distinguishingFeatures: "Follows a respiratory infection; tragal pressure is not very painful; mucopurulent discharge comes from a visible hole in the drum (pasted draft)." },
    { condition: "Contact dermatitis of the canal", distinguishingFeatures: "Mainly itching, scaling and flaking rather than severe pain; often follows neomycin drops, cosmetics or hearing aid materials (pasted draft)." },
    { condition: "Furunculosis", distinguishingFeatures: "Single, very tender, localised swelling of a hair follicle in the outer canal rather than diffuse swelling (pasted draft)." },
    { condition: "Mastoiditis", distinguishingFeatures: "Pain, redness and swelling behind the ear with the pinna pushed outwards and downwards; usually a complication of otitis media (pasted draft)." },
  ],
  diagnosticCriteria: [
    { criterion: "Diffuse AOE: clinical diagnosis", threshold: "Rapid onset (pasted draft: within 48 hours) with pain on pinna or tragal pressure and canal swelling or redness; the guideline requires distinguishing diffuse AOE from other causes of ear pain and discharge (AAO-HNSF 2014, key action statement 1, p. 163)." },
    { criterion: "Factors that change management", threshold: "Non-intact TM, tympanostomy tube, diabetes, immunocompromise or prior radiotherapy (AAO-HNSF 2014, key action statement 2, p. 163)." },
    { criterion: "No response to treatment", threshold: "No improvement within 48–72 hours: reassess the diagnosis and look for other causes (AAO-HNSF 2014, key action statement 8, pp. 165–166)." },
  ],
  investigations: {
    ruleIn: [
      inv("specializedAdjunctive", "Otoscopy with pinna and tragal pressure", "Ear canal and tympanic membrane", "Diffuse AOE", "Pain on pinna or tragal pressure, canal swelling or redness, debris; note whether the TM is visible and intact.", "Clinical diagnosis and first step. Decide the drop type from TM status; if the TM cannot be seen, treat it as possibly perforated (AAO-HNSF 2014, key action statements 1, 2 and 7, pp. 163–165).", "Pink canal skin, no tenderness, intact TM visible", aao("key action statements 1–2 and 7, pp. 163–165")),
      inv("laboratory", "Ear canal swab for culture and sensitivity", "Canal discharge", "Pathogen identification in suspected NOE or non-response", "Pseudomonas aeruginosa or another pathogen on culture, with sensitivities.", "Take before any topical antibiotic in suspected NOE, in transport medium and labelled as external auditory canal NOE (RVEEH CPG22.0, p. 2). Routine swabbing in uncomplicated AOE is not supported by the opened sources.", "No pathogenic growth", rveeh("p. 2")),
    ],
    ruleOut: [
      inv("laboratory", "Glycated haemoglobin (HbA1c)", "Venous blood", "Undiagnosed or poorly controlled diabetes with suspected NOE", "Raised HbA1c supports diabetes as a risk factor for NOE.", "Send with full blood count, renal function, erythrocyte sedimentation rate (ESR) and C-reactive protein (CRP) when NOE is suspected (RVEEH CPG22.0, p. 2).", "Laboratory-specific adult reference interval; interpret with the reporting laboratory", rveeh("p. 2")),
      inv("laboratory", "ESR and CRP", "Venous blood", "Skull base infection (NOE)", "Raised ESR or CRP in the setting of NOE features.", "Supports NOE and gives a baseline to follow response; part of the NOE work-up (RVEEH CPG22.0, p. 2).", "Laboratory-specific adult reference interval; interpret with the reporting laboratory", rveeh("p. 2")),
      inv("firstLineImaging", "Computed tomography (CT) of the temporal bones", "Temporal bone", "Bone erosion or poor aeration in NOE", "Bony erosion or soft tissue change at the skull base.", "Shows aeration and bone erosion; arrange through ENT when NOE is suspected (RVEEH CPG22.0, p. 2). The pasted draft specified IV contrast; the opened source does not.", "Normal temporal bone, aerated mastoid, no erosion", rveeh("p. 2")),
      inv("advancedImaging", "Magnetic resonance imaging (MRI) with gadolinium", "Skull base and soft tissue", "Soft tissue spread of NOE", "Soft tissue or marrow involvement of the skull base.", "Adds soft tissue detail to CT; specialist decision (RVEEH CPG22.0, p. 2).", "No abnormal enhancement of the skull base", rveeh("p. 2")),
    ],
  },
  clinicalManagement: [
    { id: "examine-and-clean", title: "Examine the ear and clear the canal", timeframe: "At the first assessment, before drops", actions: [
      "Check the TM for perforation or a tube, and ask about diabetes, immunocompromise and radiotherapy (AAO-HNSF 2014, key action statement 2, p. 163).",
      "If the canal is blocked by swelling or debris, clean it gently under direct vision, place a wick, or both (AAO-HNSF 2014, key action statement 6, p. 165). The guideline notes no trial proves cleaning helps.",
      "Pasted advice to use micro-suction or dry mopping and to avoid syringing was not found in the opened sources; confirm locally.",
    ] },
    { id: "treat-pain", title: "Treat the pain", timeframe: "At the first assessment and until pain settles", actions: [
      "Assess pain and give analgesia matched to its severity; AOE pain is often under-treated (AAO-HNSF 2014, key action statement 3, p. 163).",
      "Paracetamol, ibuprofen or diclofenac are used for NOE pain, chosen by renal function and comorbidity (RVEEH CPG22.0, p. 3). Doses are not given in the opened sources; use the product label.",
    ] },
    { id: "topical-treatment", title: "Start topical treatment", timeframe: "At the first assessment, after the canal is clear", actions: [
      "Use topical drops as first-line treatment for uncomplicated diffuse AOE; do not start oral antibiotics unless infection spreads beyond the canal or host factors call for them (AAO-HNSF 2014, key action statements 4 and 5, pp. 163–164).",
      "The guideline does not rank products; patient preference and cost matter (AAO-HNSF 2014, key action statement 5, p. 164).",
      "Known or suspected perforation or tube: prescribe a non-ototoxic preparation (AAO-HNSF 2014, key action statement 7, p. 165). If the TM cannot be seen, treat it as possibly perforated.",
      "Teach drop use: lie with the affected ear up, fill the canal and stay still for 3–5 minutes (AAO-HNSF 2014, key action statement 6 and Table 5, pp. 165, 167).",
      "Continue drops for at least 7 days even if symptoms settle; if symptoms persist, continue for up to 7 more days (AAO-HNSF 2014, Table 4, p. 166).",
      "Product, drops per dose and frequency must come from the product label and hospital formulary; they were not verified here.",
    ] },
    { id: "wick", title: "Use a wick if the canal is closed", timeframe: "When swelling stops drops entering the canal", actions: [
      "Place a wick and apply drops to it so the medicine stays against the canal wall (AAO-HNSF 2014, key action statement 6, p. 165).",
      "Patients should not remove the wick themselves; it may fall out as swelling settles (AAO-HNSF 2014, Table 5, p. 167).",
      "The pasted 48–72 hour wick change was not found in the opened sources; arrange the review with ENT.",
    ] },
    { id: "reassess", title: "Reassess and refer", timeframe: "48–72 hours after starting treatment", actions: [
      "No improvement: reassess the diagnosis and look for another cause (AAO-HNSF 2014, key action statement 8, pp. 165–166).",
      "Refer to ENT if there is no response, the TM cannot be seen, or micro-suction or wick care is not available locally (pasted draft for the last two; not verified in the opened sources).",
    ] },
    { id: "suspected-noe", title: "Escalate suspected necrotizing otitis externa", timeframe: "Same day, as soon as a red flag is found", actions: [
      "Send to hospital for ENT review with infectious diseases input; admission under ENT is the pathway in the opened guideline (RVEEH CPG22.0, pp. 2–3).",
      "Take a canal swab before any topical antibiotic, and avoid topical ciprofloxacin drops when NOE is suspected (RVEEH CPG22.0, pp. 2–3).",
      "Send HbA1c, ESR, CRP, full blood count and renal function; ENT arranges CT of the temporal bones and MRI (RVEEH CPG22.0, p. 2).",
      "Intravenous antibiotic choice and duration are specialist decisions; the opened guideline describes a course of at least 6 weeks (RVEEH CPG22.0, p. 4).",
    ] },
  ],
  medicationPlan: {
    status: "local-protocol-required",
    regimens: [],
    note: "The pasted draft names ciprofloxacin with dexamethasone, ofloxacin, neomycin with polymyxin B and hydrocortisone, ibuprofen and paracetamol, with a 7–10 day course and 3–4 drops twice daily. The opened sources support topical therapy as first line and a non-ototoxic drop with a perforation, but give no product, per-dose volume or analgesic dose, and SFDA registration was not checked. Do not prescribe from this entry; take the product, dose and frequency from the product label and hospital formulary.",
  },
  guidelineComparison: {
    title: "Pasted draft compared with the opened sources",
    columns: ["Pasted draft", "AAO-HNSF 2014", "UK sources"],
    rows: [
      { parameter: "Length of drop course", values: ["7–10 days", "At least 7 days; up to 7 more if symptoms persist (Table 4, p. 166)", "Not opened"] },
      { parameter: "Aminoglycoside drops with a perforation", values: ["Strictly contraindicated", "Use a non-ototoxic preparation when a perforation or tube is known or suspected (key action statement 7, p. 165)", "UK data sheets advise against use with a non-intact TM (Youngs 2016); an ENT-UK consensus allows up to two weeks, seen only as a secondary citation (Mughal 2021)"] },
      { parameter: "Wick review", values: ["Remove or replace at 48–72 hours", "Wick may fall out as swelling settles; patients should not remove it (Table 5, p. 167)", "Not opened"] },
      { parameter: "Imaging if NOE suspected", values: ["CT temporal bone with IV contrast", "NOE outside guideline scope (p. 162)", "RVEEH CPG22.0: CT temporal bones for aeration and erosion, MRI with gadolinium for soft tissue (p. 2)"] },
    ],
    note: "Differences are shown, not reconciled. Where the sources disagree, local ENT protocol decides.",
  },
  teaching: {
    scope: "Adult AOE in primary and urgent care and recognition of NOE; not a paediatric, chronic otitis or fungal otitis externa protocol.",
    learningObjectives: [
      "Choose topical therapy first and match the drop type to the state of the TM.",
      "Know when and how to clean the canal or place a wick so drops reach the skin.",
      "Recognise the red flags for NOE and escalate the same day.",
    ],
    keyPoints: [
      "Topical drops first; oral antibiotics are not first-line for uncomplicated diffuse AOE.",
      "Perforation, tube or an unseen drum: use a non-ototoxic drop.",
      "At least 7 days of drops, up to 7 more if symptoms persist.",
      "No improvement at 48–72 hours: reassess the diagnosis.",
      "Severe deep pain, granulation tissue or a facial palsy in a diabetic or immunocompromised person is NOE until proven otherwise.",
    ],
    pitfalls: [
      "Prescribing aminoglycoside drops without having seen an intact drum.",
      "Starting topical antibiotics before a swab in suspected NOE.",
      "Using pasted doses or durations without checking the product label and formulary.",
      "Missing diabetes as a risk factor in an older patient with severe pain.",
    ],
    references: [
      { ...aao("key action statements 1–8, Tables 4–5, pp. 161–167"), locator: "Key action statements 1–8; Tables 4 and 5; pp. 161–167" },
      { ...rveeh("pp. 1–5"), locator: "Risk, presentation, investigations, admission, antibiotics, pp. 1–5" },
      { ...mughal, locator: "Implications for Practice section (secondary citation on aminoglycosides with a perforation)" },
      { ...youngs, locator: "Editorial text on data sheet advice for a non-intact TM" },
    ],
  },
  nonClinicalManagement: {
    patientEducation: [
      "Show how to instil drops: ear up, canal filled, stay still for 3–5 minutes (AAO-HNSF 2014, Table 5, p. 167).",
      "Finish the course even when symptoms settle (AAO-HNSF 2014, Table 4, p. 166).",
      "Do not clean the ear with cotton swabs or objects (AAO-HNSF 2014, Table 5, p. 167).",
      "Return the same day for facial weakness, spreading redness of the ear or face, or fever (pasted draft).",
    ],
    lifestyleAndDiet: [
      "Keep the ear dry until it has healed; pasted advice is 7–10 days, with a petroleum-jelly cotton ball when washing, and no swimming until resolved (pasted draft; not verified in the opened sources).",
      "People with diabetes should have glucose control reviewed (RVEEH CPG22.0, p. 2).",
    ],
    mdtReferrals: [
      "ENT for no response at 48–72 hours, an unseen TM, wick care or micro-suction (AAO-HNSF 2014, key action statement 8, pp. 165–166).",
      "ENT and infectious diseases for suspected NOE (RVEEH CPG22.0, pp. 2–3).",
      "Primary care or endocrinology for diabetes control.",
    ],
    dischargeCriteria: [
      "Diagnosis of uncomplicated diffuse AOE is clear and no NOE red flag is present.",
      "Pain is controlled with analgesia the patient can take.",
      "The patient can instil the drops and knows how long to continue and when to return.",
    ],
    followUpPlan: "Reassess at 48–72 hours if not improving (AAO-HNSF 2014, key action statement 8, pp. 165–166). If a wick was placed, ENT arranges its review. The pasted routine review at 1–2 weeks to confirm resolution and an intact TM was not verified in the opened sources.",
  },
});

const audit = auditTopicContent(content);
console.log(JSON.stringify({ title: content.title, version: content.version, score: audit.score, passed: `${audit.passedChecks}/${audit.totalChecks}`, failures: audit.failures }, null, 2));

if (process.argv.includes("--apply")) {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
  const { data: existing, error: existingError } = await db.from("guideline_versions").select("id,status,is_current").eq("guideline_id", GUIDELINE_ID).eq("version", VERSION);
  if (existingError) throw existingError;
  if (existing?.length) throw new Error(`Version already exists: ${VERSION}; refusing to overwrite it.`);
  const { data: source, error: sourceError } = await db.from("guideline_versions").select("jurisdiction,created_by").eq("guideline_id", GUIDELINE_ID).limit(1).maybeSingle();
  if (sourceError || !source) throw sourceError ?? new Error("Existing topic source row not found.");
  const row = { id: randomUUID(), guideline_id: GUIDELINE_ID, version: VERSION, version_number: VERSION, status: "under_review", is_current: false, content, source_title: "Clinical Practice Guideline: Acute Otitis Externa, Executive Summary", issuing_organization: "American Academy of Otolaryngology–Head and Neck Surgery Foundation", source_url: AAO_URL, jurisdiction: source.jurisdiction ?? "United States and Australia sources; no Saudi guideline found; applicability to Saudi Arabia requires local review", last_verified_date: DATE, review_date: DATE, created_by: source.created_by, approved_by: null, approved_at: null, published_at: null, change_summary: "User-pasted AOE draft restructured to the authoring standard and checked against AAO-HNSF 2014 and RVEEH CPG22.0, staged 18 Oct 2026. Intake shell retained. Product, dose, SFDA and Saudi-pathway verification pending." };
  const { error } = await db.from("guideline_versions").insert(row);
  if (error) throw error;
  console.log(JSON.stringify({ staged: true, id: row.id, version: row.version, status: row.status, isCurrent: row.is_current }, null, 2));
}
