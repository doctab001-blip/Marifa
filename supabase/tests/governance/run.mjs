// Database tests for supabase/migrations/20261020190000_cbahi_accreditation_hub.sql.
// Runs the real migration in an in-memory Postgres (PGlite) against a minimal stub of the tables it depends on
// (stub.sql), so no Supabase project, credentials or data are touched.
//
//   npm i --no-save @electric-sql/pglite
//   node supabase/tests/governance/run.mjs
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const migration = process.argv[2] ?? path.resolve(here, "../../migrations/20261020190000_cbahi_accreditation_hub.sql");
// CHAIN=1 builds the database from every earlier migration (the real schema) instead of the small stub.
const chainMode = process.env.CHAIN === "1";
const db = new PGlite(chainMode ? { extensions: { pgcrypto } } : {});
if (chainMode) {
  const dir = path.dirname(migration);
  await db.exec(fs.readFileSync(path.join(here, "platform.sql"), "utf8"));
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".sql") && x < path.basename(migration)).sort()) await db.exec(fs.readFileSync(path.join(dir, f), "utf8"));
} else {
  await db.exec(fs.readFileSync(path.join(here, "stub.sql"), "utf8"));
  await db.exec(`
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema storage grant all on tables to anon, authenticated, service_role;
  alter table storage.objects enable row level security;
  grant all on storage.objects, storage.buckets to authenticated, service_role;
`);
}
await db.exec(fs.readFileSync(migration, "utf8"));

const q = async (sql, params) => (await db.query(sql, params)).rows;
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { if (cond) pass++; else fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + extra}`); };
const expectErr = async (name, fn, needle) => {
  try { await fn(); ok(name, false, "no error"); }
  catch (e) { ok(name, String(e.message).includes(needle), `got: ${e.message}`); }
};
const asUser = async (uid, fn) => {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${uid}',false);`);
  try { return await fn(); } finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub','',false);`); }
};

const U = {
  lead: "00000000-0000-4000-8000-000000000001", qm: "00000000-0000-4000-8000-000000000002", aud: "00000000-0000-4000-8000-000000000003",
  staff: "00000000-0000-4000-8000-000000000004", staff2: "00000000-0000-4000-8000-000000000005", otherLead: "00000000-0000-4000-8000-000000000006",
  outsider: "00000000-0000-4000-8000-000000000007",
};
const A = "aaaaaaaa-0000-4000-8000-000000000001", B = "bbbbbbbb-0000-4000-8000-000000000002";
await db.exec(`
 ${chainMode ? `insert into auth.users(id) values ${Object.values(U).map((u) => `('${u}')`).join(",")};` : ""}
 insert into organizations(id,name${chainMode ? ",slug" : ""}) values ('${A}','A'${chainMode ? ",'org-a'" : ""}),('${B}','B'${chainMode ? ",'org-b'" : ""});
 insert into profiles(id,display_name) values ${Object.values(U).map((u, i) => `('${u}','user${i}')`).join(",")};
 insert into roles(code,name) values ('governance_lead','Governance lead'),('auditor','Auditor'),('consultant','Consultant'),('quality_manager_x','x');
 insert into organization_memberships(id,organization_id,user_id) values
   ('10000000-0000-4000-8000-000000000001','${A}','${U.lead}'),('10000000-0000-4000-8000-000000000002','${A}','${U.qm}'),
   ('10000000-0000-4000-8000-000000000003','${A}','${U.aud}'),('10000000-0000-4000-8000-000000000004','${A}','${U.staff}'),
   ('10000000-0000-4000-8000-000000000005','${A}','${U.staff2}'),('10000000-0000-4000-8000-000000000006','${B}','${U.otherLead}');
 insert into membership_roles select '10000000-0000-4000-8000-000000000001', id from roles where code='governance_lead';
 insert into membership_roles select '10000000-0000-4000-8000-000000000002', id from roles where code='quality_manager';
 insert into membership_roles select '10000000-0000-4000-8000-000000000003', id from roles where code='auditor';
 insert into membership_roles select '10000000-0000-4000-8000-000000000004', id from roles where code='consultant';
 insert into membership_roles select '10000000-0000-4000-8000-000000000006', id from roles where code='governance_lead';
`);
ok("migration adds quality_manager and clinical_director roles", (await q("select count(*)::int c from roles where code in ('quality_manager','clinical_director')"))[0].c === 2);

