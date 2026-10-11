export interface DiseaseDirectoryEntry {
  id: string;
  diseaseName: string;
  category: string;
  codes: Array<{ system: "ICD-10" | "SNOMED CT"; code: string; preferredTerm: string }>;
}

export interface EvidenceSource {
  id: string;
  publishingBody: "Saudi MOH" | "Saudi Health Council" | "ADA" | "ACC/AHA" | "ESC" | "NICE" | "PHA" | "Other";
  publicationYear?: number | null;
  guidelineTitle: string;
  url: string;
  hierarchyRank: number;
}

export interface ExactDosing {
  loadingDose: string | null;
  maintenanceDose: string | null;
  route: string | null;
  duration: string | null;
}

export interface ClinicalAction {
  id: string;
  instruction: string;
  strictTimeframe?: string | null;
  exactDosing?: ExactDosing | null;
}

export interface ClinicalGuideline {
  id: string;
  diseaseId: string;
  source: EvidenceSource;
  investigativeSteps: ClinicalAction[];
  pharmacologicalSteps: ClinicalAction[];
  strictTimeframes: string[];
  exactDosing: ExactDosing[];
}

function doseCompleteness(dose: ExactDosing): number {
  return [dose.loadingDose, dose.maintenanceDose, dose.route, dose.duration]
    .filter((value) => typeof value === "string" && value.trim().length > 0).length;
}

function granularity(guideline: ClinicalGuideline): readonly number[] {
  const doses = [...guideline.exactDosing, ...guideline.pharmacologicalSteps.flatMap((step) => step.exactDosing ? [step.exactDosing] : [])];
  const exactDoseFields = doses.reduce((sum, dose) => sum + doseCompleteness(dose), 0);
  const completeDoseEntries = doses.filter((dose) => doseCompleteness(dose) === 4).length;
  const explicitTimeframes = [...guideline.strictTimeframes, ...guideline.investigativeSteps, ...guideline.pharmacologicalSteps]
    .filter((item) => typeof item === "string" ? item.trim().length > 0 : Boolean(item.strictTimeframe?.trim())).length;
  const structuredActions = guideline.investigativeSteps.length + guideline.pharmacologicalSteps.length;
  return [completeDoseEntries, exactDoseFields, explicitTimeframes, structuredActions];
}

/**
 * Selects the most granular candidate first, then the highest authority (lowest rank).
 * This is a deterministic ingestion/display preference, not clinical approval; retain
 * every candidate and its source for human review whenever recommendations conflict.
 */
export function resolveClinicalGuideline(candidates: readonly ClinicalGuideline[]): ClinicalGuideline {
  if (candidates.length === 0) throw new Error("At least one clinical guideline is required");
  return [...candidates].sort((a, b) => {
    const aScore = granularity(a);
    const bScore = granularity(b);
    for (let i = 0; i < aScore.length; i += 1) {
      if (aScore[i] !== bScore[i]) return bScore[i] - aScore[i];
    }
    return a.source.hierarchyRank - b.source.hierarchyRank
      || (b.source.publicationYear ?? 0) - (a.source.publicationYear ?? 0)
      || a.id.localeCompare(b.id);
  })[0];
}
