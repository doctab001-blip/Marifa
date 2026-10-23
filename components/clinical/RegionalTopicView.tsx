import Link from "next/link";
import {
  ArrowLeft,
  CircleCheck,
  Globe,
  HeartPulse,
  ListChecks,
  Microscope,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Stethoscope,
  Timer,
} from "lucide-react";
import { GovernanceDrawer } from "@/components/clinical/GovernanceDrawer";
import type { CountryCode, GlobalDiseaseTopic, RegionalTherapy } from "@/types/clinical";
import { PLATFORM_REGION, REGIONS, REGION_PARAM, getRegionOption, getRegionalProfile } from "@/lib/region";

const card = "rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-6";
const eyebrow = "text-xs font-semibold uppercase tracking-[0.12em]";

function SectionTitle({ id, icon: Icon, title, note }: { id: string; icon: typeof Pill; title: string; note?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Icon className="size-5 text-[var(--region-accent)]" aria-hidden="true" />
        <h2 id={id} className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
      </div>
      {note ? <p className="mt-1 text-sm text-slate-500">{note}</p> : null}
    </div>
  );
}

function FeatureList({ title, items, tone = "neutral" }: { title: string; items: string[]; tone?: "neutral" | "rose" }) {
  const rose = tone === "rose";
  return (
    <div className={rose ? "rounded-xl border border-rose-200 bg-rose-50/70 p-5" : card}>
      <p className={`${eyebrow} ${rose ? "flex items-center gap-1.5 text-rose-700" : "text-slate-500"}`}>
        {rose ? <Siren className="size-3.5" aria-hidden="true" /> : null}
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm font-medium text-slate-900">
            <span aria-hidden="true" className={`mt-2 size-1.5 shrink-0 rounded-full ${rose ? "bg-rose-500" : "bg-[var(--region-solid)]"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** AMR guardrails sit directly below the dose so they are read before prescribing. */
function StewardshipGuardrails({ therapy }: { therapy: RegionalTherapy }) {
  if (!therapy.durationCap && !therapy.stewardshipWarning) return null;
  return (
    <div className="mt-4 grid gap-3" aria-label={`Antimicrobial stewardship guardrails for ${therapy.drugName}`}>
      {therapy.stewardshipWarning ? (
        <div role="note" className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-rose-600" aria-hidden="true" />
          <div>
            <p className={`${eyebrow} text-rose-700`}>Antimicrobial stewardship</p>
            <p className="mt-1 text-sm font-medium leading-6">{therapy.stewardshipWarning}</p>
          </div>
        </div>
      ) : null}
      {therapy.durationCap ? (
        <div role="note" className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <Timer className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
          <div>
            <p className={`${eyebrow} text-amber-700`}>Duration guardrail</p>
            <p className="mt-1 text-sm font-semibold leading-6">{therapy.durationCap}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TherapyCard({ therapy, countryName }: { therapy: RegionalTherapy; countryName: string }) {
  return (
    <article className={`${card} border-l-4 border-l-[var(--region-solid)]`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CircleCheck className="size-4 text-[var(--region-accent)]" aria-hidden="true" />
            <span className={`${eyebrow} text-[var(--region-accent)]`}>First line</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{therapy.drugName}</h3>
          {therapy.localTradeNames.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">{countryName} trade names</span>
              {therapy.localTradeNames.map((name) => (
                <span key={name} className="rounded-md border border-[var(--region-border)] bg-[var(--region-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--region-accent)]">{name}</span>
              ))}
            </div>
          ) : null}
        </div>
        <span className="w-fit rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-semibold text-slate-900">{therapy.dose}</span>
      </div>
      <StewardshipGuardrails therapy={therapy} />
    </article>
  );
}

export function RegionalTopicView({ topic, region }: { topic: GlobalDiseaseTopic; region: CountryCode }) {
  const option = getRegionOption(region);
  const profile = getRegionalProfile(topic, region);
  const { universalFeatures: universal } = topic;
  // A fixed platform never links across to the other country's guidance.
  const availableRegions = PLATFORM_REGION ? [] : REGIONS.filter((entry) => topic.regionalProfiles.some((p) => p.countryCode === entry.code));
  const regionHref = (code: CountryCode) => `?${REGION_PARAM}=${code}`;

  return (
    <main className="ksa-topic-view min-h-full bg-slate-50/70 text-slate-900" data-region={region}>
      <header className="region-topic-hero border-b border-slate-200/60 bg-[linear-gradient(180deg,var(--region-soft),#ffffff_70%)]">
        <div aria-hidden="true" className="h-1 w-full bg-[var(--region-solid)]" />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <Link href="/dashboard/diseases" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="size-4" aria-hidden="true" /> Disease directory
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--region-border)] bg-[var(--region-soft)] px-3 py-1 text-xs font-semibold text-[var(--region-accent)]" data-testid="region-badge">
              <span aria-hidden="true">{option.flag}</span> {option.name} practice
            </span>
            {profile ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700" data-testid="consensus-badge">
                <ShieldCheck className="size-3.5 text-[var(--region-accent)]" aria-hidden="true" />
                {profile.governanceMetadata.primaryConsensusSource}
              </span>
            ) : null}
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-medium text-slate-600">ICD-10 {topic.icd10Code}</span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">Demonstration data · clinical review pending</span>
          </div>
          <div className="mt-5 flex items-start gap-4">
            <span className="hidden size-11 shrink-0 place-items-center rounded-xl border border-[var(--region-border)] bg-[var(--region-soft)] text-[var(--region-accent)] sm:grid">
              <Stethoscope className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--region-accent)]">Disease Management · {option.name}</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{topic.title}</h1>
            </div>
          </div>
        </div>
      </header>

      <nav className="ksa-anchor-nav sticky top-[72px] z-20 border-b border-slate-200/60 bg-white/75 backdrop-blur-md" aria-label="Topic sections">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          {[
            ["Overview", "#pathophysiology"],
            ["Presentation", "#presentation"],
            ["Differentials", "#differentials"],
            ["Management", "#management"],
            ["Governance", "#governance"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-[var(--region-soft)] hover:text-[var(--region-accent)]">{label}</a>
          ))}
        </div>
      </nav>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:px-8">
        <section id="pathophysiology" className="scroll-mt-32 grid gap-4" aria-labelledby="pathophysiology-title">
          <SectionTitle id="pathophysiology-title" icon={HeartPulse} title="Pathophysiology" note="Universal — the same in every region." />
          <div className={card}><p className="text-sm leading-6 text-slate-700">{universal.pathophysiology}</p></div>
        </section>

        <section id="presentation" className="scroll-mt-32 grid gap-4" aria-labelledby="presentation-title">
          <SectionTitle id="presentation-title" icon={ListChecks} title="Clinical presentation" />
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureList title="Symptoms" items={universal.clinicalPresentation.symptoms} />
            <FeatureList title="Signs" items={universal.clinicalPresentation.signs} />
            <FeatureList title="Red flags" items={universal.clinicalPresentation.redFlags} tone="rose" />
          </div>
        </section>

        {universal.differentials.length > 0 ? (
          <section id="differentials" className="scroll-mt-32 grid gap-4" aria-labelledby="differentials-title">
            <SectionTitle id="differentials-title" icon={Microscope} title="Differentials" />
            <div className="grid gap-4 md:grid-cols-2">
              {universal.differentials.map((differential) => (
                <div key={differential.condition} className={card}>
                  <h3 className="text-base font-semibold text-slate-900">{differential.condition}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{differential.distinguishingFeatures}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section id="management" className="scroll-mt-32 grid gap-4" aria-labelledby="management-title">
          <SectionTitle id="management-title" icon={Pill} title="Management" note={profile ? `First-line treatment for ${profile.countryName}, with local trade names and stewardship rules.` : undefined} />
          {profile ? (
            profile.firstLineTherapies.length > 0 ? (
              <div className="grid gap-4">
                {profile.firstLineTherapies.map((therapy) => (
                  <TherapyCard key={`${therapy.drugName}-${therapy.dose}`} therapy={therapy} countryName={profile.countryName} />
                ))}
              </div>
            ) : (
              <div className={card}><p className="text-sm text-slate-500">No first-line therapy is recorded for {profile.countryName}.</p></div>
            )
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6" role="status">
              <div className="flex items-start gap-3">
                <Globe className="mt-0.5 size-5 shrink-0 text-slate-400" aria-hidden="true" />
                <div>
                  <h3 className="text-base font-semibold text-slate-900">No {option.name} profile for this topic yet</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Formulary, guideline and stewardship data for {option.name} ({option.authority}) have not been authored. Marifa does not substitute another country&apos;s formulary.
                  </p>
                  {availableRegions.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {availableRegions.map((entry) => (
                        <Link key={entry.code} href={regionHref(entry.code)} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--region-border)] bg-[var(--region-soft)] px-3 py-1 text-xs font-semibold text-[var(--region-accent)] hover:brightness-95" data-region={entry.code}>
                          <span aria-hidden="true">{entry.flag}</span> View {entry.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </section>

        <section id="governance" className="scroll-mt-32" aria-label="Clinical governance">
          {profile ? (
            <GovernanceDrawer metadata={profile.governanceMetadata} regionName={profile.countryName} />
          ) : (
            <p className="text-sm text-slate-500">Governance sources appear once a {option.name} profile is added.</p>
          )}
        </section>
      </div>
    </main>
  );
}
