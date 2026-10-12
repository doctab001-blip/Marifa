# Chronic Care batch + Safe Birth batch — 12 October 2026

Batch of 15 rewrites in the four-heading format (pathophysiology; signs and symptoms; investigations with normal and deranged values; management with doses and label contraindications), plus references.

- Safe Birth: PPH, hypertensive disorders of pregnancy, maternal sepsis, VTE in pregnancy, preterm labour, PROM, gestational diabetes.
- Chronic Care: heart failure, asthma, COPD, hypothyroidism, dyslipidaemia, CKD, ischaemic heart disease, type 2 diabetes.
- ACS v3: FDA-label doses replace the unverified user-supplied doses.

Each was inserted as an `under_review` version, then published as a new `<version>-live` row on the platform owner's chat authorisation (12 Oct 2026). `approved_by` records publication authorisation only; `clinicalReviewStatus` stays `pending` and the unreviewed notice is shown. No existing row was edited.

The 9 topics added in this commit were in the below-80% correction queue (scores 59–63). Their new live versions score 84–91% on `scripts/audit-clinical-authoring-standard.ts` (`audit-report.json`), so they are added to `lib/data/clinical-directory-eligibility.ts`. The correction queue falls from 54 to 45; the live boundary holds 36 records.

Sources per topic are listed in each topic's References; doses are from the cited guideline or the US FDA label (DailyMed). SFDA registration was not checked drug-by-drug — each topic says "check SFDA registration, formulary and availability".
