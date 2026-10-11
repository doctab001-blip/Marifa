import { z } from "zod";

const text = z.string().trim().min(1);
export const GuidelineSourceSchema = z.object({
  id: z.uuid(),
  title: text,
  issuer: z.enum(["MOH", "SHC", "ADA", "ACC/AHA", "ESC", "NICE", "PHA", "Textbook", "Other"]),
  edition: text,
  url: z.url().refine((value) => value.startsWith("https://"), "An exact HTTPS guideline URL is required"),
  locator: text, // Guideline section, table or recommendation number.
  primary_source: z.boolean(),
}).strict();

const evidence = z.object({
  sources: z.array(GuidelineSourceSchema).min(1),
  selection_rationale: text,
}).strict().superRefine(({ sources }, ctx) => {
  if (sources.filter((source) => source.primary_source).length !== 1) {
    ctx.addIssue({ code: "custom", path: ["sources"], message: "Select exactly one primary source for this scope" });
  }
  if (new Set(sources.map((source) => source.id)).size !== sources.length) {
    ctx.addIssue({ code: "custom", path: ["sources"], message: "Duplicate source IDs" });
  }
});

// Do not fabricate a loading dose when the guideline explicitly requires none.
export const ExactDoseSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("exact"), amount: z.number().positive(), unit: text, frequency: text, duration: text }).strict(),
  z.object({ kind: z.literal("not-indicated"), reason: text }).strict(),
]);
export const MedicineDoseSchema = z.object({
  id: text,
  medicine: text,
  indication: text,
  patient_group: text,
  loading_dose: ExactDoseSchema,
  maintenance_dose: ExactDoseSchema,
  route: text,
  contraindications: z.array(text).min(1),
  adjustments: z.array(text).min(1),
  monitoring: z.array(text).min(1),
  evidence,
}).strict();
const action = z.object({ instruction: text, timeframe: text }).strict();
const branch = z.object({
  id: text, condition: text,
  actions: z.array(action).min(1),
  Medicines_Doses: z.array(MedicineDoseSchema),
  evidence,
}).strict();
export const ClinicalPathwaySchema = z.object({
  schema_version: z.literal(1),
  evidence,
  Investigations: z.array(z.object({
    id: text, title: text, timeframe: text,
    steps: z.array(z.object({
      test: text, clinical_question: text, expected_finding: text,
      decision_rationale: text, timeframe: text,
    }).strict()).min(1),
    evidence,
  }).strict()).min(1),
  Treatment_Plan: z.array(z.object({
    id: text, title: text, timeframe: text,
    actions: z.array(action).min(1),
    Medicines_Doses: z.array(MedicineDoseSchema),
    branches: z.array(branch),
    evidence,
  }).strict()).min(1),
}).strict();

// Interfaces follow the runtime ingestion contract; required fields cannot be omitted.
export type GuidelineSource = z.infer<typeof GuidelineSourceSchema>;
export type Medicines_Doses = z.infer<typeof MedicineDoseSchema>;
type InvestigationsShape = z.infer<typeof ClinicalPathwaySchema>["Investigations"][number];
type TreatmentPlanShape = z.infer<typeof ClinicalPathwaySchema>["Treatment_Plan"][number];
export type Investigations = InvestigationsShape;
export type Treatment_Plan = TreatmentPlanShape;
export type ClinicalPathwayPayload = z.infer<typeof ClinicalPathwaySchema>;

/** Conflicts remain visible; a recorded scope-specific choice selects the governing evidence. */
export function primarySource(sources: GuidelineSource[]): GuidelineSource {
  const selected = sources.filter((source) => source.primary_source);
  if (selected.length !== 1) throw new Error("Exactly one primary guideline source is required");
  return selected[0];
}
