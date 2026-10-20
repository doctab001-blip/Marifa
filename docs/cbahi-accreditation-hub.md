# CBAHI Accreditation Hub

Route: `/dashboard/accreditation-and-audits` (replaces the former placeholder module). Demonstration data only; the platform is not approved for real patient data.

## What it does
- **Readiness** – evidence-adjusted score, indicated outcome, ESR count, chapter radar, "fix this first" list, accreditation cycle dates.
- **Standards & evidence** – register imported from CSV, one rating per standard (0/1/2/NA), evidence upload with expiry, append-only assessment history.
- **Policies** – draft → committee review → approved → retired; approved policies are frozen; read-and-sign assignment and roster.
- **Incidents & CAPA** – SBAR reports (all staff), 5×5 risk matrix, sentinel handling, corrective actions with verification.
- **Audits & improvement** – audit calendar with recurrence and targets, PDSA project board.
- **Survey report** – printable and CSV export by chapter. **Settings** – thresholds, edition, award date.

## Design rules
1. No CBAHI standards text is shipped (copyright). Import from your licensed manual (template at `standards/template`).
2. Outcome is withheld until every applicable standard is assessed.
3. A Satisfactory rating with expired or no evidence counts as Partial in the headline score.
4. Output is a preparation indication, never an accreditation decision.
5. Thresholds default to the 2016 Process Guide (80/50, 85, 75, ESR 25%, 3-year validity) and are editable; the 25% ESR rule is ambiguous in the guide, the stricter reading is used.

## Enforced in the database
Satisfactory needs current evidence; notes required for partial/insufficient; assessments append-only; evidence withdrawn, never deleted; approved policies frozen; status moves only via RPC along the allowed path; sentinel incidents need a root cause and at least one CAPA to close; no incident closes with open CAPA; CAPA verification needs a note; every change is written to `audit_events`; access follows assigned roles (`quality_manager`, `clinical_director` added).

## Setup
1. Apply `supabase/migrations/20261020190000_cbahi_accreditation_hub.sql` (creates private bucket `governance-files`).
2. Grant `quality_manager` / `clinical_director` roles to users.
3. Import standards, then assess.

## Tests
- Unit: `npx vitest run tests/governance-*.test.ts`
- Database (88 checks, in-memory Postgres): `npm i --no-save @electric-sql/pglite && node supabase/tests/governance/run.mjs`

## Known follow-ups
- Old `components/governance/clinical-governance-hub.tsx` still shows CQC-style domains; retire or relabel.
- Apply migration to hosted Supabase and run `next build` locally.
