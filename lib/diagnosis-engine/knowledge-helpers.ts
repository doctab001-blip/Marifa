/**
 * Shared types and builders for the Diagnosis Engine reference set.
 * Weights: 3 = highly specific / key feature, 2 = supportive, 1 = non-specific.
 * `classic: true` marks the features reported as "Key missing features" when not entered.
 */
import type { CountryCode } from "@/types/clinical";
import type { UrgencyLevel } from "@/types/diagnosisEngine";

export type FeatureKind = "symptom" | "exam" | "lab" | "imaging";
export type PresentationCluster = "chest-pain" | "dyspnoea" | "abdominal-pain" | "fever" | "headache" | "neuro" | "gi-bleed" | "metabolic" | "airway" | "skin-limb" | "urinary" | "obstetric" | "palpitations";

export interface ProfileFeature {
  label: string;
  kind: FeatureKind;
  weight: 1 | 2 | 3;
  aliases: string[];
  classic?: boolean;
  /** Shared, non-specific finding (fever, tachycardia, vomiting…): supports a condition but cannot qualify it alone. */
  generic?: boolean;
}

export interface ContraFeature {
  label: string;
  weight: 1 | 2 | 3;
  aliases: string[];
}

export interface PathwayRef {
  /** Candidate catalogue topic ids, preferred first. */
  topicIds: string[];
  /** Title fragments used to find the live topic when none of the ids is published. */
  titleHints: string[];
  /** Title shown on the card. */
  title: string;
  /** True for GlobalDiseaseTopic records held in the repository (always resolvable). */
  global?: boolean;
}

export interface DiagnosticProfile {
  key: string;
  title: string;
  icd10Code: string;
  specialty: string;
  urgencyLevel: UrgencyLevel;
  clusters: PresentationCluster[];
  sex?: "female" | "male";
  features: ProfileFeature[];
  against?: ContraFeature[];
  redFlags: string[];
  nextSteps: { testName: string; clinicalRationale: string }[];
  pathway: PathwayRef;
  priors?: ProfilePriors;
  /**
   * Gate features (by label): when listed, the condition is only considered if at least one of them is present,
   * e.g. neutropenic sepsis needs chemotherapy or neutropenia — fever alone does not raise it.
   */
  gate?: string[];
}

/**
 * Context weighting. Outside `ageRange` the condition is not considered (e.g. bronchiolitis after age 2);
 * outside `typicalAge` its score is reduced. `regionWeight` reflects local epidemiology (endemic infections).
 */
export interface ProfilePriors {
  ageRange?: [number, number];
  typicalAge?: [number, number];
  regionWeight?: Partial<Record<CountryCode, number>>;
  /** Short reason shown on the card when region weighting applies. */
  regionNote?: string;
}

export const f = (kind: FeatureKind, label: string, weight: 1 | 2 | 3, aliases: string[], classic = false): ProfileFeature => ({ kind, label, weight, aliases: [label, ...aliases], classic });
export const c = (label: string, weight: 1 | 2 | 3, aliases: string[] = []): ContraFeature => ({ label, weight, aliases: [label, ...aliases] });

// Shared, non-specific findings (flagged generic).
export const g = (feature: ProfileFeature): ProfileFeature => ({ ...feature, generic: true });
export const tachycardia = (weight: 1 | 2 | 3, classic = false) => g(f("exam", "Tachycardia", weight, ["heart rate over 100", "pulse over 100", "sinus tachycardia"], classic));
export const hypotension = (weight: 1 | 2 | 3, classic = false) => g(f("exam", "Hypotension", weight, ["low blood pressure", "systolic bp under 90", "shock", "haemodynamic instability"], classic));
export const hypoxia = (weight: 1 | 2 | 3, classic = false) => g(f("exam", "Hypoxia", weight, ["hypoxaemia", "low spo2", "low oxygen saturation", "desaturation"], classic));
export const tachypnoea = (weight: 1 | 2 | 3, classic = false) => g(f("exam", "Tachypnoea", weight, ["raised respiratory rate", "respiratory rate over 22"], classic));
export const fever = (weight: 1 | 2 | 3, classic = false) => g(f("symptom", "Fever", weight, ["pyrexia", "febrile", "rigors", "raised temperature", "low grade fever"], classic));
export const leukocytosis = (weight: 1 | 2 | 3, classic = false) => g(f("lab", "Leukocytosis", weight, ["raised wbc", "neutrophilia"], classic));
export const raisedCrp = (weight: 1 | 2 | 3) => g(f("lab", "Raised CRP", weight, ["raised c reactive protein"]));
export const vomiting = (weight: 1 | 2 | 3, classic = false) => g(f("symptom", "Nausea or vomiting", weight, ["nausea", "vomiting"], classic));
export const raisedLactate = (weight: 1 | 2 | 3, classic = false) => f("lab", "Raised lactate", weight, ["hyperlactataemia", "lactate over 2"], classic);
export const syncope = (weight: 1 | 2 | 3) => g(f("symptom", "Syncope or collapse", weight, ["syncope", "collapse", "fainting", "loss of consciousness"]));
export const raisedTroponin = (weight: 1 | 2 | 3, classic = false) => f("lab", "Raised troponin", weight, ["troponin rise", "positive troponin"], classic);
export const neckStiffness = (weight: 1 | 2 | 3, classic = false) => f("exam", "Neck stiffness", weight, ["stiff neck", "nuchal rigidity", "meningism"], classic);
