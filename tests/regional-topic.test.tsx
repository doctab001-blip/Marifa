import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RegionalTopicView } from "@/components/clinical/RegionalTopicView";
import { getGlobalDiseaseTopic, globalDiseaseTopicSchema } from "@/lib/data/global-topics";
import { getRegionalProfile, parseRegion, resolveRegion } from "@/lib/region";
import seed from "@/data/global-topics/enteric-fever.json";

function loadTopic() {
  const result = getGlobalDiseaseTopic("a1b2c3d4-enteric-fever");
  if (result.state !== "ready") throw new Error(`Seed did not load: ${result.state}`);
  return result.topic;
}

describe("region resolution", () => {
  it("prefers the URL parameter, then the cookie, then Saudi Arabia", () => {
    expect(resolveRegion("IN", "SA")).toBe("IN");
    expect(resolveRegion(undefined, "in")).toBe("IN");
    expect(resolveRegion("UK", undefined)).toBe("SA");
    expect(resolveRegion("XX", "nope")).toBe("SA");
    expect(parseRegion(["in"])).toBe("IN");
  });
});

describe("multi-region schema", () => {
  it("validates the enteric fever seed unchanged", () => {
    expect(globalDiseaseTopicSchema.parse(seed)).toEqual(seed);
  });

  it("never falls back to another country's profile", () => {
    expect(getRegionalProfile(loadTopic(), "UK")).toBeNull();
  });

  it("rejects duplicate country profiles", () => {
    const duplicate = { ...seed, regionalProfiles: [seed.regionalProfiles[0], seed.regionalProfiles[0]] };
    expect(globalDiseaseTopicSchema.safeParse(duplicate).success).toBe(false);
  });
});

describe("RegionalTopicView", () => {
  it("India: ICMR badge, azithromycin, rose stewardship and gold duration guardrails", () => {
    render(<RegionalTopicView topic={loadTopic()} region="IN" />);
    expect(screen.getByTestId("consensus-badge")).toHaveTextContent("ICMR / MoHFW National Treatment Guidelines");
    expect(screen.getByRole("heading", { name: "Azithromycin" })).toBeInTheDocument();
    expect(screen.queryByText("Ceftriaxone")).not.toBeInTheDocument();
    const guardrails = screen.getByLabelText("Antimicrobial stewardship guardrails for Azithromycin");
    const notes = within(guardrails).getAllByRole("note");
    expect(notes[0]).toHaveTextContent("WHO AWaRe 'Watch' Group");
    expect(notes[0].className).toContain("bg-rose-50");
    expect(notes[1]).toHaveTextContent("Limit to 7 days maximum.");
    expect(notes[1].className).toContain("bg-amber-50");
    expect(screen.getByText("WHO AMR Stewardship Guidelines")).toBeInTheDocument();
  });

  it("Saudi Arabia: MOH badge, ceftriaxone, duration guardrail only", () => {
    render(<RegionalTopicView topic={loadTopic()} region="SA" />);
    expect(screen.getByTestId("consensus-badge")).toHaveTextContent("MOH KSA Standard Practice");
    expect(screen.getByText("Rocephin")).toBeInTheDocument();
    const notes = within(screen.getByLabelText("Antimicrobial stewardship guardrails for Ceftriaxone")).getAllByRole("note");
    expect(notes).toHaveLength(1);
    expect(notes[0]).toHaveTextContent("Step down to oral therapy once sensitivity known.");
    expect(screen.getByText("None recorded for this region.")).toBeInTheDocument();
  });
});
