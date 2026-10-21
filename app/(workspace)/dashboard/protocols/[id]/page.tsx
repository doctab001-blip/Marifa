import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FilePenLine, ShieldAlert } from "@/components/icons-3d";
import { EmergencyTopic } from "@/components/emergency-topic";
import { ApplyProtocolPanel } from "@/components/clinical-orders/apply-protocol-panel";
import { ProtocolGovernancePanel } from "@/components/governance/protocol-governance-panel";
import { getPublishedProtocol } from "@/lib/data/local-protocols";
import { PROTOCOLS_PUBLISHED } from "@/lib/local-protocols";

function ErrorState({ invalid }: { invalid?: boolean }) {
  return (
    <main className="page disease-detail-page">
      <Link href={PROTOCOLS_PUBLISHED} className="disease-back-link"><ArrowLeft size={15} strokeWidth={1.5} />Back to published protocols</Link>
      <section className="guideline-error card" role="alert">
        <ShieldAlert size={28} strokeWidth={1.5} aria-hidden="true" />
        <h1>{invalid ? "This protocol could not be validated" : "This protocol is temporarily unavailable"}</h1>
        <p>{invalid ? "The stored record did not match the required format and has been withheld from display." : "The protocol could not be loaded. Try again shortly."}</p>
      </section>
    </main>
  );
}

export default async function LocalProtocolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPublishedProtocol(id);
  if (result.state === "not-found") notFound();
  if (result.state !== "ready") return <ErrorState invalid={result.state === "invalid"} />;
  const { protocol } = result;

  return (
    <main className="page disease-detail-page topic-page">
      <Link href={PROTOCOLS_PUBLISHED} className="disease-back-link"><ArrowLeft size={15} />Back to published protocols</Link>
      <article className="scenario-card" aria-labelledby="scenario-title">
        <p className="scenario-eyebrow">Local protocol · Emergency Department</p>
        <h1 id="scenario-title" className="scenario-title">{protocol.title}</h1>
        <div className="scenario-chips">
          <span className="status status-draft">Version {protocol.version}</span>
          <span className="scenario-chip">{protocol.specialty}</span>
        </div>
        <ProtocolGovernancePanel guidelineId={id} versionId={result.versionId} version={protocol.version} publishedAt={result.publishedAt} />
        {protocol.clinicalReviewStatus === "pending" && (
          <div className="clinical-review-draft-notice" role="note"><strong>Clinical review pending.</strong> This protocol is published for staff but has not yet been signed off by a clinician.</div>
        )}
        {result.canEdit && (
          <p><Link className="ui-button ui-button-secondary" href={`/dashboard/admin/guidelines/${encodeURIComponent(id)}?version=${encodeURIComponent(result.versionId)}`}><FilePenLine size={15} aria-hidden="true" /> Edit protocol</Link></p>
        )}
        <p className="co-apply-bar"><ApplyProtocolPanel protocolId={protocol.id} protocolTitle={protocol.title} sourceModule="clinical_guidelines" /></p>
        <hr className="scenario-divider" />
        <EmergencyTopic disease={protocol} investigationSource={result.source} />
      </article>
    </main>
  );
}
