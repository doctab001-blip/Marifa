"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Settings2, ShieldCheck, UsersRound } from "lucide-react";

type AdminLink = { href: string; label: string; icon: "overview" | "staff" | "governance" | "settings" };

const icons = {
  overview: ClipboardList,
  staff: UsersRound,
  governance: ShieldCheck,
  settings: Settings2,
} as const;

export function AdminSubNavigation({ links }: { links: readonly AdminLink[] }) {
  const pathname = usePathname() ?? "";
  return (
    <nav className="admin-tabs" aria-label="Administration sections">
      {links.map(({ href, label, icon }) => {
        const Icon = icons[icon];
        const active = pathname === href || (href !== "/dashboard/admin" && pathname.startsWith(`${href}/`));
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`admin-tab${active ? " is-active" : ""}`}>
            <Icon size={16} strokeWidth={1.5} aria-hidden="true" /><span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
