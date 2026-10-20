import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({ preview: vi.fn(), apply: vi.fn(), select: vi.fn() }));
vi.mock("@/app/(workspace)/dashboard/patients/actions", () => ({
  previewProtocolOrdersAction: actions.preview,
  applyProtocolOrdersAction: actions.apply,
  selectActiveEncounterAction: actions.select,
}));

import { ApplyProtocolPanel } from "@/components/clinical-orders/apply-protocol-panel";
import type { PreviewResult, ProposedOrderView } from "@/lib/clinical-orders/service";

const protocolId = "a1010000-0000-4000-8000-000000000005";
const encounter = { encounterId: "dddddddd-0000-4000-8000-000000000001", patientId: "p1", organizationId: "o1", status: "active" as const, patientName: "Fictional Patient", mrn: "MRN1", encounterLabel: "Emergency encounter" };

const item = (overrides: Partial<ProposedOrderView>): ProposedOrderView => ({
  sourceKey: "inv:ruleIn:0", orderType: "laboratory", orderName: "Troponin", category: "Laboratory", priority: null, indication: "To confirm: MI", instructions: "Serial testing", parameters: {},
  requiredInformation: [], conditionRules: [], requirement: "required", isOptional: false, displayOrder: 0, preselect: true, incomplete: false, references: [], duplicates: [], ...overrides,
});

const ready = (items: ProposedOrderView[], extra: Partial<Extract<PreviewResult, { state: "ready" }>> = {}): { ok: true; data: PreviewResult } => ({
  ok: true,
  data: { state: "ready", protocol: { protocolId, protocolVersionId: "v1", protocolVersion: "2.0", title: "Anaphylaxis", specialty: "Emergency Medicine", status: "approved", sourceModule: "disease_management" }, encounter, items, warnings: [], hasConfiguredOrders: items.length > 0, ...extra },
});

const open = async () => {
  const user = userEvent.setup();
  render(<ApplyProtocolPanel protocolId={protocolId} protocolTitle="Anaphylaxis" sourceModule="disease_management" />);
  await user.click(screen.getByRole("button", { name: /apply protocol to patient/i }));
  return user;
};

beforeEach(() => { actions.preview.mockReset(); actions.apply.mockReset(); actions.select.mockReset(); });

