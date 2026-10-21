"use server";

import { revalidatePath } from "next/cache";
import { auditCompliance, criteriaFromLines, parseCriteria, type ObservationRow } from "@/lib/governance/audit-measures";
import { getGovernanceActor } from "@/lib/governance/auth";
import { friendlyMessage, GovernanceInputError } from "@/lib/governance/errors";
import {
  BASE, UUID, check, date, dateTime, decimal, fileOf, id, int, oneOf, optId, optOneOf, perform, store, text, typedRef,
} from "@/lib/governance/form";
import { buildImportPlan, IMPORT_FIELDS, MAX_IMPORT_ROWS, type ColumnMapping, type ExistingRegister, type ImportIssue, type ImportMode } from "@/lib/governance/hierarchy";
import { computeResultValue, type MeasureType } from "@/lib/governance/indicators";
import { assertCanWrite } from "@/lib/governance/policy";
import { openContext, pageAll } from "@/lib/governance/repository";
import { addMonths, isoDate } from "@/lib/governance/scoring";

/**
 * Server actions for the Governance Hub V2.1 features. The original actions.ts is unchanged; everything here is new.
 * Each action re-checks the signed-in actor, validates input for clear messages and relies on the database guards from
 * migration 20261021090000 as the real enforcement.
 */

const RATINGS = ["insufficient", "partial", "satisfactory", "not_applicable"] as const;
const METHODS = ["self_assessment", "mock_survey", "audit", "external_survey"] as const;
const LINK_TYPES = ["standard", "element", "policy", "guideline", "capa", "audit", "audit_template", "qip", "incident", "indicator", "decision", "meeting", "committee"] as const;
const CATEGORIES = ["approved_policy", "guideline_sop", "audit_report", "qi_report", "committee_minutes", "training_record", "equipment_checklist", "incident_investigation", "capa_report", "other"] as const;
const EVIDENCE_TYPES = ["policy", "audit_report", "meeting_minutes", "training_record", "log", "certificate", "other"] as const;
const back = (fd: FormData, fallback: string) => {
  const raw = String(fd.get("returnTo") ?? "");
  return raw.startsWith(BASE) ? raw : fallback;
};

/* ================================================================================================================ */
/* Standards import wizard (step 5: confirm). Returns a summary for step 6 instead of redirecting.                   */
/* ================================================================================================================ */

export type ImportResult =
  | { state: "idle" }
  | { state: "error"; message: string }
  | { state: "done"; edition: string; created: { standards: number; elements: number }; updated: { standards: number; elements: number }; unchanged: number; rejected: ImportIssue[]; warnings: ImportIssue[] };

export async function runStandardsImportAction(_prev: ImportResult, formData: FormData): Promise<ImportResult> {
  try {
    const actor = await getGovernanceActor();
    assertCanWrite(actor);
    const ctx = await openContext(actor);
    const { client } = ctx;
    const edition = text(formData, "edition", "Edition", { required: true, max: 160 });
    const program = text(formData, "program", "Programme", { max: 80 }) || "CBAHI";
    const hospitalType = text(formData, "hospitalType", "Hospital type", { max: 120 });
    const isOfficial = formData.get("isOfficial") !== "no";
    const sourceNote = text(formData, "sourceNote", "Source", { max: 1000 });
    const fileName = text(formData, "fileName", "File name", { max: 200 }) || "import.csv";
    const mode = oneOf(formData, "mode", "Import mode", ["add_only", "add_and_update"] as const) as ImportMode;
    let table: string[][];
    let mapping: ColumnMapping;
    try {
      table = JSON.parse(String(formData.get("table") ?? "[]"));
      mapping = JSON.parse(String(formData.get("mapping") ?? "{}"));
    } catch {
      throw new GovernanceInputError("The file could not be read. Start the import again.");
    }
    if (!Array.isArray(table) || table.length < 2) throw new GovernanceInputError("The file has no rows to import.");
    if (table.length - 1 > MAX_IMPORT_ROWS) throw new GovernanceInputError(`Import at most ${MAX_IMPORT_ROWS} rows at a time.`);
    table = table.map((row) => (Array.isArray(row) ? row.map((c) => String(c ?? "").slice(0, 4100)) : []));
    const validKeys = new Set(IMPORT_FIELDS.map((f) => f.key));
    mapping = Object.fromEntries(Object.entries(mapping).filter(([k, v]) => validKeys.has(k as never) && Number.isInteger(v) && (v as number) >= 0));

    // Upsert the edition record first so its provenance (official vs internal, hospital type) is stored with it.
    const { data: existingEdition } = await client.from("gov_editions").select("id").eq("organization_id", actor.organizationId).eq("label", edition).maybeSingle();
    if (!existingEdition) {
      check(await client.from("gov_editions").insert({ organization_id: actor.organizationId, label: edition, program, hospital_type: hospitalType, is_official: isOfficial, source_note: sourceNote, created_by: actor.userId }));
    }

    // The register as it is now, for this edition only, so the plan is recomputed against fresh data.
    const stdRows = await pageAll((f, t) => client.from("gov_standards").select("id, code, description, chapter_code, chapter_name, is_esr, department").eq("organization_id", actor.organizationId).eq("edition", edition).order("id").range(f, t));
    const stdIds = stdRows.map((r) => String(r.id));
    const elRows = stdIds.length === 0 ? [] : await pageAll((f, t) => client.from("gov_elements").select("id, standard_id, code, official_code, description, is_esr, department").eq("organization_id", actor.organizationId).in("standard_id", stdIds).order("id").range(f, t));
    const codeById = new Map(stdRows.map((r) => [String(r.id), String(r.code)]));
    const existing: ExistingRegister = {
      standards: stdRows.map((r) => ({ id: String(r.id), code: String(r.code), description: String(r.description), chapterCode: String(r.chapter_code ?? ""), chapterName: String(r.chapter_name ?? ""), isEsr: r.is_esr === true, department: String(r.department ?? "") })),
      elements: elRows.map((r) => ({ id: String(r.id), standardCode: codeById.get(String(r.standard_id)) ?? "", code: String(r.code), officialCode: String(r.official_code ?? ""), description: String(r.description), isEsr: r.is_esr === true, department: String(r.department ?? "") })),
    };
    const plan = buildImportPlan({ table, mapping, existing, mode });
    if (plan.standards.length === 0 && plan.elements.length === 0) {
      return { state: "error", message: plan.rejected[0]?.message ?? "Nothing in the file could be imported." };
    }

    const source = `Imported from ${fileName} on ${isoDate(new Date())}`;
    // 1. new standards (ids returned so elements can attach to them)
    const newStd = plan.standards.filter((s) => s.action === "create");
    for (let i = 0; i < newStd.length; i += 500) {
      const batch = newStd.slice(i, i + 500).map((s) => ({
        organization_id: actor.organizationId, edition, chapter_code: s.chapterCode, chapter_name: s.chapterName, code: s.code, description: s.description,
        is_esr: s.isEsr, department: s.department, created_by: actor.userId, is_official: isOfficial, source_reference: source,
      }));
      const { data, error } = await client.from("gov_standards").insert(batch).select("id, code");
      if (error) throw new Error(error.message);
      for (const row of data ?? []) codeById.set(String(row.id), String(row.code));
    }
    // 2. updates keep the id, so assessments and evidence stay attached; the audit trail records the old and new wording.
    for (const s of plan.standards.filter((x) => x.action === "update")) {
      check(await client.from("gov_standards").update({ description: s.description, chapter_code: s.chapterCode, chapter_name: s.chapterName, is_esr: s.isEsr, department: s.department, source_reference: source })
        .eq("id", s.existingId as string).eq("organization_id", actor.organizationId));
    }
    const idByCode = new Map([...codeById.entries()].map(([sid, code]) => [code, sid]));
    // 3. elements
    const newEl = plan.elements.filter((e) => e.action === "create");
    for (let i = 0; i < newEl.length; i += 500) {
      const batch = newEl.slice(i, i + 500).map((e, n) => ({
        organization_id: actor.organizationId, standard_id: idByCode.get(e.standardCode), code: e.code, official_code: e.officialCode, description: e.description,
        is_esr: e.isEsr, esr_source: e.isEsr ? `${source} (edition ${edition})`.slice(0, 300) : "", department: e.department, is_official: isOfficial,
        sort_order: i + n, created_by: actor.userId,
      }));
      if (batch.some((b) => !b.standard_id)) throw new Error("An element lost its parent standard during import. Nothing further was written.");
      check(await client.from("gov_elements").insert(batch));
    }
    for (const e of plan.elements.filter((x) => x.action === "update")) {
      check(await client.from("gov_elements").update({ description: e.description, official_code: e.officialCode, is_esr: e.isEsr, esr_source: e.isEsr ? `${source} (edition ${edition})`.slice(0, 300) : "", department: e.department, updated_at: new Date().toISOString() })
        .eq("id", e.existingId as string).eq("organization_id", actor.organizationId));
    }
    revalidatePath(BASE, "layout");
    return {
      state: "done", edition,
      created: { standards: plan.summary.standardsToCreate, elements: plan.summary.elementsToCreate },
      updated: { standards: plan.summary.standardsToUpdate, elements: plan.summary.elementsToUpdate },
      unchanged: plan.summary.unchanged, rejected: plan.rejected.slice(0, 200), warnings: plan.warnings.slice(0, 200),
    };
  } catch (error) {
    return { state: "error", message: friendlyMessage(error) };
  }
}

