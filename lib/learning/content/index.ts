import type { ModuleContent } from "./types";
import { getLearningImage } from "../images";
import infectionPreventionControl from "./infection-prevention-control";
import handHygiene from "./hand-hygiene";
import basicLifeSupport from "./basic-life-support";
import fireSafety from "./fire-safety";
import patientIdentification from "./patient-identification";
import medicationSafety from "./medication-safety";
import confidentialityDataProtection from "./confidentiality-data-protection";
import incidentReporting from "./incident-reporting";
import consentCapacity from "./consent-capacity";

export type { ModuleContent, Question, Slide } from "./types";

/* Demonstration training content, pending clinical review before use with real learners. */
const CONTENT: Record<string, ModuleContent> = {
  "infection-prevention-control": infectionPreventionControl,
  "hand-hygiene": handHygiene,
  "basic-life-support": basicLifeSupport,
  "fire-safety": fireSafety,
  "patient-identification": patientIdentification,
  "medication-safety": medicationSafety,
  "confidentiality-data-protection": confidentialityDataProtection,
  "incident-reporting": incidentReporting,
  "consent-capacity": consentCapacity,
};

export function getModuleContent(id: string): ModuleContent | undefined {
  const content = CONTENT[id];
  if (!content) return undefined;
  return {
    ...content,
    slides: content.slides.map((slide, index) => ({ ...slide, image: slide.image ?? getLearningImage(id, slide.title, index) })),
  };
}
