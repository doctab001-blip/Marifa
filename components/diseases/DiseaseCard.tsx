import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DiseaseGuidelineSummary } from "@/lib/data/disease-guidelines";

function readableSourceType(sourceType: string) {
  return sourceType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function DiseaseCard({ disease }: { disease: DiseaseGuidelineSummary }) {
  const reviewPending = disease.clinicalReviewStatus === "pending";
  const reviewRejected = disease.clinicalReviewStatus === "rejected";
  const approved = !reviewPending && !reviewRejected && (disease.status === "approved" || disease.status === "published");
  const draft = disease.status === "draft";
  const statusLabel = reviewPending ? "Clinical review pending" : reviewRejected ? "Clinical review rejected" : approved ? "Approved" : draft ? "Draft" : disease.status.replaceAll("_", " ");

  return (
    <Link href={`/dashboard/diseases/${disease.id}`} className={`disease-card${disease.pillar === "Urgent Care" ? " is-urgent" : ""}`}>
      <div className="disease-card-top">
        <span className="disease-pillar-label">{disease.pillar}</span>
        <span className={`disease-status-badge ${approved ? "is-approved" : draft ? "is-draft" : ""}`}>
          {statusLabel}
        </span>
      </div>
      <div className="disease-card-copy">
        <h3>{disease.title}</h3>
        <div className="disease-speciality-badges" aria-label="Medical specialities">
          <span className="disease-speciality-badge">{disease.speciality ?? disease.specialty}</span>
          {(disease.subSpecialities ?? []).map((speciality) => <span className="disease-sub-speciality-badge" key={speciality}>{speciality}</span>)}
        </div>
      </div>
      <div className="disease-card-footer">
        <span className="disease-authority-badge" aria-label={`Authority: ${disease.authority}`}>
          {disease.authority}
        </span>
        {disease.sourceType && <span className="disease-source-type">{readableSourceType(disease.sourceType)}</span>}
        <span className="disease-card-link-label">View pathway <ArrowRight size={15} aria-hidden="true" /></span>
      </div>
    </Link>
  );
}
