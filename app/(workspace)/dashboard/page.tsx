import Link from "next/link";
import { Suspense } from "react";
import {
  Activity,
  ArrowRight,
  BellRing,
  CalendarClock,
  Calculator,
  ChevronRight,
  ClipboardCheck,
  Droplets,
  FileClock,
  FileSearch,
  HeartPulse,
  Info,
  Library,
  Megaphone,
  Pill,
  Stethoscope,
  TriangleAlert,
} from "@/components/icons-3d";
import { DemoBanner } from "@/components/demo-banner";
import { AlertBanner } from "@/components/dashboard/alert-banner";
import { KnowledgeSearch } from "@/components/dashboard/knowledge-search";
import { clinicalCalculators } from "@/lib/clinical-calculators";
import { hospitalAlerts, type HospitalAlert } from "@/lib/dashboard/hospital-feed";
import { getApprovedDiseaseGuidelines } from "@/lib/data/disease-guidelines";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";
import { getCurrentViewer } from "@/lib/supabase/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const dateFormat = new Intl.DateTimeFormat("en-SA", { dateStyle: "medium", timeZone: "Asia/Riyadh" });

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  const { error } = await searchParams;
  const viewer = await getCurrentViewer();
  const firstName = viewer?.name.split(/\s+/).slice(0, 2).join(" ") ?? "Clinician";
  const urgentAlert = hospitalAlerts.find(({ severity }) => severity === "urgent");

  return (
    <main className="page dashboard-page">
      <header className="dashboard-header">
        <div>
          <div className="eyebrow">Your workspace at a glance</div>
          <h1 className="page-title">Welcome back, {firstName}</h1>
          <p className="page-copy">Your clinical knowledge and professional requirements, in one governed workspace.</p>
        </div>
        <div className="dashboard-date"><CalendarClock size={15} aria-hidden="true" />{dateFormat.format(new Date())}</div>
      </header>

      {(urgentAlert || error === "unauthorized") && (
        <div className="dashboard-notices">
          {urgentAlert && <AlertBanner alert={urgentAlert} />}
          {error === "unauthorized" && <aside className="dashboard-access-notice" role="alert">You don’t have permission to open Administration. Ask your hospital administrator if you need access.</aside>}
        </div>
      )}

      <DemoBanner />

      <Suspense fallback={<DashboardLoadingState />}>
        <DashboardContent viewerId={viewer?.id} />
      </Suspense>
    </main>
  );
}

