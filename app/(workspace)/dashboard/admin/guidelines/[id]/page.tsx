import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpenCheck, Save } from "lucide-react";
import { getDraftGuideline } from "@/lib/admin/data";
import { saveDraftGuideline } from "../actions";

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
            <div><p className="eyebrow">Clinical content · {result.isLive ? "Published topic" : "Draft"}</p><h2>Edit {result.disease.title}</h2><p>{result.disease.pillar} · {result.disease.specialty}</p></div>
            <span className={`admin-queue-status ${result.isLive ? "status-published" : "status-draft"}`}>{result.isLive ? "Published to all site users" : "Draft · not approved"}</span>
          </header>
          {query.saved === "1" && <p className="admin-save-message" role="status">{result.isLive ? "Topic saved live." : "Draft saved. Its status remains draft."}</p>}
          {query.error && messages[query.error] && <p className="admin-save-error" role="alert">{messages[query.error]}</p>}
          <div className="clinical-governance-notice" role="note"><strong>Review state:</strong> {result.isLive ? "This educational topic is live for review; local clinical validation is pending. Do not use it as an official local protocol until clinically validated." : "This is an editable draft."} Textbook edition details identify the reference used; they do not mean this content has been clinically reviewed. Check current Saudi guidance, local formulary, and service protocols.</div>
          <article className="card admin-source-summary">
            <BookOpenCheck size={18} aria-hidden="true" />
            <div><strong>{result.sourceTitle ?? "Textbook source not recorded"}</strong><span>{result.sourceUrl ? <a href={result.sourceUrl} target="_blank" rel="noreferrer">Open publisher source page</a> : "No publisher URL recorded"}</span><small>Prepared 10 October 2026 · the date in the draft is not a clinical-review date.</small></div>
          </article>
          <details className="card admin-source-summary"><summary>Review the six-part topic</summary><div><h3>1. Topic and mechanisms</h3><p>{result.disease.pathophysiology.summary}</p><h3>2. Presentation</h3><ul>{result.disease.presentation.symptoms.map((item) => <li key={item}>{item}</li>)}</ul><h3>3. Differential diagnoses</h3><ul>{result.disease.differentials.map((item) => <li key={item.condition}><strong>{item.condition}:</strong> {item.distinguishingFeatures}</li>)}</ul><h3>4. Investigations</h3><ul>{[...result.disease.investigations.ruleIn, ...result.disease.investigations.ruleOut].map((item) => <li key={item.testName}><strong>{item.testName}:</strong> {item.clinicalRationale}</li>)}</ul><h3>5. Clinical management</h3><ul>{result.disease.clinicalManagement.map((item) => <li key={item.id}><strong>{item.title}:</strong> {item.actions.join(" ")}</li>)}</ul><h3>6. Non-clinical care</h3><ul>{result.disease.nonClinicalManagement.patientEducation.map((item) => <li key={item}>{item}</li>)}</ul></div></details>
          <form action={saveDraftGuideline} className="card admin-json-form">
            <input type="hidden" name="id" value={id} />
            <label htmlFor="guideline-content">Six-tier pathway content (JSON)</label>
            <p className="admin-form-note">Edit the topic content in Marifa’s six-part format. Saving validates each section and keeps its current publication status.</p>
            <textarea id="guideline-content" name="content" className="admin-json-editor" defaultValue={JSON.stringify(result.disease, null, 2)} spellCheck={false} required />
            <div className="admin-json-actions"><span>{result.isLive ? "Your changes will be immediately visible to all site users." : "Only this organisation’s draft can be changed here."}</span><button className="ui-button ui-button-primary" type="submit"><Save size={15} />{result.isLive ? "Save live topic" : "Save draft"}</button></div>
          </form>
        </>
      )}
    </section>
  );
}
