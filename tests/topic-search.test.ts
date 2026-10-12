import { describe, expect, it } from "vitest";
import { normalizeSearchText, searchTopics, topicMatches, type SearchableTopic } from "@/lib/topic-search";
import { SEARCH_ALIASES } from "@/lib/search-aliases";

const topic = (title: string, extra: Partial<SearchableTopic> = {}): SearchableTopic => ({ title, ...extra });

const topics: SearchableTopic[] = [
  topic("Acute Coronary Syndrome", { pillar: "Urgent Care", speciality: "Emergency Medicine", summary: "Plaque rupture causes acute myocardial ischaemia.", keywords: ["Central chest pain", "Troponin rise"] }),
  topic("Acute Exacerbation of COPD", { pillar: "Urgent Care", speciality: "Respiratory medicine", keywords: ["Increased breathlessness", "Salbutamol"] }),
  topic("Acute Heart Failure and Pulmonary Oedema", { pillar: "Urgent Care", speciality: "Cardiology", keywords: ["Orthopnoea", "Furosemide"] }),
  topic("Acute Kidney Injury", { pillar: "Urgent Care", speciality: "Nephrology" }),
  topic("Diabetic Ketoacidosis", { pillar: "Urgent Care", speciality: "Endocrinology", keywords: ["Polyuria", "Kussmaul breathing"] }),
  topic("Hyperosmolar Hyperglycaemic State", { pillar: "Urgent Care", speciality: "Endocrinology" }),
  topic("Severe Hypoglycaemia", { pillar: "Urgent Care", speciality: "Emergency medicine" }),
  topic("Sepsis and Septic Shock", { pillar: "Urgent Care", speciality: "Emergency Medicine" }),
  topic("Acute Severe Asthma Exacerbation", { pillar: "Urgent Care", speciality: "Emergency medicine" }),
  topic("Deep-Vein Thrombosis and Pulmonary Embolism", { pillar: "Urgent Care", speciality: "Emergency Medicine" }),
  topic("Hypertensive Disorders of Pregnancy", { pillar: "Safe Birth", speciality: "Maternal-Fetal Medicine" }),
  topic("Postpartum Haemorrhage Response", { pillar: "Safe Birth", speciality: "Obstetrics and Gynecology" }),
  topic("Childhood Immunisation and Catch-Up", { pillar: "Keep Well", speciality: "Paediatrics" }),
  topic("Adult Periodic Health Examination", { pillar: "Keep Well", speciality: "Preventive Medicine" }),
  topic("Chronic Kidney Disease", { pillar: "Chronic Care", speciality: "Nephrology" }),
  topic("Heart Failure", { pillar: "Chronic Care", speciality: "Cardiology" }),
  topic("Hypertension in Adults [Adapted from NICE]", { pillar: "Chronic Care", speciality: "Internal Medicine", authority: "NICE" }),
  topic("Type 2 Diabetes Mellitus Longitudinal Care", { pillar: "Chronic Care", speciality: "Endocrinology" }),
];

const titles = (query: string) => searchTopics(topics, query).map(({ title }) => title);

describe("normalizeSearchText", () => {
  it("ignores case, accents, punctuation and spelling variants", () => {
    expect(normalizeSearchText("  Deep-Vein   THROMBOSIS ")).toBe("deep vein thrombosis");
    expect(normalizeSearchText("Haemorrhage")).toBe(normalizeSearchText("hemorrhage"));
    expect(normalizeSearchText("Oedema")).toBe(normalizeSearchText("edema"));
    expect(normalizeSearchText("Immunisation")).toBe(normalizeSearchText("immunization"));
    expect(normalizeSearchText("Pre-eclampsia")).toBe("pre eclampsia");
  });
});

