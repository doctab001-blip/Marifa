import type { EvidenceSource } from "@/lib/clinical-guideline-resolution";

/** Source provenance is rendered independently of approval status. */
export function SourceCitationFooter({ sources }: { sources: readonly EvidenceSource[] }) {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 p-4 mt-8" aria-label="Clinical governance and evidence sources">
      <h2 className="text-sm font-semibold text-slate-700">Clinical Governance &amp; Evidence Sources:</h2>
      {sources.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-slate-600">
          {sources.map((source) => (
            <li key={source.id}>
              <a className="text-blue-800 underline underline-offset-2" href={source.url} target="_blank" rel="noopener noreferrer">
                {source.guidelineTitle}
              </a>
              <span> — {source.publishingBody}{source.publicationYear ? `, ${source.publicationYear}` : ""}</span>
            </li>
          ))}
        </ul>
      ) : (
        <span className="mt-2 block text-sm text-slate-600" role="note">No linked evidence source is recorded for this pathway.</span>
      )}
    </footer>
  );
}
