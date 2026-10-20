"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getGovernanceActor } from "@/lib/governance/auth";
import { parseStandardsCsv } from "@/lib/governance/csv";
import { friendlyMessage, GovernanceInputError } from "@/lib/governance/errors";
import {
  assertCanWrite, assertMember, canWriteGovernance, checkUpload, safeFileName, type GovActor,
} from "@/lib/governance/policy";
import { openContext, type Ctx } from "@/lib/governance/repository";
import { addMonths, isoDate } from "@/lib/governance/scoring";

/**
 * Every write in the Accreditation Hub goes through here. The acting person always comes from the server session
 * (getGovernanceActor), never from the form. Database guards (triggers, row-level security) are the real enforcement; this layer
 * adds clear validation and messages. Each action ends in a redirect carrying ?done= or ?error= so pages stay server-rendered.
 */

const BASE = "/dashboard/accreditation-and-audits";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function safeReturn(raw: FormDataEntryValue | null, fallback = BASE): string {
  const value = typeof raw === "string" ? raw : "";
  // Only paths inside this module; blocks open redirects such as "//evil.example" or "https://…".
  return value === BASE || value.startsWith(`${BASE}/`) ? value.split("?")[0] : fallback;
}

function withParam(path: string, key: "done" | "error", message: string): string {
  return `${path}?${key}=${encodeURIComponent(message.slice(0, 400))}`;
}

type Level = "member" | "writer";

async function perform(formData: FormData, level: Level, work: (ctx: Ctx, actor: GovActor) => Promise<string>, fallback = BASE): Promise<never> {
  const returnTo = safeReturn(formData.get("returnTo"), fallback);
  let target: string;
  try {
    const actor = await getGovernanceActor();
    if (level === "writer") assertCanWrite(actor); else assertMember(actor);
    const ctx = await openContext(actor);
    const message = await work(ctx, actor);
    revalidatePath(BASE, "layout");
    target = withParam(returnTo, "done", message);
  } catch (error) {
    target = withParam(returnTo, "error", friendlyMessage(error));
  }
  redirect(target);
}

/* ---- form field helpers ---- */

