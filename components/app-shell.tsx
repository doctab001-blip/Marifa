import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, Bell, BookOpenCheck, ClipboardCheck, FileCheck2, GraduationCap, LayoutDashboard, Library, LogOut, Pill, Search, Settings, ShieldCheck, Stethoscope, UsersRound } from "lucide-react";
import { getCurrentViewer } from "@/lib/supabase/session";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/diseases", label: "Disease Management", icon: Stethoscope, primary: true },
  { href: "/clinical-library", label: "Clinical Guidelines", icon: Library },
  { href: "/modules", label: "Hospital Protocols", icon: FileCheck2 },
  { href: "/modules", label: "Medicines & Formulary", icon: Pill },
  { href: "/competencies", label: "Competencies", icon: ClipboardCheck },
  { href: "/modules", label: "Learning Centre", icon: GraduationCap },
  { href: "/modules", label: "Policies & SOPs", icon: BookOpenCheck },
  { href: "/modules", label: "Clinical Governance", icon: ShieldCheck },
  { href: "/modules", label: "Accreditation & Audits", icon: Activity },
  { href: "/modules", label: "Staff Directory", icon: UsersRound }
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentViewer();
  if (!user) redirect("/login");
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <Link href="/dashboard" className="brand">
          <div className="brand-mark">M</div>
          <div className="brand-copy"><div className="brand-name">Marifa</div><div className="brand-sub">Clinical knowledge & governance</div></div>
        </Link>
        <div className="nav-label">Workspace</div>
        {nav.slice(0, 7).map(({ href, label, icon: Icon, primary }) => <Link key={label} href={href} className={`nav-link ${primary ? "primary" : ""}`} title={label} aria-label={label}><Icon size={17} /><span>{label}</span></Link>)}
        <div className="nav-label">Hospital</div>
        {nav.slice(7).map(({ href, label, icon: Icon }) => <Link key={label} href={href} className="nav-link" title={label} aria-label={label}><Icon size={17} /><span>{label}</span></Link>)}
        <div className="nav-spacer" />
        <Link href="/modules" className="nav-link" title="Administration & Settings"><Settings size={17} /><span>Administration</span></Link>
        <div className="org-card"><strong>{user.organizationName}</strong><span>Isolated demo tenant · Riyadh</span></div>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <form className="global-search" action="/diseases">
            <Search size={17} aria-hidden="true" />
            <input name="q" aria-label="Search clinical knowledge" placeholder="Search clinical knowledge…" />
          </form>
          <div className="top-actions">
            <Bell size={18} color="#667085" aria-label="Notifications" />
            <div className="user-chip"><div className="avatar">{user.initials}</div><div><strong>{user.name}</strong><span>{user.role}</span></div></div>
            <form action="/api/logout" method="post"><button type="submit" className="button-secondary" aria-label="Sign out" title="Sign out"><LogOut size={15} /></button></form>
          </div>
        </header>
        {children}
      </section>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/dashboard" aria-label="Dashboard"><LayoutDashboard size={19} /></Link>
        <Link href="/diseases" aria-label="Disease Management"><Stethoscope size={19} /></Link>
        <Link href="/clinical-library" aria-label="Clinical Guidelines"><Library size={19} /></Link>
        <Link href="/competencies" aria-label="Competencies"><ClipboardCheck size={19} /></Link>
      </nav>
    </div>
  );
}
