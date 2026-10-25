"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  Bell,
  ChevronRight,
  ClipboardList,
  Calculator as CalculatorIcon,
  FileCheck2,
  FileClock,
  GraduationCap,
  HeartPulse,
  House,
  LayoutDashboard,
  LayoutGrid,
  Menu,
  Pill,
  Search,
  Settings2,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  X,
  type LucideIcon,
} from "@/components/icons-3d";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { searchTopics } from "@/lib/topic-search";
import { PLATFORM_NAME, PLATFORM_REGION, REGION_CHANGE_EVENT, REGION_COOKIE, REGION_PARAM } from "@/lib/region";
import { withoutInlineSourceLocators } from "@/lib/clinical-display-text";
import { UNASSIGNED_SPECIALITY, canonicalSpeciality, groupBySpeciality, specialityCounts, specialityStyle } from "@/lib/medical-specialities";
import { displayTopicTitle } from "@/lib/topic-title";

type NavSection = "Workspace" | "Compliance & Audit" | "Hospital";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Sidebar group the module is listed under. */
  section?: NavSection;
  /** Kept out of the sidebar and mobile menu, but the route still works and is still recognised by getActiveItem. */
  hidden?: boolean;
  /** For links that differ only by query string (e.g. ?tab=archive). */
  isActive?: (pathname: string, params: URLSearchParams) => boolean;
};

export const navigation: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Workspace" },
  { href: "/dashboard/disease-management", label: "Disease Management", icon: Stethoscope, section: "Workspace" },
  { href: "/dashboard/medical-calculators", label: "Medical Calculators", icon: CalculatorIcon, section: "Workspace" },
  { href: "/dashboard/diagnosis-engine", label: "Diagnosis Engine", icon: HeartPulse, section: "Workspace" },
  // Hidden for the MVP. Set hidden to false to bring the tab back.
  { href: "/dashboard/formulary", label: "Medicines and Formulary", icon: Pill, section: "Workspace", hidden: true },
  { href: "/dashboard/recent-developments", label: "Recent Developments", icon: Activity, section: "Workspace" },
  // Hidden for the MVP. Set hidden to false to bring the tab back.
  { href: "/dashboard/patients", label: "Patient Orders", icon: ClipboardList, section: "Workspace", hidden: true },
  { href: "/dashboard/learning", label: "Learning Portal", icon: GraduationCap, section: "Compliance & Audit" },
  { href: "/dashboard/protocols", label: "Local Protocols & SOPs", icon: FileCheck2, section: "Hospital" },
  { href: "/dashboard/governance", label: "Clinical Governance", icon: ShieldCheck, section: "Hospital" },
  { href: "/dashboard/directory", label: "Staff Directory", icon: UsersRound, section: "Hospital" },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, section: "Hospital" },
];

const sectionOrder: NavSection[] = ["Workspace", "Compliance & Audit", "Hospital"];

const visibleNavigation = navigation.filter((item) => !item.hidden);

const sections = sectionOrder
  .map((label) => ({ label, items: visibleNavigation.filter((item) => item.section === label) }))
  .filter(({ items }) => items.length > 0);

const navItem = (href: string) => navigation.find((item) => item.href === href)!;
const mobileItems = ["/dashboard", "/dashboard/disease-management", "/dashboard/medical-calculators", "/dashboard/notifications"].map(navItem);

const diseaseLinks: NavItem[] = [
  { href: "/dashboard/diseases", label: "Disease directory", icon: Stethoscope },
  { href: "/dashboard/diseases/approved", label: "Approved", icon: ShieldCheck },
  { href: "/dashboard/diseases/drafts", label: "Drafts", icon: FileClock },
  { href: "/dashboard/diseases/published", label: "Published", icon: FileCheck2 },
];

const protocolLinks: NavItem[] = [
  { href: "/dashboard/protocols/drafts", label: "Drafts", icon: FileClock },
  { href: "/dashboard/protocols/published", label: "Published", icon: FileCheck2 },
];

