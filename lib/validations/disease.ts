import { z } from "zod";
import { ClinicalPathwaySchema } from "@/lib/validations/clinical-pathway";

const nonEmptyText = z.string().trim().min(1);
const nonEmptyTextArray = z.array(nonEmptyText).min(1);
const isoDate = z.iso.date();

export const DiseaseAuthoritySchema = z.enum(["MOH", "SHC", "PHA", "NICE", "ICMR", "MoHFW", "Textbook", "Other"]);

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
  // Optional; legacy regimens without contraindications remain valid.
  contraindications: nonEmptyTextArray.optional(),
  // Optional pathway placement (docs/clinical-topic-authoring-standard.md, "Medicine pathways").
  // A regimen belongs to exactly ONE branch. Inside a branch, regimens sharing a `step` are either
  // all given (`selection: "all"`, the default) or are alternatives where only ONE is chosen
  // (`selection: "one-of"`, with exactly one `preferred`). Legacy flat regimens remain valid.
  branch: nonEmptyText.optional(),
  step: nonEmptyText.optional(),
  selection: z.enum(["all", "one-of"]).optional(),
  preferred: z.boolean().optional(),
  // Condition under which this option is chosen instead of the preferred one.
  useWhen: nonEmptyText.optional(),
  sourceTitle: nonEmptyText,
  sourceUrl: z.url(),
  sourceEdition: nonEmptyText,
}).strict();

/** One clinical pathway branch of a medicine plan: who enters it and in what order its steps run. */
export const MedicationBranchSchema = z.object({
  label: nonEmptyText,
  entryCriteria: nonEmptyText,
}).strict();

/**
 * Board-style (ABIM / MKSAP) single-best-answer question. The vignette is fictitious; every option carries
 * its own explanation so the learner sees why the right answer is right and why each distractor is wrong.
 */
const BoardOptionIdSchema = z.enum(["A", "B", "C", "D", "E"]);
export const BoardQuestionSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  vignette: nonEmptyText,
  fictitious: z.literal(true),
  question: nonEmptyText,
  options: z.array(z.object({ id: BoardOptionIdSchema, text: nonEmptyText, explanation: nonEmptyText }).strict()).min(4).max(5),
  answer: BoardOptionIdSchema,
  educationalObjective: nonEmptyText,
  keyPoint: nonEmptyText,
}).strict().superRefine((value, ctx) => {
  const ids = value.options.map((option) => option.id);
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", path: ["options"], message: "Duplicate option letters" });
  if (ids.join("") !== "ABCDE".slice(0, ids.length)) ctx.addIssue({ code: "custom", path: ["options"], message: "Options must be lettered A, B, C… in order" });
  if (!ids.includes(value.answer)) ctx.addIssue({ code: "custom", path: ["answer"], message: "The answer must be one of the options" });
});

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
    // Optional placement: shown as a full explanation at the end of that page section.
    section: z.enum(["pathophysiology", "signs-symptoms", "investigations", "management"]).optional(),
  }).strict()).min(1).optional(),
  checkpoints: z.array(z.object({
    question: nonEmptyText,
    answer: nonEmptyText,
  }).strict()).min(1).optional(),
  pitfalls: nonEmptyTextArray.optional(),
  keyPoints: nonEmptyTextArray.optional(),
  references: z.array(TeachingReferenceSchema).min(1).optional(),
  // Board-style self-assessment (ABIM / MKSAP method). Optional so legacy versions remain valid.
  boardQuestions: z.array(BoardQuestionSchema).min(1).optional(),
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
 * Clinical algorithm drawn as a flowchart. Nodes form a tree from the first ("start") node: every other node
 * has exactly one parent, so the chart reads top to bottom without crossing lines. Where two branches lead to
 * the same action, repeat the action node. Each algorithm cites the source section it is drawn from.
 */
