// Updates ONLY the management sequence (and its audit note) of the CURRENT live row of a topic, in place.
// Usage: node scripts/mseq/push-live.mjs <guideline-id> <local-json-file> [--apply]
// Default is a dry run. A backup of the previous row content is written to .claude-tmp/mseq/backups/ before any write.
import fs from "node:fs";
import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";

loadEnvFile(".env.local");
const [guidelineId, file] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const apply = process.argv.includes("--apply");
const local = JSON.parse(fs.readFileSync(file, "utf8"));
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const { data: rows, error } = await db.from("guideline_versions").select("id,version,status,is_current,content").eq("guideline_id", guidelineId).eq("is_current", true);
if (error) throw error;
if (rows.length !== 1) throw new Error(`Expected exactly one current row, found ${rows.length}`);
const row = rows[0];
const beforeSteps = JSON.stringify(row.content.clinicalManagement);
const next = structuredClone(row.content);
next.clinicalManagement = local.clinicalManagement;
const have = new Set(next.evidenceAudit?.findings ?? []);
const added = (local.evidenceAudit?.findings ?? []).filter((f) => !have.has(f) && /reformatted on|SUPPLEMENTED/.test(f));
next.evidenceAudit = { ...next.evidenceAudit, findings: [...(next.evidenceAudit?.findings ?? []), ...added] };
const haveU = new Set(next.evidenceAudit.unverifiedSections ?? []);
next.evidenceAudit.unverifiedSections = [...(next.evidenceAudit.unverifiedSections ?? []), ...(local.evidenceAudit?.unverifiedSections ?? []).filter((u) => !haveU.has(u) && /Management sequence reformat/.test(u))];
console.log(`Current row: ${row.version} (${row.status}); steps ${JSON.parse(beforeSteps).length} -> ${next.clinicalManagement.length}; audit notes added: ${added.length}`);
const otherChanged = Object.keys(next).filter((k) => !["clinicalManagement", "evidenceAudit"].includes(k) && JSON.stringify(next[k]) !== JSON.stringify(row.content[k]));
console.log(`Other fields changed: ${otherChanged.length ? otherChanged.join(", ") : "none"}`);
if (!apply) { console.log("DRY RUN: nothing written."); process.exit(0); }
fs.mkdirSync(".claude-tmp/mseq/backups", { recursive: true });
fs.writeFileSync(`.claude-tmp/mseq/backups/${guidelineId}.${row.version}.${Date.now()}.json`, JSON.stringify(row.content));
const { error: upErr } = await db.from("guideline_versions").update({ content: next }).eq("id", row.id);
if (upErr) throw upErr;
const { data: back } = await db.from("guideline_versions").select("content").eq("id", row.id).single();
console.log(JSON.stringify(back.content.clinicalManagement) === JSON.stringify(next.clinicalManagement) ? "UPDATED and read back OK" : "WARN read-back differs");
