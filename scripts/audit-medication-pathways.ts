/**
 * Medicine-pathway audit.
 *
 * Reads the latest version of every guideline (read-only) and reports which medicine plans are flat drug
 * lists instead of branched decision pathways (lib/medication-pathway.ts).
 *
 * Usage: npx tsx scripts/audit-medication-pathways.ts [--files-only]
 * Env:   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY (never printed). With --files-only (or no env) it audits
 *        data/emergency-versions/*.json instead of the database.
 * Output: outputs/medication-pathway-audit/report.json and README.md
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DiseaseDetailSchema } from "../lib/validations/disease";
import { isBranchedMedicationPlan, medicationPathwayIssues, type MedicationPathwayIssue } from "../lib/medication-pathway";

type Row = { guideline_id: string; version: string; status: string; is_current: boolean; created_at?: string; content: unknown };
type Entry = {
  guidelineId: string;
  title: string;
  version: string;
  status: string;
  isCurrent: boolean;
  /** The most recently created version of this guideline: the one a restructure should start from. */
  isNewest: boolean;
  origin: "database" | "file";
  regimens: number;
  branched: boolean;
  classification: "no-medicines" | "single-drug" | "compliant" | "flat" | "partial" | "invalid-schema";
  priority: "critical" | "high" | "medium" | "none";
  errors: MedicationPathwayIssue[];
  warnings: MedicationPathwayIssue[];
};