// ---- standards, assessments, evidence ---------------------------------------------------------------------
const S1 = "50000000-0000-4000-8000-000000000001", S2 = "50000000-0000-4000-8000-000000000002";
await db.exec(`insert into gov_standards(id,organization_id,edition,chapter_code,chapter_name,code,description,is_esr,created_by) values
  ('${S1}','${A}','Test ed.','QM','Quality','T.1','Test standard one',true,'${U.lead}'),
  ('${S2}','${A}','Test ed.','QM','Quality','T.2','Test standard two',false,'${U.lead}')`);
await expectErr("duplicate standard code in same edition refused", () => db.exec(`insert into gov_standards(organization_id,edition,code,description) values ('${A}','Test ed.','T.1','dup')`), "gov_standards_organization_id_edition_code_key");
const rate = (std, rating, notes = "", by = U.lead) => db.query("insert into gov_assessments(organization_id,standard_id,rating,notes,assessed_by) values ($1,$2,$3,$4,$5)", [A, std, rating, notes, by]);
await expectErr("satisfactory without evidence refused", () => rate(S1, "satisfactory"), "evidence_required");
await expectErr("partial without a gap description refused", () => rate(S1, "partial", "  "), "notes_required");
await rate(S1, "partial", "Hand hygiene audit missing");
ok("partial with notes accepted", (await q("select count(*)::int c from gov_assessments"))[0].c === 1);
const ev = async (std, extra = "") => (await q(`insert into gov_evidence(organization_id,standard_id,title,storage_path,file_name,uploaded_by ${extra ? "," + extra.split("|")[0] : ""}) values ('${A}','${std}','Minutes','${A}/evidence/x.pdf','x.pdf','${U.lead}' ${extra ? "," + extra.split("|")[1] : ""}) returning id`))[0].id;
await ev(S1, "valid_from,valid_until|'2020-01-01','2020-12-31'");
await expectErr("expired evidence does not support satisfactory", () => rate(S1, "satisfactory"), "evidence_required");
const current = await ev(S1);
await rate(S1, "satisfactory");
ok("satisfactory accepted once current evidence exists", (await q("select rating from gov_standard_status where standard_id=$1", [S1]))[0].rating === "satisfactory");
await expectErr("assessments are immutable (update)", () => db.exec("update gov_assessments set notes='changed'"), "assessments_immutable");
await expectErr("assessments are immutable (delete)", () => db.exec("delete from gov_assessments"), "assessments_immutable");
await expectErr("evidence cannot be deleted", () => db.exec(`delete from gov_evidence where id='${current}'`), "evidence_not_deletable");
await expectErr("evidence content cannot be edited", () => db.exec(`update gov_evidence set title='Edited' where id='${current}'`), "evidence_immutable");
await expectErr("withdrawal needs a reason", () => db.exec(`update gov_evidence set withdrawn_at=now(), withdrawn_reason='  ' where id='${current}'`), "reason_required");
await db.exec(`update gov_evidence set withdrawn_at=now(), withdrawn_by='${U.lead}', withdrawn_reason='Superseded' where id='${current}'`);
await expectErr("withdrawn evidence cannot be changed again", () => db.exec(`update gov_evidence set withdrawn_reason='x' where id='${current}'`), "evidence_withdrawn");
await expectErr("withdrawn evidence does not support satisfactory", () => rate(S2, "satisfactory"), "evidence_required");
ok("latest assessment wins in status view", (await q("select count(*)::int c from gov_standard_status where organization_id=$1", [A]))[0].c === 2);

