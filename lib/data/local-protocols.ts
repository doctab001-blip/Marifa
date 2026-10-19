import "server-only";

import { cache } from "react";
import { getCurrentViewer } from "@/lib/supabase/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { DiseaseDetailSchema, type DiseaseDetail } from "@/lib/validations/disease";
import { LOCAL_PROTOCOL_SOURCE_TYPE } from "@/lib/local-protocols";

export type PublishedProtocolResult =
  | { state: "ready"; protocol: DiseaseDetail; source?: { title: string; url: string }; publishedAt: string | null; canEdit: boolean; versionId: string }
  | { state: "not-found" | "invalid" | "unavailable" };

/** Loads the current published version of one Local Protocol (organization-owned only). */
export const getPublishedProtocol = cache(async (id: string): Promise<PublishedProtocolResult> => {
  const viewer = await getCurrentViewer();
  if (!viewer || !isSupabaseConfigured() || viewer.organizationId === "pending-membership") return { state: "unavailable" };
  try {
    const supabase = await createSupabaseDataClient();
    const { data, error } = await supabase
      .from("clinical_guidelines")
      .select("id,guideline_versions!inner(id,content,source_title,source_url,published_at)")
      .eq("id", id)
      .eq("source_type", LOCAL_PROTOCOL_SOURCE_TYPE)
      .eq("organization_id", viewer.organizationId)
      .eq("status", "published")
      .eq("guideline_versions.is_current", true)
      .eq("guideline_versions.status", "published")
      .maybeSingle();
    if (error) return { state: "unavailable" };
    if (!data) return { state: "not-found" };
    const version = (Array.isArray(data.guideline_versions) ? data.guideline_versions[0] : data.guideline_versions) as unknown as {
      id: string; content: unknown; source_title: string; source_url: string | null; published_at: string | null;
    } | undefined;
    if (!version) return { state: "not-found" };
    const parsed = DiseaseDetailSchema.safeParse(version.content);
    if (!parsed.success || parsed.data.id !== data.id) return { state: "invalid" };
    return {
      state: "ready",
      protocol: parsed.data,
      source: version.source_url ? { title: version.source_title, url: version.source_url } : undefined,
      publishedAt: version.published_at,
      canEdit: Boolean(viewer.isAdmin),
      versionId: version.id,
    };
  } catch {
    return { state: "unavailable" };
  }
});
