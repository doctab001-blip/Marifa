"use client";

import { usePathname } from "next/navigation";
import { getActiveItem, navigation } from "@/components/app-navigation";
import { useActiveTopic } from "@/components/topic-context";

/** Left zone of the header: which module the reader is in, and the open topic's name (or whose workspace it is). */
export function HeaderContext({ organizationName }: { organizationName: string }) {
  const pathname = usePathname() ?? "";
  const topic = useActiveTopic();
  const item = (topic?.scope === "protocol" ? navigation.find(({ href }) => href === "/dashboard/protocols") : undefined) ?? getActiveItem(pathname) ?? navigation[0];
  const Icon = item.icon;
  return (
    <div className="topbar-context">
      <span className="pill pill-aqua" title={item.label}><Icon size={16} aria-hidden="true" /><span>{item.label}</span></span>
      {topic
        ? <span className="topbar-crumb is-topic" title={topic.title}>{topic.title}</span>
        : <span className="topbar-crumb" title={organizationName}>{organizationName}</span>}
    </div>
  );
}
