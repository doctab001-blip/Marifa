/**
 * Restructure flat medicine lists into branched decision pathways, as NEW under_review versions.
 *
 * Usage: npx tsx scripts/restructure-medication-pathways.ts <map-module> [--apply] [--only=<id-prefix>,...]
 *   <map-module> is a file in scripts/pathway-maps/ exporting `maps: PathwayMap[]`.
 * Env:   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY (never printed).
 *
 * What it does for each map: reads the newest version of the guideline (read-only), re-labels its medicines into
 * branches / steps / give-all vs choose-one, writes data/emergency-versions/<slug>.pathway-<date>-v1.json and, with
 * --apply, inserts it as `under_review`, `is_current: false`, `clinicalReviewStatus: "pending"`.
 * It never publishes, never edits the source row, and refuses a map that
 *   - leaves a medicine unassigned,
 *   - writes a number (in an override, a use-when or an entry criterion) that the source topic does not already contain,
 *   - or still fails the medicine-pathway rules.
 * Doses, routes, adjustments, monitoring, contraindications and sources are copied unchanged.
 */
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { auditTopicContent } from "../lib/clinical-authoring-audit";
import { medicationPathwayIssues, type MedicationRegimen } from "../lib/medication-pathway";
import { DiseaseDetailSchema, type DiseaseDetail } from "../lib/validations/disease";

import type { PathwayMap } from "./pathway-maps/types";

