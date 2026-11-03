/**
 * Inline If/Then management pathways.
 *
 * Storage keeps `actions: string[]` untouched and adds an optional `actionDetails` overlay (lib/validations/disease.ts).
 * Components use the normalised view model below, where every action is an object that carries its If/Then pathways.
 * `toManagementSteps` is the only place that merges the two shapes.
 *
 * Rule for what belongs in a pathway: a result is written there only if it changes the next step, the timeframe or the
 * disposition. Reference ranges, normal results and rationale stay in the Investigations tab (see docs/management-inline-pathways.md).
 */
import type { ActionPathway, DiseaseDetail } from "@/lib/validations/disease";

export type Urgency = NonNullable<ActionPathway["urgency"]>;

export type ManagementPathway = { trigger: string; response: string; urgency?: Urgency };

export type ManagementAction = {
  /** Position in the stored `actions` array (the key of the overlay). */
  index: number;
  /** The primary action, exactly as stored. */
  action: string;
  pathways: ManagementPathway[];
  /** testName of the Investigations rows this action's decisions rely on. */
  investigationRefs: string[];
};

export type ManagementStep = {
  id: string;
  title: string;
  timeframe: string;
  actions: ManagementAction[];
  /** Step-level decision branches (older topics); still rendered as a table under the actions. */
  branches?: NonNullable<DiseaseDetail["clinicalManagement"][number]["branches"]>;
};

type StoredStep = DiseaseDetail["clinicalManagement"][number];

/** Stored steps -> view model. A step without `actionDetails` simply yields actions with no pathways. */
export function toManagementSteps(steps: StoredStep[]): ManagementStep[] {
  return steps.map((step) => {
    const byIndex = new Map((step.actionDetails ?? []).map((detail) => [detail.actionIndex, detail]));
    return {
      id: step.id,
      title: step.title,
      timeframe: step.timeframe,
      branches: step.branches,
      actions: step.actions.map((action, index) => {
        const detail = byIndex.get(index);
        return { index, action, pathways: detail?.pathways ?? [], investigationRefs: detail?.investigationRefs ?? [] };
      }),
    };
  });
}

/**
 * testName -> 1-based numbers of the Management steps whose pathways rely on that test.
 * Used by the Investigations tab to say "Decision rule: Management step 3" under a test.
 */
export function investigationStepNumbers(steps: StoredStep[]): Map<string, number[]> {
  const map = new Map<string, number[]>();
  steps.forEach((step, stepIndex) => {
    for (const detail of step.actionDetails ?? []) {
      for (const ref of detail.investigationRefs ?? []) {
        const list = map.get(ref) ?? [];
        if (!list.includes(stepIndex + 1)) list.push(stepIndex + 1);
        map.set(ref, list);
      }
    }
  });
  return map;
}
