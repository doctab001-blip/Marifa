import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@/components/icons-3d";
import { getDraftGuideline } from "@/lib/admin/data";
import { PasteTopicEditor } from "@/components/admin/paste-topic-editor";
import { savePastedTopic } from "./actions";
import { isDevEditMode } from "@/lib/dev-edit-mode";
import { isLocalProtocolSourceType, PROTOCOLS_DRAFTS, PROTOCOLS_HOME, PROTOCOLS_PUBLISHED } from "@/lib/local-protocols";
import { displayTopicTitle } from "@/lib/topic-title";
import { ActiveTopicSignal } from "@/components/topic-context";

const errorMessages: Record<string, string> = {
  empty: "Nothing was pasted. Paste the full topic text and try again.",
  too_large: "The pasted text is too long. Paste one topic at a time.",
  paste_invalid: "The pasted text could not be turned into a valid topic. Fix the problems listed on the right and try again.",
  version_not_editable: "This version can no longer be edited. Open the topic from Disease Management again.",
  save_failed: "The topic could not be saved. Your text is still in the box; try again.",
  metadata_save_failed: "The topic saved, but its title or speciality did not update. Keep this page open and contact an administrator.",
};

function riyadhToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export default async function PasteTopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ version?: string; saved?: string; published?: string; draft?: string; score?: string; error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const result = await getDraftGuideline(id, query.version);
  if (result.state === "not-found") notFound();
  const devEdit = isDevEditMode();
  const isProtocol = isLocalProtocolSourceType(result.sourceType);
  const status = result.state === "ready" && (result.versionStatus === "published" || result.versionStatus === "approved") ? result.versionStatus : "draft";

  return (
    <section className="admin-content topic-page paste-editor-page">
      <ActiveTopicSignal id={id} title={displayTopicTitle(result.state === "ready" ? result.disease.title : result.title)} status={status} scope={isProtocol ? "protocol" : "disease"} versionId={result.state === "ready" ? result.versionId : query.version} />
      <Link href={isProtocol ? (result.state === "ready" && result.versionStatus === "published" ? PROTOCOLS_PUBLISHED : PROTOCOLS_DRAFTS) : "/dashboard/diseases/drafts"} className="disease-back-link"><ArrowLeft size={15} />{isProtocol ? "Back to Local Protocols" : "Back to Disease Management"}</Link>
      {result.state === "invalid" ? (
        <article className="card admin-edit-card">
          <p className="eyebrow">Topic needs repair</p>
          <h2>{displayTopicTitle(result.title)}</h2>
          <p>The stored version does not match the required format, so it cannot be used as the base for a paste. Ask an administrator to repair it.</p>
        </article>
      ) : result.versionStatus === "approved" && !devEdit ? (
        <article className="card admin-edit-card">
          <p className="eyebrow">Approved version</p>
          <h2>{displayTopicTitle(result.disease.title)}</h2>
          <p>Approved versions are read-only. Create a draft copy from the Approved tab, then paste into the draft.</p>
        </article>
      ) : (
        <>
          {query.saved === "1" && query.published === "1" && (
            <p className="admin-save-message" role="status">
              Published. The topic is live with clinical review still pending. <Link href={isProtocol ? `${PROTOCOLS_HOME}/${encodeURIComponent(id)}` : `/dashboard/diseases/${encodeURIComponent(id)}`}>View the topic</Link>
            </p>
          )}
          {query.saved === "1" && query.published !== "1" && (
            <p className="admin-save-message" role="status">
              {query.draft === "1" ? "Saved as a draft" : `Saved as a draft — score ${query.score ?? "below 80"}% is under the 80% needed to publish`}. It does not replace the live topic until it reaches 80%.
            </p>
          )}
          {query.error && errorMessages[query.error] && <p className="admin-save-error" role="alert">{errorMessages[query.error]}</p>}
          <PasteTopicEditor
            base={result.disease}
            guidelineId={id}
            versionId={result.versionId}
            versionLabel={result.disease.version}
            today={riyadhToday()}
            saveAction={savePastedTopic}
            devEdit={devEdit}
          />
        </>
      )}
    </section>
  );
}