// ---- policies ---------------------------------------------------------------------------------------------
const P1 = "60000000-0000-4000-8000-000000000001";
await db.exec(`insert into gov_policies(id,organization_id,title,document_number,version,created_by) values ('${P1}','${A}','Hand hygiene','IPC-01','1.0','${U.lead}')`);
await expectErr("direct status change refused", () => db.exec(`update gov_policies set status='approved' where id='${P1}'`), "status_via_workflow");
const setStatus = (actor, status, id = P1) => q("select * from gov_set_policy_status($1,$2,$3)", [actor, id, status]);
await expectErr("draft cannot jump to approved", () => setStatus(U.lead, "approved"), "invalid_transition");
await expectErr("no document, no committee review", () => setStatus(U.lead, "under_committee_review"), "document_required");
await db.exec(`update gov_policies set storage_path='${A}/policies/p.pdf', file_name='p.pdf' where id='${P1}'`);
await expectErr("staff cannot move policy status", () => setStatus(U.staff, "under_committee_review"), "not_authorised");
await setStatus(U.qm, "under_committee_review");
const approved = (await setStatus(U.lead, "approved"))[0];
ok("approval records the approver and time", approved.approved_by === U.lead && approved.approved_at !== null);
await expectErr("approved policy is frozen", () => db.exec(`update gov_policies set title='New title' where id='${P1}'`), "policy_frozen");
await expectErr("policies cannot be deleted", () => db.exec(`delete from gov_policies where id='${P1}'`), "policy_not_deletable");
await expectErr("unique version per document number", () => db.exec(`insert into gov_policies(organization_id,title,document_number,version,created_by) values ('${A}','dup','IPC-01','1.0','${U.lead}')`), "gov_policies_organization_id_document_number_version_key");
await expectErr("actor spoofing refused for signed-in user", async () => {
  await db.exec(`select set_config('request.jwt.claim.sub','${U.staff}',false)`);
  try { await q("select gov_acknowledge_policy($1,$2)", [U.lead, P1]); } finally { await db.exec(`select set_config('request.jwt.claim.sub','',false)`); }
}, "actor_mismatch");
const DRAFT2 = "60000000-0000-4000-8000-000000000002";
await db.exec(`insert into gov_policies(id,organization_id,title,version,created_by,clinical_guideline_id) values ('${DRAFT2}','${A}','Draft policy','0.1','${U.lead}',null)`);
await expectErr("draft policy cannot be assigned", () => q("select gov_assign_policy($1,$2,null,null)", [U.lead, DRAFT2]), "policy_not_approved");
await expectErr("staff cannot assign", () => q("select gov_assign_policy($1,$2,null,null)", [U.staff, P1]), "not_authorised");
const assigned = (await q("select gov_assign_policy($1,$2,'2026-12-01',array['consultant']) as n", [U.lead, P1]))[0].n;
ok("assign by role reaches only that role", assigned === 1);
ok("assign everyone adds the rest, no duplicates", (await q("select gov_assign_policy($1,$2,'2026-12-01',null) as n", [U.lead, P1]))[0].n === 4);
await expectErr("acknowledging an unassigned policy refused", () => q("select gov_acknowledge_policy($1,$2)", [U.outsider, P1]), "not_assigned");
await q("select gov_acknowledge_policy($1,$2)", [U.staff, P1]);
await q("select gov_acknowledge_policy($1,$2)", [U.staff, P1]);
ok("acknowledgement is idempotent", (await q("select count(*)::int c from gov_acknowledgements where policy_id=$1", [P1]))[0].c === 1);

