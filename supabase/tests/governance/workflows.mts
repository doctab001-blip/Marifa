// End-to-end workflow tests. Each of the five module workflows is driven through the real database (every migration applied
// to an in-memory Postgres, real roles and row-level security), and after each step the dashboard KPIs are recomputed with
// the same scoring code the pages use, from rows read back out of the database.
//
//   npm i --no-save @electric-sql/pglite
//   npx tsx supabase/tests/governance/workflows.mts
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computeReadiness, summariseAuditsAndQips, summarisePolicies, summariseSafety, type PolicyAckSummary } from "../../../lib/governance/scoring";
import { DEFAULT_SETTINGS, type AuditRow, type CapaRow, type EvidenceRow, type IncidentRow, type PolicyRow, type QipRow, type StandardRow, type StandardStatusRow } from "../../../lib/governance/types";

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, "../../migrations");
const db = new PGlite({ extensions: { pgcrypto } });
let pass = 0, fail = 0;
const ok = (name: string, cond: boolean, extra = "") => { if (cond) pass++; else fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + extra}`); };
const q = async (sql: string, params?: unknown[]) => (await db.query(sql, params)).rows as Record<string, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
const expectErr = async (name: string, fn: () => Promise<unknown>, needle: string) => {
  try { await fn(); ok(name, false, "no error"); } catch (e) { ok(name, String((e as Error).message).includes(needle), `got: ${(e as Error).message}`); }
};

await db.exec(fs.readFileSync(path.join(here, "platform.sql"), "utf8"));
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".sql")).sort()) await db.exec(fs.readFileSync(path.join(dir, f), "utf8"));

const U = { lead: "00000000-0000-4000-8000-000000000001", qm: "00000000-0000-4000-8000-000000000002", cd: "00000000-0000-4000-8000-000000000003", nurse: "00000000-0000-4000-8000-000000000004", doc: "00000000-0000-4000-8000-000000000005" };
const A = "aaaaaaaa-0000-4000-8000-000000000001";
await db.exec(`
 insert into auth.users(id) values ${Object.values(U).map((u) => `('${u}')`).join(",")};
 insert into organizations(id,name,slug) values ('${A}','Hospital A','hospital-a');
 insert into profiles(id,display_name) values ${Object.entries(U).map(([k, u]) => `('${u}','${k}')`).join(",")};
 insert into roles(code,name) values ('governance_lead','Governance lead'),('consultant','Consultant'),('nurse','Nurse') on conflict (code) do nothing;
 insert into organization_memberships(id,organization_id,user_id) values ${Object.values(U).map((u, i) => `('10000000-0000-4000-8000-00000000000${i + 1}','${A}','${u}')`).join(",")};
 insert into membership_roles select '10000000-0000-4000-8000-000000000001', id from roles where code='governance_lead';
 insert into membership_roles select '10000000-0000-4000-8000-000000000002', id from roles where code='quality_manager';
 insert into membership_roles select '10000000-0000-4000-8000-000000000003', id from roles where code='clinical_director';
 insert into membership_roles select '10000000-0000-4000-8000-000000000004', id from roles where code='nurse';
 insert into membership_roles select '10000000-0000-4000-8000-000000000005', id from roles where code='consultant';
`);

const camel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
const rows = async <T,>(sql: string): Promise<T[]> => (await q(`select to_jsonb(t) j from (${sql}) t`)).map((r) => Object.fromEntries(Object.entries(r.j as Record<string, unknown>).map(([k, v]) => [camel(k), v])) as T);
const today = new Date();
const kpis = async () => {
  const standards = await rows<StandardRow>("select * from gov_standards");
  const statuses = await rows<StandardStatusRow>("select * from gov_standard_status");
  const evidence = await rows<EvidenceRow>("select * from gov_evidence");
  const policies = await rows<PolicyRow>("select * from gov_policies");
  const ack = await rows<PolicyAckSummary>("select * from gov_policy_ack_summary");
  const incidents = await rows<IncidentRow>("select * from gov_incidents");
  const capa = await rows<CapaRow>("select * from gov_capa");
  const audits = await rows<AuditRow>("select * from gov_audits");
  const qips = await rows<QipRow>("select * from gov_qips");
  return {
    readiness: computeReadiness(standards, statuses, evidence, DEFAULT_SETTINGS, today),
    policies: summarisePolicies(policies, ack, today),
    safety: summariseSafety(incidents, capa, today),
    audits: summariseAuditsAndQips(audits, qips, today),
  };
};
const asUser = async <T,>(uid: string, fn: () => Promise<T>): Promise<T> => {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${uid}',false);`);
  try { return await fn(); } finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub','',false);`); }
};