function text(fd: FormData, name: string, label: string, opts: { max?: number; required?: boolean } = {}): string {
  const value = String(fd.get(name) ?? "").trim();
  if (opts.required && !value) throw new GovernanceInputError(`${label} is required.`);
  if (opts.max && value.length > opts.max) throw new GovernanceInputError(`${label} must be ${opts.max} characters or fewer.`);
  return value;
}
function id(fd: FormData, name: string, label: string): string {
  const value = String(fd.get(name) ?? "");
  if (!UUID.test(value)) throw new GovernanceInputError(`${label} is missing or invalid.`);
  return value;
}
function optId(fd: FormData, name: string, label: string): string | null {
  const value = String(fd.get(name) ?? "");
  if (!value) return null;
  if (!UUID.test(value)) throw new GovernanceInputError(`${label} is invalid.`);
  return value;
}
function date(fd: FormData, name: string, label: string, required = false): string | null {
  const value = String(fd.get(name) ?? "").trim();
  if (!value) {
    if (required) throw new GovernanceInputError(`${label} is required.`);
    return null;
  }
  if (!DATE.test(value) || Number.isNaN(Date.parse(value))) throw new GovernanceInputError(`${label} is not a valid date.`);
  return value;
}
function oneOf<T extends string>(fd: FormData, name: string, label: string, allowed: readonly T[]): T {
  const value = String(fd.get(name) ?? "");
  if (!(allowed as readonly string[]).includes(value)) throw new GovernanceInputError(`${label} is not valid.`);
  return value as T;
}
function int(fd: FormData, name: string, label: string, min: number, max: number, required = true): number | null {
  const raw = String(fd.get(name) ?? "").trim();
  if (!raw) {
    if (required) throw new GovernanceInputError(`${label} is required.`);
    return null;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) throw new GovernanceInputError(`${label} must be a whole number from ${min} to ${max}.`);
  return value;
}
function decimal(fd: FormData, name: string, label: string, min: number, max: number, required = false): number | null {
  const raw = String(fd.get(name) ?? "").trim();
  if (!raw) {
    if (required) throw new GovernanceInputError(`${label} is required.`);
    return null;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) throw new GovernanceInputError(`${label} must be a number from ${min} to ${max}.`);
  return value;
}
function fileOf(fd: FormData, name: string): File | null {
  const value = fd.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

async function store(ctx: Ctx, area: "evidence" | "policies" | "incidents", file: File, subfolder?: string) {
  const problem = checkUpload(file);
  if (problem) throw new GovernanceInputError(problem);
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const sha256 = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const path = [ctx.actor.organizationId, area, subfolder, `${crypto.randomUUID()}-${safeFileName(file.name)}`].filter(Boolean).join("/");
  const { error } = await ctx.client.storage.from("governance-files").upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return { path, fileName: file.name.slice(0, 200), mime: file.type, size: file.size, sha256 };
}

function check<T>(result: { data?: T; error: { message: string } | null }): T | undefined {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

/* ================================================================================================================ */
/* Standards, assessments, evidence                                                                                  */
/* ================================================================================================================ */

export async function importStandardsAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const edition = text(formData, "edition", "Edition", { required: true, max: 160 });
    const file = fileOf(formData, "file");
    if (!file) throw new GovernanceInputError("Choose a CSV file to import.");
    if (file.size > 2 * 1024 * 1024) throw new GovernanceInputError("That CSV is larger than 2 MB.");
    const { rows, errors } = parseStandardsCsv(await file.text());
    if (rows.length === 0) throw new GovernanceInputError(errors.slice(0, 5).join(" ") || "No standards were found in that file.");

    let inserted = 0;
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i + 500).map((row) => ({
        organization_id: actor.organizationId, edition, chapter_code: row.chapterCode, chapter_name: row.chapterName, code: row.code,
        description: row.description, is_esr: row.isEsr, department: row.department, created_by: actor.userId,
      }));
      const { data, error } = await client.from("gov_standards").upsert(batch, { onConflict: "organization_id,edition,code", ignoreDuplicates: true }).select("id");
      if (error) throw new Error(error.message);
      inserted += data?.length ?? 0;
    }
    const skipped = rows.length - inserted;
    const parts = [`Imported ${inserted} standard${inserted === 1 ? "" : "s"}`];
    if (skipped > 0) parts.push(`${skipped} already existed in this edition and were left unchanged`);
    if (errors.length > 0) parts.push(`${errors.length} row${errors.length === 1 ? "" : "s"} skipped (${errors.slice(0, 3).join(" ")})`);
    return `${parts.join("; ")}.`;
  }, `${BASE}/standards`);
}

export async function updateStandardAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const standardId = id(formData, "standardId", "Standard");
    check(await client.from("gov_standards").update({
      department: text(formData, "department", "Department", { max: 160 }),
      owner_user_id: optId(formData, "ownerUserId", "Owner"),
      is_esr: formData.get("isEsr") === "on",
      review_interval_months: int(formData, "reviewIntervalMonths", "Review interval", 1, 60) ?? 12,
    }).eq("id", standardId).eq("organization_id", actor.organizationId));
    return "Standard updated.";
  }, `${BASE}/standards`);
}

