import { describe, expect, it } from "vitest";
import { withoutDeferrals, withoutInlineSourceLocators } from "@/lib/clinical-display-text";
import { displayAdjustments, displayLines } from "@/lib/medicine-adjustments";
import { penicillinAllergyLine } from "@/lib/medicine-allergy";
import { renalHepaticLines } from "@/lib/medicine-renal-hepatic";

describe("deferral wording is never shown", () => {
  it("drops lines that only defer or say a source is silent", () => {
    expect(withoutDeferrals("The MOH protocol gives no renal dose thresholds for biliary agents; adjust to renal function per the product label and hospital pharmacy.")).toBe("");
    expect(withoutDeferrals("CKD: Check the product label — renal threshold not verified in this task; pharmacist review.")).toBe("");
    expect(withoutDeferrals("Maximum dose is not given in the source")).toBe("");
    expect(withoutDeferrals("Doses are adult doses from the Saudi MOH protocols only; WSES 2020 gives no doses. SFDA registration was not checked; check the SFDA register and hospital formulary before prescribing.")).toBe("Doses are adult doses from the Saudi MOH protocols only.");
    expect(withoutDeferrals("Patient gives no history of allergy.")).toBe("Patient gives no history of allergy.");
    expect(withoutDeferrals("Follow Saudi diabetes guidelines for targets.")).toBe("Follow Saudi diabetes guidelines for targets.");
    expect(withoutDeferrals("Intravenous iron is not given in the first trimester.")).toBe("Intravenous iron is not given in the first trimester.");
    expect(withoutDeferrals("IV magnesium infusion duration is not stated in the opened protocol (usually over 20 minutes).")).toBe("IV magnesium infusion duration: usually over 20 minutes.");
    expect(withoutDeferrals("The STW gives no SpO2 or blood-pressure target beyond systolic above 90 mmHg before mannitol.")).toBe("Systolic above 90 mmHg before mannitol.");
    expect(withoutDeferrals("NICE NG91 gives paediatric doses by age band but no adult doses; adult amoxicillin 500 mg and clarithromycin 500 mg are from NHS Grampian only and the page gives no erythromycin advice for adults.")).toBe("NICE NG91 gives paediatric doses by age band but no adult doses; adult amoxicillin 500 mg and clarithromycin 500 mg are from NHS Grampian only.");
    expect(withoutDeferrals("The 2 g dose (3 g above 120 kg) is from the NSW rule and exceeds the label dose, so the prescriber should confirm it locally.")).toBe("The 2 g dose (3 g above 120 kg) is from the NSW rule and exceeds the label dose.");
    expect(withoutDeferrals("CKD: eGFR below 30: 1 g daily; follow the label.")).toBe("CKD: eGFR below 30: 1 g daily.");
    expect(withoutDeferrals("Refer if hCG at or above 5,000 units/L (local protocol), or living far from the hospital.")).toBe("Refer if hCG at or above 5,000 units/L, or living far from the hospital.");
    expect(withoutDeferrals("Paediatric: Paediatric dose not stated in the ICMR STW.")).toBe("");
    expect(withoutDeferrals("Until vasopressors are no longer needed (local protocol for taper)")).toBe("Until vasopressors are no longer needed");
    expect(withoutDeferrals("Fondaparinux, UFH and tenecteplase ACS doses — local protocol")).toBe("Fondaparinux, UFH and tenecteplase ACS doses");
    expect(withoutDeferrals("AHA algorithm doses. Check the Saudi hospital formulary.")).toBe("AHA algorithm doses.");
    expect(withoutDeferrals("Give separately unless local protocol allows.")).toBe("Give separately.");
    expect(withoutDeferrals("Names sertraline and other SSRIs but gives no doses. Doses come from US FDA labels.")).toBe("Names sertraline and other SSRIs. Doses come from US FDA labels.");
    expect(withoutDeferrals("Plain X-ray misses early strangulation and gives no cause.")).toBe("Plain X-ray misses early strangulation and gives no cause.");
    expect(withoutDeferrals("Stop medicines that give no symptom benefit.")).toBe("Stop medicines that give no symptom benefit.");
    expect(withoutDeferrals("With velpatasvir give no more than omeprazole 20 mg once daily.")).toBe("With velpatasvir give no more than omeprazole 20 mg once daily.");
    expect(withoutDeferrals("Tranexamic acid IV dose/local protocol; plus 1–2 g topical intra-articular.")).toBe("Tranexamic acid IV dose; plus 1–2 g topical intra-articular.");
    expect(withoutDeferrals("JBDS does not state a maximum potassium rate; use 10 mmol/hour peripherally.")).toBe("Use 10 mmol/hour peripherally.");
    expect(withoutDeferrals("India NLEM 2022 section 6.2.1.13 lists 4 g/0.5 g injection. Check hospital formulary.")).toBe("India NLEM 2022 section 6.2.1.13 lists 4 g/0.5 g injection.");
  });

  it("keeps the clinical part of a sentence", () => {
    expect(withoutDeferrals("Age 75 or over: no IV bolus and reduced dose per label")).toBe("Age 75 or over: no IV bolus and reduced dose");
    expect(withoutDeferrals("300 mg daily when indicated after haemorrhage is excluded; route and timing follow the local protocol")).toBe("300 mg daily when indicated after haemorrhage is excluded");
    expect(withoutDeferrals("Vancomycin levels and creatinine per the hospital protocol.")).toBe("Vancomycin levels and creatinine.");
    expect(withoutDeferrals("Liver conditions can make it unsuitable; no specific hepatic adjustment is given.")).toBe("Liver conditions can make it unsuitable.");
  });

  it("cleans bracketed asides without breaking the sentence", () => {
    expect(withoutDeferrals("Listed as an exclusionary condition; the guideline gives no distinguishing features (printed p. 25, Table 1).")).toBe("Listed as an exclusionary condition.");
    expect(withoutDeferrals("Normal ventricular function, no LV thrombus (the sources give no numeric normal ejection fraction)")).toBe("Normal ventricular function, no LV thrombus");
    expect(withoutDeferrals("Below the assay threshold (age-adjusted threshold may be used over 50 years; the source gives no numeric cut-off)")).toBe("Below the assay threshold (age-adjusted threshold may be used over 50 years)");
  });

  it("cuts only the deferring span and keeps the clinical instruction", () => {
    expect(withoutDeferrals("Where they differ, follow WHO 2025 and confirm with the local protocol.")).toBe("Where they differ, follow WHO 2025.");
    expect(withoutDeferrals("Creatinine rise above 50% or potassium above 5.5 mmol/L → follow local guideline.")).toBe("Creatinine rise above 50% or potassium above 5.5 mmol/L.");
    expect(withoutDeferrals("Do not stop abruptly; if oral delivery is unsafe, obtain urgent movement-disorders and pharmacy advice for an alternative route.")).toBe("Do not stop abruptly; if oral delivery is unsafe, obtain urgent movement-disorders and pharmacy advice for an alternative route.");
    expect(withoutDeferrals("Glycopyrronium first line if cognitive impairment; dose per local protocol.")).toBe("Glycopyrronium first line if cognitive impairment.");
    expect(withoutDeferrals("The Saudi protocol dose is used; renal reductions follow the label Table 1.")).toBe("The Saudi protocol dose is used.");
    expect(withoutDeferrals("Shown side by side and not merged; follow the hospital protocol for which to use.")).toBe("Shown side by side and not merged.");
    expect(withoutDeferrals("MOH: glucose every 2 hours, start insulin infusion above 120 mg/dL, adjust per local protocol.")).toBe("MOH: glucose every 2 hours, start insulin infusion above 120 mg/dL.");
    expect(withoutDeferrals("The page lists no contraindications; check product information.")).toBe("");
    expect(withoutDeferrals("Pneumonia or sepsis: treat per unit protocol and the neonatal sepsis workflow.")).toBe("Pneumonia or sepsis: treat per the neonatal sepsis workflow.");
    expect(withoutDeferrals("Consider regular monitoring of therapeutic levels and follow the product information and local protocol.")).toBe("Consider regular monitoring of therapeutic levels.");
    expect(withoutDeferrals("Disposition after status epilepticus is not specified in the opened sources; follow local policy and neurology advice.")).toBe("");
  });

  it("leaves ordinary clinical text, decimals and labels untouched", () => {
    const text = "Give 0.5 mg IM (0.5 mL of 1 mg/mL); repeat after 5 minutes. Label the syringe.";
    expect(withoutDeferrals(text)).toBe(text);
    expect(withoutInlineSourceLocators("Check the airway and follow the ABCDE approach.")).toBe("Check the airway and follow the ABCDE approach.");
  });
});

