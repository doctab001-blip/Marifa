import type { AuthoringAudit } from "@/lib/clinical-authoring-audit";
import type { PasteIssue } from "@/lib/topic-paste";

/** The exact layout the paste editor reads. Shown to the author and embedded in the Gemini prompt. */
export const PASTE_FORMAT = `# <Topic title>

## Pathophysiology
<One-sentence summary.>
- <Mechanism bullet 1>
- <Mechanism bullet 2>
- <Mechanism bullet 3 (3–6 bullets in total)>

## Signs & Symptoms
### Symptoms
- <symptom>
### Examination signs
- <sign>
### Red flags
- <what makes this an emergency or needs ICU/specialty now>
### Precipitants
- <common trigger or risk factor>
### Differentials
| Condition | The one feature that separates it |
|---|---|
| <condition> | <feature> |

## Investigations
### Diagnostic criteria
| Criterion | Threshold |
|---|---|
| <criterion> | <value, with unit> |
### Bedside and bloods
| Test | Normal (adult) | In this condition | What it means / next step | Source |
|---|---|---|---|---|
| <test> | <typical adult range, SI units> | <value or finding> | <interpretation and action> | [1] Table 2 |
### Imaging and specialist
| Test | Normal (adult) | In this condition | What it means / next step | Source |
|---|---|---|---|---|
| <test> | <normal> | <finding> | <action> | [2] Section 4 |

## Management
### Immediate (0–15 minutes)
- <action with dose, route, frequency where relevant>
### Ongoing (15–60 minutes)
- <action with monitoring target>
### Escalation
- <trigger for ICU/specialty and what to do>
### Disposition
- <admit / discharge decision>
### Medicines
#### Branch: <pathway or patient group, for example "STEMI — primary PCI"> | Entry: <who enters this branch, with the criteria>
| Step | Choice | Drug | Indication | Patient group | Dose | Route | Frequency | Duration / maximum | Adjustments (renal, hepatic, age) | Monitoring | Contraindications / cautions | Use when | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| <step, e.g. Antiplatelet loading> | All | <drug given with the other "All" drugs in this step> | <why> | Adults | <dose> | <route> | <frequency> | <duration, max> | <adjustment>; <adjustment> | <monitoring> | <contraindication>; <caution> | – | [1] Table 3 |
| <step, e.g. P2Y12 inhibitor> | Preferred | <drug A: the default for this branch> | <why> | Adults | <dose> | <route> | <frequency> | <duration, max> | <adjustment> | <monitoring> | <contraindication> | – | [1] Table 3 |
| <same step as above> | Alternative | <drug B: used only when A is unsuitable> | <why> | Adults | <dose> | <route> | <frequency> | <duration, max> | <adjustment> | <monitoring> | <contraindication> | <condition that makes this the choice instead of A> | [1] Table 3 |
#### Branch: <next pathway or patient group> | Entry: <who enters this branch>
| Step | Choice | Drug | Indication | Patient group | Dose | Route | Frequency | Duration / maximum | Adjustments (renal, hepatic, age) | Monitoring | Contraindications / cautions | Use when | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| <step> | All | <drug> | <why> | Adults | <dose> | <route> | <frequency> | <duration, max> | <adjustment> | <monitoring> | <contraindication> | – | [2] Section 4 |
### Discharge criteria
- <criterion>
### Follow-up
- <who, when, what>
### Patient education
- <advice>
### Lifestyle and diet
- <advice>
### Team referrals
- <team and trigger>
### Learning objectives
- <objective>
### Key points
- <key point>
### Pitfalls
- <common error>

## References
1. <Title> | <Organisation, edition/year> | <full https URL> | <sections or tables used>
2. <Title> | <Organisation, edition/year> | <full https URL> | <sections or tables used>`;