export async function recordAssessmentAction(formData: FormData): Promise<never> {
  const standardId = String(formData.get("standardId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const sid = id(formData, "standardId", "Standard");
    const rating = oneOf(formData, "rating", "Rating", ["insufficient", "partial", "satisfactory", "not_applicable"] as const);
    const method = oneOf(formData, "method", "Method", ["self_assessment", "mock_survey", "audit", "external_survey"] as const);
    const notes = text(formData, "notes", "Notes", { max: 4000 });
    const standard = check(await client.from("gov_standards").select("review_interval_months").eq("id", sid).eq("organization_id", actor.organizationId).maybeSingle());
    if (!standard) throw new GovernanceInputError("That standard could not be found.");
    const next = date(formData, "nextReviewDue", "Next review") ?? (rating === "not_applicable" ? null : addMonths(isoDate(new Date()), Number((standard as { review_interval_months: number }).review_interval_months) || 12));
    check(await client.from("gov_assessments").insert({
      organization_id: actor.organizationId, standard_id: sid, rating, method, notes, next_review_due: next, assessed_by: actor.userId,
    }));
    return "Assessment recorded.";
  }, UUID.test(standardId) ? `${BASE}/standards/${standardId}` : `${BASE}/standards`);
}

export async function uploadEvidenceAction(formData: FormData): Promise<never> {
  const standardId = String(formData.get("standardId") ?? "");
  return perform(formData, "writer", async (ctx) => {
    const { client, actor } = ctx;
    const sid = id(formData, "standardId", "Standard");
    const file = fileOf(formData, "file");
    if (!file) throw new GovernanceInputError("Choose a file to attach.");
    const title = text(formData, "title", "Title", { max: 240 }) || file.name;
    const evidenceType = oneOf(formData, "evidenceType", "Evidence type", ["policy", "audit_report", "meeting_minutes", "training_record", "log", "certificate", "other"] as const);
    const validFrom = date(formData, "validFrom", "Valid from");
    const validUntil = date(formData, "validUntil", "Valid until");
    if (validFrom && validUntil && validUntil < validFrom) throw new GovernanceInputError("Valid until cannot be before valid from.");
    const stored = await store(ctx, "evidence", file, sid);
    check(await client.from("gov_evidence").insert({
      organization_id: actor.organizationId, standard_id: sid, title, evidence_type: evidenceType, storage_path: stored.path,
      file_name: stored.fileName, mime_type: stored.mime, size_bytes: stored.size, sha256: stored.sha256,
      valid_from: validFrom, valid_until: validUntil, uploaded_by: actor.userId,
    }));
    return "Evidence attached.";
  }, UUID.test(standardId) ? `${BASE}/standards/${standardId}` : `${BASE}/standards`);
}

export async function withdrawEvidenceAction(formData: FormData): Promise<never> {
  const standardId = String(formData.get("standardId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const evidenceId = id(formData, "evidenceId", "Evidence");
    const reason = text(formData, "reason", "Reason", { required: true, max: 500 });
    check(await client.from("gov_evidence").update({ withdrawn_at: new Date().toISOString(), withdrawn_by: actor.userId, withdrawn_reason: reason })
      .eq("id", evidenceId).eq("organization_id", actor.organizationId));
    return "Evidence withdrawn. It stays in the record but no longer counts.";
  }, UUID.test(standardId) ? `${BASE}/standards/${standardId}` : `${BASE}/standards`);
}

/* ================================================================================================================ */
/* Policies                                                                                                          */
/* ================================================================================================================ */

