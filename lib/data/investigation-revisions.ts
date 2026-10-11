import "server-only";
import { requireOrganizationAdmin } from "@/lib/admin/data";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { DiseaseDetailSchema } from "@/lib/validations/disease";

export const investigationRevision = "investigations-2026-10-11-v1";

export async function getInvestigationRevisions() {
  const context = await requireOrganizationAdmin();
  if (context.roleCode !== "platform_admin") return [];
  const supabase = await createSupabaseDataClient();
  const { data, error } = await supabase.from("guideline_versions")
    .select("guideline_id,content,clinical_guidelines!inner(title,is_shared_reference,organization_id)")
    .eq("version", investigationRevision).eq("status", "under_review").eq("is_current", false)
    .eq("clinical_guidelines.is_shared_reference", true).is("clinical_guidelines.organization_id", null);
  if (error) throw new Error("Investigation review drafts could not be loaded.");
  return (data ?? []).flatMap((row) => {
    const parsed = DiseaseDetailSchema.safeParse(row.content);
    return parsed.success && parsed.data.id === row.guideline_id && parsed.data.status === "under_review" && parsed.data.clinicalReviewStatus === "pending"
      ? [{ id: row.guideline_id, title: parsed.data.title, count: parsed.data.investigations.ruleIn.length + parsed.data.investigations.ruleOut.length }] : [];
  }).sort((a, b) => a.title.localeCompare(b.title));
}

export async function getInvestigationRevision(id: string) {
  const context = await requireOrganizationAdmin();
  if (context.roleCode !== "platform_admin") return null;
  const supabase = await createSupabaseDataClient();
  const { data, error } = await supabase.from("guideline_versions")
    .select("guideline_id,content,source_title,source_url,clinical_guidelines!inner(is_shared_reference,organization_id)")
    .eq("guideline_id", id).eq("version", investigationRevision).eq("status", "under_review").eq("is_current", false)
    .eq("clinical_guidelines.is_shared_reference", true).is("clinical_guidelines.organization_id", null).maybeSingle();
  if (error) throw new Error("Investigation review draft could not be loaded.");
  if (!data) return null;
  const parsed = DiseaseDetailSchema.safeParse(data.content);
  if (!parsed.success || parsed.data.id !== data.guideline_id || parsed.data.status !== "under_review" || parsed.data.clinicalReviewStatus !== "pending") return null;
  return { disease: parsed.data, source: data.source_url && /^https?:\/\//.test(data.source_url) ? { title: data.source_title, url: data.source_url } : undefined };
}
