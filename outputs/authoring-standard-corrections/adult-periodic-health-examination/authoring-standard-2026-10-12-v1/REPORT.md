# Adult Periodic Health Examination — authoring-standard-2026-10-12-v1

- **Topic / version ID created:** Adult Periodic Health Examination; `28f16ec0-d0ac-4c66-9ca0-54d8395dd111`.
- **Governance state:** `under_review`, non-current, `clinicalReviewStatus: pending`. Reviewer, approval, publication and new verification metadata are null.
- **Authoring audit:** 100% (32/32 checks); canonical `DiseaseDetailSchema` valid.

## Sources used

1. Saudi Public Health Authority, *Saudi Clinical Preventive Guideline*, third edition 2023. Methodology: PDF pp. 8-16 (printed pp. 2-10). Adult checklists and footnotes: PDF pp. 25-31 (printed pp. 18-24). <https://www.chi.gov.sa/en/aboutchi/cchiprograms/MedicineDocuments/Saudi%20Clinical%20Preventive.pdf>
2. USPSTF, *Breast Cancer: Screening*, 30 April 2024. Clinician Summary, Population and Recommendation. <https://www.uspreventiveservicestaskforce.org/uspstf/document/ClinicalSummaryFinal/breast-cancer-screening>
3. USPSTF, *Colorectal Cancer: Screening*, 18 May 2021. Recommendation Summary and Clinician Summary. <https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening?ftag=MSF0951a18>
4. USPSTF, *Prediabetes and Type 2 Diabetes: Screening*, 24 August 2021. Recommendation Summary and Practice Considerations, Screening Tests and Screening Intervals. <https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes/>
5. USPSTF, *Screening for Hypertension in Adults*, 27 April 2021. Recommendation Statement, Screening Tests and Screening Intervals. <https://www.uspreventiveservicestaskforce.org/uspstf/document/RecommendationStatementFinal/hypertension-in-adults-screening>

## Source conflicts

- Mammography: Saudi PHA 2023 suggests ages 40-69 every 1-2 years; USPSTF 2024 recommends ages 40-74 every 2 years. Both are shown side by side.
- Diabetes: Saudi PHA starts testing at age 35 every 3 years and adds a BMI-plus-risk-factor rule; USPSTF targets ages 35-70 with overweight or obesity and says a 3-year interval may be reasonable after a normal result. Both are shown side by side.
- Colorectal screening: both opened sources begin at age 45 and routinely screen through 75; USPSTF also describes selective screening at ages 76-85. This is shown separately.

## SFDA check

No medicine is prescribed. SFDA register verification is not applicable to this topic.

## Unverified items

- The PHA document says it should be updated every 2 years, but no later official Saudi edition was located during this run.
- Post-2023 Saudi cervical-screening and adult-immunisation schedules were not reconciled, so they are not actionable in this correction.
- Local laboratory and radiology reference intervals and local programme booking rules require clinician confirmation.

## Changes

- Replaced generic screening prose with source-located eligibility, intervals and follow-up actions.
- Added normal/reference findings, expected findings, interpretation and claim-level citations to every investigation row.
- Added timed management steps and explicit branches for due and not-due screening.
- Added side-by-side guideline conflicts without blending ranges.
- Added teaching points, pitfalls, discharge criteria, named follow-up responsibility and an evidence-gap audit.
- Kept medicines out of scope and recorded `no-drug-indicated`.

## Verification

- All three pre-existing rows retained their original content hashes, statuses and current flags.
- Focused directory and pathway tests passed: 2 files, 7 tests.
- Repository-wide typecheck is blocked by the unrelated untracked `outputs/acs-revision/release/components/app-shell.tsx` copy, which imports a removed `SidebarNavigation` export.
- Repository-wide lint is blocked by the unrelated untracked `scripts/prepare-acute-appendicitis-case.ts` unused `dirname` import.
- The public no-login Draft directory shows the new version as a clickable tile. The structured editor loads all fields and its edit, approval and save controls. The rendered draft preview displays Pathophysiology, Signs & symptoms, Investigations, Management and References.
- No Vercel deployment was required; the additive database version appeared immediately through the already deployed application.

## Needs clinician review

A clinician must confirm adoption of the newer international differences, local screening-programme capacity, reference intervals, and whether omitted cervical-screening or vaccination content should be added after a current Saudi source is identified. The version remains unapproved and non-current.