export async function createPolicyAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async (ctx) => {
    const { client, actor } = ctx;
    const title = text(formData, "title", "Title", { required: true, max: 240 });
    const version = text(formData, "version", "Version", { required: true, max: 40 });
    const documentNumber = text(formData, "documentNumber", "Document number", { max: 60 });
    const file = fileOf(formData, "file");
    const codes = text(formData, "standardCodes", "Standard codes", { max: 2000 }).split(/[,;\n]+/).map((c) => c.trim()).filter(Boolean);

    let linkIds: string[] = [];
    if (codes.length > 0) {
      const found = check(await client.from("gov_standards").select("id, code").eq("organization_id", actor.organizationId).in("code", codes)) as { id: string; code: string }[] | undefined;
      const known = new Set((found ?? []).map((row) => row.code));
      const unknown = codes.filter((code) => !known.has(code));
      if (unknown.length > 0) throw new GovernanceInputError(`These standard codes are not in your register: ${unknown.slice(0, 8).join(", ")}. Nothing was saved.`);
      linkIds = [...new Set((found ?? []).map((row) => row.id))];
    }

    const stored = file ? await store(ctx, "policies", file) : null;
    const inserted = check(await client.from("gov_policies").insert({
      organization_id: actor.organizationId, title, document_number: documentNumber, version,
      department: text(formData, "department", "Department", { max: 160 }), owner_user_id: optId(formData, "ownerUserId", "Owner"),
      effective_date: date(formData, "effectiveDate", "Effective date"), next_review_due: date(formData, "nextReviewDue", "Next review due"),
      storage_path: stored?.path ?? null, file_name: stored?.fileName ?? null, created_by: actor.userId,
    }).select("id").single()) as { id: string } | undefined;
    if (inserted && linkIds.length > 0) {
      check(await client.from("gov_policy_standards").insert(linkIds.map((standard_id) => ({ policy_id: inserted.id, standard_id, organization_id: actor.organizationId }))));
    }
    return `Policy "${title}" saved as a draft.`;
  }, `${BASE}/policies`);
}

export async function attachPolicyDocumentAction(formData: FormData): Promise<never> {
  const policyId = String(formData.get("policyId") ?? "");
  return perform(formData, "writer", async (ctx) => {
    const pid = id(formData, "policyId", "Policy");
    const file = fileOf(formData, "file");
    if (!file) throw new GovernanceInputError("Choose a file to attach.");
    const stored = await store(ctx, "policies", file);
    check(await ctx.client.from("gov_policies").update({ storage_path: stored.path, file_name: stored.fileName }).eq("id", pid).eq("organization_id", ctx.actor.organizationId));
    return "Document attached.";
  }, UUID.test(policyId) ? `${BASE}/policies/${policyId}` : `${BASE}/policies`);
}

export async function setPolicyStatusAction(formData: FormData): Promise<never> {
  const policyId = String(formData.get("policyId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const pid = id(formData, "policyId", "Policy");
    const status = oneOf(formData, "status", "Status", ["draft", "under_committee_review", "approved", "retired"] as const);
    check(await client.rpc("gov_set_policy_status", { p_actor: actor.userId, p_policy: pid, p_status: status }));
    return { draft: "Returned to draft.", under_committee_review: "Submitted for committee review.", approved: "Policy approved. Its content is now frozen; create a new version to change it.", retired: "Policy retired." }[status];
  }, UUID.test(policyId) ? `${BASE}/policies/${policyId}` : `${BASE}/policies`);
}

export async function assignPolicyAction(formData: FormData): Promise<never> {
  const policyId = String(formData.get("policyId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const pid = id(formData, "policyId", "Policy");
    const due = date(formData, "dueDate", "Due date");
    const roles = formData.getAll("roleCodes").map(String).filter((code) => /^[a-z_]{2,40}$/.test(code));
    const { data, error } = await client.rpc("gov_assign_policy", { p_actor: actor.userId, p_policy: pid, p_due: due, p_role_codes: roles.length > 0 ? roles : null });
    if (error) throw new Error(error.message);
    return `Assigned to ${data} new staff member${data === 1 ? "" : "s"}.`;
  }, UUID.test(policyId) ? `${BASE}/policies/${policyId}` : `${BASE}/policies`);
}

export async function acknowledgePolicyAction(formData: FormData): Promise<never> {
  return perform(formData, "member", async ({ client, actor }) => {
    const pid = id(formData, "policyId", "Policy");
    check(await client.rpc("gov_acknowledge_policy", { p_actor: actor.userId, p_policy: pid }));
    return "Thank you. Your acknowledgement has been recorded.";
  }, `${BASE}/policies`);
}

/* ================================================================================================================ */
/* Incidents and CAPA                                                                                                */
/* ================================================================================================================ */

