# India draft topics — full authoring (22 October 2026)

Scope: the 39 Marifa India draft outlines that have **no Saudi counterpart** and had not already been authored. Drafts with a Saudi counterpart are being adapted in a separate workstream and were not touched.

Each record is a new version (`under_review`, `clinicalReviewStatus: "pending"`) on its existing draft guideline ID. All records pass the canonical schema and score **100% on the structural authoring audit** with no medicine-pathway errors or warnings. The score is structural only and is not clinical approval.

| Batch | File (data/india-versions/) | Topics |
| --- | --- | --- |
| 10 Vector-borne & zoonotic | batch10-vector-zoonotic.india-2026-10-22.json | Chikungunya; JE/AES; kala-azar & PKDL; lymphatic filariasis; leptospirosis; Nipah; melioidosis; Kyasanur Forest disease; brucellosis; rickettsial (non-scrub) |
| 11 Water/food-borne & parasitic | batch11-water-food-parasitic.india-2026-10-22.json | Cholera; hepatitis A & E; amoebic liver abscess; neurocysticercosis; soil-transmitted helminths & deworming |
| 12 TB, HIV, leprosy | batch12-tb-hiv-leprosy.india-2026-10-22.json | Extrapulmonary TB; DR-TB; TB preventive treatment; HIV & TB-HIV; leprosy; childhood TB |
| 13 Child & newborn | batch13-child-newborn.india-2026-10-22.json | Childhood pneumonia; measles; diphtheria; tetanus; neonatal resuscitation; prematurity & LBW (SAM and PSBI are in batch13a-sam-psbi, authored separately with more sources) |
| 14 Blood, NCD, environmental | batch14-blood-ncd-environmental.india-2026-10-22.json | Iron-deficiency anaemia; sickle cell disease; thalassaemia; oral cancer screening & tobacco; alcohol-associated hepatitis; alcohol withdrawal; heat stroke; arsenicosis; fluorosis; silicosis |

## Sources
Indian national sources were used first (NCVBDC, NCDC, ICMR STWs, NTEP, NACO, NSSK, Anemia Mukt Bharat 2026, MoHFW STGs, NPPCF, DGHS arsenicosis guide, NCDC/NPCCHH heat guidance). Where no Indian clinical guideline could be opened, a labelled international source was used (for example melioidosis, brucellosis, filariasis individual treatment, neurocysticercosis, cholera rehydration, thalassaemia chelation, measles vitamin A, tetanus, alcohol-associated hepatitis). Every investigation and medicine carries an exact locator; every topic lists unverified items in `evidenceAudit.unverifiedSections`.

## Disagreements shown side by side (guidelineComparison)
Leptospirosis IV doses (NCDC vs ICMR); PKDL second-line regimen; KFD case fatality; cholera doxycycline under 12; amoebic liver abscess regimens; neurocysticercosis praziquantel dose; diphtheria antitoxin dose; tetanus immunoglobulin and metronidazole; neonatal resuscitation rate and stopping rule; fluorosis urine thresholds.

## Doses deliberately not included (source not opened or not stated)
3HP and 6Lfx weight bands; NACO paediatric ART and co-trimoxazole doses; weight-banded shorter/longer DR-TB regimens; neonatal adrenaline and volume; Nipah and KFD antivirals (none recommended); lactulose; supplement doses in fluorosis; Wernicke high-dose thiamine; lepra reaction treatment.

Every medicine carries paediatric, penicillin-allergy, CKD and CLD lines. CKD/CLD lines that the source did not state are flagged as general cautions in each topic's unverified list.

## Writing to the database
`node scripts/push-india-draft-authoring.mjs <files> [--dry-run]` inserts each record as a new `guideline_versions` row (under_review, not current), skips any version already present, never edits existing rows, and reads back each insert.

## Needs clinician sign-off
All 39 topics, especially: paediatric doses taken from programme tables, international-source regimens, items listed in each topic's unverified sections, and local formulary/stock.
