import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, ArrowLeft, Building2, CalendarDays, FileCheck2, ShieldAlert } from "lucide-react";
import { ApprovalStatusBadge } from "@/components/approval-status-badge";
import { DiseaseDetailSections } from "@/components/disease-detail-sections";
import { getApprovedDiseaseGuideline } from "@/lib/data/disease-guidelines";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

function ErrorState({ invalid = false }: { invalid?: boolean }) {
  return (
    <main className="page disease-detail-page">
      <Link href="/dashboard/diseases" className="disease-back-link"><ArrowLeft size={15} strokeWidth={1.5} />Back to disease directory</Link>
      <section className="guideline-error card" role="alert">
        <ShieldAlert size={28} strokeWidth={1.5} aria-hidden="true" />
        <h1>{invalid ? "This guideline could not be validated" : "This guideline is temporarily unavailable"}</h1>
        <p>{invalid ? "The approved record did not match the required clinical schema and has been withheld from display." : "The secure clinical data service could not be reached with the current session. Please try again later."}</p>
      </section>
    </main>
  );
}

export default async function DiseaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getApprovedDiseaseGuideline(id);
  if (result.state === "not-found") notFound();
  if (result.state === "invalid") return <ErrorState invalid />;
  if (result.state === "unavailable") return <ErrorState />;

  const disease = result.disease;
  const approvalLabel = disease.status === "published" ? "Published" : "Approved";
  return (
    <main className="page disease-detail-page">
      <Link href="/dashboard/diseases" className="disease-back-link"><ArrowLeft size={15} strokeWidth={1.5} />Back to disease directory</Link>

      <header className="disease-profile-header">
        <div className="disease-profile-copy">
          <div className="disease-profile-labels"><span>{disease.pillar}</span><ApprovalStatusBadge status={approvalLabel} /><span className="disease-guide-label"><Activity size={14} /> Clinical learning guide</span></div>
          <h1>{disease.title}</h1>
          <p>{disease.pathophysiology.summary}</p>
          <div className="disease-hero-note"><span className="disease-hero-note-mark"><FileCheck2 size={18} /></span><span><strong>One clear clinical walkthrough</strong><small>Move from presentation and red flags through investigations, management and follow-up.</small></span></div>
        </div>
        <dl className="disease-source-card">
          <div><dt><Building2 size={14} strokeWidth={1.5} />Source authority</dt><dd>{disease.authority}</dd></div>
          <div><dt><FileCheck2 size={14} strokeWidth={1.5} />Version</dt><dd>{disease.version}</dd></div>
          <div><dt><CalendarDays size={14} strokeWidth={1.5} />Last reviewed</dt><dd>{formatDate(disease.lastReviewed)}</dd></div>
        </dl>
      </header>

      <div className="clinical-governance-notice" role="note"><strong>Clinical governance:</strong> Confirm applicability, local formulary and patient-specific factors before use. Emergency red flags require immediate escalation through local pathways.</div>
      <div className="disease-overview" aria-label="Guideline at a glance">
        <div className="disease-overview-heading"><p className="disease-kicker">Guideline at a glance</p><h2>Know what’s inside</h2></div>
        <div className="disease-overview-stat"><strong>06</strong><span>clinical sections</span></div>
        <div className="disease-overview-stat disease-overview-stat-alert"><strong>{String(disease.presentation.redFlags.length).padStart(2, "0")}</strong><span>red flags highlighted</span></div>
        <div className="disease-overview-stat"><strong>{String(disease.clinicalManagement.length).padStart(2, "0")}</strong><span>management steps</span></div>
      </div>
      <div className="disease-content-heading"><div><p className="disease-kicker">Your clinical walkthrough</p><h2>Explore the guideline</h2></div><span>Six connected parts</span></div>
      <DiseaseDetailSections disease={disease} />
    </main>
  );
}
