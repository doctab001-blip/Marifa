// Database tests for supabase/migrations/20261020120000_patient_orders_foundation.sql.
// Runs the real migration in an in-memory Postgres (PGlite) against a minimal stub of the tables it depends on
// (stub.sql), so no Supabase project, credentials or data are touched.
//
//   npm i --no-save @electric-sql/pglite
//   node supabase/tests/patient-orders/run.mjs
//
// Covers: apply is one transaction, duplicate guard, role/organisation checks, no signing, immutable patient/encounter,
// immutable signed/removed orders, no deletes, review rules, audit rows and row-level security.
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const migration = process.argv[2] ?? path.resolve(here, "../../migrations/20261020120000_patient_orders_foundation.sql");
const db = new PGlite();
await db.exec(fs.readFileSync(path.join(here, "stub.sql"), "utf8"));
await db.exec(fs.readFileSync(migration, "utf8"));
const q = async (sql, params) => (await db.query(sql, params)).rows;
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { if (cond) pass++; else fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + extra}`); };
const expectErr = async (name, fn, needle) => { try { await fn(); ok(name, false, "no error"); } catch (e) { ok(name, String(e.message).includes(needle), `got: ${e.message}`); } };

const U = { doc: "00000000-0000-4000-8000-000000000001", aud: "00000000-0000-4000-8000-000000000002", other: "00000000-0000-4000-8000-000000000003", plain: "00000000-0000-4000-8000-000000000004" };
const ORG_A = "aaaaaaaa-0000-4000-8000-000000000001", ORG_B = "bbbbbbbb-0000-4000-8000-000000000002";
const G = "11111111-0000-4000-8000-000000000001", GV = "22222222-0000-4000-8000-000000000001", GV_DRAFT = "22222222-0000-4000-8000-000000000002", G2 = "11111111-0000-4000-8000-000000000002", GV2 = "22222222-0000-4000-8000-000000000003";
await db.exec(`
 insert into organizations(id,name) values ('${ORG_A}','A'),('${ORG_B}','B');
 insert into profiles(id) values ('${U.doc}'),('${U.aud}'),('${U.other}'),('${U.plain}');
 insert into roles(code) values ('consultant'),('auditor'),('guideline_editor');
 insert into organization_memberships(id,organization_id,user_id,professional_level) values
   ('00000000-1111-4000-8000-000000000001','${ORG_A}','${U.doc}',null),
   ('00000000-1111-4000-8000-000000000002','${ORG_A}','${U.aud}',null),
   ('00000000-1111-4000-8000-000000000003','${ORG_B}','${U.other}',null),
   ('00000000-1111-4000-8000-000000000004','${ORG_A}','${U.plain}','consultant');
 insert into membership_roles select '00000000-1111-4000-8000-000000000001', id from roles where code='consultant';
 insert into membership_roles select '00000000-1111-4000-8000-000000000002', id from roles where code='auditor';
 insert into membership_roles select '00000000-1111-4000-8000-000000000003', id from roles where code='consultant';
 insert into clinical_guidelines(id,title,organization_id,status) values ('${G}','Test protocol',null,'approved'),('${G2}','Other org protocol','${ORG_B}','published');
 insert into guideline_versions(id,guideline_id,status,is_current) values ('${GV}','${G}','approved',true),('${GV_DRAFT}','${G}','draft',false),('${GV2}','${G2}','published',true);
 insert into patients(id,organization_id,mrn,full_name) values ('cccccccc-0000-4000-8000-000000000001','${ORG_A}','M1','Test One'),('cccccccc-0000-4000-8000-000000000002','${ORG_A}','M2','Test Two'),('cccccccc-0000-4000-8000-000000000003','${ORG_B}','M3','Test Three');
 insert into encounters(id,organization_id,patient_id) values ('dddddddd-0000-4000-8000-000000000001','${ORG_A}','cccccccc-0000-4000-8000-000000000001'),('dddddddd-0000-4000-8000-000000000002','${ORG_A}','cccccccc-0000-4000-8000-000000000002'),('dddddddd-0000-4000-8000-000000000003','${ORG_B}','cccccccc-0000-4000-8000-000000000003');
