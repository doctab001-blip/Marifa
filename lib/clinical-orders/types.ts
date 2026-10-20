import { z } from "zod";

/**
 * Protocol -> patient order integration: shared types.
 *
 * Orders created from a protocol are ALWAYS drafts. Nothing in this module signs, transmits, prescribes,
 * schedules or completes an order. The status `signed` exists only so a future authorised order workflow
 * has somewhere to land; no code path in the protocol integration may set it (a database trigger enforces this).
 */
export const ORDER_TYPES = ["laboratory", "imaging", "investigation", "medication", "procedure", "monitoring"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const ORDER_SECTIONS = ["investigations", "medications", "procedures", "monitoring"] as const;
export type OrderSection = (typeof ORDER_SECTIONS)[number];

export const ORDER_STATUSES = ["draft", "reviewed", "signed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_PRIORITIES = ["routine", "urgent", "stat"] as const;
export type OrderPriority = (typeof ORDER_PRIORITIES)[number];

export const PROTOCOL_SOURCE_MODULES = ["disease_management", "clinical_guidelines"] as const;
export type ProtocolSourceModule = (typeof PROTOCOL_SOURCE_MODULES)[number];

export const SECTION_LABELS: Record<OrderSection, string> = {
  investigations: "Investigations",
  medications: "Medications / Treatments",
  procedures: "Procedures",
  monitoring: "Monitoring / Follow-up",
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Draft – needs review",
  reviewed: "Reviewed – not signed",
  signed: "Signed",
  cancelled: "Removed",
};

export function orderSection(type: OrderType): OrderSection {
  switch (type) {
    case "laboratory":
    case "imaging":
    case "investigation":
      return "investigations";
    case "medication":
      return "medications";
    case "procedure":
      return "procedures";
    case "monitoring":
      return "monitoring";
  }
}

export type OrderRequirement = "required" | "optional" | "conditional";
export type ConditionRule = { kind: "branch" | "use_when" | "alternative" | "inherited"; text: string };
export type SourceReference = { title: string; edition?: string; url?: string };

/** One order a protocol can propose. Built by `deriveOrderItems`; never typed in by the client. */
export type ProposedOrderItem = {
  /** Stable inside one protocol version (for example `inv:ruleIn:0`). Used for provenance and duplicate detection. */
  sourceKey: string;
  orderType: OrderType;
  orderName: string;
  category: string;
  priority: OrderPriority | null;
  indication: string;
  instructions: string;
  /** Structured fields kept exactly as authored (dose, route, frequency, duration, ...). Never calculated. */
  parameters: Record<string, string>;
  /** Plain-language list of what the clinician must still supply. Non-empty means the draft is incomplete. */
  requiredInformation: string[];
  conditionRules: ConditionRule[];
  requirement: OrderRequirement;
  isOptional: boolean;
  displayOrder: number;
  /** Whether the review panel ticks it by default. Conditional and optional items are never preselected. */
  preselect: boolean;
  incomplete: boolean;
  references: SourceReference[];
};

export type ProtocolOrderSet = {
  items: ProposedOrderItem[];
  /** Messages the clinician should see (for example: medicines withheld because the pathway failed validation). */
  warnings: string[];
};

export type ProtocolIdentity = {
  protocolId: string;
  protocolVersionId: string;
  protocolVersion: string;
  title: string;
  specialty: string;
  status: string;
};

const text = (max: number) => z.string().trim().max(max);
export const editableOrderSchema = z.object({
  /** Null for an order the doctor adds by hand during review. */
  sourceKey: z.string().trim().min(1).max(120).nullable(),
  orderType: z.enum(ORDER_TYPES),
  orderName: text(240).min(1, "Every order needs a name"),
  category: text(120).default(""),
  priority: z.enum(ORDER_PRIORITIES).nullable().default(null),
  indication: text(1000).default(""),
  instructions: text(4000).default(""),
  parameters: z.record(z.string().trim().max(60), text(1000)).default({}),
  /** The doctor ticked "I have verified this condition". Conditional items cannot be marked reviewed without it. */
  conditionConfirmed: z.boolean().default(false),
  /** The doctor saw the duplicate warning and chose to add the order anyway. */
  allowDuplicate: z.boolean().default(false),
  /** Requested status. The server may force `draft` (incomplete or unconfirmed conditional items). */
  status: z.enum(["draft", "reviewed"]).default("draft"),
});
export type EditableOrder = z.infer<typeof editableOrderSchema>;

export const applyRequestSchema = z.object({
  protocolId: z.uuid(),
  sourceModule: z.enum(PROTOCOL_SOURCE_MODULES),
  encounterId: z.uuid(),
  orders: z.array(editableOrderSchema).min(1, "Select at least one order").max(200),
});
export type ApplyRequest = z.infer<typeof applyRequestSchema>;

export type ExistingOrder = {
  id: string;
  orderType: OrderType;
  orderName: string;
  status: OrderStatus;
  protocolId: string | null;
  sourceKey: string | null;
};

export type DuplicateMatch = { orderId: string; orderName: string; status: OrderStatus; reason: "same_protocol_item" | "same_order" };

export type EncounterContext = {
  encounterId: string;
  patientId: string;
  organizationId: string;
  status: "active" | "closed";
  patientName: string;
  mrn: string;
  encounterLabel: string;
};

export type OrderActor = { userId: string; organizationId: string; roleCodes: string[] };

export class OrderAuthorizationError extends Error {
  constructor(message = "You are not authorised to create or change clinical orders.") {
    super(message);
    this.name = "OrderAuthorizationError";
  }
}

export class OrderWorkflowError extends Error {
  readonly code: "no_encounter" | "encounter_closed" | "protocol_unavailable" | "invalid_selection" | "duplicates_need_review" | "save_failed" | "unknown_item";
  readonly details?: unknown;
  constructor(code: OrderWorkflowError["code"], message: string, details?: unknown) {
    super(message);
    this.name = "OrderWorkflowError";
    this.code = code;
    this.details = details;
  }
}
