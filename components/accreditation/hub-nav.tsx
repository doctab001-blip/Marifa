"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE = "/dashboard/accreditation-and-audits";
const ITEMS = [
  { href: BASE, label: "Readiness", exact: true },
  { href: `${BASE}/standards`, label: "Standards & evidence" },
  { href: `${BASE}/policies`, label: "Policies & read-and-sign" },
  { href: `${BASE}/incidents`, label: "Incidents & CAPA" },
  { href: `${BASE}/audits`, label: "Audits & improvement" },
  { href: `${BASE}/report`, label: "Survey report" },
  { href: `${BASE}/settings`, label: "Settings" },
];

export function HubNav() {
  const pathname = usePathname();
  return (
    <nav className="gh-nav gh-noprint" aria-label="Accreditation hub sections">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>{item.label}</Link>;
      })}
    </nav>
  );
}
