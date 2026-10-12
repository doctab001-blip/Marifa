"use client";

import { useEffect, useState } from "react";

export type NavSection = { readonly id: string; readonly label: string };

/** Sticky glass pill bar that jumps between page sections and highlights the one being read. */
export function SectionNav({ sections }: { sections: readonly NavSection[] }) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const targets = sections.map((section) => document.getElementById(section.id)).filter((element): element is HTMLElement => element !== null);
    if (!targets.length || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const current = targets.find((element) => visible.has(element.id));
        if (current) setActive(current.id);
      },
      { rootMargin: "-170px 0px -55% 0px", threshold: [0, 0.1] },
    );
    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="em-nav" aria-label="Jump to section">
      {sections.map((section, index) => (
        <a key={section.id} href={`#${section.id}`} aria-current={active === section.id ? "true" : undefined} onClick={() => setActive(section.id)}>
          <span>{index + 1}</span>{section.label}
        </a>
      ))}
    </nav>
  );
}
