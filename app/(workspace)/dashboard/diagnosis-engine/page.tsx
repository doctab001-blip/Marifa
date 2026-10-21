import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Poppins } from "next/font/google";
import { DiagnosisWorkbench } from "@/components/diagnosis-engine/diagnosis-workbench";
import { REGION_COOKIE, resolveRegion } from "@/lib/region";
import "@/app/diagnosis-engine.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-poppins", display: "swap" });

export const metadata: Metadata = { title: "Diagnosis Engine | Marifa" };

export default async function DiagnosisEnginePage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const { region } = await searchParams;
  const activeRegion = resolveRegion(region, (await cookies()).get(REGION_COOKIE)?.value);
  return (
    <main className={`page dx-root ${poppins.variable}`}>
      <div className="page-header dx-page-header">
        <div>
          <p className="eyebrow">Clinical decision support</p>
          <h1 className="page-title dx-page-title">Diagnosis Engine</h1>
          <p className="page-copy">Enter symptoms, examination, laboratory and imaging findings to rank 3–4 differential diagnoses, with must-not-miss conditions flagged and a direct route into the Marifa pathway.</p>
        </div>
        <span className="dx-demo-note">Demonstration data · pending clinical review</span>
      </div>
      <DiagnosisWorkbench region={activeRegion} />
    </main>
  );
}
