# Inline If/Then management pathways

Management actions can carry their rationale and If/Then pathways directly under the action, so the clinician no longer needs the Investigations table to know what to do with a result.

## Storage (backward compatible)
`clinicalManagement[].actions` stays `string[]` (audits, search, paste import and medicine linking read it). New optional `clinicalManagement[].actionDetails`:

```ts
{ actionIndex: number;            // position in actions[]
  rationale?: string;             // why (from the investigation's clinicalRationale)
  expected?: string;              // normal result (normalValue or expectedFinding)
  pathways: { trigger: string; response: string; urgency?: "immediate" | "urgent" | "routine" }[];
  investigationRef?: string;      // testName of the source investigation
  origin?: "authored" | "auto-linked" }   // auto-linked = needs clinician review
```
Validation: lib/validations/disease.ts (`actionIndex` must exist and be unique per step). View model for components: `toManagementSteps()` in lib/management-pathways.ts (`ManagementStep` with `ManagementAction[]`).

## Data
- supabase/migrations/20261103120000_management_action_details.sql: content snapshot table, validity function, NOT VALID check. Not applied yet.
- scripts/migrate-management-pathways.ts: copies rationale/expected from the matching investigation onto actions that ARE tests (starts with a test verb, not negated, not a drug badge). Never writes If/Then pathways and never edits an existing string. Dry run by default; `--apply` writes after saving a backup; `--restore=<file>` undoes. Skips published versions unless `--include-published`.

## UI
components/action-pathways.tsx (Tailwind, theme variables, no hover) rendered by components/pathway-sequence.tsx under each action.
