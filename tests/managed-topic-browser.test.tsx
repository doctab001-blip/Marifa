import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ManagedTopicBrowser, type ManagedBrowserItem } from "@/components/diseases/ManagedTopicBrowser";
import { filterManaged, primarySpeciality, sortManaged, specialityOptions } from "@/lib/dashboard/managed-topics";

const item = (key: string, title: string, specialty: string, changedAt: string): ManagedBrowserItem => ({ key, title, specialty, changedAt, tile: <article>{title}</article> });
const items = [
  item("a", "Cellulitis", "Infectious Diseases", "2026-10-10T08:00:00Z"),
  item("b", "Anti-D prophylaxis", "Obstetrics", "2026-10-18T06:00:00Z"),
  item("c", "Gout", "Rheumatology", "2026-10-14T12:00:00Z"),
];
const titles = () => screen.getAllByRole("article").map((node) => node.textContent);

describe("managed topic sort and filter", () => {
  it("sorts by status date and title", () => {
    expect(sortManaged(items, "newest").map((i) => i.key)).toEqual(["b", "c", "a"]);
    expect(sortManaged(items, "oldest").map((i) => i.key)).toEqual(["a", "c", "b"]);
    expect(sortManaged(items, "title").map((i) => i.key)).toEqual(["b", "a", "c"]);
    expect(sortManaged(items, "title-desc").map((i) => i.key)).toEqual(["c", "a", "b"]);
  });
  it("filters by speciality and words, and lists specialities with counts", () => {
    expect(filterManaged(items, "", primarySpeciality("Obstetrics")).map((i) => i.key)).toEqual(["b"]);
    expect(filterManaged(items, "gout", "").map((i) => i.key)).toEqual(["c"]);
    expect(specialityOptions(items).map((o) => o.count)).toEqual([1, 1, 1]);
  });
  it("puts the most recently published topic first by default and re-sorts on change", async () => {
    render(<ManagedTopicBrowser items={items} noun="published" dateNoun="Published" />);
    expect(titles()).toEqual(["Anti-D prophylaxis", "Gout", "Cellulitis"]);
    await userEvent.selectOptions(screen.getByLabelText("Sort by"), "oldest");
    expect(titles()).toEqual(["Cellulitis", "Gout", "Anti-D prophylaxis"]);
  });
  it("filters, counts and clears", async () => {
    render(<ManagedTopicBrowser items={items} noun="published" dateNoun="Published" />);
    await userEvent.selectOptions(screen.getByLabelText("Speciality"), primarySpeciality("Rheumatology"));
    expect(titles()).toEqual(["Gout"]);
    expect(screen.getByRole("status")).toHaveTextContent("1 of 3 published topics");
    await userEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(within(document.body).getAllByRole("article")).toHaveLength(3);
  });
});
