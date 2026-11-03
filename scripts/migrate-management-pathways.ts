/**
 * Adds inline rationale to management actions, from the topic's own Investigations table.
 *
 *   npx tsx scripts/migrate-management-pathways.ts --only=sa            # dry run, Saudi (or --only=in)
 *   npx tsx scripts/migrate-management-pathways.ts --only=sa --apply    # write
 *   add --include-published to also change published versions (default: draft, under_review, approved only)
 *
 * What it does (lib/management-pathways.ts attachInvestigationsToSteps): for each management action that names
 * one of the topic's investigations, it adds `actionDetails` {rationale, expected, investigationRef, origin: "auto-linked"}
 * by COPYING that investigation's existing text. It never writes If/Then pathways (those are authored) and never edits an
 * existing string. Idempotent: details already present are kept; a second run changes nothing.
 * Only current versions (is_current) are read. Safety: a version is written only if it validates both before and after; every original `content` is saved first to
 * .claude-tmp/backups/management-pathways-<region>-<time>.ndjson ({id, content}) and --restore=<file> puts them back.
 */
import fs from "node:fs";
import { DiseaseDetailSchema } from "../lib/validations/disease";
import { attachInvestigationsToSteps } from "../lib/management-pathways";

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const apply = process.argv.includes("--apply");
const includePublished = process.argv.includes("--include-published");
const only = (arg("only") ?? "").toLowerCase();
const restoreFile = arg("restore");
if (!["sa", "in"].includes(only)) throw new Error("Pass --only=sa or --only=in (one database per run)");

function env(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
const E = env(only === "sa" ? ".env.local" : ".env.india.local");
const region = (E.NEXT_PUBLIC_MARIFA_REGION ?? "").toUpperCase();
if (region !== only.toUpperCase()) throw new Error(`${only === "sa" ? ".env.local" : ".env.india.local"} is region ${region || "unset"}, expected ${only.toUpperCase()}`);
const base = E.NEXT_PUBLIC_SUPABASE_URL, key = E.SUPABASE_SECRET_KEY;

async function rest<T>(method: string, p: string, body?: unknown): Promise<T> {
  const r = await fetch(`${base}/rest/v1/${p}`, { method, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!r.ok) throw new Error(`${method} ${p.split("?")[0]} -> ${r.status} ${(await r.text()).slice(0, 300)}`);
  const text = await r.text();
  return (text ? JSON.parse(text) : null) as T;
}
const get = <T>(p: string) => fetch(`${base}/rest/v1/${p}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } }).then(async (r) => { if (!r.ok) throw new Error(`GET ${p.split("?")[0]} -> ${r.status}`); return (await r.json()) as T; });

if (restoreFile) {
  const rows = fs.readFileSync(restoreFile, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as { id: string; content: unknown });
  for (const row of rows) await rest("PATCH", `guideline_versions?id=eq.${row.id}`, { content: row.content });
  console.log(`Restored ${rows.length} versions from ${restoreFile}`);
  process.exit(0);
}

type Row = { id: string; status: string; content: unknown; guideline_id: string };
const statuses = includePublished ? ["draft", "under_review", "approved", "published"] : ["draft", "under_review", "approved"];
const rows: Row[] = [];
for (let from = 0; ; from += 200) {
  const page = await get<Row[]>(`guideline_versions?select=id,status,guideline_id,content&status=in.(${statuses.join(",")})&is_current=eq.true&order=id&limit=200&offset=${from}`);
  rows.push(...page);
  if (page.length < 200) break;
}

let changed = 0, linkedTotal = 0, invalidBefore = 0, invalidAfter = 0, ambiguous = 0;
const backup: Array<{ id: string; content: unknown }> = [];
const writes: Array<{ id: string; content: unknown }> = [];
for (const row of rows) {
  const before = DiseaseDetailSchema.safeParse(row.content);
  if (!before.success) { invalidBefore += 1; continue; }
  const { content, report } = attachInvestigationsToSteps(before.data);
  ambiguous += report.ambiguous;
  if (report.actionsLinked === 0) continue;
  const after = DiseaseDetailSchema.safeParse(content);
  if (!after.success) { invalidAfter += 1; console.log(`SKIP ${row.id}: result would not validate (${after.error.issues[0]?.message})`); continue; }
  changed += 1; linkedTotal += report.actionsLinked;
  backup.push({ id: row.id, content: row.content });
  writes.push({ id: row.id, content: after.data });
  if (changed <= 8) console.log(`${apply ? "WRITE" : "WOULD WRITE"} ${row.status} ${before.data.title}: ${report.actionsLinked} action(s) in ${report.stepsTouched} step(s)`);
}
console.log(`\n${apply ? "APPLY" : "DRY RUN"} (${region}, statuses ${statuses.join("/")}): ${rows.length} versions read; ${changed} to change, ${linkedTotal} actions linked, ${ambiguous} ambiguous skipped; ${invalidBefore} not valid before (left alone), ${invalidAfter} not valid after (skipped).`);

if (apply && writes.length) {
  fs.mkdirSync(".claude-tmp/backups", { recursive: true });
  const file = `.claude-tmp/backups/management-pathways-${only}-${new Date().toISOString().replace(/[:.]/g, "-")}.ndjson`;
  fs.writeFileSync(file, backup.map((b) => JSON.stringify(b)).join("\n") + "\n");
  console.log(`Backup of originals: ${file}`);
  for (const w of writes) await rest("PATCH", `guideline_versions?id=eq.${w.id}`, { content: w.content });
  console.log(`Wrote ${writes.length} versions. Undo: npx tsx scripts/migrate-management-pathways.ts --only=${only} --restore=${file}`);
}