/* ================================================================================================================ */
/* Standards, editions, measurable elements                                                                          */
/* ================================================================================================================ */

export async function saveEditionAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const editionId = id(formData, "editionId", "Edition");
    check(await client.from("gov_editions").update({
      program: text(formData, "program", "Programme", { required: true, max: 80 }),
      hospital_type: text(formData, "hospitalType", "Hospital type", { max: 120 }),
      is_official: formData.get("isOfficial") === "on",
      source_note: text(formData, "sourceNote", "Source", { max: 1000 }),
      status: oneOf(formData, "status", "Status", ["active", "superseded", "draft"] as const),
    }).eq("id", editionId).eq("organization_id", actor.organizationId));
    return "Edition saved.";
  }, `${BASE}/settings`);
}

/** An internal requirement written by the hospital itself. Always stored and shown as non-official. */
export async function createInternalStandardAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const code = text(formData, "code", "Code", { required: true, max: 60 });
    check(await client.from("gov_standards").insert({
      organization_id: actor.organizationId, edition: text(formData, "edition", "Edition", { required: true, max: 160 }),
      chapter_code: text(formData, "chapterCode", "Chapter code", { max: 40 }), chapter_name: text(formData, "chapterName", "Chapter name", { max: 200 }),
      code, description: text(formData, "description", "Requirement", { required: true, max: 4000 }), department: text(formData, "department", "Department", { max: 160 }),
      is_official: false, source_reference: "Internal requirement written by the hospital (not CBAHI text)", created_by: actor.userId,
    }));
    return `Internal requirement ${code} added. It is labelled non-official everywhere it appears.`;
  }, `${BASE}/standards`);
}

export async function createElementAction(formData: FormData): Promise<never> {
  const standardId = String(formData.get("standardId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const sid = id(formData, "standardId", "Standard");
    const isEsr = formData.get("isEsr") === "on";
    const esrSource = text(formData, "esrSource", "Where the ESR classification was verified", { max: 300 });
    if (isEsr && !esrSource) throw new GovernanceInputError("Say where the ESR classification was verified (for example the manual section).");
    const isOfficial = formData.get("isOfficial") !== "no";
    check(await client.from("gov_elements").insert({
      organization_id: actor.organizationId, standard_id: sid, code: text(formData, "code", "Element code", { required: true, max: 80 }),
      official_code: text(formData, "officialCode", "Official code", { max: 80 }), description: text(formData, "description", "Element text", { required: true, max: 4000 }),
      is_esr: isEsr, esr_source: esrSource, department: text(formData, "department", "Department", { max: 160 }), owner_user_id: optId(formData, "ownerUserId", "Responsible officer"),
      applicability: oneOf(formData, "applicability", "Applicability", ["applicable", "not_applicable", "to_confirm"] as const),
      evidence_guidance: text(formData, "evidenceGuidance", "Evidence requirements", { max: 2000 }), review_due: date(formData, "reviewDue", "Review due"),
      is_official: isOfficial, created_by: actor.userId,
    }));
    return isOfficial ? "Measurable element added." : "Internal (non-official) measurable element added.";
  }, UUID.test(standardId) ? `${BASE}/standards/${standardId}` : `${BASE}/standards`);
}

export async function updateElementAction(formData: FormData): Promise<never> {
  const standardId = String(formData.get("standardId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const elementId = id(formData, "elementId", "Element");
    const isEsr = formData.get("isEsr") === "on";
    const esrSource = text(formData, "esrSource", "ESR source", { max: 300 });
    if (isEsr && !esrSource) throw new GovernanceInputError("Say where the ESR classification was verified.");
    check(await client.from("gov_elements").update({
      applicability: oneOf(formData, "applicability", "Applicability", ["applicable", "not_applicable", "to_confirm"] as const),
      owner_user_id: optId(formData, "ownerUserId", "Responsible officer"), department: text(formData, "department", "Department", { max: 160 }),
      evidence_guidance: text(formData, "evidenceGuidance", "Evidence requirements", { max: 2000 }), review_due: date(formData, "reviewDue", "Review due"),
      verified_on: date(formData, "verifiedOn", "Verification date"), is_esr: isEsr, esr_source: esrSource, updated_at: new Date().toISOString(),
    }).eq("id", elementId).eq("organization_id", actor.organizationId));
    return "Measurable element updated.";
  }, UUID.test(standardId) ? `${BASE}/standards/${standardId}` : `${BASE}/standards`);
}

export async function recordElementAssessmentAction(formData: FormData): Promise<never> {
  const standardId = String(formData.get("standardId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const rating = oneOf(formData, "rating", "Rating", RATINGS);
    check(await client.from("gov_element_assessments").insert({
      organization_id: actor.organizationId, element_id: id(formData, "elementId", "Element"), rating,
      method: oneOf(formData, "method", "Method", METHODS), notes: text(formData, "notes", "Notes", { max: 4000 }),
      next_review_due: date(formData, "nextReviewDue", "Next review") ?? (rating === "not_applicable" ? null : addMonths(isoDate(new Date()), 12)), assessed_by: actor.userId,
    }));
    return "Element assessment recorded. Earlier assessments stay in the history.";
  }, UUID.test(standardId) ? `${BASE}/standards/${standardId}` : `${BASE}/standards`);
}

/* ================================================================================================================ */
/* Evidence vault                                                                                                    */
/* ================================================================================================================ */

