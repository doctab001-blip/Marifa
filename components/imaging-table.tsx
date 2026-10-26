import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";
import { investigationMethod, type Investigation } from "@/lib/investigation-display";

/** Technique shown under the test name, only when it says something the name does not already say. */
export function imagingTechnique(item: Investigation): string | null {
  const method = investigationMethod(item);
  if (!method) return null;
  const technique = withoutInlineSourceLocators(method).trim();
  if (!technique) return null;
  const name = item.testName.toLowerCase();
  const lowered = technique.toLowerCase();
  return name.includes(lowered) || lowered.includes(name) ? null : technique;
}

/**
 * Imaging table. The three columns follow the saved fields one to one:
 * test name (+ technique) | clinicalRationale (why and when) | expectedFinding (what to look for).
 * Findings and rationale are never merged into one cell.
 */
export function ImagingTable({ items }: { items: Investigation[] }) {
  if (!items.length) return null;
  return (
    <>
      <h3>Imaging</h3>
      <div className="em-table-wrap">
        <table className="em-table em-imaging-table">
          <thead>
            <tr>
              <th scope="col">Imaging</th>
              <th scope="col">Why and when to order</th>
              <th scope="col">What you are looking for</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const technique = imagingTechnique(item);
              return (
                <tr key={item.testName}>
                  <th scope="row">{item.testName}{technique ? <small>{technique}</small> : null}</th>
                  <td data-label="Why and when to order">{withoutInlineSourceLocators(item.clinicalRationale)}</td>
                  <td data-label="What you are looking for">{withoutInlineSourceLocators(item.expectedFinding)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
