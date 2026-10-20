import { GovernanceAuthorizationError } from "@/lib/governance/policy";

/** Raised for problems the user can fix (bad input, missing file). The message is shown as written. */
export class GovernanceInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GovernanceInputError";
  }
}

/**
 * Turns database, storage and application errors into a sentence for the person using the page.
 * Database guard messages look like "evidence_required: a standard cannot be rated satisfactory without current evidence attached"
 * so everything after the code is already written for humans.
 */
export function friendlyMessage(error: unknown): string {
  if (error instanceof GovernanceInputError || error instanceof GovernanceAuthorizationError) return error.message;
  const raw = typeof error === "object" && error && "message" in error ? String((error as { message: unknown }).message) : "";
  const guard = raw.match(/^([a-z_]+):\s+([\s\S]+)$/);
  if (guard) return capitalise(guard[2]);
  const bare = raw.match(/^([a-z_]+)$/);
  if (bare) return BARE[bare[1]] ?? "That action was refused.";
  if (/row-level security|permission denied/i.test(raw)) return "Your account does not have permission to do that.";
  if (/duplicate key|already exists|unique/i.test(raw)) return "That record already exists.";
  if (/violates check constraint/i.test(raw)) return "Some of the values are not allowed. Check the form and try again.";
  if (/Bucket not found|relation .* does not exist|function .* does not exist|schema cache/i.test(raw)) {
    return "The accreditation database has not been set up yet. Apply the accreditation hub migration to this database.";
  }
  console.error("[accreditation-hub] unexpected failure", error);
  return "Something went wrong. Nothing was changed. Try again.";
}

const BARE: Record<string, string> = {
  not_authenticated: "Sign in again to continue.",
  actor_mismatch: "Your session changed. Reload the page and try again.",
  not_authorised: "Your account does not have permission to do that.",
  not_found: "That record could not be found.",
  not_assigned: "That policy was not assigned to you.",
  policy_not_approved: "Only an approved policy can be used for read-and-sign.",
  audit_closed: "That audit is already finished.",
  invalid_status: "That status is not allowed.",
};

function capitalise(text: string): string {
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1) + (/[.!?]$/.test(trimmed) ? "" : ".");
}
