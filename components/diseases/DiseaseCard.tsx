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
  const approved = disease.status === "approved" || disease.status === "published";
  const draft = disease.status === "draft";
  const statusLabel = approved ? "Approved" : draft ? "Draft" : disease.status.replaceAll("_", " ");

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
        <p>{disease.specialty}</p>
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
