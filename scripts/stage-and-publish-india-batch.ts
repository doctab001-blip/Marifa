/**
 * Stage AND publish a batch of Marifa India topics into the India Supabase project.
 *
 *   npx tsx --env-file=.env.india.local scripts/stage-and-publish-india-batch.ts <payload.json>           # dry run
 *   npx tsx --env-file=.env.india.local scripts/stage-and-publish-india-batch.ts <payload.json> --apply   # write
 *   add --revise to publish a NEW version of topics whose only authored versions are earlier Marifa India
 *   batch versions ("india-..."); those versions are kept, never edited. Any other authored version still refuses.
 *
 * Refuses to run unless NEXT_PUBLIC_MARIFA_REGION=IN, so India content can never land in the Saudi database.
 * For each topic: schema + authoring audit must be publishable AND the depth standard (lib/clinical-depth-standard.ts)
 * must pass, with no override; an existing guideline must be an empty
 * "Content not yet authored" placeholder (authored work is never overwritten); a new topic gets a new
 * catalogue row. Writes an under_review version, then a "-live" published version made current (the same
 * steps as scripts/publish-if-eligible.ts, under the platform owner's standing authorisation of 12 Oct 2026).
 * clinicalReviewStatus stays "pending" so pages keep their unreviewed notice. Nothing is edited in place.
 */
import fs from "node:fs";
import { DiseaseDetailSchema, type DiseaseDetail } from "../lib/validations/disease";
import { auditTopicContent } from "../lib/clinical-authoring-audit";
import { auditTopicDepth } from "../lib/clinical-depth-standard";

const [payloadPath, ...flags] = process.argv.slice(2);
if (!payloadPath) throw new Error("Usage: tsx scripts/stage-and-publish-india-batch.ts <payload.json> [--apply]");
const apply = flags.includes("--apply");
const revise = flags.includes("--revise");
if ((process.env.NEXT_PUBLIC_MARIFA_REGION ?? "").toUpperCase() !== "IN") throw new Error("Refusing: NEXT_PUBLIC_MARIFA_REGION is not IN. Use --env-file=.env.india.local.");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
const publisher = process.env.MARIFA_PUBLISHER_ID ?? "310a1d7b-646d-4adb-b822-8d79453237cf";

async function rest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${url}/rest/v1/${path}`, { method, headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) throw new Error(`${method} ${path.split("?")[0]} -> ${response.status} ${(await response.text()).slice(0, 300)}`);
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

const PLACEHOLDER = /Content not yet authored/i;
const items = (JSON.parse(fs.readFileSync(payloadPath, "utf8")) as unknown[]).map((item) => DiseaseDetailSchema.parse(item)) as DiseaseDetail[];
console.log(`${apply ? "APPLY" : "DRY RUN"} — ${new URL(url).host} — ${items.length} topics`);

for (const content of items) {
  const label = `${content.title} [${content.id}]`;
  const audit = auditTopicContent(content);
  if (!audit.publishable || content.status !== "under_review" || content.clinicalReviewStatus !== "pending") { console.log(`REFUSED ${label}: audit ${audit.score}% pathway ${audit.pathwayCompliant}; ${audit.failures.slice(0, 2).join(" | ")}`); continue; }
  const depth = auditTopicDepth(content);
  if (!depth.passed) { console.log(`REFUSED ${label}: depth standard ${depth.standard} not met (${depth.failures.length} gaps, ${depth.metrics.words} words); ${depth.failures.slice(0, 3).join(" | ")}`); continue; }
  const [guideline] = await rest<Array<{ id: string; title: string; specialty: string | null; status: string }>>("GET", `clinical_guidelines?select=id,title,specialty,status&id=eq.${content.id}`);
  const versions = guideline ? await rest<Array<{ id: string; version: string; status: string; content: Record<string, unknown> }>>("GET", `guideline_versions?select=id,version,status,content&guideline_id=eq.${content.id}`) : [];
  if (versions.some((row) => row.version === content.version)) { console.log(`SKIP ${label}: ${content.version} already exists`); continue; }
  const authored = versions.filter((row) => !PLACEHOLDER.test(JSON.stringify(row.content?.pathophysiology ?? "")));
  const ownOnly = authored.length > 0 && authored.every((row) => row.version.startsWith("india-"));
  if (authored.length && !(revise && ownOnly)) { console.log(`REFUSED ${label}: already has authored version(s) ${authored.map((row) => row.version).join(", ")} — not overwriting`); continue; }
  const ref = content.teaching?.references?.[0];
  const issuing = content.authority === "ICMR" ? "Indian Council of Medical Research / Department of Health Research" : "Ministry of Health and Family Welfare, Government of India";
  const mode = authored.length ? `revises ${authored.map((row) => row.version).join(", ")}` : guideline ? "fills placeholder" : "new topic";
  if (!apply) { console.log(`VALID ${label}: audit ${audit.score}%, ${mode}; will publish ${content.version}-live`); continue; }

  if (!guideline) await rest("POST", "clinical_guidelines", { id: content.id, title: content.title, specialty: content.specialty, source_type: "official-indian-guideline", is_shared_reference: true, organization_id: null, status: "under_review" });
  else if (guideline.title !== content.title || guideline.specialty !== content.specialty) await rest("PATCH", `clinical_guidelines?id=eq.${content.id}`, { title: content.title, specialty: content.specialty });
  const common = { guideline_id: content.id, source_title: ref?.title ?? content.title, source_url: ref?.url ?? null, issuing_organization: issuing, jurisdiction: "India", last_verified_date: content.lastReviewed, review_date: content.lastReviewed };
  await rest("POST", "guideline_versions", { ...common, version: content.version, version_number: content.version, status: "under_review", is_current: false, content, created_by: publisher,
    change_summary: `India content (${content.version}, ${mode}): sourced from Indian national guidelines, with international guidelines or labels where Indian sources give no dose; verified against source text. Clinical review pending; not clinically approved.` });
  const now = new Date().toISOString(); const live = `${content.version}-live`;
  const [inserted] = await rest<Array<{ id: string }>>("POST", "guideline_versions", { ...common, version: live, version_number: live, status: "published", is_current: false,
    content: { ...content, status: "published", version: live, clinicalReviewStatus: "pending" }, published_at: now, approved_by: publisher, approved_at: now, created_by: publisher,
    change_summary: `Published from ${content.version}: authoring-standard score ${audit.score}%, under the platform owner's standing authorisation (12 Oct 2026). approved_by records publication authorisation only. Clinical review PENDING; unreviewed notice retained. Previous versions preserved.` });
  const current = await rest<Array<{ id: string; version: string }>>("GET", `guideline_versions?select=id,version&guideline_id=eq.${content.id}&is_current=eq.true`);
  for (const previous of current) await rest("PATCH", `guideline_versions?id=eq.${previous.id}`, { is_current: false });
  await rest("PATCH", `guideline_versions?id=eq.${inserted.id}`, { is_current: true });
  await rest("PATCH", `clinical_guidelines?id=eq.${content.id}`, { status: "published" });
  console.log(`LIVE ${label} -> ${live} (score ${audit.score}%; replaced current: ${current.map((row) => row.version).join(", ") || "none"})`);
}
console.log(apply ? "Done." : "Dry run only. Re-run with --apply to write.");
