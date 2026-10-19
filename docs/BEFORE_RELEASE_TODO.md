# Before release — to do

Items to finish before Marifa is released. Add new items at the bottom.

- [ ] **Turn clinical-governance gates back on.** Set `MARIFA_ENFORCE_GOVERNANCE=true` in Vercel (Project → Settings → Environment Variables → Production), then redeploy. Until then, development edit mode (`lib/dev-edit-mode.ts`) lets approved topics be edited and published below the 80% score. Added 19 Oct 2026.
- [ ] After turning the gates on, check that: approved topics are read-only again, Publish is disabled below 80%, and the live directory only shows topics scoring 80% or more.
