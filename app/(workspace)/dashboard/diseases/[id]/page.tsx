import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarCheck, CheckCircle2, FileText, Hourglass, ShieldAlert, Stethoscope } from "@/components/icons-3d";
import { EmergencyTopic } from "@/components/emergency-topic";
import { TopicPager, type TopicLink } from "@/components/topic-library";
import { TopicApproveButton } from "@/components/topic-approve-button";
import { getApprovedDiseaseGuideline, getApprovedDiseaseGuidelines } from "@/lib/data/disease-guidelines";
import { canonicalTopicId } from "@/lib/data/merged-topics";
import { approveLiveTopic } from "./actions";
import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

const approvalMessages: Record<string, string> = {
  done: "Topic approved.",
  already: "This topic is already approved.",
  not_authorized: "Only an administrator can approve a topic.",
  failed: "Approval could not be completed. Refresh and try again.",
};

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

export default async function DiseaseDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ approval?: string }> }) {
  const { id } = await params;
  const { approval } = await searchParams;
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
  const approvalMessage = approval ? approvalMessages[approval] : undefined;

  return (
    <main className="page disease-detail-page topic-page">
      <article className="scenario-card" aria-labelledby="scenario-title">
        <header className="sc-hero">
          <div className="sc-eyebrow-row">
            <span className="sc-icon-tile" aria-hidden="true"><Stethoscope size={24} /></span>
            <span className="pill pill-aqua">Clinical scenario</span>
            <span className="pill pill-sky">{disease.pillar}</span>
          </div>
          <h1 id="scenario-title" className="scenario-title">{withoutInlineSourceLocators(disease.title)}</h1>
        </header>
        <EmergencyTopic disease={disease} investigationSource={result.investigationSource} />

        <section className="topic-approval-bar" aria-label="Topic approval">
          {reviewIncomplete ? (
            <>
              <p><span className="pill pill-amber"><Hourglass size={16} aria-hidden="true" /><strong>Status: Under review</strong></span><span className="pill pill-slate pill-sm"><FileText size={14} aria-hidden="true" />Version {disease.version}</span></p>
              <form action={approveLiveTopic}>
                <input type="hidden" name="id" value={disease.id} />
                <TopicApproveButton title={disease.title} />
              </form>
            </>
          ) : (
            <p className="topic-approval-done"><span className="pill pill-emerald"><CheckCircle2 size={16} aria-hidden="true" /><strong>Approved</strong></span><span className="pill pill-slate pill-sm"><CalendarCheck size={14} aria-hidden="true" />Reviewed {formatDate(disease.lastReviewed)}</span><span className="pill pill-slate pill-sm"><FileText size={14} aria-hidden="true" />Version {disease.version}</span></p>
          )}
          {approvalMessage ? <p className="topic-approval-message" role="status">{approvalMessage}</p> : null}
        </section>
      </article>

      <TopicPager topics={topics} currentId={disease.id} />
    </main>
  );
}
