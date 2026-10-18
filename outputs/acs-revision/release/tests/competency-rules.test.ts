import { describe, expect, it } from "vitest";
import { competencies } from "@/lib/demo-data";

describe("competency evidence rules", () => {
  it("does not mark a practical competency complete while sign-off is pending", () => {
    const medicationSafety = competencies.find((item) => item.id === "cmp_med");
    expect(medicationSafety?.practicalSignoffRequired).toBe(true);
    expect(medicationSafety?.status).toBe("pending_signoff");
    expect(medicationSafety?.progress).toBeLessThan(100);
  });

  it("keeps professional level independent from specialty in the demo model", async () => {
    const { demoUser } = await import("@/lib/demo-data");
    expect(demoUser.role).toBe("Specialist");
    expect(demoUser.specialty).toBe("General Medicine");
  });
});
