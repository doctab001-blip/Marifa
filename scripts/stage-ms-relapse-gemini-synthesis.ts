import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { DiseaseDetailSchema } from "../lib/validations/disease";
import { auditTopicContent } from "../lib/clinical-authoring-audit";

const GUIDELINE_ID = "4ff8ba24-207a-462f-972e-ff9ab9cc038b";
const VERSION = "gemini-synthesis-verified-2026-10-19-v1";
const DATE = "2026-10-19";
const SOURCE = {
  title: "Multiple sclerosis in adults: management (NG220)",
  edition: "NICE NG220, recommendations 1.7.1–1.7.18 (relapse and exacerbation)",
  url: "https://www.nice.org.uk/guidance/ng220/chapter/Recommendations",
};

const reference = { ...SOURCE };
const inv = (tier: "laboratory" | "firstLineImaging" | "advancedImaging" | "specializedAdjunctive", testName: string, normalValue: string, expectedFinding: string, clinicalRationale: string) => ({
  tier, testName, modalityTarget: "Adult relapse assessment", targetCondition: "Multiple sclerosis relapse", normalValue, expectedFinding, clinicalRationale, references: [reference],
});

const content = DiseaseDetailSchema.parse({
  id: GUIDELINE_ID,
  title: "Multiple Sclerosis: Relapse Recognition and Community Monitoring",
  specialty: "Neurology / Primary Care",
  authority: "NICE",
  status: "under_review",
  version: VERSION,
  lastReviewed: DATE,
  pillar: "Chronic Care",
  clinicalReviewStatus: "pending",
  evidenceAudit: {
    checkedOn: DATE, status: "incomplete",
    scope: "Adult multiple sclerosis relapse recognition, initial exclusion of infection, timely specialist discussion, treatment pathways and follow-up. Gemini's structure was retained; claims were restricted to the NICE guideline opened on 19 October 2026.",
    findings: ["NICE NG220 recommendations 1.7.1–1.7.18 were opened and used for relapse definition, infection exclusion, timing, specialist discussion, treatment and disposition.", "Gemini-proposed disease mechanisms, investigation ranges, driving guidance and medicine details without a Saudi product/registration check were excluded."],
    unverifiedSections: ["No Saudi national multiple-sclerosis relapse guideline was opened in this task.", "SFDA registration, product strengths, renal/hepatic adjustments and local infusion logistics for methylprednisolone were not checked; use the local neurology protocol and formulary before prescribing.", "Magnetic resonance imaging timing, routine community blood-test panels, disease-modifying therapy selection and driving advice were not verified from the opened relapse section."],
    medscapeStatus: "unavailable", originalVersionIds: [GUIDELINE_ID],
  },
  pathophysiology: {
    summary: "A relapse is a new or worsening neurological episode in established multiple sclerosis after a stable interval, once infection and other causes have been excluded.",
    keyMechanisms: [
      "A relapse presents as new symptoms or worsening of established symptoms that persist for more than 24 hours after at least 1 month of stability (NICE NG220, 1.7.1).",
      "Infection can mimic or precipitate symptom worsening and must be excluded before calling the episode a relapse (NICE NG220, 1.7.2).",
      "Progression and day-to-day symptom fluctuation are alternatives to a relapse and require distinction (NICE NG220, 1.7.2).",
    ], references: [reference],
  },
  presentation: {
    symptoms: ["New neurological symptoms lasting more than 24 hours.", "Worsening of previous neurological symptoms lasting more than 24 hours."],
    physicalSigns: ["New or worsened functional impairment documented against the person's usual baseline.", "Features of urinary or respiratory infection should be actively sought before a relapse diagnosis."],
    redFlags: ["Severe relapse or medical and social needs that cannot be met safely at home: consider inpatient treatment (NICE NG220, 1.7.16).", "Symptoms with suspected infection require infection assessment before relapse treatment (NICE NG220, 1.7.2).", "New symptoms persisting longer than 3 months should not routinely be diagnosed as a relapse (NICE NG220, 1.7.3)."],
    precipitants: ["Urinary tract infection or respiratory infection can account for symptom worsening and must be ruled out (NICE NG220, 1.7.2)."],
  },
  differentials: [
    { condition: "Urinary or respiratory infection", distinguishingFeatures: "Evaluate for infection before diagnosing relapse (NICE NG220, 1.7.2)." },
    { condition: "Multiple sclerosis progression", distinguishingFeatures: "Distinguish gradual progression from an acute relapse (NICE NG220, 1.7.2)." },
    { condition: "Symptom fluctuation", distinguishingFeatures: "Separate transient fluctuation from a qualifying new or worsening episode (NICE NG220, 1.7.2)." },
  ],
  diagnosticCriteria: [
    { criterion: "Multiple sclerosis relapse", threshold: "New symptoms or worsening of existing symptoms for more than 24 hours, without infection or another cause, after a stable period of at least 1 month (NICE NG220, 1.7.1)." },
    { criterion: "Duration needing another explanation", threshold: "Do not routinely diagnose relapse when symptoms have been present for more than 3 months (NICE NG220, 1.7.3)." },
  ],
  investigations: {
    ruleIn: [
      inv("specializedAdjunctive", "Baseline functional assessment", "No numerical adult reference range applies; compare with the person's established function.", "New or worsened function that affects usual tasks.", "Treatment assessment is based on functional impact; assess early and within 14 days when the relapse affects usual tasks (NICE NG220, 1.7.5)."),
      inv("laboratory", "Infection assessment", "No single numerical adult reference range applies; use local laboratory reference intervals when tests are clinically indicated.", "Evidence of urinary or respiratory infection, if present.", "Rule out infection, particularly urinary tract and respiratory infections, before diagnosing relapse (NICE NG220, 1.7.2)."),
    ],
    ruleOut: [
      inv("specializedAdjunctive", "Specialist multiple-sclerosis assessment", "No numerical adult reference range applies; clinical comparison with baseline is required.", "Relapse, progression or symptom fluctuation differentiated by a clinician with MS expertise.", "Non-specialists should discuss the relapse diagnosis and steroid decision with a healthcare professional with MS expertise (NICE NG220, 1.7.6)."),
      inv("laboratory", "Safety assessment before high-dose steroid treatment", "Use local laboratory reference intervals and medicine-specific monitoring.", "Relevant medical or psychological risks, including diabetes or depression, that may affect care setting.", "Hospital treatment may be appropriate where severe relapse or monitoring of conditions such as diabetes or depression is needed (NICE NG220, 1.7.8)."),
      inv("specializedAdjunctive", "Assessment of home support and social-care needs", "No numerical adult reference range applies; assess whether needs can be met safely at home.", "Unmet medical or social care needs during a relapse.", "Identify social-care needs and offer inpatient treatment if the relapse is severe or needs cannot be met at home (NICE NG220, 1.7.15–1.7.16)."),
    ],
  },
  clinicalManagement: [
    { id: "recognise-and-exclude", title: "Recognise the episode and exclude mimics", timeframe: "At first community contact", actions: ["Establish duration and baseline stability; do not diagnose relapse until infection and other causes have been considered (NICE NG220, 1.7.1–1.7.2).", "Do not routinely label symptoms lasting longer than 3 months as a relapse (NICE NG220, 1.7.3)."] },
    { id: "assess-impact", title: "Assess functional impact and contact the MS team", timeframe: "As early as possible", actions: ["Assess relapses that affect usual tasks and offer treatment as early as possible and within 14 days of symptom onset (NICE NG220, 1.7.5).", "Non-specialists must discuss relapse diagnosis and whether steroids are appropriate with an MS-experienced professional (NICE NG220, 1.7.6).", "Tell the MS multidisciplinary team because relapse frequency can affect disease-modifying therapy choices (NICE NG220, 1.7.14)."] },
    { id: "treatment-pathway", title: "Use the specialist-directed treatment pathway", timeframe: "After specialist discussion", actions: ["Not every relapse needs steroids (NICE NG220, 1.7.6).", "Use the local neurology protocol and formulary for any steroid prescription; this topic intentionally omits dosing until SFDA registration and product guidance are checked.", "Discuss potential short-term mental-health and glucose effects of high-dose steroids (NICE NG220, 1.7.12)."] },
    { id: "escalate-and-disposition", title: "Escalate and plan follow-up", timeframe: "Same day for severe or unsafe presentations", actions: ["Offer inpatient treatment for a severe relapse or if medical and social care needs cannot be met at home (NICE NG220, 1.7.16).", "Assess need for additional symptom management, rehabilitation and disease-modifying therapy review (NICE NG220, 1.7.18).", "Ensure relapse pathways include follow-up (NICE NG220, 1.7.4)."] },
  ],
  medicationPlan: { status: "local-protocol-required", regimens: [], note: "NICE NG220 contains methylprednisolone relapse regimens, but this version does not reproduce them: the task has not verified SFDA registration, local product strength, contraindications, dose adjustments or monitoring. Do not prescribe from this topic; discuss with an MS-experienced clinician and use the local neurology protocol." },
  teaching: { scope: "Adults with established multiple sclerosis and a suspected relapse.", learningObjectives: ["Recognise the time-based relapse definition.", "Exclude infection and distinguish progression or fluctuation.", "Escalate a function-limiting or severe relapse through the MS team."], keyPoints: ["A qualifying relapse lasts more than 24 hours after at least 1 month of stability.", "Exclude urinary and respiratory infection before diagnosis.", "Not every relapse needs steroids; specialist discussion is required."], pitfalls: ["Calling infection-related worsening a relapse.", "Delaying contact with MS expertise for a relapse affecting usual tasks.", "Providing a supply of steroids for unsupervised future self-treatment (NICE NG220, 1.7.10)."], references: [{ ...reference, locator: "Recommendations 1.7.1–1.7.18" }] },
  nonClinicalManagement: { patientEducation: ["Explain the relapse definition and the need to report new or worsening symptoms promptly.", "Give information on possible high-dose steroid effects when treatment is considered (NICE NG220, 1.7.12–1.7.13)."], lifestyleAndDiet: ["Maintain the individual care plan while the relapse and infection are assessed."], mdtReferrals: ["Multiple-sclerosis multidisciplinary team.", "Rehabilitation and symptom-management services when indicated (NICE NG220, 1.7.18).", "Inpatient services for severe relapse or unsafe home circumstances (NICE NG220, 1.7.16)."], dischargeCriteria: ["Infection and other causes have been addressed or excluded.", "A specialist-agreed plan, safety-netting and follow-up are documented.", "Medical and social care needs can be met safely outside hospital."], followUpPlan: "Use the local relapse pathway with follow-up; notify the MS multidisciplinary team of the episode (NICE NG220, 1.7.4 and 1.7.14)." },
});

