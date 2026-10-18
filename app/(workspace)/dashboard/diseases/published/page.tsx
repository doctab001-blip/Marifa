import Link from "next/link";
import { ClipboardList, FileSearch, FilePenLine, FileText, RotateCcw, CheckCircle2 } from "@/components/icons-3d";
import { DiseaseManagementNavigation } from "@/components/diseases/DiseaseManagementNavigation";
import { ManagedTopicTile } from "@/components/diseases/ManagedTopicTile";
import { getDiseaseManagementCounts, getDiseaseManagementVersions } from "@/lib/data/disease-drafts";
import { transitionGuidelineVersion } from "@/app/(workspace)/dashboard/admin/guidelines/actions";

export default async function DiseasePublishedPage() {
  const [result, counts] = await Promise.all([getDiseaseManagementVersions("published"), getDiseaseManagementCounts()]);
  return (
    <main className="page disease-directory-page">
      <header className="disease-directory-hero">
        <div>
          <p className="disease-kicker">Disease management</p>
          <h1>Published clinical topics</h1>
          <p>Staged content is editable by authorized administrators and is not visible to end-users.</p>
        </div>
        <div className="directory-governance-note"><FileText size={17} aria-hidden="true" /><div><strong>Staged for approval</strong><span>Publishing does not make a topic live.</span></div></div>
      </header>

      <DiseaseManagementNavigation active="published" counts={counts} />

      {result.state === "unavailable" ? (
        <section className="directory-empty card" role="alert"><FileSearch size={28} aria-hidden="true" /><h2>Published topics unavailable</h2></section>
      ) : (
        <section className="disease-draft-list" aria-labelledby="published-topic-list-title">
          <div className="directory-section-heading"><h2 id="published-topic-list-title">Published topics</h2><p role="status">{result.topicCount} staged topics</p></div>
          <div className="topic-tile-grid">
            {result.versions.map((version) => {
              const editHref = `/dashboard/admin/guidelines/${encodeURIComponent(version.id)}?version=${encodeURIComponent(version.versionId)}`;
              const pasteHref = `/dashboard/admin/guidelines/${encodeURIComponent(version.id)}/paste?version=${encodeURIComponent(version.versionId)}`;
              return (
                <ManagedTopicTile
                  key={version.versionId}
                  tone="published"
                  statusLabel="Published"
                  title={version.title}
                  specialty={version.specialty}
                  version={version.version}
                  source={version.sourceTitle}
                  href={version.canEdit ? editHref : undefined}
                  linkLabel={`Edit ${version.title}, version ${version.version}`}
                  actions={version.canEdit ? (
                    <>
                      <Link className="topic-tile-action" href={editHref} aria-label={`Edit ${version.title}`} title="Edit topic"><FilePenLine size={15} aria-hidden="true" /></Link>
                      <Link className="topic-tile-action" href={pasteHref} aria-label={`Paste full content into ${version.title}`} title="Paste full content"><ClipboardList size={15} aria-hidden="true" /></Link>
                      <form action={transitionGuidelineVersion}>
                        <input type="hidden" name="id" value={version.id} /><input type="hidden" name="versionId" value={version.versionId} /><input type="hidden" name="target" value="draft" />
                        <button className="topic-tile-action" type="submit" aria-label={`Revert ${version.title} to Draft`} title="Revert to Draft"><RotateCcw size={15} aria-hidden="true" /></button>
                      </form>
                      <form action={transitionGuidelineVersion}>
                        <input type="hidden" name="id" value={version.id} /><input type="hidden" name="versionId" value={version.versionId} /><input type="hidden" name="target" value="approved" />
                        <button className="topic-tile-action is-approve" type="submit" aria-label={`Approve ${version.title}`} title="Approve"><CheckCircle2 size={15} aria-hidden="true" /></button>
                      </form>
                    </>
                  ) : undefined}
                />
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
