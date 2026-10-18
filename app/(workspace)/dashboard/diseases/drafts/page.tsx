import { FileClock, FileSearch, ShieldAlert } from "@/components/icons-3d";
import { DiseaseManagementNavigation } from "@/components/diseases/DiseaseManagementNavigation";
import { TopicCard } from "@/components/diseases/TopicCard";
import { getDiseaseDrafts, getDiseaseManagementCounts } from "@/lib/data/disease-drafts";
import { approvalErrorMessages } from "@/lib/approval-errors";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-SA", { dateStyle: "medium", timeZone: "Asia/Riyadh" }).format(new Date(date));
}

export default async function DiseaseDraftsPage({ searchParams }: { searchParams: Promise<{ approved?: string; error?: string }> }) {
  const query = await searchParams;
  const [result, counts] = await Promise.all([getDiseaseDrafts(), getDiseaseManagementCounts()]);

  return (
    <main className="page disease-directory-page">
      <header className="disease-directory-hero">
        <div>
          <p className="disease-kicker">Disease management</p>
          <h1>Draft clinical topics</h1>
          <p>Organization drafts and topics awaiting review. These records are kept separate from the approved disease directory.</p>
        </div>
        <div className="directory-governance-note">
          <ShieldAlert size={19} strokeWidth={1.5} aria-hidden="true" />
          <div><strong>Not approved</strong><span>Drafts are not for clinical use.</span></div>
        </div>
      </header>

      <DiseaseManagementNavigation active="drafts" counts={counts} />

      <p className="clinical-review-draft-notice" role="note"><strong>Temporary admin access:</strong> sign-in is disabled for this development phase. Anyone with this site link can open the editor and use the approval controls. Every approved version still records the configured Marifa administrator and approval time.</p>

      {query.approved === "1" && <p className="admin-save-message" role="status">Version approved. The reviewer and approval time were recorded.</p>}
      {query.error && approvalErrorMessages[query.error] && <p className="admin-save-error" role="alert">{approvalErrorMessages[query.error]}</p>}
      {query.error === "temporary_admin_config" && <p className="admin-save-error" role="alert">Temporary administrator access is not configured on this deployment.</p>}

      {result.state === "unavailable" ? (
        <section className="directory-empty card" role="alert">
          <FileSearch size={28} strokeWidth={1.5} aria-hidden="true" />
          <h2>Drafts unavailable</h2>
          <p>The organization draft list could not be loaded. Try again later.</p>
        </section>
      ) : result.drafts.length === 0 ? (
        <section className="directory-empty card">
          <FileClock size={28} strokeWidth={1.5} aria-hidden="true" />
          <h2>No drafts yet</h2>
          <p>New organization drafts and review candidates will appear here.</p>
        </section>
      ) : (
        <section className="disease-draft-list" aria-labelledby="disease-draft-list-title">
          <div className="directory-section-heading">
            <div><p className="disease-kicker">Organization workspace</p><h2 id="disease-draft-list-title">Draft topics</h2></div>
            <p role="status">{result.topicCount} draft topics</p>
          </div>
          <div className="topic-tile-grid">
            {result.drafts.map((draft) => (
              <TopicCard key={draft.versionId} topic={draft} preparedDate={formatDate(draft.createdAt)} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
