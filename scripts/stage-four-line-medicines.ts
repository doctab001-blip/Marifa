/**
 * Adds the four standard medicine lines (Paediatric, Penicillin allergy, CKD, CLD) to every regimen
 * of the topics named in a batch patch, as NEW non-current under_review versions.
 * It never updates a current row, never publishes and never asserts clinical approval.
 *
 * Usage:
 *   npx tsx scripts/stage-four-line-medicines.ts <patch.json>            # dry run against current Supabase versions
 *   npx tsx scripts/stage-four-line-medicines.ts <patch.json> --apply    # insert under_review rows
 *   npx tsx scripts/stage-four-line-medicines.ts <patch.json> --local <content.json>  # dry run on a local array
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY (never printed).
 */
import fs from "node:fs";
import { DiseaseDetailSchema } from "../lib/validations/disease";

type Drug = { pattern: string; class: "penicillin" | "cephalosporin" | "carbapenem" | "monobactam" | "other" | "nonabx"; ckd: string; cld: string };
type Patch = {
  version: string; lastReviewed: string; noteAppend: string; prefixes: string[];
  paediatricRowPattern: string; paediatricRowText: string; drugs: Drug[];
  topics: Record<string, { paediatric: string; allergyAlternative: string }>;
};
type Regimen = { genericName: string; patientGroup: string; adjustments: string[] } & Record<string, unknown>;
type Content = Record<string, unknown> & { id: string; title: string; version: string; medicationPlan?: { regimens: Regimen[]; note: string } };

const ALLERGY: Record<Drug["class"], (alt: string) => string> = {
  penicillin: (alt) => `Contraindicated in penicillin allergy. Alternative: ${alt}`,
  cephalosporin: (alt) => `Sources differ: the BNF advises avoiding it only after anaphylaxis or another immediate reaction to a penicillin (or with any cephalosporin allergy) and otherwise allows use with monitoring; some product information (for example ceftriaxone) lists any penicillin hypersensitivity as a contraindication. Alternative: ${alt}`,
  carbapenem: (alt) => `Cross-reactivity with penicillin is under 1%: may be used in non-severe penicillin allergy; after penicillin anaphylaxis give only with specialist advice. Alternative: ${alt}`,
  monobactam: () => "No cross-reactivity with penicillins; avoid only with a ceftazidime allergy (shared side chain).",
  other: () => "Not a beta-lactam — suitable in penicillin allergy.",
  nonabx: () => "Not an antibiotic — penicillin allergy does not affect this medicine.",
};
const PRIORITY: Drug["class"][] = ["penicillin", "cephalosporin", "carbapenem", "monobactam", "other", "nonabx"];
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function fourLines(regimen: Regimen, topic: Patch["topics"][string], patch: Patch): string[] {
  const hits = patch.drugs
    .map((drug) => ({ drug, match: regimen.genericName.match(new RegExp(drug.pattern, "i")) }))
    .filter((hit) => hit.match);
  if (!hits.length) throw new Error(`No drug entry matches "${regimen.genericName}"`);
  const join = (key: "ckd" | "cld") => {
    const parts = hits.map(({ drug, match }) => ({ name: cap(match![0].trim()), text: drug[key] }));
    const unique = [...new Set(parts.map((part) => part.text))];
    return unique.length === 1 ? unique[0] : parts.map((part) => `${part.name}: ${part.text}`).join(" ");
  };
  const cls = PRIORITY.find((c) => hits.some((hit) => hit.drug.class === c))!;
  const paediatric = new RegExp(patch.paediatricRowPattern, "i").test(regimen.patientGroup) ? patch.paediatricRowText : topic.paediatric;
  return [`Paediatric: ${paediatric}`, `Penicillin allergy: ${ALLERGY[cls](topic.allergyAlternative)}`, `CKD: ${join("ckd")}`, `CLD: ${join("cld")}`];
}

