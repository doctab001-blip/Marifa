import "server-only";
import { medicationMissingFields } from "@/lib/clinical-orders/derive-order-items";
import { assertCanManageOrders, findDuplicates } from "@/lib/clinical-orders/policy";
import { toEncounterContext } from "@/lib/clinical-orders/repository";
import {
  editableOrderSchema,
  OrderWorkflowError,
  orderSection,
  type EncounterContext,
  type ExistingOrder,
  type OrderActor,
  type OrderPriority,
  type OrderSection,
  type OrderStatus,
  type OrderType,
} from "@/lib/clinical-orders/types";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { z } from "zod";

/** Patient workspace data access. Every call re-checks the actor's role and scopes by organisation. */

export type PatientRow = { id: string; mrn: string; fullName: string; dateOfBirth: string | null; sex: string | null; activeEncounters: number };
export type EncounterRow = { id: string; encounterType: string; status: "active" | "closed"; startedAt: string; closedAt: string | null };
export type WorkspaceOrder = {
  id: string; encounterId: string; orderType: OrderType; section: OrderSection; orderName: string; category: string; priority: OrderPriority | null;
  indication: string; instructions: string; details: Record<string, string>; status: OrderStatus; incomplete: boolean; missingFields: string[];
  isConditional: boolean; conditionText: string; conditionConfirmed: boolean; isManual: boolean; isEdited: boolean; modifiedFromProtocol: boolean;
  createdAt: string; protocol: { id: string; title: string; version: string; sourceModule: string } | null;
};
export type PatientWorkspace = { patient: { id: string; mrn: string; fullName: string; dateOfBirth: string | null; sex: string | null }; encounters: EncounterRow[]; orders: WorkspaceOrder[] };

type Joined<T> = T | T[] | null | undefined;
const one = <T,>(value: Joined<T>): T | undefined => (Array.isArray(value) ? value[0] : (value ?? undefined));
const uuid = z.uuid();

export async function listPatients(actor: OrderActor | null): Promise<PatientRow[]> {
  assertCanManageOrders(actor);
  const supabase = await createSupabaseDataClient();
  const { data, error } = await supabase.from("patients").select("id,mrn,full_name,date_of_birth,sex,encounters(status)").eq("organization_id", actor.organizationId).order("created_at", { ascending: false }).limit(200);
  if (error) throw new OrderWorkflowError("save_failed", "Patients could not be loaded.");
  return (data ?? []).map((row) => ({
    id: row.id, mrn: row.mrn, fullName: row.full_name, dateOfBirth: row.date_of_birth, sex: row.sex,
    activeEncounters: ((row.encounters ?? []) as Array<{ status: string }>).filter((encounter) => encounter.status === "active").length,
  }));
}

const patientSchema = z.object({
  mrn: z.string().trim().min(1, "Enter a record number").max(40),
  fullName: z.string().trim().min(1, "Enter a name").max(160),
  dateOfBirth: z.string().trim().optional().transform((value) => (value ? value : null)).pipe(z.iso.date().nullable()),
  sex: z.enum(["female", "male", "other", "unknown"]).default("unknown"),
});

/** Demonstration patients only: the platform is not approved for real patient data. */
export async function createPatient(actor: OrderActor | null, input: unknown) {
  assertCanManageOrders(actor);
  const parsed = patientSchema.safeParse(input);
  if (!parsed.success) throw new OrderWorkflowError("invalid_selection", parsed.error.issues[0]?.message ?? "The patient details are not valid.");
  const supabase = await createSupabaseDataClient();
  const { data, error } = await supabase.from("patients").insert({
    organization_id: actor.organizationId, mrn: parsed.data.mrn, full_name: parsed.data.fullName, date_of_birth: parsed.data.dateOfBirth, sex: parsed.data.sex, is_fictional: true, created_by: actor.userId,
  }).select("id").single();
  if (error || !data) throw new OrderWorkflowError("save_failed", error?.code === "23505" ? "A patient with that record number already exists." : "The patient could not be created.");
  return data.id as string;
}

export async function startEncounter(actor: OrderActor | null, patientId: string, encounterType: string) {
  assertCanManageOrders(actor);
  if (!uuid.safeParse(patientId).success) throw new OrderWorkflowError("invalid_selection", "Choose a patient.");
  const type = z.enum(["emergency", "inpatient", "outpatient"]).catch("emergency").parse(encounterType);
  const supabase = await createSupabaseDataClient();
  const { data: patient } = await supabase.from("patients").select("id").eq("id", patientId).eq("organization_id", actor.organizationId).maybeSingle();
  if (!patient) throw new OrderWorkflowError("no_encounter", "That patient could not be found.");
  const { data, error } = await supabase.from("encounters").insert({ organization_id: actor.organizationId, patient_id: patientId, encounter_type: type, created_by: actor.userId }).select("id").single();
  if (error || !data) throw new OrderWorkflowError("save_failed", "The encounter could not be started.");
  return data.id as string;
}

