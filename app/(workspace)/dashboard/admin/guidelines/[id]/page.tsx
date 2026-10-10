import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpenCheck, Save } from "lucide-react";
import { getDraftGuideline } from "@/lib/admin/data";
import { saveDraftGuideline } from "../actions";

const messages: Record<string, string> = {
  invalid_json: "The content is not valid JSON. Correct the formatting and try again.",
  invalid_content: "The content does not match the required six-tier draft format. Check the scenario, status, and required sections.",
  version_not_editable: "This draft version is no longer editable. Refresh the governance queue.",
  save_failed: "The draft could not be saved. Your edits remain in the editor; try again.",
  metadata_save_failed: "The clinical content saved, but its title metadata did not. Keep the editor open and contact an administrator.",
};

export default async function EditDraftGuidelinePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const result = await getDraftGuideline(id);
  if (result.state === "not-found") notFound();

  return (
    <section className="admin-content">
      <Link href="/dashboard/admin/governance" className="disease-back-link"><ArrowLeft size={15} />Back to governance queue</Link>
      {result.state === "invalid" ? (
        <article className="card admin-edit-card">
          <p className="eyebrow">Draft needs repair</p>
          <h2>{result.title}</h2>
          <p>This record could not be opened because it does not match the required format. Ask an administrator to repair the stored draft.</p>
          <ul>{result.issues.slice(0, 8).map((issue, index) => <li key={`${index}-${issue}`}>{issue}</li>)}</ul>
        </article>
      ) : (
        <>
          <header className="admin-section-heading admin-draft-heading">
            <div><p className="eyebrow">Clinical content · Draft</p><h2>Edit {result.disease.title}</h2><p>{result.disease.pillar} · {result.disease.specialty}</p></div>
            <span className="admin-queue-status status-draft">Draft · not approved</span>
          </header>
          {query.saved === "1" && <p className="admin-save-message" role="status">Draft saved. Its status remains draft.</p>}
          {query.error && messages[query.error] && <p className="admin-save-error" role="alert">{messages[query.error]}</p>}
          <div className="clinical-governance-notice" role="note"><strong>Review state:</strong> This is an editable draft. Textbook edition details identify the reference used; they do not mean this pathway has been clinically reviewed or approved. Check current Saudi guidance, local formulary, and service protocols before requesting approval.</div>
          <article className="card admin-source-summary">
            <BookOpenCheck size={18} aria-hidden="true" />
            <div><strong>{result.sourceTitle ?? "Textbook source not recorded"}</strong><span>{result.sourceUrl ? <a href={result.sourceUrl} target="_blank" rel="noreferrer">Open publisher source page</a> : "No publisher URL recorded"}</span><small>Prepared 10 October 2026 · the date in the draft is not a clinical-review date.</small></div>
          </article>
          {result.disease.clinicalScenario && <article className="card admin-scenario-preview"><p className="eyebrow">Case scenario</p><p>{result.disease.clinicalScenario}</p></article>}
          <form action={saveDraftGuideline} className="card admin-json-form">
            <input type="hidden" name="id" value={id} />
            <label htmlFor="guideline-content">Six-tier pathway content (JSON)</label>
            <p className="admin-form-note">Edit the case and pathway together. Saving checks every required field and keeps the record in draft status.</p>
            <textarea id="guideline-content" name="content" className="admin-json-editor" defaultValue={JSON.stringify(result.disease, null, 2)} spellCheck={false} required />
            <div className="admin-json-actions"><span>Only this organisation’s draft can be changed here.</span><button className="ui-button ui-button-primary" type="submit"><Save size={15} />Save draft</button></div>
          </form>
        </>
      )}
    </section>
  );
}
