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
        // Keep the punctuation that joins the prose to its neighbouring badges ("; " between two badges, ":" before one).
        const [, edgeLead = "", core = "", edgeTail = ""] = segment.text.match(/^(\s*[;,]?\s*)([\s\S]*?)(\s*:?\s*)$/) ?? [];
        const cleaned = withoutInlineSourceLocators(core);
        const lead = /[;,]/.test(edgeLead) ? `${edgeLead.trim()} ` : /^\s/.test(edgeLead) && index > 0 ? " " : "";
        const tail = /:/.test(edgeTail) ? ":" + (index < segments.length - 1 ? " " : "") : /\s$/.test(edgeTail) && index < segments.length - 1 ? " " : "";
        if (!cleaned) return lead.trim() ? <span key={index}>{lead}</span> : null;
        return <span key={index}>{lead}{timerPills(cleaned, String(index))}{tail}</span>;
      })}
    </>
  );
}
