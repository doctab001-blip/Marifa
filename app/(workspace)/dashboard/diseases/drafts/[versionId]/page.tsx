import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { EmergencyTopic } from "@/components/emergency-topic";
import { getDiseaseDraftVersion } from "@/lib/data/disease-drafts";

export default async function DiseaseDraftPreviewPage({ params }: { params: Promise<{ versionId: string }> }) {
  const { versionId } = await params;
  const result = await getDiseaseDraftVersion(versionId);
  if (result.state === "not-found") notFound();
  if (result.state !== "ready") {
    return <main className="page disease-detail-page"><section className="guideline-error card" role="alert"><ShieldAlert size={28} /><h1>Draft unavailable</h1><p>This draft could not be loaded or validated.</p></section></main>;
  }
  return (
    <main className="page disease-detail-page topic-page">
      <Link href="/dashboard/diseases/drafts" className="disease-back-link"><ArrowLeft size={15} />Back to draft topics</Link>
      <article className="scenario-card" aria-labelledby="scenario-title">
        <p className="scenario-eyebrow">Clinical scenario · read-only draft</p>
        <h1 id="scenario-title" className="scenario-title">{result.disease.title}</h1>
        <div className="scenario-chips"><span className="status status-draft">Version {result.disease.version}</span><span className="scenario-chip">{result.disease.pillar}</span><span className="scenario-chip">{result.disease.specialty}</span></div>
        <div className="clinical-review-draft-notice" role="alert"><strong>UNREVIEWED DRAFT — NOT FOR CLINICAL USE.</strong> Only an authorized administrator can edit or approve this version.</div>
        <hr className="scenario-divider" />
        <EmergencyTopic disease={result.disease} investigationSource={result.source} />
      </article>
    </main>
  );
}