export async function reportIncidentAction(formData: FormData): Promise<never> {
  return perform(formData, "member", async (ctx) => {
    const { client, actor } = ctx;
    const title = text(formData, "title", "Title", { required: true, max: 240 });
    const occurred = String(formData.get("occurredAt") ?? "").trim();
    const occurredAt = occurred && !Number.isNaN(Date.parse(occurred)) ? new Date(occurred).toISOString() : new Date().toISOString();
    if (Date.parse(occurredAt) > Date.now() + 5 * 60_000) throw new GovernanceInputError("The incident time cannot be in the future.");
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > 5) throw new GovernanceInputError("Attach at most 5 files.");
    for (const file of files) {
      const problem = checkUpload(file);
      if (problem) throw new GovernanceInputError(problem);
    }
    const inserted = check(await client.from("gov_incidents").insert({
      organization_id: actor.organizationId, title, category: text(formData, "category", "Category", { max: 80 }) || "other",
      description: text(formData, "description", "Description", { max: 8000 }),
      sbar: { s: text(formData, "sbarS", "Situation", { max: 2000 }), b: text(formData, "sbarB", "Background", { max: 2000 }), a: text(formData, "sbarA", "Assessment", { max: 2000 }), r: text(formData, "sbarR", "Recommendation", { max: 2000 }) },
      occurred_at: occurredAt, department: text(formData, "department", "Department", { max: 160 }), location: text(formData, "location", "Location", { max: 200 }),
      patient_mrn: text(formData, "patientMrn", "MRN", { max: 40 }) || null,
      severity: oneOf(formData, "severity", "Severity", ["low", "medium", "high", "critical"] as const),
      likelihood: int(formData, "likelihood", "Likelihood", 1, 5) ?? 1, impact: int(formData, "impact", "Impact", 1, 5) ?? 1,
      is_sentinel: canWriteGovernance(actor) && formData.get("isSentinel") === "on",
      reported_by: actor.userId,
    }).select("id, reference").single()) as { id: string; reference: string } | undefined;
    if (!inserted) throw new Error("The incident could not be saved.");
    let attached = 0;
    for (const file of files) {
      try {
        const stored = await store(ctx, "incidents", file, inserted.id);
        check(await client.from("gov_incident_files").insert({ organization_id: actor.organizationId, incident_id: inserted.id, storage_path: stored.path, file_name: stored.fileName, mime_type: stored.mime, size_bytes: stored.size, uploaded_by: actor.userId }));
        attached += 1;
      } catch (error) {
        console.error("[accreditation-hub] incident attachment failed", error);
      }
    }
    const missed = files.length - attached;
    return `Incident ${inserted.reference} reported.${missed > 0 ? ` ${missed} attachment${missed === 1 ? "" : "s"} could not be saved; add them again from the incident.` : ""}`;
  }, `${BASE}/incidents`);
}

export async function updateIncidentAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const incidentId = id(formData, "incidentId", "Incident");
    check(await client.from("gov_incidents").update({
      status: oneOf(formData, "status", "Status", ["reported", "under_investigation", "capa_assigned", "under_review", "closed"] as const),
      severity: oneOf(formData, "severity", "Severity", ["low", "medium", "high", "critical"] as const),
      likelihood: int(formData, "likelihood", "Likelihood", 1, 5) ?? 1, impact: int(formData, "impact", "Impact", 1, 5) ?? 1,
      is_sentinel: formData.get("isSentinel") === "on",
      root_cause: text(formData, "rootCause", "Root cause", { max: 8000 }),
      closure_note: text(formData, "closureNote", "Closure note", { max: 4000 }),
    }).eq("id", incidentId).eq("organization_id", actor.organizationId));
    return "Incident updated.";
  }, `${BASE}/incidents`);
}