// An empty hospital must produce empty KPIs, never invented ones.
let k = await kpis();
ok("empty database: no outcome, no score, nothing assessed", k.readiness.outcome === null && k.readiness.overallPct === null && k.readiness.applicable === 0);
ok("empty database: no policies, incidents, audits or projects", k.policies.approved === 0 && k.safety.openIncidents === 0 && k.audits.completed === 0 && k.audits.activeQips === 0);

/* 1. Standards -> assessment -> evidence upload -> verification ------------------------------------------------ */
const ESR = "50000000-0000-4000-8000-000000000001", STD = "50000000-0000-4000-8000-000000000002";
await db.exec(`insert into gov_standards(id,organization_id,edition,chapter_code,chapter_name,code,description,is_esr,created_by) values
  ('${ESR}','${A}','Test ed.','IPC','Infection control','IPC.1','Hand hygiene programme',true,'${U.qm}'),
  ('${STD}','${A}','Test ed.','IPC','Infection control','IPC.2','Isolation rooms',false,'${U.qm}')`);
k = await kpis();
ok("W1 standards imported but unassessed: no outcome, score withheld", k.readiness.applicable === 2 && k.readiness.unassessed === 2 && k.readiness.outcome === null && k.readiness.overallPct === null);
const rate = (std: string, rating: string, notes = "", by = U.qm) => asUser(by, () => db.query("insert into gov_assessments(organization_id,standard_id,rating,notes,assessed_by) values ($1,$2,$3,$4,$5)", [A, std, rating, notes, by]));
await expectErr("W1 satisfactory refused with no evidence", () => rate(ESR, "satisfactory"), "evidence_required");
await rate(ESR, "partial", "Audit sample too small");
k = await kpis();
ok("W1 partial rating: 1 assessed, 50%, still no outcome", k.readiness.assessed === 1 && k.readiness.overallPct === 50 && k.readiness.outcome === null);
await asUser(U.qm, () => db.query("insert into gov_evidence(organization_id,standard_id,title,storage_path,file_name,uploaded_by) values ($1,$2,'IPC audit Q3',$3,'ipc.pdf',$4)", [A, ESR, `${A}/evidence/ipc.pdf`, U.qm]));
await rate(ESR, "satisfactory");
k = await kpis();
ok("W1 evidence then satisfactory: ESR now satisfactory", k.readiness.esrSatisfactory === 1 && k.readiness.satisfactoryWithoutCurrentEvidence === 0);
await asUser(U.nurse, async () => { try { await db.query("insert into gov_evidence(organization_id,standard_id,title,storage_path,file_name,uploaded_by) values ($1,$2,'x','x','x',$3)", [A, ESR, U.nurse]); ok("W1 clinician cannot upload evidence", false); } catch { ok("W1 clinician cannot upload evidence", true); } });
await db.exec(`insert into gov_evidence(organization_id,standard_id,title,storage_path,file_name,uploaded_by) values ('${A}','${STD}','Isolation audit','${A}/evidence/iso.pdf','iso.pdf','${U.qm}')`);
await rate(STD, "satisfactory");
k = await kpis();
ok("W1 every applicable standard assessed: outcome indicated, 100%", k.readiness.unassessed === 0 && k.readiness.overallPct === 100 && k.readiness.outcome === "accreditation", `${k.readiness.outcome} ${k.readiness.overallPct}`);
await db.exec(`update gov_evidence set withdrawn_at=now(), withdrawn_by='${U.qm}', withdrawn_reason='Superseded by newer audit' where standard_id='${ESR}'`);
k = await kpis();
ok("W1 verification: withdrawing the evidence downgrades the headline (counted as partial)", k.readiness.satisfactoryWithoutCurrentEvidence === 1 && k.readiness.overallPct === 75 && k.readiness.recordedPct === 100, `${k.readiness.overallPct}/${k.readiness.recordedPct}`);
ok("W1 and the ESR no longer counts as satisfactory, so the indication drops", k.readiness.esrNotSatisfactory === 1 && k.readiness.outcome === "denial_risk", String(k.readiness.outcome));

