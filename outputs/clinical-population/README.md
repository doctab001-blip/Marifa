# Marifa population handover — 11 October 2026

Resumed the existing working tree and fetched `origin`. The active branch is
`codex/preserve-clinical-scenarios`, synchronized with its upstream and six
commits ahead of `origin/main`. No existing file was reset or replaced.

The frontend, governance/version tables, strict clinical payload schemas,
and `lib/pathway-validation.ts:validatePathway` already exist. Live database
verification matters: `save_extracted_graph_pathway` is not installed, and the
normalized graph tables are empty. The 12-row `disease_topics` table is not the
full master catalogue. The existing shared catalogue has 81 scenarios: 71
approved/published and 10 drafts. The larger local differential/branch CSV is
preserved unchanged and is a separate expansion list.

## Completed batch 001

Ten alphabetical master-catalogue scenarios have new versions named
`official-extraction-2026-10-11-b001`. They are stored in the existing
`guideline_versions.content` contract with additive `granularPathway` and
`medicationPlan` content. Every new version is `draft`, `is_current=false`,
and `clinicalReviewStatus=pending`. Reviewer, approval, publication and
verification dates are null. The original clinical content outside this
limited extraction is inherited, explicitly described as not newly verified.

Official NICE, RCUK and WSES source retrieval artifacts are in
`batch-001/sources`. Sources are international candidates pending Saudi/local
adaptation. Appendicitis uses the open-access 2020 WSES edition and explicitly
requires reconciliation with the newer 2025 edition. Exact doses are included
only for the four regimens supported in the selected excerpts: adrenaline,
ACS aspirin, COPD prednisolone and stroke aspirin. Missing drug/dose/route,
complete contraindication lists, and prescribing adjustments are review gaps.
This is limited evidence population, not ten complete clinically validated
guidelines.

`DiseaseDetailSchema` and `ClinicalPathwaySchema` accepted all ten payloads.
The established graph validator accepted all ten local graph artifacts in
`batch-001/prepared.json`; this is structural validation, not clinical review.
Graphs are retained locally rather than written through an unapplied RPC.
Nine focused tests and `tsc --noEmit` passed.

The guarded SQL transaction inserted exactly ten draft versions. Independent
read-back verified all draft invariants and confirmed all 145 original version
records retain their IDs, content hashes, status and current flags. The 71
approved/published scenarios and current versions are preserved. Nothing was
approved, published or deployed. Existing UI queries may filter non-current
drafts; database persistence is confirmed, signed-in queue visibility is not.

## Completed batch 002

The next ten alphabetical master-catalogue scenarios now have versions named
`official-extraction-2026-10-11-b002`. Each is an additive, non-current draft
with pending clinical review and null reviewer, approval, publication and new
verification dates. The original current version's required `review_date` was
retained because the database column is non-null; it is not presented as a new
verification.

Official RCUK, NICE, USPSTF and CDC retrieval artifacts are in
`batch-002/sources`. Exact URLs, editions, page or section locators and patient
scope are recorded in `extractions.json`. The selected excerpts did not support
a complete regimen containing dose, route, frequency, duration and
contraindications, so no medication regimen was added. Named medicines and
missing details are recorded only in source-backed actions and review gaps.
Inherited sections and references remain explicitly marked as not newly
verified.

Both payload schemas and `validatePathway` accepted all ten drafts; focused
tests and TypeScript checks passed. The guarded transaction inserted ten rows.
Independent read-back verified 165 total versions, exactly ten batch-002 rows,
81 unchanged current versions, and all 155 pre-batch records unchanged by ID,
content hash, status and current flag. The catalogue remains 81 scenarios, of
which 71 are approved or published. Nothing was approved, published, made
current or deployed.

## Continuation

Use `plan.json` as the durable master/cursor. Five full batches of ten remain
after batch 003, plus one final remainder. Do not silently relax strict batch
size for the remainder. Report it separately after full batches finish.

For each new batch, refresh the live catalogue/version baseline, reconcile
remote and local work, retrieve official guideline text, and save exact source
URLs, edition, locators and scope. Use the existing schemas and validator.
Do not require a new OpenAI API key: the background Codex run can research and
prepare source-backed extracts directly with its browsing/file tools.

The preparation script now derives source-text hashes from each batch folder
and permits the official hosts used through batch 003. Review and extend its
source-host allowlist only for retrieved official sources in each future batch;
do not bypass provenance validation.
Persist local artifacts exclusively, never overwriting a prepared payload.
Use a guarded transaction with before-image hashes, duplicate prevention and
rollback; save only new non-current unverified versions. Read back all new
rows, compare original records, and only then advance the cursor. Never change
approval/publication/current flags to make drafts appear in a public catalogue.

Do not run `scripts/process_clinical_pathways.py`: its documented table contract
does not match this database. Do not apply new schema or substitute seed data
to make a worker run. No unattended external model worker is running because
this session has no `OPENAI_API_KEY` or signed-in Supabase access token.

## Completed batch 003

The next ten alphabetical master-catalogue scenarios now have versions named
`official-extraction-2026-10-11-b003`. Each is an additive, non-current draft
with pending clinical review and null reviewer, approval, publication and new
verification dates. The original current content and its required database
review date were retained; inherited sections and references are explicitly
marked as not newly verified.

Official NICE, USPSTF, NHS England/GOV.UK and Saudi Ministry of Health source
artifacts are in `batch-003/sources`. Exact URLs, editions, section or
recommendation locators and patient scopes are recorded in `extractions.json`.
Two oral morphine titration regimens were included only because NICE CG140
supports their dose, route and frequency for the narrowly stated patient group;
renal and hepatic limits and remaining contraindication gaps are explicit. All
other named medicines remain source-backed actions or review gaps where the
retrieved source did not provide a complete regimen.

Both payload schemas and `validatePathway` accepted all ten drafts; eight
focused tests and TypeScript checks passed. The guarded transaction inserted
exactly ten rows. Independent read-back verified 261 total versions, exactly
ten batch-003 rows, 81 unchanged current versions, and all 251 pre-batch records
unchanged by ID, content hash, status and current flag. Nothing was approved,
published, made current or deployed.
