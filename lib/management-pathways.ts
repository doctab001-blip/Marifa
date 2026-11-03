/**
 * Inline If/Then management pathways.
 *
 * Storage keeps `actions: string[]` untouched and adds an optional `actionDetails` overlay (lib/validations/disease.ts).
 * Components and new code use the normalised view model below, where every action is an object that already carries
 * its rationale and its If/Then pathways. `toManagementSteps` is the only place that merges the two shapes.
 */
import type { ActionPathway, DiseaseDetail } from "@/lib/validations/disease";

export type Urgency = NonNullable<ActionPathway["urgency"]>;

export type ManagementPathway = { trigger: string; response: string; urgency?: Urgency };

export type ManagementAction = {
  /** Position in the stored `actions` array (the key of the overlay). */
  index: number;
  /** The primary action, exactly as stored. */
  action: string;
  rationale?: string;
  expected?: string;
  pathways: ManagementPathway[];
  investigationRef?: string;
  origin?: "authored" | "auto-linked";
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
        return {
          index,
          action,
          rationale: detail?.rationale,
          expected: detail?.expected,
          pathways: detail?.pathways ?? [],
          investigationRef: detail?.investigationRef,
          origin: detail?.origin,
        };
      }),
    };
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Linking an action to the Investigations row it came from (used by scripts/migrate-management-pathways.ts).
// Conservative on purpose: a wrong rationale under an action is worse than none, so ambiguous matches are skipped.
// ---------------------------------------------------------------------------------------------------------------

type Investigation = DiseaseDetail["investigations"]["ruleIn"][number];

const STOP = new Set(["with", "from", "and", "the", "for", "test", "tests", "level", "levels", "serum", "plasma", "blood", "early", "urgent", "record", "request", "obtain", "check", "perform", "repeat", "measure", "examine", "send", "arrange", "order", "within", "after", "before", "initial", "bedside", "point", "care", "poc"]);
const ALIASES: Record<string, string> = { electrocardiogram: "ecg", ekg: "ecg", radiograph: "xray", xray: "xray", troponins: "troponin", ultrasonography: "ultrasound", sonography: "ultrasound", ct: "ct", mri: "mri" };

/** "12-lead ECG (electrocardiogram)" -> ["lead","ecg"]; lower case, aliases folded, stop words and bare numbers dropped. */
export function investigationTokens(text: string): string[] {
  const folded = text.toLowerCase().replace(/x[\s-]?ray/g, "xray").replace(/[^a-z0-9\s]/g, " ");
  const out = folded.split(/\s+/).filter(Boolean).map((t) => ALIASES[t] ?? t).filter((t) => (t.length >= 3 || t === "ct") && !STOP.has(t) && !/^\d+$/.test(t));
  return [...new Set(out)];
}

/** The text before the first "(", ":" or ";" is the test's name; the rest is qualification. */
const head = (testName: string) => testName.split(/[(:;]/)[0];

/**
 * The single investigation whose name is wholly present in the action text, or null if none or more than one
 * (with equal specificity) qualifies. Specificity = number of distinctive tokens, so "Chest X-ray" beats "X-ray".
 */
const PLACEHOLDER = /not yet authored/i;

/**
 * Only an action that is itself a test ("Record a 12-lead ECG", "Obtain a chest X-ray and a glucose") is linked.
 * An action that merely mentions a test ("Stop it ... and monitor glucose"), is negated ("Do not use a bladder scan alone"),
 * or gives a medicine (stored as a [💊 ...] badge) is left alone: its own wording is the clinical instruction.
 */
const TEST_VERB = /^\W*(?:(?:urgently|immediately|promptly|early|also|then)\s+)?(?:obtain|record|request|measure|perform|arrange|check|send|take|order|repeat|do|get|test|image|scan|calculate|plot|screen|confirm|use|examine|assess|evaluate|review|document|cross-?match|group|culture)\b/i;
const NEGATED = /\b(?:do not|don't|never|avoid|stop|withhold|omit|without)\b/i;
export function isInvestigationAction(action: string): boolean {
  return TEST_VERB.test(action) && !NEGATED.test(action) && !action.includes("[💊") && !PLACEHOLDER.test(action);
}

export function matchInvestigation(action: string, investigations: Investigation[]): Investigation | null {
  if (PLACEHOLDER.test(action)) return null; // draft shells: nothing to link
  investigations = investigations.filter((inv) => !PLACEHOLDER.test(inv.testName));
  const actionTokens = new Set(investigationTokens(action));
  const scored = investigations
    .map((inv) => ({ inv, tokens: investigationTokens(head(inv.testName)) }))
    .filter(({ tokens }) => tokens.length > 0 && tokens.every((t) => actionTokens.has(t)))
    .map(({ inv, tokens }) => ({ inv, score: tokens.length }))
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return null;
  if (scored.length > 1 && scored[0].score === scored[1].score && scored[0].inv.testName !== scored[1].inv.testName) return null;
  return scored[0].inv;
}

/** True when two or more investigations match the action equally well (so it is deliberately left unlinked). */
function ambiguousMatch(action: string, investigations: Investigation[]): boolean {
  if (PLACEHOLDER.test(action)) return false;
  const actionTokens = new Set(investigationTokens(action));
  const full = investigations.filter((inv) => !PLACEHOLDER.test(inv.testName)).filter((inv) => { const t = investigationTokens(head(inv.testName)); return t.length > 0 && t.every((x) => actionTokens.has(x)); });
  return full.length > 1;
}

export type StructureReport = { stepsTouched: number; actionsLinked: number; ambiguous: number };

/**
 * Adds `actionDetails` (rationale, expected finding, investigationRef) to every action that names an investigation,
 * copying that investigation's own text. Never invents If/Then pathways: those are clinical decisions and are authored.
 * Pure and idempotent: existing `actionDetails` (authored or already linked) are kept as they are.
 */
export function attachInvestigationsToSteps(content: DiseaseDetail): { content: DiseaseDetail; report: StructureReport } {
  const investigations = [...content.investigations.ruleIn, ...content.investigations.ruleOut];
  const report: StructureReport = { stepsTouched: 0, actionsLinked: 0, ambiguous: 0 };
  const clinicalManagement = content.clinicalManagement.map((step) => {
    const existing = new Map((step.actionDetails ?? []).map((d) => [d.actionIndex, d]));
    const added: NonNullable<StoredStep["actionDetails"]> = [];
    step.actions.forEach((action, index) => {
      if (existing.has(index) || !isInvestigationAction(action)) return;
      const hit = matchInvestigation(action, investigations);
      if (!hit) {
        if (ambiguousMatch(action, investigations)) report.ambiguous += 1;
        return;
      }
      added.push({
        actionIndex: index,
        rationale: hit.clinicalRationale,
        expected: hit.normalValue ?? hit.expectedFinding,
        pathways: [],
        investigationRef: hit.testName,
        origin: "auto-linked",
      });
    });
    if (!added.length) return step;
    report.stepsTouched += 1;
    report.actionsLinked += added.length;
    const merged = [...(step.actionDetails ?? []), ...added].sort((a, b) => a.actionIndex - b.actionIndex);
    return { ...step, actionDetails: merged };
  });
  return { content: { ...content, clinicalManagement }, report };
}
