export interface DifferentialItem { condition: string; distinguishingFeatures: string; }
export interface InvestigationItem { tier: string; testName: string; expectedFinding: string; clinicalRationale: string; }
export interface DraftTopic { title: string; specialty: string; authority: string; pillar: string; lastReviewed: string; pathophysiology: { summary: string; keyMechanisms: string[] }; expectedFinding: string; clinicalRationale: string; symptoms: string[]; physicalSigns: string[]; redFlags: string[]; differentials: DifferentialItem[]; investigations: InvestigationItem[]; management: { firstLine: string[]; secondLine: string[]; nonPharmacological: string[]; urgentReferralCriteria: string[] }; }

const core = ["1. Pathophysiology", "2. Clinical Findings", "3. Differential Diagnoses", "4. Workup & Rule Out", "5. Management & Interventions"];
const authorities = new Set(["MOH", "SHC", "PHA", "NICE", "Textbook", "Other"]);
const pillars = new Set(["Urgent Care", "Chronic Care", "Keep Well", "Planned Care", "Safe Birth", "Palliative Care"]);
const content = (value: string) => value.trim() || "Not authored.";
const bullets = (items: string[]) => items.length ? items.map((item) => `- ${content(item)}`).join("\n") : "- Not authored.";
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replaceAll(" ", "\\s+");
function findSection(markdown: string, label: string, level: 2 | 3) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const start = lines.findIndex((line) => new RegExp(`^${"#".repeat(level)}\\s*(?:\\d+\\.\\s*)?${escape(label)}\\s*$`, "i").test(line));
  if (start < 0) return undefined;
  const end = lines.findIndex((line, index) => index > start && new RegExp(`^#{1,${level}}\\s+`).test(line));
  return lines.slice(start + 1, end < 0 ? undefined : end).join("\n").trim();
}
const parseBullets = (value: string | undefined) => value?.split("\n").map((line) => line.match(/^\s*[-*]\s+(.+?)\s*$/)?.[1]?.trim()).filter((item): item is string => Boolean(item)) ?? [];
const warn = (label: string) => `Warning: '## ${label}' section header not found.`;
function namedBlocks(value: string, label: "Condition" | "Test") {
  const lines = value.split("\n"); const header = new RegExp(`^###\\s*${label}\\s*:\\s*(.+?)\\s*$`, "i");
  const starts = lines.map((line, index) => ({ match: line.match(header), index })).filter((item): item is { match: RegExpMatchArray; index: number } => Boolean(item.match));
  return starts.map((item, index) => ({ name: item.match[1].trim(), body: lines.slice(item.index + 1, starts[index + 1]?.index).join("\n") }));
}

/** Converts a complete DraftTopic to the agreed clinician-facing Markdown contract. */
export function draftToMarkdown(draft: DraftTopic): string {
  const differentials = draft.differentials.length ? draft.differentials.map((item) => `### Condition: ${content(item.condition)}\n- **Distinguishing Features:** ${content(item.distinguishingFeatures)}`).join("\n\n") : "### Condition: Not authored.\n- **Distinguishing Features:** Not authored.";
  const investigations = draft.investigations.length ? draft.investigations.map((item) => `### Test: ${content(item.testName)}\n- **Tier:** ${content(item.tier)}\n- **Expected Finding:** ${content(item.expectedFinding)}\n- **Clinical Rationale:** ${content(item.clinicalRationale)}`).join("\n\n") : "### Test: Not authored.\n- **Tier:** Not authored.\n- **Expected Finding:** Not authored.\n- **Clinical Rationale:** Not authored.";
  return `# ${content(draft.title)}
**Specialty:** ${content(draft.specialty)} | **Authority:** ${content(draft.authority)} | **Pillar:** ${content(draft.pillar)} | **Last Reviewed:** ${content(draft.lastReviewed)}

## 1. Pathophysiology
### Summary
${content(draft.pathophysiology.summary)}

### Key Mechanisms
${bullets(draft.pathophysiology.keyMechanisms)}

## 2. Clinical Findings
### Expected Finding
${content(draft.expectedFinding)}

### Clinical Rationale
${content(draft.clinicalRationale)}

### Symptoms
${bullets(draft.symptoms)}

### Physical Signs
${bullets(draft.physicalSigns)}

### Red Flags
${bullets(draft.redFlags)}

## 3. Differential Diagnoses
${differentials}

## 4. Workup & Rule Out
${investigations}

## 5. Management & Interventions
### First-Line Management
${bullets(draft.management.firstLine)}

### Second-Line / Escalation
${bullets(draft.management.secondLine)}

### Non-Pharmacological & Conservative
${bullets(draft.management.nonPharmacological)}

### Urgent Referral & Admission Criteria
${bullets(draft.management.urgentReferralCriteria)}
`;
}

function labelled(block: string, label: string) { return block.match(new RegExp(`^\\s*[-*]\\s+\\*\\*${escape(label)}:\\*\\*\\s*(.+?)\\s*$`, "im"))?.[1]?.trim(); }

