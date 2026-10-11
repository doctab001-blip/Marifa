import type { DiseaseDetail } from "@/lib/validations/disease";

export function ClinicalEvidenceAudit({ audit }: { audit: DiseaseDetail["evidenceAudit"] }) {
  if (!audit) return null;
  return <section className="clinical-review-draft-notice" aria-label="Evidence audit">
    <strong>Evidence audit incomplete · {audit.checkedOn}</strong>
    <p>{audit.scope}</p>
    <ul>{audit.findings.map((finding) => <li key={finding}>{finding}</li>)}</ul>
    <p><strong>Still requires verification:</strong> {audit.unverifiedSections.join("; ")}.</p>
    <p>{audit.medscapeStatus === "limited-comparison" ? "A public Medscape reference was reviewed for a limited comparison. Original Medscape derivation has not been established." : "Medscape verification is incomplete because the reference could not be retrieved. Medscape derivation has not been established."}</p>
  </section>;
}
