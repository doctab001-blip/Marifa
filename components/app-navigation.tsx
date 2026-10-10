"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpenCheck,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  Library,
  Pill,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/diseases", label: "Disease Management", icon: Stethoscope },
  { href: "/clinical-library", label: "Clinical Guidelines", icon: Library },
  { href: "/modules", label: "Hospital Protocols", icon: FileCheck2 },
  { href: "/modules", label: "Medicines & Formulary", icon: Pill },
  { href: "/competencies", label: "Competencies", icon: ClipboardCheck },
  { href: "/modules", label: "Learning Centre", icon: GraduationCap },
  { href: "/modules", label: "Policies & SOPs", icon: BookOpenCheck },
  { href: "/modules", label: "Clinical Governance", icon: ShieldCheck },
  { href: "/modules", label: "Accreditation & Audits", icon: Activity },
  { href: "/modules", label: "Staff Directory", icon: UsersRound },
];

function getActiveItem(pathname: string) {
  return navigation
    .filter(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

export function SidebarNavigation() {
  const pathname = usePathname() ?? "";
  const activeItem = getActiveItem(pathname);

  return (
    <>
      <div className="nav-label">Workspace</div>
      {navigation.slice(0, 7).map(({ href, label, icon: Icon }) => {
        const active = label === activeItem?.label;
        return (
          <Link
            key={label}
            href={href}
            className="nav-link"
            title={label}
            aria-label={label}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={17} />
            <span>{label}</span>
          </Link>
        );
      })}
      <div className="nav-label">Hospital</div>
      {navigation.slice(7).map(({ href, label, icon: Icon }) => {
        const active = label === activeItem?.label;
        return (
          <Link
            key={label}
            href={href}
            className="nav-link"
            title={label}
            aria-label={label}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={17} />
            <span>{label}</span>
          </Link>
        );
      })}
    </>
  );
}

export function MobileNavigation() {
  const pathname = usePathname() ?? "";
  const activeItem = getActiveItem(pathname);

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {navigation.slice(0, 3).concat(navigation[5]).map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          aria-label={label}
          aria-current={label === activeItem?.label ? "page" : undefined}
        >
          <Icon size={19} />
        </Link>
      ))}
    </nav>
  );
}
