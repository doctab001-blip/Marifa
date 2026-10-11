import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DiseaseDetailSchema } from "@/lib/validations/disease";

const dirs = ["data/teaching-demonstrations", "data/emergency-versions"].map((name) => join(process.cwd(), name));

describe("teaching demonstration versions", () => {
  for (const dir of dirs) for (const file of readdirSync(dir).filter((name) => name.endsWith(".json"))) {
    it(`${file} is a valid, unapproved teaching version`, () => {
      const parsed = DiseaseDetailSchema.parse(JSON.parse(readFileSync(join(dir, file), "utf8")));
      expect(parsed.status).toBe("under_review");
      expect(parsed.clinicalReviewStatus).toBe("pending");
      if (parsed.teaching?.vignette) expect(parsed.teaching.vignette.fictitious).toBe(true);
      expect(parsed.teaching?.learningObjectives.length).toBeGreaterThan(0);
      expect(parsed.medicationPlan?.regimens.every((regimen) => regimen.sourceUrl.startsWith("https://"))).toBe(true);
    });
  }
});
