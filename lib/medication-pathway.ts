import type { DiseaseDetail } from "@/lib/validations/disease";

/**
 * Medicine pathway rules (docs/clinical-topic-authoring-standard.md, "Medicine pathways").
 *
 * A medicine plan is a decision pathway, not a drug list:
 *  - every regimen sits in exactly one BRANCH (the patient group or pathway it applies to, e.g. STEMI, NSTEMI);
 *  - inside a branch, regimens that share a STEP are either all given together (`selection: "all"`)
 *    or are alternatives where ONE is chosen (`selection: "one-of"`, exactly one `preferred`);
 *  - two different drugs from the same exclusive class (two P2Y12 inhibitors, two parenteral anticoagulants,
 *    two thrombolytics) can never both be "all".
 */
export type MedicationPlan = NonNullable<DiseaseDetail["medicationPlan"]>;
export type MedicationRegimen = MedicationPlan["regimens"][number];

export type MedicationPathwayIssue = {
  rule:
    | "unbranched"
    | "branch-list"
    | "step-required"
    | "one-of-size"
    | "one-of-preferred"
    | "mixed-selection"
    | "use-when"
    | "exclusive-class"
    | "same-class"
    | "embedded-alternative"
    | "unused-branch";
  severity: "error" | "warning";
  medicine?: string;
  branch?: string;
  message: string;
};

type DrugClass = { name: string; strict: boolean; drugs: string[] };

/**
 * Drugs that are never co-prescribed for the same indication (strict) or normally are not (soft).
 * Strict conflicts fail the authoring audit; soft ones are reported as warnings for the author to confirm.
 */
export const EXCLUSIVE_DRUG_CLASSES: DrugClass[] = [
  { name: "P2Y12 inhibitor", strict: true, drugs: ["ticagrelor", "clopidogrel", "prasugrel", "cangrelor"] },
  { name: "parenteral anticoagulant", strict: true, drugs: ["enoxaparin", "dalteparin", "tinzaparin", "fondaparinux", "bivalirudin", "argatroban", "heparin"] },
  { name: "thrombolytic", strict: true, drugs: ["alteplase", "tenecteplase", "reteplase", "streptokinase"] },
  { name: "oral anticoagulant", strict: true, drugs: ["rivaroxaban", "apixaban", "edoxaban", "dabigatran", "warfarin"] },
  { name: "renin–angiotensin blocker", strict: true, drugs: ["ramipril", "enalapril", "lisinopril", "perindopril", "captopril", "losartan", "valsartan", "candesartan", "irbesartan", "telmisartan", "olmesartan", "sacubitril"] },
  { name: "statin", strict: true, drugs: ["atorvastatin", "rosuvastatin", "simvastatin", "pravastatin", "pitavastatin"] },
  { name: "proton pump inhibitor", strict: true, drugs: ["omeprazole", "esomeprazole", "pantoprazole", "lansoprazole", "rabeprazole"] },
  { name: "penicillin", strict: false, drugs: ["co-amoxiclav", "amoxicillin", "flucloxacillin", "cloxacillin", "piperacillin", "benzylpenicillin", "phenoxymethylpenicillin", "penicillin", "ampicillin"] },
  { name: "cephalosporin", strict: false, drugs: ["ceftriaxone", "cefuroxime", "cefazolin", "cefotaxime", "ceftazidime", "cefalexin", "cephalexin", "cefixime", "cefepime"] },
  { name: "macrolide", strict: false, drugs: ["azithromycin", "clarithromycin", "erythromycin"] },
  { name: "fluoroquinolone", strict: false, drugs: ["ciprofloxacin", "levofloxacin", "moxifloxacin", "ofloxacin"] },
  { name: "carbapenem", strict: false, drugs: ["meropenem", "imipenem", "ertapenem"] },
  { name: "glycopeptide", strict: false, drugs: ["vancomycin", "teicoplanin"] },
  { name: "benzodiazepine", strict: false, drugs: ["lorazepam", "diazepam", "midazolam", "clonazepam"] },
  { name: "second-line antiseizure medicine", strict: false, drugs: ["levetiracetam", "valproate", "phenytoin", "fosphenytoin", "lacosamide"] },
  { name: "strong opioid", strict: false, drugs: ["morphine", "oxycodone", "fentanyl", "hydromorphone", "pethidine"] },
  { name: "antiemetic", strict: false, drugs: ["ondansetron", "metoclopramide", "cyclizine", "prochlorperazine", "domperidone"] },
  { name: "short-acting beta agonist", strict: false, drugs: ["salbutamol", "albuterol", "terbutaline"] },
];

