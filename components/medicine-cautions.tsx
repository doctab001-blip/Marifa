import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";
import { cautionSummary, compactContraLines, compactMedicineLines } from "@/lib/compact-medicine-text";
import { FitToRow } from "@/components/fit-to-row";

function Labelled({ text }: { text: string }) {
  const display = withoutInlineSourceLocators(text);
  const separator = display.indexOf(":");
  if (separator > 0 && separator < 40) return <><strong>{display.slice(0, separator)}:</strong>{display.slice(separator + 1)}</>;
  return <>{display}</>;
}

const Lines = ({ items }: { items: string[] }) => <ul className="em-list">{items.map((item, index) => <li key={`${index}-${item}`}><Labelled text={item} /></li>)}</ul>;
const cautionLines = (adjustments: string[]) => compactMedicineLines(adjustments).filter((line) => !/^(?:Penicillin allergy|Allergy|Monitor):/i.test(line));
const None = () => <span className="em-muted" aria-label="None listed">—</span>;

/** Cautions (kidney, liver, children and other dose cautions), closed by default. Allergy and monitoring lines are not shown
 * here (owner request, 28 Oct 2026); the monitoring prop is kept so callers need not change. */
export function CautionsDropdown({ adjustments }: { adjustments: string[]; monitoring?: string[] }) {
  const cautions = cautionLines(adjustments);
  if (!cautions.length) return <None />;
  return (
    <details className="med-drop">
      <summary>{cautionSummary(cautions, [])}</summary>
      <Lines items={cautions} />
    </details>
  );
}

/** Contraindications, compacted to the essential fact; the first one always shows, the rest open on demand. */
export function ContraList({ items }: { items: string[] }) {
  const lines = compactContraLines(items);
  if (!lines.length) return <None />;
  const shown = lines.slice(0, 1), rest = lines.slice(1);
  return (
    <>
      <Lines items={shown} />
      {rest.length ? <details className="med-drop med-drop-contra"><summary>{rest.length} more</summary><Lines items={rest} /></details> : null}
    </>
  );
}


/** Table cell content: every caution shown in the space of the row, with "Show all" only when it does not fit. */
export function CautionsCell({ adjustments }: { adjustments: string[] }) {
  const lines = cautionLines(adjustments);
  return lines.length ? <FitToRow><Lines items={lines} /></FitToRow> : <None />;
}

/** Table cell content: every contraindication shown in the space of the row, with "Show all" only when it does not fit. */
export function ContraCell({ items }: { items: string[] }) {
  const lines = compactContraLines(items);
  return lines.length ? <FitToRow><Lines items={lines} /></FitToRow> : <None />;
}
