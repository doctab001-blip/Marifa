/**
 * Live directory boundary.
 *
 * A topic is live automatically when its current published version scores at
 * least CLINICAL_DIRECTORY_MINIMUM_SCORE on the authoring-standard audit
 * (lib/clinical-authoring-audit.ts). There is no hand-maintained allow-list:
 * a new version that passes appears on the next request; one that fails is
 * withheld and its topic stays in Draft. Rows are never changed by this check.
 */
import { CLINICAL_DIRECTORY_MINIMUM_SCORE, meetsDirectoryThreshold } from "@/lib/clinical-authoring-audit";

export { CLINICAL_DIRECTORY_MINIMUM_SCORE };

export function isClinicalDirectoryEligible(content: unknown) {
  return meetsDirectoryThreshold(content);
}