/* 2. Policy -> approval -> publication -> staff acknowledgement ------------------------------------------------ */
const P = "60000000-0000-4000-8000-000000000001";
await asUser(U.qm, () => db.query("insert into gov_policies(id,organization_id,title,document_number,version,created_by) values ($1,$2,'Hand hygiene','IPC-01','1.0',$3)", [P, A, U.qm]));
k = await kpis();
ok("W2 draft policy is not counted as approved", k.policies.approved === 0 && k.policies.drafts === 1);
await expectErr("W2 cannot go to review without a document", () => q("select * from gov_set_policy_status($1,$2,'under_committee_review')", [U.qm, P]), "document_required");
await db.exec(`update gov_policies set storage_path='${A}/policies/p.pdf', file_name='p.pdf', next_review_due=current_date + 365 where id='${P}'`);
await q("select * from gov_set_policy_status($1,$2,'under_committee_review')", [U.qm, P]);
await expectErr("W2 a nurse cannot approve", () => q("select * from gov_set_policy_status($1,$2,'approved')", [U.nurse, P]), "not_authorised");
await q("select * from gov_set_policy_status($1,$2,'approved')", [U.cd, P]);
k = await kpis();
ok("W2 clinical director approves: 1 approved, nobody assigned yet so no sign rate", k.policies.approved === 1 && k.policies.ackPct === null);
const published = await asUser(U.nurse, async () => (await q("select count(*)::int c from gov_policies where status='approved'"))[0].c);
ok("W2 publication: approved policy is visible to ordinary staff", published === 1);
const hiddenDraft = await asUser(U.nurse, async () => (await q("select count(*)::int c from gov_policies where status<>'approved'"))[0].c);
ok("W2 unapproved policies stay hidden from ordinary staff", hiddenDraft === 0);
await q("select gov_assign_policy($1,$2,current_date + 14,null)", [U.lead, P]);
k = await kpis();
ok("W2 assigned to everyone: 5 assigned, 0 signed, 0%", k.policies.assigned === 5 && k.policies.acknowledged === 0 && k.policies.ackPct === 0);
await asUser(U.nurse, () => q("select gov_acknowledge_policy($1,$2)", [U.nurse, P]));
await asUser(U.doc, () => q("select gov_acknowledge_policy($1,$2)", [U.doc, P]));
k = await kpis();
ok("W2 two staff acknowledge: 2 of 5, 40%", k.policies.acknowledged === 2 && k.policies.ackPct === 40, String(k.policies.ackPct));
await db.exec(`update gov_policy_assignments set due_date=current_date - 1 where policy_id='${P}'`);
k = await kpis();
ok("W2 past the deadline: the 3 unsigned are overdue", k.policies.overdueAssignments === 3);

/* 3. Incident -> risk assessment -> investigation -> CAPA -> verified closure ---------------------------------- */
const inc = (await asUser(U.nurse, () => q("insert into gov_incidents(organization_id,title,severity,likelihood,impact,reported_by) values ($1,'Look-alike vial near miss','medium',2,2,$2) returning id,reference", [A, U.nurse])))[0];
k = await kpis();
ok("W3 reported by a nurse: 1 open incident, not high risk", k.safety.openIncidents === 1 && k.safety.highRiskOpen === 0);
ok("W3 the nurse cannot reassess it afterwards", await asUser(U.nurse, async () => (await q("update gov_incidents set likelihood=5 where id=$1 returning id", [inc.id])).length === 0));
await asUser(U.qm, () => db.query("update gov_incidents set likelihood=4, impact=5, severity='critical', is_sentinel=true, status='under_investigation' where id=$1", [inc.id]));
k = await kpis();
ok("W3 risk assessment 4x5: high-risk and sentinel counted, RCA missing flagged", k.safety.highRiskOpen === 1 && k.safety.openSentinel === 1 && k.safety.sentinelMissingRca === 1);
await expectErr("W3 cannot close without root cause", () => db.exec(`update gov_incidents set status='closed', closure_note='done' where id='${inc.id}'`), "root_cause_required");
await db.exec(`update gov_incidents set root_cause='Look-alike packaging stored together' where id='${inc.id}'`);
const capa = (await q("insert into gov_capa(organization_id,incident_id,action,owner_user_id,due_date,created_by) values ($1,$2,'Segregate and relabel vials',$3,current_date + 30,$4) returning id", [A, inc.id, U.nurse, U.qm]))[0].id;
k = await kpis();
ok("W3 CAPA assigned: 1 open, RCA flag cleared", k.safety.capaOpen === 1 && k.safety.sentinelMissingRca === 0);
await q("select * from gov_set_capa_status($1,$2,'in_progress','')", [U.nurse, capa]);
await q("select * from gov_set_capa_status($1,$2,'done','')", [U.nurse, capa]);
k = await kpis();
ok("W3 owner marks done: awaiting verification, no longer open", k.safety.capaAwaitingVerification === 1 && k.safety.capaOpen === 0);
await expectErr("W3 incident still cannot close before verification", () => db.exec(`update gov_incidents set status='closed', closure_note='done' where id='${inc.id}'`), "capa_open");
await q("select * from gov_set_capa_status($1,$2,'verified','Spot-checked 30 vials, all segregated')", [U.cd, capa]);
await db.exec(`update gov_incidents set status='closed', closure_note='Verified closed' where id='${inc.id}'`);
k = await kpis();
ok("W3 verified closure: 0 open incidents, 0 awaiting verification", k.safety.openIncidents === 0 && k.safety.capaAwaitingVerification === 0 && k.safety.openSentinel === 0);
const trail = await q("select action, metadata::text m from audit_events where entity_id=$1 and action like 'governance.%'", [inc.id]);
ok("W3 the audit trail recorded the incident without its narrative text", trail.length >= 3 && trail.every((r) => !r.m.includes("Look-alike")), trail.map((r) => r.m).join(" | ").slice(0, 160));

