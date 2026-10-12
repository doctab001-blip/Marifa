/** Explicit review previews; approved versions remain unchanged in the history.
 * Topics whose rewrites were published live (12 Oct 2026, clinical review still pending) no longer need a preview entry. */
export const clinicalReviewOverrides: Record<string, string | undefined> = {
  // Source-backed correction; current approved version remains unchanged.
  "c36e9014-7d53-4a82-b641-8e05a3c9d627": "authoring-standard-2026-10-12-v1",
  // Teaching-format demonstration (unreviewed; the published original stays in history).
  "3f198bb7-8829-4e91-b35c-e46ad1e07eb5": "teaching-2026-10-11-v1",
};
