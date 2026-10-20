import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import type { GovActor } from "@/lib/governance/policy";
import type { PolicyAckSummary } from "@/lib/governance/scoring";
import {
  DEFAULT_SETTINGS,
  type AuditRow, type CapaRow, type EvidenceRow, type GovSettings, type IncidentRow, type Person, type PolicyRow, type QipRow,
  type StandardRow, type StandardStatusRow,
} from "@/lib/governance/types";

/**
 * Read side of the Accreditation Hub. Every query is scoped to the actor's organisation AND filtered by row-level security in
 * the database, so a mistake here can never widen access. Supabase returns at most 1,000 rows per request, so lists are paged.
 */

type Row = Record<string, unknown>;
export type Ctx = { client: SupabaseClient; actor: GovActor };

export async function openContext(actor: GovActor): Promise<Ctx> {
  return { client: await createSupabaseDataClient(), actor };
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const strOrNull = (v: unknown) => (typeof v === "string" ? v : null);
const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));
const numOrNull = (v: unknown) => (v === null || v === undefined ? null : Number(v));
const bool = (v: unknown) => v === true;

const PAGE = 1000;
async function pageAll(fetchPage: (from: number, to: number) => PromiseLike<{ data: Row[] | null; error: { message: string } | null }>): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await fetchPage(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return rows;
  }
}

function must<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

/* ---- mappers ---- */

const mapStandard = (r: Row): StandardRow => ({
  id: str(r.id), edition: str(r.edition), chapterCode: str(r.chapter_code), chapterName: str(r.chapter_name), code: str(r.code),
  description: str(r.description), isEsr: bool(r.is_esr), department: str(r.department), ownerUserId: strOrNull(r.owner_user_id),
  reviewIntervalMonths: num(r.review_interval_months) || 12,
});
const mapStatus = (r: Row): StandardStatusRow => ({
  standardId: str(r.standard_id), rating: (strOrNull(r.rating) as StandardStatusRow["rating"]), method: (strOrNull(r.method) as StandardStatusRow["method"]),
  notes: str(r.notes), assessedAt: strOrNull(r.assessed_at), nextReviewDue: strOrNull(r.next_review_due),
});
const mapEvidence = (r: Row): EvidenceRow => ({
  id: str(r.id), standardId: str(r.standard_id), title: str(r.title), evidenceType: (str(r.evidence_type) || "other") as EvidenceRow["evidenceType"],
  storagePath: str(r.storage_path), fileName: str(r.file_name), sizeBytes: numOrNull(r.size_bytes), validFrom: strOrNull(r.valid_from),
  validUntil: strOrNull(r.valid_until), uploadedAt: str(r.uploaded_at), uploadedBy: strOrNull(r.uploaded_by),
  withdrawnAt: strOrNull(r.withdrawn_at), withdrawnReason: strOrNull(r.withdrawn_reason),
});
const mapPolicy = (r: Row): PolicyRow => ({
  id: str(r.id), title: str(r.title), documentNumber: str(r.document_number), version: str(r.version), status: str(r.status) as PolicyRow["status"],
  department: str(r.department), ownerUserId: strOrNull(r.owner_user_id), effectiveDate: strOrNull(r.effective_date), nextReviewDue: strOrNull(r.next_review_due),
  storagePath: strOrNull(r.storage_path), fileName: strOrNull(r.file_name), clinicalGuidelineId: strOrNull(r.clinical_guideline_id),
  approvedAt: strOrNull(r.approved_at), createdAt: str(r.created_at),
});
const mapIncident = (r: Row): IncidentRow => ({
  id: str(r.id), reference: str(r.reference), title: str(r.title), category: str(r.category), description: str(r.description),
  sbar: (r.sbar && typeof r.sbar === "object" ? r.sbar : {}) as IncidentRow["sbar"], occurredAt: str(r.occurred_at), department: str(r.department),
  location: str(r.location), patientMrn: strOrNull(r.patient_mrn), severity: str(r.severity) as IncidentRow["severity"], likelihood: num(r.likelihood),
  impact: num(r.impact), riskScore: num(r.risk_score), isSentinel: bool(r.is_sentinel), status: str(r.status) as IncidentRow["status"],
  rootCause: str(r.root_cause), closureNote: str(r.closure_note), reportedBy: strOrNull(r.reported_by), createdAt: str(r.created_at), closedAt: strOrNull(r.closed_at),
});
const mapCapa = (r: Row): CapaRow => ({
  id: str(r.id), incidentId: strOrNull(r.incident_id), auditId: strOrNull(r.audit_id), action: str(r.action), kind: str(r.kind) as CapaRow["kind"],
  ownerUserId: str(r.owner_user_id), dueDate: str(r.due_date), status: str(r.status) as CapaRow["status"], doneAt: strOrNull(r.done_at),
  verifiedBy: strOrNull(r.verified_by), verifiedAt: strOrNull(r.verified_at), verificationNote: str(r.verification_note),
});
const mapAudit = (r: Row): AuditRow => ({
  id: str(r.id), title: str(r.title), category: str(r.category), standardId: strOrNull(r.standard_id), department: str(r.department),
  ownerUserId: strOrNull(r.owner_user_id), scheduledFor: str(r.scheduled_for), recurrenceMonths: numOrNull(r.recurrence_months),
  targetPct: numOrNull(r.target_pct), status: str(r.status) as AuditRow["status"], sampleSize: numOrNull(r.sample_size),
  resultPct: numOrNull(r.result_pct), findings: str(r.findings), completedAt: strOrNull(r.completed_at),
});
const mapQip = (r: Row): QipRow => ({
  id: str(r.id), title: str(r.title), aim: str(r.aim), measure: str(r.measure), unit: str(r.unit), baselineValue: numOrNull(r.baseline_value),
  targetValue: numOrNull(r.target_value), currentValue: numOrNull(r.current_value), phase: str(r.phase) as QipRow["phase"],
  status: str(r.status) as QipRow["status"], department: str(r.department), leadUserId: strOrNull(r.lead_user_id), standardId: strOrNull(r.standard_id),
  startedOn: strOrNull(r.started_on), dueOn: strOrNull(r.due_on),
});