/** Uploads a file once for a standard (and optionally an element or a requirement it satisfies). */
export async function uploadEvidenceV21Action(formData: FormData): Promise<never> {
  const standardId = String(formData.get("standardId") ?? "");
  return perform(formData, "writer", async (ctx) => {
    const { client, actor } = ctx;
    const sid = id(formData, "standardId", "Standard");
    const elementId = optId(formData, "elementId", "Element");
    const requirementId = optId(formData, "requirementId", "Requirement");
    const file = fileOf(formData, "file");
    if (!file) throw new GovernanceInputError("Choose a file to attach.");
    const validFrom = date(formData, "validFrom", "Valid from");
    const validUntil = date(formData, "validUntil", "Valid until");
    if (validFrom && validUntil && validUntil < validFrom) throw new GovernanceInputError("Valid until cannot be before valid from.");
    const stored = await store(ctx, "evidence", file, sid);
    const inserted = check(await client.from("gov_evidence").insert({
      organization_id: actor.organizationId, standard_id: sid, title: text(formData, "title", "Title", { max: 240 }) || file.name.slice(0, 240),
      evidence_type: oneOf(formData, "evidenceType", "Evidence type", EVIDENCE_TYPES), storage_path: stored.path, file_name: stored.fileName,
      mime_type: stored.mime, size_bytes: stored.size, sha256: stored.sha256, valid_from: validFrom, valid_until: validUntil, uploaded_by: actor.userId,
    }).select("id").single()) as { id: string } | undefined;
    if (!inserted) throw new Error("The evidence record was not saved.");
    if (elementId) check(await client.from("gov_evidence_links").insert({ organization_id: actor.organizationId, evidence_id: inserted.id, element_id: elementId, linked_by: actor.userId }));
    if (requirementId) check(await client.from("gov_requirement_submissions").insert({ organization_id: actor.organizationId, requirement_id: requirementId, evidence_id: inserted.id, submitted_by: actor.userId }));
    return requirementId ? "Evidence uploaded and submitted for review." : "Evidence attached.";
  }, UUID.test(standardId) ? `${BASE}/standards/${standardId}` : `${BASE}/standards`);
}

/** A newer version of an existing file. The old one is kept; the new one inherits its links. */
export async function uploadEvidenceVersionAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async (ctx) => {
    const { client, actor } = ctx;
    const previousId = id(formData, "evidenceId", "Evidence");
    const previous = check(await client.from("gov_evidence").select("id, standard_id, title, evidence_type, withdrawn_at").eq("id", previousId).eq("organization_id", actor.organizationId).maybeSingle()) as
      { id: string; standard_id: string; title: string; evidence_type: string; withdrawn_at: string | null } | null | undefined;
    if (!previous) throw new GovernanceInputError("That evidence record could not be found.");
    if (previous.withdrawn_at) throw new GovernanceInputError("A withdrawn file cannot get a new version; attach a new file instead.");
    const file = fileOf(formData, "file");
    if (!file) throw new GovernanceInputError("Choose the new version of the file.");
    const validUntil = date(formData, "validUntil", "Valid until");
    const stored = await store(ctx, "evidence", file, previous.standard_id);
    const inserted = check(await client.from("gov_evidence").insert({
      organization_id: actor.organizationId, standard_id: previous.standard_id, title: text(formData, "title", "Title", { max: 240 }) || previous.title,
      evidence_type: previous.evidence_type, storage_path: stored.path, file_name: stored.fileName, mime_type: stored.mime, size_bytes: stored.size,
      sha256: stored.sha256, valid_from: date(formData, "validFrom", "Valid from"), valid_until: validUntil, uploaded_by: actor.userId, supersedes_id: previous.id,
    }).select("id").single()) as { id: string } | undefined;
    if (!inserted) throw new Error("The new version was not saved.");
    const links = await pageAll((f, t) => client.from("gov_evidence_links").select("standard_id, element_id").eq("evidence_id", previous.id).is("unlinked_at", null).order("linked_at").range(f, t));
    if (links.length > 0) {
      check(await client.from("gov_evidence_links").insert(links.map((l) => ({ organization_id: actor.organizationId, evidence_id: inserted.id, standard_id: l.standard_id, element_id: l.element_id, linked_by: actor.userId }))));
    }
    return `New version saved. The earlier version stays in the history and no longer counts as current${links.length ? `; ${links.length} link${links.length === 1 ? "" : "s"} carried over` : ""}.`;
  }, `${BASE}/standards/evidence`);
}

export async function linkEvidenceAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const evidenceId = id(formData, "evidenceId", "Evidence");
    const target = typedRef(formData, "target", ["standard", "element"]);
    check(await client.from("gov_evidence_links").insert({ organization_id: actor.organizationId, evidence_id: evidenceId, [`${target.type}_id`]: target.id, linked_by: actor.userId }));
    return "Existing file linked. It was not copied: one stored file now supports both.";
  }, back(formData, `${BASE}/standards/evidence`));
}

export async function unlinkEvidenceAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    check(await client.from("gov_evidence_links").update({ unlinked_at: new Date().toISOString(), unlinked_by: actor.userId, unlink_reason: text(formData, "reason", "Reason", { required: true, max: 500 }) })
      .eq("id", id(formData, "linkId", "Link")).eq("organization_id", actor.organizationId));
    return "Link removed. The file and the record of the link are kept.";
  }, back(formData, `${BASE}/standards/evidence`));
}

export async function createRequirementAction(formData: FormData): Promise<never> {
  const standardId = String(formData.get("standardId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const target = typedRef(formData, "target", ["standard", "element"]);
    check(await client.from("gov_evidence_requirements").insert({
      organization_id: actor.organizationId, [`${target.type}_id`]: target.id, category: oneOf(formData, "category", "Evidence type", CATEGORIES),
      description: text(formData, "description", "Description", { max: 1000 }), department: text(formData, "department", "Department", { max: 160 }),
      owner_user_id: optId(formData, "ownerUserId", "Responsible person"), is_required: formData.get("isRequired") !== "optional",
      due_date: date(formData, "dueDate", "Due date"), created_by: actor.userId,
    }));
    return "Expected evidence added to the checklist.";
  }, UUID.test(standardId) ? `${BASE}/standards/${standardId}` : `${BASE}/standards`);
}

export async function setRequirementActiveAction(formData: FormData): Promise<never> {
  const standardId = String(formData.get("standardId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const active = formData.get("active") === "true";
    check(await client.from("gov_evidence_requirements").update({ is_active: active }).eq("id", id(formData, "requirementId", "Requirement")).eq("organization_id", actor.organizationId));
    return active ? "Requirement restored to the checklist." : "Requirement removed from the checklist (kept in the record).";
  }, UUID.test(standardId) ? `${BASE}/standards/${standardId}` : `${BASE}/standards`);
}

export async function submitExistingEvidenceAction(formData: FormData): Promise<never> {
  const standardId = String(formData.get("standardId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    check(await client.from("gov_requirement_submissions").insert({
      organization_id: actor.organizationId, requirement_id: id(formData, "requirementId", "Requirement"), evidence_id: id(formData, "evidenceId", "Evidence"), submitted_by: actor.userId,
    }));
    return "Document linked to the requirement and marked Uploaded.";
  }, UUID.test(standardId) ? `${BASE}/standards/${standardId}` : `${BASE}/standards`);
}

export async function reviewSubmissionAction(formData: FormData): Promise<never> {
  const standardId = String(formData.get("standardId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const status = oneOf(formData, "status", "Status", ["under_review", "verified", "rejected"] as const);
    check(await client.from("gov_requirement_submissions").update({
      status, reviewer_user_id: status === "under_review" ? null : actor.userId, review_note: text(formData, "note", "Review note", { max: 2000 }),
    }).eq("id", id(formData, "submissionId", "Submission")).eq("organization_id", actor.organizationId));
    return { under_review: "Evidence is under review.", verified: "Evidence verified.", rejected: "Evidence rejected; the requirement is open again." }[status];
  }, UUID.test(standardId) ? `${BASE}/standards/${standardId}` : `${BASE}/standards`);
}

/* ================================================================================================================ */
/* Clinical quality indicators                                                                                        */
/* ================================================================================================================ */

