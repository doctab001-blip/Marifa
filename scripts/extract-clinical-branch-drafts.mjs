import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const masterListPath = join(root, "data/clinical-branches/master-disease-list.csv");
const outputDirectory = join(root, "data/clinical-branch-drafts");
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["conditionName", "clinicalActionPlan", "diagnosticEvaluation", "interventionAndManagement", "pros", "cons", "disposition"],
  properties: {
    conditionName: { type: "string" },
    clinicalActionPlan: { type: "string" },
    diagnosticEvaluation: {
      type: "object", additionalProperties: false,
      required: ["primaryAssessments", "differentialElimination"],
      properties: { primaryAssessments: { type: "array", items: { type: "string" } }, differentialElimination: { type: "array", items: { type: "string" } } },
    },
    interventionAndManagement: {
      type: "object", additionalProperties: false,
      required: ["firstLineTherapy", "supportiveMeasures"],
      properties: { firstLineTherapy: { type: "array", items: { type: "string" } }, supportiveMeasures: { type: "array", items: { type: "string" } } },
    },
    pros: { type: "array", items: { type: "string" } },
    cons: { type: "array", items: { type: "string" } },
    disposition: { type: "string" },
  },
};

const systemPrompt = `You are a clinical evidence extraction assistant preparing an UNREVIEWED DRAFT for clinician review. Extract only what the official source material supports. Do not turn conditional recommendations into universal mandates. Preserve contraindications, patient-group limits, uncertainty, recommendation class/level when stated, and jurisdictional scope. Never invent doses, thresholds, timelines, tests, discharge criteria, or follow-up. When a requested detail is absent or ambiguous, say "Not specified in the retrieved source; clinician review required." Include a direct source URL and section/table/figure/page reference in each item where possible. Do not use unsupported paraphrase. This content is not approved for clinical use. Return only a raw JSON object matching the required schema.`;

function parseCsvLine(line) {
  const cells = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"' && quoted) { value += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { cells.push(value); value = ""; }
    else value += character;
  }
  cells.push(value);
  return cells;
}

function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getMessageText(response) {
  const message = response.output?.find((item) => item.type === "message" && item.role === "assistant");
  const text = message?.content?.find((part) => part.type === "output_text")?.text;
  if (!text) throw new Error("The model response did not contain a JSON text message.");
  return text;
}

const lines = (await readFile(masterListPath, "utf8")).trim().split(/\r?\n/);
const headers = parseCsvLine(lines.shift());
const conditions = lines.map((line) => Object.fromEntries(parseCsvLine(line).map((value, index) => [headers[index], value])));
const args = process.argv.slice(2);
const requestedCondition = args.includes("--condition") ? args[args.indexOf("--condition") + 1] : null;
const limitIndex = args.indexOf("--limit");
const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : null;
let selectedConditions = conditions;
if (requestedCondition) {
  const requestedSlug = slugify(requestedCondition);
  selectedConditions = conditions.filter(({ condition }) => condition === requestedCondition || slugify(condition) === requestedSlug);
  if (selectedConditions.length === 0) throw new Error(`No condition matched: ${requestedCondition}`);
} else if (limit !== null) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error("--limit must be a positive integer.");
  selectedConditions = conditions.slice(0, limit);
} else if (!args.includes("--all")) {
  console.log(`Master list contains ${conditions.length} conditions. Choose --condition <name>, --limit <count>, or --all to make API calls.`);
  process.exit(0);
}

if (!apiKey) throw new Error("Set OPENAI_API_KEY before running the extraction script.");
await mkdir(outputDirectory, { recursive: true });

for (const { condition, clinical_specialties: specialties, source_queries: sourceQueries, source_domains: sourceDomains } of selectedConditions) {
  const slug = slugify(condition);
  const draftPath = join(outputDirectory, `${slug}.json`);
  const sourcePath = join(outputDirectory, `${slug}.sources.json`);
  const existingOutputs = await Promise.all([draftPath, sourcePath].map((path) => access(path).then(() => true, () => false)));
  if (existingOutputs.some(Boolean)) {
    console.log(`Output already exists; leaving it unchanged: ${slug}`);
    continue;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      tools: [{ type: "web_search", filters: { allowed_domains: sourceDomains.split("|").filter(Boolean) }, search_context_size: "high" }],
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Condition: ${condition}\nSpecialties: ${specialties.split("|").join(", ")}\nOfficial source search queries: ${sourceQueries.split("|").join("; ")}\nUse only the official domains passed in the web search filter. Distinguish source recommendations that conflict or cover different populations. Return the specified JSON object only.` },
      ],
      text: { format: { type: "json_schema", name: "clinical_branch_draft", strict: true, schema } },
    }),
  });
  if (!response.ok) throw new Error(`OpenAI API failed for ${condition}: ${response.status} ${await response.text()}`);

  const payload = await response.json();
  const draftText = getMessageText(payload);
  const draft = JSON.parse(draftText);
  if (draft.conditionName !== condition) throw new Error(`Condition mismatch for ${condition}; refusing to save response.`);

  const citations = payload.output
    ?.filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .flatMap((part) => part.annotations ?? [])
    .filter((annotation) => annotation.type === "url_citation")
    .map(({ url, title }) => ({ url, title })) ?? [];
  await writeFile(draftPath, `${JSON.stringify(draft, null, 2)}\n`, { flag: "wx" });
  await writeFile(sourcePath, `${JSON.stringify({
    condition,
    specialties: specialties.split("|"),
    reviewStatus: "unreviewed-draft",
    clinicalUseApproved: false,
    generatedAt: new Date().toISOString(),
    model,
    searchQueries: sourceQueries.split("|"),
    citations,
  }, null, 2)}\n`, { flag: "wx" });
  console.log(`Saved unreviewed draft: ${slug}`);
}
