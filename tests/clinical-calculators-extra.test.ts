import { describe, expect, it } from "vitest";
import { calculateScore, clinicalCalculators, getCalculatorResult, getSecondaryResults, isCalculatorComplete, type CalculatorAnswers } from "@/lib/clinical-calculators";

const calc = (id: string) => clinicalCalculators.find((item) => item.id === id)!;
const n = (value: number, unit?: string) => ({ value, unit });
const run = (id: string, answers: CalculatorAnswers) => {
  const schema = calc(id);
  const score = calculateScore(schema, answers);
  return { score: score as number, label: getCalculatorResult(schema, score, answers)?.label, secondary: getSecondaryResults(schema, answers), complete: isCalculatorComplete(schema, answers) };
};

describe("unit handling (regression: units were ignored by formulas)", () => {
  const base = { sex: "no", age: n(50, "years"), equation: "2021-creatinine" };
  it("gives the same eGFR for 1.0 mg/dL and 88.4 µmol/L", () => {
    const mg = run("ckd-epi-egfr", { ...base, creatinine: n(1, "mg-dl") }).score;
    const um = run("ckd-epi-egfr", { ...base, creatinine: n(88.4, "umol-l") }).score;
    expect(mg).toBeCloseTo(91.7, 0);
    expect(um).toBeCloseTo(mg, 0);
  });
  it("gives the same Cockcroft-Gault clearance for kg and lb", () => {
    const common = { sex: "male", age: n(50, "years"), creatinine: n(1, "mg-dl") };
    expect(run("cockcroft-gault", { ...common, weight: n(70, "kg") }).score).toBeCloseTo(87.5, 1);
    expect(run("cockcroft-gault", { ...common, weight: n(154.324, "lb") }).score).toBeCloseTo(87.5, 1);
  });
});

describe("CKD-EPI", () => {
  it("uses the 2021 creatinine-cystatin constants (alpha -0.144 men, -0.219 women)", () => {
    const answers = { equation: "2021-creatinine-cystatin", sex: "no", age: n(40, "years"), creatinine: n(0.7, "mg-dl"), "cystatin-c": n(0.6, "mg-l") };
    const expected = 135 * Math.pow(0.7 / 0.9, -0.144) * Math.pow(0.6 / 0.8, -0.323) * Math.pow(0.9961, 40);
    expect(run("ckd-epi-egfr", answers).score).toBeCloseTo(expected, 0);
  });
  it("needs only the labs that the chosen equation uses", () => {
    const schema = calc("ckd-epi-egfr");
    expect(isCalculatorComplete(schema, { sex: "no", age: n(50, "years"), creatinine: n(1, "mg-dl") })).toBe(true);
    expect(isCalculatorComplete(schema, { equation: "2012-cystatin", sex: "no", age: n(50, "years"), creatinine: n(1, "mg-dl") })).toBe(false);
  });
});

describe("MELD-Na", () => {
  it("applies the sodium term only above MELD 11", () => {
    expect(run("meld-na", { dialysis: "no", creatinine: n(1, "mg-dl"), bilirubin: n(1, "mg-dl"), inr: n(1, "ratio"), sodium: n(125, "mmol-l") }).score).toBe(6);
  });
  it("matches a hand-calculated MELD-Na", () => {
    expect(run("meld-na", { dialysis: "no", creatinine: n(2, "mg-dl"), bilirubin: n(3, "mg-dl"), inr: n(1.5, "ratio"), sodium: n(130, "mmol-l") }).score).toBe(26);
  });
});

