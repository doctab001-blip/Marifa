import { Activity, ExternalLink } from "@/components/icons-3d";
import { approveDevelopment, hideDevelopment } from "./actions";
import { getCurrentViewer } from "@/lib/supabase/session";
import { getPendingDevelopments, getPublishedDevelopments, type DevelopmentFilters } from "@/lib/data/recent-developments";
import { medicalSpecialities } from "@/lib/medical-specialities";
import { sources } from "@/lib/recent-developments/sources";
import { CATEGORY_LABELS, DEVELOPMENT_CATEGORIES, type DevelopmentRow } from "@/lib/recent-developments/types";

export const metadata = { title: "Recent Developments | Marifa" };

type Params = { category?: string | string[]; speciality?: string | string[]; source?: string | string[]; saudi?: string | string[]; q?: string | string[] };
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Riyadh" });
const sourceName = (id: string) => sources.find((source) => source.id === id)?.name ?? id;
const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T12:00:00Z`));

function Item({ item, admin, pending }: { item: DevelopmentRow; admin: boolean; pending?: boolean }) {
  return (
    <li className="dev-item">
      <div className="dev-item-meta">
        <span className={`pill pill-sm dev-cat dev-cat-${item.category}`}>{CATEGORY_LABELS[item.category]}</span>
        {item.saudi_relevant && <span className="pill pill-sm pill-emerald">Saudi-relevant</span>}
        {item.specialities.slice(0, 2).map((name) => <span key={name} className="pill pill-sm">{name}</span>)}
      </div>
      <h3 className="dev-item-title">
        <a href={item.source_url} target="_blank" rel="noopener noreferrer">{item.title}</a>
      </h3>
      {item.excerpt && <p className="dev-item-excerpt">{item.excerpt}</p>}
      <div className="dev-item-foot">
        <span>{sourceName(item.source_id)} · {formatDate(item.published_at)}{item.doi ? ` · doi:${item.doi}` : ""}</span>
        <a className="dev-source-link" href={item.source_url} target="_blank" rel="noopener noreferrer">Read at source <ExternalLink size={13} aria-hidden="true" /></a>
      </div>
      {admin && (
        <div className="dev-item-admin">
          {pending && <form action={approveDevelopment}><input type="hidden" name="id" value={item.id} /><button type="submit" className="button-primary dev-btn">Approve and publish</button></form>}
          <form action={hideDevelopment}><input type="hidden" name="id" value={item.id} /><button type="submit" className="button-secondary dev-btn">{pending ? "Reject" : "Hide"}</button></form>
        </div>
      )}
    </li>
  );
}

export default async function RecentDevelopmentsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const filters: DevelopmentFilters = {
    category: first(params.category),
    speciality: first(params.speciality),
    source: first(params.source),
    saudi: first(params.saudi) === "1",
    query: first(params.q).slice(0, 80),
  };
  const viewer = await getCurrentViewer();
  const admin = Boolean(viewer?.isAdmin);
  const [list, pending] = await Promise.all([getPublishedDevelopments(filters), admin ? getPendingDevelopments() : Promise.resolve([] as DevelopmentRow[])]);
  const filtered = Boolean(filters.category || filters.speciality || filters.source || filters.saudi || filters.query);

  return (
    <main className="page dev-page">
      <header className="dashboard-header">
        <div>
          <div className="eyebrow">Updated every Monday at 06:00 (Riyadh)</div>
          <h1 className="page-title">Recent Developments</h1>
          <p className="page-copy">New drug approvals, safety alerts, guideline news and key trials from official regulators and major journals. Every item links to its original source.</p>
        </div>
      </header>

      <aside className="dev-disclaimer" role="note">
        Automated news digest. This is not clinical guidance and does not change any Marifa topic. Verify at the source before changing practice.
      </aside>

      {admin && pending.length > 0 && (
        <section className="section-card dev-review" aria-label="Awaiting your review">
          <div className="section-head"><h2>Awaiting your review ({pending.length})</h2></div>
          <p className="page-copy">Journal items are held until you approve them. Regulator items publish automatically.</p>
          <ul className="dev-list">{pending.map((item) => <Item key={item.id} item={item} admin pending />)}</ul>
        </section>
      )}

      <form method="get" className="managed-toolbar" role="search" aria-label="Filter recent developments">
        <label className="managed-field managed-field-search"><span>Search</span><input type="search" name="q" defaultValue={filters.query} placeholder="Title contains…" maxLength={80} /></label>
        <label className="managed-field"><span>Type</span>
          <select name="category" defaultValue={filters.category}><option value="">All types</option>{DEVELOPMENT_CATEGORIES.map((key) => <option key={key} value={key}>{CATEGORY_LABELS[key]}</option>)}</select>
        </label>
        <label className="managed-field"><span>Speciality</span>
          <select name="speciality" defaultValue={filters.speciality}><option value="">All specialities</option>{medicalSpecialities.map(({ name }) => <option key={name} value={name}>{name}</option>)}</select>
        </label>
        <label className="managed-field"><span>Source</span>
          <select name="source" defaultValue={filters.source}><option value="">All sources</option>{sources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</select>
        </label>
        <label className="dev-check"><input type="checkbox" name="saudi" value="1" defaultChecked={filters.saudi} /> Saudi-relevant only</label>
        <button type="submit" className="button-primary dev-btn">Apply</button>
        {filtered && <a className="button-secondary dev-btn" href="/dashboard/recent-developments">Clear</a>}
      </form>

      {list.state === "unavailable" ? (
        <p className="managed-empty">Recent Developments is not set up yet. Apply the latest database migration, then run the first scan.</p>
      ) : list.items.length === 0 ? (
        <p className="managed-empty"><Activity size={16} aria-hidden="true" /> {filtered ? "Nothing matches these filters." : "No developments yet. The first scan runs on Monday at 06:00 Riyadh time."}</p>
      ) : (
        <ul className="dev-list" aria-label="Recent developments">{list.items.map((item) => <Item key={item.id} item={item} admin={admin} />)}</ul>
      )}
    </main>
  );
}
