import { doseLead } from "@/components/medication-badge";
import { MedicineSideEffects } from "@/components/medicine-side-effects";
import { cleanAdjustments } from "@/lib/medicine-adjustments";
import { collectMedicationBadges, type ManagementStepLike, type MedicationBadge } from "@/lib/management-sequence-format";
import { matchRegimens, type RegimenLike } from "@/lib/step-medication";

/** Dose text with its leading amount in bold ("0.5 mg" in "0.5 mg (0.5 mL), children 6–12 years"). */
function Dose({ text }: { text: string }) {
  const lead = doseLead(text);
  return <><strong className="dose-main">{lead}</strong>{text.slice(lead.length)}</>;
}

/** One row per drug, route, frequency and duration; different doses of the same drug (age bands) share the row. */
function groupBadges(badges: MedicationBadge[]) {
  const rows = new Map<string, { head: MedicationBadge; doses: string[] }>();
  for (const badge of badges) {
    const key = [badge.drug, badge.route, badge.frequency, badge.duration].map((part) => part.toLowerCase()).join("|");
    const row = rows.get(key);
    const doses = badge.dose.split(/;\s+/).filter(Boolean);
    if (!row) rows.set(key, { head: badge, doses: [...doses] });
    else for (const dose of doses) if (!row.doses.includes(dose)) row.doses.push(dose);
  }
  return [...rows.values()];
}

function unique(lines: string[]) {
  return [...new Set(lines.map((line) => line.trim()).filter(Boolean))];
}

/** Everything else the topic's medicine table says about this drug, so the table is not repeated further down the page. */
function RowDetails({ regimens }: { regimens: RegimenLike[] }) {
  if (!regimens.length) return null;
  const adjustments = unique(regimens.flatMap((r) => cleanAdjustments(r.adjustments ?? [], r.genericName)));
  const contraindications = unique(regimens.flatMap((r) => r.contraindications ?? []));
  const monitoring = unique(regimens.flatMap((r) => r.monitoring ?? []));
  const sources = unique(regimens.map((r) => (r.sourceTitle ? `${r.sourceTitle}${r.sourceEdition ? ` (${r.sourceEdition})` : ""}` : "")));
  if (!adjustments.length && !contraindications.length && !monitoring.length && !sources.length) return null;
  const block = (title: string, items: string[]) => items.length ? <div><h5>{title}</h5><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div> : null;
  return (
    <details className="med-details">
      <summary>Adjustments, cautions and monitoring</summary>
      {block("Adjustments and precautions", adjustments)}
      {block("Contraindications", contraindications)}
      {block("Monitoring", monitoring)}
      {block("Source", sources)}
    </details>
  );
}

/**
 * The single medicine table for one management step, built from that step's stored badges and the topic's medicine table.
 * It carries dose, route, frequency, duration and, under each drug, the adjustments, cautions and monitoring. Display only.
 */
export function StepMedicationTable({ step, regimens = [] }: { step: ManagementStepLike; regimens?: RegimenLike[] }) {
  const rows = groupBadges(collectMedicationBadges([step]));
  if (!rows.length) return null;
  return (
    <div className="step-med-table">
      <div className="step-med-table-scroll">
        <table>
          <caption className="sr-only">Medicines in this step</caption>
          <thead>
            <tr><th scope="col">Medication</th><th scope="col">Dose</th><th scope="col">Route</th><th scope="col">Frequency</th><th scope="col">Duration</th></tr>
          </thead>
          <tbody>
            {rows.map(({ head, doses }, index) => {
              const matched = matchRegimens(head, regimens);
              return (
                <tr key={index}>
                  <th scope="row">{head.drug}<MedicineSideEffects name={head.drug} /><RowDetails regimens={matched} /></th>
                  <td>{doses.map((dose, i) => <div key={i} className="dose-line"><Dose text={dose} /></div>)}</td>
                  <td>{head.route}</td>
                  <td>{head.frequency}</td>
                  <td>{head.duration}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
