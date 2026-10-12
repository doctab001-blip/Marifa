import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  BookMarked,
  CalendarClock,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  Info,
  Library,
  Megaphone,
  RefreshCcw,
  Sparkles,
  Stethoscope,
  TriangleAlert,
} from "lucide-react";
import { DemoBanner } from "@/components/demo-banner";
import { AlertBanner } from "@/components/dashboard/alert-banner";
import { HospitalOperations } from "@/components/dashboard/hospital-operations";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { hospitalAlerts, operationsSnapshot, type HospitalAlert } from "@/lib/dashboard/hospital-feed";
import { CLINICAL_DIRECTORY_DRAFT_TOPIC_COUNT } from "@/lib/data/clinical-directory-eligibility";
import { getApprovedDiseaseGuidelines } from "@/lib/data/disease-guidelines";
import { getCurrentViewer } from "@/lib/supabase/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const dateFormat = new Intl.DateTimeFormat("en-SA", { dateStyle: "medium", timeZone: "Asia/Riyadh" });

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  const { error } = await searchParams;
  const viewer = await getCurrentViewer();
  const firstName = viewer?.name.split(/\s+/).slice(0, 2).join(" ") ?? "Clinician";
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  let assignments: Array<{ id: string; state: string; due_at: string | null; competency_templates: { title: string } | { title: string }[] | null }> = [];
  let savedReferences = 0;
  let clinicalUpdates = 0;
  if (typeof userId === "string") {
    const { data: memberships } = await supabase.from("organization_memberships").select("id, organization_id").eq("user_id", userId).eq("account_status", "active").limit(1);
    const membership = memberships?.[0];
    if (membership) {
      const [assignmentResult, bookmarkResult, updateResult] = await Promise.all([
        supabase.from("competency_assignments").select("id, state, due_at, competency_templates(title)").eq("membership_id", membership.id).order("due_at", { ascending: true }).limit(4),
        supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("clinical_guidelines").select("id, guideline_versions!inner(id)").eq("organization_id", membership.organization_id).in("guideline_versions.status", ["approved", "published"]),
      ]);
      assignments = (assignmentResult.data ?? []) as typeof assignments;
      savedReferences = bookmarkResult.count ?? 0;
      clinicalUpdates = updateResult.data?.length ?? 0;
    }
  }
  const completed = assignments.filter((item) => item.state === "completed").length;
  const overdue = assignments.filter((item) => item.state === "overdue").length;
  const guidelines = await getApprovedDiseaseGuidelines();
  const liveTopics = guidelines.diseases.length;
  const directoryTotal = liveTopics + CLINICAL_DIRECTORY_DRAFT_TOPIC_COUNT;
  const livePercent = directoryTotal ? Math.round((liveTopics / directoryTotal) * 100) : 0;
  const urgentAlert = hospitalAlerts.find(({ severity }) => severity === "urgent");

  return (
    <main className="page dashboard-page">
      {urgentAlert && <AlertBanner alert={urgentAlert} />}
      <DemoBanner />
      {error === "unauthorized" && <aside className="dashboard-access-notice" role="alert">You don’t have permission to open Administration. Ask your hospital administrator if you need access.</aside>}

      <header className="dashboard-header">
        <div>
          <div className="eyebrow">Your workspace at a glance</div>
          <h1 className="page-title">Welcome back, {firstName}</h1>
          <p className="page-copy">Your clinical knowledge and professional requirements, in one governed workspace.</p>
        </div>
        <div className="dashboard-date"><CalendarClock size={15} aria-hidden="true" />{dateFormat.format(new Date())}</div>
      </header>

      <section className="ai-search" aria-labelledby="ai-search-title">
        <div className="ai-search-intro">
          <span className="ai-search-badge"><Sparkles size={14} aria-hidden="true" /> AI Clinical Search</span>
          <h2 id="ai-search-title">What clinical guidance do you need?</h2>
          <p>Search diseases, symptoms, pathways, medicines and hospital terminology across the governed directory.</p>
        </div>
        <form className="ai-search-form" action="/dashboard/diseases" role="search">
          <Sparkles className="ai-search-icon" size={19} aria-hidden="true" />
          <input name="q" aria-label="AI clinical search" placeholder="Ask about a condition, e.g. “DKA”, “asthma” or “sepsis screening”" autoComplete="off" />
          <button type="submit">Search<ArrowRight size={16} aria-hidden="true" /></button>
        </form>
        <div className="ai-search-suggestions" aria-label="Suggested searches">
          {["Sepsis", "Postpartum haemorrhage", "Acute coronary syndrome", "Hyperkalaemia"].map((term) => (
            <Link key={term} href={`/dashboard/diseases?q=${encodeURIComponent(term)}`}>{term}</Link>
          ))}
        </div>
      </section>

      <section className="metric-grid" aria-label="Key figures">
        <article className="card metric-card metric-teal">
          <div className="metric-top"><span>Assigned competencies</span><span className="metric-icon metric-icon-teal"><ClipboardCheck size={18} aria-hidden="true" /></span></div>
          <div className="metric-body">
            <ProgressRing value={completed} total={assignments.length} label="Competencies complete" tone="teal" centre={<><strong>{completed}</strong><small>of {assignments.length}</small></>} />
            <div>
              <div className="metric-value">{assignments.length}</div>
              <div className="metric-note">{completed} complete{overdue ? ` · ${overdue} overdue` : ""}</div>
            </div>
          </div>
        </article>
        <article className="card metric-card metric-blue">
          <div className="metric-top"><span>Saved references</span><span className="metric-icon metric-icon-blue"><BookMarked size={18} aria-hidden="true" /></span></div>
          <div className="metric-value">{savedReferences}</div>
          <div className="metric-note">Personal collection</div>
          <Link className="metric-link" href="/dashboard/clinical-guidelines">Browse guidelines<ChevronRight size={14} aria-hidden="true" /></Link>
        </article>
        <article className="card metric-card metric-yellow">
          <div className="metric-top"><span>Clinical updates</span><span className="metric-icon metric-icon-yellow"><RefreshCcw size={18} aria-hidden="true" /></span></div>
          <div className="metric-value">{clinicalUpdates}</div>
          <div className="metric-note">Approved organization guidance</div>
          <span className="badge badge-yellow">Approved &amp; published</span>
        </article>
        <article className="card metric-card metric-magenta">
          <div className="metric-top"><span>Published guidelines</span><span className="metric-icon metric-icon-magenta"><Library size={18} aria-hidden="true" /></span></div>
          <div className="metric-value">{liveTopics}</div>
          <div className="metric-note">Live directory · {CLINICAL_DIRECTORY_DRAFT_TOPIC_COUNT} in correction queue</div>
          <div className="meter meter-split" role="img" aria-label={`${livePercent}% of directory topics are live`}>
            <span className="meter-teal" style={{ width: `${livePercent}%` }} />
          </div>
        </article>
      </section>

      <HospitalOperations snapshot={operationsSnapshot} />

      <div className="dashboard-columns">
        <div className="dashboard-stack">
          <section className="card section-card">
            <RecentTopics diseases={guidelines.diseases} />
          </section>
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
    </main>
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

function RecentTopics({ diseases }: { diseases: Awaited<ReturnType<typeof getApprovedDiseaseGuidelines>>["diseases"] }) {
  return <>
    <div className="section-head"><h2>Recently updated clinical topics</h2><Link className="section-link" href="/dashboard/diseases">View directory</Link></div>
    {diseases.length ? diseases.slice(0, 4).map((disease) => (
      <Link href={`/dashboard/diseases/${disease.id}`} className="topic-row" key={disease.id}>
        <div className="topic-icon"><Stethoscope size={17} /></div>
        <div className="topic-main"><strong>{disease.title}</strong><p>{disease.summary}</p></div>
        <ChevronRight size={15} className="update-chevron" aria-hidden="true" />
      </Link>
    )) : (
      <div className="empty-state">
        <span className="empty-state-icon"><FileSearch size={22} aria-hidden="true" /></span>
        <strong>No clinical guidelines published yet</strong>
        <p>Approved topics will be listed here as soon as they go live.</p>
      </div>
    )}
  </>;
}