/** Pure, loss-avoiding parser. Missing pieces retain existingDraft values and add a warning. */
export function markdownToDraft(markdown: string, existingDraft: DraftTopic): { draft: DraftTopic; warnings: string[] } {
  const draft = structuredClone(existingDraft); const warnings: string[] = [];
  const knownH2 = ["pathophysiology", "clinical findings", "differential diagnoses", "workup & rule out", "management & interventions"];
  const knownH3 = ["summary", "key mechanisms", "expected finding", "clinical rationale", "symptoms", "physical signs", "red flags", "first-line management", "second-line / escalation", "non-pharmacological & conservative", "urgent referral & admission criteria"];
  markdown.replace(/\r/g, "").split("\n").forEach((line) => {
    const h2 = line.match(/^##(?!#)\s*(?:\d+\.\s*)?(.+?)\s*$/i); const h3 = line.match(/^###\s*(.+?)\s*$/i);
    if (h2 && !knownH2.includes(h2[1].toLowerCase())) warnings.push(`Warning: unrecognized section header '${line.trim()}'.`);
    if (h3 && !knownH3.includes(h3[1].toLowerCase()) && !/^(condition|test)\s*:/i.test(h3[1])) warnings.push(`Warning: unrecognized section header '${line.trim()}'.`);
  });
  const title = markdown.match(/^\s*#\s+(.+?)\s*$/m)?.[1]?.trim(); if (title) draft.title = title; else warnings.push("Warning: '# Title' header not found.");
  const meta = markdown.match(/^\s*\*\*Specialty:\*\*\s*(.*?)\s*\|\s*\*\*Authority:\*\*\s*(.*?)\s*\|\s*\*\*Pillar:\*\*\s*(.*?)\s*\|\s*\*\*Last Reviewed:\*\*\s*(.*?)\s*$/im);
  if (meta) {
    const [specialty, authority, pillar, lastReviewed] = meta.slice(1).map((value) => value.trim());
    if (specialty) draft.specialty = specialty; else warnings.push("Warning: Specialty was empty; the existing value was retained.");
    if (authorities.has(authority)) draft.authority = authority; else warnings.push("Warning: Authority is not recognised by the governed draft schema; the existing value was retained.");
    if (pillars.has(pillar)) draft.pillar = pillar; else warnings.push("Warning: Pillar is not recognised by the governed draft schema; the existing value was retained.");
    if (/^\d{4}-\d{2}-\d{2}$/.test(lastReviewed)) draft.lastReviewed = lastReviewed; else warnings.push("Warning: Last Reviewed must use YYYY-MM-DD; the existing value was retained.");
  } else warnings.push("Warning: metadata line with Specialty, Authority, Pillar, and Last Reviewed was not found.");
  const path = findSection(markdown, "Pathophysiology", 2);
  if (!path) warnings.push(warn(core[0])); else { const summary = findSection(path, "Summary", 3); const mechanisms = parseBullets(findSection(path, "Key Mechanisms", 3)); if (summary) draft.pathophysiology.summary = summary; else warnings.push("Warning: '### Summary' section header not found."); if (mechanisms.length) draft.pathophysiology.keyMechanisms = mechanisms; else warnings.push("Warning: '### Key Mechanisms' section header not found or contains no bullets."); }
  const findings = findSection(markdown, "Clinical Findings", 2);
  if (!findings) warnings.push(warn(core[1])); else ([ ["Expected Finding", "expectedFinding", false], ["Clinical Rationale", "clinicalRationale", false], ["Symptoms", "symptoms", true], ["Physical Signs", "physicalSigns", true], ["Red Flags", "redFlags", true] ] as const).forEach(([label, key, isList]) => { const value = findSection(findings, label, 3); const next = isList ? parseBullets(value) : value; if (next && (!Array.isArray(next) || next.length)) Object.assign(draft, { [key]: next }); else warnings.push(`Warning: '### ${label}' section header not found or contains no content.`); });
  const differentials = findSection(markdown, "Differential Diagnoses", 2);
  if (!differentials) warnings.push(warn(core[2])); else { const rows = namedBlocks(differentials, "Condition").map((block) => ({ condition: block.name, distinguishingFeatures: labelled(block.body, "Distinguishing Features") ?? "" })).filter((item) => item.condition && item.distinguishingFeatures); if (rows.length) draft.differentials = rows; else warnings.push("Warning: no valid '### Condition:' blocks were found."); }
  const workup = findSection(markdown, "Workup & Rule Out", 2);
  if (!workup) warnings.push(warn(core[3])); else { const rows = namedBlocks(workup, "Test").map((block) => ({ testName: block.name, tier: labelled(block.body, "Tier") ?? "", expectedFinding: labelled(block.body, "Expected Finding") ?? "", clinicalRationale: labelled(block.body, "Clinical Rationale") ?? "" })).filter((item) => Object.values(item).every(Boolean)); if (rows.length) draft.investigations = rows; else warnings.push("Warning: no valid '### Test:' blocks were found."); }
  const management = findSection(markdown, "Management & Interventions", 2);
  if (!management) warnings.push(warn(core[4])); else ([ ["First-Line Management", "firstLine"], ["Second-Line / Escalation", "secondLine"], ["Non-Pharmacological & Conservative", "nonPharmacological"], ["Urgent Referral & Admission Criteria", "urgentReferralCriteria"] ] as const).forEach(([label, key]) => { const rows = parseBullets(findSection(management, label, 3)); if (rows.length) draft.management[key] = rows; else warnings.push(`Warning: '### ${label}' section header not found or contains no bullets.`); });
  return { draft, warnings: [...new Set(warnings)] };
}

export const draftTopicToMarkdown = draftToMarkdown;
