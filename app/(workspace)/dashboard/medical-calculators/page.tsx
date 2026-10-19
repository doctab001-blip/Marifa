import type { Metadata } from "next";
import { Suspense } from "react";
import { MedicalCalculators } from "@/components/medical-calculators";

export const metadata: Metadata = { title: "Medical Calculators | Marifa" };

export default function MedicalCalculatorsPage() {
  return (
    <main className="page calculator-page">
      <div className="page-header calculator-page-header">
        <div>
          <p className="eyebrow">Point-of-care tools</p>
          <h1 className="page-title">Medical Calculators</h1>
          <p className="page-copy">Structured, evidence-linked scores with live interpretation and clear next steps.</p>
        </div>
        <span className="calculator-reviewed-note">Evidence checked 12 Oct 2026</span>
      </div>
      <Suspense fallback={null}><MedicalCalculators /></Suspense>
    </main>
  );
}
