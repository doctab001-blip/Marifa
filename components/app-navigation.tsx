"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Award,
  Bell,
  BookOpenCheck,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  Library,
  Megaphone,
  Menu,
  Pill,
  Settings,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
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
  { href: "/dashboard/administration-and-settings", label: "Administration and Settings", icon: Settings },
];

const sections = [
  { label: "Workspace", items: navigation.slice(0, 7) },
  { label: "Hospital", items: navigation.slice(7, 14) },
  { label: "Administration", items: navigation.slice(14) },
];

const mobileItems = [navigation[0], navigation[1], navigation[2], navigation[5]];

function getActiveItem(pathname: string) {
  const canonicalPathname = {
    "/clinical-library": "/dashboard/clinical-guidelines",
    "/competencies": "/dashboard/competencies",
    "/modules": "/dashboard/hospital-protocols",
  }[pathname] ?? pathname;

  return navigation
    .filter(({ href }) => canonicalPathname === href || canonicalPathname.startsWith(`${href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

export function SidebarNavigation() {
  const pathname = usePathname() ?? "";
  const activeItem = getActiveItem(pathname);

  return (
    <>
      {sections.map(({ label, items }) => (
        <section className="sidebar-nav-section" key={label} aria-label={label}>
          <div className="nav-label">{label}</div>
          {items.map(({ href, label: itemLabel, icon: Icon }) => {
            const active = itemLabel === activeItem?.label;
            return (
              <Link
                key={itemLabel}
                href={href}
                className="nav-link"
                title={itemLabel}
                aria-label={itemLabel}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={17} />
                <span>{itemLabel}</span>
              </Link>
            );
          })}
        </section>
      ))}
    </>
  );
}

export function MobileNavigation() {
  const pathname = usePathname() ?? "";
  const activeItem = getActiveItem(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {mobileItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          aria-label={label}
          aria-current={label === activeItem?.label ? "page" : undefined}
        >
          <Icon size={19} />
        </Link>
      ))}
      <button
        type="button"
        className="mobile-nav-more"
        aria-label={menuOpen ? "Close modules" : "Browse all modules"}
        aria-expanded={menuOpen}
        aria-controls="mobile-module-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={19} /> : <Menu size={19} />}
      </button>
      {menuOpen && (
        <section className="mobile-module-menu" id="mobile-module-menu" aria-label="All dashboard modules">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              aria-current={label === activeItem?.label ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </section>
      )}
    </nav>
  );
}