/* ---- loaders ---- */

export async function loadSettings({ client, actor }: Ctx): Promise<GovSettings> {
  const row = must<Row | null>(await client.from("gov_settings").select("*").eq("organization_id", actor.organizationId).maybeSingle());
  if (!row) return DEFAULT_SETTINGS;
  return {
    editionLabel: str(row.edition_label), satisfactoryMinPct: num(row.satisfactory_min_pct), partialMinPct: num(row.partial_min_pct),
    accreditedMinOverall: num(row.accredited_min_overall), conditionalMinOverall: num(row.conditional_min_overall),
    esrUnsatisfactoryMaxPct: num(row.esr_unsatisfactory_max_pct), validityYears: num(row.validity_years) || 3,
    accreditationAwardedOn: strOrNull(row.accreditation_awarded_on), scoringSourceNote: str(row.scoring_source_note) || DEFAULT_SETTINGS.scoringSourceNote,
  };
}

export async function loadStandards({ client, actor }: Ctx): Promise<StandardRow[]> {
  const rows = await pageAll((f, t) => client.from("gov_standards").select("*").eq("organization_id", actor.organizationId).eq("is_active", true).order("chapter_code").order("code").order("id").range(f, t));
  return rows.map(mapStandard);
}

export async function loadStatuses({ client, actor }: Ctx): Promise<StandardStatusRow[]> {
  const rows = await pageAll((f, t) => client.from("gov_standard_status").select("*").eq("organization_id", actor.organizationId).order("standard_id").range(f, t));
  return rows.map(mapStatus);
}

export async function loadEvidence({ client, actor }: Ctx, standardId?: string): Promise<EvidenceRow[]> {
  const rows = await pageAll((f, t) => {
    let query = client.from("gov_evidence").select("*").eq("organization_id", actor.organizationId);
    if (standardId) query = query.eq("standard_id", standardId);
    return query.order("uploaded_at", { ascending: false }).order("id").range(f, t);
  });
  return rows.map(mapEvidence);
}

