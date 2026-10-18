/**
 * Offline "paste a whole topic" parser for the Marifa paste editor.
 *
 * Pure and deterministic: no network, no AI. It reads the Markdown that Google Gemini (or any
 * other drafting tool) produces for the Marifa topic format, maps it into the strict
 * DiseaseDetail schema, and scores it with the same audit that decides publication (80%).
 *
 * Rules the parser follows:
 *  - It never invents clinical content. A section that is missing from the paste keeps the
 *    previous version's content (and says so) or, if there is none, surfaces as an error.
 *  - A reference is only attached to a test or medicine when the paste cites it as [n].
 *  - Extra or unrecognised headings are reported, never silently dropped into another section.
 */
import { DiseaseDetailSchema, type DiseaseDetail } from "@/lib/validations/disease";
import { auditTopicContent, type AuthoringAudit } from "@/lib/clinical-authoring-audit";

export type PasteIssue = { level: "error" | "warning" | "info"; message: string };
export type PasteSectionReport = { key: string; label: string; status: "parsed" | "kept" | "missing" | "optional"; detail: string };
export type PasteReference = { n: number; title: string; edition: string; url: string; locator?: string };
export type PasteOptions = { today: string; useTitleFromPaste?: boolean };
export type PasteResult = {
  /** Schema-valid topic content, or null when the paste cannot form a valid topic yet. */
  content: DiseaseDetail | null;
  sections: PasteSectionReport[];
  issues: PasteIssue[];
  /** Plain-language reasons the content is not schema-valid. */
  schemaErrors: string[];
  audit: AuthoringAudit | null;
  references: PasteReference[];
  pastedTitle?: string;
  /** How many sections were actually read from the paste (0 = nothing usable, do not save). */
  parsedCount: number;
};

type Tier = "laboratory" | "firstLineImaging" | "advancedImaging" | "specializedAdjunctive";

/* ───────────────────────────── tokenising ───────────────────────────── */

type Block =
  | { type: "heading"; level: number; title: string; pseudo: boolean }
  | { type: "table"; rows: string[][] }
  | { type: "bullet"; text: string }
  | { type: "para"; text: string };

const SEPARATOR_ROW = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

