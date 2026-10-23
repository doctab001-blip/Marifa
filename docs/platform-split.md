# Marifa Saudi and Marifa India: one repo, two deployments, two Supabase projects

Decision (23 Oct 2026): Saudi and India run as two separate websites from this one codebase. Each deployment is fixed to its platform by `NEXT_PUBLIC_MARIFA_REGION`, and each has its own Supabase project. There is no region toggle on either site.

| | Marifa Saudi | Marifa India |
|---|---|---|
| Vercel project | `marifa-clinical` (existing) | `marifa-india` (new, same GitHub repo) |
| `NEXT_PUBLIC_MARIFA_REGION` | `SA` | `IN` |
| Supabase project | existing (`peuusnbucyazatkngvxw`) | new `marifa-india` (Mumbai, ap-south-1) |
| Local env file | `.env.local` | `.env.india.local` |
| Theme | Emerald | Indigo |

## What the code does

- `lib/region.ts`: `PLATFORM_REGION` comes from `NEXT_PUBLIC_MARIFA_REGION`. When it is set, `resolveRegion()` always returns it, and the `?region=` parameter and cookie are ignored.
- The header shows a fixed platform badge instead of the toggle. The sidebar brand reads "Marifa Saudi" or "Marifa India", and so does the browser tab.
- Topic pages never link across to the other country's profile.
- The `lib/region-topics.ts` filter still runs on top of this, as a second safeguard.
- With the variable unset (local development only), the toggle comes back so you can compare both catalogues side by side.

## One-time setup

### 1. Create the India Supabase project
In the Supabase dashboard, create a new project named `marifa-india` in the Mumbai region (ap-south-1). Note its database password, URL, anon key and secret key.

### 2. Copy the current database into it (schema, data and auth users)
This uses Supabase's documented CLI backup/restore route. It needs the Supabase CLI, Docker running, and `psql` (`brew install supabase/tap/supabase libpq`). Take both connection strings from each project's **Connect → Session pooler**.

```bash
OLD_DB_URL='postgresql://postgres.peuusnbucyazatkngvxw:<SAUDI_DB_PASSWORD>@<pooler-host>:5432/postgres'
NEW_DB_URL='postgresql://postgres.<INDIA_REF>:<INDIA_DB_PASSWORD>@<pooler-host>:5432/postgres'
mkdir -p ~/marifa-split && cd ~/marifa-split
supabase db dump --db-url "$OLD_DB_URL" -f roles.sql --role-only
supabase db dump --db-url "$OLD_DB_URL" -f schema.sql
supabase db dump --db-url "$OLD_DB_URL" -f data.sql --use-copy --data-only
psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file roles.sql --file schema.sql \
  --command 'SET session_replication_role = replica' \
  --file data.sql --dbname "$NEW_DB_URL"
```
This copies everything, including the temporary admin user. The Saudi database is only read, never changed. Storage bucket files are not copied; nothing in Marifa uses them yet.

Keep `~/marifa-split` outside the repo. The dumps contain the full database and must never be committed.

### 3. Create `.env.india.local` (git-ignored, like `.env.local`)
Copy `.env.local`, then change `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SECRET_KEY` to the India project's values, and add `NEXT_PUBLIC_MARIFA_REGION=IN`. Add `NEXT_PUBLIC_MARIFA_REGION=SA` to `.env.local`.

### 4. Vercel
- **Saudi, the existing `marifa-clinical` project:** add `NEXT_PUBLIC_MARIFA_REGION=SA` for Production and Preview, then redeploy.
- **India:** Add New → Project, import the same repo (`doctab001-blip/Marifa`), and name it `marifa-india`. Set the same environment variables as Saudi, but with the India Supabase keys and `NEXT_PUBLIC_MARIFA_REGION=IN`. Also set `MARIFA_TEMPORARY_*`, `ANTHROPIC_API_KEY` and `NCBI_API_KEY`. The weekly cron in `vercel.json` runs on both projects.
- Add a domain to each project as needed.

### 5. India Supabase auth URLs
In the India project, go to Authentication → URL configuration and set Site URL and Redirect URLs to the India domain.

### 6. Check both databases (read-only)
```bash
npx tsx --env-file=.env.local       scripts/report-cross-platform-topics.ts
npx tsx --env-file=.env.india.local scripts/report-cross-platform-topics.ts
```
Each run lists topics stored in that project that belong to the other platform. The app already hides them. Removing them is a separate step that happens only after the list has been reviewed and approved.

## Ongoing rules after the split
- **Content:** India topic scripts run with `--env-file=.env.india.local`, and Saudi topic scripts with `.env.local`.
- **Schema:** every new migration goes to **both** projects, applied to Saudi and then to India, so the code stays in step with both databases.
- **Code:** one change deploys to both sites. Vercel builds both projects from the same branch.