export async function loadPolicies({ client, actor }: Ctx): Promise<PolicyRow[]> {
  const rows = await pageAll((f, t) => client.from("gov_policies").select("*").eq("organization_id", actor.organizationId).order("title").order("id").range(f, t));
  return rows.map(mapPolicy);
}

export async function loadAckSummary({ client, actor }: Ctx): Promise<PolicyAckSummary[]> {
  const rows = await pageAll((f, t) => client.from("gov_policy_ack_summary").select("*").eq("organization_id", actor.organizationId).order("policy_id").range(f, t));
  return rows.map((r) => ({ policyId: str(r.policy_id), assigned: num(r.assigned), acknowledged: num(r.acknowledged), overdue: num(r.overdue) }));
}

export async function loadIncidents({ client, actor }: Ctx): Promise<IncidentRow[]> {
  const rows = await pageAll((f, t) => client.from("gov_incidents").select("*").eq("organization_id", actor.organizationId).order("occurred_at", { ascending: false }).order("id").range(f, t));
  return rows.map(mapIncident);
}

export async function loadCapa({ client, actor }: Ctx): Promise<CapaRow[]> {
  const rows = await pageAll((f, t) => client.from("gov_capa").select("*").eq("organization_id", actor.organizationId).order("due_date").order("id").range(f, t));
  return rows.map(mapCapa);
}

export async function loadAudits({ client, actor }: Ctx): Promise<AuditRow[]> {
  const rows = await pageAll((f, t) => client.from("gov_audits").select("*").eq("organization_id", actor.organizationId).order("scheduled_for").order("id").range(f, t));
  return rows.map(mapAudit);
}

export async function loadQips({ client, actor }: Ctx): Promise<QipRow[]> {
  const rows = await pageAll((f, t) => client.from("gov_qips").select("*").eq("organization_id", actor.organizationId).order("created_at", { ascending: false }).order("id").range(f, t));
  return rows.map(mapQip);
}

export async function loadPeople({ client, actor }: Ctx): Promise<Person[]> {
  const { data, error } = await client.rpc("gov_people", { target_org: actor.organizationId });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map((r) => ({ userId: str(r.user_id), displayName: str(r.display_name) || "Unnamed", roleCodes: Array.isArray(r.role_codes) ? (r.role_codes as string[]) : [] }));
}

export async function loadDepartments({ client, actor }: Ctx): Promise<string[]> {
  const { data } = await client.from("departments").select("name").eq("organization_id", actor.organizationId).eq("is_active", true).order("name");
  return ((data ?? []) as Row[]).map((r) => str(r.name)).filter(Boolean);
}

export async function loadAssessmentHistory({ client, actor }: Ctx, standardId: string) {
  const rows = await pageAll((f, t) => client.from("gov_assessments").select("*").eq("organization_id", actor.organizationId).eq("standard_id", standardId).order("assessed_at", { ascending: false }).order("id").range(f, t));
  return rows.map((r) => ({
    id: str(r.id), rating: str(r.rating) as NonNullable<StandardStatusRow["rating"]>, method: str(r.method), notes: str(r.notes),
    assessedAt: str(r.assessed_at), assessedBy: strOrNull(r.assessed_by), nextReviewDue: strOrNull(r.next_review_due),
  }));
}

export async function loadStandardById(ctx: Ctx, standardId: string): Promise<StandardRow | null> {
  const row = must(await ctx.client.from("gov_standards").select("*").eq("organization_id", ctx.actor.organizationId).eq("id", standardId).maybeSingle());
  return row ? mapStandard(row as Row) : null;
}

export async function loadPolicyById(ctx: Ctx, policyId: string): Promise<PolicyRow | null> {
  const row = must(await ctx.client.from("gov_policies").select("*").eq("organization_id", ctx.actor.organizationId).eq("id", policyId).maybeSingle());
  return row ? mapPolicy(row as Row) : null;
}

export async function loadPolicyStandardIds(ctx: Ctx, policyId: string): Promise<string[]> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_policy_standards").select("standard_id").eq("policy_id", policyId).range(f, t));
  return rows.map((r) => str(r.standard_id));
}

