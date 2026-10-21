/**
 * Standards hierarchy (Edition -> Chapter -> Standard -> Measurable element) and the import planner behind the import wizard.
 * Pure functions only: the wizard runs them in the browser for the preview, and the server runs them again on submit, so
 * what was previewed is exactly what is written.
 *
 * Marifa ships no CBAHI wording. Every code and description comes from the file the hospital imports from its licensed manual.
 */
import { parseCsv } from "@/lib/governance/csv";

export type ElementApplicability = "applicable" | "not_applicable" | "to_confirm";

export type EditionRow = {
  id: string;
  program: string;
  label: string;
  hospitalType: string;
  isOfficial: boolean;
  sourceNote: string;
  status: "active" | "superseded" | "draft";
};

export type ChapterRow = { id: string; editionId: string; code: string; name: string; sortOrder: number };

export type ElementRow = {
  id: string;
  standardId: string;
  code: string;
  officialCode: string;
  description: string;
  isEsr: boolean;
  esrSource: string;
  department: string;
  ownerUserId: string | null;
  applicability: ElementApplicability;
  evidenceGuidance: string;
  verifiedOn: string | null;
  reviewDue: string | null;
  isOfficial: boolean;
  sortOrder: number;
};

export type ElementStatusRow = {
  elementId: string;
  standardId: string;
  rating: "insufficient" | "partial" | "satisfactory" | "not_applicable" | null;
  notes: string;
  assessedAt: string | null;
  nextReviewDue: string | null;
};

export const APPLICABILITY_LABEL: Record<ElementApplicability, string> = {
  applicable: "Applicable",
  not_applicable: "Not applicable",
  to_confirm: "Applicability to confirm",
};

/* ---------------------------------------------------------------------------------------------------------------- */
/* Import wizard                                                                                                     */
/* ---------------------------------------------------------------------------------------------------------------- */

export type ImportField =
  | "chapterCode" | "chapterName" | "standardCode" | "standardDescription" | "standardEsr"
  | "elementCode" | "officialElementCode" | "elementDescription" | "elementEsr" | "department";

export const IMPORT_FIELDS: { key: ImportField; label: string; hint: string; aliases: string[] }[] = [
  { key: "chapterCode", label: "Chapter code", hint: "e.g. the chapter abbreviation in your manual", aliases: ["chaptercode", "chapter", "chapterid", "chapterabbreviation"] },
  { key: "chapterName", label: "Chapter name", hint: "", aliases: ["chaptername", "chaptertitle"] },
  { key: "standardCode", label: "Standard code", hint: "Required on every row", aliases: ["standardcode", "standard", "standardno", "standardid", "code", "stdcode"] },
  { key: "standardDescription", label: "Standard text", hint: "Required when the standard is new", aliases: ["standarddescription", "standardtext", "description", "statement", "text", "standardstatement"] },
  { key: "standardEsr", label: "Standard is an ESR", hint: "yes / no", aliases: ["esr", "isesr", "standardesr", "essentialsafetyrequirement", "essential"] },
  { key: "elementCode", label: "Measurable element code", hint: "Leave unmapped to import standards only", aliases: ["elementcode", "measurableelement", "measurableelementcode", "me", "mecode", "substandard", "substandardcode", "element"] },
  { key: "officialElementCode", label: "Official element code", hint: "As printed in the manual, if different", aliases: ["officialcode", "officialelementcode", "manualcode"] },
  { key: "elementDescription", label: "Measurable element text", hint: "Required for each new element", aliases: ["elementdescription", "elementtext", "medescription", "metext", "substandardtext", "substandarddescription"] },
  { key: "elementEsr", label: "Element is an ESR", hint: "yes / no", aliases: ["elementesr", "meesr", "isesrelement"] },
  { key: "department", label: "Department", hint: "", aliases: ["department", "dept", "owner", "responsibledepartment"] },
];

export type ColumnMapping = Partial<Record<ImportField, number>>;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

/** Best guess at which column holds which field. The user confirms or changes it in step 2. */
export function guessMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const used = new Set<number>();
  // Specific aliases first, so "description" is not claimed by a less specific field.
  for (const field of IMPORT_FIELDS) {
    for (const alias of field.aliases) {
      const col = headers.findIndex((h, i) => !used.has(i) && norm(h) === alias);
      if (col >= 0) { mapping[field.key] = col; used.add(col); break; }
    }
  }
  return mapping;
}

export type ExistingRegister = {
  standards: { id: string; code: string; description: string; chapterCode: string; chapterName: string; isEsr: boolean; department: string }[];
  elements: { id: string; standardCode: string; code: string; description: string; officialCode: string; isEsr: boolean; department: string }[];
};

