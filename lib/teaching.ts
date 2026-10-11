export type TeachingSectionKey = "why" | "recognise" | "differentiate" | "confirm" | "manage" | "ongoing";

/** Anchor ids and teaching labels for the six retained clinical sections. */
export const teachingSections: Record<TeachingSectionKey, { anchor: string; emoji: string; title: string; formal: string; cue: string }> = {
  why: { anchor: "why-it-happens", emoji: "🧬", title: "Why it happens", formal: "Pathophysiology", cue: "Link each mechanism to a symptom, a test result or a treatment target. If you can explain why a finding occurs, you will remember it." },
  recognise: { anchor: "recognise-it", emoji: "🩺", title: "Recognise it", formal: "Presentation and assessment", cue: "Start with safety. Look for red flags first, then build the typical picture, then think about who presents atypically." },
  differentiate: { anchor: "what-else", emoji: "🔀", title: "What else could it be?", formal: "Differential diagnosis", cue: "For each alternative, name the feature that separates it and the test that settles it. Rule out the must-not-miss diagnoses deliberately." },
  confirm: { anchor: "confirm-it", emoji: "🧪", title: "Confirm it", formal: "Investigations", cue: "Before ordering a test, ask what question it answers and what you will do differently with the result." },
  manage: { anchor: "manage-it", emoji: "🧭", title: "Manage it step by step", formal: "Clinical management", cue: "Work in order: stabilise, treat the cause, reassess, then escalate if the expected response does not happen." },
  ongoing: { anchor: "ongoing-care", emoji: "🏠", title: "Ongoing care", formal: "Disposition and follow-up", cue: "Safe discharge needs clear criteria, patient understanding, a safety-net and a named follow-up owner." },
};
