# Adult Essential Hypertension Screening and Confirmation

- **Version ID created:** `51da22f5-c49b-4d23-8dbe-2b5bf80f3175` (`authoring-standard-2026-10-12-v1`)
- **Governance:** `under_review`, non-current, `clinicalReviewStatus: pending`; reviewer, approval, publication and verification metadata are null. The required draft `review_date` is `2026-10-12`.
- **Authoring-standard score:** 100% (32/32 machine-checkable structural checks). The score does not substitute for clinician review.

## Sources used

- National Heart Center/Saudi Heart Association 2023 Guidelines on the Management of Hypertension: pp. 17-23, sections 3.1-3.4, Tables 2-8 and Figure 1; p. 32, Table 20.
- Saudi MOH, Cardiovascular Diseases - Hypertension, updated 24 August 2023: classification; causes and risk factors; symptoms; complications; diagnosis; treatment and prevention.

Exact loaded URLs, use, patient scope and source-access results are recorded in `sources.json`. The opened PDF and MOH page are preserved in `sources/` with SHA-256 hashes in `validation.json`.

## Source conflicts

The Saudi guideline sets different thresholds for diagnosis and for considering treatment. The payload labels both sets and never averages or blends them. NICE NG136 was not used because its page returned HTTP 403 when opened in this run.

## SFDA check

No drug regimen is included. This topic covers screening and confirmation, so there is no medicine-registration assertion.

## Unverified items

- Local laboratory reference intervals.
- Local validated-device availability and calibration arrangements.
- A second current international comparator because NICE NG136 could not be opened.
- Treatment selection, which belongs in the hypertension-management topic.

## Changes

- Added Saudi diagnostic and treatment-consideration thresholds with exact source locators.
- Replaced generic measurement prose with timed, standardised office, home and ambulatory methods.
- Added complete investigation rows with reference value, expected finding, interpretation, action and claim-level citation.
- Added precipitating/risk factors, organ-damage red flags, differentiated white-coat and masked hypertension, and a pregnancy branch.
- Added time-ordered screening, confirmation, evaluation, escalation and follow-up steps.
- Added evidence audit, teaching points, pitfalls and a final reference list.

## Needs clinician review

- Confirm adoption of the NHC/SHA diagnostic thresholds in the intended local service.
- Confirm the local validated-device list, laboratory intervals and referral pathway.
- Decide whether a successfully opened international comparator is required before approval.

## Verification

- `DiseaseDetailSchema`: valid.
- Authoring-standard audit: 100%.
- TypeScript: passed.
- Focused lint: passed.
- Tests: 75 passed.
- Production build: passed.
- Database read-back: five versions present; all four pre-existing versions retained their content hashes, statuses and current flags.
- Repository-wide lint remains blocked by a pre-existing unused import in the unrelated untracked file `scripts/prepare-acute-appendicitis-case.ts`; the files changed for this correction pass lint.
