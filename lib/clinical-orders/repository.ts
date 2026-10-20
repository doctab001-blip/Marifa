import "server-only";
import { isClinicalDirectoryEligible } from "@/lib/data/clinical-directory-eligibility";
import { createSupabaseDataClient } from "@/lib/supabase/data-client";
import { DiseaseDetailSchema } from "@/lib/validations/disease";
import {
  OrderAuthorizationError,
  OrderWorkflowError,
  type EncounterContext,
  type ExistingOrder,
  type OrderActor,
  type OrderStatus,
  type OrderType,
  type ProtocolSourceModule,
} from "@/lib/clinical-orders/types";
import type { ApplyOrdersInput, ApplyOrdersResult, LoadedProtocol, OrdersRepository } from "@/lib/clinical-orders/service";

type Joined<T> = T | T[] | null | undefined;
const one = <T,>(value: Joined<T>): T | undefined => (Array.isArray(value) ? value[0] : (value ?? undefined));

type EncounterRow = {
  id: string; patient_id: string; organization_id: string; status: "active" | "closed"; encounter_type: string; started_at: string;
  patient: Joined<{ full_name: string; mrn: string }>;
};

export function toEncounterContext(row: EncounterRow): EncounterContext | null {
  const patient = one(row.patient);
  if (!patient) return null;
  const started = new Date(row.started_at);
  const when = Number.isNaN(started.getTime()) ? "" : ` · started ${started.toISOString().slice(0, 16).replace("T", " ")} UTC`;
  return {
    encounterId: row.id,
    patientId: row.patient_id,
    organizationId: row.organization_id,
    status: row.status,
    patientName: patient.full_name,
    mrn: patient.mrn,
    encounterLabel: `${row.encounter_type.charAt(0).toUpperCase()}${row.encounter_type.slice(1)} encounter${when}`,
  };
}

const ENCOUNTER_SELECT = "id,patient_id,organization_id,status,encounter_type,started_at,patient:patients(full_name,mrn)";

function mapRpcError(error: { message?: string; details?: string | null }): never {
  const message = error.message ?? "";
  if (message.includes("duplicate_orders_require_review")) {
    let keys: unknown = [];
    try { keys = JSON.parse(error.details ?? "[]"); } catch { /* keep empty */ }
    throw new OrderWorkflowError("duplicates_need_review", "Some orders may duplicate orders already on this encounter. Review them and choose whether to add each one.", keys);
  }
  if (message.includes("not_authorised") || message.includes("actor_mismatch") || message.includes("not_authenticated")) throw new OrderAuthorizationError();
  if (message.includes("encounter_closed")) throw new OrderWorkflowError("encounter_closed", "That encounter is closed. Orders can only be added to an active encounter.");
  if (message.includes("encounter_not_found")) throw new OrderWorkflowError("no_encounter", "That patient encounter could not be found.");
  if (message.includes("protocol_unavailable")) throw new OrderWorkflowError("protocol_unavailable", "This protocol is not available for ordering.");
  if (message.includes("unknown_protocol_item")) throw new OrderWorkflowError("unknown_item", "An order does not belong to this protocol version. Reload the protocol and try again.");
  throw new OrderWorkflowError("save_failed", "The orders could not be saved. Nothing was created. Try again.", message);
}