function drugKeys(name: string): Map<string, DrugClass> {
  // One key per class: the first listed drug found in the name. Specific names come before generic ones in each list.
  const text = name.toLowerCase();
  const found = new Map<string, DrugClass>();
  for (const drugClass of EXCLUSIVE_DRUG_CLASSES) {
    const drug = drugClass.drugs.find((candidate) => text.includes(candidate));
    if (drug) found.set(drug, drugClass);
  }
  return found;
}

const alternativeWording = /\balternativ(?:e|ely)\b|\binstead of\b/i;
const embeddedAlternative = /\s\bor\b\s|\s\/\s/i;
const selectionOf = (regimen: MedicationRegimen) => regimen.selection ?? "all";
const groupKey = (regimen: MedicationRegimen) => `${regimen.branch ?? ""}\u0000${regimen.step ?? ""}`;

/** True when the plan is a pathway-structured plan (at least one regimen names a branch). */
export function isBranchedMedicationPlan(plan: MedicationPlan | undefined): boolean {
  return Boolean(plan?.regimens.some((regimen) => regimen.branch));
}

/** Every rule violation in a medicine plan. Errors fail the authoring audit; warnings need an author's confirmation. */
export function medicationPathwayIssues(plan: MedicationPlan | undefined): MedicationPathwayIssue[] {
  if (!plan || plan.status === "no-drug-indicated" || plan.regimens.length === 0) return [];
  const issues: MedicationPathwayIssue[] = [];
  const add = (issue: MedicationPathwayIssue) => issues.push(issue);
  const regimens = plan.regimens;

  // 1. Every regimen of a multi-drug plan needs a branch.
  if (regimens.length > 1) {
    for (const regimen of regimens) {
      if (!regimen.branch) add({ rule: "unbranched", severity: "error", medicine: regimen.genericName, message: `${regimen.genericName} is not placed in a pathway branch. Put each medicine under the patient group or pathway it applies to (for example STEMI or NSTEMI).` });
    }
  }

  // 2. Branch list must exist and match the branch labels used by regimens.
  const declared = new Set((plan.branches ?? []).map((branch) => branch.label));
  const used = new Set(regimens.map((regimen) => regimen.branch).filter((branch): branch is string => Boolean(branch)));
  if (used.size > 0) {
    if (!plan.branches?.length) add({ rule: "branch-list", severity: "error", message: "medicationPlan.branches is missing. List each branch with the entry criteria that send a patient into it." });
    for (const label of used) {
      if (plan.branches?.length && !declared.has(label)) add({ rule: "branch-list", severity: "error", branch: label, message: `Branch “${label}” is used by a medicine but is not declared in medicationPlan.branches.` });
    }
    for (const label of declared) {
      if (!used.has(label)) add({ rule: "unused-branch", severity: "warning", branch: label, message: `Branch “${label}” is declared but no medicine uses it.` });
    }
  }

  // 3. Steps and one-of groups, per branch.
  const byBranch = new Map<string, MedicationRegimen[]>();
  for (const regimen of regimens) {
    if (!regimen.branch) continue;
    byBranch.set(regimen.branch, [...(byBranch.get(regimen.branch) ?? []), regimen]);
  }
  for (const [branch, members] of byBranch) {
    if (members.length > 1) {
      for (const regimen of members) {
        if (!regimen.step) add({ rule: "step-required", severity: "error", branch, medicine: regimen.genericName, message: `${regimen.genericName} in “${branch}” has no step. Name the step (for example “Antiplatelet” or “Anticoagulant”) so alternatives sit together.` });
      }
    }
    const groups = new Map<string, MedicationRegimen[]>();
    for (const regimen of members) groups.set(groupKey(regimen), [...(groups.get(groupKey(regimen)) ?? []), regimen]);
    for (const group of groups.values()) {
      const step = group[0].step ?? "(no step)";
      const selections = new Set(group.map(selectionOf));
      if (selections.size > 1) add({ rule: "mixed-selection", severity: "error", branch, message: `Step “${step}” in “${branch}” mixes “all” and “one-of” rows. Alternatives belong in their own step.` });
      const oneOf = group.filter((regimen) => selectionOf(regimen) === "one-of");
      if (oneOf.length === 0) continue;
      if (oneOf.length < 2) add({ rule: "one-of-size", severity: "error", branch, medicine: oneOf[0].genericName, message: `Step “${step}” in “${branch}” is marked one-of but has only one option.` });
      const preferred = oneOf.filter((regimen) => regimen.preferred).length;
      if (preferred !== 1) add({ rule: "one-of-preferred", severity: "error", branch, message: `Step “${step}” in “${branch}” must name exactly one preferred option (found ${preferred}).` });
      for (const regimen of oneOf) {
        if (!regimen.preferred && !regimen.useWhen) add({ rule: "use-when", severity: "warning", branch, medicine: regimen.genericName, message: `${regimen.genericName} is an alternative in “${step}” but says nothing about when to choose it instead of the preferred option (useWhen).` });
      }
    }
  }

  // 4. Exclusive classes and embedded alternatives.
  for (const regimen of regimens) {
    if (embeddedAlternative.test(regimen.genericName)) {
      add({ rule: "embedded-alternative", severity: "error", branch: regimen.branch, medicine: regimen.genericName, message: `“${regimen.genericName}” lists alternatives inside one row. Give each option its own row in a one-of step.` });
    } else if (alternativeWording.test(regimen.indication) && selectionOf(regimen) !== "one-of") {
      add({ rule: "embedded-alternative", severity: "error", branch: regimen.branch, medicine: regimen.genericName, message: `${regimen.genericName} is described as an alternative (“${regimen.indication}”) but is not marked one-of.` });
    }
  }
  const scopes = new Map<string, MedicationRegimen[]>();
  for (const regimen of regimens) scopes.set(regimen.branch ?? "", [...(scopes.get(regimen.branch ?? "") ?? []), regimen]);
  for (const [branch, members] of scopes) {
    const perClass = new Map<string, { drugClass: DrugClass; drugs: Map<string, MedicationRegimen[]> }>();
    for (const regimen of members) {
      for (const [drug, drugClass] of drugKeys(regimen.genericName)) {
        const entry = perClass.get(drugClass.name) ?? { drugClass, drugs: new Map() };
        entry.drugs.set(drug, [...(entry.drugs.get(drug) ?? []), regimen]);
        perClass.set(drugClass.name, entry);
      }
    }
    for (const { drugClass, drugs } of perClass.values()) {
      if (drugs.size < 2) continue;
      const rows = [...drugs.values()].flat();
      // Fine when every row of the class sits in the same one-of group.
      const keys = new Set(rows.map(groupKey));
      const sameOneOfGroup = keys.size === 1 && rows.every((regimen) => regimen.branch && regimen.step && selectionOf(regimen) === "one-of");
      if (sameOneOfGroup) continue;
      add({
        rule: drugClass.strict ? "exclusive-class" : "same-class",
        severity: drugClass.strict ? "error" : "warning",
        branch: branch || undefined,
        message: `${[...drugs.keys()].join(", ")} are all ${drugClass.name}s${branch ? ` in “${branch}”` : ""}. ${drugClass.strict ? "Only one is given: put them in one one-of step with a preferred option." : "Confirm they are sequential or alternative: use a one-of step or separate branches."}`,
      });
    }
  }
  return issues;
}

