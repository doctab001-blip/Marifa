// Prints a compact work packet for topics start..start+count-1 from .claude-tmp/mseq/index.json
// Usage: node scripts/mseq/export.mjs <start-no> <count>
import fs from "node:fs";
const index = JSON.parse(fs.readFileSync(".claude-tmp/mseq/index.json", "utf8"));
const [start, count] = [Number(process.argv[2] ?? 1), Number(process.argv[3] ?? 5)];
const cut = (s, n = 120) => { s = String(s ?? "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
for (const entry of index.filter((e) => e.no >= start && e.no < start + count)) {
  const data = JSON.parse(fs.readFileSync(entry.file, "utf8"));
  const rec = entry.isArray ? data[entry.index] : data;
  console.log(`\n=== #${entry.no} | ${rec.id} | ${rec.title} | ${rec.pillar} | ${entry.file.split("/").slice(1).join("/")}`);
  const regs = rec.medicationPlan?.regimens ?? [];
  console.log(`MEDS (${regs.length}):`);
  for (const r of regs) console.log(`  - ${cut(r.genericName, 40)} | ${cut(r.dose, 220)} | ${cut(r.route, 40)} | ${cut(r.frequency, 80)} | ${cut(r.duration, 100)}${r.branch ? " | br: " + cut(r.branch, 30) : ""}`);
  console.log("STEPS:");
  rec.clinicalManagement.forEach((s, i) => {
    console.log(`S${i + 1} [${s.id}] ${s.title} (${cut(s.timeframe, 50)})`);
    s.actions.forEach((a, j) => console.log(`  a${j}: ${a}`));
    (s.branches ?? []).forEach((b, k) => { console.log(`  b${k} IF ${b.condition}`); b.actions.forEach((a, j) => console.log(`    b${k}.a${j}: ${a}`)); });
  });
}
