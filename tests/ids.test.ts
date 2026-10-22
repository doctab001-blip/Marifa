import { describe, expect, it } from "vitest";
import { isUuid } from "@/lib/ids";

describe("isUuid", () => {
  it("accepts random v4 IDs", () => {
    expect(isUuid("47fa6fe8-ca9f-4662-8a6b-f940adc41547")).toBe(true);
  });

  it("accepts deterministic v5 IDs used by regional topics", () => {
    expect(isUuid("ed976070-42c4-5258-904b-aa1f05e7ac77")).toBe(true);
    expect(isUuid("3b8706bd-e146-5a99-a3b8-74b997108793")).toBe(true);
  });

  it("rejects malformed values", () => {
    expect(isUuid("")).toBe(false);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("ed976070-42c4-0258-904b-aa1f05e7ac77")).toBe(false);
    expect(isUuid("ed976070-42c4-5258-c04b-aa1f05e7ac77")).toBe(false);
    expect(isUuid("ed976070-42c4-5258-904b-aa1f05e7ac77; drop")).toBe(false);
    expect(isUuid(null)).toBe(false);
  });
});
