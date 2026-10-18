import Link from "next/link";
import { FileCheck2, FileSearch } from "@/components/icons-3d";
import { DiseaseManagementNavigation } from "@/components/diseases/DiseaseManagementNavigation";
import { getDiseaseManagementCounts, getDiseaseManagementVersions } from "@/lib/data/disease-drafts";
import { createDraftFromApproved } from "@/app/(workspace)/dashboard/admin/guidelines/actions";

export default async function DiseaseApprovedPage() {
  const [result, counts] = await Promise.all([getDiseaseManagementVersions("approved"), getDiseaseManagementCounts()]);

  return (
    <main className="page disease-directory-page">
      <header className="disease-directory-hero">
        <div>
          <p className="disease-kicker">Disease management</p>
          <h1>Approved clinical topics</h1>
          <p>These versions have a recorded clinical approval. They are separated from Draft and Published versions to make their governance state clear.</p>
        </div>
        <div className="directory-governance-note">
          <FileCheck2 size={19} strokeWidth={1.5} aria-hidden="true" />
          <div><strong>Approval record</strong><span>Approved versions are preserved as the clinical approval history.</span></div>
        </div>
      </header>

      <DiseaseManagementNavigation active="approved" counts={counts} />

      {result.state === "unavailable" ? (
        <section className="directory-empty card" role="alert"><FileSearch size={28} aria-hidden="true" /><h2>Approved topics unavailable</h2><p>Try again later.</p></section>
      ) : result.versions.length === 0 ? (
        <section className="directory-empty card"><FileCheck2 size={28} aria-hidden="true" /><h2>No approved topics yet</h2><p>Clinically approved versions will appear here.</p></section>
      ) : (
        <section className="disease-draft-list" aria-labelledby="approved-topic-list-title">
          <div className="directory-section-heading"><div><p className="disease-kicker">Governance history</p><h2 id="approved-topic-list-title">Approved versions</h2></div><p role="status">{result.versions.length} approved versions across {result.topicCount} topics</p></div>
          <div className="disease-draft-grid">{result.versions.map((version) => <article className="card disease-draft-card" key={version.versionId}><div className="disease-draft-card-heading"><span className="admin-queue-status status-approved">Approved</span><span className="disease-draft-version">Version {version.version}</span></div><h3><Link className="disease-draft-card-link" href={`/dashboard/diseases/${version.id}?version=${encodeURIComponent(version.versionId)}`}>{version.title}</Link></h3><p className="disease-draft-meta">{version.specialty}</p><p className="disease-draft-source">Source: {version.sourceTitle}</p><div className="disease-draft-actions disease-draft-actions-top"><Link className="ui-button ui-button-primary" href={`/dashboard/diseases/${version.id}?version=${encodeURIComponent(version.versionId)}`}>View approved topic</Link>{version.canEdit && <form action={createDraftFromApproved}><input type="hidden" name="id" value={version.id}/><input type="hidden" name="versionId" value={version.versionId}/><button className="ui-button ui-button-secondary">Create editable draft</button></form>}</div></article>)}</div>
        </section>
      )}
    </main>
  );
}