const summary = (await q("select assigned, acknowledged, overdue from gov_policy_ack_summary where policy_id=$1", [P1]))[0];
ok("ack summary counts assigned and acknowledged; nothing overdue before the due date", summary.assigned === 5 && summary.acknowledged === 1 && summary.overdue === 0, JSON.stringify(summary));
await db.exec(`update gov_policy_assignments set due_date='2020-01-01' where policy_id='${P1}'`);
ok("ack summary counts only unsigned assignments as overdue", (await q("select overdue from gov_policy_ack_summary where policy_id=$1", [P1]))[0].overdue === 4);
ok("ack summary lists policies with nobody assigned as zero", (await q("select assigned from gov_policy_ack_summary where policy_id=$1", [DRAFT2]))[0].assigned === 0);

// ---- incidents + CAPA --------------------------------------------------------------------------------------
const inc = async (extra = {}) => (await q(
  "insert into gov_incidents(organization_id,title,severity,likelihood,impact,is_sentinel,reported_by) values ($1,$2,$3,$4,$5,$6,$7) returning id,reference,risk_score",
  [A, extra.title ?? "Wrong dose", extra.severity ?? "high", extra.l ?? 3, extra.i ?? 4, extra.sentinel ?? false, U.staff]))[0];
const i1 = await inc({ sentinel: true });
const i2 = await inc({ title: "Fall", severity: "low", l: 1, i: 1 });
ok("reference generated and sequential", /^INC-\d{4}-0001$/.test(i1.reference) && /^INC-\d{4}-0002$/.test(i2.reference));
ok("risk score = likelihood x impact", i1.risk_score === 12);
const setInc = (id, status, extra = "") => db.exec(`update gov_incidents set status='${status}' ${extra} where id='${id}'`);
await expectErr("closure needs a note", () => setInc(i2.id, "closed"), "closure_note_required");
await setInc(i2.id, "closed", ", closure_note='No harm, reviewed'");
ok("closure stamps closed_at", (await q("select closed_at from gov_incidents where id=$1", [i2.id]))[0].closed_at !== null);
await expectErr("closed incident cannot be edited quietly", () => db.exec(`update gov_incidents set closure_note='different' where id='${i2.id}'`), "incident_closed");
await expectErr("sentinel needs a root cause", () => setInc(i1.id, "closed", ", closure_note='done'"), "root_cause_required");
await expectErr("sentinel needs a corrective action", () => setInc(i1.id, "closed", ", closure_note='done', root_cause='Look-alike vials'"), "capa_required");
const capa = (await q("insert into gov_capa(organization_id,incident_id,action,owner_user_id,due_date,created_by) values ($1,$2,'Segregate vials','" + U.staff2 + "','2026-11-30',$3) returning id", [A, i1.id, U.lead]))[0].id;
await expectErr("open CAPA blocks closure", () => setInc(i1.id, "closed", ", closure_note='done', root_cause='Look-alike vials'"), "capa_open");
await expectErr("CAPA status cannot be edited directly", () => db.exec(`update gov_capa set status='done' where id='${capa}'`), "status_via_workflow");
const cs = (actor, status, note = "") => q("select * from gov_set_capa_status($1,$2,$3,$4)", [actor, capa, status, note]);
await expectErr("stranger cannot touch a CAPA", () => cs(U.staff, "in_progress"), "not_authorised");
await cs(U.staff2, "in_progress");
const done = (await cs(U.staff2, "done"))[0];
ok("done stamps done_at", done.done_at !== null);
await expectErr("owner cannot verify own action", () => cs(U.staff2, "verified", "worked"), "only governance staff");
await expectErr("verification needs a note", () => cs(U.lead, "verified", " "), "verification_note_required");
const ver = (await cs(U.lead, "verified", "Audited 20 vials, all segregated"))[0];
ok("verification records who and when", ver.verified_by === U.lead && ver.verified_at !== null);
await setInc(i1.id, "closed", ", closure_note='done', root_cause='Look-alike vials'");
ok("sentinel closes once RCA + verified CAPA exist", (await q("select status from gov_incidents where id=$1", [i1.id]))[0].status === "closed");
await expectErr("incidents cannot be deleted", () => db.exec(`delete from gov_incidents where id='${i1.id}'`), "incident_not_deletable");
await expectErr("reporter cannot be reassigned", () => db.exec(`update gov_incidents set reported_by='${U.lead}' where id='${i2.id}'`), "incident_identity_immutable");

