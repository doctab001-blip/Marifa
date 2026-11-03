import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { splitActionList } from "@/lib/action-list";
import { ActionText } from "@/components/action-text";
import { ClinicalTimeframe } from "@/components/clinical-timeframe";

const ECG = "If automated interpretation is unavailable, take a manual 12-lead ECG and have a trained, competent healthcare professional review it for inappropriate persistent bradycardia, any ventricular arrhythmia including ventricular ectopic beats, long QT (corrected QT over 450 ms) or short QT (corrected QT under 350 ms), Brugada syndrome, ventricular pre-excitation (Wolff-Parkinson-White), left or right ventricular hypertrophy, abnormal T wave inversion, pathological Q waves, sustained atrial arrhythmia and paced rhythm (NICE CG109, Section 1.1).";

describe("splitActionList: automatic bullets", () => {
  it("splits the manual ECG line into a lead-in and ten bullets, keeping parentheses whole", () => {
    const list = splitActionList(ECG)!;
    expect(list.lead.endsWith("review it for:")).toBe(true);
    expect(list.items).toEqual([
      "inappropriate persistent bradycardia",
      "any ventricular arrhythmia including ventricular ectopic beats",
      "long QT (corrected QT over 450 ms) or short QT (corrected QT under 350 ms)",
      "Brugada syndrome",
      "ventricular pre-excitation (Wolff-Parkinson-White)",
      "left or right ventricular hypertrophy",
      "abnormal T wave inversion",
      "pathological Q waves",
      "sustained atrial arrhythmia",
      "paced rhythm",
    ]);
  });

  it("splits a colon list of noun phrases", () => {
    const list = splitActionList("Look for the features that make loss of consciousness a red flag: heart failure (history or examination findings), loss of consciousness during exertion, a heart murmur and new or unexplained breathlessness.")!;
    expect(list.lead).toBe("Look for the features that make loss of consciousness a red flag:");
    // The last two items contain "or", so they stay together rather than risk a wrong split.
    expect(list.items).toEqual(["heart failure (history or examination findings)", "loss of consciousness during exertion", "a heart murmur and new or unexplained breathlessness"]);
  });

  it.each([
    ["a list in the middle of a sentence", "Review every 1–2 weeks while up-titrating, checking blood pressure, heart rate, potassium and creatinine before each increase, then refer back to the community health centre with periodic specialist review (ICMR STW)."],
    ["a medication badge", "Give [💊 Adrenaline | 0.5 mg | IM | Once | Repeat after 5 minutes] for anaphylaxis: airway, breathing, circulation, disability and exposure assessed first and then repeated."],
    ["imperative clauses after a colon", "Sick-day rules: never stop basal insulin, check glucose every 3 to 4 hours, check ketones when ill, drink fluids, and seek urgent care for vomiting or drowsiness (NICE NG17)."],
    ["a sentence with a semicolon", "Offer a repeat test in primary care after a normal result; if symptoms recur, refer for review, imaging, blood tests and specialist assessment within two weeks."],
    ["a run of instructions after a colon", "Treat eye emergencies at the same time: irrigate a chemical splash at once and shield, without pressure, any suspected penetrating injury, and look for orbital swelling, fever or confusion suggesting orbital cellulitis."],
    ["a statement about the whole list", "Pregnancy: ACE inhibitors, ARBs, ARNI, MRAs, ivabradine, vericiguat and SGLT2 inhibitors are contraindicated — stop before conception or as soon as pregnancy is known."],
    ["sentences mixed after a colon", "Cellulitis severity: Mild: drainage only. Moderate (7 to 10 days): clindamycin by mouth, doxycycline or trimethoprim-sulfamethoxazole twice daily for the full course."],
    ["a short line", "Record a 12-lead ECG, heart rate, blood pressure and oxygen saturation."],
    ["fewer than five items after a lead-in phrase", "Review it for bradycardia, long QT or paced rhythm and a long list that is otherwise still too short to bullet."],
  ])("leaves %s untouched", (_label, text) => {
    expect(splitActionList(text)).toBeNull();
  });
});

describe("splitActionList: linking words", () => {
  it("keeps 'before, during or after it' inside one bullet", () => {
    const list = splitActionList("Look for the seizure features: a bitten tongue, head-turning to one side during the event, no memory of abnormal behaviour that someone else witnessed before, during or after it, unusual posturing, prolonged limb-jerking and confusion after the event.")!;
    expect(list.items).toContain("no memory of abnormal behaviour that someone else witnessed before, during or after it");
    expect(list.items).toHaveLength(6);
  });
});

describe("splitActionList: explicit bullets", () => {
  it("reads a lead-in and dash lines", () => {
    expect(splitActionList("Treat as a red flag:\n- **bundle branch block**\n- **long or short QT**")).toEqual({ lead: "Treat as a red flag:", items: ["**bundle branch block**", "**long or short QT**"] });
  });
});

describe("rendering", () => {
  it("keeps the colon after a bold lead-in", () => {
    const html = renderToStaticMarkup(createElement(ActionText, { text: "Treat any of these as a **red flag**:\n- **bundle branch block**\n- **long QT**" }));
    expect(html).toContain('<strong class="key-term">red flag</strong>');
    expect(html).toContain(':<ul class="pathway-sublist">');
    expect(html).not.toContain("red flag</strong><span></span></span>.");
  });

  it("draws **bold** markers as strong text and removes the asterisks", () => {
    const html = renderToStaticMarkup(createElement(ClinicalTimeframe, { text: "Record a **12-lead ECG** now." }));
    expect(html).toContain('<strong class="key-term">12-lead ECG</strong>');
    expect(html).not.toContain("**");
  });

  it("renders bullets for a list and plain text otherwise", () => {
    const list = renderToStaticMarkup(createElement(ActionText, { text: ECG }));
    expect(list).toContain('class="pathway-sublist"');
    expect(list.match(/<li>/g)).toHaveLength(10);
    expect(list).toContain(':<ul class="pathway-sublist">'); // the lead-in keeps its colon
    const plain = renderToStaticMarkup(createElement(ActionText, { text: "Record a 12-lead ECG." }));
    expect(plain).not.toContain("<ul");
  });
});
