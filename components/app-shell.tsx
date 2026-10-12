import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, LogOut, Search, Settings2 } from "lucide-react";
import { getCurrentViewer } from "@/lib/supabase/session";
import { CollapsibleShell } from "@/components/collapsible-shell";
import { MobileNavigation, WorkspaceSidebar } from "@/components/app-navigation";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentViewer();
  if (!user) redirect("/login");
  const temporaryAdminMode = isTemporaryOpenAdminMode();
  return (
    <CollapsibleShell primaryColor={user.primaryColor}>
      <WorkspaceSidebar
        organizationName={user.organizationName}
        organizationNote={temporaryAdminMode ? "Temporary no-login admin mode" : "Isolated demo tenant · Riyadh"}
        temporaryAdminMode={temporaryAdminMode}
      />
      <section className="workspace">
        <header className="topbar">
          <form className="global-search" action="/dashboard/diseases" role="search">
            <Search size={17} aria-hidden="true" />
            <input name="q" type="search" aria-label="Search clinical knowledge" placeholder="Search clinical knowledge…" autoComplete="off" enterKeyHint="search" />
            <button type="submit" className="global-search-submit">Search</button>
          </form>
          <div className="top-actions">
            <Link className="top-action-link" href="/dashboard/notifications" aria-label="Open notifications" title="Notifications"><Bell size={18} strokeWidth={1.7} /></Link>
            {user.isAdmin && !temporaryAdminMode && <Link className="top-action-link" href="/dashboard/admin/settings#profile" aria-label="Edit profile and appearance" title="Profile and appearance settings"><Settings2 size={18} strokeWidth={1.7} /></Link>}
            {user.isAdmin && !temporaryAdminMode ? (
              <Link className="user-chip" href="/dashboard/admin/settings#profile" aria-label={`Edit profile for ${user.name}`} title="Edit profile">
                <div className="avatar">{user.initials}</div><div><strong>{user.name}</strong><span>{user.designation} · {user.role}</span></div>
              </Link>
            ) : (
              <div className="user-chip"><div className="avatar">{user.initials}</div><div><strong>{user.name}</strong><span>{user.designation}</span></div></div>
            )}
            {!temporaryAdminMode && <form action="/api/logout" method="post"><button type="submit" className="button-secondary" aria-label="Sign out" title="Sign out"><LogOut size={15} /></button></form>}
          </div>
        </header>
        {children}
      </section>
      <MobileNavigation />
    </CollapsibleShell>
  );
}
