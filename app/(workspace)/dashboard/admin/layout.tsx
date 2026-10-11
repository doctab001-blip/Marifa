import { ShieldCheck } from "lucide-react";
import { AdminSubNavigation } from "@/components/admin/admin-sub-navigation";
import { requireOrganizationAdmin } from "@/lib/admin/data";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";

const links = [
  { href: "/dashboard/admin", label: "Overview", icon: "overview" },
  { href: "/dashboard/admin/staff", label: "Staff Directory", icon: "staff" },
  { href: "/dashboard/admin/governance", label: "Governance Queue", icon: "governance" },
  { href: "/dashboard/admin/settings", label: "Settings", icon: "settings" },
] as const;

export default async function AdministrationLayout({ children }: { children: React.ReactNode }) {
  const { organizationName } = await requireOrganizationAdmin();
  const temporaryAdminMode = isTemporaryOpenAdminMode();
  const visibleLinks = temporaryAdminMode ? links.filter((link) => link.href === "/dashboard/admin" || link.href === "/dashboard/admin/governance") : links;

  return (
    <main className="page admin-page">
      <header className="admin-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="page-title">Administration &amp; Settings</h1>
          <p className="page-copy">{temporaryAdminMode ? "Review, edit and approve clinical drafts without signing in during this development phase." : `Manage access, clinical governance and workspace settings for ${organizationName}.`}</p>
        </div>
        <span className="admin-scope"><ShieldCheck size={15} strokeWidth={1.5} aria-hidden="true" /> {temporaryAdminMode ? "Temporary open admin" : "Organization-scoped"}</span>
      </header>
      <AdminSubNavigation links={visibleLinks} />
      {children}
    </main>
  );
}
