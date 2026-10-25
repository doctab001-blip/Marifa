/**
 * Run both authoring gates on a topic payload file (one topic or an array):
 *   npx tsx scripts/audit-topic-depth.ts <payload.json>
 * Exits non-zero when any topic fails the authoring audit or the depth standard.
 */
import fs from "node:fs";
import { auditTopicContent } from "../lib/clinical-authoring-audit";
import { auditTopicDepth } from "../lib/clinical-depth-standard";

const file = process.argv[2];
if (!file) throw new Error("Usage: tsx scripts/audit-topic-depth.ts <payload.json>");
const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as unknown;
const items = Array.isArray(parsed) ? parsed : [parsed];
let failed = 0;
for (const item of items) {
  const title = (item as { title?: string }).title ?? "(untitled)";
  const audit = auditTopicContent(item);
  const depth = auditTopicDepth(item);
  const ok = audit.publishable && depth.passed;
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  authoring ${audit.score}%  depth ${depth.passed ? "met" : `${depth.failures.length} gaps`}  ${depth.metrics.words} words  ${title}`);
  [...audit.failures, ...depth.failures].forEach((failure) => console.log(`   - ${failure}`));
}
if (failed) process.exitCode = 1;
