import type { InvestigationTableRow } from "@/components/investigation-table";
import { investigationMethod, investigationNeedsReview } from "@/lib/investigation-display";
import type { DiseaseDetail } from "@/lib/validations/disease";

export function mapInvestigationTableRows(
  investigations: DiseaseDetail["investigations"],
): InvestigationTableRow[] {
  return (["ruleIn", "ruleOut"] as const).flatMap((group) =>
    investigations[group].map((item) => ({
      investigation: item.testName,
      target: [item.targetCondition, investigationMethod(item) ? `Method & clinical context: ${investigationMethod(item)}` : null]
        .filter(Boolean)
        .join("\n"),
      rationale: item.clinicalRationale,
      interpretation: item.expectedFinding,
      ...(investigationNeedsReview(item) ? { badge: "Specific details awaiting review" } : {}),
    })),
  );
}