export type ImportMode = "add_only" | "add_and_update";

export type PlannedStandard = {
  line: number;
  action: "create" | "update" | "unchanged";
  code: string;
  description: string;
  chapterCode: string;
  chapterName: string;
  isEsr: boolean;
  department: string;
  existingId: string | null;
};

export type PlannedElement = {
  line: number;
  action: "create" | "update" | "unchanged";
  standardCode: string;
  code: string;
  officialCode: string;
  description: string;
  isEsr: boolean;
  department: string;
  existingId: string | null;
};

export type ImportIssue = { line: number; message: string };

export type ImportPlan = {
  standards: PlannedStandard[];
  elements: PlannedElement[];
  rejected: ImportIssue[];
  warnings: ImportIssue[];
  summary: {
    rowsRead: number;
    standardsToCreate: number;
    standardsToUpdate: number;
    elementsToCreate: number;
    elementsToUpdate: number;
    unchanged: number;
    rejectedRows: number;
  };
};

export const MAX_IMPORT_ROWS = 5000;
const TRUE_VALUES = new Set(["1", "y", "yes", "true", "t", "esr", "x"]);
const isTrue = (v: string) => TRUE_VALUES.has(v.trim().toLowerCase());

/**
 * Turns a parsed CSV table + confirmed column mapping into a plan of creates/updates, and rejects every row that would
 * break the hierarchy. Nothing existing is deleted: rows absent from the file are left exactly as they are, and updates keep
 * the record id, so its assessment history and evidence stay attached.
 */
