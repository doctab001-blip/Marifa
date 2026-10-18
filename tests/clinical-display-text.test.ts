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
    expect(withoutInlineSourceLocators("SDCPG advises referral if pulses are reduced (SDCPG p. 82; NG19 1.3.5)."))
      .toBe("Referral if pulses are reduced.");
    expect(withoutInlineSourceLocators("Low, moderate, high, active: NG19 1.3.6."))
      .toBe("Low, moderate, high, active.");
    expect(withoutInlineSourceLocators("See the BNF for dosing in renal impairment (NG19 Table 2)."))
      .toBe("Check dosing in renal impairment.");
    expect(withoutInlineSourceLocators("NICE: call an ambulance if pain persists."))
      .toBe("call an ambulance if pain persists.");
    expect(withoutInlineSourceLocators("Hypertension in Adults [Adapted from NICE]"))
      .toBe("Hypertension in Adults");
    expect(withoutInlineSourceLocators("NICE finds not enough evidence to support a specific diet."))
      .toBe("There is not enough evidence to support a specific diet.");
  });
});
