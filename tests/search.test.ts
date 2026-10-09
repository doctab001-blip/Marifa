import { describe, expect, it } from "vitest";
import { diseases } from "@/lib/demo-data";
import { searchDiseases } from "@/lib/search";

describe("clinical directory search", () => {
  it("ranks an exact abbreviation match", () => {
    expect(searchDiseases(diseases, "COPD")[0].slug).toBe("copd-exacerbation");
  });

  it("finds a disease from a presenting symptom", () => {
    expect(searchDiseases(diseases, "shortness of breath")[0].slug).toBe("copd-exacerbation");
  });

  it("finds indexed Arabic content", () => {
    expect(searchDiseases(diseases, "إصابة الكلى الحادة")[0].slug).toBe("acute-kidney-injury");
  });

  it("respects specialty filtering", () => {
    expect(searchDiseases(diseases, "", "Nephrology").map((item) => item.slug)).toEqual(["acute-kidney-injury"]);
  });
});
