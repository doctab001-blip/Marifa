import { ShieldCheck } from "lucide-react";
import { ModelOfCareDirectory } from "@/components/model-of-care-directory";
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
          <p>Find governed disease protocols across the six Saudi Model of Care pillars. Every visible record is current, approved or published, and schema-validated before rendering.</p>
        </div>
        <div className="directory-governance-note">
          <ShieldCheck size={19} strokeWidth={1.5} aria-hidden="true" />
          <div><strong>Governed content</strong><span>Draft and invalid pathways remain hidden</span></div>
        </div>
      </header>

      <ModelOfCareDirectory diseases={result.diseases} state={result.state} rejectedCount={result.rejectedCount} initialQuery={initialQuery} />
    </main>
  );
}
