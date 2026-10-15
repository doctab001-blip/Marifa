import fs from "node:fs";
import path from "node:path";
import { DiseaseDetailSchema, type DiseaseDetail } from "../lib/validations/disease";
import { medicationSafetyGaps, prepareMedicationSafetyRevision } from "../lib/medication-safety-review";

const sourceDir = path.resolve("data/emergency-versions");
const outputDir = path.resolve("outputs/medication-safety-2026-10-15");
const requested = new Set([
  "Acute Anaphylaxis", "Acute Appendicitis", "Acute Exacerbation of COPD", "Acute Heart Failure and Pulmonary Oedema",
  "Acute Ischemic Stroke", "Acute Kidney Injury", "Acute Pancreatitis", "Acute Poisoning and Overdose",
  "Acute Severe Asthma Exacerbation", "Acute Upper Gastrointestinal Bleeding", "Community-Acquired Pneumonia",
  "Deep-Vein Thrombosis and Pulmonary Embolism", "Diabetic Ketoacidosis", "Hyperosmolar Hyperglycaemic State",
  "Maternal Sepsis in Pregnancy or Postpartum", "Postpartum Haemorrhage Response", "Preterm Labour and Threatened Preterm Birth",
  "Sepsis and Septic Shock", "Severe Hypoglycaemia",
]);

const preferredFiles: Record<string, string> = {
  "Acute Kidney Injury": "aki.emergency-2026-10-12-v2.json",
  "Diabetic Ketoacidosis": "../teaching-demonstrations/diabetic-ketoacidosis.emergency-2026-10-12-v1.json",
};

function readTopics(): DiseaseDetail[] {
  const candidates = fs.readdirSync(sourceDir).filter((name) => name.endsWith(".json"));
  const found = new Map<string, DiseaseDetail>();
  for (const name of candidates) {
    const parsed = DiseaseDetailSchema.safeParse(JSON.parse(fs.readFileSync(path.join(sourceDir, name), "utf8")));
    if (!parsed.success || !requested.has(parsed.data.title)) continue;
    if (!found.has(parsed.data.title) || preferredFiles[parsed.data.title] === name) found.set(parsed.data.title, parsed.data);
  }
  for (const [title, name] of Object.entries(preferredFiles)) {
    const parsed = DiseaseDetailSchema.parse(JSON.parse(fs.readFileSync(path.resolve(sourceDir, name), "utf8")));
    found.set(title, parsed);
  }
  const missing = [...requested].filter((title) => !found.has(title));
  if (missing.length) throw new Error(`Missing source topics: ${missing.join(", ")}`);
  return [...requested].map((title) => found.get(title)!);
}

const topics = readTopics();
const candidates = topics.map(prepareMedicationSafetyRevision);
const gaps = candidates.flatMap(medicationSafetyGaps);
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "audit.json"), `${JSON.stringify({ checkedOn: "2026-10-15", topicCount: candidates.length, medicineCount: candidates.reduce((n, item) => n + (item.medicationPlan?.regimens.length ?? 0), 0), eligibleForStaging: gaps.length === 0, gaps }, null, 2)}\n`);
if (gaps.length) {
  fs.rmSync(path.join(outputDir, "payload.json"), { force: true });
  console.error(`Medication-safety staging blocked: ${gaps.length} unresolved safety fields. See ${path.join(outputDir, "audit.json")}`);
  process.exitCode = 2;
} else {
  fs.writeFileSync(path.join(outputDir, "payload.json"), `${JSON.stringify(candidates, null, 2)}\n`);
  console.log(`Prepared ${candidates.length} additive under-review payloads in ${path.join(outputDir, "payload.json")}`);
}
