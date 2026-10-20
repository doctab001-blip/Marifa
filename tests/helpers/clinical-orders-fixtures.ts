import { DiseaseDetailSchema, type DiseaseDetail } from "@/lib/validations/disease";
import source from "@/data/emergency-versions/anaphylaxis.emergency-2026-10-12-v1.json";
import { applyProtocolOrders, previewProtocolApplication, type ApplyOrdersInput, type ApplyOrdersResult, type LoadedProtocol, type OrdersRepository } from "@/lib/clinical-orders/service";
import { findDuplicates } from "@/lib/clinical-orders/policy";
import type { EncounterContext, ExistingOrder, OrderActor, ProtocolSourceModule } from "@/lib/clinical-orders/types";

export const ids = {
  orgA: "aaaaaaaa-0000-4000-8000-000000000001",
  orgB: "bbbbbbbb-0000-4000-8000-000000000002",
  protocol: "a1010000-0000-4000-8000-000000000005",
  version: "22222222-0000-4000-8000-000000000001",
  encounterA1: "dddddddd-0000-4000-8000-000000000001",
  encounterA2: "dddddddd-0000-4000-8000-000000000002",
  encounterB: "dddddddd-0000-4000-8000-000000000003",
  closed: "dddddddd-0000-4000-8000-000000000009",
};

export const clinician: OrderActor = { userId: "00000000-0000-4000-8000-000000000001", organizationId: ids.orgA, roleCodes: ["consultant"] };
export const auditor: OrderActor = { userId: "00000000-0000-4000-8000-000000000002", organizationId: ids.orgA, roleCodes: ["auditor"] };

const base = DiseaseDetailSchema.parse(source);

type Regimen = NonNullable<DiseaseDetail["medicationPlan"]>["regimens"][number];
export const regimen = (overrides: Partial<Regimen> = {}): Regimen => ({
  indication: "Anaphylaxis", patientGroup: "Adults", genericName: "Adrenaline", dose: "0.5 mg", route: "Intramuscular", frequency: "Every 5 minutes if needed", duration: "Until stable",
  adjustments: ["Use the anterolateral thigh."], monitoring: ["Continuous ECG and blood pressure."], sourceTitle: "Resuscitation Council UK", sourceUrl: "https://www.resus.org.uk/", sourceEdition: "2021", ...overrides,
});

/** A valid protocol with a controllable medicine plan; investigations come from the real anaphylaxis record. */
export function makeDisease(regimens: Regimen[] | null, extra: Partial<NonNullable<DiseaseDetail["medicationPlan"]>> = {}): DiseaseDetail {
  return {
    ...base,
    medicationPlan: regimens === null ? undefined : { status: "source-verified", note: "Test plan", regimens, ...extra },
  } as DiseaseDetail;
}

export const baseDisease = () => structuredClone(base) as DiseaseDetail;

export function encounter(id: string, overrides: Partial<EncounterContext> = {}): EncounterContext {
  return { encounterId: id, patientId: `patient-${id}`, organizationId: ids.orgA, status: "active", patientName: `Patient ${id.slice(-1)}`, mrn: `MRN${id.slice(-1)}`, encounterLabel: "Emergency encounter", ...overrides };
}

type StoredOrder = ExistingOrder & { encounterId: string; patientId: string; row: ApplyOrdersInput["orders"][number]; provenance: { protocolId: string; versionId: string; version: string; sourceKey: string; module: ProtocolSourceModule } | null };

/** In-memory repository with the same scoping rules as the Supabase one (organisation checks, active encounters, duplicate guard). */
export function fakeRepository(disease: DiseaseDetail | null, encounters: EncounterContext[]) {
  const stored: StoredOrder[] = [];
  const calls: string[] = [];
  let counter = 0;
  const repo: OrdersRepository = {
    async loadProtocol(protocolId, _module, actor): Promise<LoadedProtocol | null> {
      calls.push("loadProtocol");
      void actor;
      if (!disease || disease.id !== protocolId) return null;
      return { identity: { protocolId, protocolVersionId: ids.version, protocolVersion: disease.version, title: disease.title, specialty: disease.specialty, status: "approved" }, disease };
    },
    async loadEncounter(encounterId, actor) {
      calls.push("loadEncounter");
      return encounters.find((candidate) => candidate.encounterId === encounterId && candidate.organizationId === actor.organizationId) ?? null;
    },
    async listActiveEncounters(actor) {
      calls.push("listActiveEncounters");
      return encounters.filter((candidate) => candidate.organizationId === actor.organizationId && candidate.status === "active");
    },
    async listEncounterOrders(encounterId) {
      calls.push("listEncounterOrders");
      return stored.filter((order) => order.encounterId === encounterId && order.status !== "cancelled");
    },
    async applyOrders(input): Promise<ApplyOrdersResult> {
      calls.push("applyOrders");
      // Mirror the database guard, so a bypass of the service-level check would still be caught.
      const current = stored.filter((order) => order.encounterId === input.encounterId && order.status !== "cancelled");
      for (const order of input.orders) {
        if (!order.allow_duplicate && findDuplicates({ sourceKey: order.source_key, orderType: order.order_type, orderName: order.order_name }, input.protocol.protocolId, current).length > 0) throw new Error("duplicate_orders_require_review");
      }
      const target = encounters.find((candidate) => candidate.encounterId === input.encounterId)!;
      const created = input.orders.map((order) => {
        counter += 1;
        const id = `order-${counter}`;
        stored.push({
          id, orderType: order.order_type, orderName: order.order_name, status: order.status, protocolId: order.source_key ? input.protocol.protocolId : null, sourceKey: order.source_key,
          encounterId: target.encounterId, patientId: target.patientId, row: order,
          provenance: order.source_key ? { protocolId: input.protocol.protocolId, versionId: input.protocol.protocolVersionId, version: input.protocol.protocolVersion, sourceKey: order.source_key, module: input.protocol.sourceModule } : null,
        });
        return { orderId: id, sourceKey: order.source_key, status: order.status };
      });
      return { applicationId: `app-${counter}`, created };
    },
  };
  return { repo, stored, calls };
}

export { applyProtocolOrders, previewProtocolApplication };
