import Link from "next/link";
import { Activity, ArrowRight, Award, BookMarked, CalendarClock, ChevronRight, ClipboardCheck, FileSearch, Search, Stethoscope, TriangleAlert } from "lucide-react";
import { DemoBanner } from "@/components/demo-banner";
import { getApprovedDiseaseGuidelines } from "@/lib/data/disease-guidelines";
import { getCurrentViewer } from "@/lib/supabase/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  const guidelines = await getApprovedDiseaseGuidelines();
  return (
    <main className="page">
      <DemoBanner />
      {error === "unauthorized" && <aside className="dashboard-access-notice" role="alert">You don’t have permission to open Administration. Ask your hospital administrator if you need access.</aside>}
      <div className="page-header"><div><div className="eyebrow">Your workspace at a glance</div><h1 className="page-title">Welcome back, {firstName}</h1><p className="page-copy">Your clinical knowledge and professional requirements, in one governed workspace.</p></div></div>
      <section className="hero-search" aria-labelledby="clinical-search-title">
        <h2 id="clinical-search-title">What clinical guidance do you need?</h2>
        <p>Search diseases, symptoms, pathways, medicines and hospital terminology.</p>
        <form className="hero-input" action="/dashboard/diseases"><Search size={19} /><input name="q" aria-label="Search disease management" placeholder="Try “DKA”, “asthma” or “screening”" /><button type="submit">Search</button></form>
      </section>
      <div className="grid grid-4" style={{ marginTop: 18 }}>
        <div className="card metric"><div className="metric-top"><span>Assigned competencies</span><span className="metric-icon"><ClipboardCheck size={17} /></span></div><div className="metric-value">{assignments.length}</div><div className="metric-note">{completed} complete</div></div>
        <div className="card metric"><div className="metric-top"><span>Saved references</span><span className="metric-icon"><BookMarked size={17} /></span></div><div className="metric-value">{savedReferences}</div><div className="metric-note">Personal collection</div></div>
        <div className="card metric"><div className="metric-top"><span>Clinical updates</span><span className="metric-icon"><Activity size={17} /></span></div><div className="metric-value">{clinicalUpdates}</div><div className="metric-note">Approved organization guidance</div></div>
        <div className="card metric"><div className="metric-top"><span>Published guidelines</span><span className="metric-icon"><Award size={17} /></span></div><div className="metric-value">{guidelines.diseases.length}</div><div className="metric-note">Verified directory records</div></div>
      </div>
      <div className="clinical-grid" style={{ marginTop: 18 }}>
        <div className="grid">
          <section className="card section-card">
            <RecentTopics diseases={guidelines.diseases} />
          </section>
          <section className="card section-card">
            <div className="section-head"><h2>Important hospital updates</h2></div>
            <div className="admin-empty"><Activity size={24} aria-hidden="true" /><p>No hospital updates available.</p></div>
          </section>
        </div>
        <div className="grid" style={{ alignContent: "start" }}>
          <section className="card section-card">
            <div className="section-head"><h2>My requirements</h2><Link className="section-link" href="/dashboard/competencies">View all</Link></div>
            {assignments.length ? assignments.map((item) => { const template = Array.isArray(item.competency_templates) ? item.competency_templates[0] : item.competency_templates; return <Link className="topic-row" href="/dashboard/competencies" key={item.id}><div className="topic-icon">{item.state === "overdue" ? <TriangleAlert size={17} /> : <CalendarClock size={17} />}</div><div className="topic-main"><strong>{template?.title ?? "Competency assignment"}</strong><p>{item.state.replaceAll("_", " ")}{item.due_at ? ` · due ${new Intl.DateTimeFormat("en-SA", { dateStyle: "medium", timeZone: "Asia/Riyadh" }).format(new Date(item.due_at))}` : ""}</p></div></Link>; }) : <div className="admin-empty"><ClipboardCheck size={24} aria-hidden="true" /><p>No competency assignments yet.</p></div>}
          </section>
          <Link href="/dashboard/diseases" className="card section-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div><div className="eyebrow">Flagship module</div><h2 className="heading" style={{ margin: "6px 0" }}>Explore Disease Management</h2><p className="page-copy">Search across care pillars and inspect source provenance.</p></div><ArrowRight color="#1f3c88" /></Link>
        </div>
      </div>
    </main>
  );
}

function RecentTopics({ diseases }: { diseases: Awaited<ReturnType<typeof getApprovedDiseaseGuidelines>>["diseases"] }) {
  return <>
    <div className="section-head"><h2>Recently updated clinical topics</h2><Link className="section-link" href="/dashboard/diseases">View directory</Link></div>
    {diseases.length ? diseases.slice(0, 4).map((disease) => <Link href={`/dashboard/diseases/${disease.id}`} className="topic-row" key={disease.id}><div className="topic-icon"><Stethoscope size={17} /></div><div className="topic-main"><strong>{disease.title}</strong><p>{disease.summary}</p></div><ChevronRight size={15} color="#98a2b3" /></Link>) : <div className="admin-empty"><FileSearch size={24} aria-hidden="true" /><p>No clinical guidelines published yet.</p></div>}
  </>;
}
