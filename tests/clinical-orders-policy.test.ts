import { describe, expect, it } from "vitest";
import { assertCanManageOrders, canManageOrders, findDuplicates, normalizeOrderName } from "@/lib/clinical-orders/policy";
import { navigation, getActiveItem } from "@/components/app-navigation";
import { applyRequestSchema, OrderAuthorizationError } from "@/lib/clinical-orders/types";
import { clinician, ids } from "./helpers/clinical-orders-fixtures";

describe("order authorisation", () => {
  it("allows clinical and administrator roles", () => {
    for (const role of ["consultant", "specialist", "mbbs_gp", "org_admin", "hospital_admin", "platform_admin"]) {
      expect(canManageOrders({ ...clinician, roleCodes: [role] }), role).toBe(true);
    }
  });
  it("refuses read-only and content roles, no roles, and missing actors", () => {
    for (const role of ["auditor", "guideline_editor", "guideline_reviewer", "competency_admin", "assessor"]) {
      expect(canManageOrders({ ...clinician, roleCodes: [role] }), role).toBe(false);
    }
    expect(canManageOrders({ ...clinician, roleCodes: [] })).toBe(false);
    expect(canManageOrders(null)).toBe(false);
    expect(() => assertCanManageOrders(undefined)).toThrow(OrderAuthorizationError);
  });
});

describe("duplicate detection", () => {
  const existing = [
    { id: "1", orderType: "laboratory" as const, orderName: "Troponin (high-sensitivity)", status: "draft" as const, protocolId: ids.protocol, sourceKey: "inv:ruleIn:0" },
    { id: "2", orderType: "laboratory" as const, orderName: "Lactate", status: "cancelled" as const, protocolId: null, sourceKey: null },
  ];
  it("matches the same protocol item, or the same order by normalised name", () => {
    expect(findDuplicates({ sourceKey: "inv:ruleIn:0", orderType: "laboratory", orderName: "Anything" }, ids.protocol, existing)[0].reason).toBe("same_protocol_item");
    expect(findDuplicates({ sourceKey: null, orderType: "laboratory", orderName: "troponin  (HIGH-sensitivity)" }, ids.protocol, existing)[0].reason).toBe("same_order");
  });
  it("ignores removed orders and different order types", () => {
    expect(findDuplicates({ sourceKey: null, orderType: "laboratory", orderName: "Lactate" }, ids.protocol, existing)).toEqual([]);
    expect(findDuplicates({ sourceKey: null, orderType: "imaging", orderName: "Troponin (high-sensitivity)" }, ids.protocol, existing)).toEqual([]);
  });
  it("normalises names exactly as the database function does", () => {
    expect(normalizeOrderName("  Troponin (high-sensitivity)! ")).toBe("troponinhighsensitivity");
  });
});

describe("request validation", () => {
  const base = { protocolId: ids.protocol, sourceModule: "disease_management", encounterId: ids.encounterA1 };
  it("can never request a signed order", () => {
    const result = applyRequestSchema.safeParse({ ...base, orders: [{ sourceKey: null, orderType: "laboratory", orderName: "x", status: "signed" }] });
    expect(result.success).toBe(false);
  });
  it("requires at least one order", () => {
    expect(applyRequestSchema.safeParse({ ...base, orders: [] }).success).toBe(false);
  });
});

describe("navigation", () => {
  it("lists Patient Orders as a workspace module", () => {
    expect(navigation.map((item) => item.label)).toContain("Patient Orders");
    expect(getActiveItem("/dashboard/patients/abc")?.label).toBe("Patient Orders");
  });
});
