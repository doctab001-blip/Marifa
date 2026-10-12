export type InvestigationTableRow = {
  investigation: string;
  target: string;
  rationale: string;
  interpretation: string;
  badge?: string;
};

type InvestigationTableProps = {
  data: InvestigationTableRow[];
};

const columns = [
  { key: "investigation", label: "Investigation" },
  { key: "target", label: "Target" },
  { key: "rationale", label: "Rationale" },
  { key: "interpretation", label: "Interpretation" },
] as const;

export function InvestigationTable({ data }: InvestigationTableProps) {
  return (
    <table className="block w-full border-collapse text-left text-sm text-ink md:table md:table-fixed md:border-separate md:border-spacing-x-8 md:border-spacing-y-0">
      <thead className="hidden bg-panel-2 text-xs font-semibold text-body md:table-header-group">
        <tr>
          {columns.map(({ key, label }) => (
            <th key={key} scope="col" className="w-1/4 px-4 py-3">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="block space-y-3 md:table-row-group md:space-y-0 md:divide-y md:divide-edge">
        {data.map((row, index) => (
          <tr
            key={`${row.investigation}-${index}`}
            className="block rounded-md border border-edge bg-panel md:table-row md:rounded-none md:border-0"
          >
            {columns.map(({ key, label }) => (
              <td
                key={key}
                className="block border-b border-edge px-4 py-3 last:border-b-0 md:table-cell md:w-1/4 md:border-0"
              >
                <span className="mb-1 block text-xs font-semibold text-body md:hidden">
                  {label}
                </span>
                {key === "investigation" ? (
                  <span className="flex flex-wrap items-center gap-2 font-medium">
                    {row.investigation}
                    {row.badge ? (
                      <span className="rounded-sm bg-aqua-400/15 px-2 py-0.5 text-xs font-medium text-aqua-300">
                        {row.badge}
                      </span>
                    ) : null}
                  </span>
                ) : key === "target" ? (
                  <span className="flex flex-col gap-1 break-words">{row.target.split("\n").map((line, lineIndex) => <span key={`${lineIndex}-${line}`}>{line}</span>)}</span>
                ) : (
                  <span className="whitespace-pre-line break-words">{row[key]}</span>
                )}
              </td>
            ))}
          </tr>
        ))}
        {data.length === 0 ? (
          <tr className="block md:table-row">
            <td colSpan={columns.length} className="block px-4 py-6 text-center text-body md:table-cell">
              No investigations available.
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}
