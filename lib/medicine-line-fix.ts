import { DiseaseDetailSchema } from "@/lib/validations/disease";
import { cleanAdjustments, isAntibiotic, isEmptyAdjustment } from "@/lib/medicine-adjustments";
import { renalHepaticLines } from "@/lib/medicine-renal-hepatic";

export const MEDLINES_DATE = "2026-10-26";
const NOTE = "CKD and CLD lines revised on 26 Oct 2026 from standard references (BNF, EMA/FDA labels, KDIGO); clinician confirmation pending.";
const GAP = "CKD and CLD adjustments were written from standard reference knowledge (BNF, EMA/FDA labels, KDIGO) and were not re-opened against the source pages; a clinician must confirm each line before sign-off.";

export function medlinesVersion(india: boolean, tag = "v1") { return `${india ? "india-" : ""}medlines-2026-10-26-${tag}`; }

export function fixContent(source: any, version: string): { content: any; changed: number; unmatched: string[] } {
  const content = structuredClone(source); let changed = 0; const unmatched: string[] = [];
  for (const regimen of content.medicationPlan?.regimens ?? []) {
    const before = JSON.stringify(regimen.adjustments);
    const hadCkd = regimen.adjustments.some((l: string) => l.startsWith("CKD:") && !isEmptyAdjustment(l));
    const hadCld = regimen.adjustments.some((l: string) => l.startsWith("CLD:") && !isEmptyAdjustment(l));
    let lines: string[] = cleanAdjustments(regimen.adjustments, regimen.genericName);
    if (!hadCkd || !hadCld) {
      const rule = renalHepaticLines(regimen.genericName);
      if (!rule) unmatched.push(regimen.genericName);
      else { if (!hadCkd) lines.push(`CKD: ${rule.ckd}`); if (!hadCld) lines.push(`CLD: ${rule.cld}`); }
    }
    if (!isAntibiotic(regimen.genericName)) lines = lines.filter((l) => !/^Penicillin allergy:/i.test(l));
    regimen.adjustments = lines;
    if (JSON.stringify(lines) !== before) changed++;
  }
  if (!changed) return { content: source, changed: 0, unmatched };
  const plan = content.medicationPlan; if (plan && !String(plan.note ?? "").includes(NOTE)) plan.note = `${plan.note ?? ""} ${NOTE}`.trim();
  content.evidenceAudit ??= { status: "incomplete", unverifiedSections: [] };
  content.evidenceAudit.unverifiedSections = [...(content.evidenceAudit.unverifiedSections ?? []).filter((g: string) => g !== GAP), GAP];
  Object.assign(content, { version, status: "under_review", clinicalReviewStatus: "pending", lastReviewed: MEDLINES_DATE });
  return { content: DiseaseDetailSchema.parse(content), changed, unmatched };
}

