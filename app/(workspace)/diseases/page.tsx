import { DemoBanner } from "@/components/demo-banner";
import { DiseaseDirectory } from "@/components/disease-directory";
import { getDiseaseTopics } from "@/lib/data/diseases";

export default async function DiseaseDirectoryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const topics = await getDiseaseTopics();
  return <main className="page"><DemoBanner /><div className="page-header"><div><div className="eyebrow">Clinical knowledge engine</div><h1 className="page-title">Disease Management</h1><p className="page-copy">Search authorized clinical topics by disease, symptom, abbreviation, specialty or indexed Arabic term. Results are ranked by relevance and source metadata.</p></div><span className="status status-draft">{topics.length} demo topics</span></div><DiseaseDirectory items={topics} initialQuery={q} /></main>;
}