const filesOnly = process.argv.includes("--files-only");
const base = process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/` : "";
const key = process.env.SUPABASE_SECRET_KEY;

async function rest<T>(path: string): Promise<T> {
  const response = await fetch(base + path, { headers: { apikey: key!, Authorization: `Bearer ${key}` } });
  if (!response.ok) throw new Error(`GET ${path.split("?")[0]} -> ${response.status}`);
  return (await response.json()) as T;
}

function classify(content: unknown, meta: Pick<Entry, "guidelineId" | "version" | "status" | "isCurrent" | "isNewest" | "origin">): Entry {
  const parsed = DiseaseDetailSchema.safeParse(content);
  const title = (content as { title?: string } | null)?.title ?? meta.guidelineId;
  if (!parsed.success) return { ...meta, title, regimens: 0, branched: false, classification: "invalid-schema", priority: "none", errors: [], warnings: [] };
  const plan = parsed.data.medicationPlan;
  const regimens = plan?.regimens.length ?? 0;
  const issues = medicationPathwayIssues(plan);
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const branched = isBranchedMedicationPlan(plan);
  const classification: Entry["classification"] = regimens === 0 ? "no-medicines" : regimens === 1 ? "single-drug" : errors.length === 0 ? "compliant" : branched ? "partial" : "flat";
  const strictConflict = errors.some((issue) => issue.rule === "exclusive-class");
  const priority: Entry["priority"] = errors.length === 0 ? "none" : strictConflict ? "critical" : regimens >= 5 ? "high" : "medium";
  return { ...meta, title, regimens, branched, classification, priority, errors, warnings };
}

async function main() {
  const entries: Entry[] = [];
  const queue: Array<Record<string, unknown>> = [];
  let origin: "database" | "file" = "file";
  if (!filesOnly && base && key) {
    origin = "database";
    const guidelines = await rest<Array<{ id: string; title: string }>>("clinical_guidelines?select=id,title&limit=1000");
    for (const guideline of guidelines) {
      const rows = await rest<Row[]>(`guideline_versions?select=guideline_id,version,status,is_current,created_at,content&guideline_id=eq.${guideline.id}&order=created_at.desc&limit=40`);
      if (!rows.length) continue;
      // Audit the live (current) row and the newest non-current draft/under-review row when it differs.
      const current = rows.find((row) => row.is_current);
      const newest = rows[0];
      for (const row of [current, newest && newest !== current ? newest : undefined]) {
        if (!row) continue;
        const entry = classify(row.content, { guidelineId: row.guideline_id, version: row.version, status: row.status, isCurrent: row.is_current, isNewest: row === newest, origin });
        entries.push(entry);
        if (row === newest && entry.errors.length > 0) {
          const detail = DiseaseDetailSchema.parse(row.content);
          queue.push({
            guidelineId: entry.guidelineId, title: entry.title, baseVersion: entry.version, baseStatus: entry.status, priority: entry.priority,
            managementSteps: detail.clinicalManagement.map((step) => `${step.title} (${step.timeframe})`),
            criteria: (detail.diagnosticCriteria ?? []).map((criterion) => criterion.criterion),
            regimens: detail.medicationPlan!.regimens.map((regimen, index) => ({ index, genericName: regimen.genericName, indication: regimen.indication, patientGroup: regimen.patientGroup, dose: regimen.dose, route: regimen.route, frequency: regimen.frequency })),
          });
        }
      }
    }
  } else {
    for (const name of readdirSync("data/emergency-versions").filter((file) => file.endsWith(".json")).sort()) {
      const raw = JSON.parse(readFileSync(join("data/emergency-versions", name), "utf8"));
      const content = raw.content ?? raw;
      entries.push(classify(content, { guidelineId: String(content.id ?? name), version: String(content.version ?? name), status: String(content.status ?? "file"), isCurrent: false, isNewest: true, origin }));
    }
  }

  const needs = entries.filter((entry) => entry.errors.length > 0);
  const count = (predicate: (entry: Entry) => boolean) => entries.filter(predicate).length;
  const summary = {
    capturedAt: new Date().toISOString(),
    origin,
    versionsAudited: entries.length,
    withMedicinePlans: count((entry) => entry.regimens > 0),
    compliant: count((entry) => entry.classification === "compliant"),
    singleDrug: count((entry) => entry.classification === "single-drug"),
    noMedicines: count((entry) => entry.classification === "no-medicines"),
    flat: count((entry) => entry.classification === "flat"),
    partial: count((entry) => entry.classification === "partial"),
    invalidSchema: count((entry) => entry.classification === "invalid-schema"),
    critical: count((entry) => entry.priority === "critical"),
    high: count((entry) => entry.priority === "high"),
    medium: count((entry) => entry.priority === "medium"),
  };
  const outDir = "outputs/medication-pathway-audit";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "queue.json"), `${JSON.stringify(queue, null, 2)}\n`);
  writeFileSync(join(outDir, "report.json"), `${JSON.stringify({ summary, entries }, null, 2)}\n`);

  const order = { critical: 0, high: 1, medium: 2, none: 3 } as const;
  const lines = [
    "# Medicine-pathway audit",
    "",
    `Captured: ${summary.capturedAt} (${origin === "database" ? "database, read-only" : "data/emergency-versions files"})`,
    "",
    "A medicine plan passes when every drug sits in a branch (STEMI, NSTEMI, ...), alternatives are marked one-of with exactly one preferred option, and no two drugs of one exclusive class are given together (`lib/medication-pathway.ts`).",
    "",
    `- Versions audited: ${summary.versionsAudited}`,
    `- With a multi-drug or single-drug medicine plan: ${summary.withMedicinePlans}`,
    `- Compliant pathway: ${summary.compliant}`,
    `- Flat drug list (needs restructuring): ${summary.flat}`,
    `- Partly branched (needs fixes): ${summary.partial}`,
    `- Priority — critical (two drugs of one strict class listed together): ${summary.critical}; high (5+ drugs): ${summary.high}; medium: ${summary.medium}`,
    "",
    "## Restructuring queue",
    "",
    "| Priority | Topic | Version | Status | Drugs | Main findings |",
    "|---|---|---|---|---|---|",
    ...needs
      .sort((a, b) => order[a.priority] - order[b.priority] || a.title.localeCompare(b.title))
      .map((entry) => {
        const conflicts = entry.errors.filter((issue) => issue.rule === "exclusive-class" || issue.rule === "same-class").map((issue) => issue.message.split(". ")[0]);
        const findings = [...new Set([...conflicts, ...(entry.errors.some((issue) => issue.rule === "embedded-alternative") ? ["alternatives written inline or not marked"] : []), ...(entry.errors.some((issue) => issue.rule === "unbranched") ? ["not branched"] : [])])];
        return `| ${entry.priority} | ${entry.title} | ${entry.version} | ${entry.status}${entry.isCurrent ? " (current)" : ""} | ${entry.regimens} | ${findings.join("; ").replace(/\|/g, "/")} |`;
      }),
    "",
  ];
  writeFileSync(join(outDir, "README.md"), lines.join("\n"));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