const MEASURES = ["percentage", "rate", "count", "time", "continuous"] as const;

export async function createIndicatorAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const measureType = oneOf(formData, "measureType", "Measure type", MEASURES);
    const direction = oneOf(formData, "direction", "Direction", ["higher_is_better", "lower_is_better", "within_range"] as const);
    const targetValue = decimal(formData, "targetValue", "Target", -1e9, 1e9);
    const targetUpper = decimal(formData, "targetUpper", "Upper limit", -1e9, 1e9);
    if (measureType === "percentage" && targetValue !== null && (targetValue < 0 || targetValue > 100)) throw new GovernanceInputError("A percentage target must be between 0 and 100.");
    if (direction === "within_range" && (targetValue === null || targetUpper === null || targetUpper < targetValue)) throw new GovernanceInputError("A range needs a lower and an upper limit.");
    const multiplier = decimal(formData, "rateMultiplier", "Rate multiplier", 0.000001, 1e9);
    if (measureType === "rate" && multiplier === null) throw new GovernanceInputError("A rate needs its multiplier (for example 1000 for per 1,000).");
    const code = text(formData, "code", "Code", { required: true, max: 40 });
    const inserted = check(await client.from("gov_indicators").insert({
      organization_id: actor.organizationId, code, title: text(formData, "title", "Title", { required: true, max: 240 }),
      domain: text(formData, "domain", "Clinical domain", { max: 120 }), department: text(formData, "department", "Department", { max: 160 }),
      description: text(formData, "description", "Description", { max: 4000 }), numerator_definition: text(formData, "numeratorDefinition", "Numerator", { max: 2000 }),
      denominator_definition: text(formData, "denominatorDefinition", "Denominator", { max: 2000 }), inclusion_criteria: text(formData, "inclusionCriteria", "Inclusion criteria", { max: 2000 }),
      exclusion_criteria: text(formData, "exclusionCriteria", "Exclusion criteria", { max: 2000 }), data_source: text(formData, "dataSource", "Data source", { max: 500 }),
      frequency: oneOf(formData, "frequency", "Frequency", ["weekly", "monthly", "quarterly", "biannual", "annual", "ad_hoc"] as const), measure_type: measureType,
      rate_multiplier: measureType === "rate" ? multiplier : null, unit: text(formData, "unit", "Unit", { max: 40 }), target_value: targetValue,
      target_upper: direction === "within_range" ? targetUpper : null, direction, owner_user_id: optId(formData, "ownerUserId", "Responsible officer"),
      template_key: text(formData, "templateKey", "Template", { max: 60 }) || null, created_by: actor.userId,
    }).select("id").single()) as { id: string } | undefined;
    const standardRef = String(formData.get("linkStandard") ?? "");
    if (inserted && standardRef) {
      const target = typedRef(formData, "linkStandard", ["standard", "element", "guideline"]);
      check(await client.from("gov_links").insert({ organization_id: actor.organizationId, source_type: "indicator", source_id: inserted.id, target_type: target.type, target_id: target.id, created_by: actor.userId }));
    }
    return `Indicator ${code} created.`;
  }, `${BASE}/indicators`);
}

export async function updateIndicatorAction(formData: FormData): Promise<never> {
  const indicatorId = String(formData.get("indicatorId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const direction = oneOf(formData, "direction", "Direction", ["higher_is_better", "lower_is_better", "within_range"] as const);
    const targetValue = decimal(formData, "targetValue", "Target", -1e9, 1e9);
    const targetUpper = decimal(formData, "targetUpper", "Upper limit", -1e9, 1e9);
    if (direction === "within_range" && (targetValue === null || targetUpper === null || targetUpper < targetValue)) throw new GovernanceInputError("A range needs a lower and an upper limit.");
    check(await client.from("gov_indicators").update({
      target_value: targetValue, target_upper: direction === "within_range" ? targetUpper : null, direction,
      owner_user_id: optId(formData, "ownerUserId", "Responsible officer"), department: text(formData, "department", "Department", { max: 160 }),
      data_source: text(formData, "dataSource", "Data source", { max: 500 }),
      status: oneOf(formData, "status", "Status", ["active", "retired"] as const),
    }).eq("id", id(formData, "indicatorId", "Indicator")).eq("organization_id", actor.organizationId));
    return "Indicator updated. Earlier results are unchanged.";
  }, UUID.test(indicatorId) ? `${BASE}/indicators/${indicatorId}` : `${BASE}/indicators`);
}

export async function addIndicatorResultAction(formData: FormData): Promise<never> {
  const indicatorId = String(formData.get("indicatorId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const iid = id(formData, "indicatorId", "Indicator");
    const ind = check(await client.from("gov_indicators").select("measure_type, rate_multiplier").eq("id", iid).eq("organization_id", actor.organizationId).maybeSingle()) as { measure_type: MeasureType; rate_multiplier: number | null } | null | undefined;
    if (!ind) throw new GovernanceInputError("That indicator could not be found.");
    const periodStart = date(formData, "periodStart", "Period start", true) as string;
    const periodEnd = date(formData, "periodEnd", "Period end", true) as string;
    if (periodEnd < periodStart) throw new GovernanceInputError("The period cannot end before it starts.");
    const numerator = decimal(formData, "numerator", "Numerator", 0, 1e12);
    const denominator = decimal(formData, "denominator", "Denominator", 0, 1e12);
    const value = decimal(formData, "value", "Value", -1e12, 1e12);
    const computed = computeResultValue(ind.measure_type, { numerator, denominator, value }, ind.rate_multiplier === null ? null : Number(ind.rate_multiplier));
    if (computed.error) throw new GovernanceInputError(computed.error);
    const supersedes = optId(formData, "supersedesId", "Corrected value");
    check(await client.from("gov_indicator_results").insert({
      organization_id: actor.organizationId, indicator_id: iid, period_start: periodStart, period_end: periodEnd,
      numerator: ind.measure_type === "percentage" || ind.measure_type === "rate" ? numerator : null,
      denominator: ind.measure_type === "percentage" || ind.measure_type === "rate" ? denominator : null,
      value: ind.measure_type === "percentage" || ind.measure_type === "rate" ? null : value,
      sample_size: int(formData, "sampleSize", "Sample size", 1, 10_000_000, false), notes: text(formData, "notes", "Notes", { max: 2000 }),
      evidence_id: optId(formData, "evidenceId", "Source document"), supersedes_id: supersedes, entered_by: actor.userId,
    }));
    if (computed.noEligibleCases) return "Recorded: no eligible cases in this period (no percentage is shown, not 0%).";
    return supersedes ? "Correction recorded. The original value stays in the history." : "Result recorded as unverified.";
  }, UUID.test(indicatorId) ? `${BASE}/indicators/${indicatorId}` : `${BASE}/indicators`);
}

export async function verifyIndicatorResultAction(formData: FormData): Promise<never> {
  const indicatorId = String(formData.get("indicatorId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const verification = oneOf(formData, "verification", "Verification", ["verified", "rejected", "unverified"] as const);
    check(await client.from("gov_indicator_results").update({
      verification, verified_by: verification === "unverified" ? null : actor.userId, verification_note: text(formData, "note", "Note", { max: 2000 }),
    }).eq("id", id(formData, "resultId", "Result")).eq("organization_id", actor.organizationId));
    return { verified: "Value verified.", rejected: "Value rejected; it no longer appears in the trend.", unverified: "Verification withdrawn." }[verification];
  }, UUID.test(indicatorId) ? `${BASE}/indicators/${indicatorId}` : `${BASE}/indicators`);
}

/* ================================================================================================================ */
/* Links between governance records                                                                                  */
/* ================================================================================================================ */

