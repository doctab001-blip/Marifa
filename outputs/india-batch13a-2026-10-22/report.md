# India batch 13a — SAM and neonatal sepsis / PSBI (22 October 2026)

Payload: `data/india-versions/batch13a-sam-psbi.india-2026-10-22.json` (version `india-authoring-2026-10-22-b13a-v1`).
Both: `status: under_review`, `clinicalReviewStatus: pending`. Not inserted, not published, not clinically approved.

| Topic | Guideline ID | Audit | Investigations | Pathway |
| --- | --- | --- | --- | --- |
| Severe acute malnutrition (India) | 3eb32f41-6dda-5ec1-8059-6b03f00c2918 | 100% (39/39) | 13 | No errors; 1 warning (ampicillin then oral amoxicillin step-down, sequential by design) |
| Neonatal sepsis / possible serious bacterial infection (India) | 7bdee7ca-c0cf-5701-b830-5aa418dcc177 | 100% (39/39) | 11 | No errors; 1 warning (cloxacillin added to ampicillin only for suspected staphylococcal infection, per MoHFW 2016 Table 7 footnote) |

## Sources opened in this task
- ICMR STW, Management of SAM with complications, October 2019 — triage, investigations, stabilisation, empirical antibiotics, electrolytes/micronutrients, anaemia, appetite test, failure and discharge criteria.
- MoHFW Operational Guidelines on Facility Based Management of SAM, 2011 (IndiaSpend library copy; not a government host) — Sections 1, 2, 4, 5.1–5.8, Annexure 4. Section 6 and Annexures 13–19 were not in the retrievable text.
- ICMR STW, Sepsis in Neonates, July 2020; ICMR STW, Neonatal Emergency Triage, July 2020.
- MoHFW STG, Common Respiratory Infections in Children, July 2016 — Table 6 (p. 8), pp. 7 and 9, Table 7 (p. 10), Annexure 4 (p. 42).
- WHO 2015 PSBI guideline (referral not feasible), Medbox-hosted copy — definitions p. vi, Recommendations 2–5.

## Source conflicts (shown in each topic's comparison table, not merged)
- SAM: oral amoxicillin dose (ICMR 50 or 40–45 mg/kg BD vs MoHFW 15 mg/kg TDS for 5 days); escalation cephalosporin dose; IV fluids in stabilisation (ICMR DNS 4 ml/kg/h vs MoHFW oral rehydration, IV only for shock); hypothermia threshold; feed frequency/volume; weight-gain benchmark.
- PSBI: outpatient amoxicillin (MoHFW 25 vs WHO 50 mg/kg BD); outpatient gentamicin range; durations; temperature sign; oxygen threshold (91% vs 90%).

## Needs clinician / pharmacist decision
- Which SAM antibiotic and fluid scheme the unit adopts (ICMR 2019 vs MoHFW 2011).
- Cefotaxime interval for non-meningitic sepsis (MoHFW Annexure 4 every 6 h vs footnote every 8 h for meningitis).
- MoHFW 2011 shock flowchart step after the repeat bolus (flattened in retrieved text).
- No penicillin-allergy alternatives or renal/hepatic adjustments exist in these sources; rows say so.
- Check for a newer MoHFW SAM/MAM protocol, PSBI operational guideline and the NCDC–ICMR 2025 neonatal content before approval.

## Not done here
- Supabase insertion: the database was unreachable from this session. Run `node scripts/push-india-draft-authoring.mjs data/india-versions/batch13a-sam-psbi.india-2026-10-22.json` (add `--dry-run` first).
- NLEM 2022 listing was not re-checked (PDF unreadable to the retrieval tool).
