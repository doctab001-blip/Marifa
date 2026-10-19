/**
 * Adds the Emergency Department protocol outlines (data/local-protocols/ed-protocols.ts) to Local Protocols as DRAFTS.
 *
 * Usage:  npx tsx scripts/seed-local-protocols.ts [--dry-run]
 * Env:    NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY (never printed),
 *         MARIFA_TEMPORARY_ADMIN_ORGANIZATION_ID, MARIFA_TEMPORARY_ADMIN_USER_ID  (read from .env.local if not set)
 *
 * Additive and idempotent: a protocol whose title already exists in Local Protocols is skipped, nothing is
 * updated or deleted, and nothing is published. Each protocol is one organization-owned guideline
 * (source_type "local-protocol", status draft) with one draft version holding schema-valid outline content.
 * If the version insert fails, the guideline row just created is removed so no empty topic is left behind.
 */
import { existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { ED_PROTOCOL_OUTLINES } from "@/data/local-protocols/ed-protocols";
import { buildProtocolShell, PROTOCOL_OUTLINE_VERSION } from "@/lib/local-protocol-shell";
import { LOCAL_PROTOCOL_SOURCE_TYPE } from "@/lib/local-protocols";
import { DiseaseDetailSchema } from "@/lib/validations/disease";

function loadEnvFile() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}
loadEnvFile();

const dryRun = process.argv.includes("--dry-run");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const organizationId = process.env.MARIFA_TEMPORARY_ADMIN_ORGANIZATION_ID;
const userId = process.env.MARIFA_TEMPORARY_ADMIN_USER_ID;
if (!url || !key || !organizationId || !userId) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, MARIFA_TEMPORARY_ADMIN_ORGANIZATION_ID and MARIFA_TEMPORARY_ADMIN_USER_ID.");

async function rest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${method} ${path.split("?")[0]} -> ${response.status} ${(await response.text()).slice(0, 300)}`);
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const reviewDate = `${Number(today.slice(0, 4)) + 1}${today.slice(4)}`;

const titles = new Set(ED_PROTOCOL_OUTLINES.map((outline) => outline.title));
if (titles.size !== ED_PROTOCOL_OUTLINES.length) throw new Error("Duplicate protocol titles in the outline list.");

const existing = await rest<Array<{ title: string }>>("GET", `clinical_guidelines?select=title&source_type=eq.${LOCAL_PROTOCOL_SOURCE_TYPE}&organization_id=eq.${organizationId}&limit=1000`);
const existingTitles = new Set(existing.map((row) => row.title));

let created = 0;
let skipped = 0;
for (const outline of ED_PROTOCOL_OUTLINES) {
  if (existingTitles.has(outline.title)) { skipped += 1; continue; }
  const id = randomUUID();
  const content = DiseaseDetailSchema.parse(buildProtocolShell(outline, id, today));
  if (dryRun) { console.log(`[dry run] would create: ${outline.title}`); created += 1; continue; }

  await rest("POST", "clinical_guidelines", {
    id, organization_id: organizationId, title: outline.title, specialty: outline.specialty,
    source_type: LOCAL_PROTOCOL_SOURCE_TYPE, is_shared_reference: false, status: "draft",
  });
  try {
    await rest("POST", "guideline_versions", {
      guideline_id: id, version: PROTOCOL_OUTLINE_VERSION, version_number: PROTOCOL_OUTLINE_VERSION,
      status: "draft", is_current: true, content,
      change_summary: "Outline created from the Emergency Department protocol topic list. Clinical content not yet written.",
      source_title: "Topic outline, sources to be verified", issuing_organization: "Marifa",
      jurisdiction: "Saudi Arabia (local adaptation of NHS and US emergency guidance)",
      review_date: reviewDate, created_by: userId,
    });
  } catch (error) {
    await rest("DELETE", `clinical_guidelines?id=eq.${id}&source_type=eq.${LOCAL_PROTOCOL_SOURCE_TYPE}`);
    throw error;
  }
  created += 1;
  console.log(`created: ${outline.title}`);
}
console.log(`${dryRun ? "Dry run: " : ""}${created} created, ${skipped} already present, ${ED_PROTOCOL_OUTLINES.length} in list.`);
