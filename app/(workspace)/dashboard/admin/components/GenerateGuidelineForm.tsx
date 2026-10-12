"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, WandSparkles } from "@/components/icons-3d";

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

  const fieldClass = "w-full rounded-xl border border-edge bg-panel px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-aqua-400 focus:ring-2 focus:ring-aqua-400/30 disabled:cursor-not-allowed disabled:bg-panel-2 disabled:text-muted";

  return (
    <form onSubmit={handleSubmit} aria-busy={isLoading} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-body md:col-span-2" htmlFor="guideline-topic">
          Topic
          <input id="guideline-topic" className={fieldClass} type="text" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Type 2 diabetes management" required disabled={isLoading} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-body" htmlFor="guideline-pillar">
          Model of care pillar
          <select id="guideline-pillar" className={fieldClass} value={pillar} onChange={(event) => setPillar(event.target.value as (typeof pillars)[number] | "")} required disabled={isLoading}>
            <option value="" disabled>Select a pillar</option>
            {pillars.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-body" htmlFor="guideline-authority">
          Clinical authority
          <select id="guideline-authority" className={fieldClass} value={authority} onChange={(event) => setAuthority(event.target.value as (typeof authorities)[number] | "")} required disabled={isLoading}>
            <option value="" disabled>Select an authority</option>
            {authorities.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>

      <section className="rounded-xl border border-sky-300/30 bg-sky-400/10 px-4 py-3.5 text-sm text-body" aria-labelledby="investigation-authoring-title">
        <h3 id="investigation-authoring-title" className="mb-2 font-semibold text-ink">Investigation content required for every pathway</h3>
        <p className="mb-2 text-sm leading-5">Name each test separately. State the exact condition or abnormality sought, the finding and its limitations, and why the result changes triage, treatment, monitoring or referral.</p>
        <ul className="grid gap-x-5 gap-y-1 text-sm sm:grid-cols-2">
          <li><strong>Laboratory diagnostics:</strong> relevant blood, urine, and microbiology tests</li>
          <li><strong>First-line imaging:</strong> initial radiography where indicated</li>
          <li><strong>Advanced imaging:</strong> definitive cross-sectional imaging where indicated</li>
          <li><strong>Specialized / adjunctive:</strong> focused ultrasound and other targeted tests</li>
        </ul>
        <p className="mt-2 text-sm leading-5 text-body">Use current Saudi MOH guidance and a relevant standard textbook. Record the document title, edition/date, page or section and link for each test. A publisher page or protocol directory alone is not source verification. New clinical content needs a new version and clinical review.</p>
      </section>

      {error && <p role="alert" className="rounded-xl border border-rose-300/40 bg-rose-400/15 px-4 py-3 text-sm text-rose-300">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 border-t border-edge pt-5">
        <button type="submit" disabled={isLoading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-aqua-400 px-5 py-2.5 text-sm font-semibold text-void shadow-glow-aqua transition hover:bg-aqua-300 hover:shadow-glow-aqua-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-75">
          {isLoading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <WandSparkles size={17} aria-hidden="true" />}
          {isLoading ? "Generating Pathway..." : "Generate pathway"}
        </button>
        <p className="text-sm text-muted">Generation may take up to 30 seconds. Keep this page open.</p>
      </div>
    </form>
  );
}
