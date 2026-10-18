# Paste editor (offline topic editing)

Edit a whole topic by pasting it. No Claude or Codex credits are used: the text is read by plain code in
`lib/topic-paste.ts`, scored by the same audit that decides publication (`lib/clinical-authoring-audit.ts`),
and saved by `app/(workspace)/dashboard/admin/guidelines/[id]/paste/actions.ts`.

## Workflow
1. Open a topic in Disease Management and press the clipboard icon (or **Paste full content** on the topic's edit page).
2. Press **Copy Gemini prompt**, paste it into Gemini, and let Gemini write the topic.
3. Paste Gemini's whole answer into the box. The right-hand panel shows what was read under each heading, the score, and anything to fix.
4. If something needs fixing, press **Copy fix prompt for Gemini**, give it to Gemini, and paste the corrected topic over the old one.
5. Press **Publish** (enabled at 80% or more) or **Save as draft**.

## Rules the editor follows
- Every save is a new version; old versions are never edited. Publishing adds a new `-live` row only at 80% or more.
- `clinicalReviewStatus` stays `"pending"`. Publishing is not clinical approval.
- Sections missing from the paste keep the previous version's content and are marked "previous content kept".
- A reference is attached to a test or medicine only when the paste cites it as `[n]`. Nothing is guessed.
- The server re-reads the pasted text on save; the score shown in the browser is never trusted.
- URLs are not opened by Marifa. Open each link in the References panel before publishing.

## Accepted layout
See `PASTE_FORMAT` in `lib/topic-paste-prompt.ts`. Headings are matched by name, not by level, so `##`, `###`, numbered
headings and bold-line headings all work. Test and medicine tables need the columns named in that layout.
