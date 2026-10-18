import type { InvestigationTableRow } from "@/components/investigation-table";
import { investigationDisplayTier, investigationMethod, investigationNeedsReview } from "@/lib/investigation-display";
import type { DiseaseDetail } from "@/lib/validations/disease";

export function mapInvestigationTableRows(
  investigations: DiseaseDetail["investigations"],
): InvestigationTableRow[] {
  return (["ruleIn", "ruleOut"] as const).flatMap((purposeGroup) =>
    investigations[purposeGroup].map((item) => ({
      investigation: item.testName,
      measures: investigationMethod(item) ?? undefined,
      target: item.targetCondition,
      normal: item.normalValue ?? "Not stated",
      finding: item.expectedFinding,
      meaning: item.clinicalRationale,
      source: item.references?.[0]?.edition,
      group: investigationDisplayTier(item),
      purpose: purposeGroup === "ruleIn" ? ("confirms" as const) : ("excludes" as const),
      ...(investigationNeedsReview(item) ? { badge: "Specific details awaiting review" } : {}),
    })),
  );
}
