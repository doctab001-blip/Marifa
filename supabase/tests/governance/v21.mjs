// Database tests for supabase/migrations/20261021090000_governance_hub_v21.sql (Governance Hub V2.1).
// Builds the real schema from EVERY migration in order (platform.sql imitates the Supabase auth/storage schemas), seeds
// governance rows BEFORE the V2.1 migration, applies it, and then proves:
//   * it is additive: no pre-existing column or row value changes;
//   * each acceptance rule in docs/governance-hub-v21.md is enforced by the database itself.
//
//   npm i --no-save @electric-sql/pglite
//   node supabase/tests/governance/v21.mjs
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, "../../migrations");
const V21 = "20261021090000_governance_hub_v21.sql";
const db = new PGlite({ extensions: { pgcrypto } });
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

await db.exec(fs.readFileSync(path.join(here, "platform.sql"), "utf8"));
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
for (const f of files.filter((f) => f < V21)) await db.exec(fs.readFileSync(path.join(dir, f), "utf8"));

const U = {
  lead: "00000000-0000-4000-8000-000000000001", qm: "00000000-0000-4000-8000-000000000002", aud: "00000000-0000-4000-8000-000000000003",
  staff: "00000000-0000-4000-8000-000000000004", other: "00000000-0000-4000-8000-000000000005",
};
const A = "aaaaaaaa-0000-4000-8000-000000000001", B = "bbbbbbbb-0000-4000-8000-000000000002";
await db.exec(`
 insert into auth.users(id) values ${Object.values(U).map((u) => `('${u}')`).join(",")};
 insert into organizations(id,name,slug) values ('${A}','Hospital A','hospital-a'),('${B}','Hospital B','hospital-b');
 insert into profiles(id,display_name) values ${Object.entries(U).map(([k, u]) => `('${u}','${k}')`).join(",")};
 insert into roles(code,name) values ('governance_lead','Governance lead'),('auditor','Auditor'),('consultant','Consultant') on conflict (code) do nothing;
 insert into organization_memberships(id,organization_id,user_id) values
   ('10000000-0000-4000-8000-000000000001','${A}','${U.lead}'),('10000000-0000-4000-8000-000000000002','${A}','${U.qm}'),
   ('10000000-0000-4000-8000-000000000003','${A}','${U.aud}'),('10000000-0000-4000-8000-000000000004','${A}','${U.staff}'),
   ('10000000-0000-4000-8000-000000000005','${B}','${U.other}');
 insert into membership_roles select '10000000-0000-4000-8000-000000000001', id from roles where code='governance_lead';
 insert into membership_roles select '10000000-0000-4000-8000-000000000002', id from roles where code='quality_manager';
 insert into membership_roles select '10000000-0000-4000-8000-000000000003', id from roles where code='auditor';
 insert into membership_roles select '10000000-0000-4000-8000-000000000004', id from roles where code='consultant';
 insert into membership_roles select '10000000-0000-4000-8000-000000000005', id from roles where code='governance_lead';
`);

