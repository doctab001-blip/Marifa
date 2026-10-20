import { describe, expect, it } from "vitest";
import { OrderAuthorizationError, OrderWorkflowError, type EditableOrder } from "@/lib/clinical-orders/types";
import { applyProtocolOrders, auditor, clinician, encounter, fakeRepository, ids, makeDisease, previewProtocolApplication, regimen, baseDisease } from "./helpers/clinical-orders-fixtures";

const encounters = () => [encounter(ids.encounterA1), encounter(ids.encounterA2), encounter(ids.encounterB, { organizationId: ids.orgB }), encounter(ids.closed, { status: "closed" })];

const order = (overrides: Partial<EditableOrder> & Pick<EditableOrder, "orderName" | "orderType">): EditableOrder => ({
  sourceKey: null, category: "", priority: null, indication: "", instructions: "", parameters: {}, conditionConfirmed: false, allowDuplicate: false, status: "draft", ...overrides,
});

const request = (orders: EditableOrder[], extra: Record<string, unknown> = {}) => ({ protocolId: ids.protocol, sourceModule: "disease_management", encounterId: ids.encounterA1, orders, ...extra });

async function ready(disease = makeDisease([regimen()]), encounterId: string | null = ids.encounterA1, sourceModule: "disease_management" | "clinical_guidelines" = "disease_management") {
  const fake = fakeRepository(disease, encounters());
  const preview = await previewProtocolApplication(fake.repo, clinician, { protocolId: disease.id, sourceModule, encounterId });
  if (preview.state !== "ready") throw new Error("expected ready");
  return { fake, preview, disease };
}

// Mirrors what the review panel sends: every field of the proposed item, unless the doctor changed it.
const fromItem = (item: { sourceKey: string; orderType: EditableOrder["orderType"]; orderName: string; parameters: Record<string, string>; category: string; priority: EditableOrder["priority"]; indication: string; instructions: string }, overrides: Partial<EditableOrder> = {}) =>
  order({ sourceKey: item.sourceKey, orderType: item.orderType, orderName: item.orderName, parameters: item.parameters, category: item.category, priority: item.priority, indication: item.indication, instructions: item.instructions, ...overrides });

describe("Test 1 and 2: both protocol sources use one workflow", () => {
  for (const sourceModule of ["disease_management", "clinical_guidelines"] as const) {
    it(`${sourceModule}: investigations and treatments become draft orders in the right sections, with provenance`, async () => {
      const { fake, preview, disease } = await ready(makeDisease([regimen()]), ids.encounterA1, sourceModule);
      const selected = preview.items.filter((item) => item.preselect);
      expect(selected.some((item) => item.orderType === "medication")).toBe(true);
      expect(selected.some((item) => ["laboratory", "imaging"].includes(item.orderType))).toBe(true);

      const result = await applyProtocolOrders(fake.repo, clinician, request(selected.map((item) => fromItem(item)), { sourceModule }));
      expect(result.draftCount).toBe(selected.length);
      expect(result.reviewedCount).toBe(0);
      expect(fake.stored.every((stored) => stored.row.status === "draft")).toBe(true);
      for (const stored of fake.stored) {
        expect(stored.provenance).toEqual({ protocolId: disease.id, versionId: ids.version, version: disease.version, sourceKey: stored.sourceKey, module: sourceModule });
      }
      expect(fake.stored.map((stored) => stored.orderType)).toContain("medication");
    });
  }
});

describe("Test 3: physician review", () => {
  it("keeps only selected orders and preserves the doctor's edits", async () => {
    const { fake, preview } = await ready();
    const [first, second, third] = preview.items.filter((item) => item.orderType !== "medication" && item.sourceKey.startsWith("inv:"));
    const edited = fromItem(second, { orderName: `${second.orderName} (repeat at 3 h)`, instructions: "Repeat in three hours", priority: "urgent" });
    await applyProtocolOrders(fake.repo, clinician, request([fromItem(first), edited])); // third was removed in review
    expect(fake.stored).toHaveLength(2);
    expect(fake.stored.map((stored) => stored.sourceKey)).not.toContain(third?.sourceKey);
    const kept = fake.stored.find((stored) => stored.sourceKey === second.sourceKey)!;
    expect(kept.row).toMatchObject({ order_name: `${second.orderName} (repeat at 3 h)`, instructions: "Repeat in three hours", priority: "urgent", modified_from_protocol: true });
    expect(fake.stored.find((stored) => stored.sourceKey === first.sourceKey)!.row.modified_from_protocol).toBe(false);
  });

  it("accepts orders the doctor adds by hand and records them without provenance", async () => {
    const { fake } = await ready();
    await applyProtocolOrders(fake.repo, clinician, request([order({ orderType: "laboratory", orderName: "Serum lactate" })]));
    expect(fake.stored[0].provenance).toBeNull();
    expect(fake.stored[0].row.source_key).toBeNull();
  });
});

