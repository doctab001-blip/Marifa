import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpenCheck, CheckCircle2, FileText, Hourglass, Stethoscope } from "@/components/icons-3d";
import { getDraftGuideline } from "@/lib/admin/data";
import { approveGuidelineVersion, saveDraftGuideline } from "../actions";
import { GuidelinePathwayForm } from "@/components/admin/guideline-pathway-form";
import { ClinicalEvidenceAudit } from "@/components/clinical-evidence-audit";
import { EmergencyTopic } from "@/components/emergency-topic";

const messages: Record<string, string> = {
  invalid_json: "The content is not valid JSON. Correct the formatting and try again.",
  invalid_content: "The content does not match the required six-part topic format, status, and required sections.",
  version_not_editable: "This draft version is no longer editable. Refresh the governance queue.",
  save_failed: "The draft could not be saved. Your edits remain in the editor; try again.",
  metadata_save_failed: "The clinical content saved, but its title metadata did not. Keep the editor open and contact an administrator.",
};

export default async function EditDraftGuidelinePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string; version?: string; published?: string; under_review?: string; score?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const result = await getDraftGuideline(id, query.version);
  if (result.state === "not-found") notFound();

  return (
    <section className="admin-content topic-page">
      <Link href={query.version ? "/dashboard/diseases" : "/dashboard/diseases/drafts"} className="disease-back-link"><ArrowLeft size={15} />Back to Disease Management</Link>
      {result.state === "invalid" ? (
        <article className="card admin-edit-card">
          <p className="eyebrow">Draft needs repair</p>
          <h2>{result.title}</h2>
          <p>This record could not be opened because it does not match the required format. Ask an administrator to repair the stored draft.</p>
          <ul>{result.issues.slice(0, 8).map((issue, index) => <li key={`${index}-${issue}`}>{issue}</li>)}</ul>
        </article>
      ) : (
        <>
          {query.saved === "1" && query.published === "1" && <p className="admin-save-message" role="status">New version saved and published. Clinical review remains pending.</p>}
          {query.saved === "1" && query.under_review === "1" && <p className="admin-save-message" role="status">New revision saved for review (authoring score {query.score ?? "below 80"}%). It will publish automatically once it meets the 80% threshold.</p>}
          {query.error && messages[query.error] && <p className="admin-save-error" role="alert">{messages[query.error]}</p>}
          <article className="scenario-card" aria-labelledby="scenario-title">
            <header className="sc-hero">
              <div className="sc-eyebrow-row"><span className="sc-icon-tile" aria-hidden="true"><Stethoscope size={24} /></span><span className="pill pill-aqua">Clinical scenario</span><span className="pill pill-sky">{result.disease.pillar}</span></div>
              <h1 id="scenario-title" className="scenario-title">{result.disease.title}</h1>
            </header>
            {!result.isLive && !result.isPublished && <div className="clinical-review-draft-notice" role="alert"><strong>UNREVIEWED DRAFT — NOT FOR CLINICAL USE.</strong> This version is visible in Drafts only until it meets the authoring standard and completes clinical governance review.</div>}
            <EmergencyTopic disease={result.disease} investigationSource={result.sourceUrl ? { title: result.sourceTitle, url: result.sourceUrl } : undefined} />
            <section className="topic-approval-bar" aria-label="Draft actions">
              <p>{result.isLive ? <><span className="pill pill-emerald"><CheckCircle2 size={16} aria-hidden="true" /><strong>Approved</strong></span><span className="pill pill-slate pill-sm"><FileText size={14} aria-hidden="true" />Version {result.disease.version}</span></> : result.isPublished ? <><span className="pill pill-sky"><FileText size={16} aria-hidden="true" /><strong>Published</strong></span><span className="pill pill-slate pill-sm"><FileText size={14} aria-hidden="true" />Version {result.disease.version}</span></> : <><span className="pill pill-amber"><Hourglass size={16} aria-hidden="true" /><strong>Status: Draft</strong></span><span className="pill pill-slate pill-sm"><FileText size={14} aria-hidden="true" />Version {result.disease.version}</span></>}</p>
              {!result.isLive && <div className="admin-header-actions"><a className="ui-button ui-button-secondary" href="#pathway-editor">{result.isPublished ? "Edit published version" : "Edit draft"}</a>{result.canApprove && <form action={approveGuidelineVersion}><input type="hidden" name="id" value={id} /><input type="hidden" name="versionId" value={result.versionId} /><input type="hidden" name="destination" value="drafts" /><button className="ui-button ui-button-primary" type="submit">Approve version</button></form>}</div>}
            </section>
          </article>
          <article className="card admin-source-summary"><BookOpenCheck size={18} aria-hidden="true" /><div><strong>{result.sourceTitle ?? "Source not recorded"}</strong><span>{result.sourceUrl ? <a href={result.sourceUrl} target="_blank" rel="noreferrer">Open source reference</a> : "No source URL recorded"}</span><small>Preparation and source-check dates do not record clinical approval.</small></div></article>
          <ClinicalEvidenceAudit audit={result.disease.evidenceAudit} />
          {result.isLive ? <div className="clinical-governance-notice" role="note"><strong>Approved versions are preserved.</strong> Published and draft versions remain editable in their respective Disease Management categories.</div> : <details className="card draft-editor-disclosure" id="pathway-editor"><summary>{result.isPublished ? "Edit published fields" : "Edit draft fields"}</summary><GuidelinePathwayForm disease={result.disease} guidelineId={id} versionId={result.versionId} saveAction={saveDraftGuideline} /></details>}
        </>
      )}
    </section>
  );
}
