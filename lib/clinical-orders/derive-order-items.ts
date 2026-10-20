import { getMedicationPlan } from "@/lib/data/medication-plans";
import { medicationPathwayIssues, type MedicationRegimen } from "@/lib/medication-pathway";
import type { DiseaseDetail } from "@/lib/validations/disease";
import type { ConditionRule, OrderType, ProposedOrderItem, ProtocolOrderSet } from "@/lib/clinical-orders/types";

/**
 * Turns the STRUCTURED parts of an approved protocol into proposed orders.
 *
 * Sources used (all explicit, authored fields; narrative text is never parsed or guessed from):
 *   - investigations.ruleIn / ruleOut      -> laboratory, imaging and other investigation orders
 *   - medicationPlan.regimens              -> medication orders (dose, route, frequency, duration kept verbatim)
 *   - medicationPlan.regimens[].monitoring -> monitoring orders linked to their medicine
 *   - nonClinicalManagement.followUpPlan   -> one optional follow-up order
 *
 * Nothing here calculates a dose, fills a missing value, or selects an item because a patient "probably" needs it.
 * There is no structured procedure list in the protocol schema yet, so no procedure orders are proposed.
 */

const PLACEHOLDER = /^(?:n\/?a|none|nil|tbc|tbd|-+|not (?:stated|specified|given|available)|see (?:the )?(?:label|bnf|product|local|formulary|guideline)\b.*|per (?:protocol|label|guideline|local)\b.*)$/i;
const DEFERS_TO_LOCAL = /\b(?:local (?:guideline|policy|protocol)|hospital formulary|check (?:the )?formulary|refer to (?:the )?local)\b/i;
const WEIGHT_BASED = /\b(?:mcg|µg|mg|g|units?|ml|mmol|meq)\s*\/\s*(?:kg|m2|m²)|\bper\s*(?:kg|m2|m²)\b|\bweight[- ]based\b/i;

type Investigation = DiseaseDetail["investigations"]["ruleIn"][number];
type MedicationPlan = NonNullable<DiseaseDetail["medicationPlan"]>;

const TIER_TYPE: Record<Investigation["tier"], OrderType> = {
  laboratory: "laboratory",
  firstLineImaging: "imaging",
  advancedImaging: "imaging",
  specializedAdjunctive: "investigation",
};
const TIER_CATEGORY: Record<Investigation["tier"], string> = {
  laboratory: "Laboratory",
  firstLineImaging: "Imaging – first line",
  advancedImaging: "Imaging – advanced",
  specializedAdjunctive: "Specialised / adjunctive investigation",
};

function investigationItems(disease: DiseaseDetail, startOrder: number): ProposedOrderItem[] {
  const items: ProposedOrderItem[] = [];
  let order = startOrder;
  const groups: Array<["ruleIn" | "ruleOut", Investigation[]]> = [["ruleIn", disease.investigations.ruleIn], ["ruleOut", disease.investigations.ruleOut]];
  for (const [group, tests] of groups) {
    tests.forEach((test, index) => {
      // Standard first-step tests (ruleIn laboratory and first-line imaging) are ticked by default.
      // Everything else is offered but left for the doctor to choose: not every listed test is ordered for every patient.
      const standard = group === "ruleIn" && (test.tier === "laboratory" || test.tier === "firstLineImaging");
      const parameters: Record<string, string> = { target: test.modalityTarget, expectedFinding: test.expectedFinding };
      if (test.normalValue) parameters.normalValue = test.normalValue;
      items.push({
        sourceKey: `inv:${group}:${index}`,
        orderType: TIER_TYPE[test.tier],
        orderName: test.testName,
        category: TIER_CATEGORY[test.tier],
        priority: null, // The protocol schema carries no priority; it is never inferred.
        indication: `${group === "ruleIn" ? "To confirm" : "To exclude"}: ${test.targetCondition}`,
        instructions: test.clinicalRationale,
        parameters,
        requiredInformation: [],
        conditionRules: [],
        requirement: standard ? "required" : "optional",
        isOptional: !standard,
        displayOrder: order++,
        preselect: standard,
        incomplete: false,
        references: test.references?.map((reference) => ({ title: reference.title, edition: reference.edition, url: reference.url })) ?? [],
      });
    });
  }
  return items;
}

/**
 * What a medication draft still lacks. Shared by the protocol derivation and by the save step, so a doctor who fills
 * in a missing value (or replaces a weight-based dose with the dose they calculated) clears the flag, and one who
 * clears a value re-raises it. Nothing here supplies or calculates a value.
 */
export function medicationMissingFields(parameters: Record<string, string>): string[] {
  const missing: string[] = [];
  const fields: Array<[string, string]> = [["dose", parameters.dose ?? ""], ["route", parameters.route ?? ""], ["frequency", parameters.frequency ?? ""], ["duration", parameters.duration ?? ""]];
  for (const [label, value] of fields) {
    const trimmed = value.trim();
    if (!trimmed || PLACEHOLDER.test(trimmed) || DEFERS_TO_LOCAL.test(trimmed)) missing.push(`${label} is not specified – the clinician must enter it`);
  }
  if (WEIGHT_BASED.test(parameters.dose ?? "")) missing.push("Weight- or surface-area-based dose – the clinician must calculate the dose for this patient (Marifa does not calculate doses)");
  return missing;
}