export type MedicationStepView = { step: string; selection: "all" | "one-of"; options: MedicationRegimen[] };
export type MedicationBranchView = { label: string; entryCriteria: string; steps: MedicationStepView[] };

/** Groups a branched plan for display: branches in declared order, steps in first-seen order, preferred option first. */
export function groupMedicationPlan(plan: MedicationPlan | undefined): MedicationBranchView[] {
  if (!plan || !isBranchedMedicationPlan(plan)) return [];
  const labels = [...(plan.branches ?? []).map((branch) => branch.label)];
  for (const regimen of plan.regimens) if (regimen.branch && !labels.includes(regimen.branch)) labels.push(regimen.branch);
  return labels.map((label) => {
    const members = plan.regimens.filter((regimen) => regimen.branch === label);
    const steps: MedicationStepView[] = [];
    for (const regimen of members) {
      const name = regimen.step ?? regimen.indication;
      let step = steps.find((candidate) => candidate.step === name);
      if (!step) { step = { step: name, selection: selectionOf(regimen), options: [] }; steps.push(step); }
      step.options.push(regimen);
    }
    for (const step of steps) step.options.sort((a, b) => Number(Boolean(b.preferred)) - Number(Boolean(a.preferred)));
    return { label, entryCriteria: plan.branches?.find((branch) => branch.label === label)?.entryCriteria ?? "", steps };
  });
}

export const MEDICATION_PATHWAY_RULE =
  "Medicines are written as a decision pathway, never a list of every drug. Put each regimen in ONE branch (the patient group or pathway it applies to, for example STEMI or NSTEMI). Inside a branch, give each step a name. Drugs given together share a step and are marked “all”. Alternatives share a step, are marked “one-of”, name exactly one preferred option, and say when each alternative is chosen instead. Never mark two drugs of the same class (two P2Y12 inhibitors, two anticoagulants, two thrombolytics) as given together.";
