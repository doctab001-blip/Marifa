/**
 * Regulatory reporting rules configured by the hospital (programme, edition, which incidents, how many hours). Marifa ships
 * no deadlines: a rule only exists once someone at the hospital enters it from the requirement they follow.
 */
import type { IncidentRow, Severity } from "@/lib/governance/types";

export type RegulatoryRuleRow = {
  id: string;
  program: string;
  editionId: string | null;
  name: string;
  description: string;
  appliesToSentinel: boolean;
  minSeverity: Severity | null;
  categories: string[];
  reportWithinHours: number;
  remindBeforeHours: number;
  recipient: string;
  sourceNote: string;
  isActive: boolean;
};

export type NotificationRow = { id: string; incidentId: string; ruleId: string; reportedAt: string; externalReference: string; note: string };

const SEVERITY_RANK: Record<Severity, number> = { low: 1, medium: 2, high: 3, critical: 4 };

/**
 * A rule applies when every condition it sets is met: sentinel flag (if the rule is for sentinel events), minimum severity
 * (if set) and category (if any are listed). A rule with no conditions at all applies to nothing, so a half-configured
 * rule never floods the register.
 */
export function ruleApplies(rule: RegulatoryRuleRow, incident: Pick<IncidentRow, "isSentinel" | "severity" | "category">): boolean {
  if (!rule.isActive) return false;
  const hasCondition = rule.appliesToSentinel || rule.minSeverity !== null || rule.categories.length > 0;
  if (!hasCondition) return false;
  if (rule.appliesToSentinel && !incident.isSentinel) return false;
  if (rule.minSeverity && SEVERITY_RANK[incident.severity] < SEVERITY_RANK[rule.minSeverity]) return false;
  if (rule.categories.length > 0 && !rule.categories.some((c) => c.toLowerCase() === incident.category.toLowerCase())) return false;
  return true;
}

export type NotificationState = "reported" | "overdue" | "due_soon" | "pending";

export type NotificationView = {
  rule: RegulatoryRuleRow;
  dueAt: Date;
  remindAt: Date;
  state: NotificationState;
  /** Hours until due (negative when overdue). */
  hoursLeft: number;
  notification: NotificationRow | null;
  /** Reported after the configured deadline. */
  reportedLate: boolean;
};

const HOUR = 3_600_000;

export function notificationViews(
  incident: Pick<IncidentRow, "id" | "isSentinel" | "severity" | "category" | "occurredAt">,
  rules: RegulatoryRuleRow[],
  notifications: NotificationRow[],
  now: Date,
): NotificationView[] {
  const start = new Date(incident.occurredAt).getTime();
  return rules.filter((rule) => ruleApplies(rule, incident)).map((rule) => {
    const dueAt = new Date(start + rule.reportWithinHours * HOUR);
    const remindAt = new Date(dueAt.getTime() - rule.remindBeforeHours * HOUR);
    const notification = notifications.find((n) => n.incidentId === incident.id && n.ruleId === rule.id) ?? null;
    const hoursLeft = Math.round(((dueAt.getTime() - now.getTime()) / HOUR) * 10) / 10;
    let state: NotificationState;
    if (notification) state = "reported";
    else if (now.getTime() > dueAt.getTime()) state = "overdue";
    else if (now.getTime() >= remindAt.getTime()) state = "due_soon";
    else state = "pending";
    return { rule, dueAt, remindAt, state, hoursLeft, notification, reportedLate: Boolean(notification && new Date(notification.reportedAt).getTime() > dueAt.getTime()) };
  });
}

export const NOTIFICATION_STATE_LABEL: Record<NotificationState, string> = {
  reported: "Reported",
  overdue: "Overdue — escalate",
  due_soon: "Due soon",
  pending: "Not yet due",
};