export async function addLinkAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const ownType = oneOf(formData, "sourceType", "Record", LINK_TYPES);
    const ownId = id(formData, "sourceId", "Record");
    const picked = typedRef(formData, "target", LINK_TYPES);
    // "reverse" stores the link pointing AT the record the user is on (used for guidelines, so the version is pinned).
    const reverse = formData.get("reverse") === "1";
    const source = reverse ? picked : { type: ownType, id: ownId };
    const target = reverse ? { type: ownType, id: ownId } : picked;
    const versionRaw = target.type === "guideline" ? (String(formData.get("targetVersionId") ?? "") || String(formData.get(`version:${target.id}`) ?? "")) : "";
    check(await client.from("gov_links").insert({
      organization_id: actor.organizationId, source_type: source.type, source_id: source.id, target_type: target.type, target_id: target.id,
      target_version_id: versionRaw && UUID.test(versionRaw) ? versionRaw : null, note: text(formData, "note", "Note", { max: 500 }), created_by: actor.userId,
    }));
    return "Linked.";
  }, back(formData, BASE));
}

export async function removeLinkAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    check(await client.from("gov_links").delete().eq("id", id(formData, "linkId", "Link")).eq("organization_id", actor.organizationId));
    return "Link removed (the change is in the audit trail).";
  }, back(formData, BASE));
}

/* ================================================================================================================ */
/* Committees and meetings                                                                                           */
/* ================================================================================================================ */

const FREQUENCIES = ["weekly", "fortnightly", "monthly", "bimonthly", "quarterly", "biannual", "annual", "ad_hoc"] as const;

export async function createCommitteeAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const name = text(formData, "name", "Committee name", { required: true, max: 200 });
    const chair = optId(formData, "chairUserId", "Chair");
    const secretary = optId(formData, "secretaryUserId", "Secretary");
    const inserted = check(await client.from("gov_committees").insert({
      organization_id: actor.organizationId, name, purpose: text(formData, "purpose", "Purpose", { max: 4000 }), chair_user_id: chair, secretary_user_id: secretary,
      meeting_frequency: oneOf(formData, "meetingFrequency", "Meeting frequency", FREQUENCIES), template_key: text(formData, "templateKey", "Template", { max: 60 }) || null,
      created_by: actor.userId,
    }).select("id").single()) as { id: string } | undefined;
    if (inserted) {
      const members = [chair && { user_id: chair, member_role: "chair" }, secretary && secretary !== chair && { user_id: secretary, member_role: "secretary" }].filter(Boolean) as { user_id: string; member_role: string }[];
      if (members.length) check(await client.from("gov_committee_members").insert(members.map((m) => ({ ...m, organization_id: actor.organizationId, committee_id: inserted.id }))));
    }
    return `${name} created.`;
  }, `${BASE}/committees`);
}

export async function updateCommitteeAction(formData: FormData): Promise<never> {
  const committeeId = String(formData.get("committeeId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    check(await client.from("gov_committees").update({
      purpose: text(formData, "purpose", "Purpose", { max: 4000 }), chair_user_id: optId(formData, "chairUserId", "Chair"), secretary_user_id: optId(formData, "secretaryUserId", "Secretary"),
      meeting_frequency: oneOf(formData, "meetingFrequency", "Meeting frequency", FREQUENCIES), status: oneOf(formData, "status", "Status", ["active", "inactive"] as const),
    }).eq("id", id(formData, "committeeId", "Committee")).eq("organization_id", actor.organizationId));
    return "Committee profile saved.";
  }, UUID.test(committeeId) ? `${BASE}/committees/${committeeId}` : `${BASE}/committees`);
}

export async function addMemberAction(formData: FormData): Promise<never> {
  const committeeId = String(formData.get("committeeId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    check(await client.from("gov_committee_members").insert({
      organization_id: actor.organizationId, committee_id: id(formData, "committeeId", "Committee"), user_id: id(formData, "userId", "Member"),
      member_role: oneOf(formData, "memberRole", "Role", ["chair", "secretary", "member", "advisor"] as const),
    }));
    return "Member added.";
  }, UUID.test(committeeId) ? `${BASE}/committees/${committeeId}` : `${BASE}/committees`);
}

export async function removeMemberAction(formData: FormData): Promise<never> {
  const committeeId = String(formData.get("committeeId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    check(await client.from("gov_committee_members").delete().eq("id", id(formData, "memberId", "Member")).eq("organization_id", actor.organizationId));
    return "Member removed. Past attendance records are kept.";
  }, UUID.test(committeeId) ? `${BASE}/committees/${committeeId}` : `${BASE}/committees`);
}

const meetingReturn = (fd: FormData) => {
  const committeeId = String(fd.get("committeeId") ?? "");
  const meetingId = String(fd.get("meetingId") ?? "");
  return UUID.test(committeeId) ? `${BASE}/committees/${committeeId}${UUID.test(meetingId) ? `?meeting=${meetingId}` : ""}` : `${BASE}/committees`;
};

export async function scheduleMeetingAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    check(await client.from("gov_meetings").insert({
      organization_id: actor.organizationId, committee_id: id(formData, "committeeId", "Committee"), scheduled_at: dateTime(formData, "scheduledAt", "Date and time", true),
      location: text(formData, "location", "Location", { max: 200 }), agenda: text(formData, "agenda", "Agenda", { max: 8000 }), created_by: actor.userId,
    }));
    return "Meeting scheduled.";
  }, meetingReturn(formData));
}

export async function saveMeetingAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    check(await client.from("gov_meetings").update({
      agenda: text(formData, "agenda", "Agenda", { max: 8000 }), location: text(formData, "location", "Location", { max: 200 }),
      minutes: text(formData, "minutes", "Minutes", { max: 20000 }), next_meeting_at: dateTime(formData, "nextMeetingAt", "Next meeting"),
    }).eq("id", id(formData, "meetingId", "Meeting")).eq("organization_id", actor.organizationId));
    return "Meeting saved.";
  }, meetingReturn(formData));
}

export async function setMeetingStatusAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const status = oneOf(formData, "status", "Status", ["held", "minutes_drafted", "approved", "actions_followed_up", "cancelled"] as const);
    const update: Record<string, unknown> = { status };
    if (status === "approved") update.minutes_approved_by = actor.userId;
    check(await client.from("gov_meetings").update(update).eq("id", id(formData, "meetingId", "Meeting")).eq("organization_id", actor.organizationId));
    return { held: "Meeting marked as held.", minutes_drafted: "Minutes marked drafted.", approved: "Minutes approved. They are now frozen.", actions_followed_up: "All actions followed up.", cancelled: "Meeting cancelled." }[status];
  }, meetingReturn(formData));
}

export async function recordAttendanceAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const meetingId = id(formData, "meetingId", "Meeting");
    const rows: { organization_id: string; meeting_id: string; user_id: string; status: string }[] = [];
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("att:")) continue;
      const userId = key.slice(4);
      if (!UUID.test(userId) || !["present", "apologies", "absent"].includes(String(value))) continue;
      rows.push({ organization_id: actor.organizationId, meeting_id: meetingId, user_id: userId, status: String(value) });
    }
    if (rows.length === 0) throw new GovernanceInputError("Mark at least one member present, absent or sending apologies.");
    check(await client.from("gov_meeting_attendance").upsert(rows, { onConflict: "meeting_id,user_id" }));
    return "Attendance saved.";
  }, meetingReturn(formData));
}

export async function addDecisionAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    check(await client.from("gov_meeting_decisions").insert({
      organization_id: actor.organizationId, meeting_id: id(formData, "meetingId", "Meeting"), decision: text(formData, "decision", "Decision", { required: true, max: 4000 }), created_by: actor.userId,
    }));
    return "Decision recorded.";
  }, meetingReturn(formData));
}

