import type { DiagnosticEngineResponse, DiagnosticInputState, FindingDomain } from "@/types/diagnosisEngine";

const DOMAIN_LABEL: Record<FindingDomain, string> = { symptoms: "Symptoms", examFindings: "Examination", labInvestigations: "Laboratory", imagingFindings: "Imaging" };
const URGENCY_TEXT = { CRITICAL_MUST_NOT_MISS: "MUST-NOT-MISS", HIGH: "High priority", ROUTINE: "Routine" } as const;

/** Plain-text summary for copying into notes or a handover. Contains only what was entered — no identifiers. */
export function summaryText(input: DiagnosticInputState, result: DiagnosticEngineResponse, origin = "") {
  const when = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(result.timestamp));
  const lines = [`Marifa Diagnosis Engine — ${when}`, "Decision support only, not a diagnosis.", ""];
  const context = [input.age !== undefined ? `Age ${input.age}` : null, input.gender && input.gender !== "all" ? input.gender : null, input.region ? `Region ${input.region}` : null].filter(Boolean);
  if (context.length) lines.push(`Context: ${context.join(", ")}`);
  for (const domain of Object.keys(DOMAIN_LABEL) as FindingDomain[]) {
    if (input[domain]?.length) lines.push(`${DOMAIN_LABEL[domain]}: ${input[domain].join("; ")}`);
  }
  if (result.inputInterpretation?.length) {
    lines.push(`Read from values: ${result.inputInterpretation.map((item) => `${item.original} → ${item.interpretedAs.join(", ")}`).join("; ")}`);
  }
  lines.push("", "Ranked differentials:");
  result.topDifferentials.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.diseaseTitle} (ICD-10 ${item.icd10Code}) — ${item.matchScore}% — ${URGENCY_TEXT[item.urgencyLevel]}`);
    const matched = [...item.matchedFeatures.symptomsMatched, ...item.matchedFeatures.examMatched, ...item.matchedFeatures.labsMatched, ...item.matchedFeatures.imagingMatched];
    if (matched.length) lines.push(`   For: ${matched.join("; ")}`);
    if (item.contradictingFindings.length) lines.push(`   Against: ${item.contradictingFindings.join("; ")}`);
    if (item.missingClassicFeatures.length) lines.push(`   Not yet found: ${item.missingClassicFeatures.slice(0, 3).join("; ")}`);
    lines.push(`   Next: ${item.suggestedNextSteps.slice(0, 3).map((step) => step.testName).join("; ")}`);
    lines.push(`   Pathway: ${item.pathwayTitle} — ${origin}${item.marifaPathwayUrl}`);
  });
  if (result.discriminatingFindings?.length) {
    lines.push("", "Would separate these:");
    for (const item of result.discriminatingFindings) lines.push(`- ${item.finding} (${item.kind}) → supports ${item.supports.join(", ")}${item.howToCheck ? ` · check: ${item.howToCheck}` : ""}`);
  }
  lines.push("", result.clinicalSafetyNotice);
  return lines.join("\n");
}
