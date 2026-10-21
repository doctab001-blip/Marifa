# Governance Hub V2.1 — implementation report

Extends the CBAHI Accreditation Hub (migration `20261020190000`, commits 3019d0a / e955b7d). Nothing in V2 was rebuilt, removed or duplicated; there is no parallel "V3".

**Status:** code complete and tested locally. The migration has **not** been applied to any Supabase project and nothing has been deployed.

## 1. Summary of improvements

| Area | What was added |
|---|---|
| Standards hierarchy | Edition → Chapter → Standard → Measurable element. Elements carry internal code, official code, ESR flag *with the source of the classification*, department, responsible officer, applicability, evidence guidance, verification and review dates, append-only assessment history, linked CAPA/audits/indicators/guidelines. |
| Import wizard | `/standards/import`: upload → map columns → preview → validate (duplicate codes, missing identifiers, invalid parent references) → confirm → summary (imported, updated, unchanged, rejected rows, warnings). "Add only" or "add and update"; updates keep record ids, so assessment history and evidence stay attached. The server re-validates against the live register before writing. Original quick importer kept. |
| Internal requirements | Hospital-written requirements and elements are stored with `is_official = false` and labelled "Internal" everywhere. |
| Evidence vault | Expected-evidence checklists per standard/element (configurable categories), workflow Missing → Uploaded → Under review → Verified, with Expired / Superseded derived from the file; completeness panel listing exactly what is missing; one stored file linked to several standards/elements (no duplicate upload); versions (`supersedes_id`) with history; PDF/image preview; drag-and-drop upload; vault page with search and filters (`/standards/evidence`). |
| Clinical quality indicators | `/indicators`: indicator designer (all requested fields), seven non-authoritative templates **without targets**, manual reporting periods (numerator/denominator, value, sample, source document, notes), automatic percentage/rate calculation, zero-denominator handled as "no eligible cases", append-only history with corrections, verify/reject, dashboard cards with trend sparkline, detail page with Recharts trend and target line/band, links to standards/elements/guidelines/QIPs/CAPA. |
| Committees | `/committees`: four suggested templates (not auto-created), profile, members, meetings with Scheduled → Held → Minutes drafted → Approved → Actions followed up, attendance, minutes, decisions, attachments, next meeting. Approved minutes, attendance and decisions are frozen. Meeting actions are rows in the existing CAPA table (kind `follow_up`), so there is one action tracker. Decisions link to policies, guidelines, standards, CAPA, audits and QIPs. |
| Incidents & CAPA | Lifecycle stepper and status timeline, investigator and investigation dates, linked policy/guideline, RCA attachments, corrective vs preventive status, CAPA deadline, completion evidence, effectiveness verification. Risk matrix: axis labels, legend, per-cell counts and scores, tooltips, active-filter chip with reset, bands from the hospital's configured thresholds. Configurable regulatory reporting rules (no deadlines shipped) with pending / due soon / overdue / reported states. "Start an improvement project" from an incident. |
| Audits & QIP | Reusable audit templates (all requested fields), per-case observations (met / not met / N/A, no patient identifiers), compliance calculated from counts (by case and by criterion), completion with action plan and re-audit date, audit finding → QIP → re-audit links, multiple PDSA cycles per project with Plan/Do/Study/Act fields, history of every closed cycle. Existing calendar, results and board kept. |
| Guideline governance | `/policies/guidelines`: Marifa guidelines and local protocols with owner, current version, last/next review, governance status pinned to the reviewed version (flags when a newer clinical version appears), links to standards/elements/indicators/decisions. Compact, collapsed governance panel on the protocol page. Clinical content is never copied; order generation untouched. |
| Navigation | One hub bar with the nine sections (URLs unchanged; Indicators and Committees new), accent per section, compact scrolling bar on phones. Policies section has sub-tabs (Hospital policies / Clinical guidelines & protocols). |
| Design | V2.1 palette as CSS tokens with dark-mode values (`app/theme-v21.css`), navy sidebar with teal active state, compact page headers with icon and accent, tinted KPI cards, section accents, table header band/zebra/hover, shared chart colours, one stepper component for every workflow, phone-width fixes. |