describe("every medicine shows CKD, CLD and an allergy alternative", () => {
  it("fills missing lines from the reference data and replaces deferring ones", () => {
    const lines = displayAdjustments(["The MOH protocol gives no renal dose thresholds for biliary agents; follow the product label."], "Ceftriaxone");
    expect(lines.some((l) => l.startsWith("CKD: "))).toBe(true);
    expect(lines.some((l) => l.startsWith("CLD: "))).toBe(true);
    expect(lines.find((l) => l.startsWith("Penicillin allergy:"))).toMatch(/non-severe penicillin allergy/);
    expect(lines.join(" ")).not.toMatch(/MOH|product label/);
  });

  it("keeps a topic's own lines and adds nothing it already has", () => {
    const own = ["CKD: eGFR below 30: 1 g daily.", "CLD: No dose change.", "Penicillin allergy: Use clarithromycin."];
    expect(displayAdjustments(own, "Amoxicillin")).toEqual(own);
  });

  it("gives no penicillin-allergy line to non-antibiotics", () => {
    expect(displayAdjustments([], "Paracetamol").some((l) => /^Penicillin allergy/.test(l))).toBe(false);
  });

  it("drops deferring contraindication and monitoring lines", () => {
    expect(displayLines(["Hypersensitivity: check the product label", "Severe hepatic failure"])).toEqual(["Severe hepatic failure"]);
  });

  it("classifies antibiotics for penicillin allergy", () => {
    expect(penicillinAllergyLine("Amoxicillin 500 mg capsules")).toMatch(/^Contraindicated/);
    expect(penicillinAllergyLine("Piperacillin–tazobactam")).toMatch(/meropenem/);
    expect(penicillinAllergyLine("Meropenem")).toMatch(/Usable in penicillin allergy/);
    expect(penicillinAllergyLine("Aztreonam")).toMatch(/no cross-reactivity/);
    expect(penicillinAllergyLine("Ceftriaxone + metronidazole")).toMatch(/third-generation/);
    expect(penicillinAllergyLine("Clarithromycin")).toMatch(/Not a beta-lactam/);
    expect(penicillinAllergyLine("Co-trimoxazole")).toMatch(/Not a beta-lactam/);
  });

  it("covers the medicines that had no renal and liver rule", () => {
    for (const name of ["Zoledronic acid", "Propylthiouracil", "Chlorpromazine", "Glucose 20% IV infusion", "Lugol's iodine", "0.45% sodium chloride"]) expect(renalHepaticLines(name)).not.toBeNull();
  });
});
