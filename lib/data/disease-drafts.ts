import "server-only";

import { cache } from "react";
import { getCurrentViewer } from "@/lib/supabase/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { DiseaseDetailSchema } from "@/lib/validations/disease";

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

    // A published current copy takes precedence in the platform. Draft versions remain in
    // version history but are not listed again in Drafts, preventing duplicate topics.
    const publishedTopicIds = new Set<string>();
    const { data: publishedRows, error: publishedError } = await supabase
      .from("clinical_guidelines")
      .select("id,guideline_versions!inner(id)")
      .or(`organization_id.eq.${viewer.organizationId},and(organization_id.is.null,is_shared_reference.eq.true)`)
      .in("status", ["approved", "published"])
      .eq("guideline_versions.is_current", true)
      .in("guideline_versions.status", ["approved", "published"]);
    if (publishedError) return { drafts: [], topicCount: 0, state: "unavailable", isAdmin };
    for (const row of publishedRows ?? []) publishedTopicIds.add(row.id);

    for (let start = 0; ; start += pageSize) {
      const { data, error } = await supabase
        .from("clinical_guidelines")
        .select("id,title,specialty,status,is_shared_reference,organization_id,created_at,guideline_versions!inner(id,version,status,is_current,created_at,source_title,audit:content->evidenceAudit)")
        .or(`organization_id.eq.${viewer.organizationId},and(organization_id.is.null,is_shared_reference.eq.true)`)
        .in("guideline_versions.status", ["draft", "under_review"])
        .order("created_at", { ascending: false })
        .range(start, start + pageSize - 1);

      if (error || !data) return { drafts: [], topicCount: 0, state: "unavailable", isAdmin };

      for (const item of data) {
        if (publishedTopicIds.has(item.id)) continue;
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

    drafts.sort((a, b) => a.title.localeCompare(b.title, "en") || b.createdAt.localeCompare(a.createdAt));
    return { drafts, topicCount: new Set(drafts.map((draft) => draft.id)).size, state: "ready", isAdmin };
  } catch {
    return { drafts: [], topicCount: 0, state: "unavailable", isAdmin };
  }
}

export const getDiseaseDrafts = cache(loadDiseaseDrafts);

export async function getDiseaseDraftTopicCount() {
  const result = await getDiseaseDrafts();
  return result.state === "ready" ? result.topicCount : 0;
}

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
