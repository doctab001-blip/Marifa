"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

type AdminLink = { href: string; label: string; icon: LucideIcon };

export function AdminSubNavigation({ links }: { links: AdminLink[] }) {
  const pathname = usePathname() ?? "";
  return (
    <nav className="admin-tabs" aria-label="Administration sections">
      {links.map(({ href, label, icon: Icon }) => {
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
