import Link from "next/link";
import ClinicalGovernanceHub from "@/components/governance/clinical-governance-hub";

export const metadata = { title: "Governance demonstration — Marifa" };

/**
 * The original interactive prototype. Every record, KPI and score in it is invented sample data held in the browser:
 * nothing is read from or written to the database. It is kept for training and demonstrations only and is not linked
 * from the live governance pages except through an explicit "demonstration" link.
 */
export default function GovernanceDemoPage() {
  return (
    <>
      <div role="note" style={{ background: "#fef3c7", color: "#78350f", padding: ".7rem 1rem", borderBottom: "1px solid #f59e0b", fontSize: ".9rem" }}>
        <strong>Demonstration data.</strong> These incidents, audits, protocols and the UK CQC sample view are invented and are not your hospital&apos;s records.
        {" "}<Link href="/dashboard/governance" style={{ color: "inherit", textDecoration: "underline" }}>Go to live Clinical Governance</Link>
      </div>
      <ClinicalGovernanceHub />
    </>
  );
}
