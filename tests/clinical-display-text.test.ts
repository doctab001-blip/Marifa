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
      .toBe(""); // deferral wording is never shown (27 Oct 2026); the medicine's CKD line gives the answer
    expect(withoutInlineSourceLocators("NICE: call an ambulance if pain persists."))
      .toBe("call an ambulance if pain persists.");
    expect(withoutInlineSourceLocators("Hypertension in Adults [Adapted from NICE]"))
      .toBe("Hypertension in Adults");
    expect(withoutInlineSourceLocators("NICE finds not enough evidence to support a specific diet."))
      .toBe("There is not enough evidence to support a specific diet.");
  });
  it("hides Indian citation locators but keeps clinical parentheses and acronym definitions", () => {
    expect(withoutInlineSourceLocators("Check every patient for carditis, whatever the presenting feature (ICMR STW)."))
      .toBe("Check every patient for carditis, whatever the presenting feature.");
    expect(withoutInlineSourceLocators("Give artesunate (NCVBDC 2023, pp. 30–32; ICMR STW)."))
      .toBe("Give artesunate.");
    expect(withoutInlineSourceLocators("Shock (cold hands, weak fast pulse) — MoHFW 2011, Section 5.3b, pp. 44–45"))
      .toBe("Shock (cold hands, weak fast pulse)");
    expect(withoutInlineSourceLocators("Anticoagulate (use warfarin, ICMR STW)."))
      .toBe("Anticoagulate (use warfarin).");
    expect(withoutInlineSourceLocators("Every 6 hours (NCDC)."))
      .toBe("Every 6 hours.");
    expect(withoutInlineSourceLocators("Notify the National TB Elimination Programme (NTEP)."))
      .toBe("Notify the National TB Elimination Programme (NTEP).");
    expect(withoutInlineSourceLocators("Load before PCI (ICMR prefers ticagrelor or prasugrel loading here)."))
      .toBe("Load before PCI (ICMR prefers ticagrelor or prasugrel loading here).");
    expect(withoutInlineSourceLocators("Treat (ICMR STW, children 2–59 months)."))
      .toBe("Treat (ICMR STW, children 2–59 months).");
  });

  it("removes the remaining guideline tails found in decision branches", () => {
    expect(withoutInlineSourceLocators("Give primaquine (NDP 2013).")).toBe("Give primaquine.");
    expect(withoutInlineSourceLocators("Rule out tuberculosis (NTG 2025).")).toBe("Rule out tuberculosis.");
    expect(withoutInlineSourceLocators("Repeat lactate (Rec. 1.2.13).")).toBe("Repeat lactate.");
    expect(withoutInlineSourceLocators("Start antibiotics (SSC 2026, section Antibiotic initiation).")).toBe("Start antibiotics.");
    expect(withoutInlineSourceLocators("Fluids as per protocol (ISPAD 2022).")).toBe("Fluids as per protocol.");
    expect(withoutInlineSourceLocators("Operate early (WSES Rec. 6.1).")).toBe("Operate early.");
    expect(withoutInlineSourceLocators("Steroids for nephrotic syndrome (ISPN 2023).")).toBe("Steroids for nephrotic syndrome.");
    expect(withoutInlineSourceLocators("Recheck in 2 weeks (correct 2 doses if missed).")).toBe("Recheck in 2 weeks (correct 2 doses if missed).");
  });
});
