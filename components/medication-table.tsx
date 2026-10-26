import { collectMedicationBadges, type ManagementStepLike } from "@/lib/management-sequence-format";
import { Pill } from "@/components/icons-3d";

/** One table of every drug named in the management sequence, built from the stored badges. Display only. */
export function MedicationTable({ steps }: { steps: ManagementStepLike[] }) {
  const badges = collectMedicationBadges(steps);
  if (!badges.length) return null;
  return (
    <section className="med-table-wrap" aria-labelledby="med-table-title">
      <h3 id="med-table-title" className="med-table-title"><Pill size={16} aria-hidden="true" /> Medicines used in this sequence</h3>
      <div className="med-table-scroll">
        <table className="med-table">
          <thead>
            <tr><th scope="col">Drug</th><th scope="col">Dose</th><th scope="col">Route</th><th scope="col">Frequency</th><th scope="col">Duration</th></tr>
          </thead>
          <tbody>
            {badges.map((badge, index) => (
              <tr key={index}>
                <th scope="row" className="med-table-drug">{badge.drug}</th>
                <td>{badge.dose}</td>
                <td>{badge.route}</td>
                <td>{badge.frequency}</td>
                <td>{badge.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
