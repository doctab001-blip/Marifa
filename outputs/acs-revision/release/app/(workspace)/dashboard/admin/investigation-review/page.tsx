import Link from "next/link";
import { getInvestigationRevisions } from "@/lib/data/investigation-revisions";

export default async function InvestigationReviewPage() {
  const revisions = await getInvestigationRevisions();
  return <section className="admin-content">
    <header className="admin-section-heading"><div><p className="eyebrow">Clinical governance</p><h2>Investigation revisions</h2><p>{revisions.length} proposed revisions awaiting source verification and clinical review.</p></div></header>
    <p className="clinical-review-draft-notice"><strong>UNREVIEWED DRAFTS — NOT FOR CLINICAL USE.</strong> These proposals explain named assessments, findings and decision rationale. Existing published versions remain in place. Textbook references require full chapter verification, and Saudi/local applicability must be reviewed before approval.</p>
    <div className="card">{revisions.map((revision) => <div className="topic-row" key={revision.id}><div className="topic-main"><Link href={`/dashboard/admin/investigation-review/${revision.id}`}><strong>{revision.title}</strong></Link><p>{revision.count} named assessments · Review pending</p></div></div>)}</div>
    <Link href="/dashboard/admin/governance" className="disease-back-link">Back to governance queue</Link>
  </section>;
}
