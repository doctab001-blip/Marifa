/** Preserve every existing guideline and version, even when a seed has changed. */
export function newDiseaseRecords<T extends { disease: { id: string } }>(
  records: T[],
  guidelines: Array<{ id: string }>,
  versions: Array<{ guideline_id: string }>,
): T[] {
  const existingIds = new Set([
    ...guidelines.map((row) => row.id),
    ...versions.map((row) => row.guideline_id),
  ]);
  return records.filter(({ disease }) => !existingIds.has(disease.id));
}
