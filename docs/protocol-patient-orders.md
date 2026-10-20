# Protocol → patient orders

A doctor opens a patient encounter, applies an approved protocol from **Disease Management** or **Local Protocols / Clinical Guidelines**, reviews the proposed orders and saves them as **draft orders**. Nothing is signed, prescribed, sent, scheduled or completed by Marifa.

## Where it lives
| Piece | Path |
| --- | --- |
| Shared apply service (both modules call it) | `lib/clinical-orders/service.ts` |
| Order derivation from structured protocol fields | `lib/clinical-orders/derive-order-items.ts` |
| Rules: roles, duplicates, review/draft status | `lib/clinical-orders/policy.ts` |
| Supabase access (server only) | `lib/clinical-orders/repository.ts`, `workspace.ts`, `auth.ts` |
| Server actions | `app/(workspace)/dashboard/patients/actions.ts` |
| Review panel (client) | `components/clinical-orders/apply-protocol-panel.tsx` |
| Patient workspace / order columns | `app/(workspace)/dashboard/patients/`, `components/clinical-orders/order-board.tsx` |
| Database | `supabase/migrations/20261020120000_patient_orders_foundation.sql` |
| Database tests (in-memory Postgres) | `supabase/tests/patient-orders/run.mjs` |

The **Apply Protocol to Patient** button is on `/dashboard/diseases/[id]` (Disease Management and the Clinical Guidelines directory both open this page, source module `disease_management`) and on `/dashboard/protocols/[id]` (Local Protocols, source module `clinical_guidelines`). Both call the same server actions and the same service. The canonical protocol identifier is `clinical_guidelines.id` plus the `guideline_versions.id` of the current version.

## What becomes an order
Only explicit, structured fields are used. Narrative text is never parsed.

| Protocol field | Order | Default |
| --- | --- | --- |
| `investigations.ruleIn` laboratory / first-line imaging | Laboratory / imaging | Ticked, "Standard" |
| other `ruleIn` tests, all `ruleOut` tests | Investigation | Offered, not ticked, "Optional" |
| `medicationPlan.regimens` with no branch, `useWhen` or one-of | Medication (dose, route, frequency, duration kept verbatim) | Ticked, "Standard" |
| regimens with a `branch`, `useWhen` or `one-of` selection | Medication | **Conditional, never ticked** |
| regimen `monitoring[]` | Monitoring | Optional, not ticked |
| `nonClinicalManagement.followUpPlan` | Follow-up | Optional, not ticked |

* There is no structured procedure list in the protocol schema, so no procedure orders are proposed (the tab says so).
* A medicine plan that fails `medicationPathwayIssues` (the existing pathway validation) is withheld, with a visible warning.
* Placeholder values ("not stated", "see label", "check formulary"…) and weight-/surface-area-based doses are flagged **incomplete**. Marifa never fills or calculates a value. An incomplete order cannot be marked reviewed until the clinician supplies the value.
* Conditional orders can be marked reviewed only after the clinician ticks "I have verified this applies to this patient". Marifa holds no verified patient findings, so it never satisfies a condition itself.

## Safety rules and where they are enforced
| Rule | Application | Database |
| --- | --- | --- |
| Clinical role required (consultant, specialist, MBBS/GP, admin roles; **assigned roles only**, never the user-editable `professional_level`) | `policy.ts`, `auth.ts` | `user_can_manage_patient_orders`, RLS |
| Right patient and encounter | encounter loaded within the actor's organisation | composite foreign keys; patient/encounter immutable on an order |
| One transaction | `repository.applyOrders` → single RPC | `apply_protocol_orders` |
| Duplicates need an explicit decision | preview flags them, apply refuses | re-checked in the RPC under an encounter row lock |
| Never signed | `status` can only be `draft` or `reviewed` | trigger rejects `signed` |
| Signed / removed orders are immutable, orders are never deleted | | triggers |
| Editing a reviewed order returns it to draft | | trigger |
| Protocol edits do not alter existing orders | orders are copies | per-version order-set snapshot + provenance |
| Audit trail | | `audit_events`: `protocol.applied_to_encounter`, `patient_order.created/updated/reviewed/removed`, patient and encounter events |

## Applying the migration
The migration has **not** been applied to any hosted database. Apply `20261020120000_patient_orders_foundation.sql` to the development Supabase project before using the feature. The acting user (or the configured temporary admin user) needs an active membership with an ordering role.

Data is for demonstration only: the platform is not approved for real patient data. Patients created in the UI are marked fictional.

## Not in scope
Formulary, SFDA sync, pharmacy stock, interaction checking, automated prescribing or dosing, EHR/FHIR connectivity, AI recommendations and order signing/transmission. The tables are shaped to map later onto FHIR `PlanDefinition` (order sets), `ServiceRequest` (investigations) and `MedicationRequest` (medications).
