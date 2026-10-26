// Rewrites the management sequence of the current version with the ABCDE first step and medication badges.
// Usage: node scripts/mseq/apply.mjs <patch.json> [--dry]
// Edits the current version of each topic in place (owner instruction, 26 Oct 2026). Git is the undo.
import fs from "node:fs";
import path from "node:path";
import { buildIndex, loadRecords } from "./index.mjs";
import { MACRO_NOTE, buildAbcde, expand } from "./macros.mjs";
import { extractMedicationBadges, lintManagementSequence } from "../../lib/management-sequence-format.ts";

const TODAY = "2026-10-26";
const OUT = "data/management-sequence-2026-10-26";
const patchFile = process.argv[2];
const dry = process.argv.includes("--dry");
const patches = JSON.parse(fs.readFileSync(patchFile, "utf8"));
const index = new Map(JSON.parse(fs.readFileSync(".claude-tmp/mseq/index.json", "utf8")).map((e) => [e.id, e]));
let failures = 0;

const slug = (title, id) => `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)}-${id.slice(0, 6)}`;
const nums = (s) => (String(s).match(/\d+(?:\.\d+)?/g) ?? []);

for (const patch of patches) {
  const entry = index.get(patch.id);
  if (!entry) { console.log(`✗ ${patch.id}: not found in index`); failures++; continue; }
  const file = JSON.parse(fs.readFileSync(entry.file, "utf8"));
  const rec = structuredClone(entry.isArray ? file[entry.index] : file);
  const used = new Set();
  const ex = (t) => expand(t, used);
  const steps = rec.clinicalManagement.map((s) => structuredClone(s));
  const dropped = new Set((patch.drop ?? []).map(String));

  for (const [key, text] of Object.entries(patch.set ?? {})) {
    const m = key.match(/^S(\d+)(?:\.b(\d+))?\.a(\d+)$/);
    if (!m) throw new Error(`Bad set key ${key}`);
    const step = steps[Number(m[1]) - 1];
    const list = m[2] === undefined ? step?.actions : step?.branches?.[Number(m[2])]?.actions;
    if (!list || list[Number(m[3])] === undefined) throw new Error(`${patch.id}: set key ${key} does not exist`);
    list[Number(m[3])] = ex(text);
  }
  for (const [key, text] of Object.entries(patch.setCond ?? {})) {
    const m = key.match(/^S(\d+)\.b(\d+)$/);
    if (!m || !steps[Number(m[1]) - 1]?.branches?.[Number(m[2])]) throw new Error(`${patch.id}: setCond key ${key} does not exist`);
    steps[Number(m[1]) - 1].branches[Number(m[2])].condition = ex(text);
  }
  for (const [key, list] of Object.entries(patch.append ?? {})) {
    const m = key.match(/^S(\d+)$/);
    if (!m || !steps[Number(m[1]) - 1]) throw new Error(`${patch.id}: append key ${key} does not exist`);
    steps[Number(m[1]) - 1].actions.push(...list.map(ex));
  }
  for (const [key, list] of Object.entries(patch.dropActions ?? {})) {
    const m = key.match(/^S(\d+)$/);
    if (!m || !steps[Number(m[1]) - 1]) throw new Error(`${patch.id}: dropActions key ${key} does not exist`);
    const step = steps[Number(m[1]) - 1];
    step.actions = step.actions.filter((_, i) => !list.includes(i));
  }

  let out = steps.filter((s) => !dropped.has(s.id));
  if (patch.replaceSteps) out = patch.replaceSteps.map((st) => ({ ...st, actions: st.actions.map(ex), ...(st.branches ? { branches: st.branches.map((b) => ({ condition: ex(b.condition), actions: b.actions.map(ex) })) } : {}) }));
  else if (patch.acute) out = [buildAbcde(patch, ex), ...out];
  rec.clinicalManagement = out;

  // Checks
  const regs = rec.medicationPlan?.regimens ?? [];
  const drugNames = regs.flatMap((r) => String(r.genericName ?? "").split(/[()\/,+]|\bplus\b|\band\b|–/).map((x) => x.trim()).filter((x) => x.length >= 4));
  const issues = lintManagementSequence(out, { acute: !!patch.acute, drugNames });
  const warnings = [];
  const allBadges = out.flatMap((s) => [...s.actions, ...(s.branches ?? []).flatMap((b) => b.actions)]).flatMap(extractMedicationBadges);
  const supplementedText = (patch.supplemented ?? []).join(" ").toLowerCase();
  for (const b of allBadges) {
    const first = b.drug.toLowerCase().split(/[\s(–-]/)[0];
    const reg = regs.filter((r) => String(r.genericName).toLowerCase().includes(first));
    const generic = ["oxygen", "sodium", "glucose"].includes(first);
    if (!reg.length && !generic && !supplementedText.includes(first)) warnings.push(`badge drug "${b.drug}" not in medicine table and not in supplemented[]`);
    else if (reg.length) {
      const pool = reg.map((r) => `${r.dose} ${r.frequency} ${r.route} ${r.duration}`).join(" ");
      const missing = nums(b.dose).filter((n) => !pool.includes(n));
      if (missing.length && !supplementedText.includes(first)) warnings.push(`badge "${b.drug}" dose figure(s) ${missing.join(", ")} not found in medicine table`);
    }
  }
  const errors = issues.filter((i) => i.severity === "error");
  const warns = issues.filter((i) => i.severity === "warn");
  console.log(`${errors.length ? "✗" : "✓"} #${entry.no} ${rec.title} — ${allBadges.length} badges, ${errors.length} errors, ${warns.length} exclusion warnings, ${warnings.length} dose warnings`);
  errors.forEach((i) => console.log(`    ERROR ${i.where}: ${i.message}${i.text ? "\n      > " + i.text.slice(0, 160) : ""}`));
  warns.forEach((i) => console.log(`    WARN ${i.where}: ${i.message}\n      > ${(i.text ?? "").slice(0, 160)}`));
  warnings.forEach((w) => console.log(`    DOSE ${w}`));
  if (errors.length) { failures++; continue; }

  // In-place edit of the current version (owner instruction, 26 Oct 2026): version, status and review status stay as they are.
  rec.evidenceAudit ??= { checkedOn: TODAY, status: "incomplete", scope: "", findings: [], unverifiedSections: [] };
  rec.evidenceAudit.findings = [...(rec.evidenceAudit.findings ?? [])];
  rec.evidenceAudit.unverifiedSections = [...(rec.evidenceAudit.unverifiedSections ?? [])];
  rec.evidenceAudit.findings.push(`Management sequence reformatted on ${TODAY}: first step is an ABCDE survey where the topic is acute; every drug mention is a medication badge (drug, dose, route, frequency, duration) copied from this topic's medicine table; side-effect, contraindication and dose-adjustment wording was removed from the sequence (it stays in the medicine table). No other clinical content was changed.`);
  if (used.size) rec.evidenceAudit.findings.push(MACRO_NOTE);
  for (const s of patch.supplemented ?? []) rec.evidenceAudit.findings.push(`[SUPPLEMENTED - EXTERNAL] ${s}`);
  rec.evidenceAudit.unverifiedSections.push("Management sequence reformat (26 Oct 2026): badge doses were matched to the medicine table by wording, not re-opened against the cited source pages; ABCDE content is standard resuscitation guidance. A clinician must confirm before approval.");

  if (!dry) {
    const fresh = JSON.parse(fs.readFileSync(entry.file, "utf8"));
    if (entry.isArray) fresh[entry.index] = rec; else Object.assign(fresh, rec);
    fs.writeFileSync(entry.file, JSON.stringify(fresh, null, 2) + "\n");
  }
}
console.log(failures ? `\n${failures} topic(s) failed; fix the patch and re-run.` : "\nAll patches applied.");
process.exit(failures ? 1 : 0);
