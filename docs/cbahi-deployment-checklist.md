# CBAHI Accreditation Hub: production migration and deployment checklist

Nothing here has been run against a live Supabase project. Apply to a **staging** project first.

## 0. Preconditions
- [ ] A staging Supabase project exists (restore of production or a branch). The repo links to one project only (`supabase/.temp/project-ref`); that is treated as production.
- [ ] Take a backup / point-in-time marker of production.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` pass on the commit being deployed.

## 1. Staging database
- [ ] `supabase db push` (or SQL editor) against staging: applies only `20261020190000_cbahi_accreditation_hub.sql` (additive; creates `gov_*` tables, two views, helper functions, two roles, the `governance-files` bucket and an `audit_events` read policy).
- [ ] Verify: 14 `gov_*` tables with RLS on; views `gov_standard_status` and `gov_policy_ack_summary` are `security_invoker`; bucket `governance-files` private with a 20 MB limit; roles `quality_manager`, `clinical_director` exist.
- [ ] Row counts of existing tables (organizations, profiles, clinical_guidelines, patient tables) unchanged.
- [ ] Supabase Security Advisor shows no new errors.

## 2. Staging application
- [ ] Deploy the branch to a Vercel preview that points at staging (`NEXT_PUBLIC_SUPABASE_URL`, anon key, service key for staging).
- [ ] `MARIFA_TEMPORARY_OPEN_ADMIN` **unset** in the preview.
- [ ] Sign in as a governance_lead, quality_manager, clinical_director, auditor and an ordinary clinician and walk through the workflows in `supabase/tests/governance/workflows.mts` by hand: import standards CSV; rate and upload evidence; create/approve/assign a policy and sign it as a clinician; report an incident as a clinician and run it to verified closure; schedule/complete an audit; run a QIP through PDSA.
- [ ] Upload a PDF and open it via the signed link; confirm a clinician cannot open other people's incident files.
- [ ] Check light/dark theme, a phone-width viewport, print preview of the survey report, and the CSV export.
- [ ] A second organisation's user sees none of the first organisation's records.

## 3. Production
- [ ] Remove `MARIFA_TEMPORARY_OPEN_ADMIN`, `MARIFA_TEMPORARY_ADMIN_USER_ID`, `MARIFA_TEMPORARY_ADMIN_ORGANIZATION_ID` from the production environment (the app currently runs with open admin when they are set; real roles apply once they are removed). Ensure real users hold the governance roles first or nobody will be able to write.
- [ ] Apply the migration to production in a quiet window; re-run the section 1 checks.
- [ ] Deploy; smoke test sign-in, `/dashboard/governance`, `/dashboard/accreditation-and-audits`.
- [ ] Confirm Settings shows the edition you are surveyed against (see `docs/cbahi-scoring-validation.md`).
- [ ] Do not enter real patient data: the platform is not approved for it. Incident MRN and narrative fields stay empty until that approval exists.

## Rollback
The migration is additive. To back out, redeploy the previous application build; the unused `gov_*` tables can stay. Do not drop tables that hold records without a backup.
