import { describe, expect, it } from "vitest";
import { csvCell, parseCsv, parseStandardsCsv, toCsv } from "@/lib/governance/csv";

describe("parseCsv", () => {
  it("handles quotes, embedded commas/newlines, escaped quotes, CRLF and a BOM", () => {
    const rows = parseCsv('﻿a,b\r\n"x, y","line1\nline2"\r\n"say ""hi""",z\r\n');
    expect(rows).toEqual([["a", "b"], ["x, y", "line1\nline2"], ['say "hi"', "z"]]);
  });
  it("skips blank lines", () => expect(parseCsv("a\n\n\nb\n")).toEqual([["a"], ["b"]]));
});

describe("parseStandardsCsv", () => {
  it("maps flexible headers and ESR flags", () => {
    const out = parseStandardsCsv('Chapter,Chapter Name,Standard Code,Standard Text,ESR,Dept\nQM,Quality,QM.1,"Text, with comma",Yes,Quality\nQM,Quality,QM.2,Plain,,Quality');
    expect(out.errors).toEqual([]);
    expect(out.rows).toEqual([
      { chapterCode: "QM", chapterName: "Quality", code: "QM.1", description: "Text, with comma", isEsr: true, department: "Quality" },
      { chapterCode: "QM", chapterName: "Quality", code: "QM.2", description: "Plain", isEsr: false, department: "Quality" },
    ]);
  });
  it("requires code and description columns", () => {
    expect(parseStandardsCsv("code,x\nA,B").errors[0]).toMatch(/code.*description/);
    expect(parseStandardsCsv("code,description").errors[0]).toMatch(/header row and at least one/);
  });
  it("reports each bad row and drops duplicates instead of failing silently", () => {
    const out = parseStandardsCsv("code,description\nA.1,ok\n,missing code\nA.2,\nA.1,dup");
    expect(out.rows.map((r) => r.code)).toEqual(["A.1"]);
    expect(out.errors).toHaveLength(3);
    expect(out.errors.join(" ")).toMatch(/Line 3.*missing code/);
    expect(out.errors.join(" ")).toMatch(/A\.2.*missing description/);
    expect(out.errors.join(" ")).toMatch(/A\.1 appears more than once/);
  });
});

describe("csv output", () => {
  it("quotes where needed and neutralises spreadsheet formulas", () => {
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
    expect(csvCell("=HYPERLINK(\"x\")")).toBe("\"'=HYPERLINK(\"\"x\"\")\"");
    expect(csvCell(null)).toBe("");
    expect(toCsv([["a", 1], ["b", "c,d"]])).toBe('a,1\r\nb,"c,d"\r\n');
  });
});
