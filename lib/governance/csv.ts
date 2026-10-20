/** Minimal RFC 4180 CSV reader (quoted fields, escaped quotes, CRLF) and the standards-register importer built on it. */

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i += 1; } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i += 1;
      row.push(field); field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

export type ImportedStandard = {
  chapterCode: string;
  chapterName: string;
  code: string;
  description: string;
  isEsr: boolean;
  department: string;
};

export type StandardsImport = { rows: ImportedStandard[]; errors: string[] };

const ALIASES: Record<string, keyof ImportedStandard> = {
  chaptercode: "chapterCode", chapter: "chapterCode", chapterid: "chapterCode",
  chaptername: "chapterName", chaptertitle: "chapterName",
  code: "code", standard: "code", standardcode: "code", standardno: "code", id: "code",
  description: "description", text: "description", standardtext: "description", title: "description", statement: "description",
  esr: "isEsr", isesr: "isEsr", essential: "isEsr", essentialsafetyrequirement: "isEsr",
  department: "department", dept: "department", owner: "department",
};

const TRUE_VALUES = new Set(["1", "y", "yes", "true", "t", "esr", "x"]);
const MAX_ROWS = 5000;

/** Accepts a header row with flexible column names. Reports every bad row instead of failing silently. */
export function parseStandardsCsv(text: string): StandardsImport {
  const table = parseCsv(text);
  if (table.length < 2) return { rows: [], errors: ["The file needs a header row and at least one standard."] };
  if (table.length - 1 > MAX_ROWS) return { rows: [], errors: [`Too many rows (${table.length - 1}). Import at most ${MAX_ROWS} at a time.`] };

  const header = table[0].map((cell) => ALIASES[cell.toLowerCase().replace(/[^a-z]/g, "")] ?? null);
  if (!header.includes("code") || !header.includes("description")) {
    return { rows: [], errors: ['The header row must include a "code" column and a "description" column (optional: chapter_code, chapter_name, esr, department).'] };
  }

  const rows: ImportedStandard[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  table.slice(1).forEach((cells, index) => {
    const line = index + 2;
    const record: ImportedStandard = { chapterCode: "", chapterName: "", code: "", description: "", isEsr: false, department: "" };
    header.forEach((key, col) => {
      if (!key) return;
      const value = (cells[col] ?? "").trim();
      if (key === "isEsr") record.isEsr = TRUE_VALUES.has(value.toLowerCase());
      else record[key] = value;
    });
    if (!record.code) { errors.push(`Line ${line}: missing code.`); return; }
    if (!record.description) { errors.push(`Line ${line} (${record.code}): missing description.`); return; }
    if (record.code.length > 60) { errors.push(`Line ${line}: code is longer than 60 characters.`); return; }
    if (record.description.length > 4000) { errors.push(`Line ${line} (${record.code}): description is longer than 4000 characters.`); return; }
    if (seen.has(record.code)) { errors.push(`Line ${line}: code ${record.code} appears more than once in this file.`); return; }
    seen.add(record.code);
    rows.push(record);
  });
  return { rows, errors };
}

/** Quote a value for CSV output; also neutralises spreadsheet formula injection from user-entered text. */
export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: unknown[][]): string {
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}
