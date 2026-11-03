# Inline If/Then management pathways

## Rule
A result appears in Management only if it changes the next step, the timeframe or the disposition. Reference ranges, normal results, rationale, pros and cons stay in the Investigations tab. Each pathway links back to its tests, and each test links to the step that uses it, so there is one source of truth.

This follows how NICE (CG109), the ESC syncope guideline, NHS trust pathways and BMJ Best Practice present it: the test is an action in the pathway with a threshold and an action attached; interpretation tables sit in a separate reference layer; "do not routinely order" is stated explicitly.

## Storage (backward compatible)
`clinicalManagement[].actions` stays `string[]` (audits, search, paste import and medicine linking read it). New optional `clinicalManagement[].actionDetails`:

```ts
{ actionIndex: number;                       // position in actions[]
  pathways: { trigger: string; response: string; urgency?: "immediate" | "urgent" | "routine" }[];  // at least one
  investigationRefs?: string[] }             // testName of the Investigations rows relied on
```
Validation: lib/validations/disease.ts (`actionIndex` must exist and be unique per step). View model: `toManagementSteps()` in lib/management-pathways.ts. Back-links: `investigationStepNumbers()`.

IMPORTANT: the step schema is strict, so code that predates this change rejects a topic containing `actionDetails`. Deploy the code before writing any `actionDetails` to a database.

## Data
supabase/migrations/20261103120000_management_action_details.sql: content snapshot table, validity function, NOT VALID check. Not applied yet. Pathways are authored per topic (drafted from the topic's Investigations text and cited sources, then clinician-reviewed); there is no automatic copying.

## UI
components/action-pathways.tsx (Tailwind, theme variables, no hover) rendered by components/pathway-sequence.tsx under each action; emergency-topic.tsx shows "Decision rule: Management step N" under a test in Investigations.
