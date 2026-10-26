// Finds the latest stored version of every topic that has a clinicalManagement sequence.
// Usage: node scripts/mseq/index.mjs   (writes .claude-tmp/mseq/index.json)
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SKIP = new Set(["_to_delete", "node_modules", ".git", ".next", ".claude-tmp", "Marifa-learning", "marifa-dx", "management-sequence-2026-10-26"]);

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith(".json")) yield full;
  }
}

export function loadRecords(file) {
  let data;
  try { data = JSON.parse(fs.readFileSync(file, "utf8")); } catch { return []; }
  const list = Array.isArray(data) ? data : [data];
  return list.map((record, index) => ({ record, index, isArray: Array.isArray(data) })).filter(({ record }) => record && typeof record === "object" && Array.isArray(record.clinicalManagement) && record.id);
}

export function buildIndex() {
  const latest = new Map();
  for (const file of walk(path.join(ROOT, "data"))) {
    for (const { record, index, isArray } of loadRecords(file)) {
      const rel = path.relative(ROOT, file);
      const key = record.id;
      const rank = [String(record.lastReviewed ?? ""), rel];
      const current = latest.get(key);
      if (!current || rank[0] > current.rank[0] || (rank[0] === current.rank[0] && rank[1] > current.rank[1])) latest.set(key, { file: rel, index, isArray, rank, version: record.version, title: record.title, pillar: record.pillar });
    }
  }
  return [...latest.entries()].map(([id, v]) => ({ id, file: v.file, index: v.index, isArray: v.isArray, version: v.version, title: v.title, pillar: v.pillar, lastReviewed: v.rank[0] }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const index = buildIndex();
  const order = { "Urgent Care": 0, "Safe Birth": 1, "Palliative Care": 2, "Chronic Care": 3, "Planned Care": 4, "Keep Well": 5 };
  index.sort((a, b) => (order[a.pillar] ?? 9) - (order[b.pillar] ?? 9) || String(a.title).localeCompare(String(b.title)));
  index.forEach((entry, i) => { entry.no = i + 1; });
  fs.mkdirSync(".claude-tmp/mseq", { recursive: true });
  fs.writeFileSync(".claude-tmp/mseq/index.json", JSON.stringify(index, null, 1));
  console.log(`${index.length} topics`);
}
