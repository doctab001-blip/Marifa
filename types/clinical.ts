export type FirstLineTherapy = {
  drugName: string;
  dose: string;
  sfdaTradeNames: string[];
  clinicalNote?: string;
};

export type SpecialistRestrictions = {
  drugClass: string;
  levelRequired: string;
  regulatoryProgram: string;
};

export type SaudiPracticeProfile = {
  firstLineTherapies: FirstLineTherapy[];
  specialistRestrictions: SpecialistRestrictions;
  redFlags?: string[];
  underlyingConditions?: string[];
};

export type GovernanceMetadata = {
  primaryConsensusSource: string;
  fallbackBasis: string;
  adaptationReasoning: string;
};

export type ClinicalTopic = {
  id: string;
  title: string;
  icd10Code: string;
  saudiPracticeProfile: SaudiPracticeProfile;
  governanceMetadata: GovernanceMetadata;
};

/* ───────────────────────────────────────────────────────────────────────────
 * Multi-region schema (Marifa Saudi Arabia · Marifa India · UK)
 *
 * Universal disease features are shared by every region. Formulary, AMR
 * stewardship and governance data live in one `regionalProfiles` entry per
 * country, so the clinical UI can swap them without touching the disease
 * content. The legacy `ClinicalTopic` (KSA-only) shape above is kept unchanged
 * for existing records.
 * ─────────────────────────────────────────────────────────────────────────── */

export type CountryCode = "SA" | "IN" | "UK";

export interface RegionalTherapy {
  drugName: string;
  dose: string;
  localTradeNames: string[];
  /** e.g. "Max 5 days" — AMR stewardship duration guardrail. */
  durationCap?: string;
  /** e.g. WHO AWaRe "Watch" group warning. */
  stewardshipWarning?: string;
}

export interface RegionalGovernanceMetadata {
  /** e.g. "ICMR / MoHFW (India)" or "MOH (KSA)". */
  primaryConsensusSource: string;
  fallbackBasis?: string;
}

export interface RegionalProfile {
  countryCode: CountryCode;
  countryName: string;
  firstLineTherapies: RegionalTherapy[];
  governanceMetadata: RegionalGovernanceMetadata;
}

export interface GlobalDiseaseTopic {
  id: string;
  title: string;
  icd10Code: string;

  // 1. Universal Data
  universalFeatures: {
    pathophysiology: string;
    clinicalPresentation: { symptoms: string[]; signs: string[]; redFlags: string[] };
    differentials: Array<{ condition: string; distinguishingFeatures: string }>;
  };

  // 2. Regional Profiles (Dynamic Array)
  regionalProfiles: RegionalProfile[];
}
