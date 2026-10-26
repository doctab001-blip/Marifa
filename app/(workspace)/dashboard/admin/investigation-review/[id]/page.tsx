import Link from "next/link";
import { notFound } from "next/navigation";
import { InvestigationCards } from "@/components/investigation-cards";
import { getInvestigationRevision } from "@/lib/data/investigation-revisions";
import { displayTopicTitle } from "@/lib/topic-title";

export default async function InvestigationRevisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const revision = await getInvestigationRevision(id);
  if (!revision) notFound();
  return <section className="admin-content">
    <Link href="/dashboard/admin/investigation-review" className="disease-back-link">Back to investigation revisions</Link>
    <header className="admin-section-heading"><div><p className="eyebrow">Proposed investigation revision · Review pending</p><h2>{displayTopicTitle(revision.disease.title)}</h2><p>{revision.disease.version}</p></div></header>
    <p className="clinical-review-draft-notice"><strong>UNREVIEWED DRAFT — NOT FOR CLINICAL USE.</strong> Full source verification and Saudi clinical governance review are pending. This revision has no clinical approval or publication record. The saved current version is preserved.</p>
    <p><Link href={`/dashboard/diseases/${id}`}>Compare with the current clinical record</Link></p>
    <InvestigationCards investigations={revision.disease.investigations} source={revision.source} />
  </section>;
}
