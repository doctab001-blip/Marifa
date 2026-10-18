import { cite, type Ref } from "./common.ts";
export type Citation = ReturnType<typeof cite>;
export type InvTier = "laboratory" | "firstLineImaging" | "advancedImaging" | "specializedAdjunctive";
export const inv = (name: string, target: string, condition: string, finding: string, why: string, normal: string, ref: Citation, tier: InvTier = "laboratory") => ({ name, target, condition, finding, why, normal, ref, tier });
export const noDrug = (note: string) => ({ status: "no-drug-indicated" as const, regimens: [], note });
export const localDrug = (note: string) => ({ status: "local-protocol-required" as const, regimens: [], note });
export const reg = (r: { indication: string; patientGroup: string; genericName: string; dose: string; route: string; frequency: string; duration: string; adjustments: string[]; monitoring: string[]; contraindications: string[]; src: Ref; edition: string }) => ({
  indication: r.indication, patientGroup: r.patientGroup, genericName: r.genericName, dose: r.dose, route: r.route, frequency: r.frequency, duration: r.duration,
  adjustments: r.adjustments, monitoring: r.monitoring, contraindications: r.contraindications, sourceTitle: r.src.title, sourceUrl: r.src.url, sourceEdition: r.edition,
});
export const teachOf = (refs: { ref: Ref; edition: string; locator: string }[], objectives: string[], keyPoints: string[], pitfalls: string[]) => ({
  objectives, keyPoints, pitfalls, refs, patho: refs.map((r) => cite(r.ref, r.edition)),
});
