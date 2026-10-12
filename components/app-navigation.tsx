"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Award,
  Bell,
  BookOpenCheck,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileClock,
  GraduationCap,
  House,
  LayoutDashboard,
  LayoutGrid,
  Library,
  Megaphone,
  Menu,
  Pill,
  Search,
  Settings,
  Settings2,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type NavItem = { href: string; label: string; icon: LucideIcon };

export const navigation: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/diseases", label: "Disease Management", icon: Stethoscope },
  { href: "/dashboard/clinical-guidelines", label: "Clinical Guidelines", icon: Library },
  { href: "/dashboard/hospital-protocols", label: "Hospital Protocols", icon: FileCheck2 },
  { href: "/dashboard/medicines-formulary", label: "Medicines and Formulary", icon: Pill },
  { href: "/dashboard/competencies", label: "Competencies", icon: ClipboardCheck },
  { href: "/dashboard/learning-centre", label: "Learning Centre", icon: GraduationCap },
  { href: "/dashboard/policies-and-sops", label: "Policies and SOPs", icon: BookOpenCheck },
  { href: "/dashboard/clinical-governance", label: "Clinical Governance", icon: ShieldCheck },
  { href: "/dashboard/accreditation-and-audits", label: "Accreditation and Audits", icon: Activity },
  { href: "/dashboard/staff-directory", label: "Staff Directory", icon: UsersRound },
  { href: "/dashboard/hospital-news", label: "Hospital News", icon: Megaphone },
  { href: "/dashboard/my-certificates", label: "My Certificates", icon: Award },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/admin", label: "Administration and Settings", icon: Settings },
];

const sections = [
  { label: "Workspace", items: navigation.slice(0, 7) },
  { label: "Hospital", items: navigation.slice(7, 14) },
  { label: "Administration", items: navigation.slice(14) },
];

const mobileItems = [navigation[0], navigation[1], navigation[2], navigation[5]];

const diseaseLinks: NavItem[] = [
  { href: "/dashboard/diseases", label: "Disease directory", icon: Stethoscope },
  { href: "/dashboard/diseases/drafts", label: "Drafts", icon: FileClock },
];

const adminLinks: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: ClipboardList },
  { href: "/dashboard/admin/staff", label: "Staff Directory", icon: UsersRound },
  { href: "/dashboard/admin/governance", label: "Governance Queue", icon: ShieldCheck },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings2 },
];

const carePillars = ["Urgent Care", "Chronic Care", "Keep Well", "Planned Care", "Safe Birth", "Palliative Care"];

function canonicalPath(pathname: string) {
  return {
    "/clinical-library": "/dashboard/clinical-guidelines",
    "/competencies": "/dashboard/competencies",
    "/modules": "/dashboard/hospital-protocols",
  }[pathname] ?? pathname;
}

