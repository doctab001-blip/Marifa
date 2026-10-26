import { describe, expect, it } from "vitest";
import { drugKey, matchRegimens, shortDrugName, uncoveredRegimens } from "@/lib/step-medication";

const badge = (drug: string, route: string) => ({ drug, dose: "1 mg", route, frequency: "Stat", duration: "Single dose" });
const regimen = (genericName: string, route: string) => ({ genericName, route });

describe("step medication matching", () => {
  it("shortens pill labels to the drug name", () => {
    expect(shortDrugName("Adrenaline 1 mg/mL (1:1000)")).toBe("Adrenaline");
    expect(shortDrugName("Sodium chloride 0.9% (crystalloid)")).toBe("Sodium chloride");
    expect(drugKey("Paracetamol (IV)")).toBe("paracetamol");
  });

  it("matches IM, nebulised and infusion adrenaline to different regimens", () => {
    const im = regimen("Adrenaline (epinephrine) 1 mg/mL", "IM, anterolateral mid-thigh");
    const neb = regimen("Adrenaline (epinephrine) nebulised", "Nebulised");
    const inf = regimen("Adrenaline infusion", "IV via a dedicated peripheral line");
    const all = [im, neb, inf];
    expect(matchRegimens(badge("Adrenaline 1 mg/mL (1:1000)", "IM"), all)).toEqual([im]);
    expect(matchRegimens(badge("Adrenaline 1 mg/mL (1:1000), nebulised", "Nebulised"), all)).toEqual([neb]);
    expect(matchRegimens(badge("Adrenaline infusion", "IV"), all)).toEqual([inf]);
  });

  it("reports only regimens that no step mentions", () => {
    const steps = [{ id: "a", title: "A", timeframe: "now", actions: ["Give [💊 Ceftriaxone | 2 g | IV | Once daily | 5 days]."] }];
    const regs = [regimen("Ceftriaxone plus metronidazole", "IV"), regimen("Meropenem", "IV")];
    expect(uncoveredRegimens(steps, regs).map((r) => r.genericName)).toEqual(["Meropenem"]);
  });
});