/** A committee action is a CAPA row (kind follow_up) so it appears in the one action tracker. */
export async function addMeetingActionAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    check(await client.from("gov_capa").insert({
      organization_id: actor.organizationId, meeting_id: id(formData, "meetingId", "Meeting"), decision_id: optId(formData, "decisionId", "Decision"),
      action: text(formData, "action", "Action", { required: true, max: 2000 }), kind: "follow_up", owner_user_id: id(formData, "ownerUserId", "Owner"),
      due_date: date(formData, "dueDate", "Deadline", true), created_by: actor.userId,
    }));
    return "Action assigned. It appears in the corrective actions tracker too.";
  }, meetingReturn(formData));
}

export async function uploadMeetingFileAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async (ctx) => {
    const meetingId = id(formData, "meetingId", "Meeting");
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length === 0) throw new GovernanceInputError("Choose at least one file.");
    if (files.length > 5) throw new GovernanceInputError("Attach at most 5 files at a time.");
    for (const file of files) {
      const stored = await store(ctx, "committees", file, meetingId);
      check(await ctx.client.from("gov_meeting_files").insert({ organization_id: ctx.actor.organizationId, meeting_id: meetingId, storage_path: stored.path, file_name: stored.fileName, mime_type: stored.mime, size_bytes: stored.size, uploaded_by: ctx.actor.userId }));
    }
    return `${files.length} file${files.length === 1 ? "" : "s"} attached.`;
  }, meetingReturn(formData));
}

/* ================================================================================================================ */
/* Incidents and CAPA                                                                                                */
/* ================================================================================================================ */

const incidentReturn = (fd: FormData) => {
  const incidentId = String(fd.get("incidentId") ?? "");
  return UUID.test(incidentId) ? `${BASE}/incidents?view=${incidentId}&status=all` : `${BASE}/incidents`;
};

export async function updateInvestigationAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const started = date(formData, "investigationStartedOn", "Investigation start");
    const completed = date(formData, "investigationCompletedOn", "Investigation completion");
    if (started && completed && completed < started) throw new GovernanceInputError("The investigation cannot finish before it starts.");
    check(await client.from("gov_incidents").update({
      investigator_user_id: optId(formData, "investigatorUserId", "Investigator"), investigation_started_on: started, investigation_completed_on: completed,
      linked_policy_id: optId(formData, "linkedPolicyId", "Policy"), linked_guideline_id: optId(formData, "linkedGuidelineId", "Clinical guideline"),
    }).eq("id", id(formData, "incidentId", "Incident")).eq("organization_id", actor.organizationId));
    return "Investigation details saved.";
  }, incidentReturn(formData));
}

export async function uploadIncidentEvidenceAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async (ctx) => {
    const incidentId = id(formData, "incidentId", "Incident");
    const kind = oneOf(formData, "kind", "Type", ["rca", "capa_evidence", "report"] as const);
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length === 0) throw new GovernanceInputError("Choose at least one file.");
    if (files.length > 5) throw new GovernanceInputError("Attach at most 5 files at a time.");
    for (const file of files) {
      const stored = await store(ctx, "incidents", file, incidentId);
      check(await ctx.client.from("gov_incident_files").insert({ organization_id: ctx.actor.organizationId, incident_id: incidentId, storage_path: stored.path, file_name: stored.fileName, mime_type: stored.mime, size_bytes: stored.size, uploaded_by: ctx.actor.userId, kind }));
    }
    return kind === "rca" ? "Root cause analysis attached." : "File attached.";
  }, incidentReturn(formData));
}

export async function capaCompletionAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async (ctx) => {
    const capaId = id(formData, "capaId", "Action");
    const file = fileOf(formData, "file");
    const stored = file ? await store(ctx, "incidents", file, `capa-${capaId}`) : null;
    const update: Record<string, unknown> = { completion_note: text(formData, "completionNote", "Completion note", { max: 4000 }) };
    if (stored) { update.completion_evidence_path = stored.path; update.completion_file_name = stored.fileName; }
    check(await ctx.client.from("gov_capa").update(update).eq("id", capaId).eq("organization_id", ctx.actor.organizationId));
    return stored ? "Completion evidence attached." : "Completion note saved.";
  }, back(formData, `${BASE}/incidents`));
}

export async function capaEffectivenessAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const effectiveness = oneOf(formData, "effectiveness", "Effectiveness", ["not_assessed", "effective", "partially_effective", "not_effective"] as const);
    check(await client.from("gov_capa").update({ effectiveness, effectiveness_checked_by: effectiveness === "not_assessed" ? null : actor.userId })
      .eq("id", id(formData, "capaId", "Action")).eq("organization_id", actor.organizationId));
    return effectiveness === "not_effective" ? "Recorded as not effective. Consider a new action or an improvement project." : "Effectiveness recorded.";
  }, back(formData, `${BASE}/incidents`));
}

export async function recordNotificationAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    check(await client.from("gov_incident_notifications").insert({
      organization_id: actor.organizationId, incident_id: id(formData, "incidentId", "Incident"), rule_id: id(formData, "ruleId", "Rule"),
      reported_at: dateTime(formData, "reportedAt", "Reported at", true), external_reference: text(formData, "externalReference", "Reference", { max: 120 }),
      note: text(formData, "note", "Note", { max: 1000 }), recorded_by: actor.userId,
    }));
    return "Notification recorded.";
  }, incidentReturn(formData));
}

export async function startQipFromIncidentAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const incidentId = id(formData, "incidentId", "Incident");
    const inserted = check(await client.from("gov_qips").insert({
      organization_id: actor.organizationId, title: text(formData, "title", "Project title", { required: true, max: 240 }), aim: text(formData, "aim", "Aim", { max: 2000 }),
      source_incident_id: incidentId, lead_user_id: optId(formData, "leadUserId", "Lead"), created_by: actor.userId,
    }).select("id").single()) as { id: string } | undefined;
    if (inserted) check(await client.from("gov_qip_cycles").insert({ organization_id: actor.organizationId, qip_id: inserted.id, cycle_no: 1, plan_aim: text(formData, "aim", "Aim", { max: 2000 }), created_by: actor.userId }));
    return "Improvement project started from this incident (PDSA cycle 1, Plan).";
  }, incidentReturn(formData));
}

/* ================================================================================================================ */
/* Settings: risk methodology, regulatory rules                                                                      */
/* ================================================================================================================ */

export async function saveRiskSettingsAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const moderate = int(formData, "riskModerateMin", "Moderate from", 2, 25) as number;
    const high = int(formData, "riskHighMin", "High from", 2, 25) as number;
    const extreme = int(formData, "riskExtremeMin", "Extreme from", 2, 25) as number;
    if (!(moderate < high && high < extreme)) throw new GovernanceInputError("Bands must rise: moderate < high < extreme.");
    check(await client.from("gov_settings").upsert({
      organization_id: actor.organizationId, risk_moderate_min: moderate, risk_high_min: high, risk_extreme_min: extreme,
      risk_methodology_note: text(formData, "riskMethodologyNote", "Methodology note", { max: 500 }), updated_by: actor.userId, updated_at: new Date().toISOString(),
    }, { onConflict: "organization_id" }));
    return "Risk methodology saved.";
  }, `${BASE}/settings`);
}

