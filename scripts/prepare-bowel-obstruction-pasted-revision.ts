import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { DiseaseDetailSchema, type DiseaseDetail } from "../lib/validations/disease";

const DATE = "2026-10-15";
const VERSION = "user-pasted-revision-2026-10-15-v1";
const sourcePath = path.resolve("data/emergency-versions/bowel-obstruction.emergency-2026-10-12-v1.json");
const outputPath = path.resolve("outputs/bowel-obstruction-pasted-revision-2026-10-15/payload.json");
const current = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as DiseaseDetail;

const revision = {
  ...current,
  status: "under_review" as const,
  version: VERSION,
  lastReviewed: DATE,
  clinicalReviewStatus: "pending" as const,
  evidenceAudit: {
    ...current.evidenceAudit!,
    checkedOn: DATE,
    status: "incomplete" as const,
    scope: "Adult acute bowel obstruction with an explicit small-bowel versus large-bowel obstruction triage fork, emergency assessment, imaging, management and discharge safety-netting.",
    findings: [
      ...current.evidenceAudit!.findings,
      "User-pasted content incorporated as an additive authoring revision on 15 Oct 2026.",
    ],
    unverifiedSections: [
      ...current.evidenceAudit!.unverifiedSections,
      "Large bowel obstruction pathway and its quoted thresholds, recurrence figures and intervention details require specialty review against current local and international guidance.",
      "The pasted revision did not include claim-level source locators; no new clinical claim is treated as approved or published.",
    ],
    originalVersionIds: [current.id],
  },
  pathophysiology: {
    summary: "Initial clinical assessment must differentiate small bowel obstruction (SBO) from large bowel obstruction (LBO). Mechanical obstruction causes proximal dilatation, gas and fluid accumulation, third-space loss, dehydration, electrolyte disturbance and acute kidney injury; rising pressure or a closed loop can cause strangulation, ischaemia, perforation and peritonitis.",
    keyMechanisms: [
      "SBO is commonly caused by adhesions from prior surgery; other causes include incarcerated hernia, Crohn disease, intussusception and volvulus.",
      "LBO is commonly caused by colorectal carcinoma; other causes include sigmoid or caecal volvulus, diverticular strictures and faecal impaction.",
      "A competent ileocaecal valve can create a closed loop in LBO, with rapid caecal distension and increased perforation risk as diameter rises.",
      "Rising intraluminal pressure or closed-loop twisting compromises venous then arterial flow, causing strangulation, ischaemia, perforation and peritonitis.",
      "Physical examination may miss strangulation, so CT and laboratory markers are important in risk assessment.",
    ],
    references: current.pathophysiology.references,
  },
  presentation: {
    symptoms: [
      "SBO: rapid-onset severe colicky periumbilical pain, early frequent bilious vomiting, and progressive distension.",
      "LBO: gradual dull hypogastric or lower-abdominal pain, prominent generalised distension, and late or absent vomiting.",
      "Absolute constipation or no flatus may occur late in SBO and early in LBO.",
    ],
    physicalSigns: [
      "Assess for peritonitis: involuntary guarding, rigidity, rebound tenderness and constant severe pain.",
      "Assess for ischaemia or strangulation: fever, persistent tachycardia, shock and raised lactate.",
      "Examine all hernial orifices for an incarcerated or irreducible hernia.",
      "Review CT for closed-loop obstruction, reduced wall enhancement, pneumoperitoneum or marked caecal dilatation.",
    ],
    redFlags: [
      "Peritonitis or constant severe pain — escalate to surgery immediately.",
      "Fever, persistent tachycardia, refractory shock or lactate above 2.0 mmol/L suggesting ischaemia or strangulation.",
      "CT showing closed-loop obstruction, reduced bowel-wall enhancement, free air or caecal diameter above 12 cm.",
      "Irreducible groin or abdominal-wall hernia with skin change or severe tenderness.",
    ],
    precipitants: [
      "Previous abdominal surgery, hernia, Crohn disease, tumour, volvulus, diverticular stricture or faecal impaction.",
    ],
  },
  differentials: [
    { condition: "Paralytic ileus", distinguishingFeatures: "Absent bowel sounds, diffuse dilatation without a transition point on CT, often postoperative or electrolyte-driven; treat the underlying cause." },
    { condition: "Acute colonic pseudo-obstruction (Ogilvie syndrome)", distinguishingFeatures: "Massive colonic dilatation without a mechanical block on CT; management may include neostigmine or endoscopic decompression." },
    { condition: "Acute mesenteric ischaemia", distinguishingFeatures: "Severe pain out of proportion to examination, high lactate and arterial or venous thrombus on CT angiography; requires emergency vascular or bowel surgery." },
  ],
  investigations: {
    ruleIn: [
      { ...current.investigations.ruleIn[0], testName: "White blood cell count", expectedFinding: "Above 10.0 × 10⁹/L or leukopenia may occur; interpret with the clinical picture.", clinicalRationale: "Leukocytosis or leukopenia may support inflammation or ischaemia and should prompt surgical review when combined with concerning findings.", normalValue: "4.0–11.0 × 10⁹/L" },
      { ...current.investigations.ruleIn[2], testName: "Lactate", expectedFinding: "Above 2.0 mmol/L", clinicalRationale: "A raised lactate supports concern for bowel ischaemia or strangulation when combined with peritonitis or other red flags.", normalValue: "Below 2.0 mmol/L" },
      { ...current.investigations.ruleIn[3], testName: "Electrolytes, urea and creatinine", expectedFinding: "Hypokalaemia and raised urea or creatinine", clinicalRationale: "Reflects third-space loss; correct potassium and restore intravenous hydration to prevent AKI.", normalValue: "Potassium 3.5–5.0 mmol/L" },
      { ...current.investigations.ruleIn[1], testName: "C-reactive protein", expectedFinding: "Above 75 mg/L may support inflammation or peritonitis", clinicalRationale: "Non-specific; do not use it alone to exclude strangulation.", normalValue: "Below 5 mg/L" },
    ],
    ruleOut: [
      { ...current.investigations.ruleOut[0], testName: "CT abdomen and pelvis with intravenous contrast", modalityTarget: "First-line test for haemodynamically stable patients with suspected obstruction", targetCondition: "SBO or LBO", expectedFinding: "SBO transition point and cause; LBO tumour, volvulus, caecal diameter or perforation; closed loop or reduced enhancement indicates emergency.", clinicalRationale: "Defines the level, cause and complications and separates patients needing immediate surgery from those suitable for a monitored pathway." },
      { ...current.investigations.ruleOut[1], testName: "Water-soluble contrast challenge for adhesive SBO", modalityTarget: "Uncomplicated ASBO without strangulation or peritonitis", targetCondition: "ASBO", expectedFinding: "Contrast in the colon at 24 hours supports resolution; absent contrast predicts non-operative failure.", clinicalRationale: "Administer only within an appropriate ASBO pathway and local protocol; do not use it as an LBO protocol." },
      { ...current.investigations.ruleOut[2], testName: "Plain abdominal X-ray", modalityTarget: "Only when CT is unavailable", targetCondition: "Suspected obstruction", expectedFinding: "May show dilated loops or air-fluid levels but can miss early strangulation and the cause.", clinicalRationale: "Low sensitivity and not recommended routinely when CT is available." },
    ],
  },
  clinicalManagement: [
    { id: "sbo-resuscitation", title: "SBO: resuscitation and initial measures", timeframe: "Arrival", actions: ["Resuscitate with balanced crystalloids and correct electrolyte deficits, prioritising potassium replacement.", "Insert a wide-bore 16–18 Fr nasogastric tube to low continuous suction when indicated.", "Give intravenous analgesia and antiemetics and keep the patient strictly nil by mouth."] },
    { id: "sbo-imaging", title: "SBO: diagnostic imaging and triage", timeframe: "Within 2–4 hours", actions: ["Perform urgent CT abdomen and pelvis with intravenous contrast.", "If CT confirms uncomplicated ASBO without ischaemia, free fluid or closed loop, proceed to a monitored non-operative trial."] },
    { id: "sbo-trial", title: "SBO: non-operative trial and contrast protocol", timeframe: "0–72 hours", actions: ["For uncomplicated ASBO, administer 50–100 mL water-soluble contrast via the nasogastric tube and clamp for 1–2 hours according to local protocol.", "Obtain a follow-up abdominal X-ray at 24 hours.", "Contrast in the colon supports continued conservative management; absent contrast at 24 hours, clinical deterioration or persistent high tube output after 72 hours indicates failure and need for surgery."], branches: [{ condition: "Peritonitis, ischaemia, closed loop or clinical deterioration", actions: ["Do not prolong non-operative management; escalate urgently to surgery."] }] },
    { id: "sbo-surgery", title: "SBO: operative intervention", timeframe: "When indicated", actions: ["Operate for peritonitis or ischaemia on initial assessment, or failure of the 72-hour non-operative trial.", "Use open laparotomy or carefully selected laparoscopic adhesiolysis; consider adhesion barriers according to the operative plan."] },
    { id: "lbo-stabilisation", title: "LBO: emergency stabilisation and triage", timeframe: "Immediately", actions: ["Resuscitate with balanced crystalloids, monitor continuously and keep the patient nil by mouth.", "Do not apply the Gastrografin challenge designed for uncomplicated SBO."] },
    { id: "lbo-etiology", title: "LBO: aetiology-specific management", timeframe: "After stabilisation and imaging", actions: ["Malignant obstruction: prepare for urgent resection or a self-expanding metallic stent as a bridge to elective surgery according to specialist assessment.", "Sigmoid volvulus: endoscopic decompression and rectal tube when there is no gangrene or perforation; plan definitive surgery during the same admission.", "Caecal volvulus: endoscopic decompression is rarely effective; arrange operative management such as ileocaecal resection or right hemicolectomy."], branches: [{ condition: "Gangrene or perforation in sigmoid volvulus", actions: ["Skip endoscopic decompression and proceed to emergency laparotomy with the appropriate resection and stoma strategy."] }] },
  ],
  nonClinicalManagement: {
    patientEducation: ["Explain recurrence warning signs: cramping pain, persistent vomiting and increasing abdominal swelling.", "Seek urgent care if symptoms recur or oral intake is not tolerated."],
    lifestyleAndDiet: ["Resume oral intake only after clinical improvement and according to the surgical plan.", "Arrange dietitian review after prolonged nil-by-mouth status when clinically indicated."],
    mdtReferrals: ["General Surgery review for suspected obstruction and all red flags.", "Dietitian review when prolonged nil-by-mouth status or nutritional risk is present."],
    dischargeCriteria: ["Obstruction resolved with passage of flatus or stool, tolerated oral diet and nasogastric tube removed.", "Renal function and serum potassium normalised.", "Pain controlled on oral analgesia."],
    followUpPlan: "Outpatient General Surgery follow-up and explicit safety-netting for recurrent pain, vomiting or abdominal swelling.",
  },
};

