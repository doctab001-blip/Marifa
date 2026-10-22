export type Slide = {
  title: string;
  bullets: string[];
  /** Caption for the clinical illustration or diagram planned for this slide. */
  visual: string;
  image?: LearningImage;
  /** Optional one-line takeaway shown as a callout. */
  keyPoint?: string;
};

export type LearningImage = {
  src: string;
  alt: string;
  caption: string;
  sourceUrl: string;
  credit: string;
  license: string;
  licenseUrl: string;
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
