import { Pill } from "@/components/icons-3d";
import type { MedicationBadge as MedicationBadgeData } from "@/lib/management-sequence-format";

/** One pill-shaped medication prescription: drug, dose, route, frequency, duration. Display only. */
export function MedicationBadge({ badge }: { badge: MedicationBadgeData }) {
  const fields = [badge.dose, badge.route, badge.frequency, badge.duration];
  const label = `Medication: ${badge.drug}, ${fields.join(", ")}`;
  return (
    <span className="pill pill-emerald pill-sm pill-wrap med-badge" role="group" aria-label={label}>
      <Pill size={13} aria-hidden="true" />
      <strong className="med-badge-drug">{badge.drug}</strong>
      {fields.map((value, index) => <span className="med-badge-field" key={index} aria-hidden="true">{value}</span>)}
    </span>
  );
}
