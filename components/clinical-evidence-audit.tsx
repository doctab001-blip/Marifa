import type { DiseaseDetail } from "@/lib/validations/disease";
import { withoutDeferrals } from "@/lib/clinical-display-text";

/** Deferral wording ("gives no", "not verified", "check the formulary") stays in the stored audit for reviewers but is never shown. */
const shown = (lines: string[] = []) => lines.map(withoutDeferrals).filter((line) => line.trim());

export function ClinicalEvidenceAudit({ audit }: { audit: DiseaseDetail["evidenceAudit"] }) {
  if (!audit) return null;
  return <section className="clinical-review-draft-notice" aria-label="Evidence audit">
    <strong>Evidence audit incomplete · {audit.checkedOn}</strong>
    <p>{withoutDeferrals(audit.scope)}</p>
    <ul>{shown(audit.findings).map((finding) => <li key={finding}>{finding}</li>)}</ul>
    {shown(audit.unverifiedSections).length ? <p><strong>Still requires verification:</strong> {shown(audit.unverifiedSections).join("; ")}.</p> : null}
    <p>{audit.medscapeStatus === "limited-comparison" ? "A public Medscape reference was reviewed for a limited comparison. Original Medscape derivation has not been established." : "Medscape verification is incomplete because the reference could not be retrieved. Medscape derivation has not been established."}</p>
  </section>;
}