describe("Test 4: duplicate prevention", () => {
  it("refuses to silently create a second copy and names the matches", async () => {
    const { fake, preview } = await ready();
    const item = preview.items.find((candidate) => candidate.preselect)!;
    await applyProtocolOrders(fake.repo, clinician, request([fromItem(item)]));
    const error = await applyProtocolOrders(fake.repo, clinician, request([fromItem(item)])).catch((caught) => caught);
    expect(error).toBeInstanceOf(OrderWorkflowError);
    expect(error.code).toBe("duplicates_need_review");
    expect(error.details[0].matches[0].reason).toBe("same_protocol_item");
    expect(fake.stored).toHaveLength(1);
  });

  it("shows the duplicate in the next preview and leaves it unticked", async () => {
    const { fake, preview } = await ready();
    const item = preview.items.find((candidate) => candidate.preselect)!;
    await applyProtocolOrders(fake.repo, clinician, request([fromItem(item)]));
    const again = await previewProtocolApplication(fake.repo, clinician, { protocolId: ids.protocol, sourceModule: "disease_management", encounterId: ids.encounterA1 });
    if (again.state !== "ready") throw new Error("expected ready");
    expect(again.items.find((candidate) => candidate.sourceKey === item.sourceKey)!.duplicates).toHaveLength(1);
  });

  it("adds the order only when the doctor explicitly allows the duplicate", async () => {
    const { fake, preview } = await ready();
    const item = preview.items.find((candidate) => candidate.preselect)!;
    await applyProtocolOrders(fake.repo, clinician, request([fromItem(item)]));
    await applyProtocolOrders(fake.repo, clinician, request([fromItem(item, { allowDuplicate: true })]));
    expect(fake.stored).toHaveLength(2);
  });

  it("rejects the same order listed twice in one selection", async () => {
    const { fake } = await ready();
    await expect(applyProtocolOrders(fake.repo, clinician, request([order({ orderType: "laboratory", orderName: "Lactate" }), order({ orderType: "laboratory", orderName: "lactate " })]))).rejects.toMatchObject({ code: "invalid_selection" });
  });
});

describe("Test 5: missing structured content", () => {
  it("reports no configured orders and invents nothing", async () => {
    const empty = baseDisease();
    empty.investigations = { ruleIn: [], ruleOut: [] } as never;
    empty.medicationPlan = undefined;
    empty.nonClinicalManagement = { ...empty.nonClinicalManagement, followUpPlan: "" } as never;
    const { preview } = await ready(empty);
    expect(preview.hasConfiguredOrders).toBe(false);
    expect(preview.items).toEqual([]);
  });
});

describe("Test 6: encounter isolation", () => {
  it("stores each patient's orders separately", async () => {
    const { fake, preview } = await ready();
    const item = preview.items.find((candidate) => candidate.preselect)!;
    await applyProtocolOrders(fake.repo, clinician, request([fromItem(item)], { encounterId: ids.encounterA1 }));
    await applyProtocolOrders(fake.repo, clinician, request([fromItem(item)], { encounterId: ids.encounterA2 }));
    expect(fake.stored).toHaveLength(2);
    expect(new Set(fake.stored.map((stored) => stored.patientId)).size).toBe(2);
  });

  it("cannot reach another organisation's encounter", async () => {
    const { fake, preview } = await ready();
    const item = preview.items.find((candidate) => candidate.preselect)!;
    await expect(applyProtocolOrders(fake.repo, clinician, request([fromItem(item)], { encounterId: ids.encounterB }))).rejects.toMatchObject({ code: "no_encounter" });
    expect(fake.stored).toHaveLength(0);
  });

  it("cannot add orders to a closed encounter", async () => {
    const { fake, preview } = await ready();
    const item = preview.items.find((candidate) => candidate.preselect)!;
    await expect(applyProtocolOrders(fake.repo, clinician, request([fromItem(item)], { encounterId: ids.closed }))).rejects.toMatchObject({ code: "encounter_closed" });
  });

  it("asks the doctor to choose an encounter when none is active", async () => {
    const fake = fakeRepository(baseDisease(), encounters());
    const preview = await previewProtocolApplication(fake.repo, clinician, { protocolId: ids.protocol, sourceModule: "disease_management", encounterId: null });
    expect(preview.state).toBe("needs_encounter");
    if (preview.state === "needs_encounter") expect(preview.encounters.map((candidate) => candidate.encounterId)).toEqual([ids.encounterA1, ids.encounterA2]);
    expect(fake.calls).not.toContain("applyOrders");
  });
});

