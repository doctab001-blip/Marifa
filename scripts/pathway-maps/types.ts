import type { MedicationRegimen } from "../../lib/medication-pathway";

export type Sel = "all" | "pref" | "alt";
/** [regimen index in the base version, branch index, step, selection, use-when?, text overrides?] */
export type Row = [number, number, string, Sel, string?, Partial<Pick<MedicationRegimen, "genericName" | "dose" | "route" | "frequency" | "duration" | "indication" | "patientGroup">>?];
/** `id` is the slug of the topic title (lower-case, hyphens, no [brackets]) or the full guideline id.
 * One topic: its branches (label, entry criteria) and where every medicine of the flat list goes. */
export type PathwayMap = { id: string; branches: Array<[label: string, entryCriteria: string]>; rows: Row[] };
