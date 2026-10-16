# Release verification — 11 October 2026

- Source commit: 80b3061, pushed to codex/preserve-clinical-scenarios.
- Production deployment: dpl_Db6sd6BPTAkJAW654kUdHb5wxyWG, READY.
- Production URL: https://marifa-clinical.vercel.app
- Unit tests: 33 passed; type checking, lint and production build passed.
- All 81 original current shared records parse against the compatible schema.
- All 81 original current content hashes matched after draft insertion.
- All 71 visible scenarios preserved.
- 61 non-current under-review revisions contain 199 named assessments.
- No revision has approval metadata, publication metadata or current status.
- All other clinical content in the 61 revisions equals the current originals.
- Desktop and 390px mobile layouts verified locally; no horizontal overflow.
- Production browser confirmed the new investigation stylesheet rules.
- Production clinical-page navigation redirects to sign-in; authenticated clinical
  content and administrator draft-page rendering could not be verified in this
  browser session. No authentication restriction was removed or bypassed.
- Clinical source verification and responsible clinical review are outstanding for
  the proposals. Drafts are accessible to platform administrators at
  /dashboard/admin/investigation-review and do not replace current clinical content.

Screenshots: desktop-current.png, mobile-current.png, desktop-draft.png.
These are development previews, not authenticated production screenshots.
