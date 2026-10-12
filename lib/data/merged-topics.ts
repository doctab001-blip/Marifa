/**
 * Duplicate catalogue topics merged into one canonical topic (12 Oct 2026).
 * The duplicate rows and their full version history stay in the database untouched;
 * they are only hidden from the public directory and redirected to the canonical page.
 * Key = duplicate guideline id, value = canonical guideline id.
 */
export const mergedTopics: Readonly<Record<string, string>> = {
  // Acute Coronary Syndrome Assessment and Escalation Pathway → Acute Coronary Syndrome
  "a14c7e92-5b31-4d68-9f20-6c83e1b7a405": "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e103",
  // Acute Severe Asthma Exacerbation (Adult) [draft] → Acute Severe Asthma Exacerbation
  "a1010000-0000-4000-8000-000000000001": "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e101",
  // Sepsis [draft] → Sepsis and Septic Shock
  "a1010000-0000-4000-8000-000000000002": "c2c404f2-5f47-4e4d-9ce7-fb32a9c1e102",
  // Type 2 Diabetes Mellitus Longitudinal Care Pathway → Type 2 Diabetes Mellitus Longitudinal Care
  "b25d8f03-6c42-4e79-a130-7d94f2c8b516": "3f198bb7-8829-4e91-b35c-e46ad1e07eb5",
};

export function canonicalTopicId(id: string): string | undefined {
  return Object.hasOwn(mergedTopics, id) ? mergedTopics[id] : undefined;
}
