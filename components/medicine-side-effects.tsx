import { sideEffectsFor } from "@/lib/medicine-side-effects";

/** Common side effects in small red text, in brackets, directly under a drug name. */
export function MedicineSideEffects({ name }: { name: string }) {
  const effects = sideEffectsFor(name);
  if (!effects?.length) return null;
  return <span className="medicine-side-effects" title="Common side effects (reference list; confirm with the BNF or product label)">(Side Effects - {effects.some((effect) => effect.includes(": ")) ? effects.join("; ") : effects.join(", ")})</span>;
}
