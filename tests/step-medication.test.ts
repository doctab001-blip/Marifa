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

describe("automatic step medicines (display only)", async () => {
  const { linkStepMedicines, splitDrugMarks } = await import("@/lib/step-medication");
  const reg = (genericName: string, route = "Oral", extra = {}) => ({ genericName, route, dose: "500 mg", frequency: "Twice daily", duration: "5 days", ...extra });
  const bold = (text: string) => splitDrugMarks(text).filter((p) => p.bold).map((p) => p.text);

  it("bolds drugs named in step text and lists each under the first step that names it", () => {
    const steps = [
      { id: "1", title: "Treat", timeframe: "now", actions: ["Start oral Amoxicillin and give paracetamol for fever."] },
      { id: "2", title: "Review", timeframe: "48 h", actions: ["Continue amoxicillin if improving."] },
    ];
    const regs = [reg("Amoxicillin 500 mg capsules"), reg("Paracetamol (acetaminophen)"), reg("Meropenem", "IV")];
    const out = linkStepMedicines(steps, regs);
    expect(bold(out[0].actions[0])).toEqual(["Amoxicillin", "paracetamol"]);
    expect(out[0].medicines?.map((m) => m.badge.drug)).toEqual(["Amoxicillin 500 mg capsules", "Paracetamol (acetaminophen)"]);
    expect(bold(out[1].actions[0])).toEqual(["amoxicillin"]);
    expect(out[1].medicines).toEqual([]);
    expect(uncoveredRegimens(steps, regs).map((r) => r.genericName)).toEqual(["Meropenem"]);
  });

  it("does not treat measurements or forms as prescriptions", () => {
    const steps = [{ id: "1", title: "Check", timeframe: "now", actions: ["Check capillary glucose and serum potassium; if glucose below 4 mmol/L give glucose 10%."] }];
    const out = linkStepMedicines(steps, [reg("Glucose 10%", "IV"), reg("Basal insulin (glargine)", "Subcutaneous")]);
    expect(bold(out[0].actions[0])).toEqual(["glucose"]);
    expect(out[0].actions[0].startsWith("Check capillary glucose")).toBe(true);
  });

  it("leaves topics that already carry badges exactly as written", () => {
    const steps = [{ id: "1", title: "A", timeframe: "now", actions: ["Give [💊 Ceftriaxone | 2 g | IV | Once daily | 5 days] and paracetamol."] }];
    expect(linkStepMedicines(steps, [reg("Paracetamol")])).toBe(steps);
  });

  it("keeps the stored text unchanged once marks are removed", () => {
    const text = "Give magnesium sulphate and IV ceftriaxone — then co-amoxiclav.";
    const out = linkStepMedicines([{ id: "1", title: "A", timeframe: "now", actions: [text] }], [reg("Magnesium sulfate 50%", "IV"), reg("Ceftriaxone", "IV"), reg("Co-amoxiclav")]);
    expect(out[0].actions[0].replace(/[]/g, "")).toBe(text);
    expect(bold(out[0].actions[0])).toEqual(["magnesium sulphate", "ceftriaxone", "co-amoxiclav"]);
  });
});