describe("new calculators", () => {
  it("adds ten new calculators plus the restored qSOFA", () => {
    const added = clinicalCalculators.filter((item) => item.isNew).map((item) => item.id).sort();
    expect(added).toEqual(["anion-gap", "bmi-bsa", "child-pugh", "corrected-calcium", "glasgow-blatchford", "news2", "padua", "perc", "qsofa-score", "qtc", "wells-dvt"]);
    expect(new Set(clinicalCalculators.map((item) => item.id)).size).toBe(clinicalCalculators.length);
  });
  it("every calculator has pearls, references, and a result tier for the lowest score", () => {
    for (const item of clinicalCalculators) {
      expect(item.references.length, item.id).toBeGreaterThan(0);
      expect(item.results.length, item.id).toBeGreaterThan(0);
    }
  });

  it("Wells DVT scores +1 per item and -2 for an alternative diagnosis", () => {
    const all = Object.fromEntries(["cancer", "paralysis", "bedridden", "tenderness", "leg-swollen", "calf-swelling", "pitting", "collaterals", "prior-dvt"].map((k) => [k, "yes"]));
    expect(run("wells-dvt", { ...all, "alt-dx": "no" }).score).toBe(9);
    expect(run("wells-dvt", { "alt-dx": "yes" }).score).toBe(-2);
    expect(run("wells-dvt", { ...all, "alt-dx": "no" }).label).toBe("High probability");
    expect(run("wells-dvt", { cancer: "yes", "alt-dx": "no" }).label).toBe("Moderate probability");
  });

  it("PERC is negative only when all criteria are absent", () => {
    const none = Object.fromEntries(["age", "hr", "spo2", "leg", "haemoptysis", "surgery", "vte", "hormone"].map((k) => [k, "no"]));
    expect(run("perc", none).label).toBe("PERC negative");
    expect(run("perc", { ...none, age: "yes" }).label).toBe("PERC positive");
  });

  it("Child-Pugh grades class C at 10 points and converts SI units", () => {
    const answers = { bilirubin: n(2.5, "mg-dl"), albumin: n(3, "g-dl"), inr: n(1.8, "ratio"), ascites: "mild", encephalopathy: "grade1-2" };
    expect(run("child-pugh", answers)).toMatchObject({ score: 10, label: "Class C (decompensated)" });
    expect(run("child-pugh", { ...answers, bilirubin: n(42.77, "umol-l"), albumin: n(30, "g-l") }).score).toBe(10);
    expect(run("child-pugh", { bilirubin: n(1, "mg-dl"), albumin: n(4, "g-dl"), inr: n(1.1, "ratio"), ascites: "none", encephalopathy: "none" })).toMatchObject({ score: 5, label: "Class A (well compensated)" });
  });

  it("corrected calcium applies +0.8 mg/dL per 1 g/dL albumin below 4", () => {
    expect(run("corrected-calcium", { calcium: n(8, "mg-dl"), albumin: n(2, "g-dl") }).score).toBe(9.6);
    expect(run("corrected-calcium", { calcium: n(2, "mmol-l"), albumin: n(20, "g-l") }).score).toBe(9.6);
    expect(run("corrected-calcium", { calcium: n(8, "mg-dl"), albumin: n(2, "g-dl") }).label).toBe("Normal range");
    expect(run("corrected-calcium", { calcium: n(13, "mg-dl"), albumin: n(4, "g-dl") }).label).toBe("Moderate hypercalcaemia");
  });

  it("anion gap corrects for albumin and reports the delta ratio", () => {
    const base = { sodium: n(140), chloride: n(100), bicarbonate: n(15) };
    expect(run("anion-gap", base)).toMatchObject({ score: 25, label: "High anion gap", complete: true });
    const withAlbumin = run("anion-gap", { ...base, albumin: n(2, "g-dl") });
    expect(withAlbumin.score).toBe(30);
    expect(withAlbumin.secondary.find((row) => row.label === "Delta ratio")?.value).toBe("2");
  });

  it("QTc matches the four published formulas and is sex-aware", () => {
    const man = run("qtc", { qt: n(400), hr: n(75), sex: "male" });
    expect(man.score).toBe(447);
    expect(man.secondary.map((row) => row.value)).toEqual(["431 ms", "431 ms", "426 ms"]);
    expect(run("qtc", { qt: n(410), hr: n(75), sex: "male" }).label).toBe("Prolonged QTc");
    expect(run("qtc", { qt: n(410), hr: n(75), sex: "female" }).label).toBe("Normal QTc");
    expect(run("qtc", { qt: n(480), hr: n(60), sex: "female" }).label).toBe("Prolonged QTc");
    expect(run("qtc", { qt: n(520), hr: n(60), sex: "male" }).label).toBe("Markedly prolonged QTc");
  });

  it("Glasgow-Blatchford handles sex, units and thresholds", () => {
    const worstMan = { bun: n(30, "mg-dl"), hb: n(11, "g-dl"), sex: "male", sbp: n(95), hr: "yes", melaena: "yes", syncope: "yes", hepatic: "yes", cardiac: "yes" };
    expect(run("glasgow-blatchford", worstMan)).toMatchObject({ score: 17, label: "High risk" });
    expect(run("glasgow-blatchford", { ...worstMan, bun: n(10, "mmol-l"), hb: n(110, "g-l") }).score).toBe(17);
    expect(run("glasgow-blatchford", { ...worstMan, sex: "female" }).score).toBe(15);
    expect(run("glasgow-blatchford", { bun: n(10, "mg-dl"), hb: n(14, "g-dl"), sex: "male", sbp: n(120), hr: "no", melaena: "no", syncope: "no", hepatic: "no", cardiac: "no" })).toMatchObject({ score: 0, label: "Very low risk" });
  });

  it("NEWS2 scores each parameter, including scale 2 and a red score", () => {
    const normal = { rr: n(16), spo2: n(98), scale: "1", oxygen: "air", sbp: n(120), pulse: n(70), consciousness: "alert", temp: n(37, "c") };
    expect(run("news2", normal)).toMatchObject({ score: 0, label: "Low clinical risk" });
    expect(run("news2", { ...normal, temp: n(98.6, "f") }).score).toBe(0);
    expect(run("news2", { rr: n(26), spo2: n(90), scale: "1", oxygen: "oxygen", sbp: n(85), pulse: n(135), consciousness: "cvpu", temp: n(39.5, "c") })).toMatchObject({ score: 19, label: "High clinical risk" });
    expect(run("news2", { ...normal, sbp: n(85) })).toMatchObject({ score: 3, label: "Low-medium clinical risk" });
    expect(run("news2", { ...normal, spo2: n(90), scale: "2" }).score).toBe(0);
    expect(run("news2", { ...normal, spo2: n(95), scale: "2", oxygen: "oxygen" }).score).toBe(4);
    expect(run("news2", { ...normal, rr: n(22), pulse: n(115), temp: n(38.5, "c") })).toMatchObject({ score: 5, label: "Medium clinical risk" });
  });

  it("BMI and BSA use WHO categories and Mosteller / DuBois", () => {
    const result = run("bmi-bsa", { weight: n(70, "kg"), height: n(175, "cm") });
    expect(result).toMatchObject({ score: 22.9, label: "Normal weight" });
    expect(result.secondary[0].value).toBe("1.84 m²");
    expect(run("bmi-bsa", { weight: n(154.324, "lb"), height: n(68.898, "in") }).score).toBe(22.9);
    expect(run("bmi-bsa", { weight: n(105, "kg"), height: n(170, "cm") }).label).toBe("Obesity class II");
  });

  it("Padua separates high risk at 4 points", () => {
    expect(run("padua", { cancer: "yes", age: "yes" })).toMatchObject({ score: 4, label: "High risk of VTE" });
    expect(run("padua", { trauma: "yes", age: "yes" })).toMatchObject({ score: 3, label: "Low risk of VTE" });
  });

  it("qSOFA flags two or more criteria", () => {
    expect(run("qsofa-score", { rr: "yes", sbp: "no", mentation: "no" }).label).toBe("Lower risk");
    expect(run("qsofa-score", { rr: "yes", sbp: "yes", mentation: "no" })).toMatchObject({ score: 2, label: "Higher risk" });
  });
});
