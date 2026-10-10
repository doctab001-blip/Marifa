import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, FileCheck2, GitBranch } from "lucide-react";
import { ApprovalStatusBadge } from "@/components/approval-status-badge";
import { ClinicalWarning } from "@/components/clinical-warning";
import { PathwaySequence } from "@/components/pathway-sequence";
import { carePillars, mockDiseases } from "@/data/mockDiseases";
import { getDiseaseProtocol } from "@/lib/data/disease-protocols";

export function generateStaticParams() {
  return mockDiseases.map(({ id }) => ({ id }));
}

export default async function DiseaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const disease = await getDiseaseProtocol(id);
  if (!disease) notFound();
  const pillar = carePillars.find((item) => item.id === disease.pillar);

  return (
    <main className="page disease-detail-page">
      <Link href="/dashboard/diseases" className="disease-back-link"><ArrowLeft size={15} strokeWidth={1.5} />Back to disease directory</Link>

      <header className="disease-profile-header">
        <div className="disease-profile-copy">
          <div className="disease-profile-labels">
            <span>{pillar?.title}</span>
            <ApprovalStatusBadge status={disease.approvalStatus} />
          </div>
          <h1>{disease.title}</h1>
          <p>{disease.summary}</p>
        </div>
        <dl className="disease-source-card">
          <div><dt><Building2 size={14} strokeWidth={1.5} />Source authority</dt><dd>{disease.sourceAuthority}</dd></div>
          <div><dt><FileCheck2 size={14} strokeWidth={1.5} />Version</dt><dd>{disease.version}</dd></div>
          <div><dt><CalendarDays size={14} strokeWidth={1.5} />Last reviewed</dt><dd>{disease.lastReviewed}</dd></div>
        </dl>
      </header>

      <div className="clinical-demo-notice" role="note"><strong>Prototype content:</strong> This page demonstrates information architecture and component behaviour. It is not a verified clinical protocol and must not guide patient care.</div>

      <ClinicalWarning items={disease.redFlags} />

      {disease.pathway ? <PathwaySequence pathway={disease.pathway} /> : (
        <section className="pathway-placeholder card">
          <GitBranch size={25} strokeWidth={1.5} aria-hidden="true" />
          <div><p className="disease-kicker">Clinical pathway</p><h2>Pathway content awaiting review</h2><p>The detail template is ready; a structured pathway has not yet been added to this mock record.</p></div>
        </section>
      )}
    </main>
  );
}
