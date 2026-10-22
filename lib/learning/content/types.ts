export type Slide = {
  title: string;
  bullets: string[];
  /** Caption for the clinical illustration or diagram planned for this slide. */
  visual: string;
  /** Optional one-line takeaway shown as a callout. */
  keyPoint?: string;
};

/** Options are shuffled for every attempt, so the correct answer is stored separately from the distractors. */
export type Question = {
  prompt: string;
  correct: string;
  distractors: [string, string, string];
};

export type ModuleContent = {
  slides: Slide[];
  questions: Question[];
};