export async function closeEncounter(actor: OrderActor | null, encounterId: string) {
  assertCanManageOrders(actor);
  const supabase = await createSupabaseDataClient();
  const { error } = await supabase.from("encounters").update({ status: "closed", closed_at: new Date().toISOString() }).eq("id", encounterId).eq("organization_id", actor.organizationId).eq("status", "active");
  if (error) throw new OrderWorkflowError("save_failed", "The encounter could not be closed.");
}

export async function getEncounterContext(actor: OrderActor | null, encounterId: string): Promise<EncounterContext | null> {
  assertCanManageOrders(actor);
  if (!uuid.safeParse(encounterId).success) return null;
  const supabase = await createSupabaseDataClient();
  const { data } = await supabase.from("encounters").select("id,patient_id,organization_id,status,encounter_type,started_at,patient:patients(full_name,mrn)").eq("id", encounterId).eq("organization_id", actor.organizationId).maybeSingle();
  return data ? toEncounterContext(data as never) : null;
}

export async function getPatientWorkspace(actor: OrderActor | null, patientId: string): Promise<PatientWorkspace | null> {
  assertCanManageOrders(actor);
  if (!uuid.safeParse(patientId).success) return null;
  const supabase = await createSupabaseDataClient();
  const { data: patient } = await supabase.from("patients").select("id,mrn,full_name,date_of_birth,sex").eq("id", patientId).eq("organization_id", actor.organizationId).maybeSingle();
  if (!patient) return null;
  const [{ data: encounters }, { data: orders }] = await Promise.all([
    supabase.from("encounters").select("id,encounter_type,status,started_at,closed_at").eq("patient_id", patientId).eq("organization_id", actor.organizationId).order("started_at", { ascending: false }),
    supabase.from("patient_orders").select("*,provenance:patient_order_provenance(protocol_id,protocol_title,protocol_version,source_module)").eq("patient_id", patientId).eq("organization_id", actor.organizationId).neq("status", "cancelled").order("created_at", { ascending: true }),
  ]);
  return {
    patient: { id: patient.id, mrn: patient.mrn, fullName: patient.full_name, dateOfBirth: patient.date_of_birth, sex: patient.sex },
    encounters: (encounters ?? []).map((row) => ({ id: row.id, encounterType: row.encounter_type, status: row.status, startedAt: row.started_at, closedAt: row.closed_at })),
    orders: (orders ?? []).map((row) => {
      const provenance = one(row.provenance as Joined<{ protocol_id: string; protocol_title: string; protocol_version: string; source_module: string }>);
      return {
        id: row.id, encounterId: row.encounter_id, orderType: row.order_type, section: orderSection(row.order_type), orderName: row.order_name, category: row.category, priority: row.priority,
        indication: row.indication, instructions: row.instructions, details: (row.details ?? {}) as Record<string, string>, status: row.status, incomplete: row.incomplete,
        missingFields: (row.missing_fields ?? []) as string[], isConditional: row.is_conditional, conditionText: row.condition_text, conditionConfirmed: row.condition_confirmed,
        isManual: row.is_manual, isEdited: row.is_edited, modifiedFromProtocol: row.modified_from_protocol, createdAt: row.created_at,
        protocol: provenance ? { id: provenance.protocol_id, title: provenance.protocol_title, version: provenance.protocol_version, sourceModule: provenance.source_module } : null,
      } satisfies WorkspaceOrder;
    }),
  };
}

async function loadEditableOrder(actor: OrderActor, orderId: string) {
  if (!uuid.safeParse(orderId).success) throw new OrderWorkflowError("invalid_selection", "That order could not be found.");
  const supabase = await createSupabaseDataClient();
  const { data } = await supabase.from("patient_orders").select("*").eq("id", orderId).eq("organization_id", actor.organizationId).maybeSingle();
  if (!data) throw new OrderWorkflowError("invalid_selection", "That order could not be found.");
  if (!["draft", "reviewed"].includes(data.status)) throw new OrderWorkflowError("invalid_selection", data.status === "signed" ? "Signed orders cannot be changed here." : "That order has been removed.");
  return { supabase, order: data };
}

const orderEditSchema = editableOrderSchema.pick({ orderName: true, priority: true, indication: true, instructions: true, parameters: true });