function getActiveItem(pathname: string) {
  const path = canonicalPath(pathname);
  return navigation
    .filter(({ href }) => path === href || path.startsWith(`${href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

function currentTopicId(pathname: string) {
  const match = /^\/dashboard\/diseases\/([^/]+)$/.exec(pathname);
  return match && match[1] !== "drafts" ? decodeURIComponent(match[1]) : null;
}

export function WorkspaceSidebar({ organizationName, organizationNote, temporaryAdminMode }: {
  organizationName: string;
  organizationNote: string;
  temporaryAdminMode: boolean;
}) {
  const pathname = usePathname() ?? "";
  const activeModule = getActiveItem(pathname);
  const isHome = !activeModule || activeModule.href === "/dashboard";
  // Lets the reader glance at every module without leaving the current page; cleared on navigation.
  const [peekPath, setPeekPath] = useState<string | null>(null);
  const moduleItem = isHome ? undefined : activeModule;
  const showHome = !moduleItem || peekPath === pathname;

  return (
    <aside id="workspace-sidebar" className="sidebar" aria-label="Main navigation">
      <Link href="/dashboard" className="brand" title="Marifa home">
        <div className="brand-mark" aria-hidden="true">M</div>
        <div className="brand-copy"><div className="brand-name">Marifa</div><div className="brand-sub">Clinical knowledge & governance</div></div>
      </Link>
      <div className="sidebar-panel" key={showHome || !moduleItem ? "home" : moduleItem.href} data-direction={showHome ? "back" : "forward"}>
        {showHome || !moduleItem ? (
          <HomePanel
            activeLabel={activeModule?.label}
            returnTo={moduleItem}
            onReturn={() => setPeekPath(null)}
          />
        ) : (
          <ModulePanel
            module={moduleItem}
            pathname={pathname}
            temporaryAdminMode={temporaryAdminMode}
            onShowAll={() => setPeekPath(pathname)}
          />
        )}
      </div>
      <div className="org-card"><strong>{organizationName}</strong><span>{organizationNote}</span></div>
    </aside>
  );
}

function HomePanel({ activeLabel, returnTo, onReturn }: { activeLabel?: string; returnTo?: NavItem; onReturn: () => void }) {
  return (
    <nav aria-label="All modules">
      {returnTo && (
        <button type="button" className="panel-return" onClick={onReturn} title={`Back to ${returnTo.label}`}>
          <ArrowLeft size={15} aria-hidden="true" /><span>Back to {returnTo.label}</span>
        </button>
      )}
      {sections.map(({ label, items }) => (
        <section className="sidebar-nav-section" key={label} aria-label={label}>
          <div className="nav-label">{label}</div>
          {items.map(({ href, label: itemLabel, icon: Icon }) => (
            <Link key={itemLabel} href={href} className="nav-link" title={itemLabel} aria-label={itemLabel} aria-current={itemLabel === activeLabel ? "page" : undefined}>
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>{itemLabel}</span>
              {href !== "/dashboard" && <ChevronRight className="nav-link-chevron" size={14} aria-hidden="true" />}
            </Link>
          ))}
        </section>
      ))}
    </nav>
  );
}

function ModulePanel({ module, pathname, temporaryAdminMode, onShowAll }: { module: NavItem; pathname: string; temporaryAdminMode: boolean; onShowAll: () => void }) {
  const Icon = module.icon;
  const section = sections.find(({ items }) => items.includes(module));
  const isDiseases = module.href === "/dashboard/diseases";
  const isAdmin = module.href === "/dashboard/admin";
  const links = isDiseases
    ? diseaseLinks
    : isAdmin
      ? adminLinks.filter((link) => !temporaryAdminMode || link.href === "/dashboard/admin" || link.href === "/dashboard/admin/governance")
      : [{ ...module, label: "Overview" }];
  const activeLink = links
    .filter(({ href }) => pathname === href || (href !== module.href && pathname.startsWith(`${href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const related = !isDiseases && !isAdmin ? (section?.items ?? []).filter((item) => item !== module && item.href !== "/dashboard") : [];

  return (
    <nav aria-label={`${module.label} menu`} className="module-panel">
      <div className="panel-toolbar">
        <Link href="/dashboard" className="panel-home" title="Return to home">
          <House size={16} strokeWidth={1.9} aria-hidden="true" /><span>Home</span>
        </Link>
        <button type="button" className="panel-all-modules" onClick={onShowAll} aria-label="Show all modules" title="Show all modules">
          <LayoutGrid size={16} aria-hidden="true" /><span>All modules</span>
        </button>
      </div>
      <div className="panel-title">
        <span className="panel-title-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.9} /></span>
        <div><small>{section?.label ?? "Workspace"}</small><strong>{module.label}</strong></div>
      </div>
      <div className="sidebar-nav-section">
        {links.map(({ href, label, icon: LinkIcon }) => (
          <Link key={href} href={href} className="nav-link" title={label} aria-label={label} aria-current={activeLink?.href === href ? "page" : undefined}>
            <LinkIcon size={18} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span>
          </Link>
        ))}
      </div>
      {isDiseases && <TopicNavigator currentId={currentTopicId(pathname)} />}
      {related.length > 0 && (
        <section className="sidebar-nav-section panel-related" aria-label={`Also in ${section?.label}`}>
          <div className="nav-label">Also in {section?.label}</div>
          {related.map(({ href, label, icon: RelatedIcon }) => (
            <Link key={href} href={href} className="nav-link" title={label} aria-label={label}>
              <RelatedIcon size={18} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span>
            </Link>
          ))}
        </section>
      )}
    </nav>
  );
}

type NavTopic = { id: string; title: string; pillar: string };
type TopicState = { status: "loading" } | { status: "ready"; topics: NavTopic[] } | { status: "error" };

// One request per browser session; the list is shared by every topic page.
let topicRequest: Promise<NavTopic[]> | null = null;
function loadTopics() {
  topicRequest ??= fetch("/api/topics?view=nav", { credentials: "same-origin" })
    .then((response) => {
      if (!response.ok) throw new Error(`Topic list unavailable (${response.status})`);
      return response.json() as Promise<{ topics: NavTopic[] }>;
    })
    .then(({ topics }) => topics)
    .catch((error) => {
      topicRequest = null;
      throw error;
    });
  return topicRequest;
}

function TopicNavigator({ currentId }: { currentId: string | null }) {
  const router = useRouter();
  const [state, setState] = useState<TopicState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    loadTopics().then(
      (topics) => { if (active) setState({ status: "ready", topics }); },
      () => { if (active) setState({ status: "error" }); },
    );
    return () => { active = false; };
  }, []);

  const topics = useMemo(() => (state.status === "ready" ? state.topics : []), [state]);
  const needle = query.trim().toLocaleLowerCase();
  const groups = useMemo(() => {
    const filtered = needle ? topics.filter(({ title }) => title.toLocaleLowerCase().includes(needle)) : topics;
    const known = carePillars.map((pillar) => ({ pillar, items: filtered.filter((topic) => topic.pillar === pillar) }));
    const other = filtered.filter((topic) => !carePillars.includes(topic.pillar));
    return [...known, { pillar: "Other", items: other }].filter(({ items }) => items.length > 0);
  }, [needle, topics]);
  const currentPillar = topics.find(({ id }) => id === currentId)?.pillar;

  // Keep the open topic in view inside the panel without moving the page.
  useEffect(() => {
    const container = listRef.current?.closest(".sidebar-panel");
    const current = listRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!container || !current) return;
    const top = current.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTop = Math.max(0, top - container.clientHeight / 3);
  }, [currentId, state.status]);

  return (
    <section className="topic-nav" aria-label="Clinical topics">
      <div className="nav-label topic-nav-label">
        <span>Topics</span>{state.status === "ready" && <span className="topic-nav-count">{topics.length}</span>}
      </div>
      <label className="topic-nav-search">
        <Search size={14} aria-hidden="true" />
        <span className="sr-only">Filter topics</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter topics…" />
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear topic filter"><X size={13} /></button>}
      </label>
      <div ref={listRef}>
        {state.status === "loading" && (
          <div className="topic-nav-skeleton" aria-label="Loading topics" role="status">
            {Array.from({ length: 7 }, (_, index) => <span key={index} />)}
          </div>
        )}
        {state.status === "error" && <p className="topic-nav-empty">Topics could not be loaded. Use the disease directory instead.</p>}
        {state.status === "ready" && groups.length === 0 && <p className="topic-nav-empty">{needle ? "No topics match this filter." : "No published topics yet."}</p>}
        {groups.map(({ pillar, items }) => (
          <details key={`${pillar}-${needle ? "filtered" : "all"}`} className="topic-nav-group" open={Boolean(needle) || !currentPillar || pillar === currentPillar}>
            <summary><span>{pillar}</span><span className="topic-nav-count">{items.length}</span></summary>
            <ul>
              {items.map((topic) => {
                const href = `/dashboard/diseases/${encodeURIComponent(topic.id)}`;
                return (
                  <li key={topic.id}>
                    <Link
                      href={href}
                      prefetch={false}
                      onMouseEnter={() => router.prefetch(href)}
                      onFocus={() => router.prefetch(href)}
                      aria-current={topic.id === currentId ? "page" : undefined}
                      title={topic.title}
                    >
                      {topic.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}

export function MobileNavigation() {
  const pathname = usePathname() ?? "";
  const activeItem = getActiveItem(pathname);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const menuOpen = openPath === pathname;

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {mobileItems.map(({ href, label, icon: Icon }) => (
        <Link key={label} href={href} aria-label={label} aria-current={label === activeItem?.label ? "page" : undefined}>
          <Icon size={19} />
        </Link>
      ))}
      <button
        type="button"
        className="mobile-nav-more"
        aria-label={menuOpen ? "Close modules" : "Browse all modules"}
        aria-expanded={menuOpen}
        aria-controls="mobile-module-menu"
        onClick={() => setOpenPath(menuOpen ? null : pathname)}
      >
        {menuOpen ? <X size={19} /> : <Menu size={19} />}
      </button>
      {menuOpen && (
        <section className="mobile-module-menu" id="mobile-module-menu" aria-label="All dashboard modules">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link key={label} href={href} aria-current={label === activeItem?.label ? "page" : undefined} onClick={() => setOpenPath(null)}>
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </section>
      )}
    </nav>
  );
}
