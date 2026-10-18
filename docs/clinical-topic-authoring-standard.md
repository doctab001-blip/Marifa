# Marifa topic authoring rules for Codex

You are writing or editing clinical topics for Marifa, an emergency-medicine reference used by doctors in Saudi Arabia. A doctor may act on what you write at 3 a.m. Accuracy beats completeness. Brevity beats coverage. If you are not sure, say so in the topic instead of guessing.

These rules are strict. Do not relax them for speed, and do not report a rule as followed unless you actually followed it.

---

## 1. Hard rules (breaking any of these fails the task)

1. **No invented facts.** Every dose, threshold, cut-off, timing, percentage and drug name must come from a source you opened in this task. Do not cite from memory. If you could not open a source, write that in the report and leave the item out or mark it unverified.
2. **Cite the exact place.** Each reference gives the page, section, table or figure (e.g. "SDCPG 2021, pp. 76–79", "SSC 2021, Rec. 31"). A citation must support the specific sentence it is attached to, not just the topic.
3. **No fake URLs.** Only use URLs you actually loaded. No guessed DOIs, no guessed PubMed IDs.
4. **Never touch published content.** Never edit a published or current version in place. Every change is first saved as a new version with `status: "under_review"`, `is_current: false`, `clinicalReviewStatus: "pending"`. **Automatic publication:** if that version scores at least 80% on the authoring audit (`lib/clinical-authoring-audit.ts`), publish it with `scripts/publish-if-eligible.ts` — this adds a new `-live` row and leaves history intact. Below 80% it stays a draft. Publication never means clinical approval: keep `clinicalReviewStatus: "pending"` and the unreviewed notice, and never mark anything as clinically reviewed.
5. **Never merge disagreeing sources.** If two guidelines give different numbers, show both side by side in `guidelineComparison`, with the source for each. Do not average them, pick one silently, or blend them into a range neither source states.
6. **Adults only unless stated.** Paediatric doses only from a paediatric source, and labelled as paediatric.
7. **Numbers must match across the topic.** The same threshold or dose must be identical in Investigations, Management and the comparison table.
8. **Paraphrase sources.** Do not copy guideline paragraphs verbatim. Tables of numbers are fine; prose must be your own words.
9. **Stay in scope.** Change only the topic(s) named in the task. No refactors, no schema changes, no UI changes, no edits to other topics. If the schema cannot hold something important, stop and report it — do not add fields.
10. **Never expose secrets.** Read `SUPABASE_SECRET_KEY` from the environment. Never print, log or commit it.
11. **Medicines are a pathway, not a list.** Follow "Medicine pathways" in section 3. A flat table of every drug, or alternatives presented as if all are given, fails the task.

---

## 2. Source order

Use the highest available tier, and always include a Saudi source when one exists.

1. **Saudi national:** Saudi MOH protocols, Saudi Health Council / SDCPG (diabetes), Saudi Thoracic Society (incl. SINA asthma), Saudi Heart Association, Saudi Society of Nephrology, SCFHS-endorsed guidance.
2. **Major international:** NICE, ESC, AHA/ACC, Surviving Sepsis Campaign, GOLD, BTS, KDIGO, JBDS/ADA consensus, WSES, ESO, RCEM, UK Kidney Association, ERC/ILCOR.
3. **High-quality reviews** only to fill gaps the guidelines leave, labelled as such.

Never use: blogs, forums, unsourced websites, AI-generated summaries, or Medscape/UpToDate text you cannot open.

