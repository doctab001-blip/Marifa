import { ClipboardList, Settings2, ShieldCheck, UsersRound } from "lucide-react";
import { AdminSubNavigation } from "@/components/admin/admin-sub-navigation";
import { requireOrganizationAdmin } from "@/lib/admin/data";

const links = [
  { href: "/dashboard/admin", label: "Overview", icon: ClipboardList },
  { href: "/dashboard/admin/staff", label: "Staff Directory", icon: UsersRound },
  { href: "/dashboard/admin/governance", label: "Governance Queue", icon: ShieldCheck },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings2 },
];

export default async function AdministrationLayout({ children }: { children: React.ReactNode }) {
  const { organizationName } = await requireOrganizationAdmin();

  return (
    <main className="page admin-page">
      <header className="admin-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="page-title">Administration &amp; Settings</h1>
          <p className="page-copy">Manage access, clinical governance and workspace settings for {organizationName}.</p>
        </div>
        <span className="admin-scope"><ShieldCheck size={15} strokeWidth={1.5} aria-hidden="true" /> Organization-scoped</span>
      </header>
      <AdminSubNavigation links={links} />
      {children}
    </main>
  );
}