const developmentLinks: NavItem[] = [
  { href: "/dashboard/recent-developments", label: "Latest", icon: Activity, isActive: (path, params) => path === "/dashboard/recent-developments" && params.get("tab") !== "archive" },
  { href: "/dashboard/recent-developments?tab=archive", label: "Archive", icon: FileClock, isActive: (path, params) => path === "/dashboard/recent-developments" && params.get("tab") === "archive" },
];

const adminLinks: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: ClipboardList },
  { href: "/dashboard/admin/staff", label: "Staff Directory", icon: UsersRound },
  { href: "/dashboard/admin/governance", label: "Governance Queue", icon: ShieldCheck },
  { href: "/dashboard/admin/investigation-review", label: "Investigation review", icon: FileCheck2 },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings2 },
];

/** Admin pages are not a top-level module, but they still get their own panel instead of the home list. */
const ADMIN_MODULE: NavItem = { href: "/dashboard/admin", label: "Administration", icon: Settings2 };

function isAdminPath(pathname: string) {
  return /^\/dashboard\/admin(\/|$)/.test(pathname) && !pathname.startsWith("/dashboard/admin/guidelines/");
}

/**
 * The links one module shows in its own panel. A module only ever lists its own pages:
 * other modules are reached with Home / All modules, never repeated here.
 */
export function modulePanelLinks(module: NavItem, temporaryAdminMode = false): NavItem[] {
  switch (module.href) {
    case "/dashboard/disease-management": return diseaseLinks;
    case "/dashboard/protocols": return protocolLinks;
    case "/dashboard/recent-developments": return developmentLinks;
    case "/dashboard/medical-calculators": return []; // the calculator list below is the menu
    case "/dashboard/admin":
      return adminLinks.filter((link) => !temporaryAdminMode || ["/dashboard/admin", "/dashboard/admin/governance", "/dashboard/admin/investigation-review"].includes(link.href));
    default: return [{ ...module, label: "Overview" }];
  }
}

const carePillars = ["Urgent Care", "Chronic Care", "Keep Well", "Planned Care", "Safe Birth", "Palliative Care"];

function canonicalPath(pathname: string) {
  if (pathname === "/dashboard/diseases" || pathname.startsWith("/dashboard/diseases/")) {
    return pathname.replace("/dashboard/diseases", "/dashboard/disease-management");
  }
  if (pathname.startsWith("/dashboard/admin/guidelines/")) return "/dashboard/disease-management";
  if (pathname === "/dashboard/accreditation-and-audits" || pathname.startsWith("/dashboard/accreditation-and-audits/")) return "/dashboard/governance";
  return {
    "/clinical-library": "/dashboard/clinical-guidelines",
    "/competencies": "/dashboard/competencies",
    "/modules": "/dashboard/hospital-protocols",
    "/dashboard/medicines-formulary": "/dashboard/formulary",
    "/dashboard/hospital-protocols": "/dashboard/protocols",
    "/dashboard/clinical-governance": "/dashboard/governance",
    "/dashboard/staff-directory": "/dashboard/directory",
  }[pathname] ?? pathname;
}

