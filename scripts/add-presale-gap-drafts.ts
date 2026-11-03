/**
 * Creates draft records for the topics in the pre-sale gap report (3 Nov 2026) on the Saudi and/or India platform.
 *
 *   npx tsx scripts/add-presale-gap-drafts.ts                 # dry run, both platforms
 *   npx tsx scripts/add-presale-gap-drafts.ts --only=sa       # dry run, Saudi only (or --only=in)
 *   npx tsx scripts/add-presale-gap-drafts.ts --apply         # create the drafts
 *
 * Topic list: .claude-tmp/presale-gap-topics-2026-11-03.json  [title, specialty, pillar, priority, "both"|"SA"|"IN"].
 * Reads .env.local (must be region SA) and .env.india.local (must be region IN) itself; the two hosts must differ.
 *
 * Format: the current depth-standard shape (as in the Saudi batch 35-37 topics), with every section present
 * and every field holding the "Content not yet authored." marker, so the survey counts the draft as a
 * placeholder and the batch publish scripts treat it as "fills placeholder". Urgent Care drafts start with
 * the ABCDE step; the medicine template row carries Paediatric, CKD, CLD and Allergy lines.
 * India drafts are titled "… (India)" so lib/region-topics.ts topicCountry() classes them as India topics.
 * Status is draft (Drafts queue only, never on the public directory). No clinical content is added.
 * Safe to re-run: a topic whose title already exists in that database is skipped.
 */
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { DiseaseDetailSchema } from "../lib/validations/disease";
import { topicCountry } from "../lib/region-topics";

const apply = process.argv.includes("--apply");
const only = (process.argv.find((a) => a.startsWith("--only="))?.split("=")[1] ?? "both").toLowerCase();
const TODAY = "2026-11-03";
const REVIEW_DATE = "2027-11-03";
const CREATED_BY = process.env.MARIFA_PUBLISHER_ID ?? "310a1d7b-646d-4adb-b822-8d79453237cf";
const P = "Content not yet authored.";