export async function loadPolicyStandardLinks(ctx: Ctx): Promise<{ policyId: string; standardId: string }[]> {
  const rows = await pageAll((f, t) => ctx.client.from("gov_policy_standards").select("policy_id, standard_id").eq("organization_id", ctx.actor.organizationId).order("policy_id").order("standard_id").range(f, t));
  return rows.map((r) => ({ policyId: str(r.policy_id), standardId: str(r.standard_id) }));
}

export type PolicyRoster = { userId: string; dueDate: string | null; assignedAt: string; acknowledgedAt: string | null };

/** Everyone assigned to ONE policy and whether they have signed: the surveyor's "who has read it" evidence. */
export async function loadPolicyRoster(ctx: Ctx, policyId: string): Promise<PolicyRoster[]> {
  const [assignments, acks] = await Promise.all([
    pageAll((f, t) => ctx.client.from("gov_policy_assignments").select("user_id, due_date, assigned_at").eq("policy_id", policyId).order("user_id").range(f, t)),
    pageAll((f, t) => ctx.client.from("gov_acknowledgements").select("user_id, acknowledged_at").eq("policy_id", policyId).order("user_id").range(f, t)),
  ]);
  const signed = new Map(acks.map((r) => [str(r.user_id), str(r.acknowledged_at)]));
  return assignments.map((r) => ({ userId: str(r.user_id), dueDate: strOrNull(r.due_date), assignedAt: str(r.assigned_at), acknowledgedAt: signed.get(str(r.user_id)) ?? null }));
}

/** The signed-in person's own read-and-sign queue (works for every staff member, not only governance staff). */
export async function loadMyPolicyTasks(ctx: Ctx): Promise<{ policy: PolicyRow; dueDate: string | null; acknowledgedAt: string | null }[]> {
  const { client, actor } = ctx;
  const assignments = await pageAll((f, t) => client.from("gov_policy_assignments").select("policy_id, due_date").eq("user_id", actor.userId).eq("organization_id", actor.organizationId).range(f, t));
  if (assignments.length === 0) return [];
  const ids = assignments.map((r) => str(r.policy_id));
  const [policies, acks] = await Promise.all([
    pageAll((f, t) => client.from("gov_policies").select("*").in("id", ids).eq("status", "approved").order("id").range(f, t)),
    pageAll((f, t) => client.from("gov_acknowledgements").select("policy_id, acknowledged_at").eq("user_id", actor.userId).in("policy_id", ids).order("policy_id").range(f, t)),
  ]);
  const due = new Map(assignments.map((r) => [str(r.policy_id), strOrNull(r.due_date)]));
  const signed = new Map(acks.map((r) => [str(r.policy_id), str(r.acknowledged_at)]));
  return policies.map(mapPolicy).map((policy) => ({ policy, dueDate: due.get(policy.id) ?? null, acknowledgedAt: signed.get(policy.id) ?? null }));
}

export async function loadIncidentFiles(ctx: Ctx, incidentId: string) {
  const rows = await pageAll((f, t) => ctx.client.from("gov_incident_files").select("*").eq("incident_id", incidentId).order("uploaded_at").range(f, t));
  return rows.map((r) => ({ id: str(r.id), fileName: str(r.file_name), storagePath: str(r.storage_path), sizeBytes: numOrNull(r.size_bytes) }));
}

/** Short-lived download link for a stored file. Row-level security on storage decides whether the caller may have it. */
export async function signedUrl({ client }: Ctx, path: string, seconds = 300): Promise<string | null> {
  const { data, error } = await client.storage.from("governance-files").createSignedUrl(path, seconds);
  return error ? null : data?.signedUrl ?? null;
}

export async function recentAudit({ client, actor }: Ctx, limit = 12) {
  const { data, error } = await client.from("audit_events").select("id, action, entity_type, entity_id, actor_user_id, metadata, occurred_at")
    .eq("organization_id", actor.organizationId).like("action", "governance.%").order("occurred_at", { ascending: false }).limit(limit);
  if (error) return [];
  return ((data ?? []) as Row[]).map((r) => ({ id: str(r.id), action: str(r.action), entityType: str(r.entity_type), actorUserId: strOrNull(r.actor_user_id), occurredAt: str(r.occurred_at), metadata: (r.metadata ?? {}) as Record<string, unknown> }));
}
