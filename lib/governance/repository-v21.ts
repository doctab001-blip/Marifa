import "server-only";
import { pageAll, type Ctx } from "@/lib/governance/repository";
import { parseCriteria, type AuditTemplateRow, type ObservationRow, type QipCycleRow } from "@/lib/governance/audit-measures";
import type { AttendanceRow, CommitteeMemberRow, CommitteeRow, DecisionRow, MeetingRow } from "@/lib/governance/committees";
import type { EvidenceLinkRow, EvidenceWithVersion, RequirementRow, SubmissionRow } from "@/lib/governance/evidence-requirements";
import type { GovernedGuideline, GuidelineReviewRow, LinkRow, LinkType } from "@/lib/governance/guideline-governance";
import type { ChapterRow, EditionRow, ElementRow, ElementStatusRow } from "@/lib/governance/hierarchy";
import type { IndicatorResultRow, IndicatorRow } from "@/lib/governance/indicators";
import type { NotificationRow, RegulatoryRuleRow } from "@/lib/governance/regulatory";

/**
 * Read side of the Governance Hub V2.1 tables (migration 20261021090000). Same rules as repository.ts: every query is
 * scoped to the actor's organisation and filtered again by row-level security.
 *
 * Pages call these through `v21()` so that, until the V2.1 migration has been applied, the existing hub keeps working and
 * the new panels explain what is missing instead of failing the whole page.
 */

type Row = Record<string, unknown>;

/** snake_case row -> camelCase object. Values are passed through as PostgREST returns them (numbers, strings, json). */
function camel<T>(r: Row): T {
  const out: Row = {};
  for (const [k, v] of Object.entries(r)) out[k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())] = v;
  return out as T;
}
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