/** Plain text: Markdown emphasis, code ticks and numeric citation markers such as [1] or [2, Table 3] removed. */
export function cleanText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "; ")
    .replace(/\[(\d{1,2}(?:\s*[,–-]\s*\d{1,2})*)(?:\s*[,;:]\s*[^\]]{0,60})?\]/g, "")
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+([,.;:)])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const headingTitle = (raw: string) =>
  cleanText(raw.replace(/#+\s*$/, "").replace(/^\s*(?:\d+(?:\.\d+)*[.)]?\s+)/, "").replace(/:\s*$/, ""));

function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split(/(?<!\\)\|/).map((cell) => cell.replace(/\\\|/g, "|").trim());
}

function tokenize(markdown: string, isKnownHeading: (title: string) => boolean): Block[] {
  const lines = markdown.replace(/\r/g, "").replace(/​/g, "").replace(/\t/g, "  ").split("\n");
  const blocks: Block[] = [];
  let table: string[][] | null = null;
  const flushTable = () => {
    if (table && table.length) blocks.push({ type: "table", rows: table });
    table = null;
  };
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|")) {
      if (!SEPARATOR_ROW.test(trimmed)) (table ??= []).push(splitRow(trimmed));
      else table ??= [];
      continue;
    }
    flushTable();
    if (!trimmed || /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) continue;
    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, title: headingTitle(heading[2]), pseudo: false });
      continue;
    }
    const bold = trimmed.match(/^(?:\d+[.)]\s*)?(?:\*\*|__)(.+?)(?:\*\*|__)\s*:?\s*$/);
    const labelled = trimmed.match(/^([A-Za-z][A-Za-z0-9 &/,'()–-]{2,60}):\s*$/);
    const pseudoTitle = bold?.[1] ?? labelled?.[1];
    if (pseudoTitle && isKnownHeading(headingTitle(pseudoTitle))) {
      blocks.push({ type: "heading", level: 5, title: headingTitle(pseudoTitle), pseudo: true });
      continue;
    }
    const bullet = line.match(/^(\s*)([-*•+]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      blocks.push({ type: "bullet", text: bullet[3].trim() });
      continue;
    }
    const previous = blocks[blocks.length - 1];
    if (previous?.type === "bullet" && /^\s+\S/.test(line)) previous.text += ` ${trimmed}`;
    else blocks.push({ type: "para", text: trimmed });
  }
  flushTable();
  return blocks;
}

/* ───────────────────────────── heading aliases ───────────────────────────── */

type GroupKey = "pathophysiology" | "signs" | "investigations" | "management" | "references";
const GROUPS: Array<[GroupKey, RegExp]> = [
  ["pathophysiology", /^(patho-?physiology|pathogenesis)$/i],
  ["signs", /^((clinical )?signs?\s*(&|and)\s*symptoms?|symptoms?\s*(&|and)\s*signs?|clinical (features|presentation|findings)|presentation)$/i],
  ["investigations", /^(investigations?|work-?up|diagnostic (tests?|work-?up))$/i],
  ["management", /^(management|treatment|therapy|care pathway|management (&|and) treatment)$/i],
  ["references", /^(references?|sources?|bibliography)$/i],
];
const groupOf = (title: string): GroupKey | undefined => GROUPS.find(([, pattern]) => pattern.test(title))?.[0];

const SUB: Record<string, RegExp> = {
  symptoms: /^(symptoms?|history|presenting (features|complaints?))$/i,
  signs: /^((physical|clinical) )?(signs?|examination( (findings|signs))?|exam findings)$/i,
  redFlags: /^(red ?flags?|warning signs|danger signs|emergency features|features of severity)$/i,
  precipitants: /^(precipitants?|triggers?|risk factors?|common causes|causes|aetiology|etiology)$/i,
  differentials: /^(key )?(differentials?|differential diagnos[ie]s)$/i,
  criteria: /^(diagnostic criteria|criteria|severity( grading)?|grading|diagnostic thresholds?|definitions?)$/i,
  tests: /^(tests?|investigations?( table)?)$/i,
  medicines: /^(medic(ines|ations?)|drugs?|pharmacological|pharmacotherapy|prescribing|drug (table|regimens?)|regimens?)$/i,
  discharge: /^(discharge( criteria)?|disposition and discharge)$/i,
  followUp: /^(follow-?up( plan)?|review and follow-?up)$/i,
  education: /^(patient (education|advice|information)|safety-?netting|education)$/i,
  lifestyle: /^(lifestyle( (&|and) diet)?|diet( (&|and) lifestyle)?|nutrition)$/i,
  mdt: /^(mdt( referrals?)?|(team|specialist|specialty|speciality) referrals?|referrals?( (and|&) (team|specialist) input)?|multidisciplinary( team)?( referrals?)?|specialist (input|referral))$/i,
  objectives: /^(learning objectives?|objectives)$/i,
  keyPoints: /^(key (points|messages)|take-?home( points)?)$/i,
  pitfalls: /^(pitfalls?|common (errors|mistakes)|traps|safety pitfalls)$/i,
  comparison: /^(guideline comparison|source conflicts?|comparison( table)?)$/i,
  summary: /^(summary|overview)$/i,
  mechanisms: /^(key )?mechanisms?$/i,
};
const subOf = (title: string): string | undefined => Object.entries(SUB).find(([, pattern]) => pattern.test(title))?.[0];
const isKnownHeading = (title: string) => Boolean(groupOf(title) || subOf(title));

/* ───────────────────────────── helpers ───────────────────────────── */

type Section = { title: string; key?: string; blocks: Block[] };

const listItems = (blocks: Block[]): string[] => {
  const bullets = blocks.flatMap((block) => (block.type === "bullet" ? [cleanText(block.text)] : [])).filter(Boolean);
  if (bullets.length) return bullets;
  return blocks.flatMap((block) => (block.type === "para" ? [cleanText(block.text)] : [])).filter(Boolean);
};
const paragraphs = (blocks: Block[]) =>
  blocks.flatMap((block) => (block.type === "para" ? [cleanText(block.text)] : [])).filter(Boolean).join(" ");
const tables = (blocks: Block[]) => blocks.flatMap((block) => (block.type === "table" ? [block.rows] : []));

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "step";

function column(headers: string[], ...patterns: RegExp[]): number {
  for (const pattern of patterns) {
    const index = headers.findIndex((header) => pattern.test(header));
    if (index >= 0) return index;
  }
  return -1;
}
const cell = (row: string[], index: number) => (index >= 0 ? cleanText(row[index] ?? "") : "");
const meaningful = (value: string) => Boolean(value) && !/^(-|–|—|n\/?a|not stated|nil)$/i.test(value.trim());
const splitCell = (value: string) => value.split(/\s*;\s*|\s*•\s*/).map((part) => part.trim()).filter(Boolean);

/** Splits a group's blocks into sub-sections at each heading. */
function sectionsOf(blocks: Block[]): Section[] {
  const out: Section[] = [{ title: "", blocks: [] }];
  for (const block of blocks) {
    if (block.type === "heading") out.push({ title: block.title, key: subOf(block.title), blocks: [] });
    else out[out.length - 1].blocks.push(block);
  }
  return out.filter((section) => section.title || section.blocks.length);
}

/* ───────────────────────────── references ───────────────────────────── */

const URL_PATTERN = /https?:\/\/[^\s|)<>\]]+/i;

function parseReferences(blocks: Block[], issues: PasteIssue[]): PasteReference[] {
  const items = blocks.flatMap((block) => (block.type === "bullet" || block.type === "para" ? [block.text] : []));
  const refs: PasteReference[] = [];
  items.forEach((raw, index) => {
    const n = index + 1;
    const text = raw.replace(/^\[?\d{1,2}[\].)]\s*/, "").trim();
    const urlMatch = text.match(URL_PATTERN) ?? text.match(/\((https?:[^)]+)\)/);
    const url = urlMatch ? urlMatch[0].replace(/^\(/, "").replace(/[.,;)]+$/, "") : "";
    let title = "";
    let edition = "";
    let locator = "";
    const parts = text.split("|").map((part) => part.trim());
    if (parts.length >= 3) {
      title = cleanText(parts[0]);
      edition = cleanText(parts[1]);
      locator = cleanText(parts.slice(3).join("; ") || (URL_PATTERN.test(parts[2]) ? "" : parts[2]));
    } else {
      const withoutUrl = cleanText(text.replace(URL_PATTERN, "").replace(/\(\s*\)/, ""));
      const located = withoutUrl.match(/^(.*?)[.;,]?\s*(?:Sections? used|Sections?|Locator|Used for)\s*[:\-–]\s*(.+)$/i);
      const main = located ? located[1] : withoutUrl;
      locator = located ? located[2].replace(/[.;]+$/, "") : "";
      const split = main.match(/^(.*?)[.]\s+(.+)$/);
      title = (split ? split[1] : main).trim();
      edition = (split ? split[2] : "").replace(/[.]+$/, "").trim();
    }
    if (!title) return;
    if (!url || !/^https?:\/\//i.test(url)) {
      issues.push({ level: "error", message: `Reference ${n} (“${title.slice(0, 60)}”) has no web address (URL), so it cannot be saved. Add the link of the document you opened.` });
      return;
    }
    refs.push({ n, title, edition: edition || title, url, ...(locator ? { locator } : {}) });
  });
  return refs;
}