export function applyPatch(current: Content, patch: Patch): Content {
  const topic = patch.topics[current.title];
  if (!topic) throw new Error(`${current.title}: not in this batch`);
  if (!current.medicationPlan?.regimens.length) throw new Error(`${current.title}: no regimens`);
  const content = structuredClone(current);
  for (const regimen of content.medicationPlan!.regimens) {
    const kept = regimen.adjustments.filter((line) => !patch.prefixes.some((prefix) => line.startsWith(prefix)));
    regimen.adjustments = [...kept, ...fourLines(regimen, topic, patch)];
  }
  if (!content.medicationPlan!.note.includes(patch.noteAppend)) content.medicationPlan!.note = `${content.medicationPlan!.note} ${patch.noteAppend}`;
  Object.assign(content, { version: patch.version, status: "under_review", clinicalReviewStatus: "pending", lastReviewed: patch.lastReviewed });
  return DiseaseDetailSchema.parse(content) as Content;
}

const [patchPath, ...flags] = process.argv.slice(2);
if (!patchPath) throw new Error("Usage: tsx scripts/stage-four-line-medicines.ts <patch.json> [--apply | --local <content.json>]");
const patch = JSON.parse(fs.readFileSync(patchPath, "utf8")) as Patch;
const titles = Object.keys(patch.topics);

if (flags[0] === "--local") {
  const local = JSON.parse(fs.readFileSync(flags[1], "utf8")) as Content[];
  let regimens = 0;
  for (const item of local) { const out = applyPatch(item, patch); regimens += out.medicationPlan!.regimens.length; }
  console.log(`LOCAL VALID: ${local.length} topics, ${regimens} regimens, each with the four lines.`);
  process.exit(0);
}

const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`;
const key = process.env.SUPABASE_SECRET_KEY;
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
async function rest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(base + path, { method, headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) throw new Error(`${method} ${path.split("?")[0]} -> ${response.status} ${(await response.text()).slice(0, 300)}`);
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

const apply = flags.includes("--apply");
type Row = Record<string, unknown> & { guideline_id: string; version: string; content: Content };
const currentRows = await rest<Row[]>("GET", "guideline_versions?select=*&is_current=eq.true");
const failures: string[] = [];
let staged = 0, valid = 0;
for (const title of titles) {
  const matches = currentRows.filter((row) => row.content?.title === title);
  if (matches.length !== 1) { failures.push(`${title}: ${matches.length} current versions found`); continue; }
  const source = matches[0];
  let content: Content;
  try { content = applyPatch(source.content, patch); } catch (error) { failures.push(`${title}: ${(error as Error).message}`); continue; }
  valid++;
  if (!apply) continue;
  const existing = await rest<unknown[]>("GET", `guideline_versions?select=id&guideline_id=eq.${source.guideline_id}&version=eq.${encodeURIComponent(patch.version)}`);
  if (existing.length) { console.log(`SKIP ${title}: ${patch.version} already exists`); continue; }
  await rest("POST", "guideline_versions", {
    guideline_id: source.guideline_id, version: patch.version, version_number: patch.version,
    status: "under_review", is_current: false, content,
    source_title: source.source_title, issuing_organization: source.issuing_organization, source_url: source.source_url,
    jurisdiction: source.jurisdiction, last_verified_date: patch.lastReviewed, review_date: source.review_date,
    created_by: source.created_by, approved_by: null, approved_at: null, published_at: null,
    change_summary: `Four-line medicine safety batch (${patch.version}) built on ${source.version}: Paediatric, Penicillin allergy, CKD and CLD lines added to every regimen. Current/published content and history preserved. Clinical review pending; no approval or publication asserted.`,
  });
  staged++;
  console.log(`STAGED ${title}: ${patch.version} (under_review, non-current, pending; from ${source.version})`);
}
if (failures.length) console.log(`NOT STAGED (${failures.length}):\n  ${failures.join("\n  ")}`);
console.log(apply ? `Done: ${staged} staged.` : `DRY RUN: ${valid}/${titles.length} topics valid against current versions; rerun with --apply to insert.`);
