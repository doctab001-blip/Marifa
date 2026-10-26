import { unexplainedScores } from "@/lib/clinical-scores";
import { DiseaseDetailSchema, type DiseaseDetail } from "@/lib/validations/disease";

/**
 * Marifa clinical depth standard (docs/clinical-topic-authoring-standard.md, "Depth standard").
 *
 * The authoring audit (lib/clinical-authoring-audit.ts) checks structure. This check enforces depth: a
 * topic must explain the condition fully to a practising doctor, carry clinical algorithms and an
 * ABIM-style self-assessment, and must not leave a medicine without a dose. It gates every NEW or
 * REVISED topic version at staging; it does not change live-directory visibility of published topics.
 */
export const DEPTH_STANDARD_VERSION = "2026-10-25";

export const DEPTH_MINIMUMS = {
  totalWords: 3000,
  summaryWords: 120,
  mechanisms: 4,
  symptoms: 4,
  physicalSigns: 4,
  redFlags: 4,
  precipitants: 3,
  differentials: 5,
  differentialWords: 10,
  diagnosticCriteria: 3,
  investigations: 6,
  managementSteps: 5,
  actionsPerStep: 2,
  algorithms: 1,
  algorithmNodes: 6,
  algorithmDecisions: 2,
  explanationBlocks: 4,
  explanationWords: 80,
  boardQuestions: 3,
  optionExplanationWords: 8,
  vignetteWords: 40,
  learningObjectives: 3,
  keyPoints: 4,
  pitfalls: 4,
} as const;

/** The four population lines every medicine entry carries (paediatric, penicillin allergy, CKD, CLD). */
const REQUIRED_ADJUSTMENT_PREFIXES = ["Paediatric:", "Penicillin allergy:", "CKD:", "CLD:"];

/** A dose must be stated. "Use the local protocol" is only acceptable when the whole plan says so. */
const DEFERRED_DOSE = /\b(per|see|use the|according to)\s+(local|unit|hospital)\s+(protocol|policy|formulary)\b|\bdose (not|to be) (given|stated|confirmed|determined)\b|\bspecialist dosing\b/i;

/**
 * A recorded gap that leaves a medicine without a dose breaks the standing rule: if the national source
 * gives no dose, the dose comes from an international guideline or label. Such gaps fail the check.
 */
const MISSING_DOSE_GAP = /\b(dose|doses|dosing)\b[^.]*\b(not (given|included|found|shown|available|stated)|no (dose|sourced dose)|left to (the )?(specialist|local))\b|\bnot included because\b|\bno dose was found\b|\bare not included\b/i;

export type DepthAudit = {
  standard: string;
  passed: boolean;
  failures: string[];
  /** Advisory only: score names used in the text that have no explanation in lib/clinical-scores.ts. */
  warnings?: string[];
  metrics: { words: number; regimens: number; algorithms: number; boardQuestions: number; differentials: number; investigations: number };
};

