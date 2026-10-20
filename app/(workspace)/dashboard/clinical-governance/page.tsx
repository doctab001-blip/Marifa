import { redirect } from "next/navigation";

/** Legacy address: the single Clinical Governance page lives at /dashboard/governance. */
export default function ClinicalGovernanceRedirect(): never {
  redirect("/dashboard/governance");
}
