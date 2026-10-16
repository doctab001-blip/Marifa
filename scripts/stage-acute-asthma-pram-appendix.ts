import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { DiseaseDetailSchema } from "../lib/validations/disease";

const GUIDELINE_ID = "b7094a86-5aa2-4e91-856f-0ea66a94c988";
const SOURCE_VERSION = "user-pasted-revision-2026-10-16-v1";
const DATE = "2026-10-16";
const VERSION = "user-pasted-revision-2026-10-16-v2-pram-appendix";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
const { data: source, error: sourceError } = await db.from("guideline_versions").select("*").eq("guideline_id", GUIDELINE_ID).eq("version", SOURCE_VERSION).single();
if (sourceError || !source) throw sourceError ?? new Error("Source revision not found");
const current = DiseaseDetailSchema.parse(source.content);

const content = DiseaseDetailSchema.parse({
  ...current,
  version: VERSION,
  lastReviewed: DATE,
  status: "under_review",
  clinicalReviewStatus: "pending",
  evidenceAudit: {
    ...current.evidenceAudit!,
    checkedOn: DATE,
    findings: [...current.evidenceAudit!.findings, "Added the user-supplied PRAM reference appendix as a bottom-of-topic educational block."],
    unverifiedSections: [...current.evidenceAudit!.unverifiedSections, "The pasted PRAM component table and severity thresholds require clinician verification against the source and local paediatric pathway before approval."],
  },
  teaching: {
    ...current.teaching!,
    guidedApproach: [
      {
        title: "Pediatric Respiratory Assessment Measure (PRAM): purpose and use",
        prompt: "PRAM is a validated, standardized clinical scoring tool used in the Emergency Department (ED) and acute-care settings for children aged 2–17 years.",
        guidance: "Unlike Peak Expiratory Flow (PEF) or spirometry, PRAM uses objective physical-examination findings and pulse oximetry and does not require a cooperative child.\nThe score ranges from 0 to 12 and evaluates suprasternal retractions, scalene muscle contraction, air entry, wheezing and oxygen saturation. Suprasternal retractions and scalene contraction are binary: 0 absent or 2 present.\nScoring reference: suprasternal retractions absent 0/present 2; scalene contraction absent 0/present 2; air entry normal 0, decreased at bases 1, decreased at apex and base 2, minimal or absent/silent chest 3; wheezing absent 0, expiratory only 1, inspiratory and expiratory 2, audible without a stethoscope or silent chest 3; oxygen saturation is scored against the applicable room-air thresholds in the validated PRAM reference and local pathway.",
      },
      {
        title: "PRAM severity classification and clinical interpretation",
        prompt: "Use the total PRAM score to guide immediate treatment and escalation while retaining clinical judgement.",
        guidance: "Mild exacerbation (PRAM 1–3): minimal work of breathing, near-normal air entry and oxygen saturation at or above the local target; continue SABA, assess response and consider discharge only when all discharge criteria are met.\nModerate exacerbation (PRAM 4–7): moderate accessory-muscle use, localized reduction in air entry and oxygen saturation in the locally defined moderate range; repeat SABA, add ipratropium bromide and give early oral systemic corticosteroid when indicated.\nSevere exacerbation or impending failure (PRAM 8–12): severe retractions, widespread reduction in air entry or silent chest and severe hypoxaemia; provide oxygen-driven bronchodilator treatment, adjunctive ipratropium and corticosteroid therapy according to protocol, monitor continuously and obtain immediate paediatric critical-care or Intensive Care Unit (ICU) advice.\nThe pasted severity thresholds and treatment associations remain pending clinician verification.",
      },
      {
        title: "PRAM timing and utility in the ED pathway",
        prompt: "Repeat PRAM at defined points to document response and support disposition.",
        guidance: "Baseline assessment (triage/time 0): establish initial severity and treatment intensity.\nPost-treatment reassessment (60 minutes): reassess after the first hour of bronchodilator therapy.\nDisposition: PRAM 1–3 with sustained response may support discharge when oxygenation, work of breathing, caregiver education and follow-up criteria are satisfied; PRAM 4–7 with partial response requires continued ED observation/treatment or paediatric admission; PRAM 8–12 or a worsening score requires escalation to paediatric critical care or ICU.",
      },
    ],
  },
});
const { data: existing, error: existingError } = await db.from("guideline_versions").select("id").eq("guideline_id", GUIDELINE_ID).eq("version", VERSION);
if (existingError) throw existingError;
if (existing?.length) throw new Error(`Version already exists: ${VERSION}`);
const row = {
  id: randomUUID(), guideline_id: GUIDELINE_ID, version: VERSION, version_number: VERSION,
  status: "under_review", is_current: false, content, source_title: source.source_title,
  issuing_organization: source.issuing_organization, source_url: source.source_url,
  jurisdiction: source.jurisdiction, last_verified_date: DATE, review_date: DATE,
  created_by: source.created_by, approved_by: null, approved_at: null, published_at: null,
  change_summary: "Additive PRAM educational appendix added to the user-pasted paediatric asthma revision. Clinical review pending; prior versions preserved.",
};
const { error: insertError } = await db.from("guideline_versions").insert(row);
if (insertError) throw insertError;
console.log(JSON.stringify({ staged: true, version: VERSION, versionId: row.id, status: row.status, isCurrent: row.is_current, clinicalReviewStatus: content.clinicalReviewStatus }, null, 2));
