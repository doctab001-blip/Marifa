import { ShieldCheck } from "lucide-react";
import { ModelOfCareDirectory } from "@/components/model-of-care-directory";
import { RecentProtocols } from "@/components/recent-protocols";
import { carePillars } from "@/data/mockDiseases";
import { getDiseaseProtocols } from "@/lib/data/disease-protocols";

export default async function DiseaseDirectoryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const diseases = await getDiseaseProtocols();
  const recentlyUpdatedProtocols = [...diseases].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  return (
    <main className="page disease-directory-page">
      <header className="disease-directory-hero">
        <div>
          <p className="disease-kicker">Disease management</p>
          <h1>Clinical pathways, organised around care</h1>
          <p>Find governed disease protocols across the six Saudi Model of Care pillars. Review source, approval status and pathway steps before use.</p>
        </div>
        <div className="directory-governance-note">
          <ShieldCheck size={19} strokeWidth={1.5} aria-hidden="true" />
          <div><strong>UI demonstration</strong><span>Mock clinical records only — not for patient care</span></div>
        </div>
      </header>

      <ModelOfCareDirectory pillars={carePillars} diseases={diseases} initialQuery={q} />
      <RecentProtocols protocols={recentlyUpdatedProtocols} />
    </main>
  );
}