export async function saveRegulatoryRuleAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const ruleId = optId(formData, "ruleId", "Rule");
    const within = int(formData, "reportWithinHours", "Report within (hours)", 1, 8760) as number;
    const remind = int(formData, "remindBeforeHours", "Remind before (hours)", 0, 8759, false) ?? 0;
    if (remind >= within) throw new GovernanceInputError("The reminder must come before the deadline.");
    const categories = text(formData, "categories", "Categories", { max: 1000 }).split(/[,;\n]+/).map((c) => c.trim()).filter(Boolean).slice(0, 30);
    const row = {
      program: text(formData, "program", "Programme", { required: true, max: 80 }), edition_id: optId(formData, "editionId", "Edition"),
      name: text(formData, "name", "Rule name", { required: true, max: 200 }), description: text(formData, "description", "Description", { max: 2000 }),
      applies_to_sentinel: formData.get("appliesToSentinel") === "on", min_severity: optOneOf(formData, "minSeverity", "Minimum severity", ["low", "medium", "high", "critical"] as const),
      categories, report_within_hours: within, remind_before_hours: remind, recipient: text(formData, "recipient", "Report to", { max: 200 }),
      source_note: text(formData, "sourceNote", "Source", { required: true, max: 500 }), is_active: formData.get("isActive") !== "off",
    };
    if (!row.applies_to_sentinel && !row.min_severity && categories.length === 0) throw new GovernanceInputError("Give the rule at least one condition (sentinel events, a minimum severity or categories).");
    if (ruleId) check(await client.from("gov_regulatory_rules").update(row).eq("id", ruleId).eq("organization_id", actor.organizationId));
    else check(await client.from("gov_regulatory_rules").insert({ ...row, organization_id: actor.organizationId, created_by: actor.userId }));
    return ruleId ? "Rule saved." : "Reporting rule added.";
  }, `${BASE}/settings`);
}

/* ================================================================================================================ */
/* Audits, observations, QIP cycles                                                                                  */
/* ================================================================================================================ */

export async function createAuditTemplateAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const criteria = criteriaFromLines(text(formData, "criteria", "Audit criteria", { required: true, max: 20000 }));
    if (criteria.length === 0) throw new GovernanceInputError("Write at least one audit criterion (one per line).");
    const code = text(formData, "standardCode", "Standard code", { max: 60 });
    let standardId: string | null = null;
    if (code) {
      const found = check(await client.from("gov_standards").select("id").eq("organization_id", actor.organizationId).eq("code", code).limit(1)) as { id: string }[] | undefined;
      if (!found?.length) throw new GovernanceInputError(`Standard ${code} is not in your register.`);
      standardId = found[0].id;
    }
    check(await client.from("gov_audit_templates").insert({
      organization_id: actor.organizationId, title: text(formData, "title", "Title", { required: true, max: 240 }), objective: text(formData, "objective", "Objective", { max: 2000 }),
      clinical_standard: text(formData, "clinicalStandard", "Clinical standard", { max: 500 }), standard_id: standardId, criteria,
      inclusion_criteria: text(formData, "inclusionCriteria", "Inclusion criteria", { max: 2000 }), exclusion_criteria: text(formData, "exclusionCriteria", "Exclusion criteria", { max: 2000 }),
      sample_size: int(formData, "sampleSize", "Sample size", 1, 1_000_000, false), measurement_period: text(formData, "measurementPeriod", "Measurement period", { max: 200 }),
      data_collection_method: text(formData, "dataCollectionMethod", "Data collection method", { max: 500 }),
      numerator_definition: text(formData, "numeratorDefinition", "Numerator", { max: 1000 }), denominator_definition: text(formData, "denominatorDefinition", "Denominator", { max: 1000 }),
      lead_user_id: optId(formData, "leadUserId", "Audit lead"), action_plan_guidance: text(formData, "actionPlanGuidance", "Action plan guidance", { max: 2000 }),
      reaudit_interval_months: int(formData, "reauditIntervalMonths", "Re-audit after (months)", 1, 60, false), created_by: actor.userId,
    }));
    return "Audit template saved.";
  }, `${BASE}/audits?tab=templates`);
}

export async function scheduleFromTemplateAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const templateId = id(formData, "templateId", "Template");
    const tpl = check(await client.from("gov_audit_templates").select("*").eq("id", templateId).eq("organization_id", actor.organizationId).maybeSingle()) as Record<string, unknown> | null | undefined;
    if (!tpl) throw new GovernanceInputError("That template could not be found.");
    check(await client.from("gov_audits").insert({
      organization_id: actor.organizationId, title: text(formData, "title", "Title", { max: 240 }) || String(tpl.title), category: "Template audit",
      standard_id: tpl.standard_id ?? null, department: text(formData, "department", "Department", { max: 160 }), owner_user_id: optId(formData, "ownerUserId", "Lead auditor") ?? (tpl.lead_user_id as string | null),
      scheduled_for: date(formData, "scheduledFor", "Date", true), target_pct: decimal(formData, "targetPct", "Target %", 0, 100), template_id: templateId,
      objective: String(tpl.objective ?? ""), source_qip_id: optId(formData, "sourceQipId", "Improvement project"), created_by: actor.userId,
    }));
    return "Audit scheduled from the template.";
  }, back(formData, `${BASE}/audits`));
}

export async function addObservationAction(formData: FormData): Promise<never> {
  return perform(formData, "member", async ({ client, actor }) => {
    const auditId = id(formData, "auditId", "Audit");
    const audit = check(await client.from("gov_audits").select("template_id, owner_user_id").eq("id", auditId).eq("organization_id", actor.organizationId).maybeSingle()) as { template_id: string | null; owner_user_id: string | null } | null | undefined;
    if (!audit?.template_id) throw new GovernanceInputError("This audit has no template, so there are no criteria to record.");
    const tpl = check(await client.from("gov_audit_templates").select("criteria").eq("id", audit.template_id).maybeSingle()) as { criteria: unknown } | null | undefined;
    const criteria = parseCriteria(tpl?.criteria);
    const results: Record<string, string> = {};
    for (const c of criteria) {
      const v = String(formData.get(`r:${c.id}`) ?? "");
      results[c.id] = ["met", "not_met", "na"].includes(v) ? v : "na";
    }
    check(await client.from("gov_audit_observations").insert({
      organization_id: actor.organizationId, audit_id: auditId, case_ref: text(formData, "caseRef", "Case label", { max: 60 }), results,
      note: text(formData, "note", "Note", { max: 1000 }), observed_on: date(formData, "observedOn", "Observed on") ?? isoDate(new Date()), recorded_by: actor.userId,
    }));
    return "Observation recorded.";
  }, back(formData, `${BASE}/audits`));
}

export async function removeObservationAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    check(await client.from("gov_audit_observations").delete().eq("id", id(formData, "observationId", "Observation")).eq("organization_id", actor.organizationId));
    return "Observation removed.";
  }, back(formData, `${BASE}/audits`));
}

