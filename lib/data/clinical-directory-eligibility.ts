/**
 * Topics allowed in the published Disease Management directory.
 *
 * This is an explicit release boundary derived from the 12 October 2026
 * authoring-standard audit. A topic must score at least 80% and retain the
 * audited version before it can be added here. Draft and historical rows stay
 * in Supabase; this list changes presentation only.
 */
export const CLINICAL_DIRECTORY_MINIMUM_SCORE = 80;
export const CLINICAL_DIRECTORY_DRAFT_TOPIC_COUNT = 45;

export const clinicalDirectoryEligibility = {
  "a1010000-0000-4000-8000-000000000005": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e104": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "83aa7315-9778-4b3a-93a8-edcac20d7c58": { score: 91, version: "emergency-2026-10-12-v1-live" },
  "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e103": { score: 88, version: "emergency-2026-10-12-v3-live" },
  "a14c7e92-5b31-4d68-9f20-6c83e1b7a405": { score: 88, version: "emergency-2026-10-12-v1-live" },
  "05481a2b-c95c-440a-a4d0-0c520e8129a4": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "336de333-f235-46c4-aa57-2ea4a6e017d5": { score: 88, version: "emergency-2026-10-12-v1-live" },
  "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e105": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "cb0f8932-f4c5-4a6a-9d44-d320713a366b": { score: 84, version: "emergency-2026-10-12-v2-live" },
  "bb3cbef9-52b1-41f8-b2ee-17078b3a2d5d": { score: 88, version: "emergency-2026-10-12-v1-live" },
  "b2e88f9f-f504-436b-b521-b20ae8767b15": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e101": { score: 88, version: "emergency-2026-10-12-v1-live" },
  "a1010000-0000-4000-8000-000000000001": { score: 88, version: "emergency-2026-10-12-v1-live" },
  "6fccc942-c6f3-4ef7-94cf-26fd23edfd27": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "a1010000-0000-4000-8000-000000000004": { score: 81, version: "emergency-2026-10-12-v1-live" },
  "a1010000-0000-4000-8000-000000000003": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "625f0d83-3863-47f9-a64e-55c0355f3240": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "c21a33c2-d701-4435-8ba7-e8f75db067fa": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "b3a433fb-5f23-4e19-a23f-97de51d4ef11": { score: 88, version: "emergency-2026-10-12-v1-live" },
  "1759a9d1-015f-40c7-8a11-e8e54f52991d": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "c52eac83-6f42-4d81-b132-40d59fa4544b": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "db633270-3fb9-4b9e-97bb-4a54376ad9ab": { score: 88, version: "emergency-2026-10-12-v1-live" },
  "26995ba0-e325-44a3-a579-c02e7656b14d": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "a1010000-0000-4000-8000-000000000002": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e102": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "8091cd18-2256-40b7-8c6d-7557ac5e2fdf": { score: 84, version: "emergency-2026-10-12-v1-live" },
  "cbd9f91f-e176-4601-9bf4-b4f2f7e96deb": { score: 88, version: "emergency-2026-10-12-v1-live" },
  // Chronic Care / GDM rewrites published 12 Oct 2026 (clinical review pending); audited with scripts/audit-clinical-authoring-standard.ts.
  "e58a1236-9f75-4ca4-a398-0e27b5c1f849": { score: 91, version: "emergency-2026-10-12-v1-live" },
  "35d6fe28-9862-4850-a9ea-7f1d24306001": { score: 91, version: "emergency-2026-10-12-v1-live" },
  "ce9316d7-2fe5-415d-a633-b0ebb79a4693": { score: 88, version: "emergency-2026-10-12-v1-live" },
  "e5bf7644-f824-4eca-8828-aacf30dad973": { score: 88, version: "emergency-2026-10-12-v1-live" },
  "06bb691f-eef3-4b1f-a0fc-29b94afd9254": { score: 91, version: "emergency-2026-10-12-v1-live" },
  "65fce08b-a289-44bd-9c91-79b2243f824c": { score: 91, version: "emergency-2026-10-12-v1-live" },
  "2a6b90b6-13a1-443f-a212-1c2f3975327d": { score: 91, version: "emergency-2026-10-12-v1-live" },
  "c1e45d3f-fa28-49f1-ab69-3ee4ab9cac6f": { score: 91, version: "emergency-2026-10-12-v1-live" },
  "3f198bb7-8829-4e91-b35c-e46ad1e07eb5": { score: 84, version: "emergency-2026-10-12-v1-live" },
} as const;

export function isClinicalDirectoryEligible(id: string, version?: string) {
  const record = clinicalDirectoryEligibility[id as keyof typeof clinicalDirectoryEligibility];
  return Boolean(record && record.score >= CLINICAL_DIRECTORY_MINIMUM_SCORE && (!version || record.version === version));
}