const algorithmNodeId = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const AlgorithmNodeSchema = z.object({
  id: algorithmNodeId,
  kind: z.enum(["start", "decision", "action", "outcome"]),
  text: nonEmptyText,
  detail: nonEmptyText.optional(),
  next: z.array(z.object({ to: algorithmNodeId, label: nonEmptyText.optional() }).strict()).min(1).optional(),
}).strict();
export const ClinicalAlgorithmSchema = z.object({
  id: algorithmNodeId,
  title: nonEmptyText,
  placement: z.enum(["recognise", "confirm", "manage", "ongoing"]),
  nodes: z.array(AlgorithmNodeSchema).min(2),
  source: z.object({
    title: nonEmptyText,
    edition: nonEmptyText,
    url: z.url().refine((url) => /^https?:\/\//.test(url), "Algorithm sources must use HTTP or HTTPS"),
    locator: nonEmptyText,
  }).strict(),
}).strict().superRefine((value, ctx) => {
  const ids = value.nodes.map((node) => node.id);
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", path: ["nodes"], message: "Duplicate node ids" });
  if (value.nodes[0]?.kind !== "start") ctx.addIssue({ code: "custom", path: ["nodes", 0, "kind"], message: "The first node must be the start node" });
  if (value.nodes.filter((node) => node.kind === "start").length !== 1) ctx.addIssue({ code: "custom", path: ["nodes"], message: "Exactly one start node" });
  const known = new Set(ids);
  const parents = new Map<string, number>();
  value.nodes.forEach((node, index) => {
    if (node.kind === "outcome" && node.next?.length) ctx.addIssue({ code: "custom", path: ["nodes", index, "next"], message: "An outcome node ends the path" });
    if (node.kind !== "outcome" && !node.next?.length) ctx.addIssue({ code: "custom", path: ["nodes", index, "next"], message: "Only outcome nodes may end a path" });
    if (node.kind === "decision") {
      if ((node.next?.length ?? 0) < 2) ctx.addIssue({ code: "custom", path: ["nodes", index, "next"], message: "A decision needs at least two labelled branches" });
      if (node.next?.some((edge) => !edge.label)) ctx.addIssue({ code: "custom", path: ["nodes", index, "next"], message: "Every decision branch needs a label" });
    }
    node.next?.forEach((edge, edgeIndex) => {
      if (!known.has(edge.to)) ctx.addIssue({ code: "custom", path: ["nodes", index, "next", edgeIndex, "to"], message: `Unknown node ${edge.to}` });
      if (edge.to === ids[0]) ctx.addIssue({ code: "custom", path: ["nodes", index, "next", edgeIndex, "to"], message: "No edge may return to the start node" });
      parents.set(edge.to, (parents.get(edge.to) ?? 0) + 1);
    });
  });
  ids.slice(1).forEach((id) => {
    const count = parents.get(id) ?? 0;
    if (count !== 1) ctx.addIssue({ code: "custom", path: ["nodes"], message: `Node ${id} must have exactly one parent (has ${count}); repeat the node instead of joining branches` });
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
      // Optional ordered list of pathway branches (e.g. STEMI, NSTEMI). Required once any regimen sets `branch`.
      branches: z.array(MedicationBranchSchema).min(1).optional(),
      note: nonEmptyText,
    }).strict().optional(),
    // Additive strict pathway payload. Legacy governed versions remain readable unchanged.
    granularPathway: ClinicalPathwaySchema.optional(),
    // Optional emergency-reference blocks; legacy versions without them remain valid.
    diagnosticCriteria: z.array(z.object({ criterion: nonEmptyText, threshold: nonEmptyText }).strict()).min(1).optional(),
    guidelineComparison: GuidelineComparisonSchema.optional(),
    // Optional clinical algorithms rendered as flowcharts inside the matching section.
    algorithms: z.array(ClinicalAlgorithmSchema).min(1).optional(),
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
export type ClinicalAlgorithm = z.infer<typeof ClinicalAlgorithmSchema>;
export type BoardQuestion = z.infer<typeof BoardQuestionSchema>;
export type DiseaseSeedBatch = z.infer<typeof DiseaseSeedBatchSchema>;
