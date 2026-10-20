import type { AuditOverview, Milestones, PolicyOverview, Readiness, SafetyOverview } from "@/lib/governance/scoring";

/**
 * The "fix this first" list on the readiness page. Every item is derived from counts of real records, ordered by how likely it is
 * to cost accreditation (unmet ESRs and unsafe incident handling first, housekeeping last). Nothing is invented: with no records
 * the only item is "import your standards".
 */

const BASE = "/dashboard/accreditation-and-audits";

export type PriorityTone = "bad" | "warn" | "info";
export type PriorityAction = { id: string; tone: PriorityTone; title: string; hint: string; href: string };

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function buildPriorities(input: {
  readiness: Readiness;
  policies: PolicyOverview;
  safety: SafetyOverview;
  audits: AuditOverview;
  milestones: Milestones | null;
}): PriorityAction[] {
  const { readiness: r, policies: p, safety: s, audits: a, milestones: m } = input;
  const out: PriorityAction[] = [];
  const add = (id: string, tone: PriorityTone, title: string, hint: string, href: string) => out.push({ id, tone, title, hint, href });

  if (r.totalStandards === 0) {
    add("import", "info", "Import your standards register", "Nothing can be scored until the standards you are surveyed against are loaded.", `${BASE}/standards`);
    return out;
  }

  if (r.esrNotSatisfactory > 0) {
    add("esr", "bad", `${plural(r.esrNotSatisfactory, "essential safety requirement")} not satisfactory`, "Every ESR must be satisfactory for full accreditation.", `${BASE}/standards?show=esr_gap`);
  }
  if (s.sentinelMissingRca > 0) {
    add("rca", "bad", `${plural(s.sentinelMissingRca, "open sentinel incident")} without a root cause`, "Record the root cause analysis and corrective actions.", `${BASE}/incidents?status=open`);
  }
  if (s.capaOverdue > 0) {
    add("capa-overdue", "bad", `${plural(s.capaOverdue, "corrective action")} overdue`, "Chase the owners or agree a new deadline in writing.", `${BASE}/incidents?show=capa_overdue`);
  }
  if (r.satisfactoryWithoutCurrentEvidence > 0) {
    add("evidence-gap", "bad", `${plural(r.satisfactoryWithoutCurrentEvidence, "standard")} rated satisfactory without current evidence`, "A surveyor will ask to see it. Attach current evidence or re-rate honestly.", `${BASE}/standards?show=no_evidence`);
  }
  if (r.unassessed > 0) {
    add("unassessed", "warn", `${plural(r.unassessed, "standard")} not yet assessed`, "No outcome is indicated until every applicable standard has an assessment.", `${BASE}/standards?show=unassessed`);
  }
  if (m && m.daysToExpiry <= 180) {
    add("expiry", "warn", m.daysToExpiry < 0 ? "Accreditation has expired" : `Accreditation expires in ${plural(m.daysToExpiry, "day")}`, `Re-accreditation update due ${m.reaccreditationUpdateDue}.`, `${BASE}/settings`);
  }
  if (p.reviewOverdue > 0) {
    add("policy-review", "warn", `${plural(p.reviewOverdue, "approved policy", "approved policies")} overdue for review`, "Out-of-date policies are one of the easiest findings to avoid.", `${BASE}/policies`);
  }
  if (p.overdueAssignments > 0) {
    add("sign-overdue", "warn", `${plural(p.overdueAssignments, "read-and-sign assignment")} overdue`, "Open the policy to see who has not signed.", `${BASE}/policies`);
  }
  if (a.overdue > 0) {
    add("audit-overdue", "warn", `${plural(a.overdue, "audit")} past its scheduled date`, "Complete it or reschedule with a reason.", `${BASE}/audits`);
  }
  if (a.belowTarget > 0) {
    add("audit-target", "warn", `${plural(a.belowTarget, "completed audit")} below target`, "Raise a corrective action for each, then re-audit.", `${BASE}/audits`);
  }
  if (r.expiringEvidence > 0) {
    add("evidence-expiring", "info", `Evidence for ${plural(r.expiringEvidence, "standard")} expires within 60 days`, "Replace it before it lapses.", `${BASE}/standards?show=evidence_expiring`);
  }
  if (r.reviewOverdue > 0) {
    add("standard-review", "info", `${plural(r.reviewOverdue, "standard")} due for re-assessment`, "The last assessment is older than its review date.", `${BASE}/standards?show=review_overdue`);
  }
  if (s.capaAwaitingVerification > 0) {
    add("capa-verify", "info", `${plural(s.capaAwaitingVerification, "completed action")} awaiting verification`, "Check each fix worked, then verify it with a note.", `${BASE}/incidents`);
  }
  if (p.inReview > 0) {
    add("policy-committee", "info", `${plural(p.inReview, "policy", "policies")} waiting for committee decision`, "Approve, or return to draft with comments.", `${BASE}/policies`);
  }
  return out;
}
