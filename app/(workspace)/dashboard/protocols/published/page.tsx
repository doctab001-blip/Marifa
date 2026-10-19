import Link from "next/link";
import { ClipboardList, FilePenLine, FileSearch, FileText, RotateCcw } from "@/components/icons-3d";
import { ManagedTopicBrowser } from "@/components/diseases/ManagedTopicBrowser";
import { ManagedTopicTile } from "@/components/diseases/ManagedTopicTile";
import { ProtocolNavigation } from "@/components/protocols/ProtocolNavigation";
import { protocolMessages } from "@/components/protocols/protocol-messages";
import { getProtocolCounts, getProtocolVersions } from "@/lib/data/disease-drafts";
import { formatManagedDate } from "@/lib/dashboard/format-date";
import { PROTOCOLS_HOME } from "@/lib/local-protocols";
import { revertProtocolToDraft } from "../actions";

export default async function ProtocolPublishedPage({ searchParams }: { searchParams: Promise<{ error?: string; published?: string }> }) {
  const query = await searchParams;
  const [result, counts] = await Promise.all([getProtocolVersions(), getProtocolCounts()]);

  return (
    <main className="page disease-directory-page">
      <header className="disease-directory-hero">
        <div>
          <p className="disease-kicker">Local protocols &amp; SOPs</p>
          <h1>Published protocols</h1>
          <p>Emergency Department protocols that are live for staff. Move a protocol back to Draft to change it safely.</p>
        </div>
        <div className="directory-governance-note"><FileText size={17} aria-hidden="true" /><div><strong>Live for staff</strong><span>Clinical review stays pending until a clinician signs off.</span></div></div>
      </header>

      <ProtocolNavigation active="published" counts={counts} />

      {query.published === "1" && <p className="admin-save-message" role="status">Protocol published.</p>}
      {query.error && protocolMessages[query.error] && <p className="admin-save-error" role="alert">{protocolMessages[query.error]}</p>}

      {result.state === "unavailable" ? (
        <section className="directory-empty card" role="alert"><FileSearch size={28} aria-hidden="true" /><h2>Published protocols unavailable</h2></section>
      ) : result.versions.length === 0 ? (
        <section className="directory-empty card">
          <FileText size={28} strokeWidth={1.5} aria-hidden="true" />
          <h2>No published protocols yet</h2>
          <p>Publish a protocol from the Drafts tab once its content has been written and checked.</p>
        </section>
      ) : (
        <section className="disease-draft-list" aria-labelledby="protocol-published-list-title">
          <div className="directory-section-heading"><h2 id="protocol-published-list-title">Published protocols</h2><p role="status">{result.topicCount} published protocols</p></div>
          <ManagedTopicBrowser noun="published" dateNoun="Published" items={result.versions.map((version) => {
            const editHref = `/dashboard/admin/guidelines/${encodeURIComponent(version.id)}?version=${encodeURIComponent(version.versionId)}`;
            const pasteHref = `/dashboard/admin/guidelines/${encodeURIComponent(version.id)}/paste?version=${encodeURIComponent(version.versionId)}`;
            return {
              key: version.versionId, title: version.title, specialty: version.specialty, changedAt: version.statusChangedAt,
              tile: (
                <ManagedTopicTile
                  tone="published"
                  statusLabel="Published"
                  title={version.title}
                  specialty={version.specialty}
                  version={version.version}
                  source={version.sourceTitle}
                  dateLabel={`Published ${formatManagedDate(version.statusChangedAt)}`}
                  href={`${PROTOCOLS_HOME}/${encodeURIComponent(version.id)}`}
                  linkLabel={`Open ${version.title}`}
                  actions={version.canEdit ? (
                    <>
                      <Link className="topic-tile-action" href={editHref} aria-label={`Edit ${version.title}`} title="Edit protocol"><FilePenLine size={15} aria-hidden="true" /></Link>
                      <Link className="topic-tile-action" href={pasteHref} aria-label={`Paste full content into ${version.title}`} title="Paste full content"><ClipboardList size={15} aria-hidden="true" /></Link>
                      <form action={revertProtocolToDraft}>
                        <input type="hidden" name="id" value={version.id} /><input type="hidden" name="versionId" value={version.versionId} />
                        <button className="topic-tile-action" type="submit" aria-label={`Return ${version.title} to Draft`} title="Return to Draft"><RotateCcw size={15} aria-hidden="true" /></button>
                      </form>
                    </>
                  ) : undefined}
                />
              ),
            };
          })} />
        </section>
      )}
    </main>
  );
}
