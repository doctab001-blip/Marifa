"use client";

import { usePathname } from "next/navigation";
import { getActiveItem, navigation } from "@/components/app-navigation";

/** Left zone of the header: which module the reader is in, and whose workspace it is. */
export function HeaderContext({ organizationName }: { organizationName: string }) {
  const pathname = usePathname() ?? "";
  const item = getActiveItem(pathname) ?? navigation[0];
  const Icon = item.icon;
  return (
    <div className="topbar-context">
      <span className="pill pill-aqua" title={item.label}><Icon size={16} aria-hidden="true" /><span>{item.label}</span></span>
      <span className="topbar-crumb" title={organizationName}>{organizationName}</span>
    </div>
  );
}
