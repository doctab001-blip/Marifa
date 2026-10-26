import { AlertTriangle, CheckCircle2, HeartPulse, Pill, Stethoscope } from "lucide-react";
import { GovernanceDrawer } from "@/components/clinical/GovernanceDrawer";
import type { ClinicalTopic } from "@/types/clinical";
import { displayTopicTitle } from "@/lib/topic-title";

export function ClinicalTopicView({ topic }: { topic: ClinicalTopic }) {
  const { saudiPracticeProfile: practice } = topic;

  return (
    <main className="ksa-topic-view min-h-full bg-slate-50/70 text-slate-900">
      <header className="border-b border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="ksa-status-badge inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700" style={{ borderColor: "#d1fae5", background: "#ecfdf5", color: "#047857" }}>
              <span aria-hidden="true">🇸🇦</span> KSA Practice Default
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-medium text-slate-600">
              ICD-10 {topic.icd10Code}
            </span>
          </div>
          <div className="mt-5 flex items-start gap-4">
            <span className="hidden size-11 shrink-0 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 sm:grid">
              <Stethoscope className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-emerald-700">Disease Management</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{displayTopicTitle(topic.title)}</h1>
            </div>
          </div>
        </div>
      </header>

      <nav className="ksa-anchor-nav sticky top-[72px] z-20 border-b border-slate-200/60 bg-white/70 backdrop-blur-md dark:bg-slate-900/70" style={{ top: 72, zIndex: 20, borderColor: "rgba(226, 232, 240, 0.6)", background: "rgba(255,255,255,0.74)", backdropFilter: "blur(12px)" }} aria-label="Topic sections">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          {[
            ["Pathophysiology", "#pathophysiology"],
            ["Management", "#management"],
            ["Governance", "#governance"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:px-8">
        <section id="pathophysiology" className="scroll-mt-32" aria-labelledby="pathophysiology-title">
          <div className="flex items-center gap-2.5">
            <HeartPulse className="size-5 text-emerald-700" aria-hidden="true" />
            <h2 id="pathophysiology-title" className="text-xl font-semibold tracking-tight text-slate-900">Pathophysiology</h2>
          </div>
          <div className="ksa-content-card mt-4 rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ borderColor: "rgba(226, 232, 240, 0.78)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <p className="text-sm leading-6 text-slate-500">Pathophysiology content is not included in this clinical record.</p>
          </div>
        </section>

        <section id="management" className="scroll-mt-32" aria-labelledby="management-title">
          <div className="flex items-center gap-2.5">
            <Pill className="size-5 text-emerald-700" aria-hidden="true" />
            <h2 id="management-title" className="text-xl font-semibold tracking-tight text-slate-900">Management</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">First-line treatment and locally relevant prescribing details.</p>

          <div className="mt-5 grid gap-4">
            {practice.firstLineTherapies.map((therapy) => (
              <article key={`${therapy.drugName}-${therapy.dose}`} className="ksa-content-card rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-6" style={{ borderColor: "rgba(226, 232, 240, 0.78)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">First line</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{therapy.drugName}</h3>
                    {therapy.sfdaTradeNames.length > 0 ? (
                      <p className="mt-1 text-sm font-medium text-emerald-700">SFDA trade names: {therapy.sfdaTradeNames.join(", ")}</p>
                    ) : null}
                  </div>
                  <span className="w-fit rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-semibold text-slate-900">{therapy.dose}</span>
                </div>
                {therapy.clinicalNote ? <p className="mt-5 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">{therapy.clinicalNote}</p> : null}
              </article>
            ))}
          </div>

          <aside className="ksa-safety-alert mt-5 rounded-xl border border-amber-200/80 bg-amber-50/70 p-5 sm:p-6" style={{ borderColor: "rgba(253, 230, 138, 0.9)", background: "rgba(255, 251, 235, 0.78)" }} aria-labelledby="restriction-title">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-amber-200 bg-white text-amber-700">
                <AlertTriangle className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">Specialist restriction</p>
                <h3 id="restriction-title" className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{practice.specialistRestrictions.drugClass}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-900">{practice.specialistRestrictions.levelRequired}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{practice.specialistRestrictions.regulatoryProgram}</p>
              </div>
            </div>
          </aside>

          {practice.underlyingConditions?.length ? (
            <div className="ksa-content-card mt-5 rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ borderColor: "rgba(226, 232, 240, 0.78)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Underlying conditions to consider</p>
              <ul className="mt-3 space-y-2">
                {practice.underlyingConditions.map((condition) => <li key={condition} className="text-sm font-medium text-slate-900">{condition}</li>)}
              </ul>
            </div>
          ) : null}

          {practice.redFlags?.length ? (
            <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-700">Red flags</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-900">
                {practice.redFlags.map((redFlag) => <li key={redFlag}>{redFlag}</li>)}
              </ul>
            </div>
          ) : null}
        </section>

        <section id="governance" className="scroll-mt-32" aria-label="Clinical governance">
          <GovernanceDrawer metadata={topic.governanceMetadata} />
        </section>
      </div>
    </main>
  );
}
