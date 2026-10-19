import { describe, expect, it } from "vitest";
import { getActiveItem } from "@/components/app-navigation";

describe("workspace navigation", () => {
  it("keeps the disease topic navigator active on directory and topic routes", () => {
    expect(getActiveItem("/dashboard/diseases")?.label).toBe("Disease Management");
    expect(getActiveItem("/dashboard/diseases/acne-vulgaris")?.label).toBe("Disease Management");
    expect(getActiveItem("/dashboard/diseases/drafts")?.label).toBe("Disease Management");
  });
});

import { modulePanelLinks, navigation } from "@/components/app-navigation";

describe("module side panels", () => {
  const byLabel = (label: string) => navigation.find((item) => item.label === label)!;

  it("never repeats other top-level modules inside a module panel", () => {
    const moduleHrefs = navigation.map(({ href }) => href);
    for (const module of navigation) {
      for (const link of modulePanelLinks(module)) {
        const path = link.href.split("?")[0];
        expect(moduleHrefs.filter((href) => href !== module.href && href !== "/dashboard").includes(path)).toBe(false);
      }
    }
  });

  it("gives each module its own pages", () => {
    expect(modulePanelLinks(byLabel("Disease Management")).map(({ label }) => label)).toEqual(["Disease directory", "Approved", "Drafts", "Published"]);
    expect(modulePanelLinks(byLabel("Local Protocols & SOPs")).map(({ label }) => label)).toEqual(["Drafts", "Published"]);
    expect(modulePanelLinks(byLabel("Recent Developments")).map(({ label }) => label)).toEqual(["Latest", "Archive"]);
    expect(modulePanelLinks(byLabel("Medical Calculators"))).toEqual([]);
    expect(modulePanelLinks(byLabel("Staff Directory")).map(({ label }) => label)).toEqual(["Overview"]);
  });

  it("tells Latest and Archive apart by the tab parameter", () => {
    const [latest, archive] = modulePanelLinks(byLabel("Recent Developments"));
    const path = "/dashboard/recent-developments";
    expect(latest.isActive?.(path, new URLSearchParams())).toBe(true);
    expect(archive.isActive?.(path, new URLSearchParams())).toBe(false);
    expect(latest.isActive?.(path, new URLSearchParams("tab=archive"))).toBe(false);
    expect(archive.isActive?.(path, new URLSearchParams("tab=archive"))).toBe(true);
  });
});
