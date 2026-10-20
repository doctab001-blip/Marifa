import { describe, expect, it } from "vitest";
import { deriveOrderItems, medicationMissingFields } from "@/lib/clinical-orders/derive-order-items";
import { baseDisease, makeDisease, regimen } from "./helpers/clinical-orders-fixtures";

describe("deriveOrderItems: investigations", () => {
  it("maps each structured test to the right order type and keeps authored fields", () => {
    const disease = baseDisease();
    const { items } = deriveOrderItems(disease);
    const investigations = items.filter((item) => ["laboratory", "imaging", "investigation"].includes(item.orderType));
    expect(investigations).toHaveLength(disease.investigations.ruleIn.length + disease.investigations.ruleOut.length);
    const first = disease.investigations.ruleIn[0];
    const mapped = items.find((item) => item.sourceKey === "inv:ruleIn:0")!;
    expect(mapped.orderName).toBe(first.testName);
    expect(mapped.instructions).toBe(first.clinicalRationale);
    expect(mapped.indication).toContain(first.targetCondition);
    expect(mapped.parameters.expectedFinding).toBe(first.expectedFinding);
  });

  it("never invents a priority or timing", () => {
    expect(deriveOrderItems(baseDisease()).items.every((item) => item.priority === null)).toBe(true);
  });

  it("only ticks standard first-step tests; rule-out and advanced tests are offered but not selected", () => {
    const { items } = deriveOrderItems(baseDisease());
    for (const item of items.filter((candidate) => candidate.sourceKey.startsWith("inv:ruleOut"))) {
      expect(item.preselect).toBe(false);
      expect(item.requirement).toBe("optional");
    }
    for (const item of items.filter((candidate) => candidate.sourceKey.startsWith("inv:ruleIn") && ["laboratory", "imaging"].includes(candidate.orderType))) {
      expect(item.requirement).toBe("required");
    }
  });

  it("produces stable keys: the same content gives the same items", () => {
    expect(deriveOrderItems(baseDisease()).items.map((item) => item.sourceKey)).toEqual(deriveOrderItems(baseDisease()).items.map((item) => item.sourceKey));
  });
});

describe("deriveOrderItems: medications", () => {
  it("keeps dose, route, frequency and duration exactly as authored", () => {
    const { items } = deriveOrderItems(makeDisease([regimen()]));
    const medication = items.find((item) => item.orderType === "medication")!;
    expect(medication.parameters).toMatchObject({ dose: "0.5 mg", route: "Intramuscular", frequency: "Every 5 minutes if needed", duration: "Until stable" });
    expect(medication.incomplete).toBe(false);
    expect(medication.requirement).toBe("required");
    expect(medication.preselect).toBe(true);
  });

  it("creates monitoring orders from the regimen's monitoring list, optional and unselected", () => {
    const { items } = deriveOrderItems(makeDisease([regimen()]));
    const monitoring = items.filter((item) => item.orderType === "monitoring" && item.sourceKey.startsWith("mon:"));
    expect(monitoring).toHaveLength(1);
    expect(monitoring[0]).toMatchObject({ orderName: "Continuous ECG and blood pressure.", preselect: false, requirement: "optional" });
  });

  it("flags a missing or placeholder value as incomplete instead of filling it in", () => {
    for (const dose of ["not stated", "See product label", "Check hospital formulary", "N/A"]) {
      const medication = deriveOrderItems(makeDisease([regimen({ dose })])).items.find((item) => item.orderType === "medication")!;
      expect(medication.incomplete, dose).toBe(true);
      expect(medication.requiredInformation.join(" ")).toContain("dose");
    }
  });

  it("flags a weight-based dose for the clinician and never calculates it", () => {
    const medication = deriveOrderItems(makeDisease([regimen({ dose: "0.01 mg/kg" })])).items.find((item) => item.orderType === "medication")!;
    expect(medication.incomplete).toBe(true);
    expect(medication.parameters.dose).toBe("0.01 mg/kg");
    expect(medication.requiredInformation.join(" ")).toMatch(/calculate/i);
  });

  it("treats branch, use-when and one-of options as conditional and never preselects them", () => {
    const disease = makeDisease(
      [
        regimen({ genericName: "Ticagrelor", branch: "STEMI", step: "P2Y12", selection: "one-of", preferred: true }),
        regimen({ genericName: "Clopidogrel", branch: "STEMI", step: "P2Y12", selection: "one-of", useWhen: "On an oral anticoagulant" }),
      ],
      { branches: [{ label: "STEMI", entryCriteria: "ST elevation on ECG" }] },
    );
    const medications = deriveOrderItems(disease).items.filter((item) => item.orderType === "medication");
    expect(medications).toHaveLength(2);
    for (const medication of medications) {
      expect(medication.requirement).toBe("conditional");
      expect(medication.preselect).toBe(false);
      expect(medication.conditionRules.length).toBeGreaterThan(0);
    }
    expect(medications[0].conditionRules.map((rule) => rule.text).join(" ")).toContain("ST elevation on ECG");
    expect(medications[1].conditionRules.map((rule) => rule.text).join(" ")).toContain("On an oral anticoagulant");
  });

  it("makes monitoring for a conditional medicine conditional too", () => {
    const disease = makeDisease([regimen({ branch: "STEMI", step: "A" })], { branches: [{ label: "STEMI", entryCriteria: "ST elevation" }] });
    const monitoring = deriveOrderItems(disease).items.find((item) => item.sourceKey.startsWith("mon:"))!;
    expect(monitoring.conditionRules[0].kind).toBe("inherited");
    expect(monitoring.preselect).toBe(false);
  });

  it("withholds medicines when the existing pathway validation fails, and says why", () => {
    const disease = makeDisease([regimen({ genericName: "Ticagrelor" }), regimen({ genericName: "Clopidogrel" })]);
    const set = deriveOrderItems(disease);
    expect(set.items.some((item) => item.orderType === "medication")).toBe(false);
    expect(set.warnings.join(" ")).toMatch(/pathway validation/);
  });

  it("proposes no medicines for a plan with no structured regimen", () => {
    const set = deriveOrderItems(makeDisease([], { status: "local-protocol-required" }));
    expect(set.items.some((item) => item.orderType === "medication")).toBe(false);
    expect(set.warnings.join(" ")).toMatch(/no structured medicine regimen/);
  });

  it("proposes no procedure orders: the protocol schema has no structured procedures", () => {
    expect(deriveOrderItems(makeDisease([regimen()])).items.some((item) => item.orderType === "procedure")).toBe(false);
  });
});

describe("medicationMissingFields", () => {
  it("is satisfied by a clinician-calculated dose", () => {
    expect(medicationMissingFields({ dose: "0.7 mg", route: "IM", frequency: "once", duration: "single dose" })).toEqual([]);
  });
  it("re-raises when a value is cleared", () => {
    expect(medicationMissingFields({ dose: "", route: "IM", frequency: "once", duration: "single dose" })).toHaveLength(1);
  });
});
