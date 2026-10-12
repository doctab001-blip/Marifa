/** Explicit review previews; approved versions remain unchanged in the history.
 * Rewrites published live on 12 Oct 2026 (clinical review still pending) no longer need a preview entry.
 * Add an entry here only to preview an under_review version in place of the current one. */
export const clinicalReviewOverrides: Record<string, string | undefined> = {};
