import Link from "next/link";
import { ArrowRight, FileClock, FileSearch, ShieldAlert } from "lucide-react";
import { DiseaseManagementNavigation } from "@/components/diseases/DiseaseManagementNavigation";
import { getDiseaseDrafts } from "@/lib/data/disease-drafts";
import { approveGuidelineVersion } from "@/app/(workspace)/dashboard/admin/guidelines/actions";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-SA", { dateStyle: "medium", timeZone: "Asia/Riyadh" }).format(new Date(date));
}

export default async function DiseaseDraftsPage({ searchParams }: { searchParams: Promise<{ approved?: string; error?: string }> }) {
  const query = await searchParams;
  const result = await getDiseaseDrafts();

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

      <DiseaseManagementNavigation active="drafts" />

      <p className="clinical-review-draft-notice" role="note"><strong>Temporary admin access:</strong> sign-in is disabled for this development phase. Anyone with this site link can open the editor and use the approval controls. Every approved version still records the configured Marifa administrator and approval time.</p>

      {query.approved === "1" && <p className="admin-save-message" role="status">Version approved. The reviewer and approval time were recorded.</p>}
      {query.error === "approval_failed" && <p className="admin-save-error" role="alert">Approval failed because the version changed or your account does not have approval access.</p>}
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
            <p role="status">{result.drafts.length} {result.drafts.length === 1 ? "topic" : "topics"}</p>
          </div>
          <div className="disease-draft-grid">
            {result.drafts.map((draft) => (
              <article className="card disease-draft-card" key={draft.versionId}>
                <div className="disease-draft-card-heading">
                  <span className={`admin-queue-status status-${draft.versionStatus}`}>{draft.versionStatus === "under_review" ? "Under review" : "Draft"}</span>
                  <span className="disease-draft-version">Version {draft.version}</span>
                </div>
                {draft.canEdit && <div className="disease-draft-actions disease-draft-actions-top">
                  <Link className="ui-button ui-button-secondary" href={`/dashboard/admin/guidelines/${encodeURIComponent(draft.id)}?version=${encodeURIComponent(draft.versionId)}`}>Edit topic <ArrowRight size={15} aria-hidden="true" /></Link>
                  {draft.canApprove && <form action={approveGuidelineVersion}>
                    <input type="hidden" name="id" value={draft.id} />
                    <input type="hidden" name="versionId" value={draft.versionId} />
                    <input type="hidden" name="destination" value="drafts" />
                    <button className="ui-button ui-button-primary" type="submit">Approve version</button>
                  </form>}
                </div>}
                <h3><Link className="disease-draft-card-link" href={draft.canEdit ? `/dashboard/admin/guidelines/${encodeURIComponent(draft.id)}?version=${encodeURIComponent(draft.versionId)}` : `/dashboard/diseases/drafts/${encodeURIComponent(draft.versionId)}`} aria-label={`Open ${draft.title}, version ${draft.version}`}>{draft.title}</Link></h3>
                <p className="disease-draft-meta">{draft.specialty} <span aria-hidden="true">·</span> Prepared {formatDate(draft.createdAt)}</p>
                <p className="disease-draft-source">{draft.isSharedReference ? "Shared reference draft" : "Organization draft"}</p>
                <p className="disease-draft-source">Source: {draft.sourceTitle}</p>
                <div className="clinical-review-draft-notice disease-draft-warning" role="note"><strong>UNREVIEWED DRAFT — NOT FOR CLINICAL USE.</strong> Clinical and governance review are pending.</div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
