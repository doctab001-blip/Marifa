import type { DiseaseDetail } from "@/lib/validations/disease";

export type TeachingSectionKey = "why" | "recognise" | "differentiate" | "confirm" | "manage" | "ongoing";

export type GuidedStep = { title: string; prompt: string; guidance: string; anchor?: string };
export type Checkpoint = { question: string; answer: string };

export type TeachingView = {
  objectives: string[];
  objectivesAuthored: boolean;
  scope?: string;
  vignette?: { text: string; fictitious: boolean };
  approach: GuidedStep[];
  approachAuthored: boolean;
  checkpoints: Checkpoint[];
  checkpointsAuthored: boolean;
  pitfalls: string[];
  keyPoints: string[];
  references: NonNullable<NonNullable<DiseaseDetail["teaching"]>["references"]>;
};

/** Anchor ids and teaching labels for the six retained clinical sections. */
export const teachingSections: Record<TeachingSectionKey, { anchor: string; emoji: string; title: string; formal: string; cue: string }> = {
  why: { anchor: "why-it-happens", emoji: "🧬", title: "Why it happens", formal: "Pathophysiology", cue: "Link each mechanism to a symptom, a test result or a treatment target. If you can explain why a finding occurs, you will remember it." },
  recognise: { anchor: "recognise-it", emoji: "🩺", title: "Recognise it", formal: "Presentation and assessment", cue: "Start with safety. Look for red flags first, then build the typical picture, then think about who presents atypically." },
  differentiate: { anchor: "what-else", emoji: "🔀", title: "What else could it be?", formal: "Differential diagnosis", cue: "For each alternative, name the feature that separates it and the test that settles it. Rule out the must-not-miss diagnoses deliberately." },
  confirm: { anchor: "confirm-it", emoji: "🧪", title: "Confirm it", formal: "Investigations", cue: "Before ordering a test, ask what question it answers and what you will do differently with the result." },
  manage: { anchor: "manage-it", emoji: "🧭", title: "Manage it step by step", formal: "Clinical management", cue: "Work in order: stabilise, treat the cause, reassess, then escalate if the expected response does not happen." },
  ongoing: { anchor: "ongoing-care", emoji: "🏠", title: "Ongoing care", formal: "Disposition and follow-up", cue: "Safe discharge needs clear criteria, patient understanding, a safety-net and a named follow-up owner." },
};

function firstSentence(text: string) {
  const match = text.match(/^[^.!?]+[.!?]/);
  return (match ? match[0] : text).trim();
}

function joinNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/**
 * Builds the teaching view. Authored teaching content is used when present.
 * Otherwise the guide is derived only by re-presenting content already stored in
 * the six clinical sections; nothing clinical is invented here.
 */
export function buildTeachingView(disease: DiseaseDetail): TeachingView {
  const authored = disease.teaching;
  const differentialNames = disease.differentials.map((item) => item.condition);

  const derivedObjectives = [
    `Explain how ${disease.title.toLowerCase()} develops and connect the mechanism to the findings you expect.`,
    "Recognise the red flags that need immediate senior escalation.",
    differentialNames.length ? `Distinguish it from ${joinNames(differentialNames.slice(0, 3))}.` : "Distinguish it from the important alternative diagnoses.",
    "Choose investigations that answer a specific clinical question and change management.",
    "Follow the management sequence and know what to do when the expected response does not happen.",
    "Plan safe discharge, safety-netting and follow-up.",
  ];

  const order: TeachingSectionKey[] = ["why", "recognise", "differentiate", "confirm", "manage", "ongoing"];
  const derivedPrompts: Record<TeachingSectionKey, string> = {
    why: firstSentence(disease.pathophysiology.summary),
    recognise: disease.presentation.redFlags.length ? `Red flags to check first: ${disease.presentation.redFlags.slice(0, 3).join("; ")}.` : "Which findings would make you escalate now?",
    differentiate: differentialNames.length ? `Keep ${joinNames(differentialNames.slice(0, 3))} in mind.` : "Which alternatives would change your immediate plan?",
    confirm: "Which test answers your most important question first?",
    manage: disease.clinicalManagement[0] ? `First step: ${disease.clinicalManagement[0].title}.` : "What must happen first?",
    ongoing: "What must be true before this patient can safely leave your care?",
  };

  const derivedApproach: GuidedStep[] = order.map((key, index) => ({
    title: `Step ${index + 1} · ${teachingSections[key].title}`,
    prompt: derivedPrompts[key],
    guidance: teachingSections[key].cue,
    anchor: teachingSections[key].anchor,
  }));

  const derivedCheckpoints: Checkpoint[] = [
    ...(disease.presentation.redFlags.length ? [{
      question: `Which findings in a patient with ${disease.title.toLowerCase()} should make you escalate immediately?`,
      answer: disease.presentation.redFlags.join("; ") + ".",
    }] : []),
    ...disease.differentials.slice(0, 3).map((item) => ({
      question: `How would you tell ${disease.title.toLowerCase()} apart from ${item.condition.toLowerCase()}?`,
      answer: item.distinguishingFeatures,
    })),
  ];

  const vignette = authored?.vignette
    ? { text: authored.vignette.text, fictitious: true }
    : disease.clinicalScenario ? { text: disease.clinicalScenario, fictitious: false } : undefined;

  return {
    objectives: authored?.learningObjectives ?? derivedObjectives,
    objectivesAuthored: Boolean(authored?.learningObjectives),
    scope: authored?.scope,
    vignette,
    approach: authored?.guidedApproach ?? derivedApproach,
    approachAuthored: Boolean(authored?.guidedApproach),
    checkpoints: authored?.checkpoints ?? derivedCheckpoints,
    checkpointsAuthored: Boolean(authored?.checkpoints),
    pitfalls: authored?.pitfalls ?? [],
    keyPoints: authored?.keyPoints ?? [],
    references: authored?.references ?? [],
  };
}
