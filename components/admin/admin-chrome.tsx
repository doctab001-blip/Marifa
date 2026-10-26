"use client";

import { usePathname } from "next/navigation";

/**
 * The "Administration & Settings" heading and its tabs belong to the admin pages. A topic opened in the
 * editor is a topic page: it shows the topic's own name instead, so the admin chrome steps aside.
 */
export function AdminChrome({ heading, tabs }: { heading: React.ReactNode; tabs: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/dashboard/admin/guidelines/")) return null;
  return <>{heading}{tabs}</>;
}