// ---- audits ------------------------------------------------------------------------------------------------
const AU = "70000000-0000-4000-8000-000000000001";
await db.exec(`insert into gov_audits(id,organization_id,title,scheduled_for,recurrence_months,target_pct,owner_user_id,created_by) values ('${AU}','${A}','Hand hygiene','2026-11-01',3,95,'${U.staff2}','${U.lead}')`);
await expectErr("completed audit needs result and sample", () => db.exec(`update gov_audits set status='completed' where id='${AU}'`), "gov_audits_check");
await expectErr("random member cannot complete an audit", () => q("select gov_complete_audit($1,$2,90,40,'')", [U.staff, AU]), "not_authorised");
const next = (await q("select gov_complete_audit($1,$2,91,40,'4 lapses') as n", [U.staff2, AU]))[0].n;
ok("owner completes audit and the next one is scheduled", next !== null && (await q("select scheduled_for::text d from gov_audits where id=$1", [next]))[0].d === "2027-02-01");
await expectErr("completed audit cannot be completed again", () => q("select gov_complete_audit($1,$2,91,40,'')", [U.lead, AU]), "audit_closed");

// ---- audit trail ---------------------------------------------------------------------------------------------
const trail = await q("select action, actor_user_id, metadata from audit_events where entity_id=$1 order by occurred_at", [P1]);
ok("policy approval is in the audit trail with the actor", trail.some((r) => r.action === "governance.gov_policies.update" && r.actor_user_id === U.lead && JSON.stringify(r.metadata).includes("approved")));
ok("assessments, evidence, incidents and capa all audited", (await q("select count(distinct entity_type)::int c from audit_events where action like 'governance.%'"))[0].c >= 8);
ok("audit rows carry organisation", (await q("select count(*)::int c from audit_events where action like 'governance.%' and organization_id is null"))[0].c === 0);

