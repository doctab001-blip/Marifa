import { ClinicalAlgorithmSchema, DiseaseDetailSchema } from "@/lib/validations/disease";

/** Replace one algorithm (matched by id, else by placement) in a topic; other content is untouched. */
export function replaceAlgorithm(source: any, algorithmJson: unknown, version: string, date: string, gap: string, summaryNote: string) {
  const algorithm = ClinicalAlgorithmSchema.parse(algorithmJson);
  const content = structuredClone(source);
  const list: any[] = content.algorithms ?? [];
  let index = list.findIndex((a) => a.id === algorithm.id);
  if (index < 0) index = list.findIndex((a) => a.placement === algorithm.placement && /nstemi|unstable angina/i.test(a.title + a.id));
  if (index < 0) index = list.findIndex((a) => a.placement === algorithm.placement);
  if (index >= 0) list[index] = algorithm; else list.push(algorithm);
  content.algorithms = list;
  content.evidenceAudit ??= { status: "incomplete", unverifiedSections: [] };
  content.evidenceAudit.unverifiedSections = [...(content.evidenceAudit.unverifiedSections ?? []).filter((g: string) => g !== gap), gap];
  Object.assign(content, { version, status: "under_review", clinicalReviewStatus: "pending", lastReviewed: date });
  return { content: DiseaseDetailSchema.parse(content), replaced: index >= 0, summaryNote };
}
