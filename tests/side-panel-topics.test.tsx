import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ prefetch: vi.fn(), push: vi.fn() }),
  usePathname: () => "/dashboard/diseases",
  useSearchParams: () => new URLSearchParams(),
}));

import { DraftTopicNavigator, TopicNavigator } from "@/components/app-navigation";

const live = [
  { id: "1", title: "Sepsis", pillar: "Urgent Care", speciality: "Infectious Diseases" },
  { id: "2", title: "Heart failure", pillar: "Chronic Care", speciality: "Cardiology" },
  { id: "3", title: "Acute coronary syndrome", pillar: "Urgent Care", speciality: "Cardiology" },
  { id: "4", title: "Antenatal care", pillar: "Safe Birth", speciality: "Obstetrics and Gynecology" },
];
const drafts = [
  { id: "d1", title: "Gout", specialty: "Rheumatology / Primary Care", versionId: "v1", version: "1.0" },
  { id: "d2", title: "Lupus", specialty: "Rheumatology", versionId: "v2", version: "1.0" },
  { id: "d3", title: "Croup", specialty: "Paediatrics / Emergency Medicine", versionId: "v3", version: "1.0" },
];

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => ({ ok: true, json: async () => ({ topics: String(url).includes("drafts") ? drafts : live }) })));
});
afterEach(() => vi.unstubAllGlobals());

const groupNames = () => Array.from(document.querySelectorAll(".topic-nav-group > summary > span:first-child")).map((node) => node.textContent);

describe("published topics side panel", () => {
  it("is divided by speciality, A to Z, and can be switched to care pillars", async () => {
    render(<TopicNavigator currentId={null} />);
    await screen.findByRole("group", { name: "Group topics by" });
    expect(groupNames()).toEqual(["Cardiology", "Infectious Diseases", "Obstetrics and Gynecology"]);
    const cardiology = screen.getByText("Cardiology").closest("details") as HTMLElement;
    expect(within(cardiology).getAllByRole("link").map((link) => link.textContent)).toEqual(["Acute coronary syndrome", "Heart failure"]);
    await userEvent.click(screen.getByRole("button", { name: "Care pillar" }));
    expect(groupNames()).toEqual(["Urgent Care", "Chronic Care", "Safe Birth"]);
  });

  it("filters by speciality with counts", async () => {
    render(<TopicNavigator currentId={null} />);
    const select = await screen.findByLabelText("Filter topics by speciality");
    expect(within(select).getAllByRole("option").map((option) => option.textContent)).toEqual(["All specialities", "Cardiology (2)", "Infectious Diseases (1)", "Obstetrics and Gynecology (1)"]);
    await userEvent.selectOptions(select, "Infectious Diseases");
    expect(groupNames()).toEqual(["Infectious Diseases"]);
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(["Sepsis"]);
  });
});

describe("draft topics side panel", () => {
  it("groups drafts by one canonical speciality and filters by it", async () => {
    render(<DraftTopicNavigator />);
    const select = await screen.findByLabelText("Filter drafts by speciality");
    await waitFor(() => expect(groupNames()).toEqual(["Paediatrics", "Rheumatology"]));
    expect(within(select).getAllByRole("option").map((option) => option.textContent)).toEqual(["All specialities", "Rheumatology (2)", "Paediatrics (1)"]);
    await userEvent.selectOptions(select, "Rheumatology");
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(["Gout", "Lupus"]);
  });
});