const DATE = process.env.CLINICAL_DATE ?? "2026-10-18";
const VERSION = process.env.CLINICAL_VERSION ?? `pathway-${DATE}-v1`;
const [moduleName, ...flags] = process.argv.slice(2);
if (!moduleName) throw new Error("Usage: tsx scripts/restructure-medication-pathways.ts <map-module> [--apply] [--only=prefix,...]");
const apply = flags.includes("--apply");
const only = flags.find((flag) => flag.startsWith("--only="))?.slice(7).split(",");
const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`;
const key = process.env.SUPABASE_SECRET_KEY;
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");

async function rest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(base + path, { method, headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) throw new Error(`${method} ${path.split("?")[0]} -> ${response.status} ${(await response.text()).slice(0, 200)}`);
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

const numbers = (text: string) => new Set(text.match(/\d+(?:[.,]\d+)?/g) ?? []);
const unknownNumbers = (candidate: string, allowed: Set<string>) => [...numbers(candidate)].filter((token) => !allowed.has(token));
const slug = (title: string) => title.toLowerCase().replace(/\[[^\]]*\]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

const queue = JSON.parse(readFileSync("outputs/medication-pathway-audit/queue.json", "utf8")) as Array<{ guidelineId: string; title: string; baseVersion: string }>;
const { maps } = (await import(`./pathway-maps/${moduleName}.ts`)) as { maps: PathwayMap[] };
const idsFile = `outputs/medication-pathway-audit/ids_${moduleName}.txt`;
const created: string[] = [];
let failed = 0;

type VersionRow = Record<string, unknown> & { id: string; version: string; status: string; content: unknown };

for (const map of maps.filter((entry) => !only || only.some((prefix) => entry.id.startsWith(prefix)))) {
  const matches = queue.filter((entry) => entry.guidelineId === map.id || slug(entry.title) === map.id);
  if (matches.length !== 1) { console.log(`FAIL ${map.id}: ${matches.length ? "matches several topics" : "not in the audit queue (already fixed, or typo)"}`); failed++; continue; }
  const item = matches[0];
  const rows = await rest<VersionRow[]>("GET", `guideline_versions?select=*&guideline_id=eq.${item.guidelineId}&version=eq.${encodeURIComponent(item.baseVersion)}`);
  if (rows.length !== 1) { console.log(`FAIL ${item.title}: base version ${item.baseVersion} not found`); failed++; continue; }
  const sourceRow = rows[0];
  const source = DiseaseDetailSchema.parse(sourceRow.content);
  const regimens = source.medicationPlan!.regimens;
  const sourceText = JSON.stringify(source);
  const allowedNumbers = numbers(sourceText);
  const problems: string[] = [];

  const assigned = new Set(map.rows.map((row) => row[0]));
  regimens.forEach((regimen, index) => { if (!assigned.has(index)) problems.push(`medicine ${index} (${regimen.genericName}) is not assigned to any branch`); });
  const out: MedicationRegimen[] = [];
  const order = map.rows.map((row, position) => ({ row, position })).sort((a, b) => a.row[1] - b.row[1] || a.position - b.position);
  for (const { row } of order) {
    const [index, branchIndex, step, sel, useWhen, over] = row;
    const original = regimens[index];
    const branch = map.branches[branchIndex];
    if (!original) { problems.push(`row refers to missing medicine ${index}`); continue; }
    if (!branch) { problems.push(`row for ${original.genericName} refers to missing branch ${branchIndex}`); continue; }
    const allowedForRow = new Set([...allowedNumbers]);
    for (const [field, value] of Object.entries(over ?? {})) {
      const bad = unknownNumbers(String(value), numbers(JSON.stringify(original)));
      if (bad.length) problems.push(`override ${field} for ${original.genericName} contains ${bad.join(", ")}, which is not in the source medicine`);
    }
    if (useWhen) {
      const bad = unknownNumbers(useWhen, allowedForRow);
      if (bad.length) problems.push(`use-when for ${original.genericName} contains ${bad.join(", ")}, not found in the topic`);
    }
    const next: MedicationRegimen = { ...original, ...over, branch: branch[0], step, selection: sel === "all" ? "all" : "one-of" };
    if (sel !== "all") next.preferred = sel === "pref";
    if (useWhen) next.useWhen = useWhen;
    out.push(next);
  }
  map.branches.forEach(([label, entry]) => {
    const bad = unknownNumbers(`${label} ${entry}`, allowedNumbers);
    if (bad.length) problems.push(`branch “${label}” contains ${bad.join(", ")}, not found in the topic`);
  });

  const content = structuredClone(source) as DiseaseDetail;
  content.status = "under_review";
  content.version = VERSION;
  content.lastReviewed = DATE;
  content.clinicalReviewStatus = "pending";
  content.medicationPlan = { ...source.medicationPlan!, regimens: out, branches: map.branches.map(([label, entryCriteria]) => ({ label, entryCriteria })) };
  const previousAudit = source.evidenceAudit;
  content.evidenceAudit = {
    ...(previousAudit ?? { medscapeStatus: "unavailable" as const }),
    checkedOn: DATE,
    status: "incomplete",
    scope: `${previousAudit?.scope ?? source.title} Medicine-pathway restructure on ${DATE}: medicines regrouped into branches, steps and give-all vs choose-one options; no dose, source or clinical claim was re-checked.`,
    findings: [...(previousAudit?.findings ?? []), `Medicine list restructured into a branched decision pathway on ${DATE}. Doses, routes, adjustments, monitoring, contraindications and sources are unchanged from ${sourceRow.version}.`],
    unverifiedSections: [...(previousAudit?.unverifiedSections ?? []), "Medicine pathway: branch entry criteria, preferred options and “use when” conditions were assigned from this topic's own indications and management steps. Confirm each against the cited guideline before clinical use."],
    originalVersionIds: [...new Set([...(previousAudit?.originalVersionIds ?? []), String(sourceRow.id)])],
  } as DiseaseDetail["evidenceAudit"];

  const parsed = DiseaseDetailSchema.safeParse(content);
  if (!parsed.success) problems.push(`schema: ${parsed.error.issues.slice(0, 3).map((issue) => `${issue.path.join(".")} ${issue.message}`).join("; ")}`);
  const pathwayErrors = medicationPathwayIssues(content.medicationPlan).filter((issue) => issue.severity === "error");
  pathwayErrors.forEach((issue) => problems.push(`pathway: ${issue.message}`));
  if (problems.length) { console.log(`FAIL ${item.title}:\n  - ${problems.join("\n  - ")}`); failed++; continue; }

  const before = auditTopicContent(source, { pathwayScored: false });
  const after = auditTopicContent(content);
  const warnings = after.pathwayIssues.filter((issue) => issue.severity === "warning").length;
  const file = `data/emergency-versions/${slug(item.title)}.${VERSION}.json`;
  writeFileSync(file, `${JSON.stringify(content, null, 2)}\n`);
  let note = "file only";
  if (apply) {
    const existing = await rest<unknown[]>("GET", `guideline_versions?select=id&guideline_id=eq.${item.guidelineId}&version=eq.${encodeURIComponent(VERSION)}`);
    if (existing.length) note = "version already exists, not inserted";
    else {
      const copied = ["source_title", "issuing_organization", "source_url", "jurisdiction", "last_verified_date", "review_date"] as const;
      const row: Record<string, unknown> = Object.fromEntries(copied.map((field) => [field, sourceRow[field]]));
      Object.assign(row, {
        id: randomUUID(), guideline_id: item.guidelineId, version: VERSION, version_number: VERSION, status: "under_review", is_current: false, content,
        approved_by: null, approved_at: null, published_at: null,
        change_summary: `Medicine list restructured into a branched decision pathway from ${sourceRow.version}. Doses and sources unchanged. Preferred options and use-when conditions need clinician confirmation. Saved under review; not published.`,
      });
      await rest("POST", "guideline_versions", row);
      created.push(`${item.guidelineId}:${VERSION}`);
      note = "inserted under_review";
    }
  }
  console.log(`OK   ${item.title} — ${map.branches.length} branch${map.branches.length === 1 ? "" : "es"}, ${out.length} rows, score ${before.score}% → ${after.score}%${after.publishable ? "" : " (NOT publishable)"}, ${warnings} warning${warnings === 1 ? "" : "s"}; ${note}`);
}
if (created.length) {
  const previous = existsSync(idsFile) ? readFileSync(idsFile, "utf8").trim() : "";
  writeFileSync(idsFile, [previous, ...created].filter(Boolean).join(" "));
}
console.log(`done: ${failed} failed`);
if (failed) process.exitCode = 1;
