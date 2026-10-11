/** Highlight saved timing text without inferring a clinical deadline. */
export function ClinicalTimeframe({ text }: { text: string }) {
  return <>{text.split(/(\bwithin\s+\d+(?:[–-]\d+)?\s*(?:minutes?|hours?|days?)\b|\bHour\s+\d+\b)/gi).map((part, index) =>
    /^(within\s|Hour\s)/i.test(part) ? <strong key={index} className="font-semibold text-slate-900">{part}</strong> : part,
  )}</>;
}
