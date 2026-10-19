/**
 * Development-phase editing mode (owner decision, 19 Oct 2026).
 *
 * Marifa is not released yet, so the clinical-governance gates that stop a topic being edited are
 * switched off by default:
 *  - approved / live versions can be edited and pasted over (still saved as a NEW version; history is kept)
 *  - "Publish" no longer needs the 80% authoring score or a valid medicine pathway
 *  - a version's stored status no longer has to match the submitted status
 *
 * Still enforced (the app cannot render or store a topic without them): the topic schema, valid ids,
 * administrator sign-in, and append-only history. Clinical approval is never set by an edit:
 * clinicalReviewStatus stays "pending".
 *
 * Before release, set MARIFA_ENFORCE_GOVERNANCE=true (e.g. in Vercel) to restore every gate.
 */
export function isDevEditMode(): boolean {
  return process.env.MARIFA_ENFORCE_GOVERNANCE !== "true";
}
