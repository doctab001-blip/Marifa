import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Users } from "lucide-react";
import {
  addDecisionAction, addMeetingActionAction, addMemberAction, recordAttendanceAction, removeMemberAction, saveMeetingAction, scheduleMeetingAction,
  setMeetingStatusAction, updateCommitteeAction, uploadMeetingFileAction,
} from "@/app/(workspace)/dashboard/accreditation-and-audits/actions-v21";
import { setCapaStatusAction } from "@/app/(workspace)/dashboard/accreditation-and-audits/actions";
import { DropZone } from "@/components/accreditation/drop-zone";
import { LinkPanel } from "@/components/accreditation/link-panel";
import { Badge, Details, Empty, NeedsV21, Notice, PageHeader, Stepper, nameOf, pageParam, type Tone } from "@/components/accreditation/ui";
import { getGovernanceActor } from "@/lib/governance/auth";
import { currentDate, formatBytes, formatDate, formatStamp } from "@/lib/governance/clock";
import {
  ATTENDANCE_LABEL, FREQUENCY_LABEL, MEETING_STATUS_LABEL, MEETING_STEPS, MEMBER_ROLE_LABEL, allowedMeetingTransitions, attendanceSummary, isMinutesFrozen,
  transitionProblem, type MeetingStatus,
} from "@/lib/governance/committees";
import { canReadGovernance, canWriteGovernance } from "@/lib/governance/policy";
import { loadCapa, loadPeople, openContext, signedUrl } from "@/lib/governance/repository";
import {
  loadAttendance, loadCapaExtras, loadCommitteeMembers, loadCommittees, loadDecisions, loadLinkCatalogue, loadLinks, loadMeetingFiles, loadMeetings, v21,
} from "@/lib/governance/repository-v21";
import { isCapaOverdue, isoDate } from "@/lib/governance/scoring";

const BASE = "/dashboard/accreditation-and-audits";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NEXT_LABEL: Partial<Record<MeetingStatus, string>> = { held: "Mark as held", minutes_drafted: "Minutes drafted", approved: "Approve minutes", actions_followed_up: "Actions followed up", cancelled: "Cancel meeting" };
const STATUS_TONE: Record<MeetingStatus, Tone> = { scheduled: "info", held: "warn", minutes_drafted: "warn", approved: "ok", actions_followed_up: "ok", cancelled: "muted" };
// Riyadh time, matching how timestamps are displayed (UTC+3, no daylight saving).
const toLocalInput = (iso: string | null) => (iso ? new Date(Date.parse(iso) + 3 * 3_600_000).toISOString().slice(0, 16) : "");

