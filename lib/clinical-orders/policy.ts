import { medicationMissingFields } from "@/lib/clinical-orders/derive-order-items";
import {
  OrderAuthorizationError,
  OrderWorkflowError,
  type ApplyRequest,
  type DuplicateMatch,
  type EditableOrder,
  type ExistingOrder,
  type OrderActor,
  type ProposedOrderItem,
} from "@/lib/clinical-orders/types";

/** Roles allowed to create or change patient orders. Auditors, editors and reviewers read content but never touch orders. */
export const ORDER_ROLE_CODES = ["consultant", "specialist", "mbbs_gp", "org_admin", "hospital_admin", "platform_admin"] as const;

export function canManageOrders(actor: OrderActor | null | undefined): actor is OrderActor {
  if (!actor?.userId || !actor.organizationId) return false;
  // Assigned roles only. The membership's professional_level is user-editable, so it must never grant order access.
  return actor.roleCodes.some((code) => (ORDER_ROLE_CODES as readonly string[]).includes(code));
}

export function assertCanManageOrders(actor: OrderActor | null | undefined): asserts actor is OrderActor {
  if (!canManageOrders(actor)) throw new OrderAuthorizationError();
}

/** Same normalisation as the database function `public.normalize_order_name`. Keep the two identical. */
export const normalizeOrderName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "");

type DuplicateCandidate = { sourceKey: string | null; orderType: string; orderName: string };

/** Existing active orders that look like the same order. Cancelled orders never count. */
export function findDuplicates(candidate: DuplicateCandidate, protocolId: string, existing: ExistingOrder[]): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const name = normalizeOrderName(candidate.orderName);
  for (const order of existing) {
    if (order.status === "cancelled") continue;
    if (candidate.sourceKey && order.protocolId === protocolId && order.sourceKey === candidate.sourceKey) {
      matches.push({ orderId: order.id, orderName: order.orderName, status: order.status, reason: "same_protocol_item" });
    } else if (order.orderType === candidate.orderType && normalizeOrderName(order.orderName) === name) {
      matches.push({ orderId: order.id, orderName: order.orderName, status: order.status, reason: "same_order" });
    }
  }
  return matches;
}

/** An order as the database function receives it. */
export type PreparedOrder = {
  source_key: string | null;
  order_type: EditableOrder["orderType"];
  order_name: string;
  category: string;
  priority: EditableOrder["priority"];
  indication: string;
  instructions: string;
  details: Record<string, string>;
  status: "draft" | "reviewed";
  incomplete: boolean;
  missing_fields: string[];
  is_conditional: boolean;
  condition_text: string;
  condition_confirmed: boolean;
  allow_duplicate: boolean;
  modified_from_protocol: boolean;
};

const clean = (record: Record<string, string>) => Object.fromEntries(Object.entries(record).map(([key, value]) => [key, value.trim()]).filter(([, value]) => value !== ""));
const sameRecord = (a: Record<string, string>, b: Record<string, string>) => JSON.stringify(Object.entries(clean(a)).sort()) === JSON.stringify(Object.entries(clean(b)).sort());

export type PreparedSelection = { orders: PreparedOrder[]; forcedDraft: string[] };

/**
 * Merges what the doctor submitted with the protocol's own definition of each item.
 *  - Protocol items are looked up by key on the server; the client cannot invent or alter requirement, conditions or provenance.
 *  - The doctor's edits to name, priority, indication, instructions and details are kept (manual changes are preserved).
 *  - `reviewed` is granted only to complete orders whose condition (if any) the doctor confirmed. Everything else stays `draft`.
 */
export function prepareSelection(request: ApplyRequest, itemsByKey: Map<string, ProposedOrderItem>, existing: ExistingOrder[], protocolId: string): PreparedSelection {
  const seen = new Set<string>();
  const unresolved: Array<{ sourceKey: string | null; orderName: string; matches: DuplicateMatch[] }> = [];
  const orders: PreparedOrder[] = [];
  const forcedDraft: string[] = [];

  for (const submitted of request.orders) {
    const item = submitted.sourceKey ? itemsByKey.get(submitted.sourceKey) : undefined;
    if (submitted.sourceKey && !item) throw new OrderWorkflowError("unknown_item", `“${submitted.orderName}” is not part of this protocol version. Reload the protocol and try again.`, submitted.sourceKey);

    const orderType = item ? item.orderType : submitted.orderType; // protocol items keep their type
    const details = clean({ ...(item?.parameters ?? {}), ...submitted.parameters });
    const name = submitted.orderName.trim();
    const dedupeKey = `${orderType}:${normalizeOrderName(name)}`;
    if (seen.has(dedupeKey)) throw new OrderWorkflowError("invalid_selection", `“${name}” appears more than once in this selection. Remove the repeat before saving.`);
    seen.add(dedupeKey);

    let missing = item ? item.requiredInformation : [];
    if (orderType === "medication") missing = medicationMissingFields(details);
    const incomplete = missing.length > 0;
    const conditionText = item?.conditionRules.map((rule) => rule.text).join("\n") ?? "";
    const conditional = Boolean(item && item.conditionRules.length > 0);

    let status: "draft" | "reviewed" = submitted.status;
    if (status === "reviewed" && (incomplete || (conditional && !submitted.conditionConfirmed))) {
      status = "draft";
      forcedDraft.push(name);
    }

    const matches = findDuplicates({ sourceKey: submitted.sourceKey, orderType, orderName: name }, protocolId, existing);
    if (matches.length > 0 && !submitted.allowDuplicate) unresolved.push({ sourceKey: submitted.sourceKey, orderName: name, matches });

    orders.push({
      source_key: submitted.sourceKey,
      order_type: orderType,
      order_name: name,
      category: submitted.category.trim() || item?.category || "",
      priority: submitted.priority,
      indication: submitted.indication.trim(),
      instructions: submitted.instructions.trim(),
      details,
      status,
      incomplete,
      missing_fields: missing,
      is_conditional: conditional,
      condition_text: conditionText,
      condition_confirmed: conditional && submitted.conditionConfirmed,
      allow_duplicate: submitted.allowDuplicate,
      modified_from_protocol: item
        ? name !== item.orderName || submitted.priority !== item.priority || submitted.indication.trim() !== item.indication.trim() || submitted.instructions.trim() !== item.instructions.trim() || !sameRecord(details, item.parameters)
        : false,
    });
  }

  if (unresolved.length > 0) {
    throw new OrderWorkflowError("duplicates_need_review", "Some orders may duplicate orders already on this encounter. Review them and choose whether to add each one.", unresolved);
  }
  return { orders, forcedDraft };
}
