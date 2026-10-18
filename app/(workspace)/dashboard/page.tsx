import Link from "next/link";
import { Suspense } from "react";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  ChevronRight,
  ClipboardCheck,
  FileClock,
  Hourglass,
  Library,
  Stethoscope,
  TriangleAlert,
} from "@/components/icons-3d";
import { DemoBanner } from "@/components/demo-banner";
import { KnowledgeSearch } from "@/components/dashboard/knowledge-search";
import { TopicExplorer } from "@/components/dashboard/topic-explorer";
import { emptyFilters, isSortKey, type ExplorerFilters, type ExplorerTopic, type SortKey } from "@/lib/dashboard/topic-explorer";
import { getApprovedDiseaseGuidelines } from "@/lib/data/disease-guidelines";
import { getTopicViewStats } from "@/lib/data/topic-views";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";
import { getCurrentViewer } from "@/lib/supabase/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDiseaseDraftTopicCount } from "@/lib/data/disease-drafts";

const dateFormat = new Intl.DateTimeFormat("en-SA", { dateStyle: "medium", timeZone: "Asia/Riyadh" });

type DashboardSearchParams = { error?: string | string[]; sort?: string | string[]; q?: string | string[]; speciality?: string | string[]; pillar?: string | string[]; authority?: string | string[]; review?: string | string[] };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

function readExplorerState(params: DashboardSearchParams): { sort: SortKey; filters: ExplorerFilters } {
  const sort = first(params.sort);
  const review = first(params.review);
  return {
    sort: isSortKey(sort) ? sort : "recent",
    filters: {
      ...emptyFilters,
      query: first(params.q).slice(0, 120),
      speciality: first(params.speciality),
      pillar: first(params.pillar),
      authority: first(params.authority),
      review: review === "approved" || review === "pending" ? review : "all",
    },
  };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<DashboardSearchParams> }) {
  const params = await searchParams;
  const error = first(params.error);
  const viewer = await getCurrentViewer();
  const firstName = viewer?.name.split(/\s+/).slice(0, 2).join(" ") ?? "Clinician";
  const explorerState = readExplorerState(params);

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

      {error === "unauthorized" && (
        <div className="dashboard-notices">
          <aside className="dashboard-access-notice" role="alert">You don’t have permission to open Administration. Ask your hospital administrator if you need access.</aside>
        </div>
      )}

      <DemoBanner />

      <Suspense fallback={<DashboardLoadingState />}>
        <DashboardContent viewerId={viewer?.id} initialSort={explorerState.sort} initialFilters={explorerState.filters} />
      </Suspense>
    </main>
  );
}

async function DashboardContent({ viewerId, initialSort, initialFilters }: { viewerId?: string; initialSort: SortKey; initialFilters: ExplorerFilters }) {
  const [guidelines, assignments, draftTopicCount, viewStats] = await Promise.all([
    getApprovedDiseaseGuidelines(),
    loadAssignments(viewerId),
    getDiseaseDraftTopicCount(),
    getTopicViewStats(),
  ]);

  const topics: ExplorerTopic[] = guidelines.diseases.map((disease) => {
    const views = viewStats.byTopic[disease.id];
    return {
      id: disease.id,
      title: disease.title,
      speciality: disease.speciality ?? disease.specialty,
      pillar: disease.pillar,
      authority: disease.authority,
      version: disease.version,
      lastReviewed: String(disease.lastReviewed),
      clinicallyApproved: disease.clinicalReviewStatus !== "pending",
      keywords: (disease.keywords ?? []).slice(0, 12),
      totalViews: views?.total ?? 0,
      views7d: views?.last7Days ?? 0,
    };
  });
  const awaitingApproval = topics.filter((topic) => !topic.clinicallyApproved).length;
  const specialityCount = new Set(topics.map((topic) => topic.speciality)).size;
  const viewsThisWeek = topics.reduce((sum, topic) => sum + topic.views7d, 0);

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
          <MetricCard tone="teal" label="Live topics" value={topics.length} note={`Across ${specialityCount} ${specialityCount === 1 ? "speciality" : "specialities"}`} href="/dashboard/diseases" icon={<Library size={18} aria-hidden="true" />} />
          <MetricCard tone="magenta" label="Awaiting clinical approval" value={awaitingApproval} note="Live, with clinician sign-off pending" href="/dashboard/diseases/published" icon={<Hourglass size={18} aria-hidden="true" />} />
          <MetricCard tone="yellow" label="Draft topics" value={draftTopicCount} note="Below the live threshold or in authoring" href="/dashboard/diseases/drafts" icon={<FileClock size={18} aria-hidden="true" />} />
          {viewStats.available ? (
            <MetricCard tone="blue" label="Topic views, last 7 days" value={viewsThisWeek} note="Counted when a live topic is opened" href="/dashboard/diseases" icon={<Activity size={18} aria-hidden="true" />} />
          ) : (
            <MetricCard tone="blue" label="Specialities covered" value={specialityCount} note="View counts are not recording yet" href="/dashboard/diseases" icon={<Stethoscope size={18} aria-hidden="true" />} />
          )}
        </div>
      </section>

      <div className="dashboard-main-grid">
        {guidelines.state === "unavailable" ? (
          <section className="card section-card topic-explorer" aria-labelledby="explorer-title">
            <div className="section-head"><h2 id="explorer-title">Browse topics</h2></div>
            <div className="empty-state">
              <span className="empty-state-icon"><TriangleAlert size={22} aria-hidden="true" /></span>
              <strong>The topic library could not be loaded</strong>
              <p>The clinical data service did not respond. Refresh the page to try again.</p>
            </div>
          </section>
        ) : (
          <TopicExplorer topics={topics} viewsAvailable={viewStats.available} initialSort={initialSort} initialFilters={initialFilters} />
        )}

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

function MetricCard({ tone, label, value, note, href, icon }: { tone: "teal" | "yellow" | "blue" | "magenta"; label: string; value: number; note: string; href: string; icon: React.ReactNode }) {
  return (
    <article className={`card metric-card metric-${tone}`}>
      <div className="metric-top"><span>{label}</span><span className={`metric-icon metric-icon-${tone}`}>{icon}</span></div>
      <div className="metric-value">{value.toLocaleString("en-GB")}</div>
      <div className="metric-note">{note}</div>
      <Link className="metric-link" href={href}>Open<ChevronRight size={14} aria-hidden="true" /></Link>
    </article>
  );
}
