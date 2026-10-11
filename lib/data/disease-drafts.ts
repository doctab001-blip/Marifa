import "server-only";

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
};

export async function getDiseaseDrafts(): Promise<{
  drafts: DiseaseDraft[];
  state: "ready" | "unavailable";
  isAdmin: boolean;
}> {
  const viewer = await getCurrentViewer();
  const isAdmin = Boolean(viewer?.isAdmin);
  const isPlatformAdmin = viewer?.role === "Platform Admin";
  if (!viewer || !isSupabaseConfigured() || viewer.organizationId === "pending-membership") {
    return { drafts: [], state: "unavailable", isAdmin };
  }

  try {
    const supabase = await createSupabaseDataClient();
    const drafts: DiseaseDraft[] = [];
    const pageSize = 500;

    for (let start = 0; ; start += pageSize) {
      const { data, error } = await supabase
        .from("clinical_guidelines")
        .select("id,title,specialty,status,is_shared_reference,organization_id,created_at,guideline_versions!inner(id,version,status,is_current,created_at,source_title)")
        .or(`organization_id.eq.${viewer.organizationId},and(organization_id.is.null,is_shared_reference.eq.true)`)
        .in("guideline_versions.status", ["draft", "under_review"])
        .order("created_at", { ascending: false })
        .range(start, start + pageSize - 1);

      if (error || !data) return { drafts: [], state: "unavailable", isAdmin };

      for (const item of data) {
        const related = item.guideline_versions as unknown as Array<{
          id: string;
          version: string;
          status: string;
          is_current: boolean;
          created_at: string;
          source_title: string;
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
          });
        }
      }

      if (data.length < pageSize) break;
    }

    drafts.sort((a, b) => a.title.localeCompare(b.title, "en") || b.createdAt.localeCompare(a.createdAt));
    return { drafts, state: "ready", isAdmin };
  } catch {
    return { drafts: [], state: "unavailable", isAdmin };
  }
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
