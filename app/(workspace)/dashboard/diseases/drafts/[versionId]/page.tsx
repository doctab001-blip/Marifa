import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { DiseaseDetailSections } from "@/components/disease-detail-sections";
import { getDiseaseDraftVersion } from "@/lib/data/disease-drafts";

export default async function DiseaseDraftPreviewPage({ params }: { params: Promise<{ versionId: string }> }) {
  const { versionId } = await params;
  const result = await getDiseaseDraftVersion(versionId);
  if (result.state === "not-found") notFound();
  if (result.state !== "ready") {
    return <main className="page disease-detail-page"><section className="guideline-error card" role="alert"><ShieldAlert size={28} /><h1>Draft unavailable</h1><p>This draft could not be loaded or validated.</p></section></main>;
  }
  return (
    <main className="page disease-detail-page">
      <Link href="/dashboard/diseases/drafts" className="disease-back-link"><ArrowLeft size={15} />Back to draft topics</Link>
      <header className="disease-profile-header"><div className="disease-profile-copy"><p className="disease-kicker">Read-only clinical draft</p><h1>{result.disease.title}</h1><p>{result.disease.pillar} · {result.disease.specialty}</p></div><span className="status status-draft">Version {result.disease.version}</span></header>
      <div className="clinical-review-draft-notice" role="alert"><strong>UNREVIEWED DRAFT — NOT FOR CLINICAL USE.</strong> Only an authorized administrator can edit or approve this version.</div>
      <DiseaseDetailSections disease={result.disease} investigationSource={result.source} />
    </main>
  );
}
