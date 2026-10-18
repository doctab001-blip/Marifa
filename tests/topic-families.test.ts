import { describe, expect, it } from "vitest";
import { collapseTopicFamilies, getFamilyCanonicalTopic, getFamilyTopics, getTopicFamily } from "@/lib/data/topic-families";
import type { DiseaseGuidelineSummary } from "@/lib/data/disease-guidelines";

function topic(id: string, title: string): DiseaseGuidelineSummary {
  return {
    id,
    title,
    specialty: "Respiratory Medicine",
    authority: "Other",
    status: "approved",
    version: "v1",
    lastReviewed: "2026-10-16",
    pillar: "Chronic Care",
    clinicalReviewStatus: "pending",
    summary: title,
  };
}

describe("topic families", () => {
  const copd = topic("copd", "Chronic Obstructive Pulmonary Disease");
  const exacerbation = topic("aecopd", "Acute Exacerbation of COPD");
  const supportive = topic("advanced", "Advanced COPD Supportive Care");

  it("replaces related COPD cards with its canonical parent", () => {
    expect(collapseTopicFamilies([exacerbation, supportive, copd])).toEqual([copd]);
  });

  it("keeps a specialist topic visible when its parent is absent", () => {
    expect(collapseTopicFamilies([exacerbation, supportive])).toEqual([exacerbation, supportive]);
  });

  it("retains the ordered member list for the consolidated topic page", () => {
    const family = getTopicFamily(copd.title);
    expect(family).toBeDefined();
    expect(getFamilyCanonicalTopic(family!, [copd, exacerbation, supportive])?.id).toBe("copd");
    expect(getFamilyTopics(family!, [copd, exacerbation, supportive]).map((item) => item.id)).toEqual(["copd", "aecopd", "advanced"]);
  });
});
