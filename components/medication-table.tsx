import { Clock3 } from "@/components/icons-3d";
import { doseLead } from "@/components/medication-badge";
import { MedicineSideEffects } from "@/components/medicine-side-effects";
import { CautionsDropdown, ContraList } from "@/components/medicine-cautions";
import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";
import { displayAdjustments, displayLines } from "@/lib/medicine-adjustments";
import { collectMedicationBadges, type MedicationBadge } from "@/lib/management-sequence-format";
import { matchRegimens, type LinkedStep, type RegimenLike } from "@/lib/step-medication";

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

const unique = (lines: string[]) => [...new Set(lines.map((line) => line.trim()).filter(Boolean))];

function Labelled({ text }: { text: string }) {
  const display = withoutInlineSourceLocators(text);
  const separator = display.indexOf(":");
  if (separator > 0 && separator < 60) return <><strong>{display.slice(0, separator)}:</strong>{display.slice(separator + 1)}</>;
  return <>{display}</>;
}

function List({ items }: { items: string[] }) {
  return <ul className="em-list">{items.map((item, index) => <li key={`${index}-${item}`}><Labelled text={item} /></li>)}</ul>;
}

/**
 * The single medicine table for one management step, in the layout of the topic's medicine table:
 * medicine and indication, dose with route, frequency and duration, contraindications, cautions and monitoring.
 * Built from the step's stored badges plus the matching rows of the topic's medicine table. Display only.
 */
type IndicatedRegimen = RegimenLike & { indication?: string; patientGroup?: string };

function regimenDetail(matched: RegimenLike[]) {
  return {
    contraindications: unique(matched.flatMap((r) => displayLines(r.contraindications))),
    cautions: unique(matched.flatMap((r) => displayAdjustments(r.adjustments, r.genericName))),
    monitoring: unique(matched.flatMap((r) => displayLines(r.monitoring))),
  };
}

export function StepMedicationTable({ step, regimens = [] }: { step: LinkedStep; regimens?: RegimenLike[] }) {
  // Stored badges: matched to the topic's medicine table by drug name and route.
  const badgeRows = groupBadges(collectMedicationBadges([step])).map(({ head, doses }) => {
    const matched = matchRegimens(head, regimens);
    return { head, doses, first: matched[0] as IndicatedRegimen | undefined, ...regimenDetail(matched) };
  });
  // Medicines the page found in the step text: one row per medicine-table entry, so each dose keeps its own indication.
  const seen = new Set<string>();
  const linkedRows = (step.medicines ?? []).flatMap(({ badge, regimen }) => {
    const first = regimen as IndicatedRegimen;
    const key = JSON.stringify([badge, first.indication ?? "", first.patientGroup ?? ""]);
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ head: badge, doses: [badge.dose], first, ...regimenDetail([regimen]) }];
  });
  const rows = [...badgeRows, ...linkedRows];
  if (!rows.length) return null;
  const hasContraindications = rows.some((row) => row.contraindications.length);
  return (
    <div className="step-med-table em-table-wrap">
      <table className={`em-table em-dose-table${hasContraindications ? " has-contra" : ""}`}>
        <caption className="sr-only">Medicines in this step</caption>
        <thead>
          <tr><th scope="col">Medicine and indication</th><th scope="col">Dose, route, frequency</th>{hasContraindications ? <th scope="col">Contra{"\u00AD"}indications</th> : null}<th scope="col">Cautions</th></tr>
        </thead>
        <tbody>
          {rows.map(({ head, doses, first, contraindications, cautions, monitoring }, index) => (
            <tr key={index}>
              <th scope="row">
                {head.drug}
                <MedicineSideEffects name={head.drug} />
                {first?.indication ? <small>{withoutInlineSourceLocators(first.indication)}{first.patientGroup ? ` · ${withoutInlineSourceLocators(first.patientGroup)}` : ""}</small> : null}
              </th>
              <td>
                {doses.map((dose, i) => <div key={i} className="dose-line"><Dose text={dose} /></div>)}
                <span className="em-regimen-pills">
                  <span className="pill pill-sky pill-sm">{head.route}</span>
                  <span className="pill pill-violet pill-sm">{head.frequency}</span>
                  <span className="pill pill-amber pill-sm"><Clock3 size={13} aria-hidden="true" />{head.duration}</span>
                </span>
              </td>
              {hasContraindications ? <td className="em-contra"><ContraList items={contraindications} /></td> : null}
              <td><CautionsDropdown adjustments={cautions} monitoring={monitoring} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
