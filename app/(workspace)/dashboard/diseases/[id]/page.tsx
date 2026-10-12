import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { ApprovalStatusBadge } from "@/components/approval-status-badge";
import { EmergencyTopic } from "@/components/emergency-topic";
import { TopicLibraryHeader, TopicPager, type TopicLink } from "@/components/topic-library";
import { getApprovedDiseaseGuideline, getApprovedDiseaseGuidelines } from "@/lib/data/disease-guidelines";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";
import { canonicalTopicId } from "@/lib/data/merged-topics";

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
  const canonical = canonicalTopicId(id);
  if (canonical) redirect(`/dashboard/diseases/${canonical}`);
  const result = await getApprovedDiseaseGuideline(id);
  if (result.state === "not-found") notFound();
  if (result.state === "invalid") return <ErrorState invalid />;
  if (result.state === "unavailable") return <ErrorState />;

  const disease = result.disease;
  const directory = await getApprovedDiseaseGuidelines({ carePillar: disease.pillar });
  const topics: TopicLink[] = directory.state === "ready" ? directory.diseases.map(({ id: topicId, title }) => ({ id: topicId, title })) : [];
  const reviewIncomplete = disease.clinicalReviewStatus === "pending" || disease.status === "under_review";
  const approvalLabel = reviewIncomplete ? "Under review" : disease.status === "published" ? "Published" : "Approved";

  return (
    <main className="page disease-detail-page topic-page">
      <TopicLibraryHeader pillar={disease.pillar} topics={topics} currentId={disease.id} />

      <article className="scenario-card" aria-labelledby="scenario-title">
        <p className="scenario-eyebrow">Clinical scenario</p>
        <h1 id="scenario-title" className="scenario-title">{disease.title}</h1>
        <div className="scenario-chips">
          <ApprovalStatusBadge status={approvalLabel} />
          <span className="scenario-chip">{disease.specialty}</span>
          <span className="scenario-chip">{disease.status === "under_review" ? `Evidence synthesis from ${disease.authority} guidance · unreviewed` : `Source: ${disease.authority}`}</span>
          <span className="scenario-chip">Version {disease.version}</span>
          <span className="scenario-chip">{reviewIncomplete ? "Clinical review pending" : `Last reviewed ${formatDate(disease.lastReviewed)}`}</span>
        </div>

        {reviewIncomplete ? (
          <div className="clinical-review-draft-notice" role="alert"><strong>UNREVIEWED DRAFT — NOT FOR CLINICAL USE.</strong> The source edition and topic synthesis are awaiting full source verification and Saudi clinical governance review. This is not an approved local protocol; follow approved local pathways and seek senior clinical advice for patient care.</div>
        ) : (
          <div className="clinical-governance-notice" role="note"><strong>Clinical governance:</strong> Verify patient-specific factors, local formulary and pathways. Escalate emergencies immediately.{isTemporaryOpenAdminMode() ? " Approvals recorded while the temporary open-administration mode is active are not verified clinical sign-offs." : ""}</div>
        )}

        <hr className="scenario-divider" />
        <EmergencyTopic disease={disease} investigationSource={result.investigationSource} />
      </article>

      <TopicPager topics={topics} currentId={disease.id} />
    </main>
  );
}
