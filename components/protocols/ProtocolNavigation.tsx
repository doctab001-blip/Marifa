import Link from "next/link";
import { FileClock, FileText } from "@/components/icons-3d";
import type { ProtocolCounts } from "@/lib/data/disease-drafts";
import { PROTOCOLS_DRAFTS, PROTOCOLS_PUBLISHED } from "@/lib/local-protocols";

/** Local Protocols have two states only, so this menu has two tabs (no Approved). */
export function ProtocolNavigation({ active, counts }: { active: "drafts" | "published"; counts: ProtocolCounts }) {
  return (
    <nav className="disease-management-tabs" aria-label="Local Protocols menu">
      <Link href={PROTOCOLS_DRAFTS} aria-current={active === "drafts" ? "page" : undefined}>
        <FileClock size={16} aria-hidden="true" /> Drafts ({counts.drafts})
      </Link>
      <Link href={PROTOCOLS_PUBLISHED} aria-current={active === "published" ? "page" : undefined}>
        <FileText size={16} aria-hidden="true" /> Published ({counts.published})
      </Link>
    </nav>
  );
}