export function getActiveItem(pathname: string) {
  const path = canonicalPath(pathname);
  return navigation
    .filter(({ href }) => path === href || path.startsWith(`${href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

function currentTopicId(pathname: string) {
  const match = /^\/dashboard\/diseases\/([^/]+)$/.exec(pathname);
  return match && match[1] !== "drafts" ? decodeURIComponent(match[1]) : null;
}

export function WorkspaceSidebar({ organizationName, organizationNote, temporaryAdminMode, draftTopicCount }: {
  organizationName: string;
  organizationNote: string;
  temporaryAdminMode: boolean;
  draftTopicCount: number;
}) {
  const pathname = usePathname() ?? "";
  const activeModule = getActiveItem(pathname);
  const isHome = !activeModule || activeModule.href === "/dashboard";
  // Lets the reader glance at every module without leaving the current page; cleared on navigation.
  const [peekPath, setPeekPath] = useState<string | null>(null);
  const moduleItem = isAdminPath(pathname) ? ADMIN_MODULE : isHome ? undefined : activeModule;
  const showHome = !moduleItem || peekPath === pathname;

  return (
    <aside id="workspace-sidebar" className="sidebar" aria-label="Main navigation">
      <Link href="/dashboard" className="brand" title={`${PLATFORM_NAME} home`}>
        <Image src="/marifa-logo.png" alt="" aria-hidden="true" width={46} height={46} className="brand-logo" priority />
        <div className="brand-copy"><div className="brand-name">{PLATFORM_NAME}</div><div className="brand-sub">Clinical knowledge & governance</div></div>
      </Link>
      <div className="sidebar-panel" key={showHome || !moduleItem ? "home" : moduleItem.href} data-direction={showHome ? "back" : "forward"}>
        {showHome || !moduleItem ? (
          <HomePanel
            activeLabel={activeModule?.label}
            returnTo={moduleItem}
            onReturn={() => setPeekPath(null)}
          />
        ) : (
          // useSearchParams() inside the panel needs a Suspense boundary, or statically prerendered pages fail the build.
          <Suspense fallback={<nav aria-label="Loading menu" className="module-panel" />}>
            <ModulePanel
              module={moduleItem}
              pathname={pathname}
              temporaryAdminMode={temporaryAdminMode}
              draftTopicCount={draftTopicCount}
              onShowAll={() => setPeekPath(pathname)}
            />
          </Suspense>
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

function ModulePanel({ module, pathname, temporaryAdminMode, draftTopicCount, onShowAll }: { module: NavItem; pathname: string; temporaryAdminMode: boolean; draftTopicCount: number; onShowAll: () => void }) {
  const Icon = module.icon;
  const searchParams = useSearchParams();
  const params = useMemo(() => new URLSearchParams(searchParams?.toString() ?? ""), [searchParams]);
  const section = module.href === ADMIN_MODULE.href ? { label: "Admin" } : { label: module.section };
  const isDiseases = module.href === "/dashboard/disease-management";
  const isCalculators = module.href === "/dashboard/medical-calculators";
  const links = modulePanelLinks(module, temporaryAdminMode);
  const pathOf = (href: string) => href.split("?")[0];
  const activeLink = links.find(({ isActive }) => isActive?.(pathname, params))
    ?? links
      .filter(({ href, isActive }) => !isActive && (pathname === pathOf(href) || (pathOf(href) !== module.href && pathname.startsWith(`${pathOf(href)}/`))))
      .sort((a, b) => b.href.length - a.href.length)[0];

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
      {links.length > 0 && (
        <div className="sidebar-nav-section">
          {links.map(({ href, label, icon: LinkIcon }) => {
            const displayLabel = href === "/dashboard/diseases/drafts" ? `${label} (${draftTopicCount})` : label;
            return <Link key={href} href={href} className="nav-link" title={displayLabel} aria-label={displayLabel} aria-current={activeLink?.href === href ? "page" : undefined}>
              <LinkIcon size={18} strokeWidth={1.8} aria-hidden="true" /><span>{displayLabel}</span>
            </Link>
          })}
        </div>
      )}
      {isDiseases && (pathname.startsWith("/dashboard/diseases/drafts") || pathname.startsWith("/dashboard/admin/guidelines/")
        ? <DraftTopicNavigator />
        : <TopicNavigator currentId={currentTopicId(pathname)} />)}
      {isCalculators && <CalculatorNavigator />}
    </nav>
  );
}

type CalculatorNavItem = { id: string; label: string; title: string; specialty: string };

/** Side-panel menu for Medical Calculators: every calculator, grouped by speciality, selected through ?calc=. */
function CalculatorNavigator() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<CalculatorNavItem[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    // Loaded on demand so the calculator definitions are not part of every page's bundle.
    import("@/lib/clinical-calculators").then(({ clinicalCalculators }) => {
      if (active) setItems(clinicalCalculators.map((item) => ({ id: item.id, label: item.shortTitle, title: item.title, specialty: item.specialty })));
    }, () => { if (active) setItems([]); });
    return () => { active = false; };
  }, []);

  const needle = query.trim().toLocaleLowerCase();
  const activeId = searchParams?.get("calc") ?? undefined;
  const groups = useMemo(() => {
    const filtered = (items ?? []).filter((item) => !needle || `${item.label} ${item.title} ${item.specialty}`.toLocaleLowerCase().includes(needle));
    const bySpeciality = new Map<string, CalculatorNavItem[]>();
    for (const item of filtered) bySpeciality.set(item.specialty, [...(bySpeciality.get(item.specialty) ?? []), item]);
    return [...bySpeciality.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([specialty, list]) => ({ specialty, list }));
  }, [items, needle]);

  return (
    <section className="topic-nav" aria-label="Medical calculators">
      <div className="nav-label topic-nav-label"><span>Calculators</span>{items && <span className="topic-nav-count">{items.length}</span>}</div>
      <label className="topic-nav-search"><Search size={14} aria-hidden="true" /><span className="sr-only">Filter calculators</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter calculators…" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear calculator filter"><X size={13} /></button>}</label>
      {items === null && <div className="topic-nav-skeleton" aria-label="Loading calculators" role="status">{Array.from({ length: 6 }, (_, index) => <span key={index} />)}</div>}
      {items && groups.length === 0 && <p className="topic-nav-empty">{needle ? "No calculators match this filter." : "No calculators available."}</p>}
      {groups.map(({ specialty, list }) => (
        <details key={`${specialty}-${needle ? "filtered" : "all"}`} className="topic-nav-group" open>
          <summary><span>{specialty}</span><span className="topic-nav-count">{list.length}</span></summary>
          <ul>
            {list.map((item) => (
              <li key={item.id}>
                <Link href={`/dashboard/medical-calculators?calc=${encodeURIComponent(item.id)}`} scroll={false} prefetch={false} aria-current={item.id === activeId ? "page" : undefined} title={item.title}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </section>
  );
}

type NavTopic = { id: string; title: string; pillar: string; speciality?: string; keywords?: string[] };
type TopicState = { status: "loading" } | { status: "ready"; topics: NavTopic[] } | { status: "error" };

// One request per browser session and practice region; the list is shared by every topic page.
let topicRequest: Promise<NavTopic[]> | null = null;
let topicRequestRegion = "";
function currentRegionCode() {
  if (PLATFORM_REGION) return PLATFORM_REGION;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get(REGION_PARAM);
    const fromCookie = document.cookie.split("; ").find((entry) => entry.startsWith(`${REGION_COOKIE}=`))?.split("=")[1];
    // The toggle writes the cookie before it updates the URL, so the cookie is the freshest choice.
    return (fromCookie ?? fromUrl ?? "SA").toUpperCase();
  } catch {
    return "SA";
  }
}
function loadTopics() {
  const region = currentRegionCode();
  if (region !== topicRequestRegion) {
    topicRequest = null;
    topicRequestRegion = region;
  }
  topicRequest ??= fetch(`/api/topics?view=nav&region=${encodeURIComponent(region)}`, { credentials: "same-origin" })
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

export function TopicNavigator({ currentId }: { currentId: string | null }) {
  const router = useRouter();
  const [state, setState] = useState<TopicState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [groupBy, setGroupBy] = useState<"speciality" | "pillar">("speciality");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const load = () => loadTopics().then(
      (topics) => { if (active) setState({ status: "ready", topics }); },
      () => { if (active) setState({ status: "error" }); },
    );
    load();
    // The country toggle announces a region change; reload the list for the new region.
    const onRegionChange = () => { setState({ status: "loading" }); load(); };
    window.addEventListener(REGION_CHANGE_EVENT, onRegionChange);
    return () => { active = false; window.removeEventListener(REGION_CHANGE_EVENT, onRegionChange); };
  }, []);

  const topics = useMemo(() => (state.status === "ready" ? state.topics : []), [state]);
  const needle = query.trim();
  const specialityOptions = useMemo(() => specialityCounts(topics, (topic) => topic.speciality || UNASSIGNED_SPECIALITY), [topics]);
  const groups = useMemo(() => {
    // Same engine as the directory search: abbreviations (DKA), symptoms and drugs find topics here too.
    const searched = needle ? searchTopics(topics, needle) : topics;
    const filtered = speciality ? searched.filter((topic) => (topic.speciality || UNASSIGNED_SPECIALITY) === speciality) : searched;
    if (groupBy === "speciality") {
      // Relevance order is kept while searching; otherwise topics read A to Z inside each speciality.
      return groupBySpeciality(filtered, (topic) => topic.speciality ?? "").map(({ speciality: name, items }) => ({
        key: name,
        items: needle ? items : [...items].sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" })),
      }));
    }
    const known = carePillars.map((pillar) => ({ key: pillar, items: filtered.filter((topic) => topic.pillar === pillar) }));
    const other = filtered.filter((topic) => !carePillars.includes(topic.pillar));
    return [...known, { key: "Other", items: other }].filter(({ items }) => items.length > 0);
  }, [groupBy, needle, speciality, topics]);
  const currentTopic = topics.find(({ id }) => id === currentId);
  const currentGroup = currentTopic ? (groupBy === "speciality" ? currentTopic.speciality || UNASSIGNED_SPECIALITY : currentTopic.pillar) : undefined;
  const filtering = Boolean(needle || speciality);

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
      {state.status === "ready" && (
        <div className="topic-nav-controls">
          <label className="topic-nav-select">
            <span className="sr-only">Filter topics by speciality</span>
            <select value={speciality} onChange={(event) => setSpeciality(event.target.value)}>
              <option value="">All specialities</option>
              {specialityOptions.map((option) => <option key={option.value} value={option.value}>{option.value} ({option.count})</option>)}
            </select>
          </label>
          <div className="topic-nav-groupby" role="group" aria-label="Group topics by">
            <button type="button" aria-pressed={groupBy === "speciality"} onClick={() => setGroupBy("speciality")}>Speciality</button>
            <button type="button" aria-pressed={groupBy === "pillar"} onClick={() => setGroupBy("pillar")}>Care pillar</button>
          </div>
        </div>
      )}
      <div ref={listRef}>
        {state.status === "loading" && (
          <div className="topic-nav-skeleton" aria-label="Loading topics" role="status">
            {Array.from({ length: 7 }, (_, index) => <span key={index} />)}
          </div>
        )}
        {state.status === "error" && <p className="topic-nav-empty">Topics could not be loaded. Use the disease directory instead.</p>}
        {state.status === "ready" && groups.length === 0 && <p className="topic-nav-empty">{filtering ? "No topics match this filter." : "No published topics yet."}</p>}
        {groups.map(({ key, items }) => (
          <details key={`${groupBy}-${key}-${filtering ? "filtered" : "all"}`} className="topic-nav-group" {...(groupBy === "speciality" ? { "data-spec": "", style: specialityStyle(key) } : {})} open={filtering || key === currentGroup || (groupBy === "pillar" && !currentGroup)}>
            <summary><span>{key}</span><span className="topic-nav-count">{items.length}</span></summary>
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
                      title={displayTopicTitle(withoutInlineSourceLocators(topic.title))}
                    >
                      {displayTopicTitle(withoutInlineSourceLocators(topic.title))}
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

type DraftNavTopic = { id: string; title: string; specialty?: string; versionId: string; version: string };

/** Draft topics grouped by speciality; each topic is a bulleted line showing only its name. */
export function DraftTopicNavigator() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const activeVersionId = pathname.startsWith("/dashboard/diseases/drafts/")
    ? pathname.split("/").at(-1)
    : null;
  const [state, setState] = useState<{ status: "loading" } | { status: "ready"; topics: DraftNavTopic[] } | { status: "error" }>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [speciality, setSpeciality] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/topics?view=drafts", { credentials: "same-origin" })
      .then((response) => response.ok ? response.json() as Promise<{ topics: DraftNavTopic[] }> : Promise.reject(new Error("Draft topics unavailable")))
      .then(({ topics }) => { if (active) setState({ status: "ready", topics }); }, () => { if (active) setState({ status: "error" }); });
    return () => { active = false; };
  }, []);

  const topics = useMemo(() => (state.status === "ready" ? state.topics : []), [state]);
  const needle = query.trim().toLocaleLowerCase();
  const specialityOf = (topic: DraftNavTopic) => canonicalSpeciality(topic.specialty);
  const specialityOptions = useMemo(() => specialityCounts(topics, specialityOf), [topics]);
  const groups = useMemo(() => {
    const searched = needle ? topics.filter((topic) => `${topic.title} ${topic.specialty ?? ""}`.toLocaleLowerCase().includes(needle)) : topics;
    const filtered = speciality ? searched.filter((topic) => specialityOf(topic) === speciality) : searched;
    return groupBySpeciality(filtered, specialityOf)
      .map(({ speciality: name, items }) => ({ speciality: name, list: [...items].sort((a, b) => a.title.localeCompare(b.title)) }));
  }, [needle, speciality, topics]);
  const filtering = Boolean(needle || speciality);

  return (
    <section className="topic-nav" aria-label="Draft clinical topics">
      <div className="nav-label topic-nav-label"><span>Draft topics</span>{state.status === "ready" && <span className="topic-nav-count">{topics.length}</span>}</div>
      <label className="topic-nav-search"><Search size={14} aria-hidden="true" /><span className="sr-only">Filter draft topics</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter drafts…" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear draft filter"><X size={13} /></button>}</label>
      {state.status === "ready" && (
        <div className="topic-nav-controls">
          <label className="topic-nav-select">
            <span className="sr-only">Filter drafts by speciality</span>
            <select value={speciality} onChange={(event) => setSpeciality(event.target.value)}>
              <option value="">All specialities</option>
              {specialityOptions.map((option) => <option key={option.value} value={option.value}>{option.value} ({option.count})</option>)}
            </select>
          </label>
        </div>
      )}
      {state.status === "loading" && <div className="topic-nav-skeleton" aria-label="Loading draft topics" role="status">{Array.from({ length: 7 }, (_, index) => <span key={index} />)}</div>}
      {state.status === "error" && <p className="topic-nav-empty">Draft topics could not be loaded.</p>}
      {state.status === "ready" && groups.length === 0 && <p className="topic-nav-empty">{filtering ? "No drafts match this filter." : "No draft topics."}</p>}
      {groups.map(({ speciality: name, list }) => (
        <details key={`${name}-${filtering ? "filtered" : "all"}`} className="topic-nav-group" data-spec style={specialityStyle(name)} open={filtering || topics.length <= 40 || list.some((topic) => topic.versionId === activeVersionId)}>
          <summary><span>{name}</span><span className="topic-nav-count">{list.length}</span></summary>
          <ul>
            {list.map((topic) => {
              const href = `/dashboard/admin/guidelines/${encodeURIComponent(topic.id)}?version=${encodeURIComponent(topic.versionId)}`;
              return (
                <li key={topic.versionId}>
                  <Link href={href} prefetch={false} onMouseEnter={() => router.prefetch(href)} onFocus={() => router.prefetch(href)} aria-current={topic.versionId === activeVersionId ? "page" : undefined} title={displayTopicTitle(withoutInlineSourceLocators(topic.title))}>
                    {displayTopicTitle(withoutInlineSourceLocators(topic.title))}
                  </Link>
                </li>
              );
            })}
          </ul>
        </details>
      ))}
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
          {visibleNavigation.map(({ href, label, icon: Icon }) => (
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
