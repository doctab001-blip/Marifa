<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Preserve work across accounts

- Build on both the current working tree and the latest remote history. Fetch and compare the remote before editing or deploying; reconcile newer work without resetting or discarding local changes.
- Preserve the existing 71 clinical scenarios, their source references, review notices, version history, and associated layouts. Add content and enhancements without replacing the catalogue with repository seeds.
- Disease seeds are additive. Existing IDs must be skipped, and conflict handling must never overwrite existing rows. Changes to saved clinical content require a new version and the existing clinical-governance process.
- Verify catalogue counts and compatibility before release. A published scenario with pending clinical review must retain its unreviewed notice and must not be labelled clinically approved.

## Clinical topic authoring

- Before creating or correcting any clinical topic, read and follow `docs/clinical-topic-authoring-standard.md`. It is the default authoring, evidence and reporting contract for every topic.
- Never edit current or published clinical content in place. Corrections must be additive versions with `status: "under_review"`, `is_current: false` and `clinicalReviewStatus: "pending"`; approval and publication remain clinician actions.
- Treat older topic formats as an audit queue. Preserve every historical row and supersede its visible draft only after the replacement passes the canonical schemas, pathway validation and the source checks in the authoring standard.
- Preserve topics that score 80% or higher in `outputs/authoring-standard-audit/report.json`; do not create a replacement for them. Correct only topics below 80%, then require the replacement to score at least 80% before insertion.
