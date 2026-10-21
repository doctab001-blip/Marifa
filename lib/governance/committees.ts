/**
 * Committee and meeting workflow. The transitions mirror gov_meeting_guard in the database, which is the real enforcement.
 *   Scheduled -> Held -> Minutes drafted -> Approved -> Actions followed up   (Scheduled -> Cancelled; Drafted -> Held to revise)
 */

export type MeetingStatus = "scheduled" | "held" | "minutes_drafted" | "approved" | "actions_followed_up" | "cancelled";
export type MeetingFrequency = "weekly" | "fortnightly" | "monthly" | "bimonthly" | "quarterly" | "biannual" | "annual" | "ad_hoc";
export type MemberRole = "chair" | "secretary" | "member" | "advisor";
export type AttendanceStatus = "present" | "apologies" | "absent";

export type CommitteeRow = {
  id: string;
  name: string;
  purpose: string;
  chairUserId: string | null;
  secretaryUserId: string | null;
  meetingFrequency: MeetingFrequency;
  status: "active" | "inactive";
  templateKey: string | null;
};

export type CommitteeMemberRow = { id: string; committeeId: string; userId: string; memberRole: MemberRole };

export type MeetingRow = {
  id: string;
  committeeId: string;
  scheduledAt: string;
  location: string;
  agenda: string;
  status: MeetingStatus;
  heldAt: string | null;
  minutes: string;
  minutesApprovedBy: string | null;
  minutesApprovedAt: string | null;
  nextMeetingAt: string | null;
};

export type AttendanceRow = { id: string; meetingId: string; userId: string; status: AttendanceStatus };
export type DecisionRow = { id: string; meetingId: string; decision: string; createdBy: string | null; createdAt: string };

export const MEETING_STATUS_LABEL: Record<MeetingStatus, string> = {
  scheduled: "Scheduled",
  held: "Held",
  minutes_drafted: "Minutes drafted",
  approved: "Minutes approved",
  actions_followed_up: "Actions followed up",
  cancelled: "Cancelled",
};

export const MEETING_STEPS: { key: MeetingStatus; label: string }[] = [
  { key: "scheduled", label: "Scheduled" },
  { key: "held", label: "Held" },
  { key: "minutes_drafted", label: "Minutes drafted" },
  { key: "approved", label: "Approved" },
  { key: "actions_followed_up", label: "Actions followed up" },
];

export const FREQUENCY_LABEL: Record<MeetingFrequency, string> = {
  weekly: "Weekly", fortnightly: "Every two weeks", monthly: "Monthly", bimonthly: "Every two months", quarterly: "Quarterly",
  biannual: "Twice a year", annual: "Annually", ad_hoc: "As needed",
};

export const MEMBER_ROLE_LABEL: Record<MemberRole, string> = { chair: "Chair", secretary: "Secretary", member: "Member", advisor: "Advisor" };
export const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = { present: "Present", apologies: "Apologies", absent: "Absent" };

const NEXT: Record<MeetingStatus, MeetingStatus[]> = {
  scheduled: ["held", "cancelled"],
  held: ["minutes_drafted"],
  minutes_drafted: ["approved", "held"],
  approved: ["actions_followed_up"],
  actions_followed_up: [],
  cancelled: [],
};

export function allowedMeetingTransitions(status: MeetingStatus): MeetingStatus[] {
  return NEXT[status];
}

export function isMinutesFrozen(status: MeetingStatus): boolean {
  return status === "approved" || status === "actions_followed_up";
}

/** Why a transition would be refused, so the page can say so before the database does. Null = allowed. */
export function transitionProblem(
  meeting: Pick<MeetingRow, "status" | "minutes">,
  to: MeetingStatus,
  openActions: number,
): string | null {
  if (!NEXT[meeting.status].includes(to)) return `A meeting that is ${MEETING_STATUS_LABEL[meeting.status].toLowerCase()} cannot move to ${MEETING_STATUS_LABEL[to].toLowerCase()}.`;
  if (to === "minutes_drafted" && meeting.minutes.trim() === "") return "Write the minutes before marking them drafted.";
  if (to === "actions_followed_up" && openActions > 0) return `${openActions} action${openActions === 1 ? " is" : "s are"} still open.`;
  return null;
}

export function attendanceSummary(members: CommitteeMemberRow[], attendance: AttendanceRow[]) {
  const byUser = new Map(attendance.map((a) => [a.userId, a.status]));
  const present = members.filter((m) => byUser.get(m.userId) === "present").length;
  return {
    members: members.length,
    present,
    apologies: members.filter((m) => byUser.get(m.userId) === "apologies").length,
    absent: members.filter((m) => byUser.get(m.userId) === "absent").length,
    unrecorded: members.filter((m) => !byUser.has(m.userId)).length,
    pct: members.length === 0 ? null : Math.round((present / members.length) * 100),
  };
}

/** Suggested committee structures. Hospitals rename, merge or ignore them; nothing is created until someone saves. */
export const COMMITTEE_TEMPLATES: { key: string; name: string; purpose: string; frequency: MeetingFrequency }[] = [
  { key: "quality_patient_safety", name: "Quality & Patient Safety Committee", frequency: "monthly",
    purpose: "Oversees the hospital's quality and patient safety programme: indicators, incidents and their actions, audits and improvement projects." },
  { key: "infection_control", name: "Infection Prevention and Control Committee", frequency: "monthly",
    purpose: "Oversees infection prevention and control: surveillance, hand hygiene, outbreak response, related policies and audits." },
  { key: "medication_safety", name: "Medication Safety Committee", frequency: "monthly",
    purpose: "Reviews medication incidents and near misses, high-alert medication practice, medication-related policies and audits." },
  { key: "clinical_governance", name: "Clinical Governance Committee", frequency: "quarterly",
    purpose: "Approves clinical guidelines and protocols, monitors their review dates and audit results, and tracks accreditation readiness." },
];