## 2. Existing functionality preserved
All V2 routes, actions (`actions.ts` unchanged), tables, triggers, RLS policies, scoring rules and tests. The V2 database suites still pass (88/88 stub, 88/88 full chain, 35/35 workflows; chain additivity check passes). Readiness scoring is unchanged except that, matching the database guard, a file *linked* to a standard now counts for it and a *superseded* version no longer does (`effectiveEvidence`). The existing risk bands are the default thresholds. Every V2.1 panel degrades to a notice ("needs the V2.1 database update") if the migration is not applied, so the current hub keeps working before it is.

## 3. Database: `supabase/migrations/20261021090000_governance_hub_v21.sql`
Additive only. New tables (23): `gov_editions`, `gov_chapters`, `gov_elements`, `gov_element_assessments`, `gov_evidence_links`, `gov_evidence_requirements`, `gov_requirement_submissions`, `gov_indicators`, `gov_indicator_results`, `gov_committees`, `gov_committee_members`, `gov_meetings`, `gov_meeting_attendance`, `gov_meeting_decisions`, `gov_meeting_files`, `gov_incident_status_history`, `gov_regulatory_rules`, `gov_incident_notifications`, `gov_audit_templates`, `gov_audit_observations`, `gov_qip_cycles`, `gov_guideline_reviews`, `gov_links`. New view `gov_element_status`. New functions `gov_has_current_evidence`, `gov_entity_exists`, `gov_guideline_summary` (members-only read summary for the protocol page), `gov_complete_audit_counts`.

Columns added: `gov_settings` (risk band thresholds, methodology note), `gov_standards` (edition_id, chapter_id, is_official, source_reference, updated_at — backfilled), `gov_evidence` (supersedes_id), `gov_capa` (meeting/decision source, completion note/evidence, effectiveness), `gov_incidents` (investigator, investigation dates, linked policy/guideline), `gov_incident_files` (kind), `gov_audits` (template, objective, numerator/denominator, action plan, re-audit date, source QIP), `gov_qips` (source audit/incident).

Changed, not removed: two CHECK constraints on `gov_capa` widened (meeting actions, `follow_up` kind); `gov_assessment_guard` and `gov_audit` replaced by versions that accept everything they accepted before. Unique keys `(id, organization_id)` added to `gov_evidence` and `gov_qips` for composite foreign keys. Backfill: one edition per existing label, one chapter per code/name, first timeline entry per existing incident. No demonstration rows; no CBAHI text, ESR list, deadline or target.

Every new table: RLS on (governance staff read, writers write, auditors read-only, clinicians nothing unless stated), no anon grants, audit-trail trigger. Append-only rules enforced by triggers (element assessments, indicator results, evidence links, submissions, approved minutes, closed PDSA cycles).

## 4. New and modified files
New: `actions-v21.ts`; pages `indicators/`, `indicators/[id]`, `committees/`, `committees/[id]`, `standards/import`, `standards/evidence`, `policies/guidelines`, `audits/qip/[id]`; components `audit-v21`, `charts`, `drop-zone`, `import-wizard`, `incident-v21`, `link-panel`, `settings-v21`, `standard-v21`, `governance/protocol-governance-panel`; lib `audit-measures`, `committees`, `evidence-requirements`, `form`, `guideline-governance`, `hierarchy`, `indicators`, `regulatory`, `repository-v21`; `app/theme-v21.css`; the migration; `supabase/tests/governance/v21.mjs`; `tests/governance-v21.test.ts`.
Modified: hub layout, nav and `ui.tsx` (additive props/components), readiness, standards, standard detail, policies, policy detail, incidents, audits, report (+CSV), settings pages, governance landing page, protocol page (one line: the panel), `app/layout.tsx` (stylesheet import), `accreditation-hub.css` (appended), `chapter-radar.tsx` (palette), `lib/governance/{repository,scoring,types}.ts` (risk thresholds, exported `pageAll`).