describe("searchTopics", () => {
  it("returns everything, unchanged, for an empty query", () => {
    expect(searchTopics(topics, "")).toEqual(topics);
    expect(searchTopics(topics, "   ")).toEqual(topics);
  });

  it("finds a topic from its abbreviation (the reported DKA failure)", () => {
    expect(titles("DKA")).toEqual(["Diabetic Ketoacidosis"]);
    expect(titles("dka")).toEqual(["Diabetic Ketoacidosis"]);
    expect(titles("HHS")).toEqual(["Hyperosmolar Hyperglycaemic State"]);
    expect(titles("AKI")).toEqual(["Acute Kidney Injury"]);
    expect(titles("CKD")).toEqual(["Chronic Kidney Disease"]);
  });

  it("finds topics from clinical abbreviations that map to several topics, best first", () => {
    expect(titles("MI")[0]).toBe("Acute Coronary Syndrome");
    expect(titles("HF")).toEqual(expect.arrayContaining(["Heart Failure", "Acute Heart Failure and Pulmonary Oedema"]));
    expect(titles("COPD")[0]).toBe("Acute Exacerbation of COPD");
    expect(titles("VTE")).toContain("Deep-Vein Thrombosis and Pulmonary Embolism");
  });

  it("matches lay phrases and symptoms", () => {
    expect(titles("heart attack")).toEqual(["Acute Coronary Syndrome"]);
    expect(titles("chest pain")).toContain("Acute Coronary Syndrome");
    expect(titles("low blood sugar")).toEqual(["Severe Hypoglycaemia"]);
    expect(titles("high blood pressure")).toContain("Hypertension in Adults [Adapted from NICE]");
    expect(titles("pre-eclampsia")).toEqual(["Hypertensive Disorders of Pregnancy"]);
  });

  it("matches keywords, summary text, speciality, pillar and authority", () => {
    expect(titles("troponin")).toEqual(["Acute Coronary Syndrome"]);
    expect(titles("furosemide")).toEqual(["Acute Heart Failure and Pulmonary Oedema"]);
    expect(titles("ischaemia")).toEqual(["Acute Coronary Syndrome"]);
    expect(titles("nephrology")).toEqual(expect.arrayContaining(["Acute Kidney Injury", "Chronic Kidney Disease"]));
    expect(titles("safe birth")).toHaveLength(2);
    expect(titles("NICE")).toEqual(["Hypertension in Adults [Adapted from NICE]"]);
  });

  it("treats British and American spellings the same", () => {
    expect(titles("hemorrhage")).toEqual(["Postpartum Haemorrhage Response"]);
    expect(titles("edema")).toEqual(["Acute Heart Failure and Pulmonary Oedema"]);
    expect(titles("pediatrics")).toEqual(["Childhood Immunisation and Catch-Up"]);
    expect(titles("immunization")).toEqual(["Childhood Immunisation and Catch-Up"]);
  });

  it("matches word starts, hyphenated titles and multi-word queries in any order", () => {
    expect(titles("asth")).toEqual(["Acute Severe Asthma Exacerbation"]);
    expect(titles("deep vein")).toEqual(["Deep-Vein Thrombosis and Pulmonary Embolism"]);
    expect(titles("embolism pulmonary")).toEqual(["Deep-Vein Thrombosis and Pulmonary Embolism"]);
    expect(titles("kidney injury")).toEqual(["Acute Kidney Injury"]);
  });

  it("ranks title matches above summary-only matches", () => {
    const ranked = searchTopics(
      [topic("Unrelated Topic", { summary: "Mentions asthma in passing." }), topic("Asthma")],
      "asthma",
    );
    expect(ranked.map(({ title }) => title)).toEqual(["Asthma", "Unrelated Topic"]);
  });

  it("does not match two-letter abbreviations inside unrelated words", () => {
    expect(titles("pe")).toEqual(["Deep-Vein Thrombosis and Pulmonary Embolism"]);
  });

  it("falls back to the best partial match, then near-spellings, instead of an empty list", () => {
    expect(titles("asthma treatment")).toEqual(["Acute Severe Asthma Exacerbation"]);
    expect(titles("diabetic ketoacidocis")).toEqual(["Diabetic Ketoacidosis"]);
    expect(titles("sepsys")[0]).toBe("Sepsis and Septic Shock");
  });

  it("treats generic document words as optional so they do not widen the results", () => {
    expect(titles("asthma treatment")).toEqual(["Acute Severe Asthma Exacerbation"]);
    expect(titles("diabetes")).not.toContain("Acute Kidney Injury");
  });

  it("only matches inside a word when nothing starts with the text", () => {
    expect(titles("tension")).toEqual(expect.arrayContaining(["Hypertension in Adults [Adapted from NICE]"]));
    expect(titles("stemi")).toEqual(["Acute Coronary Syndrome"]); // not "systemic"
  });

  it("ignores filler words", () => {
    expect(titles("management of asthma")).toEqual(["Acute Severe Asthma Exacerbation"]);
  });

  it("returns nothing for unrelated text", () => {
    expect(titles("zzzzqx")).toEqual([]);
  });

  it("handles topics with no optional fields and regex characters in the query", () => {
    expect(() => searchTopics([topic("Plain")], "(.*[")).not.toThrow();
    expect(topicMatches(topic("Plain"), "plain")).toBe(true);
    expect(topicMatches(topic("Plain"), "other")).toBe(false);
  });
});

describe("search aliases", () => {
  it("never expands to an empty or self-defeating value", () => {
    for (const [key, values] of Object.entries(SEARCH_ALIASES)) {
      expect(key.trim().length).toBeGreaterThan(0);
      expect(values.length).toBeGreaterThan(0);
      for (const value of values) expect(value.trim().length).toBeGreaterThan(0);
    }
  });
});
