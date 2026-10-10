import type { ApprovalStatus } from "@/data/mockDiseases";

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  return (
    <span className={`approval-badge approval-badge-${status.toLowerCase()}`} aria-label={`${status} status`}>
      <span aria-hidden="true" />
      {status}
    </span>
  );
}
