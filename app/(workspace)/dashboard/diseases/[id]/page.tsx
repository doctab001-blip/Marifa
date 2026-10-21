import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { after } from "next/server";
import { ArrowLeft, CalendarCheck, CheckCircle2, FileText, Hourglass, ShieldAlert, Stethoscope } from "@/components/icons-3d";
import { EmergencyTopic } from "@/components/emergency-topic";
import { TopicPager, type TopicLink } from "@/components/topic-library";
import { TopicApproveButton } from "@/components/topic-approve-button";
import { ApplyProtocolPanel } from "@/components/clinical-orders/apply-protocol-panel";
import { getApprovedDiseaseGuideline, getApprovedDiseaseGuidelineVersion, getApprovedDiseaseGuidelines } from "@/lib/data/disease-guidelines";
import { canonicalTopicId } from "@/lib/data/merged-topics";
import { recordTopicView } from "@/lib/data/topic-views";
import { getFamilyCanonicalTopic, getFamilyTopics, getTopicFamily } from "@/lib/data/topic-families";
import { approveLiveTopic } from "./actions";
import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";
import type { DiseaseDetail } from "@/lib/validations/disease";
import { RegionalTopicView } from "@/components/clinical/RegionalTopicView";
import { getGlobalDiseaseTopic } from "@/lib/data/global-topics";
import { REGION_COOKIE, resolveRegion } from "@/lib/region";

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

function TopicApprovalBar({ disease, message, position = "bottom", editHref }: { disease: DiseaseDetail; message?: string; position?: "top" | "bottom"; editHref?: string }) {
  const reviewIncomplete = disease.clinicalReviewStatus === "pending" || disease.status === "under_review";
  if (position === "top" && !reviewIncomplete) return null;
  return (
    <section className="topic-approval-bar" aria-label={`${disease.title} approval${position === "top" ? " (top)" : ""}`}>
      {reviewIncomplete ? (
        <>
          <p><span className="pill pill-amber"><Hourglass size={16} aria-hidden="true" /><strong>Status: Under review</strong></span><span className="pill pill-slate pill-sm"><FileText size={14} aria-hidden="true" />Version {disease.version}</span></p>
          <form action={approveLiveTopic}>
            <input type="hidden" name="id" value={disease.id} />
            <input type="hidden" name="destination" value="approved" />
            <TopicApproveButton title={disease.title} />
          </form>
        </>
      ) : (
        <p className="topic-approval-done"><span className="pill pill-emerald"><CheckCircle2 size={16} aria-hidden="true" /><strong>Approved</strong></span><span className="pill pill-slate pill-sm"><CalendarCheck size={14} aria-hidden="true" />Reviewed {formatDate(disease.lastReviewed)}</span><span className="pill pill-slate pill-sm"><FileText size={14} aria-hidden="true" />Version {disease.version}</span>{editHref ? <Link className="ui-button ui-button-primary topic-edit-tab" href={editHref}>Edit</Link> : null}</p>
      )}
      {message ? <p className="topic-approval-message" role="status">{message}</p> : null}
    </section>
  );
}

export default async function DiseaseDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ approval?: string; version?: string; region?: string }> }) {
  const { id } = await params;
  const { approval, version, region } = await searchParams;
  // Multi-region topics (universal features + per-country profiles) render with the active region.
  // Existing single-country topics continue down the unchanged path below.
  const globalTopic = getGlobalDiseaseTopic(id);
  if (globalTopic.state === "invalid") return <ErrorState invalid />;
  if (globalTopic.state === "ready") {
    const activeRegion = resolveRegion(region, (await cookies()).get(REGION_COOKIE)?.value);
    return <RegionalTopicView topic={globalTopic.topic} region={activeRegion} />;
  }
  const canonical = canonicalTopicId(id);
  if (canonical) redirect(`/dashboard/diseases/${canonical}`);
  const result = version ? await getApprovedDiseaseGuidelineVersion(id, version) : await getApprovedDiseaseGuideline(id);
  if (result.state === "not-found") notFound();
  if (result.state === "invalid") return <ErrorState invalid />;
  if (result.state === "unavailable") return <ErrorState />;

  const disease = result.disease;
  // Count a view of the live topic only (not an opened historical version). Runs after the response is sent.
  if (!version) after(() => recordTopicView(disease.id));
  const [directory, pillarDirectory] = await Promise.all([
    getApprovedDiseaseGuidelines({ includeFamilyMembers: true }),
    getApprovedDiseaseGuidelines({ carePillar: disease.pillar, includeFamilyMembers: true }),
  ]);
  const allTopics = directory.state === "ready" ? directory.diseases : [];
  const family = version ? undefined : getTopicFamily(disease.title);
  const canonicalFamilyTopic = family ? getFamilyCanonicalTopic(family, allTopics) : undefined;
  if (canonicalFamilyTopic && canonicalFamilyTopic.id !== disease.id) redirect(`/dashboard/diseases/${canonicalFamilyTopic.id}`);
  const familyTopics = family && canonicalFamilyTopic ? getFamilyTopics(family, allTopics) : [];
  const relatedResults = await Promise.all(familyTopics.filter((topic) => topic.id !== disease.id).map((topic) => getApprovedDiseaseGuideline(topic.id)));
  const relatedTopics = relatedResults.flatMap((topic) => topic.state === "ready" ? [topic] : []);
  const displayedTopics = [{ disease, investigationSource: result.investigationSource }, ...relatedTopics];
  const pillarTopics = pillarDirectory.state === "ready" ? pillarDirectory.diseases : [];
  const topics: TopicLink[] = (family && canonicalFamilyTopic ? [canonicalFamilyTopic] : pillarTopics).map(({ id: topicId, title }) => ({ id: topicId, title }));
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
          <h1 id="scenario-title" className="scenario-title">{withoutInlineSourceLocators(family?.title ?? disease.title)}</h1>
        </header>
        {displayedTopics.map((topic, index) => (
          <section className="topic-family-member" key={topic.disease.id} aria-labelledby={`family-topic-${topic.disease.id}`}>
            {family ? <header className="topic-family-member-header"><p>Topic section {index + 1}</p><h2 id={`family-topic-${topic.disease.id}`}>{withoutInlineSourceLocators(topic.disease.title)}</h2></header> : null}
            <TopicApprovalBar disease={topic.disease} position="top" />
            {!version ? <p className="co-apply-bar"><ApplyProtocolPanel protocolId={topic.disease.id} protocolTitle={withoutInlineSourceLocators(topic.disease.title)} sourceModule="disease_management" /></p> : null}
            <EmergencyTopic disease={topic.disease} investigationSource={topic.investigationSource} />
            <TopicApprovalBar disease={topic.disease} message={index === 0 ? approvalMessage : undefined} editHref={`/dashboard/admin/guidelines/${encodeURIComponent(topic.disease.id)}${version && index === 0 ? `?version=${encodeURIComponent(version)}` : ""}`} />
          </section>
        ))}
      </article>

      <TopicPager topics={topics} currentId={disease.id} />
    </main>
  );
}