function env(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
const SA = env(".env.local"), IN = env(".env.india.local");
if ((SA.NEXT_PUBLIC_MARIFA_REGION ?? "").toUpperCase() !== "SA") throw new Error(".env.local is not region SA");
if ((IN.NEXT_PUBLIC_MARIFA_REGION ?? "").toUpperCase() !== "IN") throw new Error(".env.india.local is not region IN");
if (new URL(SA.NEXT_PUBLIC_SUPABASE_URL).host === new URL(IN.NEXT_PUBLIC_SUPABASE_URL).host) throw new Error("Saudi and India point at the same host; refusing");

type Country = "SA" | "IN";
type Db = { url: string; key: string; name: string };
const DBS: Record<Country, Db> = {
  SA: { url: SA.NEXT_PUBLIC_SUPABASE_URL, key: SA.SUPABASE_SECRET_KEY, name: "Saudi" },
  IN: { url: IN.NEXT_PUBLIC_SUPABASE_URL, key: IN.SUPABASE_SECRET_KEY, name: "India" },
};
const PLATFORM = {
  SA: { version: "saudi-draft-2026-11-03-v1", sourceType: "curated-saudi-draft", jurisdiction: "Saudi Arabia", issuing: "Marifa (Saudi) draft", local: "Saudi source (MOH, SHC or Saudi society)", refUrl: "https://www.moh.gov.sa", suffix: "" },
  IN: { version: "india-draft-2026-11-03-v1", sourceType: "curated-india-draft", jurisdiction: "India", issuing: "Marifa India draft", local: "Indian source (ICMR, MoHFW or Indian society)", refUrl: "https://www.icmr.gov.in", suffix: " (India)" },
} as const;

async function rest<T>(db: Db, method: string, p: string, body?: unknown): Promise<T> {
  const r = await fetch(`${db.url}/rest/v1/${p}`, { method, headers: { apikey: db.key, Authorization: `Bearer ${db.key}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!r.ok) throw new Error(`${db.name} ${method} ${p.split("?")[0]} -> ${r.status} ${(await r.text()).slice(0, 300)}`);
  const text = await r.text();
  return (text ? JSON.parse(text) : null) as T;
}
async function allTitles(db: Db): Promise<Array<{ id: string; title: string }>> {
  const out: Array<{ id: string; title: string }> = [];
  for (let from = 0; ; from += 1000) {
    const page = await rest<Array<{ id: string; title: string }>>(db, "GET", `clinical_guidelines?select=id,title&order=id&limit=1000&offset=${from}`);
    out.push(...page);
    if (page.length < 1000) return out;
  }
}

const inv = (tier: "laboratory" | "firstLineImaging", ref: object) => ({ tier, testName: P, modalityTarget: P, targetCondition: P, expectedFinding: P, clinicalRationale: P, normalValue: P, references: [ref] });
const question = (id: string) => ({
  id, vignette: P, fictitious: true as const, question: P,
  options: (["A", "B", "C", "D"] as const).map((letter) => ({ id: letter, text: `${P} (option ${letter})`, explanation: P })),
  answer: "A", educationalObjective: P, keyPoint: P,
});

function draft(id: string, country: Country, title: string, specialty: string, pillar: string, priority: string) {
  const pf = PLATFORM[country];
  const ref = { title: `Source not yet selected. ${P}`, edition: `Section to be cited. ${P}`, url: pf.refUrl };
  const acute = pillar === "Urgent Care";
  const steps = (acute
    ? [["abcde", "ABCDE assessment and resuscitation", "First minutes"], ["confirm-diagnosis", "Confirm the diagnosis", "First hour"], ["treat", "Treat", "First hours"], ["escalate-dispose", "Escalate, admit or discharge", "Before disposition"]]
    : [["assess", "Assess", "First visit"], ["confirm-diagnosis", "Confirm the diagnosis", "First visit"], ["treat", "Treat", "Ongoing"], ["follow-up", "Follow up and refer", "Ongoing"]]
  ).map(([sid, stitle, timeframe]) => ({ id: sid, title: stitle, timeframe, actions: [P] }));
  const branch = "Branch to be defined";
  return {
    id, title, specialty, authority: "Other", status: "draft", version: pf.version, lastReviewed: TODAY, pillar,
    clinicalReviewStatus: "pending",
    clinicalScenario: `Draft from the pre-sale gap report of 3 Nov 2026, priority ${priority}. ${P} Build to the current depth standard with ${country === "SA" ? "Saudi" : "Indian"} sources and medicines.`,
    pathophysiology: { summary: P, keyMechanisms: [P], references: [ref] },
    presentation: { symptoms: [P], physicalSigns: [P], redFlags: [P], precipitants: [P] },
    differentials: [{ condition: P, distinguishingFeatures: P }],
    investigations: { ruleIn: [inv("firstLineImaging", ref)], ruleOut: [inv("laboratory", ref)] },
    diagnosticCriteria: [{ criterion: P, threshold: P }],
    clinicalManagement: steps,
    medicationPlan: {
      status: "local-protocol-required",
      branches: [{ label: branch, entryCriteria: P }],
      regimens: [{
        indication: P, patientGroup: P, genericName: P, dose: P, route: P, frequency: P, duration: P,
        adjustments: [`Paediatric: ${P}`, `CKD: ${P}`, `CLD: ${P}`, `Allergy: ${P}`],
        monitoring: [P], contraindications: [P], branch, step: "Step to be defined",
        sourceTitle: ref.title, sourceUrl: ref.url, sourceEdition: ref.edition,
      }],
      note: `Template row only; no medicine is listed yet. ${P}`,
    },
    guidelineComparison: { title: `Where the guidelines differ. ${P}`, columns: [pf.local, "International source (NICE or society)"], rows: [{ parameter: P, values: [P, P] }] },
    algorithms: [{
      id: "draft-path", title: P, placement: "manage",
      nodes: [
        { id: "s", kind: "start", text: P, next: [{ to: "d1" }] },
        { id: "d1", kind: "decision", text: P, next: [{ to: "o1", label: "Yes" }, { to: "o2", label: "No" }] },
        { id: "o1", kind: "outcome", text: P },
        { id: "o2", kind: "outcome", text: P },
      ],
      source: { ...ref, locator: "Section to be cited" },
    }],
    teaching: {
      scope: P, learningObjectives: [P],
      vignette: { text: P, fictitious: true },
      guidedApproach: (["pathophysiology", "signs-symptoms", "investigations", "management"] as const).map((section) => ({ title: P, prompt: P, guidance: P, section })),
      pitfalls: [P], keyPoints: [P],
      references: [{ ...ref, locator: "Section to be cited" }],
      boardQuestions: [question("draft-q1"), question("draft-q2"), question("draft-q3")],
    },
    nonClinicalManagement: { patientEducation: [P], lifestyleAndDiet: [P], mdtReferrals: [P], dischargeCriteria: [P], followUpPlan: P },
  };
}

const topics = JSON.parse(fs.readFileSync(".claude-tmp/presale-gap-topics-2026-11-03.json", "utf8")) as Array<[string, string, string, string, "both" | "SA" | "IN"]>;
const norm = (s: string) => s.toLowerCase().replace(/\s*\(india\)\s*$/, "").replace(/[^a-z0-9]+/g, " ").trim();

for (const country of (["SA", "IN"] as Country[]).filter((c) => only === "both" || only === c.toLowerCase())) {
  const db = DBS[country], pf = PLATFORM[country];
  const wanted = topics.filter((t) => t[4] === "both" || t[4] === country);
  // PRESALE_OFFLINE=1 checks the payload against the local survey files instead of the database (dry run only).
  const offline = process.env.PRESALE_OFFLINE === "1";
  if (offline && apply) throw new Error("PRESALE_OFFLINE cannot be used with --apply");
  const existing = offline
    ? (JSON.parse(fs.readFileSync(`.claude-tmp/${country === "SA" ? "saudi" : "india"}-survey.json`, "utf8")) as Array<{ id: string; title: string }>)
    : await allTitles(db);
  const have = new Set(existing.map((row) => row.title.trim().toLowerCase()));
  console.log(`\n${apply ? "APPLY" : "DRY RUN"} — ${db.name} (${new URL(db.url).host}) — ${wanted.length} topics, ${existing.length} existing records`);
  const created: Array<{ id: string; title: string; priority: string; pillar: string }> = [];
  for (const [base, specialty, pillar, priority] of wanted) {
    const title = base + pf.suffix;
    if (have.has(title.toLowerCase())) { console.log(`SKIP   ${title}: title already exists`); continue; }
    const words = norm(base).split(" ").filter((w) => w.length > 4);
    const similar = existing.filter((row) => { const n = norm(row.title); return words.length > 0 && words.filter((w) => n.includes(w)).length >= Math.min(2, words.length); }).slice(0, 3);
    const id = randomUUID();
    const content = DiseaseDetailSchema.parse(draft(id, country, title, specialty, pillar, priority));
    if (topicCountry({ id, title, authority: content.authority }) !== country) throw new Error(`${title}: would be classed as the wrong country`);
    const note = similar.length ? `  (check overlap: ${similar.map((r) => r.title).join(" | ")})` : "";
    if (!apply) { console.log(`VALID  ${priority} ${title}${note}`); continue; }
    await rest(db, "POST", "clinical_guidelines", { id, title, specialty, status: "draft", source_type: pf.sourceType, is_shared_reference: true, organization_id: null, disease_topic_id: null, responsible_owner_id: null });
    try {
      await rest(db, "POST", "guideline_versions", {
        id: randomUUID(), guideline_id: id, version: pf.version, version_number: pf.version, status: "draft", is_current: true, content,
        change_summary: `Draft for the pre-sale gap report (3 Nov 2026), priority ${priority}. Current depth-standard format with every section marked "${P}" No clinical content or medicines yet.`,
        source_title: "Draft: sources to be selected", issuing_organization: pf.issuing, source_url: null, jurisdiction: pf.jurisdiction,
        publication_date: null, effective_date: null, last_verified_date: null, review_date: REVIEW_DATE,
        approved_by: null, approved_at: null, published_at: null, created_by: CREATED_BY,
      });
    } catch (error) {
      await rest(db, "DELETE", `clinical_guidelines?id=eq.${id}&status=eq.draft`);
      throw error;
    }
    created.push({ id, title, priority, pillar });
    console.log(`ADDED  ${priority} ${title} [${id}]${note}`);
  }
  if (apply) {
    const file = `.claude-tmp/presale-drafts-created-${country.toLowerCase()}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    fs.writeFileSync(file, JSON.stringify(created, null, 2));
    console.log(`${db.name}: ${created.length} drafts created; list saved to ${file}`);
  }
}
