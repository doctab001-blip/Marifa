import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";
import { DiseaseSeedBatchSchema, type DiseaseDetail } from "../lib/validations/disease";
import { newDiseaseRecords } from "../lib/disease-import";

const allBatchPaths = [
  "data/seeds/batch_01_saudi_core.json",
  "data/seeds/batch_02_nhs_adapted.json",
  "data/seeds/batch_03_pillars.json",
  "data/seeds/batch_04_textbook_sourced_drafts.json",
  "data/seeds/batch_05_topic_list_drafts.json",
  "data/seeds/batch_06_topic_list_drafts.json",
  "data/seeds/batch_08_india_regional.json",
  "data/seeds/batch_09_india_toxicology.json",
] as const;
const selectedBatch = process.argv.find((argument) => argument.startsWith("--batch="))?.slice("--batch=".length);
const batchPaths = selectedBatch
  ? allBatchPaths.filter((path) => path.includes(`batch_${selectedBatch}_`))
  : allBatchPaths;
if (batchPaths.length === 0) throw new Error(`Unknown seed batch: ${selectedBatch}`);

try {
  loadEnvFile(resolve(".env.local"));
} catch (error) {
  if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
}

type SourceMetadata = {
  sourceTitle: string;
  sourceUrl: string;
  publicationDate: string;
  sourceType: "official-saudi-guideline" | "official-indian-guideline" | "curated-indian-draft" | "curated-saudi-draft" | "curated-saudi-guideline" | "curated-textbook-topic" | "nice-adapted-guideline";
  approval?: { approvedBy: string; approvedAt: string; publishedAt?: string };
  systemSeededNationalBaseline?: boolean;
};

