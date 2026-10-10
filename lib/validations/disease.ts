import { z } from "zod";

const nonEmptyText = z.string().trim().min(1);
const nonEmptyTextArray = z.array(nonEmptyText).min(1);
const isoDate = z.iso.date();

export const DiseaseAuthoritySchema = z.enum(["MOH", "SHC", "PHA", "NICE", "Textbook"]);

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
export type DiseaseSeedBatch = z.infer<typeof DiseaseSeedBatchSchema>;
