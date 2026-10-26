import { Pill } from "@/components/icons-3d";
import type { MedicationBadge as MedicationBadgeData } from "@/lib/management-sequence-format";

/** Inline pill naming the drug; dose, route, frequency and duration sit in the step's medicine table. Display only. */
export function MedicationBadge({ badge }: { badge: MedicationBadgeData }) {
  const detail = `${badge.drug}: ${badge.dose}; ${badge.route}; ${badge.frequency}; ${badge.duration}`;
  return (
    <span className="med-pill" title={detail} aria-label={`Medication ${detail}`}>
      <Pill size={13} aria-hidden="true" />
      {badge.drug}
    </span>
  );
}
