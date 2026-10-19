import { Activity, ExternalLink, LayoutGrid, List } from "@/components/icons-3d";
import { approveDevelopment, hideDevelopment, summariseNow } from "./actions";
import { getCurrentViewer } from "@/lib/supabase/session";
import { ARCHIVE_FIRST_YEAR, ARCHIVE_PAGE_SIZE, getArchive, getPendingDevelopments, getPublishedDevelopments, type ArchiveFilters, type DevelopmentFilters } from "@/lib/data/recent-developments";
import { medicalSpecialities } from "@/lib/medical-specialities";
import { sources } from "@/lib/recent-developments/sources";
import { CATEGORY_LABELS, DEVELOPMENT_CATEGORIES, type DevelopmentRow } from "@/lib/recent-developments/types";

export const metadata = { title: "Recent Developments | Marifa" };

type Params = { category?: string | string[]; speciality?: string | string[]; source?: string | string[]; saudi?: string | string[]; q?: string | string[]; view?: string | string[]; tab?: string | string[]; year?: string | string[]; all?: string | string[]; gcc?: string | string[]; p?: string | string[] };
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Riyadh" });
const sourceName = (item: DevelopmentRow) => item.source_label ?? sources.find((source) => source.id === item.source_id)?.name ?? item.source_id;
const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T12:00:00Z`));

function Item({ item, admin, pending, tile }: { item: DevelopmentRow; admin: boolean; pending?: boolean; tile?: boolean }) {
  // Journal items carry an AI summary of the free PubMed abstract; regulator items carry the source's own excerpt.
  const summary = item.summary ?? item.excerpt;
  const aiSummary = item.summary_source === "pubmed_abstract";
  const curated = item.summary_source === "curated";
  return (
    <li className={`dev-item dev-cat-${item.category}${tile ? " dev-tile" : ""}`}>
      <div className="dev-item-meta">
        <span className={`pill pill-sm dev-cat dev-cat-${item.category}`}>{CATEGORY_LABELS[item.category]}</span>
        {item.saudi_relevant && <span className="pill pill-sm pill-emerald">Saudi-relevant</span>}
        {item.specialities.slice(0, tile ? 1 : 2).map((name) => <span key={name} className="pill pill-sm">{name}</span>)}
      </div>
      <h3 className="dev-item-title">
        <a href={item.source_url} target="_blank" rel="noopener noreferrer">{item.title}</a>
      </h3>
      {summary && (
        <div className="dev-item-summary">
          <p className="dev-item-excerpt">{summary}</p>
          <small className="dev-summary-note">{aiSummary ? "AI summary of the free PubMed abstract, not the full paper. Check the source before acting." : curated ? "Marifa summary of the published record. Check the source before acting." : "Summary from the source."}</small>
        </div>
      )}
      {item.why_it_matters && !tile && <p className="dev-why"><strong>Why it matters:</strong> {item.why_it_matters}</p>}
      <div className="dev-item-foot">
        <span>{sourceName(item)} · {formatDate(item.published_at)}{item.doi && !tile ? ` · doi:${item.doi}` : ""}</span>
        <span className="dev-links">
          {item.free_full_text_url && <a className="dev-source-link dev-free-link" href={item.free_full_text_url} target="_blank" rel="noopener noreferrer">Free full text <ExternalLink size={13} aria-hidden="true" /></a>}
          <a className="dev-source-link" href={item.source_url} target="_blank" rel="noopener noreferrer">Read at source <ExternalLink size={13} aria-hidden="true" /></a>
        </span>
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
  const view: "grid" | "list" = first(params.view) === "list" ? "list" : "grid";
  const viewHref = (target: "grid" | "list") => {
    const search = new URLSearchParams();
    if (filters.category) search.set("category", filters.category);
    if (filters.speciality) search.set("speciality", filters.speciality);
    if (filters.source) search.set("source", filters.source);
    if (filters.saudi) search.set("saudi", "1");
    if (filters.query) search.set("q", filters.query);
    if (target === "list") search.set("view", "list");
    const text = search.toString();
    return `/dashboard/recent-developments${text ? `?${text}` : ""}`;
  };
  const tab: "latest" | "archive" = first(params.tab) === "archive" ? "archive" : "latest";
  const yearNumber = Number(first(params.year));
  const archiveFilters: ArchiveFilters = {
    year: Number.isInteger(yearNumber) && yearNumber >= ARCHIVE_FIRST_YEAR && yearNumber <= 2100 ? yearNumber : null,
    category: filters.category,
    speciality: filters.speciality,
    saudi: filters.saudi,
    gcc: first(params.gcc) === "1",
    landmarks: first(params.all) !== "1",
    query: filters.query,
    page: Math.max(1, Math.floor(Number(first(params.p))) || 1),
  };
  const archiveHref = (patch: Partial<{ year: number | null; all: boolean; page: number; view: "grid" | "list" }>) => {
    const search = new URLSearchParams({ tab: "archive" });
    const year = "year" in patch ? patch.year : archiveFilters.year;
    if (year) search.set("year", String(year));
    if (filters.category) search.set("category", filters.category);
    if (filters.speciality) search.set("speciality", filters.speciality);
    if (filters.saudi) search.set("saudi", "1");
    if (archiveFilters.gcc) search.set("gcc", "1");
    if (filters.query) search.set("q", filters.query);
    if (patch.all ?? !archiveFilters.landmarks) search.set("all", "1");
    if (patch.page && patch.page > 1) search.set("p", String(patch.page));
    if ((patch.view ?? view) === "list") search.set("view", "list");
    return `/dashboard/recent-developments?${search.toString()}`;
  };
  const archive = tab === "archive" ? await getArchive(archiveFilters) : null;
  const viewer = await getCurrentViewer();
  const admin = Boolean(viewer?.isAdmin);
  const [list, pending] = await Promise.all([tab === "latest" ? getPublishedDevelopments(filters) : Promise.resolve({ state: "ok", items: [] } as const), tab === "latest" && admin ? getPendingDevelopments() : Promise.resolve([] as DevelopmentRow[])]);
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

      <nav className="dev-tabs" aria-label="Recent developments sections">
        <a href="/dashboard/recent-developments" className={tab === "latest" ? "is-active" : undefined} aria-current={tab === "latest" ? "page" : undefined}>Latest</a>
        <a href="/dashboard/recent-developments?tab=archive" className={tab === "archive" ? "is-active" : undefined} aria-current={tab === "archive" ? "page" : undefined}>Archive {ARCHIVE_FIRST_YEAR}–{new Date().getFullYear()}</a>
      </nav>

      <aside className="dev-disclaimer" role="note">
        Automated news digest. This is not clinical guidance and does not change any Marifa topic. Verify at the source before changing practice.
      </aside>

      {tab === "latest" && admin && pending.length > 0 && (
        <section className="section-card dev-review" aria-label="Awaiting your review">
          <div className="section-head"><h2>Awaiting your review ({pending.length})</h2></div>
          <p className="page-copy">Journal items are held until you approve them. Regulator items publish automatically.</p>
          <ul className="dev-list">{pending.map((item) => <Item key={item.id} item={item} admin pending />)}</ul>
          <form action={summariseNow}><button type="submit" className="button-secondary dev-btn" disabled={!process.env.ANTHROPIC_API_KEY} title={process.env.ANTHROPIC_API_KEY ? "Write summaries for journal items that have none yet" : "Add ANTHROPIC_API_KEY in Vercel to turn summaries on"}>Write missing summaries</button></form>
        </section>
      )}

      <form method="get" className="managed-toolbar" role="search" aria-label="Filter recent developments">
        {view === "list" && <input type="hidden" name="view" value="list" />}
        {tab === "archive" && <input type="hidden" name="tab" value="archive" />}
        {tab === "archive" && archiveFilters.year && <input type="hidden" name="year" value={archiveFilters.year} />}
        {tab === "archive" && !archiveFilters.landmarks && <input type="hidden" name="all" value="1" />}
        <label className="managed-field managed-field-search"><span>Search</span><input type="search" name="q" defaultValue={filters.query} placeholder="Title contains…" maxLength={80} /></label>
        <label className="managed-field"><span>Type</span>
          <select name="category" defaultValue={filters.category}><option value="">All types</option>{DEVELOPMENT_CATEGORIES.map((key) => <option key={key} value={key}>{CATEGORY_LABELS[key]}</option>)}</select>
        </label>
        <label className="managed-field"><span>Speciality</span>
          <select name="speciality" defaultValue={filters.speciality}><option value="">All specialities</option>{medicalSpecialities.map(({ name }) => <option key={name} value={name}>{name}</option>)}</select>
        </label>
        {tab === "latest" && <label className="managed-field"><span>Source</span>
          <select name="source" defaultValue={filters.source}><option value="">All sources</option>{sources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</select>
        </label>}
        <label className="dev-check"><input type="checkbox" name="saudi" value="1" defaultChecked={filters.saudi} /> Saudi-relevant only</label>
        {tab === "archive" && <label className="dev-check"><input type="checkbox" name="gcc" value="1" defaultChecked={archiveFilters.gcc} /> Saudi / GCC only</label>}
        <button type="submit" className="button-primary dev-btn">Apply</button>
        {filtered && <a className="button-secondary dev-btn" href={view === "list" ? "/dashboard/recent-developments?view=list" : "/dashboard/recent-developments"}>Clear</a>}
      </form>

      <div className="dev-view-bar">
        <span className="dev-legend" aria-label="Colour key">{DEVELOPMENT_CATEGORIES.map((key) => <span key={key} className={`dev-legend-item dev-cat-${key}`}><i aria-hidden="true" />{CATEGORY_LABELS[key]}</span>)}</span>
        <nav className="dev-view-toggle" aria-label="Layout">
          <a href={tab === "archive" ? archiveHref({ view: "grid" }) : viewHref("grid")} className={view === "grid" ? "is-active" : undefined} aria-current={view === "grid" ? "true" : undefined}><LayoutGrid size={15} aria-hidden="true" />Grid</a>
          <a href={tab === "archive" ? archiveHref({ view: "list" }) : viewHref("list")} className={view === "list" ? "is-active" : undefined} aria-current={view === "list" ? "true" : undefined}><List size={15} aria-hidden="true" />List</a>
        </nav>
      </div>

      {tab === "archive" ? (
        archive?.state === "migration_needed" ? (
          <p className="managed-empty">The archive is not set up yet. Apply the latest database migration (medical progress archive), then reload.</p>
        ) : archive?.state !== "ok" ? (
          <p className="managed-empty">The archive is unavailable right now.</p>
        ) : (
          <>
            <nav className="dev-years" aria-label="Year">
              <a href={archiveHref({ year: null })} className={!archiveFilters.year ? "is-active" : undefined}>All years</a>
              {Array.from({ length: new Date().getFullYear() - ARCHIVE_FIRST_YEAR + 1 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <a key={year} href={archiveHref({ year })} className={archiveFilters.year === year ? "is-active" : undefined}>{year}<small>{archive.yearCounts[year] ?? 0}</small></a>
              ))}
              <a href={archiveHref({ all: archiveFilters.landmarks })}>{archiveFilters.landmarks ? "Show notable too" : "Landmarks only"}</a>
            </nav>
            {archive.items.length === 0 ? (
              <p className="managed-empty"><Activity size={16} aria-hidden="true" /> Nothing matches these filters.</p>
            ) : (
              [...new Set(archive.items.map((item) => item.published_at.slice(0, 4)))].map((year) => (
                <section key={year} aria-label={`Developments of ${year}`}>
                  <h2 className="dev-year-head">{year}</h2>
                  <ul className={view === "grid" ? "dev-grid" : "dev-list"}>{archive.items.filter((item) => item.published_at.startsWith(year)).map((item) => <Item key={item.id} item={item} admin={admin} tile={view === "grid"} />)}</ul>
                </section>
              ))
            )}
            {archive.total > ARCHIVE_PAGE_SIZE && (
              <div className="dev-pager">
                {archiveFilters.page > 1 && <a className="button-secondary dev-btn" href={archiveHref({ page: archiveFilters.page - 1 })}>Previous</a>}
                <span>Page {archiveFilters.page} of {Math.ceil(archive.total / ARCHIVE_PAGE_SIZE)} · {archive.total} items</span>
                {archiveFilters.page * ARCHIVE_PAGE_SIZE < archive.total && <a className="button-secondary dev-btn" href={archiveHref({ page: archiveFilters.page + 1 })}>Next</a>}
              </div>
            )}
          </>
        )
      ) : list.state === "unavailable" ? (
        <p className="managed-empty">Recent Developments is not set up yet. Apply the latest database migration, then run the first scan.</p>
      ) : list.items.length === 0 ? (
        <p className="managed-empty"><Activity size={16} aria-hidden="true" /> {filtered ? "Nothing matches these filters." : "No developments yet. The first scan runs on Monday at 06:00 Riyadh time."}</p>
      ) : (
        <ul className={view === "grid" ? "dev-grid" : "dev-list"} aria-label="Recent developments">{list.items.map((item) => <Item key={item.id} item={item} admin={admin} tile={view === "grid"} />)}</ul>
      )}
    </main>
  );
}