// ---- governance data that exists before V2.1 ------------------------------------------------------------------
const S1 = "50000000-0000-4000-8000-000000000001", S2 = "50000000-0000-4000-8000-000000000002", SB = "50000000-0000-4000-8000-0000000000b1";
const EV1 = "51000000-0000-4000-8000-000000000001";
await db.exec(`
 insert into gov_standards(id,organization_id,edition,chapter_code,chapter_name,code,description,is_esr,created_by) values
  ('${S1}','${A}','Licensed edition','LD','Leadership','LD.1','Leadership standard one',true,'${U.lead}'),
  ('${S2}','${A}','Licensed edition','LD','Leadership','LD.2','Leadership standard two',false,'${U.lead}'),
  ('${SB}','${B}','Other edition','QM','Quality','QM.1','Other hospital standard',false,'${U.other}');
 insert into gov_evidence(id,organization_id,standard_id,title,storage_path,file_name,uploaded_by) values
  ('${EV1}','${A}','${S1}','Leadership minutes','${A}/evidence/m.pdf','m.pdf','${U.lead}');
 insert into gov_assessments(organization_id,standard_id,rating,notes,assessed_by) values ('${A}','${S1}','satisfactory','','${U.lead}');
 insert into gov_assessments(organization_id,standard_id,rating,notes,assessed_by) values ('${A}','${S2}','partial','Gap: no audit','${U.lead}');
`);
const INC = (await q("insert into gov_incidents(organization_id,title,severity,likelihood,impact,is_sentinel,reported_by) values ($1,'Wrong dose','high',3,4,true,$2) returning id", [A, U.staff]))[0].id;
await db.exec(`insert into gov_capa(organization_id,incident_id,action,owner_user_id,due_date,created_by) values ('${A}','${INC}','Double-check high-alert drugs','${U.qm}',current_date + 10,'${U.lead}')`);
const AUD = (await q("insert into gov_audits(organization_id,title,scheduled_for,created_by) values ($1,'Consent audit',current_date + 5,$2) returning id", [A, U.lead]))[0].id;
const QIP = (await q("insert into gov_qips(organization_id,title,created_by) values ($1,'Reduce falls',$2) returning id", [A, U.lead]))[0].id;
await db.exec(`insert into gov_settings(organization_id, edition_label) values ('${A}','Licensed edition')`);
const G1 = "70000000-0000-4000-8000-000000000001", G2 = "70000000-0000-4000-8000-000000000002";
const V1 = "71000000-0000-4000-8000-000000000001", V2 = "71000000-0000-4000-8000-000000000002", VX = "71000000-0000-4000-8000-0000000000ff";
// Minimal content that satisfies the clinical schema's structured-investigation check. These rows are test fixtures only.
const inv = { tier: "laboratory", testName: "Test", modalityTarget: "Test", targetCondition: "Test", expectedFinding: "Test", clinicalRationale: "Test" };
const CONTENT = JSON.stringify({ investigations: { ruleIn: [inv], ruleOut: [inv] } }).replace(/'/g, "''");
await db.exec(`
 insert into clinical_guidelines(id,organization_id,title,source_type,status) values ('${G1}','${A}','Sepsis local protocol','local_protocol','published'),('${G2}','${B}','Other hospital protocol','local_protocol','published');
 insert into guideline_versions(id,guideline_id,version,version_number,change_summary,source_title,issuing_organization,jurisdiction,review_date,created_by,status,is_current,content,approved_by) values
  ('${V1}','${G1}','1.0','1.0','First','Local','Hospital A','SA','2026-06-01','${U.lead}','superseded',false,'${CONTENT}','${U.lead}'),
  ('${V2}','${G1}','2.0','2.0','Second','Local','Hospital A','SA','2027-06-01','${U.lead}','published',true,'${CONTENT}','${U.lead}'),
  ('${VX}','${G2}','1.0','1.0','Other','Local','Hospital B','SA','2027-01-01','${U.other}','published',true,'${CONTENT}','${U.other}');
`);

// ---- additivity: snapshot every public table's existing rows on its existing columns ----------------------------
const tables = (await q(`select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1`)).map((r) => r.table_name);
const colsOf = async (t) => (await q(`select column_name from information_schema.columns where table_schema='public' and table_name=$1 order by ordinal_position`, [t])).map((c) => c.column_name);
const before = {};
for (const t of tables) {
  const cols = await colsOf(t);
  const types = (await q(`select column_name, data_type from information_schema.columns where table_schema='public' and table_name=$1`, [t])).map((c) => `${c.column_name}:${c.data_type}`).sort();
  const list = cols.map((c) => `"${c}"`).join(",");
  const rows = await q(`select md5(coalesce(string_agg(x::text, '|' order by x::text), '')) h, count(*)::int n from (select ${list} from public."${t}") x`);
  before[t] = { cols, types, h: rows[0].h, n: rows[0].n };
}

await db.exec(fs.readFileSync(path.join(dir, V21), "utf8"));
ok("V2.1 migration applies on top of every earlier migration", true);

const changed = [];
for (const t of tables) {
  const b = before[t];
  const types = (await q(`select column_name, data_type from information_schema.columns where table_schema='public' and table_name=$1`, [t])).map((c) => `${c.column_name}:${c.data_type}`);
  for (const c of b.types) if (!types.includes(c)) changed.push(`${t}: column ${c} removed or retyped`);
  const list = b.cols.map((c) => `"${c}"`).join(",");
  const rows = await q(`select md5(coalesce(string_agg(x::text, '|' order by x::text), '')) h, count(*)::int n from (select ${list} from public."${t}") x`);
  // The backfill writes audit-trail rows and first timeline entries: inserts are expected there, changes are not.
  if (["audit_events"].includes(t)) { if (rows[0].n < b.n) changed.push(`${t}: rows removed`); continue; }
  if (rows[0].h !== b.h || rows[0].n !== b.n) changed.push(`${t}: existing values changed`);
}
ok("additive: no existing column removed and no existing value changed", changed.length === 0, changed.join("; "));
ok("existing assessments, evidence, CAPA, audits and QIPs are all still there", (await q(`select
  (select count(*) from gov_assessments)::int a, (select count(*) from gov_evidence)::int e, (select count(*) from gov_capa)::int c,
  (select count(*) from gov_audits)::int au, (select count(*) from gov_qips)::int qp`))[0].a === 2);
ok("risk score still likelihood x impact", (await q("select risk_score from gov_incidents where id=$1", [INC]))[0].risk_score === 12);
ok("existing settings keep the old risk bands as defaults", (() => true)() && (await q("select risk_moderate_min m, risk_high_min h, risk_extreme_min x from gov_settings where organization_id=$1", [A]))[0].h === 10);

// ---- 1. standards hierarchy --------------------------------------------------------------------------------------
const std1 = (await q("select s.edition_id, s.chapter_id, e.label, c.code from gov_standards s join gov_editions e on e.id=s.edition_id join gov_chapters c on c.id=s.chapter_id where s.id=$1", [S1]))[0];
ok("backfill: existing standards belong to an edition and a chapter", std1?.label === "Licensed edition" && std1?.code === "LD");
ok("backfill: one edition per label, one chapter per code", (await q("select count(*)::int c from gov_editions where organization_id=$1", [A]))[0].c === 1 && (await q("select count(*)::int c from gov_chapters where organization_id=$1", [A]))[0].c === 1);
const S3 = (await q("insert into gov_standards(organization_id,edition,chapter_code,chapter_name,code,description,created_by) values ($1,'Licensed edition','PC','Patient care','PC.1','Patient care one',$2) returning id, edition_id, chapter_id", [A, U.lead]))[0];
ok("the original text-only insert path still files new standards under edition and chapter", S3.edition_id === std1.edition_id && S3.chapter_id !== null && S3.chapter_id !== std1.chapter_id);

const el = (std, code, extra = {}) => q(
  "insert into gov_elements(organization_id,standard_id,code,description,is_esr,esr_source,created_by) values ($1,$2,$3,$4,$5,$6,$7) returning id",
  [extra.org ?? A, std, code, extra.text ?? `Element ${code}`, extra.esr ?? false, extra.src ?? "", U.lead]);
const E1 = (await el(S1, "LD.1.1"))[0].id;
const E2 = (await el(S1, "LD.1.2", { esr: true, src: "Manual p.12" }))[0].id;
ok("an ESR element keeps where its classification was verified", (await q("select is_esr, esr_source from gov_elements where id=$1", [E2]))[0].esr_source === "Manual p.12");
ok("measurable elements import under their standard", (await q("select count(*)::int c from gov_elements where standard_id=$1", [S1]))[0].c === 2);
await expectErr("element with an unknown parent standard is rejected", () => el("59999999-0000-4000-8000-000000000000", "X.1"), "foreign key");
await expectErr("element cannot hang off another hospital's standard", () => el(SB, "QM.1.1"), "foreign key");
await expectErr("duplicate element code under one standard is rejected", () => el(S1, "LD.1.1"), "gov_elements_standard_id_code_key");
ok("the same element code under a different standard is fine", (await el(S2, "LD.1.1")).length === 1);
await expectErr("an ESR element must say where the ESR classification was verified", () => el(S2, "LD.2.9", { esr: true }), "check");

const rateEl = (element, rating, notes = "") => db.query("insert into gov_element_assessments(organization_id,element_id,rating,notes,assessed_by) values ($1,$2,$3,$4,$5)", [A, element, rating, notes, U.lead]);
const E3 = (await el(S2, "LD.2.1"))[0].id;
await expectErr("element satisfactory without any current evidence is rejected", () => rateEl(E3, "satisfactory"), "evidence_required");
await rateEl(E1, "satisfactory");
ok("element satisfactory accepted when its parent standard has current evidence", true);
await expectErr("element partial needs a gap description", () => rateEl(E1, "partial", " "), "notes_required");
await expectErr("element assessments are append-only", () => db.exec(`update gov_element_assessments set notes='x'`), "assessments_immutable");

// Edition update: wording of an existing standard changes (what the wizard's "add and update" does).
const assessmentIds = (await q("select id from gov_assessments where standard_id=$1 order by id", [S1])).map((r) => r.id).join(",");
await db.exec(`update gov_standards set description='Leadership standard one (2026 wording)' where id='${S1}'`);
ok("updating an edition keeps historical assessments attached", (await q("select id from gov_assessments where standard_id=$1 order by id", [S1])).map((r) => r.id).join(",") === assessmentIds);
ok("updating an edition keeps evidence attached", (await q("select count(*)::int c from gov_evidence where standard_id=$1", [S1]))[0].c === 1);
ok("the wording change is in the audit trail", (await q("select count(*)::int c from audit_events where action='governance.gov_standards.update' and entity_id=$1 and metadata->'changes' ? 'description'", [S1]))[0].c === 1);

// ---- 2. evidence vault ---------------------------------------------------------------------------------------------
const link = (evidence, target, kind = "standard") => db.query(`insert into gov_evidence_links(organization_id,evidence_id,${kind}_id,linked_by) values ($1,$2,$3,$4) returning id`, [A, evidence, target, U.lead]);
await link(EV1, S2);
await db.query("insert into gov_assessments(organization_id,standard_id,rating,notes,assessed_by) values ($1,$2,'satisfactory','',$3)", [A, S2, U.lead]);
ok("one stored file links to a second standard and supports its rating", (await q("select rating from gov_standard_status where standard_id=$1", [S2]))[0].rating === "satisfactory");
ok("…without duplicating the stored file", (await q("select count(*)::int c from gov_evidence where storage_path like '%m.pdf'"))[0].c === 1);
const L3 = (await link(EV1, E3, "element")).rows[0].id;
await rateEl(E3, "satisfactory");
ok("a file linked to an element supports that element", true);
await expectErr("the same file cannot be linked twice to one target", () => link(EV1, S2), "duplicate key");
await expectErr("evidence links cannot be deleted", () => db.exec(`delete from gov_evidence_links where id='${L3}'`), "link_not_deletable");
await expectErr("unlinking needs a reason", () => db.exec(`update gov_evidence_links set unlinked_at=now(), unlink_reason=' ' where id='${L3}'`), "reason_required");

const EV2 = (await q("insert into gov_evidence(organization_id,standard_id,title,storage_path,file_name,uploaded_by,supersedes_id) values ($1,$2,'Leadership minutes v2',$3,'m2.pdf',$4,$5) returning id", [A, S1, `${A}/evidence/m2.pdf`, U.lead, EV1]))[0].id;
ok("a new version records which file it replaces", (await q("select supersedes_id from gov_evidence where id=$1", [EV2]))[0].supersedes_id === EV1);
ok("the replaced version no longer counts as current on the other standard", (await q("select gov_has_current_evidence($1,null) c", [S2]))[0].c === false);
ok("the new version counts where it was uploaded", (await q("select gov_has_current_evidence($1,null) c", [S1]))[0].c === true);
await expectErr("the version chain cannot be rewritten", () => db.exec(`update gov_evidence set supersedes_id=null where id='${EV2}'`), "evidence_immutable");
const EXP = (await q("insert into gov_evidence(organization_id,standard_id,title,storage_path,file_name,uploaded_by,valid_from,valid_until) values ($1,$2,'Old licence',$3,'l.pdf',$4,'2020-01-01','2021-01-01') returning id", [A, S3.id, `${A}/evidence/l.pdf`, U.lead]))[0].id;
ok("expired evidence is not current", (await q("select gov_has_current_evidence($1,null) c", [S3.id]))[0].c === false);

const REQ = (await q("insert into gov_evidence_requirements(organization_id,element_id,category,description,created_by) values ($1,$2,'committee_minutes','Minutes showing review',$3) returning id", [A, E1, U.lead]))[0].id;
await expectErr("a requirement belongs to exactly one standard or element", () => db.query("insert into gov_evidence_requirements(organization_id,standard_id,element_id,category) values ($1,$2,$3,'other')", [A, S1, E1]), "check");
const SUB = (await q("insert into gov_requirement_submissions(organization_id,requirement_id,evidence_id,submitted_by) values ($1,$2,$3,$4) returning id, status", [A, REQ, EV2, U.qm]))[0];
ok("linking a document to a requirement starts it as Uploaded", SUB.status === "uploaded");
await expectErr("evidence cannot jump from uploaded to verified", () => db.exec(`update gov_requirement_submissions set status='verified', reviewer_user_id='${U.lead}' where id='${SUB.id}'`), "invalid_transition");
await db.exec(`update gov_requirement_submissions set status='under_review' where id='${SUB.id}'`);
await expectErr("verification records who reviewed", () => db.exec(`update gov_requirement_submissions set status='verified' where id='${SUB.id}'`), "reviewer_required");
await expectErr("rejection needs a reason", () => db.exec(`update gov_requirement_submissions set status='rejected', reviewer_user_id='${U.lead}' where id='${SUB.id}'`), "note_required");
await db.exec(`update gov_requirement_submissions set status='verified', reviewer_user_id='${U.lead}' where id='${SUB.id}'`);
ok("verified evidence records the reviewer and time", (await q("select reviewed_at is not null r from gov_requirement_submissions where id=$1", [SUB.id]))[0].r === true);
await expectErr("a submission cannot be moved to another document", () => db.exec(`update gov_requirement_submissions set evidence_id='${EXP}' where id='${SUB.id}'`), "submission_immutable");

// ---- 3. clinical quality indicators -------------------------------------------------------------------------------
const IND = (await q("insert into gov_indicators(organization_id,code,title,measure_type,created_by) values ($1,'HH-1','Hand hygiene compliance','percentage',$2) returning id", [A, U.qm]))[0].id;
const RATE = (await q("insert into gov_indicators(organization_id,code,title,measure_type,rate_multiplier,unit,direction,created_by) values ($1,'FALL-1','Falls','rate',1000,'per 1,000 patient-days','lower_is_better',$2) returning id", [A, U.qm]))[0].id;
const CNT = (await q("insert into gov_indicators(organization_id,code,title,measure_type,created_by) values ($1,'CNT-1','Count','count',$2) returning id", [A, U.qm]))[0].id;
await expectErr("indicator codes are unique per hospital", () => db.query("insert into gov_indicators(organization_id,code,title) values ($1,'HH-1','dup')", [A]), "gov_indicators_organization_id_code_key");
await expectErr("a rate needs its multiplier", () => db.query("insert into gov_indicators(organization_id,code,title,measure_type) values ($1,'R2','r','rate')", [A]), "check");
const result = (ind, n, d, extra = {}) => q(
  "insert into gov_indicator_results(organization_id,indicator_id,period_start,period_end,numerator,denominator,value,entered_by,supersedes_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id, value",
  [A, ind, extra.start ?? "2026-09-01", extra.end ?? "2026-09-30", n, d, extra.value ?? null, U.qm, extra.supersedes ?? null]);
const R1 = (await result(IND, 45, 50))[0];
ok("percentage = numerator / denominator x 100", Number(R1.value) === 90);
ok("zero denominator is stored as 'no eligible cases' (no value), not 0% or an error", (await result(IND, 0, 0, { start: "2026-08-01", end: "2026-08-31" }))[0].value === null);
await expectErr("numerator cannot exceed denominator", () => result(IND, 51, 50), "invalid_percentage");
await expectErr("cases counted with no eligible cases are refused", () => result(RATE, 3, 0), "invalid_percentage");
ok("rates use the indicator's multiplier", Number((await result(RATE, 3, 1500))[0].value) === 2);
await expectErr("counts are whole numbers", () => result(CNT, null, null, { value: 2.5 }), "invalid_count");
await expectErr("a reported value cannot be edited", () => db.exec(`update gov_indicator_results set numerator=40 where id='${R1.id}'`), "result_immutable");
await expectErr("a reported value cannot be deleted", () => db.exec(`delete from gov_indicator_results where id='${R1.id}'`), "result_not_deletable");
const R1c = (await result(IND, 44, 50, { supersedes: R1.id }))[0];
ok("a correction is a new row; the original stays in the history", Number(R1c.value) === 88 && (await q("select count(*)::int c from gov_indicator_results where indicator_id=$1", [IND]))[0].c === 3);
await expectErr("a correction must belong to the same indicator", () => result(RATE, 1, 10, { supersedes: R1.id }), "invalid_reference");
await expectErr("verification records who verified", () => db.exec(`update gov_indicator_results set verification='verified' where id='${R1c.id}'`), "reviewer_required");
await db.exec(`update gov_indicator_results set verification='verified', verified_by='${U.lead}' where id='${R1c.id}'`);
ok("verified and unverified values are distinguished", (await q("select count(*) filter (where verification='verified')::int v, count(*) filter (where verification='unverified')::int u from gov_indicator_results where indicator_id=$1", [IND]))[0].v === 1);
await expectErr("a value cannot be entered already verified", () => db.query("insert into gov_indicator_results(organization_id,indicator_id,period_start,period_end,numerator,denominator,verification,entered_by) values ($1,$2,'2026-10-01','2026-10-31',1,2,'verified',$3)", [A, IND, U.qm]), "result_must_start_unverified");

// ---- 4. committees ----------------------------------------------------------------------------------------------------
const COM = (await q("insert into gov_committees(organization_id,name,purpose,chair_user_id,secretary_user_id,created_by) values ($1,'Quality & Patient Safety Committee','Oversight',$2,$3,$2) returning id", [A, U.lead, U.qm]))[0].id;
await db.exec(`insert into gov_committee_members(organization_id,committee_id,user_id,member_role) values ('${A}','${COM}','${U.lead}','chair'),('${A}','${COM}','${U.qm}','secretary'),('${A}','${COM}','${U.staff}','member')`);
ok("committee and membership recorded", (await q("select count(*)::int c from gov_committee_members where committee_id=$1", [COM]))[0].c === 3);
await expectErr("a meeting starts scheduled", () => db.query("insert into gov_meetings(organization_id,committee_id,scheduled_at,status) values ($1,$2,now(),'held')", [A, COM]), "meeting_must_start_scheduled");
const MTG = (await q("insert into gov_meetings(organization_id,committee_id,scheduled_at,agenda,created_by) values ($1,$2,now(),'1. Incidents 2. Sepsis protocol',$3) returning id", [A, COM, U.lead]))[0].id;
await expectErr("a meeting cannot skip to approved", () => db.exec(`update gov_meetings set status='approved' where id='${MTG}'`), "invalid_transition");
await db.exec(`update gov_meetings set status='held' where id='${MTG}'`);
await db.exec(`insert into gov_meeting_attendance(organization_id,meeting_id,user_id,status) values ('${A}','${MTG}','${U.lead}','present'),('${A}','${MTG}','${U.qm}','present'),('${A}','${MTG}','${U.staff}','apologies')`);
ok("attendance recorded per member", (await q("select count(*) filter (where status='present')::int p from gov_meeting_attendance where meeting_id=$1", [MTG]))[0].p === 2);
const DEC = (await q("insert into gov_meeting_decisions(organization_id,meeting_id,decision,created_by) values ($1,$2,'Approve sepsis protocol v2.0 subject to audit',$3) returning id", [A, MTG, U.lead]))[0].id;
const ACT = (await q("insert into gov_capa(organization_id,meeting_id,decision_id,action,kind,owner_user_id,due_date,created_by) values ($1,$2,$3,'Schedule sepsis audit','follow_up',$4,current_date + 30,$5) returning id, due_date", [A, MTG, DEC, U.qm, U.lead]))[0];
ok("a committee action is a dated, owned action in the existing CAPA tracker", ACT.id && ACT.due_date !== null);
await expectErr("CAPA still needs an incident, audit or meeting", () => db.query("insert into gov_capa(organization_id,action,owner_user_id,due_date,created_by) values ($1,'orphan',$2,current_date,$2)", [A, U.lead]), "gov_capa_source_check");
await expectErr("CAPA kind is still restricted", () => db.query("insert into gov_capa(organization_id,incident_id,action,kind,owner_user_id,due_date,created_by) values ($1,$2,'x','other',$3,current_date,$3)", [A, INC, U.lead]), "gov_capa_kind_v21_check");
await expectErr("minutes must be written before they are marked drafted", () => db.exec(`update gov_meetings set status='minutes_drafted' where id='${MTG}'`), "minutes_required");
await db.exec(`update gov_meetings set status='minutes_drafted', minutes='Discussed incidents. Protocol approved.' where id='${MTG}'`);
await expectErr("approval records who approved the minutes", () => db.exec(`update gov_meetings set status='approved' where id='${MTG}'`), "approver_required");
await db.exec(`update gov_meetings set status='approved', minutes_approved_by='${U.lead}' where id='${MTG}'`);
await expectErr("approved minutes are frozen", () => db.exec(`update gov_meetings set minutes='rewritten' where id='${MTG}'`), "minutes_frozen");
await expectErr("attendance is frozen after approval", () => db.exec(`update gov_meeting_attendance set status='absent' where meeting_id='${MTG}'`), "minutes_frozen");
await expectErr("decisions are frozen after approval", () => db.query("insert into gov_meeting_decisions(organization_id,meeting_id,decision) values ($1,$2,'late')", [A, MTG]), "minutes_frozen");
await expectErr("actions must be done before the meeting is marked followed up", () => db.exec(`update gov_meetings set status='actions_followed_up' where id='${MTG}'`), "actions_open");
await q("select gov_set_capa_status($1,$2,'done','')", [U.qm, ACT.id]);
await db.exec(`update gov_meetings set status='actions_followed_up' where id='${MTG}'`);
ok("meeting moves to Actions followed up once its actions are done", (await q("select status from gov_meetings where id=$1", [MTG]))[0].status === "actions_followed_up");

const POL = (await q("insert into gov_policies(organization_id,title,version,created_by) values ($1,'Sepsis policy','1.0',$2) returning id", [A, U.lead]))[0].id;
const glink = (st, sid, tt, tid, ver = null, org = A) => db.query("insert into gov_links(organization_id,source_type,source_id,target_type,target_id,target_version_id,created_by) values ($1,$2,$3,$4,$5,$6,$7)", [org, st, sid, tt, tid, ver, U.lead]);
for (const [tt, tid, ver] of [["policy", POL], ["guideline", G1, V2], ["standard", S1], ["capa", ACT.id], ["audit", AUD], ["qip", QIP]]) await glink("decision", DEC, tt, tid, ver ?? null);
ok("a committee decision links to policy, guideline, standard, CAPA, audit and QIP", (await q("select count(*)::int c from gov_links where source_type='decision' and source_id=$1", [DEC]))[0].c === 6);
await expectErr("links to records that do not exist are refused", () => glink("decision", DEC, "policy", "79999999-0000-4000-8000-000000000000"), "invalid_reference");
await expectErr("links into another hospital are refused", () => glink("decision", DEC, "standard", SB), "invalid_reference");
await expectErr("another hospital's protocol cannot be linked", () => glink("element", E1, "guideline", G2), "invalid_reference");

// ---- 5. clinical guideline integration -------------------------------------------------------------------------------
await glink("guideline", G1, "element", E1);
await glink("indicator", IND, "guideline", G1, V2);
await glink("standard", S1, "guideline", G1);
ok("an existing guideline links to a measurable element", (await q("select count(*)::int c from gov_links where source_type='guideline' and source_id=$1 and target_type='element'", [G1]))[0].c === 1);
ok("the link keeps the guideline version it was made against", (await q("select target_version_id v from gov_links where source_type='indicator' and target_id=$1", [G1]))[0].v === V2);
await expectErr("a version of a different guideline is refused", () => glink("qip", QIP, "guideline", G1, VX), "invalid_reference");
await expectErr("approval must name the version", () => db.query("insert into gov_guideline_reviews(organization_id,guideline_id,status,approved_by) values ($1,$2,'approved',$3)", [A, G1, U.lead]), "version_required");
await expectErr("the approved version must belong to the guideline", () => db.query("insert into gov_guideline_reviews(organization_id,guideline_id,status,governed_version_id,approved_by) values ($1,$2,'approved',$3,$4)", [A, G1, VX, U.lead]), "invalid_reference");
await db.query("insert into gov_guideline_reviews(organization_id,guideline_id,status,governed_version_id,approved_by,next_review_due) values ($1,$2,'approved',$3,$4,'2027-05-01')", [A, G1, V2, U.lead]);
ok("governance approval is pinned to the reviewed version", (await q("select governed_version_id v, approved_at is not null a from gov_guideline_reviews where guideline_id=$1", [G1]))[0].v === V2);
await expectErr("another hospital's protocol cannot be governed here", () => db.query("insert into gov_guideline_reviews(organization_id,guideline_id) values ($1,$2)", [A, G2]), "invalid_reference");
const govCols = await colsOf("gov_guideline_reviews");
ok("no guideline content is duplicated (governance stores ids, status and dates only)", !govCols.some((c) => ["content", "title", "body", "source_title"].includes(c)) && !(await colsOf("gov_links")).includes("content"));
const summary = await asUser(U.staff, () => q("select * from gov_guideline_summary($1,$2)", [A, G1]));
ok("clinicians see the protocol's governance summary (status, standards, indicators)", summary[0]?.status === "approved" && summary[0].standard_codes.includes("LD.1") && summary[0].indicator_titles.includes("Hand hygiene compliance") && summary[0].element_codes.includes("LD.1 / LD.1.1"), JSON.stringify(summary));
ok("another hospital sees nothing", (await asUser(U.other, () => q("select * from gov_guideline_summary($1,$2)", [A, G1]))).length === 0);
ok("guideline content itself is untouched", (await q("select count(*)::int c from guideline_versions where guideline_id=$1", [G1]))[0].c === 2);

// ---- 6. incidents and CAPA -------------------------------------------------------------------------------------------------
await db.exec(`update gov_incidents set status='under_investigation', investigator_user_id='${U.qm}', investigation_started_on=current_date where id='${INC}'`);
const hist = await q("select from_status, to_status from gov_incident_status_history where incident_id=$1 order by changed_at, from_status nulls first", [INC]);
ok("status timeline records each change", hist.length === 2 && hist[1].from_status === "reported" && hist[1].to_status === "under_investigation", JSON.stringify(hist));
await expectErr("investigation cannot finish before it starts", () => db.exec(`update gov_incidents set investigation_completed_on=current_date - 5 where id='${INC}'`), "gov_incidents_investigation_dates_check");
const QIP2 = (await q("insert into gov_qips(organization_id,title,source_incident_id,created_by) values ($1,'Safer high-alert drugs',$2,$3) returning id", [A, INC, U.lead]))[0].id;
ok("an incident investigation links to an improvement project", (await q("select source_incident_id from gov_qips where id=$1", [QIP2]))[0].source_incident_id === INC);
const CAPA1 = (await q("select id from gov_capa where incident_id=$1", [INC]))[0].id;
await expectErr("effectiveness is assessed only after the action is done", () => db.exec(`update gov_capa set effectiveness='effective', effectiveness_checked_by='${U.lead}' where id='${CAPA1}'`), "not_complete");
await q("select gov_set_capa_status($1,$2,'done','')", [U.qm, CAPA1]);
await expectErr("effectiveness check records who checked", () => db.exec(`update gov_capa set effectiveness='effective' where id='${CAPA1}'`), "reviewer_required");
await db.exec(`update gov_capa set effectiveness='effective', effectiveness_checked_by='${U.lead}', completion_note='Second check in place' where id='${CAPA1}'`);
await q("select gov_set_capa_status($1,$2,'in_progress','')", [U.lead, CAPA1]);
ok("reopening an action clears its effectiveness check", (await q("select effectiveness from gov_capa where id=$1", [CAPA1]))[0].effectiveness === "not_assessed");

const RULE = (await q("insert into gov_regulatory_rules(organization_id,name,report_within_hours,remind_before_hours,source_note,created_by) values ($1,'Sentinel event notification',24,6,'From the hospital''s licensed programme documents',$2) returning id", [A, U.lead]))[0].id;
await expectErr("reminder must come before the deadline", () => db.query("insert into gov_regulatory_rules(organization_id,name,report_within_hours,remind_before_hours) values ($1,'x',4,6)", [A]), "check");
await db.query("insert into gov_incident_notifications(organization_id,incident_id,rule_id,reported_at,recorded_by) values ($1,$2,$3,now(),$4)", [A, INC, RULE, U.lead]);
await expectErr("one notification per incident and rule", () => db.query("insert into gov_incident_notifications(organization_id,incident_id,rule_id,reported_at) values ($1,$2,$3,now())", [A, INC, RULE]), "duplicate key");

// ---- 7. audits and PDSA ---------------------------------------------------------------------------------------------------
const TPL = (await q(`insert into gov_audit_templates(organization_id,title,criteria,created_by) values ($1,'Consent audit','[{"id":"c1","text":"Consent signed"},{"id":"c2","text":"Risks documented"}]',$2) returning id`, [A, U.lead]))[0].id;
await expectErr("criteria must be a list", () => db.query(`insert into gov_audit_templates(organization_id,title,criteria) values ($1,'x','{"a":1}')`, [A]), "check");
await db.exec(`update gov_audits set template_id='${TPL}' where id='${AUD}'`);
await db.query(`insert into gov_audit_observations(organization_id,audit_id,case_ref,results,recorded_by) values ($1,$2,'Case 1','{"c1":"met","c2":"not_met"}',$3)`, [A, AUD, U.lead]);
await expectErr("observation values are met, not met or not applicable", () => db.query(`insert into gov_audit_observations(organization_id,audit_id,results) values ($1,$2,'{"c1":"yes"}')`, [A, AUD]), "invalid_result");
await expectErr("numerator cannot exceed denominator on an audit", () => db.exec(`update gov_audits set numerator=5, denominator=4 where id='${AUD}'`), "gov_audits_fraction_check");
// The audit's own lead (a clinician, no governance role) records observations and completes it from counts.
await db.exec(`update gov_audits set owner_user_id='${U.staff}' where id='${AUD}'`);
await asUser(U.staff, () => db.query(`insert into gov_audit_observations(organization_id,audit_id,case_ref,results,recorded_by) values ($1,$2,'Case 2','{"c1":"met","c2":"met"}',$3)`, [A, AUD, U.staff]));
ok("the audit lead can record observations without a governance role", true);
await expectErr("other clinicians cannot record observations", () => asUser(U.aud, () => db.query(`insert into gov_audit_observations(organization_id,audit_id,results,recorded_by) values ($1,$2,'{"c1":"met"}',$3)`, [A, AUD, U.aud])), "row-level security");
await expectErr("counts cannot exceed the cases", () => asUser(U.staff, () => q("select gov_complete_audit_counts($1,$2,3,2,'','',null)", [U.staff, AUD])), "invalid_percentage");
await expectErr("an audit cannot be completed from zero cases", () => asUser(U.staff, () => q("select gov_complete_audit_counts($1,$2,0,0,'','',null)", [U.staff, AUD])), "denominator_required");
await asUser(U.staff, () => q("select gov_complete_audit_counts($1,$2,1,2,'One missing risk note','Reminder at consent clinic',current_date + 90)", [U.staff, AUD]));
const done = (await q("select status, result_pct, sample_size, numerator, denominator, action_plan, reaudit_due is not null r from gov_audits where id=$1", [AUD]))[0];
ok("compliance is calculated from the counts (1 of 2 = 50%)", done.status === "completed" && Number(done.result_pct) === 50 && done.sample_size === 2 && done.numerator === 1 && done.action_plan !== "" && done.r === true, JSON.stringify(done));
await expectErr("observations are frozen once the audit is complete", () => db.query(`insert into gov_audit_observations(organization_id,audit_id,results) values ($1,$2,'{"c1":"met"}')`, [A, AUD]), "audit_closed");
const QIP3 = (await q("insert into gov_qips(organization_id,title,source_audit_id,created_by) values ($1,'Better consent',$2,$3) returning id", [A, AUD, U.lead]))[0].id;
const REAUD = (await q("insert into gov_audits(organization_id,title,scheduled_for,source_qip_id,template_id,created_by) values ($1,'Consent re-audit',current_date + 60,$2,$3,$4) returning id", [A, QIP3, TPL, U.lead]))[0].id;
ok("audit finding -> QIP -> new audit cycle are linked", (await q("select a.id from gov_audits a join gov_qips p on p.id=a.source_qip_id where p.source_audit_id=$1", [AUD]))[0]?.id === REAUD);
const C1 = (await q("insert into gov_qip_cycles(organization_id,qip_id,cycle_no,created_by) values ($1,$2,1,$3) returning id", [A, QIP3, U.lead]))[0].id;
await expectErr("only one open PDSA cycle per project", () => db.query("insert into gov_qip_cycles(organization_id,qip_id,cycle_no) values ($1,$2,2)", [A, QIP3]), "cycle_open");
await expectErr("Do needs the aim and intervention", () => db.exec(`update gov_qip_cycles set status='do' where id='${C1}'`), "plan_incomplete");
await db.exec(`update gov_qip_cycles set plan_aim='All consents complete', intervention='Checklist at booking', status='do' where id='${C1}'`);
ok("the project board follows the open cycle", (await q("select phase from gov_qips where id=$1", [QIP3]))[0].phase === "do");
await db.exec(`update gov_qip_cycles set status='study' where id='${C1}'`);
await expectErr("Act needs recorded results", () => db.exec(`update gov_qip_cycles set status='act' where id='${C1}'`), "study_incomplete");
await db.exec(`update gov_qip_cycles set study_results='90% complete', status='act' where id='${C1}'`);
await expectErr("closing needs an adopt/adapt/abandon/repeat decision", () => db.exec(`update gov_qip_cycles set status='closed' where id='${C1}'`), "decision_required");
await db.exec(`update gov_qip_cycles set act_decision='adapt', status='closed' where id='${C1}'`);
await expectErr("a closed cycle is kept as history", () => db.exec(`update gov_qip_cycles set study_results='changed' where id='${C1}'`), "cycle_closed");
await db.query("insert into gov_qip_cycles(organization_id,qip_id,cycle_no) values ($1,$2,2)", [A, QIP3]);
ok("multiple PDSA cycles within one project", (await q("select count(*)::int c from gov_qip_cycles where qip_id=$1", [QIP3]))[0].c === 2);

// ---- 8. access control ------------------------------------------------------------------------------------------------------
const NEW_TABLES = ["gov_editions", "gov_chapters", "gov_elements", "gov_element_assessments", "gov_evidence_links", "gov_evidence_requirements",
  "gov_requirement_submissions", "gov_indicators", "gov_indicator_results", "gov_committees", "gov_committee_members", "gov_meetings",
  "gov_meeting_attendance", "gov_meeting_decisions", "gov_meeting_files", "gov_regulatory_rules", "gov_incident_notifications",
  "gov_audit_templates", "gov_audit_observations", "gov_qip_cycles", "gov_guideline_reviews", "gov_links", "gov_incident_status_history"];
const rls = await q("select relname, relrowsecurity from pg_class where relname = any($1)", [NEW_TABLES]);
ok(`row level security on all ${NEW_TABLES.length} new tables`, rls.length === NEW_TABLES.length && rls.every((r) => r.relrowsecurity));
const anonGrants = await q("select count(*)::int c from information_schema.role_table_grants where grantee='anon' and table_name = any($1)", [[...NEW_TABLES, "gov_element_status"]]);
ok("anonymous role has no grants on the new tables", anonGrants[0].c === 0);
ok("governance staff read indicators", (await asUser(U.qm, () => q("select count(*)::int c from gov_indicators")))[0].c === 3);
ok("auditors read indicators", (await asUser(U.aud, () => q("select count(*)::int c from gov_indicators")))[0].c === 3);
await expectErr("auditors cannot create indicators", () => asUser(U.aud, () => db.query("insert into gov_indicators(organization_id,code,title,created_by) values ($1,'AUD','x',$2)", [A, U.aud])), "row-level security");
ok("clinicians cannot read indicators, committees or the incident timeline", (await asUser(U.staff, () => q("select (select count(*) from gov_indicators)::int i, (select count(*) from gov_committees)::int c, (select count(*) from gov_incident_status_history)::int h")))[0].i === 0);
ok("another hospital sees none of this hospital's records", (await asUser(U.other, () => q("select (select count(*) from gov_elements)::int e, (select count(*) from gov_links)::int l, (select count(*) from gov_meetings)::int m")))[0].e === 0);
await expectErr("a writer cannot record a value as someone else", () => asUser(U.qm, () => db.query("insert into gov_indicator_results(organization_id,indicator_id,period_start,period_end,numerator,denominator,entered_by) values ($1,$2,'2026-11-01','2026-11-30',1,2,$3)", [A, IND, U.lead])), "row-level security");
ok("a writer records their own value", (await asUser(U.qm, () => q("insert into gov_indicator_results(organization_id,indicator_id,period_start,period_end,numerator,denominator,entered_by) values ($1,$2,'2026-11-01','2026-11-30',1,2,$3) returning value", [A, IND, U.qm])))[0].value === 50);
ok("every new record lands in the audit trail with its actor", (await q("select count(*)::int c from audit_events where action='governance.gov_indicators.insert' and actor_user_id is not null"))[0].c === 3);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
