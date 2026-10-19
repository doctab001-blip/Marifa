/**
 * Stages a written Local Protocol (paste-editor Markdown) as a new DRAFT version. Never publishes.
 *
 * Usage: npx tsx scripts/stage-protocol-paste.ts "<exact protocol title>" <markdown file> [--check]
 *   --check  parse and audit only; write nothing.
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY (never printed), MARIFA_TEMPORARY_ADMIN_USER_ID (read from .env.local if unset).
 *
 * Uses the same parser and audit as the paste editor (lib/topic-paste.ts), so the score matches the page.
 * Saves a NEW draft row (status draft, is_current false) on top of the latest version; history is kept.
 * clinicalReviewStatus stays "pending". Sections missing from the Markdown keep the previous content.
 */
import { existsSync, readFileSync } from "node:fs";
import { DiseaseDetailSchema } from "@/lib/validations/disease";
import { parsePastedTopic } from "@/lib/topic-paste";
import { auditTopicContent } from "@/lib/clinical-authoring-audit";
import { LOCAL_PROTOCOL_SOURCE_TYPE } from "@/lib/local-protocols";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}
const [title, file] = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const checkOnly = process.argv.includes("--check");
if (!title || !file) throw new Error('Usage: stage-protocol-paste.ts "<protocol title>" <markdown file> [--check]');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const userId = process.env.MARIFA_TEMPORARY_ADMIN_USER_ID;
if (!url || !key || !userId) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY and MARIFA_TEMPORARY_ADMIN_USER_ID.");

async function rest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${method} ${path.split("?")[0]} -> ${response.status} ${(await response.text()).slice(0, 300)}`);
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const guidelines = await rest<Array<{ id: string; title: string; status: string }>>("GET", `clinical_guidelines?select=id,title,status&source_type=eq.${LOCAL_PROTOCOL_SOURCE_TYPE}&title=eq.${encodeURIComponent(title)}`);
if (guidelines.length !== 1) throw new Error(`Expected exactly one protocol titled "${title}", found ${guidelines.length}.`);
const guideline = guidelines[0];
if (guideline.status !== "draft") throw new Error(`Protocol is ${guideline.status}; return it to Draft before staging new content.`);
type Row = { id: string; version: string; content: unknown; source_title: string; issuing_organization: string; source_url: string | null; jurisdiction: string; last_verified_date: string | null; review_date: string; created_at: string };
const versions = await rest<Row[]>("GET", `guideline_versions?select=*&guideline_id=eq.${guideline.id}&status=in.(draft,under_review)&order=created_at.desc&limit=1`);
if (!versions.length) throw new Error("No draft version to build on.");
const base = versions[0];
const baseContent = DiseaseDetailSchema.parse(base.content);

const rawMarkdown = readFileSync(file, "utf8");
// "UNVERIFIED:" and "SCOPE:" lines are notes for the evidence audit, not topic text: keep them out of the parsed Markdown.
const markdown = rawMarkdown.split("\n").filter((line) => !/^\s*(UNVERIFIED|SCOPE):/i.test(line)).join("\n");
const parsed = parsePastedTopic(markdown, baseContent, { today, useTitleFromPaste: false });
console.log(`Sections read: ${parsed.parsedCount}`);
for (const section of parsed.sections) console.log(`  ${section.status.padEnd(8)} ${section.label}: ${section.detail}`.slice(0, 160));
for (const issue of parsed.issues) console.log(`  [${issue.level}] ${issue.message}`);
for (const error of parsed.schemaErrors) console.log(`  [schema] ${error}`);
if (!parsed.content || parsed.parsedCount === 0) throw new Error("Nothing valid could be read; not saved.");

const suffix = new Date().toISOString().replace(/[-:.TZ]/g, "");
const version = `${base.version.replace(/-pasted-\d+$/, "").replace(/^outline-/, "protocol-")}-pasted-${suffix}`;
const content = { ...parsed.content, version, status: "draft" as const, clinicalReviewStatus: "pending" as const };
// Lines such as "UNVERIFIED: ..." and "SCOPE: ..." in the Markdown are recorded in the evidence audit.
const unverifiedLines = rawMarkdown.split("\n").map((line) => /^\s*UNVERIFIED:\s*(.+)$/i.exec(line)?.[1]?.trim()).filter((line): line is string => Boolean(line));
const scopeLine = rawMarkdown.split("\n").map((line) => /^\s*SCOPE:\s*(.+)$/i.exec(line)?.[1]?.trim()).find(Boolean);
if (content.evidenceAudit) {
  content.evidenceAudit = {
    ...content.evidenceAudit,
    scope: scopeLine ?? content.evidenceAudit.scope,
    findings: [`Protocol content written from sources opened on ${today}; see References for the exact sections used.`, ...content.evidenceAudit.findings.slice(1)],
    unverifiedSections: [...unverifiedLines, ...content.evidenceAudit.unverifiedSections],
  };
}
const audit = auditTopicContent(content);
console.log(`Score ${audit.score}% (${audit.passedChecks}/${audit.totalChecks}); publishable=${audit.publishable}; pathway ok=${audit.pathwayCompliant}`);
for (const failure of audit.failures) console.log(`  - ${failure}`);
if (checkOnly) { console.log("Check only: nothing written."); process.exit(0); }

await rest("POST", "guideline_versions", {
  guideline_id: guideline.id, version, version_number: version, status: "draft", is_current: false, content,
  change_summary: `Protocol content written from opened sources (staged by script). Authoring-standard score ${audit.score}%. Draft only; clinical review pending.`,
  source_title: parsed.references[0]?.title ?? base.source_title, issuing_organization: base.issuing_organization, source_url: parsed.references[0]?.url ?? base.source_url,
  jurisdiction: base.jurisdiction, last_verified_date: today, review_date: base.review_date, created_by: userId,
});
console.log(`Saved draft version ${version} for "${title}".`);
