type ApprovalStatus = "Approved" | "Published" | "Draft" | "Under review" | "Superseded" | "Archived";

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  const className = status.toLowerCase().replaceAll(" ", "-");
  return (
    <span className={`approval-badge approval-badge-${className}`} aria-label={`${status} status`}>
      <span aria-hidden="true" />
      {status}
    </span>
  );
}
