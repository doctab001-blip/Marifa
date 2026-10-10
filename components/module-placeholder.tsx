import { Clock3, type LucideIcon } from "lucide-react";

type ModulePlaceholderProps = {
  title: string;
  purpose: string;
  plannedWork: string;
  icon: LucideIcon;
};

export function ModulePlaceholder({ title, purpose, plannedWork, icon: Icon }: ModulePlaceholderProps) {
  return (
    <main className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Marifa workspace</div>
          <h1 className="page-title module-title">{title}</h1>
          <p className="page-copy">{purpose}</p>
        </div>
      </header>

      <section className="card module-placeholder-card" aria-labelledby="module-placeholder-heading">
        <div className="module-placeholder-icon" aria-hidden="true">
          <Icon size={24} strokeWidth={1.8} />
        </div>
        <div>
          <span className="module-placeholder-label"><Clock3 size={14} /> Development placeholder</span>
          <h2 id="module-placeholder-heading">Coming soon</h2>
          <p>{plannedWork}</p>
          <p className="module-placeholder-note">
            This page is a structural preview. It contains no live clinical guidance or administrative workflow.
          </p>
        </div>
      </section>
    </main>
  );
}
