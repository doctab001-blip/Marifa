import { deriveOrderItems } from "@/lib/clinical-orders/derive-order-items";
import { assertCanManageOrders, findDuplicates, prepareSelection, type PreparedOrder } from "@/lib/clinical-orders/policy";
import {
  applyRequestSchema,
  OrderWorkflowError,
  type DuplicateMatch,
  type EncounterContext,
  type ExistingOrder,
  type OrderActor,
  type ProposedOrderItem,
  type ProtocolIdentity,
  type ProtocolSourceModule,
} from "@/lib/clinical-orders/types";
import type { DiseaseDetail } from "@/lib/validations/disease";

/** Everything the integration needs from storage. The Supabase implementation lives in repository.ts; tests use a fake. */
export type LoadedProtocol = { identity: ProtocolIdentity; disease: DiseaseDetail };

export type ApplyOrdersInput = {
  actor: OrderActor;
  encounterId: string;
  protocol: ProtocolIdentity & { sourceModule: ProtocolSourceModule };
  /** The full set of orders the protocol version can propose (snapshot stored for provenance). */
  setItems: ProposedOrderItem[];
  orders: PreparedOrder[];
};
export type ApplyOrdersResult = { applicationId: string; created: Array<{ orderId: string; sourceKey: string | null; status: "draft" | "reviewed" }> };

export interface OrdersRepository {
  /** Must return null unless the protocol is approved/published AND visible to the actor's organisation. */
  loadProtocol(protocolId: string, sourceModule: ProtocolSourceModule, actor: OrderActor): Promise<LoadedProtocol | null>;
  /** Must return null unless the encounter belongs to the actor's organisation. */
  loadEncounter(encounterId: string, actor: OrderActor): Promise<EncounterContext | null>;
  listActiveEncounters(actor: OrderActor): Promise<EncounterContext[]>;
  listEncounterOrders(encounterId: string, actor: OrderActor): Promise<ExistingOrder[]>;
  /** One database transaction: order-set snapshot, orders, provenance and audit rows all commit or none do. */
  applyOrders(input: ApplyOrdersInput): Promise<ApplyOrdersResult>;
}

export type ProposedOrderView = ProposedOrderItem & { duplicates: DuplicateMatch[] };

export type PreviewResult =
  | { state: "needs_encounter"; encounters: EncounterContext[] }
  | {
      state: "ready";
      protocol: ProtocolIdentity & { sourceModule: ProtocolSourceModule };
      encounter: EncounterContext;
      items: ProposedOrderView[];
      warnings: string[];
      hasConfiguredOrders: boolean;
    };

async function requireProtocol(repo: OrdersRepository, actor: OrderActor, protocolId: string, sourceModule: ProtocolSourceModule) {
  const protocol = await repo.loadProtocol(protocolId, sourceModule, actor);
  if (!protocol) throw new OrderWorkflowError("protocol_unavailable", "This protocol is not available for ordering (it must be approved or published and visible to your organisation).");
  return protocol;
}

async function requireActiveEncounter(repo: OrdersRepository, actor: OrderActor, encounterId: string) {
  const encounter = await repo.loadEncounter(encounterId, actor);
  if (!encounter) throw new OrderWorkflowError("no_encounter", "That patient encounter could not be found.");
  if (encounter.status !== "active") throw new OrderWorkflowError("encounter_closed", "That encounter is closed. Orders can only be added to an active encounter.");
  return encounter;
}

/** Step A + B: what would be applied. Writes nothing. */
export async function previewProtocolApplication(
  repo: OrdersRepository,
  actor: OrderActor | null,
  input: { protocolId: string; sourceModule: ProtocolSourceModule; encounterId: string | null },
): Promise<PreviewResult> {
  assertCanManageOrders(actor);
  if (!input.encounterId) return { state: "needs_encounter", encounters: await repo.listActiveEncounters(actor) };

  const [protocol, encounter] = await Promise.all([requireProtocol(repo, actor, input.protocolId, input.sourceModule), requireActiveEncounter(repo, actor, input.encounterId)]);
  const set = deriveOrderItems(protocol.disease);
  const existing = await repo.listEncounterOrders(encounter.encounterId, actor);
  const items = set.items.map((item) => ({ ...item, duplicates: findDuplicates({ sourceKey: item.sourceKey, orderType: item.orderType, orderName: item.orderName }, protocol.identity.protocolId, existing) }));
  return {
    state: "ready",
    protocol: { ...protocol.identity, sourceModule: input.sourceModule },
    encounter,
    items,
    warnings: set.warnings,
    hasConfiguredOrders: set.items.length > 0,
  };
}

export type ApplyResult = { applicationId: string; draftCount: number; reviewedCount: number; total: number; forcedDraft: string[]; encounter: EncounterContext };

/** Step C + D: persist the doctor's selection as draft (or reviewed, never signed) orders in one transaction. */
export async function applyProtocolOrders(repo: OrdersRepository, actor: OrderActor | null, rawRequest: unknown): Promise<ApplyResult> {
  assertCanManageOrders(actor);
  const parsed = applyRequestSchema.safeParse(rawRequest);
  if (!parsed.success) throw new OrderWorkflowError("invalid_selection", parsed.error.issues[0]?.message ?? "The selected orders are not valid.");
  const request = parsed.data;

  const [protocol, encounter] = await Promise.all([requireProtocol(repo, actor, request.protocolId, request.sourceModule), requireActiveEncounter(repo, actor, request.encounterId)]);
  const set = deriveOrderItems(protocol.disease);
  const existing = await repo.listEncounterOrders(encounter.encounterId, actor);
  const { orders, forcedDraft } = prepareSelection(request, new Map(set.items.map((item) => [item.sourceKey, item])), existing, protocol.identity.protocolId);

  let result: ApplyOrdersResult;
  try {
    result = await repo.applyOrders({
      actor,
      encounterId: encounter.encounterId,
      protocol: { ...protocol.identity, sourceModule: request.sourceModule },
      setItems: set.items,
      orders,
    });
  } catch (error) {
    if (error instanceof OrderWorkflowError) throw error;
    throw new OrderWorkflowError("save_failed", "The orders could not be saved. Nothing was created. Try again.", error);
  }
  const reviewedCount = result.created.filter((order) => order.status === "reviewed").length;
  return { applicationId: result.applicationId, draftCount: result.created.length - reviewedCount, reviewedCount, total: result.created.length, forcedDraft, encounter };
}