function citation(source: string, refs: PasteReference[]): { ref: PasteReference; locator: string } | undefined {
  const match = source.match(/^\s*\[?\s*(\d{1,2})\s*\]?\s*[,;:–-]?\s*(.*)$/);
  if (!match) return undefined;
  const ref = refs.find((entry) => entry.n === Number(match[1]));
  if (!ref) return undefined;
  const own = cleanText(match[2].replace(/^[\]\s,;:–-]+/, ""));
  return { ref, locator: own || ref.locator || "" };
}

/* ───────────────────────────── tests (investigations) ───────────────────────────── */

const TIER_RULES: Array<[Tier, RegExp]> = [
  ["advancedImaging", /\b(ct|cta|ctpa|mri|mra|pet|angiogra\w*|scintigra\w*|v\/q|nuclear|fluoroscop\w*|computed|magnetic)\b/i],
  ["firstLineImaging", /\b(x-?ray|radiograph\w*|cxr|ultrasound|us|pocus|fast|echo\w*|doppler|plain film|imaging)\b/i],
  ["specializedAdjunctive", /\b(ecg|ekg|electrocardio\w*|bedside|point[- ]of[- ]care|specialist|score|spirometry|peak flow|eeg|endoscop\w*|biops\w*|capillary|dipstick|monitor\w*|oximetry|adjunct\w*)\b/i],
  ["laboratory", /\b(venous|arterial|ph|bnp|amylase|lipase|hba1c|ferritin|blood|serum|plasma|urine|laborator\w*|lab|bloods|culture|gas|troponin|lactate|creatinine|electrolytes?|fbc|cbc|crp|glucose|ketones?|enzymes?|biochem\w*|haemat\w*|hemat\w*|d-dimer|coagulation)\b/i],
];
function tierOf(groupText: string, testName: string): Tier {
  const byName = TIER_RULES.find(([, pattern]) => pattern.test(testName));
  if (byName) return byName[0];
  // A group title such as “Bedside and bloods” is mixed, so prefer the more specific laboratory/imaging reading.
  const order: Tier[] = ["advancedImaging", "firstLineImaging", "laboratory", "specializedAdjunctive"];
  for (const tier of order) {
    const rule = TIER_RULES.find(([name]) => name === tier);
    if (rule && groupText && rule[1].test(groupText)) return tier;
  }
  return "specializedAdjunctive";
}

type ParsedTest = {
  tier: Tier; testName: string; modalityTarget: string; targetCondition: string; expectedFinding: string; clinicalRationale: string;
  normalValue?: string; references?: Array<{ title: string; edition: string; url: string }>;
};

function parseTestTable(rows: string[][], groupTitle: string, refs: PasteReference[], topicTitle: string, issues: PasteIssue[]) {
  const [header, ...body] = rows;
  const heads = header.map((entry) => cleanText(entry).toLowerCase());
  let test = column(heads, /^(test|investigation|study)/);
  const group = column(heads, /^(group|tier|type|category|setting)/);
  let normal = column(heads, /normal|reference range|baseline/);
  let finding = column(heads, /in (this|the) condition|abnormal|expected|finding|result|deranged|disease|diagnos/);
  let meaning = column(heads, /mean|interpret|next step|action|rationale|significance/);
  const source = column(heads, /^(source|ref)/);
  const purpose = column(heads, /^(purpose|role|use)$/);
  const target = column(heads, /^(target|detects|looking for)/);
  const modality = column(heads, /^(how|when|modality|method|timing)/);
  if (test < 0 && heads.length >= 4) {
    test = 0; normal = 1; finding = 2; meaning = 3;
    issues.push({ level: "warning", message: "The tests table has no recognisable headings; columns were read as Test | Normal | In this condition | Meaning." });
  }
  if (test < 0 || normal < 0 || finding < 0 || meaning < 0) {
    issues.push({ level: "error", message: "The tests table needs the columns: Test, Normal (adult), In this condition, What it means / next step." });
    return [] as Array<{ out: ParsedTest; ruleOut: boolean }>;
  }
  return body.filter((row) => cell(row, test)).map((row) => {
    const name = cell(row, test);
    const groupText = [cell(row, group), groupTitle].filter(Boolean).join(" ");
    const cited = citation(row[source] ?? "", refs);
    const normalValue = cell(row, normal);
    const out: ParsedTest = {
      tier: tierOf(groupText, name),
      testName: name,
      modalityTarget: cell(row, modality) || cell(row, group) || (groupTitle && !SUB.tests.test(groupTitle) ? groupTitle : "Emergency assessment"),
      targetCondition: cell(row, target) || topicTitle,
      expectedFinding: cell(row, finding),
      clinicalRationale: cell(row, meaning),
      ...(meaningful(normalValue) ? { normalValue } : {}),
      ...(cited ? { references: [{ title: cited.ref.title, edition: cited.locator ? `${cited.ref.edition}; ${cited.locator}` : cited.ref.edition, url: cited.ref.url }] } : {}),
    };
    const ruleOut = /rule[- ]?out|exclu/i.test(`${cell(row, purpose)} ${groupTitle}`);
    return { out, ruleOut };
  });
}

