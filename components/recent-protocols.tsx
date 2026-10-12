import Link from "next/link";
import { ArrowUpRight, Building2, CalendarDays } from "@/components/icons-3d";
import { ApprovalStatusBadge } from "@/components/approval-status-badge";
import type { MockDisease } from "@/data/mockDiseases";

export function RecentProtocols({ protocols }: { protocols: MockDisease[] }) {
  return (
    <section className="recent-protocols card" aria-labelledby="recent-protocols-title">
      <header className="directory-section-heading">
        <div>
          <p className="disease-kicker">Clinical governance</p>
          <h2 id="recent-protocols-title">Recently Updated Protocols</h2>
        </div>
        <p>Mock records for UI review</p>
      </header>
      <div className="recent-protocol-list">
        {protocols.map((protocol) => (
          <Link href={`/dashboard/diseases/${protocol.id}`} className="recent-protocol-row" key={protocol.id}>
            <div className="recent-protocol-main">
              <strong>{protocol.shortTitle}</strong>
              <span><Building2 size={13} strokeWidth={1.5} />{protocol.sourceAuthority}</span>
            </div>
            <div className="recent-protocol-meta">
              <span><CalendarDays size={13} strokeWidth={1.5} />{protocol.lastReviewed}</span>
              <ApprovalStatusBadge status={protocol.approvalStatus} />
              <ArrowUpRight className="recent-protocol-arrow" size={17} strokeWidth={1.5} aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
