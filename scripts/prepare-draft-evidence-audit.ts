import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { DiseaseDetailSchema } from "../lib/validations/disease";

const root = "outputs/draft-audit-2026-10-11";
const revision = "evidence-audit-2026-10-11-v1";
type Row = { id: string; title: string; version_id: string; version: string; source_title: string; source_url: string | null; content: unknown };
type Proposal = { source: string; locator: string; scope: string; actions: string[] };
type Source = { key: string; url: string; title: string; httpStatus: string; characters: number; sha256: string };
const before: Row[] = JSON.parse(await readFile(`${root}/before.json`, "utf8"));
const proposals: Record<string, Proposal> = JSON.parse(await readFile(`${root}/corrections.json`, "utf8"));
const retrieval: Source[] = [...JSON.parse(await readFile(`${root}/source-retrieval.json`, "utf8")), ...JSON.parse(await readFile(`${root}/nice-chapter-retrieval.json`, "utf8"))];
const mappings = (await readFile(`${root}/source-map.tsv`, "utf8")).trim().split("\n").map((line) => line.split("\t"));
const uuidFor = (value: string) => {
  const hex = createHash("sha256").update(value).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};
function findingsFor(row: Row) {
  const content = DiseaseDetailSchema.parse(row.content);
  const findings = ["Full NICE compliance and original Medscape derivation have not been established."];
  if (content.presentation.symptoms.some((item) => item.includes("characteristic symptom pattern"))) findings.push("Presentation contains generic template instructions rather than a verified topic-specific symptom description.");
  if (content.clinicalManagement.some((item) => item.id === "individualised-care")) findings.push("Management contains generic template steps; the correction supplies a limited topic-specific source branch.");
  if (/shop\.|book\.aspx|academic\.oup|elsevierhealth|mheducation|lww\.co/.test(row.source_url ?? "")) findings.push("The recorded source is a publisher/book catalogue link; it does not substantiate the detailed clinical claims.");
  if (!row.source_url) findings.push("The version has no exact source URL.");
  if (row.title.includes("Asthma Exacerbation")) findings.push("NG245 excludes acute attacks; it is suitable only for chronic management and follow-up comparison.");
  if (row.title === "Acute Exacerbation of COPD" && row.version.startsWith("aecopd-user")) findings.push("Prednisolone 40 mg is not NICE NG115's 30 mg regimen. The restrictive ONLY antibiotic rule does not match NG114's individualised assessment.");
  if (row.title.startsWith("Acute Coronary Syndrome") && row.version.startsWith("acs-user")) findings.push("US loading doses and anticoagulant options must not be labelled a universal NICE regimen; bleeding, reperfusion, renal and pretreatment branches are required.");
  if (row.title.includes("Screening") || row.title.includes("Vaccination") || row.title.includes("Immunisation")) findings.push("Diagnostic referral or uptake guidance is not sufficient evidence for a Saudi population screening or vaccination schedule.");
  findings.push(proposals[row.title].scope);
  return findings;
}
const audit = before.map((row) => ({ guidelineId: row.id, title: row.title, versionId: row.version_id, version: row.version, findings: findingsFor(row), proposedCorrection: proposals[row.title], verdict: "incomplete — not demonstrated compliant", medscapeDerivation: "not established" }));
const prepared = Object.values(Object.groupBy(before, (row) => row.id)).map((group) => {
  if (!group?.length) throw new Error("Empty topic group");
  const row = group.find((item) => item.version.startsWith("official-extraction")) ?? group[0];
  const original = DiseaseDetailSchema.parse(row.content);
  const proposal = proposals[row.title];
  const source = retrieval.find((item) => item.key === proposal.source);
  const available = source?.httpStatus === "200" && source.characters > 1000;
  const medscapeId = mappings.find((item) => item[0] === row.title)?.[2];
  const secondary = retrieval.find((item) => item.key === `medscape-${medscapeId}-treatment` && item.httpStatus === "200" && item.characters > 1000);
  const findings = [...new Set(group.flatMap(findingsFor))];
  if (!available) findings.push("Current primary guideline retrieval failed; this is an audit-only candidate, with no new guideline recommendations asserted.");
  const content = structuredClone(original);
  content.status = "under_review";
  content.clinicalReviewStatus = "pending";
  content.version = revision;
  content.evidenceAudit = {
    checkedOn: "2026-10-11", status: "incomplete", scope: proposal.scope, findings,
    unverifiedSections: ["Inherited pathophysiology, presentation and differential detail", "Investigation selection and interpretation outside the explicitly cited scope", "Complete medicines, contraindications, dose adjustments and monitoring", "Non-clinical care and local Saudi adaptation"],
    medscapeStatus: secondary ? "limited-comparison" : "unavailable",
    originalVersionIds: group.map((item) => item.version_id),
  };
  if (available && source) {
    content.authority = source.key.startsWith("medscape") ? "Other" : "NICE";
    content.clinicalManagement = [{ id: "source-scope-correction", title: "Topic-specific source correction — limited scope", timeframe: "Apply according to acuity and the cited guideline; clinician verification required", actions: proposal.actions }];
    content.medicationPlan = { status: "local-protocol-required", regimens: [], note: "UNREVIEWED DRAFT — NOT FOR CLINICAL USE. This version replaces the inherited prescribing list with a limited source comparison. It is not a complete prescribing protocol. Verify all doses, routes, contraindications, organ-function adjustments, interactions and monitoring before approval. Original medication content remains preserved in the previous versions." };
    const sources = [{ id: uuidFor(source.url), title: source.title.split(" | ")[0], issuer: source.key.startsWith("medscape") ? "Other" as const : "NICE" as const, edition: "Public recommendation/reference page retrieved 11 October 2026; retrieval is not clinical approval", url: source.url, locator: proposal.locator, primary_source: true }];
    if (secondary && secondary.url !== source.url) sources.push({ id: uuidFor(secondary.url), title: secondary.title, issuer: "Other", edition: "Public Medscape page retrieved 11 October 2026; limited secondary comparison", url: secondary.url, locator: "Treatment and Management; detailed prescribing not reconciled", primary_source: false });
    for (const inherited of original.granularPathway?.evidence.sources ?? []) if (!sources.some((item) => item.url === inherited.url)) sources.push({ ...inherited, issuer: inherited.issuer === "NICE" ? "NICE" : "Other", primary_source: false });
    const evidence = { sources, selection_rationale: `Limited source comparison only. ${proposal.scope} Inherited sections have not been re-verified; see the evidence audit. No full NICE compliance, original Medscape derivation or clinician approval is asserted.` };
    const tests = [...original.investigations.ruleIn, ...original.investigations.ruleOut];
    content.granularPathway = {
      schema_version: 1, evidence,
      Investigations: [{ id: "inherited-investigations", title: "Inherited investigations — verification still required", timeframe: "Determine from the full disease-specific pathway before clinical approval", evidence,
        steps: tests.map((test) => ({ test: test.testName, clinical_question: test.targetCondition, expected_finding: test.expectedFinding, decision_rationale: `Inherited and not verified in this audit: ${test.clinicalRationale}`, timeframe: "Not newly verified" })) }],
      Treatment_Plan: [{ id: "source-scope-correction", title: "Limited source correction", timeframe: "According to clinical acuity and the source pathway", actions: proposal.actions.map((instruction) => ({ instruction, timeframe: "Clinician must confirm timing for the specific patient" })), Medicines_Doses: [], branches: [], evidence }],
    };
  }
  return { guideline_id: row.id, original_version_ids: group.map((item) => item.version_id), source_title: available && source ? source.title.split(" | ")[0] : "Current osteoporosis guideline retrieval pending — audit only", source_url: source?.url ?? row.source_url, issuer: available && source && !source.key.startsWith("medscape") ? "NICE" : "Other", correction_status: available ? "limited-scope-correction" : "audit-only", content: DiseaseDetailSchema.parse(content) };
});
if (before.length !== 92 || prepared.length !== 75) throw new Error("Catalogue scope changed; reconcile the live baseline first");
await writeFile(`${root}/audit.json`, JSON.stringify(audit, null, 2) + "\n");
await writeFile(`${root}/prepared.json`, JSON.stringify(prepared, null, 2) + "\n");
const report = ["# Draft evidence audit — 11 October 2026", "", "92 draft versions across 75 topics were inventoried and checked for source identity, scope, generic content, prescribing conflicts and evidence gaps. This is a limited evidence audit, not a full clinical validation. No original Medscape derivation was established. NICE comparisons apply only to the explicitly cited scope; some topics have no matching comprehensive NICE guideline.", "", "74 limited-scope correction candidates and one audit-only osteoporosis candidate were prepared as new under-review versions. Generic or unsupported inherited sections remain explicitly unverified. No original scenario, version, source reference or approval record is replaced. No approval is performed by this audit.", "", "Medscape retrieval was successful for a few public reference pages, then returned HTTP 429. NICE NG259 retrieval returned HTTP 403; its current recommendations were not verified. These access failures must be resolved with authorized source access before a full claim of conformity or derivation can be made.", "", "## Approval failure", "", "At 19:41 Riyadh time the live logs show a successful approval followed by three repeated submissions rejected because the version was no longer draft/under-review. Both current RPCs passed rolled-back tests. The application fix recognises an existing current approval receipt after a stale submission and distinguishes permission, stale-version, concurrency and configuration errors. No content is approved during validation.", "", "## Per-version findings", "", ...audit.flatMap((row) => [`### ${row.title} — ${row.version}`, `Version ID: ${row.versionId}`, `Verdict: ${row.verdict}. Medscape derivation: ${row.medscapeDerivation}.`, ...row.findings.map((finding) => `- ${finding}`), ""])];
await writeFile(`${root}/REPORT.md`, report.join("\n").trimEnd() + "\n");
console.log(JSON.stringify({ auditedVersions: audit.length, topics: prepared.length, scopedCorrections: prepared.filter((item) => item.correction_status === "limited-scope-correction").length, auditOnly: prepared.filter((item) => item.correction_status === "audit-only").length }));
