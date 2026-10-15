export type InvestigationGroup = "bedside" | "laboratory" | "firstLineImaging" | "advancedImaging" | "specializedAdjunctive";

export type InvestigationTableRow = {
  investigation: string;
  /** What is measured or examined (modality). */
  measures?: string;
  /** The condition or question the test addresses. */
  target: string;
  /** Typical adult reference value. */
  normal: string;
  /** What is expected in this condition. */
  finding: string;
  /** What the result means and the next step. */
  meaning: string;
  /** Exact source locator, e.g. "NICE NG203, Recommendation 1.1.8". */
  source?: string;
  group: InvestigationGroup;
  purpose: "confirms" | "excludes";
  badge?: string;
};

type InvestigationTableProps = { data: InvestigationTableRow[] };

export const investigationGroupOrder: { key: InvestigationGroup; label: string }[] = [
  { key: "bedside", label: "Bedside" },
  { key: "laboratory", label: "Bloods and laboratory" },
  { key: "firstLineImaging", label: "Imaging: first line" },
  { key: "advancedImaging", label: "Imaging: advanced" },
  { key: "specializedAdjunctive", label: "Specialist and adjunctive" },
];

const columns = [
  { key: "investigation", label: "Test", width: "md:w-[24%]" },
  { key: "normal", label: "Normal (adult)", width: "md:w-[20%]" },
  { key: "finding", label: "In this condition", width: "md:w-[28%]" },
  { key: "meaning", label: "What it means / next step", width: "md:w-[28%]" },
] as const;

function Cell({ label, width, children }: { label: string; width: string; children: React.ReactNode }) {
  return (
    <td className={`block border-b border-edge px-4 py-3 align-top last:border-b-0 md:table-cell md:border-b-0 ${width}`}>
      <span className="mb-1 block text-xs font-semibold text-body md:hidden">{label}</span>
      {children}
    </td>
  );
}

export function InvestigationTable({ data }: InvestigationTableProps) {
  if (data.length === 0) return <p className="px-4 py-6 text-center text-body">No investigations available.</p>;
  const groups = investigationGroupOrder
    .map((group) => ({ ...group, rows: data.filter((row) => row.group === group.key) }))
    .filter((group) => group.rows.length > 0);
  return (
    <div className="investigation-table-groups space-y-8">
      {groups.map((group) => (
        <section key={group.key} aria-label={group.label}>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-body">{group.label}</h4>
          <table className="block w-full border-collapse text-left text-sm text-ink md:table md:table-fixed">
            <thead className="hidden bg-panel-2 text-xs font-semibold text-body md:table-header-group">
              <tr>
                {columns.map(({ key, label, width }) => (
                  <th key={key} scope="col" className={`px-4 py-3 ${width}`}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="block space-y-3 md:table-row-group md:space-y-0 md:divide-y md:divide-edge">
              {group.rows.map((row, index) => (
                <tr key={`${row.investigation}-${index}`} className="block rounded-md border border-edge bg-panel md:table-row md:rounded-none md:border-0 md:bg-transparent">
                  <Cell label="Test" width={columns[0].width}>
                    <span className="block font-medium">{row.investigation}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-body">
                      <span className="rounded-sm bg-panel-2 px-2 py-0.5">{row.purpose === "confirms" ? "Confirms" : "Excludes or monitors"}</span>
                      {row.badge ? <span className="rounded-sm bg-aqua-400/15 px-2 py-0.5 font-medium text-aqua-300">{row.badge}</span> : null}
                    </span>
                    <span className="mt-2 block text-xs text-body">For: <span>{row.target}</span></span>
                    {row.measures ? <span className="mt-1 block text-xs text-body">Method &amp; clinical context: {row.measures}</span> : null}
                  </Cell>
                  <Cell label="Normal (adult)" width={columns[1].width}>
                    <span className="whitespace-pre-line break-words">{row.normal}</span>
                  </Cell>
                  <Cell label="In this condition" width={columns[2].width}>
                    <span className="whitespace-pre-line break-words">{row.finding}</span>
                  </Cell>
                  <Cell label="What it means / next step" width={columns[3].width}>
                    <span className="whitespace-pre-line break-words">{row.meaning}</span>
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
