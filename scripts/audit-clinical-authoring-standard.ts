import { readFile, writeFile } from "node:fs/promises";
import { auditTopicContent } from "../lib/clinical-authoring-audit";

type SnapshotTopic = {
  guideline_id: string;
  title: string;
  version_id: string;
  version: string;
  status: string;
  is_current: boolean;
  content: unknown;
};

type Snapshot = {
  captured_at: string;
  project_ref: string;
  topics: SnapshotTopic[];
};

const [inputPath, outputPath = "outputs/authoring-standard-audit/report.json"] = process.argv.slice(2);
if (!inputPath) throw new Error("Usage: tsx scripts/audit-clinical-authoring-standard.ts <snapshot.json> [report.json]");

const snapshot = JSON.parse(await readFile(inputPath, "utf8")) as Snapshot;
function auditTopic(topic: SnapshotTopic) {
  const { content: _content, ...meta } = topic;
  void _content;
  return { ...meta, ...auditTopicContent(topic.content) };
}

const topics = snapshot.topics.map(auditTopic);
const report = {
  standard: "docs/clinical-topic-authoring-standard.md",
  captured_at: snapshot.captured_at,
  project_ref: snapshot.project_ref,
  disclaimer: "This structural audit cannot prove that a source was opened, that each claim is clinically correct, or that SFDA registration was checked. Those checks must be completed during each topic correction.",
  total: topics.length,
  structurally_compliant: topics.filter((topic) => topic.compliant).length,
  preserved_at_or_above_80_percent: topics.filter((topic) => topic.meetsEightyPercent).map((topic) => topic.title),
  correction_queue: topics.filter((topic) => !topic.meetsEightyPercent).map((topic) => topic.title),
  topics,
};

await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ total: report.total, structurallyCompliant: report.structurally_compliant, corrections: report.correction_queue.length }));
