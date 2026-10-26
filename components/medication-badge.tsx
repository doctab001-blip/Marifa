import { Pill } from "@/components/icons-3d";
import type { MedicationBadge as MedicationBadgeData } from "@/lib/management-sequence-format";
import { shortDrugName } from "@/lib/step-medication";

/** Leading amount of a dose ("0.5 mg" in "0.5 mg (0.5 mL), adults and children over 12 years"). */
export function doseLead(text: string): string {
  const cut = text.search(/\s\(|;|,|\sor\s|\sthen\s|\svia\s/);
  return cut > 0 ? text.slice(0, cut) : text;
}

/** Inline pill: the drug name only. Dose, route, frequency and duration sit once, in the step's medicine table. Display only. */
export function MedicationBadge({ badge }: { badge: MedicationBadgeData }) {
  const detail = `${badge.drug}: ${badge.dose}; ${badge.route}; ${badge.frequency}; ${badge.duration}`;
  return (
    <span className="med-pill" title={detail} aria-label={`Medication ${detail}`}>
      <Pill size={13} aria-hidden="true" />
      {shortDrugName(badge.drug)}
    </span>
  );
}
