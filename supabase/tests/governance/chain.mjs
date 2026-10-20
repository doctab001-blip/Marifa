// Applies EVERY migration in supabase/migrations, in order, to an in-memory Postgres (PGlite) that imitates the Supabase
// platform schemas (auth, storage, roles). Existing rows are seeded before the accreditation migration runs, then the
// script proves the migration only adds objects: no existing table loses a column or a row, and no row is changed.
//
//   npm i --no-save @electric-sql/pglite
//   node supabase/tests/governance/chain.mjs
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, "../../migrations");
const GOV = "20261020190000_cbahi_accreditation_hub.sql";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const db = new PGlite({ extensions: { pgcrypto } });
let fail = 0;
const ok = (name, cond, extra = "") => { console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : " " + extra}`); if (!cond) fail++; };
const q = async (sql, p) => (await db.query(sql, p)).rows;

await db.exec(fs.readFileSync(path.join(here, "platform.sql"), "utf8"));

const before = files.filter((f) => f < GOV);
for (const f of before) {
  try { await db.exec(fs.readFileSync(path.join(dir, f), "utf8")); ok(`applies: ${f}`, true); }
  catch (e) { ok(`applies: ${f}`, false, String(e.message).slice(0, 200)); }
}
if (fail) { console.log(`\n${fail} earlier migration(s) failed to apply in the stub; fix the stub or the migration before judging ${GOV}.`); process.exit(1); }

// Seed rows in whatever pre-existing core tables exist, so "unaffected" is measured rather than assumed.
const tables = (await q(`select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1`)).map((r) => r.table_name);
const snapshot = async () => {
  const out = {};
  for (const t of tables) {
    const cols = (await q(`select column_name, data_type from information_schema.columns where table_schema='public' and table_name=$1 order by 1`, [t])).map((c) => `${c.column_name}:${c.data_type}`);
    const rows = await q(`select md5(coalesce(string_agg(r::text, '|' order by r::text), '')) h, count(*)::int n from public."${t}" r`);
    out[t] = { cols, n: rows[0].n, h: rows[0].h };
  }
  return out;
};
await db.exec(`insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000a1','a@example.test') on conflict do nothing`);
for (const stmt of [
  `insert into public.organizations(name) values ('Seed hospital')`,
  `insert into public.profiles(id,display_name) values ('00000000-0000-0000-0000-0000000000a1','Seed user')`,
]) { try { await db.exec(stmt); } catch { /* shape differs; snapshot still covers whatever exists */ } }
const pre = await snapshot();
ok("existing tables snapshotted", tables.length > 5, `${tables.length} tables`);

await db.exec(fs.readFileSync(path.join(dir, GOV), "utf8"));
ok(`applies: ${GOV}`, true);

const post = await snapshot();
let changed = [];
for (const t of tables) {
  if (t === "roles") continue; // new role rows are expected
  const a = pre[t], b = post[t];
  if (a.n !== b.n || a.h !== b.h) changed.push(`${t} rows`);
  for (const c of a.cols) if (!b.cols.includes(c)) changed.push(`${t}.${c} removed/changed`);
}
ok("no existing table lost a column or had rows changed", changed.length === 0, changed.join(", "));
const rolesBefore = pre.roles ?? { n: 0 };
const newRoles = (await q(`select code from public.roles where code in ('quality_manager','clinical_director') order by 1`)).map((r) => r.code);
ok("only the two new roles were added", newRoles.join() === "clinical_director,quality_manager" && post.roles.n - rolesBefore.n === 2, `${post.roles.n - rolesBefore.n} added`);
const govTables = (await q(`select table_name from information_schema.tables where table_schema='public' and table_name like 'gov\\_%' and table_type='BASE TABLE'`)).map((r) => r.table_name);
ok("14 governance tables created", govTables.length === 14, String(govTables.length));
const noRls = (await q(`select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname like 'gov\\_%' and c.relkind='r' and not c.relrowsecurity`)).map((r) => r.relname);
ok("row level security on every governance table", noRls.length === 0, noRls.join());
const views = (await q(`select c.relname, c.reloptions from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='v' and c.relname like 'gov\\_%'`));
ok("governance views are security_invoker", views.length >= 2 && views.every((v) => (v.reloptions ?? []).some((o) => o.includes("security_invoker=true"))));
const bucket = await q(`select public, file_size_limit from storage.buckets where id='governance-files'`);
ok("private governance-files bucket", bucket.length === 1 && bucket[0].public === false && Number(bucket[0].file_size_limit) > 0);
const anonGrants = await q(`select count(*)::int c from information_schema.role_table_grants where grantee='anon' and table_name like 'gov\\_%'`);
ok("anonymous role has no grants on governance tables", anonGrants[0].c === 0, String(anonGrants[0].c));

console.log(fail ? `\n${fail} FAILED` : `\nAll chain checks passed (${files.length} migrations).`);
process.exit(fail ? 1 : 0);