function words(value: unknown): number {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return (text.match(/[A-Za-z0-9][A-Za-z0-9'’\-./%]*/g) ?? []).length;
}

export function auditTopicDepth(content: unknown): DepthAudit {
  const parsed = DiseaseDetailSchema.safeParse(content);
  const empty = { words: 0, regimens: 0, algorithms: 0, boardQuestions: 0, differentials: 0, investigations: 0 };
  if (!parsed.success) return { standard: DEPTH_STANDARD_VERSION, passed: false, failures: ["Schema invalid; run the authoring audit first."], metrics: empty };
  const t: DiseaseDetail = parsed.data;
  const m = DEPTH_MINIMUMS;
  const failures: string[] = [];
  const need = (ok: boolean, message: string) => { if (!ok) failures.push(message); };

  const clinicalText = { ...t, evidenceAudit: undefined };
  const totalWords = words(clinicalText);
  need(totalWords >= m.totalWords, `Topic has ${totalWords} words; the depth standard needs at least ${m.totalWords} (explain the condition fully to a practising doctor).`);

  need(words(t.pathophysiology.summary) >= m.summaryWords, `Pathophysiology summary has ${words(t.pathophysiology.summary)} words; needs at least ${m.summaryWords}.`);
  need(t.pathophysiology.keyMechanisms.length >= m.mechanisms, `Pathophysiology needs at least ${m.mechanisms} mechanisms.`);
  need(t.presentation.symptoms.length >= m.symptoms, `Presentation needs at least ${m.symptoms} symptoms.`);
  need(t.presentation.physicalSigns.length >= m.physicalSigns, `Presentation needs at least ${m.physicalSigns} physical signs.`);
  need(t.presentation.redFlags.length >= m.redFlags, `Presentation needs at least ${m.redFlags} red flags.`);
  need((t.presentation.precipitants?.length ?? 0) >= m.precipitants, `Presentation needs at least ${m.precipitants} precipitants or risk factors.`);

  need(t.differentials.length >= m.differentials, `Only ${t.differentials.length} differentials; needs at least ${m.differentials}, including the must-not-miss diagnoses.`);
  t.differentials.forEach((d) => need(words(d.distinguishingFeatures) >= m.differentialWords, `Differential “${d.condition}” needs the distinguishing feature AND the test that settles it (at least ${m.differentialWords} words).`));
  need((t.diagnosticCriteria?.length ?? 0) >= m.diagnosticCriteria, `Needs at least ${m.diagnosticCriteria} diagnostic criteria, thresholds or severity grades.`);

  const investigations = [...t.investigations.ruleIn, ...t.investigations.ruleOut];
  need(investigations.length >= m.investigations, `Only ${investigations.length} investigations; needs at least ${m.investigations}.`);

  need(t.clinicalManagement.length >= m.managementSteps, `Only ${t.clinicalManagement.length} management steps; needs at least ${m.managementSteps}.`);
  t.clinicalManagement.forEach((step) => need(step.actions.length >= m.actionsPerStep, `Management step “${step.title}” needs at least ${m.actionsPerStep} actions.`));

  const plan = t.medicationPlan;
  const regimens = plan?.regimens ?? [];
  need(Boolean(plan), "Medicine plan is absent.");
  if (plan?.status === "source-verified") need(regimens.length > 0, "Medicine plan is marked source-verified but lists no medicines.");
  regimens.forEach((r) => {
    const label = `Medicine ${r.genericName}`;
    REQUIRED_ADJUSTMENT_PREFIXES.forEach((prefix) => need(r.adjustments.some((line) => line.startsWith(prefix)), `${label} has no “${prefix}” line.`));
    if (plan?.status !== "local-protocol-required") need(!DEFERRED_DOSE.test(`${r.dose} ${r.frequency}`), `${label} defers its dose to a local protocol; take the dose from an international guideline or label.`);
  });
  (t.evidenceAudit?.unverifiedSections ?? []).forEach((gap) => need(!MISSING_DOSE_GAP.test(gap), `Recorded gap leaves a medicine without a dose (“${gap.slice(0, 90)}…”); fill it from an international guideline or label.`));

  const algorithms = t.algorithms ?? [];
  need(algorithms.length >= m.algorithms, `Needs at least ${m.algorithms} clinical algorithm (flowchart).`);
  algorithms.forEach((a) => {
    need(a.nodes.length >= m.algorithmNodes, `Algorithm “${a.title}” has ${a.nodes.length} nodes; needs at least ${m.algorithmNodes}.`);
    const decisions = a.nodes.filter((node) => node.kind === "decision").length;
    need(decisions >= m.algorithmDecisions, `Algorithm “${a.title}” has ${decisions} decision points; needs at least ${m.algorithmDecisions}.`);
  });

  const teaching = t.teaching;
  need((teaching?.learningObjectives.length ?? 0) >= m.learningObjectives, `Needs at least ${m.learningObjectives} learning objectives.`);
  need((teaching?.keyPoints?.length ?? 0) >= m.keyPoints, `Needs at least ${m.keyPoints} key points.`);
  need((teaching?.pitfalls?.length ?? 0) >= m.pitfalls, `Needs at least ${m.pitfalls} pitfalls.`);
  need(Boolean(teaching?.vignette) && words(teaching?.vignette?.text) >= m.vignetteWords, `Needs a fictitious opening case vignette of at least ${m.vignetteWords} words.`);
  const blocks = teaching?.guidedApproach ?? [];
  need(blocks.length >= m.explanationBlocks, `Needs at least ${m.explanationBlocks} explanation blocks (guided approach) that explain the reasoning in full.`);
  blocks.forEach((block) => need(words(block.guidance) >= m.explanationWords, `Explanation “${block.title}” has ${words(block.guidance)} words; needs at least ${m.explanationWords}.`));

  const questions = teaching?.boardQuestions ?? [];
  need(questions.length >= m.boardQuestions, `Needs at least ${m.boardQuestions} board-style questions (ABIM method).`);
  questions.forEach((q) => {
    q.options.forEach((option) => need(words(option.explanation) >= m.optionExplanationWords, `Question “${q.id}” option ${option.id} needs an explanation of why it is right or wrong (at least ${m.optionExplanationWords} words).`));
    need(words(q.vignette) >= m.vignetteWords, `Question “${q.id}” vignette needs at least ${m.vignetteWords} words.`);
  });
  if (questions.length >= 3) need(new Set(questions.map((q) => q.answer)).size > 1, "All board questions share the same answer letter; vary the correct option.");

  return {
    standard: DEPTH_STANDARD_VERSION,
    passed: failures.length === 0,
    failures,
    warnings: unexplainedScores(t).map((name) => `Score “${name}” is named but has no explanation and values table in lib/clinical-scores.ts; add one.`),
    metrics: { words: totalWords, regimens: regimens.length, algorithms: algorithms.length, boardQuestions: questions.length, differentials: t.differentials.length, investigations: investigations.length },
  };
}
