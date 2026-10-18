import "server-only";

import { cache } from "react";
import { getCurrentViewer } from "@/lib/supabase/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { DiseaseDetailSchema } from "@/lib/validations/disease";
import { selectNewestDraftPerTopic } from "@/lib/data/draft-topic-selection";

export type DiseaseDraft = {
  id: string;
  title: string;
  specialty: string;
  guidelineStatus: "draft" | "under_review";
  isSharedReference: boolean;
  versionId: string;
  version: string;
  versionStatus: "draft" | "under_review";
  sourceTitle: string;
  createdAt: string;
  canEdit: boolean;
  canApprove: boolean;
  auditSummary?: string;
};

export type DiseaseManagementVersion = Omit<DiseaseDraft, "guidelineStatus" | "versionStatus" | "canApprove" | "auditSummary"> & {
  guidelineStatus: "approved" | "published";
  versionStatus: "approved" | "published";
  /** When the version reached this state (published_at / approved_at), falling back to its creation time. */
  statusChangedAt: string;
};

async function loadDiseaseDrafts(): Promise<{
  drafts: DiseaseDraft[];
  topicCount: number;
  state: "ready" | "unavailable";
  isAdmin: boolean;
}> {
  const viewer = await getCurrentViewer();
  const isAdmin = Boolean(viewer?.isAdmin);
  const isPlatformAdmin = viewer?.role === "Platform Admin";
  if (!viewer || !isSupabaseConfigured() || viewer.organizationId === "pending-membership") {
    return { drafts: [], topicCount: 0, state: "unavailable", isAdmin };
  }

  try {
    const supabase = await createSupabaseDataClient();
    const drafts: DiseaseDraft[] = [];
    const pageSize = 500;

    for (let start = 0; ; start += pageSize) {
      const { data, error } = await supabase
        .from("clinical_guidelines")
        .select("id,title,specialty,status,is_shared_reference,organization_id,created_at,guideline_versions!inner(id,version,status,is_current,created_at,source_title,audit:content->evidenceAudit)")
        .or(`organization_id.eq.${viewer.organizationId},and(organization_id.is.null,is_shared_reference.eq.true)`)
        // A topic is shown in exactly one queue. Historical draft versions of
        // a topic already moved to Published or Approved remain in storage,
        // but are not repeated in the Drafts queue.
        .in("status", ["draft", "under_review"])
        .in("guideline_versions.status", ["draft", "under_review"])
        .order("created_at", { ascending: false })
        .range(start, start + pageSize - 1);

      if (error || !data) return { drafts: [], topicCount: 0, state: "unavailable", isAdmin };

      for (const item of data) {
        const related = item.guideline_versions as unknown as Array<{
          id: string;
          version: string;
          status: string;
          is_current: boolean;
          created_at: string;
          source_title: string;
          audit?: { scope?: string };
        }>;
        for (const version of related.filter((entry) => ["draft", "under_review"].includes(entry.status))) {
          const canManage = isAdmin && (!item.is_shared_reference || isPlatformAdmin);
          drafts.push({
            id: item.id,
            title: item.title,
            specialty: item.specialty ?? "Unassigned",
            guidelineStatus: version.status as DiseaseDraft["guidelineStatus"],
            isSharedReference: item.is_shared_reference,
            versionId: version.id,
            version: version.version,
            versionStatus: version.status as DiseaseDraft["versionStatus"],
            sourceTitle: version.source_title,
            createdAt: version.created_at,
            canEdit: canManage,
            canApprove: canManage,
            auditSummary: version.audit?.scope,
          });
        }
      }

      if (data.length < pageSize) break;
    }

    const visibleDrafts = selectNewestDraftPerTopic(drafts);
    visibleDrafts.sort((a, b) => a.title.localeCompare(b.title, "en") || b.createdAt.localeCompare(a.createdAt));
    return { drafts: visibleDrafts, topicCount: visibleDrafts.length, state: "ready", isAdmin };
  } catch {
    return { drafts: [], topicCount: 0, state: "unavailable", isAdmin };
  }
}

export const getDiseaseDrafts = cache(loadDiseaseDrafts);

export async function getDiseaseDraftTopicCount() {
  const result = await getDiseaseDrafts();
  return result.state === "ready" ? result.topicCount : 0;
}

export type DiseaseManagementCounts = {
  approved: number;
  drafts: number;
  published: number;
};

/**
 * The three Disease Management tabs are distinct governance queues. Keep their
 * badges sourced from the same loaders as the lists so a tab never displays a
 * total from another state or a raw historical-version count.
 */
