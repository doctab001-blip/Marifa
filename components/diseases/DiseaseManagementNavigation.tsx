import Link from "next/link";
import { FileClock, Stethoscope } from "lucide-react";

export function DiseaseManagementNavigation({ active }: { active: "directory" | "drafts" }) {
  return (
    <nav className="disease-management-tabs" aria-label="Disease Management menu">
      <Link href="/dashboard/diseases" aria-current={active === "directory" ? "page" : undefined}>
        <Stethoscope size={16} aria-hidden="true" /> Disease directory
      </Link>
      <Link href="/dashboard/diseases/drafts" aria-current={active === "drafts" ? "page" : undefined}>
        <FileClock size={16} aria-hidden="true" /> Draft
      </Link>
    </nav>
  );
}
