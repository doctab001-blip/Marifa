import type { CountryCode, GlobalDiseaseTopic, RegionalProfile } from "@/types/clinical";

/** Cookie that remembers the clinician's last chosen region across the app. */
export const REGION_COOKIE = "marifa.region";
/** URL query parameter that selects a region (`?region=IN`); it wins over the cookie. */
export const REGION_PARAM = "region";
/** Browser event fired after the practice region changes, so client lists can reload for the new region. */
export const REGION_CHANGE_EVENT = "marifa:region-change";
export const DEFAULT_REGION: CountryCode = "SA";

export type RegionOption = {
  code: CountryCode;
  flag: string;
  name: string;
  authority: string;
  /** Region theme colour name (see app/region-theme.css). */
  accent: string;
};

/** Selectable platforms. UK profiles remain in the data but are not offered. */
export const REGIONS: readonly RegionOption[] = [
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia", authority: "SFDA/MOH", accent: "Emerald" },
  { code: "IN", flag: "🇮🇳", name: "India", authority: "ICMR/MoHFW", accent: "Indigo" },
] as const;

export function parseRegion(value: unknown): CountryCode | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return null;
  const code = raw.trim().toUpperCase();
  return REGIONS.some((region) => region.code === code) ? (code as CountryCode) : null;
}

/** Query parameter first, then the remembered cookie, then Saudi Arabia. */
export function resolveRegion(query?: unknown, cookie?: unknown): CountryCode {
  return parseRegion(query) ?? parseRegion(cookie) ?? DEFAULT_REGION;
}

export function getRegionOption(code: CountryCode): RegionOption {
  return REGIONS.find((region) => region.code === code) ?? REGIONS[0];
}

/** The profile for the active region, or null — never another country's formulary as a stand-in. */
export function getRegionalProfile(topic: GlobalDiseaseTopic, code: CountryCode): RegionalProfile | null {
  return topic.regionalProfiles.find((profile) => profile.countryCode === code) ?? null;
}