export async function addCapaAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const incidentId = optId(formData, "incidentId", "Incident");
    const auditId = optId(formData, "auditId", "Audit");
    if (!incidentId && !auditId) throw new GovernanceInputError("A corrective action must belong to an incident or an audit.");
    const owner = id(formData, "ownerUserId", "Owner");
    check(await client.from("gov_capa").insert({
      organization_id: actor.organizationId, incident_id: incidentId, audit_id: auditId,
      action: text(formData, "action", "Action", { required: true, max: 2000 }),
      kind: oneOf(formData, "kind", "Type", ["corrective", "preventive"] as const), owner_user_id: owner,
      due_date: date(formData, "dueDate", "Deadline", true), created_by: actor.userId,
    }));
    return "Action added.";
  }, `${BASE}/incidents`);
}

export async function setCapaStatusAction(formData: FormData): Promise<never> {
  return perform(formData, "member", async ({ client, actor }) => {
    const capaId = id(formData, "capaId", "Action");
    const status = oneOf(formData, "status", "Status", ["open", "in_progress", "done", "verified"] as const);
    check(await client.rpc("gov_set_capa_status", { p_actor: actor.userId, p_capa: capaId, p_status: status, p_note: text(formData, "note", "Note", { max: 4000 }) }));
    return { open: "Action reopened.", in_progress: "Action marked in progress.", done: "Action marked done; it now needs verification.", verified: "Action verified." }[status];
  }, `${BASE}/incidents`);
}

/* ================================================================================================================ */
/* Audits and QIPs                                                                                                   */
/* ================================================================================================================ */

export async function scheduleAuditAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const code = text(formData, "standardCode", "Standard code", { max: 60 });
    let standardId: string | null = null;
    if (code) {
      const found = check(await client.from("gov_standards").select("id").eq("organization_id", actor.organizationId).eq("code", code).limit(1)) as { id: string }[] | undefined;
      if (!found?.length) throw new GovernanceInputError(`Standard ${code} is not in your register.`);
      standardId = found[0].id;
    }
    check(await client.from("gov_audits").insert({
      organization_id: actor.organizationId, title: text(formData, "title", "Title", { required: true, max: 240 }),
      category: text(formData, "category", "Category", { max: 80 }) || "other", standard_id: standardId,
      department: text(formData, "department", "Department", { max: 160 }), owner_user_id: optId(formData, "ownerUserId", "Owner"),
      scheduled_for: date(formData, "scheduledFor", "Date", true), recurrence_months: int(formData, "recurrenceMonths", "Repeat every (months)", 1, 60, false),
      target_pct: decimal(formData, "targetPct", "Target %", 0, 100), created_by: actor.userId,
    }));
    return "Audit scheduled.";
  }, `${BASE}/audits`);
}

export async function completeAuditAction(formData: FormData): Promise<never> {
  return perform(formData, "member", async ({ client, actor }) => {
    const auditId = id(formData, "auditId", "Audit");
    const { data, error } = await client.rpc("gov_complete_audit", {
      p_actor: actor.userId, p_audit: auditId, p_result: decimal(formData, "resultPct", "Result %", 0, 100, true),
      p_sample: int(formData, "sampleSize", "Sample size", 1, 1_000_000), p_findings: text(formData, "findings", "Findings", { max: 8000 }),
    });
    if (error) throw new Error(error.message);
    return data ? "Audit completed and the next one has been scheduled." : "Audit completed.";
  }, `${BASE}/audits`);
}

export async function cancelAuditAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    check(await client.from("gov_audits").update({ status: "cancelled" }).eq("id", id(formData, "auditId", "Audit")).eq("organization_id", actor.organizationId).in("status", ["scheduled", "in_progress"]));
    return "Audit cancelled.";
  }, `${BASE}/audits`);
}

