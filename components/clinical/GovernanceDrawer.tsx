import { ChevronDown, ShieldCheck } from "lucide-react";

type DrawerMetadata = {
  primaryConsensusSource: string;
  fallbackBasis?: string;
  adaptationReasoning?: string;
};

/**
 * Collapsible governance footer. Works for legacy KSA records and for the active
 * region's `governanceMetadata` on multi-region topics.
 */
export function GovernanceDrawer({ metadata, regionName = "Saudi" }: { metadata: DrawerMetadata; regionName?: string }) {
  return (
    <details
      className="ksa-governance-drawer group overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      style={{ borderColor: "rgba(226, 232, 240, 0.78)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-700" aria-hidden="true" />
          View Clinical Governance &amp; Guideline Sources
        </span>
        <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
      </summary>

      <div className="grid gap-5 border-t border-slate-200/60 bg-slate-50/60 px-4 py-5 sm:grid-cols-2 sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Primary consensus source</p>
          <p className="mt-1.5 font-mono text-sm font-medium text-slate-900">{metadata.primaryConsensusSource}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Fallback basis</p>
          {metadata.fallbackBasis ? (
            <p className="mt-1.5 text-sm font-medium text-slate-900">{metadata.fallbackBasis}</p>
          ) : (
            <p className="mt-1.5 text-sm text-slate-500">None recorded for this region.</p>
          )}
        </div>
        {metadata.adaptationReasoning ? (
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{regionName} adaptation reasoning</p>
            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-700">{metadata.adaptationReasoning}</p>
          </div>
        ) : null}
      </div>
    </details>
  );
}
