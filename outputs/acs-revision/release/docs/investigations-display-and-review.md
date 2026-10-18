# Investigation display and clinical revision status

Prepared 11 October 2026 for Marifa (Pulse).

## Released presentation

The shared investigation renderer uses separate cards with the named assessment,
the condition sought, the clinical decision rationale and findings/limitations.
It is used in disease details and the existing clinical editor. Bedside monitoring
is separated from laboratory tests for display without changing saved categories.
Cards stack their label/value pairs on narrow screens and retain the content in print.
Saved source metadata is shown as provenance, not as a claim of test-level verification.
Generic content is marked as needing clinical review.

## Clinical content remains a review proposal

The database catalogue contained 81 current shared records, including 71 visible
approved/published scenarios. Sixty visible scenarios had generic investigation
explanations. New non-current versions were prepared for those 60 scenarios and
the hypertension example: 61 revisions, 199 named assessments.

Revision identifier: `investigations-2026-10-11-v1`.

Each revision has status `under_review`, `clinicalReviewStatus: pending`,
`is_current: false`, and no approval or publication metadata. Current records,
historical versions, existing source references and all content outside the proposed
investigation section were preserved. Inserts used a before-image content-hash guard,
table locks within one transaction and conflict handling that never overwrites a row.

Platform administrators can inspect the proposals at
`/dashboard/admin/investigation-review`, linked from Governance & Approvals.
This is a read-only review surface. Proposals are not substituted into the clinical
directory or promoted to current versions.

## Evidence and outstanding clinical work

The hypertension proposal uses the Saudi MOH Cardiometabolic Risk Management manual,
Assessment of Hypertension, PDF pages 35–36, and MSD Manual Professional,
Hypertension — Testing (online review updated February 2026). The MOH manual is a
legacy reference; current Saudi/local applicability still requires review.

- [Saudi MOH manual](https://www.moh.gov.sa/en/Ministry/About/Health%20Policies/026.pdf#page=35)
- [MSD Manual Professional: Hypertension](https://www.msdmanuals.com/professional/cardiovascular-disorders/hypertension/hypertension)
- [Saudi MOH protocol directory](https://www.moh.gov.sa/ministry/mediacenter/publications/pages/protocols.aspx)

For the 60 textbook scenarios, the existing edition metadata was retained, including
Harrison's, Sabiston, Gabbe's, Nelson, Berek & Novak, and Oxford Textbook of Palliative
Medicine. Their proposed investigation explanations are clinical authoring drafts;
the full source chapters were not verified in this run. Publisher edition pages and
the MOH directory must not be treated as evidence supporting each sentence.

Before approval, a responsible clinician must verify the complete named-test list,
each interpretation and limitation against the relevant textbook chapter and the
applicable current Saudi MOH/hospital pathway, add exact sections/pages, and use the
existing clinical-governance process. No reviewer identity, review date, approval or
publication should be fabricated or copied from the previous version.

Authoring definitions are in `data/reviews/investigation-proposals.json`.
`scripts/prepare-investigation-revisions.ts` validates a local before-image and prepares
proposals; it performs no database writes. Execution snapshots and screenshots are
kept locally in `outputs/investigations/` and excluded from deployment uploads.
