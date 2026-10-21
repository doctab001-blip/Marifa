"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Activity, AlertTriangle, ArrowLeft, ClipboardCheck, FileCheck2, FileText, Gauge, Settings, ShieldCheck, Users,
} from "lucide-react";

const BASE = "/dashboard/accreditation-and-audits";

type Section = "readiness" | "standards" | "policies" | "incidents" | "audits" | "indicators" | "committees" | "report" | "settings";

/** The nine sections of the detailed workspace. URLs are unchanged from the original hub; two are new. */
const ITEMS: { href: string; label: string; short: string; section: Section; icon: ReactNode; exact?: boolean }[] = [
  { href: BASE, label: "Overview & readiness", short: "Overview", section: "readiness", icon: <Gauge size={16} />, exact: true },
  { href: `${BASE}/standards`, label: "Standards & evidence", short: "Standards", section: "standards", icon: <ShieldCheck size={16} /> },
  { href: `${BASE}/policies`, label: "Policies & documents", short: "Policies", section: "policies", icon: <FileText size={16} /> },
  { href: `${BASE}/incidents`, label: "Incidents & CAPA", short: "Incidents", section: "incidents", icon: <AlertTriangle size={16} /> },
  { href: `${BASE}/audits`, label: "Audits & QIP", short: "Audits", section: "audits", icon: <ClipboardCheck size={16} /> },
  { href: `${BASE}/indicators`, label: "Clinical indicators", short: "Indicators", section: "indicators", icon: <Activity size={16} /> },
  { href: `${BASE}/committees`, label: "Committees", short: "Committees", section: "committees", icon: <Users size={16} /> },
  { href: `${BASE}/report`, label: "Survey reports", short: "Reports", section: "report", icon: <FileCheck2 size={16} /> },
  { href: `${BASE}/settings`, label: "Settings", short: "Settings", section: "settings", icon: <Settings size={16} /> },
];

function sectionOf(pathname: string): Section {
  const match = ITEMS.filter((item) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.section ?? "readiness";
}

/** The page frame carries the section, so each section shows its own restrained accent colour. */
export function HubFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? BASE;
  return <main className="page gh-page" data-section={sectionOf(pathname)}>{children}</main>;
}

export function HubNav() {
  const pathname = usePathname() ?? BASE;
  const current = sectionOf(pathname);
  return (
    <nav className="gh-nav gh-noprint" aria-label="Governance hub sections">
      <Link href="/dashboard/governance" className="gh-nav-back"><ArrowLeft size={15} aria-hidden="true" /><span>Clinical Governance</span></Link>
      <div className="gh-nav-items">
        {ITEMS.map((item) => {
          const active = item.section === current;
          return (
            <Link key={item.href} href={item.href} data-section={item.section} aria-current={active ? "page" : undefined} title={item.label}>
              <span className="gh-nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="gh-nav-label">{item.label}</span>
              <span className="gh-nav-short" aria-hidden="true">{item.short}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
