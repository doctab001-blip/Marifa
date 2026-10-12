import { ShieldCheck } from "lucide-react";
import { DiseaseDirectoryClient } from "@/components/diseases/DiseaseDirectoryClient";
import { DiseaseManagementNavigation } from "@/components/diseases/DiseaseManagementNavigation";
import { getApprovedDiseaseGuidelines } from "@/lib/data/disease-guidelines";

export default async function DiseaseDirectoryPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const initialQuery = typeof params.q === "string" ? params.q : "";
  const result = await getApprovedDiseaseGuidelines();

  return (
    <main className="page disease-directory-page">
      <header className="disease-directory-hero">
        <div>
          <p className="disease-kicker">Disease management</p>
          <h1>Clinical pathways, organised around care</h1>
          <p>Explore clinical scenarios across the six Saudi Model of Care pillars. The live directory contains only topics meeting the current authoring standard; all other topics remain in Draft for correction and review.</p>
        </div>
        <div className="directory-governance-note">
          <ShieldCheck size={19} strokeWidth={1.5} aria-hidden="true" />
          <div><strong>Clinical review status</strong><span>Check each scenario’s review notice before use</span></div>
        </div>
      </header>

      <DiseaseManagementNavigation active="directory" />

      <DiseaseDirectoryClient diseases={result.diseases} state={result.state} rejectedCount={result.rejectedCount} withheldCount={result.withheldCount} initialQuery={initialQuery} />
    </main>
  );
}
