import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopicExplorer } from "@/components/dashboard/topic-explorer";
import { emptyFilters, facet, filterTopics, relativeAge, sortTopics, type ExplorerTopic } from "@/lib/dashboard/topic-explorer";

const topic = (overrides: Partial<ExplorerTopic>): ExplorerTopic => ({
  id: "t", title: "Topic", speciality: "Cardiology", pillar: "Urgent Care", authority: "NICE", version: "v1",
  lastReviewed: "2026-10-01", clinicallyApproved: false, keywords: [], totalViews: 0, views7d: 0, ...overrides,
});

const topics = [
  topic({ id: "a", title: "Acute asthma", speciality: "Respiratory", lastReviewed: "2026-10-12", totalViews: 5, views7d: 5, keywords: ["wheeze"] }),
  topic({ id: "b", title: "Sepsis", speciality: "Infectious Diseases", lastReviewed: "2026-10-17", totalViews: 40, views7d: 1, clinicallyApproved: true }),
  topic({ id: "c", title: "Heart failure", pillar: "Chronic Care", authority: "ESC", lastReviewed: "2026-09-01", totalViews: 12, views7d: 9 }),
];
const ids = (list: ExplorerTopic[]) => list.map(({ id }) => id);

describe("sortTopics", () => {
  it("orders by review date, newest first", () => expect(ids(sortTopics(topics, "recent"))).toEqual(["b", "a", "c"]));
  it("orders by total views", () => expect(ids(sortTopics(topics, "viewed"))).toEqual(["b", "c", "a"]));
  it("orders by views in the last 7 days", () => expect(ids(sortTopics(topics, "trending"))).toEqual(["c", "a", "b"]));
  it("orders alphabetically", () => expect(ids(sortTopics(topics, "title"))).toEqual(["a", "c", "b"]));
  it("does not mutate its input", () => { const copy = [...topics]; sortTopics(topics, "viewed"); expect(topics).toEqual(copy); });
  it("breaks ties by title and treats unreadable dates as oldest", () => {
    const tied = [topic({ id: "z", title: "Zeta", lastReviewed: "not a date" }), topic({ id: "y", title: "Alpha", lastReviewed: "2026-01-01" }), topic({ id: "x", title: "Beta", lastReviewed: "2026-01-01" })];
    expect(ids(sortTopics(tied, "recent"))).toEqual(["y", "x", "z"]);
  });
});

describe("filterTopics", () => {
  it("filters by speciality, pillar, authority and review state", () => {
    expect(ids(filterTopics(topics, { ...emptyFilters, speciality: "Respiratory" }))).toEqual(["a"]);
    expect(ids(filterTopics(topics, { ...emptyFilters, pillar: "Chronic Care" }))).toEqual(["c"]);
    expect(ids(filterTopics(topics, { ...emptyFilters, authority: "NICE" }))).toEqual(["a", "b"]);
    expect(ids(filterTopics(topics, { ...emptyFilters, review: "approved" }))).toEqual(["b"]);
    expect(ids(filterTopics(topics, { ...emptyFilters, review: "pending" }))).toEqual(["a", "c"]);
  });
  it("matches every search word against title, speciality and keywords", () => {
    expect(ids(filterTopics(topics, { ...emptyFilters, query: "wheeze" }))).toEqual(["a"]);
    expect(ids(filterTopics(topics, { ...emptyFilters, query: "heart chronic" }))).toEqual(["c"]);
    expect(filterTopics(topics, { ...emptyFilters, query: "heart asthma" })).toEqual([]);
  });
});

describe("facet and relativeAge", () => {
  it("counts values, most common first", () => expect(facet(topics, "authority")).toEqual([{ value: "NICE", count: 2 }, { value: "ESC", count: 1 }]));
  it("describes age in plain words", () => {
    const now = new Date("2026-10-18T09:00:00Z");
    expect(relativeAge("2026-10-18", now)).toBe("today");
    expect(relativeAge("2026-10-17", now)).toBe("yesterday");
    expect(relativeAge("2026-10-08", now)).toBe("10 days ago");
    expect(relativeAge("2026-07-01", now)).toBe("3 months ago");
    expect(relativeAge("garbage", now)).toBe("garbage");
  });
});

describe("TopicExplorer", () => {
  const rowTitles = () => within(screen.getByRole("list")).getAllByRole("link").map((link) => link.querySelector("strong")?.textContent);

  it("lists real topics most recent first and re-sorts on click", async () => {
    render(<TopicExplorer topics={topics} viewsAvailable initialSort="recent" initialFilters={emptyFilters} initialGrouped={false} />);
    expect(rowTitles()).toEqual(["Sepsis", "Acute asthma", "Heart failure"]);
    await userEvent.click(screen.getByRole("radio", { name: "Most viewed" }));
    expect(rowTitles()).toEqual(["Sepsis", "Heart failure", "Acute asthma"]);
    expect(screen.getByText("40 views")).toBeInTheDocument();
  });

  it("filters, reports the count and clears", async () => {
    render(<TopicExplorer topics={topics} viewsAvailable initialSort="recent" initialFilters={emptyFilters} initialGrouped={false} />);
    await userEvent.selectOptions(screen.getByLabelText("Care pillar"), "Chronic Care");
    expect(rowTitles()).toEqual(["Heart failure"]);
    expect(screen.getByRole("status")).toHaveTextContent("1 of 3 live topics");
    await userEvent.click(screen.getByRole("button", { name: /clear filter/i }));
    expect(rowTitles()).toHaveLength(3);
  });

  it("shows an empty state when nothing matches", async () => {
    render(<TopicExplorer topics={topics} viewsAvailable initialSort="recent" initialFilters={{ ...emptyFilters, query: "zzz" }} />);
    expect(screen.getByText("No topics match these filters")).toBeInTheDocument();
  });

  it("switches the view-based sorts off, instead of faking numbers, when tracking is not available", () => {
    render(<TopicExplorer topics={topics} viewsAvailable={false} initialSort="viewed" initialFilters={emptyFilters} />);
    expect(screen.getByRole("radio", { name: "Most viewed" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Trending (7 days)" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Most recent" })).toBeChecked();
    expect(screen.queryByText(/^[0-9,]+ views?$/)).not.toBeInTheDocument();
  });

  it("pages long lists", async () => {
    const many = Array.from({ length: 30 }, (_, index) => topic({ id: `m${index}`, title: `Topic ${String(index).padStart(2, "0")}` }));
    render(<TopicExplorer topics={many} viewsAvailable initialSort="title" initialFilters={emptyFilters} initialGrouped={false} />);
    expect(rowTitles()).toHaveLength(12);
    await userEvent.click(screen.getByRole("button", { name: /show all 30/i }));
    expect(rowTitles()).toHaveLength(30);
  });

  it("divides the live topics into one collapsible section per speciality, sorted inside each", async () => {
    render(<TopicExplorer topics={topics} viewsAvailable initialSort="recent" initialFilters={emptyFilters} />);
    const groups = screen.getAllByRole("group").filter((node) => node.tagName === "DETAILS");
    expect(groups.map((group) => group.querySelector("summary")?.textContent)).toEqual(["Cardiology1", "Infectious Diseases1", "Respiratory1"]);
    await userEvent.click(screen.getByRole("switch", { name: "Group by speciality" }));
    expect(rowTitles()).toEqual(["Sepsis", "Acute asthma", "Heart failure"]);
  });
});