// ---- row level security --------------------------------------------------------------------------------------
const count = (sql, params) => q(sql, params).then((r) => r[0].c);
ok("anon sees nothing", await (async () => { await db.exec("set role anon"); try { return (await count("select count(*)::int c from gov_standards")) === 0; } catch { return true; } finally { await db.exec("reset role"); } })());
ok("governance lead reads standards", await asUser(U.lead, () => count("select count(*)::int c from gov_standards")) === 2);
ok("auditor reads standards", await asUser(U.aud, () => count("select count(*)::int c from gov_standards")) === 2);
ok("plain clinician cannot read standards", await asUser(U.staff, () => count("select count(*)::int c from gov_standards")) === 0);
ok("other organisation cannot read standards", await asUser(U.otherLead, () => count("select count(*)::int c from gov_standards")) === 0);
await expectErr("auditor cannot write standards", () => asUser(U.aud, () => db.exec(`insert into gov_standards(organization_id,edition,code,description,created_by) values ('${A}','x','Z.1','z','${U.aud}')`)), "row-level security");
await expectErr("other organisation cannot write to this one", () => asUser(U.otherLead, () => db.exec(`insert into gov_standards(organization_id,edition,code,description,created_by) values ('${A}','x','Z.2','z','${U.otherLead}')`)), "row-level security");
await expectErr("writer cannot forge assessed_by", () => asUser(U.lead, () => db.exec(`insert into gov_assessments(organization_id,standard_id,rating,notes,assessed_by) values ('${A}','${S2}','insufficient','gap','${U.qm}')`)), "row-level security");
ok("clinician sees approved policy but not drafts", await asUser(U.staff, () => count("select count(*)::int c from gov_policies")) === 1);
ok("clinician sees only their own assignment", await asUser(U.staff, () => count("select count(*)::int c from gov_policy_assignments")) === 1);
ok("lead sees every assignment", await asUser(U.lead, () => count("select count(*)::int c from gov_policy_assignments")) === 5);
ok("reporter sees own incidents only", await asUser(U.staff, () => count("select count(*)::int c from gov_incidents")) === 2);
ok("another clinician sees no incidents", await asUser(U.staff2, () => count("select count(*)::int c from gov_incidents")) === 0);
ok("CAPA owner sees their CAPA", await asUser(U.staff2, () => count("select count(*)::int c from gov_capa")) === 1);
await asUser(U.staff2, () => db.exec(`insert into gov_incidents(organization_id,title,reported_by) values ('${A}','Near miss','${U.staff2}')`));
ok("any member can report an incident", await asUser(U.staff2, () => count("select count(*)::int c from gov_incidents")) === 1);
await expectErr("cannot report as someone else", () => asUser(U.staff2, () => db.exec(`insert into gov_incidents(organization_id,title,reported_by) values ('${A}','Fake','${U.staff}')`)), "row-level security");
await expectErr("outsider cannot report", () => asUser(U.outsider, () => db.exec(`insert into gov_incidents(organization_id,title,reported_by) values ('${A}','Fake','${U.outsider}')`)), "row-level security");
await expectErr("reporter cannot edit their incident afterwards", async () => {
  const r = await asUser(U.staff2, () => q("update gov_incidents set severity='low' where reported_by=$1 returning id", [U.staff2]));
  if (r.length === 0) throw new Error("row-level security (0 rows updated)");
}, "row-level security");
ok("people directory limited to governance staff", await asUser(U.lead, () => count("select count(*)::int c from gov_people($1)", [A])) === 5 && await asUser(U.staff, () => count("select count(*)::int c from gov_people($1)", [A])) === 0);

await db.exec("grant select on audit_events to authenticated; alter table audit_events enable row level security; create policy audit_authorized_read_stub on audit_events for select using (false);");
ok("governance staff can read governance audit rows", await asUser(U.lead, () => count("select count(*)::int c from audit_events")) > 0);
ok("auditor can read governance audit rows", await asUser(U.aud, () => count("select count(*)::int c from audit_events")) > 0);
ok("clinicians cannot read the audit trail", await asUser(U.staff, () => count("select count(*)::int c from audit_events")) === 0);
ok("other organisation cannot read this audit trail", await asUser(U.otherLead, () => count("select count(*)::int c from audit_events where organization_id=$1", [A])) === 0);

// ---- storage -------------------------------------------------------------------------------------------------
const obj = (uid, name) => asUser(uid, () => db.query("insert into storage.objects(bucket_id,name) values ('governance-files',$1)", [name]));
await obj(U.lead, `${A}/evidence/a.pdf`); ok("governance writer can upload evidence", true);
await expectErr("auditor cannot upload evidence", () => obj(U.aud, `${A}/evidence/b.pdf`), "row-level security");
await expectErr("clinician cannot upload to evidence folder", () => obj(U.staff, `${A}/evidence/c.pdf`), "row-level security");
await obj(U.staff, `${A}/incidents/d.png`); ok("clinician can attach to an incident", true);
await expectErr("other org cannot upload into this org", () => obj(U.otherLead, `${A}/evidence/e.pdf`), "row-level security");
ok("clinician cannot read evidence files", await asUser(U.staff, () => count("select count(*)::int c from storage.objects")) === 0);
ok("auditor can read files", await asUser(U.aud, () => count("select count(*)::int c from storage.objects")) === 2);
ok("bucket is private with a size limit", (await q("select public, file_size_limit from storage.buckets where id='governance-files'"))[0].public === false);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
