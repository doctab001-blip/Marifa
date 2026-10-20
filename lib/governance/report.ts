import { evidenceHealth, type EvidenceHealth } from "./scoring";
import type { EvidenceRow, Rating, StandardRow, StandardStatusRow } from "./types";

export type ReportRow = {
  standard: StandardRow;
  rating: Rating | null;
  health: EvidenceHealth;
  evidenceCount: number;
  assessedAt: string | null;
  nextReviewDue: string | null;
  notes: string;
};

/** One row per standard, in chapter then code order. Pure: the survey report and its CSV share it. */
export function buildReportRows(standards: StandardRow[], statuses: StandardStatusRow[], evidence: EvidenceRow[], today: Date): ReportRow[] {
  const status = new Map(statuses.map((s) => [s.standardId, s]));
  const byStandard = new Map<string, EvidenceRow[]>();
  for (const item of evidence) {
    const list = byStandard.get(item.standardId) ?? [];
    list.push(item);
    byStandard.set(item.standardId, list);
  }
  return [...standards]
    .sort((a, b) => a.chapterCode.localeCompare(b.chapterCode, undefined, { numeric: true }) || a.code.localeCompare(b.code, undefined, { numeric: true }))
    .map((standard) => {
      const items = byStandard.get(standard.id) ?? [];
      const s = status.get(standard.id);
      return {
        standard,
        rating: s?.rating ?? null,
        health: evidenceHealth(items, today),
        evidenceCount: items.filter((i) => !i.withdrawnAt).length,
        assessedAt: s?.assessedAt ?? null,
        nextReviewDue: s?.nextReviewDue ?? null,
        notes: s?.notes ?? "",
      };
    });
}
