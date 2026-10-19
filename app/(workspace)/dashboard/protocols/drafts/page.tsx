import Link from "next/link";
import { ClipboardList, FileClock, FilePenLine, FileSearch, Send, ShieldAlert, Trash2 } from "@/components/icons-3d";
import { ManagedTopicBrowser } from "@/components/diseases/ManagedTopicBrowser";
import { ManagedTopicTile } from "@/components/diseases/ManagedTopicTile";
import { ProtocolNavigation } from "@/components/protocols/ProtocolNavigation";
import { protocolMessages } from "@/components/protocols/protocol-messages";
import { getProtocolCounts, getProtocolDrafts } from "@/lib/data/disease-drafts";
import { formatManagedDate } from "@/lib/dashboard/format-date";
import { deleteProtocolDraft, publishProtocol } from "../actions";

export default async function ProtocolDraftsPage({ searchParams }: { searchParams: Promise<{ error?: string; reverted?: string; deleted?: string }> }) {
  const query = await searchParams;
  const [result, counts] = await Promise.all([getProtocolDrafts(), getProtocolCounts()]);

  return (
    <main className="page disease-directory-page">
      <header className="disease-directory-hero">
        <div>
          <p className="disease-kicker">Local protocols &amp; SOPs</p>
          <h1>Draft protocols</h1>
          <p>Emergency Department protocols being written and checked. Drafts are only visible to administrators until they are published.</p>
        </div>
        <div className="directory-governance-note">
          <ShieldAlert size={19} strokeWidth={1.5} aria-hidden="true" />
          <div><strong>Not for clinical use</strong><span>Drafts are outlines or unchecked content.</span></div>
        </div>
      </header>

      <ProtocolNavigation active="drafts" counts={counts} />

      {query.reverted === "1" && <p className="admin-save-message" role="status">Protocol returned to Draft.</p>}
      {query.deleted === "1" && <p className="admin-save-message" role="status">Draft deleted.</p>}
      {query.error && protocolMessages[query.error] && <p className="admin-save-error" role="alert">{protocolMessages[query.error]}</p>}

      {result.state === "unavailable" ? (
        <section className="directory-empty card" role="alert">
          <FileSearch size={28} strokeWidth={1.5} aria-hidden="true" />
          <h2>Drafts unavailable</h2>
          <p>The protocol draft list could not be loaded. Try again later.</p>
        </section>
      ) : result.drafts.length === 0 ? (
        <section className="directory-empty card">
          <FileClock size={28} strokeWidth={1.5} aria-hidden="true" />
          <h2>No draft protocols yet</h2>
          <p>New protocol drafts will appear here.</p>
        </section>
      ) : (
        <section className="disease-draft-list" aria-labelledby="protocol-draft-list-title">
          <div className="directory-section-heading">
            <div><p className="disease-kicker">Emergency Department</p><h2 id="protocol-draft-list-title">Draft protocols</h2></div>
            <p role="status">{result.topicCount} draft protocols</p>
          </div>
          <ManagedTopicBrowser
            noun="draft"
            dateNoun="Prepared"
            items={result.drafts.map((draft) => {
              const editHref = `/dashboard/admin/guidelines/${encodeURIComponent(draft.id)}?version=${encodeURIComponent(draft.versionId)}`;
              const pasteHref = `/dashboard/admin/guidelines/${encodeURIComponent(draft.id)}/paste?version=${encodeURIComponent(draft.versionId)}`;
              return {
                key: draft.versionId, title: draft.title, specialty: draft.specialty, changedAt: draft.createdAt,
                tile: (
                  <ManagedTopicTile
                    tone="draft"
                    statusLabel="Draft"
                    title={draft.title}
                    specialty={draft.specialty}
                    version={draft.version}
                    source={draft.sourceTitle}
                    dateLabel={`Prepared ${formatManagedDate(draft.createdAt)}`}
                    href={draft.canEdit ? editHref : undefined}
                    linkLabel={`Open ${draft.title}, version ${draft.version}`}
                    actions={draft.canEdit ? (
                      <>
                        <Link className="topic-tile-action" href={editHref} aria-label={`Edit ${draft.title}`} title="Edit protocol"><FilePenLine size={15} aria-hidden="true" /></Link>
                        <Link className="topic-tile-action" href={pasteHref} aria-label={`Paste full content into ${draft.title}`} title="Paste full content"><ClipboardList size={15} aria-hidden="true" /></Link>
                        <form action={publishProtocol}>
                          <input type="hidden" name="id" value={draft.id} /><input type="hidden" name="versionId" value={draft.versionId} />
                          <button className="topic-tile-action" type="submit" aria-label={`Publish ${draft.title}`} title="Publish"><Send size={15} aria-hidden="true" /></button>
                        </form>
                        <form action={deleteProtocolDraft}>
                          <input type="hidden" name="id" value={draft.id} /><input type="hidden" name="versionId" value={draft.versionId} />
                          <button className="topic-tile-action is-delete" type="submit" aria-label={`Delete ${draft.title}`} title="Delete draft"><Trash2 size={15} aria-hidden="true" /></button>
                        </form>
                      </>
                    ) : undefined}
                  />
                ),
              };
            })}
          />
        </section>
      )}
    </main>
  );
}
