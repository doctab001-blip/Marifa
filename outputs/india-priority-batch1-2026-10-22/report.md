# India priority batch 1 — 22 October 2026

## Delivered

Three full six-tier JSON records were authored against the existing India topic IDs. Each includes pathophysiology, presentation, differentials, investigations, clinical management, non-clinical management, a branched medicine plan, teaching and references. This batch does not create additional catalogue topics.

| Topic | Guideline ID | New version-row ID | Version | Structural audit |
| --- | --- | --- | --- | --- |
| Adult sepsis and septic shock (India) | ed976070-42c4-5258-904b-aa1f05e7ac77 | 47fa6fe8-ca9f-4662-8a6b-f940adc41547 | india-authoring-2026-10-22-batch1-v1 | 100%; 39/39 |
| Acute bacterial meningitis (India) | 373124f5-9dbb-5862-8587-3df0ff70a27a | 0062f462-4736-4732-8b47-bd21f398c376 | india-authoring-2026-10-22-batch1-v1 | 100%; 39/39 |
| Acute undifferentiated fever (India) | 379c6048-63ab-5683-9480-d6d4c2dbc397 | d06af3c3-8b1c-43a0-8ca1-90adbe49b4dc | india-authoring-2026-10-22-batch1-v1 | 100%; 39/39 |
| STEMI reperfusion and transfer pathways | 3b8706bd-e146-5a99-a3b8-74b997108793 | d7b28763-49f5-41f3-a7d0-6df006a4adac | india-stemi-scope-2026-10-22-v1 | 79%; scope revision only |

All four were inserted as `under_review`, `is_current: false`, with `clinicalReviewStatus: "pending"`; approval/publication timestamps are null. Database read-back verified exact JSON equality and confirmed the four original content rows and current flags were unchanged. The STEMI catalogue title was renamed; its old title remains in the immutable historical draft content. Other country topics and published records were not edited.

## Sources and clinical decisions

The official NCDC PDF directly confirms Version 2.0, **November 2025**. See `docs/india-source-roadmap.md` and each payload's final references for URLs and exact locators.

- **Sepsis:** NCDC–ICMR section 3.4, pp. 29–31; SSC 2026 named recommendation sections; Sepsis-3 Table 1/Box 3. Added 11 investigations, one selected antibacterial backbone with risk-triggered add-ons, fluid reassessment, vasopressor dosing, source control and recovery planning. Comparison table exposes the national glycopeptide default versus current international risk-based coverage and differences in fluid wording/older-adult pressure targets.
- **Meningitis:** NCDC–ICMR section 2.3 p. 20; WHO 2025 sections A.1–A.4, B.1–B.6, C.2–C.4 and Table 3.2; WHO toolkit slides 29–34. Added 12 investigations, safe puncture/imaging selection, standard and higher-risk antibacterial branches, conditional Listeria/resistance coverage, dexamethasone timing and hearing follow-up. Indian 10–14-day empirical duration and WHO conditional 7-day recovered/unknown-pathogen approach remain separate.
- **Undifferentiated fever:** NCDC–ICMR section 3.1 pp. 26–27; older ICMR empirical principles, rickettsial table and adult doxycycline dose as labelled supplements. Added 12 investigations, severity-first triage, no routine antibiotic for uncomplicated fever, staged tests, selected uncomplicated rickettsial treatment and result/review ownership. The comparison table shows the differing older/current chest-imaging timing.
- **STEMI:** older MoHFW cardiovascular guidance sections 2.0, 3.3–3.4 for India context; ACC/AHA 2025 sections 3.1, 5.2.1 and 5.3 for contemporary timing; ESC 2023 Table S11 for contraindications. Explicit branches replace any assumption of universal fibrinolysis-first care. Timely PCI, conditional fibrinolysis/transfer, contraindications, unstable/late presentations and rescue PCI are distinguished. Other clinical sections and the full antithrombotic/fibrinolytic order set remain unfinished; this is not a completed fourth topic.

## Medicine/formulary checks

Opened NLEM 2022 entries for piperacillin–tazobactam (6.2.1.13), meropenem (6.2.1.14), ceftriaxone (6.2.1.11), ampicillin (6.2.1.3), doxycycline (6.2.2.7), vancomycin (6.2.2.13) and noradrenaline (10.4.4). Product information and UCSF dosing supplement renal adjustment and administration details. NLEM is an essential-medicines listing, not verification of a stocked Indian brand licence. Product-specific infusion preparation, levels access and hospital stock remain local checks. SFDA checks are not claimed: the explicit task is India-specific.

WHO AWaRe warnings distinguish Access and Watch antibiotics; no Reserve rescue regimen is supplied without organism/susceptibility-based specialist selection. The 2025 classification publication was opened, but its downloadable classification file could not be retrieved; individual listed categories were cross-checked against opened WHO materials. UK-modified carbapenem categories were not substituted for WHO categories.

## Duration caps: a necessary qualification

Uncomplicated rickettsial treatment has a 7-day planned course; uncomplicated meningitis has source-specific maximum planned durations and organism-specific stop dates. NCDC does not define a universal maximum total course for sepsis, and its Gram-negative/staphylococcal meningitis instruction is **at least** 21 days. Inventing a numerical upper limit would misrepresent the source.

The payload therefore labels a proposed **48-hour empirical prescription review/renewal cap** separately from treatment duration. It requires local governance approval. It must not interrupt necessary treatment in unstable illness. Each renewal needs a diagnosis, source-specific duration and calendar stop date. This is not a claim that every systemic infection has a fixed nationally endorsed maximum course.

## Verification

- Canonical `DiseaseDetailSchema`: all four payloads valid.
- First three: structural audit 100%, no medicine-pathway errors or warnings, no outline placeholders, at least 10 investigation rows each.
- Original versions: below 80% before replacement; verified unchanged after additive insertion.
- Type check: passed (`npm run typecheck`).
- Full lint: four existing errors in untouched files: `_to_delete/india-check.ts` (1), `scripts/apply-critical-review.ts` (2), `scripts/stage-priority-urgent-care-batch-1.ts` (1).
- Full tests: 835 passed, 1 failed across 46 test files. The failure is the untouched PubMed title-match case in `tests/recent-developments-summary.test.ts`, line 39.
- Publication was not run: repository release checks do not pass. The records remain under review. No clinical approval is claimed.
- Compatibility issue found during final review: the India draft IDs created earlier are valid UUIDv5 values, but the existing save/paste/approval server actions use a UUIDv4-only regular expression. Canonical JSON validation succeeds, but those actions will reject these topic IDs. This batch preserves the original IDs and does not change application code because the clinical-authoring standard forbids UI/code changes outside the named topic content. A separate validator correction is required before editor saves or clinical approval of these India records can be claimed to work.
- Git fetch was blocked by read-only `.git` permissions. The GitHub connector comparison confirmed six newer main commits; this work does not modify their learning-portal/topic files or discard local changes.

The authoring score is structural, not a clinical safety certificate. Local antibiogram selection, the proposed authorisation rule, higher-risk meningitis choices, product stock and referral arrangements require clinician/pharmacy sign-off. Nothing in this report certifies those checks as complete.

Stop point: first three emergency topics only. No later topic batch was authored.
