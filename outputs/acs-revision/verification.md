# ACS replacement verification — 11 October 2026

- Guideline: c2c404f2-5f47-4e4d-9ce7-fb32a9c1e103.
- New version: acs-user-revision-2026-10-11-v1 (448029d6-ef84-4ff0-81ab-30f6a47af751).
- Review state: under_review, clinicalReviewStatus pending, is_current false; approved_by, approved_at and published_at are null.
- Database read-back matches the prepared replacement exactly. Original version and guideline metadata match the saved before-image exactly.
- Catalogue: 81 total records, including the existing 71 approved/published scenarios and 10 drafts.
- Authenticated-role database read can select the specific new version.
- Four investigation entries and seven treatment entries. JPG copy artifacts omitted. Chest-radiograph claim flagged for clinical verification.
- All 35 tests passed, targeted lint passed, typecheck and production build passed.
- Commit a819d68 pushed to codex/preserve-clinical-scenarios.
- Production deployment dpl_9ojQhrkv61pBL9LdDv5PuLNyqXxb is READY and aliased to marifa-clinical.vercel.app.
- Deployment was prepared from the committed tree; unrelated local edits were preserved.
- Signed-in live rendering remains unverified: available browser session redirects to login.
