import fs from "node:fs";
import path from "node:path";
import { ED_PROTOCOL_OUTLINES } from "@/data/local-protocols/ed-protocols";
import { buildProtocolShell } from "@/lib/local-protocol-shell";
import { parsePastedTopic } from "@/lib/topic-paste";
import { auditTopicContent } from "@/lib/clinical-authoring-audit";
import { DiseaseDetailSchema } from "@/lib/validations/disease";

const DATE = "2026-10-21";
const VERSION = "authoring-standard-2026-10-21-endocrine-electrolyte-v1";
const OUTPUT_DIR = path.resolve("data/emergency-versions");

const batch = [
  ["bbf33f47-4dcd-46fa-9635-eda11c403c6f", "Diabetic Ketoacidosis (DKA) in Adults", "dka"],
  ["fa7955e6-5267-4970-b26f-b25698fc269b", "Hyperosmolar Hyperglycaemic State (HHS)", "hhs"],
  ["05f4d24c-6464-4f14-8965-f95ac195a230", "Hypoglycaemia in Adults", "hypoglycaemia"],
  ["4f2b34a6-8a0a-485e-a26b-d2358d71e5e1", "Adrenal Crisis", "adrenal-crisis"],
  ["452fc3c4-16d8-40a0-bda2-9fcf494d38bf", "Thyroid Storm", "thyroid-storm"],
  ["ab77e661-9487-4d04-83cb-07646983efc1", "Hypercalcaemia (Acute, Including Malignancy-Associated)", "hypercalcaemia"],
  ["7b6766f7-057c-4523-980f-4bda0de687ee", "Hypocalcaemia (Acute)", "hypocalcaemia"],
  ["b05df687-ffa0-4631-9a87-0469951fce04", "Hyperkalaemia", "hyperkalaemia"],
  ["a58168aa-5dcc-4fd4-9c45-920cb3ba5ece", "Hypokalaemia", "hypokalaemia"],
  ["8cf09695-9ae8-47d2-b8f2-24b16cbd2227", "Hyponatraemia", "hyponatraemia"],
] as const;

const jsonOnly = process.argv.includes("--json");
const selectedId = process.argv.find((value) => value.startsWith("--id="))?.slice(5);
const generated: Array<{ slug: string; content: unknown; audit: ReturnType<typeof auditTopicContent> }> = [];

for (const [id, title, slug] of batch) {
  if (selectedId && selectedId !== id) continue;
  const outline = ED_PROTOCOL_OUTLINES.find((candidate) => candidate.title === title);
  if (!outline) throw new Error(`Missing protocol outline: ${title}`);

  const base = buildProtocolShell(outline, id, DATE);
  const file = path.resolve(`data/local-protocols/content/${slug}.md`);
  const raw = fs.readFileSync(file, "utf8");
  const markdown = raw
    .split("\n")
    .filter((line) => !/^\s*(UNVERIFIED|SCOPE):/i.test(line))
    .join("\n");
  const parsed = parsePastedTopic(markdown, base, { today: DATE, useTitleFromPaste: false });
  if (!parsed.content || parsed.parsedCount === 0 || parsed.schemaErrors.length) {
    throw new Error(`${title}: parse failed: ${parsed.schemaErrors.join("; ")}`);
  }

  const unverified = raw
    .split("\n")
    .map((line) => /^\s*UNVERIFIED:\s*(.+)$/i.exec(line)?.[1]?.trim())
    .filter((line): line is string => Boolean(line));
  const scope = raw
    .split("\n")
    .map((line) => /^\s*SCOPE:\s*(.+)$/i.exec(line)?.[1]?.trim())
    .find(Boolean);
  const content = DiseaseDetailSchema.parse({
    ...parsed.content,
    version: VERSION,
    status: "under_review",
    clinicalReviewStatus: "pending",
    lastReviewed: DATE,
    evidenceAudit: {
      ...parsed.content.evidenceAudit,
      checkedOn: DATE,
      status: "incomplete",
      scope: scope ?? parsed.content.evidenceAudit?.scope ?? outline.scope,
      findings: [
        `Full protocol rebuilt from the source dossier opened on ${DATE}; exact source locations are recorded in each investigation and medicine row.`,
        "The original outline remains preserved; this additive version is non-current and pending clinical review.",
      ],
      unverifiedSections: unverified,
      medscapeStatus: "unavailable",
      originalVersionIds: [id],
    },
  });
  const audit = auditTopicContent(content);
  if (!audit.publishable) {
    throw new Error(`${title}: ${audit.score}% and not publishable\n${audit.failures.join("\n")}`);
  }

  const out = path.join(OUTPUT_DIR, `${slug}.${VERSION}.json`);
  fs.writeFileSync(out, `${JSON.stringify(content, null, 2)}\n`);
  generated.push({ slug, content, audit });
  if (!jsonOnly) console.log(`${title}\t${audit.score}%\t${audit.pathwayCompliant ? "pathway-ok" : "pathway-failed"}\t${out}`);
}

if (jsonOnly) {
  if (generated.length !== 1) throw new Error("--json requires exactly one matching --id=<guideline-id>");
  process.stdout.write(JSON.stringify(generated[0].content));
}