/** Editing keeps manual changes and withdraws any earlier review (the database trigger returns a reviewed order to draft). */
export async function updateOrder(actor: OrderActor | null, orderId: string, input: unknown) {
  assertCanManageOrders(actor);
  const parsed = orderEditSchema.safeParse(input);
  if (!parsed.success) throw new OrderWorkflowError("invalid_selection", parsed.error.issues[0]?.message ?? "The order is not valid.");
  const { supabase, order } = await loadEditableOrder(actor, orderId);
  const details = Object.fromEntries(Object.entries({ ...(order.details ?? {}), ...parsed.data.parameters }).map(([key, value]) => [key, String(value).trim()]).filter(([, value]) => value !== ""));
  const missing = order.order_type === "medication" ? medicationMissingFields(details) : (order.missing_fields as string[]);
  const { error } = await supabase.from("patient_orders").update({
    order_name: parsed.data.orderName, priority: parsed.data.priority, indication: parsed.data.indication, instructions: parsed.data.instructions,
    details, incomplete: missing.length > 0, missing_fields: missing, updated_by: actor.userId,
  }).eq("id", orderId).eq("organization_id", actor.organizationId);
  if (error) throw new OrderWorkflowError("save_failed", "The order could not be updated.");
}

/** Clinician confirms a draft. Still NOT signed or transmitted. Incomplete orders and unconfirmed conditions are refused. */
export async function markOrderReviewed(actor: OrderActor | null, orderId: string, conditionConfirmed: boolean) {
  assertCanManageOrders(actor);
  const { supabase, order } = await loadEditableOrder(actor, orderId);
  if (order.incomplete) throw new OrderWorkflowError("invalid_selection", "Complete the missing information before marking this order reviewed.");
  if (order.is_conditional && !conditionConfirmed && !order.condition_confirmed) throw new OrderWorkflowError("invalid_selection", "Confirm that the protocol's condition applies to this patient first.");
  const { error } = await supabase.from("patient_orders").update({ status: "reviewed", condition_confirmed: order.is_conditional ? true : order.condition_confirmed, updated_by: actor.userId }).eq("id", orderId).eq("organization_id", actor.organizationId);
  if (error) throw new OrderWorkflowError("save_failed", "The order could not be marked reviewed.");
}

/** "Remove": the order is cancelled and hidden, never deleted, so the audit trail stays whole. */
export async function removeOrder(actor: OrderActor | null, orderId: string) {
  assertCanManageOrders(actor);
  const { supabase } = await loadEditableOrder(actor, orderId);
  const { error } = await supabase.from("patient_orders").update({ status: "cancelled", updated_by: actor.userId }).eq("id", orderId).eq("organization_id", actor.organizationId);
  if (error) throw new OrderWorkflowError("save_failed", "The order could not be removed.");
}

const manualSchema = editableOrderSchema.pick({ orderType: true, orderName: true, category: true, priority: true, indication: true, instructions: true, parameters: true, allowDuplicate: true });

export async function addManualOrder(actor: OrderActor | null, encounterId: string, input: unknown) {
  assertCanManageOrders(actor);
  const parsed = manualSchema.safeParse(input);
  if (!parsed.success) throw new OrderWorkflowError("invalid_selection", parsed.error.issues[0]?.message ?? "The order is not valid.");
  const encounter = await getEncounterContext(actor, encounterId);
  if (!encounter) throw new OrderWorkflowError("no_encounter", "That patient encounter could not be found.");
  if (encounter.status !== "active") throw new OrderWorkflowError("encounter_closed", "That encounter is closed. Orders can only be added to an active encounter.");
  const supabase = await createSupabaseDataClient();
  const { data: rows } = await supabase.from("patient_orders").select("id,order_type,order_name,status").eq("encounter_id", encounterId).eq("organization_id", actor.organizationId).neq("status", "cancelled");
  const existing: ExistingOrder[] = (rows ?? []).map((row) => ({ id: row.id, orderType: row.order_type, orderName: row.order_name, status: row.status, protocolId: null, sourceKey: null }));
  const matches = findDuplicates({ sourceKey: null, orderType: parsed.data.orderType, orderName: parsed.data.orderName }, "", existing);
  if (matches.length > 0 && !parsed.data.allowDuplicate) throw new OrderWorkflowError("duplicates_need_review", "This looks like an order already on the encounter. Add it anyway only if you intend a second order.", matches);
  const details = Object.fromEntries(Object.entries(parsed.data.parameters).filter(([, value]) => value.trim() !== ""));
  const missing = parsed.data.orderType === "medication" ? medicationMissingFields(details) : [];
  const { error } = await supabase.from("patient_orders").insert({
    organization_id: actor.organizationId, patient_id: encounter.patientId, encounter_id: encounter.encounterId, order_type: parsed.data.orderType, order_name: parsed.data.orderName,
    category: parsed.data.category, priority: parsed.data.priority, indication: parsed.data.indication, instructions: parsed.data.instructions, details,
    status: "draft", incomplete: missing.length > 0, missing_fields: missing, is_manual: true, created_by: actor.userId, updated_by: actor.userId,
  });
  if (error) throw new OrderWorkflowError("save_failed", "The order could not be added.");
}