**Medicines:** check each drug on the SFDA register (https://sdi.sfda.gov.sa/). If not registered in Saudi Arabia, say so and give the registered alternative from the source if there is one. Add "Check hospital formulary" where local availability varies.

---

## 3. Topic structure

Exactly four clinical headings, in this order. Anything else important (classification, scoring, special groups, pitfalls) goes inside one of these — no extra top-level sections.

### Pathophysiology
- 3–6 short bullets. Mechanism only as far as it explains the signs, the test results or the treatment.
- No textbook history, no epidemiology paragraphs.

### Signs & Symptoms
- Symptoms, examination signs, **red flags** (what makes this an emergency / needs ICU), common precipitants.
- Key differentials with the one feature that separates each.

### Investigations
A table. Every row has all four columns:

| Test | Normal (adult) | In this condition | What it means / next step |
|---|---|---|---|
| Venous pH | 7.35–7.45 | < 7.30 (DKA) | Severity marker; recheck 1–2-hourly |
| Capillary β-hydroxybutyrate | < 0.6 mmol/L | ≥ 3.0 mmol/L | Confirms ketoacidosis; target fall ≥ 0.5 mmol/L/h |

- SI units first. Add mg/dL in brackets where Saudi labs commonly report it (glucose, creatinine, urea).
- Normal ranges are typical adult ranges; note that local lab ranges apply.
- Include diagnostic criteria and severity grading where the source defines them, with the source.
- Order: bedside → bloods → imaging → specialist.

### Management
- Time-ordered steps: immediate (first 15–60 min) → ongoing → escalation → disposition.
- Every drug: name, dose, route, frequency, maximum, and renal/hepatic adjustment if the source gives one.
- Monitoring targets with numbers (e.g. glucose fall rate, MAP target, urine output).
- Clear escalation triggers (when to call ICU / specialty).
- Discharge criteria and follow-up.

### Medicine pathways (mandatory default for every topic)

Medicines are a decision pathway, never a list of every drug used for the condition. A reader at 3 a.m. must see which drugs to give for the patient in front of them, and nothing else.

1. **Branch by pathway.** Split by the patient group or pathway that changes treatment (for example STEMI and NSTEMI are separate branches, even when they share aspirin; adult and paediatric; primary PCI and fibrinolysis; mild, moderate and severe). Every drug sits under exactly one branch. Each branch has entry criteria that say who goes into it.
2. **Name the step.** Inside a branch, group drugs by purpose (antiplatelet loading, P2Y12 inhibitor, anticoagulant, analgesia).
3. **Give-all vs choose-one.** Drugs given together share a step and are marked `All`. Alternatives share a step: exactly one is `Preferred`; every other option is `Alternative` and states in `Use when` the condition that makes it the choice instead (for example "ticagrelor contraindicated or patient on an oral anticoagulant").
4. **Never combine.** Two drugs of the same class (two P2Y12 inhibitors, two parenteral anticoagulants, two thrombolytics, two antibiotics for one infection) are never both `All`. No "drug A or drug B" in one row: one row per drug.
5. **Preferred comes from the source.** If the guideline does not say which option is preferred, mark the source's first-listed option and add the choice to `evidenceAudit.unverifiedSections`.
6. **Drug detail is unchanged.** Every row still has dose, route, frequency, duration or maximum, adjustments, monitoring, contraindications and a source locator.

Pasted-topic layout (see the paste editor for the exact template):

```
### Medicines
#### Branch: STEMI — primary PCI | Entry: persistent ST elevation, symptoms under 12 hours
| Step | Choice | Drug | Indication | Patient group | Dose | Route | Frequency | Duration / maximum | Adjustments | Monitoring | Contraindications / cautions | Use when | Source |
```

Data format: each regimen carries optional `branch`, `step`, `selection` (`all` | `one-of`), `preferred` and `useWhen`; `medicationPlan.branches` lists `{label, entryCriteria}`. The audit (`lib/medication-pathway.ts`) fails any multi-drug plan that is not branched, has unmarked alternatives, a one-of step without exactly one preferred option, or two drugs of one strict class given together. A version with a pathway error is saved as `under_review` but is **not** published automatically, whatever its score.

### References
- One numbered list at the end. Each entry: title, organisation, edition/year, URL, and the sections used.

---

## 4. Writing style

- Short sentences. One fact per bullet. Write for a tired registrar scanning on a phone.
- **Abbreviation expansion is global:** on the first occurrence of any medical term, syndrome, drug class or scoring system within a topic, write the full name followed by the abbreviation in parentheses (for example, `Percutaneous Coronary Intervention (PCI)`). Use only the abbreviation thereafter in that topic. Never introduce an unexplained acronym, and do not repeat the expanded form after its first introduction.
- No filler: no "It is important to note", "plays a crucial role", "a wide range of", "comprehensive", "in conclusion".
- No vague advice ("consider appropriate treatment", "monitor closely", "as clinically indicated") unless followed by what, how often, and the target.
- No repetition between sections. Say it once in the right place.
- Target length: a full topic should fit in roughly 2–4 phone screens per heading, not more. If a section is long, cut it — do not split it into new headings.

---

## 5. Data format

Use the existing topic JSON shape in the repo. Keep these fields and do not invent new ones:

`id, title, specialty, authority, status, version, lastReviewed, pillar, clinicalReviewStatus, evidenceAudit{checkedOn, status, scope, findings, unverifiedSections, medscapeStatus, originalVersionIds}, pathophysiology{summary, keyMechanisms}, presentation{symptoms, physicalSigns, redFlags, precipitants}, differentials[{condition, distinguishingFeatures}], diagnosticCriteria[{criterion, threshold}], investigations{ruleIn, ruleOut}, clinicalManagement, medicationPlan{status, regimens (each with optional branch, step, selection, preferred, useWhen), branches[{label, entryCriteria}], note}, guidelineComparison, teaching{learningObjectives, keyPoints, pitfalls, references}, nonClinicalManagement{patientEducation, lifestyleAndDiet, mdtReferrals, dischargeCriteria, followUpPlan}`

- `evidenceAudit.status` stays `"incomplete"` unless every section was checked against an opened source.
- List every item you could not verify in `evidenceAudit.unverifiedSections`.
- Set `lastReviewed` and `evidenceAudit.checkedOn` to today's date.

Before writing, open one existing under-review topic in the same pillar and match its shape exactly.

---

## 6. Workflow

1. **Read** the current topic and its latest version. In edit mode, note what is correct so you keep it.
2. **Find and open** sources (section 2). Record the exact sections you use.
3. **Draft** the four headings + references.
4. **Self-check** against section 7. Fix every failure before going on.
5. **Validate:** run type check, lint and tests. All must pass.
6. **Save** as a new version via Supabase REST (`status: "under_review"`, `is_current: false`), then run `npx tsx scripts/publish-if-eligible.ts <guideline_id>:<version>`. It audits the version and makes it live only if it scores 80% or more; the live directory shows any current published version at or above 80% automatically (no allow-list to edit). Only add an entry to `lib/data/clinical-review-overrides.ts` if the task says to.
7. **Commit** on a feature branch, never on `main`. If you cannot push, print the exact commands for the user to run, e.g.:
   ```
   cd ~/Desktop/Pulse && git checkout <branch> && git push -u origin <branch>
   ```
8. **Report** (section 8).

**Edit mode** (fixing an existing topic): keep correct content, change only what is wrong, missing or bloated, and list every change with the reason and source. Still a new version.

---

## 7. Self-check before finishing (answer each honestly in the report)

- [ ] Every number traces to a source section I opened in this task.
- [ ] Every URL was loaded by me.
- [ ] A Saudi source is cited, or I stated none exists for this topic.
- [ ] Disagreements are shown side by side, not merged.
- [ ] Every Investigations row has normal value, value in condition, and meaning.
- [ ] Every drug has dose, route, frequency, max, and SFDA status.
- [ ] Medicines are branched by pathway; each branch has entry criteria; every alternative step has exactly one preferred option and a "use when"; no two same-class drugs are given together.
- [ ] The same number is identical everywhere it appears.
- [ ] Only four clinical headings + references; no filler phrases.
- [ ] Nothing published was edited; the new version was saved as under_review, then published by `publish-if-eligible.ts` only if it scored 80% or more (score reported).
- [ ] Unverified items are listed in `unverifiedSections`.
- [ ] Type check, lint and tests pass.
- [ ] Only the named topic(s) were changed.

If any box is unchecked, say which and why. Do not tick a box you did not verify.

---

## 8. Report format

For each topic:

- **Topic / version ID created**
- **Sources used** — with exact sections
- **Source conflicts** — what differs and how it is shown
- **SFDA check** — each drug: registered / not registered / not found
- **Unverified items** — what and why
- **Changes** (edit mode) — what changed, why, source
- **Needs clinician review** — anything a doctor must decide
- **Commands to run** — if anything is not pushed

Keep the report factual. Do not describe the work as "comprehensive" or "complete" unless every check passed.

---

## Task

<!-- Fill in for each run -->
Mode: [new topic | edit existing]
Topic(s): [title + guideline ID]
Pillar: [e.g. Urgent Care]
Specific instructions: [e.g. add the KDIGO 2026 draft as a labelled comparison column]