describe("ApplyProtocolPanel", () => {
  it("asks for a patient encounter first and then loads the orders", async () => {
    actions.preview.mockResolvedValueOnce({ ok: true, data: { state: "needs_encounter", encounters: [encounter] } }).mockResolvedValueOnce(ready([item({})]));
    actions.select.mockResolvedValue({ ok: true, data: { encounterId: encounter.encounterId } });
    const user = await open();
    expect(actions.preview).toHaveBeenCalledWith({ protocolId, sourceModule: "disease_management" });
    await user.click(await screen.findByRole("button", { name: /fictional patient/i }));
    expect(actions.select).toHaveBeenCalledWith(encounter.encounterId);
    expect(await screen.findByText("Troponin")).toBeInTheDocument();
  });

  it("shows protocol, version, specialty, module, patient and encounter, and the draft-only warning", async () => {
    actions.preview.mockResolvedValue(ready([item({})]));
    await open();
    await screen.findByText("Troponin");
    for (const text of ["Anaphylaxis", "2.0", "Emergency Medicine", "Disease Management", /Fictional Patient/, "Emergency encounter"]) expect(screen.getAllByText(text).length).toBeGreaterThan(0);
    expect(screen.getByText(/Nothing is signed, prescribed, sent or scheduled/)).toBeInTheDocument();
  });

  it("saves only the selected, non-removed orders, with edits, as drafts", async () => {
    actions.preview.mockResolvedValue(ready([item({}), item({ sourceKey: "inv:ruleIn:1", orderName: "Chest X-ray", orderType: "imaging" }), item({ sourceKey: "inv:ruleOut:0", orderName: "D-dimer", preselect: false, requirement: "optional" })]));
    actions.apply.mockResolvedValue({ ok: true, data: { draftCount: 1, reviewedCount: 0, total: 1, forcedDraft: [], patientPath: "/dashboard/patients/p1", applicationId: "a" } });
    const user = await open();
    await screen.findByText("Troponin");
    await user.click(screen.getByRole("button", { name: "Remove Chest X-ray" }));
    const troponin = screen.getByRole("article", { name: "Troponin" });
    await user.click(within(troponin).getByRole("button", { name: "Edit" }));
    const name = within(troponin).getByLabelText("Order name");
    await user.clear(name);
    await user.type(name, "Troponin (hs)");
    await user.click(screen.getByRole("button", { name: /save as draft orders/i }));
    await waitFor(() => expect(actions.apply).toHaveBeenCalled());
    const payload = actions.apply.mock.calls[0][0];
    expect(payload.encounterId).toBe(encounter.encounterId);
    expect(payload.orders).toHaveLength(1);
    expect(payload.orders[0]).toMatchObject({ sourceKey: "inv:ruleIn:0", orderName: "Troponin (hs)", status: "draft" });
    expect(await screen.findByText(/1 draft order created/)).toBeInTheDocument();
    expect(screen.getByText(/not authorised orders/)).toBeInTheDocument();
  });

  it("does not tick conditional items and requires confirmation text to be visible", async () => {
    actions.preview.mockResolvedValue(ready([item({ sourceKey: "med:0", orderType: "medication", orderName: "Ticagrelor", requirement: "conditional", preselect: false, conditionRules: [{ kind: "branch", text: "Pathway “STEMI”: ST elevation" }], parameters: { dose: "180 mg", route: "Oral", frequency: "Once", duration: "Loading" } })]));
    const user = await open();
    await screen.findByText("Ticagrelor");
    await user.click(screen.getByRole("tab", { name: /medications/i }));
    const card = screen.getByRole("article", { name: "Ticagrelor" });
    expect(within(card).getByLabelText("Select Ticagrelor")).not.toBeChecked();
    expect(within(card).getByText(/Conditional – confirm/)).toBeInTheDocument();
    expect(within(card).getByText(/ST elevation/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save as draft orders/i })).toBeDisabled();
  });

  it("blocks saving a possible duplicate until the doctor allows it", async () => {
    actions.preview.mockResolvedValue(ready([item({ duplicates: [{ orderId: "o1", orderName: "Troponin", status: "draft", reason: "same_protocol_item" }] })]));
    actions.apply.mockResolvedValue({ ok: true, data: { draftCount: 1, reviewedCount: 0, total: 1, forcedDraft: [], patientPath: "/x", applicationId: "a" } });
    const user = await open();
    await screen.findByText("Troponin");
    expect(screen.getByText(/Possible duplicate on this encounter/)).toBeInTheDocument();
    expect(screen.getByLabelText("Select Troponin")).not.toBeChecked();
    await user.click(screen.getByLabelText(/Add it anyway/));
    expect(screen.getByLabelText("Select Troponin")).toBeChecked();
    await user.click(screen.getByRole("button", { name: /save as draft orders/i }));
    await waitFor(() => expect(actions.apply.mock.calls[0][0].orders[0].allowDuplicate).toBe(true));
  });

  it("says 'No configured orders available' instead of inventing recommendations", async () => {
    actions.preview.mockResolvedValue(ready([]));
    await open();
    expect(await screen.findByText(/No configured orders available/)).toBeInTheDocument();
    expect(screen.getByText(/No configured investigations/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save as draft orders/i })).toBeDisabled();
  });

  it("shows a server refusal and keeps the review so nothing is lost", async () => {
    actions.preview.mockResolvedValue(ready([item({})]));
    actions.apply.mockResolvedValue({ ok: false, code: "not_authorised", message: "You are not authorised to create or change clinical orders." });
    const user = await open();
    await screen.findByText("Troponin");
    await user.click(screen.getByRole("button", { name: /save as draft orders/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/not authorised/);
    expect(screen.getByText("Troponin")).toBeInTheDocument();
  });

  it("lets the doctor add an order by hand and removes then restores one", async () => {
    actions.preview.mockResolvedValue(ready([item({})]));
    const user = await open();
    await screen.findByText("Troponin");
    await user.click(screen.getByText(/Add an order manually/));
    await user.type(screen.getByLabelText("Order name"), "Serum lactate");
    await user.click(screen.getByRole("button", { name: "Add to review" }));
    expect(await screen.findByText("Serum lactate")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove Troponin" }));
    await user.click(screen.getByRole("button", { name: "Restore" }));
    expect(screen.getByRole("article", { name: "Troponin" })).toBeInTheDocument();
  });
});
