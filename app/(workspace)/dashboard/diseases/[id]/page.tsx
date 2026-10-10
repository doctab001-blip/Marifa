import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, FileCheck2, ShieldAlert } from "lucide-react";
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
        <p>{invalid ? "The clinical record did not match the required schema and has been withheld from display." : "The secure clinical data service could not be reached with the current session. Please try again later."}</p>
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
  const approvalLabel = disease.status === "published" ? "Published" : disease.status === "under_review" ? "Under review" : "Approved";
  return (
    <main className="page disease-detail-page">
      <Link href="/dashboard/diseases" className="disease-back-link"><ArrowLeft size={15} strokeWidth={1.5} />Back to disease directory</Link>

      <header className="disease-profile-header">
        <div className="disease-profile-copy">
          <div className="disease-profile-labels"><span>{disease.pillar}</span><ApprovalStatusBadge status={approvalLabel} /></div>
          <h1>{disease.title}</h1>
        </div>
        <dl className="disease-source-card">
          <div><dt><Building2 size={14} strokeWidth={1.5} />Source authority</dt><dd>{disease.status === "under_review" ? "External evidence synthesis" : disease.authority}</dd></div>
          <div><dt><FileCheck2 size={14} strokeWidth={1.5} />Version</dt><dd>{disease.version}</dd></div>
          <div><dt><CalendarDays size={14} strokeWidth={1.5} />{disease.status === "under_review" || disease.clinicalReviewStatus === "pending" ? "Clinical review" : "Last reviewed"}</dt><dd>{disease.status === "under_review" || disease.clinicalReviewStatus === "pending" ? "Pending" : formatDate(disease.lastReviewed)}</dd></div>
        </dl>
      </header>

      {disease.status === "under_review" || disease.clinicalReviewStatus === "pending" ? (
        <div className="clinical-review-draft-notice" role="alert"><strong>UNREVIEWED DRAFT — NOT FOR CLINICAL USE.</strong> The source edition and topic synthesis are awaiting full source verification and Saudi clinical governance review. This is not an approved local protocol; follow approved local pathways and seek senior clinical advice for patient care.</div>
      ) : (
        <div className="clinical-governance-notice" role="note"><strong>Clinical governance:</strong> Verify patient-specific factors, local formulary and pathways. Escalate emergencies immediately.</div>
      )}
      {disease.clinicalScenario && <section className="clinical-scenario-card" aria-labelledby="clinical-scenario-title"><p className="disease-kicker">Case scenario</p><h2 id="clinical-scenario-title">Start with the patient</h2><p>{disease.clinicalScenario}</p></section>}
      <DiseaseDetailSections disease={disease} />
    </main>
  );
}
