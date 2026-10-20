import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, LogOut, Search, Settings2 } from "@/components/icons-3d";
import { getCurrentViewer } from "@/lib/supabase/session";
import { CollapsibleShell } from "@/components/collapsible-shell";
import { MobileNavigation } from "@/components/app-navigation";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeaderContext } from "@/components/header-context";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";
import { getDiseaseDraftTopicCount } from "@/lib/data/disease-drafts";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentViewer();
  if (!user) redirect("/login");
  const temporaryAdminMode = isTemporaryOpenAdminMode();
  const draftTopicCount = await getDiseaseDraftTopicCount();
  return (
    <CollapsibleShell primaryColor={user.primaryColor}>
      <Sidebar
        organizationName={user.organizationName}
        organizationNote={"Riyadh, Saudi Arabia"}
        temporaryAdminMode={temporaryAdminMode}
        draftTopicCount={draftTopicCount}
      />
      <section className="workspace">
        {/* Floating glass header, three zones: where you are · search · your actions */}
        <header className="topbar">
          <HeaderContext organizationName={user.organizationName} />
          <form className="global-search" action="/dashboard/diseases" role="search">
            <Search size={17} aria-hidden="true" />
            <input name="q" type="search" aria-label="Search clinical knowledge" placeholder="Search clinical knowledge…" autoComplete="off" enterKeyHint="search" />
            <button type="submit" className="global-search-submit">Search</button>
          </form>
          <div className="top-actions">
            <div className="top-actions-group">
              <ThemeToggle />
              <Link className="top-action-link" href="/dashboard/notifications" aria-label="Open notifications" title="Notifications"><Bell size={18} /></Link>
              {user.isAdmin && !temporaryAdminMode && <Link className="top-action-link" href="/dashboard/admin/settings#profile" aria-label="Edit profile and appearance" title="Profile and appearance settings"><Settings2 size={18} /></Link>}
            </div>
            {user.isAdmin && !temporaryAdminMode ? (
              <Link className="user-chip" href="/dashboard/admin/settings#profile" aria-label={`Edit profile for ${user.name}`} title="Edit profile">
                <div className="avatar">{user.initials}</div><div><strong>{user.name}</strong><span>{user.designation} · {user.role}</span></div>
              </Link>
            ) : (
              <div className="user-chip"><div className="avatar">{user.initials}</div><div><strong>{user.name}</strong><span>{user.designation}</span></div></div>
            )}
            {!temporaryAdminMode && <form action="/api/logout" method="post"><button type="submit" className="button-secondary top-signout" aria-label="Sign out" title="Sign out"><LogOut size={16} /></button></form>}
          </div>
        </header>
        {children}
      </section>
      <MobileNavigation />
    </CollapsibleShell>
  );
}