export function buildImportPlan(input: { table: string[][]; mapping: ColumnMapping; existing: ExistingRegister; mode: ImportMode }): ImportPlan {
  const { table, mapping, existing, mode } = input;
  const rejected: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const empty: ImportPlan = {
    standards: [], elements: [], rejected, warnings,
    summary: { rowsRead: 0, standardsToCreate: 0, standardsToUpdate: 0, elementsToCreate: 0, elementsToUpdate: 0, unchanged: 0, rejectedRows: 0 },
  };
  if (mapping.standardCode === undefined) {
    rejected.push({ line: 1, message: "Map a column to “Standard code”. Every row needs one." });
    return { ...empty, summary: { ...empty.summary, rejectedRows: Math.max(0, table.length - 1) } };
  }
  const body = table.slice(1);
  if (body.length > MAX_IMPORT_ROWS) {
    rejected.push({ line: 1, message: `The file has ${body.length} rows. Import at most ${MAX_IMPORT_ROWS} at a time.` });
    return { ...empty, summary: { ...empty.summary, rowsRead: body.length, rejectedRows: body.length } };
  }

  const cell = (cells: string[], key: ImportField) => {
    const col = mapping[key];
    return col === undefined ? "" : (cells[col] ?? "").trim();
  };
  const existingStd = new Map(existing.standards.map((s) => [s.code, s]));
  const existingEl = new Map(existing.elements.map((e) => [`${e.standardCode}\u0000${e.code}`, e]));

  const standards = new Map<string, PlannedStandard>();
  const elements = new Map<string, PlannedElement>();
  const elementMode = mapping.elementCode !== undefined;

  body.forEach((cells, index) => {
    const line = index + 2;
    const code = cell(cells, "standardCode");
    const stdText = cell(cells, "standardDescription");
    const chapterCode = cell(cells, "chapterCode");
    const chapterName = cell(cells, "chapterName");
    const department = cell(cells, "department");
    const elCode = elementMode ? cell(cells, "elementCode") : "";

    if (!code) { rejected.push({ line, message: "Missing standard code." }); return; }
    if (code.length > 60) { rejected.push({ line, message: `Standard code “${code.slice(0, 20)}…” is longer than 60 characters.` }); return; }
    if (stdText.length > 4000) { rejected.push({ line, message: `${code}: standard text is longer than 4,000 characters.` }); return; }

    // ---- the standard this row belongs to
    const known = existingStd.get(code);
    const planned = standards.get(code);
    if (!planned) {
      if (!known && !stdText) {
        rejected.push({ line, message: elCode
          ? `${code} / ${elCode}: standard ${code} is not in your register and this row gives no standard text, so the element has no valid parent.`
          : `${code}: new standard without text.` });
        return;
      }
      const isEsr = mapping.standardEsr !== undefined ? isTrue(cell(cells, "standardEsr")) : known?.isEsr ?? false;
      const next: PlannedStandard = {
        line, code, existingId: known?.id ?? null,
        description: stdText || known?.description || "",
        chapterCode: chapterCode || known?.chapterCode || "",
        chapterName: chapterName || known?.chapterName || "",
        isEsr, department: department || known?.department || "",
        action: "create",
      };
      if (known) {
        const differs = next.description !== known.description || next.chapterCode !== known.chapterCode || next.chapterName !== known.chapterName
          || next.isEsr !== known.isEsr || next.department !== known.department;
        next.action = differs && mode === "add_and_update" ? "update" : "unchanged";
        if (differs && mode === "add_only") warnings.push({ line, message: `${code} already exists with different details; left unchanged (choose “add and update” to apply changes).` });
      }
      standards.set(code, next);
    } else if (!elCode || stdText) {
      // A second standard-level row for the same code, or an element row that restates the standard with different text.
      if (stdText && stdText !== planned.description) {
        rejected.push({ line, message: `Duplicate standard code ${code} with different text (first seen on line ${planned.line}).` });
        return;
      }
      if (!elCode) { warnings.push({ line, message: `Standard ${code} repeated; line ${planned.line} is used.` }); return; }
    }

    if (!elCode) return;

    // ---- the measurable element
    const elText = cell(cells, "elementDescription");
    if (elCode.length > 80) { rejected.push({ line, message: `${code}: element code is longer than 80 characters.` }); return; }
    if (elText.length > 4000) { rejected.push({ line, message: `${code} / ${elCode}: element text is longer than 4,000 characters.` }); return; }
    const key = `${code}\u0000${elCode}`;
    if (elements.has(key)) {
      rejected.push({ line, message: `Duplicate element ${code} / ${elCode} (first seen on line ${elements.get(key)?.line}).` });
      return;
    }
    const knownEl = existingEl.get(key);
    if (!knownEl && !elText) { rejected.push({ line, message: `${code} / ${elCode}: new measurable element without text.` }); return; }
    const isEsr = mapping.elementEsr !== undefined ? isTrue(cell(cells, "elementEsr")) : knownEl?.isEsr ?? false;
    const next: PlannedElement = {
      line, standardCode: code, code: elCode, existingId: knownEl?.id ?? null,
      officialCode: cell(cells, "officialElementCode") || knownEl?.officialCode || "",
      description: elText || knownEl?.description || "",
      isEsr, department: department || knownEl?.department || "",
      action: "create",
    };
    if (knownEl) {
      const differs = next.description !== knownEl.description || next.officialCode !== knownEl.officialCode || next.isEsr !== knownEl.isEsr || next.department !== knownEl.department;
      next.action = differs && mode === "add_and_update" ? "update" : "unchanged";
      if (differs && mode === "add_only") warnings.push({ line, message: `${code} / ${elCode} already exists with different details; left unchanged.` });
    }
    elements.set(key, next);
  });

  const s = [...standards.values()];
  const e = [...elements.values()];
  return {
    standards: s,
    elements: e,
    rejected,
    warnings,
    summary: {
      rowsRead: body.length,
      standardsToCreate: s.filter((x) => x.action === "create").length,
      standardsToUpdate: s.filter((x) => x.action === "update").length,
      elementsToCreate: e.filter((x) => x.action === "create").length,
      elementsToUpdate: e.filter((x) => x.action === "update").length,
      unchanged: s.filter((x) => x.action === "unchanged").length + e.filter((x) => x.action === "unchanged").length,
      rejectedRows: new Set(rejected.map((r) => r.line)).size,
    },
  };
}

/** Convenience for the server: parse + plan in one call (the browser does the same in two steps). */
export function planFromCsv(text: string, mapping: ColumnMapping, existing: ExistingRegister, mode: ImportMode): ImportPlan {
  return buildImportPlan({ table: parseCsv(text), mapping, existing, mode });
}

/** Rolls element ratings up to a quick per-standard picture. Not a score: the CBAHI-style score stays at standard level. */
export function elementProgress(elements: ElementRow[], statuses: ElementStatusRow[]) {
  const byId = new Map(statuses.map((s) => [s.elementId, s]));
  const applicable = elements.filter((e) => e.applicability !== "not_applicable");
  const rated = applicable.filter((e) => {
    const r = byId.get(e.id)?.rating;
    return r !== null && r !== undefined && r !== "not_applicable";
  });
  const satisfactory = rated.filter((e) => byId.get(e.id)?.rating === "satisfactory").length;
  return {
    total: elements.length,
    applicable: applicable.length,
    toConfirm: elements.filter((e) => e.applicability === "to_confirm").length,
    assessed: rated.length,
    satisfactory,
    esr: applicable.filter((e) => e.isEsr).length,
  };
}
