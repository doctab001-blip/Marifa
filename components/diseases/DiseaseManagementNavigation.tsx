import Link from "next/link";
import { FileCheck2, FileClock, FileText } from "@/components/icons-3d";
import type { DiseaseManagementCounts } from "@/lib/data/disease-drafts";

export function DiseaseManagementNavigation({
  active,
  counts,
}: {
  active: "published" | "drafts" | "approved";
  counts: DiseaseManagementCounts;
}) {
  return (
    <nav className="disease-management-tabs" aria-label="Disease Management menu">
      <Link href="/dashboard/diseases/approved" aria-current={active === "approved" ? "page" : undefined}>
        <FileCheck2 size={16} aria-hidden="true" /> Approved ({counts.approved})
      </Link>
      <Link href="/dashboard/diseases/drafts" aria-current={active === "drafts" ? "page" : undefined}>
        <FileClock size={16} aria-hidden="true" /> Drafts ({counts.drafts})
      </Link>
      <Link href="/dashboard/diseases/published" aria-current={active === "published" ? "page" : undefined}>
        <FileText size={16} aria-hidden="true" /> Published ({counts.published})
      </Link>
    </nav>
  );
}
