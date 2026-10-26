import Link from "next/link";
import { ArrowRight } from "@/components/icons-3d";
import { specialityStyle } from "@/lib/medical-specialities";
import type { DiseaseGuidelineSummary } from "@/lib/data/disease-guidelines";
import { displayTopicTitle } from "@/lib/topic-title";

function readableSourceType(sourceType: string) {
  return sourceType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function DiseaseCard({ disease }: { disease: DiseaseGuidelineSummary }) {
  const primarySpeciality = disease.speciality ?? disease.specialty;
  const seenSpecialities = new Set([primarySpeciality.trim().toLocaleLowerCase()]);
  const subSpecialities = (disease.subSpecialities ?? []).filter((speciality) => {
    const key = speciality.trim().toLocaleLowerCase();
    if (!key || seenSpecialities.has(key)) return false;
    seenSpecialities.add(key);
    return true;
  });
  const reviewPending = disease.clinicalReviewStatus === "pending";
  const approved = !reviewPending && (disease.status === "approved" || disease.status === "published");
  const draft = disease.status === "draft";
  const underReview = disease.status === "under_review" || reviewPending;
  const statusLabel = reviewPending ? "Clinical review pending" : approved ? "Approved" : draft ? "Draft" : disease.status.replaceAll("_", " ");

  return (
    <Link href={`/dashboard/diseases/${disease.id}`} data-pillar={disease.pillar} className={`disease-card${disease.pillar === "Urgent Care" ? " is-urgent" : ""}`}>
      <div className="disease-card-top">
        <span className="disease-pillar-label">{disease.pillar}</span>
        <span className={`disease-status-badge ${approved ? "is-approved" : draft ? "is-draft" : underReview ? "is-review" : ""}`}>
          {statusLabel}
        </span>
      </div>
      <div className="disease-card-copy">
        <h3>{displayTopicTitle(disease.title)}</h3>
        <div className="disease-speciality-badges" aria-label="Medical specialities">
          <span className="disease-speciality-badge" data-spec style={specialityStyle(primarySpeciality)}>{primarySpeciality}</span>
          {subSpecialities.map((speciality) => <span className="disease-sub-speciality-badge" key={speciality}>{speciality}</span>)}
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
