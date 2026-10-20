import { toCsv } from "@/lib/governance/csv";

/** Empty import template: headers only. Marifa never ships CBAHI's standards text. */
export function GET() {
  const body = toCsv([["chapter_code", "chapter_name", "code", "description", "esr", "department"]]);
  return new Response(body, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="standards-import-template.csv"', "Cache-Control": "no-store" },
  });
}
