import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { DiseaseDetailSchema } from "@/lib/validations/disease";
import { ClinicalPathwaySchema } from "@/lib/validations/clinical-pathway";
import { validatePathway } from "@/lib/pathway-validation";
import type { DiseaseTopic } from "@/lib/types";

// Preparation only. The generated guarded transaction is applied separately,
// then read back. No model key, schema change, approval or publication is used.
const folder = process.argv[2];
if (!folder) throw new Error("Pass a batch folder with before.json and extractions.json.");
const version = process.argv[3] ?? "official-extraction-2026-10-11-b001";
const output = join(folder, "prepared.json");
if (existsSync(output)) throw new Error("Prepared batch already exists. Reuse it; never regenerate source identities on retry.");
type Before = { id: string; title: string; version_id: string; content: unknown };
type Extraction = {
  title: string; source: string; issuer: "Other" | "NICE"; sourceTitle: string;
  edition: string; locator: string; scope: string; gaps: string;
  investigations: Array<{ test: string; question: string; finding: string; rationale: string; timeframe: string }>;
  actions: Array<{ instruction: string; timeframe: string }>;
  medicines: Array<{ medicine: string; indication: string; group: string; dose: string; route: string; frequency: string; duration: string; adjustments: string[]; monitoring: string[] }>;
};
const before = JSON.parse(readFileSync(join(folder, "before.json"), "utf8")) as Before[];
const extracted = JSON.parse(readFileSync(join(folder, "extractions.json"), "utf8")) as Extraction[];
if (before.length !== 10 || extracted.length !== 10 || new Set(before.map(x => x.id)).size !== 10) {
  throw new Error("Each population transaction must contain exactly ten distinct catalogue entries.");
}
const baselinePath = existsSync(join(folder, "baseline.json")) ? join(folder, "baseline.json") : "outputs/clinical-population/catalogue-before.json";
const catalogue = JSON.parse(readFileSync(baselinePath, "utf8")).rows as Array<{ id: string; guideline_id: string; version: string; status: string; is_current: boolean; content_hash: string }>;
const master = JSON.parse(readFileSync("outputs/clinical-population/master-catalogue.json", "utf8")).rows;
const allowedHosts = new Set([
  "www.nice.org.uk", "www.resus.org.uk", "pmc.ncbi.nlm.nih.gov",
  "www.cdc.gov", "www.uspreventiveservicestaskforce.org",
  "www.gov.uk", "www.moh.gov.sa", "abcd.care", "www.rcog.org.uk",
]);
const prepared = before.map(item => {
  const extraction = extracted.find(x => x.title === item.title);
  if (!extraction) throw new Error(`Missing extraction: ${item.title}`);
  if (!allowedHosts.has(new URL(extraction.source).hostname)) throw new Error("Unreviewed source host");
  const original = DiseaseDetailSchema.parse(item.content);
  const sourceId = randomUUID();
  const evidence = {
    sources: [{ id: sourceId, title: extraction.sourceTitle, issuer: extraction.issuer,
      edition: extraction.edition, url: extraction.source, locator: extraction.locator, primary_source: true }],
    selection_rationale: `Unverified scope: ${extraction.scope}`,
  };
  const granularPathway = ClinicalPathwaySchema.parse({
    schema_version: 1, evidence,
    Investigations: [{ id: "official-assessment", title: "Source-backed assessment draft", timeframe: "According to each source step",
      steps: extraction.investigations.map(x => ({ test: x.test, clinical_question: x.question,
        expected_finding: x.finding, decision_rationale: x.rationale, timeframe: x.timeframe })), evidence }],
    Treatment_Plan: [{ id: "official-management", title: "Limited source-backed management draft", timeframe: "According to each source action",
      actions: [...extraction.actions, { instruction: `Review gaps: ${extraction.gaps}`, timeframe: "Before clinical approval" }],
      // ExactDoseSchema cannot represent an unknown loading dose. Preserve such
      // doses in the existing medicationPlan contract rather than invent one.
      Medicines_Doses: [], branches: [], evidence }],
  });
  const content = DiseaseDetailSchema.parse({ ...original, status: "draft", version,
    clinicalReviewStatus: "pending", granularPathway,
    medicationPlan: {
      status: "local-protocol-required",
      regimens: extraction.medicines.map(x => ({ indication: x.indication, patientGroup: x.group,
        genericName: x.medicine, dose: x.dose, route: x.route, frequency: x.frequency, duration: x.duration,
        adjustments: x.adjustments, monitoring: x.monitoring, sourceTitle: extraction.sourceTitle,
        sourceUrl: extraction.source, sourceEdition: `${extraction.edition}; ${extraction.locator}` })),
      note: `UNVERIFIED DRAFT — not approved for clinical use. ${extraction.scope} ${extraction.gaps} Existing sections outside this extraction are inherited unchanged and are not newly verified.`,
    },
  });
  const graph: DiseaseTopic["pathway"] = {
    title: `${item.title}: limited evidence extraction`,
    nodes: [
      { id: "start", type: "start", title: "Extracted scope", detail: extraction.scope, referenceIds: [sourceId] },
      { id: "assessment", type: "assessment", title: "Investigations", detail: extraction.investigations.map(x => `${x.test}: ${x.rationale}; ${x.timeframe}`).join("\n"), referenceIds: [sourceId] },
      { id: "management", type: "action", title: "Source-backed actions", detail: extraction.actions.map(x => `${x.instruction} ${x.timeframe}`).join("\n"), referenceIds: [sourceId] },
      { id: "end", type: "end", title: "End of extracted scope", detail: `Review gaps: ${extraction.gaps}`, referenceIds: [sourceId] },
    ],
    transitions: [{ from: "start", to: "assessment" }, { from: "assessment", to: "management" }, { from: "management", to: "end" }],
  };
  const result = validatePathway(graph);
  if (!result.valid) throw new Error(result.errors.join("; "));
  const baseline = catalogue.find(x => x.id === item.version_id && x.guideline_id === item.id && x.is_current);
  if (!baseline) throw new Error("Original version is not in the verified baseline");
  return { id: item.id, title: item.title, original_version_id: item.version_id,
    expected_hash: baseline.content_hash, source_url: extraction.source, source_title: extraction.sourceTitle,
    issuer: extraction.issuer, scope: extraction.scope, content, graph };
});
const quote = (x: string) => `'${x.replaceAll("'", "''")}'`;
const payload = JSON.stringify(prepared.map(x => ({
  id: x.id, title: x.title, original_version_id: x.original_version_id,
  expected_hash: x.expected_hash, source_url: x.source_url,
  source_title: x.source_title, issuer: x.issuer, scope: x.scope, content: x.content,
})));
const baselineJson = JSON.stringify(catalogue);
const sql = `begin;
lock table public.clinical_guidelines in share mode;
lock table public.guideline_versions in share row exclusive mode;
create temporary table population_batch on commit drop as
select * from jsonb_to_recordset($population$${payload}$population$)
as x(id uuid,title text,original_version_id uuid,expected_hash text,source_url text,source_title text,issuer text,scope text,content jsonb);
create temporary table population_baseline on commit drop as
select * from jsonb_to_recordset($baseline$${baselineJson}$baseline$)
as x(id uuid,guideline_id uuid,version text,status text,is_current boolean,content_hash text);
do $guard$ begin
 if (select count(*) from population_batch) <> 10 then raise exception 'Strict batch size must be ten'; end if;
 if (select count(*) from clinical_guidelines where organization_id is null and is_shared_reference) <> ${master.length} then raise exception 'Master catalogue changed; reconcile before applying'; end if;
 if exists(select 1 from population_baseline b left join guideline_versions v on v.id=b.id where v.id is null or v.guideline_id<>b.guideline_id or md5(v.content::text)<>b.content_hash or v.status::text<>b.status or v.is_current<>b.is_current) then raise exception 'Existing version changed; stopping without writes'; end if;
 if exists(select 1 from population_batch p left join guideline_versions v on v.id=p.original_version_id and v.guideline_id=p.id and v.is_current where v.id is null or md5(v.content::text)<>p.expected_hash) then raise exception 'Current version guard failed'; end if;
 if exists(select 1 from population_batch p join guideline_versions v on v.guideline_id=p.id and v.version=${quote(version)} where v.content<>p.content or v.status<>'draft' or v.is_current or v.approved_by is not null or v.approved_at is not null or v.published_at is not null) then raise exception 'Conflicting batch already exists; never overwrite'; end if;
end $guard$;
insert into guideline_versions(guideline_id,version,version_number,status,content,change_summary,source_title,issuing_organization,source_url,jurisdiction,review_date,created_by,is_current)
select p.id,${quote(version)},${quote(version)},'draft',p.content,
 'Automated official-guideline extraction; unverified limited-scope draft. '||p.scope||' Existing source version: '||p.original_version_id::text||'. No clinician approval or new verification date recorded. Graph validation is structural only.',
 p.source_title,p.issuer,p.source_url,'International; Saudi adaptation pending',
 (select v.review_date from public.guideline_versions v where v.id=p.original_version_id),null,false
from population_batch p
on conflict(guideline_id,version) do nothing;
do $after$ begin
 if (select count(*) from guideline_versions v join population_batch p on p.id=v.guideline_id where v.version=${quote(version)} and v.status='draft' and not v.is_current and v.approved_by is null and v.approved_at is null and v.published_at is null and v.last_verified_date is null and v.content->>'clinicalReviewStatus'='pending') <> 10 then raise exception 'Draft read-back invariant failed'; end if;
 if exists(select 1 from population_baseline b left join guideline_versions v on v.id=b.id where v.id is null or md5(v.content::text)<>b.content_hash or v.status::text<>b.status or v.is_current<>b.is_current) then raise exception 'Original history changed'; end if;
end $after$;
commit;
select id,guideline_id,version,status,is_current,approved_by,approved_at,published_at,last_verified_date,content->>'clinicalReviewStatus' review_status from guideline_versions where version=${quote(version)} order by guideline_id;
`;
writeFileSync(output, JSON.stringify({ version, count: 10, prepared }, null, 2) + "\n", { flag: "wx" });
writeFileSync(join(folder, "apply.sql"), sql, { flag: "wx" });
const hashes = Object.fromEntries(readdirSync(join(folder, "sources")).filter(name => name.endsWith(".txt")).sort().map(name => {
  const file = join(folder, "sources", name);
  return [name, createHash("sha256").update(readFileSync(file)).digest("hex")];
}));
writeFileSync(join(folder, "validation.json"), JSON.stringify({ validated: true, count: 10,
  schemas: ["DiseaseDetailSchema", "ClinicalPathwaySchema"], graphValidator: "lib/pathway-validation.ts:validatePathway",
  graphCount: 10, medicationRegimens: prepared.reduce((n,x) => n+x.content.medicationPlan!.regimens.length,0),
  clinicalApproval: false, originalVersions: catalogue.length, sourceTextHashes: hashes }, null, 2)+"\n", { flag: "wx" });
console.log(`Validated ${prepared.length} unverified draft versions and graphs; prepared ${join(folder, "apply.sql")}.`);
