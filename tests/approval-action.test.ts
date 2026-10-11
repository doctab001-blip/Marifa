import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(), receipt: vi.fn(), context: vi.fn(), redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`); }),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/admin/data", () => ({ requireOrganizationAdmin: mocks.context }));
vi.mock("@/lib/access-mode", () => ({ isTemporaryOpenAdminMode: () => false }));
vi.mock("@/lib/supabase/data-client", () => ({ createSupabaseDataClient: async () => ({
  rpc: mocks.rpc,
  from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: mocks.receipt }) }) }) }),
}) }));
import { approveGuidelineVersion } from "@/app/(workspace)/dashboard/admin/guidelines/actions";

function approvalForm() {
  const form = new FormData();
  form.set("id", "11111111-1111-4111-8111-111111111111");
  form.set("versionId", "22222222-2222-4222-8222-222222222222");
  form.set("destination", "drafts");
  return form;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.context.mockResolvedValue({ roleCode: "platform_admin" });
  mocks.rpc.mockResolvedValue({ error: { code: "22023" } });
});
describe("Repeated approval submissions", () => {
  it("recognises a current recorded approval without another write", async () => {
    mocks.receipt.mockResolvedValue({ data: { status: "approved", is_current: true, approved_by: "reviewer", approved_at: "2026-10-11T16:41:48Z" } });
    await expect(approveGuidelineVersion(approvalForm())).rejects.toThrow("REDIRECT:/dashboard/diseases/drafts?approved=1");
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });
  it("does not report success for an unapproved or historical receipt", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.receipt.mockResolvedValue({ data: { status: "approved", is_current: false, approved_by: "reviewer", approved_at: "2026-10-11T16:41:48Z" } });
    await expect(approveGuidelineVersion(approvalForm())).rejects.toThrow("REDIRECT:/dashboard/diseases/drafts?error=approval_stale");
    consoleError.mockRestore();
  });
  it("checks the administrator role before trying approval", async () => {
    mocks.context.mockResolvedValue({ roleCode: "clinician" });
    await expect(approveGuidelineVersion(approvalForm())).rejects.toThrow("not_authorized");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
