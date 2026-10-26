import { describe, expect, it } from "vitest";
import { isRoleOnlyInterpretation } from "@/lib/clinical-authoring-audit";

describe("role-only investigation interpretation", () => {
  it.each(["Essential test (ICMR STW).", "At PHC level.", "All patients.", "Baseline before surgery.", "Intermittent symptoms.", "Optional."])(
    "flags %s", (text) => expect(isRoleOnlyInterpretation(text)).toBe(true));

  it.each([
    "Potassium above 6 mEq/L: give calcium gluconate and treat before pacing.",
    "Raised TSH: treat hypothyroidism, then reassess the heart rate.",
    "Stop artesunate if both negative (ICMR STW).",
    "Essential test; suggests liver disease.",
    "Treat reversible causes (RCUK ALS).",
  ])("accepts %s", (text) => expect(isRoleOnlyInterpretation(text)).toBe(false));
});