/* ───────────────────────────── management ───────────────────────────── */

const TIME_LIKE = /(\d|min|hour|hr|immediate|first|within|day|week|ongoing|now|initial|stabili[sz]ation|before discharge|on arrival)/i;

function stepTitle(raw: string): { title: string; timeframe: string } {
  const title = raw.replace(/^step\s*\d+\s*[:.\-–]?\s*/i, "").trim();
  const paren = title.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (paren && TIME_LIKE.test(paren[2])) return { title: paren[1].trim() || paren[2], timeframe: paren[2].trim() };
  const dash = title.match(/^(.*?)\s*(?: – | — | - |:\s)\s*(.+)$/);
  if (dash && TIME_LIKE.test(dash[2])) return { title: dash[1].trim(), timeframe: dash[2].trim() };
  return { title, timeframe: title };
}

/**
 * "Branch: STEMI — primary PCI | Entry: chest pain with persistent ST elevation" → { label, entry }.
 * Returns undefined when the heading is not a branch heading.
 */
export function parseBranchHeading(title: string): { label: string; entry: string } | undefined {
  const match = title.match(/^(?:pathway\s+)?branch\s*[:\-–—]?\s*(.+)$/i);
  if (!match) return undefined;
  const [labelPart, ...entryParts] = match[1].split(/\s*\|\s*(?:entry|enter[s]?|when|criteria)\s*[:\-–—]\s*/i);
  return { label: cleanText(labelPart), entry: cleanText(entryParts.join(" ")) };
}

/** Choice cell → pathway fields. All = given together; Preferred / Alternative = one-of a step. */
function parseChoice(value: string): { selection?: "all" | "one-of"; preferred?: boolean } {
  const text = value.toLowerCase();
  if (!text.trim()) return {};
  if (/alternativ|second-?line|instead|^or\b|option/.test(text)) return { selection: "one-of", preferred: false };
  if (/prefer|first-?line|default|recommended/.test(text)) return { selection: "one-of", preferred: true };
  return { selection: "all" };
}

function parseMedicines(rows: string[][], refs: PasteReference[], branch?: { label: string; entry: string }) {
  const [header, ...body] = rows;
  const heads = header.map((entry) => cleanText(entry).toLowerCase());
  const idx = {
    step: column(heads, /^step/),
    choice: column(heads, /^(choice|selection|role|option|give)/),
    useWhen: column(heads, /use when|choose when|when to (use|choose)|use if/),
    name: column(heads, /^(drug|medicine|medication|generic|name)/),
    indication: column(heads, /indication/),
    group: column(heads, /patient|group|population/),
    dose: column(heads, /^dose/, /dose/),
    route: column(heads, /route/),
    frequency: column(heads, /frequen|freq/),
    duration: column(heads, /duration|course|max/),
    adjust: column(heads, /adjust|renal|hepatic/),
    monitoring: column(heads, /monitor/),
    contra: column(heads, /contra|caution/),
    source: column(heads, /^(source|ref)/),
  };
  if (idx.name < 0) return { regimens: [], missingColumns: ["Drug"] };
  const regimens = body.filter((row) => cell(row, idx.name)).map((row) => {
    const cited = citation(row[idx.source] ?? "", refs);
    const contraindications = splitCell(cell(row, idx.contra));
    const choice = parseChoice(cell(row, idx.choice));
    const step = cell(row, idx.step);
    const useWhen = cell(row, idx.useWhen);
    return {
      ...(branch ? { branch: branch.label } : {}),
      ...(step ? { step } : {}),
      ...(choice.selection ? { selection: choice.selection } : {}),
      ...(choice.preferred !== undefined ? { preferred: choice.preferred } : {}),
      ...(meaningful(useWhen) ? { useWhen } : {}),
      genericName: cell(row, idx.name),
      indication: cell(row, idx.indication),
      patientGroup: cell(row, idx.group),
      dose: cell(row, idx.dose),
      route: cell(row, idx.route),
      frequency: cell(row, idx.frequency),
      duration: cell(row, idx.duration),
      adjustments: splitCell(cell(row, idx.adjust)),
      monitoring: splitCell(cell(row, idx.monitoring)),
      ...(contraindications.length ? { contraindications } : {}),
      sourceTitle: cited?.ref.title ?? "",
      sourceUrl: cited?.ref.url ?? "",
      sourceEdition: cited ? (cited.locator ? `${cited.ref.edition}; ${cited.locator}` : cited.ref.edition) : "",
    };
  });
  return { regimens, missingColumns: [] as string[] };
}

/* ───────────────────────────── main ───────────────────────────── */

const PATH_LABELS: Record<string, string> = {
  title: "the title",
  "pathophysiology.summary": "Pathophysiology summary",
  "pathophysiology.keyMechanisms": "Pathophysiology bullets",
  "presentation.symptoms": "Symptoms",
  "presentation.physicalSigns": "Examination signs",
  "presentation.redFlags": "Red flags",
  differentials: "Differentials",
  clinicalManagement: "Management steps",
  "nonClinicalManagement.patientEducation": "Patient education",
  "nonClinicalManagement.lifestyleAndDiet": "Lifestyle and diet",
  "nonClinicalManagement.mdtReferrals": "Team referrals",
  "nonClinicalManagement.dischargeCriteria": "Discharge criteria",
  "nonClinicalManagement.followUpPlan": "Follow-up",
  "investigations.ruleIn": "Investigations table",
  "investigations.ruleOut": "Investigations table",
};