export default async function CommitteePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!UUID.test(id)) notFound();
  const actor = await getGovernanceActor();
  if (!canReadGovernance(actor)) return <p className="gh-notice gh-notice-bad" role="alert">Committees are visible to governance staff and auditors.</p>;
  const canWrite = canWriteGovernance(actor);
  const myUserId = actor.userId;
  const ctx = await openContext(actor);
  const loaded = await v21(Promise.all([loadCommittees(ctx), loadCommitteeMembers(ctx, id), loadMeetings(ctx, id)]));
  if (!loaded) return <NeedsV21 what="Committee management" />;
  const [committees, members, meetings] = loaded;
  const committee = committees.find((c) => c.id === id);
  if (!committee) notFound();
  const today = currentDate();
  const meetingParam = pageParam(sp.meeting);
  const selected = meetings.find((m) => m.id === meetingParam) ?? null;
  const here = `${BASE}/committees/${id}`;
  const meetingHere = selected ? `${here}?meeting=${selected.id}` : here;

  const [people, capa, extras, decisions, attendance, files, links, catalogue] = await Promise.all([
    loadPeople(ctx).catch(() => []), loadCapa(ctx).catch(() => []), v21(loadCapaExtras(ctx)), v21(loadDecisions(ctx, meetings.map((m) => m.id))),
    selected ? v21(loadAttendance(ctx, selected.id)) : Promise.resolve([]), selected ? v21(loadMeetingFiles(ctx, selected.id)) : Promise.resolve([]),
    v21(loadLinks(ctx)), v21(loadLinkCatalogue(ctx, ["policy", "guideline", "standard", "element", "capa", "audit", "qip"])),
  ]);
  const peopleById = new Map(people.map((p) => [p.userId, p.displayName]));
  const memberIds = new Set(members.map((m) => m.userId));
  const meetingActions = capa.filter((c) => extras?.get(c.id)?.meetingId && meetings.some((m) => m.id === extras.get(c.id)?.meetingId));
  const selectedActions = selected ? meetingActions.filter((c) => extras?.get(c.id)?.meetingId === selected.id) : [];
  const selectedDecisions = selected ? (decisions ?? []).filter((d) => d.meetingId === selected.id) : [];
  const fileUrls = new Map<string, string | null>();
  for (const f of files ?? []) fileUrls.set(f.id, await signedUrl(ctx, f.storagePath));
  const openActionCount = selectedActions.filter((c) => c.status === "open" || c.status === "in_progress").length;
  const frozen = selected ? isMinutesFrozen(selected.status) : false;
  const summary = selected ? attendanceSummary(members, attendance ?? []) : null;
  const attendanceBy = new Map((attendance ?? []).map((a) => [a.userId, a.status]));

  return (
    <>
      <PageHeader icon={<Users size={20} />} eyebrow={<><Link href={`${BASE}/committees`}>Committees</Link> / Profile</>} title={committee.name}
        subtitle={committee.purpose || "No purpose recorded yet."}
        actions={<><Badge tone={committee.status === "active" ? "ok" : "muted"}>{committee.status === "active" ? "Active" : "Inactive"}</Badge><Badge tone="info">{FREQUENCY_LABEL[committee.meetingFrequency]}</Badge></>} />
      <Notice done={pageParam(sp.done)} error={pageParam(sp.error)} />

      <div className="gh-split">
        <section className="gh-card" aria-labelledby="meetings-heading">
          <div className="gh-head"><h2 id="meetings-heading" className="gh-section-title" style={{ margin: 0 }}>Meetings</h2></div>
          {canWrite ? (
            <div style={{ margin: ".6rem 0" }}>
              <Details title="Schedule a meeting" open={meetings.length === 0}>
                <form action={scheduleMeetingAction} className="gh-form">
                  <input type="hidden" name="committeeId" value={id} /><input type="hidden" name="returnTo" value={here} />
                  <label className="gh-field">Date and time<input type="datetime-local" name="scheduledAt" required /></label>
                  <label className="gh-field">Location<input name="location" maxLength={200} placeholder="Room or online link" /></label>
                  <label className="gh-field gh-wide">Agenda<textarea name="agenda" maxLength={8000} placeholder="1. Minutes of the last meeting&#10;2. Action log&#10;3. …" /></label>
                  <div><button className="ui-button ui-button-primary" type="submit"><CalendarClock size={15} aria-hidden="true" /> Schedule</button></div>
                </form>
              </Details>
            </div>
          ) : null}
          {meetings.length === 0 ? <Empty title="No meetings yet">Schedule the first meeting to start the record.</Empty> : (
            <ul className="gh-actions">
              {meetings.map((m) => {
                const acts = meetingActions.filter((c) => extras?.get(c.id)?.meetingId === m.id);
                return (
                  <li key={m.id}>
                    <Link className="gh-action" href={`${here}?meeting=${m.id}#meeting`} aria-current={selected?.id === m.id ? "true" : undefined} style={{ gridTemplateColumns: "auto 1fr auto" }}>
                      <span className={`gh-dot gh-dot-${m.status === "cancelled" ? "info" : isMinutesFrozen(m.status) ? "ok" : "warn"}`} aria-hidden="true" />
                      <span><strong>{formatStamp(m.scheduledAt)}</strong><span className="gh-hint">{m.location || "No location"} · {(decisions ?? []).filter((d) => d.meetingId === m.id).length} decisions · {acts.length} actions{acts.some((c) => isCapaOverdue(c, today)) ? " · overdue action" : ""}</span></span>
                      <Badge tone={STATUS_TONE[m.status]}>{MEETING_STATUS_LABEL[m.status]}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div style={{ display: "grid", gap: ".9rem" }}>
          <section className="gh-card" aria-labelledby="members-heading">
            <h2 id="members-heading" className="gh-section-title">Membership</h2>
            <dl className="gh-kv"><dt>Chair</dt><dd>{nameOf(peopleById, committee.chairUserId)}</dd><dt>Secretary</dt><dd>{nameOf(peopleById, committee.secretaryUserId)}</dd></dl>
            {members.length === 0 ? <p className="gh-meta">No members yet.</p> : (
              <ul className="gh-actions" style={{ marginTop: ".6rem" }}>
                {members.map((m) => (
                  <li key={m.id} className="gh-row" style={{ gridTemplateColumns: "1fr auto auto" }}>
                    <span>{nameOf(peopleById, m.userId)}</span><Badge tone="muted">{MEMBER_ROLE_LABEL[m.memberRole]}</Badge>
                    {canWrite ? <form action={removeMemberAction}><input type="hidden" name="memberId" value={m.id} /><input type="hidden" name="committeeId" value={id} /><input type="hidden" name="returnTo" value={here} /><button className="ui-button" type="submit" aria-label={`Remove ${nameOf(peopleById, m.userId)}`}>Remove</button></form> : null}
                  </li>
                ))}
              </ul>
            )}
            {canWrite ? (
              <Details title="Add a member">
                <form action={addMemberAction} className="gh-form">
                  <input type="hidden" name="committeeId" value={id} /><input type="hidden" name="returnTo" value={here} />
                  <label className="gh-field">Person<select name="userId" required defaultValue=""><option value="" disabled>Choose…</option>{people.filter((p) => !memberIds.has(p.userId)).map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                  <label className="gh-field">Role<select name="memberRole" defaultValue="member">{Object.entries(MEMBER_ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                  <div><button className="ui-button" type="submit">Add</button></div>
                </form>
              </Details>
            ) : null}
          </section>
          {canWrite ? (
            <Details title="Edit committee profile">
              <form action={updateCommitteeAction} className="gh-form">
                <input type="hidden" name="committeeId" value={id} /><input type="hidden" name="returnTo" value={here} />
                <label className="gh-field gh-wide">Purpose<textarea name="purpose" maxLength={4000} defaultValue={committee.purpose} /></label>
                <label className="gh-field">Chair<select name="chairUserId" defaultValue={committee.chairUserId ?? ""}><option value="">None</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                <label className="gh-field">Secretary<select name="secretaryUserId" defaultValue={committee.secretaryUserId ?? ""}><option value="">None</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                <label className="gh-field">Frequency<select name="meetingFrequency" defaultValue={committee.meetingFrequency}>{Object.entries(FREQUENCY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                <label className="gh-field">Status<select name="status" defaultValue={committee.status}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
                <div><button className="ui-button" type="submit">Save profile</button></div>
              </form>
            </Details>
          ) : null}
          {links && catalogue ? <LinkPanel title="Linked accreditation requirements" sourceType="committee" sourceId={id} links={links} catalogue={catalogue} allow={["standard", "element", "policy", "guideline"]} canWrite={canWrite} returnTo={here} hint="The standards and policies this committee is accountable for." /> : null}
        </div>
      </div>

      {selected ? (
        <section className="gh-card" id="meeting" aria-labelledby="meeting-heading" style={{ display: "grid", gap: ".9rem" }}>
          <div className="gh-head">
            <div><div className="gh-eyebrow">Meeting</div><h2 id="meeting-heading" style={{ margin: 0 }}>{formatStamp(selected.scheduledAt)}{selected.location ? ` · ${selected.location}` : ""}</h2></div>
            <Badge tone={STATUS_TONE[selected.status]}>{MEETING_STATUS_LABEL[selected.status]}</Badge>
          </div>
          <Stepper label="Meeting workflow" steps={MEETING_STEPS} current={selected.status} branch={selected.status === "cancelled" ? { label: "Cancelled", tone: "muted" } : null} />
          {canWrite && allowedMeetingTransitions(selected.status).length > 0 ? (
            <div className="gh-btnrow">
              {allowedMeetingTransitions(selected.status).map((to) => {
                const problem = transitionProblem(selected, to, openActionCount);
                return (
                  <form key={to} action={setMeetingStatusAction}>
                    <input type="hidden" name="meetingId" value={selected.id} /><input type="hidden" name="committeeId" value={id} /><input type="hidden" name="status" value={to} /><input type="hidden" name="returnTo" value={meetingHere} />
                    <button className={`ui-button${to === "cancelled" ? " ui-button-danger" : to === "held" && selected.status === "minutes_drafted" ? "" : " ui-button-primary"}`} type="submit" disabled={Boolean(problem)} title={problem ?? undefined}>
                      {to === "held" && selected.status === "minutes_drafted" ? "Back to drafting" : NEXT_LABEL[to]}
                    </button>
                  </form>
                );
              })}
              {(() => { const blocked = allowedMeetingTransitions(selected.status).map((to) => transitionProblem(selected, to, openActionCount)).filter(Boolean); return blocked.length ? <span className="gh-meta">{blocked[0]}</span> : null; })()}
            </div>
          ) : null}
          {selected.minutesApprovedAt ? <p className="gh-meta" style={{ margin: 0 }}>Minutes approved by {nameOf(peopleById, selected.minutesApprovedBy)} on {formatStamp(selected.minutesApprovedAt)}. They can no longer be edited.</p> : null}

          <div className="gh-grid-2">
            <div style={{ display: "grid", gap: ".7rem" }}>
              <h3 className="gh-section-title" style={{ margin: 0 }}>Agenda and minutes</h3>
              {canWrite && !frozen && selected.status !== "cancelled" ? (
                <form action={saveMeetingAction} className="gh-form">
                  <input type="hidden" name="meetingId" value={selected.id} /><input type="hidden" name="committeeId" value={id} /><input type="hidden" name="returnTo" value={meetingHere} />
                  <label className="gh-field">Location<input name="location" maxLength={200} defaultValue={selected.location} /></label>
                  <label className="gh-field">Next meeting<input type="datetime-local" name="nextMeetingAt" defaultValue={toLocalInput(selected.nextMeetingAt)} /></label>
                  <label className="gh-field gh-wide">Agenda<textarea name="agenda" maxLength={8000} defaultValue={selected.agenda} rows={5} /></label>
                  <label className="gh-field gh-wide">Minutes<textarea name="minutes" maxLength={20000} defaultValue={selected.minutes} rows={8} placeholder={selected.status === "scheduled" ? "Write the minutes once the meeting has been held." : ""} /></label>
                  <div><button className="ui-button" type="submit">Save</button></div>
                </form>
              ) : (
                <>
                  <div><strong className="gh-meta">Agenda</strong><p style={{ whiteSpace: "pre-wrap", margin: ".2rem 0 0" }}>{selected.agenda || "—"}</p></div>
                  <div><strong className="gh-meta">Minutes</strong><p style={{ whiteSpace: "pre-wrap", margin: ".2rem 0 0" }}>{selected.minutes || "—"}</p></div>
                  {selected.nextMeetingAt ? <p className="gh-meta">Next meeting: {formatStamp(selected.nextMeetingAt)}</p> : null}
                </>
              )}
              <h3 className="gh-section-title" style={{ margin: ".4rem 0 0" }}>Attachments</h3>
              {(files ?? []).length === 0 ? <p className="gh-meta" style={{ margin: 0 }}>No attachments.</p> : (
                <div className="gh-btnrow">{(files ?? []).map((f) => fileUrls.get(f.id) ? <a key={f.id} className="ui-button" href={fileUrls.get(f.id) as string} target="_blank" rel="noopener noreferrer">{f.fileName} <span className="gh-meta">{formatBytes(f.sizeBytes)}</span></a> : <span key={f.id} className="gh-meta">{f.fileName}</span>)}</div>
              )}
              {canWrite && selected.status !== "cancelled" ? (
                <form action={uploadMeetingFileAction} className="gh-form" encType="multipart/form-data">
                  <input type="hidden" name="meetingId" value={selected.id} /><input type="hidden" name="committeeId" value={id} /><input type="hidden" name="returnTo" value={meetingHere} />
                  <div className="gh-wide"><DropZone name="files" multiple label="Drop supporting papers here" /></div>
                  <div><button className="ui-button" type="submit">Upload</button></div>
                </form>
              ) : null}
            </div>

            <div style={{ display: "grid", gap: ".7rem", alignContent: "start" }}>
              <h3 className="gh-section-title" style={{ margin: 0 }}>Attendance</h3>
              {summary ? <div className="gh-btnrow"><Badge tone="ok">{summary.present} present</Badge><Badge tone="warn">{summary.apologies} apologies</Badge><Badge tone="bad">{summary.absent} absent</Badge>{summary.unrecorded ? <Badge tone="muted">{summary.unrecorded} not recorded</Badge> : null}</div> : null}
              {members.length === 0 ? <p className="gh-meta">Add members to record attendance.</p> : canWrite && !frozen && selected.status !== "scheduled" && selected.status !== "cancelled" ? (
                <form action={recordAttendanceAction} className="gh-form">
                  <input type="hidden" name="meetingId" value={selected.id} /><input type="hidden" name="committeeId" value={id} /><input type="hidden" name="returnTo" value={meetingHere} />
                  <div className="gh-wide gh-table-wrap"><table className="gh-table"><thead><tr><th scope="col">Member</th>{(["present", "apologies", "absent"] as const).map((s) => <th key={s} scope="col">{ATTENDANCE_LABEL[s]}</th>)}</tr></thead>
                    <tbody>{members.map((m) => (
                      <tr key={m.id}><th scope="row" style={{ color: "inherit", fontSize: ".86rem" }}>{nameOf(peopleById, m.userId)}</th>
                        {(["present", "apologies", "absent"] as const).map((s) => <td key={s}><input type="radio" name={`att:${m.userId}`} value={s} defaultChecked={attendanceBy.get(m.userId) === s} aria-label={`${nameOf(peopleById, m.userId)}: ${ATTENDANCE_LABEL[s]}`} /></td>)}</tr>
                    ))}</tbody></table></div>
                  <div><button className="ui-button" type="submit">Save attendance</button></div>
                </form>
              ) : (
                <ul className="gh-actions">{members.map((m) => <li key={m.id} className="gh-row" style={{ gridTemplateColumns: "1fr auto" }}><span>{nameOf(peopleById, m.userId)}</span><Badge tone={attendanceBy.get(m.userId) === "present" ? "ok" : attendanceBy.get(m.userId) ? "warn" : "muted"}>{attendanceBy.get(m.userId) ? ATTENDANCE_LABEL[attendanceBy.get(m.userId)!] : "Not recorded"}</Badge></li>)}</ul>
              )}
              {selected.status === "scheduled" ? <p className="gh-meta" style={{ margin: 0 }}>Attendance is recorded once the meeting is marked as held.</p> : null}
            </div>
          </div>

          <div className="gh-grid-2">
            <div style={{ display: "grid", gap: ".6rem", alignContent: "start" }}>
              <h3 className="gh-section-title" style={{ margin: 0 }}>Decisions</h3>
              {selectedDecisions.length === 0 ? <p className="gh-meta" style={{ margin: 0 }}>No decisions recorded.</p> : selectedDecisions.map((d) => (
                <div key={d.id} className="gh-item">
                  <p style={{ margin: 0 }}>{d.decision}</p>
                  <span className="gh-meta">Recorded by {nameOf(peopleById, d.createdBy)} · {formatDate(d.createdAt)}</span>
                  {links && catalogue ? <LinkPanel title="This decision links to" sourceType="decision" sourceId={d.id} links={links} catalogue={catalogue} allow={["policy", "guideline", "standard", "element", "capa", "audit", "qip"]} canWrite={canWrite} returnTo={meetingHere} /> : null}
                </div>
              ))}
              {canWrite && !frozen && selected.status !== "cancelled" && selected.status !== "scheduled" ? (
                <form action={addDecisionAction} className="gh-form">
                  <input type="hidden" name="meetingId" value={selected.id} /><input type="hidden" name="committeeId" value={id} /><input type="hidden" name="returnTo" value={meetingHere} />
                  <label className="gh-field gh-wide">New decision<textarea name="decision" required maxLength={4000} placeholder="e.g. Approved the sepsis protocol version 2.0, subject to a re-audit in three months." /></label>
                  <div><button className="ui-button" type="submit">Record decision</button></div>
                </form>
              ) : null}
            </div>

            <div style={{ display: "grid", gap: ".6rem", alignContent: "start" }}>
              <h3 className="gh-section-title" style={{ margin: 0 }}>Actions</h3>
              <p className="gh-meta" style={{ margin: 0 }}>Each action is a dated, owned item in the hospital&apos;s single action tracker (shared with incident and audit actions).</p>
              {selectedActions.length === 0 ? <p className="gh-meta" style={{ margin: 0 }}>No actions from this meeting.</p> : (
                <ul className="gh-actions">{selectedActions.map((c) => (
                  <li key={c.id} className="gh-item">
                    <div className="gh-btnrow" style={{ justifyContent: "space-between" }}><h4>{c.action}</h4><Badge tone={isCapaOverdue(c, today) ? "bad" : c.status === "verified" || c.status === "done" ? "ok" : "warn"}>{isCapaOverdue(c, today) ? "Overdue" : c.status.replace("_", " ")}</Badge></div>
                    <span className="gh-meta">Owner {nameOf(peopleById, c.ownerUserId)} · due {formatDate(c.dueDate)}{extras?.get(c.id)?.decisionId ? " · from a recorded decision" : ""}</span>
                    {(c.status === "open" || c.status === "in_progress") && (canWrite || c.ownerUserId === myUserId) ? (
                      <form action={setCapaStatusAction}><input type="hidden" name="capaId" value={c.id} /><input type="hidden" name="status" value="done" /><input type="hidden" name="returnTo" value={`${BASE}/committees/${id}`} /><button className="ui-button" type="submit">Mark done</button></form>
                    ) : null}
                  </li>
                ))}</ul>
              )}
              {canWrite && selected.status !== "cancelled" && selected.status !== "scheduled" ? (
                <Details title="Assign an action">
                  <form action={addMeetingActionAction} className="gh-form">
                    <input type="hidden" name="meetingId" value={selected.id} /><input type="hidden" name="committeeId" value={id} /><input type="hidden" name="returnTo" value={meetingHere} />
                    <label className="gh-field gh-wide">Action<textarea name="action" required maxLength={2000} /></label>
                    <label className="gh-field">Responsible owner<select name="ownerUserId" required defaultValue=""><option value="" disabled>Choose…</option>{people.map((p) => <option key={p.userId} value={p.userId}>{p.displayName}</option>)}</select></label>
                    <label className="gh-field">Deadline<input type="date" name="dueDate" required min={isoDate(today)} /></label>
                    {selectedDecisions.length > 0 ? <label className="gh-field">From decision<select name="decisionId" defaultValue=""><option value="">—</option>{selectedDecisions.map((d) => <option key={d.id} value={d.id}>{d.decision.slice(0, 60)}</option>)}</select></label> : null}
                    <div><button className="ui-button ui-button-primary" type="submit">Assign</button></div>
                  </form>
                </Details>
              ) : null}
            </div>
          </div>
        </section>
      ) : meetings.length > 0 ? <p className="gh-meta">Select a meeting to see its agenda, attendance, minutes, decisions and actions.</p> : null}
    </>
  );
}
