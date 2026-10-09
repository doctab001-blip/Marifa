# Marifa

Marifa is a Saudi-context clinical knowledge, competency and governance SaaS foundation. This repository contains a production-oriented Next.js application shell plus an explicitly isolated demonstration mode.

> **Clinical safety:** all seeded clinical records are labelled **DEMO — NOT FOR CLINICAL USE**. They contain no medication doses, treatment algorithms, diagnostic thresholds or claimed approvals.

## What works now

- Supabase Auth sign-in for invited users plus an isolated demo sign-in with an HTTP-only session cookie.
- Organization-aware application shell and permission-oriented navigation.
- Ranked disease search across names, abbreviations, symptoms, specialties and indexed Arabic titles.
- Disease detail pages with source, version, status, jurisdiction and review metadata.
- Structured pathway graph rendering and publication validation for missing references, invalid transitions, cycles and unreachable nodes.
- Browser-persistent personal bookmarks in demo mode.
- Competency dashboard separating professional level, specialty and practical sign-off requirements.
- Interactive draft → review → approval → publication demonstration with visible audit events.
- Responsive and print-friendly layouts.
- Live Supabase PostgreSQL schema, shared demo catalogue, indexes, authorization helpers and tenant-isolating RLS policies.
- Unit/component tests and two Playwright journeys.

## Local setup

Requirements: Node.js 20+ and npm.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. Choose either demo identity. No password or production account is created.

Validation:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Database setup

The hosted development environment is connected to the isolated Supabase project `marifa-development` (`peuusnbucyazatkngvxw`) in `eu-central-1`. It contains only fictional demonstration metadata and no patient data. The UI reads the shared demonstration topic catalogue from Supabase and retains authored local detail content as a safe fallback.

To prepare another Supabase environment:

1. Create a non-production project in an approved region after data-residency review.
2. Apply `supabase/migrations/0001_marifa_foundation.sql`.
3. Apply `supabase/seed.sql` for non-clinical roles and the fictional organization.
4. Configure the public URL and anonymous key in `.env.local`; keep the service-role key server-only.
5. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the hosting environment.
6. Verify every RLS policy using two distinct tenant fixtures before adding private hospital content.

The migration does not create predictable demo auth accounts. Invitations and initial administrator setup must use a secure, one-time, server-controlled flow.

## Architecture notes

- `app/` — Next.js App Router pages and server routes.
- `components/` — reusable workspace, search, pathway, bookmark and workflow UI.
- `lib/` — typed domain model, demo repository, search ranking and pathway validation.
- `supabase/` — PostgreSQL migration and non-sensitive seed.
- `tests/` — Vitest and React Testing Library checks.
- `e2e/` — Playwright clinician journeys.

Tenant-owned tables carry `organization_id`. Client-provided tenant IDs must never be trusted; server code should derive the active tenant from the authenticated membership. Shared reference content is explicitly distinct from tenant-local content. Published clinical versions are append-only in the intended service layer; a new version supersedes the old one.

The AI assistant is intentionally not exposed. A future implementation must filter retrieval by tenant and permission before document retrieval, cite each source, identify conflicts and stale sources, and remain disabled when no provider or authorized document corpus is configured.

## Deployment to Vercel

The repository is linked only to the Vercel project `marifa-clinical`. The unrelated `ayahinstitute.pro` domain is not attached to Marifa.

1. Configure a production Supabase/PostgreSQL project only after security, residency and contractual review.
2. Add validated environment variables through Vercel project settings, never source control.
3. Use a private object-storage bucket and time-limited signed URLs for documents.
4. Run all validation commands and the deployment review below.
5. Connect the Git repository to Vercel and deploy a preview first.
6. Complete tenant-isolation, authentication, storage and clinical-safety acceptance tests before promoting production.

## Known limitations

- Demo session identities remain deliberately separate from Supabase Auth; invited Supabase users can sign in through the same login page.
- The disease catalogue and health check use Supabase; detailed clinical sections remain authored demonstration fixtures and mutations are not yet durable.
- Browser bookmarks and lifecycle interactions are demonstration state, not durable records.
- File upload, private storage, document extraction and signed URLs are not implemented.
- Assessment submission, certificate generation and administrator reporting are not implemented end to end.
- Governance, accreditation, formulary, onboarding and intranet modules currently have schema/design foundations or status cards only.
- No source-grounded AI assistant or external AI provider is connected.
- Arabic shell localization is not complete; indexed Arabic titles and RTL content rendering are demonstrated.
- The current CSP permits development conveniences and must be tightened with nonces/hashes for production.

See `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SECURITY.md` and `docs/DEPLOYMENT_REVIEW.md` for the precise release status.
