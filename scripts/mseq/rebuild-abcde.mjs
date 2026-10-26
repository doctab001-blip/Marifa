// Rebuilds ONLY the ABCDE first step of already-converted topics, in place, from a patch file.
// Usage: node scripts/mseq/rebuild-abcde.mjs <patch.json>
import fs from "node:fs";
import { buildAbcde, expand } from "./macros.mjs";
import { lintManagementSequence } from "../../lib/management-sequence-format.ts";
const index = new Map(JSON.parse(fs.readFileSync(".claude-tmp/mseq/index.json", "utf8")).map((e) => [e.id, e]));
let bad = 0;
for (const patch of JSON.parse(fs.readFileSync(process.argv[2], "utf8"))) {
  if (!patch.acute) continue;
  const entry = index.get(patch.id);
  const file = JSON.parse(fs.readFileSync(entry.file, "utf8"));
  const rec = entry.isArray ? file[entry.index] : file;
  const at = rec.clinicalManagement.findIndex((s) => s.id === "abcde-concurrent-survey");
  if (at !== 0) { console.log(`✗ #${entry.no} ${rec.title}: no ABCDE step at position 1`); bad++; continue; }
  rec.clinicalManagement[0] = buildAbcde(patch, (t) => expand(t));
  const names = (rec.medicationPlan?.regimens ?? []).flatMap((r) => String(r.genericName ?? "").split(/[()\/,+]|\bplus\b|\band\b|–/).map((x) => x.trim()).filter((x) => x.length >= 4));
  const errors = lintManagementSequence(rec.clinicalManagement, { acute: true, drugNames: names }).filter((i) => i.severity === "error");
  console.log(`${errors.length ? "✗" : "✓"} #${entry.no} ${rec.title}`);
  errors.forEach((i) => console.log(`   ${i.where}: ${i.message}`));
  if (errors.length) { bad++; continue; }
  fs.writeFileSync(entry.file, JSON.stringify(file, null, 2) + "\n");
}
process.exit(bad ? 1 : 0);