/** Completes an audit from its recorded observations: numerator, denominator and % are calculated, never typed. */
export async function completeAuditFromObservationsAction(formData: FormData): Promise<never> {
  return perform(formData, "member", async ({ client, actor }) => {
    const auditId = id(formData, "auditId", "Audit");
    const audit = check(await client.from("gov_audits").select("template_id, scheduled_for").eq("id", auditId).eq("organization_id", actor.organizationId).maybeSingle()) as { template_id: string | null; scheduled_for: string } | null | undefined;
    if (!audit?.template_id) throw new GovernanceInputError("This audit has no template; record the result directly instead.");
    const tpl = check(await client.from("gov_audit_templates").select("criteria, reaudit_interval_months").eq("id", audit.template_id).maybeSingle()) as { criteria: unknown; reaudit_interval_months: number | null } | null | undefined;
    const observations = await pageAll((f, t) => client.from("gov_audit_observations").select("id, audit_id, case_ref, results, note, observed_on, recorded_by").eq("audit_id", auditId).order("id").range(f, t));
    const compliance = auditCompliance(parseCriteria(tpl?.criteria), observations.map((o) => ({ id: String(o.id), auditId, caseRef: String(o.case_ref ?? ""), results: (o.results ?? {}) as ObservationRow["results"], note: "", observedOn: String(o.observed_on), recordedBy: null })));
    if (compliance.pct === null || compliance.denominator === 0) throw new GovernanceInputError("Record at least one case where a criterion applies before completing the audit.");
    const reaudit = date(formData, "reauditDue", "Re-audit date") ?? (tpl?.reaudit_interval_months ? addMonths(isoDate(new Date()), Number(tpl.reaudit_interval_months)) : null);
    // The database calculates the percentage from the counts and completes the audit in one step.
    const { error } = await client.rpc("gov_complete_audit_counts", {
      p_actor: actor.userId, p_audit: auditId, p_numerator: compliance.numerator, p_denominator: compliance.denominator,
      p_findings: text(formData, "findings", "Findings", { max: 8000 }), p_action_plan: text(formData, "actionPlan", "Action plan", { max: 4000 }), p_reaudit: reaudit,
    });
    if (error) throw new Error(error.message);
    return `Audit completed: ${compliance.numerator} of ${compliance.denominator} cases compliant (${compliance.pct}%).`;
  }, back(formData, `${BASE}/audits`));
}

export async function createQipFromAuditAction(formData: FormData): Promise<never> {
  return perform(formData, "writer", async ({ client, actor }) => {
    const auditId = id(formData, "auditId", "Audit");
    const inserted = check(await client.from("gov_qips").insert({
      organization_id: actor.organizationId, title: text(formData, "title", "Project title", { required: true, max: 240 }), aim: text(formData, "aim", "Aim", { max: 2000 }),
      measure: text(formData, "measure", "Measure", { max: 1000 }), unit: "%", baseline_value: decimal(formData, "baselineValue", "Baseline", 0, 100), current_value: decimal(formData, "baselineValue", "Baseline", 0, 100),
      target_value: decimal(formData, "targetValue", "Target", 0, 100), source_audit_id: auditId, lead_user_id: optId(formData, "leadUserId", "Lead"), created_by: actor.userId,
    }).select("id").single()) as { id: string } | undefined;
    if (inserted) check(await client.from("gov_qip_cycles").insert({ organization_id: actor.organizationId, qip_id: inserted.id, cycle_no: 1, plan_aim: text(formData, "aim", "Aim", { max: 2000 }), created_by: actor.userId }));
    return "Improvement project started from the audit finding.";
  }, `${BASE}/audits`);
}

export async function startCycleAction(formData: FormData): Promise<never> {
  const qipId = String(formData.get("qipId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const qid = id(formData, "qipId", "Project");
    const last = check(await client.from("gov_qip_cycles").select("cycle_no").eq("qip_id", qid).order("cycle_no", { ascending: false }).limit(1)) as { cycle_no: number }[] | undefined;
    const next = (last?.[0]?.cycle_no ?? 0) + 1;
    check(await client.from("gov_qip_cycles").insert({ organization_id: actor.organizationId, qip_id: qid, cycle_no: next, plan_aim: text(formData, "planAim", "Aim", { max: 2000 }), created_by: actor.userId }));
    return `PDSA cycle ${next} started in Plan.`;
  }, UUID.test(qipId) ? `${BASE}/audits/qip/${qipId}` : `${BASE}/audits`);
}

const CYCLE_FIELDS: Record<string, [string, string, number]> = {
  planAim: ["plan_aim", "Aim", 2000], prediction: ["prediction", "Prediction", 2000], intervention: ["intervention", "Intervention", 2000], measurementPlan: ["measurement_plan", "Measurement plan", 2000],
  doNotes: ["do_notes", "Implementation", 4000], doObservations: ["do_observations", "Observations", 4000], studyResults: ["study_results", "Results", 4000],
  studyComparison: ["study_comparison", "Comparison with prediction", 4000], lessonsLearned: ["lessons_learned", "Lessons learned", 4000], actNotes: ["act_notes", "Notes", 4000],
};

export async function updateCycleAction(formData: FormData): Promise<never> {
  const qipId = String(formData.get("qipId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const cycleId = id(formData, "cycleId", "Cycle");
    const update: Record<string, unknown> = {};
    for (const [field, [column, label, max]] of Object.entries(CYCLE_FIELDS)) if (formData.has(field)) update[column] = text(formData, field, label, { max });
    const decision = optOneOf(formData, "actDecision", "Decision", ["adopt", "adapt", "abandon", "repeat"] as const);
    if (decision) update.act_decision = decision;
    const advance = optOneOf(formData, "advanceTo", "Next stage", ["do", "study", "act", "closed"] as const);
    if (advance) update.status = advance;
    if (Object.keys(update).length === 0) throw new GovernanceInputError("Nothing to save.");
    check(await client.from("gov_qip_cycles").update(update).eq("id", cycleId).eq("organization_id", actor.organizationId));
    if (advance === "closed" && decision === "adopt" && formData.get("completeProject") === "on" && UUID.test(qipId)) {
      check(await client.from("gov_qips").update({ status: "completed" }).eq("id", qipId).eq("organization_id", actor.organizationId));
    }
    return advance ? `Cycle moved to ${advance === "closed" ? "closed" : advance}.` : "Cycle saved.";
  }, UUID.test(qipId) ? `${BASE}/audits/qip/${qipId}` : `${BASE}/audits`);
}

export async function scheduleReauditFromQipAction(formData: FormData): Promise<never> {
  const qipId = String(formData.get("qipId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const qid = id(formData, "qipId", "Project");
    const templateId = optId(formData, "templateId", "Template");
    check(await client.from("gov_audits").insert({
      organization_id: actor.organizationId, title: text(formData, "title", "Title", { required: true, max: 240 }), category: templateId ? "Template audit" : "Re-audit",
      scheduled_for: date(formData, "scheduledFor", "Date", true), target_pct: decimal(formData, "targetPct", "Target %", 0, 100), template_id: templateId, source_qip_id: qid,
      owner_user_id: optId(formData, "ownerUserId", "Lead auditor"), created_by: actor.userId,
    }));
    return "Re-audit scheduled and linked to this project.";
  }, UUID.test(qipId) ? `${BASE}/audits/qip/${qipId}` : `${BASE}/audits`);
}

/* ================================================================================================================ */
/* Guideline governance                                                                                              */
/* ================================================================================================================ */

export async function saveGuidelineReviewAction(formData: FormData): Promise<never> {
  const guidelineId = String(formData.get("guidelineId") ?? "");
  return perform(formData, "writer", async ({ client, actor }) => {
    const gid = id(formData, "guidelineId", "Guideline");
    const status = oneOf(formData, "status", "Governance status", ["not_reviewed", "under_review", "approved", "changes_requested", "retired"] as const);
    const versionId = optId(formData, "governedVersionId", "Version");
    if (status === "approved" && !versionId) throw new GovernanceInputError("Choose the version you are approving.");
    check(await client.from("gov_guideline_reviews").upsert({
      organization_id: actor.organizationId, guideline_id: gid, status, governed_version_id: versionId, owner_user_id: optId(formData, "ownerUserId", "Governance owner"),
      next_review_due: date(formData, "nextReviewDue", "Next review due"), decision_note: text(formData, "decisionNote", "Decision note", { max: 2000 }),
      approved_by: status === "approved" ? actor.userId : null, updated_by: actor.userId,
    }, { onConflict: "organization_id,guideline_id" }));
    return status === "approved" ? "Governance approval recorded for this version. The clinical content was not changed." : "Governance status saved.";
  }, UUID.test(guidelineId) ? `${BASE}/policies/guidelines?view=${guidelineId}` : `${BASE}/policies/guidelines`);
}
