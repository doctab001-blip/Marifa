/**
 * Who may do what in the Accreditation Hub. Mirrors the database functions gov_can_read / gov_can_write; the database is the
 * enforcing layer, this module only decides what the UI offers. Assigned roles only: professional_level is user-editable
 * and never grants access.
 */

export const GOVERNANCE_WRITE_ROLES = [
  "governance_lead", "quality_manager", "clinical_director", "org_admin", "hospital_admin", "platform_admin",
] as const;
export const GOVERNANCE_READ_ROLES = [...GOVERNANCE_WRITE_ROLES, "auditor"] as const;

export type GovActor = { userId: string; organizationId: string; roleCodes: string[] };

export class GovernanceAuthorizationError extends Error {
  constructor(message = "Your account is not authorised for this action.") {
    super(message);
    this.name = "GovernanceAuthorizationError";
  }
}

export function canWriteGovernance(actor: GovActor | null | undefined): actor is GovActor {
  return Boolean(actor?.userId && actor.organizationId && actor.roleCodes.some((code) => (GOVERNANCE_WRITE_ROLES as readonly string[]).includes(code)));
}

export function canReadGovernance(actor: GovActor | null | undefined): actor is GovActor {
  return Boolean(actor?.userId && actor.organizationId && actor.roleCodes.some((code) => (GOVERNANCE_READ_ROLES as readonly string[]).includes(code)));
}

export function assertCanWrite(actor: GovActor | null | undefined): asserts actor is GovActor {
  if (!canWriteGovernance(actor)) throw new GovernanceAuthorizationError("Only governance staff (governance lead, quality manager, clinical director or administrator) can do that.");
}

export function assertMember(actor: GovActor | null | undefined): asserts actor is GovActor {
  if (!actor?.userId || !actor.organizationId) throw new GovernanceAuthorizationError("Sign in with an account that belongs to an organisation.");
}

export const ROLE_LABEL: Record<string, string> = {
  governance_lead: "Governance lead",
  quality_manager: "Quality manager",
  clinical_director: "Clinical director",
  org_admin: "Organisation admin",
  hospital_admin: "Hospital admin",
  platform_admin: "Platform admin",
  auditor: "Auditor (read-only)",
  consultant: "Consultant",
  specialist: "Specialist",
  mbbs_gp: "MBBS / GP",
};

/** Files: the bucket allows these types and 20 MB. Checked again here so users get a clear message before upload. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = [
  "application/pdf", "image/png", "image/jpeg", "text/plain", "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword", "application/vnd.ms-excel",
] as const;

export function checkUpload(file: { name: string; size: number; type: string }): string | null {
  if (file.size === 0) return "That file is empty.";
  if (file.size > MAX_UPLOAD_BYTES) return `"${file.name}" is larger than 20 MB.`;
  if (!(ALLOWED_UPLOAD_TYPES as readonly string[]).includes(file.type)) return `"${file.name}" is not an allowed type. Use PDF, Word, Excel, CSV, text, PNG or JPEG.`;
  return null;
}

/** Storage-safe file name: keeps the extension, drops path separators and anything unusual. */
export function safeFileName(name: string): string {
  const cleaned = name.normalize("NFKD").replace(/[^\w.\- ]+/g, "").trim().replace(/\s+/g, "-").replace(/\.{2,}/g, ".");
  return (cleaned || "file").slice(-120);
}