const audit = auditTopicContent(content);
console.log(JSON.stringify({ title: content.title, version: VERSION, score: audit.score, publishable: audit.publishable, failures: audit.failures }, null, 2));
if (process.argv.includes("--apply")) {
  if (!audit.publishable) throw new Error("Refusing to stage a non-publishable version.");
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
  const { data: existing, error: existingError } = await db.from("guideline_versions").select("id").eq("guideline_id", GUIDELINE_ID).eq("version", VERSION);
  if (existingError) throw existingError;
  if (existing?.length) throw new Error(`Version already exists: ${VERSION}; refusing to overwrite it.`);
  const { data: source, error: sourceError } = await db.from("guideline_versions").select("jurisdiction,created_by").eq("guideline_id", GUIDELINE_ID).limit(1).single();
  if (sourceError) throw sourceError;
  const { error } = await db.from("guideline_versions").insert({ id: randomUUID(), guideline_id: GUIDELINE_ID, version: VERSION, version_number: VERSION, status: "under_review", is_current: false, content, source_title: SOURCE.title, issuing_organization: "National Institute for Health and Care Excellence", source_url: SOURCE.url, jurisdiction: source.jurisdiction, last_verified_date: DATE, review_date: DATE, created_by: source.created_by, approved_by: null, approved_at: null, published_at: null, change_summary: "Gemini research skeleton rebuilt against NICE NG220; unverified medicine and local-protocol details excluded. Pending clinical review." });
  if (error) throw error;
  console.log("STAGED", VERSION);
}
