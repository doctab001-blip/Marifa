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