export async function getDiseaseManagementCounts(): Promise<DiseaseManagementCounts> {
  const [drafts, approved, published] = await Promise.all([
    getDiseaseDrafts(),
    getDiseaseManagementVersions("approved"),
    getDiseaseManagementVersions("published"),
  ]);
  return {
    drafts: drafts.state === "ready" ? drafts.topicCount : 0,
    approved: approved.state === "ready" ? approved.topicCount : 0,
    published: published.state === "ready" ? published.topicCount : 0,
  };
}

/** Current versions grouped by their explicit governance state for Disease Management. */
export const getDiseaseManagementVersions = cache(async (status: "approved" | "published"): Promise<{
  versions: DiseaseManagementVersion[];
  topicCount: number;
  state: "ready" | "unavailable";
}> => {
  const viewer = await getCurrentViewer();
  const isAdmin = Boolean(viewer?.isAdmin);
  const isPlatformAdmin = viewer?.role === "Platform Admin";
  if (!viewer || !isSupabaseConfigured() || viewer.organizationId === "pending-membership") {
    return { versions: [], topicCount: 0, state: "unavailable" };
  }

  try {
    const supabase = await createSupabaseDataClient();
    const query = supabase
      .from("clinical_guidelines")
      .select("id,title,specialty,status,is_shared_reference,guideline_versions!inner(id,version,status,is_current,created_at,published_at,approved_at,source_title)")
      .or(`organization_id.eq.${viewer.organizationId},and(organization_id.is.null,is_shared_reference.eq.true)`)
      // A topic belongs to exactly one governance tab. Once its parent record
      // is approved, older published versions remain history but are excluded
      // from the Published queue.
      .eq("status", status)
      .eq("guideline_versions.status", status)
      .eq("guideline_versions.is_current", true)
      .order("title", { ascending: true });
    const { data, error } = await query;
    if (error) return { versions: [], topicCount: 0, state: "unavailable" };

    const versions: DiseaseManagementVersion[] = [];
    for (const item of data ?? []) {
      const version = (Array.isArray(item.guideline_versions) ? item.guideline_versions[0] : item.guideline_versions) as unknown as {
        id: string; version: string; status: "approved" | "published"; created_at: string; published_at: string | null; approved_at: string | null; source_title: string;
      } | null;
      if (!version) continue;
      const canManage = isAdmin && (!item.is_shared_reference || isPlatformAdmin);
      versions.push({
        id: item.id,
        title: item.title,
        specialty: item.specialty ?? "Unassigned",
        guidelineStatus: status,
        isSharedReference: item.is_shared_reference,
        versionId: version.id,
        version: version.version,
        versionStatus: status,
        sourceTitle: version.source_title,
        createdAt: version.created_at,
        statusChangedAt: (status === "published" ? version.published_at : version.approved_at) ?? version.created_at,
        // Published versions are editable; Approved exposes a separate action that
        // creates a draft copy instead of mutating the live approval record.
        canEdit: canManage,
      });
    }
    return { versions, topicCount: new Set(versions.map((version) => version.id)).size, state: "ready" };
  } catch {
    return { versions: [], topicCount: 0, state: "unavailable" };
  }
});

export async function getDiseaseDraftVersion(versionId: string) {
  const viewer = await getCurrentViewer();
  if (!viewer || !isSupabaseConfigured() || viewer.organizationId === "pending-membership") {
    return { state: "unavailable" as const };
  }

  try {
    const supabase = await createSupabaseDataClient();
    const { data, error } = await supabase
      .from("guideline_versions")
      .select("id,status,content,source_title,source_url,clinical_guidelines!inner(id,organization_id,is_shared_reference)")
      .eq("id", versionId)
      .in("status", ["draft", "under_review"])
      .maybeSingle();
    if (error || !data) return { state: "not-found" as const };
    const guideline = Array.isArray(data.clinical_guidelines) ? data.clinical_guidelines[0] : data.clinical_guidelines;
    if (!guideline || (!guideline.is_shared_reference && guideline.organization_id !== viewer.organizationId)) {
      return { state: "not-found" as const };
    }
    const parsed = DiseaseDetailSchema.safeParse(data.content);
    if (!parsed.success) return { state: "invalid" as const };
    return {
      state: "ready" as const,
      disease: parsed.data,
      source: data.source_url ? { title: data.source_title, url: data.source_url } : undefined,
    };
  } catch {
    return { state: "unavailable" as const };
  }
}
