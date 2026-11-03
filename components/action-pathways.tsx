import { ClinicalTimeframe } from "@/components/clinical-timeframe";
import type { ManagementAction, Urgency } from "@/lib/management-pathways";

/**
 * Inline "why" and If/Then pathways under ONE management action.
 *
 * Reads without hover or taps: everything is always visible, stacked on phones and slightly indented on wider screens.
 * - the primary action stays normal text in the parent list item (this component renders only what sits under it);
 * - "Why" / "Expect" are small muted lines;
 * - each pathway is a soft panel: a bold trigger after an "If" tag, then an indented "Then" response with a left rule
 *   whose colour follows urgency (red immediate, amber urgent, green routine). Urgency is also written as a word,
 *   so colour is never the only signal.
 * Colours use the app's theme variables so light and dark themes both work.
 */

const URGENCY: Record<Urgency, { label: string; rule: string; chip: string }> = {
  immediate: { label: "Immediate", rule: "border-red-500", chip: "border-red-500/60 text-red-700 [html[data-theme=dark]_&]:text-red-300" },
  urgent: { label: "Urgent", rule: "border-amber-500", chip: "border-amber-500/60 text-amber-700 [html[data-theme=dark]_&]:text-amber-300" },
  routine: { label: "Routine", rule: "border-emerald-600", chip: "border-emerald-600/60 text-emerald-700 [html[data-theme=dark]_&]:text-emerald-300" },
};
const NEUTRAL_RULE = "border-[var(--royal)]";

export function ActionPathways({ detail }: { detail: ManagementAction }) {
  const { rationale, expected, pathways } = detail;
  if (!rationale && !expected && pathways.length === 0) return null;

  return (
    <div className="mt-1.5 min-w-0 space-y-1.5 text-[14px] leading-snug sm:pl-3" data-testid="action-pathways">
      {rationale || expected ? (
        <dl className="space-y-0.5 text-[13px] text-[var(--text-3)]">
          {rationale ? (
            <div className="flex gap-1.5"><dt className="shrink-0 font-semibold">Why:</dt><dd className="min-w-0 break-words"><ClinicalTimeframe text={rationale} /></dd></div>
          ) : null}
          {expected ? (
            <div className="flex gap-1.5"><dt className="shrink-0 font-semibold">Expect:</dt><dd className="min-w-0 break-words"><ClinicalTimeframe text={expected} /></dd></div>
          ) : null}
        </dl>
      ) : null}

      {pathways.length > 0 ? (
        <ul className="space-y-1.5" aria-label="If and then pathways for this action">
          {pathways.map((pathway, i) => {
            const urgency = pathway.urgency ? URGENCY[pathway.urgency] : undefined;
            return (
              <li key={`${i}-${pathway.trigger}`} className="rounded-lg bg-[var(--royal-soft)] px-2.5 py-2">
                <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                  <span className="rounded bg-[var(--royal)] px-1.5 py-px text-[11px] font-bold uppercase tracking-wide text-white">If</span>
                  <strong className="min-w-0 break-words font-semibold"><ClinicalTimeframe text={pathway.trigger} /></strong>
                </p>
                <div className={`mt-1.5 ml-2 min-w-0 border-l-[3px] pl-2.5 ${urgency?.rule ?? NEUTRAL_RULE}`}>
                  <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-3)]">Then</span>
                    {urgency ? <span className={`rounded border px-1.5 py-px text-[11px] font-semibold ${urgency.chip}`}>{urgency.label}</span> : null}
                  </p>
                  <p className="min-w-0 break-words"><ClinicalTimeframe text={pathway.response} /></p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