## 5. Clinical guideline integration
Governance stores ids only: `gov_guideline_reviews` (status, governed version id, owner, review date, decision note) and `gov_links` (with `target_version_id` for guidelines). Links created from the guideline page point at the guideline and record the version current at the time. Approval is valid for the version approved; a newer clinical version shows "approved on an earlier version". The protocol page panel is read-only, collapsed by default, hidden if data cannot be read, and does not touch `ApplyProtocolPanel` or order generation. Indicators record a `source_kind` of `manual` or `audit`; automated measurement from clinical events is designed for (reserved, documented) but **not** enabled, and no selected order is assumed to have been given.

## 6. Design system
Tokens in `app/theme-v21.css` (light and dark): navy `#142B49`, teal `#087F8C`, turquoise soft `#DDF3F1`, royal blue `#3563C9`, soft blue `#E8EFFF`, muted gold `#C49A47`, soft amber `#FFF0D1`, emerald `#23876C`, soft coral `#FCE8E5`, cool slate `#F1F5F9`, plus coral/indigo and readable "ink" variants for text on tints, and six shared chart colours. Section accents: Readiness navy/teal, Standards blue, Policies gold, Incidents coral, Audits emerald, Indicators turquoise, Committees indigo. Gold is used for accents only (never as text on white). Status text is always present; colour reinforces it.

## 7. Tests and results (run 21 Oct 2026)
- TypeScript (`tsc --noEmit`): clean.
- ESLint on all new/changed code: clean. Whole repo: 3 errors in untouched scripts (`scripts/apply-critical-review.ts` ×2 — known; `scripts/stage-priority-urgent-care-batch-1.ts` ×1).
- Unit tests `tests/governance-v21.test.ts` (36) + existing governance unit tests: pass.
- Database (real PostgreSQL 16, every migration applied in order): `v21.mjs` 119/119 — additivity, hierarchy, import parent/duplicate rules, history preservation, evidence links/versions/workflow, indicator maths and history, committees and frozen minutes, guideline version pinning, CAPA effectiveness, regulatory rules, audit observations and counts, PDSA cycles, RLS for staff/auditor/clinician/other hospital, anon grants, audit trail. Existing suites: `run.mjs` 88/88 (stub and chain), `chain.mjs` pass, `workflows.mts` 35/35.
- Visual: real stylesheets rendered in Chromium at 1440 px (light, dark) and 390 px; fixes applied for phone overflow, dark-mode matrix contrast and nav wrapping.
- **Not run:** `next build`, the full Vitest suite and Playwright (packages could not be installed in this session), and no live browser check of the running app.

## 8. Known limitations
- Not verified in a running Next.js build or live browser; run the commands in §9 before deploying.
- Pre-existing: datetime inputs in the original incident form are read in server time (UTC) while shown in Riyadh time; the new V2.1 forms read them as Riyadh time.
- Indicator results are manual or audit-derived only; automated measurement is deliberately not implemented.
- Readiness score stays at standard level; element ratings are tracked and shown but do not change the CBAHI-style score.
- Committee templates and indicator templates are suggestions only; scoring thresholds remain the unverified 2016 defaults.

## 9. Configuration and reference data still needed
1. Apply the migration (after review) — ideally first to a staging Supabase project.
2. Import the licensed CBAHI standards and measurable elements for the correct hospital type with the wizard.
3. Enter regulatory reporting rules from the hospital's own source documents (none are shipped).
4. Confirm risk band thresholds and scoring thresholds against the current edition.
5. Set indicator targets, committee membership and evidence checklists locally.
