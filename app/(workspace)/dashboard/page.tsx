import Link from "next/link";
import { Activity, ArrowRight, Award, BookMarked, CalendarClock, ChevronRight, ClipboardCheck, FileText, Search, Stethoscope, TriangleAlert } from "lucide-react";
import { announcements, competencies } from "@/lib/demo-data";
import { DemoBanner } from "@/components/demo-banner";
import { getDiseaseTopics } from "@/lib/data/diseases";
import { getCurrentViewer } from "@/lib/supabase/session";

export default async function DashboardPage() {
  const completed = competencies.filter((item) => item.status === "completed").length;
  const [diseases, viewer] = await Promise.all([getDiseaseTopics(), getCurrentViewer()]);
  const firstName = viewer?.name.split(/\s+/).slice(0, 2).join(" ") ?? "Clinician";
  return (
    <main className="page">
      <DemoBanner />
      <div className="page-header"><div><div className="eyebrow">Thursday, 9 October 2026</div><h1 className="page-title">Good evening, {firstName}</h1><p className="page-copy">Your clinical knowledge and professional requirements, in one governed workspace.</p></div></div>
      <section className="hero-search" aria-labelledby="clinical-search-title">
        <h2 id="clinical-search-title">What clinical guidance do you need?</h2>
        <p>Search diseases, symptoms, pathways, medicines and hospital terminology.</p>
        <form className="hero-input" action="/dashboard/diseases"><Search size={19} /><input name="q" aria-label="Search disease management" placeholder="Try “DKA”, “asthma” or “screening”" /><button type="submit">Search</button></form>
      </section>
      <div className="grid grid-4" style={{ marginTop: 18 }}>
        <div className="card metric"><div className="metric-top"><span>Assigned competencies</span><span className="metric-icon"><ClipboardCheck size={17} /></span></div><div className="metric-value">{competencies.length}</div><div className="metric-note">{completed} complete · 3 require attention</div></div>
        <div className="card metric"><div className="metric-top"><span>Saved references</span><span className="metric-icon"><BookMarked size={17} /></span></div><div className="metric-value">2</div><div className="metric-note">Personal collection · demo data</div></div>
        <div className="card metric"><div className="metric-top"><span>Clinical updates</span><span className="metric-icon"><Activity size={17} /></span></div><div className="metric-value">3</div><div className="metric-note">Illustrative, not approved guidance</div></div>
        <div className="card metric"><div className="metric-top"><span>Certificates expiring</span><span className="metric-icon"><Award size={17} /></span></div><div className="metric-value">1</div><div className="metric-note">Within the next 60 days</div></div>
      </div>
      <div className="clinical-grid" style={{ marginTop: 18 }}>
        <div className="grid">
          <section className="card section-card">
            <div className="section-head"><h2>Recently updated clinical topics</h2><Link className="section-link" href="/dashboard/diseases">View directory</Link></div>
            {diseases.map((disease) => <Link href={`/diseases/${disease.slug}`} className="topic-row" key={disease.id}><div className="topic-icon"><Stethoscope size={17} /></div><div className="topic-main"><strong>{disease.name}</strong><p>{disease.summary}</p></div><div className="topic-meta"><span className="status status-demo">Demo</span></div><ChevronRight size={15} color="#98a2b3" /></Link>)}
          </section>
          <section className="card section-card">
            <div className="section-head"><h2>Important hospital updates</h2><span className="section-link">Demo feed</span></div>
            {announcements.map((item) => <div className="topic-row" key={item.id}><div className="topic-icon"><FileText size={17} /></div><div className="topic-main"><strong>{item.title}</strong><p>{item.label}</p></div><div className="topic-meta">{item.date}</div></div>)}
          </section>
        </div>
        <div className="grid" style={{ alignContent: "start" }}>
          <section className="card section-card">
            <div className="section-head"><h2>My requirements</h2><Link className="section-link" href="/competencies">View all</Link></div>
            {competencies.slice(1).map((item) => <Link className="topic-row" href="/competencies" key={item.id}><div className="topic-icon">{item.status === "overdue" ? <TriangleAlert size={17} /> : <CalendarClock size={17} />}</div><div className="topic-main"><strong>{item.title}</strong><p>{item.progress}% complete · due {item.dueDate}</p><div className="progress"><span style={{ width: `${item.progress}%` }} /></div></div></Link>)}
          </section>
          <Link href="/dashboard/diseases" className="card section-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div><div className="eyebrow">Flagship module</div><h2 className="heading" style={{ fontSize: ".95rem", margin: "6px 0" }}>Explore Disease Management</h2><p className="page-copy" style={{ fontSize: ".72rem" }}>Search across care pillars and inspect source provenance.</p></div><ArrowRight color="#1f3c88" /></Link>
        </div>
      </div>
    </main>
  );
}
