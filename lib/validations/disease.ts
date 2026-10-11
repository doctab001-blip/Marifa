import { z } from "zod";
import { ClinicalPathwaySchema } from "@/lib/validations/clinical-pathway";

const nonEmptyText = z.string().trim().min(1);
const nonEmptyTextArray = z.array(nonEmptyText).min(1);
const isoDate = z.iso.date();

export const DiseaseAuthoritySchema = z.enum(["MOH", "SHC", "PHA", "NICE", "Textbook", "Other"]);

export const DiseaseStatusSchema = z.enum([
  "draft",
  "under_review",
  "approved",
  "published",
  "superseded",
  "archived",
]);

export const ModelOfCarePillarSchema = z.enum([
  "Urgent Care",
  "Chronic Care",
  "Keep Well",
  "Planned Care",
  "Safe Birth",
  "Palliative Care",
]);

export const InvestigationSchema = z
  .object({
    tier: z.enum(["laboratory", "firstLineImaging", "advancedImaging", "specializedAdjunctive"]),
    testName: nonEmptyText,
    modalityTarget: nonEmptyText,
    targetCondition: nonEmptyText,
    expectedFinding: nonEmptyText,
    clinicalRationale: nonEmptyText,
    // Optional emergency-reference fields. Reference ranges are laboratory-specific.
    normalValue: nonEmptyText.optional(),
    pros: nonEmptyTextArray.optional(),
    cons: nonEmptyTextArray.optional(),
    references: z.array(z.object({
      title: nonEmptyText,
      edition: nonEmptyText,
      url: z.url().refine((url) => /^https?:\/\//.test(url), "Clinical references must use HTTP or HTTPS"),
    }).strict()).min(1).optional(),
  })
  .strict();

export const PathwayBranchSchema = z
  .object({
    condition: nonEmptyText,
    actions: nonEmptyTextArray,
  })
  .strict();

export const ClinicalManagementStepSchema = z
  .object({
    id: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: nonEmptyText,
    timeframe: nonEmptyText,
    actions: nonEmptyTextArray,
    branches: z.array(PathwayBranchSchema).min(1).optional(),
  })
  .strict();

export const MedicationRegimenSchema = z.object({
  indication: nonEmptyText,
  patientGroup: nonEmptyText,
  genericName: nonEmptyText,
  dose: nonEmptyText,
  route: nonEmptyText,
  frequency: nonEmptyText,
  duration: nonEmptyText,
  adjustments: nonEmptyTextArray,
  monitoring: nonEmptyTextArray,
  sourceTitle: nonEmptyText,
  sourceUrl: z.url(),
  sourceEdition: nonEmptyText,
}).strict();

const TeachingReferenceSchema = z.object({
  title: nonEmptyText,
  edition: nonEmptyText,
  url: z.url().refine((url) => /^https?:\/\//.test(url), "Teaching references must use HTTP or HTTPS"),
  locator: nonEmptyText.optional(),
}).strict();

/**
 * Optional teaching layer. It guides a learner through the six verified clinical
 * sections; it must not introduce doses, thresholds or timings that the clinical
 * sections and their sources do not already support.
 */
export const TeachingGuideSchema = z.object({
  scope: nonEmptyText.optional(),
  learningObjectives: nonEmptyTextArray,
  vignette: z.object({
    text: nonEmptyText,
    fictitious: z.literal(true),
  }).strict().optional(),
  guidedApproach: z.array(z.object({
    title: nonEmptyText,
    prompt: nonEmptyText,
    guidance: nonEmptyText,
  }).strict()).min(1).optional(),
  checkpoints: z.array(z.object({
    question: nonEmptyText,
    answer: nonEmptyText,
  }).strict()).min(1).optional(),
  pitfalls: nonEmptyTextArray.optional(),
  keyPoints: nonEmptyTextArray.optional(),
  references: z.array(TeachingReferenceSchema).min(1).optional(),
}).strict();

/** Side-by-side comparison of guidelines that disagree; conflicts are shown, never merged. */
export const GuidelineComparisonSchema = z.object({
  title: nonEmptyText,
  columns: z.array(nonEmptyText).min(2).max(4),
  rows: z.array(z.object({ parameter: nonEmptyText, values: nonEmptyTextArray }).strict()).min(1),
  note: nonEmptyText.optional(),
}).strict().superRefine((value, ctx) => {
  value.rows.forEach((row, index) => {
    if (row.values.length !== value.columns.length) ctx.addIssue({ code: "custom", path: ["rows", index, "values"], message: "Each row needs one value per column" });
  });
});

/**
 * Canonical six-tier disease-management payload stored in guideline_versions.content.
 * Every nested object is strict so ingestion fails on misspelled or undocumented keys.
 */
export const DiseaseDetailSchema = z
  .object({
    id: z.uuid(),
    title: nonEmptyText,
    specialty: nonEmptyText,
    speciality: nonEmptyText.optional(),
    sub_specialities: nonEmptyTextArray.optional(),
    authority: DiseaseAuthoritySchema,
    status: DiseaseStatusSchema,
    version: nonEmptyText,
    lastReviewed: isoDate,
    pillar: ModelOfCarePillarSchema,
    clinicalScenario: nonEmptyText.optional(),
    clinicalReviewStatus: z.literal("pending").optional(),
    evidenceAudit: z.object({
      checkedOn: isoDate,
      status: z.literal("incomplete"),
      scope: nonEmptyText,
      findings: nonEmptyTextArray,
      unverifiedSections: nonEmptyTextArray,
      medscapeStatus: z.enum(["limited-comparison", "unavailable"]),
      originalVersionIds: z.array(z.uuid()).min(1),
    }).strict().optional(),
    pathophysiology: z
      .object({
        summary: nonEmptyText,
        keyMechanisms: nonEmptyTextArray,
        references: z.array(z.object({
          title: nonEmptyText,
          edition: nonEmptyText,
          url: z.url(),
        }).strict()).optional(),
      })
      .strict(),
    presentation: z
      .object({
        symptoms: nonEmptyTextArray,
        physicalSigns: nonEmptyTextArray,
        redFlags: nonEmptyTextArray,
        precipitants: nonEmptyTextArray.optional(),
      })
      .strict(),
    differentials: z
      .array(
        z
          .object({
            condition: nonEmptyText,
            distinguishingFeatures: nonEmptyText,
          })
          .strict(),
      )
      .min(1),
    investigations: z
      .object({
        ruleIn: z.array(InvestigationSchema).min(1),
        ruleOut: z.array(InvestigationSchema).min(1),
      })
      .strict(),
    clinicalManagement: z.array(ClinicalManagementStepSchema).min(1),
    medicationPlan: z.object({
      status: z.enum(["source-verified", "no-drug-indicated", "local-protocol-required"]),
      regimens: z.array(MedicationRegimenSchema),
      note: nonEmptyText,
    }).strict().optional(),
    // Additive strict pathway payload. Legacy governed versions remain readable unchanged.
    granularPathway: ClinicalPathwaySchema.optional(),
    // Optional emergency-reference blocks; legacy versions without them remain valid.
    diagnosticCriteria: z.array(z.object({ criterion: nonEmptyText, threshold: nonEmptyText }).strict()).min(1).optional(),
    guidelineComparison: GuidelineComparisonSchema.optional(),
    // Additive teaching and guiding layer; legacy versions without it remain valid.
    teaching: TeachingGuideSchema.optional(),
    nonClinicalManagement: z
      .object({
        patientEducation: nonEmptyTextArray,
        lifestyleAndDiet: nonEmptyTextArray,
        mdtReferrals: nonEmptyTextArray,
        dischargeCriteria: nonEmptyTextArray,
        followUpPlan: nonEmptyText,
      })
      .strict(),
  })
  .strict();

export const DiseaseSeedBatchSchema = z.array(DiseaseDetailSchema).min(1);

export type DiseaseDetail = z.infer<typeof DiseaseDetailSchema>;
export type TeachingGuide = z.infer<typeof TeachingGuideSchema>;
export type DiseaseSeedBatch = z.infer<typeof DiseaseSeedBatchSchema>;
