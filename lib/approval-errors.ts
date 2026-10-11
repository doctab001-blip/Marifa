export function approvalErrorCode(code: string | undefined) {
  if (code === "42501") return "approval_access";
  if (code === "22023") return "approval_stale";
  if (code === "40001") return "approval_changed";
  if (code === "PGRST202" || code === "42883") return "approval_configuration";
  return "approval_failed";
}

export const approvalErrorMessages: Record<string, string> = {
  approval_access: "Your account cannot approve this version. Shared reference topics require an active platform administrator.",
  approval_stale: "This version is no longer awaiting approval. Refresh the draft list and open the version you intend to review.",
  approval_changed: "The topic changed during approval. Refresh the list and review the latest version before trying again.",
  approval_configuration: "The approval service is not configured on this deployment. Contact the platform administrator.",
  approval_failed: "Approval could not be completed. Refresh the list and try again; the failure has been recorded for investigation.",
};