async function DashboardContent({ viewerId }: { viewerId?: string }) {
  const assignmentsPromise = loadAssignments(viewerId);
  const [guidelines, assignments] = await Promise.all([
    getApprovedDiseaseGuidelines(),
    assignmentsPromise,
  ]);
  const activeGuidelines = guidelines.diseases.length;
  const draftsPending = guidelines.withheldCount;
  const recentGuidelines = [...guidelines.diseases].sort((x, y) => String(y.lastReviewed).localeCompare(String(x.lastReviewed))).slice(0, 6);
  const formularyUpdates = hospitalAlerts.filter(({ id }) => id.startsWith("formulary")).length;

  return (
    <>

      <section className="knowledge-hub" aria-labelledby="hub-title">
        <div className="ai-search">
          <div className="ai-search-intro">
            <span className="ai-search-badge"><Library size={14} aria-hidden="true" /> Knowledge &amp; Governance Hub</span>
            <h2 id="hub-title">Quick clinical directory</h2>
            <p>Search diseases, guidelines, pathways and the formulary across the governed library.</p>
          </div>
          <KnowledgeSearch />
        </div>

        <div className="metric-grid" aria-label="Library metrics">
          <MetricCard tone="teal" label="Active guidelines" value={activeGuidelines} note="Live in the clinical directory" href="/dashboard/diseases" icon={<Library size={18} aria-hidden="true" />} />
          <MetricCard tone="yellow" label="Draft reviews pending" value={draftsPending} note="Awaiting authoring or clinical review" href="/dashboard/diseases/drafts" icon={<FileClock size={18} aria-hidden="true" />} />
          <MetricCard tone="blue" label="Medical calculators" value={clinicalCalculators.length} note="Evidence-linked point-of-care tools" href="/dashboard/medical-calculators" icon={<Calculator size={18} aria-hidden="true" />} />
          <MetricCard tone="magenta" label="Formulary updates" value={formularyUpdates} note="Recent changes (sample data)" href="/dashboard/medicines-formulary" icon={<Pill size={18} aria-hidden="true" />} />
        </div>

        <div className="hub-columns">
          <section className="card section-card" aria-labelledby="recent-guidelines-title">
            <div className="section-head"><h2 id="recent-guidelines-title">Recently updated guidelines</h2><Link className="section-link" href="/dashboard/diseases">View directory</Link></div>
            <RecentGuidelines diseases={recentGuidelines} />
          </section>
          <section className="card section-card" aria-labelledby="core-pathways-title">
            <div className="section-head"><h2 id="core-pathways-title">Core clinical pathways</h2><Link className="section-link" href="/dashboard/diseases">All pathways</Link></div>
            <div className="pathway-grid">
              {corePathways.map(({ title, description, query, icon: Icon, tone }) => (
                <Link key={title} className="pathway-card" href={`/dashboard/diseases?q=${encodeURIComponent(query)}`}>
                  <span className={`metric-icon metric-icon-${tone}`}><Icon size={18} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="pathway-cta">Open pathway<ArrowRight size={13} aria-hidden="true" /></span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>

      <div className="dashboard-columns">
        <div className="dashboard-stack">
          <section className="card section-card">
            <div className="section-head">
              <h2>Important hospital updates</h2>
              <Link className="section-link" href="/dashboard/notifications">All notifications</Link>
            </div>
            <ul className="update-list">
              {hospitalAlerts.map((alert) => <UpdateRow alert={alert} key={alert.id} />)}
            </ul>
          </section>
        </div>
        <div className="dashboard-stack">
          <section className="card section-card">
            <div className="section-head"><h2>My requirements</h2><Link className="section-link" href="/dashboard/competencies">View all</Link></div>
            {assignments.length ? assignments.map((item) => {
              const template = Array.isArray(item.competency_templates) ? item.competency_templates[0] : item.competency_templates;
              return (
                <Link className="topic-row" href="/dashboard/competencies" key={item.id}>
                  <div className={item.state === "overdue" ? "topic-icon topic-icon-alert" : "topic-icon"}>{item.state === "overdue" ? <TriangleAlert size={17} /> : <CalendarClock size={17} />}</div>
                  <div className="topic-main"><strong>{template?.title ?? "Competency assignment"}</strong><p>{item.state.replaceAll("_", " ")}{item.due_at ? ` · due ${dateFormat.format(new Date(item.due_at))}` : ""}</p></div>
                </Link>
              );
            }) : (
              <div className="empty-state">
                <span className="empty-state-icon"><ClipboardCheck size={22} aria-hidden="true" /></span>
                <strong>No competency assignments yet</strong>
                <p>Assignments from your department will appear here with their due dates.</p>
                <Link className="button-secondary" href="/dashboard/competencies">Open competencies</Link>
              </div>
            )}
          </section>
          <Link href="/dashboard/diseases" className="card section-card flagship-card">
            <span className="flagship-icon"><Stethoscope size={22} aria-hidden="true" /></span>
            <div>
              <div className="eyebrow">Flagship module</div>
              <h2>Explore Disease Management</h2>
              <p className="page-copy">Search across care pillars and inspect source provenance.</p>
            </div>
            <ArrowRight className="flagship-arrow" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  );
}

type Assignment = { id: string; state: string; due_at: string | null; competency_templates: { title: string } | { title: string }[] | null };

async function loadAssignments(viewerId?: string): Promise<Assignment[]> {
  if (!viewerId || isTemporaryOpenAdminMode()) return [];
  const supabase = await createSupabaseServerClient();
  const { data: memberships } = await supabase
    .from("organization_memberships")
    .select("id")
    .eq("user_id", viewerId)
    .eq("account_status", "active")
    .limit(1);
  const membership = memberships?.[0];
  if (!membership) return [];
  const { data } = await supabase
    .from("competency_assignments")
    .select("id, state, due_at, competency_templates(title)")
    .eq("membership_id", membership.id)
    .order("due_at", { ascending: true })
    .limit(4);
  return (data ?? []) as Assignment[];
}

function DashboardLoadingState() {
  return (
    <section className="knowledge-hub" aria-busy="true" aria-label="Loading dashboard data">
      <div className="ai-search">
        <div className="ai-search-intro">
          <span className="ai-search-badge"><Library size={14} aria-hidden="true" /> Knowledge &amp; Governance Hub</span>
          <h2>Quick clinical directory</h2>
          <p>Search diseases, guidelines, pathways and the formulary across the governed library.</p>
        </div>
        <KnowledgeSearch />
      </div>
      <div className="metric-grid" aria-hidden="true">
        {["teal", "yellow", "blue", "magenta"].map((tone) => <div className={`card metric-card metric-card-${tone} page-loading-card`} key={tone} />)}
      </div>
    </section>
  );
}

const severityIcon = { urgent: BellRing, advisory: Megaphone, info: Info } as const;
const severityLabel = { urgent: "Urgent", advisory: "Advisory", info: "Information" } as const;

function UpdateRow({ alert }: { alert: HospitalAlert }) {
  const Icon = severityIcon[alert.severity];
  return (
    <li>
      <Link className="update-row" href={alert.href}>
        <span className={`update-icon update-icon-${alert.severity}`}><Icon size={17} aria-hidden="true" /></span>
        <span className="update-main">
          <span className="update-meta">
            <span className={`badge badge-${alert.severity}`}>{severityLabel[alert.severity]}</span>
            <span>{dateFormat.format(new Date(alert.issuedAt))}</span>
            {alert.sample && <span className="update-sample">Sample</span>}
          </span>
          <strong>{alert.title}</strong>
          <span className="update-detail">{alert.detail}</span>
        </span>
        <ChevronRight size={15} className="update-chevron" aria-hidden="true" />
      </Link>
    </li>
  );
}

const corePathways = [
  { title: "Sepsis Six", description: "Recognition, first-hour bundle and escalation.", query: "Sepsis", icon: Activity, tone: "magenta" },
  { title: "Acute Chest Pain", description: "Rapid assessment, ACS risk stratification and next steps.", query: "Acute coronary syndrome", icon: HeartPulse, tone: "teal" },
  { title: "AKI Management", description: "Staging, fluid review, medicines and referral triggers.", query: "Acute kidney injury", icon: Droplets, tone: "blue" },
] as const;

function MetricCard({ tone, label, value, note, href, icon }: { tone: "teal" | "yellow" | "blue" | "magenta"; label: string; value: number; note: string; href: string; icon: React.ReactNode }) {
  return (
    <article className={`card metric-card metric-${tone}`}>
      <div className="metric-top"><span>{label}</span><span className={`metric-icon metric-icon-${tone}`}>{icon}</span></div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">{note}</div>
      <Link className="metric-link" href={href}>Open<ChevronRight size={14} aria-hidden="true" /></Link>
    </article>
  );
}

function RecentGuidelines({ diseases }: { diseases: Awaited<ReturnType<typeof getApprovedDiseaseGuidelines>>["diseases"] }) {
  if (!diseases.length) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon"><FileSearch size={22} aria-hidden="true" /></span>
        <strong>No clinical guidelines published yet</strong>
        <p>Approved topics will be listed here as soon as they go live.</p>
      </div>
    );
  }
  return (
    <ul className="guideline-feed">
      {diseases.map((disease) => {
        const reviewed = new Date(disease.lastReviewed);
        return (
          <li key={disease.id}>
            <Link href={`/dashboard/diseases/${disease.id}`} className="guideline-feed-row">
              <div className="topic-icon"><Stethoscope size={17} aria-hidden="true" /></div>
              <div className="guideline-feed-main">
                <strong>{disease.title}</strong>
                <span className="guideline-feed-meta">
                  <span>{disease.authority}</span>
                  <span className="pill pill-slate pill-sm">v{disease.version}</span>
                  <span>Revised {Number.isNaN(reviewed.getTime()) ? disease.lastReviewed : dateFormat.format(reviewed)}</span>
                </span>
              </div>
              <ChevronRight size={15} className="update-chevron" aria-hidden="true" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