function medicationConditions(regimen: MedicationRegimen, plan: MedicationPlan): ConditionRule[] {
  const rules: ConditionRule[] = [];
  if (regimen.branch) {
    const entry = plan.branches?.find((branch) => branch.label === regimen.branch)?.entryCriteria;
    rules.push({ kind: "branch", text: `Pathway “${regimen.branch}”${entry ? `: ${entry}` : ""}` });
  }
  if (regimen.selection === "one-of") {
    const step = regimen.step ?? regimen.indication;
    rules.push({ kind: "alternative", text: regimen.preferred ? `Preferred option for “${step}” – give only one option from this step` : `Alternative option for “${step}” – give only one option from this step` });
  }
  if (regimen.useWhen) rules.push({ kind: "use_when", text: `Use when: ${regimen.useWhen}` });
  return rules;
}

function medicationItems(disease: DiseaseDetail, plan: MedicationPlan, startOrder: number): ProposedOrderItem[] {
  const items: ProposedOrderItem[] = [];
  let order = startOrder;
  plan.regimens.forEach((regimen, index) => {
    const conditionRules = medicationConditions(regimen, plan);
    const conditional = conditionRules.length > 0;
    const parameters: Record<string, string> = { dose: regimen.dose, route: regimen.route, frequency: regimen.frequency, duration: regimen.duration, patientGroup: regimen.patientGroup };
    const requiredInformation = medicationMissingFields(parameters);
    const incomplete = requiredInformation.length > 0;
    if (regimen.branch) parameters.branch = regimen.branch;
    if (regimen.step) parameters.step = regimen.step;
    if (regimen.contraindications?.length) parameters.contraindications = regimen.contraindications.join("\n");
    const references = [{ title: regimen.sourceTitle, edition: regimen.sourceEdition, url: regimen.sourceUrl }];
    const medicationKey = `med:${index}`;
    items.push({
      sourceKey: medicationKey,
      orderType: "medication",
      orderName: regimen.genericName,
      category: "Medication",
      priority: null,
      indication: `${regimen.indication} · ${regimen.patientGroup}`,
      instructions: regimen.adjustments.join("\n"),
      parameters,
      requiredInformation,
      conditionRules,
      requirement: conditional ? "conditional" : "required",
      isOptional: false,
      displayOrder: order++,
      // Conditional medicines are never ticked for the doctor: there is no verified patient data to satisfy the condition.
      preselect: !conditional,
      incomplete,
      references,
    });
    regimen.monitoring.forEach((monitor, monitorIndex) => {
      items.push({
        sourceKey: `mon:${index}:${monitorIndex}`,
        orderType: "monitoring",
        orderName: monitor,
        category: `Monitoring – ${regimen.genericName}`,
        priority: null,
        indication: `Monitoring for ${regimen.genericName}`,
        instructions: "",
        parameters: { linkedMedication: regimen.genericName, linkedSourceKey: medicationKey },
        requiredInformation: [],
        conditionRules: conditional ? [{ kind: "inherited", text: `Applies only if ${regimen.genericName} is given (${conditionRules.map((rule) => rule.text).join("; ")})` }] : [],
        requirement: "optional",
        isOptional: true,
        displayOrder: order++,
        preselect: false,
        incomplete: false,
        references,
      });
    });
  });
  return items;
}

/** All orders a protocol version can propose, plus warnings. Pure and deterministic: same content, same keys. */
export function deriveOrderItems(disease: DiseaseDetail): ProtocolOrderSet {
  const warnings: string[] = [];
  const items: ProposedOrderItem[] = [];
  items.push(...investigationItems(disease, items.length));

  const plan = disease.medicationPlan ?? getMedicationPlan(disease.id);
  if (plan && plan.regimens.length > 0) {
    // Reuse the existing medicine-pathway validation. A plan that fails it is withheld rather than turned into orders.
    const errors = medicationPathwayIssues(plan).filter((issue) => issue.severity === "error");
    if (errors.length > 0) {
      warnings.push(`Medicines were not proposed because this protocol's medicine pathway failed Marifa's pathway validation (${errors.length} issue${errors.length === 1 ? "" : "s"}, for example: ${errors[0].message}). Add medicines manually after review.`);
    } else {
      items.push(...medicationItems(disease, plan, items.length));
    }
  } else if (plan && plan.status === "local-protocol-required") {
    warnings.push("This protocol has no structured medicine regimen yet, so no medication orders were proposed.");
  }

  const followUp = disease.nonClinicalManagement?.followUpPlan?.trim();
  if (followUp) {
    items.push({
      sourceKey: "fup:0",
      orderType: "monitoring",
      orderName: "Follow-up plan",
      category: "Follow-up",
      priority: null,
      indication: "Follow-up recommended by the protocol",
      instructions: followUp,
      parameters: {},
      requiredInformation: [],
      conditionRules: [],
      requirement: "optional",
      isOptional: true,
      displayOrder: items.length,
      preselect: false,
      incomplete: false,
      references: [],
    });
  }
  return { items, warnings };
}

export const hasConfiguredOrders = (set: ProtocolOrderSet) => set.items.length > 0;