/* 4. Audit -> findings -> improvement plan -> re-audit --------------------------------------------------------- */
const AU = "70000000-0000-4000-8000-000000000001";
await db.exec(`insert into gov_audits(id,organization_id,title,category,scheduled_for,recurrence_months,target_pct,owner_user_id,created_by) values ('${AU}','${A}','Hand hygiene Ward 4B','Hand hygiene',current_date + 7,3,95,'${U.nurse}','${U.qm}')`);
k = await kpis();
ok("W4 scheduled audit: due in 30 days, none complete", k.audits.scheduledNext30 === 1 && k.audits.completed === 0);
const nextAudit = (await asUser(U.nurse, () => q("select gov_complete_audit($1,$2,82,40,'8 lapses at point of care') as n", [U.nurse, AU])))[0].n as string;
k = await kpis();
ok("W4 findings below target: completed 1, below target 1, re-audit auto-scheduled", k.audits.completed === 1 && k.audits.belowTarget === 1 && nextAudit !== null && k.audits.scheduledNext30 + (await q("select count(*)::int c from gov_audits where status='scheduled'"))[0].c >= 1);
await db.exec(`insert into gov_capa(organization_id,audit_id,action,kind,owner_user_id,due_date,created_by) values ('${A}','${AU}','Re-train ward 4B and add dispensers','corrective','${U.nurse}',current_date + 21,'${U.qm}')`);
k = await kpis();
ok("W4 improvement plan from the audit shows as an open action", k.safety.capaOpen === 1);
await db.exec(`update gov_audits set scheduled_for=current_date where id='${nextAudit}'`);
await q("select gov_complete_audit($1,$2,97,40,'No lapses')", [U.qm, nextAudit]);
k = await kpis();
ok("W4 re-audit meets target: completed 2, below-target count stays at the historic 1", k.audits.completed === 2 && k.audits.belowTarget === 1);

/* 5. QIP -> PDSA cycle -> outcome measurement ------------------------------------------------------------------- */
const QIP = "80000000-0000-4000-8000-000000000001";
await db.exec(`insert into gov_qips(id,organization_id,title,aim,measure,unit,baseline_value,target_value,current_value,created_by) values ('${QIP}','${A}','Door-to-ECG','Under 10 min by March','Median door-to-ECG','minutes',18,10,18,'${U.qm}')`);
k = await kpis();
ok("W5 project in Plan: 1 active", k.audits.activeQips === 1);
for (const [phase, value] of [["do", 15], ["study", 12], ["act", 9]] as const) await db.exec(`update gov_qips set phase='${phase}', current_value=${value} where id='${QIP}'`);
const qrow = (await q("select phase, current_value::float v from gov_qips where id=$1", [QIP]))[0];
ok("W5 PDSA cycle reached Act with the measured outcome beating the target (9 < 10 min)", qrow.phase === "act" && qrow.v <= 10);
await db.exec(`update gov_qips set status='completed' where id='${QIP}'`);
k = await kpis();
ok("W5 completing the project removes it from the active count", k.audits.activeQips === 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
