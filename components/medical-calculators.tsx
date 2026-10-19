"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Activity, Calculator, HeartPulse, Stethoscope } from "@/components/icons-3d";
import { ClinicalCalculator } from "@/components/clinical-calculator";
import { clinicalCalculators } from "@/lib/clinical-calculators";

export function MedicalCalculators() {
  // The selected calculator lives in the URL (?calc=) so the side-panel menu and these tabs stay in sync.
  const router = useRouter();
  const pathname = usePathname();
  const calculatorId = useSearchParams()?.get("calc");
  const calculator = clinicalCalculators.find(({ id }) => id === calculatorId) ?? clinicalCalculators[0];
  const selectCalculator = (id: string) => router.replace(`${pathname}?calc=${encodeURIComponent(id)}`, { scroll: false });

  return (
    <>
      <div className="calculator-switcher" role="tablist" aria-label="Choose a medical calculator">
        {clinicalCalculators.map((item, index) => {
          const Icon = [Activity, HeartPulse, Stethoscope, Calculator][index % 4] ?? Calculator;
          const selected = item.id === calculator.id;
          return (
            <button key={item.id} type="button" role="tab" aria-selected={selected} aria-controls="active-calculator" className={selected ? "is-active" : ""} onClick={() => selectCalculator(item.id)}>
              <Icon size={18} aria-hidden="true" /><span><strong>{item.shortTitle}</strong><small>{item.specialty}</small></span>
            </button>
          );
        })}
      </div>
      <div id="active-calculator" role="tabpanel" key={calculator.id}><ClinicalCalculator schema={calculator} /></div>
    </>
  );
}
