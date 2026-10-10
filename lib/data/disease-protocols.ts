import "server-only";
import { mockDiseases, type ApprovalStatus, type ClinicalPathway, type MockDisease, type ModelOfCarePillar } from "@/data/mockDiseases";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DiseaseTopicJoin = {
  slug: string;
  name_en: string;
  summary_en: string;
  aliases: string[];
};

type ProtocolRow = {
  short_title: string;
  care_pillar: ModelOfCarePillar;
  source_authority: MockDisease["sourceAuthority"];
  version: string;
  last_reviewed: string;
  updated_at: string;
  approval_status: "approved" | "draft";
  red_flags: string[];
  pathway: ClinicalPathway | null;
  source_note: string;
  disease_topics: DiseaseTopicJoin | DiseaseTopicJoin[];
};

function formatReviewedDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function mapProtocolRow(row: ProtocolRow): MockDisease | null {
  const topic = Array.isArray(row.disease_topics) ? row.disease_topics[0] : row.disease_topics;
  if (!topic) return null;
  const approvalStatus: ApprovalStatus = row.approval_status === "approved" ? "Approved" : "Draft";
  return {
    id: topic.slug,
    title: topic.name_en,
    shortTitle: row.short_title,
    aliases: topic.aliases,
    summary: topic.summary_en,
    pillar: row.care_pillar,
    sourceAuthority: row.source_authority,
    version: row.version,
    lastReviewed: formatReviewedDate(row.last_reviewed),
    updatedAt: row.updated_at.slice(0, 10),
    approvalStatus,
    redFlags: row.red_flags,
    pathway: row.pathway ?? undefined,
    sourceNote: row.source_note,
  };
}

export async function getDiseaseProtocols(): Promise<MockDisease[]> {
  if (!isSupabaseConfigured()) return mockDiseases;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("disease_protocol_profiles")
      .select("short_title,care_pillar,source_authority,version,last_reviewed,updated_at,approval_status,red_flags,pathway,source_note,disease_topics!inner(slug,name_en,summary_en,aliases)")
      .eq("is_demo", true)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    const protocols = (data as unknown as ProtocolRow[]).map(mapProtocolRow).filter((item): item is MockDisease => item !== null);
    return protocols.length > 0 ? protocols : mockDiseases;
  } catch {
    return mockDiseases;
  }
}

export async function getDiseaseProtocol(id: string) {
  const protocols = await getDiseaseProtocols();
  return protocols.find((protocol) => protocol.id === id);
}
