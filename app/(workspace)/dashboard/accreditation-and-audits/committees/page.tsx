import Link from "next/link";
import { CalendarClock, Plus, Users } from "lucide-react";
import { createCommitteeAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions-v21";
import { Badge, Details, Empty, NeedsV21, Notice, PageHeader, Stat, nameOf, pageParam } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate, formatStamp } from "@/lib/governance/clock";
import { canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import { loadCapa, loadPeople, openContext } from "@/lib/governance/repository";
import { loadCommitteeMembers, loadCommittees, loadMeetings, v21 } from "@/lib/governance/repository-v21";
import { COMMITTEE_TEMPLATES, FREQUENCY_LABEL, MEETING_STATUS_LABEL } from "@/lib/governance/committees";
import { isCapaOverdue } from "@/lib/governance/scoring";

const BASE = "/dashboard/accreditation-and-audits";

export default async function CommitteesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const templateKey = pageParam(sp.template);
  const actor = await getGovernanceActor();
  const header = <PageHeader icon={<Users size={20} />} title="Committees" subtitle="Committee profiles, meetings, minutes and decisions. Actions agreed at a meeting go into the same action tracker as incident and audit actions." />;
  if (!canReadGovernance(actor)) return <>{header}<p className="gh-notice gh-notice-bad" role="alert">Committees are visible to governance staff and auditors.</p></>;
  const canWrite = canWriteGovernance(actor);
  const ctx = await openContext(actor);
  const loaded = await v21(Promise.all([loadCommittees(ctx), loadCommitteeMembers(ctx), loadMeetings(ctx)]));
  if (!loaded) return <>{header}<NeedsV21 what="Committee management" /></>;
  const [committees, members, meetings] = loaded;
  const [people, capa] = await Promise.all([loadPeople(ctx).catch(() => []), loadCapa(ctx).catch(() => [])]);
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  const now = currentDate();
  const template = COMMITTEE_TEMPLATES.find((t) => t.key === templateKey);
  const meetingIds = new Set(meetings.map((m) => m.id));
  // Meeting actions are CAPA rows; capa rows from loadCapa don't carry meeting_id, so match by the extras on the detail page.
  const upcoming = meetings.filter((m) => m.status === "scheduled" && m.scheduledAt >= now.toISOString()).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const awaitingMinutes = meetings.filter((m) => m.status === "held" || m.status === "minutes_drafted");
  const usedTemplates = new Set(committees.map((c) => c.templateKey).filter(Boolean));

  return (
    <>
      {header}
      <Notice done={pageParam(sp.done)} error={pageParam(sp.error)} />
      <div className="gh-grid">
        <Stat accent="indigo" icon={<Users size={15} />} label="Active committees" value={committees.filter((c) => c.status === "active").length} note={`${members.length} memberships`} />
        <Stat accent="indigo" icon={<CalendarClock size={15} />} label="Upcoming meetings" value={upcoming.length} note={upcoming[0] ? `Next: ${formatStamp(upcoming[0].scheduledAt)}` : "None scheduled"} />
        <Stat accent="gold" label="Minutes awaiting approval" value={awaitingMinutes.length} tone={awaitingMinutes.length > 0 ? "warn" : "ok"} note={awaitingMinutes.length > 0 ? "Held but not yet approved" : "All approved"} />
        <Stat accent="coral" label="Overdue actions (all sources)" value={capa.filter((c) => isCapaOverdue(c, now)).length} href={`${BASE}/incidents?show=capa_overdue`} note="Committee, incident and audit actions" />
      </div>

      {canWrite ? (
        <Details title={template ? `New committee from template: ${template.name}` : "Set up a committee"} open={Boolean(template) || committees.length === 0}>
          <div className="gh-panel-soft">
            <strong>Suggested structures</strong> <span className="gh-meta">— rename, merge or ignore them. Nothing is created until you save.</span>
            <div className="gh-chiplist" style={{ marginTop: ".45rem" }}>
              {COMMITTEE_TEMPLATES.map((t) => <Link key={t.key} className="gh-chip" href={`${BASE}/committees?template=${t.key}`}>{t.name}{usedTemplates.has(t.key) ? " ✓" : ""}</Link>)}
              {template ? <Link className="gh-chip" href={`${BASE}/committees`}>Blank form</Link> : null}
            </div>
          </div>
          <form key={templateKey || "blank"} action={createCommitteeAction} className="gh-form">
            <input type="hidden" name="returnTo" value={`${BASE}/committees`} /><input type="hidden" name="templateKey" value={template?.key ?? ""} />
            <label className="gh-field gh-wide">Committee name<input name="name" required maxLength={200} defaultValue={template?.name} /></label>
            <label className="gh-field gh-wide">Purpose / terms of reference<textarea name="purpose" maxLength={4000} defaultValue={template?.purpose} /></label>
            <label className="gh-field">Chair<select name="chairUserId" defaultValue=""><option value="">Choose later</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
            <label className="gh-field">Secretary<select name="secretaryUserId" defaultValue=""><option value="">Choose later</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
            <label className="gh-field">Meeting frequency<select name="meetingFrequency" defaultValue={template?.frequency ?? "monthly"}>{Object.entries(FREQUENCY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <div><button className="ui-button ui-button-primary" type="submit"><Plus size={15} aria-hidden="true" /> Create committee</button></div>
          </form>
        </Details>
      ) : null}

      {committees.length === 0 ? <Empty title="No committees yet">{canWrite ? "Set one up above, or start from a suggested structure." : "No committees have been set up."}</Empty> : (
        <div className="gh-ind-grid">
          {committees.map((c) => {
            const mine = meetings.filter((m) => m.committeeId === c.id);
            const next = mine.filter((m) => m.status === "scheduled").sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
            const last = mine.filter((m) => m.status !== "scheduled" && m.status !== "cancelled").sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))[0];
            return (
              <Link key={c.id} href={`${BASE}/committees/${c.id}`} className="gh-card gh-card-link gh-ind">
                <div className="gh-ind-head"><h3 style={{ margin: 0 }}>{c.name}</h3><Badge tone={c.status === "active" ? "ok" : "muted"}>{c.status === "active" ? "Active" : "Inactive"}</Badge></div>
                {c.purpose ? <span className="gh-meta gh-clamp">{c.purpose}</span> : null}
                <div className="gh-ind-meta">
                  <span>Chair: {nameOf(peopleById, c.chairUserId)}</span>
                  <span>Secretary: {nameOf(peopleById, c.secretaryUserId)}</span>
                  <span>{members.filter((m) => m.committeeId === c.id).length} members</span>
                  <span>{FREQUENCY_LABEL[c.meetingFrequency]}</span>
                </div>
                <div className="gh-btnrow">
                  {next ? <Badge tone="info">Next {formatStamp(next.scheduledAt)}</Badge> : <Badge tone="warn">No meeting scheduled</Badge>}
                  {last ? <Badge tone={last.status === "approved" || last.status === "actions_followed_up" ? "ok" : "warn"}>Last: {MEETING_STATUS_LABEL[last.status]}</Badge> : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {meetingIds.size > 0 ? <p className="gh-meta">Approved minutes are frozen: attendance, decisions and minutes can no longer be changed after approval.</p> : null}
    </>
  );
}