const sourceMetadata: Record<string, SourceMetadata> = {
  "3a176976-1923-4ce0-9514-ebec094db189": { sourceTitle: "Standard Treatment Guidelines: Management of Snake Bite (MoHFW, 2017)", sourceUrl: "https://ncdc.mohfw.gov.in/uploads/pdf/Standard-Treatment-Guidelines-for-Management-of-Snake-Bite.pdf", publicationDate: "2017-08-01", sourceType: "official-indian-guideline" },
  "4c8b1959-b2a1-4d6b-9dbd-a36d97dae335": { sourceTitle: "NCDC expert group on National Guidelines on Rabies Prophylaxis (2019); CDSCO rabies vaccine SmPC", sourceUrl: "https://rabiesfreeindia.mohfw.gov.in/resources/uploads/PageContentPdf/170687215557.pdf", publicationDate: "2019-01-08", sourceType: "official-indian-guideline" },
  "5b9bff76-d967-4510-b8f9-96a3a69789de": { sourceTitle: "Scorpion envenoming: Indian randomised trials (Systematic Reviews 2017, Table 2)", sourceUrl: "https://systematicreviewsjournal.biomedcentral.com/articles/10.1186/s13643-017-0469-8/tables/2", publicationDate: "2017-04-01", sourceType: "curated-indian-draft" },
  "a0f31154-5cd6-4a93-9754-997975f77089": { sourceTitle: "Organophosphorus Poisoning review (JNMA 2008); ISCCM poisoning position statement (2024)", sourceUrl: "https://www.ijccm.org/doi/pdf/10.5005/jp-journals-10071-24697", publicationDate: "2024-08-01", sourceType: "curated-indian-draft" },
  "e53b2070-82ba-4941-baa5-9faa430bbc7f": { sourceTitle: "Aluminium phosphide evidence-based review (IJCCM 2016); ISCCM poisoning position statement (2024)", sourceUrl: "https://www.ijccm.org/doi/IJCCM/pdf/10.4103/0972-5229.195712", publicationDate: "2016-12-01", sourceType: "curated-indian-draft" },
  "c93d0d1a-daf3-4395-81ea-90b5e1bdc718": { sourceTitle: "Canadian Antidote Guide (ethanol); Austin fomepizole guideline (2026); toxic alcohol resource (2025)", sourceUrl: "https://www.ciusss-capitalenationale.gouv.qc.ca/en/antidotes/ethanol", publicationDate: "2026-02-10", sourceType: "curated-indian-draft" },
  "3f6c2a91-7d4e-4b8a-9c15-e2a7b04d6f13": { sourceTitle: "ICMR Treatment Guidelines for Antimicrobial Use in Common Syndromes (2019); IAP Standard Treatment Guidelines: Enteric Fever (2022)", sourceUrl: "https://www.icmr.gov.in/icmrobject/custom_data/pdf/resource-guidelines/Treatment_Guidelines_2019_Final.pdf", publicationDate: "2019-01-01", sourceType: "official-indian-guideline" },
  "8b1e5d07-2c9f-4a63-b7e4-51d0c8a9f2e6": { sourceTitle: "National Drug Policy on Malaria (NVBDCP/MoHFW, 2013)", sourceUrl: "https://ncvbdc.mohfw.gov.in/WriteReadData/l892s/National-Drug-Policy-2013.pdf", publicationDate: "2013-01-01", sourceType: "official-indian-guideline" },
  "c4a9f3e2-6b18-4d75-8e2a-9f7b13c05d48": { sourceTitle: "ICMR/NTEP Standard Treatment Workflow: Tuberculosis (2022)", sourceUrl: "https://icmr.gov.in/icmrobject/uploads/STWs/1725964686_2_ntep_18032022.pdf", publicationDate: "2022-03-18", sourceType: "official-indian-guideline" },
  "5e2d8b4f-a173-4c96-9d08-3b6e7f1a2c95": { sourceTitle: "ICMR Treatment Guidelines for Antimicrobial Use in Common Syndromes (2019), scrub typhus section", sourceUrl: "https://www.icmr.gov.in/icmrobject/custom_data/pdf/resource-guidelines/Treatment_Guidelines_2019_Final.pdf", publicationDate: "2019-01-01", sourceType: "official-indian-guideline" },
  "a1010000-0000-4000-8000-000000000001": { sourceTitle: "Saudi National Asthma Guideline", sourceUrl: "https://www.moh.gov.sa/en/Ministry/About/Health%20Policies/001.pdf", publicationDate: "2018-01-01", sourceType: "official-saudi-guideline" },
  "a1010000-0000-4000-8000-000000000002": { sourceTitle: "MOH-context sepsis pathway synthesis for local governance review", sourceUrl: "https://www.moh.gov.sa/en/Ministry/MediaCenter/Publications/Pages/Protocols.aspx", publicationDate: "2026-01-01", sourceType: "curated-saudi-draft" },
  "a1010000-0000-4000-8000-000000000003": { sourceTitle: "MOH DVT and Pulmonary Embolism Treatment Protocols", sourceUrl: "https://www.moh.gov.sa/en/Ministry/MediaCenter/Publications/Documents/PE_Pulmonary_Embolism_Protocol.pdf", publicationDate: "2024-09-04", sourceType: "official-saudi-guideline" },
  "a1010000-0000-4000-8000-000000000004": { sourceTitle: "Lower Respiratory Tract Infections Management Protocol", sourceUrl: "https://www.moh.gov.sa/Ministry/MediaCenter/Publications/Documents/Lower-Respiratory-Tract-Infections-Management-Protocol.pdf", publicationDate: "2021-01-01", sourceType: "official-saudi-guideline" },
  "a1010000-0000-4000-8000-000000000005": { sourceTitle: "Saudi MoH Protocol for Adult and Pediatric Management of Anaphylaxis, Version 1.2", sourceUrl: "https://www.moh.gov.sa/Ministry/MediaCenter/Publications/Documents/Saudi-MoH-Protocol-for-Management-of-Anaphylaxis-V1.2.pdf", publicationDate: "2020-12-28", sourceType: "official-saudi-guideline" },
  "a1010000-0000-4000-8000-000000000006": { sourceTitle: "Saudi Breast Cancer Management Guidelines", sourceUrl: "https://shc.gov.sa/ar/Centers/NCC/Activities/Documents/Saudi%20Breast%20Cancer%20Management%20Guidelines.pdf", publicationDate: "2018-01-01", sourceType: "official-saudi-guideline" },
  "a1010000-0000-4000-8000-000000000007": { sourceTitle: "Saudi Lung Cancer Management Guidelines", sourceUrl: "https://shc.gov.sa/ar/Centers/NCC/Activities/Documents/Saudi%20Lung%20Cancer%20Management%20Guidelines.pdf", publicationDate: "2019-01-01", sourceType: "official-saudi-guideline" },
  "a1010000-0000-4000-8000-000000000008": { sourceTitle: "Saudi Clinical Preventive Guideline", sourceUrl: "https://www.pha.gov.sa/ar-sa/EvidenceAndProcedures/Documents/Saudi%20Clinical%20Preventive%20Guideline%20(2023%20final%20Version).pdf", publicationDate: "2023-01-01", sourceType: "official-saudi-guideline" },
  "a1020000-0000-4000-8000-000000000001": { sourceTitle: "NICE NG196: Atrial fibrillation — diagnosis and management", sourceUrl: "https://www.nice.org.uk/guidance/ng196", publicationDate: "2021-04-27", sourceType: "nice-adapted-guideline" },
  "a1020000-0000-4000-8000-000000000002": { sourceTitle: "NICE NG136: Hypertension in adults — diagnosis and management", sourceUrl: "https://www.nice.org.uk/guidance/ng136", publicationDate: "2026-02-26", sourceType: "nice-adapted-guideline" },
  "a14c7e92-5b31-4d68-9f20-6c83e1b7a405": { sourceTitle: "Acute coronary syndrome educational synthesis; pending Saudi clinical governance review", sourceUrl: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001309", publicationDate: "2025-02-27", sourceType: "curated-saudi-draft" },
  "b25d8f03-6c42-4e79-a130-7d94f2c8b516": { sourceTitle: "Saudi Diabetes Clinical Practice Guidelines, Saudi National Diabetes Center, Saudi Health Council", sourceUrl: "https://www.moh.gov.sa/Ministry/MediaCenter/Publications/Documents/Saudi-Diabetes-Clinical-Practice-Guidelines.pdf", publicationDate: "2021-08-22", sourceType: "curated-saudi-guideline", approval: { approvedBy: "310a1d7b-646d-4adb-b822-8d79453237cf", approvedAt: "2026-10-10T00:00:00+03:00" } },
  "c36e9014-7d53-4a82-b641-8e05a3c9d627": { sourceTitle: "MOH Primary Health Care chronic disease and cardiovascular risk screening forms", sourceUrl: "https://www.moh.gov.sa/en/Ministry/About/Health%20Policies/026.pdf", publicationDate: "2010-01-01", sourceType: "curated-saudi-guideline", approval: { approvedBy: "310a1d7b-646d-4adb-b822-8d79453237cf", approvedAt: "2026-10-10T00:00:00+03:00" } },
  "d47f0125-8e64-4b93-8c72-9f16a4d0e738": { sourceTitle: "Marifa elective cholecystectomy pre-operative pathway synthesis for local governance", sourceUrl: "https://www.moh.gov.sa/ministry/mediacenter/publications/pages/protocols.aspx", publicationDate: "2026-10-10", sourceType: "curated-saudi-guideline", approval: { approvedBy: "310a1d7b-646d-4adb-b822-8d79453237cf", approvedAt: "2026-10-10T00:00:00+03:00" } },
  "e58a1236-9f75-4ca4-a398-0e27b5c1f849": { sourceTitle: "MOH Gestational Diabetes guidance and Pocket Manual in Obstetrics & Gynaecology", sourceUrl: "https://www.moh.gov.sa/en/awarenessplateform/WomensHealth/DuringPregnancy/pages/default.aspx", publicationDate: "2026-06-13", sourceType: "curated-saudi-guideline", approval: { approvedBy: "310a1d7b-646d-4adb-b822-8d79453237cf", approvedAt: "2026-10-10T00:00:00+03:00" } },
  "f69b2347-a086-4db5-b509-1f38c6d2a950": { sourceTitle: "MOH Protocols for Palliative Care Patients — End of Life Care", sourceUrl: "https://www.moh.gov.sa/Ministry/MediaCenter/Publications/Documents/Protocol-010.pdf", publicationDate: "2019-01-01", sourceType: "curated-saudi-guideline", approval: { approvedBy: "310a1d7b-646d-4adb-b822-8d79453237cf", approvedAt: "2026-10-10T00:00:00+03:00" } },
  "ebb76601-6f86-436e-89f8-0e2af4de8791": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-12", sourceType: "curated-saudi-draft" },
  "25a72fe4-a384-46d3-a668-068544c6003f": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-12", sourceType: "curated-saudi-draft" },
  "f92e26f9-7a0e-41fb-9734-83d30117933c": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-12", sourceType: "curated-saudi-draft" },
  "d7dccbd3-15df-42d3-b6ca-db28e8586137": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-12", sourceType: "curated-saudi-draft" },
  "e9ab6c1d-4283-4ac1-b662-93d5fd35c444": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-12", sourceType: "curated-saudi-draft" },
  "9c2bdfee-ee19-4b0e-9d47-d44467542a0d": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-12", sourceType: "curated-saudi-draft" },
  "4ef4de75-7605-4961-8986-22a95b0b202d": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-12", sourceType: "curated-saudi-draft" },
  "821cc66c-474a-45b9-b9ae-4cb38ee13712": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-12", sourceType: "curated-saudi-draft" },
  "f732cdaf-3b89-48d7-8cd0-33d108bb8360": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-12", sourceType: "curated-saudi-draft" },
  "033fa49b-a4f9-4d54-ac6f-e459ef03e218": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-12", sourceType: "curated-saudi-draft" },
  "0dcb804b-ce96-4960-9bc2-2c2c67f68685": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-13", sourceType: "curated-saudi-draft" },
  "295b56c9-7969-47b6-8944-7c803c39e732": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-13", sourceType: "curated-saudi-draft" },
  "135e5254-3229-43c3-92b9-0c5acdc921aa": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-13", sourceType: "curated-saudi-draft" },
  "ac59eded-f1e9-4a52-afde-467300c4fda4": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-13", sourceType: "curated-saudi-draft" },
  "bdff4827-8548-4272-bd54-827888a2cf15": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-13", sourceType: "curated-saudi-draft" },
  "b04002c0-c9b2-4971-88f3-7a82e9279376": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-13", sourceType: "curated-saudi-draft" },
  "3b6ad593-93d7-40b2-84b4-96990bc0008e": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-13", sourceType: "curated-saudi-draft" },
  "b3b08de9-632d-488a-b9f3-0bc3ac0114ce": { sourceTitle: "Marifa topic-list intake; clinical sources not yet reviewed", sourceUrl: "https://github.com/doctab001-blip/Marifa", publicationDate: "2026-10-13", sourceType: "curated-saudi-draft" },
};

type SeedRecord = { disease: DiseaseDetail; source: SourceMetadata };

const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const approvedStatuses = new Set(["approved", "published"]);

async function loadBatches(): Promise<SeedRecord[]> {
  const parsed = await Promise.all(
    batchPaths.map(async (path) => {
      const raw = await readFile(resolve(path), "utf8");
      return DiseaseSeedBatchSchema.parse(JSON.parse(raw));
    }),
  );
  const diseases = parsed.flat();
  const textbookSourceRows = JSON.parse(await readFile(resolve("data/seeds/batch_04_textbook_sources.json"), "utf8")) as Array<{
    id: string; textbook: string; publisher: string; publicationDate: string; publisherEditionPage: string;
  }>;
  const textbookSources = new Map(textbookSourceRows.map((row) => [row.id, {
    sourceTitle: row.textbook,
    sourceUrl: row.publisherEditionPage,
    publicationDate: row.publicationDate,
    sourceType: "curated-textbook-topic" as const,
    approval: { approvedBy: "310a1d7b-646d-4adb-b822-8d79453237cf", approvedAt: "2026-10-10T17:00:00Z", publishedAt: "2026-10-10T17:00:00Z" },
  }]));
  const ids = new Set<string>();
  const titles = new Set<string>();
  const records: SeedRecord[] = [];
  for (const disease of diseases) {
    if (!uuidV4.test(disease.id)) throw new Error(`Expected a hardcoded UUIDv4 for ${disease.title}; got ${disease.id}`);
    if (ids.has(disease.id)) throw new Error(`Duplicate disease id: ${disease.id}`);
    if (titles.has(disease.title)) throw new Error(`Duplicate disease title: ${disease.title}`);
    const source = sourceMetadata[disease.id] ?? textbookSources.get(disease.id);
    if (!source) throw new Error(`Missing source metadata: ${disease.id}`);
    if (new URL(source.sourceUrl).protocol !== "https:") throw new Error(`Source URL must use HTTPS: ${disease.title}`);
    if (disease.status === "under_review") {
      const wordCount = disease.pathophysiology.summary.trim().split(/\s+/).length;
      if (wordCount < 200 || wordCount > 400) {
        throw new Error(`${disease.title} pathophysiology must be 200–400 words before clinical review; found ${wordCount}.`);
      }
    }
    if (approvedStatuses.has(disease.status)) {
      if (!source.approval && !source.systemSeededNationalBaseline) {
        throw new Error(`${disease.title} is ${disease.status} without reviewer approval metadata or an explicit national-baseline marker.`);
      }
      if (!source.approval?.approvedBy || !uuidV4.test(source.approval.approvedBy) || !source.approval.approvedAt) {
        throw new Error(`${disease.title} cannot be seeded as ${disease.status}: the current database constraint requires an approver profile UUID and approval timestamp.`);
      }
    } else if (source.approval) {
      throw new Error(`${disease.title} has approval metadata but its content status is ${disease.status}.`);
    }
    ids.add(disease.id);
    titles.add(disease.title);
    records.push({ disease, source });
  }
  return records;
}

function issuingOrganization(record: DiseaseDetail, source: SourceMetadata) {
  if (record.authority === "Textbook") return source.sourceTitle;
  return {
    MOH: "Saudi Ministry of Health",
    SHC: "Saudi Health Council",
    PHA: "Saudi Public Health Authority",
    NICE: "National Institute for Health and Care Excellence; adapted for Saudi review",
    ICMR: "Indian Council of Medical Research",
    MoHFW: "Ministry of Health and Family Welfare, Government of India",
    Other: source.sourceTitle,
    Textbook: "Textbook reference; clinical review status is recorded separately",
  }[record.authority];
}

async function seed(records: SeedRecord[]) {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !serviceKey) {
    throw new Error("Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY).");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  async function preflight() {
    const ids = records.map(({ disease }) => disease.id);
    const { data: guidelines, error: guidelineReadError } = await supabase
      .from("clinical_guidelines")
      .select("id,title,status,organization_id,is_shared_reference")
      .in("id", ids);
    if (guidelineReadError) throw new Error(`Guideline preflight failed: ${guidelineReadError.message}`);

    const { data: versions, error: versionReadError } = await supabase
      .from("guideline_versions")
      .select("id,guideline_id")
      .in("guideline_id", ids);
    if (versionReadError) throw new Error(`Version preflight failed: ${versionReadError.message}`);

    // Existing records belong to the shared catalogue, including work from other accounts.
    // Never rewrite their content, source metadata, approval, or current-version pointers.
    const additions = newDiseaseRecords(records, guidelines ?? [], versions ?? []);
    console.log(`Preserving ${records.length - additions.length} existing seed records; adding ${additions.length} new records.`);
    return additions;
  }

  records = await preflight();
  if (records.length === 0) return;

  const guidelines = records.map(({ disease, source }) => ({
    id: disease.id,
    organization_id: null,
    title: disease.title,
    specialty: disease.specialty,
    status: disease.status,
    source_type: source.sourceType,
    is_shared_reference: true,
  }));
  const { error: guidelineError } = await supabase
    .from("clinical_guidelines")
    .upsert(guidelines, { onConflict: "id", ignoreDuplicates: true });
  if (guidelineError) throw new Error(`Guideline metadata insert failed: ${guidelineError.message}`);

  const versions = records.map(({ disease, source }) => ({
    id: disease.id,
    guideline_id: disease.id,
    version: disease.version,
    version_number: disease.version,
    status: disease.status,
    content: disease,
    is_current: true,
    change_summary: source.systemSeededNationalBaseline
      ? "System-seeded national baseline; provenance and approval metadata are recorded below."
      : disease.clinicalReviewStatus === "pending"
        ? "Published at platform administrator request for live user review; local clinical validation remains pending."
      : source.approval
        ? "Curated Saudi pathway approved by the designated Marifa platform administrator; source provenance is recorded below."
        : "Schema-validated repository seed; draft pending local clinical governance review.",
    source_title: source.sourceTitle,
    issuing_organization: issuingOrganization(disease, source),
    source_url: source.sourceUrl,
    jurisdiction: disease.authority === "ICMR" || disease.authority === "MoHFW" ? "India" : "Saudi Arabia",
    publication_date: source.publicationDate,
    last_verified_date: disease.lastReviewed,
    review_date: disease.lastReviewed,
    approved_by: source.approval?.approvedBy ?? null,
    approved_at: source.approval?.approvedAt ?? null,
    published_at: disease.status === "published" ? source.approval?.publishedAt ?? null : null,
  }));
  const { error: versionError } = await supabase
    .from("guideline_versions")
    .upsert(versions, { onConflict: "id", ignoreDuplicates: true });
  if (versionError) {
    throw new Error(`Version insert failed after new guideline metadata was saved. It is safe to rerun after correcting the error because inserts preserve existing records by stable identifiers. ${versionError.message}`);
  }
}

const records = await loadBatches();
if (process.argv.includes("--apply")) {
  await seed(records);
  console.log(`Additive import checked ${records.length} validated disease-management records; existing records were preserved.`);
} else {
  console.log(`Validated ${records.length} disease-management records across ${batchPaths.length} batches. No database writes were made; pass --apply to add new records while preserving existing content.`);
}
