import { ClinicalTimeframe } from "@/components/clinical-timeframe";
import { splitActionList } from "@/lib/action-list";

/**
 * One management line as the reader sees it: a short lead-in plus bullets when the stored text is a long list
 * (explicit "\n- " items, or an automatic split that only fires on clear lists; see lib/action-list.ts), otherwise the line as written.
 * Display only: stored text is never edited. Every piece still goes through ClinicalTimeframe, so timers, dose badges,
 * source-locator hiding and **bold** markers behave exactly as before.
 */
export function ActionText({ text }: { text: string }) {
  const list = splitActionList(text);
  if (!list) return <ClinicalTimeframe text={text} />;
  return (
    <>
      {/* The shared text cleaner turns a trailing colon into a full stop, so the colon is drawn here, after the cleaned lead-in. */}
      {list.lead ? <><ClinicalTimeframe text={list.lead.replace(/\s*:\s*$/, "")} />:</> : null}
      <ul className="pathway-sublist">
        {list.items.map((item, index) => <li key={`${index}-${item}`}><ClinicalTimeframe text={item} /></li>)}
      </ul>
    </>
  );
}
