# Clinical branch extraction scope

`master-disease-list.csv` is the source list used by `scripts/extract-clinical-branch-drafts.mjs`. It is built from every current shared catalogue topic and its differential diagnoses, then adds the cardiovascular branches and the specialties absent from the current catalogue. Each row preserves its specialty tags, source scenarios and catalogue/version status. Refresh it with `npm run build:master-disease-list` after reviewing the linked project.

The extraction script uses OpenAI Responses web search restricted to the official domains listed on each row. It writes local JSON drafts and source metadata under `data/clinical-branch-drafts/`; it does not write to Supabase or approve/publish clinical content. Since the master list contains hundreds of rows, the script shows its size without making API calls by default. Use `--condition <name>`, `--limit <count>`, or explicitly `--all` to choose the API-call scope.

ESC guideline text is not included in automated retrieval. ESC's official [acute pulmonary embolism guideline page](https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/acute-pulmonary-embolism/) states that use of ESC guideline content in software tools, generative AI, computational models, or algorithms requires a formal license agreement. Add ESC source material only after that license is in place and its scope is documented.

Every output remains an unreviewed draft. The app's existing `/diseases/[slug]` route continues to serve the governed disease catalogue. `/branches/[condition]` is a separate read-only view over local drafts and always displays a not-for-clinical-use notice. Moving generated content into governed catalogue data requires a new version and the existing clinical review process.

Run with `OPENAI_API_KEY=... node scripts/extract-clinical-branch-drafts.mjs`. Existing output files are never overwritten. If only one file of a draft/source pair exists, resolve that partial output manually before retrying.
