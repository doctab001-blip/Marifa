"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, WandSparkles } from "lucide-react";

const pillars = ["Urgent Care", "Chronic Care", "Keep Well", "Planned Care", "Safe Birth", "Palliative Care"] as const;
const authorities = ["MOH", "SHC"] as const;

export default function GenerateGuidelineForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [pillar, setPillar] = useState<(typeof pillars)[number] | "">("");
  const [authority, setAuthority] = useState<(typeof authorities)[number] | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/guidelines/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), pillar, authority }),
      });
      const data: unknown = await response.json().catch(() => null);
      const guidelineId =
        data && typeof data === "object" && "guidelineId" in data && typeof data.guidelineId === "string"
          ? data.guidelineId
          : null;

      if (!response.ok || !guidelineId) {
        const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : "We couldn’t generate the pathway. Please review the details and try again.";
        throw new Error(message);
      }

      router.push(`/dashboard/diseases/${encodeURIComponent(guidelineId)}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

  return (
    <form onSubmit={handleSubmit} aria-busy={isLoading} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2" htmlFor="guideline-topic">
          Topic
          <input id="guideline-topic" className={fieldClass} type="text" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Type 2 diabetes management" required disabled={isLoading} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="guideline-pillar">
          Model of care pillar
          <select id="guideline-pillar" className={fieldClass} value={pillar} onChange={(event) => setPillar(event.target.value as (typeof pillars)[number] | "")} required disabled={isLoading}>
            <option value="" disabled>Select a pillar</option>
            {pillars.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="guideline-authority">
          Clinical authority
          <select id="guideline-authority" className={fieldClass} value={authority} onChange={(event) => setAuthority(event.target.value as (typeof authorities)[number] | "")} required disabled={isLoading}>
            <option value="" disabled>Select an authority</option>
            {authorities.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>

      <section className="rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3.5 text-sm text-slate-700" aria-labelledby="investigation-authoring-title">
        <h3 id="investigation-authoring-title" className="mb-2 font-semibold text-slate-900">Investigation content required for every pathway</h3>
        <p className="mb-2 text-xs leading-5">Structure each test as a separate record with its modality and target, expected finding or interpretation, and the clinical rationale for management.</p>
        <ul className="grid gap-x-5 gap-y-1 text-xs sm:grid-cols-2">
          <li><strong>Laboratory diagnostics:</strong> relevant blood, urine, and microbiology tests</li>
          <li><strong>First-line imaging:</strong> initial radiography where indicated</li>
          <li><strong>Advanced imaging:</strong> definitive cross-sectional imaging where indicated</li>
          <li><strong>Specialized / adjunctive:</strong> focused ultrasound and other targeted tests</li>
        </ul>
        <p className="mt-2 text-xs leading-5 text-slate-600">Include only tests supported by the clinical context and cited guidance; explain how results change triage, treatment, or escalation.</p>
      </section>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
        <button type="submit" disabled={isLoading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-75">
          {isLoading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <WandSparkles size={17} aria-hidden="true" />}
          {isLoading ? "Generating Pathway..." : "Generate pathway"}
        </button>
        <p className="text-xs text-slate-500">Generation may take up to 30 seconds. Keep this page open.</p>
      </div>
    </form>
  );
}
