import { describe, expect, it } from "vitest";
import { extractMedicationBadges, formatMedicationBadge, lintManagementSequence, splitMedicationBadges, stripMedicationBadges } from "@/lib/management-sequence-format";

const FUROSEMIDE = "[💊 Furosemide | 40 mg | IV | Stat | Single dose]";

describe("management sequence badges", () => {
  it("parses the example badge from the format rule", () => {
    const text = `Check emergency referral criteria and administer ${FUROSEMIDE} to decongest.`;
    expect(extractMedicationBadges(text)).toEqual([{ drug: "Furosemide", dose: "40 mg", route: "IV", frequency: "Stat", duration: "Single dose" }]);
    expect(splitMedicationBadges(text).map((s) => s.kind)).toEqual(["text", "badge", "text"]);
    expect(stripMedicationBadges(text)).not.toContain("Furosemide");
  });

  it("formats a badge and refuses an empty field", () => {
    expect(formatMedicationBadge({ drug: "Furosemide", dose: "40 mg", route: "IV", frequency: "Stat", duration: "Single dose" })).toBe(FUROSEMIDE);
    expect(() => formatMedicationBadge({ drug: "Furosemide", dose: "", route: "IV", frequency: "Stat", duration: "Single dose" })).toThrow();
  });

  it("flags a drug written outside a badge and malformed badges", () => {
    const steps = [{ id: "a", title: "Treat", timeframe: "Now", actions: ["Give furosemide 40 mg IV.", "Give [💊 Aspirin | 300 mg | PO | Stat]."] }];
    const issues = lintManagementSequence(steps, { acute: false });
    expect(issues.filter((i) => i.rule === "drug-outside-badge")).toHaveLength(1);
    expect(issues.filter((i) => i.rule === "badge")).toHaveLength(1);
  });

  it("requires an ABCDE first step for acute topics", () => {
    const bad = [{ id: "a", title: "Assess", timeframe: "Now", actions: ["Check the patient.", "Call for help."] }];
    expect(lintManagementSequence(bad, { acute: true }).some((i) => i.rule === "abcde")).toBe(true);
    const good = [{
      id: "abcde", title: "ABCDE survey with concurrent correction", timeframe: "Immediately",
      actions: ["Correct each abnormality concurrently as it is found.", "Airway: open it.", "Breathing: count the rate.", "Circulation: check pulse.", "Disability: AVPU and glucose.", "Exposure: expose and cover."],
    }];
    expect(lintManagementSequence(good, { acute: true })).toEqual([]);
  });

  it("flags side-effect and dose-adjustment wording", () => {
    const steps = [{ id: "a", title: "Treat", timeframe: "Now", actions: ["Reduce the dose in CKD."] }];
    expect(lintManagementSequence(steps, { acute: false }).some((i) => i.rule === "exclusion")).toBe(true);
  });
});
