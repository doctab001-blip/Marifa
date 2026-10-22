/**
 * Deletes the six empty India toxicology placeholder topics that duplicate the completed batch-09 topics
 * (snakebite, scorpion sting, rabies, organophosphate, aluminium phosphide, methanol).
 * Safety: refuses a topic if ANY version was ever published/approved or contains authored content.
 * Dry run by default; deletion is permanent with --apply.
 *
 * Usage: npx tsx --env-file=.env.local scripts/remove-india-placeholder-duplicates.ts [--apply]
 */
const DUPLICATES: Record<string, string> = {
  "5d74f440-250f-5398-a92a-53df70066353": "Snakebite envenomation (India) — kept: 3a176976-1923-4ce0-9514-ebec094db189",
  "f96763bc-ce4d-59d4-b14a-89d56c46ac2d": "Scorpion sting envenomation (India) — kept: 5b9bff76-d967-4510-b8f9-96a3a69789de",
  "b475b774-b507-5bf5-b191-4b6703300f28": "Rabies post-exposure prophylaxis (India) — kept: 4c8b1959-b2a1-4d6b-9dbd-a36d97dae335",
  "08dc5e46-7891-5f1c-b53d-8bf986df3c96": "Organophosphate and carbamate poisoning (India) — kept: a0f31154-5cd6-4a93-9754-997975f77089",
  "f0c41eef-4716-595d-addd-946c922aad9d": "Aluminium phosphide poisoning (India) — kept: e53b2070-82ba-4941-baa5-9faa430bbc7f",
  "cebfeba0-6b35-54fd-91fa-916c429253a0": "Methanol poisoning (India) — kept: c93d0d1a-daf3-4395-81ea-90b5e1bdc718",
};
const apply = process.argv.includes("--apply");
const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`;
const key = process.env.SUPABASE_SECRET_KEY;
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
async function rest<T>(method: string, path: string): Promise<T> {
  const response = await fetch(base + path, { method, headers: { apikey: key!, Authorization: `Bearer ${key}`, Prefer: "return=representation" } });
  if (!response.ok) throw new Error(`${method} ${path.split("?")[0]} -> ${response.status} ${(await response.text()).slice(0, 300)}`);
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}
const PLACEHOLDER = /Content not yet authored/i;
type Version = { id: string; version: string; status: string; content: { pathophysiology?: unknown } };

for (const [id, label] of Object.entries(DUPLICATES)) {
  const guidelines = await rest<Array<{ id: string; title: string }>>("GET", `clinical_guidelines?select=id,title&id=eq.${id}`);
  if (!guidelines.length) { console.log(`ABSENT ${label}`); continue; }
  const versions = await rest<Version[]>("GET", `guideline_versions?select=id,version,status,content&guideline_id=eq.${id}`);
  const unsafe = versions.filter((row) => ["published", "approved"].includes(row.status) || !PLACEHOLDER.test(JSON.stringify(row.content?.pathophysiology ?? "")));
  if (unsafe.length) { console.log(`REFUSED ${label}: has non-placeholder or published version(s) ${unsafe.map((row) => `${row.version}/${row.status}`).join(", ")}`); continue; }
  if (!apply) { console.log(`WOULD DELETE ${label}: catalogue row "${guidelines[0].title}" and ${versions.length} placeholder version(s)`); continue; }
  await rest("DELETE", `guideline_versions?guideline_id=eq.${id}`);
  await rest("DELETE", `clinical_guidelines?id=eq.${id}`);
  console.log(`DELETED ${label}`);
}
console.log(apply ? "Done." : "DRY RUN — nothing deleted. Rerun with --apply to delete.");

export {};
