import "server-only";
import { getApprovedDiseaseGuideline } from "@/lib/data/disease-guidelines";
import { mapInvestigationTableRows } from "@/lib/investigation-table";
import type { InvestigationTableRow } from "@/components/investigation-table";

/** Fetches the validated guideline through Supabase and maps investigations to table props. */
export async function getApprovedInvestigationTableData(
  guidelineId: string,
): Promise<{ state: "ready"; data: InvestigationTableRow[] } | { state: "not-found" | "invalid" | "unavailable"; data: [] }> {
  const result = await getApprovedDiseaseGuideline(guidelineId);
  if (result.state !== "ready") return { state: result.state, data: [] };

  return { state: "ready", data: mapInvestigationTableRows(result.disease.investigations) };
}
