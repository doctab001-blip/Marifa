import type { CountryCode } from "@/types/clinical";

/**
 * Marifa India topics. They are shown ONLY when the India region is selected; the Saudi (and UK) view never
 * lists or opens them, so Saudi topics stay exactly as published under the Saudi standard.
 *
 * The value lists the Saudi/international topic IDs that this India topic replaces in the India view
 * (an India adaptation of an existing topic). An empty list means a new India-only topic.
 */
export const INDIA_TOPICS: Readonly<Record<string, readonly string[]>> = {
  // India regional module, batch 08
  "3f6c2a91-7d4e-4b8a-9c15-e2a7b04d6f13": [], // Enteric fever (India)
  "8b1e5d07-2c9f-4a63-b7e4-51d0c8a9f2e6": [], // Malaria (India)
  "c4a9f3e2-6b18-4d75-8e2a-9f7b13c05d48": [], // Pulmonary tuberculosis (India)
  "5e2d8b4f-a173-4c96-9d08-3b6e7f1a2c95": [], // Scrub typhus (India)
  // India module batch 1 (toxicology and bites), batch 09
  "3a176976-1923-4ce0-9514-ebec094db189": [], // Snakebite (India)
  "4c8b1959-b2a1-4d6b-9dbd-a36d97dae335": [], // Rabies post-exposure prophylaxis (India)
  "5b9bff76-d967-4510-b8f9-96a3a69789de": [], // Scorpion sting (India)
  "a0f31154-5cd6-4a93-9754-997975f77089": [], // Organophosphate poisoning (India)
  "e53b2070-82ba-4941-baa5-9faa430bbc7f": [], // Aluminium phosphide poisoning (India)
  "c93d0d1a-daf3-4395-81ea-90b5e1bdc718": [], // Methanol poisoning (India)
};

/** Indian national authorities; a topic issued under them is an India topic even if not yet listed above. */
const INDIA_AUTHORITIES = new Set(["ICMR", "MoHFW"]);

/**
 * Owner rule (22 Oct 2026): Marifa Saudi and Marifa India are separate platforms. Saudi guidelines must never
 * appear on the India platform and vice versa, so the India view shows India topics only.
 */
export const INDIA_VIEW_SHOWS_UNADAPTED_TOPICS = false;

const replacedInIndia: ReadonlyMap<string, string> = new Map(
  Object.entries(INDIA_TOPICS).flatMap(([indiaId, replaced]) => replaced.map((saudiId) => [saudiId, indiaId] as const)),
);

type RegionalTopic = { id: string; authority?: string; title?: string };

/** The country a topic belongs to: India for Marifa India topics, otherwise the Saudi (default) catalogue. */
export function topicCountry(topic: RegionalTopic): CountryCode {
  if (Object.hasOwn(INDIA_TOPICS, topic.id)) return "IN";
  if (topic.authority && INDIA_AUTHORITIES.has(topic.authority)) return "IN";
  if (topic.title && /\(India\)\s*$/.test(topic.title)) return "IN";
  return "SA";
}

/** The India topic that replaces this Saudi/international topic in the India view, if any. */
export function indiaReplacementFor(id: string): string | undefined {
  return replacedInIndia.get(id);
}

/** Whether a topic may be listed or opened in the given region. */
export function isTopicVisibleInRegion(topic: RegionalTopic, region: CountryCode): boolean {
  const country = topicCountry(topic);
  if (region === "IN") {
    if (country === "IN") return true;
    return INDIA_VIEW_SHOWS_UNADAPTED_TOPICS && !replacedInIndia.has(topic.id);
  }
  return country !== "IN";
}