describe("Test 7: conditional and incomplete items", () => {
  const conditional = () => makeDisease(
    [regimen({ genericName: "Ticagrelor", branch: "STEMI", step: "P2Y12", selection: "one-of", preferred: true }), regimen({ genericName: "Clopidogrel", branch: "STEMI", step: "P2Y12", selection: "one-of", useWhen: "On an oral anticoagulant" })],
    { branches: [{ label: "STEMI", entryCriteria: "ST elevation on ECG" }] },
  );

  it("never preselects conditional treatments", async () => {
    const { preview } = await ready(conditional());
    expect(preview.items.filter((item) => item.orderType === "medication").every((item) => !item.preselect)).toBe(true);
  });

  it("keeps a conditional order as a draft unless the doctor confirms the condition", async () => {
    const { fake, preview } = await ready(conditional());
    const ticagrelor = preview.items.find((item) => item.orderName === "Ticagrelor")!;
    const result = await applyProtocolOrders(fake.repo, clinician, request([fromItem(ticagrelor, { status: "reviewed", conditionConfirmed: false })]));
    expect(result.reviewedCount).toBe(0);
    expect(result.forcedDraft).toEqual(["Ticagrelor"]);
    expect(fake.stored[0].row).toMatchObject({ status: "draft", is_conditional: true, condition_confirmed: false });
  });

  it("allows reviewed once the doctor confirms the condition, but never signed", async () => {
    const { fake, preview } = await ready(conditional());
    const ticagrelor = preview.items.find((item) => item.orderName === "Ticagrelor")!;
    const result = await applyProtocolOrders(fake.repo, clinician, request([fromItem(ticagrelor, { status: "reviewed", conditionConfirmed: true })]));
    expect(result.reviewedCount).toBe(1);
    expect(fake.stored[0].row.status).toBe("reviewed");
  });

  it("keeps an incomplete medication a draft until the clinician supplies the value", async () => {
    const disease = makeDisease([regimen({ dose: "0.01 mg/kg" })]);
    const { fake, preview } = await ready(disease);
    const medication = preview.items.find((item) => item.orderType === "medication")!;
    expect(medication.incomplete).toBe(true);
    const stillIncomplete = await applyProtocolOrders(fake.repo, clinician, request([fromItem(medication, { status: "reviewed" })]));
    expect(stillIncomplete.reviewedCount).toBe(0);
    expect(fake.stored[0].row.incomplete).toBe(true);

    const filled = await applyProtocolOrders(fake.repo, clinician, request([fromItem(medication, { status: "reviewed", allowDuplicate: true, parameters: { ...medication.parameters, dose: "0.7 mg" } })]));
    expect(filled.reviewedCount).toBe(1);
    expect(fake.stored[1].row).toMatchObject({ incomplete: false, status: "reviewed" });
  });
});

describe("Test 8: authorisation", () => {
  it("rejects roles without ordering access before touching storage", async () => {
    const fake = fakeRepository(baseDisease(), encounters());
    await expect(previewProtocolApplication(fake.repo, auditor, { protocolId: ids.protocol, sourceModule: "disease_management", encounterId: ids.encounterA1 })).rejects.toBeInstanceOf(OrderAuthorizationError);
    await expect(applyProtocolOrders(fake.repo, auditor, request([order({ orderType: "laboratory", orderName: "Lactate" })]))).rejects.toBeInstanceOf(OrderAuthorizationError);
    await expect(applyProtocolOrders(fake.repo, null, request([order({ orderType: "laboratory", orderName: "Lactate" })]))).rejects.toBeInstanceOf(OrderAuthorizationError);
    expect(fake.calls).toEqual([]);
  });
});

describe("server-side trust", () => {
  it("rejects items that are not in the protocol version", async () => {
    const { fake } = await ready();
    await expect(applyProtocolOrders(fake.repo, clinician, request([order({ sourceKey: "inv:ruleIn:99", orderType: "laboratory", orderName: "Forged" })]))).rejects.toMatchObject({ code: "unknown_item" });
  });

  it("lets the protocol, not the browser, decide an item's type and conditions", async () => {
    const { fake, preview } = await ready(makeDisease([regimen({ branch: "A", step: "S" })], { branches: [{ label: "A", entryCriteria: "Criteria" }] }));
    const medication = preview.items.find((item) => item.orderType === "medication")!;
    await applyProtocolOrders(fake.repo, clinician, request([fromItem(medication, { orderType: "laboratory", status: "reviewed" })]));
    expect(fake.stored[0].row).toMatchObject({ order_type: "medication", is_conditional: true, status: "draft" });
  });

  it("fails closed when the protocol is not approved or visible", async () => {
    const fake = fakeRepository(null, encounters());
    await expect(applyProtocolOrders(fake.repo, clinician, request([order({ orderType: "laboratory", orderName: "Lactate" })]))).rejects.toMatchObject({ code: "protocol_unavailable" });
  });

  it("turns a storage failure into a clean error with nothing created", async () => {
    const { fake, preview } = await ready();
    const item = preview.items.find((candidate) => candidate.preselect)!;
    fake.repo.applyOrders = async () => { throw new Error("connection reset"); };
    await expect(applyProtocolOrders(fake.repo, clinician, request([fromItem(item)]))).rejects.toMatchObject({ code: "save_failed" });
    expect(fake.stored).toHaveLength(0);
  });
});