export function buildGeminiPrompt(input: { title: string; specialty: string; pillar: string }): string {
  return `You are drafting a clinical topic for Marifa, an emergency-medicine reference used by doctors in Saudi Arabia. A doctor may act on it at 3 a.m., so accuracy beats completeness and brevity beats coverage.

TOPIC: ${input.title}
SPECIALTY: ${input.specialty}
CARE PILLAR: ${input.pillar}
PATIENTS: adults only, unless the topic title says otherwise.

OUTPUT FORMAT — return only Markdown in exactly this layout. Keep every heading name as written. Do not add other main headings.

${PASTE_FORMAT}

CONTENT RULES
1. Use only guidelines you can actually open. Prefer Saudi sources first (Saudi MOH, Saudi Health Council, Saudi Heart Association, Saudi Thoracic Society, SDCPG, SCFHS-endorsed), then NICE, ESC, AHA/ACC, Surviving Sepsis Campaign, GOLD, BTS, KDIGO, WSES, RCEM. Never use blogs, forums or unsourced pages.
2. Every dose, threshold, cut-off, time window and percentage must come from a cited source. If you cannot verify something, leave it out and say so in a final line starting "UNVERIFIED:".
3. Cite as [n] in the Source column of every test row and every medicine row, followed by the table, figure, section or page, for example "[2] Table 3" or "[1] pp. 76–79". No source number means the row is rejected.
4. Give each reference a real https address you opened. Never guess a link, DOI or PubMed ID.
5. Paraphrase; do not copy guideline paragraphs.
6. If two guidelines disagree, add a section "### Guideline comparison" under Management as a table (Parameter | Guideline A | Guideline B) and show both numbers. Never average them.
7. Investigations: list at least 5 tests across at least 2 groups (bedside, bloods, imaging, specialist). Every row needs a typical adult normal value (SI units first; mg/dL in brackets for glucose, creatinine, urea), the value in this condition, and what to do next. "Local laboratory range" alone is not acceptable as a normal value.
8. Medicine pathway (mandatory). Never list every drug of a condition in one table. Write medicines as a decision pathway: one "#### Branch:" heading per pathway or patient group (for example STEMI and NSTEMI are separate branches, even when they share a drug), each with its Entry criteria, and every drug under exactly one branch. Inside a branch, the Step column groups drugs by purpose. Drugs that are given together share a step and are marked "All". Alternatives share a step: mark exactly one "Preferred" and every other option "Alternative", and write in "Use when" the condition that makes it the choice instead of the preferred drug. Never mark two drugs of the same class (two P2Y12 inhibitors, two anticoagulants, two thrombolytics, two antibiotics for the same infection) as "All", and never put alternatives inside one cell ("drug A or drug B"): one row per drug. Use one Branch heading even when only one pathway applies. If the sources do not say which drug is preferred, say so on a final line starting "UNVERIFIED:" and still mark the source's first-listed option "Preferred".
8b. Medicines: give name, dose, route, frequency, duration or maximum, renal/hepatic adjustment, monitoring and contraindications for every drug. Say whether it is registered with the Saudi Food and Drug Authority (SFDA) in the Adjustments cell, and add "Check hospital formulary" where availability varies.
9. Management must be time-ordered (immediate, ongoing, escalation, disposition) with numeric monitoring targets and clear escalation triggers.
10. The same number must be identical everywhere it appears.
11. Abbreviations: the first time a medical term, syndrome, drug class or scoring system appears, write the full name followed by the abbreviation in brackets, for example "Percutaneous Coronary Intervention (PCI)". After that use only the abbreviation. Never use an abbreviation before its full name.
12. Short sentences, one fact per bullet. Do not use the phrases "it is important to note", "plays a crucial role", "a wide range of", "comprehensive" or "in conclusion".
13. Include Precipitants, Diagnostic criteria, Learning objectives, Key points and Pitfalls — the quality check scores their presence.`;
}

/** Builds the follow-up prompt that asks Gemini to repair exactly what the quality check found. */
export function buildFixPrompt(audit: AuthoringAudit | null, issues: PasteIssue[], schemaErrors: string[]): string {
  const problems = [
    ...schemaErrors,
    ...issues.filter((issue) => issue.level !== "info").map((issue) => issue.message),
    ...(audit?.failures ?? []),
  ];
  const unique = [...new Set(problems)];
  if (!unique.length) return "";
  return `Revise your previous Marifa topic. Keep the exact same Markdown layout and headings, keep everything that is already correct, and fix ONLY the problems below. Return the full corrected topic, not a list of changes. Do not invent sources or numbers: if a fix needs a fact you cannot verify, write "UNVERIFIED:" on its own line instead.

PROBLEMS TO FIX
${unique.map((problem, index) => `${index + 1}. ${problem}`).join("\n")}`;
}
