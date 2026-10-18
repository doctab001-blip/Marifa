# Marifa implementation checklist

Status as of 9 October 2026.

## Phase 1 — Foundation

- [x] Next.js App Router, strict TypeScript and Tailwind foundation.
- [x] Premium responsive Saudi healthcare workspace design.
- [x] Isolated, clearly labelled demo sign-in using HTTP-only cookie.
- [x] Organization, membership, role, permission, professional-level and specialty schema.
- [x] Initial PostgreSQL RLS tenant policies and security helper functions.
- [x] Non-clinical demonstration seed records.
- [x] Connect Supabase Auth for invited-user sign-in and a server-side disease catalogue repository.
- [ ] Implement secure one-time initial administrator invitation.

## Phase 2 — Flagship clinical module

- [x] Useful ranked disease, synonym, symptom, abbreviation and Arabic-title search.
- [x] Specialty filtering, empty states and responsive results.
- [x] Disease detail, source hierarchy metadata and conspicuous demo status.
- [x] Structured pathway graph, renderer, print view and graph validator.
- [x] Bookmark interaction and personal-state isolation in local demo mode.
- [x] Guideline lifecycle interaction and version/audit model.
- [ ] Persist bookmarks, recent activity, guideline versions and approval decisions.
- [ ] Add document upload, private preview, signed URL and extraction review flow.
- [ ] Add authorized publication transitions with separate reviewer and approver checks.

## Phase 3 — Competency engine

- [x] Exact MBBS / GP, Specialist and Consultant database enum.
- [x] Specialty and professional level modeled separately.
- [x] Configurable competency template and assignment schema.
- [x] Clinician dashboard with completion, overdue and sign-off states.
- [x] Explicit safeguard: a quiz does not prove practical competence.
- [ ] Build assessment authoring/submission, pass/fail rules and attempt limits.
- [ ] Persist authorized supervisor sign-off and certificate generation.

## Phase 4 — Hospital platform

- [x] Coherent navigation and module status overview.
- [x] Foundational schema for departments and audit events.
- [ ] Complete policies, learning, governance, accreditation, intranet, medication and credential entities.
- [ ] Implement administrator compliance queries, filters and export authorization.
- [ ] Add private storage and acknowledgement workflows.

## Phase 5 — Validation and deployment readiness

- [x] Search, Arabic/RTL, pathway validation and competency-rule unit/component tests.
- [x] Playwright clinician search and competency journeys authored.
- [x] Security headers, environment template, setup notes and security checklist.
- [ ] Run two-tenant Supabase RLS integration suite after project configuration.
- [ ] Independent clinical safety review of every intended production record.
- [ ] Accessibility audit with assistive technology.
- [ ] Saudi legal, cybersecurity, health-sector and data-residency specialist review.
- [ ] Production deployment authorization and release review.