const parsed = DiseaseDetailSchema.parse(revision);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2) + "\n");
console.log(`Prepared ${parsed.title} ${parsed.version}: ${outputPath}`);

if (process.argv.includes("--apply")) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data: existing, error: existingError } = await db.from("guideline_versions").select("id").eq("guideline_id", parsed.id).eq("version", parsed.version);
  if (existingError) throw existingError;
  if (existing?.length) {
    console.log(`PRESERVE ${parsed.title}: version already exists`);
  } else {
    const { data: currentRows, error: currentError } = await db.from("guideline_versions").select("source_title,issuing_organization,source_url,jurisdiction,review_date,created_by").eq("guideline_id", parsed.id).eq("is_current", true).limit(1);
    if (currentError) throw currentError;
    const source = currentRows?.[0];
    if (!source) throw new Error(`${parsed.title}: current source version not found.`);
    const row = {
      id: randomUUID(),
      guideline_id: parsed.id,
      version: parsed.version,
      version_number: parsed.version,
      status: "under_review",
      is_current: false,
      content: parsed,
      source_title: source.source_title,
      issuing_organization: source.issuing_organization,
      source_url: source.source_url,
      jurisdiction: source.jurisdiction,
      last_verified_date: DATE,
      review_date: source.review_date,
      created_by: source.created_by,
      approved_by: null,
      approved_at: null,
      published_at: null,
      change_summary: "Additive user-pasted Acute Bowel Obstruction revision staged 15 Oct 2026. Current and historical versions preserved. Clinical review pending; no approval or publication asserted.",
    };
    const { error } = await db.from("guideline_versions").insert(row);
    if (error) throw error;
    console.log(`STAGED ${parsed.title}: ${parsed.version} (under_review, non-current, pending)`);
  }
}
