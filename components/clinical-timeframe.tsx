import { Clock3 } from "@/components/icons-3d";
import { MedicationBadge } from "@/components/medication-badge";
import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";
import { splitMedicationBadges } from "@/lib/management-sequence-format";

const TIMER = /(\bwithin\s+\d+(?:[–-]\d+)?\s*(?:minutes?|hours?|days?)\b|\bHour\s+\d+\b)/gi;

function timerPills(text: string, keyPrefix: string) {
  return text.split(TIMER).map((part, index) =>
    /^(within\s|Hour\s)/i.test(part)
      ? <span key={`${keyPrefix}-${index}`} className="pill pill-amber pill-sm timer-pill"><Clock3 size={13} aria-hidden="true" />{part}</span>
      : part,
  );
}

/**
 * Turn saved timing text ("within 10 minutes", "Hour 2") into glowing timer pills without inferring a clinical deadline,
 * and draw every stored medication badge ("[💊 Drug | Dose | Route | Frequency | Duration]") as a pill.
 * Source locators are removed from the prose between badges only; a badge is shown exactly as stored.
 */
export function ClinicalTimeframe({ text }: { text: string }) {
  const segments = splitMedicationBadges(text);
  if (!segments.some((segment) => segment.kind === "badge")) {
    return <>{timerPills(withoutInlineSourceLocators(text), "t")}</>;
  }
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.kind === "badge") return <MedicationBadge key={index} badge={segment.badge} />;
        const cleaned = withoutInlineSourceLocators(segment.text);
        if (!cleaned) return null;
        const lead = /^\s/.test(segment.text) && index > 0 ? " " : "";
        const tail = /\s$/.test(segment.text) && index < segments.length - 1 ? " " : "";
        return <span key={index}>{lead}{timerPills(cleaned, String(index))}{tail}</span>;
      })}
    </>
  );
}