export class V21MissingError extends Error {
  constructor(cause: unknown) {
    super(`Governance Hub V2.1 data is unavailable: ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = "V21MissingError";
  }
}

/** Runs a V2.1 load; resolves to null (and logs why) if the V2.1 tables are not there or cannot be read. */
export async function v21<T>(work: Promise<T>): Promise<T | null> {
  try {
    return await work;
  } catch (error) {
    console.error("[governance-v21] load failed", error);
    return null;
  }
}

const org = (ctx: Ctx) => ctx.actor.organizationId;

/* ---- hierarchy ---------------------------------------------------------------------------------------------------- */

export async function loadEditions(ctx: Ctx): Promise<EditionRow[]> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_editions").select("*").eq("organization_id", org(ctx)).order("created_at").order("id").range(f, t));
  return rows.map((r) => camel<EditionRow>(r));
}

export async function loadChapters(ctx: Ctx): Promise<ChapterRow[]> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_chapters").select("id, edition_id, code, name, sort_order").eq("organization_id", org(ctx)).order("code").order("name").order("id").range(f, t));
  return rows.map((r) => camel<ChapterRow>(r));
}

/** Edition id / official flag / provenance for every standard (columns added by V2.1). */
export async function loadStandardHierarchy(ctx: Ctx): Promise<Map<string, { editionId: string | null; chapterId: string | null; isOfficial: boolean; sourceReference: string }>> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_standards").select("id, edition_id, chapter_id, is_official, source_reference").eq("organization_id", org(ctx)).order("id").range(f, t));
  return new Map(rows.map((r) => [String(r.id), { editionId: (r.edition_id as string) ?? null, chapterId: (r.chapter_id as string) ?? null, isOfficial: r.is_official !== false, sourceReference: String(r.source_reference ?? "") }]));
}

export async function loadElements(ctx: Ctx, standardId?: string): Promise<ElementRow[]> {
  const rows = await pageAll((f, t) => {
    let query = ctx.client.from("gov_elements").select("*").eq("organization_id", org(ctx)).eq("is_active", true);
    if (standardId) query = query.eq("standard_id", standardId);
    return query.order("standard_id").order("sort_order").order("code").order("id").range(f, t);
  });
  return rows.map((r) => camel<ElementRow>(r));
}

export async function loadElementStatuses(ctx: Ctx, standardId?: string): Promise<ElementStatusRow[]> {
  const rows = await pageAll((f, t) => {
    let query = ctx.client.from("gov_element_status").select("*").eq("organization_id", org(ctx));
    if (standardId) query = query.eq("standard_id", standardId);
    return query.order("element_id").range(f, t);
  });
  return rows.map((r) => camel<ElementStatusRow>(r));
}

export async function loadElementHistory(ctx: Ctx, elementIds: string[]) {
  if (elementIds.length === 0) return [];
  const rows = await pageAll((f, t) => ctx.client.from("gov_element_assessments").select("*").eq("organization_id", org(ctx)).in("element_id", elementIds).order("assessed_at", { ascending: false }).order("id").range(f, t));
  return rows.map((r) => camel<{ id: string; elementId: string; rating: string; method: string; notes: string; assessedBy: string | null; assessedAt: string; nextReviewDue: string | null }>(r));
}

/* ---- evidence vault ---------------------------------------------------------------------------------------------------- */

export async function loadEvidenceVersions(ctx: Ctx, standardId?: string): Promise<EvidenceWithVersion[]> {
  const rows = await pageAll((f, t) => {
    let query = ctx.client.from("gov_evidence").select("*").eq("organization_id", org(ctx));
    if (standardId) query = query.eq("standard_id", standardId);
    return query.order("uploaded_at", { ascending: false }).order("id").range(f, t);
  });
  return rows.map((r) => ({ ...camel<EvidenceWithVersion>(r), sizeBytes: num(r.size_bytes), supersedesId: (r.supersedes_id as string) ?? null }));
}

export async function loadEvidenceByIds(ctx: Ctx, ids: string[]): Promise<EvidenceWithVersion[]> {
  if (ids.length === 0) return [];
  const rows = await pageAll((f, t) => ctx.client.from("gov_evidence").select("*").eq("organization_id", org(ctx)).in("id", ids).order("id").range(f, t));
  return rows.map((r) => ({ ...camel<EvidenceWithVersion>(r), sizeBytes: num(r.size_bytes), supersedesId: (r.supersedes_id as string) ?? null }));
}

export async function loadEvidenceLinks(ctx: Ctx, filter: { standardId?: string; elementIds?: string[]; evidenceIds?: string[] } = {}): Promise<EvidenceLinkRow[]> {
  const rows = await pageAll((f, t) => {
    let query = ctx.client.from("gov_evidence_links").select("id, evidence_id, standard_id, element_id, linked_at, unlinked_at").eq("organization_id", org(ctx)).is("unlinked_at", null);
    if (filter.standardId && filter.elementIds?.length) query = query.or(`standard_id.eq.${filter.standardId},element_id.in.(${filter.elementIds.join(",")})`);
    else if (filter.standardId) query = query.eq("standard_id", filter.standardId);
    else if (filter.elementIds) query = query.in("element_id", filter.elementIds.length ? filter.elementIds : ["00000000-0000-0000-0000-000000000000"]);
    if (filter.evidenceIds) query = query.in("evidence_id", filter.evidenceIds.length ? filter.evidenceIds : ["00000000-0000-0000-0000-000000000000"]);
    return query.order("linked_at").order("id").range(f, t);
  });
  return rows.map((r) => camel<EvidenceLinkRow>(r));
}

export async function loadRequirements(ctx: Ctx, filter: { standardId?: string; elementIds?: string[] } = {}): Promise<RequirementRow[]> {
  const rows = await pageAll((f, t) => {
    let query = ctx.client.from("gov_evidence_requirements").select("*").eq("organization_id", org(ctx));
    if (filter.standardId && filter.elementIds?.length) query = query.or(`standard_id.eq.${filter.standardId},element_id.in.(${filter.elementIds.join(",")})`);
    else if (filter.standardId) query = query.eq("standard_id", filter.standardId);
    return query.order("created_at").order("id").range(f, t);
  });
  return rows.map((r) => camel<RequirementRow>(r));
}

export async function loadSubmissions(ctx: Ctx, requirementIds?: string[]): Promise<SubmissionRow[]> {
  if (requirementIds && requirementIds.length === 0) return [];
  const rows = await pageAll((f, t) => {
    let query = ctx.client.from("gov_requirement_submissions").select("*").eq("organization_id", org(ctx));
    if (requirementIds) query = query.in("requirement_id", requirementIds);
    return query.order("submitted_at", { ascending: false }).order("id").range(f, t);
  });
  return rows.map((r) => camel<SubmissionRow>(r));
}

/* ---- indicators --------------------------------------------------------------------------------------------------------- */

const mapIndicator = (r: Row): IndicatorRow => ({ ...camel<IndicatorRow>(r), rateMultiplier: num(r.rate_multiplier), targetValue: num(r.target_value), targetUpper: num(r.target_upper) });
const mapResult = (r: Row): IndicatorResultRow => ({ ...camel<IndicatorResultRow>(r), numerator: num(r.numerator), denominator: num(r.denominator), value: num(r.value), sampleSize: num(r.sample_size) });

export async function loadIndicators(ctx: Ctx): Promise<IndicatorRow[]> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_indicators").select("*").eq("organization_id", org(ctx)).order("code").order("id").range(f, t));
  return rows.map(mapIndicator);
}

export async function loadIndicatorById(ctx: Ctx, id: string): Promise<IndicatorRow | null> {
  const { data, error } = await ctx.client.from("gov_indicators").select("*").eq("organization_id", org(ctx)).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapIndicator(data as Row) : null;
}

export async function loadIndicatorResults(ctx: Ctx, indicatorId?: string): Promise<IndicatorResultRow[]> {
  const rows = await pageAll((f, t) => {
    let query = ctx.client.from("gov_indicator_results").select("*").eq("organization_id", org(ctx));
    if (indicatorId) query = query.eq("indicator_id", indicatorId);
    return query.order("period_start").order("entered_at").order("id").range(f, t);
  });
  return rows.map(mapResult);
}

/* ---- committees ------------------------------------------------------------------------------------------------------------- */

export async function loadCommittees(ctx: Ctx): Promise<CommitteeRow[]> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_committees").select("*").eq("organization_id", org(ctx)).order("name").order("id").range(f, t));
  return rows.map((r) => camel<CommitteeRow>(r));
}

export async function loadCommitteeMembers(ctx: Ctx, committeeId?: string): Promise<CommitteeMemberRow[]> {
  const rows = await pageAll((f, t) => {
    let query = ctx.client.from("gov_committee_members").select("id, committee_id, user_id, member_role").eq("organization_id", org(ctx));
    if (committeeId) query = query.eq("committee_id", committeeId);
    return query.order("added_at").order("id").range(f, t);
  });
  return rows.map((r) => camel<CommitteeMemberRow>(r));
}

export async function loadMeetings(ctx: Ctx, committeeId?: string): Promise<MeetingRow[]> {
  const rows = await pageAll((f, t) => {
    let query = ctx.client.from("gov_meetings").select("*").eq("organization_id", org(ctx));
    if (committeeId) query = query.eq("committee_id", committeeId);
    return query.order("scheduled_at", { ascending: false }).order("id").range(f, t);
  });
  return rows.map((r) => camel<MeetingRow>(r));
}

export async function loadAttendance(ctx: Ctx, meetingId: string): Promise<AttendanceRow[]> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_meeting_attendance").select("id, meeting_id, user_id, status").eq("organization_id", org(ctx)).eq("meeting_id", meetingId).order("id").range(f, t));
  return rows.map((r) => camel<AttendanceRow>(r));
}

export async function loadDecisions(ctx: Ctx, meetingIds: string[]): Promise<DecisionRow[]> {
  if (meetingIds.length === 0) return [];
  const rows = await pageAll((f, t) => ctx.client.from("gov_meeting_decisions").select("id, meeting_id, decision, created_by, created_at").eq("organization_id", org(ctx)).in("meeting_id", meetingIds).order("created_at").order("id").range(f, t));
  return rows.map((r) => camel<DecisionRow>(r));
}

export async function loadMeetingFiles(ctx: Ctx, meetingId: string) {
  const rows = await pageAll((f, t) => ctx.client.from("gov_meeting_files").select("id, file_name, storage_path, size_bytes, uploaded_at").eq("organization_id", org(ctx)).eq("meeting_id", meetingId).order("uploaded_at").range(f, t));
  return rows.map((r) => ({ id: String(r.id), fileName: String(r.file_name), storagePath: String(r.storage_path), sizeBytes: num(r.size_bytes) }));
}

/** CAPA columns added by V2.1 (meeting source, completion evidence, effectiveness), keyed by CAPA id. */
export type CapaExtras = {
  meetingId: string | null;
  decisionId: string | null;
  completionNote: string;
  completionEvidencePath: string | null;
  completionFileName: string | null;
  effectiveness: "not_assessed" | "effective" | "partially_effective" | "not_effective";
  effectivenessCheckedBy: string | null;
  effectivenessCheckedAt: string | null;
};

export async function loadCapaExtras(ctx: Ctx): Promise<Map<string, CapaExtras>> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_capa")
    .select("id, meeting_id, decision_id, completion_note, completion_evidence_path, completion_file_name, effectiveness, effectiveness_checked_by, effectiveness_checked_at")
    .eq("organization_id", org(ctx)).order("id").range(f, t));
  return new Map(rows.map((r) => [String(r.id), camel<CapaExtras>(r)]));
}

/* ---- incidents ------------------------------------------------------------------------------------------------------------------ */

export type IncidentExtras = {
  investigatorUserId: string | null;
  investigationStartedOn: string | null;
  investigationCompletedOn: string | null;
  linkedPolicyId: string | null;
  linkedGuidelineId: string | null;
};

export async function loadIncidentExtras(ctx: Ctx, incidentId: string): Promise<IncidentExtras | null> {
  const { data, error } = await ctx.client.from("gov_incidents")
    .select("investigator_user_id, investigation_started_on, investigation_completed_on, linked_policy_id, linked_guideline_id")
    .eq("organization_id", org(ctx)).eq("id", incidentId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? camel<IncidentExtras>(data as Row) : null;
}

export async function loadIncidentHistory(ctx: Ctx, incidentId: string) {
  const rows = await pageAll((f, t) => ctx.client.from("gov_incident_status_history").select("id, from_status, to_status, changed_by, changed_at").eq("organization_id", org(ctx)).eq("incident_id", incidentId).order("changed_at").order("id").range(f, t));
  return rows.map((r) => camel<{ id: string; fromStatus: string | null; toStatus: string; changedBy: string | null; changedAt: string }>(r));
}

export async function loadIncidentFileKinds(ctx: Ctx, incidentId: string): Promise<Map<string, string>> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_incident_files").select("id, kind").eq("incident_id", incidentId).order("id").range(f, t));
  return new Map(rows.map((r) => [String(r.id), String(r.kind ?? "report")]));
}

export async function loadRegulatoryRules(ctx: Ctx): Promise<RegulatoryRuleRow[]> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_regulatory_rules").select("*").eq("organization_id", org(ctx)).order("name").order("id").range(f, t));
  return rows.map((r) => ({ ...camel<RegulatoryRuleRow>(r), categories: Array.isArray(r.categories) ? (r.categories as string[]) : [] }));
}

export async function loadNotifications(ctx: Ctx, incidentId?: string): Promise<NotificationRow[]> {
  const rows = await pageAll((f, t) => {
    let query = ctx.client.from("gov_incident_notifications").select("id, incident_id, rule_id, reported_at, external_reference, note").eq("organization_id", org(ctx));
    if (incidentId) query = query.eq("incident_id", incidentId);
    return query.order("reported_at").order("id").range(f, t);
  });
  return rows.map((r) => camel<NotificationRow>(r));
}

/* ---- audits and QIPs --------------------------------------------------------------------------------------------------------------- */

export async function loadAuditTemplates(ctx: Ctx): Promise<AuditTemplateRow[]> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_audit_templates").select("*").eq("organization_id", org(ctx)).order("title").order("id").range(f, t));
  return rows.map((r) => ({ ...camel<AuditTemplateRow>(r), criteria: parseCriteria(r.criteria), sampleSize: num(r.sample_size), reauditIntervalMonths: num(r.reaudit_interval_months) }));
}

export type AuditExtras = { templateId: string | null; objective: string; numerator: number | null; denominator: number | null; actionPlan: string; reauditDue: string | null; sourceQipId: string | null };

export async function loadAuditExtras(ctx: Ctx): Promise<Map<string, AuditExtras>> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_audits").select("id, template_id, objective, numerator, denominator, action_plan, reaudit_due, source_qip_id").eq("organization_id", org(ctx)).order("id").range(f, t));
  return new Map(rows.map((r) => [String(r.id), { ...camel<AuditExtras>(r), numerator: num(r.numerator), denominator: num(r.denominator) }]));
}

export async function loadObservations(ctx: Ctx, auditId: string): Promise<ObservationRow[]> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_audit_observations").select("*").eq("organization_id", org(ctx)).eq("audit_id", auditId).order("recorded_at").order("id").range(f, t));
  return rows.map((r) => ({ ...camel<ObservationRow>(r), results: (r.results ?? {}) as ObservationRow["results"] }));
}

export async function loadQipCycles(ctx: Ctx, qipId?: string): Promise<QipCycleRow[]> {
  const rows = await pageAll((f, t) => {
    let query = ctx.client.from("gov_qip_cycles").select("*").eq("organization_id", org(ctx));
    if (qipId) query = query.eq("qip_id", qipId);
    return query.order("qip_id").order("cycle_no").range(f, t);
  });
  return rows.map((r) => camel<QipCycleRow>(r));
}

export async function loadQipSources(ctx: Ctx): Promise<Map<string, { sourceAuditId: string | null; sourceIncidentId: string | null }>> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_qips").select("id, source_audit_id, source_incident_id").eq("organization_id", org(ctx)).order("id").range(f, t));
  return new Map(rows.map((r) => [String(r.id), { sourceAuditId: (r.source_audit_id as string) ?? null, sourceIncidentId: (r.source_incident_id as string) ?? null }]));
}

/* ---- guideline governance and links -------------------------------------------------------------------------------------------------- */

/**
 * Marifa's own guidelines/protocols for this organisation, with the CURRENT version's number and review date. Only metadata
 * is selected; version content is never read here.
 */
export async function loadGovernedGuidelines(ctx: Ctx): Promise<GovernedGuideline[]> {
  const { data, error } = await ctx.client.from("clinical_guidelines")
    .select("id, title, source_type, organization_id, responsible_owner_id, guideline_versions(id, version, status, is_current, review_date, last_verified_date, published_at)")
    .eq("organization_id", org(ctx))
    .order("title");
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map((g) => {
    const versions = (Array.isArray(g.guideline_versions) ? g.guideline_versions : []) as Row[];
    const current = versions.find((v) => v.is_current === true) ?? null;
    return {
      id: String(g.id),
      title: String(g.title ?? "Untitled"),
      sourceType: String(g.source_type ?? ""),
      isLocal: String(g.source_type ?? "").toLowerCase().includes("local"),
      ownerUserId: (g.responsible_owner_id as string) ?? null,
      currentVersionId: current ? String(current.id) : null,
      currentVersion: current ? String(current.version ?? "") : null,
      currentVersionStatus: current ? String(current.status ?? "") : null,
      lastReviewed: current ? ((current.last_verified_date as string) ?? (current.published_at as string)?.slice(0, 10) ?? null) : null,
      reviewDate: current ? ((current.review_date as string) ?? null) : null,
    };
  });
}

export async function loadGuidelineVersions(ctx: Ctx, guidelineId: string) {
  const { data, error } = await ctx.client.from("guideline_versions").select("id, version, status, is_current, review_date, published_at").eq("guideline_id", guidelineId).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map((v) => camel<{ id: string; version: string; status: string; isCurrent: boolean; reviewDate: string | null; publishedAt: string | null }>(v));
}

export async function loadGuidelineReviews(ctx: Ctx): Promise<GuidelineReviewRow[]> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_guideline_reviews").select("*").eq("organization_id", org(ctx)).order("id").range(f, t));
  return rows.map((r) => camel<GuidelineReviewRow>(r));
}

export async function loadLinks(ctx: Ctx, about?: { type: LinkType; ids: string[] }): Promise<LinkRow[]> {
  const rows = await pageAll((f, t) => {
    let query = ctx.client.from("gov_links").select("id, source_type, source_id, target_type, target_id, target_version_id, note, created_at").eq("organization_id", org(ctx));
    if (about && about.ids.length > 0) {
      const ids = about.ids.join(",");
      query = query.or(`and(source_type.eq.${about.type},source_id.in.(${ids})),and(target_type.eq.${about.type},target_id.in.(${ids}))`);
    }
    return query.order("created_at").order("id").range(f, t);
  });
  return rows.map((r) => camel<LinkRow>(r));
}

/** Governance summary for one guideline, readable by any member of the organisation (security-definer RPC). */
export async function loadGuidelineSummary(ctx: Ctx, guidelineId: string) {
  const { data, error } = await ctx.client.rpc("gov_guideline_summary", { p_org: org(ctx), p_guideline: guidelineId });
  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : data) as Row | undefined;
  if (!row) return null;
  return {
    status: String(row.status ?? "not_reviewed"),
    governedVersionId: (row.governed_version_id as string) ?? null,
    nextReviewDue: (row.next_review_due as string) ?? null,
    standardCodes: (row.standard_codes as string[]) ?? [],
    elementCodes: (row.element_codes as string[]) ?? [],
    indicatorTitles: (row.indicator_titles as string[]) ?? [],
  };
}

/* ---- link catalogue: what a record can be linked to, with readable labels -------------------------------------------------- */

export type LinkOption = { type: LinkType; id: string; label: string; versionId?: string | null };

/**
 * Readable labels for records of the requested types, for the link picker and for showing existing links. Each type is
 * loaded independently, so a type whose table is not there yet simply contributes nothing.
 */
export async function loadLinkCatalogue(ctx: Ctx, types: LinkType[]): Promise<LinkOption[]> {
  const o = org(ctx);
  const c = ctx.client;
  const load: Partial<Record<LinkType, () => Promise<LinkOption[]>>> = {
    standard: async () => (await pageAll((f, t) => c.from("gov_standards").select("id, code, description").eq("organization_id", o).eq("is_active", true).order("code").range(f, t)))
      .map((r) => ({ type: "standard", id: String(r.id), label: `${r.code} — ${String(r.description).slice(0, 70)}` })),
    element: async () => {
      const std = new Map((await pageAll((f, t) => c.from("gov_standards").select("id, code").eq("organization_id", o).order("id").range(f, t))).map((r) => [String(r.id), String(r.code)]));
      return (await pageAll((f, t) => c.from("gov_elements").select("id, standard_id, code, description").eq("organization_id", o).eq("is_active", true).order("code").range(f, t)))
        .map((r) => ({ type: "element", id: String(r.id), label: `${std.get(String(r.standard_id)) ?? "?"} / ${r.code} — ${String(r.description).slice(0, 60)}` }));
    },
    policy: async () => (await pageAll((f, t) => c.from("gov_policies").select("id, title, version, status").eq("organization_id", o).order("title").range(f, t)))
      .map((r) => ({ type: "policy", id: String(r.id), label: `${r.title} v${r.version} (${String(r.status).replace(/_/g, " ")})` })),
    guideline: async () => (await loadGovernedGuidelines(ctx)).map((g) => ({ type: "guideline" as const, id: g.id, label: `${g.title}${g.currentVersion ? ` v${g.currentVersion}` : ""}`, versionId: g.currentVersionId })),
    capa: async () => (await pageAll((f, t) => c.from("gov_capa").select("id, action, due_date, status").eq("organization_id", o).order("due_date").range(f, t)))
      .map((r) => ({ type: "capa", id: String(r.id), label: `${String(r.action).slice(0, 70)} (due ${r.due_date}, ${String(r.status).replace(/_/g, " ")})` })),
    audit: async () => (await pageAll((f, t) => c.from("gov_audits").select("id, title, scheduled_for, status").eq("organization_id", o).order("scheduled_for", { ascending: false }).range(f, t)))
      .map((r) => ({ type: "audit", id: String(r.id), label: `${r.title} (${r.scheduled_for}, ${r.status})` })),
    qip: async () => (await pageAll((f, t) => c.from("gov_qips").select("id, title, status").eq("organization_id", o).order("title").range(f, t)))
      .map((r) => ({ type: "qip", id: String(r.id), label: `${r.title} (${r.status})` })),
    indicator: async () => (await pageAll((f, t) => c.from("gov_indicators").select("id, code, title").eq("organization_id", o).order("code").range(f, t)))
      .map((r) => ({ type: "indicator", id: String(r.id), label: `${r.code} — ${r.title}` })),
    incident: async () => (await pageAll((f, t) => c.from("gov_incidents").select("id, reference, title").eq("organization_id", o).order("occurred_at", { ascending: false }).range(f, t)))
      .map((r) => ({ type: "incident", id: String(r.id), label: `${r.reference} — ${String(r.title).slice(0, 60)}` })),
    decision: async () => (await pageAll((f, t) => c.from("gov_meeting_decisions").select("id, decision, created_at").eq("organization_id", o).order("created_at", { ascending: false }).range(f, t)))
      .map((r) => ({ type: "decision", id: String(r.id), label: `${String(r.created_at).slice(0, 10)}: ${String(r.decision).slice(0, 70)}` })),
    committee: async () => (await pageAll((f, t) => c.from("gov_committees").select("id, name").eq("organization_id", o).order("name").range(f, t)))
      .map((r) => ({ type: "committee", id: String(r.id), label: String(r.name) })),
    audit_template: async () => (await pageAll((f, t) => c.from("gov_audit_templates").select("id, title").eq("organization_id", o).order("title").range(f, t)))
      .map((r) => ({ type: "audit_template", id: String(r.id), label: String(r.title) })),
  };
  const parts = await Promise.all(types.map((type) => (load[type] ? load[type]!().catch(() => []) : Promise.resolve([]))));
  return parts.flat();
}

/**
 * The evidence list the readiness maths should use, matching the database guard (gov_has_current_evidence):
 * a file linked to another standard counts there too, and a file replaced by a newer version no longer counts.
 * Before the V2.1 migration this returns the list unchanged.
 */
export async function effectiveEvidence<T extends { id: string; standardId: string; withdrawnAt: string | null }>(ctx: Ctx, evidence: T[]): Promise<T[]> {
  const extra = await v21(Promise.all([
    loadEvidenceLinks(ctx),
    pageAll((f, t) => ctx.client.from("gov_evidence").select("supersedes_id, withdrawn_at").eq("organization_id", org(ctx)).not("supersedes_id", "is", null).order("id").range(f, t)),
  ]));
  if (!extra) return evidence;
  const [links, versions] = extra;
  const replaced = new Set(versions.filter((v) => !v.withdrawn_at).map((v) => String(v.supersedes_id)));
  const current = evidence.filter((e) => !replaced.has(e.id));
  const byId = new Map(current.map((e) => [e.id, e]));
  const linked: T[] = [];
  for (const link of links) {
    const item = link.standardId ? byId.get(link.evidenceId) : undefined;
    if (item && link.standardId && item.standardId !== link.standardId) linked.push({ ...item, standardId: link.standardId });
  }
  return [...current, ...linked];
}