/** Supabase implementation. Every query is scoped to the acting user's organisation in code, in addition to row-level security. */
export function createOrdersRepository(): OrdersRepository {
  return {
    async loadProtocol(protocolId: string, _sourceModule: ProtocolSourceModule, actor: OrderActor): Promise<LoadedProtocol | null> {
      const supabase = await createSupabaseDataClient();
      const { data, error } = await supabase
        .from("clinical_guidelines")
        .select("id,title,specialty,organization_id,guideline_versions!inner(id,content,status,is_current)")
        .eq("id", protocolId)
        .eq("guideline_versions.is_current", true)
        .in("guideline_versions.status", ["approved", "published"])
        .maybeSingle();
      if (error || !data) return null;
      // Shared reference topics and this organisation's own protocols only.
      if (data.organization_id && data.organization_id !== actor.organizationId) return null;
      const version = one(data.guideline_versions as Joined<{ id: string; content: unknown; status: string }>);
      if (!version) return null;
      const parsed = DiseaseDetailSchema.safeParse(version.content);
      if (!parsed.success || parsed.data.id !== data.id) return null;
      // Shared topics follow the same visibility rule as the Disease Management directory.
      if (!data.organization_id && (parsed.data.status !== "approved" || !isClinicalDirectoryEligible(parsed.data))) return null;
      if (data.organization_id && !["approved", "published"].includes(parsed.data.status)) return null;
      return {
        identity: { protocolId: data.id, protocolVersionId: version.id, protocolVersion: parsed.data.version, title: parsed.data.title, specialty: parsed.data.specialty, status: version.status },
        disease: parsed.data,
      };
    },

    async loadEncounter(encounterId: string, actor: OrderActor) {
      const supabase = await createSupabaseDataClient();
      const { data } = await supabase.from("encounters").select(ENCOUNTER_SELECT).eq("id", encounterId).eq("organization_id", actor.organizationId).maybeSingle();
      return data ? toEncounterContext(data as unknown as EncounterRow) : null;
    },

    async listActiveEncounters(actor: OrderActor) {
      const supabase = await createSupabaseDataClient();
      const { data } = await supabase.from("encounters").select(ENCOUNTER_SELECT).eq("organization_id", actor.organizationId).eq("status", "active").order("started_at", { ascending: false }).limit(50);
      return ((data ?? []) as unknown as EncounterRow[]).flatMap((row) => toEncounterContext(row) ?? []);
    },

    async listEncounterOrders(encounterId: string, actor: OrderActor): Promise<ExistingOrder[]> {
      const supabase = await createSupabaseDataClient();
      const { data, error } = await supabase
        .from("patient_orders")
        .select("id,order_type,order_name,status,provenance:patient_order_provenance(protocol_id,source_key)")
        .eq("organization_id", actor.organizationId)
        .eq("encounter_id", encounterId)
        .neq("status", "cancelled");
      if (error) throw new OrderWorkflowError("save_failed", "Existing orders could not be checked for duplicates, so nothing was changed. Try again.");
      return (data ?? []).map((row) => {
        const provenance = one(row.provenance as Joined<{ protocol_id: string; source_key: string }>);
        return { id: row.id, orderType: row.order_type as OrderType, orderName: row.order_name, status: row.status as OrderStatus, protocolId: provenance?.protocol_id ?? null, sourceKey: provenance?.source_key ?? null };
      });
    },

    async applyOrders(input: ApplyOrdersInput): Promise<ApplyOrdersResult> {
      const supabase = await createSupabaseDataClient();
      const { data, error } = await supabase.rpc("apply_protocol_orders", {
        p_actor: input.actor.userId,
        p_encounter: input.encounterId,
        p_protocol: { id: input.protocol.protocolId, version_id: input.protocol.protocolVersionId, version: input.protocol.protocolVersion, title: input.protocol.title, source_module: input.protocol.sourceModule },
        p_set_items: input.setItems.map((item) => ({
          source_key: item.sourceKey, order_type: item.orderType, order_name: item.orderName, instructions: item.instructions, order_parameters: item.parameters,
          required_information: item.requiredInformation, condition_rules: item.conditionRules, requirement: item.requirement, is_optional: item.isOptional, display_order: item.displayOrder,
        })),
        p_orders: input.orders,
      });
      if (error) mapRpcError(error);
      const result = data as { application_id: string; created: Array<{ order_id: string; source_key: string | null; status: "draft" | "reviewed" }> };
      return { applicationId: result.application_id, created: result.created.map((order) => ({ orderId: order.order_id, sourceKey: order.source_key, status: order.status })) };
    },
  };
}
