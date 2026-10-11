export interface CitationSource {
  title: string;
  url: string;
  edition?: string;
  locator?: string;
  primary_source?: boolean;
}

/** Legacy sources remain labelled as provenance, never as recommendation verification. */
export function SourceCitation({ sources, selectionRationale }: { sources: readonly CitationSource[]; selectionRationale?: string }) {
  const links = sources.filter((source) => /^https?:\/\//i.test(source.url));
  return <footer className="not-prose mt-6 border-t border-slate-200 bg-slate-50 p-4 text-sm text-slate-600" aria-label="Evidence and governance sources">
    <strong className="font-semibold text-slate-900">Evidence &amp; Governance Sources:</strong>
    {links.length ? <ul className="mt-2 list-disc space-y-2 ps-5">
      {links.map((source, index) => <li key={`${source.url}-${index}`}>
        <a className="break-words text-blue-700 underline underline-offset-2" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}{source.edition ? ` (${source.edition})` : ""}</a>
        {source.locator && <span> · {source.locator}</span>}
        {source.primary_source && <span className="font-semibold text-slate-900"> · Primary source</span>}
      </li>)}
    </ul> : <p className="mt-2" role="note">Source verification pending. No exact guideline citation is attached to this scope.</p>}
    {selectionRationale && <p className="mt-2">Source selection: {selectionRationale}</p>}
  </footer>;
}