export async function createQipAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    check(await client.from("gov_qips").insert({
      organization_id: actor.organizationId, title: text(formData, "title", "Title", { required: true, max: 240 }),
      aim: text(formData, "aim", "Aim", { max: 2000 }), measure: text(formData, "measure", "Measure", { max: 1000 }), unit: text(formData, "unit", "Unit", { max: 40 }),
      baseline_value: decimal(formData, "baselineValue", "Baseline", -1e9, 1e9), target_value: decimal(formData, "targetValue", "Target", -1e9, 1e9),
      current_value: decimal(formData, "baselineValue", "Baseline", -1e9, 1e9), department: text(formData, "department", "Department", { max: 160 }),
      lead_user_id: optId(formData, "leadUserId", "Lead"), started_on: date(formData, "startedOn", "Start date"), due_on: date(formData, "dueOn", "Due date"), created_by: actor.userId,
    }));
    return "Improvement project created in the Plan phase.";
  }, `${BASE}/audits`);
}

const NEXT_PHASE: Record<string, readonly string[]> = { plan: ["do"], do: ["study"], study: ["act", "do"], act: ["plan"] };

export async function updateQipAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const qipId = id(formData, "qipId", "Project");
    const current = check(await client.from("gov_qips").select("phase, status").eq("id", qipId).eq("organization_id", actor.organizationId).maybeSingle()) as { phase: string; status: string } | null | undefined;
    if (!current) throw new GovernanceInputError("That project could not be found.");
    const update: Record<string, unknown> = {};
    const currentValue = decimal(formData, "currentValue", "Current value", -1e9, 1e9);
    if (currentValue !== null) update.current_value = currentValue;
    const to = String(formData.get("phase") ?? "");
    if (to) {
      if (!(NEXT_PHASE[current.phase] ?? []).includes(to)) throw new GovernanceInputError(`A project in the ${current.phase} phase cannot move to ${to}.`);
      update.phase = to;
    }
    const status = String(formData.get("status") ?? "");
    if (status) update.status = oneOf(formData, "status", "Status", ["active", "completed", "stopped"] as const);
    if (Object.keys(update).length === 0) throw new GovernanceInputError("Nothing to update.");
    check(await client.from("gov_qips").update(update).eq("id", qipId).eq("organization_id", actor.organizationId));
    return "Project updated.";
  }, `${BASE}/audits`);
}

/* ================================================================================================================ */
/* Settings                                                                                                          */
/* ================================================================================================================ */

export async function saveSettingsAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const satisfactory = decimal(formData, "satisfactoryMinPct", "Satisfactory threshold", 1, 100, true) as number;
    const partial = decimal(formData, "partialMinPct", "Partial threshold", 0, 99, true) as number;
    const accredited = decimal(formData, "accreditedMinOverall", "Accredited threshold", 1, 100, true) as number;
    const conditional = decimal(formData, "conditionalMinOverall", "Conditional threshold", 0, 99, true) as number;
    if (partial >= satisfactory) throw new GovernanceInputError("The partial threshold must be lower than the satisfactory threshold.");
    if (conditional >= accredited) throw new GovernanceInputError("The conditional threshold must be lower than the accredited threshold.");
    check(await client.from("gov_settings").upsert({
      organization_id: actor.organizationId, edition_label: text(formData, "editionLabel", "Edition", { max: 160 }),
      satisfactory_min_pct: satisfactory, partial_min_pct: partial, accredited_min_overall: accredited, conditional_min_overall: conditional,
      esr_unsatisfactory_max_pct: decimal(formData, "esrUnsatisfactoryMaxPct", "ESR limit", 0, 100, true),
      validity_years: int(formData, "validityYears", "Validity (years)", 1, 10) ?? 3,
      accreditation_awarded_on: date(formData, "accreditationAwardedOn", "Accreditation awarded on"),
      scoring_source_note: text(formData, "scoringSourceNote", "Source note", { max: 500 }), updated_by: actor.userId, updated_at: new Date().toISOString(),
    }, { onConflict: "organization_id" }));
    return "Settings saved.";
  }, `${BASE}/settings`);
}
