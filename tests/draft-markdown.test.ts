import { describe, expect, it } from "vitest";
import { draftToMarkdown, markdownToDraft, type DraftTopic } from "@/lib/draft-markdown";

const topic: DraftTopic = {
  title: "Test topic", specialty: "Emergency Medicine", authority: "MOH", pillar: "Urgent Care", lastReviewed: "2026-10-16",
  pathophysiology: { summary: "Short summary", keyMechanisms: ["Mechanism one"] },
  expectedFinding: "Expected result", clinicalRationale: "Why it matters", symptoms: ["Symptom"], physicalSigns: ["Sign"], redFlags: ["Red flag"],
  differentials: [{ condition: "Alternative", distinguishingFeatures: "Different feature" }],
  investigations: [{ tier: "Primary Care Workup", testName: "Test", expectedFinding: "Result", clinicalRationale: "Reason" }],
  management: { firstLine: ["First"], secondLine: ["Second"], nonPharmacological: ["Education"], urgentReferralCriteria: ["Instability"] },
};

describe("draft Markdown", () => {
  it("round-trips the supported canvas format without a network dependency", () => {
    expect(markdownToDraft(draftToMarkdown(topic), topic)).toEqual({ draft: topic, warnings: [] });
  });

  it("preserves existing data and warns when a section is missing", () => {
    const markdown = draftToMarkdown(topic).replace("## 5. Management & Interventions", "## 5. Care Plan");
    const result = markdownToDraft(markdown, topic);
    expect(result.draft.management).toEqual(topic.management);
    expect(result.warnings).toContain("Warning: '## 5. Management & Interventions' section header not found.");
  });
});
