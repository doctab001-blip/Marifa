# Before release — to do

Items to finish before Marifa is released. Add new items at the bottom.

- [ ] **Turn clinical-governance gates back on.** Set `MARIFA_ENFORCE_GOVERNANCE=true` in Vercel (Project → Settings → Environment Variables → Production), then redeploy. Until then, development edit mode (`lib/dev-edit-mode.ts`) lets approved topics be edited and published below the 80% score. Added 19 Oct 2026.
- [ ] After turning the gates on, check that: approved topics are read-only again, Publish is disabled below 80%, and the live directory only shows topics scoring 80% or more.
- [ ] **Recent Developments summaries.** Apply migration `supabase/migrations/20261019090000_recent_developments_summary.sql`, add `ANTHROPIC_API_KEY` (and optionally `NCBI_API_KEY`) in Vercel, then press "Write missing summaries" on the Recent Developments page. Check each publisher's terms for AI summaries of their abstracts. Added 19 Oct 2026.

## Medical Progress Archive (2016–2026)
- [ ] Apply Supabase migration `20261019100000_medical_progress_archive.sql` (widens types, adds archive columns, seeds 80 verified items). Then open Recent Developments > Archive.
- [ ] Review the seeded items (all checked against Crossref for DOI, title and date; summaries are our own words). Add more with `scripts/archive-seed/` (entries.py > build.py > gen_sql.py).
