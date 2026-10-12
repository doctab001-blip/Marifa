# Marifa site audit and teaching-format redesign — 11–12 October 2026

This report covers the live site (https://marifa-clinical.vercel.app), the code on branch `codex/preserve-clinical-scenarios`, and the clinical catalogue in Supabase project `peuusnbucyazatkngvxw`. A per-topic table is in `topic-audit.csv`.

Status labels in this report are kept separate:

- **Technically deployed** means the code or data is live.
- **Evidence-verified** means each claim was checked against the cited source page.
- **Clinically approved** means an authorised reviewer signed it off. **Nothing in this work is clinically approved.**

## 1. Site faults found and fixed

| # | Fault (live, 11 Oct 2026) | Cause | Fix |
|---|---|---|---|
| 1 | **Disease Management showed "Clinical directory unavailable" and 0 guidelines.** `/api/topics` returned 503. | Directory and topic pages read the database with the public (anon) role, whose SELECT on `clinical_guidelines` was revoked by migration `20261010093716`. The error was swallowed silently. | Directory, topic and investigation-review loaders now use the same configured data client as the drafts pages. Errors are now logged. Local check: 72 approved or published topics listed (60 published + 12 approved; 9 drafts correctly excluded). |
| 2 | `/dashboard/admin/investigation-review` failed in the same way. | Same anon-role read. | Same fix. |
| 3 | `/diseases` still served the old 3-topic demo directory. | Legacy route left in place. | `/diseases` and `/diseases/:slug` now redirect to `/dashboard/diseases`. |
| 4 | Decision branches repeated the same citation block in every card, which doubled the length of management sections. | Renderer passed topic sources into each branch. | One citation block per branch group. |

## 2. Case pages redesigned in the StepUp ST4 format, as teaching rather than interview

StepUp ST4 presents each case as an interview drill: a topic library with "Topic n of N", a scenario card, "🎯 What is being tested" and "🎤 Sample answer — what you would say". Marifa now uses the same layout and visual style for every topic page. The interview framing is replaced with teaching and guidance:

| StepUp (interview) | Marifa (teaching and guiding) |
|---|---|
| Specialty topic library, Topic n of N, All topics | Care-pillar topic library, Topic n of N, All topics menu, Previous and Next |
| CLINICAL SCENARIO card | CLINICAL SCENARIO card with review status, source, version |
| 🎯 What is being tested | 🎯 What you will learn |
| (opening statement) | 🧑‍⚕️ The case (always labelled fictitious) |
| 🎤 Sample answer / What you would say | 🧭 How to approach it: numbered steps, each with a prompt and the reasoning |
| Examiner follow-up questions | ❓ Check your understanding: questions with a "Reveal answer" control |
| Mark scheme | ⚠️ Common pitfalls and 📌 Key teaching points |
| — | 📚 Teaching sources |

The six clinical sections are kept and renamed in teaching language, each opening with a short 💡 Guide prompt: 1 Why it happens (pathophysiology), 2 Recognise it (presentation and assessment), 3 What else could it be? (differential diagnosis), 4 Confirm it (investigations), 5 Manage it step by step (clinical management), 6 Ongoing care (disposition and follow-up).

**How it applies across all 81 topics.** Every topic page now uses this format. Where a version has no authored teaching layer, the guide is built automatically by re-presenting what is already in that topic's six sections (red flags, differentials, first management step). No new clinical claim is generated, and the page says so. Authored teaching content is stored in a new optional `teaching` object in `lib/validations/disease.ts`, which is additive and strict. All 240 existing versions still validate. The structured editor has a new "Teaching guide" section.

## 3. Template demonstrations (new under-review versions)

Two topics were rewritten in full as new, non-current, `under_review` versions. They are not approved, and all originals are preserved.

| Topic | Pillar | New version id | Sources (verified 11 Oct 2026) |
|---|---|---|---|
| Diabetic Ketoacidosis | Urgent Care | `884332ea-526d-4d69-a948-c42077c24cc7` | SDCPG 2021 (Saudi National Diabetes Center / Saudi Health Council) pp. 71–74; ADA/EASD/JBDS/AACE/DTS consensus, Diabetologia 2024 |
| Type 2 Diabetes Mellitus Longitudinal Care | Chronic Care | `ecc32e46-00c0-4ac7-86d6-3b35f4cf4f2b` | SDCPG 2021, Sections 1–11 |

Both topic pages show these versions through `clinicalReviewOverrides`, with the "UNREVIEWED DRAFT — NOT FOR CLINICAL USE" banner. The previous published versions remain in history.

**Saudi applicability.**
- SDCPG 2021 is national guidance and is primary for both topics. No newer edition was found on 11 October 2026.
- SFDA Saudi Drug Information System registration was checked for every medicine named. No potassium phosphate injection was found.
- Registration does not confirm hospital formulary inclusion or stock.

**Source conflicts recorded (DKA).** These are shown side by side rather than merged:
- Bicarbonate diagnostic threshold: SDCPG <15 mmol/L; consensus <18 mmol/L.
- Potassium level for holding insulin: SDCPG 3.3 mmol/L; consensus 3.5 mmol/L.
- Dextrose start: SDCPG narrative 15 mmol/L, order sheet 13 mmol/L; consensus 13.9 mmol/L.
- Insulin reduction: SDCPG at glucose <6 mmol/L; consensus at <13.9 mmol/L.
- Bicarbonate therapy: SDCPG pH <6.9 with 50 mmol; consensus pH <7.0 with 100 mmol.
- Potassium maximum rate within SDCPG: 40 mmol/h in the narrative, 10 mmol/h on the order sheet.

A local DKA protocol must choose one set of thresholds.

**Gaps that remain open.**
- DKA: the LMWH prophylaxis dose; pregnancy, paediatric and unstable-patient pathways.
- Type 2 diabetes: drug-level doses for SGLT2 inhibitors, GLP-1 receptor agonists, DPP-4 inhibitors and sulfonylureas, because SDCPG gives class guidance only.
- Type 2 diabetes: the metformin dose appears only in SDCPG's prediabetes section.
- Type 2 diabetes: figure-only content (Figures 2, 5, 9, 10, 12 and 13) could not be read as text.

## 4. Content audit findings (catalogue of 81 topics, 240 versions before this work, 242 after)

- **60 of 81 topics are published with generic template text.** Examples are "Evaluate the characteristic symptom pattern of…" and "A result that supports the working diagnosis…". All 60 carry `clinicalReviewStatus: pending` and display an unreviewed notice, so they are labelled correctly. They are not fit for teaching or clinical use until rewritten.
- **No current version has a source-verified medicine regimen** (0 of 81 before this work).
- **No topic had a clinical scenario** before this work.
- Only 18 current versions cite a Saudi authority (MOH, SHC or PHA).
- Several approved versions carry an incorrect issuing organisation. For example, the 2025 ACC/AHA ACS guideline and the AHA/ASA stroke resources are recorded as "Saudi Ministry of Health". Correct these through new versions.
- 12 topics are "approved". Some approvals were recorded in temporary credential-free administration mode (for example the appendicitis evidence-audit version). These are not verified clinical sign-offs. The topic pages now say this while that mode is active.

## 5. Governance and security risks (not changed; decision needed)

1. **Open administration.** `MARIFA_TEMPORARY_OPEN_ADMIN=true` makes every visitor a platform administrator who can edit and approve clinical content. Before any genuine clinical use, switch this off and use authenticated, role-based access with a recorded reviewer identity.
2. **In-place live edits.** "Save live pathway" overwrites the current published version in place (`saveDraftGuideline`, `isLive` branch). It does not create a new version, which conflicts with the rule that every clinical correction creates a new version.
3. **Placeholder modules.** Ten modules are still placeholders, including Hospital Protocols, Medicines and Formulary and Clinical Governance.

## 6. Next step to finish the rollout

Apply the demonstrated structure to the remaining 79 topics, starting with the 60 generic published topics. Each needs the same source-first rewrite. Make it a new under-review version, cite the page or section for every claim, check SFDA registration, and record source conflicts.

## Update 12 Oct 2026 — emergency-format rewrites complete for Urgent Care

All 21 Urgent Care topics now have an emergency-format version (Pathophysiology · Signs & symptoms · Investigations with normal vs deranged values · Management) with a numbered references list. Every new version is `under_review` / clinical review `pending`; no clinical approval was assigned and all earlier versions remain in history.

| Topic | Version shown | Main sources |
|---|---|---|
| DKA, HHS, hypoglycaemia | emergency-2026-10-12-v1 | Saudi Diabetes CPG 2021, MOH protocols 005/007, ADA/EASD 2024 |
| Anaphylaxis | v1 | MOH anaphylaxis protocol v1.2, RCUK 2021 |
| Sepsis ×2 | v1 | SSC 2021, MOH LRTI/UTI/IAI protocols |
| CAP | v1 | MOH LRTI protocol, ATS/IDSA 2019, ATS 2025 |
| DVT/PE | v1 | MOH DVT 2024 and PE protocols, ESC summary |
| Asthma ×2 | v1 | SINA 2024 (Saudi Thoracic Society) |
| AECOPD | v1 | GOLD 2024, NICE NG115, Saudi Thoracic Society 2025 |
| AKI | v2 | KDIGO 2012, NICE NG148, UKKA hyperkalaemia 2023; KDIGO 2026 public review DRAFT shown as labelled comparison only |
| Appendicitis | v1 | WSES 2020, MOH IAI protocol |
| Bowel obstruction | v1 | WSES Bologna ASBO 2017 (LBO not covered) |
| Pancreatitis | v1 | WSES 2019, NICE NG104, MOH IAI protocol |
| Upper GI bleeding | v1 | NICE CG141, BSG bundle 2020, MOH reversal + IAI protocols |
| Acute heart failure | v1 | Saudi Heart Association 2019 + 2023 update, SHA biomarkers 2022, NICE CG187 |
| ACS | v2 | Australian ACS 2025, NICE NG185, SHA biomarkers; carries forward user-supplied doses (unverified) |
| ACS escalation pathway | v1 | as above (without user-supplied doses) |
| Acute ischaemic stroke | v1 | NICE NG128, ESO IVT 2021, alteplase label |
| Poisoning | v1 | MOH alcohol & drugs protocol, ANZ paracetamol 2020 |

Open gaps (flagged on each page): ESC/AHA/ACC texts blocked by publisher; GOLD NIV thresholds (figure); local formulary/SFDA availability; drug doses not stated by sources left to local protocol; duplicate catalogue topics (asthma, sepsis, ACS) recommended for merge.
