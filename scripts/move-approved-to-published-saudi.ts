/**
 * Moves every Saudi topic in the "Approved" tab back to "Published".
 *
 * The site lists a topic under Approved when the topic row AND its current
 * version are both status "approved". This reverses the Approve action in
 * place: both are set back to "published" and the version content's status
 * field follows. Clinical content is not touched. approved_by/approved_at are
 * kept (the table requires approved_by for published rows); published_at is
 * filled from approved_at if it was empty.
 *
 * A backup of every row it will change is written before anything is applied.
 *
 *   Dry run: npx tsx --env-file=.env.local scripts/move-approved-to-published-saudi.ts
 *   Apply:   npx tsx --env-file=.env.local scripts/move-approved-to-published-saudi.ts --apply
 */
import fs from "node:fs";

const apply = process.argv.includes("--apply");
if ((process.env.NEXT_PUBLIC_MARIFA_REGION ?? "").toUpperCase() !== "SA") throw new Error("Refusing: NEXT_PUBLIC_MARIFA_REGION is not SA. Use --env-file=.env.local.");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");

async function rest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${url}/rest/v1/${path}`, { method, headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) throw new Error(`${method} ${path.split("?")[0]} -> ${response.status} ${(await response.text()).slice(0, 300)}`);
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

type Guideline = { id: string; title: string; status: string; source_type: string | null };
type Version = { id: string; guideline_id: string; version: string; status: string; is_current: boolean; content: Record<string, unknown>; approved_at: string | null; published_at: string | null };

console.log(`${apply ? "APPLY" : "DRY RUN"} — ${new URL(url).host}`);
const guidelines = await rest<Guideline[]>("GET", "clinical_guidelines?select=id,title,status,source_type&status=eq.approved&order=title&limit=10000");
console.log(`${guidelines.length} topics with status approved`);
if (!guidelines.length) process.exit(0);

const currents: Version[] = [];
for (let i = 0; i < guidelines.length; i += 100) {
  const ids = guidelines.slice(i, i + 100).map((g) => g.id).join(",");
  currents.push(...await rest<Version[]>("GET", `guideline_versions?select=id,guideline_id,version,status,is_current,content,approved_at,published_at&is_current=eq.true&guideline_id=in.(${ids})`));
}

const plan: Array<{ g: Guideline; v: Version | undefined; action: "move" | "topic-only" | "skip"; why?: string }> = guidelines.map((g) => {
  const vs = currents.filter((v) => v.guideline_id === g.id);
  if (vs.length !== 1) return { g, v: vs[0], action: "skip", why: `${vs.length} current versions` };
  const v = vs[0];
  if (v.status === "approved") return { g, v, action: "move" };
  if (v.status === "published") return { g, v, action: "topic-only" };
  return { g, v, action: "skip", why: `current version is ${v.status}` };
});

for (const p of plan) console.log(`${p.action === "skip" ? "SKIP " : "MOVE "} ${p.g.id.slice(0, 8)}  ${p.g.title}  [${p.v?.version ?? "-"}]${p.why ? `  (${p.why})` : p.action === "topic-only" ? "  (version already published)" : ""}`);
const todo = plan.filter((p) => p.action !== "skip");
console.log(`\n${todo.length} to move, ${plan.length - todo.length} skipped`);

if (!apply) { console.log("Dry run only. Re-run with --apply to make the change."); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
fs.mkdirSync(".claude-tmp/backups", { recursive: true });
const backupPath = `.claude-tmp/backups/approved-to-published-${stamp}.json`;
fs.writeFileSync(backupPath, JSON.stringify(todo.map((p) => ({ guideline: p.g, version: p.v })), null, 1));
console.log(`Backup written: ${backupPath}`);

let done = 0;
for (const p of todo) {
  try {
    if (p.action === "move" && p.v) {
      const v = p.v;
      await rest("PATCH", `guideline_versions?id=eq.${v.id}&status=eq.approved&is_current=eq.true`, {
        status: "published",
        published_at: v.published_at ?? v.approved_at ?? new Date().toISOString(),
        content: { ...v.content, status: "published" },
      });
    }
    await rest("PATCH", `clinical_guidelines?id=eq.${p.g.id}&status=eq.approved`, { status: "published" });
    done++;
    console.log(`DONE  ${p.g.id.slice(0, 8)}  ${p.g.title}`);
  } catch (error) {
    console.log(`FAIL  ${p.g.id.slice(0, 8)}  ${p.g.title}: ${(error as Error).message}`);
  }
}
console.log(`\n${done} of ${todo.length} moved to Published.`);
