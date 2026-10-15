import { describe, expect, it } from "vitest";
import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";

describe("clinical display text", () => {
  it("moves guideline locators out of prose while preserving clinical parentheses", () => {
    expect(withoutInlineSourceLocators("Refer within 1 working day (NG19 1.4.2)."))
      .toBe("Refer within 1 working day.");
    expect(withoutInlineSourceLocators("Use a 10 g monofilament (SDCPG p. 82; NG19 1.3.4)."))
      .toBe("Use a 10 g monofilament.");
    expect(withoutInlineSourceLocators("Give 500 mg (oral) twice daily."))
      .toBe("Give 500 mg (oral) twice daily.");
  });
});
