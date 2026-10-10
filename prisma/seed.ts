import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";
import { DiseaseSeedBatchSchema, type DiseaseDetail } from "../lib/validations/disease";

const batchPaths = [
  "data/seeds/batch_01_saudi_core.json",
  "data/seeds/batch_02_nhs_adapted.json",
] as const;

try {
  loadEnvFile(resolve(".env.local"));
} catch (error) {
  if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
}

type SourceMetadata = {
  sourceTitle: string;
  sourceUrl: string;
  publicationDate: string;
  sourceType: "official-saudi-guideline" | "curated-saudi-draft" | "nice-adapted-guideline";
};

const sourceMetadata: Record<string, SourceMetadata> = {
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
};

async function loadBatches() {
  const parsed = await Promise.all(
    batchPaths.map(async (path) => {
      const raw = await readFile(resolve(path), "utf8");
      return DiseaseSeedBatchSchema.parse(JSON.parse(raw));
    }),
  );
  const records = parsed.flat();
  const ids = new Set<string>();
  const titles = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) throw new Error(`Duplicate disease id: ${record.id}`);
    if (titles.has(record.title)) throw new Error(`Duplicate disease title: ${record.title}`);
    if (!sourceMetadata[record.id]) throw new Error(`Missing source metadata: ${record.id}`);
    ids.add(record.id);
    titles.add(record.title);
  }
  return records;
}

function issuingOrganization(record: DiseaseDetail) {
  return {
    MOH: "Saudi Ministry of Health",
    SHC: "Saudi Health Council",
    PHA: "Saudi Public Health Authority",
    NICE: "National Institute for Health and Care Excellence; adapted for Saudi review",
  }[record.authority];
}

async function seed(records: DiseaseDetail[]) {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !serviceKey) {
    throw new Error("Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY).");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const record of records) {
    const source = sourceMetadata[record.id];
    const { error: guidelineError } = await supabase.from("clinical_guidelines").upsert(
      {
        id: record.id,
        organization_id: null,
        title: record.title,
        specialty: record.specialty,
        status: record.status,
        source_type: source.sourceType,
        is_shared_reference: true,
      },
      { onConflict: "id" },
    );
    if (guidelineError) throw new Error(`${record.title}: ${guidelineError.message}`);

    const { error: versionError } = await supabase.from("guideline_versions").upsert(
      {
        id: record.id,
        guideline_id: record.id,
        version: record.version,
        version_number: record.version,
        status: record.status,
        content: record,
        is_current: true,
        change_summary: "Initial schema-validated disease-management seed; requires local clinical governance approval before publication.",
        source_title: source.sourceTitle,
        issuing_organization: issuingOrganization(record),
        source_url: source.sourceUrl,
        jurisdiction: "Saudi Arabia",
        publication_date: source.publicationDate,
        last_verified_date: record.lastReviewed,
        review_date: record.lastReviewed,
      },
      { onConflict: "id" },
    );
    if (versionError) throw new Error(`${record.title} (${record.version}): ${versionError.message}`);
  }
}

const records = await loadBatches();
if (process.argv.includes("--validate-only")) {
  console.log(`Validated ${records.length} disease-management records across ${batchPaths.length} batches.`);
} else {
  await seed(records);
  console.log(`Upserted ${records.length} disease-management records and current versions.`);
}
