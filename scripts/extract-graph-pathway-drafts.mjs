#!/usr/bin/env node
// Extract source-grounded graph drafts and save through the tenant-checked RPC.
// Uses a signed-in user's access token; never use a Supabase service-role key.
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const env = (name, optional = false) => {
  const value = process.env[name]?.trim();
  if (!value && !optional) throw new Error(`Set ${name} before running the worker.`);
  return value;
};
const supabaseUrl = env("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
const anonKey = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const accessToken = env("SUPABASE_ACCESS_TOKEN");
const organizationId = env("ORGANIZATION_ID");
const openAiKey = env("OPENAI_API_KEY");
const openAiModel = env("OPENAI_MODEL", true) || "gpt-4.1-mini";
const masterList = env("MASTER_DISEASE_LIST", true) || join(root, "data/clinical-branches/master-disease-list.csv");
const ncbiEmail = env("NCBI_EMAIL", true);
const ncbiApiKey = env("NCBI_API_KEY", true);
const ncbiTool = env("NCBI_TOOL", true) || "marifa_graph_pathway_worker";
const pauseMs = Number(env("REQUEST_PAUSE_MS", true) || 350);
const args = process.argv.slice(2);
const limitIndex = args.indexOf("--limit");
const requestedLimit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : 1;
if (!Number.isInteger(requestedLimit) || requestedLimit < 1) throw new Error("--limit must be a positive integer.");
if (limitIndex < 0 && !args.includes("--all")) {
  console.log("Default is one disease row. Use --limit N or --all to expand the run.");
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"' && text[i + 1] === '"' && quoted) { cell += '"'; i += 1; }
    else if (c === '"') quoted = !quoted;
    else if (c === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell); cell = "";
      if (row.some((value) => value.length)) rows.push(row);
      row = [];
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [headers, ...data] = rows;
  if (!headers?.includes("condition")) throw new Error("Master disease list must have a condition column.");
  return data.map((cells) => Object.fromEntries(headers.map((key, i) => [key, cells[i] ?? ""])));
}

async function api(path, { method = "GET", body, range } = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(range ? { Range: range } : {}),
      ...(method === "POST" ? { Prefer: "return=representation" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase ${method} ${path} failed (${response.status}): ${text.slice(0, 1200)}`);
  return text ? JSON.parse(text) : null;
}

async function ncbi(db, endpoint, params) {
  const query = new URLSearchParams({ ...params, db, retmode: "xml", tool: ncbiTool });
  if (ncbiEmail) query.set("email", ncbiEmail);
  if (ncbiApiKey) query.set("api_key", ncbiApiKey);
  const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/${endpoint}?${query}`, {
    headers: { "User-Agent": `${ncbiTool}/1.0 (${ncbiEmail || "contact not supplied"})` },
  });
  if (!response.ok) throw new Error(`NCBI ${endpoint} failed: ${response.status}`);
  return response.text();
}

const xmlText = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim() : "";
};
const allText = (xml) => xml.replace(/<(?:xref|sup|sub)[^>]*>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();

async function findSource(condition) {
  const searches = [
    ["pmc", `("${condition}"[Title/Abstract]) AND (guideline[Title/Abstract] OR practice guideline[Title/Abstract] OR StatPearls[Title])`],
    ["books", `"${condition}" AND StatPearls`],
    ["pmc", `"${condition}"[Title/Abstract] AND (diagnosis OR management OR treatment)`],
  ];
  for (const [db, term] of searches) {
    const result = await ncbi(db, "esearch.fcgi", { term, retmax: "4", sort: "relevance" });
    const ids = [...result.matchAll(/<Id>(\d+)<\/Id>/g)].map((match) => match[1]);
    if (!ids.length) continue;
    const xml = await ncbi(db, "efetch.fcgi", { id: ids.join(",") });
    const record = db === "pmc" ? xml.match(/<article\b[\s\S]*?<\/article>/i)?.[0] : xml.match(/<BookDocument\b[\s\S]*?<\/BookDocument>/i)?.[0];
    if (!record) continue;
    const title = xmlText(record, "article-title") || xmlText(record, "BookTitle") || xmlText(record, "book-title") || `${condition} reference`;
    const pmc = record.match(/<article-id[^>]*pub-id-type=["']pmc["'][^>]*>(PMC?\d+)<\/article-id>/i)?.[1];
    const bookId = xmlText(record, "BookDocumentId") || xmlText(record, "book-id") || ids[0];
    const sourceId = pmc || `NBK${bookId.replace(/^NBK/i, "")}`;
    const url = pmc ? `https://pmc.ncbi.nlm.nih.gov/articles/${pmc}/` : `https://www.ncbi.nlm.nih.gov/books/${sourceId}/`;
    const journal = xmlText(record, "journal-title") || (db === "books" ? "NCBI Bookshelf / StatPearls" : "PubMed Central");
    const sections = [...record.matchAll(/<(?:sec|BookPart)[^>]*>([\s\S]*?)<\/(?:sec|BookPart)>/gi)].map((m) => allText(m[1])).filter((s) => s.length > 80);
    const body = sections.length ? sections.join("\n\n").slice(0, 50000) : allText(record).slice(0, 50000);
    if (body.length > 150) return { id: sourceId, title, url, journal, locator: "Retrieved full-text record; specific section must be confirmed by clinical reviewer", text: body };
  }
  return null;
}

const nodeSchema = {
  type: "object", additionalProperties: false,
  required: ["id", "type", "title", "detail", "referenceIds"],
  properties: {
    id: { type: "string" },
    type: { type: "string", enum: ["start", "assessment", "decision", "action", "escalation", "end"] },
    title: { type: "string" }, detail: { type: "string" },
    referenceIds: { type: "array", items: { type: "string" } },
  },
};
const graphSchema = {
  type: "object", additionalProperties: false, required: ["title", "nodes", "transitions"],
  properties: {
    title: { type: "string" }, nodes: { type: "array", items: nodeSchema },
    transitions: { type: "array", items: {
      type: "object", additionalProperties: false, required: ["from", "to", "label"],
      properties: { from: { type: "string" }, to: { type: "string" }, label: { type: "string" } },
    } },
  },
};

function validatePathway(pathway, sourceId) {
  const errors = [];
  const ids = new Set(pathway.nodes.map((n) => n.id));
  const starts = pathway.nodes.filter((n) => n.type === "start");
  if (ids.size !== pathway.nodes.length) errors.push("duplicate node id");
  if (pathway.nodes.length < 2) errors.push("at least two nodes are required");
  if (starts.length !== 1) errors.push("exactly one start node is required");
  if (pathway.nodes.some((n) => !n.title.trim() || !n.detail.trim() || !n.referenceIds.includes(sourceId))) errors.push("every node needs text and the real source UUID");
  for (const edge of pathway.transitions) if (!ids.has(edge.from) || !ids.has(edge.to)) errors.push(`invalid transition ${edge.from} -> ${edge.to}`);
  if (starts.length === 1) {
    const visited = new Set(), active = new Set();
    const visit = (id) => {
      if (active.has(id)) { errors.push(`cycle at ${id}`); return; }
      if (visited.has(id)) return;
      visited.add(id); active.add(id);
      pathway.transitions.filter((edge) => edge.from === id).forEach((edge) => visit(edge.to));
      active.delete(id);
    };
    visit(starts[0].id);
    if (pathway.nodes.some((n) => !visited.has(n.id))) errors.push("unreachable node");
  }
  if (!pathway.transitions.length && pathway.nodes.length > 1) errors.push("graph has no transitions");
  if (errors.length) throw new Error(`validatePathway rejected model output: ${[...new Set(errors)].join("; ")}`);
}

async function extractGraph(condition, source) {
  const sourceId = randomUUID();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${openAiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: openAiModel,
      input: [
        { role: "system", content: "Extract an UNVERIFIED clinician-review draft from the supplied clinical text. Output only the required graph JSON. Never invent or generalize clinical actions, thresholds, timing, doses, or branches absent from the text. Use concise source-faithful steps. Ensure one start node, a connected acyclic graph, no unreachable nodes, and one or more end nodes when supported. Include the supplied source UUID in referenceIds for every node. Preserve conditionality and limitations. This is not approved clinical guidance." },
        { role: "user", content: `Disease: ${condition}\nSource title: ${source.title}\nSource URL: ${source.url}\nSource UUID to cite in every node: ${sourceId}\nFull text:\n${source.text}` },
      ],
      text: { format: { type: "json_schema", name: "clinical_pathway_graph", strict: true, schema: graphSchema } },
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`OpenAI failed (${response.status}): ${JSON.stringify(payload).slice(0, 1200)}`);
  const text = payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
  if (!text) throw new Error("OpenAI returned no structured graph output.");
  const graph = JSON.parse(text);
  validatePathway(graph, sourceId);
  return { graph, sourceId };
}

const topics = [];
for (let offset = 0; ; offset += 1000) {
  const page = await api(`disease_topics?select=id,name_en,name_ar,organization_id,slug,aliases&order=id&limit=1000&offset=${offset}`, { range: `${offset}-${offset + 999}` });
  topics.push(...page);
  if (page.length < 1000) break;
}
const organizationSettings = await api(`organization_settings?select=organization_id,locale,timezone&organization_id=eq.${organizationId}`);
if (!organizationSettings?.length) throw new Error("No organization_settings row is visible for ORGANIZATION_ID; refusing to write drafts.");
const master = parseCsv(await readFile(masterList, "utf8"));
const maxRows = args.includes("--all") ? master.length : Math.min(requestedLimit, master.length);
const processed = new Set();
let saved = 0, skipped = 0, failed = 0;

for (const row of master.slice(0, maxRows)) {
  const condition = row.condition?.trim();
  console.log(`Processing disease master row: ${condition || "<empty>"}`);
  if (!condition) { skipped += 1; continue; }
  const matches = topics.filter((topic) => topic.name_en.trim().toLocaleLowerCase("en") === condition.toLocaleLowerCase("en")
    || (topic.aliases ?? []).some?.((alias) => alias.trim().toLocaleLowerCase("en") === condition.toLocaleLowerCase("en")));
  if (matches.length !== 1) { console.warn(`Skip ${condition}: expected exactly one visible disease topic, found ${matches.length}.`); skipped += 1; continue; }
  const topic = matches[0];
  if (topic.organization_id && topic.organization_id !== organizationId) { console.warn(`Skip ${condition}: topic belongs to another organization.`); skipped += 1; continue; }
  if (processed.has(topic.id)) { skipped += 1; continue; }
  processed.add(topic.id);
  try {
    const source = await findSource(condition);
    if (!source) throw new Error("NCBI PMC and Bookshelf returned no usable full text.");
    const { graph, sourceId } = await extractGraph(condition, source);
    const result = await api("rpc/save_extracted_graph_pathway", {
      method: "POST",
      body: {
        p_organization_id: organizationId, p_topic_id: topic.id, p_title: graph.title,
        p_source_id: sourceId, p_source_title: source.title, p_source_url: source.url,
        p_source_edition: source.id, p_source_locator: source.locator,
        p_nodes: graph.nodes, p_transitions: graph.transitions,
      },
    });
    console.log(`Saved unverified draft for ${condition}: ${JSON.stringify(result)}`);
    saved += 1;
  } catch (error) {
    console.error(`Failed ${condition}: ${error instanceof Error ? error.message : String(error)}`);
    failed += 1;
  }
  if (pauseMs > 0) await new Promise((resolve) => setTimeout(resolve, pauseMs));
}
console.log(`Finished: ${saved} saved as drafts, ${skipped} skipped, ${failed} failed. No pathway is approved by this worker.`);
if (failed) process.exitCode = 1;