function describeSchemaIssue(path: Array<string | number>, message: string, content: Record<string, unknown>): string {
  const dotted = path.filter((part) => typeof part === "string").join(".");
  const label = PATH_LABELS[dotted];
  const numeric = path.find((part) => typeof part === "number") as number | undefined;
  if (path[0] === "investigations" && numeric !== undefined) {
    const list = (content.investigations as { ruleIn?: ParsedTest[]; ruleOut?: ParsedTest[] } | undefined)?.[path[1] as "ruleIn" | "ruleOut"];
    const name = list?.[numeric]?.testName ?? `row ${numeric + 1}`;
    const field = String(path[3] ?? "");
    const fieldLabel: Record<string, string> = { expectedFinding: "“In this condition”", clinicalRationale: "“What it means / next step”", modalityTarget: "“How/when”", targetCondition: "target condition", testName: "test name", references: "Source", edition: "Source section", url: "Source link" };
    return `Investigations: ${fieldLabel[field] ?? field ?? "a field"} is empty or invalid for “${name}”.`;
  }
  if (path[0] === "medicationPlan" && path[1] === "regimens" && numeric !== undefined) {
    const regimens = (content.medicationPlan as { regimens?: Array<{ genericName?: string }> } | undefined)?.regimens;
    const field = String(path[3] ?? "");
    const fieldLabel: Record<string, string> = { sourceUrl: "the source ([n] must match a numbered reference)", sourceTitle: "the source ([n] must match a numbered reference)", sourceEdition: "the source ([n] must match a numbered reference)", adjustments: "Adjustments", monitoring: "Monitoring", patientGroup: "Patient group", indication: "Indication", dose: "Dose", route: "Route", frequency: "Frequency", duration: "Duration / max", branch: "Branch", step: "Step", selection: "Choice", useWhen: "Use when" };
    return `Medicines: ${fieldLabel[field] ?? field} is missing for “${regimens?.[numeric]?.genericName ?? `row ${numeric + 1}`}”.`;
  }
  if (path[0] === "teaching" && path[1] === "references") return "References: each reference needs a title, edition/year and a web address (URL).";
  if (label) return `${label}: ${message.toLowerCase().includes("too small") || message.toLowerCase().includes("required") || message.toLowerCase().includes("expected") ? "nothing was found" : message}.`;
  return `${path.join(".") || "Topic"}: ${message}`;
}