`);
const E1 = "dddddddd-0000-4000-8000-000000000001", E2 = "dddddddd-0000-4000-8000-000000000002", E3 = "dddddddd-0000-4000-8000-000000000003";
const protocol = (v = GV, id = G) => ({ id, version_id: v, version: "2.0", title: "Test protocol", source_module: "disease_management" });
const setItems = [
  { source_key: "inv:ruleIn:0", order_type: "laboratory", order_name: "Troponin", instructions: "", order_parameters: {}, required_information: [], condition_rules: [], requirement: "required", is_optional: false, display_order: 0 },
  { source_key: "inv:ruleIn:1", order_type: "imaging", order_name: "Chest X-ray", instructions: "", order_parameters: {}, required_information: [], condition_rules: [], requirement: "required", is_optional: false, display_order: 1 },
  { source_key: "med:0", order_type: "medication", order_name: "Aspirin", instructions: "", order_parameters: { dose: "300 mg" }, required_information: [], condition_rules: [{ kind: "branch", text: "STEMI" }], requirement: "conditional", is_optional: false, display_order: 2 },
];
const ord = (key, type, name, extra = {}) => ({ source_key: key, order_type: type, order_name: name, category: "", priority: null, indication: "", instructions: "", details: {}, status: "draft", incomplete: false, missing_fields: [], is_conditional: false, condition_text: "", condition_confirmed: false, allow_duplicate: false, modified_from_protocol: false, ...extra });
const apply = (actor, enc, orders, proto = protocol(), items = setItems) => q("select public.apply_protocol_orders($1,$2,$3,$4,$5) as r", [actor, enc, JSON.stringify(proto), JSON.stringify(items), JSON.stringify(orders)]);

// 1 happy path
const first = (await apply(U.doc, E1, [ord("inv:ruleIn:0", "laboratory", "Troponin"), ord("inv:ruleIn:1", "imaging", "Chest X-ray", { status: "reviewed" }), ord("med:0", "medication", "Aspirin", { is_conditional: true, condition_text: "STEMI", status: "reviewed", condition_confirmed: false }), ord(null, "laboratory", "Manual lactate")]))[0].r;
ok("apply creates 4 orders", first.created.length === 4);
const rows = await q("select order_name,status,is_manual from patient_orders where encounter_id=$1 order by order_name", [E1]);
ok("reviewed chest x-ray kept reviewed", rows.find(r => r.order_name === "Chest X-ray").status === "reviewed");
ok("conditional unconfirmed forced to draft", rows.find(r => r.order_name === "Aspirin").status === "draft");
ok("nothing signed", rows.every(r => r.status !== "signed"));
ok("manual order flagged", rows.find(r => r.order_name === "Manual lactate").is_manual === true);
ok("provenance only for protocol items", (await q("select count(*)::int c from patient_order_provenance"))[0].c === 3);
const prov = (await q("select protocol_id, protocol_version_id, protocol_version, source_module from patient_order_provenance limit 1"))[0];
ok("provenance has protocol, version id, version, module", prov.protocol_id === G && prov.protocol_version_id === GV && prov.protocol_version === "2.0" && prov.source_module === "disease_management");
ok("order set snapshot stored once with items", (await q("select count(*)::int c from protocol_order_items"))[0].c === 3 && (await q("select count(*)::int c from protocol_order_sets"))[0].c === 1);
ok("audit: application + per-order events", (await q("select count(*)::int c from audit_events where action='protocol.applied_to_encounter'"))[0].c === 1 && (await q("select count(*)::int c from audit_events where action='patient_order.created'"))[0].c === 4);
ok("audit actor recorded", (await q("select count(*)::int c from audit_events where action='patient_order.created' and actor_user_id=$1", [U.doc]))[0].c === 4);

// 2 duplicates
await expectErr("re-apply same protocol refused as duplicate", () => apply(U.doc, E1, [ord("inv:ruleIn:0", "laboratory", "Troponin")]), "duplicate_orders_require_review");
await expectErr("same name from manual order refused", () => apply(U.doc, E1, [ord(null, "laboratory", "troponin ")]), "duplicate_orders_require_review");
const dup = (await apply(U.doc, E1, [ord("inv:ruleIn:0", "laboratory", "Troponin", { allow_duplicate: true })]))[0].r;
ok("explicit allow_duplicate adds a second order", dup.created.length === 1);
ok("other encounter unaffected by duplicates", (await apply(U.doc, E2, [ord("inv:ruleIn:0", "laboratory", "Troponin")]))[0].r.created.length === 1);
ok("two patients' orders stored separately", (await q("select count(distinct patient_id)::int c from patient_orders"))[0].c === 2);

// 3 authorisation
await expectErr("auditor cannot create orders", () => apply(U.aud, E2, [ord(null, "laboratory", "X1")]), "not_authorised");
await expectErr("user from another org cannot touch this encounter", () => apply(U.other, E2, [ord(null, "laboratory", "X2")]), "not_authorised");
await expectErr("professional_level alone grants nothing", () => apply(U.plain, E2, [ord(null, "laboratory", "X3")]), "not_authorised");
await expectErr("unknown actor refused", () => apply(null, E2, [ord(null, "laboratory", "X4")]), "not_authenticated");
await expectErr("cannot apply to encounter of another org", () => apply(U.doc, E3, [ord(null, "laboratory", "X5")]), "not_authorised");
await expectErr("other org's protocol refused", () => apply(U.doc, E1, [ord(null, "laboratory", "X6")], protocol(GV2, G2)), "protocol_unavailable");
await expectErr("draft protocol version refused", () => apply(U.doc, E1, [ord(null, "laboratory", "X7")], protocol(GV_DRAFT, G)), "protocol_unavailable");
await expectErr("version/protocol mismatch refused", () => apply(U.doc, E1, [ord(null, "laboratory", "X8")], protocol(GV2, G)), "protocol_unavailable");
await expectErr("unknown protocol item refused", () => apply(U.doc, E1, [ord("nope:1", "laboratory", "Mystery")]), "unknown_protocol_item");

// 4 JWT identity cannot be spoofed
await db.exec(`select set_config('request.jwt.claim.sub','${U.doc}',false)`);
await expectErr("p_actor must match authenticated user", () => apply(U.other, E2, [ord(null, "laboratory", "S1")]), "actor_mismatch");
await db.exec(`select set_config('request.jwt.claim.sub','',false)`);

// 5 atomicity
const before = (await q("select (select count(*) from patient_orders)::int o, (select count(*) from patient_order_provenance)::int p, (select count(*) from audit_events)::int a"))[0];
await expectErr("bad second order rolls everything back", () => apply(U.doc, E2, [ord(null, "laboratory", "Good one"), ord(null, "not-a-type", "Bad one")]), "check");
const after = (await q("select (select count(*) from patient_orders)::int o, (select count(*) from patient_order_provenance)::int p, (select count(*) from audit_events)::int a"))[0];
ok("no partial writes after failure", JSON.stringify(before) === JSON.stringify(after), JSON.stringify({ before, after }));

// 6 closed encounter
await db.exec(`update encounters set status='closed', closed_at=now() where id='${E2}'`);
await expectErr("closed encounter refused", () => apply(U.doc, E2, [ord(null, "laboratory", "Late")]), "encounter_closed");

// 7 guards
const troponin = (await q("select id from patient_orders where encounter_id=$1 and order_name='Troponin' order by created_at limit 1", [E1]))[0].id;
const xray = (await q("select id from patient_orders where encounter_id=$1 and order_name='Chest X-ray'", [E1]))[0].id;
await expectErr("cannot sign an order via the protocol workflow", () => db.exec(`update patient_orders set status='signed' where id='${troponin}'`), "orders_cannot_be_signed");
await expectErr("order cannot move to another patient", () => db.exec(`update patient_orders set patient_id='cccccccc-0000-4000-8000-000000000002' where id='${troponin}'`), "order_patient_and_encounter_are_immutable");
await expectErr("order cannot move to another encounter", () => db.exec(`update patient_orders set encounter_id='${E2}' where id='${troponin}'`), "immutable");
await expectErr("orders are never deleted", () => db.exec(`delete from patient_orders where id='${troponin}'`), "never_deleted");
await expectErr("incomplete order cannot be reviewed", () => db.exec(`update patient_orders set incomplete=true, status='reviewed' where id='${troponin}'`), "incomplete_order_cannot_be_reviewed");
const aspirin = (await q("select id from patient_orders where order_name='Aspirin'"))[0].id;
await expectErr("unconfirmed condition cannot be reviewed", () => db.exec(`update patient_orders set status='reviewed' where id='${aspirin}'`), "unconfirmed_condition_cannot_be_reviewed");
await db.exec(`update patient_orders set condition_confirmed=true, status='reviewed', updated_by='${U.doc}' where id='${aspirin}'`);
ok("confirmed condition can be reviewed", (await q("select status, reviewed_by from patient_orders where id=$1", [aspirin]))[0].status === "reviewed");
await db.exec(`update patient_orders set instructions='edited by doctor', updated_by='${U.doc}' where id='${xray}'`);
const edited = (await q("select status,is_edited,instructions from patient_orders where id=$1", [xray]))[0];
ok("editing a reviewed order withdraws review and keeps the edit", edited.status === "draft" && edited.is_edited && edited.instructions === "edited by doctor");
await db.exec(`update patient_orders set status='cancelled', updated_by='${U.doc}' where id='${xray}'`);
await expectErr("removed order is final", () => db.exec(`update patient_orders set status='draft' where id='${xray}'`), "removed_order_is_final");
ok("removal audited", (await q("select count(*)::int c from audit_events where action='patient_order.removed'"))[0].c === 1);
ok("protocol edits never change stored order set", (await q("select count(*)::int c from protocol_order_items where order_name='Troponin'"))[0].c === 1);

// 8 RLS
await db.exec(`grant select on all tables in schema public to authenticated; grant execute on all functions in schema public to authenticated;`);
const asUser = async (uid, sql) => { await db.exec(`select set_config('request.jwt.claim.sub','${uid}',false); set role authenticated;`); try { return await q(sql); } finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub','',false)`); } };
ok("clinician sees own-org orders", (await asUser(U.doc, "select * from patient_orders")).length > 0);
ok("auditor can read orders", (await asUser(U.aud, "select * from patient_orders")).length > 0);
ok("other org sees none of org A's orders", (await asUser(U.other, `select * from patient_orders where organization_id='${ORG_A}'`)).length === 0);
ok("other org sees none of org A's patients", (await asUser(U.other, `select * from patients where organization_id='${ORG_A}'`)).length === 0);
ok("user with only professional_level sees nothing", (await asUser(U.plain, "select * from patient_orders")).length === 0);
await db.exec(`grant insert, update on patient_orders to authenticated`);
let denied = false; try { await asUser(U.aud, `update patient_orders set instructions='x' where id='${troponin}' returning id`).then(r => { denied = r.length === 0; }); } catch { denied = true; }
ok("auditor cannot modify orders (RLS)", denied);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
