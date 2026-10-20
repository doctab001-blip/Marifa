import Link from "next/link";
import { acknowledgePolicyAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions";
import { formatDate, formatStamp } from "@/lib/governance/clock";
import type { PolicyRow } from "@/lib/governance/types";
import { Badge, Empty } from "@/components/accreditation/ui";

type Task = { policy: PolicyRow; dueDate: string | null; acknowledgedAt: string | null };

/** The signed-in person's own read-and-sign queue. Every staff member sees this, whatever their role. */
export function MyPolicies({ tasks, todayIso, signedUrls, returnTo }: { tasks: Task[]; todayIso: string; signedUrls: Record<string, string | null>; returnTo: string }) {
  const pending = tasks.filter((task) => !task.acknowledgedAt);
  const done = tasks.filter((task) => task.acknowledgedAt);
  return (
    <section className="gh-card" aria-labelledby="my-policies-heading">
      <h2 id="my-policies-heading">Policies assigned to you</h2>
      <p className="gh-sub">Read each policy, then confirm you have read and understood it. Your confirmation is recorded with the date and time.</p>
      {tasks.length === 0 ? (
        <Empty title="Nothing assigned to you">No policies are waiting for your acknowledgement.</Empty>
      ) : (
        <div className="gh-timeline">
          {pending.map(({ policy, dueDate }) => {
            const overdue = dueDate !== null && dueDate < todayIso;
            const url = signedUrls[policy.id];
            return (
              <div className="gh-item" key={policy.id}>
                <div className="gh-btnrow" style={{ justifyContent: "space-between" }}>
                  <h4>{policy.title} <span className="gh-meta">v{policy.version}{policy.documentNumber ? ` · ${policy.documentNumber}` : ""}</span></h4>
                  {dueDate ? <Badge tone={overdue ? "bad" : "info"}>{overdue ? "Overdue · " : "Due "}{formatDate(dueDate)}</Badge> : <Badge tone="muted">No due date</Badge>}
                </div>
                <div className="gh-btnrow">
                  {url ? <a className="ui-button" href={url} target="_blank" rel="noopener noreferrer">Open document</a> : <span className="gh-meta">No document attached.</span>}
                  <form action={acknowledgePolicyAction}>
                    <input type="hidden" name="policyId" value={policy.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <button className="ui-button ui-button-primary" type="submit">I have read and understood this policy</button>
                  </form>
                </div>
              </div>
            );
          })}
          {done.length > 0 ? <div className="gh-month">Already acknowledged</div> : null}
          {done.map(({ policy, acknowledgedAt }) => (
            <div className="gh-row" key={policy.id} style={{ gridTemplateColumns: "1fr auto" }}>
              <span><strong>{policy.title}</strong> <span className="gh-meta">v{policy.version}</span></span>
              <Badge tone="ok">Acknowledged {formatStamp(acknowledgedAt)}</Badge>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function GovernanceLink({ href, children }: { href: string; children: string }) {
  return <Link className="ui-button" href={href}>{children}</Link>;
}
