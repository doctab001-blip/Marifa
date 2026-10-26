import { collectMedicationBadges, type ManagementStepLike } from "@/lib/management-sequence-format";

/** Dose text with its leading amount in bold ("0.5 mg" in "0.5 mg (MOH range 0.3–0.5 mg)"). */
function Dose({ text }: { text: string }) {
  const cut = text.search(/\s\(|;|,|\sor\s|\sthen\s/);
  if (cut <= 0) return <strong className="dose-main">{text}</strong>;
  return <><strong className="dose-main">{text.slice(0, cut)}</strong>{text.slice(cut)}</>;
}

/** Table of the drugs named in one management step, built from that step's stored badges. Display only. */
export function StepMedicationTable({ step }: { step: ManagementStepLike }) {
  const badges = collectMedicationBadges([step]);
  if (!badges.length) return null;
  return (
    <div className="step-med-table">
      <div className="step-med-table-scroll">
        <table>
          <caption className="sr-only">Medicines in this step</caption>
          <thead>
            <tr><th scope="col">Medication</th><th scope="col">Dose</th><th scope="col">Route</th><th scope="col">Frequency</th><th scope="col">Duration</th></tr>
          </thead>
          <tbody>
            {badges.map((badge, index) => (
              <tr key={index}>
                <th scope="row">{badge.drug}</th>
                <td><Dose text={badge.dose} /></td>
                <td>{badge.route}</td>
                <td>{badge.frequency}</td>
                <td>{badge.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
