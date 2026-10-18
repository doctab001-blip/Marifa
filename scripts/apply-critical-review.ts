/**
 * Apply the owner's decisions from the Critical Medicine Pathway Review page, then (optionally) publish cleared topics.
 * Usage: tsx scripts/apply-critical-review.ts <decisions.json> [--publish]
 * decisions.json: { "<slug>": { cleared, picks: {"<branchIdx>|<stepIdx>": <regimenIndex>}, note } }
 * Reads outputs/medication-pathway-audit/critical-review-data.json for slug -> guideline/version and step layout.
 * Only touches `under_review` rows. Changes `preferred` / `selection` roles and records the confirmation in evidenceAudit.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { auditTopicContent } from "../lib/clinical-authoring-audit";

const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`;
const key = process.env.SUPABASE_SECRET_KEY!;
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");
const [decisionsPath, flag] = process.argv.slice(2);
const decisions = JSON.parse(readFileSync(decisionsPath, "utf8")) as Record<string, { cleared?: boolean; picks?: Record<string, number>; note?: string }>;
const data = JSON.parse(readFileSync("outputs/medication-pathway-audit/critical-review-data.json", "utf8")) as Array<{
  slug: string; title: string; guidelineId: string; version: string;
  branches: Array<{ label: string; steps: Array<{ name: string; selection: string; options: Array<{ i: number; drug: string; role: string }> }> }>;
}>;
const stamp = "Preferred drugs and use-when conditions reviewed and confirmed by the platform owner (Dr Tabassum Akhtar) on 2026-10-18 through the Critical Medicine Pathway Review page.";

async function rest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(base + path, { method, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!r.ok) throw new Error(`${method} ${path.split("?")[0]} -> ${r.status} ${(await r.text()).slice(0, 300)}`);
  const t = await r.text();
  return (t ? JSON.parse(t) : null) as T;
}
const published: string[] = [];
for (const t of data) {
  const d = decisions[t.slug];
  if (!d?.cleared) { console.log(`SKIP ${t.title}: not cleared`); continue; }
  const rows = await rest<Array<{ id: string; status: string; content: any }>>("GET", `guideline_versions?select=id,status,content&guideline_id=eq.${t.guidelineId}&version=eq.${encodeURIComponent(t.version)}`);
  if (rows.length !== 1 || rows[0].status !== "under_review") { console.log(`SKIP ${t.title}: row missing or not under_review`); continue; }
  const content = rows[0].content;
  const regs = content.medicationPlan.regimens as any[];
  const changes: string[] = [];
  t.branches.forEach((b, bi) => b.steps.forEach((st, si) => {
    const pick = d.picks?.[`${bi}|${si}`];
    if (st.selection !== "one-of" || pick == null) return;
    const old = st.options.find((o) => o.role === "preferred")!;
    if (old.i === pick) return;
    regs[pick].preferred = true;
    if (regs[pick].useWhen) regs[pick].useWhen = undefined;
    regs[old.i].preferred = false;
    regs[old.i].useWhen = `Chosen instead of ${regs[pick].genericName.toLowerCase()}`;
    changes.push(`${b.label} / ${st.name}: ${old.drug} -> ${regs[pick].genericName}`);
  }));
  const ea = content.evidenceAudit ?? (content.evidenceAudit = {});
  ea.findings = [...(ea.findings ?? []), stamp + (changes.length ? ` Changed: ${changes.join("; ")}.` : " No changes to the drafted preferred drugs.")];
  if (d.note) ea.findings.push(`Owner note: ${d.note}`);
  ea.unverifiedSections = (ea.unverifiedSections ?? []).filter((s: string) => !/preferred|use-when/i.test(s));
  const audit = auditTopicContent(content);
  if (!audit.publishable) { console.log(`FAIL ${t.title}: score ${audit.score}% ${audit.pathwayIssues?.length ?? 0} pathway issues — not saved`); continue; }
  await rest("PATCH", `guideline_versions?id=eq.${rows[0].id}`, { content });
  console.log(`OK   ${t.title}: ${changes.length ? changes.join("; ") : "confirmed as drafted"} (score ${audit.score}%)`);
  published.push(`${t.guidelineId}:${t.version}`);
}
if (flag === "--publish" && published.length) {
  console.log("PUBLISH", published.length);
  execFileSync("node_modules/.bin/tsx", ["scripts/publish-if-eligible.ts", ...published], { stdio: "inherit" });
}
