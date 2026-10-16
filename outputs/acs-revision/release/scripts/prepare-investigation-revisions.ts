import { readFile, writeFile, mkdir } from "node:fs/promises";
import { DiseaseDetailSchema } from "../lib/validations/disease";

type Proposal = [string, "laboratory" | "firstLineImaging" | "advancedImaging" | "specializedAdjunctive", string, string, string, "ruleIn" | "ruleOut"];
type Baseline = { id: string; title: string; status: string; version_id: string; content: unknown };
const revision = "investigations-2026-10-11-v1";
const baseline: Baseline[] = JSON.parse(await readFile("outputs/investigations/catalogue-before.json", "utf8"));
const proposals: Record<string, Proposal[]> = JSON.parse(await readFile("data/reviews/investigation-proposals.json", "utf8"));
const drafts = Object.entries(proposals).map(([title, tests]) => {
  const row = baseline.find((item) => item.title === title && ["approved", "published"].includes(item.status));
  if (!row) throw new Error(`No current catalogue match: ${title}`);
  const original = DiseaseDetailSchema.parse(row.content);
  const investigations: typeof original.investigations = { ruleIn: [], ruleOut: [] };
  for (const [testName, tier, targetCondition, expectedFinding, clinicalRationale, group] of tests) {
    const isHypertension = title === "Adult Essential Hypertension Screening and Confirmation";
    const secondary = /aldosterone|metanephrine|sleep study/i.test(testName);
    investigations[group].push({
      testName, tier, targetCondition, expectedFinding, clinicalRationale,
      modalityTarget: `${testName} — ${targetCondition}`,
      ...(isHypertension ? { references: [{
        title: secondary ? "MSD Manual Professional: Hypertension — Testing" : "Saudi MOH: Cardiometabolic Risk Management — Assessment of Hypertension",
        edition: secondary ? "Online review updated February 2026; Saudi application awaiting review" : "Legacy manual, PDF pages 35–36; check current local pathway",
        url: secondary ? "https://www.msdmanuals.com/professional/cardiovascular-disorders/hypertension/hypertension" : "https://www.moh.gov.sa/en/Ministry/About/Health%20Policies/026.pdf#page=35",
      }] } : {}),
    });
  }
  const content = DiseaseDetailSchema.parse({ ...original, investigations, status: "under_review", clinicalReviewStatus: "pending", version: revision });
  return { guideline_id: row.id, original_version_id: row.version_id, version: revision, content };
});
if (drafts.length !== 61) throw new Error(`Expected 61 proposals; got ${drafts.length}`);
await mkdir("outputs/investigations", { recursive: true });
await writeFile("outputs/investigations/revisions.json", JSON.stringify(drafts, null, 2) + "\n");
console.log(`Validated ${drafts.length} review drafts and ${drafts.reduce((sum, row) => sum + row.content.investigations.ruleIn.length + row.content.investigations.ruleOut.length, 0)} named assessments. No database writes performed.`);
