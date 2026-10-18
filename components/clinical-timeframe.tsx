import { Clock3 } from "@/components/icons-3d";
import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";

/** Turn saved timing text ("within 10 minutes", "Hour 2") into glowing timer pills without inferring a clinical deadline. */
export function ClinicalTimeframe({ text }: { text: string }) {
  return <>{withoutInlineSourceLocators(text).split(/(\bwithin\s+\d+(?:[–-]\d+)?\s*(?:minutes?|hours?|days?)\b|\bHour\s+\d+\b)/gi).map((part, index) =>
    /^(within\s|Hour\s)/i.test(part)
      ? <span key={index} className="pill pill-amber pill-sm timer-pill"><Clock3 size={13} aria-hidden="true" />{part}</span>
      : part,
  )}</>;
}
