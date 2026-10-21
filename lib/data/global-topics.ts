import { z } from "zod";
import type { GlobalDiseaseTopic } from "@/types/clinical";
import entericFever from "@/data/global-topics/enteric-fever.json";

const therapySchema = z.object({
  drugName: z.string().min(1),
  dose: z.string().min(1),
  localTradeNames: z.array(z.string()),
  durationCap: z.string().optional(),
  stewardshipWarning: z.string().optional(),
});

const regionalProfileSchema = z.object({
  countryCode: z.enum(["SA", "IN", "UK"]),
  countryName: z.string().min(1),
  firstLineTherapies: z.array(therapySchema),
  governanceMetadata: z.object({
    primaryConsensusSource: z.string().min(1),
    fallbackBasis: z.string().optional(),
  }),
});

export const globalDiseaseTopicSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  icd10Code: z.string().min(1),
  universalFeatures: z.object({
    pathophysiology: z.string(),
    clinicalPresentation: z.object({ symptoms: z.array(z.string()), signs: z.array(z.string()), redFlags: z.array(z.string()) }),
    differentials: z.array(z.object({ condition: z.string(), distinguishingFeatures: z.string() })),
  }),
  regionalProfiles: z.array(regionalProfileSchema).refine(
    (profiles) => new Set(profiles.map((profile) => profile.countryCode)).size === profiles.length,
    "Each country may have only one regional profile.",
  ),
});

/** Multi-region topics held as reviewed JSON in the repository (demonstration data; pending clinical review). */
const GLOBAL_TOPIC_SOURCES: unknown[] = [entericFever];

export type GlobalTopicResult =
  | { state: "ready"; topic: GlobalDiseaseTopic }
  | { state: "invalid"; issues: string[] }
  | { state: "not-found" };

export function getGlobalDiseaseTopic(id: string): GlobalTopicResult {
  const source = GLOBAL_TOPIC_SOURCES.find((entry) => (entry as { id?: unknown })?.id === id);
  if (!source) return { state: "not-found" };
  const parsed = globalDiseaseTopicSchema.safeParse(source);
  if (!parsed.success) return { state: "invalid", issues: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`) };
  const topic: GlobalDiseaseTopic = parsed.data;
  return { state: "ready", topic };
}

export function listGlobalDiseaseTopicIds(): string[] {
  return GLOBAL_TOPIC_SOURCES.map((entry) => String((entry as { id?: unknown })?.id ?? "")).filter(Boolean);
}
