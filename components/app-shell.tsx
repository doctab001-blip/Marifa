import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import { getCurrentViewer } from "@/lib/supabase/session";
import { MobileNavigation, SidebarNavigation } from "@/components/app-navigation";

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
        <SidebarNavigation />
        <div className="nav-spacer" />
        <div className="org-card"><strong>{user.organizationName}</strong><span>Isolated demo tenant · Riyadh</span></div>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <form className="global-search" action="/dashboard/diseases">
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
      <MobileNavigation />
    </div>
  );
}
