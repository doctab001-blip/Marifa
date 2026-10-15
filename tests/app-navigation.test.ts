import { describe, expect, it } from "vitest";
import { getActiveItem } from "@/components/app-navigation";

describe("workspace navigation", () => {
  it("keeps the disease topic navigator active on directory and topic routes", () => {
    expect(getActiveItem("/dashboard/diseases")?.label).toBe("Disease Management");
    expect(getActiveItem("/dashboard/diseases/acne-vulgaris")?.label).toBe("Disease Management");
    expect(getActiveItem("/dashboard/diseases/drafts")?.label).toBe("Disease Management");
  });
});
