import { Clock3, type LucideIcon } from "@/components/icons-3d";

type ModulePlaceholderProps = {
  title: string;
  purpose: string;
  plannedWork: string;
  icon: LucideIcon;
};

/** Neutral empty state for workspace modules that have not been enabled for the organisation yet. */
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
          <span className="module-placeholder-label"><Clock3 size={14} /> Not yet enabled</span>
          <h2 id="module-placeholder-heading">Nothing here yet</h2>
          <p>{plannedWork}</p>
          <p className="module-placeholder-note">Content appears here once this module is enabled for your organisation.</p>
        </div>
      </section>
    </main>
  );
}