export function parsePastedTopic(markdown: string, base: DiseaseDetail, options: PasteOptions): PasteResult {
  const issues: PasteIssue[] = [];
  const sections: PasteSectionReport[] = [];
  const report = (key: string, label: string, status: PasteSectionReport["status"], detail: string) => sections.push({ key, label, status, detail });

  const blocks = tokenize(markdown, isKnownHeading);
  if (!blocks.length) {
    return { content: null, sections: [], issues: [{ level: "info", message: "Paste the full topic text to begin." }], schemaErrors: [], audit: null, references: [], parsedCount: 0 };
  }

  /* group the blocks under the five main headings */
  const groups = new Map<GroupKey, Block[]>();
  let current: GroupKey | undefined;
  let pastedTitle: string | undefined;
  for (const block of blocks) {
    if (block.type === "heading" && (block.level <= 3 || block.pseudo) && groupOf(block.title)) {
      current = groupOf(block.title);
      if (!groups.has(current!)) groups.set(current!, []);
      continue;
    }
    if (block.type === "heading" && block.level === 1 && !current && !pastedTitle) {
      pastedTitle = block.title.replace(/^(topic|title)\s*:\s*/i, "");
      continue;
    }
    if (current) groups.get(current)!.push(block);
    else if (block.type === "heading") issues.push({ level: "warning", message: `Heading “${block.title}” appears before the first main section and was ignored.` });
  }
  (["pathophysiology", "signs", "investigations", "management", "references"] as GroupKey[]).forEach((key) => {
    if (!groups.has(key)) issues.push({ level: key === "references" ? "error" : "warning", message: `Main heading not found: ${({ pathophysiology: "Pathophysiology", signs: "Signs & Symptoms", investigations: "Investigations", management: "Management", references: "References" } as const)[key]}.` });
  });

  /* references first: tests and medicines cite them */
  const refs = groups.has("references") ? parseReferences(groups.get("references")!, issues) : [];
  report("references", "References", refs.length ? "parsed" : "missing", refs.length ? `${refs.length} reference${refs.length === 1 ? "" : "s"}` : "No references found");

  const title = options.useTitleFromPaste && pastedTitle ? pastedTitle : base.title;
  if (pastedTitle && pastedTitle !== base.title && !options.useTitleFromPaste) {
    issues.push({ level: "info", message: `The pasted title “${pastedTitle}” differs from the topic title “${base.title}”. The topic title was kept.` });
  }

  /* pathophysiology */
  let pathophysiology = base.pathophysiology;
  if (groups.has("pathophysiology")) {
    const parts = sectionsOf(groups.get("pathophysiology")!);
    const summaryText = parts.filter((part) => part.key === "summary" || !part.title).map((part) => paragraphs(part.blocks)).filter(Boolean).join(" ");
    const mechanismBullets = parts.filter((part) => part.key === "mechanisms" || !part.title).flatMap((part) => part.blocks.flatMap((block) => (block.type === "bullet" ? [cleanText(block.text)] : [])));
    let mechanisms = mechanismBullets.filter(Boolean);
    let summary = summaryText;
    if (!mechanisms.length && summary) {
      mechanisms = summary.split(/(?<=[.!?])\s+/).filter(Boolean);
      summary = mechanisms[0] ?? summary;
      issues.push({ level: "warning", message: "Pathophysiology had no bullets; its sentences were split into bullets. Check them." });
    }
    if (!summary && mechanisms.length) summary = mechanisms[0];
    if (summary && mechanisms.length) {
      pathophysiology = { summary, keyMechanisms: mechanisms };
      report("pathophysiology", "Pathophysiology", "parsed", `${mechanisms.length} mechanism bullet${mechanisms.length === 1 ? "" : "s"}`);
      if (mechanisms.length < 3 || mechanisms.length > 6) issues.push({ level: "warning", message: `Pathophysiology has ${mechanisms.length} bullets; the standard is 3–6.` });
    } else report("pathophysiology", "Pathophysiology", "kept", "Nothing readable in the paste; previous text kept");
  } else report("pathophysiology", "Pathophysiology", "kept", "Heading not in paste; previous text kept");

  /* signs & symptoms */
  const presentation = { ...base.presentation };
  let differentials = base.differentials;
  if (groups.has("signs")) {
    const parts = sectionsOf(groups.get("signs")!);
    const take = (key: string) => parts.filter((part) => part.key === key).flatMap((part) => listItems(part.blocks));
    // “**Red flags:** a; b” bullets inside an unheaded block
    const loose = parts.filter((part) => !part.title).flatMap((part) => part.blocks.flatMap((block) => (block.type === "bullet" ? [block.text] : [])));
    const fromLoose = (key: string) => loose.flatMap((text) => {
      const match = text.match(/^(?:\*\*|__)?([^:*]{3,40}?)(?:\*\*|__)?\s*:\s*(?:\*\*|__)?\s*(.+)$/);
      return match && SUB[key].test(cleanText(match[1])) ? splitCell(cleanText(match[2])) : [];
    });
    const pick = (key: string) => { const own = take(key); return own.length ? own : fromLoose(key); };
    const found: Array<[string, string[], keyof typeof presentation]> = [
      ["Symptoms", pick("symptoms"), "symptoms"],
      ["Examination signs", pick("signs"), "physicalSigns"],
      ["Red flags", pick("redFlags"), "redFlags"],
      ["Precipitants", pick("precipitants"), "precipitants"],
    ];
    for (const [label, items, field] of found) {
      if (items.length) { (presentation as Record<string, string[] | undefined>)[field] = items; report(`presentation-${field}`, label, "parsed", `${items.length} item${items.length === 1 ? "" : "s"}`); }
      else report(`presentation-${field}`, label, field === "precipitants" && !base.presentation.precipitants ? "optional" : "kept", "Not in paste; previous content kept");
    }
    const diffSection = parts.filter((part) => part.key === "differentials");
    const parsedDiff: Array<{ condition: string; distinguishingFeatures: string }> = [];
    for (const part of diffSection) {
      for (const rows of tables(part.blocks)) {
        rows.slice(1).forEach((row) => { const condition = cleanText(row[0] ?? ""); const feature = cleanText(row.slice(1).join(" — ")); if (condition && feature) parsedDiff.push({ condition, distinguishingFeatures: feature }); });
      }
      for (const text of part.blocks.flatMap((block) => (block.type === "bullet" || block.type === "para" ? [block.text] : []))) {
        const match = cleanText(text).match(/^(.+?)\s*(?:—|–| - |:)\s*(.+)$/);
        if (match) parsedDiff.push({ condition: match[1].trim(), distinguishingFeatures: match[2].trim() });
      }
    }
    if (parsedDiff.length) { differentials = parsedDiff; report("differentials", "Differentials", "parsed", `${parsedDiff.length} condition${parsedDiff.length === 1 ? "" : "s"}`); }
    else report("differentials", "Differentials", "kept", "Not in paste; previous content kept");
  } else {
    report("presentation", "Signs & Symptoms", "kept", "Heading not in paste; previous content kept");
  }

  /* investigations */
  let investigations = base.investigations;
  let diagnosticCriteria = base.diagnosticCriteria;
  const knownTopic = title.replace(/\s+/g, " ");
  if (groups.has("investigations")) {
    const parts = sectionsOf(groups.get("investigations")!);
    const ruleIn: ParsedTest[] = [];
    const ruleOut: ParsedTest[] = [];
    const criteria: Array<{ criterion: string; threshold: string }> = [];
    for (const part of parts) {
      for (const rows of tables(part.blocks)) {
        const heads = (rows[0] ?? []).map((entry) => cleanText(entry).toLowerCase());
        const isCriteria = part.key === "criteria" || (column(heads, /criteri|parameter|definition/) >= 0 && column(heads, /threshold|cut|value/) >= 0 && column(heads, /^(test|investigation)/) < 0);
        if (isCriteria) {
          rows.slice(1).forEach((row) => { const criterion = cleanText(row[0] ?? ""); const threshold = cleanText(row.slice(1).join(" — ")); if (criterion && threshold) criteria.push({ criterion, threshold }); });
        } else {
          for (const { out, ruleOut: isOut } of parseTestTable(rows, part.title, refs, knownTopic, issues)) (isOut ? ruleOut : ruleIn).push(out);
        }
      }
      if (part.key === "criteria") {
        part.blocks.forEach((block) => {
          if (block.type !== "bullet") return;
          const match = cleanText(block.text).match(/^(.+?)\s*(?:—|–|:)\s*(.+)$/);
          if (match) criteria.push({ criterion: match[1].trim(), threshold: match[2].trim() });
        });
      }
    }
    if (ruleIn.length + ruleOut.length) {
      if (!ruleOut.length && ruleIn.length > 1) { ruleOut.push(ruleIn.pop()!); issues.push({ level: "info", message: "No “rule-out” tests were marked, so the last listed test was filed under rule-out to satisfy the topic format." }); }
      if (!ruleIn.length && ruleOut.length > 1) ruleIn.push(ruleOut.shift()!);
      investigations = { ruleIn, ruleOut } as unknown as DiseaseDetail["investigations"];
      report("investigations", "Investigations", "parsed", `${ruleIn.length + ruleOut.length} tests`);
    } else report("investigations", "Investigations", "kept", "No tests table found; previous tests kept");
    if (criteria.length) { diagnosticCriteria = criteria; report("criteria", "Diagnostic criteria", "parsed", `${criteria.length} criteria`); }
    else report("criteria", "Diagnostic criteria", base.diagnosticCriteria ? "kept" : "optional", "Not in paste");
  } else report("investigations", "Investigations", "kept", "Heading not in paste; previous tests kept");

  /* management */
  let clinicalManagement = base.clinicalManagement;
  let medicationPlan = base.medicationPlan;
  let guidelineComparison = base.guidelineComparison;
  const nonClinical = { ...base.nonClinicalManagement };
  const teaching = { ...base.teaching, learningObjectives: base.teaching?.learningObjectives ?? [] } as NonNullable<DiseaseDetail["teaching"]>;
  if (groups.has("management")) {
    const parts = sectionsOf(groups.get("management")!);
    const steps: Array<{ id: string; title: string; timeframe: string; actions: string[] }> = [];
    const ids = new Set<string>();
    const addStep = (rawTitle: string, items: string[]) => {
      if (!items.length) return;
      const { title: stepName, timeframe } = stepTitle(rawTitle || "Initial management");
      let id = slug(stepName); let counter = 2;
      while (ids.has(id)) id = `${slug(stepName)}-${counter++}`;
      ids.add(id);
      steps.push({ id, title: stepName || "Management", timeframe: timeframe || "From diagnosis", actions: items });
    };
    const lists: Record<string, string[]> = {};
    let regimenResult: ReturnType<typeof parseMedicines> | undefined;
    const pastedBranches: Array<{ label: string; entryCriteria: string }> = [];
    for (const part of parts) {
      const rows = tables(part.blocks);
      const branchHeading = parseBranchHeading(part.title);
      if (branchHeading && rows.length) {
        if (!branchHeading.label) issues.push({ level: "error", message: "A medicines branch heading has no name. Use “#### Branch: <name> | Entry: <who enters this branch>”." });
        else if (!branchHeading.entry) issues.push({ level: "error", message: `Medicines branch “${branchHeading.label}” has no entry criteria. Write “| Entry: <who enters this branch>” after the branch name.` });
        if (branchHeading.label && !pastedBranches.some((entry) => entry.label === branchHeading.label)) pastedBranches.push({ label: branchHeading.label, entryCriteria: branchHeading.entry || "Not stated" });
        for (const table of rows) { const parsedTable = parseMedicines(table, refs, branchHeading); if (!regimenResult) regimenResult = parsedTable; else regimenResult.regimens.push(...parsedTable.regimens); }
        continue;
      }
      if (part.key === "medicines" || (!part.key && rows.some((r) => column((r[0] ?? []).map((h) => cleanText(h).toLowerCase()), /^(drug|medicine|medication)/) >= 0 && column((r[0] ?? []).map((h) => cleanText(h).toLowerCase()), /^dose/) >= 0))) {
        for (const table of rows) { if (!regimenResult) regimenResult = parseMedicines(table, refs); else regimenResult.regimens.push(...parseMedicines(table, refs).regimens); }
        continue;
      }
      if (part.key === "comparison") {
        const table = rows[0];
        if (table && table[0].length >= 3 && table[0].length <= 5) {
          const columns = table[0].slice(1).map((entry) => cleanText(entry));
          guidelineComparison = { title: part.title, columns, rows: table.slice(1).filter((row) => cleanText(row[0] ?? "")).map((row) => ({ parameter: cleanText(row[0]), values: columns.map((_, i) => cleanText(row[i + 1] ?? "") || "Not stated") })) } as DiseaseDetail["guidelineComparison"];
          report("comparison", "Guideline comparison", "parsed", `${table.length - 1} rows`);
        } else issues.push({ level: "warning", message: "The guideline comparison table needs a first column plus 2–4 guideline columns; it was ignored." });
        continue;
      }
      if (part.key && ["discharge", "followUp", "education", "lifestyle", "mdt", "objectives", "keyPoints", "pitfalls"].includes(part.key)) {
        lists[part.key] = [...(lists[part.key] ?? []), ...listItems(part.blocks)];
        continue;
      }
      if (part.key === "summary" || part.key === "criteria" || part.key === "tests") continue;
      addStep(part.title, listItems(part.blocks));
      if (part.title && !listItems(part.blocks).length && !rows.length) issues.push({ level: "warning", message: `Management heading “${part.title}” has no bullets and was skipped.` });
    }
    if (steps.length) { clinicalManagement = steps as DiseaseDetail["clinicalManagement"]; report("management", "Management steps", "parsed", `${steps.length} step${steps.length === 1 ? "" : "s"}`); }
    else report("management", "Management steps", "kept", "No steps found; previous steps kept");
    if (steps.length === 1 && steps[0].timeframe === steps[0].title) issues.push({ level: "warning", message: "Management has no sub-headings, so it became one step. Use headings such as “Immediate (0–15 min)”, “Ongoing”, “Escalation”, “Disposition”." });

    if (regimenResult) {
      if (regimenResult.missingColumns.length) issues.push({ level: "error", message: "The medicines table needs a Drug column." });
      else {
        medicationPlan = { status: "local-protocol-required", regimens: regimenResult.regimens, ...(pastedBranches.length ? { branches: pastedBranches } : {}), note: "Doses came from an external drafting tool and must be verified against the cited sources, Saudi Food and Drug Authority (SFDA) registration and the local hospital protocol before prescribing. Check hospital formulary." } as DiseaseDetail["medicationPlan"];
        report("medicines", "Medicines", "parsed", `${regimenResult.regimens.length} medicine${regimenResult.regimens.length === 1 ? "" : "s"}`);
      }
    } else report("medicines", "Medicines", base.medicationPlan ? "kept" : "optional", base.medicationPlan ? "No medicines table in paste; previous table kept — check it still matches the new steps" : "No medicines table in paste");

    const setList = (key: string, label: string, apply: (items: string[]) => void, hasPrevious: boolean) => {
      if (lists[key]?.length) { apply(lists[key]); report(key, label, "parsed", `${lists[key].length} item${lists[key].length === 1 ? "" : "s"}`); }
      else report(key, label, hasPrevious ? "kept" : "missing", hasPrevious ? "Not in paste; previous content kept" : "Not in paste");
    };
    setList("discharge", "Discharge criteria", (items) => { nonClinical.dischargeCriteria = items; }, Boolean(base.nonClinicalManagement.dischargeCriteria.length));
    setList("followUp", "Follow-up", (items) => { nonClinical.followUpPlan = items.join(" "); }, Boolean(base.nonClinicalManagement.followUpPlan));
    setList("education", "Patient education", (items) => { nonClinical.patientEducation = items; }, Boolean(base.nonClinicalManagement.patientEducation.length));
    setList("lifestyle", "Lifestyle & diet", (items) => { nonClinical.lifestyleAndDiet = items; }, Boolean(base.nonClinicalManagement.lifestyleAndDiet.length));
    setList("mdt", "Team referrals", (items) => { nonClinical.mdtReferrals = items; }, Boolean(base.nonClinicalManagement.mdtReferrals.length));
    setList("objectives", "Learning objectives", (items) => { teaching.learningObjectives = items; }, Boolean(base.teaching?.learningObjectives.length));
    setList("keyPoints", "Key points", (items) => { teaching.keyPoints = items; }, Boolean(base.teaching?.keyPoints?.length));
    setList("pitfalls", "Pitfalls", (items) => { teaching.pitfalls = items; }, Boolean(base.teaching?.pitfalls?.length));
  } else report("management", "Management", "kept", "Heading not in paste; previous management kept");

  if (refs.length) {
    teaching.references = refs.map((ref) => ({ title: ref.title, edition: ref.edition, url: ref.url, ...(ref.locator ? { locator: ref.locator } : {}) }));
  }
  if (base.teaching?.vignette || base.teaching?.guidedApproach || base.teaching?.checkpoints) issues.push({ level: "warning", message: "The teaching vignette, guided approach or checkpoints from an earlier version were kept. Your paste does not change them, so check they still agree with the new text." });
  if (base.granularPathway) issues.push({ level: "warning", message: "This topic still carries a detailed pathway from an earlier version. Your paste does not change it, so check it still agrees with the new text." });

  const evidenceAudit = {
    checkedOn: options.today,
    status: "incomplete" as const,
    scope: base.evidenceAudit?.scope ?? `Adult ${title}: assessment, investigation and management, pasted from an external draft.`,
    findings: [
      `Text pasted from an external drafting tool on ${options.today}; Marifa mapped it to the topic format automatically and did not check the content.`,
      `Previous version ${base.version} is preserved as history.`,
    ],
    unverifiedSections: [
      "Every dose, threshold and timing in the pasted draft needs clinician verification against the cited sources.",
      "Saudi Food and Drug Authority (SFDA) registration and formulary availability were not rechecked.",
      "Web addresses (URLs) in the reference list were not opened by Marifa.",
    ],
    medscapeStatus: base.evidenceAudit?.medscapeStatus ?? ("unavailable" as const),
    originalVersionIds: base.evidenceAudit?.originalVersionIds ?? [base.id],
  };

  const candidate = {
    ...base,
    title,
    lastReviewed: options.today,
    clinicalReviewStatus: "pending" as const,
    evidenceAudit,
    pathophysiology,
    presentation,
    differentials,
    investigations,
    clinicalManagement,
    ...(medicationPlan ? { medicationPlan } : {}),
    ...(diagnosticCriteria ? { diagnosticCriteria } : {}),
    ...(guidelineComparison ? { guidelineComparison } : {}),
    teaching,
    nonClinicalManagement: nonClinical,
  };

  const parsedCount = sections.filter((section) => section.status === "parsed").length;
  const parsed = DiseaseDetailSchema.safeParse(candidate);
  if (!parsed.success) {
    const schemaErrors = [...new Set(parsed.error.issues.map((issue) => describeSchemaIssue(issue.path as Array<string | number>, issue.message, candidate as unknown as Record<string, unknown>)))];
    return { content: null, sections, issues, schemaErrors, audit: null, references: refs, pastedTitle, parsedCount };
  }
  const audit = auditTopicContent(parsed.data);
  return { content: parsed.data, sections, issues, schemaErrors: [], audit, references: refs, pastedTitle, parsedCount };
}
