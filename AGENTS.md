<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Preserve work across accounts

- Build on both the current working tree and the latest remote history. Fetch and compare the remote before editing or deploying; reconcile newer work without resetting or discarding local changes.
- Preserve the existing 71 clinical scenarios, their source references, review notices, version history, and associated layouts. Add content and enhancements without replacing the catalogue with repository seeds.
- Disease seeds are additive. Existing IDs must be skipped, and conflict handling must never overwrite existing rows. Changes to saved clinical content require a new version and the existing clinical-governance process.
- Verify catalogue counts and compatibility before release. A published scenario with pending clinical review must not be labelled clinically approved until a clinician presses Approve on the topic page (12 Oct 2026: the platform owner removed the on-page unreviewed banners; pending status is shown in the approval bar at the end of the topic).

## Clinical topic authoring

- Before creating or correcting any clinical topic, read and follow `docs/clinical-topic-authoring-standard.md`. It is the default authoring, evidence and reporting contract for every topic.
- Depth standard (platform owner, 25 Oct 2026): every new or revised topic must pass `npx tsx scripts/audit-topic-depth.ts <payload.json>` (authoring audit publishable AND `lib/clinical-depth-standard.ts`). It needs a full explanation for a practising doctor, at least one clinical algorithm (flowchart), an ABIM-style teaching layer (opening case, explanation blocks, at least 3 board-style questions with every option explained) and no medicine left without a dose. The India publish script refuses topics that fail; there is no override.
- Never leave out an important medicine. If the national source gives no dose, use an international guideline or the label and cite it. Every medicine row carries `Paediatric:`, `Penicillin allergy:`, `CKD:` and `CLD:` lines.
- No deferral wording anywhere in a topic (platform owner, 27 Oct 2026). Never write that MOH (or any national source) "gives no", "does not state" or is silent on something, and never send the reader to "the product label", "local protocol", "hospital formulary/pharmacy", "BNF" or a pharmacist instead of giving the answer. Where the national protocol is silent, write the answer from an international guideline (BNF, Renal Drug Handbook, KDIGO, EMA/FDA label, BSACI, IDSA, NICE) and record the source in `evidenceAudit`, not in the visible text. CKD, CLD and allergy-alternative lines must be on every medicine at all times. The site also hides any deferral wording at display (`withoutDeferrals` in `lib/clinical-display-text.ts`) and fills a missing CKD/CLD/penicillin-allergy line from `lib/medicine-renal-hepatic.ts` and `lib/medicine-allergy.ts`; `lib/clinical-depth-standard.ts` fails a topic that stores such wording.
- Author at most 5 topics per run. Before handover, a separate reviewer that did not write them re-checks every dose and threshold against the opened sources; fix every finding first.
- Medicine plans are decision pathways, not drug lists (default for every topic, new or corrected): one branch per pathway or patient group (for example STEMI and NSTEMI), named steps, `All` vs `Preferred`/`Alternative` options with a `Use when` condition, and never two drugs of one class given together. See "Medicine pathways" in the authoring standard; `lib/medication-pathway.ts` enforces it and blocks automatic publication of a flat plan.
- Never edit current or published clinical content in place. Corrections must be additive versions saved with `status: "under_review"`, `is_current: false` and `clinicalReviewStatus: "pending"`. A version that scores 80% or more on the authoring audit goes live automatically via `scripts/publish-if-eligible.ts` (new `-live` row; publication authorised by the platform owner, 12 Oct 2026). Clinical approval remains a clinician action: live topics keep `clinicalReviewStatus: "pending"` until approved with the topic page's Approve button, which adds a new `<version>-approved` row (status approved) and keeps history.
- Treat older topic formats as an audit queue. Preserve every historical row and supersede its visible draft only after the replacement passes the canonical schemas, pathway validation and the source checks in the authoring standard.
- Preserve topics that score 80% or higher in `outputs/authoring-standard-audit/report.json`; do not create a replacement for them. Correct only topics below 80%, then require the replacement to score at least 80% before insertion.
