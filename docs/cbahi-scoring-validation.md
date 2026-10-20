# CBAHI readiness scoring: what is verified and what is not

All figures the hub shows are **internal readiness estimates**. They are never an accreditation decision and the pages say so. Method version: `readiness-v1` (`SCORING_METHOD_VERSION` in `lib/governance/scoring.ts`), printed beside every score.

## Basis
The defaults come from the CBAHI *Hospital Accreditation Process Guide* (3rd edition, October 2016). The copy reviewed was a public re-host of the guide, not a download from cbahi.gov.sa, so **nothing below has been checked against the current official edition**. Which standards edition your hospital is surveyed against must be confirmed with CBAHI; record it in Settings.

| Rule | Default | Status |
|---|---|---|
| Sub-standard ratings: 0 insufficient, 1 partial, 2 satisfactory, plus not applicable | as stated | Stated in the 2016 guide. Re-verify for your edition. |
| Satisfactory at 80% compliance or more, partial at 50% or more | 80 / 50 | Stated in the 2016 guide. Re-verify. |
| Overall score = mean of applicable sub-standards | as stated | Stated in the 2016 guide. |
| Accreditation at 85% overall with every ESR satisfactory | 85 | Stated in the 2016 guide. Re-verify. |
| Conditional between 75% and 85%, or some ESRs unmet | 75 | Stated in the 2016 guide. Re-verify. |
| Denial risk when more than 25% of ESRs are unsatisfactory | 25 | **Ambiguous.** The guide's text is internally inconsistent about ESR thresholds; the stricter reading is used. Confirm with CBAHI. |
| Validity 3 years, mid-term self-assessment about 18 months after award, update 12 weeks before expiry | 3 / 18 / 12 | Stated in the 2016 guide. Re-verify. |

## Rules that are Marifa's own (not from CBAHI)
- A standard rated satisfactory whose evidence has expired or been withdrawn is **counted as partial** in the headline estimate. This is deliberately conservative. The score as rated is shown beside it.
- **Evidence completeness** (share of satisfactory ratings with current evidence) is a separate internal measure, never blended into a CBAHI-style score.
- **Unassessed applicable standards are never treated as satisfactory.** No outcome is shown until every applicable standard has a rating; a worst case (unassessed = 0) is shown instead.
- No standards text is shipped. Standards are imported from your licensed copy.

## Configurable
Thresholds, validity, edition label, award date and the source note are editable in Settings (`gov_settings`). Changing the *rules* (rather than the numbers) means bumping `SCORING_METHOD_VERSION` and updating tests in `tests/governance-scoring.test.ts`.

## To do before relying on the estimate
1. Obtain the current CBAHI hospital standards and process guide from CBAHI.
2. Compare every row above, correct Settings, and record the edition.
3. Ask CBAHI how the ESR threshold is applied.
